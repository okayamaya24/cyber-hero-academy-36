import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';

interface Fact { statement: string; isTrue: boolean; explanation: string; }

const FACTS: Record<AgeTier, Fact[]> = {
  junior: [
    { statement: 'You should share your password with your best friend.', isTrue: false, explanation: 'Never share your password — not even with friends!' },
    { statement: 'A strong password uses letters AND numbers.', isTrue: true, explanation: 'Yes! Mix letters, numbers and symbols for a strong password.' },
    { statement: 'It is safe to talk to strangers online.', isTrue: false, explanation: 'Online strangers might not be who they say they are!' },
    { statement: 'You should tell a trusted adult if something online makes you uncomfortable.', isTrue: true, explanation: 'Always! Trusted adults can help keep you safe.' },
    { statement: 'Your home address is safe to share in online games.', isTrue: false, explanation: 'Never share your address — keep personal info private!' },
    { statement: 'Logging out of a shared computer keeps your account safe.', isTrue: true, explanation: 'Always log out on shared devices!' },
    { statement: 'Pop-ups that say you won a prize are always real.', isTrue: false, explanation: 'Pop-up prizes are almost always scams!' },
    { statement: 'Using the same password for every account is a bad idea.', isTrue: true, explanation: 'If one gets hacked, all your accounts become vulnerable!' },
    { statement: 'It is okay to click every link someone sends you.', isTrue: false, explanation: 'Always check if a link is safe before clicking!' },
    { statement: 'Private info includes your phone number and home address.', isTrue: true, explanation: 'Keep all personal info private and safe!' },
  ],
  hero: [
    { statement: 'Phishing emails often create a sense of urgency to make you act fast.', isTrue: true, explanation: 'Scammers use urgency to stop you from thinking carefully.' },
    { statement: 'HTTPS websites are always 100% safe.', isTrue: false, explanation: 'HTTPS means the connection is encrypted — not that the site is trustworthy!' },
    { statement: 'Two-factor authentication makes accounts much more secure.', isTrue: true, explanation: '2FA adds a second layer — even if your password is stolen, accounts stay safe.' },
    { statement: 'You can tell a fake website by its URL alone.', isTrue: false, explanation: 'Fake sites can look identical — check the domain carefully for subtle changes.' },
    { statement: 'Public Wi-Fi is safe for online banking.', isTrue: false, explanation: 'Public Wi-Fi can be monitored. Never do banking on public networks!' },
    { statement: 'A strong password should be at least 12 characters long.', isTrue: true, explanation: 'Longer passwords are exponentially harder to crack.' },
    { statement: 'Malware can only infect your computer through email attachments.', isTrue: false, explanation: 'Malware can spread through downloads, websites, USB drives, and more.' },
    { statement: 'Updating software helps protect against known security vulnerabilities.', isTrue: true, explanation: 'Updates patch security holes that hackers exploit.' },
    { statement: 'Your browser history is always private.', isTrue: false, explanation: 'Your ISP, employers, and others can see your browsing activity.' },
    { statement: 'A padlock icon in your browser means the site is legitimate.', isTrue: false, explanation: 'A padlock means the connection is encrypted — not that the site is real.' },
  ],
  elite: [
    { statement: 'SQL injection is a type of social engineering attack.', isTrue: false, explanation: 'SQL injection is a code-based attack — social engineering exploits human psychology.' },
    { statement: 'Zero-day vulnerabilities are unpatched security flaws unknown to vendors.', isTrue: true, explanation: 'Zero-days are especially dangerous because there is no patch yet.' },
    { statement: 'VPNs make you completely anonymous online.', isTrue: false, explanation: 'VPNs mask your IP but dont make you fully anonymous — cookies and logins still apply.' },
    { statement: 'End-to-end encryption means only sender and receiver can read messages.', isTrue: true, explanation: 'E2E encryption ensures even the service provider cannot read your messages.' },
    { statement: 'A DDoS attack steals user data from servers.', isTrue: false, explanation: 'DDoS overwhelms servers with traffic — it does not directly steal data.' },
    { statement: 'Multi-factor authentication can be bypassed through SIM swapping.', isTrue: true, explanation: 'SIM swapping lets attackers intercept SMS codes — use authenticator apps instead.' },
    { statement: 'Incognito mode hides your browsing from your ISP.', isTrue: false, explanation: 'Incognito only prevents local history storage — your ISP can still see your traffic.' },
    { statement: 'Certificate Transparency logs help detect fraudulent SSL certificates.', isTrue: true, explanation: 'CT logs create a public record of all issued certificates for auditing.' },
    { statement: 'Ransomware always permanently destroys your data.', isTrue: false, explanation: 'Ransomware encrypts data and demands payment — paying may or may not restore it.' },
    { statement: 'GDPR gives EU residents the right to request deletion of their personal data.', isTrue: true, explanation: 'The right to be forgotten is a key GDPR provision.' },
  ],
};

const GAME_DURATION: Record<AgeTier, number> = { junior: 45, hero: 60, elite: 60 };

function TrueOrFalseLightningGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (s: number, m: number) => void }) {
  const facts = [...FACTS[ageTier]].sort(() => Math.random() - 0.5);
  const duration = GAME_DURATION[ageTier];
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [answered, setAnswered] = useState(0);
  const currentFact = facts[index % facts.length];

  const end = useCallback(() => onComplete(score, 300), [score, onComplete]);

  useEffect(() => {
    if (!started || feedback) return;
    if (timeLeft <= 0) { end(); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft, feedback, end]);

  const answer = (choice: boolean) => {
    if (feedback || !started) return;
    const correct = choice === currentFact.isTrue;
    const newStreak = correct ? streak + 1 : 0;
    const bonus = newStreak >= 3 ? 2 : 1;
    setStreak(newStreak);
    setScore(s => s + (correct ? 10 * bonus : 0));
    setAnswered(a => a + 1);
    setFeedback({ correct, explanation: currentFact.explanation });
    setTimeout(() => { setFeedback(null); setIndex(i => i + 1); }, ageTier === 'junior' ? 2000 : 1500);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-lg mx-auto">
      {!started ? (
        <div className="flex flex-col items-center gap-4 mt-10">
          <div className="text-6xl">⚡</div>
          <h2 className="text-2xl font-bold">True or False Lightning</h2>
          <p className="text-gray-300 text-center">{ageTier === 'junior' ? 'Cyber facts will appear! Is it TRUE or FALSE? Be quick!' : `Answer as many as possible in ${duration} seconds. Streaks earn bonus points!`}</p>
          <button onClick={() => setStarted(true)} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-lg transition">Start! ⚡</button>
        </div>
      ) : (
        <>
          <div className="flex gap-4 w-full">
            {[{ label: 'Score', value: score, color: 'text-cyan-400' }, { label: 'Time', value: `${timeLeft}s`, color: timeLeft <= 10 ? 'text-red-400' : 'text-yellow-400' }, { label: 'Streak', value: streak, color: 'text-orange-400' }].map(({ label, value, color }) => (
              <div key={label} className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
          {streak >= 3 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-yellow-400 font-black text-lg">🔥 2x STREAK BONUS!</motion.div>}
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ duration: 0.2 }}
              className={`w-full bg-[#0d1220] border-2 rounded-2xl p-6 text-center min-h-[120px] flex flex-col items-center justify-center gap-3 ${feedback?.correct === true ? 'border-green-500' : feedback?.correct === false ? 'border-red-500' : 'border-white/10'}`}>
              <p className="text-white font-semibold text-lg leading-relaxed">{currentFact.statement}</p>
              <AnimatePresence>
                {feedback && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className={`text-sm ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>{feedback.correct ? '✅ ' : '❌ '}{feedback.explanation}</motion.p>}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-4 w-full">
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => answer(true)} disabled={!!feedback} className="flex-1 py-5 rounded-2xl bg-green-500/20 border-2 border-green-500 text-green-400 font-black text-2xl hover:bg-green-500/30 transition disabled:opacity-40">✅ TRUE</motion.button>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => answer(false)} disabled={!!feedback} className="flex-1 py-5 rounded-2xl bg-red-500/20 border-2 border-red-500 text-red-400 font-black text-2xl hover:bg-red-500/30 transition disabled:opacity-40">❌ FALSE</motion.button>
          </div>
          <p className="text-gray-500 text-sm">{answered} answered</p>
        </>
      )}
    </div>
  );
}

export default function TrueOrFalseLightning() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="True or False Lightning" category="Speed Round" xpReward={80} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => <TrueOrFalseLightningGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
