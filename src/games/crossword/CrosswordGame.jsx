import { useState, useEffect } from "react";

import CrosswordGrid from "./components/CrosswordGrid";
import ClueList from "./components/ClueList";
import WordBank from "./components/WordBank";

import { fetchAIPuzzle } from "./api/fetchAIPuzzle";
import { createPuzzle } from "./utils/createPuzzle";

function LoadingScreen() {
  const messages = [
    "Byte is building your cyber mission…",
    "Generating clues…",
    "Preparing your crossword grid…",
    "Waking up the villains…",
    "Loading cybersecurity vocabulary…",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#040218",
        color: "white",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "28px",
        fontFamily: "var(--font-display, Arial)",
        overflow: "hidden",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      {/* Animated pulse ring */}
      <div style={{ position: "relative", width: 80, height: 80 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid #08b6aa",
            opacity: 0.35,
            animation: "cw-pulse-ring 2s ease-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 12,
            borderRadius: "50%",
            border: "3px solid #08b6aa",
            opacity: 0.6,
            animation: "cw-pulse-ring 2s ease-out 0.6s infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 24,
            borderRadius: "50%",
            backgroundColor: "#08b6aa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: "bold",
            color: "#040218",
            animation: "cw-pulse-dot 2s ease-in-out infinite",
          }}
        >
          B
        </div>
      </div>

      {/* Rotating message */}
      <div
        style={{
          textAlign: "center",
          fontSize: "clamp(18px, 2.4vw, 28px)",
          fontWeight: 700,
          color: "#e2e8f0",
          minHeight: "1.4em",
          letterSpacing: "0.02em",
        }}
      >
        {messages[index]}
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {messages.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === index ? "#08b6aa" : "#1f2937",
              transition: "all 0.4s ease",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes cw-pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes cw-pulse-dot {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
}

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

function getRandomPuzzle(_tier) {
  return { title: "Cyber Hero Crossword", size: 15, words: [] };
}

function getInitialTier() {
  const age = parseInt(new URLSearchParams(window.location.search).get("age") || "0");
  if (age >= 5 && age <= 8)  return "junior";
  if (age >= 9 && age <= 12) return "hero";
  if (age > 12)              return "elite";
  return "junior";
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
  const [currentTier, setCurrentTier] = useState(getInitialTier);
  const [activeWord, setActiveWord] = useState(null);
  const [topic, setTopic] = useState("internet safety");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");

  const [checkSignal, setCheckSignal] = useState(0);
  const [hintSignal, setHintSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  const [currentPuzzle, setCurrentPuzzle] = useState(null);

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
      setGenerationError("");
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
    loadNewPuzzle(getInitialTier());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleTierChange(tier) {
    setCurrentTier(tier);
    setActiveWord(null);
    setGenerationError("");
    loadNewPuzzle(tier);
  }

  if (!currentPuzzle || !currentPuzzle.words) {
    return <LoadingScreen />;
  }

  const grid = createGrid(currentPuzzle.size);

  placeWords(grid, currentPuzzle.words);

  return (
    <div
      style={{
        backgroundColor: "#040218",
        minHeight: "100vh",
        width: "100%",
        color: "white",
        padding: "clamp(12px, 2vw, 28px)",
        paddingTop: "clamp(56px, 7vw, 72px)",
        fontFamily: "Arial",
        boxSizing: "border-box",
        // dynamic crossword cell size — scales with viewport
        ["--cw-cell"]: "clamp(22px, min(4.4vw, 4.4vh), 46px)"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px"
          }}
        >
          <div>
            <button
              onClick={() => { window.location.href = "/missions"; }}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "none", border: "1px solid rgba(8,182,170,0.35)",
                color: "#08b6aa", borderRadius: "10px", padding: "5px 12px",
                fontSize: "12px", fontWeight: "bold", cursor: "pointer", marginBottom: "8px",
              }}
            >
              ← Back to Games
            </button>
            <h1
              style={{
                fontSize: "clamp(26px, 3.4vw, 46px)",
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
          </div>

          <button
            onClick={() => loadNewPuzzle(currentTier)}
            disabled={isGenerating}
            style={{
              backgroundColor: isGenerating ? "#64748b" : "#08b6aa",
              color: "#000",
              border: "none",
              padding: "12px 20px",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: isGenerating ? "not-allowed" : "pointer",
              fontSize: "15px"
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
            flexWrap: "wrap"
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
              borderRadius: "12px"
            }}
          >
            {generationError}
          </div>
        )}

        <WordBank words={currentPuzzle.words} tier={currentTier} />

        {/* GAME ROW: GRID LEFT, CLUES + BUTTONS RIGHT */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              flex: "1 1 640px",
              display: "flex",
              justifyContent: "center"
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
              flex: "1 1 380px",
              maxWidth: "480px",
              minWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            <div
              style={{
                maxHeight: "60vh",
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
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
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
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px"
  };
}

function sideButtonStyle(background, color) {
  return {
    backgroundColor: background,
    color,
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    fontSize: "14px"
  };
}