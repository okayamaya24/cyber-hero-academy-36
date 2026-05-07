/**
 * PasswordAttentionGame
 *
 * 3-round comprehension game for Lesson 1: Passwords & Staying Secure
 * Directly tests recall of Byte's script scenes 2, 3 & 4.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: (score: number) => void;
}

/* ── Confetti ── */
function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#a855f7","#f59e0b","#10b981","#3b82f6","#ec4899"][i % 5],
    delay: Math.random() * 0.3,
    size: 6 + Math.random() * 7,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {pieces.map((p) => (
        <motion.div key={p.id} className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: -10, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: -10, opacity: 1 }}
          animate={{ y: 500, opacity: [1, 1, 0] }}
          transition={{ duration: 1.5, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/* ── Round badge ── */
function RoundBadge({ round, total }: { round: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
          i < round ? "bg-purple-400" : i === round ? "bg-purple-400/50 animate-pulse" : "bg-white/10"
        }`} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════
   ROUND 1 — Scene 2 Recall
   "How fast can hackers crack password123?"
══════════════════════════════════ */
function Round1({ onAnswer }: { onAnswer: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const options = ["1 minute", "1 second", "1 hour", "1 whole day"];
  const correctIdx = 1;

  const handlePick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    setTimeout(() => onAnswer(idx === correctIdx), 1400);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Scene recreation */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-xl flex-shrink-0">🐱</div>
          <div className="flex-1 rounded-xl rounded-tl-sm bg-purple-900/60 border border-purple-400/30 px-3 py-2">
            <p className="text-[10px] font-extrabold text-purple-400 mb-0.5">Byte says:</p>
            <p className="text-white text-xs font-bold italic">
              "See this? Password123. Hackers LOVE when people use this."
            </p>
          </div>
        </div>

        {/* Password field with red X */}
        <div className="rounded-xl bg-black/40 border border-red-500/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs font-mono tracking-wider">🔒 password123</span>
          </div>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-red-400 font-black text-lg"
          >✗</motion.span>
        </div>
        <div className="flex items-center gap-2 mt-2 px-1">
          <div className="flex-1 h-1.5 rounded-full bg-red-900/40 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-red-500"
              initial={{ width: "100%" }}
              animate={{ width: ["100%", "0%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <span className="text-[10px] text-red-400 font-bold">CRACKING…</span>
        </div>
      </motion.div>

      <p className="text-white font-black text-sm text-center">
        How fast did Byte say hackers can crack this? ⏱️
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        {options.map((opt, idx) => {
          const isPicked = picked === idx;
          const isCorrect = isPicked && idx === correctIdx;
          const isWrong = isPicked && idx !== correctIdx;
          const revealRight = picked !== null && idx === correctIdx && !isPicked;

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              whileHover={picked === null ? { scale: 1.03 } : {}}
              whileTap={picked === null ? { scale: 0.97 } : {}}
              onClick={() => handlePick(idx)}
              disabled={picked !== null}
              className={`rounded-2xl border-2 py-3 px-2 text-sm font-extrabold text-center transition-all ${
                isCorrect   ? "border-green-400 bg-green-500/20 text-green-300" :
                isWrong     ? "border-red-400 bg-red-500/15 text-red-300" :
                revealRight ? "border-green-400/60 bg-green-500/10 text-green-400" :
                picked !== null ? "border-white/5 text-white/20 bg-white/3" :
                "border-white/15 bg-white/5 text-white hover:border-purple-400/50"
              }`}
            >
              {isCorrect ? "⭐ " : isWrong ? "✗ " : ""}{opt}
            </motion.button>
          );
        })}
      </div>

      {picked !== null && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center text-xs font-bold ${picked === correctIdx ? "text-green-400" : "text-red-300"}`}
        >
          {picked === correctIdx
            ? "🎉 Yes! ONE second. That's why it's so dangerous!"
            : "❌ Actually, Byte said just ONE second! That's scary fast."}
        </motion.p>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   ROUND 2 — Scene 3 Inspection
   Tap everything that makes BlueFox$Dance7! strong
══════════════════════════════════ */
function Round2({ onAnswer }: { onAnswer: (correct: boolean) => void }) {
  const traits = [
    { id: "caps",    label: "Has CAPITAL letters",   emoji: "🔠", correct: true  },
    { id: "nums",    label: "Has numbers",            emoji: "🔢", correct: true  },
    { id: "syms",    label: "Has symbols ($!)",       emoji: "💥", correct: true  },
    { id: "long",    label: "Is long (16+ chars)",    emoji: "📏", correct: true  },
    { id: "name",    label: "Uses your real name",    emoji: "🙅", correct: false },
    { id: "common",  label: "Is easy to remember",    emoji: "🧠", correct: false },
  ];

  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const toggle = (id: string) => {
    if (submitted) return;
    setTapped((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const correctIds = traits.filter(t => t.correct).map(t => t.id);
    const wrongIds = traits.filter(t => !t.correct).map(t => t.id);
    const allCorrectTapped = correctIds.every(id => tapped.has(id));
    const noWrongTapped = wrongIds.every(id => !tapped.has(id));
    const perfect = allCorrectTapped && noWrongTapped;
    if (perfect) setShowConfetti(true);
    setTimeout(() => onAnswer(allCorrectTapped && noWrongTapped), 1800);
  };

  const canSubmit = tapped.size > 0 && !submitted;

  return (
    <div className="flex flex-col gap-4 relative">
      {showConfetti && <Confetti />}

      {/* Password display */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl bg-[#0d0d0d] border border-green-500/30 p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-xl flex-shrink-0">🐱</div>
          <div className="flex-1 rounded-xl rounded-tl-sm bg-purple-900/60 border border-purple-400/30 px-3 py-2">
            <p className="text-[10px] font-extrabold text-purple-400 mb-0.5">Byte says:</p>
            <p className="text-white text-xs font-bold italic">
              "NOW this is a strong password. The weirder the better!"
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-black/40 border border-green-500/50 px-4 py-3 flex items-center justify-between">
          <span className="text-green-300 text-sm font-mono font-bold tracking-wider">
            BlueFox$Dance7!
          </span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-green-400 font-black text-lg"
          >✓</motion.span>
        </div>
      </motion.div>

      <p className="text-white font-black text-sm text-center">
        Tap ALL the things that make this password strong 👇
      </p>

      <div className="grid grid-cols-2 gap-2">
        {traits.map((t, idx) => {
          const isTapped = tapped.has(t.id);
          const isCorrectAndTapped = submitted && t.correct && isTapped;
          const isMissed = submitted && t.correct && !isTapped;
          const isWrongTapped = submitted && !t.correct && isTapped;

          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.06 }}
              whileTap={!submitted ? { scale: 0.95 } : {}}
              onClick={() => toggle(t.id)}
              className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all ${
                isCorrectAndTapped ? "border-green-400 bg-green-500/20" :
                isWrongTapped      ? "border-red-400 bg-red-500/15" :
                isMissed           ? "border-yellow-400/60 bg-yellow-500/10" :
                isTapped           ? "border-purple-400 bg-purple-500/20" :
                "border-white/10 bg-white/5 hover:border-white/25"
              }`}
            >
              <span className="text-lg block mb-0.5">{t.emoji}</span>
              <span className={`text-[11px] font-bold block leading-tight ${
                isCorrectAndTapped ? "text-green-300" :
                isWrongTapped      ? "text-red-300" :
                isMissed           ? "text-yellow-300" :
                isTapped           ? "text-purple-300" :
                "text-white/70"
              }`}>
                {t.label}
              </span>
              {submitted && (
                <span className="text-[10px] font-black">
                  {isCorrectAndTapped ? " ✓" : isWrongTapped ? " ✗" : isMissed ? " ← missed!" : ""}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {!submitted && (
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-xl py-3 font-extrabold text-sm text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Check my answers →
        </motion.button>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   ROUND 3 — Scene 4 Golden Rule
   Complete Byte's sentence
══════════════════════════════════ */
function Round3({ onAnswer }: { onAnswer: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const options = [
    "Just your best friend 🤝",
    "Your parents only 👨‍👩‍👧",
    "NO ONE. Not even me! 🚫",
    "Your teacher at school 👩‍🏫",
  ];
  const correctIdx = 2;

  const handlePick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    setTimeout(() => onAnswer(idx === correctIdx), 1400);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Scene recreation */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl bg-[#0d0d0d] border border-purple-500/30 p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg"
            style={{ boxShadow: "0 0 20px rgba(168,85,247,0.5)" }}
          >
            🐱
          </motion.div>
          <div className="flex-1">
            <div className="rounded-xl rounded-tl-sm bg-purple-900/80 border border-purple-400/40 px-3 py-2.5">
              <p className="text-[10px] font-extrabold text-purple-400 mb-1">🌟 THE GOLDEN RULE</p>
              <p className="text-white text-sm font-black italic leading-snug">
                "And here's the golden rule — never share your password with…"
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-purple-900/20 border border-purple-500/20 px-4 py-2 flex items-center gap-2">
          <span className="text-purple-400 font-black text-sm">🔐 Complete Byte's rule:</span>
        </div>
      </motion.div>

      <div className="grid gap-2.5">
        {options.map((opt, idx) => {
          const isPicked = picked === idx;
          const isCorrect = isPicked && idx === correctIdx;
          const isWrong = isPicked && idx !== correctIdx;
          const revealRight = picked !== null && idx === correctIdx && !isPicked;

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={picked === null ? { x: 4 } : {}}
              whileTap={picked === null ? { scale: 0.98 } : {}}
              onClick={() => handlePick(idx)}
              disabled={picked !== null}
              className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 font-bold text-sm transition-all ${
                isCorrect   ? "border-green-400 bg-green-500/20 text-green-300" :
                isWrong     ? "border-red-400 bg-red-500/15 text-red-300" :
                revealRight ? "border-green-400/60 bg-green-500/10 text-green-400" :
                picked !== null ? "border-white/5 text-white/20 bg-white/3" :
                "border-white/15 bg-white/5 text-white hover:border-purple-400/50"
              }`}
            >
              {isCorrect && "⭐ "}{isWrong && "✗ "}{opt}
            </motion.button>
          );
        })}
      </div>

      {picked !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-3 text-center ${picked === correctIdx ? "bg-green-500/10 border border-green-400/30" : "bg-red-500/10 border border-red-400/30"}`}
        >
          <p className={`text-xs font-bold ${picked === correctIdx ? "text-green-400" : "text-red-300"}`}>
            {picked === correctIdx
              ? "🎉 Exactly what Byte said! Not even your best friend."
              : `❌ Byte said "NO ONE — not even me!" That means nobody, ever.`}
          </p>
        </motion.div>
      )}
    </div>
  );
}

/* ══════════════════════════════════
   SCORE SCREEN
══════════════════════════════════ */
function ScoreScreen({ score, onDone }: { score: number; onDone: () => void }) {
  const perfect = score === 3;
  const good = score === 2;

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center relative">
      {perfect && <Confetti />}

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="text-6xl"
      >
        {perfect ? "🏆" : good ? "⭐" : "💪"}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-center gap-2 mb-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: i < score ? 1 : 0.6, opacity: i < score ? 1 : 0.25 }}
              transition={{ delay: 0.4 + i * 0.15, type: "spring", bounce: 0.7 }}
              className="text-3xl"
            >
              ⭐
            </motion.div>
          ))}
        </div>

        <h2 className="text-xl font-black text-white mb-1">
          {perfect ? "Perfect Score! 🎉" : good ? "Great job! 🌟" : "Nice try! Keep it up 💪"}
        </h2>
        <p className="text-white/50 text-sm font-medium mb-1">
          You got <span className="text-purple-300 font-black">{score} out of 3</span> right
        </p>

        {/* Byte's reaction */}
        <div className="mt-3 rounded-2xl bg-purple-900/30 border border-purple-400/20 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-xl flex-shrink-0">🐱</span>
            <p className="text-xs font-bold text-white/80 italic text-left">
              {perfect
                ? '"You were paying attention! You\'re already thinking like a Cyber Hero. Now let\'s test those skills for real!"'
                : good
                ? '"Almost perfect! You\'ve got the main ideas. Remember: strong passwords + share with NO ONE!"'
                : '"Good effort! Re-watch the lesson any time. The most important rule: NEVER share your password. Now let\'s practice!"'}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onDone}
        className="w-full rounded-2xl py-4 font-black text-white text-base"
        style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}
      >
        Start the Password Quiz! →
      </motion.button>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN GAME COMPONENT
══════════════════════════════════ */
export default function PasswordAttentionGame({ onComplete }: Props) {
  const [round, setRound] = useState(0); // 0,1,2 = rounds; 3 = score screen
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState(1);

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    setDirection(1);
    setRound((r) => r + 1);
  };

  const roundTitles = [
    "Scene 2 — The Cracked Password",
    "Scene 3 — The Strong Password",
    "Scene 4 — The Golden Rule",
  ];

  return (
    <div className="flex flex-col gap-3 py-2 min-h-[420px]">
      {round < 3 && (
        <>
          {/* Game header */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-sm flex-shrink-0">🎮</div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                Were you paying attention? • Round {round + 1}/3
              </p>
              <p className="text-xs font-black text-white">{roundTitles[round]}</p>
            </div>
          </div>

          <RoundBadge round={round} total={3} />
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ x: direction * 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: direction * -40, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {round === 0 && <Round1 onAnswer={handleAnswer} />}
          {round === 1 && <Round2 onAnswer={handleAnswer} />}
          {round === 2 && <Round3 onAnswer={handleAnswer} />}
          {round === 3 && <ScoreScreen score={score} onDone={() => onComplete(score)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
