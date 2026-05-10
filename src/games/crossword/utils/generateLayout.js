export function generateLayout(words, size = 15) {
  let bestLayout = null;
  let bestScore = -1;

  for (let attempt = 0; attempt < 12; attempt++) {
    const cleanedWords = [...words]
      .map((word) => ({
        ...word,
        answer: word.answer.toUpperCase().replace(/[^A-Z]/g, "")
      }))
      .filter(
        (word) =>
          word.answer.length >= 3 &&
          word.answer.length <= size
      )
      .sort(() => Math.random() - 0.5)
      .sort((a, b) => b.answer.length - a.answer.length);

    const grid = Array.from({ length: size }, () =>
      Array(size).fill("")
    );

    const placedWords = [];

    if (cleanedWords.length === 0) {
      continue;
    }

    const firstWord = cleanedWords[0];
    const firstRow = Math.floor(size / 2);
    const firstCol = Math.floor((size - firstWord.answer.length) / 2);

    placeWord(grid, firstWord.answer, firstRow, firstCol, "across");

    placedWords.push({
      ...firstWord,
      id: 1,
      row: firstRow,
      col: firstCol,
      direction: "across"
    });

    let idCounter = 2;

    for (let i = 1; i < cleanedWords.length; i++) {
      const word = cleanedWords[i];

      const placement = findBestPlacement(
        grid,
        placedWords,
        word.answer,
        size
      );

      if (placement) {
        placeWord(
          grid,
          word.answer,
          placement.row,
          placement.col,
          placement.direction
        );

        placedWords.push({
          ...word,
          id: idCounter++,
          row: placement.row,
          col: placement.col,
          direction: placement.direction
        });
      }
    }

    const layoutScore = scoreWholeLayout(placedWords);

    if (placedWords.length > 5 && layoutScore > bestScore) {
      bestScore = layoutScore;

      bestLayout = {
        size,
        words: centerPlacedWords(placedWords, size)
      };
    }
  }

  if (!bestLayout) {
    return {
      size,
      words: []
    };
  }

  return bestLayout;
}

function findBestPlacement(grid, placedWords, newWord, size) {
  let bestPlacement = null;
  let bestScore = -1;

  for (const placedWord of placedWords) {
    for (
      let placedIndex = 0;
      placedIndex < placedWord.answer.length;
      placedIndex++
    ) {
      for (
        let newIndex = 0;
        newIndex < newWord.length;
        newIndex++
      ) {
        if (placedWord.answer[placedIndex] !== newWord[newIndex]) {
          continue;
        }

        const direction =
          placedWord.direction === "across" ? "down" : "across";

        const row =
          direction === "down"
            ? placedWord.row - newIndex
            : placedWord.row + placedIndex;

        const col =
          direction === "down"
            ? placedWord.col + placedIndex
            : placedWord.col - newIndex;

        if (
          canPlaceWord(
            grid,
            newWord,
            row,
            col,
            direction,
            size
          )
        ) {
          const score = scorePlacement(
            grid,
            newWord,
            row,
            col,
            direction
          );

          if (score > bestScore) {
            bestScore = score;
            bestPlacement = {
              row,
              col,
              direction
            };
          }
        }
      }
    }
  }

  return bestPlacement;
}

function canPlaceWord(grid, word, row, col, direction, size) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;

    if (r < 0 || r >= size || c < 0 || c >= size) {
      return false;
    }

    const existing = grid[r][c];

    if (existing && existing !== word[i]) {
      return false;
    }

    if (!existing) {
      if (direction === "across") {
        if (grid[r - 1]?.[c]) return false;
        if (grid[r + 1]?.[c]) return false;
      } else {
        if (grid[r]?.[c - 1]) return false;
        if (grid[r]?.[c + 1]) return false;
      }
    }
  }

  const beforeRow = direction === "across" ? row : row - 1;
  const beforeCol = direction === "across" ? col - 1 : col;

  const afterRow =
    direction === "across" ? row : row + word.length;

  const afterCol =
    direction === "across" ? col + word.length : col;

  if (grid[beforeRow]?.[beforeCol]) {
    return false;
  }

  if (grid[afterRow]?.[afterCol]) {
    return false;
  }

  return true;
}

function scorePlacement(grid, word, row, col, direction) {
  let score = 0;

  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;

    if (grid[r][c] === word[i]) {
      score += 10;
    }
  }

  const center = Math.floor(grid.length / 2);

  const distanceFromCenter =
    Math.abs(row - center) + Math.abs(col - center);

  score -= distanceFromCenter;

  return score;
}

function placeWord(grid, word, row, col, direction) {
  for (let i = 0; i < word.length; i++) {
    const r = direction === "across" ? row : row + i;
    const c = direction === "across" ? col + i : col;

    grid[r][c] = word[i];
  }
}

function centerPlacedWords(placedWords, size) {
  if (placedWords.length === 0) {
    return placedWords;
  }

  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  placedWords.forEach((word) => {
    for (let i = 0; i < word.answer.length; i++) {
      const row =
        word.direction === "across" ? word.row : word.row + i;

      const col =
        word.direction === "across" ? word.col + i : word.col;

      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
    }
  });

  const puzzleHeight = maxRow - minRow + 1;
  const puzzleWidth = maxCol - minCol + 1;

  const rowOffset =
    Math.floor((size - puzzleHeight) / 2) - minRow;

  const colOffset =
    Math.floor((size - puzzleWidth) / 2) - minCol;

  return placedWords.map((word) => ({
    ...word,
    row: word.row + rowOffset,
    col: word.col + colOffset
  }));
}

function scoreWholeLayout(placedWords) {
  let score = 0;

  score += placedWords.length * 25;

  placedWords.forEach((word) => {
    score += word.answer.length;
  });

  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  placedWords.forEach((word) => {
    for (let i = 0; i < word.answer.length; i++) {
      const row =
        word.direction === "across" ? word.row : word.row + i;

      const col =
        word.direction === "across" ? word.col + i : word.col;

      minRow = Math.min(minRow, row);
      maxRow = Math.max(maxRow, row);
      minCol = Math.min(minCol, col);
      maxCol = Math.max(maxCol, col);
    }
  });

  const width = maxCol - minCol + 1;
  const height = maxRow - minRow + 1;

  const balance = Math.abs(width - height);

  score -= balance * 5;

  return score;
}