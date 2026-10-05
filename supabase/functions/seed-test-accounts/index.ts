/**
 * Disabled.
 *
 * This function used to create test admin, parent, and teacher accounts with
 * passwords written in this (public) repo, and it didn't check who called it.
 * It now refuses every request. Delete it from the Supabase dashboard
 * (Edge Functions) once this version is deployed.
 *
 * To seed test data, create accounts by hand in the Supabase dashboard with
 * passwords that are never committed to git.
 */

Deno.serve(() =>
  new Response(JSON.stringify({ error: "This function has been disabled." }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  }),
);
