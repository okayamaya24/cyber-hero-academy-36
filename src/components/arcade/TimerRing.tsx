/**
 * TimerRing — SVG circular countdown timer.
 * Colour transitions: green → yellow → red as urgency rises.
 * Emits onExpire() when it hits 0.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TimerRingProps {
  /** Seconds remaining */
  timeRemaining: number;
  /** Total seconds (used to compute the arc fill ratio) */
  timeLimit: number;
  /** Diameter in px (default 80) */
  size?: number;
  /** Stroke width in px (default 6) */
  strokeWidth?: number;
  /** Called exactly once when timeRemaining reaches 0 */
  onExpire?: () => void;
  /** Show numeric countdown inside the ring (default true) */
  showNumber?: boolean;
}

function pickColor(ratio: number): string {
  if (ratio > 0.5) return '#22d3ee';  // cyan — plenty of time
  if (ratio > 0.25) return '#fbbf24'; // yellow — getting tight
  return '#f87171';                    // red — urgent
}

export default function TimerRing({
  timeRemaining,
  timeLimit,
  size = 80,
  strokeWidth = 6,
  onExpire,
  showNumber = true,
}: TimerRingProps) {
  const expiredRef = useRef(false);

  const ratio = Math.max(0, Math.min(1, timeRemaining / timeLimit));
  const color = pickColor(ratio);

  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - ratio);
  const cx = size / 2;

  useEffect(() => {
    if (timeRemaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire?.();
    }
    if (timeRemaining > 0) expiredRef.current = false;
  }, [timeRemaining, onExpire]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transition={{ duration: 0.4, ease: 'linear' }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>

      {showNumber && (
        <motion.span
          key={timeRemaining}
          initial={{ scale: timeRemaining <= 5 ? 1.3 : 1, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute text-sm font-black select-none"
          style={{ color, fontFamily: 'var(--font-display)' }}
        >
          {Math.ceil(timeRemaining)}
        </motion.span>
      )}
    </div>
  );
}
