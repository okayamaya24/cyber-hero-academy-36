import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CONFIG = {
  junior: { grid: 3, duration: 45, lives: 5, virusLife: 3000, spawnMs: 1800 },
  hero:   { grid: 4, duration: 60, lives: 3, virusLife: 2000, spawnMs: 1400 },
  elite:  { grid: 5, duration: 75, lives: 2, virusLife: 1300, spawnMs: 900 },
};

const VIRUSES = ['🦠', '💀', '🐛', '👾', '🔴'];
const SHIELDS = ['🛡️', '✅', '🔒'];

interface Cell { id: number; emoji: string; type: 'virus' | 'shield' | 'empty'; active: boolean; }

function VirusVaporizerGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (s: number, m: number) => void }) {
  const cfg = CONFIG[ageTier];
  const total = cfg.grid * cfg.grid;
  const [cells, setCells] = useState<Cell[]>(() => Array.from({ length: total }, (_, i) => ({ id: i, emoji: '', type: 'empty', active: false })));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(cfg.lives);
  const [timeLeft, setTimeLeft] = useState(cfg.duration);
  const [running, setRunning] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const scoreRef = useRef(0);
  const livesRef = useRef(cfg.lives);
  const endedRef = useRef(false);

  const end = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setRunning(false);
    onComplete(scoreRef.current, cfg.duration * 2);
  }, [cfg.duration, onComplete]);

  const start = () => {
    endedRef.current = false;
    scoreRef.current = 0;
    livesRef.current = cfg.lives;
    setScore(0); setLives(cfg.lives); setTimeLeft(cfg.duration); setStreak(0);
    setCells(Array.from({ length: total }, (_, i) => ({ id: i, emoji: '', type: 'empty', active: false })));
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setTimeLeft(t => { if (t <= 1) { end(); return 0; } return t - 1; }), 1000);
    return () => clearInterval(timer);
  }, [running, end]);

  useEffect(() => {
    if (!running) return;
    let spawnMs = cfg.spawnMs;
    const spawn = () => {
      setCells(prev => {
        const empty = prev.filter(c => !c.active);
        if (!empty.length) return prev;
        const cell = empty[Math.floor(Math.random() * empty.length)];
        const isVirus = Math.random() > 0.25;
        const updated = [...prev];
        updated[cell.id] = { ...cell, active: true, type: isVirus ? 'virus' : 'shield', emoji: isVirus ? VIRUSES[Math.floor(Math.random() * VIRUSES.length)] : SHIELDS[Math.floor(Math.random() * SHIELDS.length)] };
        setTimeout(() => {
          setCells(c => {
            const next = [...c];
            if (next[cell.id].active) {
              if (isVirus) { livesRef.current -= 1; setLives(livesRef.current); if (livesRef.current <= 0) end(); }
              next[cell.id] = { ...next[cell.id], active: false, type: 'empty', emoji: '' };
            }
            return next;
          });
        }, cfg.virusLife);
        return updated;
      });
      spawnMs = Math.max(spawnMs * 0.97, 400);
      if (!endedRef.current) timeout = setTimeout(spawn, spawnMs);
    };
    let timeout = setTimeout(spawn, spawnMs);
    return () => clearTimeout(timeout);
  }, [running, cfg, end]);

  const tap = (cell: Cell) => {
    if (!cell.active || !running) return;
    setCells(prev => { const u = [...prev]; u[cell.id] = { ...cell, active: false, type: 'empty', emoji: '' }; return u; });
    if (cell.type === 'virus') {
      const ns = streak + 1; const pts = 10 * (ns >= 3 ? 2 : 1);
      scoreRef.current += pts; setScore(s => s + pts); setStreak(ns);
      if (ns >= 3) { setShowStreak(true); setTimeout(() => setShowStreak(false), 900); }
    } else { livesRef.current -= 1; setLives(livesRef.current); setStreak(0); if (livesRef.current <= 0) end(); }
  };

  return (
    <div className="flex flex-col items-center gap-5 p-6">
      <div className="flex gap-4 w-full max-w-sm">
        {[{ label: 'Score', value: score, color: 'text-cyan-400' }, { label: 'Time', value: `${timeLeft}s`, color: 'text-yellow-400' }, { label: 'Lives', value: '❤️'.repeat(Math.max(lives,0))+'🖤'.repeat(Math.max(cfg.lives-lives,0)), color: 'text-red-400' }].map(({ label, value, color }) => (
          <div key={label} className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/10">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>
      <AnimatePresence>{showStreak && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-2xl font-black text-yellow-400">🔥 {streak}x STREAK!</motion.div>}</AnimatePresence>
      {!running ? (
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="text-6xl">🦠</div>
          <p className="text-gray-300 text-center max-w-xs">{ageTier === 'junior' ? 'Tap the viruses to zap them! Leave the shields alone! 🛡️' : 'Destroy viruses before they infect your files! Avoid safe items!'}</p>
          <button onClick={start} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-lg transition">Start! 🎮</button>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cfg.grid}, minmax(0, 1fr))` }}>
          {cells.map(cell => (
            <motion.button key={cell.id} whileTap={{ scale: 0.8 }} onClick={() => tap(cell)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl transition-all
                ${cell.active && cell.type === 'virus' ? 'bg-red-500/30 border-2 border-red-500 shadow-lg shadow-red-500/30' : ''}
                ${cell.active && cell.type === 'shield' ? 'bg-green-500/30 border-2 border-green-500' : ''}
                ${!cell.active ? 'bg-white/5 border border-white/10' : ''}`}>
              <AnimatePresence>{cell.active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>{cell.emoji}</motion.span>}</AnimatePresence>
            </motion.button>
          ))}
        </div>
      )}
      {ageTier === 'junior' && running && <p className="text-sm text-cyan-300 text-center">💡 Byte says: Tap 🦠 viruses, ignore 🛡️ shields!</p>}
    </div>
  );
}

export default function VirusVaporizer() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Virus Vaporizer" category="Arcade" xpReward={100} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => <VirusVaporizerGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
