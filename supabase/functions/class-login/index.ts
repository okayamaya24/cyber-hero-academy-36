import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Class code + picture password login for students (no typing passwords).
 *
 * POST { action: "roster", code }
 *   → { className, students: [{ id, name, avatar, avatarConfig }] }
 * POST { action: "login", code, studentId, pictures: ["dog", "pizza"] }
 *   → { token_hash }  (client finishes with supabase.auth.verifyOtp)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keep in sync with src/lib/picturePassword.ts
const PICTURE_IDS = new Set(["dog", "cat", "frog", "pizza", "icecream", "ball", "rocket", "rainbow", "star"]);
const PICTURE_PASSWORD_LENGTH = 2;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 10;

// Logs the real reason server-side (Supabase → Edge Functions → class-login → Logs)
// while kids only see a friendly message.
function fail(reason: string, message: string, status: number, detail?: unknown) {
  console.error(`class-login failed: ${reason}`, detail ?? "");
  return json({ error: message, reason }, status);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// "Maya Johnson" → "Maya J." so the class list doesn't show full names
function displayName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const code = typeof body.code === "string" ? body.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
  if (code.length !== 6) return json({ error: "That class code doesn't look right. It has 6 letters and numbers." }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: cls } = await admin.from("classes").select("id, name").eq("login_code", code).maybeSingle();
  if (!cls) return json({ error: "We couldn't find that class. Check the code with your teacher!" }, 404);

  // ── Roster: who's in this class? ──
  if (body.action === "roster") {
    const { data: kids, error } = await admin
      .from("child_profiles")
      .select("id, name, avatar, avatar_config")
      .eq("class_id", cls.id)
      .order("name");
    if (error) return fail("roster_query", "Something went wrong. Try again!", 500, error);

    return json({
      className: cls.name,
      students: (kids ?? []).map((k) => {
        const cfg = (k.avatar_config ?? {}) as Record<string, unknown>;
        const heroSrc = typeof cfg.heroSrc === "string" ? cfg.heroSrc : null;
        return {
          id: k.id,
          name: displayName(k.name),
          avatar: k.avatar,
          // Just the choices; the page turns them into a hero image URL. Older
          // profiles stored the whole picture as base64 text, so never send that.
          avatarConfig: {
            gender: cfg.gender ?? null,
            skin: cfg.skin ?? null,
            suitKey: cfg.suitKey ?? null,
            accessory: cfg.accessory ?? null,
            heroSrc: heroSrc && !heroSrc.startsWith("data:") ? heroSrc : null,
          },
        };
      }),
    });
  }

  // ── Login: check the secret pictures ──
  if (body.action === "login") {
    const studentId = typeof body.studentId === "string" ? body.studentId : "";
    const pictures = Array.isArray(body.pictures) ? body.pictures : [];
    if (
      !studentId ||
      pictures.length !== PICTURE_PASSWORD_LENGTH ||
      !pictures.every((p) => typeof p === "string" && PICTURE_IDS.has(p))
    ) {
      return json({ error: "Invalid request" }, 400);
    }

    const { data: kid } = await admin
      .from("child_profiles")
      .select("id")
      .eq("id", studentId)
      .eq("class_id", cls.id)
      .maybeSingle();
    if (!kid) return fail("student_not_in_class", "Something went wrong. Try again!", 404, { studentId });

    const { data: profile } = await admin.from("profiles").select("role").eq("user_id", studentId).maybeSingle();
    if (profile?.role !== "kid") {
      return fail("not_a_kid_profile", "Something went wrong. Try again!", 403, { studentId, role: profile?.role ?? null });
    }

    const { data: secret } = await admin
      .from("student_picture_passwords")
      .select("pictures, failed_attempts, locked_until")
      .eq("child_id", studentId)
      .maybeSingle();
    if (!secret) return json({ error: "You don't have secret pictures yet. Ask your teacher for your login card!" }, 409);

    if (secret.locked_until && new Date(secret.locked_until) > new Date()) {
      const minutes = Math.max(1, Math.ceil((new Date(secret.locked_until).getTime() - Date.now()) / 60000));
      return json({ error: `Too many tries! Wait ${minutes} minute${minutes === 1 ? "" : "s"} or ask your teacher.`, locked: true }, 423);
    }

    if (pictures.join(",") !== secret.pictures) {
      const failed = secret.failed_attempts + 1;
      const lock = failed >= MAX_FAILED_ATTEMPTS;
      await admin
        .from("student_picture_passwords")
        .update({
          failed_attempts: lock ? 0 : failed,
          locked_until: lock ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
        })
        .eq("child_id", studentId);
      return json(
        lock
          ? { error: `Too many tries! Wait ${LOCK_MINUTES} minutes or ask your teacher.`, locked: true }
          : { error: "Those aren't your secret pictures. Try again!", triesLeft: MAX_FAILED_ATTEMPTS - failed },
        lock ? 423 : 401,
      );
    }

    await admin
      .from("student_picture_passwords")
      .update({ failed_attempts: 0, locked_until: null })
      .eq("child_id", studentId);

    // Create a one-time sign-in token for this student (no email is sent)
    const { data: target, error: targetError } = await admin.auth.admin.getUserById(studentId);
    const email = target?.user?.email;
    if (!email) return fail("no_auth_account", "Something went wrong. Try again!", 500, { studentId, targetError });

    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
    if (linkError || !link?.properties?.hashed_token) {
      return fail("magic_link_failed", "Something went wrong. Try again!", 500, linkError);
    }

    return json({ token_hash: link.properties.hashed_token });
  }

  return json({ error: "Invalid request" }, 400);
});
