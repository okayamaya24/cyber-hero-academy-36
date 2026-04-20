/**
 * TopBar — Game HUD header bar.
 * Displays title, category tag, optional score, optional timer, and close button.
 * Compose with TimerRing and ScoreDisplay for richer HUDs.
 */

import { X } from 'lucide-react';
import TimerRing from './TimerRing';
import ScoreDisplay from './ScoreDisplay';

interface TopBarProps {
  title: string;
  category?: string;
  /** Current score — omit to hide the score widget */
  score?: number;
  maxScore?: number;
  /** Seconds remaining — omit to hide the timer */
  timeRemaining?: number;
  timeLimit?: number;
  onTimerExpire?: () => void;
  onClose: () => void;
  /** Extra content injected on the right side before the close button */
  rightSlot?: React.ReactNode;
}

export default function TopBar({
  title,
  category,
  score,
  maxScore,
  timeRemaining,
  timeLimit,
  onTimerExpire,
  onClose,
  rightSlot,
}: TopBarProps) {
  const showScore = score !== undefined;
  const showTimer = timeRemaining !== undefined && timeLimit !== undefined;

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-[#0d1220] shrink-0">
      {/* Left: title + category */}
      <div className="flex flex-col min-w-0">
        <h1
          className="text-base font-bold text-white leading-tight truncate max-w-[160px]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        {category && (
          <span
            className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {category}
          </span>
        )}
      </div>

      {/* Right: score / timer / extras / close */}
      <div className="flex items-center gap-3">
        {showScore && (
          <ScoreDisplay score={score} maxScore={maxScore} size="sm" />
        )}

        {showTimer && (
          <TimerRing
            timeRemaining={timeRemaining}
            timeLimit={timeLimit}
            size={52}
            strokeWidth={5}
            onExpire={onTimerExpire}
          />
        )}

        {rightSlot}

        <button
          onClick={onClose}
          aria-label="Close game"
          className="p-2 rounded-full hover:bg-white/10 active:bg-white/20 transition text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
