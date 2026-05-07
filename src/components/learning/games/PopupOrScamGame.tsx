/**
 * PopupOrScamGame — Hero Lesson 3: Defending Your Devices
 * Show 5 pop-up messages. Tap REAL or SCAM for each.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

const POPUPS = [
  {
    icon: "🍎",
    title: "macOS Software Update",
    body: "macOS 14.3 is now available. This update includes security fixes and performance improvements.",
    buttons: ["Later", "Install Now"],
    isScam: false,
    clue: "Real OS updates come from your system settings with calm, simple language and no scary warnings. ✅",
  },
  {
    icon: "⚠️",
    title: "CRITICAL VIRUS ALERT!!!",
    body: "YOUR COMPUTER HAS BEEN INFECTED WITH 5 VIRUSES! Your personal data is at risk! Call 1-800-FAKE-HELP IMMEDIATELY to protect yourself!",
    buttons: ["Call Now!", "OK"],
    isScam: true,
    clue: "🚨 Real antivirus never asks you to call a phone number! Exclamation marks, ALL CAPS, and scary language are scam tricks.",
  },
  {
    icon: "🌐",
    title: "Chrome",
    body: "news-site.com wants to send you notifications.",
    buttons: ["Block", "Allow"],
    isScam: false,
    clue: "This is a real browser notification request. Clicking 'Block' is always the safe choice for sites you don't know! ✅",
  },
  {
    icon: "🎉",
    title: "CONGRATULATIONS WINNER!!!",
    body: "You are the 1,000,000th visitor! You have WON a brand new iPhone 15! Click CLAIM YOUR PRIZE before it expires in 00:59!",
    buttons: ["CLAIM NOW!", "Close"],
    isScam: true,
    clue: "🚨 Countdown timers, 'you won!' messages, and prizes from random websites are always scams. Close the tab immediately!",
  },
  {
    icon: "🛡️",
    title: "Windows Security",
    body: "Microsoft Defender found a potentially unwanted app. We recommend you review it.",
    buttons: ["View details", "Dismiss"],
    isScam: false,
    clue: "Windows Security uses calm language, shows a shield icon, and lets you choose. It never demands you call anyone. ✅",
  },
];

export default function PopupOrScamGame({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const popup = POPUPS[round];

  const handleAnswer = (guessScam: boolean) => {
    if (result !== null) return;
    const correct = guessScam === popup.isScam;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round < POPUPS.length - 1) {
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
        <div className="text-5xl">🛡️</div>
        <h2 className="text-xl font-black text-white">{score}/{POPUPS.length} correctly spotted!</h2>
        <p className="text-sm font-bold text-purple-300">
          {score === 5 ? "No scam pop-up can fool you! You're a device defender! 🦸" :
           score >= 3 ? "Good eye! Watch for ALL CAPS, scary language, and phone numbers." :
           "Scams love urgency! Real alerts are calm — scams are LOUD and scary."}
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
            animate={{ width: `${(round / POPUPS.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{POPUPS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-purple-400 text-center tracking-wider">🖥️ POP-UP OR SCAM?</p>

      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* Pop-up mockup */}
          <div className={`rounded-2xl border-2 overflow-hidden mb-3 transition-colors ${
            result === "correct" ? "border-green-400" :
            result === "wrong" ? "border-red-400" : "border-white/15"
          }`}>
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border-b border-white/10">
              <span className="text-lg">{popup.icon}</span>
              <p className="text-sm font-black text-white flex-1">{popup.title}</p>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>
            </div>
            {/* Body */}
            <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-sm text-white/80 leading-relaxed mb-3">{popup.body}</p>
              <div className="flex gap-2 justify-end">
                {popup.buttons.map((btn, i) => (
                  <span key={i} className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                    i === popup.buttons.length - 1
                      ? "bg-purple-500/30 text-purple-200 border border-purple-400/30"
                      : "bg-white/8 text-white/50 border border-white/10"
                  }`}>
                    {btn}
                  </span>
                ))}
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
                {result === "correct" ? "✓ " : "✗ "}{popup.clue}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(false)}
                className="rounded-2xl border-2 border-green-400/40 bg-green-500/15 py-4 font-black text-green-300 text-sm hover:bg-green-500/25 transition-colors">
                ✅ Real Pop-up
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(true)}
                className="rounded-2xl border-2 border-red-400/40 bg-red-500/15 py-4 font-black text-red-300 text-sm hover:bg-red-500/25 transition-colors">
                🚨 Scam!
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
