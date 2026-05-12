import { supabase } from "./supabase";

export async function generateWordSearchWords({ tier, puzzleSize, topic }) {
  const { data, error } = await supabase.functions.invoke(
    "generate-word-search",
    {
      body: {
        tier,
        puzzleSize,
        topic
      }
    }
  );

  if (error) {
    console.error("AI word search generation failed:", error);
    throw error;
  }

  return data.words;
}