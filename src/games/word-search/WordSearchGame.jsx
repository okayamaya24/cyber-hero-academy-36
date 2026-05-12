import { useMemo, useState, useEffect } from "react";

import GameHeader from "./components/GameHeader";
import TierButtons from "./components/TierButtons";
import WordGrid from "./components/WordGrid";
import MissionPanel from "./components/MissionPanel";
import CompletionModal from "./components/CompletionModal";

import { saveWordSearchResult } from "./lib/saveWordSearchResult";
import { generateWordSearchWords } from "./lib/generateWordSearchWords";

const FALLBACK_WORDS_BY_TIER = {
  junior: ["SAFE", "WIFI", "LINK", "GAME", "ADULT", "KIND"],
  hero: ["PHISHING", "PASSWORD", "MALWARE", "PRIVACY", "HACKER", "FIREWALL"],
  elite: ["ENCRYPT", "BOTNET", "TROJAN", "SPYWARE", "BREACH", "EXPLOIT"]
};

const GRID_SIZE_BY_PUZZLE_SIZE = {
  small: 8,
  medium: 10,
  large: 12,
  expert: 14
};

const TOPICS_BY_TIER = {
  junior: [
    "internet safety",
    "password safety",
    "safe gaming",
    "online kindness",
    "safe websites"
  ],
  hero: [
    "phishing",
    "malware",
    "privacy",
    "social engineering",
    "wifi security"
  ],
  elite: [
    "encryption",
    "data breaches",
    "network defense",
    "ethical hacking",
    "cyber attacks"
  ]
};

function randomLetter() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
}

function createEmptyGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function canPlaceWord(grid, word, row, col, direction) {
  const size = grid.length;

  for (let i = 0; i < word.length; i++) {
    const r = row + direction.row * i;
    const c = col + direction.col * i;

    if (r < 0 || r >= size || c < 0 || c >= size) return false;
    if (grid[r][c] && grid[r][c] !== word[i]) return false;
  }

  return true;
}

function placeWord(grid, word, row, col, direction) {
  const positions = [];

  for (let i = 0; i < word.length; i++) {
    const r = row + direction.row * i;
    const c = col + direction.col * i;

    grid[r][c] = word[i];
    positions.push({ row: r, col: c });
  }

  return positions;
}

function generateWordSearch(words, size, tier) {
  const grid = createEmptyGrid(size);
  const placedWords = [];

  const directions =
    tier === "junior"
      ? [
          { row: 0, col: 1 },
          { row: 1, col: 0 }
        ]
      : [
          { row: 0, col: 1 },
          { row: 1, col: 0 },
          { row: 1, col: 1 },
          { row: -1, col: 1 }
        ];

  words.forEach((word) => {
    let placed = false;

    for (let attempt = 0; attempt < 150 && !placed; attempt++) {
      const direction =
        directions[Math.floor(Math.random() * directions.length)];

      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (canPlaceWord(grid, word, row, col, direction)) {
        const positions = placeWord(grid, word, row, col, direction);

        placedWords.push({
          word,
          positions
        });

        placed = true;
      }
    }
  });

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!grid[row][col]) {
        grid[row][col] = randomLetter();
      }
    }
  }

  return {
    grid,
    placedWords
  };
}

function getRandomTopic(tier) {
  const topics = TOPICS_BY_TIER[tier];
  return topics[Math.floor(Math.random() * topics.length)];
}

function cleanWords(words, size) {
  return words
    .map((word) => word.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((word) => word.length >= 3 && word.length <= size)
    .filter((word, index, array) => array.indexOf(word) === index);
}

export default function App() {
  const [tier, setTier] = useState("junior");
  const [puzzleSize, setPuzzleSize] = useState("small");
  const [topic, setTopic] = useState("internet safety");

  const [words, setWords] = useState(FALLBACK_WORDS_BY_TIER.junior);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundCells, setFoundCells] = useState([]);
  const [dragging, setDragging] = useState(false);

const [message, setMessage] = useState("");

const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const [resultSaved, setResultSaved] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const size = GRID_SIZE_BY_PUZZLE_SIZE[puzzleSize];

  const puzzle = useMemo(() => {
    return generateWordSearch(words, size, tier);
  }, [words, size, tier]);

  useEffect(() => {
    loadAIMission("junior", "small");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (missionComplete) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [missionComplete]);

  useEffect(() => {
    if (foundWords.length === words.length && words.length > 0) {
      setMissionComplete(true);
    }
  }, [foundWords, words]);

  useEffect(() => {
    async function saveResult() {
      if (!missionComplete || resultSaved || savingResult) return;

      try {
        setSavingResult(true);

        await saveWordSearchResult({
          tier,
          xpEarned: getXP(),
          stars: getStars(),
          completionTime: secondsElapsed,
          bestStreak
        });

        console.log("Word Search result saved!");
        setResultSaved(true);
      } catch (error) {
        console.error("Failed to save Word Search result:", error);
      } finally {
        setSavingResult(false);
      }
    }

    saveResult();
  }, [
    missionComplete,
    resultSaved,
    savingResult,
    tier,
    secondsElapsed,
    bestStreak
  ]);

  async function loadAIMission(nextTier = tier, nextPuzzleSize = puzzleSize) {
    setIsGenerating(true);

    const randomTopic = getRandomTopic(nextTier);
    const gridSize = GRID_SIZE_BY_PUZZLE_SIZE[nextPuzzleSize];

    resetProgressOnly();

    setTopic(randomTopic);
    setMessage("");

    try {
      const aiWords = await generateWordSearchWords({
        tier: nextTier,
        puzzleSize: nextPuzzleSize,
        topic: randomTopic
      });

      const cleanedWords = cleanWords(aiWords, gridSize);

      if (cleanedWords.length < 4) {
        throw new Error("Not enough valid AI words returned.");
      }

      setWords(cleanedWords);
    } catch (error) {
      console.error("AI mission failed. Using fallback words:", error);

      setWords(FALLBACK_WORDS_BY_TIER[nextTier]);
      setMessage("");
    } finally {
      setIsGenerating(false);
    }
  }

  function resetProgressOnly() {
    setSelectedCells([]);
    setFoundWords([]);
    setFoundCells([]);
    setSecondsElapsed(0);
    setMissionComplete(false);
    setStreak(0);
    setBestStreak(0);
    setResultSaved(false);
    setSavingResult(false);
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getXP() {
    const baseXP =
      tier === "junior"
        ? 100
        : tier === "hero"
        ? 180
        : 300;

    const sizeBonus =
      puzzleSize === "small"
        ? 0
        : puzzleSize === "medium"
        ? 30
        : puzzleSize === "large"
        ? 60
        : 100;

    const speedBonus =
      secondsElapsed < 60
        ? 60
        : secondsElapsed < 120
        ? 30
        : 0;

    const comboBonus = bestStreak * 10;

    return baseXP + sizeBonus + speedBonus + comboBonus;
  }

  function getStars() {
    if (secondsElapsed <= 45) return "⭐⭐⭐";
    if (secondsElapsed <= 90) return "⭐⭐";
    return "⭐";
  }

  function resetGame() {
    loadAIMission(tier, puzzleSize);
  }

  function changeTier(nextTier) {
    setTier(nextTier);

    const defaultPuzzleSize =
      nextTier === "junior"
        ? "small"
        : nextTier === "hero"
        ? "medium"
        : "large";

    setPuzzleSize(defaultPuzzleSize);
    loadAIMission(nextTier, defaultPuzzleSize);
  }

  function changePuzzleSize(nextPuzzleSize) {
    setPuzzleSize(nextPuzzleSize);
    loadAIMission(tier, nextPuzzleSize);
  }

  function sameCell(cell, row, col) {
    return cell.row === row && cell.col === col;
  }

  function addCell(row, col) {
    setSelectedCells((prev) => {
      const existingIndex = prev.findIndex((cell) =>
        sameCell(cell, row, col)
      );

      if (existingIndex === -1) {
        return [...prev, { row, col }];
      }

      if (existingIndex === prev.length - 2) {
        return prev.slice(0, prev.length - 1);
      }

      if (existingIndex < prev.length - 1) {
        return prev.slice(0, existingIndex + 1);
      }

      return prev;
    });
  }

  function startDrag(row, col) {
    if (missionComplete || isGenerating) return;

    setDragging(true);
    setSelectedCells([{ row, col }]);
    setMessage("Scanning letters...");
  }

  function enterCell(row, col) {
    if (!dragging) return;
    addCell(row, col);
  }

  function endDrag() {
    if (!dragging) return;

    setDragging(false);

    const selectedLetters = selectedCells
      .map((cell) => puzzle.grid[cell.row][cell.col])
      .join("");

    const reversedLetters = selectedLetters.split("").reverse().join("");

    const match = words.find(
      (word) =>
        !foundWords.includes(word) &&
        (word === selectedLetters || word === reversedLetters)
    );

    if (match) {
      setFoundWords((prev) => [...prev, match]);

      const foundWordData = puzzle.placedWords.find(
        (item) => item.word === match
      );

      if (foundWordData) {
       setFoundCells((prev) => [
        ...prev,
        ...foundWordData.positions.map((cell) => ({
          ...cell,
          wordIndex: foundWords.length
        }))
      ]);
      }

      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }

      if (tier === "junior") {

          const juniorPraise = [
            `✅ Great work! You found ${match}.`,
            `🌟 Awesome job finding ${match}!`,
            `🎉 NICE! ${match} was hidden well!`,
            `🛡️ Cyber Hero move! You found ${match}!`,
            `🚀 Amazing detective skills!`,
            `💙 Byte is proud of you!`,
            `🔥 SUPER FIND: ${match}!`,
            `🎯 Excellent scanning!`,
            `✨ You’re becoming a cyber expert!`,
            `🏆 Great teamwork with Byte!`
          ];

          const randomPraise =
            juniorPraise[
              Math.floor(Math.random() * juniorPraise.length)
            ];

          setMessage(randomPraise);

          } else {

            if (newStreak >= 5) {
              setMessage(`🔥 FIREWALL COMBO x${newStreak}!`);
            } else if (newStreak >= 3) {
              setMessage(`⚡ CYBER COMBO x${newStreak}!`);
            } else {
              setMessage(`✅ Great work! You found ${match}.`);
            }

          }

          } else {

            if (tier === "junior") {

              const juniorFails = [
                "❌ Almost! Try scanning again!",
                "🕵️ Keep searching, Cyber Hero!",
                "🔍 That wasn’t the full word yet!",
                "⚡ Byte says try another path!",
                "💙 You got this! Try again!"
              ];

              const randomFail =
                juniorFails[
                  Math.floor(Math.random() * juniorFails.length)
                ];

              setMessage(randomFail);

            } else {

              setMessage("❌ Byte says that sequence is incorrect.");

            }

            setStreak(0);
          }

          setSelectedCells([]);
  }

  return (
    <div
      onMouseUp={endDrag}
      style={{
        height: "100vh",
        backgroundColor: "#040218",
        color: "white",
        padding: "24px clamp(16px, 3vw, 40px)",
        fontFamily: "Arial",
        userSelect: "none",
        overflow: "hidden"
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <GameHeader
          secondsElapsed={secondsElapsed}
          formatTime={formatTime}
        />

        <TierButtons
          tier={tier}
          changeTier={changeTier}
          resetGame={resetGame}
        />

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "14px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => changePuzzleSize("small")}
            style={sizeButtonStyle(puzzleSize === "small")}
          >
            Small
          </button>

          <button
            onClick={() => changePuzzleSize("medium")}
            style={sizeButtonStyle(puzzleSize === "medium")}
          >
            Medium
          </button>

          <button
            onClick={() => changePuzzleSize("large")}
            style={sizeButtonStyle(puzzleSize === "large")}
          >
            Large
          </button>

          {tier === "elite" && (
            <button
              onClick={() => changePuzzleSize("expert")}
              style={sizeButtonStyle(puzzleSize === "expert")}
            >
              Expert
            </button>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              window.innerWidth < 1050 ? "1fr" : "minmax(0, 1fr) 380px",
            gap: "20px",
            alignItems: "stretch",
            minHeight: 0,
            flex: 1,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <WordGrid
              grid={puzzle.grid}
              size={size}
              selectedCells={selectedCells}
              foundCells={foundCells}
              startDrag={startDrag}
              enterCell={enterCell}
              endDrag={endDrag}
            />
          </div>

          <div
            style={{
              minHeight: 0,
              overflow: "hidden"
            }}
          >
            <MissionPanel
              words={words}
              foundWords={foundWords}
              streak={streak}
              bestStreak={bestStreak}
              message={message}
            />
          </div>
        </div>

        <CompletionModal
          missionComplete={missionComplete}
          getStars={getStars}
          getXP={getXP}
          formatTime={formatTime}
          secondsElapsed={secondsElapsed}
          bestStreak={bestStreak}
          resetGame={resetGame}
        />
      </div>
    </div>
  );
}

function sizeButtonStyle(active) {
  return {
    backgroundColor: active ? "#08b6aa" : "#111827",
    color: active ? "#000" : "#fff",
    border: "1px solid #08b6aa",
    padding: "9px 14px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px"
  };
}