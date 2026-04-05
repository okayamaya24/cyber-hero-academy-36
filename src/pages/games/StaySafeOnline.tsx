import React from 'react';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import CrosswordGame, { CrosswordPuzzle } from '@/components/games/CrosswordGame';

// ─── JUNIOR ──────────────────────────────────────────────────────────────────
// 6 rows × 5 cols
//   0 1 2 3 4
// 0 T R U S T   TRUST  across r0 c0-4
// 1 # # # E #   SECURE down   c3 r0-5  (S at r0c3 shared ✓)
// 2 B L O C K   BLOCK  across r2 c0-4  (C at r2c3 shared ✓)
// 3 # # # U #
// 4 # # # R #
// 5 # # # E #
//
// Intersections:
//   r0c3 = S  (TRUST pos-3, SECURE pos-0)  ✓
//   r2c3 = C  (BLOCK pos-3, SECURE pos-2)  ✓
// ────────────────────────────────────────────────────────────────────────────
const PUZZLE_JUNIOR: CrosswordPuzzle = {
  grid: [
    ['T','R','U','S','T'],
    ['#','#','#','E','#'],
    ['B','L','O','C','K'],
    ['#','#','#','U','#'],
    ['#','#','#','R','#'],
    ['#','#','#','E','#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'To believe someone or something is safe and honest',   row: 0, col: 0, answer: 'TRUST',  direction: 'across' },
      { number: 3, clue: 'Stop a person or message from reaching you',           row: 2, col: 0, answer: 'BLOCK',  direction: 'across' },
    ],
    down: [
      { number: 2, clue: 'Protected so that bad guys can\'t get in',            row: 0, col: 3, answer: 'SECURE', direction: 'down' },
    ],
  },
};

// ─── HERO ────────────────────────────────────────────────────────────────────
// 7 rows × 6 cols — all across words share column 0 with PRIVATE (down)
//   0 1 2 3 4 5
// 0 P H I S H #   PHISH   across r0 c0-4
// 1 R # # # # #   PRIVATE down   c0 r0-6  (P at r0c0 shared ✓)
// 2 I N F O # #   INFO    across r2 c0-3  (I at r2c0 shared ✓)
// 3 V # # # # #
// 4 A L E R T #   ALERT   across r4 c0-4  (A at r4c0 shared ✓)
// 5 T R U S T #   TRUST   across r5 c0-4  (T at r5c0 shared ✓)
// 6 E # # # # #
//
// Intersections:
//   r0c0 = P  (PHISH pos-0, PRIVATE pos-0)   ✓
//   r2c0 = I  (INFO pos-0, PRIVATE pos-2)     ✓
//   r4c0 = A  (ALERT pos-0, PRIVATE pos-4)    ✓
//   r5c0 = T  (TRUST pos-0, PRIVATE pos-5)    ✓
// ────────────────────────────────────────────────────────────────────────────
const PUZZLE_HERO: CrosswordPuzzle = {
  grid: [
    ['P','H','I','S','H','#'],
    ['R','#','#','#','#','#'],
    ['I','N','F','O','#','#'],
    ['V','#','#','#','#','#'],
    ['A','L','E','R','T','#'],
    ['T','R','U','S','T','#'],
    ['E','#','#','#','#','#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'Trick someone online to steal their password or info',   row: 0, col: 0, answer: 'PHISH',   direction: 'across' },
      { number: 3, clue: 'Data or facts shared or communicated',                   row: 2, col: 0, answer: 'INFO',    direction: 'across' },
      { number: 4, clue: 'Warning signal that something may be wrong',             row: 4, col: 0, answer: 'ALERT',   direction: 'across' },
      { number: 5, clue: 'Confidence that someone or something is safe',           row: 5, col: 0, answer: 'TRUST',   direction: 'across' },
    ],
    down: [
      { number: 2, clue: 'Keeping personal information hidden from others',        row: 0, col: 0, answer: 'PRIVATE', direction: 'down' },
    ],
  },
};

// ─── ELITE ───────────────────────────────────────────────────────────────────
// Same grid as Hero, harder clues + PRIVATE has deeper meaning
// ────────────────────────────────────────────────────────────────────────────
const PUZZLE_ELITE: CrosswordPuzzle = {
  grid: PUZZLE_HERO.grid,
  clues: {
    across: [
      { number: 1, clue: 'Social engineering attack using fraudulent communication',  row: 0, col: 0, answer: 'PHISH',   direction: 'across' },
      { number: 3, clue: 'Structured data that can be processed or transmitted',      row: 2, col: 0, answer: 'INFO',    direction: 'across' },
      { number: 4, clue: 'Notification triggered by anomalous system behaviour',      row: 4, col: 0, answer: 'ALERT',   direction: 'across' },
      { number: 5, clue: 'Reliance on the integrity of a system or identity',         row: 5, col: 0, answer: 'TRUST',   direction: 'across' },
    ],
    down: [
      { number: 2, clue: 'Information accessible only to its rightful owner; a key tenet of InfoSec', row: 0, col: 0, answer: 'PRIVATE', direction: 'down' },
    ],
  },
};

const PUZZLES: Record<AgeTier, CrosswordPuzzle> = {
  junior: PUZZLE_JUNIOR,
  hero:   PUZZLE_HERO,
  elite:  PUZZLE_ELITE,
};

export default function StaySafeOnline() {
  return (
    <GameShell title="Stay Safe Online" category="Crossword" xpReward={150} ageTier="hero" onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => (
        <CrosswordGame ageTier={ageTier} puzzle={PUZZLES[ageTier]} onComplete={onComplete} />
      )}
    </GameShell>
  );
}
