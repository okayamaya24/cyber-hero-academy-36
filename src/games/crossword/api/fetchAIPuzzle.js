import { supabase } from "../supabaseClient";

export async function fetchAIPuzzle(
  topic,
  tier
) {
  const { data, error } =
    await supabase.functions.invoke(
      "generate-crossword",
      {
        body: {
          topic,
          tier
        }
      }
    );

  if (error) {
    console.error(error);

    throw error;
  }

  return data;
}