/**
 * PasswordFixerGame
 * Show a weak password. Tap upgrade chips to transform it.
 * Watch the strength bar climb in real time.
 * Submit when strength ≥ 70%.
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

interface Chip {
  id: string;
  label: string;
  apply: (pw: string) => string;
}

interface Session {
  base: string;
  hint: string;
  chips: Chip[];
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

function barColor(s: number) {
  if (s >= 70) return "bg-green-400";
  if (s >= 40) return "bg-amber-400";
  return "bg-red-400";
}

function strengthLabel(s: number) {
  if (s >= 70) return { text: "💪 Strong — ready to submit!", color: "text-green-300" };
  if (s >= 40) return { text: "🤔 Getting stronger...", color: "text-amber-300" };
  return { text: "😬 Still too weak — keep upgrading!", color: "text-red-300" };
}

const SESSIONS: Session[] = [
  {
    base: "sunshine",
    hint: "Add a capital letter, some numbers, and a symbol to boost the strength!",
    chips: [
      { id: "cap",  label: "🔠 Capitalize",  apply: (p) => p[0].toUpperCase() + p.slice(1) },
      { id: "num",  label: "🔢 Add 42",       apply: (p) => p + "42" },
      { id: "bang", label: "✨ Add !",         apply: (p) => p + "!" },
      { id: "swap", label: "🔄 s→$",          apply: (p) => p.replace(/s/g, "$") },
    ],
  },
  {
    base: "mydog123",
    hint: "Capitalize some letters and add a special symbol to level it up!",
    chips: [
      { id: "cap-m", label: "🔠 Capitalize",  apply: (p) => p[0].toUpperCase() + p.slice(1) },
      { id: "swap-o",label: "🔄 o→0",         apply: (p) => p.replace(/o/g, "0") },
      { id: "at",    label: "✨ Add @",         apply: (p) => p + "@" },
      { id: "cap-d", label: "🔠 d→D",          apply: (p) => p.replace("dog", "Dog") },
    ],
  },
  {
    base: "abc",
    hint: "It's way too short! Make it longer, add uppercase, numbers, and a symbol.",
    chips: [
      { id: "long", label: "📏 +Dragon",      apply: (p) => p + "Dragon" },
      { id: "cap2", label: "🔠 Capitalize",   apply: (p) => p[0].toUpperCase() + p.slice(1) },
      { id: "num2", label: "🔢 Add 99",        apply: (p) => p + "99" },
      { id: "sym2", label: "✨ Add #",          apply: (p) => p + "#" },
    ],
  },
];

const GOAL = 70;

export default function PasswordFixerGame({ guideImage, guideName, onComplete }: Props) {
  const [sessionIdx, setSessionIdx] = useState(0);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const session = SESSIONS[sessionIdx];

  // Build current password by applying selected chips in their defined order
  const currentPassword = session.chips
    .filter((c) => applied.has(c.id))
    .reduce((pw, chip) => chip.apply(pw), session.base);

  const strength = calcStrength(currentPassword);
  const isStrong = strength >= GOAL;
  const label = strengthLabel(strength);

  const toggleChip = (id: string) => {
    if (submitting) return;
    setApplied((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (submitting) return;
    setSubmitting(true);
    const correct = isStrong;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      setSubmitting(false);
      if (sessionIdx < SESSIONS.length - 1) {
        setSessionIdx((i) => i + 1);
        setApplied(new Set());
      } else {
        setDone(true);
      }
    }, 1400);
  };

  if (done) {
    const stars = score === 3 ? 3 : score >= 2 ? 2 : 1;
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4"
      >
        <div className="text-5xl">🛠️</div>
        <h2 className="text-xl font-black text-white">{score}/3 passwords fixed!</h2>
        <p className="text-sm font-bold text-purple-300">
          {score === 3
            ? "Master password mechanic! You know exactly what makes them strong! 🔐"
            : score >= 2
            ? "Great fixing skills! Uppercase + numbers + symbols = strong password."
            : "Remember the formula: Capital + Number + Symbol = much stronger!"}
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
    <div className="py-2 space-y-3">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-purple-400"
            animate={{ width: `${(sessionIdx / SESSIONS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/40">{sessionIdx + 1}/{SESSIONS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-purple-400 text-center tracking-wider">🛠️ PASSWORD FIXER</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={sessionIdx}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Password display + strength meter */}
          <div
            className={`rounded-2xl border-2 p-4 mb-3 transition-all duration-300 ${
              isStrong ? "border-green-400/50" : "border-white/10"
            }`}
            style={{ background: isStrong ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)" }}
          >
            <p className="text-[10px] text-gray-400 mb-1.5 text-center font-bold tracking-widest uppercase">
              Your password:
            </p>
            <motion.p
              key={currentPassword}
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="font-mono text-xl font-black text-white tracking-wider text-center mb-3 break-all min-h-[32px]"
            >
              {currentPassword || <span className="text-white/20 font-normal text-base">{session.base}</span>}
            </motion.p>

            {/* Strength bar */}
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden mb-1.5">
              <motion.div
                className={`h-full rounded-full ${barColor(strength)}`}
                animate={{ width: `${strength}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold ${label.color}`}>{label.text}</span>
              <span className="text-xs text-white/30 font-mono">{strength}%</span>
            </div>
          </div>

          {/* Goal indicator */}
          <div className="rounded-xl border border-purple-400/20 px-3 py-2 mb-3"
            style={{ background: "rgba(168,85,247,0.08)" }}>
            <p className="text-xs text-purple-300 font-semibold">💡 {session.hint}</p>
          </div>

          {/* Upgrade chips */}
          <p className="text-[10px] font-bold text-white/40 text-center mb-2">
            Tap upgrades to apply them 👇
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {session.chips.map((chip) => {
              const isOn = applied.has(chip.id);
              return (
                <motion.button
                  key={chip.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleChip(chip.id)}
                  className={`rounded-2xl border-2 py-3 text-xs font-black transition-all ${
                    isOn
                      ? "border-purple-400 bg-purple-500/25 text-purple-200"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-purple-400/30 hover:text-white/80"
                  }`}
                >
                  {isOn && <span className="mr-1">✓</span>}{chip.label}
                </motion.button>
              );
            })}
          </div>

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full rounded-2xl py-4 font-black text-sm transition-all ${
              isStrong
                ? "text-[#080c18] hover:brightness-110 active:scale-95"
                : "text-white/40 bg-white/5 border border-white/10 cursor-not-allowed"
            }`}
            style={isStrong ? { background: "linear-gradient(135deg,#a855f7,#6366f1)" } : {}}
          >
            {submitting
              ? "Saving..."
              : isStrong
              ? "✅ Submit Fixed Password!"
              : `Need ${GOAL}% strength — currently ${strength}%`}
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
