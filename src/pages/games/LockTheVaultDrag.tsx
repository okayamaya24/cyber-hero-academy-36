import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

interface Round {
  id: number;
  attack: string;
  attackEmoji: string;
  defenses: { label: string; emoji: string; correct: boolean; explanation: string }[];
}

const ALL_ROUNDS: Round[] = [
  {
    id: 1,
    attack: 'Virus Attack!',
    attackEmoji: '🦠',
    defenses: [
      { label: 'Run Antivirus Scan',    emoji: '🛡️', correct: true,  explanation: 'Antivirus software detects and removes viruses!' },
      { label: 'Drink More Coffee',     emoji: '☕', correct: false, explanation: 'Coffee won\'t help your computer — try antivirus!' },
      { label: 'Add More RAM',          emoji: '💾', correct: false, explanation: 'More RAM won\'t stop a virus — you need antivirus!' },
      { label: 'Restart the Computer',  emoji: '🔄', correct: false, explanation: 'Restarting doesn\'t remove a virus, just delays it!' },
    ],
  },
  {
    id: 2,
    attack: 'Phishing Email Detected!',
    attackEmoji: '🎣',
    defenses: [
      { label: 'Delete Without Clicking', emoji: '🗑️', correct: true,  explanation: 'Never click links in phishing emails — just delete!' },
      { label: 'Click the Link',          emoji: '🔗', correct: false, explanation: 'Clicking phishing links can install malware!' },
      { label: 'Reply with Your Info',    emoji: '📝', correct: false, explanation: 'Never reply with personal info to suspicious emails!' },
      { label: 'Forward to Friends',      emoji: '📤', correct: false, explanation: 'Forwarding spreads the phishing to others!' },
    ],
  },
  {
    id: 3,
    attack: 'Weak Password Exposed!',
    attackEmoji: '🔓',
    defenses: [
      { label: 'Add Numbers & Symbols',  emoji: '🔢', correct: true,  explanation: 'Mixing character types dramatically strengthens passwords!' },
      { label: 'Use Your Pet\'s Name',   emoji: '🐱', correct: false, explanation: 'Pet names are easy to guess from social media!' },
      { label: 'Make it Shorter',        emoji: '📏', correct: false, explanation: 'Shorter passwords are weaker, not stronger!' },
      { label: 'Use "1234"',             emoji: '🔑', correct: false, explanation: '"1234" is one of the most common passwords ever — never use it!' },
    ],
  },
  {
    id: 4,
    attack: 'Stranger Online!',
    attackEmoji: '👤',
    defenses: [
      { label: 'Block and Report',         emoji: '🚫', correct: true,  explanation: 'Always block and report strangers who make you uncomfortable!' },
      { label: 'Share Your Home Address',  emoji: '🏠', correct: false, explanation: 'Never share personal info with online strangers!' },
      { label: 'Meet Them in Person',      emoji: '🤝', correct: false, explanation: 'Never meet online strangers in person without a trusted adult!' },
      { label: 'Give Your Phone Number',   emoji: '📱', correct: false, explanation: 'Never share contact details with unknown people online!' },
    ],
  },
  {
    id: 5,
    attack: 'Suspicious Unknown App!',
    attackEmoji: '📱',
    defenses: [
      { label: 'Check Reviews & Ratings',  emoji: '🔍', correct: true,  explanation: 'Always research apps before installing — check reviews and developer info!' },
      { label: 'Install Immediately',      emoji: '📲', correct: false, explanation: 'Installing unknown apps can introduce malware to your device!' },
      { label: 'Grant All Permissions',    emoji: '✅', correct: false, explanation: 'Only grant permissions an app actually needs to work!' },
      { label: 'Share With Friends',       emoji: '📤', correct: false, explanation: 'Don\'t share unverified apps — you could spread malware!' },
    ],
  },
  {
    id: 6,
    attack: 'Suspicious Website!',
    attackEmoji: '🌐',
    defenses: [
      { label: 'Check for HTTPS 🔒',     emoji: '🔒', correct: true,  explanation: 'Always look for HTTPS before entering any information!' },
      { label: 'Enter Your Password',    emoji: '🔑', correct: false, explanation: 'Never enter passwords on suspicious or unverified sites!' },
      { label: 'Ignore the Warning',     emoji: '⚠️', correct: false, explanation: 'Browser warnings exist for a reason — never ignore them!' },
      { label: 'Download Everything',    emoji: '💾', correct: false, explanation: 'Never download files from suspicious websites!' },
    ],
  },
];

const ROUND_COUNTS: Record<AgeTier, number> = { junior: 4, hero: 5, elite: 6 };

function LockTheVaultDragGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const roundCount = ROUND_COUNTS[ageTier];
  const rounds = ALL_ROUNDS.slice(0, roundCount);

  const [roundIdx, setRoundIdx] = useState(0);
  const [vaultHealth, setVaultHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [result, setResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOverVault, setDragOverVault] = useState(false);
  const [vaultAnimation, setVaultAnimation] = useState<'idle' | 'success' | 'fail'>('idle');

  const round = rounds[roundIdx];

  const handleDefenseDrop = (label: string) => {
    if (result) return;
    const defense = round.defenses.find(d => d.label === label);
    if (!defense) return;
    processAnswer(defense);
  };

  const processAnswer = (defense: typeof round.defenses[0]) => {
    setAttempts(a => a + 1);
    if (defense.correct) {
      const pts = attempts === 0 ? 25 : attempts === 1 ? 10 : 5;
      setScore(s => s + pts);
      setVaultAnimation('success');
      setResult({ correct: true, explanation: defense.explanation });
      setTimeout(() => {
        setVaultAnimation('idle');
        setResult(null);
        setAttempts(0);
        if (roundIdx + 1 >= rounds.length) {
          onComplete(score + pts, roundCount * 25);
        } else {
          setRoundIdx(r => r + 1);
        }
      }, 1500);
    } else {
      setVaultHealth(h => Math.max(0, h - 20));
      setVaultAnimation('fail');
      setResult({ correct: false, explanation: defense.explanation });
      setTimeout(() => { setVaultAnimation('idle'); setResult(null); }, 1200);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] p-4 gap-4">
      {/* Progress */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Round {roundIdx + 1}/{rounds.length}</span>
        <span className="text-green-400 font-bold">{score} pts</span>
      </div>

      {/* Attack banner */}
      <motion.div
        animate={{ x: [0, -3, 3, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="bg-red-900/30 border border-red-500/50 rounded-2xl p-4 text-center"
      >
        <div className="text-5xl mb-1">{round.attackEmoji}</div>
        <div className="text-lg font-black text-red-300">{round.attack}</div>
        <div className="text-xs text-gray-500 mt-1">Drag the correct defense to the vault!</div>
      </motion.div>

      {/* Vault drop zone */}
      <div
        className={`rounded-2xl border-4 flex flex-col items-center justify-center py-6 transition-all
          ${dragOverVault ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/20 bg-white/5'}
          ${vaultAnimation === 'success' ? 'border-green-500 bg-green-500/20' : ''}
          ${vaultAnimation === 'fail' ? 'border-red-500 bg-red-500/20' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOverVault(true); }}
        onDragLeave={() => setDragOverVault(false)}
        onDrop={() => { setDragOverVault(false); if (dragItem) handleDefenseDrop(dragItem); }}
      >
        <motion.div
          animate={vaultAnimation === 'success' ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } :
                   vaultAnimation === 'fail'    ? { x: [-8, 8, -8, 8, 0] } : {}}
          className="text-7xl"
        >
          {vaultAnimation === 'success' ? '🔒' : vaultAnimation === 'fail' ? '💥' : '🏦'}
        </motion.div>
        <div className={`text-sm font-bold mt-2 ${vaultAnimation === 'success' ? 'text-green-400' : vaultAnimation === 'fail' ? 'text-red-400' : 'text-gray-500'}`}>
          {vaultAnimation === 'success' ? '🔒 LOCKED!' : vaultAnimation === 'fail' ? 'WRONG DEFENSE!' : 'Drop defense here'}
        </div>
        {/* Vault health */}
        <div className="w-32 h-2 bg-white/10 rounded-full mt-2 overflow-hidden">
          <motion.div animate={{ width: `${vaultHealth}%` }} className={`h-full rounded-full ${vaultHealth > 60 ? 'bg-green-500' : vaultHealth > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} />
        </div>
      </div>

      {/* Defense cards */}
      <div className="grid grid-cols-2 gap-2">
        {round.defenses.map((defense, i) => (
          <motion.div
            key={defense.label}
            draggable
            onDragStart={() => setDragItem(defense.label)}
            onDragEnd={() => setDragItem(null)}
            whileTap={{ scale: 0.96 }}
            onClick={() => processAnswer(defense)}
            className="flex flex-col items-center gap-1 p-3 rounded-xl border border-white/20 bg-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 cursor-grab active:cursor-grabbing text-center select-none transition-all"
          >
            <span className="text-3xl">{defense.emoji}</span>
            <span className="text-xs font-bold text-white leading-tight">{defense.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-xl p-3 text-sm ${result.correct ? 'bg-green-500/10 border border-green-500 text-green-300' : 'bg-red-500/10 border border-red-500 text-red-300'}`}>
            {result.correct ? '✅ ' : '❌ '}{result.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LockTheVaultDrag() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Lock the Vault" category="Drag & Drop" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <LockTheVaultDragGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
