/**
 * ScenarioCard — Content card for scenario-style games.
 * Used by: swipe games, quiz games, sort games, phishing spotters.
 *
 * Features:
 *  - Badge for category label
 *  - Large emoji / icon area
 *  - Main content text
 *  - Optional subtext
 *  - Animated entrance (spring bounce)
 *  - Glow border variants
 */

import { motion } from 'framer-motion';
import type { ScenarioData } from './types';

interface ScenarioCardProps extends ScenarioData {
  /** Whether to animate entrance (default true) */
  animate?: boolean;
  /** Additional Tailwind classes on the card wrapper */
  className?: string;
  /** Content text size preset (default 'md') */
  textSize?: 'sm' | 'md' | 'lg';
}

const BADGE_COLOR_MAP = {
  cyan:   'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  green:  'bg-green-500/20 text-green-300 border-green-500/40',
  orange: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  red:    'bg-red-500/20 text-red-300 border-red-500/40',
  purple: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

const TEXT_SIZE_MAP = {
  sm: { content: 'text-base', sub: 'text-xs' },
  md: { content: 'text-lg',   sub: 'text-sm' },
  lg: { content: 'text-xl',   sub: 'text-base' },
};

export default function ScenarioCard({
  content,
  subtext,
  icon,
  badge,
  badgeColor = 'cyan',
  animate = true,
  className = '',
  textSize = 'md',
}: ScenarioCardProps) {
  const t = TEXT_SIZE_MAP[textSize];
  const badgeCls = BADGE_COLOR_MAP[badgeColor];

  const card = (
    <div
      className={`
        relative w-full max-w-sm mx-auto
        bg-[#111827] border border-cyan-500/25 rounded-3xl
        px-7 py-8 flex flex-col items-center gap-4
        shadow-lg
        ${className}
      `}
      style={{ boxShadow: '0 8px 40px rgba(34,211,238,0.1), 0 2px 12px rgba(0,0,0,0.4)' }}
    >
      {/* Category badge */}
      {badge && (
        <span
          className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${badgeCls}`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {badge}
        </span>
      )}

      {/* Icon */}
      {icon && (
        <div className="text-6xl leading-none select-none" aria-hidden>
          {icon}
        </div>
      )}

      {/* Main content */}
      <p
        className={`font-bold text-white text-center leading-snug ${t.content}`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {content}
      </p>

      {/* Subtext */}
      {subtext && (
        <p
          className={`text-white/55 text-center leading-relaxed ${t.sub}`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {subtext}
        </p>
      )}

      {/* Decorative corner glow */}
      <div
        className="absolute -top-px -right-px w-16 h-16 rounded-tr-3xl pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at top right, rgba(34,211,238,0.5), transparent 70%)',
        }}
      />
    </div>
  );

  if (!animate) return card;

  return (
    <motion.div
      key={content}
      initial={{ y: 24, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -24, opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      {card}
    </motion.div>
  );
}
