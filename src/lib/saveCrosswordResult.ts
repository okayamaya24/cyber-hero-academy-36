import { supabase } from "@/integrations/supabase/client";

export interface CrosswordResultInput {
  tier: "junior" | "hero" | "elite" | string;
  topic: string;
  puzzleTitle: string;
  xpEarned: number;
  stars: string;
  hintsUsed: number;
  completionTime: number; // seconds
  wordsPlaced: number;
}

export interface CrosswordResultRow {
  id: string;
  tier: string;
  topic: string;
  puzzle_title: string;
  xp_earned: number;
  stars: string | null;
  hints_used: number;
  completion_time: number;
  words_placed: number;
  created_at: string;
}

/**
 * Save a completed crossword puzzle result to the database.
 * Returns the inserted row, or throws an Error on failure.
 */
export async function saveCrosswordResult(
  input: CrosswordResultInput
): Promise<CrosswordResultRow> {
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
      words_placed: input.wordsPlaced,
    })
    .select()
    .single();

  if (error) {
    console.error("[saveCrosswordResult] Insert failed:", error);
    throw new Error(error.message || "Failed to save crossword result");
  }

  return data as CrosswordResultRow;
}
