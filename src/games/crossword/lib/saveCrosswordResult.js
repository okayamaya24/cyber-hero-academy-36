import { supabase } from "../supabaseClient";

export async function saveCrosswordResult(input) {
  const { data, error } = await supabase
    .from("crossword_results")
    .insert({
      tier: input.tier,
      topic: input.topic,
      puzzle_title: input.puzzleTitle,
      xp_earned: input.xpEarned,
      stars: input.stars,
      hints_used: input.hintsUsed,
      completion_time: input.completionTime,
      words_placed: input.wordsPlaced
    })
    .select()
    .single();

  if (error) {
    console.error("[saveCrosswordResult] Insert failed:", error);
    throw new Error(error.message || "Failed to save crossword result");
  }

  return data;
}