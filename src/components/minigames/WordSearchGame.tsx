import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { AgeTier } from "@/data/missions";

interface Props {
  missionId: string;
  ageTier: AgeTier;
  guideImage: string;
  guideName: string;
  onComplete: (correct: boolean) => void;
}

const WORD_LISTS: Record<string, Record<AgeTier, string[]>> = {
  "scam-detection": {
    junior: ["SCAM", "SAFE", "FAKE", "LINK", "SPAM"],
    defender: ["PHISHING", "SCAMMER", "MALWARE", "SECURE", "VIRUS"],
    guardian: ["PHISHING", "IDENTITY", "ENCRYPT", "FIREWALL", "SPOOFING"],
  },
  "password-safety": {
    junior: ["LOCK", "KEY", "SAFE", "CODE", "PASS"],
    defender: ["PASSWORD", "SYMBOL", "STRONG", "SECURE", "RANDOM"],
    guardian: ["ENCRYPT", "TWOFACTOR", "HASHING", "COMPLEX", "UNIQUE"],
  },
  "safe-websites": {
    junior: ["SAFE", "LINK", "LOCK", "SITE", "WEB"],
    defender: ["HTTPS", "SECURE", "DOMAIN", "BROWSER", "SHIELD"],
    guardian: ["HTTPS", "CERTIFICATE", "DOMAIN", "BROWSER", "VERIFIED"],
  },
  "personal-info": {
    junior: ["NAME", "SAFE", "HIDE", "TELL", "KEEP"],
    defender: ["PRIVATE", "SECRET", "PROTECT", "SHARE", "HIDDEN"],
    guardian: ["PRIVACY", "CONSENT", "PERSONAL", "ANONYMOUS", "DIGITAL"],
  },
};

function generateGrid(words: string[], size: number): { grid: string[][]; placedWords: string[] } {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const placedWords: string[] = [];
  const directions = [
    [0, 1],  // right
    [1, 0],  // down
    [1, 1],  // diagonal
  ];

  for (const word of words) {
    if (word.length > size) continue;
    let placed = false;
    for (let attempt = 0; attempt < 50; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const maxRow = size - (dir[0] === 1 ? word.length : 1);
      const maxCol = size - (dir[1] === 1 ? word.length : 1);
      if (maxRow < 0 || maxCol < 0) continue;
      const startRow = Math.floor(Math.random() * (maxRow + 1));
      const startCol = Math.floor(Math.random() * (maxCol + 1));

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dir[0] * i;
        const c = startCol + dir[1] * i;
        if (grid[r][c] !== "" && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          grid[startRow + dir[0] * i][startCol + dir[1] * i] = word[i];
        }
        placedWords.push(word);
        placed = true;
        break;
      }
    }
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, placedWords };
}

export default function WordSearchGame({ missionId, ageTier, guideImage, guideName, onComplete }: Props) {
  const size = ageTier === "junior" ? 6 : ageTier === "defender" ? 8 : 10;
  const wordList = WORD_LISTS[missionId]?.[ageTier] ?? WORD_LISTS["scam-detection"][ageTier];

  const { grid, placedWords } = useMemo(() => generateGrid(wordList, size), [missionId, ageTier]);

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<string[]>([]);

  const toggleCell = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const next = new Set(selectedCells);
    const nextSelection = [...currentSelection];

    if (next.has(key)) {
      next.delete(key);
      const idx = nextSelection.indexOf(key);
      if (idx > -1) nextSelection.splice(idx, 1);
    } else {
      next.add(key);
      nextSelection.push(key);
    }

    setSelectedCells(next);
    setCurrentSelection(nextSelection);

    // Check if selection forms a word
    const selectedLetters = nextSelection.map((k) => {
      const [row, col] = k.split("-").map(Number);
      return grid[row][col];
    }).join("");

    const reversed = selectedLetters.split("").reverse().join("");

    for (const word of placedWords) {
      if ((selectedLetters === word || reversed === word) && !foundWords.has(word)) {
        setFoundWords((prev) => new Set([...prev, word]));
        setSelectedCells(new Set());
        setCurrentSelection([]);
        break;
      }
    }
  };

  const allFound = foundWords.size >= placedWords.length;

  return (
    <div className="text-center">
      <div className="flex items-center gap-3 mb-4">
        <img src={guideImage} alt={guideName} className="h-12 w-12 object-contain" />
        <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-left">
          <p className="font-semibold text-sm">
            🔤 Find all the hidden cybersecurity words in the grid!
          </p>
        </div>
      </div>

      {/* Words to find */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {placedWords.map((word) => (
          <span
            key={word}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              foundWords.has(word)
                ? "bg-secondary/20 text-secondary line-through"
                : "bg-muted text-foreground"
            }`}
          >
            {word}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        className="inline-grid gap-1 mx-auto mb-4"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = `${r}-${c}`;
            const isSelected = selectedCells.has(key);
            return (
              <motion.button
                key={key}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleCell(r, c)}
                className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg font-bold text-lg transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md scale-105"
                    : "bg-card border-2 border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                {letter}
              </motion.button>
            );
          })
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Found: {foundWords.size}/{placedWords.length} words
      </p>

      {allFound && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="space-y-3">
          <p className="text-lg font-bold text-secondary">🎉 All words found!</p>
          <Button variant="hero" className="w-full py-5 text-base" onClick={() => onComplete(true)}>
            Continue ✨
          </Button>
        </motion.div>
      )}

      {!allFound && foundWords.size > 0 && (
        <Button variant="outline" size="sm" onClick={() => { setSelectedCells(new Set()); setCurrentSelection([]); }}>
          Clear Selection
        </Button>
      )}
    </div>
  );
}
