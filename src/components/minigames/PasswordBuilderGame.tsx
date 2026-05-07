import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AgeTier } from "@/data/missions";

interface Props {
  ageTier: AgeTier;
  guideImage: string;
  guideName: string;
  onComplete: (correct: boolean) => void;
}

const WORD_PARTS: Record<AgeTier, { words: string[]; numbers: string[]; symbols: string[] }> = {
  junior: {
    words: ["Cat", "Sun", "Dog", "Star", "Moon", "Fish", "Bird", "Tree"],
    numbers: ["1", "2", "3", "7", "9", "42"],
    symbols: ["!", "?", "#", "*"],
  },
  defender: {
    words: ["Cyber", "Hero", "Shield", "Dragon", "Rocket", "Storm", "Ninja", "Blaze"],
    numbers: ["13", "42", "77", "99", "256"],
    symbols: ["!", "@", "#", "$", "&", "?"],
  },
  guardian: {
    words: ["Quantum", "Phoenix", "Cipher", "Nebula", "Vortex", "Kraken", "Stealth"],
    numbers: ["137", "256", "404", "512", "1024"],
    symbols: ["!", "@", "#", "$", "%", "^", "&", "*"],
  },
};

function getStrength(password: string): { score: number; label: string; color: string } {
  let s = 0;
  if (password.length >= 4) s += 20;
  if (password.length >= 8) s += 20;
  if (/[A-Z]/.test(password)) s += 15;
  if (/[a-z]/.test(password)) s += 10;
  if (/[0-9]/.test(password)) s += 15;
  if (/[^A-Za-z0-9]/.test(password)) s += 20;
  s = Math.min(s, 100);

  if (s >= 80) return { score: s, label: "🔐 Super Strong!", color: "bg-secondary" };
  if (s >= 50) return { score: s, label: "🔒 Getting Stronger!", color: "bg-accent" };
  if (s >= 30) return { score: s, label: "🔓 Needs More!", color: "bg-destructive/70" };
  return { score: s, label: "❌ Too Weak!", color: "bg-destructive" };
}

export default function PasswordBuilderGame({ ageTier, guideImage, guideName, onComplete }: Props) {
  const parts = WORD_PARTS[ageTier];
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const addPart = (part: string) => {
    if (password.length < 20) setPassword((p) => p + part);
  };
  const removeLast = () => setPassword((p) => p.slice(0, -1));
  const clear = () => setPassword("");

  const strength = getStrength(password);
  const isStrong = strength.score >= 70;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="text-center">
      {/* Guide speech bubble */}
      <div className="flex items-center gap-3 mb-4">
        <img src={guideImage} alt={guideName} className="h-12 w-12 object-contain flex-shrink-0" />
        <div className="rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 px-4 py-2 text-left">
          <p className="font-semibold text-sm text-white">
            🔧 Build a super strong password! Mix words, numbers, and symbols together.
          </p>
        </div>
      </div>

      {/* Password display */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4">
        <p className="text-xs text-gray-400 mb-2">Your Password:</p>
        <div className="min-h-[48px] flex items-center justify-center rounded-xl bg-black/30 px-4 py-3">
          <p className="font-mono text-xl font-bold tracking-wider break-all text-white">
            {password || <span className="text-gray-500 text-base font-normal">Tap pieces below to build...</span>}
          </p>
        </div>

        {password && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-white">{strength.label}</span>
              <span className="text-xs text-gray-400 ml-auto">{strength.score}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${strength.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${strength.score}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {!submitted ? (
        <>
          <div className="space-y-3 mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1.5">📝 Words</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {parts.words.map((w) => (
                  <motion.button key={w} whileTap={{ scale: 0.9 }} onClick={() => addPart(w)}
                    className="rounded-xl border border-purple-400/30 bg-purple-500/15 px-3 py-2 font-bold text-sm text-purple-300 hover:bg-purple-500/25 transition-colors">
                    {w}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1.5">🔢 Numbers</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {parts.numbers.map((n) => (
                  <motion.button key={n} whileTap={{ scale: 0.9 }} onClick={() => addPart(n)}
                    className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 font-bold text-sm text-amber-300 hover:bg-amber-500/25 transition-colors">
                    {n}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1.5">✨ Symbols</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {parts.symbols.map((s) => (
                  <motion.button key={s} whileTap={{ scale: 0.9 }} onClick={() => addPart(s)}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3 py-2 font-bold text-sm text-cyan-300 hover:bg-cyan-500/25 transition-colors">
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-center mb-4">
            <button onClick={removeLast} disabled={!password}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-gray-300 hover:bg-white/10 disabled:opacity-30 transition-colors">
              ← Delete
            </button>
            <button onClick={clear} disabled={!password}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-gray-300 hover:bg-white/10 disabled:opacity-30 transition-colors">
              Clear All
            </button>
          </div>

          <button onClick={handleSubmit} disabled={password.length < 3}
            className="w-full rounded-2xl py-4 text-base font-extrabold text-[#080c18] disabled:opacity-30 transition-all hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg,#00d4ff,#00ff88)" }}>
            Test My Password! 💪
          </button>
        </>
      ) : (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-3">
          <div className={`rounded-2xl p-5 border ${isStrong ? "bg-green-500/10 border-green-400/30" : "bg-amber-500/10 border-amber-400/30"}`}>
            <p className="font-bold text-lg mb-1 text-white">
              {isStrong ? "🎉 Amazing password!" : "💡 Good try! Here are some tips:"}
            </p>
            <p className="text-sm text-gray-300">
              {isStrong
                ? "Your password uses a great mix of words, numbers, and symbols. That makes it really hard for hackers to guess!"
                : "Try adding more symbols (!@#), mixing uppercase and lowercase letters, and making it longer. The longer and more mixed, the stronger!"}
            </p>
          </div>
          <button onClick={() => onComplete(isStrong)}
            className="w-full rounded-2xl py-4 text-base font-extrabold text-[#080c18] transition-all hover:brightness-110 active:scale-95"
            style={{ background: "linear-gradient(135deg,#00d4ff,#00ff88)" }}>
            Continue ✨
          </button>
        </motion.div>
      )}
    </div>
  );
}
