/**
 * Lock & Learn — Zone 1 Mini-Game 1
 * Swipe RIGHT for STRONG passwords, LEFT for WEAK ones.
 * Drag the card or tap the zone buttons — fast and fun!
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

interface Props {
  onComplete: (stars: number) => void;
}

interface PasswordItem {
  password: string;
  isStrong: boolean;
  reason: string;
  tip: string;
}

const PASSWORDS: PasswordItem[] = [
  {
    password: "dragon",
    isStrong: false,
    reason: "Only 6 letters, no numbers or symbols — too easy.",
    tip: "🐉 'dragon' is one of the 25 most common passwords. Yikes!",
  },
  {
    password: "P@ssw0rd!24",
    isStrong: true,
    reason: "Uppercase ✓ Numbers ✓ Symbols ✓ Long ✓",
    tip: "🔐 A tough mix — hard to guess!",
  },
  {
    password: "iloveyou",
    isStrong: false,
    reason: "All lowercase, no symbols or numbers — way too common.",
    tip: "💔 Hackers love this one. Don't make it easy for them!",
  },
  {
    password: "Qx#7mPk2!L",
    isStrong: true,
    reason: "Random mix of everything — super hard to guess!",
    tip: "💪 Random = unpredictable = nearly uncrackable!",
  },
  {
    password: "abc123",
    isStrong: false,
    reason: "Classic weak combo — way too predictable.",
    tip: "😬 The Keybreaker cracks this in 0.01 seconds.",
  },
  {
    password: "Sun$h1ne99!",
    isStrong: true,
    reason: "Long, mixed case, symbols & numbers. Excellent!",
    tip: "☀️ Strong AND somewhat memorable — perfect!",
  },
];

const SWIPE_THRESHOLD = 90; // px before it counts as a swipe

export default function LockAndLearn({ onComplete }: Props) {
  const [index, setIndex]   = useState(0);
  const [score, setScore]   = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    reason: string;
    tip: string;
    wasStrong: boolean;
    dir: "left" | "right";
  } | null>(null);
  const [exitDir, setExitDir]   = useState<"left" | "right" | null>(null);
  const [done, setDone]         = useState(false);

  const x       = useMotionValue(0);
  const rotate  = useTransform(x, [-150, 0, 150], [-14, 0, 14]);
  const leftOp  = useTransform(x, [-120, -20, 0],  [1,  0.5, 0]);
  const rightOp = useTransform(x, [0,  20,  120],  [0,  0.5, 1]);

  const current = PASSWORDS[index];

  const handleAnswer = useCallback(
    (isStrong: boolean) => {
      if (feedback) return;
      const dir = isStrong ? "right" : "left";
      setExitDir(dir);
      const correct = isStrong === current.isStrong;
      const newStreak = correct ? streak + 1 : 0;
      if (correct) setScore((s) => s + 1);
      setStreak(newStreak);

      // Small delay to let the exit animation play
      setTimeout(() => {
        x.set(0);
        setExitDir(null);
        setFeedback({ correct, reason: current.reason, tip: current.tip, wasStrong: current.isStrong, dir });
        setTimeout(() => {
          setFeedback(null);
          if (index + 1 >= PASSWORDS.length) {
            setDone(true);
          } else {
            setIndex((i) => i + 1);
          }
        }, 2000);
      }, 280);
    },
    [feedback, current, index, streak, x]
  );

  if (done) {
    const stars = score >= 5 ? 3 : score >= 4 ? 2 : 1;
    setTimeout(() => onComplete(stars), 1200);
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center max-w-sm mx-auto"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: 2, duration: 0.4 }}
          className="text-6xl"
        >
          🔐
        </motion.div>
        <h2 className="text-2xl font-black text-white">Scout Complete!</h2>
        <div className="text-4xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
            <p className="text-[10px] text-white/40 uppercase">Correct</p>
            <p className="text-xl font-bold text-green-400">{score} / 6</p>
          </div>
          {streak >= 3 && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-950/30 px-4 py-2 text-center">
              <p className="text-[10px] text-white/40 uppercase">Best Run</p>
              <p className="text-xl font-bold text-orange-400">{streak} 🔥</p>
            </div>
          )}
        </div>
        <p className="text-white/45 text-sm italic">
          {score === 6
            ? "Perfect! You'd never fall for the Keybreaker's weak gates! 🛡️"
            : score >= 4
            ? "Great scouting! Almost unbeatable!"
            : "Keep going — knowing weak passwords is how you build strong ones!"}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2 px-4 max-w-sm mx-auto w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-mono text-white/35">GATE {index + 1} / {PASSWORDS.length}</span>
        {streak >= 3 && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-xs font-bold text-orange-400"
          >
            🔥 {streak} in a row!
          </motion.span>
        )}
        <span className="text-xs font-mono text-white/35">Score: {score}</span>
      </div>

      {/* Swipe zone labels */}
      <div className="flex justify-between w-full px-1">
        <motion.div
          style={{ opacity: leftOp }}
          className="flex items-center gap-1 rounded-xl border border-red-500/50 bg-red-950/50 px-3 py-1.5"
        >
          <span className="text-base">💥</span>
          <span className="text-xs font-bold text-red-300 uppercase tracking-wide">Weak</span>
        </motion.div>
        <motion.div
          style={{ opacity: rightOp }}
          className="flex items-center gap-1 rounded-xl border border-green-500/50 bg-green-950/50 px-3 py-1.5"
        >
          <span className="text-xs font-bold text-green-300 uppercase tracking-wide">Strong</span>
          <span className="text-base">🔒</span>
        </motion.div>
      </div>

      {/* Instruction */}
      <p className="text-[11px] text-white/30 text-center">
        ← Swipe left for WEAK &nbsp;|&nbsp; Swipe right for STRONG →
      </p>

      {/* Password card (draggable) */}
      <div className="relative w-full flex justify-center" style={{ height: 160 }}>
        <AnimatePresence mode="wait">
          {!feedback && (
            <motion.div
              key={index}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              style={{ x, rotate }}
              animate={
                exitDir
                  ? { x: exitDir === "right" ? 340 : -340, opacity: 0, transition: { duration: 0.25 } }
                  : {}
              }
              onDragEnd={(_, { offset }) => {
                if (offset.x > SWIPE_THRESHOLD) handleAnswer(true);
                else if (offset.x < -SWIPE_THRESHOLD) handleAnswer(false);
                else x.set(0);
              }}
              className="absolute w-full cursor-grab active:cursor-grabbing"
              initial={{ scale: 0.92, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              {/* Tint overlays */}
              <motion.div
                className="absolute inset-0 rounded-2xl bg-red-500/30 pointer-events-none"
                style={{ opacity: leftOp }}
              />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-green-500/25 pointer-events-none"
                style={{ opacity: rightOp }}
              />

              {/* Card content */}
              <div className="w-full rounded-2xl border-2 border-white/10 bg-[hsl(210_40%_10%/0.97)] p-6 text-center backdrop-blur-sm shadow-xl shadow-black/40 relative z-10">
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/20 mb-3">
                  — scanning password —
                </p>
                <motion.p
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="font-mono text-2xl font-bold tracking-widest text-[hsl(195_80%_60%)] break-all"
                >
                  {current.password}
                </motion.p>
                <p className="text-[10px] text-white/20 mt-3">drag me ↔</p>
              </div>
            </motion.div>
          )}

          {/* Feedback card */}
          {feedback && (
            <motion.div
              key="feedback"
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute w-full rounded-2xl border-2 p-5 text-center ${
                feedback.correct
                  ? "border-green-500/50 bg-green-950/60"
                  : "border-red-500/50 bg-red-950/60"
              }`}
            >
              <motion.div
                animate={{ scale: [0.5, 1.3, 1] }}
                transition={{ duration: 0.35 }}
                className="text-4xl mb-2"
              >
                {feedback.correct
                  ? feedback.wasStrong ? "🔒" : "💥"
                  : "❌"}
              </motion.div>
              <p className="text-white font-bold text-sm mb-1">
                {feedback.correct
                  ? feedback.wasStrong ? "Correct — STRONG! 🔒" : "Correct — WEAK! 💥"
                  : `Actually ${feedback.wasStrong ? "STRONG 🔒" : "WEAK 💥"}`}
              </p>
              <p className="text-white/65 text-xs leading-snug mb-1">{feedback.reason}</p>
              <p className="text-white/35 text-xs italic">{feedback.tip}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap buttons (alternative to swiping) */}
      <AnimatePresence>
        {!feedback && !exitDir && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 w-full"
          >
            <motion.button
              onClick={() => handleAnswer(false)}
              whileHover={{ scale: 1.04, x: -3 }}
              whileTap={{ scale: 0.93 }}
              className="flex-1 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black py-5 tracking-wide shadow-lg shadow-red-900/40"
            >
              💥 WEAK
            </motion.button>
            <motion.button
              onClick={() => handleAnswer(true)}
              whileHover={{ scale: 1.04, x: 3 }}
              whileTap={{ scale: 0.93 }}
              className="flex-1 rounded-xl bg-green-700 hover:bg-green-600 text-white font-black py-5 tracking-wide shadow-lg shadow-green-900/40"
            >
              STRONG 🔒
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
