import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

interface Item { label: string; emoji: string; safe: boolean; explanation: string }

const ITEMS: Record<AgeTier, Item[]> = {
  junior: [
    { label: 'Antivirus software', emoji: '🛡️', safe: true, explanation: 'Antivirus protects your device!' },
    { label: 'Clicking unknown links', emoji: '🔗', safe: false, explanation: 'Unknown links can lead to malware!' },
    { label: 'Strong password', emoji: '🔐', safe: true, explanation: 'Strong passwords keep accounts secure!' },
    { label: 'Sharing your address online', emoji: '🏠', safe: false, explanation: 'Never share personal info with strangers!' },
    { label: 'Software updates', emoji: '⬆️', safe: true, explanation: 'Updates fix security holes!' },
    { label: 'Talking to online strangers', emoji: '👤', safe: false, explanation: 'Online strangers may not be who they seem!' },
    { label: 'Asking a parent for help', emoji: '👨‍👩‍👧', safe: true, explanation: 'Always good to ask a trusted adult!' },
    { label: 'A locked screen', emoji: '📱', safe: true, explanation: 'Locking your screen protects your data!' },
    { label: 'Opening random email attachments', emoji: '📎', safe: false, explanation: 'Attachments can contain viruses!' },
    { label: 'Using a trusted website', emoji: '🌐', safe: true, explanation: 'Trusted sites with HTTPS are safer!' },
  ],
  hero: [
    { label: 'Email from unknown@prize.xyz', emoji: '📧', safe: false, explanation: 'Unknown senders with "prizes" are usually scams!' },
    { label: 'HTTPS website', emoji: '🔒', safe: true, explanation: 'HTTPS encrypts your connection!' },
    { label: 'HTTP site with payment form', emoji: '💳', safe: false, explanation: 'Never enter payment info on HTTP sites!' },
    { label: 'App from official app store', emoji: '📲', safe: true, explanation: 'Official app stores vet their apps!' },
    { label: 'Pop-up: You won $1000!', emoji: '🎉', safe: false, explanation: 'These are always scams — no legitimate prize!' },
    { label: 'Two-factor authentication', emoji: '📱', safe: true, explanation: '2FA adds a vital security layer!' },
    { label: 'Reusing the same password', emoji: '♻️', safe: false, explanation: 'If one site is hacked, all your accounts get hacked!' },
    { label: 'Password manager', emoji: '🗄️', safe: true, explanation: 'Password managers securely store unique passwords!' },
    { label: 'Open public WiFi', emoji: '📡', safe: false, explanation: 'Public WiFi can expose your data to attackers!' },
    { label: 'VPN connection', emoji: '🔐', safe: true, explanation: 'VPNs encrypt your internet traffic!' },
    { label: 'Software from random website', emoji: '💾', safe: false, explanation: 'Only download software from trusted sources!' },
    { label: 'Regular data backups', emoji: '💽', safe: true, explanation: 'Backups protect against ransomware and data loss!' },
  ],
  elite: [
    { label: 'Email from paypa1.com', emoji: '📧', safe: false, explanation: 'Typosquatting: "1" not "l" — it\'s a phishing domain!' },
    { label: 'Certificate pinning in app', emoji: '📜', safe: true, explanation: 'Certificate pinning prevents MITM attacks!' },
    { label: 'Outdated TLS 1.0 connection', emoji: '🌐', safe: false, explanation: 'TLS 1.0 has critical vulnerabilities — use 1.3!' },
    { label: 'Zero-day patch deployed', emoji: '🔧', safe: true, explanation: 'Patching zero-days reduces attack surface!' },
    { label: 'OAuth without PKCE', emoji: '🔑', safe: false, explanation: 'OAuth without PKCE is vulnerable to code injection!' },
    { label: 'npm package with 2 downloads', emoji: '📦', safe: false, explanation: 'Unknown packages could be typosquatting attacks!' },
    { label: 'Security audit log enabled', emoji: '📋', safe: true, explanation: 'Audit logs enable incident detection and response!' },
    { label: 'eval() on user input', emoji: '⚡', safe: false, explanation: 'eval() on user input enables code injection attacks!' },
    { label: 'Content Security Policy header', emoji: '🛡️', safe: true, explanation: 'CSP headers prevent XSS attacks!' },
    { label: 'JWT stored in localStorage', emoji: '🗝️', safe: false, explanation: 'JWTs in localStorage are vulnerable to XSS theft!' },
    { label: 'Principle of least privilege', emoji: '🔏', safe: true, explanation: 'Least privilege minimizes damage from breaches!' },
    { label: 'MD5 password hashing', emoji: '🔢', safe: false, explanation: 'MD5 is cryptographically broken — use bcrypt/argon2!' },
    { label: 'HSTS header enabled', emoji: '✅', safe: true, explanation: 'HSTS forces HTTPS and prevents downgrade attacks!' },
    { label: 'Debug mode in production', emoji: '🐛', safe: false, explanation: 'Debug mode exposes stack traces and internal data!' },
  ],
};

function SafeOrDangerSortGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const [items] = useState(() => [...ITEMS[ageTier]].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<{ safe: boolean; correct: boolean; explanation: string } | null>(null);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);

  const item = items[current];

  const handleChoice = (isSafe: boolean) => {
    if (feedback) return;
    const isCorrect = isSafe === item.safe;
    if (isCorrect) {
      setScore(s => s + 10);
      setCorrect(c => c + 1);
    }
    setExitDir(isSafe ? 'right' : 'left');
    setFeedback({ safe: isSafe, correct: isCorrect, explanation: item.explanation });
    setTimeout(() => {
      setFeedback(null);
      setExitDir(null);
      if (current + 1 >= items.length) {
        onComplete(score + (isCorrect ? 10 : 0), items.length * 10);
      } else {
        setCurrent(c => c + 1);
      }
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] select-none">
      {/* HUD */}
      <div className="flex justify-between px-6 py-3 border-b border-cyan-500/20 bg-[#0d1220]">
        <span className="text-sm text-gray-400">{current + 1}/{items.length}</span>
        <span className="text-sm font-bold text-green-400">{score} pts</span>
      </div>

      {/* Zones */}
      <div className="flex flex-1">
        <div className="flex-1 flex items-center justify-center border-r border-white/5 bg-red-900/10">
          <div className="text-center opacity-60">
            <div className="text-4xl">🚨</div>
            <div className="text-xs text-red-400 font-bold mt-1">DANGER</div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-green-900/10">
          <div className="text-center opacity-60">
            <div className="text-4xl">✅</div>
            <div className="text-xs text-green-400 font-bold mt-1">SAFE</div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.8, x: 0 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, x: exitDir === 'right' ? 200 : -200, rotate: exitDir === 'right' ? 15 : -15 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="w-64 bg-[#0d1220] border-2 border-white/20 rounded-2xl p-6 text-center shadow-2xl pointer-events-auto"
          >
            <div className="text-6xl mb-3">{item.emoji}</div>
            <div className="text-base font-bold text-white">{item.label}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-between px-8">
        <button onClick={() => handleChoice(false)} disabled={!!feedback}
          className="w-28 h-14 rounded-2xl bg-red-500 hover:bg-red-400 active:scale-95 transition-all font-black text-white text-sm shadow-lg shadow-red-500/30 disabled:opacity-50">
          🚨 DANGER
        </button>
        <button onClick={() => handleChoice(true)} disabled={!!feedback}
          className="w-28 h-14 rounded-2xl bg-green-500 hover:bg-green-400 active:scale-95 transition-all font-black text-white text-sm shadow-lg shadow-green-500/30 disabled:opacity-50">
          ✅ SAFE
        </button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`absolute bottom-4 left-4 right-4 rounded-xl p-3 text-sm text-center font-medium
              ${feedback.correct ? 'bg-green-500/20 border border-green-500 text-green-300' : 'bg-red-500/20 border border-red-500 text-red-300'}`}
          >
            {feedback.correct ? '✅ Correct! ' : '❌ Actually — '}{feedback.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SafeOrDangerSort() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Safe or Danger Sort" category="Sort & Decide" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <SafeOrDangerSortGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
