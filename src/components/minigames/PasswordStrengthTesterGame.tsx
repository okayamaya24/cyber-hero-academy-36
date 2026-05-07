/**
 * PasswordStrengthTesterGame
 * Show 4 real passwords one at a time.
 * Kids rate Weak / Okay / Strong, then an animated bar
 * reveals the true score with a checkmark breakdown.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AgeTier } from "@/data/missions";

interface Props {
  ageTier: AgeTier;
  guideImage: string;
  guideName: string;
  onComplete: (correct: boolean) => void;
}

function calcStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 4) s += 20;
  if (pw.length >= 8) s += 20;
  if (/[A-Z]/.test(pw)) s += 15;
  if (/[a-z]/.test(pw)) s += 10;
  if (/[0-9]/.test(pw)) s += 15;
  if (/[^A-Za-z0-9]/.test(pw)) s += 20;
  return Math.min(s, 100);
}

const CHALLENGES = [
  {
    password: "password",
    rating: 0, // weak
    lesson: "This is one of the most-hacked passwords ever! It has no numbers, no symbols, and no uppercase.",
  },
  {
    password: "abc123",
    rating: 0, // weak
    lesson: "Hackers try letter and number sequences first. No uppercase, no symbols — cracks in seconds!",
  },
  {
    password: "MyDog2024",
    rating: 1, // okay
    lesson: "Better! But pet names + years are very guessable. One symbol like ! or @ would make it stronger.",
  },
  {
    password: "Tr0ub4dor&3",
    rating: 2, // strong
    lesson: "Excellent! Mixed case, number swaps, a symbol, and good length — really hard to crack! 🔐",
  },
];

const RATINGS = [
  { label: "Weak 😬",   btnClass: "border-red-400/40 bg-red-500/15 text-red-300 hover:bg-red-500/25" },
  { label: "Okay 🤔",   btnClass: "border-amber-400/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25" },
  { label: "Strong 💪", btnClass: "border-green-400/40 bg-green-500/15 text-green-300 hover:bg-green-500/25" },
];

const BAR_COLOR = (s: number) =>
  s >= 70 ? "bg-green-400" : s >= 40 ? "bg-amber-400" : "bg-red-400";

const CHECK_ITEMS = [
  { label: "8+ chars 📏", test: (pw: string) => pw.length >= 8 },
  { label: "Uppercase 🔠", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "Lowercase 🔡", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "Numbers 🔢", test: (pw: string) => /[0-9]/.test(pw) },
  { label: "Symbols ✨", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

export default function PasswordStrengthTesterGame({ guideImage, guideName, onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const challenge = CHALLENGES[round];
  const strength = calcStrength(challenge.password);

  const handlePick = (rating: number) => {
    if (picked !== null) return;
    setPicked(rating);
    const correct = rating === challenge.rating;
    if (correct) setScore((s) => s + 1);
    setTimeout(() => setShowReveal(true), 300);
    setTimeout(() => {
      if (round < CHALLENGES.length - 1) {
        setRound((r) => r + 1);
        setPicked(null);
        setShowReveal(false);
      } else {
        setDone(true);
      }
    }, 2800);
  };

  if (done) {
    const stars = score === 4 ? 3 : score >= 2 ? 2 : 1;
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4"
      >
        <div className="text-5xl">🔐</div>
        <h2 className="text-xl font-black text-white">{score}/4 passwords rated!</h2>
        <p className="text-sm font-bold text-purple-300">
          {score === 4
            ? "Perfect! You can spot a weak password from a mile away! 🦸"
            : score >= 2
            ? "Good eye! You know what makes passwords weak or strong."
            : "Passwords are sneaky! Look for uppercase, symbols, numbers, and length."}
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
          onClick={() => onComplete(score >= 2)}
          className="w-full rounded-2xl py-4 font-black text-[#080c18] transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}
        >
          Continue →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="py-2 space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-purple-400"
            animate={{ width: `${(round / CHALLENGES.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{CHALLENGES.length}</span>
      </div>

      <p className="text-xs font-extrabold text-purple-400 text-center tracking-wider">🔐 STRENGTH TESTER</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Password display */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4 text-center">
            <p className="text-[10px] text-gray-400 mb-2 font-bold tracking-widest uppercase">
              Rate this password:
            </p>
            <p className="font-mono text-2xl font-black text-white tracking-wider mb-4 break-all">
              {challenge.password}
            </p>

            {/* Strength bar — hidden until reveal */}
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden mb-1.5">
              {showReveal ? (
                <motion.div
                  className={`h-full rounded-full ${BAR_COLOR(strength)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${strength}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              ) : null}
            </div>
            <p className="text-[10px] text-white/30 font-medium">
              {showReveal ? `${strength}% strength` : "Rate it first to reveal the score..."}
            </p>
          </div>

          {/* Checklist breakdown — revealed after pick */}
          <AnimatePresence>
            {showReveal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 mb-4"
              >
                <div className="flex flex-wrap gap-2 justify-center mb-2.5">
                  {CHECK_ITEMS.map((item, i) => {
                    const passes = item.test(challenge.password);
                    return (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.08, type: "spring", bounce: 0.5 }}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          passes
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/15 text-red-300 opacity-60"
                        }`}
                      >
                        {passes ? "✓" : "✗"} {item.label}
                      </motion.span>
                    );
                  })}
                </div>
                <p className="text-xs text-white/60 text-center leading-relaxed">
                  {challenge.lesson}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rating buttons */}
          <div className="grid grid-cols-3 gap-2">
            {RATINGS.map((r, i) => {
              const isPicked = picked === i;
              const isCorrect = isPicked && i === challenge.rating;
              const isWrong = isPicked && i !== challenge.rating;
              const revealCorrect = picked !== null && i === challenge.rating && !isPicked;
              return (
                <motion.button
                  key={i}
                  whileTap={picked === null ? { scale: 0.95 } : {}}
                  onClick={() => handlePick(i)}
                  disabled={picked !== null}
                  className={`rounded-2xl border-2 py-3.5 text-xs font-black transition-all ${
                    isCorrect
                      ? "border-green-400 bg-green-500/25 text-green-200"
                      : isWrong
                      ? "border-red-400 bg-red-500/20 text-red-300"
                      : revealCorrect
                      ? "border-green-400/50 bg-green-500/15 text-green-300"
                      : picked !== null
                      ? "border-white/5 bg-white/[0.02] opacity-30"
                      : r.btnClass
                  }`}
                >
                  {isCorrect ? "✓ " : isWrong ? "✗ " : ""}{r.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
