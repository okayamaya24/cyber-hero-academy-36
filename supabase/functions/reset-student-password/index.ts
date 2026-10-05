import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Lets a teacher (or parent) give one of their own students a new random
 * password. Student accounts use placeholder emails, so the normal
 * "forgot password" email can't reach them.
 *
 * POST { studentId: string } → { username, password }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keep in sync with src/lib/kidPassword.ts
const ADJECTIVES = [
  "brave", "bright", "calm", "clever", "cosmic", "cozy", "daring", "eager",
  "fancy", "fast", "fierce", "fluffy", "friendly", "fuzzy", "gentle", "giant",
  "glowing", "golden", "happy", "jolly", "kind", "lucky", "magic", "mighty",
  "neon", "noble", "orange", "polite", "proud", "purple", "quick", "quiet",
  "rapid", "rocket", "royal", "rusty", "shiny", "silly", "silver", "sleepy",
  "smart", "snowy", "speedy", "sunny", "super", "swift", "tiny", "turbo",
];

const ANIMALS = [
  "badger", "bear", "beaver", "bunny", "camel", "cheetah", "dolphin", "dragon",
  "eagle", "falcon", "ferret", "fox", "gecko", "giraffe", "gorilla", "hamster",
  "hawk", "hippo", "iguana", "jaguar", "koala", "lemur", "lion", "llama",
  "lobster", "moose", "narwhal", "octopus", "otter", "owl", "panda", "parrot",
  "penguin", "puffin", "rabbit", "raccoon", "rhino", "robin", "salmon", "seal",
  "shark", "sloth", "tiger", "toucan", "turtle", "walrus", "whale", "zebra",
];

function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function generateKidPassword(): string {
  return `${ADJECTIVES[randomInt(ADJECTIVES.length)]}-${ANIMALS[randomInt(ANIMALS.length)]}-${randomInt(900) + 100}`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 1. Who is asking? Verify the caller's own session.
  const authHeader = req.headers.get("Authorization") ?? "";
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  const caller = callerData?.user;
  if (callerError || !caller) return json({ error: "Please log in again" }, 401);

  let studentId: unknown;
  try {
    ({ studentId } = await req.json());
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  if (typeof studentId !== "string" || !studentId) return json({ error: "Missing student" }, 400);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2. The student must belong to the caller.
  const { data: child, error: childError } = await admin
    .from("child_profiles")
    .select("id")
    .eq("id", studentId)
    .eq("parent_id", caller.id)
    .maybeSingle();
  if (childError) return json({ error: "Something went wrong" }, 500);
  if (!child) return json({ error: "You can only reset passwords for your own students" }, 403);

  // 3. Only kid accounts can be reset this way — never an adult's account.
  const { data: profile } = await admin.from("profiles").select("role").eq("user_id", studentId).maybeSingle();
  if (profile?.role !== "kid") return json({ error: "This account can't be reset here" }, 403);

  const { data: target, error: targetError } = await admin.auth.admin.getUserById(studentId);
  if (targetError || !target?.user) return json({ error: "Student account not found" }, 404);

  // 4. Set a fresh random password.
  const password = generateKidPassword();
  const { error: updateError } = await admin.auth.admin.updateUserById(studentId, { password });
  if (updateError) return json({ error: "Couldn't reset the password" }, 500);

  const username = (target.user.email ?? "").replace(/@cyberhero\.app$/, "");
  return json({ username, password });
});
