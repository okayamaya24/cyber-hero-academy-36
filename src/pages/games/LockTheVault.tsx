import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

type LockPhase = 'idle' | 'open' | 'wrong';

// ── Challenge 1: Pick Strongest Password ─────────────────────────────
function Challenge1({ ageTier, onPass }: { ageTier: AgeTier; onPass: () => void }) {
  const options = {
    junior: [{ text: 'fluffy', strong: false }, { text: 'P@ss123!', strong: true }, { text: '1234', strong: false }],
    hero:   [{ text: 'Ilovecats2024', strong: false }, { text: 'K9$mPx!7vR', strong: true }, { text: 'password!', strong: false }, { text: 'MyDog_2024', strong: false }],
    elite:  [{ text: 'Tr0ub4dor&3', strong: false }, { text: 'correct-horse-battery-staple', strong: false }, { text: 'Z#9kLm$2vBqX!pR', strong: true }, { text: 'P@ssw0rd!123', strong: false }],
  }[ageTier];
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<LockPhase>('idle');

  const hint = ageTier === 'elite' ? 'Hint: Max entropy wins' : ageTier === 'hero' ? 'Pick the hardest to crack' : 'Which is the strongest?';

  const handlePick = (i: number) => {
    setSelected(i);
    if (options[i].strong) { setResult('open'); setTimeout(onPass, 700); }
    else { setResult('wrong'); setTimeout(() => { setSelected(null); setResult('idle'); }, 700); }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-cyan-400 text-center">{hint}</p>
      {options.map((o, i) => (
        <button key={i} onClick={() => handlePick(i)} disabled={result === 'open'}
          className={`w-full px-4 py-3 rounded-xl font-mono text-sm font-bold border transition-all
            ${selected === i && result === 'open' ? 'border-green-500 bg-green-500/20 text-green-300' : ''}
            ${selected === i && result === 'wrong' ? 'border-red-500 bg-red-500/20 text-red-300' : ''}
            ${selected !== i || result === 'idle' ? 'border-white/20 bg-white/5 hover:border-cyan-500/50 text-white' : ''}
          `}>
          {o.text}
        </button>
      ))}
    </div>
  );
}

// ── Challenge 2: Spot Safe Website ────────────────────────────────────
function Challenge2({ ageTier, onPass }: { ageTier: AgeTier; onPass: () => void }) {
  const sites = {
    junior: [
      { url: 'https://www.google.com', safe: true },
      { url: 'http://g00gle-prizes.xyz', safe: false },
      { url: 'https://free-iPad-now.net', safe: false },
    ],
    hero: [
      { url: 'https://www.amazon.com/deals', safe: true },
      { url: 'https://amaz0n-order.com', safe: false },
      { url: 'http://amazon-security.ru', safe: false },
      { url: 'https://amazon.fake-verify.com', safe: false },
    ],
    elite: [
      { url: 'https://secure.paypal.com/signin', safe: true },
      { url: 'https://paypal.com.security-check.net', safe: false },
      { url: 'https://paypa1.com/login', safe: false },
      { url: 'https://www.paypal-helpdesk.support', safe: false },
    ],
  }[ageTier];

  const label = ageTier === 'junior' ? 'Tap the SAFE website!' : 'Which URL is legitimate?';
  const [result, setResult] = useState<LockPhase>('idle');

  const handlePick = (safe: boolean) => {
    if (safe) { setResult('open'); setTimeout(onPass, 700); }
    else { setResult('wrong'); setTimeout(() => setResult('idle'), 700); }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-cyan-400 text-center">{label}</p>
      {sites.map((s, i) => (
        <button key={i} onClick={() => handlePick(s.safe)} disabled={result === 'open'}
          className={`w-full px-3 py-3 rounded-xl font-mono text-xs text-left border transition-all
            ${result === 'wrong' && 'opacity-80'}
            ${s.safe && result === 'open' ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-white/20 bg-white/5 hover:border-cyan-500/50 text-white'}`}>
          🌐 {s.url}
        </button>
      ))}
    </div>
  );
}

// ── Challenge 3: Classify Threats ────────────────────────────────────
function Challenge3({ ageTier, onPass }: { ageTier: AgeTier; onPass: () => void }) {
  const items = {
    junior: [
      { label: '📧 Email: "You won a prize!"', threat: true },
      { label: '🛡️ Antivirus scan complete', threat: false },
      { label: '🔗 Unknown link in message', threat: true },
      { label: '🔒 Browser shows 🔒 padlock', threat: false },
    ],
    hero: [
      { label: '📱 App asks for microphone always', threat: true },
      { label: '🔑 2FA text message received', threat: false },
      { label: '💾 Pirated software download', threat: true },
      { label: '🔄 Official OS security update', threat: false },
      { label: '📧 "Verify account" from bank.xyz', threat: true },
    ],
    elite: [
      { label: '🌐 Certificate expired warning', threat: true },
      { label: '📡 VPN connection established', threat: false },
      { label: '🔍 Abnormal login from new location', threat: true },
      { label: '📦 NPM package with 3 downloads', threat: true },
      { label: '🔒 TLS 1.3 enabled', threat: false },
      { label: '⚙️ Macro execution in Word doc', threat: true },
    ],
  }[ageTier];

  const [classified, setClassified] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  const toggle = (i: number, isThreat: boolean) => {
    if (submitted) return;
    setClassified(prev => ({ ...prev, [i]: isThreat }));
  };

  const handleSubmit = () => {
    const correct = items.every((item, i) => classified[i] === item.threat);
    setSubmitted(true);
    if (correct) { setAllCorrect(true); setTimeout(onPass, 800); }
    else setTimeout(() => { setClassified({}); setSubmitted(false); }, 1200);
  };

  const allAnswered = Object.keys(classified).length === items.length;

  return (
    <div className="space-y-2">
      <p className="text-xs text-cyan-400 text-center">Classify each as THREAT or SAFE</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex-1 text-xs text-gray-300 bg-white/5 rounded-lg px-2 py-2">{item.label}</div>
          <div className="flex gap-1">
            <button onClick={() => toggle(i, true)}
              className={`px-2 py-1 rounded text-xs font-bold border transition-all
                ${classified[i] === true ? (submitted ? (item.threat ? 'bg-green-500/30 border-green-500 text-green-300' : 'bg-red-500/30 border-red-500 text-red-300') : 'bg-red-500/20 border-red-500 text-red-300') : 'border-white/20 text-gray-500 hover:text-red-400'}`}>
              ⚠️
            </button>
            <button onClick={() => toggle(i, false)}
              className={`px-2 py-1 rounded text-xs font-bold border transition-all
                ${classified[i] === false ? (submitted ? (!item.threat ? 'bg-green-500/30 border-green-500 text-green-300' : 'bg-red-500/30 border-red-500 text-red-300') : 'bg-green-500/20 border-green-500 text-green-300') : 'border-white/20 text-gray-500 hover:text-green-400'}`}>
              ✅
            </button>
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} disabled={!allAnswered || submitted}
        className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm disabled:opacity-40 mt-2">
        Lock It Down 🔒
      </button>
    </div>
  );
}

// ── Challenge 4: 2FA Code ─────────────────────────────────────────────
function Challenge4({ ageTier, onPass }: { ageTier: AgeTier; onPass: () => void }) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const [visible, setVisible] = useState(true);
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<LockPhase>('idle');

  const hideDelay = ageTier === 'junior' ? 0 : ageTier === 'hero' ? 5000 : 3000;

  useEffect(() => {
    if (hideDelay === 0) return;
    const t = setTimeout(() => setVisible(false), hideDelay);
    return () => clearTimeout(t);
  }, [hideDelay]);

  const handleSubmit = () => {
    if (typed === code) { setResult('open'); setTimeout(onPass, 700); }
    else { setResult('wrong'); setTimeout(() => { setTyped(''); setResult('idle'); }, 700); }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-cyan-400">Enter the 2FA code to verify!</p>
      <div className="bg-black/50 border border-purple-500/40 rounded-2xl p-6">
        <div className="text-xs text-purple-400 mb-2">📱 Authenticator App</div>
        {visible ? (
          <div className="text-4xl font-black text-white font-mono tracking-[0.3em]">{code}</div>
        ) : (
          <div className="text-2xl text-gray-600">• • • • • •</div>
        )}
        {!visible && ageTier !== 'junior' && <div className="text-xs text-gray-600 mt-2">Code hidden — remember it!</div>}
      </div>
      <div className="flex gap-2">
        <input value={typed} onChange={e => setTyped(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={`flex-1 bg-black/40 border rounded-xl px-4 py-3 text-center text-xl font-black font-mono tracking-widest outline-none
            ${result === 'open' ? 'border-green-500 text-green-300' : result === 'wrong' ? 'border-red-500 text-red-300' : 'border-white/20 text-white'}`}
          placeholder="______" />
        <button onClick={handleSubmit} disabled={typed.length < 6}
          className="px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black disabled:opacity-40">
          ✓
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
function LockTheVaultGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const challenges = [
    { title: '🔑 Lock 1: Password Check', icon: '🔑' },
    { title: '🌐 Lock 2: Safe Site Scan', icon: '🌐' },
    { title: '🛡️ Lock 3: Threat Identifier', icon: '🛡️' },
    { title: '📱 Lock 4: 2FA Challenge', icon: '📱' },
  ];
  const [current, setCurrent] = useState(0);
  const [unlocked, setUnlocked] = useState<number[]>([]);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [startTime] = useState(Date.now());

  const handlePass = () => {
    const next = [...unlocked, current];
    setUnlocked(next);
    if (next.length >= challenges.length) {
      const elapsed = (Date.now() - startTime) / 1000;
      const speedBonus = Math.round(Math.max(0, 120 - elapsed));
      setPhase('done');
      setTimeout(() => onComplete(200 + speedBonus, 320), 1000);
    } else {
      setTimeout(() => setCurrent(c => c + 1), 800);
    }
  };

  const challengeComponents = [
    <Challenge1 ageTier={ageTier} onPass={handlePass} />,
    <Challenge2 ageTier={ageTier} onPass={handlePass} />,
    <Challenge3 ageTier={ageTier} onPass={handlePass} />,
    <Challenge4 ageTier={ageTier} onPass={handlePass} />,
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a]">
      {/* Vault progress */}
      <div className="px-6 py-3 bg-[#0d1220] border-b border-cyan-500/20 flex items-center justify-between">
        <div className="text-sm text-gray-400">🏦 Vault Locks</div>
        <div className="flex gap-2">
          {challenges.map((c, i) => (
            <motion.div key={i}
              animate={{ scale: unlocked.includes(i) ? [1.3, 1] : 1 }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm border-2 transition-all
                ${unlocked.includes(i) ? 'border-green-500 bg-green-500/20' : i === current ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 opacity-40'}`}>
              {unlocked.includes(i) ? '✓' : c.icon}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {phase === 'done' ? (
            <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-4 py-12 text-center">
              <motion.div animate={{ rotate: [0, -15, 15, -15, 0] }} transition={{ repeat: 2, duration: 0.5 }} className="text-8xl">🏦</motion.div>
              <h2 className="text-2xl font-black text-white">VAULT SECURED!</h2>
              <p className="text-green-400">All 4 locks engaged! The Digital World is safe!</p>
            </motion.div>
          ) : (
            <motion.div key={`challenge-${current}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="bg-[#0d1220] border border-cyan-500/20 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-cyan-500/10 border-b border-cyan-500/20 font-bold text-white">{challenges[current].title}</div>
                <div className="p-4">{challengeComponents[current]}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function LockTheVault() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Lock the Vault" category="Puzzle" xpReward={200} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <LockTheVaultGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
