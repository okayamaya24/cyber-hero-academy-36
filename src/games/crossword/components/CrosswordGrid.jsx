import { useState, useEffect, useRef } from "react";
import { saveCrosswordResult } from "../lib/saveCrosswordResult";

function getCellNumber(words, row, col) {
  const word = words.find(
    (wordObj) => wordObj.row === row && wordObj.col === col
  );

  return word ? word.id : null;
}

function isCellInWord(wordObj, row, col) {
  const { answer, row: startRow, col: startCol, direction } = wordObj;

  for (let index = 0; index < answer.length; index++) {
    const currentRow = direction === "across" ? startRow : startRow + index;
    const currentCol = direction === "across" ? startCol + index : startCol;

    if (currentRow === row && currentCol === col) {
      return true;
    }
  }

  return false;
}

function getWordsAtCell(words, row, col) {
  return words.filter((wordObj) => isCellInWord(wordObj, row, col));
}

function getCorrectLetter(grid, row, col) {
  return grid[row][col];
}

export default function CrosswordGrid({
  grid,
  words,
  tier,
  topic,
  puzzleTitle,
  activeWord,
  setActiveWord,
  checkSignal,
  hintSignal,
  resetSignal
}) {
  const [userGrid, setUserGrid] = useState(
    grid.map((row) => row.map(() => ""))
  );

  const [completed, setCompleted] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [activeCell, setActiveCell] = useState(null);
  const [activeDirection, setActiveDirection] = useState("across");

  const inputRefs = useRef({});

  useEffect(() => {
    if (completed) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [completed]);

  useEffect(() => {
    if (checkSignal > 0) {
      setShowFeedback(true);
    }
  }, [checkSignal]);

  useEffect(() => {
    if (hintSignal > 0) {
      useHint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hintSignal]);

  useEffect(() => {
    if (resetSignal > 0) {
      resetPuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function focusCell(row, col) {
    const key = `${row}-${col}`;
    inputRefs.current[key]?.focus();
  }

  function selectCell(row, col) {
    const wordsAtCell = getWordsAtCell(words, row, col);

    const clickedSameCell =
      activeCell && activeCell.row === row && activeCell.col === col;

    let nextDirection = activeDirection;

    if (clickedSameCell && wordsAtCell.length > 1) {
      nextDirection = activeDirection === "across" ? "down" : "across";
      setActiveDirection(nextDirection);
    }

    const matchingWord =
      wordsAtCell.find((word) => word.direction === nextDirection) ||
      wordsAtCell[0];

    if (matchingWord) {
      setActiveWord(matchingWord);
      setActiveDirection(matchingWord.direction);
    }

    setActiveCell({ row, col });
  }

  function getNextCell(row, col) {
    if (!activeWord) return null;

    const { answer, row: startRow, col: startCol, direction } = activeWord;

    for (let index = 0; index < answer.length; index++) {
      const currentRow = direction === "across" ? startRow : startRow + index;
      const currentCol = direction === "across" ? startCol + index : startCol;

      if (currentRow === row && currentCol === col) {
        const nextIndex = index + 1;

        if (nextIndex < answer.length) {
          return {
            row: direction === "across" ? startRow : startRow + nextIndex,
            col: direction === "across" ? startCol + nextIndex : startCol
          };
        }
      }
    }

    return null;
  }

  function getPreviousCell(row, col) {
    if (!activeWord) return null;

    const { answer, row: startRow, col: startCol, direction } = activeWord;

    for (let index = 0; index < answer.length; index++) {
      const currentRow = direction === "across" ? startRow : startRow + index;
      const currentCol = direction === "across" ? startCol + index : startCol;

      if (currentRow === row && currentCol === col) {
        const prevIndex = index - 1;

        if (prevIndex >= 0) {
          return {
            row: direction === "across" ? startRow : startRow + prevIndex,
            col: direction === "across" ? startCol + prevIndex : startCol
          };
        }
      }
    }

    return null;
  }

  function handleChange(rowIndex, colIndex, value) {
    const letter = value.toUpperCase().slice(-1);

    const updated = userGrid.map((row) => [...row]);
    updated[rowIndex][colIndex] = letter;

    setUserGrid(updated);
    setShowFeedback(false);

    if (letter) {
      const nextCell = getNextCell(rowIndex, colIndex);

      if (nextCell) {
        setTimeout(() => {
          focusCell(nextCell.row, nextCell.col);
          selectCell(nextCell.row, nextCell.col);
        }, 0);
      }
    }
  }

  function handleKeyDown(e, row, col) {
    if (e.key === "Backspace") {
      if (!userGrid[row][col]) {
        const prevCell = getPreviousCell(row, col);

        if (prevCell) {
          e.preventDefault();
          focusCell(prevCell.row, prevCell.col);
          selectCell(prevCell.row, prevCell.col);
        }
      }
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusCell(row, col + 1);
      selectCell(row, col + 1);
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusCell(row, col - 1);
      selectCell(row, col - 1);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusCell(row + 1, col);
      selectCell(row + 1, col);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      focusCell(row - 1, col);
      selectCell(row - 1, col);
    }
  }

  function getCellBackground(cell, row, col) {
    if (!cell) return "#000";

    const isActiveCell =
      activeCell && activeCell.row === row && activeCell.col === col;

    const isActiveWordCell = activeWord && isCellInWord(activeWord, row, col);

    if (showFeedback) {
      const typedLetter = userGrid[row][col];
      const correctLetter = getCorrectLetter(grid, row, col);

      if (typedLetter && typedLetter === correctLetter) {
        return "#bbf7d0";
      }

      if (typedLetter && typedLetter !== correctLetter) {
        return "#fecaca";
      }
    }

    if (isActiveCell) return "#facc15";
    if (isActiveWordCell) return "#d9f99d";

    return "#ffffff";
  }

  function resetPuzzle() {
    setUserGrid(grid.map((row) => row.map(() => "")));
    setShowFeedback(false);
    setCompleted(false);
    setResultSaved(false);
    setHintsUsed(0);
    setSecondsElapsed(0);
    setActiveCell(null);
    setActiveWord(null);
    setActiveDirection("across");
  }

  function useHint() {
    const updated = userGrid.map((row) => [...row]);

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid.length; col++) {
        if (grid[row][col] && !updated[row][col]) {
          updated[row][col] = grid[row][col];

          setUserGrid(updated);
          setHintsUsed((prev) => prev + 1);

          return;
        }
      }
    }
  }

  function getBaseXP() {
    if (tier === "junior") return 100;
    if (tier === "hero") return 150;
    if (tier === "elite") return 300;

    return 100;
  }

  function getSpeedBonus() {
    if (secondsElapsed <= 60) return 50;
    if (secondsElapsed <= 120) return 25;

    return 0;
  }

  function calculateXP() {
    const baseXP = getBaseXP();
    const penalty = hintsUsed * 10;

    return Math.max(baseXP - penalty + getSpeedBonus(), 40);
  }

  function calculateStars() {
    if (hintsUsed === 0 && secondsElapsed < 90) return "⭐⭐⭐";
    if (hintsUsed <= 2) return "⭐⭐";

    return "⭐";
  }

  useEffect(() => {
    let allCorrect = true;

    words.forEach((wordObj) => {
      const { answer, row, col, direction } = wordObj;

      answer.split("").forEach((letter, index) => {
        const current =
          direction === "across"
            ? userGrid[row][col + index]
            : userGrid[row + index][col];

        if (current !== letter) {
          allCorrect = false;
        }
      });
    });

    if (allCorrect && !completed) {
      setCompleted(true);
    } else if (!allCorrect) {
      setCompleted(false);
    }
  }, [userGrid, words, completed]);

  useEffect(() => {
    async function saveResult() {
      if (!completed || resultSaved) return;

      try {
        await saveCrosswordResult({
          tier,
          topic,
          puzzleTitle,
          xpEarned: calculateXP(),
          stars: calculateStars(),
          hintsUsed,
          completionTime: secondsElapsed,
          wordsPlaced: words.length
        });

        console.log("Crossword result saved!");
        setResultSaved(true);
      } catch (error) {
        console.error("Failed to save crossword result:", error);
      }
    }

    saveResult();
  }, [
    completed,
    resultSaved,
    tier,
    topic,
    puzzleTitle,
    hintsUsed,
    secondsElapsed,
    words
  ]);

  return (
    <>
      <div
        style={{
          marginBottom: "15px",
          color: "#08b6aa",
          fontWeight: "bold",
          fontSize: "18px"
        }}
      >
        ⏱️ Mission Time: {formatTime(secondsElapsed)}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid.length}, 28px)`,
          gap: "2px"
        }}
      >
        {grid.flat().map((cell, index) => {
          const row = Math.floor(index / grid.length);
          const col = index % grid.length;
          const cellNumber = getCellNumber(words, row, col);
          const key = `${row}-${col}`;

          return (
            <div
              key={index}
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: getCellBackground(cell, row, col),
                border: cell ? "1px solid #555" : "1px solid #000",
                position: "relative"
              }}
            >
              {cellNumber && (
                <span
                  style={{
                    position: "absolute",
                    top: "1px",
                    left: "3px",
                    fontSize: "8px",
                    color: "#000",
                    fontWeight: "bold",
                    zIndex: 2
                  }}
                >
                  {cellNumber}
                </span>
              )}

              {cell && (
                <input
                  ref={(el) => {
                    inputRefs.current[key] = el;
                  }}
                  value={userGrid[row][col]}
                  onFocus={() => selectCell(row, col)}
                  onClick={() => selectCell(row, col)}
                  onChange={(e) => handleChange(row, col, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, row, col)}
                  maxLength={1}
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    fontSize: "14px",
                    border: "none",
                    outline: "none",
                    textTransform: "uppercase",
                    backgroundColor: "transparent",
                    color: "#000",
                    fontWeight: "bold"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "15px",
          color: "#08b6aa",
          fontWeight: "bold"
        }}
      >
        💡 Hints Used: {hintsUsed}
      </div>

      {completed && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px"
          }}
        >
          <div
            style={{
              backgroundColor: "#04142d",
              border: "2px solid #08b6aa",
              borderRadius: "24px",
              padding: "35px",
              width: "100%",
              maxWidth: "420px",
              textAlign: "center",
              boxShadow: "0 0 40px rgba(8,182,170,0.45)"
            }}
          >
            <h1
              style={{
                color: "#08b6aa",
                fontSize: "36px",
                marginBottom: "10px"
              }}
            >
              🎉 Mission Complete!
            </h1>

            <div
              style={{
                fontSize: "42px",
                marginBottom: "18px"
              }}
            >
              {calculateStars()}
            </div>

            <div
              style={{
                color: "#fff",
                fontSize: "34px",
                fontWeight: "bold",
                marginBottom: "16px"
              }}
            >
              +{calculateXP()} XP
            </div>

            <div
              style={{
                color: "#cbd5e1",
                marginBottom: "8px",
                fontSize: "18px"
              }}
            >
              ⏱️ Time: {formatTime(secondsElapsed)}
            </div>

            <div
              style={{
                color: "#facc15",
                marginBottom: "18px",
                fontSize: "18px",
                fontWeight: "bold"
              }}
            >
              ⚡ Speed Bonus: +{getSpeedBonus()} XP
            </div>

            <div
              style={{
                color: resultSaved ? "#4ade80" : "#facc15",
                marginBottom: "24px",
                fontWeight: "bold",
                fontSize: "18px"
              }}
            >
              {resultSaved ? "✅ Progress Saved" : "Saving progress..."}
            </div>

            <button
              onClick={resetPuzzle}
              style={{
                backgroundColor: "#08b6aa",
                color: "#000",
                border: "none",
                padding: "14px 24px",
                borderRadius: "14px",
                fontWeight: "bold",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}