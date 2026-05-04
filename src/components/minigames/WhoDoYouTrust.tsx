/**
 * Who Do You Trust? — Zone 1 Mini-Game 3
 * The Keybreaker planted fake login pages! Pick the REAL website.
 * Detective mode — scan URLs for fakes, padlocks, and traps!
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: (stars: number) => void;
}

interface SiteCard {
  name: string;
  url: string;
  hasLock: boolean;
  isReal: boolean;
  clue: string;
  suspiciousNote?: string;
}

interface Round {
  question: string;
  context: string;
  sites: [SiteCard, SiteCard];
}

const ROUNDS: Round[] = [
  {
    question: "Which Google login is REAL?",
    context: "The Keybreaker cloned Google's login page. Spot the fake!",
    sites: [
      {
        name: "Google",
        url: "google.com",
        hasLock: true,
        isReal: true,
        clue: "✅ Official domain, padlock active. You're safe to log in.",
      },
      {
        name: "Goog1e",
        url: "g00gle-login.net",
        hasLock: false,
        isReal: false,
        clue: "⚠️ That's '0' (zero) not 'o'! And '.net' ≠ '.com'. Classic trap!",
        suspiciousNote: "Fake! Number '0' replacing letter 'o'",
      },
    ],
  },
  {
    question: "Which PayPal page can you trust?",
    context: "Someone emailed you saying your account is suspended. You click the link...",
    sites: [
      {
        name: "PayPaI Support",
        url: "paypa1-secure.net",
        hasLock: false,
        isReal: false,
        clue: "⚠️ That's a capital 'I' not lowercase 'l'! And 'paypa1' uses the number 1. Never log in here!",
        suspiciousNote: "Fake! Capital I ≠ lowercase l",
      },
      {
        name: "PayPal",
        url: "paypal.com",
        hasLock: true,
        isReal: true,
        clue: "✅ Official domain, padlock secure. This is the real PayPal.",
      },
    ],
  },
  {
    question: "Which Minecraft site is safe?",
    context: "You want to buy Minecraft. Where do you go?",
    sites: [
      {
        name: "Minecraft",
        url: "minecraft.net",
        hasLock: true,
        isReal: true,
        clue: "✅ minecraft.net is the official Mojang site. Safe!",
      },
      {
        name: "Minecraftt — Free Robux!",
        url: "minecraftt-free-coins.com",
        hasLock: false,
        isReal: false,
        clue: "⚠️ Double 't', wrong domain, AND free coins?! The Keybreaker is desperate!",
        suspiciousNote: "Fake! 'minecraftt' + suspicious promise",
      },
    ],
  },
  {
    question: "Which YouTube link is legit?",
    context: "A message says 'Watch this video for FREE gems!' — suspicious. Check the link.",
    sites: [
      {
        name: "YouTube — FREE Gems!",
        url: "y0utube-gems-free.com",
        hasLock: false,
        isReal: false,
        clue: "⚠️ Zero for 'o', random domain, and FREE GEMS?! Always a scam. Never click this!",
        suspiciousNote: "Fake! Multiple red flags spotted",
      },
      {
        name: "YouTube",
        url: "youtube.com",
        hasLock: true,
        isReal: true,
        clue: "✅ Simple, clean URL with padlock — the real YouTube. No tricks here.",
      },
    ],
  },
];

const MAX_TIME = 12;

const VILLAIN_WRONG = [
  "YES! Another one caught in my trap! 😈",
  "Ha! You fell for it — CLASSIC! 😂",
  "GOTCHA! That's what I live for! 🎉",
];
const VILLAIN_TIMEOUT = [
  "⏰ TIME'S UP! Too slow — hackers don't wait! 😏",
  "⏰ Hesitation is weakness! I WIN! 😈",
];
const VILLAIN_RIGHT = [
  "WHAT?! How did you spot that?! 😤",
  "IMPOSSIBLE! Stop being so smart! 😡",
  "No no no! That was my BEST fake! 🤬",
];

export default function WhoDoYouTrust({ onComplete }: Props) {
  const [index, setIndex]         = useState(0);
  const [score, setScore]         = useState(0);
  const [chosen, setChosen]       = useState<0 | 1 | null>(null);
  const [timedOut, setTimedOut]   = useState(false);
  const [scanAnim, setScanAnim]   = useState(true);
  const [done, setDone]           = useState(false);
  const [timeLeft, setTimeLeft]   = useState(MAX_TIME);
  const [villainLine, setVillainLine] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const round      = ROUNDS[index];
  const isRevealed = chosen !== null || timedOut;
  const pickedCorrect = chosen !== null && round.sites[chosen].isReal;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (isRevealed || done) return;
    clearTimer();
    setTimeLeft(MAX_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 0.05) {
          clearTimer();
          setTimedOut(true);
          setVillainLine(VILLAIN_TIMEOUT[Math.floor(Math.random() * VILLAIN_TIMEOUT.length)]);
          return 0;
        }
        return t - 0.05;
      });
    }, 50);
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, done]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  if (scanAnim) setTimeout(() => setScanAnim(false), 600);

  const handlePick = (pick: 0 | 1) => {
    if (isRevealed) return;
    clearTimer();
    setChosen(pick);
    const correct = round.sites[pick].isReal;
    if (correct) {
      setScore(s => s + 1);
      setVillainLine(VILLAIN_RIGHT[Math.floor(Math.random() * VILLAIN_RIGHT.length)]);
    } else {
      setVillainLine(VILLAIN_WRONG[Math.floor(Math.random() * VILLAIN_WRONG.length)]);
    }
  };

  const handleNext = () => {
    clearTimer();
    setScanAnim(true);
    setChosen(null);
    setTimedOut(false);
    setVillainLine(null);
    setTimeLeft(MAX_TIME);
    if (index + 1 >= ROUNDS.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
    }
  };

  const pct = (timeLeft / MAX_TIME) * 100;

  if (done) {
    const stars = score >= 4 ? 3 : score >= 3 ? 2 : 1;
    setTimeout(() => onComplete(stars), 1200);
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center max-w-sm mx-auto"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ repeat: 2, duration: 0.4 }}
          className="text-6xl"
        >
          🔍
        </motion.div>
        <h2 className="text-2xl font-black text-white">Detective Work Done!</h2>
        <div className="text-3xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center">
            <p className="text-[10px] text-white/40 uppercase">Traps Avoided</p>
            <p className="text-xl font-bold text-green-400">{score}/{ROUNDS.length}</p>
          </div>
        </div>
        <p className="text-white/50 text-sm italic max-w-[260px]">
          {score === 4
            ? "Perfect! You'd never fall for the Keybreaker's fake sites! 🛡️"
            : score >= 3
            ? "Great detective work! Almost foolproof!"
            : "Check for padlocks and URL spelling — that's how you catch fakes!"}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-2 px-2 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-mono text-white/40">SITE {index + 1}/{ROUNDS.length}</span>
        <span className="text-xs font-mono text-white/40">🔍 Detective Mode</span>
        <span className="text-xs font-mono text-white/40">Score: {score}</span>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${isRevealed ? 100 : pct}%`,
            backgroundColor: isRevealed
              ? (pickedCorrect || timedOut ? "hsl(120,60%,45%)" : "hsl(0,70%,50%)")
              : pct > 50
              ? "hsl(195,80%,50%)"
              : pct > 25
              ? "hsl(40,90%,55%)"
              : "hsl(0,80%,55%)",
          }}
        />
      </div>

      {/* Villain reaction */}
      <AnimatePresence>
        {villainLine && (
          <motion.div
            key="villain"
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full rounded-xl border px-3 py-2 text-sm font-bold text-center ${
              pickedCorrect && !timedOut
                ? "border-orange-500/40 bg-orange-900/25 text-orange-200"
                : "border-red-500/40 bg-red-900/25 text-red-200"
            }`}
          >
            <span className="text-[10px] font-mono text-white/40 block mb-0.5">THE KEYBREAKER:</span>
            {villainLine}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question card */}
      <motion.div
        key={index}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_11%/0.9)] px-4 py-3 text-center"
      >
        <p className="text-sm font-bold text-white mb-0.5">{round.question}</p>
        <p className="text-xs text-white/45 leading-snug">{round.context}</p>
      </motion.div>

      {/* Scan flash */}
      <AnimatePresence>
        {scanAnim && (
          <motion.p
            key="scan"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[hsl(195_80%_60%)] font-mono text-xs font-bold tracking-widest text-center"
          >
            🔍 SCANNING SITES…
          </motion.p>
        )}
      </AnimatePresence>

      {/* Two site cards */}
      <div className="flex gap-2.5 w-full">
        {round.sites.map((site, i) => {
          const isPicked   = chosen === i;
          const isCorrect  = site.isReal;

          let borderCol = "border-white/10";
          let bgCol     = "bg-[hsl(210_40%_12%/0.85)]";
          if (isRevealed) {
            borderCol = isCorrect ? "border-green-500/55" : "border-red-500/45";
            bgCol     = isCorrect ? "bg-green-950/50" : "bg-red-950/40";
          } else if (isPicked) {
            borderCol = "border-[hsl(195_80%_50%/0.7)]";
          }

          return (
            <motion.button
              key={i}
              whileHover={!isRevealed ? { scale: 1.02, y: -2 } : {}}
              whileTap={!isRevealed ? { scale: 0.97 } : {}}
              animate={
                isRevealed && !isCorrect
                  ? { x: [-5, 5, -4, 4, -2, 2, 0] }
                  : isRevealed && isCorrect && isPicked
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ duration: 0.4 }}
              onClick={() => handlePick(i as 0 | 1)}
              disabled={isRevealed}
              className={`flex-1 rounded-2xl border-2 ${borderCol} ${bgCol} p-4 text-left transition-colors backdrop-blur-md`}
            >
              {/* Lock icon + label only after reveal */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="text-sm text-white/50">
                  {site.hasLock ? "🔒" : "🔓"}
                </span>
                {isRevealed && (
                  <span className={`text-[10px] font-bold uppercase tracking-wide ${site.hasLock ? "text-green-400" : "text-red-400"}`}>
                    {site.hasLock ? "Secure" : "Not Secure"}
                  </span>
                )}
              </div>

              {/* URL */}
              <div className="font-mono text-sm font-bold break-all leading-snug mb-1">
                {isRevealed && !site.isReal ? (
                  <span className="text-red-400 line-through">{site.url}</span>
                ) : (
                  <span className="text-[hsl(195_80%_60%)]">{site.url}</span>
                )}
              </div>

              <p className="text-white/55 text-xs">{site.name}</p>

              {isRevealed && !site.isReal && site.suspiciousNote && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-red-300/80 text-[10px] mt-2 font-bold"
                >
                  ⚠️ {site.suspiciousNote}
                </motion.p>
              )}

              {isRevealed && site.isReal && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 flex items-center gap-1"
                >
                  <span className="text-green-400 text-xs font-bold">✅ VERIFIED REAL</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Clue + next button */}
      <AnimatePresence>
        {isRevealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-2"
          >
            <div
              className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${
                (chosen !== null && round.sites[chosen].isReal)
                  ? "border-green-500/30 bg-green-950/40 text-green-200/80"
                  : "border-red-500/30 bg-red-950/40 text-red-200/80"
              }`}
            >
              <p className="font-bold mb-0.5">
                {timedOut
                  ? "⏰ Too slow! The Keybreaker got through!"
                  : chosen !== null && round.sites[chosen].isReal
                  ? "✅ Great detective work!"
                  : "❌ Caught by the Keybreaker's trap!"}
              </p>
              {chosen !== null && <p>{round.sites[chosen].clue}</p>}
              {(timedOut || (chosen !== null && !round.sites[chosen].isReal)) && (
                <p className="mt-1 text-white/50 italic">
                  The real site was:{" "}
                  <span className="font-mono font-bold text-green-400">
                    {round.sites.find(s => s.isReal)?.url}
                  </span>
                </p>
              )}
            </div>

            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-xl bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_42%)] text-white font-bold py-3 text-sm"
            >
              {index + 1 >= ROUNDS.length ? "See Results 🏆" : "Next Site →"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
