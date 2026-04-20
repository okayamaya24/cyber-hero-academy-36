/**
 * WinScreen — Celebration screen shown after the player wins.
 * Displays 1–3 stars, earned XP, a Byte mascot message, and action buttons.
 */

import { motion } from 'framer-motion';
import { Star, Zap, RotateCcw, ArrowLeft } from 'lucide-react';

interface WinScreenProps {
  stars: 1 | 2 | 3;
  xpEarned: number;
  /** Override the default Byte message */
  message?: string;
  onReplay: () => void;
  onExit: () => void;
  /** Label for the exit button (default "Back to Training") */
  exitLabel?: string;
}

const BYTE_MESSAGES: Record<1 | 2 | 3, string> = {
  1: "Good try, Guardian! Keep training! 💪",
  2: "Nice work! You're getting stronger! ⚡",
  3: "AMAZING! You're a true Cyber Hero! 🔥",
};

const STAR_COLORS: Record<1 | 2 | 3, string> = {
  1: 'text-orange-400 fill-orange-400',
  2: 'text-yellow-300 fill-yellow-300',
  3: 'text-yellow-400 fill-yellow-400',
};

const BG_GLOWS: Record<1 | 2 | 3, string> = {
  1: 'rgba(251,146,60,0.15)',
  2: 'rgba(253,224,71,0.15)',
  3: 'rgba(250,204,21,0.2)',
};

export default function WinScreen({
  stars,
  xpEarned,
  message,
  onReplay,
  onExit,
  exitLabel = 'Back to Training',
}: WinScreenProps) {
  const byteMsg = message ?? BYTE_MESSAGES[stars];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-8"
      style={{ background: `radial-gradient(ellipse at center, ${BG_GLOWS[stars]}, transparent 70%), #0a0e1a` }}
    >
      {/* Byte mascot */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
        className="text-7xl select-none"
      >
        🤖
      </motion.div>

      {/* Byte message */}
      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="text-xl font-bold text-cyan-300 text-center max-w-xs leading-snug"
        style={{ fontFamily: 'var(--font-display)', textShadow: '0 0 16px #22d3ee66' }}
      >
        {byteMsg}
      </motion.p>

      {/* Stars */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex gap-3"
        aria-label={`${stars} out of 3 stars`}
      >
        {([1, 2, 3] as const).map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.35 + i * 0.12,
              type: 'spring',
              stiffness: 380,
              damping: 16,
            }}
          >
            <Star
              className={`w-14 h-14 drop-shadow-lg ${
                i <= stars ? STAR_COLORS[stars] : 'text-gray-700 fill-gray-700'
              }`}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* XP badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.72, type: 'spring', stiffness: 350 }}
        className="flex items-center gap-3 bg-cyan-500/20 border border-cyan-500/60 rounded-2xl px-10 py-4"
        style={{ boxShadow: '0 0 24px rgba(34,211,238,0.25)' }}
      >
        <Zap className="w-7 h-7 text-cyan-400 fill-cyan-400" />
        <span
          className="text-3xl font-black text-cyan-400"
          style={{ fontFamily: 'var(--font-display)', textShadow: '0 0 12px #22d3ee88' }}
        >
          +{xpEarned} XP
        </span>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.88 }}
        className="flex gap-3 flex-wrap justify-center"
      >
        <button
          onClick={onReplay}
          className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black font-black transition-all"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <RotateCcw className="w-4 h-4" />
          Play Again
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
