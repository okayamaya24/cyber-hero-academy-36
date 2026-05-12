import { supabase } from "./supabase";

export async function saveMemoryMatchResult({
  tier,
  xpEarned,
  stars,
  completionTime,
  attempts
}) {
  const { data, error } = await supabase
    .from("memory_match_results")
    .insert([
      {
        tier,
        xp_earned: xpEarned,
        stars,
        completion_time: completionTime,
        attempts
      }
    ]);

  if (error) {
    console.error("Supabase save failed:", error);
    throw error;
  }

  return data;
}