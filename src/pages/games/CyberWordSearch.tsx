/**
 * Cyber Word Search — Arcade Foundation Game
 *
 * Wraps the existing WordSearchGame component inside arcade GameShell.
 * Interaction: click-drag or touch-drag to select words in the grid.
 * Words are hidden horizontally, vertically, and diagonally (hero/elite tiers).
 *
 * Route: /games/cyber-word-search
 */

import { useNavigate } from 'react-router-dom';
import { GameShell } from '@/components/arcade';
import WordSearchGame from '@/components/games/WordSearchGame';

// ── Word list (component picks the right count for each age tier) ─────────────
//   junior: 6 words  | hero: 8 words  | elite: 10 words

const CYBER_WORDS = [
  'VIRUS',
  'HACKER',
  'PASSWORD',
  'FIREWALL',
  'PHISHING',
  'MALWARE',
  'ENCRYPT',
  'RANSOMWARE',
  'BACKUP',
  'ANTIVIRUS',
  'SPAM',
  'PRIVACY',
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CyberWordSearch() {
  const navigate = useNavigate();

  return (
    <GameShell
      title="Cyber Word Search"
      category="Vocabulary"
      xpReward={80}
      ageTier="hero"
      onClose={() => navigate(-1)}
      exitLabel="Back to Training"
      winMessage="Sharp eyes, Guardian! 👀"
      loseTip="Look for short words first — SPAM and VIRUS are only 4-5 letters!"
    >
      {({ ageTier, onComplete }) => (
        <WordSearchGame
          ageTier={ageTier}
          words={CYBER_WORDS}
          title="Find the Cyber Words!"
          onComplete={onComplete}
        />
      )}
    </GameShell>
  );
}
