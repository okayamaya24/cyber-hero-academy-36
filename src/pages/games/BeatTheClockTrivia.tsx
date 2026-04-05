import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

interface TriviaQ { q: string; options: string[]; correct: number }

const QUESTIONS: Record<AgeTier, TriviaQ[]> = {
  junior: [
    { q: 'What keeps your password safe?', options: ['Sharing it with friends', 'Keeping it secret'], correct: 1 },
    { q: 'What is a computer virus?', options: ['A cold you catch', 'Bad software that hurts your computer'], correct: 1 },
    { q: 'What does a firewall do?', options: ['Blocks bad things from getting in', 'Makes fire'], correct: 0 },
    { q: 'Is it safe to share your address online?', options: ['No! Never!', 'Yes, with everyone'], correct: 0 },
    { q: 'A strong password should have...', options: ['Just your name', 'Numbers, letters AND symbols'], correct: 1 },
    { q: 'What is phishing?', options: ['Fishing for real fish', 'Tricking you to give up info'], correct: 1 },
    { q: 'Should you click unknown links?', options: ['No, ignore them', 'Yes, always!'], correct: 0 },
    { q: 'HTTPS means the website is...', options: ['Safer with encryption', 'Slower'], correct: 0 },
    { q: 'What is spam?', options: ['Unwanted junk messages', 'A yummy food'], correct: 0 },
    { q: 'Should you share passwords with friends?', options: ['No, ever!', 'Yes, best friends only'], correct: 0 },
    { q: 'What should you do if someone online is mean?', options: ['Tell a trusted adult', 'Be mean back'], correct: 0 },
    { q: 'How often should software be updated?', options: ['Regularly to fix bugs', 'Never'], correct: 0 },
    { q: 'What is malware?', options: ['Good software', 'Software designed to harm'], correct: 1 },
    { q: 'A padlock icon in your browser means...', options: ['The site has security', 'The site is broken'], correct: 0 },
    { q: 'What is two-factor authentication?', options: ['Two passwords', 'Password plus a code sent to you'], correct: 1 },
  ],
  hero: [
    { q: 'What does 2FA stand for?', options: ['Two-Factor Authentication', 'Two-File Attachment', 'Two-Form Approval', 'Twice-Fixed Access'], correct: 0 },
    { q: 'Which is the strongest password?', options: ['password123', 'MyDog2010', 'Tr@ck3R!9x', 'iloveyou'], correct: 2 },
    { q: 'Malware is short for...', options: ['Malicious Hardware', 'Malicious Software', 'Malevolent Ware', 'Massive Worm'], correct: 1 },
    { q: 'What is a VPN used for?', options: ['Faster internet', 'Encrypting your internet connection', 'Getting free WiFi', 'Downloading faster'], correct: 1 },
    { q: 'Phishing attacks typically use...', options: ['Fake emails or websites', 'Physical mail only', 'Phone calls only', 'Social media only'], correct: 0 },
    { q: 'What does HTTPS prevent?', options: ['Slow loading', 'Eavesdropping on your data', 'Spam emails', 'Viruses downloading'], correct: 1 },
    { q: 'A keylogger records...', options: ['Your location', 'Everything you type', 'Your screen', 'Your voice'], correct: 1 },
    { q: 'Ransomware demands...', options: ['Your password', 'Money to restore your files', 'Personal info', 'Account access'], correct: 1 },
    { q: 'Social engineering attacks target...', options: ['Computer code', 'Human psychology', 'Network hardware', 'Software bugs'], correct: 1 },
    { q: 'What is a botnet?', options: ['A robot internet', 'Network of infected computers', 'A security tool', 'A VPN type'], correct: 1 },
    { q: 'The principle of least privilege means...', options: ['Only give minimum needed access', 'Least experienced users get access', 'Privileges are deleted', 'Low security clearance'], correct: 0 },
    { q: 'What is a zero-day vulnerability?', options: ['A flaw with no fix yet', 'A bug fixed in zero days', 'A brand new software', 'A day with no attacks'], correct: 0 },
    { q: 'What does MFA stand for?', options: ['Major Firewall Attack', 'Multi-Factor Authentication', 'Multiple File Access', 'Master Form Authorization'], correct: 1 },
    { q: 'A brute force attack tries...', options: ['Physical damage to devices', 'All possible password combinations', 'Social manipulation', 'SQL injection'], correct: 1 },
    { q: 'What is encryption?', options: ['Deleting data securely', 'Converting data to unreadable format', 'Compressing files', 'Backing up data'], correct: 1 },
  ],
  elite: [
    { q: 'What does CSRF stand for?', options: ['Cross-Site Request Forgery', 'Cross-Server Response Filter', 'Cyber Security Response Framework', 'Client-Side Request Function'], correct: 0 },
    { q: 'SQL injection attacks target...', options: ['Database queries', 'Network packets', 'Encryption keys', 'User passwords'], correct: 0 },
    { q: 'TLS 1.3 vs TLS 1.2: key improvement?', options: ['Faster handshake, less roundtrips', 'Stronger algorithms only', 'Bigger key sizes', 'Certificate pinning'], correct: 0 },
    { q: 'What is SSRF?', options: ['Server-Side Request Forgery', 'Session Security Response Failure', 'Stored Script Response Filter', 'SSL Server Request Form'], correct: 0 },
    { q: 'Defense in depth means...', options: ['Multiple security layers', 'Very deep encryption', 'Defensive firewall rules', 'Deep packet inspection'], correct: 0 },
    { q: 'JWT tokens should NOT be stored in...', options: ['localStorage (XSS risk)', 'HttpOnly cookies', 'Memory', 'Secure cookies'], correct: 0 },
    { q: 'What is a timing attack?', options: ['Exploiting response time differences', 'DDoS at peak hours', 'Scheduling malware execution', 'Race condition in scheduling'], correct: 0 },
    { q: 'OWASP Top 10 #1 in 2021 was...', options: ['Broken Access Control', 'Injection', 'XSS', 'Cryptographic Failures'], correct: 0 },
    { q: 'Certificate Transparency helps detect...', options: ['Misissued SSL certificates', 'Expired certificates', 'Self-signed certificates', 'Revoked certificates'], correct: 0 },
    { q: 'What is threat modeling?', options: ['Identifying and prioritizing threats early', 'Building threat databases', 'Testing for threats', 'Monitoring live threats'], correct: 0 },
    { q: 'RBAC stands for...', options: ['Role-Based Access Control', 'Resource-Based Authentication Check', 'Remote Backup Access Cache', 'Rule-Based Application Control'], correct: 0 },
    { q: 'What is the purpose of HSTS?', options: ['Force HTTPS for a domain', 'Encrypt HTTP headers', 'Hide server type', 'Speed up TLS'], correct: 0 },
    { q: 'A supply chain attack targets...', options: ['Third-party software/vendors', 'Database servers', 'User endpoints only', 'Network routers'], correct: 0 },
    { q: 'Content Security Policy prevents...', options: ['XSS attacks', 'SQL injection', 'DDoS attacks', 'Brute force'], correct: 0 },
    { q: 'What is lateral movement in an attack?', options: ['Moving through network after initial breach', 'Moving data to external storage', 'Side-channel timing analysis', 'Horizontal SQL injection'], correct: 0 },
  ],
};

const CONFIG = { junior: { startTime: 45, bonus: 3, choices: 2 }, hero: { startTime: 30, bonus: 2, choices: 4 }, elite: { startTime: 25, bonus: 1, choices: 4 } };

function BeatTheClockTriviaGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const config = CONFIG[ageTier];
  const allQ = QUESTIONS[ageTier];
  const [shuffled] = useState(() => [...allQ].sort(() => Math.random() - 0.5));
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.startTime);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [bonusAnim, setBonusAnim] = useState(false);

  const scoreRef = useRef(0);
  const timeRef = useRef(config.startTime);
  const feedbackRef = useRef(false);

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      timeRef.current -= 0.1;
      if (timeRef.current <= 0) {
        clearInterval(t);
        setPhase('done');
        onComplete(scoreRef.current, 30);
      } else {
        setTimeLeft(Math.max(0, Math.round(timeRef.current * 10) / 10));
      }
    }, 100);
    return () => clearInterval(t);
  }, [phase, onComplete]);

  const currentQ = shuffled[qIdx % shuffled.length];
  const options = config.choices === 2
    ? [currentQ.options[currentQ.correct], currentQ.options.find((_, i) => i !== currentQ.correct)!].sort(() => Math.random() - 0.5).map((o, i) => ({ text: o, correct: o === currentQ.options[currentQ.correct] }))
    : currentQ.options.map((o, i) => ({ text: o, correct: i === currentQ.correct }));

  const handleAnswer = (correct: boolean) => {
    if (feedbackRef.current) return;
    feedbackRef.current = true;
    setFeedback(correct);
    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      timeRef.current = Math.min(timeRef.current + config.bonus, 60);
      setTimeLeft(Math.round(timeRef.current * 10) / 10);
      setBonusAnim(true);
      setTimeout(() => setBonusAnim(false), 800);
    }
    setTimeout(() => {
      feedbackRef.current = false;
      setFeedback(null);
      setQIdx(i => i + 1);
    }, 700);
  };

  const timerPct = (timeLeft / config.startTime) * 100;
  const timerColor = timerPct > 50 ? 'text-cyan-400' : timerPct > 25 ? 'text-yellow-400' : 'text-red-400 animate-pulse';
  const barColor = timerPct > 50 ? 'bg-cyan-500' : timerPct > 25 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] p-4 gap-4">
      {/* Timer */}
      <div className="text-center relative">
        <motion.div className={`text-6xl font-black ${timerColor}`} animate={{ scale: timeLeft < 10 ? [1, 1.05, 1] : 1 }} transition={{ repeat: Infinity, duration: 0.5 }}>
          {timeLeft.toFixed(1)}
        </motion.div>
        <div className="text-xs text-gray-500 mt-1">seconds remaining</div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden mt-2">
          <motion.div className={`h-full rounded-full ${barColor}`} animate={{ width: `${Math.min(100, (timeLeft / 60) * 100)}%` }} transition={{ duration: 0.1 }} />
        </div>
        <AnimatePresence>
          {bonusAnim && (
            <motion.div initial={{ opacity: 1, y: 0 }} animate={{ opacity: 0, y: -30 }}
              className="absolute top-0 right-0 text-green-400 font-black text-lg">
              +{config.bonus}s ⚡
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Answered: {score}</span>
        <span className="text-green-400 font-bold">{score} correct</span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          className="bg-[#0d1220] border border-cyan-500/20 rounded-2xl p-5 text-center">
          <div className="text-base font-bold text-white leading-relaxed">{currentQ.q}</div>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 flex-1">
        {options.map((opt, i) => (
          <motion.button key={`${qIdx}-${i}`} whileTap={{ scale: 0.97 }}
            onClick={() => handleAnswer(opt.correct)}
            disabled={feedback !== null}
            className={`w-full py-4 px-5 rounded-xl font-bold text-base border text-left transition-all
              ${feedback !== null && opt.correct ? 'bg-green-500/20 border-green-500 text-green-300' : ''}
              ${feedback !== null && !opt.correct ? 'bg-white/5 border-white/10 text-gray-500' : ''}
              ${feedback === null ? 'bg-white/5 border-white/20 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-white' : ''}
            `}>
            {opt.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function BeatTheClockTrivia() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Beat the Clock Trivia" category="Speed Round" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <BeatTheClockTriviaGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
