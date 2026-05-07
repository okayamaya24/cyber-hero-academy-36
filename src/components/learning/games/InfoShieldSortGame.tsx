/**
 * InfoShieldSortGame — Hoot Lesson 1
 * Show 8 pieces of information one at a time.
 * Tap: "🔒 Keep Private" or "💬 Safe to Share".
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

const ITEMS = [
  {
    text: "Your home address",
    emoji: "🏠",
    safe: false,
    why: "Your address tells strangers exactly where you live — always keep this private!",
  },
  {
    text: "Your favourite video game",
    emoji: "🎮",
    safe: true,
    why: "This tells people nothing about the real you. Totally fine to talk about in games!",
  },
  {
    text: "Your school's name",
    emoji: "🏫",
    safe: false,
    why: "Your school name can help strangers figure out where to find you in real life.",
  },
  {
    text: "Your gaming high score",
    emoji: "🏆",
    safe: true,
    why: "Sharing achievements is fun and safe — it doesn't reveal who or where you are!",
  },
  {
    text: "Your full name and birthday",
    emoji: "🎂",
    safe: false,
    why: "Scammers use your name and birthday to impersonate you or guess your passwords!",
  },
  {
    text: "Your favourite movie character",
    emoji: "🎬",
    safe: true,
    why: "Talking about favourite characters is safe — it doesn't tell strangers anything personal!",
  },
  {
    text: "Your phone number",
    emoji: "📱",
    safe: false,
    why: "Your phone number can be used to call, track, or scam you. Keep it private!",
  },
  {
    text: "Your opinions on books",
    emoji: "📚",
    safe: true,
    why: "Sharing your thoughts about books is a great way to connect — no personal info needed!",
  },
];

export default function InfoShieldSortGame({ onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const item = ITEMS[current];

  const handleAnswer = (guessedSafe: boolean) => {
    if (result !== null) return;
    const correct = guessedSafe === item.safe;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (current < ITEMS.length - 1) {
        setCurrent((c) => c + 1);
        setResult(null);
      } else {
        setDone(true);
      }
    }, 1800);
  };

  if (done) {
    const stars = score === 8 ? 3 : score >= 6 ? 2 : 1;
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4"
      >
        <div className="text-5xl">🛡️</div>
        <h2 className="text-xl font-black text-white">{score}/{ITEMS.length} sorted correctly!</h2>
        <p className="text-sm text-teal-300 font-bold">
          {score === 8
            ? "Your privacy shield is LEGENDARY! Professor Hoot is impressed! 🦉"
            : score >= 6
            ? "Great sorting! Your info shield is strong — just a few tricky ones!"
            : "Remember: if it could help someone find you in real life, keep it private!"}
        </p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15, type: "spring", bounce: 0.7 }}
            >
              <span className={`text-3xl ${i < stars ? "" : "grayscale opacity-30"}`}>⭐</span>
            </motion.div>
          ))}
        </div>
        <button
          onClick={onComplete}
          className="w-full rounded-2xl py-4 font-black text-[#080c18] transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,#14b8a6,#06b6d4)" }}
        >
          Continue →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="py-2 space-y-3">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-teal-400"
            animate={{ width: `${(current / ITEMS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/40">{current + 1}/{ITEMS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-teal-400 text-center tracking-wider">🛡️ INFO SHIELD SORT</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Item card */}
          <div
            className={`rounded-2xl border-2 p-6 text-center mb-4 transition-all ${
              result === "correct"
                ? "border-green-400 bg-green-500/10"
                : result === "wrong"
                ? "border-red-400 bg-red-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="text-5xl mb-3">{item.emoji}</div>
            <p className="font-black text-white text-base">{item.text}</p>
            <AnimatePresence>
              {result && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs font-semibold mt-3 leading-relaxed ${
                    result === "correct" ? "text-green-400" : "text-red-300"
                  }`}
                >
                  {result === "correct"
                    ? `✓ Correct! ${item.why}`
                    : `✗ ${item.why}`}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(false)}
                className="rounded-2xl border-2 border-red-400/40 bg-red-500/15 py-4 font-black text-red-300 text-sm hover:bg-red-500/25 transition-colors"
              >
                🔒 Keep Private
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAnswer(true)}
                className="rounded-2xl border-2 border-teal-400/40 bg-teal-500/15 py-4 font-black text-teal-300 text-sm hover:bg-teal-500/25 transition-colors"
              >
                💬 Safe to Share
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
