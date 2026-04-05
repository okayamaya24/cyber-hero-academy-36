import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CONFIG = {
  junior: { size: 5, packets: 3, hackerMs: 900, duration: 60 },
  hero:   { size: 6, packets: 4, hackerMs: 650, duration: 60 },
  elite:  { size: 7, packets: 5, hackerMs: 450, duration: 90 },
};

type Pos = { row: number; col: number };

function posEq(a: Pos, b: Pos) { return a.row === b.row && a.col === b.col; }

function randomPos(size: number, exclude: Pos[]): Pos {
  let p: Pos;
  do { p = { row: Math.floor(Math.random() * size), col: Math.floor(Math.random() * size) }; }
  while (exclude.some(e => posEq(e, p)));
  return p;
}

function moveToward(from: Pos, to: Pos): Pos {
  const dr = to.row - from.row;
  const dc = to.col - from.col;
  if (Math.abs(dr) >= Math.abs(dc)) {
    return { row: from.row + Math.sign(dr), col: from.col };
  } else {
    return { row: from.row, col: from.col + Math.sign(dc) };
  }
}

function HackerChaseGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const cfg = CONFIG[ageTier];
  const [player, setPlayer] = useState<Pos>({ row: 0, col: 0 });
  const [hacker, setHacker] = useState<Pos>({ row: cfg.size - 1, col: cfg.size - 1 });
  const [packets, setPackets] = useState<Pos[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(cfg.duration);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [catches, setCatches] = useState(0);
  const [flashCell, setFlashCell] = useState<{pos: Pos; color: string} | null>(null);

  const scoreRef = useRef(0);
  const playerRef = useRef(player);
  const hackerRef = useRef(hacker);
  const packetsRef = useRef(packets);
  playerRef.current = player;
  hackerRef.current = hacker;
  packetsRef.current = packets;

  // Init packets
  useEffect(() => {
    const exclude: Pos[] = [{ row: 0, col: 0 }, { row: cfg.size - 1, col: cfg.size - 1 }];
    const ps: Pos[] = [];
    for (let i = 0; i < cfg.packets; i++) {
      const p = randomPos(cfg.size, [...exclude, ...ps]);
      ps.push(p);
    }
    setPackets(ps);
    packetsRef.current = ps;
  }, [cfg]);

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

  // Hacker AI
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      const pkts = packetsRef.current;
      if (pkts.length === 0) return;
      const h = hackerRef.current;
      // Target nearest packet
      const nearest = pkts.reduce((best, p) =>
        Math.abs(p.row - h.row) + Math.abs(p.col - h.col) < Math.abs(best.row - h.row) + Math.abs(best.col - h.col) ? p : best
      );
      const newH = moveToward(h, nearest);
      setHacker(newH);
      hackerRef.current = newH;

      // Did hacker steal?
      const stolen = pkts.find(p => posEq(p, newH));
      if (stolen) {
        setPackets(prev => prev.filter(p => !posEq(p, stolen)));
        packetsRef.current = packetsRef.current.filter(p => !posEq(p, stolen));
        setFlashCell({ pos: newH, color: 'red' });
        setTimeout(() => setFlashCell(null), 400);
        if (packetsRef.current.length === 0) setPhase('done');
      }
    }, cfg.hackerMs);
    return () => clearInterval(t);
  }, [phase, cfg]);

  // Check player interactions after move
  const checkPlayerCell = useCallback((pos: Pos) => {
    // Collect packet
    const pkt = packetsRef.current.find(p => posEq(p, pos));
    if (pkt) {
      setPackets(prev => prev.filter(p => !posEq(p, pkt)));
      packetsRef.current = packetsRef.current.filter(p => !posEq(p, pkt));
      scoreRef.current += 20;
      setScore(scoreRef.current);
      setFlashCell({ pos, color: 'green' });
      setTimeout(() => setFlashCell(null), 300);
      if (packetsRef.current.length === 0) setPhase('done');
    }
    // Catch hacker
    if (posEq(pos, hackerRef.current)) {
      scoreRef.current += 50;
      setScore(scoreRef.current);
      setCatches(c => c + 1);
      // Respawn hacker at opposite corner
      const corners: Pos[] = [
        { row: 0, col: 0 }, { row: 0, col: cfg.size - 1 },
        { row: cfg.size - 1, col: 0 }, { row: cfg.size - 1, col: cfg.size - 1 }
      ];
      const newH = corners.find(c => !posEq(c, pos)) || corners[3];
      setHacker(newH);
      hackerRef.current = newH;
      setFlashCell({ pos, color: 'cyan' });
      setTimeout(() => setFlashCell(null), 400);
    }
  }, [cfg]);

  const move = useCallback((dr: number, dc: number) => {
    if (phase !== 'playing') return;
    setPlayer(prev => {
      const nr = Math.max(0, Math.min(cfg.size - 1, prev.row + dr));
      const nc = Math.max(0, Math.min(cfg.size - 1, prev.col + dc));
      const next = { row: nr, col: nc };
      setTimeout(() => checkPlayerCell(next), 0);
      return next;
    });
  }, [phase, cfg, checkPlayerCell]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); move(-1, 0); }
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); move(1, 0); }
      if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); move(0, -1); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); move(0, 1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  useEffect(() => {
    if (phase === 'done') onComplete(scoreRef.current, 300);
  }, [phase, onComplete]);

  const cellSize = cfg.size <= 5 ? 'w-14 h-14 text-2xl' : cfg.size <= 6 ? 'w-12 h-12 text-xl' : 'w-10 h-10 text-lg';

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] select-none items-center">
      {/* HUD */}
      <div className="w-full flex justify-between items-center px-6 py-3 bg-[#0d1220] border-b border-cyan-500/20">
        <div className="text-sm text-cyan-400">Catches: <span className="font-black text-white">{catches}</span></div>
        <div className="text-xl font-black text-yellow-400">{timeLeft}s</div>
        <div className="text-sm text-green-400">Score: <span className="font-black text-white">{score}</span></div>
      </div>

      <div className="text-xs text-gray-500 py-2">Catch 🕵️ the hacker! Grab 💾 the data!</div>

      {/* Grid */}
      <div
        className="border border-cyan-500/30 rounded-xl overflow-hidden mt-2"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${cfg.size}, 1fr)` }}
      >
        {Array.from({ length: cfg.size }).map((_, row) =>
          Array.from({ length: cfg.size }).map((_, col) => {
            const pos = { row, col };
            const isPlayer = posEq(pos, player);
            const isHacker = posEq(pos, hacker);
            const isPacket = packets.some(p => posEq(p, pos));
            const isFlash = flashCell && posEq(flashCell.pos, pos);
            return (
              <div
                key={`${row}-${col}`}
                className={`${cellSize} flex items-center justify-center border border-white/5 transition-colors
                  ${isFlash && flashCell?.color === 'red' ? 'bg-red-500/40' : ''}
                  ${isFlash && flashCell?.color === 'green' ? 'bg-green-500/40' : ''}
                  ${isFlash && flashCell?.color === 'cyan' ? 'bg-cyan-500/40' : ''}
                  ${!isFlash && isPlayer ? 'bg-cyan-500/20' : ''}
                  ${!isFlash && isHacker && !isPlayer ? 'bg-red-500/10' : ''}
                  ${!isFlash && !isPlayer && !isHacker ? 'bg-black/20' : ''}
                `}
              >
                {isPlayer && isHacker ? '💥' : isPlayer ? '🤖' : isHacker ? (
                  <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>🕵️</motion.span>
                ) : isPacket ? '💾' : ''}
              </div>
            );
          })
        )}
      </div>

      {/* D-pad */}
      <div className="mt-6 grid grid-cols-3 gap-1">
        <div />
        <button onClick={() => move(-1, 0)} className="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/30 text-2xl flex items-center justify-center">↑</button>
        <div />
        <button onClick={() => move(0, -1)} className="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/30 text-2xl flex items-center justify-center">←</button>
        <button onClick={() => move(1, 0)} className="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/30 text-2xl flex items-center justify-center">↓</button>
        <button onClick={() => move(0, 1)} className="w-14 h-14 rounded-xl bg-white/10 hover:bg-white/20 active:bg-cyan-500/30 text-2xl flex items-center justify-center">→</button>
      </div>
    </div>
  );
}

export default function HackerChase() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Hacker Chase" category="Arcade" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <HackerChaseGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
