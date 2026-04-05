import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CONFIG = {
  junior: { speed: 8, maxThreats: 3, gameDuration: 60, spawnMs: 2000 },
  hero:   { speed: 6, maxThreats: 4, gameDuration: 90, spawnMs: 1600 },
  elite:  { speed: 4, maxThreats: 5, gameDuration: 120, spawnMs: 1200 },
};

const THREAT_LABELS: Record<AgeTier, string[]> = {
  junior: ['SPAM', 'VIRUS', 'HACK', 'TRAP', 'WORM', 'BUG', 'BAIT', 'RISK'],
  hero:   ['PHISHING', 'MALWARE', 'SPYWARE', 'ADWARE', 'BOTNET', 'ROOTKIT', 'EXPLOIT', 'BACKDOOR'],
  elite:  ['RANSOMWARE', 'TROJANVIRUS', 'KEYSTROKE', 'INJECTION', 'PRIVILEGE', 'SPOOFING', 'OVERLOAD', 'MITM'],
};

interface Threat {
  id: number;
  label: string;
  speed: number; // seconds to cross
  startTime: number;
  y: number; // 5-85% vertical position
}

let threatId = 0;

function FirewallTyperGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const labels = THREAT_LABELS[ageTier];

  const [threats, setThreats] = useState<Threat[]>([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [wallCracks, setWallCracks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.gameDuration);
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [explosions, setExplosions] = useState<{id: number; y: number}[]>([]);
  const [combo, setCombo] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef(0);
  const cracksRef = useRef(0);
  const gameOverRef = useRef(false);
  const threatsRef = useRef<Threat[]>([]);
  const comboRef = useRef(0);
  const usedLabels = useRef(new Set<string>());

  useEffect(() => { threatsRef.current = threats; }, [threats]);

  const getLabel = () => {
    const available = labels.filter(l => !usedLabels.current.has(l));
    if (available.length === 0) { usedLabels.current.clear(); return labels[Math.floor(Math.random() * labels.length)]; }
    const l = available[Math.floor(Math.random() * available.length)];
    usedLabels.current.add(l);
    return l;
  };

  const spawnThreat = useCallback(() => {
    if (gameOverRef.current) return;
    if (threatsRef.current.length >= config.maxThreats) return;
    const id = ++threatId;
    const label = getLabel();
    const speed = config.speed * (0.7 + Math.random() * 0.6);
    const y = 5 + Math.random() * 80;
    const threat: Threat = { id, label, speed, startTime: Date.now(), y };
    setThreats(prev => [...prev, threat]);
  }, [config, labels]);

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) { setPhase('playing'); return; }
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
    spawnThreat();
    const t = setInterval(spawnThreat, config.spawnMs);
    return () => clearInterval(t);
  }, [phase, spawnThreat, config.spawnMs]);

  useEffect(() => { if (phase === 'playing') inputRef.current?.focus(); }, [phase]);

  const handleThreatReachWall = useCallback((id: number) => {
    if (gameOverRef.current) return;
    setThreats(prev => prev.filter(t => t.id !== id));
    cracksRef.current += 1;
    setWallCracks(cracksRef.current);
    comboRef.current = 0;
    setCombo(0);
    if (cracksRef.current >= 5) { gameOverRef.current = true; setPhase('done'); }
    else setTimeout(spawnThreat, 800);
  }, [spawnThreat]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    setTyped(val);
    const match = threatsRef.current.find(t => t.label === val);
    if (match) {
      comboRef.current += 1;
      setCombo(comboRef.current);
      const mult = comboRef.current >= 5 ? 3 : comboRef.current >= 3 ? 2 : 1;
      scoreRef.current += 15 * mult;
      setScore(scoreRef.current);
      setThreats(prev => prev.filter(t => t.id !== match.id));
      const expId = Date.now();
      setExplosions(prev => [...prev, { id: expId, y: match.y }]);
      setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== expId)), 600);
      setTyped('');
      setTimeout(spawnThreat, 400);
    }
  };

  useEffect(() => {
    if (phase === 'done') onComplete(scoreRef.current, 400);
  }, [phase, onComplete]);

  const maxCracks = 5;

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] select-none">
      <AnimatePresence>
        {phase === 'countdown' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0e1a]/95">
            <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.3, opacity: 0 }}
              className="text-8xl font-black text-cyan-400">
              {countdown === 0 ? '🔥 DEFEND!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1220] border-b border-cyan-500/20">
        <div className="text-sm text-gray-400">
          Wall: {Array.from({ length: maxCracks }).map((_, i) => (
            <span key={i} className={i < wallCracks ? 'text-red-500' : 'text-cyan-500'}>
              {i < wallCracks ? '💥' : '🧱'}
            </span>
          ))}
        </div>
        <div className={`text-xl font-black ${timeLeft > 30 ? 'text-cyan-400' : 'text-red-400'}`}>{timeLeft}s</div>
        <div className="text-right">
          <div className="text-green-400 font-black">{score}</div>
          {combo >= 2 && <div className="text-xs text-yellow-400">x{combo >= 5 ? 3 : combo >= 3 ? 2 : 1}</div>}
        </div>
      </div>

      {/* Play area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Firewall wall */}
        <div className="absolute left-0 top-0 bottom-0 w-10 z-20 flex flex-col items-center justify-center">
          <div className={`w-full h-full border-r-2 flex items-center justify-center text-2xl
            ${wallCracks === 0 ? 'border-cyan-500 bg-cyan-500/10' : wallCracks <= 2 ? 'border-yellow-500 bg-yellow-500/10' : 'border-red-500 bg-red-500/10'}`}>
            <span style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }} className="text-xs font-bold text-cyan-400 rotate-180">
              🔥WALL🔥
            </span>
          </div>
        </div>

        {/* Threats */}
        {threats.map(threat => {
          const matchLen = typed.length > 0 && threat.label.startsWith(typed) ? typed.length : 0;
          return (
            <motion.div key={threat.id}
              className="absolute z-10"
              style={{ top: `${threat.y}%` }}
              initial={{ right: 0 }}
              animate={{ right: '95%' }}
              transition={{ duration: threat.speed, ease: 'linear' }}
              onAnimationComplete={() => handleThreatReachWall(threat.id)}
            >
              <div className={`flex items-center gap-1 bg-black/80 border rounded-lg px-2 py-1 text-sm font-black
                ${matchLen > 0 ? 'border-cyan-500 shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'border-red-500/60'}`}>
                <span className="text-red-400">⚠️</span>
                <span>
                  <span className="text-cyan-300">{threat.label.slice(0, matchLen)}</span>
                  <span className="text-red-300">{threat.label.slice(matchLen)}</span>
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Explosions */}
        <AnimatePresence>
          {explosions.map(ex => (
            <motion.div key={ex.id}
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.6 }}
              className="absolute left-12 text-3xl z-30 pointer-events-none"
              style={{ top: `${ex.y}%` }}>
              💥
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 bg-[#0d1220] border-t border-cyan-500/20">
        <div className="flex items-center gap-3 bg-black/50 border border-cyan-500/40 rounded-xl px-4 py-3">
          <span className="text-cyan-500 font-mono text-lg">&gt;</span>
          <input ref={inputRef} type="text" value={typed} onChange={handleInput}
            disabled={phase !== 'playing'} autoComplete="off" autoCorrect="off" spellCheck={false}
            placeholder="TYPE THREAT LABEL TO DESTROY..."
            className="flex-1 bg-transparent text-cyan-300 font-black text-lg uppercase tracking-widest outline-none placeholder-cyan-900"
          />
        </div>
      </div>
    </div>
  );
}

export default function FirewallTyper() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Firewall Typer" category="Keyboard" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <FirewallTyperGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
