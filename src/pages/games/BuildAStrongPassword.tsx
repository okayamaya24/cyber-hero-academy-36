import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

interface Ingredient {
  id: string;
  label: string;
  example: string;
  emoji: string;
  strengthDelta: number;
  type: 'good' | 'bad';
  description: string;
}

const INGREDIENTS: Ingredient[] = [
  { id: 'upper',   label: 'Uppercase Letters', example: 'ABC',      emoji: '🔤', strengthDelta: 15, type: 'good', description: 'Capital letters increase variety and strength!' },
  { id: 'lower',   label: 'Lowercase Letters', example: 'abc',      emoji: '🔡', strengthDelta: 10, type: 'good', description: 'Always include lowercase letters too!' },
  { id: 'numbers', label: 'Numbers',            example: '123',      emoji: '🔢', strengthDelta: 20, type: 'good', description: 'Numbers add billions more combinations!' },
  { id: 'symbols', label: 'Symbols !@#$',       example: '!@#',      emoji: '⭐', strengthDelta: 25, type: 'good', description: 'Symbols are the strongest addition!' },
  { id: 'length',  label: '12+ Characters',     example: '············', emoji: '📏', strengthDelta: 20, type: 'good', description: 'Longer passwords = exponentially harder to crack!' },
  { id: 'unique',  label: 'Unique Phrase',       example: 'Tr@ck3r!', emoji: '💡', strengthDelta: 15, type: 'good', description: 'Original phrases nobody would guess!' },
  { id: 'name',    label: 'Your Name',           example: 'Alex2010', emoji: '👤', strengthDelta: -20, type: 'bad', description: 'Personal info is the first thing hackers try!' },
  { id: 'birth',   label: 'Your Birthday',       example: '010110',   emoji: '🎂', strengthDelta: -15, type: 'bad', description: 'Birthdays are easy to find on social media!' },
  { id: 'simple',  label: 'Simple Word',         example: 'apple',    emoji: '📖', strengthDelta: -10, type: 'bad', description: 'Dictionary attacks crack these in seconds!' },
  { id: 'repeat',  label: 'Repeated Chars',      example: 'aaaa1111', emoji: '♻️', strengthDelta: -15, type: 'bad', description: 'Patterns make passwords dramatically weaker!' },
];

function getIngredientChoices(ageTier: AgeTier, used: Set<string>): Ingredient[] {
  const good = INGREDIENTS.filter(i => i.type === 'good' && !used.has(i.id));
  const bad  = INGREDIENTS.filter(i => i.type === 'bad'  && !used.has(i.id));
  if (ageTier === 'junior') {
    return good.slice(0, 3);
  }
  const badCount = ageTier === 'elite' ? 2 : 1;
  return [...good.slice(0, 4 - badCount), ...bad.slice(0, badCount)].sort(() => Math.random() - 0.5);
}

function generatePassword(dropped: Ingredient[]): string {
  let pw = '';
  if (dropped.some(d => d.id === 'upper'))   pw += 'T';
  if (dropped.some(d => d.id === 'lower'))   pw += 'r@ck';
  if (dropped.some(d => d.id === 'numbers')) pw += '3R';
  if (dropped.some(d => d.id === 'symbols')) pw += '!9';
  if (dropped.some(d => d.id === 'length'))  pw += 'xZv2';
  if (dropped.some(d => d.id === 'unique'))  pw += '#Fy';
  if (dropped.some(d => d.id === 'name'))    pw += 'Alex';
  if (dropped.some(d => d.id === 'birth'))   pw += '2010';
  if (dropped.some(d => d.id === 'simple'))  pw += 'apple';
  if (dropped.some(d => d.id === 'repeat'))  pw += 'aaa';
  return pw || '••••';
}

function BuildAStrongPasswordGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const totalRounds = ageTier === 'junior' ? 6 : ageTier === 'hero' ? 8 : 10;
  const [round, setRound] = useState(0);
  const [strength, setStrength] = useState(50);
  const [dropped, setDropped] = useState<Ingredient[]>([]);
  const [used, setUsed] = useState(new Set<string>());
  const [choices, setChoices] = useState(() => getIngredientChoices(ageTier, new Set<string>()));
  const [dragOver, setDragOver] = useState(false);
  const [lastResult, setLastResult] = useState<{ label: string; good: boolean; description: string } | null>(null);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [dragging, setDragging] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDragging(id);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!dragging) return;
    const ingredient = choices.find(c => c.id === dragging);
    if (!ingredient) return;
    addIngredient(ingredient);
    setDragging(null);
  };

  const addIngredient = (ingredient: Ingredient) => {
    if (phase !== 'playing') return;
    const newStrength = Math.max(0, Math.min(100, strength + ingredient.strengthDelta));
    setStrength(newStrength);
    setDropped(prev => [...prev, ingredient]);
    setLastResult({ label: ingredient.label, good: ingredient.type === 'good', description: ingredient.description });

    const newUsed = new Set([...used, ingredient.id]);
    setUsed(newUsed);

    setTimeout(() => {
      setLastResult(null);
      const nextRound = round + 1;
      if (nextRound >= totalRounds) {
        setPhase('done');
        onComplete(Math.round(newStrength), 100);
      } else {
        setRound(nextRound);
        setChoices(getIngredientChoices(ageTier, newUsed));
      }
    }, 1500);
  };

  const strengthLabel =
    strength >= 90 ? { text: '🔐 UNBREAKABLE!', color: 'text-cyan-300', bar: 'bg-cyan-500' } :
    strength >= 70 ? { text: '💪 Strong', color: 'text-green-400', bar: 'bg-green-500' } :
    strength >= 40 ? { text: '⚠️ Medium', color: 'text-yellow-400', bar: 'bg-yellow-500' } :
    { text: '😰 Weak!', color: 'text-red-400', bar: 'bg-red-500' };

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] p-4 gap-4">
      {/* HUD */}
      <div className="flex justify-between text-sm text-gray-400">
        <span>Round {round + 1}/{totalRounds}</span>
        <span className={`font-bold ${strengthLabel.color}`}>{strengthLabel.text}</span>
      </div>

      {/* Strength meter */}
      <div className="space-y-1">
        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
          <motion.div className={`h-full rounded-full ${strengthLabel.bar}`}
            animate={{ width: `${strength}%` }} transition={{ type: 'spring', bounce: 0.3 }} />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Weak</span><span>Medium</span><span>Strong</span><span>Unbreakable</span>
        </div>
      </div>

      {/* Password preview */}
      <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 font-mono text-sm text-center text-gray-300">
        🔑 {generatePassword(dropped)}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 min-h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all
          ${dragOver ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/20 bg-white/5'}`}
      >
        {dropped.length === 0 ? (
          <div className="text-center text-gray-600">
            <div className="text-3xl mb-2">⬇️</div>
            <div className="text-sm">Drag ingredients here to build your password!</div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center p-3">
            {dropped.map((d, i) => (
              <div key={i} className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1
                ${d.type === 'good' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {d.emoji} {d.label.split(' ')[0]}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {lastResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-xl p-3 text-sm text-center font-medium
              ${lastResult.good ? 'bg-green-500/10 border border-green-500 text-green-300' : 'bg-red-500/10 border border-red-500 text-red-300'}`}>
            {lastResult.good ? '✅' : '❌'} {lastResult.description}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ingredient chips */}
      {!lastResult && phase === 'playing' && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 text-center">Drag to add — or tap to select</div>
          <div className="flex flex-col gap-2">
            {choices.map(ingredient => (
              <motion.div
                key={ingredient.id}
                draggable
                onDragStart={() => handleDragStart(ingredient.id)}
                whileTap={{ scale: 0.97 }}
                onClick={() => addIngredient(ingredient)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-grab active:cursor-grabbing font-bold text-sm transition-all select-none
                  bg-white/5 border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-white`}
              >
                <span className="text-2xl">{ingredient.emoji}</span>
                <div className="text-left">
                  <div>{ingredient.label}</div>
                  <div className="text-xs text-gray-500 font-mono">{ingredient.example}</div>
                </div>
                {ageTier === 'junior' && ingredient.type === 'bad' && <span className="ml-auto text-red-400">⚠️</span>}
                <span className={`ml-auto text-sm font-black ${ingredient.type === 'good' ? 'text-green-400' : 'text-red-400'}`}>
                  {ingredient.type === 'good' ? '+' : ''}{ingredient.strengthDelta}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuildAStrongPassword() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Build a Strong Password" category="Drag & Drop" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <BuildAStrongPasswordGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
