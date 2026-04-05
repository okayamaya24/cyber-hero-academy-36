import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell, { AgeTier } from '@/components/games/GameShell';

interface WebsiteItem {
  url: string;
  siteName: string;
  content: string[];
  isReal: boolean;
  redFlags: string[];
  greenFlags: string[];
}

const SITES: Record<AgeTier, WebsiteItem[]> = {
  junior: [
    { url: 'https://www.google.com', siteName: 'Google', content: ['Search the web', 'Gmail · Maps · YouTube'], isReal: true, redFlags: [], greenFlags: ['https://', 'correct spelling', 'official .com domain'] },
    { url: 'http://g00gle-prizes.xyz', siteName: 'Goooogle', content: ['YOU WON! Click here!', 'Enter your password to claim'], isReal: false, redFlags: ['http://', 'misspelled domain', 'prize scam', '.xyz domain'], greenFlags: [] },
    { url: 'https://www.youtube.com', siteName: 'YouTube', content: ['Watch videos anytime', 'Sign in to your account'], isReal: true, redFlags: [], greenFlags: ['https://', 'official domain', 'familiar brand'] },
    { url: 'https://free-iPad-winner.net', siteName: 'Free iPad!', content: ['Congratulations! You\'ve been selected!', 'Click NOW to claim your free iPad!'], isReal: false, redFlags: ['suspicious promise', '.net with "free"', 'too good to be true'], greenFlags: [] },
    { url: 'https://kids.nationalgeographic.com', siteName: 'Nat Geo Kids', content: ['Animals · Science · Games', 'Explore the world!'], isReal: true, redFlags: [], greenFlags: ['https://', 'official subdomain', 'educational content'] },
    { url: 'http://roblox-robux-generator.com', siteName: 'FREE ROBUX!!!', content: ['Generate unlimited Robux FREE!', 'Enter your Roblox username'], isReal: false, redFlags: ['http://', 'fake "generator"', 'asks for username', 'not official domain'], greenFlags: [] },
  ],
  hero: [
    { url: 'https://www.paypal.com/signin', siteName: 'PayPal', content: ['Send & receive money', 'Pay in seconds'], isReal: true, redFlags: [], greenFlags: ['https://', 'exact official domain', 'no typos'] },
    { url: 'https://paypa1.com/login', siteName: 'PayPaI', content: ['Log in to your account', 'Enter your password below'], isReal: false, redFlags: ['"paypa1" — "l" replaced by "1"', 'not paypal.com', 'typosquatting'], greenFlags: [] },
    { url: 'https://www.amazon.com/deals', siteName: 'Amazon', content: ['Today\'s Deals', 'Prime · Kindle · Shop'], isReal: true, redFlags: [], greenFlags: ['https://', 'amazon.com exact match', 'expected path'] },
    { url: 'https://amazon-deals-secure.net', siteName: 'Amazon Deals', content: ['Exclusive deals just for you!', 'Log in to unlock 80% off'], isReal: false, redFlags: ['not amazon.com domain', 'amazon is keyword not domain', '.net not .com'], greenFlags: [] },
    { url: 'https://secure.bankofamerica.com', siteName: 'Bank of America', content: ['Online Banking Sign In', 'Checking · Savings · Mortgage'], isReal: true, redFlags: [], greenFlags: ['https://', 'official subdomain on bankofamerica.com', 'expected page'] },
    { url: 'https://bankofamerica.security-verify.com', siteName: 'Bank Security', content: ['Your account needs verification!', 'Enter full card details'], isReal: false, redFlags: ['bankofamerica is subdomain of security-verify.com', 'asks for card details', 'unusual domain structure'], greenFlags: [] },
    { url: 'https://accounts.google.com/signin', siteName: 'Google Sign In', content: ['Sign in with your Google Account', 'Gmail · Drive · YouTube'], isReal: true, redFlags: [], greenFlags: ['https://', 'accounts.google.com — official Google subdomain'] },
    { url: 'http://google-account-verify.com', siteName: 'Google Account', content: ['Your Google account is suspended!', 'Verify immediately!'], isReal: false, redFlags: ['http://', 'not google.com domain', 'suspicious urgency', 'account suspension threat'], greenFlags: [] },
  ],
  elite: [
    { url: 'https://login.microsoftonline.com', siteName: 'Microsoft', content: ['Sign in to your account', 'Work · School · Personal'], isReal: true, redFlags: [], greenFlags: ['https://', 'microsoftonline.com is official Microsoft auth domain'] },
    { url: 'https://microsft-login.com/signin', siteName: 'Microsoft Sign In', content: ['Enter your Microsoft credentials', 'Professional security design'], isReal: false, redFlags: ['"microsft" typosquatting', 'not microsoftonline.com or microsoft.com', 'looks professional but domain wrong'], greenFlags: [] },
    { url: 'https://github.com/security', siteName: 'GitHub Security', content: ['Security advisories', 'Dependabot · Code scanning'], isReal: true, redFlags: [], greenFlags: ['https://', 'github.com official domain', 'expected path'] },
    { url: 'https://github.com.malicious.io/security', siteName: 'GitHub', content: ['Security login required', 'Enter your PAT token below'], isReal: false, redFlags: ['github.com is subdomain of malicious.io', 'asks for PAT token', 'homograph attack'], greenFlags: [] },
    { url: 'https://appleid.apple.com', siteName: 'Apple ID', content: ['Manage your Apple ID', 'Sign in with your Apple ID'], isReal: true, redFlags: [], greenFlags: ['https://', 'appleid.apple.com — official Apple auth domain'] },
    { url: 'https://apple.com-id-verify.net', siteName: 'Apple Verification', content: ['Your Apple ID needs verification', 'Enter 2FA code and password'], isReal: false, redFlags: ['apple.com is not the domain — it\'s a subdomain of com-id-verify.net', '.net not .com', 'IDN homograph possible'], greenFlags: [] },
    { url: 'https://auth.openai.com', siteName: 'OpenAI Login', content: ['Sign in to ChatGPT', 'Continue with Google · Microsoft'], isReal: true, redFlags: [], greenFlags: ['https://', 'auth.openai.com — official OpenAI auth subdomain'] },
    { url: 'https://chatgpt-login.io/auth', siteName: 'ChatGPT', content: ['Sign in to ChatGPT', 'Enter your OpenAI credentials'], isReal: false, redFlags: ['not openai.com domain', 'chatgpt-login.io is not affiliated', '.io domain', 'credential harvesting'], greenFlags: [] },
  ],
};

const TIME_PER_SITE = { junior: 20, hero: 12, elite: 8 };

function RealOrFakeWebsiteGame({ ageTier, onComplete }: { ageTier: AgeTier; onComplete: (score: number, maxScore: number) => void }) {
  const [sites] = useState(() => [...SITES[ageTier]].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_SITE[ageTier]);
  const [feedback, setFeedback] = useState<{ correct: boolean; flags: string[] } | null>(null);

  const site = sites[current];
  const scoreRef = React.useRef(0);

  useEffect(() => {
    setTimeLeft(TIME_PER_SITE[ageTier]);
  }, [current, ageTier]);

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

  const handleAnswer = (guessReal: boolean, timeout = false) => {
    if (feedback) return;
    const correct = !timeout && (guessReal === site.isReal);
    if (correct) { scoreRef.current += 15; setScore(scoreRef.current); }
    const flags = site.isReal ? site.greenFlags : site.redFlags;
    setFeedback({ correct, flags });
    setTimeout(() => {
      setFeedback(null);
      if (current + 1 >= sites.length) {
        onComplete(scoreRef.current, sites.length * 15);
      } else {
        setCurrent(c => c + 1);
      }
    }, 2500);
  };

  const timerPct = (timeLeft / TIME_PER_SITE[ageTier]) * 100;

  // Highlight suspicious parts of URL
  const renderUrl = (url: string) => {
    if (!feedback) return <span className="text-white">{url}</span>;
    if (site.isReal) return <span className="text-green-400">{url}</span>;
    // Try to highlight the domain part (after https://)
    const match = url.match(/^(https?:\/\/)(.+?)(\/.*)$/);
    if (match) {
      return (
        <>
          <span className="text-gray-500">{match[1]}</span>
          <span className="text-red-400 underline decoration-wavy">{match[2]}</span>
          <span className="text-gray-400">{match[3]}</span>
        </>
      );
    }
    return <span className="text-red-400">{url}</span>;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] gap-3 p-3">
      {/* HUD */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{current + 1}/{sites.length}</span>
        <span className="font-bold text-green-400">{score} pts</span>
      </div>

      {/* Timer */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div animate={{ width: `${timerPct}%` }} transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${timerPct > 50 ? 'bg-cyan-500' : timerPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`} />
      </div>

      {/* Browser mock */}
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden flex-1">
        {/* Browser chrome */}
        <div className="bg-[#252540] border-b border-white/10 px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60"/><div className="w-3 h-3 rounded-full bg-yellow-500/60"/><div className="w-3 h-3 rounded-full bg-green-500/60"/></div>
          <div className="flex-1 bg-black/40 rounded-lg px-3 py-1.5 font-mono text-xs flex items-center gap-1 overflow-hidden">
            {site.url.startsWith('https') ? <span className="text-green-400 flex-shrink-0">🔒</span> : <span className="text-red-400 flex-shrink-0">⚠️</span>}
            <span className="truncate">{renderUrl(site.url)}</span>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 space-y-2">
          <div className="text-lg font-bold text-white">{site.siteName}</div>
          {site.content.map((line, i) => (
            <div key={i} className="text-sm text-gray-400">{line}</div>
          ))}
        </div>
      </div>

      {/* Answer buttons */}
      <div className="flex gap-3">
        <button onClick={() => handleAnswer(false)} disabled={!!feedback}
          className="flex-1 py-4 rounded-xl bg-red-500 hover:bg-red-400 active:scale-95 transition-all font-black text-white disabled:opacity-40">
          🎣 FAKE
        </button>
        <button onClick={() => handleAnswer(true)} disabled={!!feedback}
          className="flex-1 py-4 rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 transition-all font-black text-white disabled:opacity-40">
          ✅ REAL
        </button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`rounded-xl p-3 ${feedback.correct ? 'bg-green-500/10 border border-green-500' : 'bg-red-500/10 border border-red-500'}`}>
            <div className={`font-bold text-sm mb-1 ${feedback.correct ? 'text-green-400' : 'text-red-400'}`}>
              {feedback.correct ? '✅ Correct!' : '❌ Wrong!'} Key clues:
            </div>
            <div className="text-xs text-gray-300 space-y-0.5">
              {feedback.flags.slice(0, 2).map((f, i) => <div key={i}>• {f}</div>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RealOrFakeWebsite() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Real or Fake Website" category="Sort & Decide" xpReward={150} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => <RealOrFakeWebsiteGame ageTier={ageTier} onComplete={onComplete} />}
    </GameShell>
  );
}
