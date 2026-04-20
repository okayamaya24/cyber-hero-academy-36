import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CONFIG = {
  junior: { fallDuration: 10, lives: 5, gameDuration: 60, maxLines: 3 },
  hero:   { fallDuration: 7,  lives: 3, gameDuration: 90, maxLines: 4 },
  elite:  { fallDuration: 5,  lives: 3, gameDuration: 120, maxLines: 5 },
};

const CODE_LINES: Record<AgeTier, string[]> = {
  junior: [
    'LOCK your device',
    'USE strong passwords',
    'STAY safe online',
    'NEVER share secrets',
    'BLOCK all viruses',
    'KEEP software updated',
    'TRUST your instincts',
    'REPORT bad messages',
    'ASK a trusted adult',
    'CHECK before you click',
  ],
  hero: [
    'enable two-factor auth',
    'never click phishing links',
    'update your passwords often',
    'use unique passwords each site',
    'check sender email addresses',
    'encrypt sensitive files',
    'backup your important data',
    'install a trusted antivirus',
    'read app permissions carefully',
    'use a VPN on public WiFi',
  ],
  elite: [
    'implement zero-trust architecture',
    'validate all user inputs always',
    'use bcrypt for password hashing',
    'enable https on all endpoints',
    'audit third-party dependencies',
    'rotate API keys regularly',
    'scan containers for vulnerabilities',
    'enforce least privilege access',
    'monitor logs for anomalies',
    'patch systems within 24 hours',
  ],
};

interface FallingLine {
  id: number;
  text: string;
  duration: number;
  lane: number;
  spawnTime: number;
}

let lineIdCounter = 0;

function CodeTyperGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const lines = CODE_LINES[ageTier];

  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(config.gameDuration);
  const [fallingLines, setFallingLines] = useState<FallingLine[]>([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(config.lives);
  const [zappedIds, setZappedIds] = useState<number[]>([]);
  const [wpm, setWpm] = useState(0);
  const [, setTick] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const lineTimers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const handleLineEndRef = useRef<(id: number) => void>(null!);
  const scoreRef = useRef(0);
  const livesRef = useRef(config.lives);
  const gameOverRef = useRef(false);
  const fallingRef = useRef<FallingLine[]>([]);
  const charsTypedRef = useRef(0);
  const gameStartRef = useRef<number>(0);
  const usedLines = useRef(new Set<string>());

  useEffect(() => { fallingRef.current = fallingLines; }, [fallingLines]);

  useEffect(() => {
    return () => { lineTimers.current.forEach(t => clearTimeout(t)); };
  }, []);

  const getNextLine = () => {
    const available = lines.filter(l => !usedLines.current.has(l));
    if (available.length === 0) { usedLines.current.clear(); return lines[Math.floor(Math.random() * lines.length)]; }
    const l = available[Math.floor(Math.random() * available.length)];
    usedLines.current.add(l);
    return l;
  };

  const getFreeLane = useCallback(() => {
    const usedLanes = new Set(fallingRef.current.map(l => l.lane));
    for (let i = 0; i < config.maxLines; i++) {
      if (!usedLanes.has(i)) return i;
    }
    return Math.floor(Math.random() * config.maxLines);
  }, [config]);

  const spawnLine = useCallback(() => {
    if (gameOverRef.current) return;
    if (fallingRef.current.length >= config.maxLines) return;
    const text = getNextLine();
    const duration = config.fallDuration * (0.8 + Math.random() * 0.4);
    const id = ++lineIdCounter;
    const lane = getFreeLane();
    setFallingLines(prev => [...prev, { id, text, duration, lane, spawnTime: Date.now() }]);
    const timer = setTimeout(() => handleLineEndRef.current(id), Math.round(duration * 1000));
    lineTimers.current.set(id, timer);
  }, [config, getFreeLane]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) { setPhase('playing'); gameStartRef.current = Date.now(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => setTimeLeft(tl => {
      if (tl <= 1) { clearInterval(t); setPhase('done'); return 0; }
      return tl - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Spawn
  useEffect(() => {
    if (phase !== 'playing') return;
    spawnLine();
    const t = setInterval(spawnLine, 2500);
    return () => clearInterval(t);
  }, [phase, spawnLine]);

  useEffect(() => { if (phase === 'playing') inputRef.current?.focus(); }, [phase]);

  useEffect(() => {
    if (phase === 'done') onComplete(scoreRef.current, 500);
  }, [phase, onComplete]);

  // Position tick
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, [phase]);

  const handleLineEnd = useCallback((id: number) => {
    lineTimers.current.delete(id);
    if (gameOverRef.current) return;
    setFallingLines(prev => prev.filter(l => l.id !== id));
    livesRef.current -= 1;
    setLives(livesRef.current);
    if (livesRef.current <= 0) { gameOverRef.current = true; setPhase('done'); }
    setTimeout(spawnLine, 600);
  }, [spawnLine]);
  handleLineEndRef.current = handleLineEnd;

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTyped(val);

    const match = fallingRef.current.find(l => l.text.toLowerCase() === val.toLowerCase().trim());
    if (match) {
      clearTimeout(lineTimers.current.get(match.id));
      lineTimers.current.delete(match.id);
      charsTypedRef.current += match.text.length;
      const elapsed = (Date.now() - gameStartRef.current) / 60000;
      setWpm(Math.round((charsTypedRef.current / 5) / Math.max(elapsed, 0.01)));
      setZappedIds(prev => [...prev, match.id]);
      setFallingLines(prev => prev.filter(l => l.id !== match.id));
      const pts = 20 + match.text.length;
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setTyped('');
      setTimeout(spawnLine, 400);
    }
  };

  // Match highlighting
  const getMatchLength = (lineText: string) => {
    const t = typed.toLowerCase();
    const l = lineText.toLowerCase();
    if (l.startsWith(t)) return t.length;
    return 0;
  };

  const timerPct = (timeLeft / config.gameDuration) * 100;

  const areaH = playAreaRef.current?.offsetHeight ?? 400;
  const getLineTop = (line: FallingLine) => {
    const elapsed = Date.now() - line.spawnTime;
    const progress = Math.min(elapsed / (line.duration * 1000), 1);
    return -40 + progress * (areaH + 40);
  };

  return (
    <div className="flex flex-col h-full bg-[#080c10] select-none font-mono">
      {/* Countdown */}
      <AnimatePresence>
        {phase === 'countdown' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#080c10]/95">
            <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
              className="text-8xl font-black text-green-400">
              {countdown === 0 ? '⌨️ TYPE!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#080c10] border-b border-green-500/20">
        <div className="flex gap-1">{Array.from({ length: config.lives }).map((_, i) => (
          <span key={i} className={i < lives ? 'text-green-400' : 'opacity-20 text-gray-600'}>❤️</span>
        ))}</div>
        <div className={`font-black text-xl ${timerPct > 50 ? 'text-green-400' : timerPct > 25 ? 'text-yellow-400' : 'text-red-400'}`}>{timeLeft}s</div>
        <div className="text-right">
          <div className="text-green-400 font-black">{score}</div>
          <div className="text-xs text-gray-600">{wpm} WPM</div>
        </div>
      </div>

      {/* Base line */}
      <div ref={playAreaRef} className="relative flex-1 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500/30 z-10" />
        <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-green-500/40">FIREWALL BASE</div>

        {fallingLines.map(line => {
          const matchLen = getMatchLength(line.text);
          return (
            <div
              key={line.id}
              className="absolute left-0 right-0 px-6 z-20"
              style={{
                top: `${getLineTop(line)}px`,
              }}
            >
              <div
                className={`inline-flex items-center bg-black/70 border rounded-lg px-3 py-1.5 text-sm
                  ${matchLen > 0 ? 'border-cyan-500/60 shadow-[0_0_8px_rgba(0,212,255,0.3)]' : 'border-green-500/30'}`}
                style={{ marginLeft: `${(line.lane / config.maxLines) * 60}%` }}
              >
                <span className="text-cyan-300">{line.text.slice(0, matchLen)}</span>
                <span className="text-green-400/80">{line.text.slice(matchLen)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 bg-[#080c10] border-t border-green-500/20">
        <div className="flex items-center gap-2 bg-black/60 border border-green-500/40 rounded-xl px-4 py-3">
          <span className="text-green-500 font-black">$</span>
          <input ref={inputRef} type="text" value={typed} onChange={handleInput}
            disabled={phase !== 'playing'} autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="type the code lines..."
            className="flex-1 bg-transparent text-green-300 outline-none placeholder-green-900 text-base"
          />
        </div>
        <div className="text-center text-xs text-gray-700 mt-1">Type each line exactly to defend</div>
      </div>
    </div>
  );
}

export default function CodeTyper() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Code Typer" category="Keyboard" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <CodeTyperGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
