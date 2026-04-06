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
  grid: string[][];
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

function getWordCells(puzzle: CrosswordPuzzle, clue: CrosswordClue) {
  return Array.from({ length: clue.answer.length }, (_, i) => ({
    row: clue.direction === 'across' ? clue.row : clue.row + i,
    col: clue.direction === 'across' ? clue.col + i : clue.col,
  }));
}

export default function CrosswordGame({ ageTier, puzzle, onComplete }: CrosswordGameProps) {
  const rows = puzzle.grid.length;
  const cols = puzzle.grid[0].length;
  const allClues = [...puzzle.clues.across, ...puzzle.clues.down];

  const [input, setInput] = useState<string[][]>(() =>
    puzzle.grid.map(row => row.map(c => (c === '#' ? '#' : '')))
  );
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<Dir>('across');
  const [activeClue, setActiveClue] = useState<CrosswordClue | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const clueKey = (c: CrosswordClue) => `${c.number}-${c.direction}`;
  const isClueCompleted = (c: CrosswordClue) => completed.has(clueKey(c));

  // word bank sorted by length
  const wordBank = [...allClues].sort((a, b) => a.answer.length - b.answer.length);

  // Build maps
  const cellClueMap = useRef<Map<string, { across?: CrosswordClue; down?: CrosswordClue }>>(new Map());
  const cellNumbers = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const clueMap = new Map<string, { across?: CrosswordClue; down?: CrosswordClue }>();
    const numMap = new Map<string, number>();
    allClues.forEach(clue => {
      numMap.set(`${clue.row}-${clue.col}`, clue.number);
      getWordCells(puzzle, clue).forEach(({ row, col }) => {
        const k = `${row}-${col}`;
        clueMap.set(k, { ...clueMap.get(k), [clue.direction]: clue });
      });
    });
    cellClueMap.current = clueMap;
    cellNumbers.current = numMap;
  }, [puzzle]);

  // selectClue: full selection (grid click / clue panel click) — highlights cells
  const selectClue = (clue: CrosswordClue) => {
    setSelected({ row: clue.row, col: clue.col });
    setDirection(clue.direction);
    setActiveClue(clue);
  };

  // previewClue: word-bank click — shows clue in bar, does NOT reveal grid position
  const previewClue = (clue: CrosswordClue) => {
    setActiveClue(clue);
    setDirection(clue.direction);
    setSelected(null); // clear selection so no cells are highlighted
  };

  const handleCellClick = (r: number, c: number) => {
    if (puzzle.grid[r][c] === '#') return;
    const clues = cellClueMap.current.get(`${r}-${c}`);
    if (!clues) return;
    if (selected?.row === r && selected?.col === c) {
      const nd: Dir = direction === 'across' ? 'down' : 'across';
      const cl = nd === 'across' ? clues.across : clues.down;
      if (cl) { setDirection(nd); setActiveClue(cl); }
    } else {
      setSelected({ row: r, col: c });
      const pref = (clues[direction] ? direction : (clues.across ? 'across' : 'down')) as Dir;
      if (clues[pref]) { setDirection(pref); setActiveClue(clues[pref]!); }
    }
  };

  const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const ni = input.map(row => [...row]);
      if (input[r][c] === '') {
        if (direction === 'across' && c > 0 && puzzle.grid[r][c - 1] !== '#') { ni[r][c - 1] = ''; setSelected({ row: r, col: c - 1 }); }
        else if (direction === 'down' && r > 0 && puzzle.grid[r - 1][c] !== '#') { ni[r - 1][c] = ''; setSelected({ row: r - 1, col: c }); }
      } else { ni[r][c] = ''; }
      setInput(ni);
      return;
    }
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      const ni = input.map(row => [...row]);
      ni[r][c] = e.key.toUpperCase();
      setInput(ni);
      // advance
      let nr = r, nc = c;
      if (direction === 'across') { for (let cc = c + 1; cc < cols; cc++) { if (puzzle.grid[r][cc] !== '#') { nc = cc; break; } } }
      else { for (let rr = r + 1; rr < rows; rr++) { if (puzzle.grid[rr][c] !== '#') { nr = rr; break; } } }
      if (nr !== r || nc !== c) setSelected({ row: nr, col: nc });
      checkCompletions(ni);
    }
  };

  const checkCompletions = (inp: string[][]) => {
    const done = new Set<string>();
    allClues.forEach(clue => {
      const word = getWordCells(puzzle, clue).map(({ row, col }) => inp[row][col]).join('');
      if (word === clue.answer) done.add(clueKey(clue));
    });
    setCompleted(done);
    if (done.size === allClues.length) setTimeout(() => onComplete(200, 200), 500);
  };

  useEffect(() => {
    if (selected) inputRefs.current[selected.row]?.[selected.col]?.focus();
  }, [selected]);

  const isInActiveWord = (r: number, c: number) =>
    !!activeClue && getWordCells(puzzle, activeClue).some(cell => cell.row === r && cell.col === c);

  const isCellCompleted = (r: number, c: number) => {
    const clues = cellClueMap.current.get(`${r}-${c}`);
    return !!clues && ((clues.across && isClueCompleted(clues.across)) || (clues.down && isClueCompleted(clues.down)));
  };

  const completedCount = completed.size;
  const totalCount = allClues.length;

  // Cell pixel size — scale based on grid dimensions
  const maxDim = Math.max(rows, cols);
  const cellPx = maxDim <= 6 ? 40 : maxDim <= 8 ? 36 : maxDim <= 10 ? 32 : 28;

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] overflow-y-auto">

      {/* ── Active clue bar ── */}
      <div className="sticky top-0 z-10 px-4 py-2 bg-[#0d1220] border-b border-cyan-500/20 flex items-center gap-2 min-h-[44px]">
        {activeClue ? (
          <p className="text-sm flex-1">
            <span className="font-black text-cyan-400 mr-1">{activeClue.number} {activeClue.direction.toUpperCase()}:</span>
            <span className="text-white">{activeClue.clue}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-500 flex-1">Tap a cell or clue to start</p>
        )}
        <span className="text-xs font-bold text-gray-400 shrink-0">{completedCount}/{totalCount}</span>
      </div>

      {/* ── Word Bank ── */}
      <div className="px-4 pt-3 pb-2 bg-[#0b1018] border-b border-white/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Word Bank</p>
        <div className="flex flex-wrap gap-2">
          {wordBank.map(clue => {
            const done = isClueCompleted(clue);
            const active = activeClue?.number === clue.number && activeClue?.direction === clue.direction;
            return (
              <motion.button
                key={clueKey(clue)}
                onClick={() => !done && previewClue(clue)}
                whileTap={done ? {} : { scale: 0.92 }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide border transition-all
                  ${done
                    ? 'border-green-500/30 bg-green-500/10 text-green-400/50 line-through cursor-default'
                    : active
                      ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.25)]'
                      : 'border-white/15 bg-white/5 text-white hover:border-cyan-400/50 hover:bg-cyan-500/10 cursor-pointer'
                  }`}
              >
                {done && '✓ '}{clue.answer}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Grid (centered) ── */}
      <div className="flex justify-center px-4 pt-5 pb-3">
        <div className="inline-flex flex-col border-2 border-white/20 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.08)]">
          {puzzle.grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                if (cell === '#') {
                  return (
                    <div
                      key={c}
                      style={{ width: cellPx, height: cellPx }}
                      className="bg-[#111827] border border-black/60"
                    />
                  );
                }
                const isSelected = selected?.row === r && selected?.col === c;
                const inWord = isInActiveWord(r, c);
                const done = isCellCompleted(r, c);
                const num = cellNumbers.current.get(`${r}-${c}`);
                return (
                  <div
                    key={c}
                    style={{ width: cellPx, height: cellPx }}
                    className={`relative border border-gray-300/40 cursor-pointer transition-colors flex items-center justify-center
                      ${isSelected ? 'bg-yellow-300' : inWord ? 'bg-cyan-100' : done ? 'bg-green-100' : 'bg-white'}
                    `}
                    onClick={() => handleCellClick(r, c)}
                  >
                    {num && (
                      <span className="absolute top-0 left-0 text-[7px] font-bold text-gray-500 leading-none pl-[2px] pt-[2px] pointer-events-none">
                        {num}
                      </span>
                    )}
                    <input
                      ref={el => { if (!inputRefs.current[r]) inputRefs.current[r] = []; inputRefs.current[r][c] = el; }}
                      className="absolute inset-0 w-full h-full text-center text-black font-black bg-transparent outline-none cursor-pointer uppercase caret-transparent select-none"
                      style={{ fontSize: cellPx * 0.42, paddingTop: num ? '4px' : '0' }}
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

      {/* ── Clues — two columns below grid ── */}
      <div className="px-4 pb-6 grid grid-cols-2 gap-x-6 gap-y-1">

        {/* ACROSS column */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-cyan-400 mb-2 border-b border-cyan-500/30 pb-1">
            Across
          </p>
          {puzzle.clues.across.map(clue => (
            <button
              key={clue.number}
              onClick={() => selectClue(clue)}
              className={`block w-full text-left text-xs py-1.5 px-2 rounded-lg mb-0.5 transition-colors leading-snug
                ${activeClue?.number === clue.number && direction === 'across'
                  ? 'bg-cyan-500/20 text-cyan-200'
                  : isClueCompleted(clue)
                    ? 'text-gray-600 line-through'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
            >
              <span className="font-black mr-1 text-gray-400">{clue.number}.</span>
              {clue.clue}
              {isClueCompleted(clue) && <span className="ml-1 text-green-500 no-underline not-italic">✓</span>}
            </button>
          ))}
        </div>

        {/* DOWN column */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-purple-400 mb-2 border-b border-purple-500/30 pb-1">
            Down
          </p>
          {puzzle.clues.down.map(clue => (
            <button
              key={clue.number}
              onClick={() => selectClue(clue)}
              className={`block w-full text-left text-xs py-1.5 px-2 rounded-lg mb-0.5 transition-colors leading-snug
                ${activeClue?.number === clue.number && direction === 'down'
                  ? 'bg-purple-500/20 text-purple-200'
                  : isClueCompleted(clue)
                    ? 'text-gray-600 line-through'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
            >
              <span className="font-black mr-1 text-gray-400">{clue.number}.</span>
              {clue.clue}
              {isClueCompleted(clue) && <span className="ml-1 text-green-500">✓</span>}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
