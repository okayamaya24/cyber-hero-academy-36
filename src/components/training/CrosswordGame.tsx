import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { AgeTier } from "@/data/missions";
import type { CrosswordPuzzle, CrosswordClue } from "@/data/trainingGames";

/* ─── Types ──────────────────────────────────────────── */

interface GridCell {
  isBlack: boolean;
  correctLetter?: string;
  number?: number;
  acrossClueNum?: number;
  downClueNum?: number;
}

interface PlacedWord {
  clue: CrosswordClue;
  startRow: number;
  startCol: number;
}

/* ─── Grid Generation ────────────────────────────────── */

function generateCrosswordGrid(clues: CrosswordClue[]) {
  const occupiedCells = new Map<string, string>();
  const placed: PlacedWord[] = [];
  const k = (r: number, c: number) => `${r},${c}`;

  const canPlace = (word: string, dir: "across" | "down", sr: number, sc: number): boolean => {
    for (let i = 0; i < word.length; i++) {
      const r = dir === "across" ? sr : sr + i;
      const c = dir === "across" ? sc + i : sc;
      const existing = occupiedCells.get(k(r, c));
      if (existing) {
        if (existing !== word[i]) return false;
      } else {
        // Check perpendicular neighbors to avoid parallel adjacency
        if (dir === "across") {
          if (occupiedCells.has(k(r - 1, c)) || occupiedCells.has(k(r + 1, c))) return false;
        } else {
          if (occupiedCells.has(k(r, c - 1)) || occupiedCells.has(k(r, c + 1))) return false;
        }
      }
    }
    // Check before/after endpoints
    if (dir === "across") {
      if (occupiedCells.has(k(sr, sc - 1)) || occupiedCells.has(k(sr, sc + word.length))) return false;
    } else {
      if (occupiedCells.has(k(sr - 1, sc)) || occupiedCells.has(k(sr + word.length, sc))) return false;
    }
    return true;
  };

  const placeWord = (word: string, dir: "across" | "down", sr: number, sc: number) => {
    for (let i = 0; i < word.length; i++) {
      const r = dir === "across" ? sr : sr + i;
      const c = dir === "across" ? sc + i : sc;
      occupiedCells.set(k(r, c), word[i]);
    }
  };

  // Sort: across first (longest first), then down (longest first)
  const acrossClues = clues.filter((c) => c.direction === "across").sort((a, b) => b.answer.length - a.answer.length);
  const downClues = clues.filter((c) => c.direction === "down").sort((a, b) => b.answer.length - a.answer.length);

  // Interleave for better placement
  const sorted: CrosswordClue[] = [];
  const maxLen = Math.max(acrossClues.length, downClues.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < acrossClues.length) sorted.push(acrossClues[i]);
    if (i < downClues.length) sorted.push(downClues[i]);
  }

  const CENTER = 20;

  for (let wi = 0; wi < sorted.length; wi++) {
    const clue = sorted[wi];
    const word = clue.answer;

    if (placed.length === 0) {
      const sr = CENTER;
      const sc = CENTER;
      placeWord(word, clue.direction, sr, sc);
      placed.push({ clue, startRow: sr, startCol: sc });
      continue;
    }

    let wasPlaced = false;

    // Try intersections with placed words
    for (const p of placed) {
      if (p.clue.direction === clue.direction) continue;
      for (let pi = 0; pi < p.clue.answer.length; pi++) {
        for (let wi2 = 0; wi2 < word.length; wi2++) {
          if (p.clue.answer[pi] !== word[wi2]) continue;
          const pr = p.clue.direction === "across" ? p.startRow : p.startRow + pi;
          const pc = p.clue.direction === "across" ? p.startCol + pi : p.startCol;
          const sr = clue.direction === "across" ? pr : pr - wi2;
          const sc = clue.direction === "across" ? pc - wi2 : pc;
          if (canPlace(word, clue.direction, sr, sc)) {
            placeWord(word, clue.direction, sr, sc);
            placed.push({ clue, startRow: sr, startCol: sc });
            wasPlaced = true;
            break;
          }
        }
        if (wasPlaced) break;
      }
      if (wasPlaced) break;
    }

    if (!wasPlaced) {
      // Fallback: place offset
      let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
      Array.from(occupiedCells.entries()).forEach(([key]) => {
        const [r, c] = key.split(",").map(Number);
        minR = Math.min(minR, r); maxR = Math.max(maxR, r);
        minC = Math.min(minC, c); maxC = Math.max(maxC, c);
      });
      if (clue.direction === "across") {
        placeWord(word, clue.direction, maxR + 2, minC);
        placed.push({ clue, startRow: maxR + 2, startCol: minC });
      } else {
        placeWord(word, clue.direction, minR, maxC + 2);
        placed.push({ clue, startRow: minR, startCol: maxC + 2 });
      }
    }
  }

  // Calculate bounds
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  Array.from(occupiedCells.entries()).forEach(([key]) => {
    const [r, c] = key.split(",").map(Number);
    minR = Math.min(minR, r); maxR = Math.max(maxR, r);
    minC = Math.min(minC, c); maxC = Math.max(maxC, c);
  });

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  const grid: GridCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ isBlack: true }))
  );

  for (const [key, letter] of occupiedCells) {
    const [r, c] = key.split(",").map(Number);
    grid[r - minR][c - minC] = { isBlack: false, correctLetter: letter };
  }

  // Renumber cells sequentially top-to-bottom, left-to-right
  const normalizedPlaced = placed.map((p) => ({
    ...p,
    startRow: p.startRow - minR,
    startCol: p.startCol - minC,
  }));

  // Assign sequential numbers
  const startCells = new Map<string, number>();
  let nextNum = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isStart = normalizedPlaced.some((p) => p.startRow === r && p.startCol === c);
      if (isStart) {
        const key = `${r},${c}`;
        if (!startCells.has(key)) {
          startCells.set(key, nextNum);
          grid[r][c].number = nextNum;

          // Update clue numbers for all words starting here
          const wordsHere = normalizedPlaced.filter((p) => p.startRow === r && p.startCol === c);
          for (const w of wordsHere) {
            w.clue = { ...w.clue, number: nextNum };
          }
          nextNum++;
        }
      }
    }
  }

  // Mark across/down clue ownership
  for (const p of normalizedPlaced) {
    for (let i = 0; i < p.clue.answer.length; i++) {
      const r = p.clue.direction === "across" ? p.startRow : p.startRow + i;
      const c = p.clue.direction === "across" ? p.startCol + i : p.startCol;
      if (p.clue.direction === "across") grid[r][c].acrossClueNum = p.clue.number;
      else grid[r][c].downClueNum = p.clue.number;
    }
  }

  // Build renumbered clues
  const renumberedClues = normalizedPlaced.map((p) => p.clue);

  return { grid, rows, cols, placed: normalizedPlaced, clues: renumberedClues };
}

/* ─── Component ──────────────────────────────────────── */

interface Props {
  puzzle: CrosswordPuzzle;
  ageTier: AgeTier;
  onComplete: (passed: boolean, stars: number) => void;
}

export default function CrosswordGame({ puzzle, ageTier, onComplete }: Props) {
  const generated = useMemo(() => generateCrosswordGrid(puzzle.clues), [puzzle.clues]);
  const { grid, rows, cols, placed, clues: renumberedClues } = generated;

  const [playerLetters, setPlayerLetters] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<"across" | "down">("across");
  const [solvedClueIds, setSolvedClueIds] = useState<Set<string>>(new Set());
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [showWordBank, setShowWordBank] = useState(ageTier !== "guardian");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  const maxFreeHints = ageTier === "junior" ? 999 : ageTier === "defender" ? 3 : 1;

  const ck = (r: number, c: number) => `${r},${c}`;

  const acrossClues = renumberedClues.filter((c) => c.direction === "across").sort((a, b) => a.number - b.number);
  const downClues = renumberedClues.filter((c) => c.direction === "down").sort((a, b) => a.number - b.number);
  const allClues = [...acrossClues, ...downClues];

  const getClueText = (clue: CrosswordClue) => {
    if (ageTier === "junior" && clue.juniorClue) return clue.juniorClue;
    if (ageTier === "guardian" && clue.guardianClue) return clue.guardianClue;
    return clue.clue;
  };

  // Get cells for a clue
  const getClueCells = useCallback(
    (clue: CrosswordClue): { row: number; col: number }[] => {
      const p = placed.find((pw) => pw.clue.number === clue.number && pw.clue.direction === clue.direction);
      if (!p) return [];
      return Array.from({ length: clue.answer.length }, (_, i) => ({
        row: clue.direction === "across" ? p.startRow : p.startRow + i,
        col: clue.direction === "across" ? p.startCol + i : p.startCol,
      }));
    },
    [placed]
  );

  // Get active clue based on selected cell + direction
  const activeClue = useMemo(() => {
    if (!selectedCell) return null;
    const cell = grid[selectedCell.row]?.[selectedCell.col];
    if (!cell || cell.isBlack) return null;
    const clueNum = activeDirection === "across" ? cell.acrossClueNum : cell.downClueNum;
    if (clueNum != null) {
      return renumberedClues.find((c) => c.number === clueNum && c.direction === activeDirection) || null;
    }
    // Fallback to other direction
    const altNum = activeDirection === "across" ? cell.downClueNum : cell.acrossClueNum;
    const altDir = activeDirection === "across" ? "down" : "across";
    if (altNum != null) {
      return renumberedClues.find((c) => c.number === altNum && c.direction === altDir) || null;
    }
    return null;
  }, [selectedCell, activeDirection, grid, renumberedClues]);

  // Highlighted cells
  const highlightedCells = useMemo(() => {
    if (!activeClue) return new Set<string>();
    return new Set(getClueCells(activeClue).map((c) => ck(c.row, c.col)));
  }, [activeClue, getClueCells]);

  // Check completion
  const checkCompletion = useCallback(
    (letters: Record<string, string>) => {
      const newSolved = new Set<string>();
      for (const clue of renumberedClues) {
        const cells = getClueCells(clue);
        if (cells.length === 0) continue;
        const playerWord = cells.map((c) => letters[ck(c.row, c.col)] || "").join("");
        if (playerWord === clue.answer) {
          newSolved.add(`${clue.direction}-${clue.number}`);
        }
      }
      setSolvedClueIds(newSolved);
      return newSolved;
    },
    [renumberedClues, getClueCells]
  );

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    const cell = grid[row]?.[col];
    if (!cell || cell.isBlack) return;

    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction
      const newDir = activeDirection === "across" ? "down" : "across";
      const clueNum = newDir === "across" ? cell.acrossClueNum : cell.downClueNum;
      if (clueNum != null) {
        setActiveDirection(newDir);
      }
    } else {
      setSelectedCell({ row, col });
      // Choose direction based on available clues
      if (cell.acrossClueNum != null && activeDirection === "across") {
        setActiveDirection("across");
      } else if (cell.downClueNum != null && activeDirection === "down") {
        setActiveDirection("down");
      } else if (cell.acrossClueNum != null) {
        setActiveDirection("across");
      } else if (cell.downClueNum != null) {
        setActiveDirection("down");
      }
    }
    containerRef.current?.focus();
  };

  // Handle clue click
  const handleClueClick = (clue: CrosswordClue) => {
    const cells = getClueCells(clue);
    if (cells.length === 0) return;
    // Find first empty cell, or first cell
    const firstEmpty = cells.find((c) => !playerLetters[ck(c.row, c.col)]);
    const target = firstEmpty || cells[0];
    setSelectedCell(target);
    setActiveDirection(clue.direction);
    containerRef.current?.focus();
  };

  // Advance cursor
  const advanceCursor = useCallback(
    (row: number, col: number, dir: "across" | "down", forward: boolean) => {
      const dr = dir === "down" ? (forward ? 1 : -1) : 0;
      const dc = dir === "across" ? (forward ? 1 : -1) : 0;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !grid[nr][nc].isBlack) {
        setSelectedCell({ row: nr, col: nc });
      }
    },
    [rows, cols, grid]
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;

      if (e.key === "Backspace") {
        e.preventDefault();
        const key = ck(row, col);
        if (playerLetters[key]) {
          const newLetters = { ...playerLetters };
          delete newLetters[key];
          setPlayerLetters(newLetters);
          setWrongCells((prev) => { const n = new Set(prev); n.delete(key); return n; });
          checkCompletion(newLetters);
        } else {
          advanceCursor(row, col, activeDirection, false);
        }
        return;
      }

      if (e.key === "ArrowRight") { e.preventDefault(); advanceCursor(row, col, "across", true); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); advanceCursor(row, col, "across", false); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); advanceCursor(row, col, "down", true); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); advanceCursor(row, col, "down", false); return; }

      if (e.key === "Tab") {
        e.preventDefault();
        setActiveDirection((d) => (d === "across" ? "down" : "across"));
        return;
      }

      const letter = e.key.toUpperCase();
      if (!/^[A-Z]$/.test(letter)) return;
      e.preventDefault();

      const key = ck(row, col);
      const cell = grid[row][col];
      const isCorrect = cell.correctLetter === letter;

      const newLetters = { ...playerLetters, [key]: letter };
      setPlayerLetters(newLetters);

      if (!isCorrect) {
        setWrongCells((prev) => new Set([...prev, key]));
        setTimeout(() => {
          setWrongCells((prev) => { const n = new Set(prev); n.delete(key); return n; });
        }, 500);
      } else {
        setWrongCells((prev) => { const n = new Set(prev); n.delete(key); return n; });
      }

      checkCompletion(newLetters);
      advanceCursor(row, col, activeDirection, true);
    },
    [selectedCell, playerLetters, activeDirection, grid, advanceCursor, checkCompletion]
  );

  // Hint
  const useHint = () => {
    if (!activeClue || !selectedCell) return;
    const cells = getClueCells(activeClue);
    const emptyCell = cells.find((c) => !playerLetters[ck(c.row, c.col)] || playerLetters[ck(c.row, c.col)] !== grid[c.row][c.col].correctLetter);
    if (!emptyCell) return;

    const key = ck(emptyCell.row, emptyCell.col);
    const newLetters = { ...playerLetters, [key]: grid[emptyCell.row][emptyCell.col].correctLetter! };
    setPlayerLetters(newLetters);
    setHintsUsed((h) => h + 1);
    checkCompletion(newLetters);
    setSelectedCell(emptyCell);
    containerRef.current?.focus();
  };

  // Word bank words
  const wordBank = useMemo(() => {
    const words = new Set<string>();
    renumberedClues.forEach((c) => words.add(c.answer));
    return Array.from(words).sort();
  }, [renumberedClues]);

  const solvedWords = useMemo(() => {
    const solved = new Set<string>();
    for (const clue of renumberedClues) {
      if (solvedClueIds.has(`${clue.direction}-${clue.number}`)) {
        solved.add(clue.answer);
      }
    }
    return solved;
  }, [solvedClueIds, renumberedClues]);

  const totalClues = renumberedClues.length;
  const solvedCount = solvedClueIds.size;
  const allSolved = solvedCount >= totalClues;

  // Solved cells for green coloring — must be before any early return
  const solvedCellKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const clue of renumberedClues) {
      if (solvedClueIds.has(`${clue.direction}-${clue.number}`)) {
        getClueCells(clue).forEach((c) => keys.add(ck(c.row, c.col)));
      }
    }
    return keys;
  }, [solvedClueIds, renumberedClues, getClueCells]);

  const cellSize = cols > 12 ? 28 : cols > 9 ? 32 : 36;

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
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4 p-6">
        <div className="text-5xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold text-foreground">Crossword Complete!</h2>
        <div className="flex justify-center gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-3xl ${s <= stars ? "" : "opacity-20"}`}>⭐</span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Solved in {Math.floor(elapsed)}s · {hintsUsed} hints used
        </p>
        <Button variant="default" className="w-full py-5 text-base" onClick={() => onComplete(true, stars)}>
          Continue ✨
        </Button>
      </motion.div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none p-4 space-y-4"
    >
      {/* Progress */}
      <div className="text-center">
        <p className="text-sm font-bold text-muted-foreground">
          ✏️ {solvedCount}/{totalClues} words solved
        </p>
        <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${(solvedCount / totalClues) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Grid */}
        <div className="flex-shrink-0">
          <div
            className="mx-auto rounded-xl p-3 border border-[hsl(210_40%_25%)] bg-[hsl(210_40%_8%)] shadow-lg"
            style={{ width: "fit-content" }}
          >
            <div
              className="grid gap-0"
              style={{
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
              }}
            >
              {grid.map((row, ri) =>
                row.map((cell, ci) => {
                  if (cell.isBlack) {
                    return (
                      <div
                        key={ck(ri, ci)}
                        className="bg-[hsl(210_40%_8%)]"
                        style={{ width: cellSize, height: cellSize }}
                      />
                    );
                  }

                  const key = ck(ri, ci);
                  const isSelected = selectedCell?.row === ri && selectedCell?.col === ci;
                  const isHighlighted = highlightedCells.has(key);
                  const isSolved = solvedCellKeys.has(key);
                  const isWrong = wrongCells.has(key);
                  const playerLetter = playerLetters[key] || "";

                  let bgColor = "bg-white/90";
                  if (isWrong) bgColor = "bg-red-400/40";
                  else if (isSelected) bgColor = "bg-[hsl(195_90%_75%)]";
                  else if (isSolved) bgColor = "bg-[hsl(160_65%_60%/0.3)]";
                  else if (isHighlighted) bgColor = "bg-[hsl(195_80%_90%)]";

                  return (
                    <motion.div
                      key={key}
                      onClick={() => handleCellClick(ri, ci)}
                      animate={isWrong ? { x: [0, -3, 3, -3, 3, 0] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`relative cursor-pointer border border-[hsl(210_40%_25%)] ${bgColor} transition-colors duration-150`}
                      style={{ width: cellSize, height: cellSize }}
                    >
                      {cell.number != null && (
                        <span
                          className="absolute text-[hsl(210_20%_25%)] font-bold select-none"
                          style={{ top: 1, left: 2, fontSize: cellSize < 32 ? 7 : 8, lineHeight: 1 }}
                        >
                          {cell.number}
                        </span>
                      )}
                      <span
                        className="absolute inset-0 flex items-center justify-center font-bold font-mono uppercase text-[hsl(210_20%_15%)] select-none"
                        style={{ fontSize: cellSize < 32 ? 14 : 16 }}
                      >
                        {playerLetter}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Clues Panel */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="font-bold text-sm mb-2 text-primary">➡️ ACROSS</h3>
            <div className="space-y-1.5">
              {acrossClues.map((clue) => {
                const id = `${clue.direction}-${clue.number}`;
                const isSolved = solvedClueIds.has(id);
                const isActive = activeClue?.number === clue.number && activeClue?.direction === "across";
                return (
                  <button
                    key={id}
                    onClick={() => handleClueClick(clue)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-all border ${
                      isSolved
                        ? "bg-[hsl(160_65%_30%/0.15)] border-[hsl(160_65%_50%/0.2)] line-through opacity-60 text-muted-foreground"
                        : isActive
                          ? "bg-primary/10 border-primary/30 text-foreground"
                          : "bg-card/50 border-border/50 text-foreground/80 hover:border-primary/30"
                    }`}
                  >
                    <span className="font-bold">{clue.number}.</span> {getClueText(clue)}
                    {isSolved && <span className="ml-1">✅</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm mb-2 text-accent">⬇️ DOWN</h3>
            <div className="space-y-1.5">
              {downClues.map((clue) => {
                const id = `${clue.direction}-${clue.number}`;
                const isSolved = solvedClueIds.has(id);
                const isActive = activeClue?.number === clue.number && activeClue?.direction === "down";
                return (
                  <button
                    key={id}
                    onClick={() => handleClueClick(clue)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-all border ${
                      isSolved
                        ? "bg-[hsl(160_65%_30%/0.15)] border-[hsl(160_65%_50%/0.2)] line-through opacity-60 text-muted-foreground"
                        : isActive
                          ? "bg-primary/10 border-primary/30 text-foreground"
                          : "bg-card/50 border-border/50 text-foreground/80 hover:border-primary/30"
                    }`}
                  >
                    <span className="font-bold">{clue.number}.</span> {getClueText(clue)}
                    {isSolved && <span className="ml-1">✅</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hint button */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={useHint} disabled={!activeClue}>
              💡 Hint{" "}
              {hintsUsed >= maxFreeHints && ageTier !== "junior"
                ? "(-1⭐)"
                : `(${Math.max(0, maxFreeHints - hintsUsed)} free)`}
            </Button>
          </div>
        </div>
      </div>

      {/* Word Bank */}
      {showWordBank && (
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
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
                className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                  solvedWords.has(word)
                    ? "bg-[hsl(160_65%_30%/0.2)] text-[hsl(160_65%_60%)] line-through"
                    : "bg-card border border-border text-foreground/80"
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
