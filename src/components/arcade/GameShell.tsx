/**
 * GameShell — Top-level wrapper for every arcade game.
 *
 * Owns the state machine:  playing → (win | lose)
 *
 * Games communicate back via the render-prop child:
 *   children({ ageTier, onComplete, onFail })
 *
 * onComplete(score, maxScore) — triggers win screen
 * onFail()                    — triggers lose screen
 *
 * Usage:
 *   <GameShell
 *     title="Lock & Learn"
 *     category="Passwords"
 *     xpReward={50}
 *     ageTier="hero"
 *     onClose={() => navigate(-1)}
 *   >
 *     {({ ageTier, onComplete, onFail }) => (
 *       <MyGame ageTier={ageTier} onComplete={onComplete} onFail={onFail} />
 *     )}
 *   </GameShell>
 */

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import TopBar from './TopBar';
import WinScreen from './WinScreen';
import LoseScreen from './LoseScreen';
import type { AgeTier, GameChildProps, GamePhase } from './types';

// ── Star / XP helpers ────────────────────────────────────────────────────────
function computeStars(score: number, maxScore: number): 1 | 2 | 3 {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.55) return 2;
  return 1;
}

function computeXP(baseXP: number, score: number, maxScore: number): number {
  const ratio = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  return Math.max(Math.round(baseXP * ratio), 10);
}

// ── Props ────────────────────────────────────────────────────────────────────
interface GameShellProps {
  title: string;
  category?: string;
  xpReward: number;
  ageTier: AgeTier;
  onClose: () => void;
  /** Callback fired when the player exits after winning (useful for XP saving) */
  onGameComplete?: (result: { stars: 1 | 2 | 3; xpEarned: number; score: number; maxScore: number }) => void;
  /** Label for the exit button on win/lose screens */
  exitLabel?: string;
  /** Override the win message */
  winMessage?: string;
  /** Override the lose tip */
  loseTip?: string;
  children: (props: GameChildProps) => React.ReactNode;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function GameShell({
  title,
  category,
  xpReward,
  ageTier,
  onClose,
  onGameComplete,
  exitLabel,
  winMessage,
  loseTip,
  children,
}: GameShellProps) {
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [stars, setStars] = useState<1 | 2 | 3>(1);
  const [xpEarned, setXpEarned] = useState(0);
  const [lastScore, setLastScore] = useState(0);
  const [lastMax, setLastMax] = useState(1);

  const handleComplete = useCallback((score: number, maxScore: number) => {
    const s = computeStars(score, maxScore);
    const xp = computeXP(xpReward, score, maxScore);
    setStars(s);
    setXpEarned(xp);
    setLastScore(score);
    setLastMax(maxScore);
    setPhase('win');
    onGameComplete?.({ stars: s, xpEarned: xp, score, maxScore });
  }, [xpReward, onGameComplete]);

  const handleFail = useCallback(() => {
    setPhase('lose');
  }, []);

  const handleReplay = useCallback(() => {
    setPhase('playing');
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col overflow-hidden">
      <TopBar
        title={title}
        category={category}
        onClose={onClose}
      />

      {/* Game area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Always rendered so the game can keep its state during overlays */}
        {children({
          ageTier,
          onComplete: handleComplete,
          onFail: handleFail,
        })}

        <AnimatePresence>
          {phase === 'win' && (
            <WinScreen
              key="win"
              stars={stars}
              xpEarned={xpEarned}
              message={winMessage}
              onReplay={handleReplay}
              onExit={onClose}
              exitLabel={exitLabel}
            />
          )}
          {phase === 'lose' && (
            <LoseScreen
              key="lose"
              tip={loseTip}
              onReplay={handleReplay}
              onExit={onClose}
              exitLabel={exitLabel}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
