import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: string[] = [];

  // Helper: create user if not exists, return user id
  async function ensureUser(
    email: string,
    password: string,
    meta: Record<string, string>
  ): Promise<string | null> {
    // Check if user exists
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((u: any) => u.email === email);
    if (found) {
      results.push(`User ${email} already exists`);
      return found.id;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: meta,
    });
    if (error) {
      results.push(`Error creating ${email}: ${error.message}`);
      return null;
    }
    results.push(`Created user ${email}`);
    return data.user.id;
  }

  // Helper: ensure profile exists
  async function ensureProfile(
    userId: string,
    data: Record<string, any>
  ) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // Update role/account_type in case they differ
      await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", userId);
      results.push(`Updated profile for ${userId}`);
      return existing.id;
    }

    const { data: inserted, error } = await supabase
      .from("profiles")
      .insert({ user_id: userId, ...data })
      .select("id")
      .single();
    if (error) {
      results.push(`Profile error: ${error.message}`);
      return null;
    }
    results.push(`Created profile for ${userId}`);
    return inserted.id;
  }

  // Helper: create kid linked to profile id
  async function ensureKid(
    parentProfileId: string,
    kid: { name: string; age: number; username: string; avatar_color: string }
  ): Promise<string | null> {
    const { data: existing } = await supabase
      .from("kids")
      .select("id")
      .eq("username", kid.username)
      .maybeSingle();

    if (existing) {
      results.push(`Kid ${kid.username} already exists`);
      return existing.id;
    }

    const { data, error } = await supabase
      .from("kids")
      .insert({
        parent_id: parentProfileId,
        name: kid.name,
        age: kid.age,
        username: kid.username,
        avatar_color: kid.avatar_color,
      })
      .select("id")
      .single();

    if (error) {
      results.push(`Kid error (${kid.username}): ${error.message}`);
      return null;
    }
    results.push(`Created kid ${kid.username}`);
    return data.id;
  }

  // Helper: seed game sessions for a kid
  async function seedGameSessions(kidId: string, count: number) {
    // Check if sessions already exist
    const { count: existing } = await supabase
      .from("game_sessions")
      .select("*", { count: "exact", head: true })
      .eq("kid_id", kidId);

    if (existing && existing > 0) {
      results.push(`Sessions already exist for kid ${kidId}`);
      return;
    }

    // Get available games
    const { data: games } = await supabase
      .from("games")
      .select("id")
      .limit(5);

    const sessions = [];
    for (let i = 0; i < count; i++) {
      const daysAgo = i * 2;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      const completed = i < count - 1; // last one is in_progress
      const duration = 120 + Math.floor(Math.random() * 300);

      sessions.push({
        kid_id: kidId,
        game_id: games && games.length > 0 ? games[i % games.length].id : null,
        status: completed ? "completed" : "in_progress",
        score: completed ? 50 + Math.floor(Math.random() * 50) : null,
        started_at: startDate.toISOString(),
        completed_at: completed
          ? new Date(startDate.getTime() + duration * 1000).toISOString()
          : null,
        duration_seconds: completed ? duration : null,
      });
    }

    const { error } = await supabase.from("game_sessions").insert(sessions);
    if (error) {
      results.push(`Sessions error: ${error.message}`);
    } else {
      results.push(`Seeded ${count} sessions for kid ${kidId}`);
    }
  }

  try {
    // 1. Creator Admin
    const creatorUserId = await ensureUser("creator@test.com", "Creator123!", {
      display_name: "Platform Admin",
      role: "creator",
      account_type: "family",
    });
    if (creatorUserId) {
      await ensureProfile(creatorUserId, {
        display_name: "Platform Admin",
        email: "creator@test.com",
        role: "creator",
        account_type: "family",
      });
    }

    // 2. Family Parent
    const parentUserId = await ensureUser("parent@test.com", "Parent123!", {
      display_name: "Sarah Johnson",
      role: "family",
      account_type: "family",
    });
    if (parentUserId) {
      const parentProfileId = await ensureProfile(parentUserId, {
        display_name: "Sarah Johnson",
        email: "parent@test.com",
        role: "family",
        account_type: "family",
      });

      if (parentProfileId) {
        const emmaId = await ensureKid(parentProfileId, {
          name: "Emma",
          age: 9,
          username: "emma_plays",
          avatar_color: "blue",
        });
        const liamId = await ensureKid(parentProfileId, {
          name: "Liam",
          age: 7,
          username: "liam_plays",
          avatar_color: "green",
        });

        if (emmaId) await seedGameSessions(emmaId, 4);
        if (liamId) await seedGameSessions(liamId, 3);
      }
    }

    // 3. School Teacher
    const teacherUserId = await ensureUser("teacher@test.com", "Teacher123!", {
      display_name: "Mr. Davis",
      role: "school",
      account_type: "school",
    });
    if (teacherUserId) {
      const teacherProfileId = await ensureProfile(teacherUserId, {
        display_name: "Mr. Davis",
        email: "teacher@test.com",
        role: "school",
        account_type: "school",
      });

      if (teacherProfileId) {
        const aaliyahId = await ensureKid(teacherProfileId, {
          name: "Aaliyah",
          age: 10,
          username: "aaliyah_plays",
          avatar_color: "amber",
        });
        const marcusId = await ensureKid(teacherProfileId, {
          name: "Marcus",
          age: 11,
          username: "marcus_plays",
          avatar_color: "purple",
        });

        if (aaliyahId) await seedGameSessions(aaliyahId, 5);
        if (marcusId) await seedGameSessions(marcusId, 4);
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err), results }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
