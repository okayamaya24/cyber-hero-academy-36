import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import { CheckCircle, XCircle } from 'lucide-react';

interface Message { id: number; from: string; subject: string; body: string; isPhishing: boolean; hint: string; }

const MESSAGES: Record<AgeTier, Message[]> = {
  junior: [
    { id: 1, from: 'FREE PRIZES', subject: 'YOU WON!!!', body: 'Click HERE to claim your FREE iPad!!! Send us your home address NOW!', isPhishing: true, hint: 'Real prizes never ask for your address like this!' },
    { id: 2, from: 'Mom', subject: 'Dinner tonight', body: "Hi sweetheart! Dinner is ready at 6pm. Don't be late! Love, Mom 💙", isPhishing: false, hint: 'Normal message from someone you know!' },
    { id: 3, from: 'SchoolSystem', subject: 'Your password expired', body: 'Click here and enter your username and password RIGHT NOW or your account will be deleted.', isPhishing: true, hint: 'Schools never ask for your password by email!' },
    { id: 4, from: 'Library', subject: 'Book due tomorrow', body: 'Hi! Just a reminder your book is due back tomorrow. No fee if returned on time.', isPhishing: false, hint: 'Normal library reminder — no personal info asked!' },
    { id: 5, from: 'HACKER_BOT', subject: 'Give me your password!', body: 'I need your password for my project. Send it to me right now. — Your Friend', isPhishing: true, hint: 'Nobody ever needs your password — EVER!' },
    { id: 6, from: 'Coach Williams', subject: 'Practice cancelled', body: 'Hi team! Practice is cancelled today due to rain. See you Thursday!', isPhishing: false, hint: 'Normal message from your coach!' },
    { id: 7, from: 'GameZone', subject: 'Free Robux inside!!!', body: 'Get 1 MILLION free Robux!! Just give us your Roblox password to claim!', isPhishing: true, hint: 'Free Robux scams always want your password!' },
    { id: 8, from: 'Dad', subject: 'Running late', body: "Hey! I'll be home by 7. Can you start your homework? Thanks buddy!", isPhishing: false, hint: 'Normal message from family!' },
  ],
  hero: [
    { id: 1, from: 'noreply@paypa1.com', subject: 'Your account is suspended', body: 'Your PayPal account has been locked. Click below immediately: http://paypa1-secure.net/login', isPhishing: true, hint: 'Look at the email address — paypa1.com uses a 1, not an l!' },
    { id: 2, from: 'netflix@netflix.com', subject: 'Your monthly receipt', body: 'Hi Alex, your Netflix subscription of $15.99 was charged on Jan 3. Manage your account at netflix.com.', isPhishing: false, hint: 'Comes from the real domain and matches subscription details.' },
    { id: 3, from: 'security@googIe.com', subject: 'Unusual sign-in detected', body: 'Someone signed into your Google account from Russia. Click here: http://googIe-secure.com', isPhishing: true, hint: 'googIe uses a capital I not an L — and the link is not google.com!' },
    { id: 4, from: 'school@maplegrove.edu', subject: 'Parent-teacher conference', body: 'Dear parent, your conference is scheduled for Friday Jan 10 at 3pm in Room 204. Please confirm attendance.', isPhishing: false, hint: 'Official school domain, specific details, no links requesting info.' },
    { id: 5, from: 'winner@prizecentral.biz', subject: 'You have been selected!', body: "You've won a $500 Amazon gift card. Verify your identity by entering your name, address, and card number.", isPhishing: true, hint: 'Real prizes never need credit card numbers to claim!' },
    { id: 6, from: 'donotreply@amazon.com', subject: 'Your order has shipped', body: 'Hi Alex, your order #112-4455-8821 has shipped. Expected delivery: Jan 8. Track at amazon.com/orders.', isPhishing: false, hint: 'Correct domain, order number present, no personal info requested.' },
    { id: 7, from: 'it-support@sch00l.com', subject: 'Update your school password', body: 'Your school password expires in 24 hours. Enter your current password here: http://bit.ly/sch00l-reset', isPhishing: true, hint: 'sch00l.com uses zeros — and shortened links hide where they go!' },
    { id: 8, from: 'info@spotify.com', subject: 'New device signed in', body: 'A new device signed into your Spotify account on iPhone. If this was you, no action needed. If not, visit spotify.com/account.', isPhishing: false, hint: 'Real domain, no suspicious links, no action required.' },
  ],
  elite: [
    { id: 1, from: 'security@paypal.com.verify-now.net', subject: 'Confirm your identity', body: 'We noticed unusual activity. Log in within 12 hours: https://paypal.com.verify-now.net/secure', isPhishing: true, hint: 'The domain is verify-now.net — PayPal comes BEFORE the dot in a real URL.' },
    { id: 2, from: 'noreply@github.com', subject: 'GitHub security alert', body: '[GitHub] A personal access token with repo scope was used from IP 45.33.32.156 (Fremont, CA). If not you, revoke at github.com/settings/tokens.', isPhishing: false, hint: 'Correct GitHub domain, specific technical detail, directs to official settings page.' },
    { id: 3, from: 'support@apple.com', subject: 'Receipt from Apple', body: 'Your Apple ID was used to purchase Minecraft ($6.99) on Jan 5. If you did not authorize this, click here immediately.', isPhishing: true, hint: 'Check the link — phishing uses urgency and generic "click here" without showing the real URL.' },
    { id: 4, from: 'no-reply@accounts.google.com', subject: 'Security checkup reminder', body: 'Make your account more secure. Review your settings at myaccount.google.com.', isPhishing: false, hint: 'accounts.google.com is a legitimate Google subdomain and links to official site.' },
    { id: 5, from: 'billing@micros0ft.com', subject: 'Microsoft 365 renewal', body: 'Your subscription auto-renews Jan 15 ($99.99). To cancel, call our team at 1-888-523-1234 and provide your account credentials.', isPhishing: true, hint: 'micros0ft uses a zero. Real Microsoft never asks for credentials over the phone.' },
    { id: 6, from: 'donotreply@email.apple.com', subject: 'Your Apple ID was used to sign in', body: 'Your Apple ID was used to sign in to iCloud on January 5, 2026 in Chicago, IL. If this was you, ignore this email.', isPhishing: false, hint: 'email.apple.com is a legitimate Apple subdomain. No suspicious links, specific location.' },
    { id: 7, from: 'alert@chase.com', subject: 'Chase: Unusual activity', body: 'We detected a charge of $847.00 at an unknown merchant. Reply STOP to decline or call 1-800-555-0199.', isPhishing: true, hint: 'Banks never ask you to reply to texts to stop charges — always log into the real website.' },
    { id: 8, from: 'noreply@dropbox.com', subject: 'Alex shared a folder with you', body: 'Alex Harris shared "School Project Files" with you on Dropbox. Open at dropbox.com. If you don\'t know Alex, ignore this.', isPhishing: false, hint: 'Real Dropbox domain, specific folder name, no urgency, no info requested.' },
  ],
};

const TIMER_PER_CARD: Record<AgeTier, number> = { junior: 15, hero: 10, elite: 7 };

function SpotThePhishGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (s: number, m: number) => void }) {
  const messages = MESSAGES[ageTier];
  const timerMax = TIMER_PER_CARD[ageTier];
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(timerMax);
  const [started, setStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const current = messages[index];

  const advance = useCallback((correct: boolean) => {
    setScore(s => correct ? s + 10 : s);
    setFeedback(correct ? 'correct' : 'wrong');
    setShowHint(false);
    setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= messages.length) onComplete(score + (correct ? 10 : 0), messages.length * 10);
      else { setIndex(i => i + 1); setTimeLeft(timerMax); }
    }, 1200);
  }, [index, messages.length, onComplete, score, timerMax]);

  const answer = (choice: 'safe' | 'phishing') => { if (feedback) return; advance((choice === 'phishing') === current.isPhishing); };

  useEffect(() => {
    if (!started || feedback) return;
    if (timeLeft <= 0) { advance(false); return; }
    const t = setTimeout(() => setTimeLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [started, timeLeft, feedback, advance]);

  return (
    <div className="flex flex-col items-center gap-5 p-6 max-w-xl mx-auto">
      {!started ? (
        <div className="flex flex-col items-center gap-4 mt-10">
          <div className="text-6xl">🎣</div>
          <h2 className="text-2xl font-bold text-white">Spot the Phish</h2>
          <p className="text-gray-300 text-center">{ageTier === 'junior' ? 'Read each message — is it SAFE or a TRICK? 🤔' : 'Analyze each message. Identify real communications from phishing attempts.'}</p>
          <button onClick={() => setStarted(true)} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-lg transition">Start! 🎮</button>
        </div>
      ) : (
        <>
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Message {index + 1} of {messages.length}</span>
              <span className={timeLeft <= 3 ? 'text-red-400 font-bold' : 'text-gray-400'}>{timeLeft}s</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="h-full bg-cyan-500 rounded-full" animate={{ width: `${(index / messages.length) * 100}%` }} />
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div className={`h-full rounded-full ${timeLeft <= 3 ? 'bg-red-500' : 'bg-green-500'}`} animate={{ width: `${(timeLeft / timerMax) * 100}%` }} transition={{ duration: 1 }} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`w-full bg-[#0d1220] border rounded-2xl p-5 relative ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-white/10'}`}>
              <AnimatePresence>
                {feedback && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 rounded-2xl flex items-center justify-center" style={{ background: feedback === 'correct' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                    {feedback === 'correct' ? <CheckCircle className="w-16 h-16 text-green-400" /> : <XCircle className="w-16 h-16 text-red-400" />}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-3">
                <div className="flex items-start gap-2"><span className="text-xs text-gray-500 w-14 flex-shrink-0">From:</span><span className="text-sm text-white font-mono break-all">{current.from}</span></div>
                <div className="flex items-start gap-2"><span className="text-xs text-gray-500 w-14 flex-shrink-0">Subject:</span><span className="text-sm text-white font-semibold">{current.subject}</span></div>
                <div className="border-t border-white/10 pt-3"><p className="text-sm text-gray-300 leading-relaxed">{current.body}</p></div>
              </div>
            </motion.div>
          </AnimatePresence>
          {ageTier !== 'elite' && <button onClick={() => setShowHint(h => !h)} className="text-xs text-cyan-400 hover:text-cyan-300 underline">{showHint ? 'Hide hint' : '💡 Show hint'}</button>}
          <AnimatePresence>{showHint && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-sm text-yellow-300 text-center bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2">💡 {current.hint}</motion.p>}</AnimatePresence>
          <div className="flex gap-4 w-full">
            <button onClick={() => answer('safe')} disabled={!!feedback} className="flex-1 py-4 rounded-xl bg-green-500/20 border-2 border-green-500 text-green-400 font-bold text-lg hover:bg-green-500/30 transition disabled:opacity-50">✅ SAFE</button>
            <button onClick={() => answer('phishing')} disabled={!!feedback} className="flex-1 py-4 rounded-xl bg-red-500/20 border-2 border-red-500 text-red-400 font-bold text-lg hover:bg-red-500/30 transition disabled:opacity-50">🎣 PHISHING</button>
          </div>
          <div className="text-cyan-400 font-bold">Score: {score} / {messages.length * 10}</div>
        </>
      )}
    </div>
  );
}

export default function SpotThePhish() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Spot the Phish" category="Arcade" xpReward={120} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => <SpotThePhishGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
