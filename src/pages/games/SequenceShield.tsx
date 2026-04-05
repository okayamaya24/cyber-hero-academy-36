import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CONFIG = {
  junior: { startLen: 3, maxLen: 8,  lives: 3, showMs: 2000, gapMs: 1000 },
  hero:   { startLen: 4, maxLen: 10, lives: 2, showMs: 1500, gapMs: 800 },
  elite:  { startLen: 5, maxLen: 12, lives: 1, showMs: 1000, gapMs: 600 },
};

const BUTTONS = [
  { id: 0, emoji: '🔐', label: 'Lock',    color: 'bg-cyan-500',   active: 'bg-cyan-300   shadow-[0_0_20px_rgba(0,212,255,0.8)]' },
  { id: 1, emoji: '🔑', label: 'Key',     color: 'bg-yellow-500', active: 'bg-yellow-300 shadow-[0_0_20px_rgba(253,224,71,0.8)]' },
  { id: 2, emoji: '🛡️', label: 'Shield',  color: 'bg-green-500',  active: 'bg-green-300  shadow-[0_0_20px_rgba(74,222,128,0.8)]' },
  { id: 3, emoji: '🔒', label: 'Vault',   color: 'bg-purple-500', active: 'bg-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.8)]' },
  { id: 4, emoji: '📱', label: '2FA',     color: 'bg-blue-500',   active: 'bg-blue-300   shadow-[0_0_20px_rgba(59,130,246,0.8)]' },
  { id: 5, emoji: '🌐', label: 'Network', color: 'bg-orange-500', active: 'bg-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.8)]' },
];

function SequenceShieldGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<'watch' | 'repeat' | 'done'>('watch');
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [lives, setLives] = useState(config.lives);
  const [level, setLevel] = useState(config.startLen);
  const [status, setStatus] = useState<'correct' | 'wrong' | null>(null);
  const scoreRef = React.useRef(0);

  const generateSequence = useCallback((len: number) => {
    const seq: number[] = [];
    for (let i = 0; i < len; i++) seq.push(Math.floor(Math.random() * BUTTONS.length));
    return seq;
  }, []);

  const playSequence = useCallback(async (seq: number[]) => {
    setPhase('watch');
    setPlayerSeq([]);
    await new Promise(r => setTimeout(r, 800));
    for (const btnId of seq) {
      setActiveBtn(btnId);
      await new Promise(r => setTimeout(r, config.showMs));
      setActiveBtn(null);
      await new Promise(r => setTimeout(r, config.gapMs));
    }
    setPhase('repeat');
  }, [config]);

  // Start game
  useEffect(() => {
    const seq = generateSequence(config.startLen);
    setSequence(seq);
    setLevel(config.startLen);
    playSequence(seq);
  }, []);

  const handlePress = useCallback((btnId: number) => {
    if (phase !== 'repeat') return;

    setActiveBtn(btnId);
    setTimeout(() => setActiveBtn(null), 200);

    const newPlayer = [...playerSeq, btnId];
    setPlayerSeq(newPlayer);

    const pos = newPlayer.length - 1;
    if (sequence[pos] !== btnId) {
      // Wrong!
      setStatus('wrong');
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        setTimeout(() => setPhase('done'), 800);
        onComplete(scoreRef.current, config.maxLen * 20);
      } else {
        setTimeout(() => {
          setStatus(null);
          playSequence(sequence); // retry same
        }, 1000);
      }
      return;
    }

    if (newPlayer.length === sequence.length) {
      // Completed!
      setStatus('correct');
      scoreRef.current += level * 20;
      const nextLen = level + 1;
      if (nextLen > config.maxLen) {
        setTimeout(() => {
          setPhase('done');
          onComplete(scoreRef.current, config.maxLen * 20);
        }, 1000);
      } else {
        setLevel(nextLen);
        setTimeout(() => {
          setStatus(null);
          const newSeq = generateSequence(nextLen);
          setSequence(newSeq);
          playSequence(newSeq);
        }, 1000);
      }
    }
  }, [phase, playerSeq, sequence, lives, level, config, playSequence, generateSequence, onComplete]);

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] items-center p-6 gap-6">
      {/* Status banner */}
      <div className={`w-full rounded-xl py-3 text-center font-black text-lg transition-colors
        ${status === 'correct' ? 'bg-green-500/20 border border-green-500 text-green-300' :
          status === 'wrong' ? 'bg-red-500/20 border border-red-500 text-red-300' :
          phase === 'watch' ? 'bg-blue-500/20 border border-blue-500 text-blue-300' :
          'bg-yellow-500/20 border border-yellow-500 text-yellow-300'}`}>
        {status === 'correct' ? '✅ Correct! Next level!' :
         status === 'wrong' ? '❌ Wrong! Try again...' :
         phase === 'watch' ? '👀 WATCH the sequence!' :
         '⚡ REPEAT the sequence!'}
      </div>

      {/* Level & Lives */}
      <div className="flex w-full justify-between items-center">
        <div className="text-sm text-gray-400">Sequence length: <span className="font-black text-white">{level}</span></div>
        <div className="flex gap-1">{Array.from({ length: config.lives }).map((_, i) => (
          <span key={i} className={i < lives ? 'text-cyan-400 text-xl' : 'text-gray-700 text-xl'}>🛡️</span>
        ))}</div>
        <div className="text-sm text-gray-400">Score: <span className="font-black text-green-400">{scoreRef.current}</span></div>
      </div>

      {/* Sequence indicator dots */}
      <div className="flex gap-1.5">
        {sequence.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < playerSeq.length ? 'bg-green-500' : 'bg-white/10'}`} />
        ))}
      </div>

      {/* Buttons grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {BUTTONS.map(btn => (
          <motion.button
            key={btn.id}
            whileTap={phase === 'repeat' ? { scale: 0.9 } : {}}
            onClick={() => handlePress(btn.id)}
            disabled={phase !== 'repeat'}
            className={`h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all
              ${activeBtn === btn.id ? btn.active : btn.color + '/30 border-2 border-white/20'}
              ${phase !== 'repeat' ? 'cursor-default' : 'hover:opacity-80 cursor-pointer'}
            `}
          >
            <span className="text-2xl">{btn.emoji}</span>
            <span className="text-xs font-bold text-white">{btn.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="text-xs text-gray-600 text-center">
        {phase === 'watch' ? 'Watch carefully and remember the order!' : 'Tap the buttons in the same order!'}
      </div>
    </div>
  );
}

export default function SequenceShield() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Sequence Shield" category="Memory & Match" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <SequenceShieldGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
