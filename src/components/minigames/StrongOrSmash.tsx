/**
 * Strong or Smash — Zone 1 Mini-Game 2
 * Quick-fire timed game: passwords flash up, decide STRONG or SMASH fast!
 * The Keybreaker is attacking — no time to think!
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onComplete: (stars: number) => void;
}

interface PasswordChallenge {
  password: string;
  isStrong: boolean;
}

const WAVE_1: PasswordChallenge[] = [
  { password: "hello",          isStrong: false },
  { password: "Ry@n#456!",      isStrong: true  },
  { password: "12345678",       isStrong: false  },
  { password: "K3y$m@ster!",    isStrong: true  },
  { password: "qwerty",         isStrong: false },
  { password: "B!ue$ky7Zap",    isStrong: true  },
];

const WAVE_2: PasswordChallenge[] = [
  { password: "iloveyou",        isStrong: false },
  { password: "Cr@ck3r!Hunt",    isStrong: true  },
  { password: "123456",          isStrong: false },
  { password: "V0!canoPeak9#",   isStrong: true  },
  { password: "dog",             isStrong: false },
  { password: "L3m0n$quirrel!",  isStrong: true  },
];

const WAVES   = [WAVE_1, WAVE_2];
const TIMERS  = [6, 5]; // seconds per password

const VILLAIN_ATTACKS = ["💻 ATTACK WAVE INCOMING!", "🔑 I'M BREAKING THROUGH!", "⚡ TOO SLOW, GUARDIAN!", "🏴‍☠️ YOUR PASSWORDS ARE MINE!"];
const VILLAIN_BLOCKED = ["🛡️ Attack blocked!", "✅ The Keybreaker bounces off!", "⚡ Defended!", "💪 Not today, villain!"];

export default function StrongOrSmash({ onComplete }: Props) {
  const [wave, setWave]             = useState(0);
  const [index, setIndex]           = useState(0);
  const [score, setScore]           = useState(0);
  const [streak, setStreak]         = useState(0);
  const [mistakes, setMistakes]     = useState(0);
  const [hearts, setHearts]         = useState(3);
  const [timeLeft, setTimeLeft]     = useState(TIMERS[0]);
  const [feedback, setFeedback]     = useState<{ correct: boolean; wasStrong: boolean; timeout?: boolean } | null>(null);
  const [flash, setFlash]           = useState<"green" | "red" | null>(null);
  const [shakeCard, setShakeCard]   = useState(false);
  const [showWaveEnd, setShowWaveEnd] = useState(false);
  const [waveStars, setWaveStars]   = useState<number[]>([]);
  const [gameOver, setGameOver]     = useState(false);
  const [statusMsg, setStatusMsg]   = useState("");

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxTime      = TIMERS[wave];
  const currentWave  = WAVES[wave];
  const current      = currentWave?.[index];

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const advance = useCallback(() => {
    if (index + 1 >= currentWave.length) {
      const wStars = mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1;
      setWaveStars((prev) => [...prev, wStars]);
      setShowWaveEnd(true);
    } else {
      setIndex((i) => i + 1);
      setTimeLeft(maxTime);
    }
  }, [index, currentWave, mistakes, maxTime]);

  const handleAnswer = useCallback(
    (answeredStrong: boolean) => {
      if (feedback || showWaveEnd || gameOver) return;
      clearTimer();
      const correct = answeredStrong === current.isStrong;
      const newStreak = correct ? streak + 1 : 0;

      setFlash(correct ? "green" : "red");
      setTimeout(() => setFlash(null), 350);

      if (correct) {
        setScore((s) => s + 1);
        setStreak(newStreak);
        setStatusMsg(newStreak >= 3
          ? `🔥 ${newStreak} IN A ROW!`
          : VILLAIN_BLOCKED[Math.floor(Math.random() * VILLAIN_BLOCKED.length)]);
      } else {
        setStreak(0);
        setMistakes((m) => m + 1);
        setHearts((h) => Math.max(0, h - 1));
        setShakeCard(true);
        setTimeout(() => setShakeCard(false), 500);
        setStatusMsg(VILLAIN_ATTACKS[Math.floor(Math.random() * VILLAIN_ATTACKS.length)]);
      }

      setFeedback({ correct, wasStrong: current.isStrong });
      feedbackRef.current = setTimeout(() => {
        setFeedback(null);
        advance();
      }, 1300);
    },
    [feedback, showWaveEnd, gameOver, clearTimer, current, streak, advance]
  );

  // Timer
  useEffect(() => {
    if (feedback || showWaveEnd || gameOver) return;
    clearTimer();
    setTimeLeft(maxTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearTimer();
          setMistakes((m) => m + 1);
          setHearts((h) => Math.max(0, h - 1));
          setStreak(0);
          setShakeCard(true);
          setTimeout(() => setShakeCard(false), 500);
          setFlash("red");
          setTimeout(() => setFlash(null), 350);
          setStatusMsg("⏰ TOO SLOW! The Keybreaker slips through!");
          setFeedback({ correct: false, wasStrong: current?.isStrong ?? false, timeout: true });
          feedbackRef.current = setTimeout(() => {
            setFeedback(null);
            advance();
          }, 1300);
          return 0;
        }
        return t - 0.05;
      });
    }, 50);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, wave, showWaveEnd, gameOver]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (feedbackRef.current) clearTimeout(feedbackRef.current);
    };
  }, [clearTimer]);

  const handleNextWave = () => {
    if (wave + 1 >= WAVES.length) {
      setGameOver(true);
      const avg = Math.round(waveStars.reduce((a, b) => a + b, 0) / waveStars.length);
      setTimeout(() => onComplete(avg), 1000);
      return;
    }
    setWave((w) => w + 1);
    setIndex(0);
    setMistakes(0);
    setStreak(0);
    setShowWaveEnd(false);
  };

  if (gameOver) {
    const avg = Math.round(waveStars.reduce((a, b) => a + b, 0) / waveStars.length);
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ repeat: 3, duration: 0.3 }}
          className="text-5xl"
        >
          🏆
        </motion.div>
        <h2 className="text-2xl font-black text-white">All Waves Defeated!</h2>
        <div className="text-3xl">{"⭐".repeat(avg)}{"☆".repeat(3 - avg)}</div>
        <p className="text-white/60 text-sm">
          {score} passwords defended — the Keybreaker retreats!
        </p>
      </motion.div>
    );
  }

  if (showWaveEnd) {
    const stars = waveStars[waveStars.length - 1];
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: 3, duration: 0.5 }}
          className="text-5xl"
        >
          🛡️
        </motion.div>
        <h2 className="text-xl font-bold text-white">Wave {wave + 1} Repelled!</h2>
        <div className="text-3xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</div>
        <p className="text-sm text-white/50">{mistakes} mistake{mistakes !== 1 ? "s" : ""}</p>
        <motion.button
          onClick={handleNextWave}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="mt-2 rounded-xl bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_42%)] text-white font-bold px-8 py-3"
        >
          {wave + 1 >= WAVES.length ? "See Results 🏆" : "Next Wave →"}
        </motion.button>
      </motion.div>
    );
  }

  const pct = (timeLeft / maxTime) * 100;
  const timerColor = pct > 50 ? "hsl(195,80%,50%)" : pct > 25 ? "hsl(40,90%,55%)" : "hsl(0,80%,55%)";
  const timerDanger = pct <= 25;

  return (
    <div className="flex flex-col items-center gap-3 py-2 px-2 max-w-md mx-auto w-full relative">
      {/* Full-screen flash */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: flash === "green" ? "rgba(0,255,100,0.1)" : "rgba(255,50,50,0.15)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-mono text-white/40">WAVE {wave + 1}/2</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              animate={i === hearts && hearts < 3 ? { scale: [1.5, 1] } : {}}
              className={`text-base transition-all ${i < hearts ? "" : "opacity-15 grayscale"}`}
            >
              ❤️
            </motion.span>
          ))}
        </div>
        <span className="text-xs font-mono text-white/40">{index + 1}/{currentWave.length}</span>
      </div>

      {/* Timer bar */}
      <div className="w-full h-3 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: timerColor }}
          animate={timerDanger ? { opacity: [1, 0.4, 1] } : {}}
          transition={timerDanger ? { repeat: Infinity, duration: 0.4 } : {}}
        />
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={statusMsg}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`text-xs font-bold text-center ${
            statusMsg.startsWith("🛡️") || statusMsg.startsWith("✅") || statusMsg.startsWith("⚡") || statusMsg.startsWith("💪") || statusMsg.startsWith("🔥")
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {statusMsg || <span className="text-white/30">Defend each password!</span>}
        </motion.div>
      </AnimatePresence>

      {/* Password card / feedback */}
      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div
            key={`${wave}-${index}`}
            initial={{ x: 60, opacity: 0 }}
            animate={shakeCard
              ? { x: [-8, 8, -6, 6, 0], opacity: 1 }
              : { x: 0, opacity: 1 }
            }
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.22, type: "tween" }}
            className="w-full rounded-2xl border-2 border-white/10 bg-[hsl(210_40%_10%/0.95)] p-8 text-center backdrop-blur-md relative overflow-hidden"
          >
            {/* Danger pulse when timer low */}
            {timerDanger && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-red-500/50"
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              />
            )}
            <p className="text-xs font-mono text-white/25 uppercase tracking-widest mb-2">
              — is this password safe? —
            </p>
            <p className="font-mono text-2xl font-bold tracking-widest text-[hsl(195_80%_60%)] break-all">
              {current?.password}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className={`w-full rounded-2xl border-2 p-5 text-center ${
              feedback.correct
                ? "border-green-500/50 bg-green-950/60"
                : "border-red-500/50 bg-red-950/60"
            }`}
          >
            <motion.div
              animate={{ scale: [0.5, 1.3, 1] }}
              transition={{ duration: 0.35 }}
              className="text-3xl mb-1"
            >
              {feedback.timeout ? "⏰" : feedback.correct ? (feedback.wasStrong ? "🔒" : "💥") : "❌"}
            </motion.div>
            <p className="text-white font-bold">
              {feedback.timeout ? "Time's up!" : feedback.correct ? "Correct!" : "Wrong!"}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {feedback.timeout
                ? `It was ${feedback.wasStrong ? "STRONG 🔒" : "WEAK 💥"} — too slow!`
                : `That was ${feedback.wasStrong ? "STRONG 🔒" : "WEAK 💥"}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer buttons */}
      <AnimatePresence>
        {!feedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 w-full"
          >
            <motion.button
              onClick={() => handleAnswer(true)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.93 }}
              className="flex-1 rounded-xl bg-green-700 hover:bg-green-600 text-white font-black text-base py-7 tracking-wide shadow-lg shadow-green-900/40"
            >
              🔒<br/>
              <span className="text-sm font-bold">STRONG</span>
            </motion.button>
            <motion.button
              onClick={() => handleAnswer(false)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.93 }}
              className="flex-1 rounded-xl bg-red-700 hover:bg-red-600 text-white font-black text-base py-7 tracking-wide shadow-lg shadow-red-900/40"
            >
              💥<br/>
              <span className="text-sm font-bold">SMASH</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
