/**
 * ProgressBar — Animated step/wave progress indicator.
 * Shows "Question 3 of 10" style progress with a glowing fill bar.
 */

import { motion } from 'framer-motion';

interface ProgressBarProps {
  /** Current step (1-based) */
  current: number;
  /** Total steps */
  total: number;
  /** Optional label override; defaults to "current / total" */
  label?: string;
  /** Colour theme (default 'cyan') */
  color?: 'cyan' | 'green' | 'orange' | 'purple';
  /** Show the text label (default true) */
  showLabel?: boolean;
  /** Height in px (default 8) */
  height?: number;
}

const COLOR_MAP = {
  cyan:   { bar: '#22d3ee', glow: '#22d3ee66', track: 'rgba(34,211,238,0.12)' },
  green:  { bar: '#4ade80', glow: '#4ade8066', track: 'rgba(74,222,128,0.12)' },
  orange: { bar: '#fb923c', glow: '#fb923c66', track: 'rgba(251,146,60,0.12)' },
  purple: { bar: '#c084fc', glow: '#c084fc66', track: 'rgba(192,132,252,0.12)' },
};

export default function ProgressBar({
  current,
  total,
  label,
  color = 'cyan',
  showLabel = true,
  height = 8,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, ((current - 1) / total) * 100));
  const c = COLOR_MAP[color];
  const displayLabel = label ?? `${current} / ${total}`;

  return (
    <div className="flex flex-col gap-1 w-full">
      {showLabel && (
        <div className="flex justify-between items-center">
          <span
            className="text-[11px] font-bold tracking-widest uppercase text-white/40"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Progress
          </span>
          <span
            className="text-[11px] font-bold text-white/60"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {displayLabel}
          </span>
        </div>
      )}

      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: c.track }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            background: c.bar,
            boxShadow: `0 0 8px ${c.glow}`,
          }}
        />
      </div>
    </div>
  );
}
