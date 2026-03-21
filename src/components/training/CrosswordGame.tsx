import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { AgeTier } from "@/data/missions";
import type { CrosswordPuzzle, CrosswordClue } from "@/data/trainingGames";

interface Props {
  puzzle: CrosswordPuzzle;
  ageTier: AgeTier;
  onComplete: (passed: boolean, stars: number) => void;
}

export default function CrosswordGame({ puzzle, ageTier, onComplete }: Props) {
  const [solvedWords, setSolvedWords] = useState<Set<string>>(new Set());
  const [selectedClue, setSelectedClue] = useState<CrosswordClue | null>(null);
  const [letterInputs, setLetterInputs] = useState<string[]>([]);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [showWordBank, setShowWordBank] = useState(ageTier !== "guardian");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const maxFreeHints = ageTier === "junior" ? 999 : ageTier === "defender" ? 3 : 1;

  const getClueText = (clue: CrosswordClue) => {
    if (ageTier === "junior" && clue.juniorClue) return clue.juniorClue;
    if (ageTier === "guardian" && clue.guardianClue) return clue.guardianClue;
    return clue.clue;
  };

  const selectClue = (clue: CrosswordClue) => {
    if (solvedWords.has(clue.answer)) return;
    setSelectedClue(clue);
    setLetterInputs(Array(clue.answer.length).fill(""));
    setWrongFlash(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const handleLetterChange = (index: number, value: string) => {
    if (!selectedClue) return;
    const letter = value.toUpperCase().replace(/[^A-Z]/g, "");

    if (!letter && !value) {
      const newInputs = [...letterInputs];
      newInputs[index] = "";
      setLetterInputs(newInputs);
      if (index > 0) inputRefs.current[index - 1]?.focus();
      return;
    }
    if (!letter) return;

    const newInputs = [...letterInputs];
    newInputs[index] = letter[0];
    setLetterInputs(newInputs);

    if (index < letterInputs.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-check when all filled
    const filled = newInputs.every((l) => l !== "");
    if (filled) {
      const attempt = newInputs.join("");
      if (attempt === selectedClue.answer) {
        setSolvedWords((prev) => new Set([...prev, selectedClue.answer]));
        setSelectedClue(null);
      } else {
        setWrongFlash(true);
        setTimeout(() => {
          setWrongFlash(false);
          setLetterInputs(Array(selectedClue.answer.length).fill(""));
          inputRefs.current[0]?.focus();
        }, 600);
      }
    }
  };

  const useHint = () => {
    if (!selectedClue) return;
    const emptyIdx = letterInputs.findIndex((l) => l === "");
    if (emptyIdx === -1) return;

    const newInputs = [...letterInputs];
    newInputs[emptyIdx] = selectedClue.answer[emptyIdx];
    setLetterInputs(newInputs);
    setHintsUsed((h) => h + 1);

    if (emptyIdx < letterInputs.length - 1) {
      inputRefs.current[emptyIdx + 1]?.focus();
    }

    if (newInputs.every((l) => l !== "") && newInputs.join("") === selectedClue.answer) {
      setSolvedWords((prev) => new Set([...prev, selectedClue.answer]));
      setSelectedClue(null);
    }
  };

  const allSolved = solvedWords.size >= puzzle.clues.length;
  const acrossClues = puzzle.clues.filter((c) => c.direction === "across");
  const downClues = puzzle.clues.filter((c) => c.direction === "down");
  const wordBank = puzzle.clues.map((c) => c.answer).sort();

  if (allSolved) {
    const elapsed = (Date.now() - startTime) / 1000;
    let stars = 1;
    if (ageTier === "junior") {
      stars = 3;
    } else if (ageTier === "defender") {
      stars = elapsed < 180 && hintsUsed <= 1 ? 3 : elapsed < 360 ? 2 : 1;
    } else {
      stars = elapsed < 120 && hintsUsed === 0 ? 3 : elapsed < 240 ? 2 : 1;
    }

    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold">Crossword Complete!</h2>
        <div className="flex justify-center gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-3xl ${s <= stars ? "" : "opacity-20"}`}>⭐</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Solved in {Math.floor(elapsed)}s · {hintsUsed} hints used
        </p>
        <Button variant="hero" className="w-full py-5 text-base" onClick={() => onComplete(true, stars)}>
          Continue ✨
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="text-center">
        <p className="text-sm font-bold text-muted-foreground">
          ✏️ {solvedWords.size}/{puzzle.clues.length} words solved
        </p>
        <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${(solvedWords.size / puzzle.clues.length) * 100}%` }} />
        </div>
      </div>

      {/* Clues */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold text-sm mb-2 text-primary">➡️ ACROSS</h3>
          <div className="space-y-2">
            {acrossClues.map((clue) => (
              <button
                key={`a-${clue.number}`}
                onClick={() => selectClue(clue)}
                disabled={solvedWords.has(clue.answer)}
                className={`w-full text-left rounded-xl border-2 p-3 text-sm transition-all ${
                  solvedWords.has(clue.answer)
                    ? "bg-secondary/10 border-secondary/30 line-through opacity-60"
                    : selectedClue?.number === clue.number && selectedClue?.direction === "across"
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <span className="font-bold">{clue.number}.</span> {getClueText(clue)}
                {solvedWords.has(clue.answer) && <span className="ml-2">✅</span>}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-bold text-sm mb-2 text-accent">⬇️ DOWN</h3>
          <div className="space-y-2">
            {downClues.map((clue) => (
              <button
                key={`d-${clue.number}`}
                onClick={() => selectClue(clue)}
                disabled={solvedWords.has(clue.answer)}
                className={`w-full text-left rounded-xl border-2 p-3 text-sm transition-all ${
                  solvedWords.has(clue.answer)
                    ? "bg-secondary/10 border-secondary/30 line-through opacity-60"
                    : selectedClue?.number === clue.number && selectedClue?.direction === "down"
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <span className="font-bold">{clue.number}.</span> {getClueText(clue)}
                {solvedWords.has(clue.answer) && <span className="ml-2">✅</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected clue input */}
      <AnimatePresence mode="wait">
        {selectedClue && (
          <motion.div
            key={`${selectedClue.number}-${selectedClue.direction}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border-2 border-primary/30 bg-card p-5"
          >
            <p className="text-sm font-bold mb-3">
              {selectedClue.number} {selectedClue.direction.toUpperCase()}: {getClueText(selectedClue)}
            </p>

            <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
              {letterInputs.map((letter, i) => (
                <motion.input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  value={letter}
                  onChange={(e) => handleLetterChange(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !letterInputs[i] && i > 0) {
                      inputRefs.current[i - 1]?.focus();
                    }
                  }}
                  animate={wrongFlash ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                  className={`w-10 h-12 text-center text-lg font-bold rounded-lg border-2 outline-none transition-colors ${
                    wrongFlash
                      ? "border-destructive bg-destructive/10"
                      : letter
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                  } focus:border-primary focus:ring-2 focus:ring-primary/20`}
                />
              ))}
            </div>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={useHint}>
                💡 Hint{" "}
                {hintsUsed >= maxFreeHints && ageTier !== "junior"
                  ? "(-1⭐)"
                  : `(${Math.max(0, maxFreeHints - hintsUsed)} free)`}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedClue(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word Bank */}
      {showWordBank && (
        <div className="rounded-xl border bg-muted/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-muted-foreground">📋 WORD BANK</h4>
            {ageTier === "guardian" && (
              <button onClick={() => setShowWordBank(false)} className="text-xs text-muted-foreground hover:text-foreground">
                Hide
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {wordBank.map((word) => (
              <span
                key={word}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  solvedWords.has(word) ? "bg-secondary/20 text-secondary line-through" : "bg-card border border-border"
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {ageTier === "guardian" && !showWordBank && (
        <button
          onClick={() => {
            setShowWordBank(true);
            setHintsUsed((h) => h + 1);
          }}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Show Word Bank (-1⭐)
        </button>
      )}
    </div>
  );
}
