/**
 * FactCheckGame — Hoot Lesson 3: Searching Safely
 * Show 5 "facts" found online. Tap REAL FACT or FAKE NEWS for each.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

const FACTS = [
  {
    source: "CyberFacts.net",
    claim: "Hackers can crack a password like 'password123' in less than ONE second using automated tools.",
    isReal: true,
    clue: "TRUE! Automated cracking tools can test billions of passwords per second. Common passwords fall instantly — that's why strong ones matter so much.",
  },
  {
    source: "TechBlog99.com",
    claim: "A shorter password is actually SAFER than a long one because it's harder for hackers to guess randomly.",
    isReal: false,
    clue: "FALSE! Longer passwords are always harder to crack. A 16-character password takes billions of times longer to crack than an 8-character one.",
  },
  {
    source: "SafetyTips.org",
    claim: "When you delete a photo from social media, copies saved by others or stored on servers may still exist.",
    isReal: true,
    clue: "TRUE! Once something is posted, others can screenshot or save it, and companies keep server backups. Deleted doesn't always mean gone.",
  },
  {
    source: "RandomFacts.xyz",
    claim: "If a website has a padlock 🔒 in the address bar, it means the website is 100% safe and run by honest people.",
    isReal: false,
    clue: "FALSE! The padlock only means your connection to the site is encrypted. Scammers can have padlocks on fake websites too — always check the URL!",
  },
  {
    source: "CyberNews.edu",
    claim: "Using the same password on multiple websites means if one site gets hacked, criminals can try that password on all your other accounts.",
    isReal: true,
    clue: "TRUE! This is called 'credential stuffing.' Hackers automatically try stolen passwords across hundreds of sites. Always use unique passwords!",
  },
];

export default function FactCheckGame({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const fact = FACTS[round];

  const handleAnswer = (guessReal: boolean) => {
    if (result !== null) return;
    const correct = guessReal === fact.isReal;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round < FACTS.length - 1) {
        setRound((r) => r + 1);
        setResult(null);
      } else {
        setDone(true);
      }
    }, 2400);
  };

  if (done) {
    const stars = score === 5 ? 3 : score >= 3 ? 2 : 1;
    return (
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-black text-white">{score}/{FACTS.length} facts verified!</h2>
        <p className="text-sm font-bold text-teal-300">
          {score === 5 ? "Expert fact-checker! Professor Hoot would give you full marks! 🦉" :
           score >= 3 ? "Good critical thinking! Always check before you believe something online." :
           "Not everything online is true! Check trusted sources before believing claims."}
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
          style={{ background: "linear-gradient(135deg,#14b8a6,#06b6d4)" }}>
          Continue →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="py-2 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-teal-400"
            animate={{ width: `${(round / FACTS.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{FACTS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-teal-400 text-center tracking-wider">🔍 FACT CHECK</p>

      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* "Article" card */}
          <div className={`rounded-2xl border-2 overflow-hidden mb-3 transition-colors ${
            result === "correct" ? "border-green-400" :
            result === "wrong" ? "border-red-400" : "border-white/10"
          }`}>
            <div className="px-4 py-2.5 border-b border-white/10 bg-white/5">
              <p className="text-[10px] text-teal-400 font-extrabold tracking-wider">🌐 FOUND ONLINE</p>
              <p className="text-[10px] text-gray-400 font-mono">{fact.source}</p>
            </div>
            <div className="px-4 py-4" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-sm font-bold text-white leading-relaxed">"{fact.claim}"</p>
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
                {result === "correct" ? "✓ " : "✗ "}{fact.clue}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(true)}
                className="rounded-2xl border-2 border-teal-400/40 bg-teal-500/15 py-4 font-black text-teal-300 text-sm hover:bg-teal-500/25 transition-colors">
                ✅ Real Fact
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(false)}
                className="rounded-2xl border-2 border-red-400/40 bg-red-500/15 py-4 font-black text-red-300 text-sm hover:bg-red-500/25 transition-colors">
                ❌ Fake!
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
