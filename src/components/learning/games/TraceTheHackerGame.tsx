/**
 * TraceTheHackerGame — Hero Lesson 2: Cyber Clues & Digital Trails
 * Players sort digital clues as SAFE or SUSPICIOUS across 4 rounds.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

interface Clue {
  emoji: string;
  title: string;
  detail: string;
  suspicious: boolean;
  explanation: string;
}

const ROUNDS: { roundTitle: string; icon: string; description: string; clues: Clue[] }[] = [
  {
    roundTitle: "Website Detective",
    icon: "🌐",
    description: "Is this website safe or suspicious?",
    clues: [
      {
        emoji: "🔒",
        title: "https://mybank.com",
        detail: "Lock icon + https:// — official bank website",
        suspicious: false,
        explanation: "✅ The lock icon and https:// mean the connection is encrypted and secure.",
      },
      {
        emoji: "⚠️",
        title: "http://myb4nk-login.com",
        detail: "No lock, weird spelling with a number '4'",
        suspicious: true,
        explanation: "🚨 Fake URL! Real banks never use numbers instead of letters. This is a phishing site!",
      },
      {
        emoji: "🔒",
        title: "https://google.com",
        detail: "Lock icon, well-known domain, no typos",
        suspicious: false,
        explanation: "✅ Secure connection, no typos, trusted domain — totally safe!",
      },
    ],
  },
  {
    roundTitle: "Message Scanner",
    icon: "💬",
    description: "Is this message safe or a scam?",
    clues: [
      {
        emoji: "🎁",
        title: "\"You won a FREE iPhone!\"",
        detail: "From a stranger. Click here to claim your prize!!!",
        suspicious: true,
        explanation: "🚨 Nobody gives away free iPhones to strangers! This is a classic scam to steal your info.",
      },
      {
        emoji: "📚",
        title: "\"Hi, homework reminder!\"",
        detail: "From your teacher's school email account",
        suspicious: false,
        explanation: "✅ A message from your teacher's real school email is perfectly normal and safe.",
      },
      {
        emoji: "🔑",
        title: "\"Send me your password\"",
        detail: "Even if it claims to be from a friend or admin",
        suspicious: true,
        explanation: "🚨 NEVER share your password! No real person — not even admins — needs your password.",
      },
    ],
  },
  {
    roundTitle: "Download Inspection",
    icon: "📥",
    description: "Safe to download or dangerous?",
    clues: [
      {
        emoji: "🎮",
        title: "\"Free Game Hack v9.exe\"",
        detail: "Random website, promises unlimited coins for free",
        suspicious: true,
        explanation: "🚨 .exe files from unknown sites are a top way hackers spread viruses. Never download these!",
      },
      {
        emoji: "📄",
        title: "Science Project PDF",
        detail: "Shared by your teacher on the school portal",
        suspicious: false,
        explanation: "✅ PDFs from your school's official portal are safe — that's what schools use!",
      },
      {
        emoji: "💾",
        title: "USB drive found on the ground",
        detail: "Someone left it in the hallway — curious what's on it?",
        suspicious: true,
        explanation: "🚨 Hackers leave infected USB drives in public on purpose! Never plug in a found USB drive.",
      },
    ],
  },
  {
    roundTitle: "Hidden Clue Hunt",
    icon: "🔍",
    description: "Spot the sneaky hacker clue!",
    clues: [
      {
        emoji: "🌍",
        title: "Login from Tokyo at 3 AM",
        detail: "You live in New York and you're asleep right now",
        suspicious: true,
        explanation: "🚨 A login from another country while you're asleep? That's a hacker! Change your password NOW.",
      },
      {
        emoji: "📧",
        title: "Email from support@amazon.com",
        detail: "Order confirmation with your correct name and address",
        suspicious: false,
        explanation: "✅ Official domain, your correct info — this is a real Amazon email.",
      },
      {
        emoji: "💳",
        title: "Pop-up: \"Enter card to verify age\"",
        detail: "Appears on a free kids' game site out of nowhere",
        suspicious: true,
        explanation: "🚨 Free kids' games never need your credit card! This is a scam to steal payment info.",
      },
    ],
  },
];

export default function TraceTheHackerGame({ onComplete }: Props) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [clueIdx, setClueIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const round = ROUNDS[roundIdx];
  const clue = round.clues[clueIdx];
  const totalClues = ROUNDS.reduce((acc, r) => acc + r.clues.length, 0);
  const completedClues = ROUNDS.slice(0, roundIdx).reduce((acc, r) => acc + r.clues.length, 0) + clueIdx;

  function handleAnswer(guessSuspicious: boolean) {
    if (result !== null) return;
    const correct = guessSuspicious === clue.suspicious;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      setResult(null);
      const nextClueIdx = clueIdx + 1;
      if (nextClueIdx < round.clues.length) {
        setClueIdx(nextClueIdx);
      } else {
        const nextRoundIdx = roundIdx + 1;
        if (nextRoundIdx < ROUNDS.length) {
          setRoundIdx(nextRoundIdx);
          setClueIdx(0);
        } else {
          setDone(true);
        }
      }
    }, 1800);
  }

  if (done) {
    const pct = Math.round((score / totalClues) * 100);
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="flex flex-col items-center gap-5 py-6 text-center"
      >
        <div className="text-6xl">{pct >= 70 ? "🕵️" : "🔍"}</div>
        <div>
          <h3 className="text-xl font-black text-white mb-1">
            {pct >= 70 ? "Case Closed! 🎉" : "Keep Investigating!"}
          </h3>
          <p className="text-white/60 text-sm">
            {score}/{totalClues} clues cracked — {pct}% detective accuracy
          </p>
        </div>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs font-bold text-cyan-400 mb-1">🏅 Cyber Detective Skill</p>
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <p className="text-[10px] text-white/40 mt-1 text-right">{pct}%</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          className="w-full rounded-2xl py-3.5 font-black text-white text-sm"
          style={{ background: "linear-gradient(135deg, #08b6aa, #08b6aa88)" }}
        >
          Continue →
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Overall progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-cyan-400"
            animate={{ width: `${(completedClues / totalClues) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/40">{completedClues}/{totalClues}</span>
      </div>

      {/* Round badge */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{round.icon}</span>
        <div>
          <p className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
            Round {roundIdx + 1} — {round.roundTitle}
          </p>
          <p className="text-white/50 text-xs">{round.description}</p>
        </div>
      </div>

      {/* Clue card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${roundIdx}-${clueIdx}`}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl border-2 p-4 transition-all ${
            result === "correct"
              ? "border-green-400 bg-green-400/10"
              : result === "wrong"
              ? "border-red-400 bg-red-400/10"
              : "border-white/15 bg-white/5"
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{clue.emoji}</span>
            <div>
              <p className="font-black text-white text-sm leading-snug">{clue.title}</p>
              <p className="text-white/50 text-xs mt-0.5">{clue.detail}</p>
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-xs font-semibold rounded-xl px-3 py-2 mb-2 ${
                  result === "correct"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/15 text-red-300"
                }`}
              >
                {result === "correct" ? "🎯 Correct! " : "💡 "}
                {clue.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          {result === null && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAnswer(false)}
                className="rounded-xl py-2.5 font-black text-sm text-white border-2 border-green-400/40 bg-green-500/15 hover:bg-green-500/25 transition-colors"
              >
                ✅ SAFE
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAnswer(true)}
                className="rounded-xl py-2.5 font-black text-sm text-white border-2 border-red-400/40 bg-red-500/15 hover:bg-red-500/25 transition-colors"
              >
                🚨 SUSPICIOUS
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Score */}
      <div className="flex justify-center gap-1">
        {Array.from({ length: totalClues }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < completedClues + (result === "correct" ? 1 : 0)
                ? "bg-cyan-400 w-4"
                : "bg-white/15 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
