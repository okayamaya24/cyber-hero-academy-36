/**
 * LoginDetectiveGame — Hero Lesson 2: Cyber Clues & Digital Trails
 * Show 5 login records. Tap NORMAL or SUSPICIOUS for each.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

const LOGINS = [
  {
    location: "📍 New York, NY",
    time: "Today at 4:15 PM",
    device: "Chrome on your laptop",
    suspicious: false,
    clue: "This looks like a normal login — your usual city, your usual device, at a normal time. ✅",
  },
  {
    location: "📍 Moscow, Russia",
    time: "Today at 4:16 PM",
    device: "Unknown device",
    suspicious: true,
    clue: "⚠️ Same minute as your last login but from another country on an unknown device — someone else is in your account!",
  },
  {
    location: "📍 New York, NY",
    time: "Yesterday at 7:30 PM",
    device: "Safari on your phone",
    suspicious: false,
    clue: "Your city, your phone, a normal evening time. This is you! ✅",
  },
  {
    location: "📍 Unknown Location",
    time: "3 days ago at 2:47 AM",
    device: "Tor Browser",
    suspicious: true,
    clue: "⚠️ Unknown location, middle of the night, on a Tor browser — these are major red flags! Change your password immediately.",
  },
  {
    location: "📍 New York, NY",
    time: "Today at 9:05 AM",
    device: "Chrome on school tablet",
    suspicious: false,
    clue: "Your city, a school device, morning time — you logging in at school. Totally normal! ✅",
  },
];

export default function LoginDetectiveGame({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const login = LOGINS[round];

  const handleAnswer = (guessSuspicious: boolean) => {
    if (result !== null) return;
    const correct = guessSuspicious === login.suspicious;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round < LOGINS.length - 1) {
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
        <div className="text-5xl">🕵️</div>
        <h2 className="text-xl font-black text-white">{score}/{LOGINS.length} flagged correctly!</h2>
        <p className="text-sm font-bold text-purple-300">
          {score === 5 ? "Perfect detective work! You'd spot a hacker instantly! 🦸" :
           score >= 3 ? "Good instincts! Watch for unknown locations and weird times." :
           "Tricky! Look for: unknown cities, odd hours, and unfamiliar devices."}
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
          style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
          Continue →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="py-2 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-purple-400"
            animate={{ width: `${(round / LOGINS.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{LOGINS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-purple-400 text-center tracking-wider">🔍 LOGIN DETECTIVE</p>

      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.2 }}>

          <div className={`rounded-2xl border-2 overflow-hidden mb-3 transition-colors ${
            result === "correct" ? "border-green-400" :
            result === "wrong" ? "border-red-400" : "border-white/10"
          }`}>
            <div className="bg-white/8 border-b border-white/10 px-4 py-2.5">
              <p className="text-[10px] font-extrabold text-purple-400 tracking-wider mb-1">🔐 ACCOUNT LOGIN ACTIVITY</p>
              <p className="text-base font-black text-white">{login.location}</p>
            </div>
            <div className="px-4 py-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14 flex-shrink-0">Time:</span>
                <span className="text-xs font-bold text-white">{login.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14 flex-shrink-0">Device:</span>
                <span className="text-xs font-bold text-white">{login.device}</span>
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
                {result === "correct" ? "✓ " : "✗ "}{login.clue}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(false)}
                className="rounded-2xl border-2 border-green-400/40 bg-green-500/15 py-4 font-black text-green-300 text-sm hover:bg-green-500/25 transition-colors">
                ✅ Normal
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(true)}
                className="rounded-2xl border-2 border-red-400/40 bg-red-500/15 py-4 font-black text-red-300 text-sm hover:bg-red-500/25 transition-colors">
                🚨 Suspicious!
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
