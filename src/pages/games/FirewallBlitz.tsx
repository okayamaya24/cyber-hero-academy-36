import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CONFIG = {
  junior: { lanes: 3, lives: 5, duration: 60, threatSpeed: 7000, spawnMs: 2500 },
  hero:   { lanes: 4, lives: 3, duration: 60, threatSpeed: 5000, spawnMs: 1800 },
  elite:  { lanes: 4, lives: 3, duration: 90, threatSpeed: 3500, spawnMs: 1200 },
};

const THREATS = ['🦠', '💀', '🐛', '👾', '⚠️', '💣', '🔴'];
const LANE_COLORS = [
  'border-cyan-500/50 bg-cyan-500/5',
  'border-purple-500/50 bg-purple-500/5',
  'border-green-500/50 bg-green-500/5',
  'border-yellow-500/50 bg-yellow-500/5',
];

interface Threat {
  id: number;
  lane: number;
  emoji: string;
  duration: number;
  startTime: number;
}

let idCounter = 0;

interface FloatMsg { id: number; text: string; x: number; y: number }

function FirewallBlitzGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'done'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(config.lives);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [combo, setCombo] = useState(0);
  const [floatMsgs, setFloatMsgs] = useState<FloatMsg[]>([]);
  const [hitLanes, setHitLanes] = useState<number[]>([]);

  const scoreRef = useRef(0);
  const livesRef = useRef(config.lives);
  const comboRef = useRef(0);
  const gameOverRef = useRef(false);
  const threatsRef = useRef<Threat[]>([]);

  useEffect(() => { threatsRef.current = threats; }, [threats]);

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

  // Spawn threats
  useEffect(() => {
    if (phase !== 'playing') return;
    const spawn = () => {
      if (gameOverRef.current) return;
      const lane = Math.floor(Math.random() * config.lanes);
      const emoji = THREATS[Math.floor(Math.random() * THREATS.length)];
      const speedVar = config.threatSpeed * (0.8 + Math.random() * 0.4);
      const id = ++idCounter;
      const threat: Threat = { id, lane, emoji, duration: speedVar, startTime: Date.now() };
      setThreats(prev => [...prev, threat]);
    };
    spawn();
    const t = setInterval(spawn, config.spawnMs);
    return () => clearInterval(t);
  }, [phase, config]);

  // Threat reaches base
  const handleReachBase = useCallback((id: number, lane: number) => {
    if (gameOverRef.current) return;
    setThreats(prev => prev.filter(t => t.id !== id));
    livesRef.current -= 1;
    setLives(livesRef.current);
    comboRef.current = 0;
    setCombo(0);
    setHitLanes(prev => [...prev, lane]);
    setTimeout(() => setHitLanes(prev => prev.filter(l => l !== lane)), 400);
    if (livesRef.current <= 0) {
      gameOverRef.current = true;
      setPhase('done');
    }
  }, []);

  // Block threat
  const handleBlock = useCallback((lane: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (phase !== 'playing') return;
    const now = Date.now();
    const laneThreat = [...threatsRef.current]
      .filter(t => t.lane === lane)
      .sort((a, b) => {
        const ap = (now - a.startTime) / a.duration;
        const bp = (now - b.startTime) / b.duration;
        return bp - ap;
      })[0];

    if (!laneThreat) return;

    comboRef.current += 1;
    setCombo(comboRef.current);
    const mult = comboRef.current >= 5 ? 3 : comboRef.current >= 3 ? 2 : 1;
    const pts = 10 * mult;
    scoreRef.current += pts;
    setScore(scoreRef.current);

    setThreats(prev => prev.filter(t => t.id !== laneThreat.id));

    const msgId = Date.now() + Math.random();
    const rect = e.currentTarget.getBoundingClientRect();
    setFloatMsgs(prev => [...prev, {
      id: msgId,
      text: mult > 1 ? `🔥x${mult} +${pts}` : `+${pts}`,
      x: rect.left + rect.width / 2,
      y: rect.top,
    }]);
    setTimeout(() => setFloatMsgs(prev => prev.filter(m => m.id !== msgId)), 900);
  }, [phase]);

  useEffect(() => {
    if (phase === 'done') onComplete(scoreRef.current, 300);
  }, [phase, onComplete]);

  const timerPct = (timeLeft / config.duration) * 100;
  const timerColor = timerPct > 50 ? 'bg-cyan-500' : timerPct > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] select-none relative overflow-hidden">
      {/* Countdown overlay */}
      <AnimatePresence>
        {phase === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a0e1a]/95"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0 }}
              className="text-9xl font-black text-cyan-400 drop-shadow-[0_0_20px_rgba(0,212,255,0.8)]"
            >
              {countdown === 0 ? '🔥 GO!' : countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1220] border-b border-cyan-500/20 gap-4">
        <div className="flex gap-1 min-w-[80px]">
          {Array.from({ length: config.lives }).map((_, i) => (
            <motion.span
              key={i}
              animate={{ scale: i === lives && lives < config.lives ? [1.3, 1] : 1 }}
              className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}
            >🛡️</motion.span>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-lg font-black text-white">{timeLeft}s</div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${timerColor}`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="text-right min-w-[80px]">
          <div className="text-xl font-black text-green-400">{score}</div>
          {combo >= 2 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="text-xs text-yellow-400 font-bold"
            >
              {combo >= 5 ? '🔥 x3' : combo >= 3 ? '⚡ x2' : '💥 x1'}
            </motion.div>
          )}
        </div>
      </div>

      {/* Lanes */}
      <div className="flex-1 flex flex-col gap-1.5 p-2">
        {Array.from({ length: config.lanes }).map((_, lane) => (
          <div
            key={lane}
            className={`flex-1 relative rounded-xl border ${LANE_COLORS[lane]} overflow-hidden flex items-center`}
          >
            {/* Base */}
            <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center z-10 bg-gradient-to-r from-[#0d1220] via-[#0d1220]/80 to-transparent">
              <span className="text-2xl">🏰</span>
            </div>

            {/* Hit flash */}
            <AnimatePresence>
              {hitLanes.includes(lane) && (
                <motion.div
                  initial={{ opacity: 0.6 }} animate={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-red-600/40 z-20"
                />
              )}
            </AnimatePresence>

            {/* Threats */}
            {threats.filter(t => t.lane === lane).map(threat => (
              <motion.div
                key={threat.id}
                className="absolute text-3xl z-15 pointer-events-none"
                style={{ top: '50%', transform: 'translateY(-50%)' }}
                initial={{ right: '70px' }}
                animate={{ right: '95%' }}
                transition={{ duration: threat.duration / 1000, ease: 'linear' }}
                onAnimationComplete={() => handleReachBase(threat.id, lane)}
              >
                {threat.emoji}
              </motion.div>
            ))}

            {/* Shield button */}
            <button
              onClick={(e) => handleBlock(lane, e)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-400 active:scale-90 transition-all flex items-center justify-center text-xl shadow-lg shadow-cyan-500/50 border-2 border-cyan-300"
            >
              🛡️
            </button>
          </div>
        ))}
      </div>

      {/* Floating score popups */}
      <AnimatePresence>
        {floatMsgs.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -60, scale: 1.4 }}
            transition={{ duration: 0.9 }}
            className="fixed pointer-events-none z-50 font-black text-yellow-400 text-lg drop-shadow-lg"
            style={{ left: msg.x - 24, top: msg.y - 10 }}
          >
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function FirewallBlitz() {
  const ageTier: AgeTier = 'hero'; // TODO: pull from user profile
  return (
    <GameShell
      title="Firewall Blitz"
      category="Arcade"
      xpReward={150}
      ageTier={ageTier}
      onClose={() => window.history.back()}
    >
      {({ ageTier, onComplete }) => (
        <FirewallBlitzGame ageTier={ageTier} onComplete={onComplete} />
      )}
    </GameShell>
  );
}
