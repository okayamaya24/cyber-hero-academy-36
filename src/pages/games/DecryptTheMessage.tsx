import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

// Caesar +3 cipher: A->D, B->E, etc.
function caesarEncrypt(text: string, shift = 3): string {
  return text.split('').map(c => {
    if (c >= 'A' && c <= 'Z') {
      return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65);
    }
    return c;
  }).join('');
}

const WORD_BANKS: Record<AgeTier, string[]> = {
  junior: ['LOCK', 'SAFE', 'HACK', 'CODE', 'WIFI', 'TRAP', 'WORM', 'SPAM'],
  hero:   ['FIREWALL', 'PASSWORD', 'ENCRYPT', 'NETWORK', 'PRIVACY', 'ANTIVIRUS', 'MALWARE'],
  elite:  ['AUTHENTICATION', 'VULNERABILITY', 'CYBERSECURITY', 'ENCRYPTION', 'PHISHING', 'RANSOMWARE', 'SPOOFING'],
};

const CONFIG = {
  junior: { timePerWord: 20, hintLevel: 'full' as const },
  hero:   { timePerWord: 15, hintLevel: 'partial' as const },
  elite:  { timePerWord: 12, hintLevel: 'none' as const },
};

const FULL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function DecryptTheMessageGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const words = WORD_BANKS[ageTier];
  const [shuffled] = useState(() => [...words].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timePerWord);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [skipped, setSkipped] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef(0);
  const activeRef = useRef(true);

  const currentWord = shuffled[current];
  const encrypted = caesarEncrypt(currentWord, 3);
  const maxScore = shuffled.length * 20;

  useEffect(() => {
    inputRef.current?.focus();
    setTimeLeft(config.timePerWord);
    setTyped('');
    activeRef.current = true;
  }, [current, config.timePerWord]);

  useEffect(() => {
    if (phase !== 'playing' || feedback) return;
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) {
          clearInterval(t);
          handleTimeUp();
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [current, phase, feedback]);

  const handleTimeUp = () => {
    if (!activeRef.current) return;
    activeRef.current = false;
    setFeedback('wrong');
    setSkipped(s => s + 1);
    setTimeout(nextWord, 1800);
  };

  const nextWord = () => {
    setFeedback(null);
    if (current + 1 >= shuffled.length) {
      setPhase('done');
    } else {
      setCurrent(c => c + 1);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setTyped(val);
    if (val === currentWord) {
      if (!activeRef.current) return;
      activeRef.current = false;
      const bonus = Math.round((timeLeft / config.timePerWord) * 10);
      scoreRef.current += 10 + bonus;
      setScore(scoreRef.current);
      setFeedback('correct');
      setTimeout(nextWord, 1500);
    }
  };

  useEffect(() => {
    if (phase === 'done') onComplete(scoreRef.current, maxScore);
  }, [phase, onComplete, maxScore]);

  const timerPct = (timeLeft / config.timePerWord) * 100;
  const timerColor = timerPct > 60 ? 'bg-cyan-500' : timerPct > 30 ? 'bg-yellow-500' : 'bg-red-500';

  // Show cipher reference
  const showFullAlphabet = config.hintLevel === 'full';
  const showPartial = config.hintLevel === 'partial';

  return (
    <div className="flex flex-col h-full bg-[#0a0818] p-4 gap-4 select-none">
      {/* HUD */}
      <div className="flex justify-between text-sm">
        <span className="text-purple-400">Word {current + 1}/{shuffled.length}</span>
        <span className="text-green-400 font-bold">{score} pts</span>
      </div>

      {/* Timer */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${timerColor}`} animate={{ width: `${timerPct}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Encrypted word display */}
      <div className="flex-none bg-black/50 border border-purple-500/40 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(147,51,234,0.1)]">
        <div className="text-xs text-purple-400 mb-3 uppercase tracking-widest">🔐 Encrypted Message</div>
        <div className="flex justify-center gap-2">
          {encrypted.split('').map((char, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="w-10 h-12 flex items-center justify-center rounded-lg bg-purple-900/40 border border-purple-500/50 text-purple-200 text-2xl font-black font-mono"
            >
              {char}
            </motion.div>
          ))}
        </div>
        <div className="text-xs text-gray-600 mt-3">Caesar Cipher — shift each letter BACK by 3</div>
      </div>

      {/* Cipher reference */}
      {(showFullAlphabet || showPartial) && (
        <div className="bg-black/30 border border-white/10 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-2 text-center">Decoder Reference</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {FULL_ALPHABET.split('').map((plain, i) => {
              const enc = caesarEncrypt(plain, 3);
              const highlight = encrypted.includes(enc);
              const showThis = showFullAlphabet || (showPartial && i % 3 === 0);
              if (!showThis) return null;
              return (
                <div key={plain} className={`text-xs font-mono rounded px-1 py-0.5 ${highlight ? 'bg-purple-500/30 text-purple-200' : 'text-gray-600'}`}>
                  {enc}→{plain}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-3 bg-black/40 border border-cyan-500/40 rounded-xl px-4 py-3">
        <span className="text-cyan-500">🔓</span>
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={handleInput}
          disabled={!!feedback || phase !== 'playing'}
          autoComplete="off" autoCorrect="off" spellCheck={false}
          placeholder="Type the decoded word..."
          className="flex-1 bg-transparent text-white font-black text-xl uppercase tracking-widest outline-none placeholder-gray-700"
        />
        <span className="text-sm text-gray-600">{timeLeft}s</span>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl p-4 text-center font-bold text-lg ${feedback === 'correct' ? 'bg-green-500/20 border border-green-500 text-green-300' : 'bg-red-500/20 border border-red-500 text-red-300'}`}
          >
            {feedback === 'correct' ? `✅ Decrypted! The answer was "${currentWord}"` : `⏰ Time's up! The answer was "${currentWord}"`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DecryptTheMessage() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Decrypt the Message" category="Keyboard" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <DecryptTheMessageGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
