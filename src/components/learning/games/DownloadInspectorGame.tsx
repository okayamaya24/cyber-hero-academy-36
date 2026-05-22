/**
 * DownloadInspectorGame — Robo Buddy Lesson 3
 * Show 5 download scenarios. Tap SAFE ✅ or TRAP 🚨.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; childAge?: number; }

const SCENARIOS = [
  {
    site: "🌐 minecraft.net",
    filename: "Minecraft_Installer.exe",
    details: "Official Minecraft website • File size: 42 MB • Version 1.21.1 • Download button clearly labelled",
    isTrap: false,
    clue: "Official website, correct domain, clear file info — this is a safe, legit download! ✅",
  },
  {
    site: "🌐 free-games-download.net",
    filename: "FreeGame_FULL_VERSION.exe",
    details: "🎉 FREE full version! Click DOWNLOAD NOW ⬇️⬇️⬇️ (3 different download buttons on the page)",
    isTrap: true,
    clue: "Multiple fake download buttons + unofficial site = classic malware trap! Only download games from official stores. 🚨",
  },
  {
    site: "🌐 apps.apple.com",
    filename: "Duolingo (App Store)",
    details: "Apple App Store • Duolingo Inc. • 500M+ downloads • 4.8 stars • Free",
    isTrap: false,
    clue: "Official App Store download from a verified developer — totally safe! ✅",
  },
  {
    site: "🌐 homework-help-tools.com",
    filename: "HomeworkHelper.pdf.exe",
    details: "Install our free homework helper! Disable your antivirus first — it gives a false positive ⚠️",
    isTrap: true,
    clue: "Double extension (.pdf.exe hides it's a program), unofficial site, AND asking you to disable antivirus = major red flags! 🚨",
  },
  {
    site: "📧 Email Attachment",
    filename: "SchoolProject_Notes.zip",
    details: "From: bestfriend@gmail.com | 'Hey check out these notes I found for our project!'",
    isTrap: true,
    clue: "Even files from friends can carry malware — their account could be hacked! Always scan attachments before opening. 🚨",
  },
];

export default function DownloadInspectorGame({ onComplete, childAge }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showClue, setShowClue] = useState(false);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[round];

  const handleAnswer = (guessTrap: boolean) => {
    if (result !== null) return;
    const correct = guessTrap === scenario.isTrap;
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
    }, 2400);
  };

  if (done) {
    const stars = score === 5 ? 3 : score >= 3 ? 2 : 1;
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4"
      >
        <div className="text-5xl">{stars === 3 ? "🏆" : stars === 2 ? "📥" : "🤖"}</div>
        <h2 className="text-xl font-black text-white">{score}/{SCENARIOS.length} traps spotted!</h2>
        <p className="text-sm text-cyan-300 font-bold">
          {score === 5
            ? "PERFECT! You're a certified Download Detective! Robo Buddy approves. 🤖"
            : score >= 3
            ? "Good instincts! Watch out for double extensions and unofficial sites."
            : "Sneaky traps! Remember: official stores, no antivirus disabling, scan everything."}
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
          style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)" }}
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
            className="h-full rounded-full bg-cyan-400"
            animate={{ width: `${(round / SCENARIOS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{SCENARIOS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-cyan-400 text-center tracking-wider">📥 SAFE DOWNLOAD OR TRAP?</p>

      {/* Download card */}
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
          {/* Header */}
          <div className="bg-white/8 border-b border-white/10 px-4 py-3">
            <p className="text-[10px] text-gray-400 font-mono">{scenario.site}</p>
            <p className="text-sm font-black text-white mt-0.5 font-mono">{scenario.filename}</p>
          </div>
          {/* Details */}
          <div className="px-4 py-4" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-xs text-white/70 leading-relaxed">{scenario.details}</p>
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
            🚨 TRAP!
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(false)}
            className="rounded-2xl border-2 border-green-400/40 bg-green-500/15 py-4 font-black text-green-300 text-sm hover:bg-green-500/25 transition-colors"
          >
            ✅ SAFE!
          </motion.button>
        </div>
      )}
    </div>
  );
}
