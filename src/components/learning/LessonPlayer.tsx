/**
 * LessonPlayer — Story Mission Briefing + Comic Strip style
 * Fun, engaging lesson player for K-5 kids.
 * Each lesson feels like a game cutscene / comic strip.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Star } from "lucide-react";
import type { LessonContent, LessonSlide } from "@/data/lessonContent";
import PasswordAttentionGame from "@/components/learning/games/PasswordAttentionGame";
import PasswordStrengthTesterGame from "@/components/minigames/PasswordStrengthTesterGame";
import PasswordFixerGame from "@/components/minigames/PasswordFixerGame";
import PhishingSwipeGame from "@/components/learning/games/PhishingSwipeGame";
import UrlDetectiveGame from "@/components/learning/games/UrlDetectiveGame";
import InfoShieldSortGame from "@/components/learning/games/InfoShieldSortGame";
import MalwareMonsterGame from "@/components/learning/games/MalwareMonsterGame";

interface Props {
  lesson: LessonContent;
  onStartQuiz: () => void;
  onClose: () => void;
}

/* ── Confetti particle ── */
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ["#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#f97316"][i % 6],
    delay: Math.random() * 0.4,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: -12, width: p.size, height: p.size, backgroundColor: p.color }}
          initial={{ y: -20, rotate: p.rotate, opacity: 1 }}
          animate={{ y: 520, rotate: p.rotate + 360, opacity: [1, 1, 0] }}
          transition={{ duration: 1.6, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/* ── Character themes ── */
const CHAR_THEMES: Record<string, {
  bg: string; accent: string; bubble: string; villainName: string; villainEmoji: string; alertText: string;
}> = {
  "Captain Cyber": {
    bg: "from-[#1a0533] via-[#2d0a5a] to-[#1a0533]",
    accent: "#a855f7",
    bubble: "bg-purple-900/80 border-purple-400/40",
    villainName: "The Password Phantom",
    villainEmoji: "👻",
    alertText: "SECURITY BREACH DETECTED!",
  },
  "Detective Whiskers": {
    bg: "from-[#2d1500] via-[#5c2a00] to-[#2d1500]",
    accent: "#f59e0b",
    bubble: "bg-amber-900/80 border-amber-400/40",
    villainName: "The Phish King",
    villainEmoji: "🎣",
    alertText: "SCAM ALERT INCOMING!",
  },
  "Professor Hoot": {
    bg: "from-[#002020] via-[#003d3d] to-[#002020]",
    accent: "#14b8a6",
    bubble: "bg-teal-900/80 border-teal-400/40",
    villainName: "The Data Thief",
    villainEmoji: "🕵️",
    alertText: "PRIVACY THREAT DETECTED!",
  },
  "Robo Buddy": {
    bg: "from-[#001a2d] via-[#003352] to-[#001a2d]",
    accent: "#06b6d4",
    bubble: "bg-cyan-900/80 border-cyan-400/40",
    villainName: "Malware Max",
    villainEmoji: "🦠",
    alertText: "VIRUS THREAT DETECTED!",
  },
};

/* ── Progress bar ── */
function ProgressBar({ total, current, accent }: { total: number; current: number; accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accent }}
          animate={{ width: `${((current + 1) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <span className="text-[10px] font-bold text-white/40">{current + 1}/{total}</span>
    </div>
  );
}

/* ── SLIDE: Mission Alert (Intro) ── */
function IntroSlide({ slide, lesson, theme, onNext }: {
  slide: LessonSlide; lesson: LessonContent;
  theme: typeof CHAR_THEMES[string]; onNext: () => void;
}) {
  const [phase, setPhase] = useState<"alert" | "hero">("alert");

  useEffect(() => {
    const t = setTimeout(() => setPhase("hero"), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center gap-5 py-6 min-h-[380px]">
      <AnimatePresence mode="wait">
        {phase === "alert" ? (
          <motion.div
            key="alert"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              className="text-6xl"
            >
              {theme.villainEmoji}
            </motion.div>
            <div className="rounded-2xl border-2 px-5 py-3" style={{ borderColor: theme.accent }}>
              <p className="text-xs font-extrabold tracking-[0.2em] mb-1" style={{ color: theme.accent }}>
                ⚠️ {theme.alertText}
              </p>
              <p className="text-white font-black text-lg">{theme.villainName} is attacking!</p>
            </div>
            <p className="text-white/50 text-xs animate-pulse">Calling in backup…</p>
          </motion.div>
        ) : (
          <motion.div
            key="hero"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className={`w-20 h-20 rounded-3xl ${lesson.characterColor} flex items-center justify-center text-5xl shadow-2xl`}
              style={{ boxShadow: `0 0 40px ${theme.accent}55` }}
            >
              {lesson.characterEmoji}
            </motion.div>
            <div>
              <p className="text-xs font-extrabold mb-1" style={{ color: theme.accent }}>
                {lesson.character} here! 👊
              </p>
              <h1 className="text-2xl font-black text-white leading-tight mb-2">
                {slide.headline}
              </h1>
              <p className="text-white/60 text-sm max-w-xs leading-relaxed">{slide.subtext}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              onClick={onNext}
              className="mt-2 rounded-2xl px-8 py-3 font-black text-white text-sm shadow-xl"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)` }}
            >
              Let's go! →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── SLIDE: Comic Panel (Learn) ── */
function LearnSlide({ slide, lesson, theme }: {
  slide: LessonSlide; lesson: LessonContent;
  theme: typeof CHAR_THEMES[string];
}) {
  return (
    <div className="flex flex-col gap-4 py-3 min-h-[380px]">
      {/* Character + speech bubble */}
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className={`w-14 h-14 rounded-2xl ${lesson.characterColor} flex items-center justify-center text-3xl flex-shrink-0 shadow-lg`}
          style={{ boxShadow: `0 0 20px ${theme.accent}44` }}
        >
          {lesson.characterEmoji}
        </motion.div>
        {/* Bubble */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`relative flex-1 rounded-2xl rounded-tl-sm border p-3.5 ${theme.bubble}`}
        >
          <p className="text-[11px] font-extrabold mb-0.5" style={{ color: theme.accent }}>
            {lesson.character} says:
          </p>
          <p className="text-white font-black text-sm leading-snug">{slide.title}</p>
        </motion.div>
      </div>

      {/* Content panel — comic style */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5"
          style={{ background: `${theme.accent}18` }}>
          <span className="text-3xl">{slide.icon}</span>
          <p className="font-black text-white text-sm">{slide.title}</p>
        </div>
        <div className="px-4 py-4">
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{slide.body}</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ── SLIDE: Tip (Speech bubble from character) ── */
function TipSlide({ slide, lesson, theme }: {
  slide: LessonSlide; lesson: LessonContent;
  theme: typeof CHAR_THEMES[string];
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 min-h-[380px] justify-center">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
        className={`w-20 h-20 rounded-3xl ${lesson.characterColor} flex items-center justify-center text-4xl shadow-2xl`}
        style={{ boxShadow: `0 0 30px ${theme.accent}55` }}
      >
        {lesson.characterEmoji}
      </motion.div>

      {/* Giant speech bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative w-full"
      >
        <div className="absolute -top-4 left-8 text-2xl">💬</div>
        <div className="rounded-3xl rounded-tl-sm border-2 p-5 mt-2"
          style={{ borderColor: theme.accent, background: `${theme.accent}18` }}>
          <p className="text-[10px] font-extrabold uppercase tracking-widest mb-2" style={{ color: theme.accent }}>
            ⚡ Pro Tip from {lesson.character}
          </p>
          <p className="text-white font-bold text-sm leading-relaxed">{slide.tipText}</p>
        </div>
      </motion.div>
    </div>
  );
}

/* ── SLIDE: Interactive Check (Spot the Danger) ── */
function CheckSlide({ slide, lesson, theme, onAnswer }: {
  slide: LessonSlide; lesson: LessonContent;
  theme: typeof CHAR_THEMES[string];
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const choices = slide.choices ?? [];

  const handlePick = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = choices[idx].correct;
    if (correct) {
      setShowConfetti(true);
      setTimeout(() => onAnswer(true), 1600);
    } else {
      setTimeout(() => onAnswer(false), 2200);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-3 min-h-[380px] relative">
      {showConfetti && <Confetti />}

      {/* Character prompt */}
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl ${lesson.characterColor} flex items-center justify-center text-2xl flex-shrink-0`}>
          {lesson.characterEmoji}
        </div>
        <div className={`flex-1 rounded-xl rounded-tl-sm border p-3 ${theme.bubble}`}>
          <p className="text-[10px] font-extrabold mb-0.5" style={{ color: theme.accent }}>
            🕵️ QUICK CHALLENGE
          </p>
          <p className="text-white font-black text-sm leading-snug">{slide.question}</p>
        </div>
      </div>

      {/* Choices */}
      <div className="grid gap-2">
        {choices.map((choice, idx) => {
          const isPicked = selected === idx;
          const isCorrect = isPicked && choice.correct;
          const isWrong = isPicked && !choice.correct;
          const revealCorrect = selected !== null && choice.correct && !isPicked;

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.07 }}
              whileHover={selected === null ? { x: 4 } : {}}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              onClick={() => handlePick(idx)}
              disabled={selected !== null}
              className={`w-full text-left rounded-2xl border-2 p-3.5 transition-all ${
                isCorrect   ? "border-green-400 bg-green-500/20" :
                isWrong     ? "border-red-400 bg-red-500/15" :
                revealCorrect ? "border-green-400/50 bg-green-500/10" :
                selected !== null ? "border-white/5 bg-white/3 opacity-40" :
                "border-white/10 bg-white/5 hover:border-white/25"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  isCorrect ? "border-green-400 bg-green-500 text-white" :
                  isWrong   ? "border-red-400 bg-red-500 text-white" :
                  revealCorrect ? "border-green-400 text-green-400" :
                  "border-white/20 text-white/40"
                }`}>
                  {isCorrect ? "✓" : isWrong ? "✗" : ["A","B","C","D"][idx]}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${isCorrect ? "text-green-300" : isWrong ? "text-red-300" : "text-white"}`}>
                    {choice.text}
                  </p>
                  {isPicked && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`text-xs mt-1 font-medium ${isCorrect ? "text-green-400" : "text-red-300"}`}
                    >
                      {isCorrect ? "🎉 " : "💡 "}{choice.feedback}
                    </motion.p>
                  )}
                </div>
                {isCorrect && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.7 }}
                    className="text-2xl"
                  >
                    ⭐
                  </motion.span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ── SLIDE: Trophy / Summary ── */
function SummarySlide({ slide, lesson, theme, onStartQuiz }: {
  slide: LessonSlide; lesson: LessonContent;
  theme: typeof CHAR_THEMES[string]; onStartQuiz: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowAll(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div className="flex flex-col gap-4 py-3 min-h-[380px]">
      {/* Trophy header */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.6 }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <div className="text-5xl">🏆</div>
        <h2 className="text-xl font-black text-white">Lesson Complete!</h2>
        <p className="text-sm" style={{ color: theme.accent }}>You're ready to take on the quiz</p>
      </motion.div>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex justify-center gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4 + i * 0.15, type: "spring", bounce: 0.7 }}
          >
            <Star className="h-8 w-8 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
          </motion.div>
        ))}
      </motion.div>

      {/* Key points */}
      {showAll && (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/5" style={{ background: `${theme.accent}18` }}>
            <p className="text-xs font-extrabold" style={{ color: theme.accent }}>
              📋 Remember these key points:
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {(slide.takeaways ?? []).map((point, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.08 }}
                className="flex items-start gap-2.5 px-4 py-2.5"
              >
                <span className="text-sm mt-0.5">✅</span>
                <p className="text-xs text-white/80 font-medium leading-snug">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={onStartQuiz}
        className="w-full rounded-2xl py-4 font-black text-white text-base shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}88)`,
          boxShadow: `0 8px 30px ${theme.accent}55`,
        }}
      >
        {slide.quizLabel ?? "Start the Quiz!"} →
      </motion.button>
      <p className="text-center text-[11px] text-white/30 font-medium -mt-1">
        Complete the quiz to earn your badge 🏅
      </p>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN LESSON PLAYER
══════════════════════════════════ */
export default function LessonPlayer({ lesson, onStartQuiz, onClose }: Props) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [waitForCheck, setWaitForCheck] = useState(false);

  const theme = CHAR_THEMES[lesson.character] ?? CHAR_THEMES["Captain Cyber"];
  const slides = lesson.slides;
  const slide = slides[slideIdx];
  const isLast = slideIdx === slides.length - 1;
  const isFirst = slideIdx === 0;
  const isIntro = slide.type === "intro";
  const isCheck = slide.type === "check";
  const isGame = slide.type === "game";
  const isSummary = slide.type === "summary";

  const goNext = () => {
    setDirection(1);
    setSlideIdx((i) => i + 1);
    setWaitForCheck(false);
  };

  const goPrev = () => {
    if (isFirst) return;
    setDirection(-1);
    setSlideIdx((i) => i - 1);
    setWaitForCheck(false);
  };

  const handleCheckAnswer = (correct: boolean) => {
    setTimeout(goNext, correct ? 800 : 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}>

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className={`relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col bg-gradient-to-b ${theme.bg}`}
        style={{ maxHeight: "92vh", border: `1px solid ${theme.accent}33` }}
      >
        {/* Glow effect */}
        <div className="pointer-events-none absolute inset-0"
          style={{ boxShadow: `inset 0 0 60px ${theme.accent}18` }} />

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-xl ${lesson.characterColor} flex items-center justify-center text-sm`}>
              {lesson.characterEmoji}
            </div>
            <span className="text-[11px] font-extrabold" style={{ color: theme.accent }}>
              {lesson.character}
            </span>
          </div>
          <button onClick={onClose}
            className="rounded-full p-1.5 text-white/30 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 pb-3 flex-shrink-0 relative z-10">
          <ProgressBar total={slides.length} current={slideIdx} accent={theme.accent} />
        </div>

        {/* Slide content */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 relative z-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slideIdx}
              custom={direction}
              initial={{ x: direction * 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -50, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isIntro && (
                <IntroSlide slide={slide} lesson={lesson} theme={theme} onNext={goNext} />
              )}
              {slide.type === "learn" && (
                <LearnSlide slide={slide} lesson={lesson} theme={theme} />
              )}
              {slide.type === "tip" && (
                <TipSlide slide={slide} lesson={lesson} theme={theme} />
              )}
              {isCheck && (
                <CheckSlide slide={slide} lesson={lesson} theme={theme} onAnswer={handleCheckAnswer} />
              )}
              {isSummary && (
                <SummarySlide slide={slide} lesson={lesson} theme={theme} onStartQuiz={onStartQuiz} />
              )}
              {isGame && slide.gameType === "password-attention" && (
                <PasswordAttentionGame onComplete={() => goNext()} />
              )}
              {isGame && slide.gameType === "password-strength-tester" && (
                <PasswordStrengthTesterGame
                  ageTier="defender"
                  guideImage={lesson.characterEmoji}
                  guideName={lesson.character}
                  onComplete={() => goNext()}
                />
              )}
              {isGame && slide.gameType === "password-fixer" && (
                <PasswordFixerGame
                  ageTier="defender"
                  guideImage={lesson.characterEmoji}
                  guideName={lesson.character}
                  onComplete={() => goNext()}
                />
              )}
              {isGame && slide.gameType === "phishing-swipe" && (
                <PhishingSwipeGame onComplete={() => goNext()} />
              )}
              {isGame && slide.gameType === "url-detective" && (
                <UrlDetectiveGame onComplete={() => goNext()} />
              )}
              {isGame && slide.gameType === "info-shield-sort" && (
                <InfoShieldSortGame onComplete={() => goNext()} />
              )}
              {isGame && slide.gameType === "malware-monster-match" && (
                <MalwareMonsterGame onComplete={() => goNext()} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom nav — hidden on intro, summary, check, and game slides (all have their own CTAs) */}
        {!isIntro && !isSummary && !isCheck && !isGame && (
          <div className="flex items-center justify-between px-4 py-4 flex-shrink-0 relative z-10"
            style={{ borderTop: `1px solid ${theme.accent}18` }}>
            <button
              onClick={goPrev}
              disabled={isFirst}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white/40 hover:text-white hover:bg-white/8 transition-colors disabled:opacity-0"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={goNext}
              disabled={isLast}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-extrabold text-white"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}99)` }}
            >
              Next <ChevronRight className="h-4 w-4" />
            </motion.button>
          </div>
        )}

        {/* Check / game slide nav hint */}
        {(isCheck || isGame) && (
          <div className="px-4 py-3 flex-shrink-0 relative z-10 text-center"
            style={{ borderTop: `1px solid ${theme.accent}18` }}>
            <p className="text-xs text-white/30 font-medium italic">Tap your answer above ☝️</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
