/**
 * Cyber Crossword — Arcade Foundation Game
 *
 * Wraps the existing CrosswordGame component inside arcade GameShell.
 * Keyboard: type letters, Backspace to delete, Arrow keys to navigate cells.
 *
 * Route: /games/cyber-crossword
 */

import { useNavigate } from 'react-router-dom';
import { GameShell } from '@/components/arcade';
import CrosswordGame, { CrosswordPuzzle } from '@/components/games/CrosswordGame';

// ── Puzzle data ───────────────────────────────────────────────────────────────
//
// Grid layout (6 rows × 8 cols):
//
//   # # P H I S H #     1A: PHISH  (row 0, col 2)
//   # # # A # # A #     2D: HACKER (col 3, row 0)
//   # # S C A N S #     3D: HASH   (col 6, row 0)
//   L O C K # # H #     4A: SCAN   (row 2, col 2)
//   C O D E # # # #     5A: LOCK   (row 3, col 0)
//   # # # R # # # #     6A: CODE   (row 4, col 0)
//
// Verified intersections:
//   PHISH[1]=H  ↔  HACKER[0]=H  at (0,3)  ✓
//   PHISH[4]=H  ↔  HASH[0]=H    at (0,6)  ✓
//   SCAN[1]=C   ↔  HACKER[2]=C  at (2,3)  ✓
//   LOCK[3]=K   ↔  HACKER[3]=K  at (3,3)  ✓
//   CODE[3]=E   ↔  HACKER[4]=E  at (4,3)  ✓

const PUZZLE: CrosswordPuzzle = {
  grid: [
    ['#','#','P','H','I','S','H','#'],
    ['#','#','#','A','#','#','A','#'],
    ['#','#','S','C','A','N','S','#'],
    ['L','O','C','K','#','#','H','#'],
    ['C','O','D','E','#','#','#','#'],
    ['#','#','#','R','#','#','#','#'],
  ],
  clues: {
    across: [
      {
        number: 1,
        clue: 'A trick that lures you to a fake site to steal your info',
        row: 0, col: 2,
        answer: 'PHISH',
        direction: 'across',
      },
      {
        number: 4,
        clue: 'To check a system for threats or vulnerabilities',
        row: 2, col: 2,
        answer: 'SCAN',
        direction: 'across',
      },
      {
        number: 5,
        clue: 'A mechanism that keeps something secured and closed',
        row: 3, col: 0,
        answer: 'LOCK',
        direction: 'across',
      },
      {
        number: 6,
        clue: 'Instructions written in a programming language',
        row: 4, col: 0,
        answer: 'CODE',
        direction: 'across',
      },
    ],
    down: [
      {
        number: 2,
        clue: 'Someone who breaks into computer systems without permission',
        row: 0, col: 3,
        answer: 'HACKER',
        direction: 'down',
      },
      {
        number: 3,
        clue: 'A one-way function that converts data into a fixed-length fingerprint',
        row: 0, col: 6,
        answer: 'HASH',
        direction: 'down',
      },
    ],
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CyberCrossword() {
  const navigate = useNavigate();

  return (
    <GameShell
      title="Cyber Crossword"
      category="Vocabulary"
      xpReward={100}
      ageTier="hero"
      onClose={() => navigate(-1)}
      exitLabel="Back to Training"
      winMessage="Vocabulary unlocked, Guardian! 🔐"
      loseTip="Read each clue carefully — think about cyber words you know!"
    >
      {({ ageTier, onComplete }) => (
        <CrosswordGame
          ageTier={ageTier}
          puzzle={PUZZLE}
          onComplete={onComplete}
        />
      )}
    </GameShell>
  );
}
