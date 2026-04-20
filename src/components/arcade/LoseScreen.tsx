/**
 * LoseScreen — Encouraging retry screen shown when the player fails.
 * Keeps the tone positive and non-punishing for kids.
 */

import { motion } from 'framer-motion';
import { RotateCcw, ArrowLeft } from 'lucide-react';

interface LoseScreenProps {
  /** Override the default message */
  message?: string;
  /** Byte's tip / hint for the next attempt */
  tip?: string;
  onReplay: () => void;
  onExit: () => void;
  /** Label for the exit button (default "Back to Training") */
  exitLabel?: string;
}

const DEFAULT_MESSAGES = [
  "Every hero stumbles — it's how you get stronger! 💪",
  "The Keybreaker got you this time, but not for long! ⚡",
  "Don't give up, Guardian! Try again! 🛡️",
  "Even the best heroes need more practice! 🔥",
];

function pickMessage() {
  return DEFAULT_MESSAGES[Math.floor(Math.random() * DEFAULT_MESSAGES.length)];
}

export default function LoseScreen({
  message,
  tip,
  onReplay,
  onExit,
  exitLabel = 'Back to Training',
}: LoseScreenProps) {
  const displayMsg = message ?? pickMessage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-8"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(239,68,68,0.12), transparent 70%), #0a0e1a',
      }}
    >
      {/* Byte mascot — sad but encouraging */}
      <motion.div
        initial={{ scale: 0, rotate: 10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
        className="text-7xl select-none"
      >
        🤖
      </motion.div>

      {/* Message */}
      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-xl font-bold text-red-300 text-center max-w-xs leading-snug"
        style={{ fontFamily: 'var(--font-display)', textShadow: '0 0 16px rgba(239,68,68,0.4)' }}
      >
        {displayMsg}
      </motion.p>

      {/* Byte tip */}
      {tip && (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 max-w-xs text-center"
        >
          <p
            className="text-sm font-semibold text-white/80 leading-snug"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            💡 {tip}
          </p>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 flex-wrap justify-center"
      >
        <button
          onClick={onReplay}
          className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-red-500 hover:bg-red-400 active:scale-95 text-white font-black transition-all"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 font-bold text-white transition-all"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          {exitLabel}
        </button>
      </motion.div>
    </motion.div>
  );
}
