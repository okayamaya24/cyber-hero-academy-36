import axios from "axios";

export async function generatePuzzle(topic, tier) {
  const prompt = `
Generate a cybersecurity crossword puzzle for kids.

Topic: ${topic}
Difficulty Tier: ${tier}

Return:
- word
- clue

Use JSON format.
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },

      {
        headers: {
          Authorization: `Bearer YOUR_API_KEY`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
}