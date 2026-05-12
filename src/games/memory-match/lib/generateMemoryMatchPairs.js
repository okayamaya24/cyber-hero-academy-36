import { supabase } from "./supabase";

export async function generateMemoryMatchPairs({ tier, topic }) {
  const { data, error } = await supabase.functions.invoke(
    "generate-memory-match",
    {
      body: {
        tier,
        topic
      }
    }
  );

  if (error) {
    console.error("AI memory match generation failed:", error);
    throw error;
  }

  return data.pairs;
}