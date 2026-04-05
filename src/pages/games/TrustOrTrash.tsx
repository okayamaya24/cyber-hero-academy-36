import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

type MsgType = 'text' | 'email' | 'notification';

interface MessageItem {
  type: MsgType;
  from: string;
  subject?: string;
  content: string;
  trust: boolean;
  explanation: string;
}

const MESSAGES: Record<AgeTier, MessageItem[]> = {
  junior: [
    { type: 'text',         from: 'Mom 💙',        content: 'Come home for dinner!', trust: true, explanation: 'Trusted contact with a normal message!' },
    { type: 'email',        from: 'prizes@freemoney.win', subject: 'You won $500!', content: 'Click to claim your prize!', trust: false, explanation: 'Suspicious sender + prize offer = scam!' },
    { type: 'notification', from: 'Unknown App',    content: 'Update required! Tap now!', trust: false, explanation: 'Unknown apps asking for urgent action are suspicious!' },
    { type: 'text',         from: 'Teacher 📚',     content: 'Class starts in 10 minutes', trust: true, explanation: 'Known contact with a normal reminder!' },
    { type: 'email',        from: 'admin@yourschool.edu', subject: 'Newsletter', content: 'This week at school...', trust: true, explanation: 'Official school email with expected content!' },
    { type: 'text',         from: 'Unknown Number', content: 'Hi! I have a gift. Send your address', trust: false, explanation: 'Never give your address to strangers!' },
    { type: 'notification', from: 'App Store',      content: 'YouTube update available', trust: true, explanation: 'Official app store updates are legitimate!' },
    { type: 'email',        from: 'security@amaz0n.net', subject: 'Account suspended!', content: 'Login now!', trust: false, explanation: '"amaz0n" not "amazon" — it\'s a phishing domain!' },
    { type: 'text',         from: 'Best Friend 👾', content: 'Want to play Minecraft later?', trust: true, explanation: 'Known friend with a normal message!' },
    { type: 'email',        from: 'noreply@realbank.com', subject: 'Verify SSN', content: 'Please verify your social security number', trust: false, explanation: 'No bank ever asks for your SSN by email!' },
  ],
  hero: [
    { type: 'email',        from: 'security@google.com', subject: 'New sign-in detected', content: 'We detected a sign-in from Chrome on Windows. If this was you, no action needed.', trust: true, explanation: 'Real Google security alert with no urgent action required!' },
    { type: 'email',        from: 'noreply@g00gle-security.net', subject: 'Unusual sign-in!', content: 'Click immediately to verify your account!', trust: false, explanation: 'Fake Google domain + unnecessary urgency = phishing!' },
    { type: 'text',         from: '+1 (555) 867-5309', content: 'Your bank verification code is 847291. Never share this code!', trust: true, explanation: 'Legit 2FA codes warn you not to share them!' },
    { type: 'text',         from: '+1 (555) 000-0000', content: 'Bank code: 123456. Share with our agent to verify.', trust: false, explanation: 'Real banks never ask you to share 2FA codes with anyone!' },
    { type: 'notification', from: 'Windows Security',  content: '3 threats found. Update Windows Defender now.', trust: true, explanation: 'Windows Security notifications are generally legitimate!' },
    { type: 'notification', from: 'PC Cleaner Pro',    content: 'CRITICAL: 47 viruses! Install now!', trust: false, explanation: 'Fake virus alerts trying to install malware!' },
    { type: 'email',        from: 'hr@yourcompany.com', subject: 'Benefits enrollment', content: 'Open enrollment ends Friday. Log in to HR portal.', trust: true, explanation: 'Internal HR email with expected seasonal content!' },
    { type: 'email',        from: 'ceo@yourcompany.com', subject: 'URGENT wire transfer', content: 'Transfer $5000 immediately. Do not tell anyone.', trust: false, explanation: 'CEO fraud / BEC attack — real CEOs don\'t email secret wire transfers!' },
    { type: 'text',         from: 'DoorDash',          content: 'Your order from Chipotle is on the way! Track: drd.sh/abc123', trust: true, explanation: 'Expected delivery notification with short link from known service!' },
    { type: 'email',        from: 'support@paypal.com', subject: 'Action required', content: 'We noticed unusual activity. Click paypal.com to review.', trust: true, explanation: 'Real PayPal email that directs you to paypal.com, not a suspicious link!' },
    { type: 'text',         from: 'IRS', content: 'You owe $2000 in back taxes. Pay immediately or be arrested.', trust: false, explanation: 'The IRS never texts you, especially with arrest threats — classic IRS scam!' },
    { type: 'notification', from: 'GitHub',            content: 'Dependabot found 3 security vulnerabilities in your repo.', trust: true, explanation: 'GitHub Dependabot security alerts are legitimate and helpful!' },
  ],
  elite: [
    { type: 'email',        from: 'security-noreply@github.com', subject: 'New personal access token created', content: 'A new token "CI-deploy" was created for account @devuser.', trust: true, explanation: 'Official GitHub security notification via correct domain!' },
    { type: 'email',        from: 'security@github.support', subject: 'Token verification required', content: 'Verify your new personal access token to prevent suspension.', trust: false, explanation: 'github.support ≠ github.com — impersonation attack targeting developers!' },
    { type: 'text',         from: 'Twilio',            content: 'Your Twilio verification code: 847291', trust: true, explanation: 'Expected verification code from known service!' },
    { type: 'email',        from: 'billing@aws.amazon.com', subject: 'Invoice for March 2026', content: 'Your AWS invoice for $127.43 is available.', trust: true, explanation: 'AWS billing from official AWS domain with expected billing activity!' },
    { type: 'email',        from: 'billing@aws-invoices.net', subject: 'Overdue invoice!', content: 'Your AWS account will be suspended. Pay now!', trust: false, explanation: 'AWS billing only comes from amazon.com domains, not aws-invoices.net!' },
    { type: 'notification', from: 'Snyk',              content: 'Critical vulnerability CVE-2026-1234 in lodash@4.17.20', trust: true, explanation: 'Legitimate security tool notification about a real CVE!' },
    { type: 'email',        from: 'security@npm',      content: 'Your 2FA was disabled. Re-enable at npmjs.com/settings', trust: true, explanation: 'Real npm security alert directing to official domain!' },
    { type: 'email',        from: 'support@npm-security.com', subject: 'NPM account compromised!', content: 'Your package was flagged. Provide credentials to restore.', trust: false, explanation: 'npm-security.com is not npm — credential harvesting attack on developers!' },
    { type: 'text',         from: 'PagerDuty',         content: '[CRITICAL] Production DB memory 98%. Incident #8847', trust: true, explanation: 'Expected on-call alert from monitoring service!' },
    { type: 'email',        from: 'cto@company.com',   subject: 'Confidential', content: 'Share your SSH private key for emergency server access.', trust: false, explanation: 'NEVER share private SSH keys. Real CTOs use proper access controls!' },
    { type: 'notification', from: 'Cloudflare',        content: 'DDoS attack mitigated. 47k requests blocked in last hour.', trust: true, explanation: 'Expected security notification from CDN/DDoS protection service!' },
    { type: 'email',        from: 'recruiter@google.com', subject: 'Software Engineer opportunity', content: 'We found your profile on GitHub and would like to connect.', trust: true, explanation: 'Legitimate recruiter email from official Google domain!' },
    { type: 'email',        from: 'recruiter@googlejobs.net', subject: 'Google is hiring!', content: 'Send your resume + LinkedIn password to apply fast.', trust: false, explanation: 'googlejobs.net ≠ google.com, AND no employer needs your LinkedIn password!' },
    { type: 'text',         from: 'Unknown', content: 'Package delivered to neighbor. Claim: tracking-redelivery.com', trust: false, explanation: 'USPS/FedEx don\'t text you about neighbors. Package redelivery links are often phishing!' },
  ],
};

const TIME_LIMIT = { junior: 20, hero: 12, elite: 8 };

function MsgCard({ msg }: { msg: MessageItem }) {
  if (msg.type === 'text') {
    return (
      <div className="space-y-2">
        <div className="text-xs text-gray-500 text-center">{msg.from}</div>
        <div className="max-w-[80%] ml-auto bg-[#0a84ff] rounded-2xl rounded-tr-sm px-4 py-3 text-white text-sm">
          {msg.content}
        </div>
      </div>
    );
  }
  if (msg.type === 'notification') {
    return (
      <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">📱</div>
        <div>
          <div className="text-sm font-bold text-white">{msg.from}</div>
          <div className="text-sm text-gray-300 mt-0.5">{msg.content}</div>
        </div>
      </div>
    );
  }
  // email
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-2 bg-white/5 border-b border-white/10">
        <div className="text-xs text-gray-500">From: <span className="text-gray-300">{msg.from}</span></div>
        {msg.subject && <div className="text-xs text-gray-400 font-medium mt-0.5">{msg.subject}</div>}
      </div>
      <div className="px-4 py-3 text-sm text-gray-300">{msg.content}</div>
    </div>
  );
}

function TrustOrTrashGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const [msgs] = useState(() => [...MESSAGES[ageTier]].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT[ageTier]);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const scoreRef = React.useRef(0);

  useEffect(() => { setTimeLeft(TIME_LIMIT[ageTier]); }, [current, ageTier]);

  useEffect(() => {
    if (feedback) return;
    const t = setInterval(() => {
      setTimeLeft(tl => {
        if (tl <= 1) { clearInterval(t); handleAnswer(false, true); return 0; }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [current, feedback]);

  const handleAnswer = (trust: boolean, timeout = false) => {
    if (feedback) return;
    const msg = msgs[current];
    const correct = !timeout && trust === msg.trust;
    if (correct) { scoreRef.current += 10; setScore(scoreRef.current); }
    setFeedback({ correct, explanation: msg.explanation });
    setTimeout(() => {
      setFeedback(null);
      if (current + 1 >= msgs.length) {
        onComplete(scoreRef.current, msgs.length * 10);
      } else {
        setCurrent(c => c + 1);
      }
    }, 2000);
  };

  const timerPct = (timeLeft / TIME_LIMIT[ageTier]) * 100;

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] p-4 gap-3">
      {/* HUD */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{current + 1}/{msgs.length}</span>
        <span className="font-bold text-green-400">{score} pts</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${timerPct}%` }} transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${timerPct > 50 ? 'bg-cyan-500' : timerPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} />
      </div>

      {/* Message */}
      <div className="flex-1 flex items-center">
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <MsgCard msg={msgs[current]} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={() => handleAnswer(false)} disabled={!!feedback}
          className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-400 active:scale-95 font-black text-white disabled:opacity-40 transition-all">
          🗑️ TRASH IT
        </button>
        <button onClick={() => handleAnswer(true)} disabled={!!feedback}
          className="flex-1 py-4 rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 font-black text-white disabled:opacity-40 transition-all">
          👍 TRUST IT
        </button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-xl p-3 text-sm ${feedback.correct ? 'bg-green-500/10 border border-green-500 text-green-300' : 'bg-red-500/10 border border-red-500 text-red-300'}`}>
            {feedback.correct ? '✅ Correct! ' : '❌ Actually — '}{feedback.explanation}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TrustOrTrash() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Trust or Trash" category="Sort & Decide" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <TrustOrTrashGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
