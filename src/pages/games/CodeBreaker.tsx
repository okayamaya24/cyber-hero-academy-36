import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CONFIG = {
  junior: { digits: 4, range: 6, maxAttempts: 8 },
  hero:   { digits: 4, range: 8, maxAttempts: 8 },
  elite:  { digits: 5, range: 9, maxAttempts: 10 },
};

function generateCode(digits: number, range: number): number[] {
  const pool = Array.from({ length: range }, (_, i) => i + 1);
  const code: number[] = [];
  while (code.length < digits) {
    const idx = Math.floor(Math.random() * pool.length);
    code.push(pool.splice(idx, 1)[0]);
  }
  return code;
}

interface Guess {
  digits: number[];
  greens: number; // correct digit, correct position
  yellows: number; // correct digit, wrong position
}

function evaluateGuess(guess: number[], secret: number[]): { greens: number; yellows: number } {
  let greens = 0, yellows = 0;
  const secretLeft: (number | null)[] = [...secret];
  const guessLeft: (number | null)[] = [...guess];
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) { greens++; secretLeft[i] = null; guessLeft[i] = null; }
  }
  for (let i = 0; i < guessLeft.length; i++) {
    if (guessLeft[i] === null) continue;
    const j = secretLeft.findIndex(s => s === guessLeft[i]);
    if (j !== -1) { yellows++; secretLeft[j] = null; }
  }
  return { greens, yellows };
}

function CodeBreakerGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const [secret] = useState(() => generateCode(config.digits, config.range));
  const [current, setCurrent] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [phase, setPhase] = useState<'playing' | 'won' | 'lost'>('playing');

  const handleDigit = useCallback((d: number) => {
    if (current.includes(d) || current.length >= config.digits || phase !== 'playing') return;
    setCurrent(prev => [...prev, d]);
  }, [current, config.digits, phase]);

  const handleDelete = () => setCurrent(prev => prev.slice(0, -1));

  const handleSubmit = useCallback(() => {
    if (current.length < config.digits || phase !== 'playing') return;
    const { greens, yellows } = evaluateGuess(current, secret);
    const newGuesses = [...guesses, { digits: current, greens, yellows }];
    setGuesses(newGuesses);
    setCurrent([]);
    if (greens === config.digits) {
      setPhase('won');
      const unused = config.maxAttempts - newGuesses.length;
      onComplete(100 + unused * 20, 100 + config.maxAttempts * 20);
    } else if (newGuesses.length >= config.maxAttempts) {
      setPhase('lost');
      onComplete(0, 100 + config.maxAttempts * 20);
    }
  }, [current, config, phase, guesses, secret, onComplete]);

  const buttons = Array.from({ length: config.range }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] p-4 gap-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">Attempts: {guesses.length}/{config.maxAttempts}</div>
        <div className="text-xl font-black text-white">🔐 Code Breaker</div>
        <div className="text-sm text-gray-400">{config.digits} digits (1-{config.range})</div>
      </div>

      {/* Guess history */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {guesses.map((g, gi) => (
          <motion.div key={gi} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
            <div className="flex gap-1">
              {g.digits.map((d, i) => (
                <div key={i} className="w-9 h-9 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center font-black text-white">{d}</div>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              {Array.from({ length: g.greens }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-green-500" />)}
              {Array.from({ length: g.yellows }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-yellow-500" />)}
              {Array.from({ length: config.digits - g.greens - g.yellows }).map((_, i) => <div key={i} className="w-4 h-4 rounded-full bg-gray-700" />)}
            </div>
          </motion.div>
        ))}

        {phase === 'playing' && (
          <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-3 py-2">
            <div className="flex gap-1">
              {Array.from({ length: config.digits }).map((_, i) => (
                <div key={i} className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-black text-lg
                  ${current[i] ? 'border-cyan-500 bg-cyan-500/20 text-white' : 'border-white/20 bg-black/20 text-transparent'}`}>
                  {current[i] || '·'}
                </div>
              ))}
            </div>
            <div className="ml-auto text-xs text-cyan-400">← current guess</div>
          </div>
        )}

        {phase !== 'playing' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className={`rounded-xl p-4 text-center ${phase === 'won' ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
            <div className="text-2xl mb-1">{phase === 'won' ? '🔓 CRACKED!' : '💀 FAILED!'}</div>
            <div className="text-sm text-gray-300">The code was: {secret.join(' - ')}</div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-xs text-gray-500 justify-center">
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> Right digit + position</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> Right digit, wrong position</span>
      </div>

      {/* Digit buttons */}
      <div className="grid grid-cols-5 gap-2">
        {buttons.map(d => (
          <button key={d} onClick={() => handleDigit(d)} disabled={current.includes(d) || phase !== 'playing'}
            className={`h-11 rounded-xl font-black text-lg transition-all border
              ${current.includes(d) ? 'opacity-30 border-white/10 bg-black/20 text-gray-600' : 'border-white/20 bg-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-white active:scale-95'}`}>
            {d}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={handleDelete} disabled={phase !== 'playing' || current.length === 0}
          className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-gray-300 disabled:opacity-30">
          ⌫ Delete
        </button>
        <button onClick={handleSubmit} disabled={current.length < config.digits || phase !== 'playing'}
          className="flex-1 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black disabled:opacity-30">
          Submit →
        </button>
      </div>
    </div>
  );
}

export default function CodeBreaker() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Code Breaker" category="Puzzle" xpReward={200} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <CodeBreakerGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
