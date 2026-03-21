import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { AgeTier } from "@/data/missions";

interface Props {
  missionId?: string;
  ageTier: AgeTier;
  guideImage: string;
  guideName: string;
  onComplete: (correct: boolean) => void;
  customWords?: string[];
  customGridSize?: number;
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

const HIGHLIGHT_COLORS = [
  { bg: "bg-green-400/50", border: "border-green-500", text: "text-green-900", chip: "bg-green-400/30 text-green-800 border-green-400" },
  { bg: "bg-blue-400/50", border: "border-blue-500", text: "text-blue-900", chip: "bg-blue-400/30 text-blue-800 border-blue-400" },
  { bg: "bg-purple-400/50", border: "border-purple-500", text: "text-purple-900", chip: "bg-purple-400/30 text-purple-800 border-purple-400" },
  { bg: "bg-orange-400/50", border: "border-orange-500", text: "text-orange-900", chip: "bg-orange-400/30 text-orange-800 border-orange-400" },
  { bg: "bg-pink-400/50", border: "border-pink-500", text: "text-pink-900", chip: "bg-pink-400/30 text-pink-800 border-pink-400" },
];

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
    [0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1],
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
  const size = ageTier === "junior" ? 7 : ageTier === "defender" ? 9 : 11;
  const wordList = WORD_LISTS[missionId]?.[ageTier] ?? WORD_LISTS["scam-detection"][ageTier];

  const { grid, placements } = useMemo(() => generateGrid(wordList, size), [missionId, ageTier]);

  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCellColors, setFoundCellColors] = useState<Map<string, number>>(new Map());
  const [dragStart, setDragStart] = useState<Coord | null>(null);
  const [dragEnd, setDragEnd] = useState<Coord | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [flashWrong, setFlashWrong] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const foundWordsSet = useMemo(() => new Set(foundWords), [foundWords]);

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
        if (foundWordsSet.has(placement.word)) continue;
        if (selectedLetters === placement.word || reversed === placement.word) {
          const colorIndex = foundWords.length % HIGHLIGHT_COLORS.length;
          setFoundWords((prev) => [...prev, placement.word]);
          setFoundCellColors((prev) => {
            const next = new Map(prev);
            placement.cells.forEach((c) => next.set(coordKey(c.r, c.c), colorIndex));
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
  }, [isDragging, dragStart, dragEnd, grid, placements, foundWordsSet, foundWords.length]);

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

  const allFound = foundWords.length >= placements.length && placements.length > 0;

  // Larger tiles
  const tileSize = ageTier === "junior"
    ? "h-14 w-14 text-xl md:h-16 md:w-16 md:text-2xl"
    : ageTier === "defender"
      ? "h-12 w-12 text-lg md:h-14 md:w-14 md:text-xl"
      : "h-11 w-11 text-base md:h-12 md:w-12 md:text-lg";

  return (
    <div className="text-center select-none" onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      {/* Guide bubble */}
      <div className="flex items-center gap-3 mb-5">
        <img src={guideImage} alt={guideName} className="h-14 w-14 object-contain drop-shadow-md" />
        <div className="rounded-2xl rounded-bl-sm bg-muted px-5 py-3 text-left">
          <p className="font-semibold text-base">
            🔤 Drag across letters to find the hidden words!
          </p>
        </div>
      </div>

      {/* Word chips — larger */}
      <div className="flex flex-wrap gap-2.5 justify-center mb-5">
        {placements.map(({ word }) => {
          const foundIndex = foundWords.indexOf(word);
          const isFound = foundIndex !== -1;
          const colorStyle = isFound ? HIGHLIGHT_COLORS[foundIndex % HIGHLIGHT_COLORS.length] : null;

          return (
            <span
              key={word}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 border-2 ${
                isFound
                  ? `${colorStyle!.chip} line-through scale-95`
                  : "bg-accent/20 text-accent-foreground border-accent/40"
              }`}
            >
              {isFound ? "✅ " : ""}{word}
            </span>
          );
        })}
      </div>

      {/* Progress */}
      <p className="text-base font-bold text-muted-foreground mb-4">
        Found {foundWords.length}/{placements.length} words
      </p>

      {/* Grid — larger */}
      <div
        ref={gridRef}
        className="inline-grid gap-1.5 mx-auto mb-5 touch-none"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        onTouchMove={handleTouchMove}
      >
        {grid.map((row, r) =>
          row.map((letter, c) => {
            const key = coordKey(r, c);
            const colorIndex = foundCellColors.get(key);
            const isFound = colorIndex !== undefined;
            const isDragSelected = dragPath.has(key);
            const isWrongFlash = flashWrong && isDragSelected;

            let cellClass = "bg-card border-2 border-border";
            if (isFound) {
              const color = HIGHLIGHT_COLORS[colorIndex % HIGHLIGHT_COLORS.length];
              cellClass = `${color.bg} ${color.text} ${color.border} border-2 shadow-md font-black`;
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
            className="space-y-3 mt-3"
          >
            <div className="flex items-center justify-center gap-2">
              <img src={guideImage} alt={guideName} className="h-12 w-12 object-contain" />
              <p className="text-xl font-bold text-secondary">🎉 All words found! Great job!</p>
            </div>
            <Button variant="hero" className="w-full py-6 text-lg" onClick={() => onComplete(true)}>
              Continue ✨
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
