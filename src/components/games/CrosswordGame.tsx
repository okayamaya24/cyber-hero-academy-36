import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AgeTier } from '@/components/games/GameShell';

export interface CrosswordClue {
  number: number;
  clue: string;
  row: number;
  col: number;
  answer: string;
  direction: 'across' | 'down';
}

export interface CrosswordPuzzle {
  grid: string[][];  // uppercase letters, '#' for black, ' ' for empty white
  clues: {
    across: CrosswordClue[];
    down: CrosswordClue[];
  };
}

interface CrosswordGameProps {
  ageTier: AgeTier;
  puzzle: CrosswordPuzzle;
  onComplete: (score: number, maxScore: number) => void;
}

type Dir = 'across' | 'down';

function getWordCells(puzzle: CrosswordPuzzle, clue: CrosswordClue): {row: number; col: number}[] {
  const cells: {row: number; col: number}[] = [];
  for (let i = 0; i < clue.answer.length; i++) {
    if (clue.direction === 'across') cells.push({ row: clue.row, col: clue.col + i });
    else cells.push({ row: clue.row + i, col: clue.col });
  }
  return cells;
}

export default function CrosswordGame({ ageTier, puzzle, onComplete }: CrosswordGameProps) {
  const rows = puzzle.grid.length;
  const cols = puzzle.grid[0].length;

  // Player input grid
  const [input, setInput] = useState<string[][]>(() =>
    puzzle.grid.map(row => row.map(c => (c === '#' ? '#' : '')))
  );
  const [selected, setSelected] = useState<{row: number; col: number} | null>(null);
  const [direction, setDirection] = useState<Dir>('across');
  const [activeClue, setActiveClue] = useState<CrosswordClue | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Build cell-to-clue map
  const cellClueMap = useRef<Map<string, {across?: CrosswordClue; down?: CrosswordClue}>>(new Map());
  useEffect(() => {
    const map = new Map<string, {across?: CrosswordClue; down?: CrosswordClue}>();
    [...puzzle.clues.across, ...puzzle.clues.down].forEach(clue => {
      getWordCells(puzzle, clue).forEach(({ row, col }) => {
        const key = `${row}-${col}`;
        const existing = map.get(key) || {};
        map.set(key, { ...existing, [clue.direction]: clue });
      });
    });
    cellClueMap.current = map;
  }, [puzzle]);

  // Cell numbers
  const cellNumbers = useRef<Map<string, number>>(new Map());
  useEffect(() => {
    const map = new Map<string, number>();
    [...puzzle.clues.across, ...puzzle.clues.down].forEach(c => {
      map.set(`${c.row}-${c.col}`, c.number);
    });
    cellNumbers.current = map;
  }, [puzzle]);

  const handleCellClick = (row: number, col: number) => {
    if (puzzle.grid[row][col] === '#') return;
    const key = `${row}-${col}`;
    const clues = cellClueMap.current.get(key);
    if (!clues) return;

    if (selected?.row === row && selected?.col === col) {
      // Toggle direction
      const newDir: Dir = direction === 'across' ? 'down' : 'across';
      const clue = newDir === 'across' ? clues.across : clues.down;
      if (clue) { setDirection(newDir); setActiveClue(clue); }
    } else {
      setSelected({ row, col });
      const preferred = clues[direction] ? direction : (clues.across ? 'across' : 'down');
      const clue = clues[preferred as Dir];
      if (clue) { setDirection(preferred as Dir); setActiveClue(clue); }
    }
  };

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const newInput = input.map(r => [...r]);
      if (input[row][col] === '') {
        // Move back
        if (direction === 'across' && col > 0 && puzzle.grid[row][col-1] !== '#') {
          newInput[row][col-1] = '';
          setInput(newInput);
          setSelected({ row, col: col - 1 });
        } else if (direction === 'down' && row > 0 && puzzle.grid[row-1][col] !== '#') {
          newInput[row-1][col] = '';
          setInput(newInput);
          setSelected({ row: row - 1, col });
        }
      } else {
        newInput[row][col] = '';
        setInput(newInput);
      }
      return;
    }
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      const letter = e.key.toUpperCase();
      const newInput = input.map(r => [...r]);
      newInput[row][col] = letter;
      setInput(newInput);
      // Move to next cell
      let nextRow = row, nextCol = col;
      if (direction === 'across') {
        for (let c = col + 1; c < cols; c++) {
          if (puzzle.grid[row][c] !== '#') { nextCol = c; nextRow = row; break; }
        }
      } else {
        for (let r = row + 1; r < rows; r++) {
          if (puzzle.grid[r][col] !== '#') { nextRow = r; nextCol = col; break; }
        }
      }
      if (nextRow !== row || nextCol !== col) setSelected({ row: nextRow, col: nextCol });
      // Check completions
      checkCompletions(newInput);
    }
  };

  const checkCompletions = (inp: string[][]) => {
    const newCompleted = new Set<number>();
    [...puzzle.clues.across, ...puzzle.clues.down].forEach(clue => {
      const cells = getWordCells(puzzle, clue);
      const word = cells.map(c => inp[c.row][c.col]).join('');
      if (word === clue.answer) newCompleted.add(clue.number * (clue.direction === 'across' ? 1 : -1));
    });
    setCompleted(newCompleted);
    const total = puzzle.clues.across.length + puzzle.clues.down.length;
    if (newCompleted.size === total) {
      setTimeout(() => onComplete(200, 200), 500);
    }
  };

  // Focus selected cell
  useEffect(() => {
    if (selected) {
      inputRefs.current[selected.row]?.[selected.col]?.focus();
    }
  }, [selected]);

  const isInActiveWord = (row: number, col: number) => {
    if (!activeClue) return false;
    return getWordCells(puzzle, activeClue).some(c => c.row === row && c.col === col);
  };

  const isCompleted = (row: number, col: number) => {
    const key = `${row}-${col}`;
    const clues = cellClueMap.current.get(key);
    if (!clues) return false;
    return (clues.across && completed.has(clues.across.number)) || (clues.down && completed.has(-clues.down.number));
  };

  const cellBase = 'w-8 h-8 sm:w-9 sm:h-9 relative border border-black/40 flex items-center justify-center';

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] overflow-hidden">
      {/* Active clue */}
      <div className="px-4 py-2 bg-[#0d1220] border-b border-cyan-500/20 min-h-[48px] flex items-center">
        {activeClue ? (
          <div className="text-sm">
            <span className="text-cyan-400 font-bold">{activeClue.number} {activeClue.direction.toUpperCase()}: </span>
            <span className="text-white">{activeClue.clue}</span>
          </div>
        ) : <div className="text-sm text-gray-600">Tap a cell to start</div>}
      </div>

      <div className="flex flex-1 overflow-hidden gap-2 p-2">
        {/* Grid */}
        <div className="flex-shrink-0 overflow-auto">
          <div className="inline-flex flex-col gap-0 border-2 border-white/20 rounded">
            {puzzle.grid.map((row, r) => (
              <div key={r} className="flex">
                {row.map((cell, c) => {
                  if (cell === '#') return <div key={c} className={`${cellBase} bg-gray-900`} />;
                  const isSelected = selected?.row === r && selected?.col === c;
                  const inWord = isInActiveWord(r, c);
                  const done = isCompleted(r, c);
                  const num = cellNumbers.current.get(`${r}-${c}`);
                  return (
                    <div key={c} className={`${cellBase} cursor-pointer
                      ${isSelected ? 'bg-yellow-400' : inWord ? 'bg-cyan-200' : done ? 'bg-green-100' : 'bg-white'}
                    `} onClick={() => handleCellClick(r, c)}>
                      {num && <span className="absolute top-0 left-0 text-[8px] text-gray-500 font-bold leading-none pl-0.5 pt-0.5">{num}</span>}
                      <input
                        ref={el => { if (!inputRefs.current[r]) inputRefs.current[r] = []; inputRefs.current[r][c] = el; }}
                        className="w-full h-full text-center text-black font-black text-sm bg-transparent outline-none cursor-pointer uppercase"
                        value={input[r][c]}
                        onChange={() => {}}
                        onKeyDown={e => handleKeyDown(r, c, e)}
                        maxLength={1}
                        readOnly
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Clues */}
        <div className="flex-1 overflow-y-auto text-xs space-y-3">
          <div>
            <div className="font-black text-cyan-400 mb-1">ACROSS</div>
            {puzzle.clues.across.map(clue => (
              <button key={clue.number} onClick={() => { setSelected({ row: clue.row, col: clue.col }); setDirection('across'); setActiveClue(clue); }}
                className={`block w-full text-left px-2 py-1 rounded mb-0.5 transition-colors
                  ${activeClue?.number === clue.number && direction === 'across' ? 'bg-cyan-500/20 text-cyan-300' : ''}
                  ${completed.has(clue.number) ? 'opacity-40 line-through' : 'text-gray-300 hover:bg-white/5'}`}>
                <span className="font-bold">{clue.number}.</span> {clue.clue}
              </button>
            ))}
          </div>
          <div>
            <div className="font-black text-purple-400 mb-1">DOWN</div>
            {puzzle.clues.down.map(clue => (
              <button key={clue.number} onClick={() => { setSelected({ row: clue.row, col: clue.col }); setDirection('down'); setActiveClue(clue); }}
                className={`block w-full text-left px-2 py-1 rounded mb-0.5 transition-colors
                  ${activeClue?.number === clue.number && direction === 'down' ? 'bg-purple-500/20 text-purple-300' : ''}
                  ${completed.has(-clue.number) ? 'opacity-40 line-through' : 'text-gray-300 hover:bg-white/5'}`}>
                <span className="font-bold">{clue.number}.</span> {clue.clue}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
