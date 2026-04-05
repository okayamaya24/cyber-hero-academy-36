import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

interface Block {
  id: string;
  label: string;
  example: string;
  emoji: string;
  points: number;
  type: 'good' | 'bad';
  description: string;
}

const ALL_BLOCKS: Block[] = [
  { id: 'upper', label: 'Uppercase Letters', example: 'ABC', emoji: '🔤', points: 15, type: 'good', description: 'Capital letters increase variety!' },
  { id: 'lower', label: 'Lowercase Letters', example: 'abc', emoji: '🔡', points: 10, type: 'good', description: 'Always include lowercase letters!' },
  { id: 'numbers', label: 'Numbers', example: '123', emoji: '🔢', points: 20, type: 'good', description: 'Numbers add many more combinations!' },
  { id: 'symbols', label: 'Special Symbols', example: '!@#$', emoji: '⭐', points: 25, type: 'good', description: 'Symbols are the strongest addition!' },
  { id: 'length', label: '12+ Characters', example: '············', emoji: '📏', points: 20, type: 'good', description: 'Longer is always stronger!' },
  { id: 'unique', label: 'Unique Phrase', example: 'Tr@ck3r!', emoji: '💡', points: 15, type: 'good', description: 'Original phrases are memorable and strong!' },
  { id: 'name', label: 'Your Name', example: 'Alex2010', emoji: '👤', points: -20, type: 'bad', description: 'Personal info is easy to guess!' },
  { id: 'birthday', label: 'Your Birthday', example: '010110', emoji: '🎂', points: -15, type: 'bad', description: 'Hackers always try birthdays first!' },
  { id: 'simple', label: 'Simple Dictionary Word', example: 'apple', emoji: '📖', points: -10, type: 'bad', description: 'Dictionary attacks crack these instantly!' },
  { id: 'repeated', label: 'Repeated Characters', example: 'aaaa1111', emoji: '♻️', points: -15, type: 'bad', description: 'Patterns make passwords weaker!' },
];

function getRoundChoices(ageTier: AgeTier, round: number, used: Set<string>): Block[] {
  const good = ALL_BLOCKS.filter(b => b.type === 'good' && !used.has(b.id));
  const bad = ALL_BLOCKS.filter(b => b.type === 'bad' && !used.has(b.id));
  if (ageTier === 'junior') {
    return good.slice(0, Math.min(3, good.length));
  }
  const goodPick = good.slice(0, 2);
  const badPick = bad.slice(0, ageTier === 'elite' ? 2 : 1);
  return [...goodPick, ...badPick].sort(() => Math.random() - 0.5);
}

function PasswordTowerGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const totalRounds = ageTier === 'junior' ? 6 : ageTier === 'hero' ? 8 : 10;
  const [round, setRound] = useState(0);
  const [strength, setStrength] = useState(0);
  const [stack, setStack] = useState<Block[]>([]);
  const [used, setUsed] = useState(new Set<string>());
  const [choices, setChoices] = useState(() => getRoundChoices(ageTier, 0, new Set()));
  const [lastResult, setLastResult] = useState<{ block: Block; good: boolean } | null>(null);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [scoreTotal, setScoreTotal] = useState(0);

  const handlePick = (block: Block) => {
    if (phase !== 'playing') return;
    const newStrength = Math.max(0, Math.min(100, strength + block.points));
    setStrength(newStrength);
    setScoreTotal(s => Math.max(0, s + block.points));
    setStack(prev => [...prev, block]);
    setUsed(prev => new Set([...prev, block.id]));
    setLastResult({ block, good: block.type === 'good' });

    setTimeout(() => {
      setLastResult(null);
      const nextRound = round + 1;
      if (nextRound >= totalRounds) {
        setPhase('done');
        onComplete(Math.max(0, newStrength * 2), 200);
      } else {
        setRound(nextRound);
        const newUsed = new Set([...used, block.id]);
        setChoices(getRoundChoices(ageTier, nextRound, newUsed));
      }
    }, 1500);
  };

  const strengthLabel =
    strength >= 90 ? { text: '🔐 UNBREAKABLE!', color: 'text-cyan-300' } :
    strength >= 70 ? { text: '💪 Strong!', color: 'text-green-400' } :
    strength >= 40 ? { text: '⚠️ Medium', color: 'text-yellow-400' } :
    { text: '😰 Weak!', color: 'text-red-400' };

  const barColor = strength >= 70 ? 'bg-cyan-500' : strength >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] gap-4 p-4">
      {/* HUD */}
      <div className="flex justify-between text-sm text-gray-400">
        <span>Round {round + 1}/{totalRounds}</span>
        <span className={`font-bold ${strengthLabel.color}`}>{strengthLabel.text}</span>
      </div>

      {/* Strength meter */}
      <div className="space-y-1">
        <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10">
          <motion.div className={`h-full rounded-full ${barColor}`} animate={{ width: `${strength}%` }} transition={{ type: 'spring', bounce: 0.3 }} />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Weak</span><span>Medium</span><span>Strong</span><span>Unbreakable</span>
        </div>
      </div>

      {/* Tower visualization */}
      <div className="flex-1 flex flex-col-reverse gap-1 overflow-hidden max-h-40 border border-white/10 rounded-xl bg-black/20 p-2">
        <AnimatePresence>
          {stack.map((b, i) => (
            <motion.div key={b.id}
              initial={{ opacity: 0, scale: 0, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold
                ${b.type === 'good' ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'}`}>
              <span>{b.emoji}</span><span>{b.label}</span>
              <span className={`ml-auto font-black ${b.type === 'good' ? 'text-green-400' : 'text-red-400'}`}>
                {b.type === 'good' ? '+' : ''}{b.points}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {stack.length === 0 && <div className="text-center text-gray-700 text-xs py-4">Your password tower will grow here!</div>}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {lastResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-xl p-3 text-sm font-bold text-center ${lastResult.good ? 'bg-green-500/20 border border-green-500 text-green-300' : 'bg-red-500/20 border border-red-500 text-red-300'}`}>
            {lastResult.good ? '✅' : '❌'} {lastResult.block.description}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choices */}
      {!lastResult && phase === 'playing' && (
        <div className="space-y-2">
          <div className="text-sm text-gray-400 text-center">Choose a block for your password tower!</div>
          <div className="grid grid-cols-1 gap-2">
            {choices.map(block => (
              <motion.button key={block.id} whileTap={{ scale: 0.97 }} onClick={() => handlePick(block)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold text-sm transition-all
                  ${block.type === 'good' || ageTier !== 'junior'
                    ? 'bg-white/5 border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-white'
                    : 'bg-white/5 border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-white'
                  }`}>
                <span className="text-2xl">{block.emoji}</span>
                <div className="text-left">
                  <div>{block.label}</div>
                  <div className="text-xs text-gray-500 font-mono">{block.example}</div>
                </div>
                {ageTier === 'junior' && block.type === 'bad' && <span className="ml-auto text-red-400">⚠️</span>}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PasswordTower() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Password Tower" category="Puzzle" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <PasswordTowerGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
