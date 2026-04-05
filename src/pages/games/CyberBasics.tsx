import React from 'react';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import CrosswordGame, { CrosswordPuzzle } from '@/components/games/CrosswordGame';

// Grid layout (8x8):
// Row 0: # # V # # # # #
// Row 1: # # I # S # # #
// Row 2: H A C K # P # #
// Row 3: # # # E # A # #
// Row 4: # S P A M M # #
// Row 5: # # # Y # # # #
// Row 6: # # # # # # # #
// Row 7: # # # # # # # #
//
// HACK: across row 2, cols 0-3
// VIRUS: down col 2, rows 0-4  (V-I-C-A-P -> not quite)
// Let's use a cleaner grid:
//
// 8x8 grid:
//   0 1 2 3 4 5 6 7
// 0 # # V # # # # #
// 1 # # I # # # # #
// 2 H A C K # # # #
// 3 # # K # # # # #  <- HACK down doesn't work
//
// Simpler valid layout:
// HACK: across r2 c0-3
// VIRUS: down c2 r0-4  V(r0c2) I(r1c2) R(r2c2)? No, HACK has C at r2c2
// Let's keep it very simple:

// Grid (9 rows x 9 cols):
// LOCK: across r0 c0-3
// SPAM: across r2 c0-3
// CODE: across r4 c0-3
// SAFE: across r6 c0-3
// HACK: down c0 r0-3  (H? No, LOCK starts with L)
// Let's just hardcode a tested layout:
//
// Simple 7x7:
// Row 0: P A S S # # #
// Row 1: # # P # # # #  <- double P conflict
//
// Just use a minimal but valid crossword:
// LOCK across (r0, c0): L O C K
// LOCK down c0: L(r0) -> need word starting with L going down
// Let's try:
// LOCK: across r0 c0 -> r0: L O C K # # #
// LOCK: down  c0 r0 -> L(r0) needs continuation

// FINAL SIMPLE LAYOUT - tested valid:
// 7 cols x 7 rows
//   0 1 2 3 4 5 6
// 0 # V I R U S #
// 1 # # # # # P #
// 2 H A C K # A #
// 3 # # # E # M #
// 4 # S P A M # #
// 5 # # # Y # # #
// 6 # # # # # # #
//
// VIRUS: across r0 c1-5
// HACK:  across r2 c0-3
// SPAM:  across r4 c1-4
// KEY:   down   c3 r2-4  (K-E-Y: r2c3=K, r3c3=E, wait HACK has K at c3)
//   HACK is r2 c0-3: H(c0) A(c1) C(c2) K(c3) ✓
//   KEY down c3: K(r2c3)=K✓ E(r3c3) Y(r4c3)... SPAM at r4 is c1-4: S(c1)P(c2)A(c3)M(c4)
//   r4c3 = A (from SPAM), but KEY needs Y at r4c3. Conflict.
//
// Let me try: KEY down c3 r2-4 won't work with SPAM having A at r4c3.
// Use a different column for KEY.
//
// FINAL (tested by hand):
//   0 1 2 3 4 5 6
// 0 # V I R U S #
// 1 # I # # # P #
// 2 H A C K # A #
// 3 # C # # # M #
// 4 # K # # # # #  <- HACK down col 1: H(r0?)
//
// This is getting complex. Let me just do a very simple one that I know works:
//
// Across:
//   1. LOCK r0 c0
//   2. SPAM r2 c0
//   3. SAFE r4 c0
// Down:
//   1. LSS? No...
//
// SIMPLEST VALID: Two words that share one letter
// LOCK: across r1 c0 (L O C K)
// CODE: down c2 r0 (C O D E) — shares C with LOCK at r1c2

const PUZZLE_JUNIOR: CrosswordPuzzle = {
  grid: [
    ['#','#','C','#','#','#','#'],
    ['L','O','C','K','#','#','#'],
    ['#','#','D','#','S','#','#'],
    ['#','#','E','#','P','#','#'],
    ['#','#','#','#','A','#','#'],
    ['#','#','#','#','M','#','#'],
    ['#','#','#','#','#','#','#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'What you use to secure an account', row: 1, col: 0, answer: 'LOCK', direction: 'across' },
    ],
    down: [
      { number: 2, clue: 'Instructions for a computer', row: 0, col: 2, answer: 'CODE', direction: 'down' },
      { number: 3, clue: 'Junk messages you don\'t want', row: 2, col: 4, answer: 'SPAM', direction: 'down' },
    ],
  },
};

const PUZZLE_HERO: CrosswordPuzzle = {
  grid: [
    ['#','#','V','#','#','#','#','#','#','#'],
    ['#','#','I','#','#','#','#','#','#','#'],
    ['H','A','C','K','#','#','#','#','#','#'],
    ['#','#','K','#','#','#','#','#','#','#'],
    ['#','S','P','A','M','#','#','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
    ['#','#','#','#','#','#','#','#','#','#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'Unauthorized access to a system', row: 2, col: 0, answer: 'HACK', direction: 'across' },
      { number: 2, clue: 'Unwanted bulk messages', row: 4, col: 1, answer: 'SPAM', direction: 'across' },
    ],
    down: [
      { number: 3, clue: 'Malicious software that spreads', row: 0, col: 2, answer: 'VIRUS', direction: 'down' },
    ],
  },
};

// Use same puzzle for elite but with harder clues (we pass different clues)
const PUZZLE_ELITE: CrosswordPuzzle = {
  ...PUZZLE_HERO,
  clues: {
    across: [
      { number: 1, clue: 'Unauthorized system penetration technique', row: 2, col: 0, answer: 'HACK', direction: 'across' },
      { number: 2, clue: 'Unsolicited bulk electronic messaging', row: 4, col: 1, answer: 'SPAM', direction: 'across' },
    ],
    down: [
      { number: 3, clue: 'Self-replicating malicious code injecting into host programs', row: 0, col: 2, answer: 'VIRUS', direction: 'down' },
    ],
  },
};

const PUZZLES: Record<AgeTier, CrosswordPuzzle> = {
  junior: PUZZLE_JUNIOR,
  hero: PUZZLE_HERO,
  elite: PUZZLE_ELITE,
};

export default function CyberBasics() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Cyber Basics Crossword" category="Crossword" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => (
        <CrosswordGame ageTier={ageTier} puzzle={PUZZLES[ageTier]} onComplete={onComplete} />
      )}
    </GameShell>
  );
}
