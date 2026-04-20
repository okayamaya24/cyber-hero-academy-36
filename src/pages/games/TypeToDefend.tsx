import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CONFIG = {
  junior: { fallDuration: 8, lives: 5, gameDuration: 60, maxWords: 3 },
  hero:   { fallDuration: 6, lives: 3, gameDuration: 90, maxWords: 4 },
  elite:  { fallDuration: 4, lives: 3, gameDuration: 120, maxWords: 5 },
};

const WORD_BANKS: Record<AgeTier, string[]> = {
  junior: ['VIRUS', 'HACK', 'SAFE', 'LOCK', 'CODE', 'SPAM', 'KEY', 'WIFI', 'TRAP', 'BUG', 'WORM', 'NET'],
  hero:   ['FIREWALL', 'PHISHING', 'MALWARE', 'PASSWORD', 'ENCRYPT', 'NETWORK', 'HACKER', 'ANTIVIRUS', 'BACKUP', 'PRIVACY', 'TROJAN', 'BOTNET'],
  elite:  ['RANSOMWARE', 'CYBERSECURITY', 'AUTHENTICATION', 'ENCRYPTION', 'VULNERABILITY', 'TROJANVIRUS', 'BOTNET', 'SPOOFING', 'KEYLOGGER', 'ZERODAY', 'PRIVILEGE', 'INJECTION'],
};

interface FallingWord {
  id: number;
  text: string;
  x: number; // percent 5-75
  duration: number; // seconds
  spawnTime: number;
  destroyed?: boolean;
}

interface Explosion { id: number; x: number; y: number; text: string }

let wordIdCounter = 0;

function TypeToDefendGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const words = WORD_BANKS[ageTier];

  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(config.gameDuration);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(config.lives);
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [typed, setTyped] = useState('');
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [shakeIds, setShakeIds] = useState<number[]>([]);
  const [wordsZapped, setWordsZapped] = useState(0);
  const [, setTick] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const wordTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const handleWordReachBottomRef = useRef<(id: number) => void>(null!);
  const scoreRef = useRef(0);
  const livesRef = useRef(config.lives);
  const gameOverRef = useRef(false);
  const fallingRef = useRef<FallingWord[]>([]);
  const usedWords = useRef<Set<string>>(new Set());

  useEffect(() => { fallingRef.current = fallingWords; }, [fallingWords]);

  useEffect(() => {
    return () => { wordTimers.current.forEach(t => clearTimeout(t)); };
  }, []);

  const getNextWord = useCallback(() => {
    const available = words.filter(w => !usedWords.current.has(w));
    if (available.length === 0) { usedWords.current.clear(); return words[Math.floor(Math.random() * words.length)]; }
    const w = available[Math.floor(Math.random() * available.length)];
    usedWords.current.add(w);
    return w;
  }, [words]);

  const spawnWord = useCallback(() => {
    if (gameOverRef.current) return;
    if (fallingRef.current.filter(w => !w.destroyed).length >= config.maxWords) return;
    const text = getNextWord();
    const x = 5 + Math.random() * 70;
    const speedVar = config.fallDuration * (0.85 + Math.random() * 0.3);
    const id = ++wordIdCounter;
    setFallingWords(prev => [...prev, { id, text, x, duration: speedVar, spawnTime: Date.now() }]);
    const timer = setTimeout(() => handleWordReachBottomRef.current(id), Math.round(speedVar * 1000));
    wordTimers.current.set(id, timer);
  }, [config, getNextWord]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) { setPhase('playing'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Game timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) { clearInterval(t); setPhase('done'); return 0; }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Spawn words
  useEffect(() => {
    if (phase !== 'playing') return;
    spawnWord();
    const t = setInterval(spawnWord, 2000);
    return () => clearInterval(t);
  }, [phase, spawnWord]);

  // Auto-focus input
  useEffect(() => {
    if (phase === 'playing') inputRef.current?.focus();
  }, [phase]);

  // End game
  useEffect(() => {
    if (phase === 'done') onComplete(scoreRef.current, 400);
  }, [phase, onComplete]);

  // Position tick
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, [phase]);

  const handleWordReachBottom = useCallback((id: number) => {
    wordTimers.current.delete(id);
    if (gameOverRef.current) return;
    setFallingWords(prev => prev.filter(w => w.id !== id));
    livesRef.current -= 1;
    setLives(livesRef.current);
    setShakeIds(prev => [...prev, id]);
    setTimeout(() => setShakeIds(prev => prev.filter(x => x !== id)), 500);
    if (livesRef.current <= 0) {
      gameOverRef.current = true;
      setPhase('done');
    }
    // Spawn replacement
    setTimeout(spawnWord, 500);
  }, [spawnWord]);
  handleWordReachBottomRef.current = handleWordReachBottom;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setTyped(val);

    // Check for match
    const match = fallingRef.current.find(w => !w.destroyed && w.text === val);
    if (match) {
      // Zap it!
      clearTimeout(wordTimers.current.get(match.id));
      wordTimers.current.delete(match.id);
      setFallingWords(prev => prev.filter(w => w.id !== match.id));
      const pts = 10 + Math.min(wordsZapped * 2, 20);
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setWordsZapped(wz => wz + 1);
      setTyped('');

      // Explosion at approximate word position
      const expId = Date.now() + Math.random();
      setExplosions(prev => [...prev, { id: expId, x: match.x + 5, y: 30, text: match.text }]);
      setTimeout(() => setExplosions(prev => prev.filter(ex => ex.id !== expId)), 700);

      // Spawn new word
      setTimeout(spawnWord, 400);
    }
  };

  const timerPct = (timeLeft / config.gameDuration) * 100;
  const timerColor = timerPct > 50 ? 'text-cyan-400' : timerPct > 25 ? 'text-yellow-400' : 'text-red-400';

  const areaH = playAreaRef.current?.offsetHeight ?? 400;
  const getWordTop = (word: FallingWord) => {
    const elapsed = Date.now() - word.spawnTime;
    const progress = Math.min(elapsed / (word.duration * 1000), 1);
    return -40 + progress * (areaH + 40);
  };

  return (
    <div className="flex flex-col h-full bg-[#060b14] select-none relative overflow-hidden font-mono">
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)' }}
      />

      {/* Countdown */}
      <AnimatePresence>
        {phase === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#060b14]/95"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              className="text-8xl font-black text-green-400 drop-shadow-[0_0_30px_rgba(0,255,100,0.8)]"
            >
              {countdown === 0 ? '⚡ DEFEND!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#060b14] border-b border-green-500/30 z-10 relative">
        <div className="flex gap-1">
          {Array.from({ length: config.lives }).map((_, i) => (
            <span key={i} className={`text-lg ${i < lives ? 'text-red-500' : 'opacity-20'}`}>❤️</span>
          ))}
        </div>
        <div className={`text-2xl font-black ${timerColor}`}>{timeLeft}s</div>
        <div className="text-right">
          <div className="text-xl font-black text-green-400">{score}</div>
          <div className="text-xs text-gray-500">PTS</div>
        </div>
      </div>

      {/* Play area */}
      <div ref={playAreaRef} className="flex-1 relative overflow-hidden">
        {/* Base line */}
        <div className="absolute bottom-16 left-0 right-0 h-0.5 bg-cyan-500/40 z-10" />
        <div className="absolute bottom-14 left-0 right-0 text-center text-xs text-cyan-500/60">— BASE —</div>

        {/* Falling words */}
        {fallingWords.map(word => {
          const matchLen = typed.length > 0 && word.text.startsWith(typed) ? typed.length : 0;
          return (
            <div
              key={word.id}
              className="absolute text-base font-black z-20 pointer-events-none"
              style={{ left: `${word.x}%`, top: `${getWordTop(word)}px` }}
            >
              {matchLen > 0 ? (
                <>
                  <span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(0,212,255,0.9)]">
                    {word.text.slice(0, matchLen)}
                  </span>
                  <span className="text-gray-400">{word.text.slice(matchLen)}</span>
                </>
              ) : (
                <span className="text-green-400/80 drop-shadow-[0_0_6px_rgba(0,255,100,0.4)]">
                  {word.text}
                </span>
              )}
            </div>
          );
        })}

        {/* Explosions */}
        <AnimatePresence>
          {explosions.map(ex => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 1, scale: 0.5, top: '40%', left: `${ex.x}%` }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.7 }}
              className="absolute text-3xl z-30 pointer-events-none -translate-x-1/2"
            >
              💥
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input zone */}
      <div className="relative z-10 px-4 pb-4 pt-2 bg-[#060b14] border-t border-green-500/30">
        <div className="flex items-center gap-3 bg-black/60 border border-green-500/50 rounded-xl px-4 py-3">
          <span className="text-green-500 text-lg font-black">&gt;_</span>
          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={handleInput}
            onKeyDown={e => e.key === 'Escape' && setTyped('')}
            disabled={phase !== 'playing'}
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={phase === 'playing' ? 'TYPE THE FALLING WORDS...' : ''}
            className="flex-1 bg-transparent text-green-300 text-lg font-black outline-none placeholder-green-900 uppercase tracking-widest"
          />
          {typed && (
            <button onClick={() => setTyped('')} className="text-gray-600 hover:text-gray-400 text-sm">✕</button>
          )}
        </div>
        <div className="mt-1 text-center text-xs text-gray-600">Type the word exactly to zap it!</div>
      </div>
    </div>
  );
}

export default function TypeToDefend() {
  const ageTier: AgeTier = 'hero'; // TODO: pull from user profile
  return (
    <GameShell
      title="Type to Defend"
      category="Keyboard"
      xpReward={150}
      ageTier={ageTier}
      onClose={() => window.history.back()}
    >
      {({ ageTier, onComplete }) => (
        <TypeToDefendGame ageTier={ageTier} onComplete={onComplete} />
      )}
    </GameShell>
  );
}
