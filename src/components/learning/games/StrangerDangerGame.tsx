/**
 * StrangerDangerGame — Robo Buddy Lesson 2
 * Show 5 online messages/scenarios. Tap SAFE 🟢 or DANGER 🔴.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; childAge?: number; }

const SCENARIOS = [
  {
    platform: "💬 Online Game Chat",
    username: "CoolGamer99",
    message: "Hey! Great game! Want to team up again sometime? 🎮",
    isDanger: false,
    clue: "Friendly game chat with no personal questions — totally normal! Just keep it in the game. ✅",
  },
  {
    platform: "💬 Online Chat",
    username: "FriendlyStranger",
    message: "You seem really cool! What school do you go to? And what's your real name? 😊",
    isDanger: true,
    clue: "Asking for your school AND real name is a big warning sign. Never share this with online strangers! 🚩",
  },
  {
    platform: "📱 Direct Message",
    username: "Unknown_User_44",
    message: "I got you a FREE gift card! Just tell me your address so I can send it 🎁",
    isDanger: true,
    clue: "Offering gifts to get your address is a classic grooming trick. Never share where you live! 🚩",
  },
  {
    platform: "🎮 Game Lobby",
    username: "ProPlayer2024",
    message: "Nice moves! Have you tried the new map? It just dropped yesterday.",
    isDanger: false,
    clue: "Talking about the game — no personal questions, no pressure. Normal game chat! ✅",
  },
  {
    platform: "💬 Online Chat",
    username: "TotallyAKid123",
    message: "Don't tell your parents we talk, OK? It'll be our little secret 🤫",
    isDanger: true,
    clue: "Anyone asking you to keep secrets from your parents is a MAJOR danger sign. Tell a trusted adult right away! 🚨",
  },
];

export default function StrangerDangerGame({ onComplete, childAge }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [showClue, setShowClue] = useState(false);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[round];

  const handleAnswer = (guessDanger: boolean) => {
    if (result !== null) return;
    const correct = guessDanger === scenario.isDanger;
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
        <div className="text-5xl">{stars === 3 ? "🏆" : stars === 2 ? "🛡️" : "🤖"}</div>
        <h2 className="text-xl font-black text-white">{score}/{SCENARIOS.length} caught!</h2>
        <p className="text-sm text-cyan-300 font-bold">
          {score === 5
            ? "PERFECT! Robo Buddy is impressed — you're a stranger danger expert! 🤖"
            : score >= 3
            ? "Nice work! Keep watching for those sneaky warning signs."
            : "Tricky ones! Remember: secrets from parents and personal questions are always red flags!"}
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

      <p className="text-xs font-extrabold text-cyan-400 text-center tracking-wider">👤 SAFE OR DANGER?</p>

      {/* Message card */}
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
            <p className="text-[10px] text-gray-400 font-mono">{scenario.platform}</p>
            <p className="text-sm font-black text-white mt-0.5">@{scenario.username}</p>
          </div>
          {/* Message */}
          <div className="px-4 py-4" style={{ background: "rgba(255,255,255,0.03)" }}>
            <p className="text-sm text-white/80 leading-relaxed">"{scenario.message}"</p>
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
            🔴 DANGER!
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(false)}
            className="rounded-2xl border-2 border-green-400/40 bg-green-500/15 py-4 font-black text-green-300 text-sm hover:bg-green-500/25 transition-colors"
          >
            🟢 SAFE!
          </motion.button>
        </div>
      )}
    </div>
  );
}
