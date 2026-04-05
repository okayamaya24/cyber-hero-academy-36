import React from 'react';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import CrosswordGame, { CrosswordPuzzle } from '@/components/games/CrosswordGame';

// Layout:
//   0 1 2 3 4 5 6 7 8
// 0 # # # S # # # # #
// 1 # # # A # # # # #
// 2 # # # F # # # # #
// 3 W I F I # # # # #  WIFI across r3 c0-3, SAFE down c3 r0-3 shares I? No SAFE:S-A-F-E
//   SAFE down col3 r0-3: S(r0c3) A(r1c3) F(r2c3) E(r3c3)
//   WIFI across r3 c0-3: W(r3c0) I(r3c1) F(r3c2) I(r3c3)
//   r3c3 = E (from SAFE) vs I (from WIFI) — CONFLICT
//
// Try SAFE down col3 r0-3, TRUST across r2 c3-7: T(r2c3)? F≠T conflict
//
// Simple 2-word valid layout:
// SAFE: down c0 r0-3 S(r0c0) A(r1c0) F(r2c0) E(r3c0)
// WIFI: across r1 c0-3: W? No, r1c0 = A from SAFE
//
// Just put them separately:
// SAFE: across r0 c0
// WIFI: down c3 r2
// BLOCK: across r3 c0

const PUZZLE_JUNIOR: CrosswordPuzzle = {
  grid: [
    ['S','A','F','E','#','#','#'],
    ['#','#','#','#','#','#','#'],
    ['#','#','#','W','#','#','#'],
    ['B','L','O','I','K','#','#'],
    ['#','#','#','F','#','#','#'],
    ['#','#','#','I','#','#','#'],
    ['#','#','#','#','#','#','#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'Protected from danger or harm', row: 0, col: 0, answer: 'SAFE', direction: 'across' },
      { number: 2, clue: 'To stop something from happening', row: 3, col: 0, answer: 'BLOCK', direction: 'across' },
    ],
    down: [
      { number: 3, clue: 'Wireless internet connection', row: 2, col: 3, answer: 'WIFI', direction: 'down' },
    ],
  },
};

// Note: BLOCK needs 5 letters at r3 c0-4, but WIFI shares c3. r3c3=I from WIFI, BLOCK=B(c0)L(c1)O(c2)C(c3)K(c4) → c3=C≠I conflict
// Fix: Move BLOCK to not overlap
// BLOCK across r3 c0-4, WIFI down c5 r0-3 (no conflict):

const PUZZLE_JUNIOR_FIXED: CrosswordPuzzle = {
  grid: [
    ['S','A','F','E','#','W','#'],
    ['#','#','#','#','#','I','#'],
    ['#','#','#','#','#','F','#'],
    ['B','L','O','C','K','I','#'],
    ['#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'Protected from danger', row: 0, col: 0, answer: 'SAFE', direction: 'across' },
      { number: 2, clue: 'Stop harmful content from reaching you', row: 3, col: 0, answer: 'BLOCK', direction: 'across' },
    ],
    down: [
      { number: 3, clue: 'Wireless internet', row: 0, col: 5, answer: 'WIFI', direction: 'down' },
    ],
  },
};
// r3c5 = I (from WIFI down: W r0c5, I r1c5, F r2c5, I r3c5)
// BLOCK r3 c0-4: B(c0) L(c1) O(c2) C(c3) K(c4) — c5 not used, no conflict ✓

const PUZZLE_HERO: CrosswordPuzzle = {
  grid: [
    ['#','#','#','#','A','#','#','#','#','#'],
    ['#','#','T','R','U','S','T','#','#','#'],
    ['#','#','#','#','D','#','#','#','#','#'],
    ['#','#','#','#','I','#','#','#','#','#'],
    ['#','#','#','#','T','#','#','#','#','#'],
    ['#','S','E','C','U','R','E','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'To have confidence in something or someone', row: 1, col: 2, answer: 'TRUST', direction: 'across' },
      { number: 2, clue: 'Protected from threats', row: 5, col: 1, answer: 'SECURE', direction: 'across' },
    ],
    down: [
      { number: 3, clue: 'To confirm who you are online', row: 0, col: 4, answer: 'AUDIT', direction: 'down' },
    ],
  },
};
// TRUST r1 c2-6: T(c2) R(c3) U(c4) S(c5) T(c6) — r1c4=U
// AUDIT down c4 r0-4: A(r0c4) U(r1c4) D(r2c4) I(r3c4) T(r4c4) — r1c4=U ✓ matches TRUST's U!
// SECURE r5 c1-6: S(c1) E(c2) C(c3) U(c4) R(c5) E(c6) — no overlap with others ✓

const PUZZLE_ELITE: CrosswordPuzzle = {
  ...PUZZLE_HERO,
  clues: {
    across: [
      { number: 1, clue: 'Relying on the integrity of a system or entity', row: 1, col: 2, answer: 'TRUST', direction: 'across' },
      { number: 2, clue: 'Hardened against unauthorized access or exploitation', row: 5, col: 1, answer: 'SECURE', direction: 'across' },
    ],
    down: [
      { number: 3, clue: 'Systematic examination of records for compliance', row: 0, col: 4, answer: 'AUDIT', direction: 'down' },
    ],
  },
};

const PUZZLES: Record<AgeTier, CrosswordPuzzle> = {
  junior: PUZZLE_JUNIOR_FIXED,
  hero: PUZZLE_HERO,
  elite: PUZZLE_ELITE,
};

export default function StaySafeOnline() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Stay Safe Online" category="Crossword" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => (
        <CrosswordGame ageTier={ageTier} puzzle={PUZZLES[ageTier]} onComplete={onComplete} />
      )}
    </GameShell>
  );
}
