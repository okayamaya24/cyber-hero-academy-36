/**
 * SuspiciousTextGame — Whiskers Lesson 3: Suspicious Messages
 * Show 5 text messages styled as SMS bubbles. Tap REAL or SCAM.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

const TEXTS = [
  {
    sender: "WALMART",
    message: "Your order #WM4821 has shipped and is on its way! Track your delivery: walmart.com/track",
    isScam: false,
    clue: "Calm tone, a real store name, and a link to the actual website. This is a genuine shipping notification. ✅",
  },
  {
    sender: "+1 (800) 555-4729",
    message: "URGENT: Your bank account has been LOCKED due to suspicious activity. Call 1-800-555-4729 NOW to unlock or lose access forever!",
    isScam: true,
    clue: "🚨 Banks NEVER send threatening texts like this! Urgent language + random phone number = smishing scam. Call your bank directly using the number on your card.",
  },
  {
    sender: "Mom 💛",
    message: "Hey! Can you pick up milk and bread on your way home? We're out! Thanks sweetheart ❤️",
    isScam: false,
    clue: "A text from someone you know asking for something normal. Nothing suspicious here! ✅",
  },
  {
    sender: "+44 7911 112233",
    message: "🎁 Congratulations! You've been selected for a FREE $500 Amazon gift card! Claim in 10 mins: bit.ly/fr33gift99",
    isScam: true,
    clue: "🚨 You didn't enter any contest! Random international number, 'free' prizes, and a suspicious shortened link are all scam red flags.",
  },
  {
    sender: "Riverside School",
    message: "Reminder: Picture Day is this Friday! Please make sure students wear their best outfits. 📸 Questions? Call the office at (555) 867-5309.",
    isScam: false,
    clue: "Clear sender name, simple reminder, no links to click, and a real school phone number. Normal school communication! ✅",
  },
];

export default function SuspiciousTextGame({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const text = TEXTS[round];

  const handleAnswer = (guessScam: boolean) => {
    if (result !== null) return;
    const correct = guessScam === text.isScam;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round < TEXTS.length - 1) {
        setRound((r) => r + 1);
        setResult(null);
      } else {
        setDone(true);
      }
    }, 2200);
  };

  if (done) {
    const stars = score === 5 ? 3 : score >= 3 ? 2 : 1;
    return (
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4">
        <div className="text-5xl">📱</div>
        <h2 className="text-xl font-black text-white">{score}/{TEXTS.length} texts spotted!</h2>
        <p className="text-sm font-bold text-amber-300">
          {score === 5 ? "Text scam master! Detective Whiskers is impressed! 🐱" :
           score >= 3 ? "Good detective work! Watch for urgency, prizes, and weird numbers." :
           "Scam texts are sneaky! Random numbers + urgency + prizes = scam."}
        </p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15, type: "spring", bounce: 0.7 }}>
              <span className={`text-3xl ${i < stars ? "" : "grayscale opacity-30"}`}>⭐</span>
            </motion.div>
          ))}
        </div>
        <button onClick={onComplete}
          className="w-full rounded-2xl py-4 font-black text-[#080c18] transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
          Continue →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="py-2 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-amber-400"
            animate={{ width: `${(round / TEXTS.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{TEXTS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-amber-400 text-center tracking-wider">📱 TEXT OR TRASH?</p>

      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* SMS mockup */}
          <div className={`rounded-2xl border-2 overflow-hidden mb-3 transition-colors ${
            result === "correct" ? "border-green-400" :
            result === "wrong" ? "border-red-400" : "border-white/10"
          }`}>
            {/* Contact bar */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/8 border-b border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                {text.sender[0]}
              </div>
              <div>
                <p className="text-xs font-black text-white">{text.sender}</p>
                <p className="text-[10px] text-gray-400">Text Message</p>
              </div>
            </div>
            {/* Message bubble */}
            <div className="px-4 py-4" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 border border-white/10 px-4 py-3">
                  <p className="text-sm text-white/85 leading-relaxed">{text.message}</p>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold leading-relaxed mb-3 ${
                  result === "correct"
                    ? "bg-green-500/15 border border-green-400/30 text-green-300"
                    : "bg-red-500/15 border border-red-400/30 text-red-300"
                }`}>
                {result === "correct" ? "✓ " : "✗ "}{text.clue}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(false)}
                className="rounded-2xl border-2 border-green-400/40 bg-green-500/15 py-4 font-black text-green-300 text-sm hover:bg-green-500/25 transition-colors">
                ✅ Real Text
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(true)}
                className="rounded-2xl border-2 border-red-400/40 bg-red-500/15 py-4 font-black text-red-300 text-sm hover:bg-red-500/25 transition-colors">
                🗑️ Scam!
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
