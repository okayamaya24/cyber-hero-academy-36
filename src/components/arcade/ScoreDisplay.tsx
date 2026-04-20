/**
 * ScoreDisplay — Animated score / XP counter.
 * Counts up from the previous value when `score` changes.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  /** Show out-of max e.g. "7 / 10" */
  maxScore?: number;
  /** Label rendered above the number (default "SCORE") */
  label?: string;
  /** 'points' shows a raw number; 'xp' adds a lightning bolt (default 'points') */
  variant?: 'points' | 'xp';
  /** Size preset (default 'md') */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { wrapper: 'gap-0.5', label: 'text-[10px]', number: 'text-lg', icon: 14 },
  md: { wrapper: 'gap-1',   label: 'text-xs',     number: 'text-2xl', icon: 18 },
  lg: { wrapper: 'gap-1',   label: 'text-sm',     number: 'text-4xl', icon: 24 },
};

function useCountUp(target: number, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const diff = target - from;
    if (diff === 0) return;

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out-cubic
      setDisplay(Math.round(from + diff * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = target;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

export default function ScoreDisplay({
  score,
  maxScore,
  label = 'SCORE',
  variant = 'points',
  size = 'md',
}: ScoreDisplayProps) {
  const displayed = useCountUp(score);
  const s = SIZE_MAP[size];
  const isXP = variant === 'xp';
  const color = isXP ? 'text-cyan-400' : 'text-white';

  return (
    <div className={`flex flex-col items-center ${s.wrapper}`}>
      <span
        className={`${s.label} font-bold tracking-widest uppercase text-white/50`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {label}
      </span>

      <AnimatePresence mode="wait">
        <motion.div
          key={displayed}
          initial={{ y: -6, opacity: 0.4 }}
          animate={{ y: 0, opacity: 1 }}
          className={`flex items-center gap-1 font-black ${s.number} ${color}`}
          style={{ fontFamily: 'var(--font-display)', textShadow: isXP ? '0 0 12px #22d3ee88' : undefined }}
        >
          {isXP && <Zap size={s.icon} className="fill-cyan-400 text-cyan-400" />}
          <span>{displayed}</span>
          {maxScore !== undefined && (
            <span className="text-white/30 font-semibold">/ {maxScore}</span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
