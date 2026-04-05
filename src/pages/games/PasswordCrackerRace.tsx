import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Record<AgeTier, Question[]> = {
  junior: [
    { question: 'A strong password should have...', options: ['Numbers & symbols', 'Just letters'], correct: 0, explanation: 'Numbers and symbols make passwords much harder to crack!' },
    { question: 'Which password is stronger?', options: ['C@t123!Fluffy', 'cat'], correct: 0, explanation: 'Long passwords with mixed characters are much stronger!' },
    { question: 'Should you use your name as a password?', options: ['No! Hackers guess names', 'Yes, easy to remember'], correct: 0, explanation: 'Never use personal info — hackers try names first!' },
    { question: 'How long should a password be?', options: ['At least 8 characters', '3-4 characters is fine'], correct: 0, explanation: 'Longer passwords take much longer to crack!' },
    { question: 'You should use the SAME password everywhere...', options: ['No! Use unique ones', 'Yes, easier to remember'], correct: 0, explanation: 'If one site gets hacked, unique passwords protect the rest!' },
    { question: '"password123" is...', options: ['Very weak — too common', 'Pretty strong'], correct: 0, explanation: '"password123" is one of the most commonly hacked passwords!' },
  ],
  hero: [
    { question: 'Which addition makes "sunshine" stronger?', options: ['$unsh1n3!', 'SUNSHINE', 'sunshine2', 'Sunshine'], correct: 0, explanation: 'Replacing letters with symbols and numbers adds huge strength!' },
    { question: 'What is a passphrase?', options: ['A long phrase as password', 'A phrase about passwords', 'A type of virus', 'A password manager'], correct: 0, explanation: 'Passphrases like "correct-horse-battery" are both strong AND memorable!' },
    { question: 'Why avoid dictionary words in passwords?', options: ['Hackers run dictionary attacks', 'They\'re too long', 'Computers can\'t read them', 'They expire faster'], correct: 0, explanation: 'Dictionary attacks try all common words automatically — avoid them!' },
    { question: 'A password manager does what?', options: ['Stores passwords securely', 'Creates passwords for you', 'Checks your strength', 'All of the above'], correct: 3, explanation: 'Password managers do all of these — they\'re a great security tool!' },
    { question: 'Two-factor auth (2FA) means...', options: ['Password + phone code', 'Two passwords', 'A very long password', 'Biometric only'], correct: 0, explanation: '2FA adds a second verification step — even if password is stolen, you\'re protected!' },
    { question: 'Which is NOT good password advice?', options: ['Write it on a sticky note', 'Use a password manager', 'Make it 12+ chars', 'Use symbols'], correct: 0, explanation: 'Never write passwords on paper where others can see them!' },
    { question: 'How often should you change passwords?', options: ['When there\'s a breach', 'Every day', 'Never if strong', 'Weekly'], correct: 0, explanation: 'Change passwords immediately when a breach is suspected — not on a forced schedule!' },
    { question: 'Salt in password hashing means...', options: ['Random data added before hashing', 'Making passwords spicy', 'A type of encryption', 'Password length rule'], correct: 0, explanation: 'Salting prevents identical passwords from having identical hashes!' },
  ],
  elite: [
    { question: 'Bcrypt is used for passwords because...', options: ['It\'s intentionally slow', 'It\'s the fastest algorithm', 'It\'s the newest standard', 'It uses less memory'], correct: 0, explanation: 'Bcrypt\'s slowness makes brute-force attacks computationally expensive!' },
    { question: 'Rainbow tables are defeated by...', options: ['Salting hashes', 'Longer passwords', 'More iterations', 'SHA-256'], correct: 0, explanation: 'Unique salts per password mean rainbow tables can\'t match precomputed hashes!' },
    { question: 'PBKDF2 applies what concept?', options: ['Key stretching', 'Key splitting', 'Key rotation', 'Key escrow'], correct: 0, explanation: 'PBKDF2 applies a PRF many times (key stretching) to make brute force harder!' },
    { question: 'Which entropy is strongest?', options: ['128-bit random', '64-bit random', 'Long dictionary phrase', '8 char alphanumeric'], correct: 0, explanation: '128-bit random entropy provides extremely strong cryptographic security!' },
    { question: 'Credential stuffing attacks use...', options: ['Leaked username/password pairs', 'Brute force only', 'Dictionary words', 'SQL injection'], correct: 0, explanation: 'Credential stuffing reuses leaked credentials from other breaches across services!' },
    { question: 'FIDO2/WebAuthn eliminates what risk?', options: ['Phishable passwords', 'Weak encryption', 'Session hijacking', 'SQL injection'], correct: 0, explanation: 'FIDO2 uses public key crypto — no shared secret means phishing can\'t steal credentials!' },
    { question: 'Zero-knowledge proof in auth means...', options: ['Prove knowledge without revealing it', 'No password required', 'Anonymous login', 'Hash without salt'], correct: 0, explanation: 'ZKP lets you prove you know a password without ever sending the password itself!' },
    { question: 'Argon2id won the Password Hashing Competition because...', options: ['Resists GPU and side-channel attacks', 'It\'s the fastest', 'Uses least memory', 'Simplest implementation'], correct: 0, explanation: 'Argon2id combines memory-hard and data-independent properties for maximum resistance!' },
    { question: 'Which is NOT in NIST\'s password guidelines?', options: ['Mandatory periodic rotation', 'Minimum 8 characters', 'Allow all printable chars', 'Check against breached lists'], correct: 0, explanation: 'NIST no longer recommends forced rotation — it leads to predictable patterns!' },
    { question: 'TOTP codes are secure because...', options: ['Time-based & short-lived', 'Stored server-side', 'Use same key every time', 'Based on username'], correct: 0, explanation: 'TOTP codes expire in 30s and are time+secret based — useless if intercepted later!' },
  ],
};

const CONFIG = {
  junior: { crackerFillMs: 8000, choices: 2 },
  hero:   { crackerFillMs: 6000, choices: 4 },
  elite:  { crackerFillMs: 4000, choices: 4 },
};

function PasswordCrackerRaceGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const allQuestions = QUESTIONS[ageTier];
  const [shuffled] = useState(() => [...allQuestions].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [crackerProgress, setCrackerProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');

  const crackerRef = useRef(0);
  const scoreRef = useRef(0);
  const answeredRef = useRef(false);
  const animFrameRef = useRef<number>();
  const startTimeRef = useRef(Date.now());

  const question = shuffled[current];
  const totalQ = shuffled.length;
  const options = config.choices === 2 ? [question.options[question.correct], question.options.find((_, i) => i !== question.correct)!]
    .sort(() => Math.random() - 0.5)
    .map((opt, i) => ({ opt, origIdx: question.options.indexOf(opt) }))
    : question.options.map((opt, i) => ({ opt, origIdx: i }));

  // Cracker animation
  useEffect(() => {
    if (phase !== 'playing' || answered) return;
    startTimeRef.current = Date.now();
    crackerRef.current = 0;
    setCrackerProgress(0);

    const tick = () => {
      if (answeredRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / config.crackerFillMs, 1);
      crackerRef.current = progress;
      setCrackerProgress(progress);
      if (progress >= 1) {
        // Time's up — wrong
        handleAnswer(-1);
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [current, phase]);

  const handleAnswer = (origIdx: number) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setAnswered(true);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const correct = origIdx === question.correct;
    if (correct) {
      const speedBonus = Math.round((1 - crackerRef.current) * 10);
      scoreRef.current += 10 + speedBonus;
      setScore(scoreRef.current);
    }
    setFeedback({ correct, explanation: question.explanation });

    setTimeout(() => {
      setFeedback(null);
      setAnswered(false);
      answeredRef.current = false;
      if (current + 1 >= totalQ) {
        setPhase('done');
      } else {
        setCurrent(c => c + 1);
      }
    }, 2000);
  };

  useEffect(() => {
    if (phase === 'done') onComplete(scoreRef.current, totalQ * 20);
  }, [phase, onComplete, totalQ]);

  const crackerColor = crackerProgress < 0.5 ? 'bg-yellow-500' : crackerProgress < 0.75 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] p-4 gap-4">
      {/* Progress */}
      <div className="flex justify-between text-sm text-gray-400">
        <span>Question {current + 1} of {totalQ}</span>
        <span className="text-green-400 font-bold">{score} pts</span>
      </div>

      {/* Cracker bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>🔓 Cracker progress</span>
          <span className="text-red-400">Defend!</span>
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-red-500/30">
          <motion.div
            className={`h-full rounded-full ${crackerColor} transition-colors`}
            style={{ width: `${crackerProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Password display */}
      <div className="bg-black/40 border border-cyan-500/30 rounded-2xl p-4 text-center">
        <div className="text-4xl mb-2">🔐</div>
        <div className="text-lg font-bold text-white leading-relaxed">{question.question}</div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 flex-1">
        {options.map(({ opt, origIdx }, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.97 }}
            disabled={answered}
            onClick={() => handleAnswer(origIdx)}
            className={`w-full py-4 px-6 rounded-xl text-left font-bold text-base transition-all border
              ${answered && origIdx === question.correct ? 'bg-green-500/20 border-green-500 text-green-300' : ''}
              ${answered && origIdx !== question.correct ? 'bg-white/5 border-white/10 text-gray-500' : ''}
              ${!answered ? 'bg-white/5 border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-white' : ''}
            `}
          >
            {opt}
          </motion.button>
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl p-4 border text-sm font-medium ${feedback.correct ? 'bg-green-500/10 border-green-500 text-green-300' : 'bg-red-500/10 border-red-500 text-red-300'}`}
          >
            {feedback.correct ? '✅ Correct! ' : '❌ Not quite. '}{feedback.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PasswordCrackerRace() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Password Cracker Race" category="Keyboard" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <PasswordCrackerRaceGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
