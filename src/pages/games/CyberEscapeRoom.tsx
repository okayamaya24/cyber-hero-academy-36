import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

type PuzzleResult = 'idle' | 'correct' | 'wrong';

// ── Puzzle 1: Password Lock ──────────────────────────────────────────────
function PuzzleLock({ ageTier, onSolve }: { ageTier: AgeTier; onSolve: () => void }) {
  const answers = { junior: '1357', hero: '2846', elite: '384619' };
  const clues = {
    junior: ['4 digits', 'Contains 1 and 3', 'The digits are in order'],
    hero:   ['4 digits', 'Digits sum to 20', 'No digit repeats', 'Contains 8'],
    elite:  ['6 digits', 'First 3 digits are prime', 'Last 3 digits are 619', 'Digits include 3, 8, and 4'],
  };
  const answer = answers[ageTier];
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PuzzleResult>('idle');

  const handleDigit = (d: string) => {
    if (input.length >= answer.length) return;
    setInput(prev => prev + d);
    setResult('idle');
  };
  const handleSubmit = () => {
    if (input === answer) { setResult('correct'); setTimeout(onSolve, 800); }
    else { setResult('wrong'); setTimeout(() => { setInput(''); setResult('idle'); }, 800); }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-4xl">🔐</div>
      <h3 className="text-lg font-bold text-white text-center">Unlock the Password Lock!</h3>
      <div className="space-y-1 text-sm text-cyan-300 text-center">
        {clues[ageTier].map((c, i) => <div key={i}>• {c}</div>)}
      </div>
      <div className="flex gap-2">
        {Array.from({ length: answer.length }).map((_, i) => (
          <div key={i} className={`w-10 h-12 flex items-center justify-center rounded-lg border text-xl font-black
            ${result === 'correct' ? 'border-green-500 bg-green-500/20 text-green-300' : result === 'wrong' ? 'border-red-500 bg-red-500/20 text-red-300' : 'border-white/20 bg-black/40 text-white'}`}>
            {input[i] || ''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {['1','2','3','4','5','6','7','8','9','0'].map(d => (
          <button key={d} onClick={() => handleDigit(d)}
            className="w-12 h-12 rounded-xl bg-white/10 hover:bg-cyan-500/20 border border-white/20 text-white font-bold text-lg active:scale-95 transition-all">
            {d}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setInput(prev => prev.slice(0, -1))} className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 font-bold">⌫</button>
        <button onClick={handleSubmit} disabled={input.length < answer.length}
          className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-40">
          Unlock 🔓
        </button>
      </div>
    </div>
  );
}

// ── Puzzle 2: Spot the Phish ─────────────────────────────────────────────
function PuzzlePhish({ ageTier, onSolve }: { ageTier: AgeTier; onSolve: () => void }) {
  const emails = {
    junior: {
      flags: [
        { id: 'prize', label: '🎉 YOU WON $1000!!! Click NOW!!!', isBad: true },
        { id: 'sender', label: 'From: prizes@free-money.xyz', isBad: true },
        { id: 'link', label: 'Click: http://claim-prize-now.net', isBad: true },
        { id: 'urgency', label: 'HURRY! Expires in 1 hour!', isBad: true },
        { id: 'school', label: 'From: principal@yourschool.edu', isBad: false },
      ],
      correct: new Set(['prize', 'sender', 'link']),
      instructions: 'Tap the 3 RED FLAGS in this phishing email!',
    },
    hero: {
      flags: [
        { id: 'domain', label: 'From: security@paypa1.com', isBad: true },
        { id: 'urgency', label: 'Your account will be closed in 24h!', isBad: true },
        { id: 'link', label: 'Login at: http://paypa1-secure.net/login', isBad: true },
        { id: 'grammar', label: 'Please to verify your informations.', isBad: true },
        { id: 'legit', label: 'Dear valued customer,', isBad: false },
        { id: 'legit2', label: 'Sincerely, PayPal Support Team', isBad: false },
      ],
      correct: new Set(['domain', 'urgency', 'link']),
      instructions: 'Spot the 3 phishing red flags!',
    },
    elite: {
      flags: [
        { id: 'subdomain', label: 'From: support@helpdesk.microsoft.com.phish.ru', isBad: true },
        { id: 'link', label: 'Reset password: https://microsft-login.com/reset', isBad: true },
        { id: 'urgency', label: 'Unusual sign-in activity detected.', isBad: false },
        { id: 'brand', label: 'Microsoft Logo and Professional Design', isBad: false },
        { id: 'ssl', label: 'Site has SSL certificate (padlock)', isBad: false },
        { id: 'typo', label: '"microsft" in URL (typosquatting)', isBad: true },
      ],
      correct: new Set(['subdomain', 'link', 'typo']),
      instructions: 'Identify the 3 sophisticated red flags!',
    },
  };

  const data = emails[ageTier];
  const [selected, setSelected] = useState(new Set<string>());
  const [result, setResult] = useState<PuzzleResult>('idle');

  const toggle = (id: string) => {
    if (result !== 'idle') return;
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleSubmit = () => {
    const correct = [...data.correct].every(id => selected.has(id)) && selected.size === data.correct.size;
    if (correct) { setResult('correct'); setTimeout(onSolve, 800); }
    else { setResult('wrong'); setTimeout(() => { setSelected(new Set()); setResult('idle'); }, 1000); }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="text-4xl text-center">📧</div>
      <h3 className="text-base font-bold text-white text-center">{data.instructions}</h3>
      <div className="bg-gray-900/60 border border-white/10 rounded-xl p-3 space-y-2">
        {data.flags.map(flag => (
          <button key={flag.id} onClick={() => toggle(flag.id)}
            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all font-mono
              ${selected.has(flag.id) ? 'border-red-500 bg-red-500/20 text-red-200' : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'}`}>
            {flag.label}
          </button>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={selected.size === 0}
        className={`py-3 rounded-xl font-bold transition-all ${result === 'wrong' ? 'bg-red-500 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-black'} disabled:opacity-40`}>
        {result === 'wrong' ? '❌ Try again' : 'Submit 🔍'}
      </button>
    </div>
  );
}

// ── Puzzle 3: Firewall Pattern ───────────────────────────────────────────
function PuzzlePattern({ ageTier, onSolve }: { ageTier: AgeTier; onSolve: () => void }) {
  const patterns = {
    junior: { sequence: ['ALLOW', 'BLOCK', 'ALLOW', 'BLOCK', '?'], answer: 'ALLOW', choices: ['ALLOW', 'BLOCK'] },
    hero:   { sequence: ['BLOCK', 'ALLOW', 'ALLOW', 'BLOCK', 'ALLOW', '?'], answer: 'ALLOW', choices: ['ALLOW', 'BLOCK'] },
    elite:  { sequence: ['ALLOW', 'ALLOW', 'BLOCK', 'ALLOW', 'ALLOW', 'BLOCK', '?'], answer: 'ALLOW', choices: ['ALLOW', 'BLOCK', 'DROP', 'REJECT'] },
  };
  const { sequence, answer, choices } = patterns[ageTier];
  const [result, setResult] = useState<PuzzleResult>('idle');

  const handleChoice = (c: string) => {
    if (c === answer) { setResult('correct'); setTimeout(onSolve, 800); }
    else { setResult('wrong'); setTimeout(() => setResult('idle'), 800); }
  };

  return (
    <div className="flex flex-col gap-4 p-4 items-center">
      <div className="text-4xl">🔥</div>
      <h3 className="text-base font-bold text-white text-center">Complete the firewall rule pattern!</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {sequence.map((item, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg font-bold text-sm border
            ${item === '?' ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300 text-xl' : item === 'ALLOW' ? 'border-green-500/50 bg-green-500/10 text-green-300' : 'border-red-500/50 bg-red-500/10 text-red-300'}`}>
            {item}
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        {choices.map(c => (
          <button key={c} onClick={() => handleChoice(c)}
            className={`px-6 py-3 rounded-xl font-bold border transition-all
              ${result === 'wrong' ? 'opacity-50' : ''}
              ${c === 'ALLOW' ? 'border-green-500 bg-green-500/10 hover:bg-green-500/20 text-green-300' : 'border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-300'}`}>
            {c}
          </button>
        ))}
      </div>
      {result !== 'idle' && <div className={`text-lg font-bold ${result === 'correct' ? 'text-green-400' : 'text-red-400'}`}>{result === 'correct' ? '✅ Correct!' : '❌ Try again!'}</div>}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────
function CyberEscapeRoomGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const puzzles = ageTier === 'junior' ? 3 : ageTier === 'hero' ? 3 : 3;
  const [solved, setSolved] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [startTime] = useState(Date.now());

  const handleSolve = () => {
    const next = solved + 1;
    setSolved(next);
    if (next >= puzzles) {
      setShowCelebration(true);
      const elapsed = (Date.now() - startTime) / 1000;
      const speedBonus = Math.max(0, 60 - elapsed) * 2;
      setTimeout(() => onComplete(Math.round(puzzles * 100 + speedBonus), puzzles * 100 + 120), 1500);
    }
  };

  const puzzleComponents = [
    <PuzzleLock ageTier={ageTier} onSolve={handleSolve} />,
    <PuzzlePhish ageTier={ageTier} onSolve={handleSolve} />,
    <PuzzlePattern ageTier={ageTier} onSolve={handleSolve} />,
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a]">
      {/* Progress */}
      <div className="px-6 py-3 bg-[#0d1220] border-b border-cyan-500/20 flex items-center justify-between">
        <div className="text-sm text-gray-400">🚪 Escape Room</div>
        <div className="flex gap-2">
          {Array.from({ length: puzzles }).map((_, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
              ${i < solved ? 'border-green-500 bg-green-500/20 text-green-400' : i === solved ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/10 text-gray-600'}`}>
              {i < solved ? '✓' : i + 1}
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500">{solved}/{puzzles} solved</div>
      </div>

      {/* Puzzle area */}
      <div className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {showCelebration ? (
            <motion.div key="celebration" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ repeat: 2, duration: 0.5 }} className="text-7xl">🎉</motion.div>
              <h2 className="text-2xl font-black text-white">YOU ESCAPED!</h2>
              <p className="text-cyan-400">All locks defeated! You're a true Cyber Hero!</p>
            </motion.div>
          ) : solved < puzzles ? (
            <motion.div key={`puzzle-${solved}`} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
              className="p-2">
              <div className="bg-[#0d1220] border border-cyan-500/20 rounded-2xl overflow-hidden">
                <div className="px-4 py-2 bg-cyan-500/10 border-b border-cyan-500/20 text-xs text-cyan-400">
                  PUZZLE {solved + 1} OF {puzzles}
                </div>
                {puzzleComponents[solved]}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CyberEscapeRoom() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Cyber Escape Room" category="Puzzle" xpReward={200} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <CyberEscapeRoomGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
