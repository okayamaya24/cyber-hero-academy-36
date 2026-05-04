/**
 * Strong or Smash — redesigned as a drag/swipe game.
 * Drag the password card RIGHT to lock it (STRONG) or LEFT to smash it (WEAK).
 * The Keybreaker reacts live — his health drains as you defend correctly.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

interface Props {
  onComplete: (stars: number) => void;
}

interface PasswordChallenge {
  password: string;
  isStrong: boolean;
  hint: string;
}

const WAVE_1: PasswordChallenge[] = [
  { password: "hello",         isStrong: false, hint: "Too short and no numbers or symbols!" },
  { password: "Ry@n#456!",     isStrong: true,  hint: "Uppercase + symbols + numbers = fortress!" },
  { password: "12345678",      isStrong: false, hint: "All numbers in order — first thing hackers try!" },
  { password: "K3y$m@ster!",   isStrong: true,  hint: "Mixed everything — the Keybreaker can't crack this!" },
  { password: "qwerty",        isStrong: false, hint: "Keyboard pattern — hackers know this one!" },
  { password: "B!ue$ky7Zap",   isStrong: true,  hint: "Random mix of everything — perfect!" },
];

const WAVE_2: PasswordChallenge[] = [
  { password: "iloveyou",       isStrong: false, hint: "Common phrase — cracks in under a second!" },
  { password: "Cr@ck3r!Hunt",   isStrong: true,  hint: "Long, mixed, unpredictable — uncrackable!" },
  { password: "123456",         isStrong: false, hint: "The most common password in the world!" },
  { password: "V0!canoPeak9#",  isStrong: true,  hint: "Uppercase + symbols + numbers — strong!" },
  { password: "dog",            isStrong: false, hint: "Three letters — cracked in milliseconds!" },
  { password: "L3m0n$quirrel!", isStrong: true,  hint: "Weird and long = impossible to guess!" },
];

const WAVES  = [WAVE_1, WAVE_2];
const TIMERS = [7, 5];

const VILLAIN_REACTS_HIT  = ["NOOO!", "Stop that!", "Impossible!", "Not again!", "HOW?!"];
const VILLAIN_REACTS_MISS = ["YES!", "Got you!", "Too slow!", "MINE!", "Ha!"];

const DRAG_THRESHOLD = 90;

/* ── Draggable password card ─────────────────────────────── */
function DragCard({
  challenge,
  timerDanger,
  shaking,
  onAnswer,
}: {
  challenge: PasswordChallenge;
  timerDanger: boolean;
  shaking: boolean;
  onAnswer: (strong: boolean) => void;
}) {
  const x        = useMotionValue(0);
  const rotate   = useTransform(x, [-200, 200], [-18, 18]);
  const opacity  = useTransform(x, [-250, 0, 250], [0.4, 1, 0.4]);

  // Zone highlight colours
  const leftGlow  = useTransform(x, [-180, 0],  [1, 0]);
  const rightGlow = useTransform(x, [0, 180],   [0, 1]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > DRAG_THRESHOLD)  { onAnswer(true);  return; }
    if (info.offset.x < -DRAG_THRESHOLD) { onAnswer(false); return; }
    // Snap back if not dragged far enough
    x.set(0);
  };

  return (
    <div className="relative w-full flex items-center justify-center select-none">

      {/* Left drop zone — SMASH */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none"
        style={{ opacity: leftGlow }}
      >
        <span className="text-3xl">💥</span>
        <span className="text-[10px] font-black text-red-400 tracking-widest">SMASH</span>
      </motion.div>

      {/* Right drop zone — STRONG */}
      <motion.div
        className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none"
        style={{ opacity: rightGlow }}
      >
        <span className="text-3xl">🔒</span>
        <span className="text-[10px] font-black text-green-400 tracking-widest">STRONG</span>
      </motion.div>

      {/* The draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        style={{ x, rotate, opacity }}
        onDragEnd={handleDragEnd}
        animate={shaking ? { x: [-10, 10, -8, 8, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="w-full max-w-xs rounded-2xl border-2 border-white/10 bg-[hsl(210_40%_10%/0.98)] p-7 text-center cursor-grab active:cursor-grabbing relative overflow-hidden touch-none"
      >
        {timerDanger && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-red-500/60"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.45 }}
          />
        )}
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-3">
          — drag to judge —
        </p>
        <p className="font-mono text-xl font-bold tracking-wider text-[hsl(195_80%_65%)] break-all leading-snug">
          {challenge.password}
        </p>
        <p className="text-[10px] text-white/20 mt-3">← SMASH &nbsp;&nbsp; STRONG →</p>
      </motion.div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
export default function StrongOrSmash({ onComplete }: Props) {
  const [wave, setWave]               = useState(0);
  const [index, setIndex]             = useState(0);
  const [score, setScore]             = useState(0);
  const [streak, setStreak]           = useState(0);
  const [mistakes, setMistakes]       = useState(0);
  const [hearts, setHearts]           = useState(3);
  const [timeLeft, setTimeLeft]       = useState(TIMERS[0]);
  const [feedback, setFeedback]       = useState<{ correct: boolean; wasStrong: boolean; hint: string; timeout?: boolean } | null>(null);
  const [shakeCard, setShakeCard]     = useState(false);
  const [villainHp, setVillainHp]     = useState(100);
  const [villainText, setVillainText] = useState("...");
  const [showWaveEnd, setShowWaveEnd] = useState(false);
  const [waveStars, setWaveStars]     = useState<number[]>([]);
  const [gameOver, setGameOver]       = useState(false);
  const [cardKey, setCardKey]         = useState(0);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxTime     = TIMERS[wave];
  const currentWave = WAVES[wave];
  const current     = currentWave?.[index];

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const advance = useCallback(() => {
    if (index + 1 >= currentWave.length) {
      const wStars = mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1;
      setWaveStars((p) => [...p, wStars]);
      setShowWaveEnd(true);
    } else {
      setIndex((i) => i + 1);
      setCardKey((k) => k + 1);
      setTimeLeft(maxTime);
    }
  }, [index, currentWave, mistakes, maxTime]);

  const handleAnswer = useCallback(
    (answeredStrong: boolean) => {
      if (feedback || showWaveEnd || gameOver) return;
      clearTimer();

      const correct    = answeredStrong === current.isStrong;
      const newStreak  = correct ? streak + 1 : 0;
      const hpDelta    = correct ? -(100 / (WAVE_1.length * WAVES.length)) : 0;

      if (correct) {
        setScore((s) => s + 1);
        setStreak(newStreak);
        setVillainHp((h) => Math.max(0, h + hpDelta));
        setVillainText(VILLAIN_REACTS_HIT[Math.floor(Math.random() * VILLAIN_REACTS_HIT.length)]);
      } else {
        setStreak(0);
        setMistakes((m) => m + 1);
        setHearts((h) => Math.max(0, h - 1));
        setShakeCard(true);
        setTimeout(() => setShakeCard(false), 400);
        setVillainText(VILLAIN_REACTS_MISS[Math.floor(Math.random() * VILLAIN_REACTS_MISS.length)]);
      }

      setFeedback({ correct, wasStrong: current.isStrong, hint: current.hint });
      feedbackRef.current = setTimeout(() => {
        setFeedback(null);
        advance();
      }, 1800);
    },
    [feedback, showWaveEnd, gameOver, clearTimer, current, streak, advance]
  );

  // Countdown timer
  useEffect(() => {
    if (feedback || showWaveEnd || gameOver) return;
    clearTimer();
    setTimeLeft(maxTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.05) {
          clearTimer();
          setMistakes((m) => m + 1);
          setHearts((h) => Math.max(0, h - 1));
          setStreak(0);
          setShakeCard(true);
          setTimeout(() => setShakeCard(false), 400);
          setVillainText(VILLAIN_REACTS_MISS[Math.floor(Math.random() * VILLAIN_REACTS_MISS.length)]);
          setFeedback({ correct: false, wasStrong: current?.isStrong ?? false, hint: current?.hint ?? "", timeout: true });
          feedbackRef.current = setTimeout(() => {
            setFeedback(null);
            advance();
          }, 1800);
          return 0;
        }
        return t - 0.05;
      });
    }, 50);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, wave, showWaveEnd, gameOver]);

  useEffect(() => () => {
    clearTimer();
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
  }, [clearTimer]);

  const handleNextWave = () => {
    if (wave + 1 >= WAVES.length) {
      setGameOver(true);
      const avg = Math.round(waveStars.reduce((a, b) => a + b, 0) / waveStars.length);
      setTimeout(() => onComplete(avg), 900);
      return;
    }
    setWave((w) => w + 1);
    setIndex(0);
    setCardKey((k) => k + 1);
    setMistakes(0);
    setStreak(0);
    setShowWaveEnd(false);
    setTimeLeft(TIMERS[wave + 1]);
  };

  /* ── Game over ──────────────────────────────────────────── */
  if (gameOver) {
    const avg = Math.round(waveStars.reduce((a, b) => a + b, 0) / waveStars.length);
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: 2, duration: 0.4 }}
          className="text-6xl"
        >
          🏆
        </motion.div>
        <h2 className="text-2xl font-black text-white">The Keybreaker Retreats!</h2>
        <div className="text-4xl tracking-wide">{"⭐".repeat(avg)}{"☆".repeat(3 - avg)}</div>
        <p className="text-white/50 text-sm">{score} passwords defended correctly</p>
      </motion.div>
    );
  }

  /* ── Wave end ───────────────────────────────────────────── */
  if (showWaveEnd) {
    const stars = waveStars[waveStars.length - 1];
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 py-8 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: 2, duration: 0.5 }}
          className="text-5xl"
        >🛡️</motion.div>
        <h2 className="text-xl font-bold text-white">Wave {wave + 1} Cleared!</h2>
        <div className="text-3xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</div>
        <p className="text-sm text-white/40">{mistakes} mistake{mistakes !== 1 ? "s" : ""}</p>
        <motion.button
          onClick={handleNextWave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          className="mt-2 rounded-xl bg-[hsl(195_80%_50%)] text-white font-bold px-8 py-3 text-sm"
        >
          {wave + 1 >= WAVES.length ? "See Results 🏆" : "Next Wave →"}
        </motion.button>
      </motion.div>
    );
  }

  const pct         = (timeLeft / maxTime) * 100;
  const timerColor  = pct > 55 ? "hsl(195,80%,50%)" : pct > 25 ? "hsl(40,90%,55%)" : "hsl(0,80%,55%)";
  const timerDanger = pct <= 25;
  const villainAnger = villainHp > 66 ? "😤" : villainHp > 33 ? "😠" : "🤬";

  return (
    <div className="flex flex-col items-center gap-3 py-2 px-3 max-w-sm mx-auto w-full">

      {/* Header row */}
      <div className="flex items-center justify-between w-full">
        <span className="text-[10px] font-mono text-white/35 uppercase tracking-wide">Wave {wave + 1}/{WAVES.length}</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.span
              key={i}
              animate={i === hearts && hearts < 3 ? { scale: [1.6, 1] } : {}}
              className={`text-sm transition-all ${i < hearts ? "" : "opacity-15 grayscale"}`}
            >❤️</motion.span>
          ))}
        </div>
        <span className="text-[10px] font-mono text-white/35">{index + 1}/{currentWave.length}</span>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full transition-colors"
          style={{ width: `${pct}%`, backgroundColor: timerColor }}
          animate={timerDanger ? { opacity: [1, 0.3, 1] } : {}}
          transition={timerDanger ? { repeat: Infinity, duration: 0.4 } : {}}
        />
      </div>

      {/* Villain panel */}
      <div className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2 flex items-center gap-3">
        <motion.span
          className="text-2xl"
          animate={villainText !== "..." ? { scale: [1, 1.3, 1], rotate: [-5, 5, 0] } : {}}
          transition={{ duration: 0.3 }}
          key={villainText}
        >
          {villainAnger}
        </motion.span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">The Keybreaker</span>
            <span className="text-[9px] font-mono text-white/30">{Math.round(villainHp)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[hsl(0_75%_50%)]"
              animate={{ width: `${villainHp}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={villainText}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-bold text-[hsl(0_70%_65%)] w-12 text-right leading-tight"
          >
            {villainText}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Streak badge */}
      <AnimatePresence>
        {streak >= 2 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="rounded-full bg-[hsl(45_90%_55%/0.15)] border border-[hsl(45_90%_55%/0.4)] px-3 py-1"
          >
            <span className="text-[11px] font-black text-[hsl(45_90%_65%)]">
              🔥 {streak} IN A ROW!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card area */}
      <div className="w-full min-h-[140px] flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {!feedback ? (
            <motion.div
              key={`card-${wave}-${cardKey}`}
              initial={{ x: 80, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="w-full"
            >
              <DragCard
                challenge={current}
                timerDanger={timerDanger}
                shaking={shakeCard}
                onAnswer={handleAnswer}
              />
            </motion.div>
          ) : (
            <motion.div
              key="feedback"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`w-full rounded-2xl border-2 p-5 text-center ${
                feedback.correct
                  ? "border-green-500/50 bg-green-950/70"
                  : "border-red-500/50 bg-red-950/70"
              }`}
            >
              <motion.div
                animate={{ scale: [0.4, 1.4, 1] }}
                transition={{ duration: 0.4 }}
                className="text-4xl mb-1"
              >
                {feedback.timeout ? "⏰" : feedback.correct ? (feedback.wasStrong ? "🔒" : "💥") : "❌"}
              </motion.div>
              <p className="text-white font-bold text-sm">
                {feedback.timeout ? "Time's up!" : feedback.correct ? "Correct!" : "Wrong!"}
              </p>
              <p className="text-white/55 text-xs mt-1 leading-relaxed">{feedback.hint}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tap buttons (visible fallback for desktop + accessibility) */}
      <AnimatePresence>
        {!feedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 w-full"
          >
            <motion.button
              onClick={() => handleAnswer(false)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.92 }}
              className="flex-1 rounded-xl bg-red-800/70 hover:bg-red-700 border border-red-600/30 text-white font-black py-4 text-sm tracking-wide"
            >
              💥 SMASH
            </motion.button>
            <motion.button
              onClick={() => handleAnswer(true)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.92 }}
              className="flex-1 rounded-xl bg-green-800/70 hover:bg-green-700 border border-green-600/30 text-white font-black py-4 text-sm tracking-wide"
            >
              🔒 STRONG
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[9px] text-white/20 text-center">Drag the card ← or → to judge it</p>
    </div>
  );
}
