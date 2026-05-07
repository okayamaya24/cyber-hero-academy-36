/**
 * UrlDetectiveGame — Whiskers Lesson 2
 * 4 rounds: spot the real/safe URL from 4 options.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

const ROUNDS = [
  {
    question: "You want to pay with PayPal. Which URL is the REAL one?",
    options: ["www.paypa1.com", "www.paypal.com", "www.paypal-secure.com", "www.paypal.verify-login.net"],
    correct: 1,
    explain: "'paypa1.com' swaps 'l' for '1'! The real PayPal is paypal.com with nothing extra added.",
  },
  {
    question: "You want to search something. Which URL is actually Google?",
    options: ["go0gle.com", "google-login.com", "google.com", "google.com.phish.net"],
    correct: 2,
    explain: "The real Google is simply google.com. Swapped letters, extra words, and .net after .com are all fake tricks!",
  },
  {
    question: "You want to shop on Amazon. Which URL is SAFE to click?",
    options: ["amaz0n.com", "amazon.com", "amazon-deals-verify.com", "amazon.shopping-secure.net"],
    correct: 1,
    explain: "amazon.com is the only real one. '0' instead of 'o', extra words, and .net endings are phishing tricks!",
  },
  {
    question: "You want to play Roblox. Which website address is the real one?",
    options: ["roblox.com", "robIox.com", "roblox-free-robux.com", "roblox.com.login-now.net"],
    correct: 0,
    explain: "roblox.com is correct. 'robIox' uses capital I instead of lowercase l, free-robux is a scam, and .com.login-now.net adds a fake domain!",
  },
];

export default function UrlDetectiveGame({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = ROUNDS[round];

  const handlePick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round < ROUNDS.length - 1) {
        setRound((r) => r + 1);
        setSelected(null);
      } else {
        setDone(true);
      }
    }, 2000);
  };

  if (done) {
    const stars = score === 4 ? 3 : score >= 2 ? 2 : 1;
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4"
      >
        <div className="text-5xl">{stars === 3 ? "🔍" : "🕵️"}</div>
        <h2 className="text-xl font-black text-white">{score}/4 URLs spotted!</h2>
        <p className="text-sm text-amber-300 font-bold">
          {score === 4
            ? "Master URL Detective! Whiskers gives you a paw bump! 🐱"
            : score >= 2
            ? "Good detective work! Slow down and check every letter."
            : "Scammers are sneaky! Always read URLs letter by letter."}
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
          style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}
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
            className="h-full rounded-full bg-amber-400"
            animate={{ width: `${(round / ROUNDS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{ROUNDS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-amber-400 text-center tracking-wider">🕵️ URL DETECTIVE</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm font-black text-white text-center mb-3 leading-snug">{q.question}</p>

          <div className="space-y-2">
            {q.options.map((url, idx) => {
              const isPicked = selected === idx;
              const isCorrect = isPicked && idx === q.correct;
              const isWrong = isPicked && idx !== q.correct;
              const revealCorrect = selected !== null && idx === q.correct && !isPicked;

              return (
                <motion.button
                  key={idx}
                  whileTap={selected === null ? { scale: 0.97 } : {}}
                  onClick={() => handlePick(idx)}
                  disabled={selected !== null}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 font-mono text-sm transition-all ${
                    isCorrect
                      ? "border-green-400 bg-green-500/20 text-green-300"
                      : isWrong
                      ? "border-red-400 bg-red-500/15 text-red-300"
                      : revealCorrect
                      ? "border-green-400/60 bg-green-500/10 text-green-300"
                      : selected !== null
                      ? "border-white/5 bg-white/[0.02] text-white/25"
                      : "border-amber-400/20 bg-amber-500/8 text-amber-100 hover:border-amber-400/50"
                  }`}
                >
                  <span className="mr-2 font-sans">
                    {isCorrect ? "✓" : isWrong ? "✗" : revealCorrect ? "✓" : "•"}
                  </span>
                  {url}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`mt-3 rounded-xl px-3 py-2.5 text-xs font-semibold leading-relaxed ${
                  selected === q.correct
                    ? "bg-green-500/15 border border-green-400/30 text-green-300"
                    : "bg-red-500/15 border border-red-400/30 text-red-300"
                }`}
              >
                {selected === q.correct ? "✓ " : "✗ "}{q.explain}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
