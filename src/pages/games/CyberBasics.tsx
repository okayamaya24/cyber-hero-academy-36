import React from 'react';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import CrosswordGame, { CrosswordPuzzle } from '@/components/games/CrosswordGame';

// ─── JUNIOR ─────────────────────────────────────────────────────────────────
// 5 rows × 6 cols
//   0 1 2 3 4 5
// 0 # # V # # #   VIRUS down  c2 r0-4
// 1 P H I S H #   PHISH across r1 c0-4  (I shared with VIRUS ✓)
// 2 # A R # # #   HACK  down  c1 r1-4  (H shared with PHISH ✓)
// 3 # C U # # #
// 4 # K S P A M   SPAM  across r4 c2-5  (S shared with VIRUS ✓)
//
// Intersections verified:
//   r1c1 = H  (PHISH pos-1, HACK pos-0)  ✓
//   r1c2 = I  (PHISH pos-2, VIRUS pos-1) ✓
//   r4c2 = S  (SPAM  pos-0, VIRUS pos-4) ✓
// ────────────────────────────────────────────────────────────────────────────
const PUZZLE_JUNIOR: CrosswordPuzzle = {
  grid: [
    ['#', '#', 'V', '#', '#', '#'],
    ['P', 'H', 'I', 'S', 'H', '#'],
    ['#', 'A', 'R', '#', '#', '#'],
    ['#', 'C', 'U', '#', '#', '#'],
    ['#', 'K', 'S', 'P', 'A', 'M'],
  ],
  clues: {
    across: [
      { number: 2, clue: 'Tricking someone online to steal their info',         row: 1, col: 0, answer: 'PHISH',  direction: 'across' },
      { number: 4, clue: 'Annoying junk messages no one asked for',             row: 4, col: 2, answer: 'SPAM',   direction: 'across' },
    ],
    down: [
      { number: 1, clue: 'Harmful program that spreads between computers',      row: 0, col: 2, answer: 'VIRUS',  direction: 'down' },
      { number: 3, clue: 'Breaking into a computer without permission',         row: 1, col: 1, answer: 'HACK',   direction: 'down' },
    ],
  },
};

// ─── HERO ────────────────────────────────────────────────────────────────────
// 8 rows × 7 cols
//   0 1 2 3 4 5 6
// 0 # P H I S H #   PHISH   across r0 c1-5
// 1 # # A # # # #   HACK    down   c2 r0-3  (H shared with PHISH ✓)
// 2 E N C R Y P T   ENCRYPT across r2 c0-6  (C shared with HACK ✓)
// 3 # # K # # # #
// 4 V I R U S # #   VIRUS   across r4 c0-4
// 5 # # # # P # #   SPAM    down   c4 r4-7  (S shared with VIRUS ✓)
// 6 # # # # A # #
// 7 # # # # M # #
//
// Intersections verified:
//   r0c2 = H  (PHISH pos-1, HACK pos-0)     ✓
//   r2c2 = C  (ENCRYPT pos-2, HACK pos-2)   ✓
//   r4c4 = S  (VIRUS pos-4, SPAM pos-0)     ✓
// ────────────────────────────────────────────────────────────────────────────
const PUZZLE_HERO: CrosswordPuzzle = {
  grid: [
    ['#', 'P', 'H', 'I', 'S', 'H', '#'],
    ['#', '#', 'A', '#', '#', '#', '#'],
    ['E', 'N', 'C', 'R', 'Y', 'P', 'T'],
    ['#', '#', 'K', '#', '#', '#', '#'],
    ['V', 'I', 'R', 'U', 'S', '#', '#'],
    ['#', '#', '#', '#', 'P', '#', '#'],
    ['#', '#', '#', '#', 'A', '#', '#'],
    ['#', '#', '#', '#', 'M', '#', '#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'Fake emails or messages designed to steal your info', row: 0, col: 1, answer: 'PHISH',   direction: 'across' },
      { number: 3, clue: 'Convert data into a secret code for protection',      row: 2, col: 0, answer: 'ENCRYPT', direction: 'across' },
      { number: 4, clue: 'Malicious program that replicates and spreads',       row: 4, col: 0, answer: 'VIRUS',   direction: 'across' },
    ],
    down: [
      { number: 2, clue: 'Gain unauthorized access to a computer system',      row: 0, col: 2, answer: 'HACK',    direction: 'down' },
      { number: 5, clue: 'Unwanted bulk messages flooding your inbox',          row: 4, col: 4, answer: 'SPAM',    direction: 'down' },
    ],
  },
};

// ─── ELITE ───────────────────────────────────────────────────────────────────
// 7 rows × 9 cols
//   0 1 2 3 4 5 6 7 8
// 0 F I R E W A L L #   FIREWALL across r0 c0-7
// 1 # # # N # # # # #   ENCRYPT  down   c3 r0-6  (E shared with FIREWALL ✓)
// 2 S C A N # # # # #   SCAN     across r2 c0-3  (N shared with ENCRYPT ✓)
// 3 # # # C # # # # #
// 4 # W O R M # # # #   WORM     across r4 c1-4  (R shared with ENCRYPT ✓)
// 5 # # B Y T E # # #   BYTE     across r5 c2-5  (Y shared with ENCRYPT ✓)
// 6 # # S P A M # # #   SPAM     across r6 c2-5  (P shared with ENCRYPT ✓)
//
// Intersections verified:
//   r0c3 = E  (FIREWALL pos-3, ENCRYPT pos-0)  ✓
//   r2c3 = N  (SCAN pos-3, ENCRYPT pos-2) — wait, ENCRYPT starts r0, so r2c3=C not N
//
// Let me fix: ENCRYPT is E-N-C-R-Y-P-T
//   r0c3=E, r1c3=N, r2c3=C, r3c3=R, r4c3=Y, r5c3=P, r6c3=T
//
// Revised rows:
// 0 F I R E W A L L #   FIREWALL across r0 c0-7  (E at c3 = ENCRYPT r0 ✓)
// 1 # # # N # # # # #
// 2 S C A N # # # # #   SCAN across r2 c0-3  (N at c3 = ENCRYPT r2? No, ENCRYPT r2=C)
//
// Wait — SCAN has N at position 3 (col 3), but ENCRYPT has C at r2c3. N≠C → conflict!
//
// Fix: SCAN goes at r1 where ENCRYPT has N:
// SCAN across r1 c0-3: S,C,A,N — N at c3 = ENCRYPT r1 = N ✓
//
// WORM at r3 where ENCRYPT has R: r3c3=R. WORM: W(c1),O(c2),R(c3),M(c4) ✓
// BYTE at r4 where ENCRYPT has Y: r4c3=Y. BYTE: B(c2),Y(c3),T(c4),E(c5) ✓
// SPAM at r5 where ENCRYPT has P: r5c3=P. SPAM: S(c2),P(c3),A(c4),M(c5) ✓
//
// Final validated grid (7 rows × 9 cols):
//   0 1 2 3 4 5 6 7 8
// 0 F I R E W A L L #
// 1 # # # N # # # # #   SCAN  across r1 c0-3 would be s(c0)c(c1)a(c2)N(c3)
//   but wait, then SCAN starts at c0. S(c0),C(c1),A(c2),N(c3). ✓
// 1 S C A N # # # # #
// 2 # # # C # # # # #
// 3 # W O R M # # # #
// 4 # # B Y T E # # #
// 5 # # S P A M # # #
// 6 # # # T # # # # #
// ────────────────────────────────────────────────────────────────────────────
const PUZZLE_ELITE: CrosswordPuzzle = {
  grid: [
    ['F', 'I', 'R', 'E', 'W', 'A', 'L', 'L', '#'],
    ['S', 'C', 'A', 'N', '#', '#', '#', '#', '#'],
    ['#', '#', '#', 'C', '#', '#', '#', '#', '#'],
    ['#', 'W', 'O', 'R', 'M', '#', '#', '#', '#'],
    ['#', '#', 'B', 'Y', 'T', 'E', '#', '#', '#'],
    ['#', '#', 'S', 'P', 'A', 'M', '#', '#', '#'],
    ['#', '#', '#', 'T', '#', '#', '#', '#', '#'],
  ],
  clues: {
    across: [
      { number: 1, clue: 'Network security system that filters malicious traffic',                row: 0, col: 0, answer: 'FIREWALL', direction: 'across' },
      { number: 3, clue: 'Probe a network systematically to detect vulnerabilities',             row: 1, col: 0, answer: 'SCAN',     direction: 'across' },
      { number: 4, clue: 'Self-replicating malware that spreads without a host file',            row: 3, col: 1, answer: 'WORM',     direction: 'across' },
      { number: 5, clue: 'Smallest addressable unit of digital storage (8 bits)',                row: 4, col: 2, answer: 'BYTE',     direction: 'across' },
      { number: 6, clue: 'Unsolicited bulk messages used for phishing or advertising',           row: 5, col: 2, answer: 'SPAM',     direction: 'across' },
    ],
    down: [
      { number: 2, clue: 'Convert plaintext into ciphertext using an algorithm',                row: 0, col: 3, answer: 'ENCRYPT',  direction: 'down' },
    ],
  },
};

const PUZZLES: Record<AgeTier, CrosswordPuzzle> = {
  junior: PUZZLE_JUNIOR,
  hero:   PUZZLE_HERO,
  elite:  PUZZLE_ELITE,
};

export default function CyberBasics() {
  return (
    <GameShell title="Cyber Basics Crossword" category="Crossword" xpReward={150} ageTier="hero" onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => (
        <CrosswordGame ageTier={ageTier} puzzle={PUZZLES[ageTier]} onComplete={onComplete} />
      )}
    </GameShell>
  );
}
