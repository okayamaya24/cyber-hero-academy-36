/**
 * PhishingSwipeGame — Whiskers Lesson 1
 * Show 5 messages one at a time. Tap "PHISH" or "REAL".
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

const SCENARIOS = [
  {
    from: "security@robIox-verify.com",
    subject: "⚠️ URGENT: Your account will be BANNED",
    body: "Your ROBLOX account violated our terms. Verify your password immediately at robIox-verify.com or your account will be deleted in 24 hours!",
    isPhish: true,
    clue: "Look at the email address — 'robIox' uses a capital I, not the letter L! Real companies also never threaten you by email.",
  },
  {
    from: "orders@amazon.com",
    subject: "Your order #92847 has shipped!",
    body: "Great news! Your order has shipped and will arrive by Friday. Track your package at amazon.com/orders",
    isPhish: false,
    clue: "The sender is really amazon.com, there's no scary urgency, and the link goes to the real Amazon site. Looks legit! ✅",
  },
  {
    from: "noreply@winner-prize.net",
    subject: "🎉 YOU WON an iPhone! Claim in 5 minutes!",
    body: "Congratulations! You've been randomly selected to receive a FREE iPhone 15! Click here NOW to claim your prize — timer is running out!",
    isPhish: true,
    clue: "You didn't enter any contest! Fake urgency ('5 minutes!') and too-good-to-be-true prizes are classic phishing tricks. 🎣",
  },
  {
    from: "library@cityschool.edu",
    subject: "Book Return Reminder",
    body: "Hi there! Just a reminder that 'Amazing Space Facts' is due back at the library on Monday. No fines if returned on time!",
    isPhish: false,
    clue: "Calm tone, no scary urgency, no suspicious links, and from a real .edu address. This is a normal school email! ✅",
  },
  {
    from: "billing@netfl1x-help.com",
    subject: "ACTION REQUIRED: Update your payment",
    body: "Your Netflix subscription has a payment issue. Update your billing information immediately or your account will be suspended today.",
    isPhish: true,
    clue: "The sender is 'netfl1x-help.com' — not netflix.com! The number 1 replaces the letter L. Real Netflix never emails from other domains.",
  },
];

export default function PhishingSwipeGame({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showClue, setShowClue] = useState(false);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[round];

  const handleAnswer = (guessPhish: boolean) => {
    if (result !== null) return;
    const correct = guessPhish === scenario.isPhish;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setShowClue(true);

    setTimeout(() => {
      if (round < SCENARIOS.length - 1) {
        setRound((r) => r + 1);
        setResult(null);
        setShowClue(false);
      } else {
        setDone(true);
      }
    }, 2200);
  };

  if (done) {
    const stars = score === 5 ? 3 : score >= 3 ? 2 : 1;
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4"
      >
        <div className="text-5xl">{stars === 3 ? "🏆" : stars === 2 ? "🥈" : "🎣"}</div>
        <h2 className="text-xl font-black text-white">{score}/{SCENARIOS.length} phishes caught!</h2>
        <p className="text-sm text-amber-300 font-bold">
          {score === 5
            ? "PERFECT! Whiskers is so proud of you! 🐱"
            : score >= 3
            ? "Nice detective work! Keep an eye on those sneaky clues."
            : "Scammers are tricky! Check the sender address and look for urgency."}
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
            animate={{ width: `${(round / SCENARIOS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{SCENARIOS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-amber-400 text-center tracking-wider">🎣 PHISH OR REAL?</p>

      {/* Email card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`rounded-2xl border-2 overflow-hidden transition-colors ${
            result === "correct"
              ? "border-green-400"
              : result === "wrong"
              ? "border-red-400"
              : "border-white/10"
          }`}
        >
          {/* Email header */}
          <div className="bg-white/8 border-b border-white/10 px-4 py-3">
            <p className="text-[10px] text-gray-400 font-mono truncate">From: {scenario.from}</p>
            <p className="text-sm font-black text-white mt-0.5 leading-tight">{scenario.subject}</p>
          </div>
          <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs text-white/70 leading-relaxed">{scenario.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Clue reveal */}
      <AnimatePresence>
        {showClue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={`rounded-xl px-3 py-2.5 text-xs font-semibold leading-relaxed ${
              result === "correct"
                ? "bg-green-500/15 border border-green-400/30 text-green-300"
                : "bg-red-500/15 border border-red-400/30 text-red-300"
            }`}
          >
            {result === "correct" ? "✓ " : "✗ "}{scenario.clue}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {!result && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(true)}
            className="rounded-2xl border-2 border-red-400/40 bg-red-500/15 py-4 font-black text-red-300 text-sm hover:bg-red-500/25 transition-colors"
          >
            🎣 PHISH!
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(false)}
            className="rounded-2xl border-2 border-green-400/40 bg-green-500/15 py-4 font-black text-green-300 text-sm hover:bg-green-500/25 transition-colors"
          >
            ✅ REAL!
          </motion.button>
        </div>
      )}
    </div>
  );
}
