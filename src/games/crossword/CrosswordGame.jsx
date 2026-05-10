import { useState, useEffect } from "react";

import CrosswordGrid from "./components/CrosswordGrid";
import ClueList from "./components/ClueList";
import WordBank from "./components/WordBank";

import { samplePuzzles } from "./data/samplePuzzles";
import { fetchAIPuzzle } from "./api/fetchAIPuzzle";
import { createPuzzle } from "./utils/createPuzzle";

function createGrid(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

function placeWords(grid, words) {
  words.forEach((wordObj) => {
    const { answer, row, col, direction } = wordObj;

    answer.split("").forEach((letter, index) => {
      if (direction === "across") {
        grid[row][col + index] = letter;
      } else {
        grid[row + index][col] = letter;
      }
    });
  });

  return grid;
}

function getRandomPuzzle(tier) {
  const puzzles = samplePuzzles[tier];
  const randomIndex = Math.floor(Math.random() * puzzles.length);

  return puzzles[randomIndex];
}

const cyberTopics = {
  junior: [
    "internet safety",
    "passwords",
    "online friends",
    "gaming safety",
    "safe websites"
  ],

  hero: [
    "phishing",
    "social engineering",
    "malware",
    "privacy",
    "wifi security"
  ],

  elite: [
    "encryption",
    "data breaches",
    "network attacks",
    "cyber defense",
    "ethical hacking"
  ]
};

export default function App() {
  const [currentTier, setCurrentTier] = useState("junior");
  const [activeWord, setActiveWord] = useState(null);
  const [topic, setTopic] = useState("internet safety");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  const [checkSignal, setCheckSignal] = useState(0);
  const [hintSignal, setHintSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  const [currentPuzzle, setCurrentPuzzle] = useState(
    getRandomPuzzle("junior")
  );

  function getRandomTopic(tier = currentTier) {
    const topics = cyberTopics[tier];

    return topics[Math.floor(Math.random() * topics.length)];
  }

  async function loadNewPuzzle(tierOverride = currentTier) {
    setIsGenerating(true);
    setGenerationError("");

    try {
      const randomTopic = getRandomTopic(tierOverride);

      setTopic(randomTopic);

      const aiData = await fetchAIPuzzle(randomTopic, tierOverride);
      const playablePuzzle = createPuzzle(aiData);

      if (
        !playablePuzzle ||
        !playablePuzzle.words ||
        playablePuzzle.words.length < 6
      ) {
        throw new Error("Not enough words could be placed.");
      }

      setCurrentPuzzle(playablePuzzle);
      setActiveWord(null);
    } catch (error) {
      console.error("Puzzle generation failed:", error);

      setGenerationError("Mission generation failed. Try again.");

      const fallbackPuzzle = getRandomPuzzle(tierOverride);

      setCurrentPuzzle(fallbackPuzzle);
      setActiveWord(null);
    } finally {
      setIsGenerating(false);
    }
  }

  useEffect(() => {
    loadNewPuzzle("junior");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTierChange(tier) {
    setCurrentTier(tier);
    setActiveWord(null);
    setGenerationError("");
    loadNewPuzzle(tier);
  }

  if (!currentPuzzle || !currentPuzzle.words) {
    return (
      <div
        style={{
          backgroundColor: "#040218",
          color: "white",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          fontFamily: "Arial",
          overflow: "hidden"
        }}
      >
        Loading Cyber Hero Academy...
      </div>
    );
  }

  const grid = createGrid(currentPuzzle.size);

  placeWords(grid, currentPuzzle.words);

  return (
    <div
      style={{
        backgroundColor: "#040218",
        height: "100vh",
        color: "white",
        padding: "18px",
        fontFamily: "Arial",
        overflow: "hidden",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          height: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            flexWrap: "wrap",
            gap: "14px",
            flexShrink: 0
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(24px, 4vw, 42px)",
                margin: 0,
                lineHeight: 1.05
              }}
            >
              {currentPuzzle.title}
            </h1>

            <p
              style={{
                color: "#08b6aa",
                fontWeight: "bold",
                marginTop: "6px",
                marginBottom: 0
              }}
            >
              Current Tier: {currentTier.toUpperCase()}
            </p>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: "13px",
                marginTop: "4px",
                marginBottom: 0
              }}
            >
            </p>
          </div>

          <button
            onClick={() => loadNewPuzzle(currentTier)}
            disabled={isGenerating}
            style={{
              backgroundColor: isGenerating ? "#64748b" : "#08b6aa",
              color: "#000",
              border: "none",
              padding: "10px 16px",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: isGenerating ? "not-allowed" : "pointer",
              fontSize: "14px"
            }}
          >
            {isGenerating ? "Generating..." : "🎲 New Mission"}
          </button>
        </div>

        {/* TIER BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "12px",
            flexWrap: "wrap",
            flexShrink: 0
          }}
        >
          <button
            onClick={() => handleTierChange("junior")}
            style={tierButtonStyle(currentTier === "junior")}
          >
            🌟 Junior Heroes
          </button>

          <button
            onClick={() => handleTierChange("hero")}
            style={tierButtonStyle(currentTier === "hero")}
          >
            🛡️ Hero Tier
          </button>

          <button
            onClick={() => handleTierChange("elite")}
            style={tierButtonStyle(currentTier === "elite")}
          >
            ⚡ Elite Cyber Heroes
          </button>
        </div>

        {generationError && (
          <div
            style={{
              backgroundColor: "#7f1d1d",
              border: "1px solid #fecaca",
              color: "#fff",
              padding: "10px 12px",
              borderRadius: "12px",
              marginBottom: "12px",
              flexShrink: 0
            }}
          >
            {generationError}
          </div>
        )}

        <div
          style={{
            width: "100%",
            marginBottom: "16px",
            flexShrink: 0
          }}
        >
          <WordBank words={currentPuzzle.words} tier={currentTier} />
        </div>

        {/* GAME ROW: GRID LEFT, CLUES + BUTTONS RIGHT */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            justifyContent: "center",
            minHeight: 0,
            flex: 1
          }}
        >
          <div
            style={{
              flex: "1 1 620px",
              maxWidth: "760px",
              minWidth: "320px",
              display: "flex",
              justifyContent: "center",
              minHeight: 0
            }}
          >
            <CrosswordGrid
              key={`${currentPuzzle.title}-${currentTier}`}
              grid={grid}
              words={currentPuzzle.words}
              tier={currentTier}
              topic={topic}
              puzzleTitle={currentPuzzle.title}
              activeWord={activeWord}
              setActiveWord={setActiveWord}
              checkSignal={checkSignal}
              hintSignal={hintSignal}
              resetSignal={resetSignal}
            />
          </div>

          <div
            style={{
              flex: "0 1 320px",
              width: "100%",
              maxWidth: "340px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              height: "fit-content",
              minHeight: 0
            }}
          >
            <div
              style={{
                height: "300px",
                overflowY: "auto",
                overflowX: "hidden",
                borderRadius: "16px"
              }}
            >
              <ClueList
                words={currentPuzzle.words}
                activeWord={activeWord}
                setActiveWord={setActiveWord}
              />
            </div>

            <div
              style={{
                backgroundColor: "#0b1120",
                border: "1px solid #08b6aa",
                borderRadius: "16px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "9px",
                flexShrink: 0,
                marginTop: "20px"
              }}
            >
              <button
                onClick={() => setCheckSignal((prev) => prev + 1)}
                style={sideButtonStyle("#08b6aa", "#000")}
              >
                Check Answers
              </button>

              <button
                onClick={() => setHintSignal((prev) => prev + 1)}
                style={sideButtonStyle("#facc15", "#000")}
              >
                Use Hint
              </button>

              <button
                onClick={() => setResetSignal((prev) => prev + 1)}
                style={sideButtonStyle("#1f2937", "#fff")}
              >
                Reset Puzzle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function tierButtonStyle(active) {
  return {
    backgroundColor: active ? "#08b6aa" : "#111827",
    color: active ? "#000" : "#fff",
    border: "1px solid #08b6aa",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px"
  };
}

function sideButtonStyle(background, color) {
  return {
    backgroundColor: background,
    color,
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    fontSize: "13px"
  };
}