import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';

const CARD_PAIRS: Record<AgeTier, { emoji: string; label: string }[]> = {
  junior: [{ emoji: '🦠', label: 'Virus' }, { emoji: '🔒', label: 'Password' }, { emoji: '🎣', label: 'Phishing' }, { emoji: '🛡️', label: 'Shield' }, { emoji: '🔑', label: 'Key' }, { emoji: '🐛', label: 'Worm' }],
  hero: [{ emoji: '🦠', label: 'Virus' }, { emoji: '🔒', label: 'Encryption' }, { emoji: '🎣', label: 'Phishing' }, { emoji: '🛡️', label: 'Firewall' }, { emoji: '🔑', label: 'Password' }, { emoji: '🐛', label: 'Worm' }, { emoji: '👾', label: 'Malware' }, { emoji: '🕵️', label: 'Spyware' }],
  elite: [{ emoji: '🦠', label: 'Virus' }, { emoji: '🔒', label: 'Encryption' }, { emoji: '🎣', label: 'Phishing' }, { emoji: '🛡️', label: 'Firewall' }, { emoji: '🔑', label: 'Auth Key' }, { emoji: '🐛', label: 'Worm' }, { emoji: '👾', label: 'Malware' }, { emoji: '🕵️', label: 'Spyware' }, { emoji: '💀', label: 'Ransomware' }, { emoji: '📧', label: 'Spam' }],
};

const GRID_COLS: Record<AgeTier, number> = { junior: 3, hero: 4, elite: 4 };

interface Card { id: number; pairId: number; emoji: string; label: string; flipped: boolean; matched: boolean; }

function CyberMemoryMatchGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (s: number, m: number) => void }) {
  const pairs = CARD_PAIRS[ageTier];
  const cols = GRID_COLS[ageTier];

  const createDeck = useCallback(() =>
    [...pairs, ...pairs].map((p, i) => ({ id: i, pairId: pairs.findIndex(x => x.emoji === p.emoji), emoji: p.emoji, label: p.label, flipped: false, matched: false })).sort(() => Math.random() - 0.5)
  , [pairs]);

  const [cards, setCards] = useState<Card[]>(() => createDeck());
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [locked, setLocked] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => { if (!started) return; const t = setInterval(() => setTimer(n => n + 1), 1000); return () => clearInterval(t); }, [started]);
  useEffect(() => { if (matches === pairs.length && started) onComplete(Math.max(0, 300 - timer) + matches * 20, pairs.length * 100); }, [matches, pairs.length, started, timer, onComplete]);

  const flip = (id: number) => {
    if (locked || !started) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (selected.length === 1 && selected[0] === id) return;
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    setCards(newCards);
    const newSel = [...selected, id];
    setSelected(newSel);
    if (newSel.length === 2) {
      setMoves(m => m + 1); setLocked(true);
      const [a, b] = newSel.map(sid => newCards.find(c => c.id === sid)!);
      if (a.pairId === b.pairId) {
        setFlash('✅ Match!');
        setTimeout(() => { setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, matched: true } : c)); setMatches(m => m + 1); setSelected([]); setLocked(false); setFlash(null); }, 600);
      } else {
        setFlash('❌ Try again!');
        setTimeout(() => { setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, flipped: false } : c)); setSelected([]); setLocked(false); setFlash(null); }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-5">
      {!started ? (
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="text-6xl">🃏</div>
          <h2 className="text-2xl font-bold">Cyber Memory Match</h2>
          <p className="text-gray-300 text-center max-w-xs">{ageTier === 'junior' ? 'Flip cards to find matching cyber pairs!' : `Match all ${pairs.length} cyber threat pairs. Fewer moves = higher score!`}</p>
          <button onClick={() => setStarted(true)} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-lg transition">Start! 🃏</button>
        </div>
      ) : (
        <>
          <div className="flex gap-4 w-full max-w-sm">
            {[{ label: 'Matched', value: `${matches}/${pairs.length}`, color: 'text-cyan-400' }, { label: 'Moves', value: moves, color: 'text-yellow-400' }, { label: 'Time', value: `${timer}s`, color: 'text-purple-400' }].map(({ label, value, color }) => (
              <div key={label} className="flex-1 bg-white/5 rounded-xl p-2 text-center border border-white/10">
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
          <AnimatePresence>{flash && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-xl font-black text-white">{flash}</motion.div>}</AnimatePresence>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {cards.map(card => (
              <motion.button key={card.id} onClick={() => flip(card.id)} whileTap={{ scale: 0.92 }}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center cursor-pointer
                  ${card.matched ? 'bg-green-500/20 border-2 border-green-500' : card.flipped ? 'bg-cyan-500/20 border-2 border-cyan-500' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                {(card.flipped || card.matched) ? <span className="text-2xl">{card.emoji}</span> : <span className="text-2xl text-gray-600">?</span>}
              </motion.button>
            ))}
          </div>
          {ageTier === 'junior' && <p className="text-sm text-cyan-300 text-center">💡 Byte says: Tap two cards! If they match, they stay open!</p>}
        </>
      )}
    </div>
  );
}

export default function CyberMemoryMatch() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Cyber Memory Match" category="Memory & Match" xpReward={90} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => <CyberMemoryMatchGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
