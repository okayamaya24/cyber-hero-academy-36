import { supabase } from "./supabase";

export async function saveWordSearchResult({
  tier,
  xpEarned,
  stars,
  completionTime,
  bestStreak
}) {
  const { data, error } = await supabase
    .from("word_search_results")
    .insert([
      {
        tier,
        xp_earned: xpEarned,
        stars,
        completion_time: completionTime,
        best_streak: bestStreak
      }
    ]);

  if (error) {
    console.error("Supabase save failed:", error);
    throw error;
  }

  return data;
}