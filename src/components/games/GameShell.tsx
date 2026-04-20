import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Zap } from 'lucide-react';

export type AgeTier = 'junior' | 'hero' | 'elite';

interface GameShellProps {
  title: string;
  category: string;
  xpReward: number;
  ageTier: AgeTier;
  onClose: () => void;
  children: (props: {
    ageTier: AgeTier;
    onComplete: (score: number, maxScore: number) => void;
  }) => React.ReactNode;
}

export default function GameShell({ title, category, xpReward, ageTier, onClose, children }: GameShellProps) {
  const [phase, setPhase] = useState<'playing' | 'complete'>('playing');
  const [stars, setStars] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);

  const tierLabel = {
    junior: '🐣 Junior Hero',
    hero: '⚡ Hero',
    elite: '🔥 Elite Hero',
  }[ageTier];

  const byteMessages = {
    1: "Good try, Guardian! Don't give up! 💪",
    2: "Nice work! You're getting stronger! ⚡",
    3: "AMAZING! You're a true Cyber Hero! 🔥",
  };

  const handleComplete = (score: number, maxScore: number) => {
    const ratio = Math.min(score / maxScore, 1);
    const s = ratio >= 0.85 ? 3 : ratio >= 0.55 ? 2 : 1;
    setStars(s);
    setEarnedXP(Math.max(Math.round(xpReward * ratio), 10));
    setPhase('complete');
  };

  return (
    <div className="h-screen bg-[#0a0e1a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#0d1220]">
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-xs text-cyan-400">{category} · {tierLabel}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {phase === 'playing' && children({ ageTier, onComplete: handleComplete })}

        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-[#0a0e1a]/95 flex flex-col items-center justify-center gap-6 px-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-7xl"
              >
                🤖
              </motion.div>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-cyan-300 text-center"
              >
                {byteMessages[stars as 1 | 2 | 3]}
              </motion.p>

              {/* Stars */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-2"
              >
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 + i * 0.15, type: 'spring', bounce: 0.6 }}
                  >
                    <Star className={`w-12 h-12 ${i <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                  </motion.div>
                ))}
              </motion.div>

              {/* XP */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="bg-cyan-500/20 border border-cyan-500 rounded-2xl px-10 py-4 flex items-center gap-3"
              >
                <Zap className="w-7 h-7 text-cyan-400 fill-cyan-400" />
                <span className="text-3xl font-black text-cyan-400">+{earnedXP} XP</span>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex gap-4"
              >
                <button
                  onClick={() => setPhase('playing')}
                  className="px-7 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition"
                >
                  Play Again 🔄
                </button>
                <button
                  onClick={onClose}
                  className="px-7 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition"
                >
                  Back to Training
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
