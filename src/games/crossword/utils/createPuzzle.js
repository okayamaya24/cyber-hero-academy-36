import { generateLayout } from "./generateLayout";

export function createPuzzle(aiData) {
  const cleanedWords = aiData.words
    .filter(
      (word) =>
        word.answer &&
        word.clue
    )

    .map((word) => ({
      answer: word.answer
        .toUpperCase()
        .replace(/[^A-Z]/g, ""),

      clue: word.clue
    }))

    .filter(
      (word) =>
        word.answer.length >= 3
    );

  const layout = generateLayout(
    cleanedWords,
    aiData.size || 15
  );

  return {
    title:
      aiData.title ||
      "Cyber Hero Crossword",

    size: layout.size,

    words: layout.words
  };
}