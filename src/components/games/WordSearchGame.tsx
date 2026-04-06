import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AgeTier } from '@/components/games/GameShell';

interface WordSearchGameProps {
  ageTier: AgeTier;
  words: string[];
  title: string;
  onComplete: (score: number, maxScore: number) => void;
}

type Direction = [number, number];
const DIRECTIONS: Direction[] = [[0,1],[1,0],[0,-1],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
const H_V_ONLY: Direction[] = [[0,1],[1,0],[0,-1],[-1,0]];

const GRID_CONFIG = {
  junior: { size: 8,  wordsToFind: 6,  directions: H_V_ONLY, timeSeconds: 180 },
  hero:   { size: 10, wordsToFind: 8,  directions: DIRECTIONS, timeSeconds: 120 },
  elite:  { size: 12, wordsToFind: 10, directions: DIRECTIONS, timeSeconds: 90  },
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function randomLetter() { return LETTERS[Math.floor(Math.random() * LETTERS.length)]; }

interface Cell { letter: string; wordIds: number[] }

function generateGrid(words: string[], size: number, directions: Direction[]): { grid: Cell[][], placed: string[] } {
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ letter: '.', wordIds: [] }))
  );
  const placed: string[] = [];

  for (let wi = 0; wi < words.length; wi++) {
    const word = words[wi].toUpperCase();
    let success = false;
    for (let attempt = 0; attempt < 100 && !success; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const maxRow = dir[0] >= 0 ? size - word.length * Math.max(0, dir[0]) : size;
      const maxCol = dir[1] >= 0 ? size - word.length * Math.max(0, dir[1]) : size;
      const minRow = dir[0] < 0 ? word.length * Math.abs(dir[0]) - 1 : 0;
      const minCol = dir[1] < 0 ? word.length * Math.abs(dir[1]) - 1 : 0;
      if (maxRow <= minRow || maxCol <= minCol) continue;
      const startRow = minRow + Math.floor(Math.random() * (maxRow - minRow));
      const startCol = minCol + Math.floor(Math.random() * (maxCol - minCol));

      let valid = true;
      for (let ci = 0; ci < word.length && valid; ci++) {
        const r = startRow + ci * dir[0], c = startCol + ci * dir[1];
        if (r < 0 || r >= size || c < 0 || c >= size) { valid = false; break; }
        if (grid[r][c].letter !== '.' && grid[r][c].letter !== word[ci]) valid = false;
      }
      if (valid) {
        for (let ci = 0; ci < word.length; ci++) {
          const r = startRow + ci * dir[0], c = startCol + ci * dir[1];
          grid[r][c] = { letter: word[ci], wordIds: [...grid[r][c].wordIds, wi] };
        }
        placed.push(word);
        success = true;
      }
    }
    if (!success) placed.push('');
  }

  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (grid[r][c].letter === '.') grid[r][c] = { letter: randomLetter(), wordIds: [] };

  return { grid, placed };
}

function getCellKey(r: number, c: number) { return `${r}-${c}`; }

export default function WordSearchGame({ ageTier, words, title, onComplete }: WordSearchGameProps) {
  const config = GRID_CONFIG[ageTier];
  const wordsToUse = words.slice(0, config.wordsToFind);

  const [{ grid, placed }] = useState(() => generateGrid(wordsToUse, config.size, config.directions));
  const [foundWords, setFoundWords] = useState(new Set<string>());
  const [foundCells, setFoundCells] = useState(new Set<string>());
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<{ row: number; col: number }[]>([]);
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(config.timeSeconds);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [wrongFlash, setWrongFlash] = useState(false);

  const validWords = placed.filter(w => w.length > 0);
  // Sort word list alphabetically for bottom display
  const sortedWords = [...validWords].sort();

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) { clearInterval(t); setPhase('done'); return 0; }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') {
      const score = Math.round((foundWords.size / validWords.length) * 200 + (timeLeft / config.timeSeconds) * 50);
      onComplete(score, 250);
    }
  }, [phase]);

  useEffect(() => {
    if (foundWords.size === validWords.length && validWords.length > 0)
      setTimeout(() => setPhase('done'), 500);
  }, [foundWords, validWords]);

  const getLineCells = useCallback((start: { row: number; col: number }, end: { row: number; col: number }) => {
    const dr = end.row - start.row, dc = end.col - start.col;
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    if (len === 0) return [start];
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
    const isDiag = Math.abs(dr) === Math.abs(dc);
    if (!isDiag && dr !== 0 && dc !== 0) {
      return Math.abs(dr) > Math.abs(dc)
        ? Array.from({ length: Math.abs(dr) + 1 }, (_, i) => ({ row: start.row + i * stepR, col: start.col }))
        : Array.from({ length: Math.abs(dc) + 1 }, (_, i) => ({ row: start.row, col: start.col + i * stepC }));
    }
    return Array.from({ length: len + 1 }, (_, i) => ({ row: start.row + i * stepR, col: start.col + i * stepC }));
  }, []);

  const checkSelection = useCallback((cells: { row: number; col: number }[]) => {
    const word = cells.map(c => grid[c.row][c.col].letter).join('');
    const wordRev = word.split('').reverse().join('');
    const match = validWords.find(w => w === word || w === wordRev);
    if (match && !foundWords.has(match)) {
      const nf = new Set(foundWords); nf.add(match); setFoundWords(nf);
      const nc = new Set(foundCells); cells.forEach(c => nc.add(getCellKey(c.row, c.col))); setFoundCells(nc);
    } else {
      setWrongFlash(true); setTimeout(() => setWrongFlash(false), 400);
    }
  }, [grid, validWords, foundWords, foundCells]);

  const handleCellStart = (r: number, c: number) => {
    if (phase !== 'playing') return;
    setSelecting(true); setStartCell({ row: r, col: c }); setSelected([{ row: r, col: c }]);
  };
  const handleCellEnter = (r: number, c: number) => {
    if (!selecting || !startCell) return;
    setSelected(getLineCells(startCell, { row: r, col: c }));
  };
  const handleCellEnd = () => {
    if (!selecting || selected.length < 2) { setSelecting(false); setSelected([]); setStartCell(null); return; }
    checkSelection(selected); setSelecting(false); setSelected([]); setStartCell(null);
  };

  const timerPct = (timeLeft / config.timeSeconds) * 100;

  // Responsive cell size — fill available width
  const cellSize = config.size <= 8 ? 'w-10 h-10 text-sm' : config.size <= 10 ? 'w-9 h-9 text-xs' : 'w-7 h-7 text-[11px]';

  // Columns for word list (3 for ≤9 words, 4 for 10+)
  const wordCols = validWords.length <= 6 ? 2 : validWords.length <= 9 ? 3 : 4;

  return (
    <div
      className="flex flex-col h-full bg-[#0a0e1a] select-none overflow-hidden"
      onMouseUp={handleCellEnd}
      onTouchEnd={handleCellEnd}
    >
      {/* ── HUD ── */}
      <div className="px-4 py-2 bg-[#0d1220] border-b border-cyan-500/20 shrink-0">
        <div className="flex justify-between items-center text-sm mb-1.5">
          <span className="text-white font-bold">{title}</span>
          <span className={`font-bold tabular-nums ${timerPct > 50 ? 'text-cyan-400' : timerPct > 25 ? 'text-yellow-400' : 'text-red-400'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${timerPct}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded-full ${timerPct > 50 ? 'bg-cyan-500' : timerPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">Found: {foundWords.size}/{validWords.length}</div>
      </div>

      {/* ── Grid (centered, takes available space) ── */}
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden min-h-0">
        <div
          className={`inline-grid border-2 border-white/10 rounded-xl overflow-hidden shadow-lg ${wrongFlash ? 'ring-2 ring-red-500' : ''}`}
          style={{ gridTemplateColumns: `repeat(${config.size}, 1fr)` }}
          onMouseLeave={() => {
            if (selecting) { checkSelection(selected); setSelecting(false); setSelected([]); setStartCell(null); }
          }}
        >
          {grid.map((row, r) => row.map((cell, c) => {
            const key = getCellKey(r, c);
            const isFound = foundCells.has(key);
            const isSel = selected.some(s => s.row === r && s.col === c);
            return (
              <div
                key={key}
                data-row={r} data-col={c}
                className={`${cellSize} flex items-center justify-center font-black font-mono border border-white/5 cursor-pointer transition-colors
                  ${isFound ? 'bg-cyan-500/40 text-cyan-100' : isSel ? 'bg-yellow-400/50 text-yellow-100' : 'bg-[#0f1520] text-gray-300 hover:bg-white/5'}`}
                onMouseDown={() => handleCellStart(r, c)}
                onMouseEnter={() => handleCellEnter(r, c)}
                onTouchStart={() => handleCellStart(r, c)}
                onTouchMove={e => {
                  const t = e.touches[0];
                  const el = document.elementFromPoint(t.clientX, t.clientY);
                  const ra = el?.getAttribute('data-row'), ca = el?.getAttribute('data-col');
                  if (ra && ca) handleCellEnter(parseInt(ra), parseInt(ca));
                }}
              >
                {cell.letter}
              </div>
            );
          }))}
        </div>
      </div>

      {/* ── Word List — columns at the bottom ── */}
      <div className="shrink-0 bg-[#0b1018] border-t border-white/10 px-4 py-3">
        <div
          className="grid gap-x-4 gap-y-1.5"
          style={{ gridTemplateColumns: `repeat(${wordCols}, 1fr)` }}
        >
          {sortedWords.map((word, i) => {
            const found = foundWords.has(word);
            return (
              <div
                key={i}
                className={`flex items-center gap-1.5 text-xs font-black font-mono tracking-wide transition-all
                  ${found ? 'text-cyan-400/50 line-through' : 'text-white'}`}
              >
                <span className={`text-[10px] ${found ? 'text-green-400' : 'text-gray-600'}`}>
                  {found ? '✓' : '◇'}
                </span>
                {word}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
