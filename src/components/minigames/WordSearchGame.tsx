import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

type Coord = { r: number; c: number };

function coordKey(r: number, c: number) {
  return `${r}-${c}`;
}

function getCellsOnLine(start: Coord, end: Coord): Coord[] | null {
  const dr = end.r - start.r;
  const dc = end.c - start.c;
  if (dr === 0 && dc === 0) return [{ r: start.r, c: start.c }];

  const absDr = Math.abs(dr);
  const absDc = Math.abs(dc);

  // Must be horizontal, vertical, or 45° diagonal
  if (absDr !== 0 && absDc !== 0 && absDr !== absDc) return null;

  const steps = Math.max(absDr, absDc);
  const stepR = steps === 0 ? 0 : dr / steps;
  const stepC = steps === 0 ? 0 : dc / steps;

  const cells: Coord[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ r: start.r + stepR * i, c: start.c + stepC * i });
  }
  return cells;
}

interface WordPlacement {
  word: string;
  cells: Coord[];
}

function generateGrid(words: string[], size: number): { grid: string[][]; placements: WordPlacement[] } {
  const grid: string[][] = Array.from({ length: size }, () => Array(size).fill(""));
  const placements: WordPlacement[] = [];
  const directions = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [0, -1],  // left
    [-1, 0],  // up
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1],  // diagonal up-right
  ];

  for (const word of words) {
    if (word.length > size) continue;
    let placed = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const endR = dir[0] * (word.length - 1);
      const endC = dir[1] * (word.length - 1);

      const minR = Math.max(0, -endR);
      const maxR = Math.min(size - 1, size - 1 - endR);
      const minC = Math.max(0, -endC);
      const maxC = Math.min(size - 1, size - 1 - endC);

      if (minR > maxR || minC > maxC) continue;

      const startRow = minR + Math.floor(Math.random() * (maxR - minR + 1));
      const startCol = minC + Math.floor(Math.random() * (maxC - minC + 1));

      let canPlace = true;
      const cells: Coord[] = [];
      for (let i = 0; i < word.length; i++) {
        const r = startRow + dir[0] * i;
        const c = startCol + dir[1] * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { canPlace = false; break; }
        if (grid[r][c] !== "" && grid[r][c] !== word[i]) { canPlace = false; break; }
        cells.push({ r, c });
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          grid[cells[i].r][cells[i].c] = word[i];
        }
        placements.push({ word, cells });
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

  return { grid, placements };
}

export default function WordSearchGame({ missionId, ageTier, guideImage, guideName, onComplete }: Props) {
  const size = ageTier === "junior" ? 6 : ageTier === "defender" ? 8 : 10;
  const wordList = WORD_LISTS[missionId]?.[ageTier] ?? WORD_LISTS["scam-detection"][ageTier];

  const { grid, placements } = useMemo(() => generateGrid(wordList, size), [missionId, ageTier]);

  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [dragStart, setDragStart] = useState<Coord | null>(null);
  const [dragEnd, setDragEnd] = useState<Coord | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [flashWrong, setFlashWrong] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Compute live drag path
  const dragPath = useMemo<Set<string>>(() => {
    if (!dragStart || !dragEnd) return new Set();
    const cells = getCellsOnLine(dragStart, dragEnd);
    if (!cells) return new Set();
    return new Set(cells.map((c) => coordKey(c.r, c.c)));
  }, [dragStart, dragEnd]);

  const handlePointerDown = useCallback((r: number, c: number) => {
    setDragStart({ r, c });
    setDragEnd({ r, c });
    setIsDragging(true);
    setFlashWrong(false);
  }, []);

  const handlePointerEnter = useCallback((r: number, c: number) => {
    if (!isDragging) return;
    setDragEnd({ r, c });
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const cells = getCellsOnLine(dragStart, dragEnd);
    if (cells && cells.length > 1) {
      const selectedLetters = cells.map((c) => grid[c.r][c.c]).join("");
      const reversed = selectedLetters.split("").reverse().join("");

      let matched = false;
      for (const placement of placements) {
        if (foundWords.has(placement.word)) continue;
        if (selectedLetters === placement.word || reversed === placement.word) {
          setFoundWords((prev) => new Set([...prev, placement.word]));
          setFoundCells((prev) => {
            const next = new Set(prev);
            placement.cells.forEach((c) => next.add(coordKey(c.r, c.c)));
            return next;
          });
          matched = true;
          break;
        }
      }

      if (!matched) {
        setFlashWrong(true);
        setTimeout(() => setFlashWrong(false), 400);
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, grid, placements, foundWords]);

  // Touch support: resolve grid cell from touch point
  const getCellFromTouch = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch || !gridRef.current) return null;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return null;
    const r = el.getAttribute("data-row");
    const c = el.getAttribute("data-col");
    if (r === null || c === null) return null;
    return { r: parseInt(r), c: parseInt(c) };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const cell = getCellFromTouch(e);
    if (cell) setDragEnd(cell);
  }, [isDragging, getCellFromTouch]);

  const allFound = foundWords.size >= placements.length && placements.length > 0;

  const tileSize = ageTier === "junior"
    ? "h-12 w-12 text-xl md:h-14 md:w-14"
    : ageTier === "defender"
      ? "h-10 w-10 text-lg md:h-12 md:w-12"
      : "h-9 w-9 text-base md:h-10 md:w-10";

  return (
    <div className="text-center select-none" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      {/* Guide */}
      <div className="flex items-center gap-3 mb-4">
        <img src={guideImage} alt={guideName} className="h-14 w-14 object-contain drop-shadow-md" />
        <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-left">
          <p className="font-semibold text-sm">
            🔤 Drag across letters to find the hidden words!
          </p>
        </div>
      </div>

      {/* Word chips */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {placements.map(({ word }) => (
          <span
            key={word}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
              foundWords.has(word)
                ? "bg-secondary text-secondary-foreground line-through opacity-70 scale-95"
                : "bg-accent/20 text-accent-foreground border-2 border-accent/40"
            }`}
          >
            {foundWords.has(word) ? "✅ " : ""}{word}
          </span>
        ))}
      </div>

      {/* Progress */}
      <p className="text-sm font-bold text-muted-foreground mb-3">
        Found {foundWords.size}/{placements.length} words
      </p>

      {/* Grid */}
      <div
        ref={gridRef}
        className="inline-grid gap-1 mx-auto mb-4 touch-none"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        onTouchMove={handleTouchMove}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = coordKey(r, c);
            const isFound = foundCells.has(key);
            const isDragSelected = dragPath.has(key);
            const isWrongFlash = flashWrong && isDragSelected;

            let cellClass = "bg-card border-2 border-border";
            if (isFound) {
              cellClass = "bg-secondary text-secondary-foreground border-2 border-secondary shadow-md";
            } else if (isWrongFlash) {
              cellClass = "bg-destructive/30 border-2 border-destructive";
            } else if (isDragSelected) {
              cellClass = "bg-primary text-primary-foreground border-2 border-primary shadow-lg scale-110";
            }

            return (
              <motion.div
                key={key}
                data-row={r}
                data-col={c}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(r, c);
                }}
                onPointerEnter={() => handlePointerEnter(r, c)}
                className={`flex items-center justify-center rounded-xl font-bold cursor-pointer transition-all duration-150 ${tileSize} ${cellClass}`}
              >
                {letter}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Completion */}
      <AnimatePresence>
        {allFound && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-3 mt-2"
          >
            <div className="flex items-center justify-center gap-2">
              <img src={guideImage} alt={guideName} className="h-10 w-10 object-contain" />
              <p className="text-lg font-bold text-secondary">🎉 All words found! Great job!</p>
            </div>
            <Button variant="hero" className="w-full py-5 text-base" onClick={() => onComplete(true)}>
              Continue ✨
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
