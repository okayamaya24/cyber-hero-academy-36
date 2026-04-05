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

      // Check if placement is valid
      let valid = true;
      for (let ci = 0; ci < word.length && valid; ci++) {
        const r = startRow + ci * dir[0];
        const c = startCol + ci * dir[1];
        if (r < 0 || r >= size || c < 0 || c >= size) { valid = false; break; }
        if (grid[r][c].letter !== '.' && grid[r][c].letter !== word[ci]) valid = false;
      }

      if (valid) {
        for (let ci = 0; ci < word.length; ci++) {
          const r = startRow + ci * dir[0];
          const c = startCol + ci * dir[1];
          grid[r][c] = { letter: word[ci], wordIds: [...grid[r][c].wordIds, wi] };
        }
        placed.push(word);
        success = true;
      }
    }
    if (!success) placed.push(''); // failed to place
  }

  // Fill remaining with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].letter === '.') {
        grid[r][c] = { letter: randomLetter(), wordIds: [] };
      }
    }
  }

  return { grid, placed };
}

function getCellKey(row: number, col: number) { return `${row}-${col}`; }

export default function WordSearchGame({ ageTier, words, title, onComplete }: WordSearchGameProps) {
  const config = GRID_CONFIG[ageTier];
  const wordsToUse = words.slice(0, config.wordsToFind);

  const [{ grid, placed }] = useState(() => generateGrid(wordsToUse, config.size, config.directions));
  const [foundWords, setFoundWords] = useState(new Set<string>());
  const [foundCells, setFoundCells] = useState(new Set<string>());
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<{row: number; col: number}[]>([]);
  const [startCell, setStartCell] = useState<{row: number; col: number} | null>(null);
  const [timeLeft, setTimeLeft] = useState(config.timeSeconds);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [wrongFlash, setWrongFlash] = useState(false);

  const validWords = placed.filter(w => w.length > 0);

  // Timer
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
    if (foundWords.size === validWords.length && validWords.length > 0) {
      setTimeout(() => setPhase('done'), 500);
    }
  }, [foundWords, validWords]);

  // Build selected cells from start + direction to current
  const getLineCells = useCallback((start: {row: number; col: number}, end: {row: number; col: number}) => {
    const dr = end.row - start.row;
    const dc = end.col - start.col;
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    if (len === 0) return [start];
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
    // Snap to valid direction
    const isDiag = Math.abs(dr) === Math.abs(dc);
    const isHoriz = dr === 0;
    const isVert = dc === 0;
    if (!isDiag && !isHoriz && !isVert) {
      // Snap to whichever axis is longer
      if (Math.abs(dr) > Math.abs(dc)) {
        return Array.from({ length: Math.abs(dr) + 1 }, (_, i) => ({ row: start.row + i * stepR, col: start.col }));
      } else {
        return Array.from({ length: Math.abs(dc) + 1 }, (_, i) => ({ row: start.row, col: start.col + i * stepC }));
      }
    }
    return Array.from({ length: len + 1 }, (_, i) => ({ row: start.row + i * stepR, col: start.col + i * stepC }));
  }, []);

  const checkSelection = useCallback((cells: {row: number; col: number}[]) => {
    const word = cells.map(c => grid[c.row][c.col].letter).join('');
    const wordRev = word.split('').reverse().join('');
    const match = validWords.find(w => w === word || w === wordRev);
    if (match && !foundWords.has(match)) {
      const newFound = new Set(foundWords);
      newFound.add(match);
      setFoundWords(newFound);
      const newCells = new Set(foundCells);
      cells.forEach(c => newCells.add(getCellKey(c.row, c.col)));
      setFoundCells(newCells);
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 400);
    }
  }, [grid, validWords, foundWords, foundCells]);

  const handleCellStart = (row: number, col: number) => {
    if (phase !== 'playing') return;
    setSelecting(true);
    setStartCell({ row, col });
    setSelected([{ row, col }]);
  };

  const handleCellEnter = (row: number, col: number) => {
    if (!selecting || !startCell) return;
    const cells = getLineCells(startCell, { row, col });
    setSelected(cells);
  };

  const handleCellEnd = () => {
    if (!selecting || selected.length < 2) { setSelecting(false); setSelected([]); setStartCell(null); return; }
    checkSelection(selected);
    setSelecting(false);
    setSelected([]);
    setStartCell(null);
  };

  const cellSize = config.size <= 8 ? 'w-9 h-9 text-sm' : config.size <= 10 ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-xs';

  const timerPct = (timeLeft / config.timeSeconds) * 100;

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] select-none" onMouseUp={handleCellEnd} onTouchEnd={handleCellEnd}>
      {/* HUD */}
      <div className="px-4 py-2 bg-[#0d1220] border-b border-cyan-500/20">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">{title}</span>
          <span className={`font-bold ${timerPct > 50 ? 'text-cyan-400' : timerPct > 25 ? 'text-yellow-400' : 'text-red-400'}`}>{timeLeft}s</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${timerPct}%` }} className={`h-full rounded-full ${timerPct > 50 ? 'bg-cyan-500' : timerPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} />
        </div>
        <div className="text-xs text-gray-500 mt-1">Found: {foundWords.size}/{validWords.length}</div>
      </div>

      <div className="flex flex-1 overflow-hidden gap-2 p-2">
        {/* Grid */}
        <div className="flex-shrink-0">
          <div className={`border border-cyan-500/20 rounded-xl overflow-hidden inline-grid gap-0 ${wrongFlash ? 'ring-2 ring-red-500' : ''}`}
            style={{ gridTemplateColumns: `repeat(${config.size}, 1fr)` }}
            onMouseLeave={() => { if (selecting) { checkSelection(selected); setSelecting(false); setSelected([]); setStartCell(null); } }}
          >
            {grid.map((row, r) => row.map((cell, c) => {
              const key = getCellKey(r, c);
              const isFound = foundCells.has(key);
              const isSelected = selected.some(s => s.row === r && s.col === c);
              return (
                <div key={key}
                  className={`${cellSize} flex items-center justify-center font-bold font-mono border border-white/5 cursor-pointer transition-colors
                    ${isFound ? 'bg-cyan-500/30 text-cyan-200' : isSelected ? 'bg-yellow-500/30 text-yellow-200' : 'bg-black/20 text-gray-300 hover:bg-white/5'}`}
                  onMouseDown={() => handleCellStart(r, c)}
                  onMouseEnter={() => handleCellEnter(r, c)}
                  onTouchStart={() => handleCellStart(r, c)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const el = document.elementFromPoint(touch.clientX, touch.clientY);
                    const rAttr = el?.getAttribute('data-row');
                    const cAttr = el?.getAttribute('data-col');
                    if (rAttr && cAttr) handleCellEnter(parseInt(rAttr), parseInt(cAttr));
                  }}
                  data-row={r} data-col={c}
                >
                  {cell.letter}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Word list */}
        <div className="flex-1 overflow-y-auto space-y-1 pl-1">
          {validWords.map((word, i) => (
            <div key={i} className={`text-xs font-bold font-mono px-2 py-1.5 rounded-lg transition-all
              ${foundWords.has(word) ? 'bg-cyan-500/20 text-cyan-300 line-through opacity-60' : 'bg-white/5 text-white'}`}>
              {foundWords.has(word) ? '✓ ' : '◇ '}{word}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
