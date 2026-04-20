/**
 * FeedbackOverlay — Full-viewport flash for correct / wrong / timeout feedback.
 * Renders on top of the game area, auto-dismisses via onDone after `duration` ms.
 *
 * Usage:
 *   <FeedbackOverlay
 *     state={{ visible: true, variant: 'correct', message: 'Nice!', tip: '🔐 Tip...' }}
 *     onDone={() => setFeedback({ visible: false, variant: 'neutral' })}
 *   />
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FeedbackState } from './types';

interface FeedbackOverlayProps {
  state: FeedbackState;
  /** Called when the auto-dismiss timer fires */
  onDone: () => void;
  /** How long to show the overlay in ms (default 1400) */
  duration?: number;
}

const VARIANT_CONFIG = {
  correct: {
    emoji: '✅',
    bg: 'rgba(34,197,94,0.18)',
    border: 'rgba(34,197,94,0.6)',
    glow: '0 0 60px rgba(34,197,94,0.35)',
    fallbackMessage: 'Correct!',
    textColor: 'text-green-300',
  },
  wrong: {
    emoji: '❌',
    bg: 'rgba(239,68,68,0.18)',
    border: 'rgba(239,68,68,0.6)',
    glow: '0 0 60px rgba(239,68,68,0.35)',
    fallbackMessage: 'Not quite!',
    textColor: 'text-red-300',
  },
  timeout: {
    emoji: '⏱️',
    bg: 'rgba(251,146,60,0.18)',
    border: 'rgba(251,146,60,0.6)',
    glow: '0 0 60px rgba(251,146,60,0.35)',
    fallbackMessage: 'Time\'s up!',
    textColor: 'text-orange-300',
  },
  neutral: {
    emoji: 'ℹ️',
    bg: 'rgba(34,211,238,0.12)',
    border: 'rgba(34,211,238,0.4)',
    glow: '0 0 60px rgba(34,211,238,0.25)',
    fallbackMessage: '',
    textColor: 'text-cyan-300',
  },
};

export default function FeedbackOverlay({
  state,
  onDone,
  duration = 1400,
}: FeedbackOverlayProps) {
  const cfg = VARIANT_CONFIG[state.variant];

  useEffect(() => {
    if (!state.visible) return;
    const id = setTimeout(onDone, duration);
    return () => clearTimeout(id);
  }, [state.visible, duration, onDone]);

  return (
    <AnimatePresence>
      {state.visible && (
        <motion.div
          key="feedback-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 px-8 pointer-events-none"
          style={{
            background: cfg.bg,
            boxShadow: cfg.glow,
            backdropFilter: 'blur(2px)',
          }}
        >
          {/* Border ring flash */}
          <motion.div
            className="absolute inset-0 rounded-none pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.4, times: [0, 0.2, 1] }}
            style={{ boxShadow: `inset 0 0 0 3px ${cfg.border}` }}
          />

          {/* Emoji */}
          <motion.div
            initial={{ scale: 0.3, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="text-7xl select-none"
          >
            {cfg.emoji}
          </motion.div>

          {/* Message */}
          {(state.message || cfg.fallbackMessage) && (
            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`text-2xl font-black text-center ${cfg.textColor}`}
              style={{ fontFamily: 'var(--font-display)', textShadow: `0 0 12px ${cfg.border}` }}
            >
              {state.message ?? cfg.fallbackMessage}
            </motion.p>
          )}

          {/* Byte tip */}
          {state.tip && (
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 max-w-xs text-center"
            >
              <p
                className="text-sm text-white/80 leading-snug"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {state.tip}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
