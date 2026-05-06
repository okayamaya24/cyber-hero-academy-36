/**
 * LessonPlayer
 *
 * Full-screen lesson experience shown before a quiz mission.
 * Slides through intro → learn → check → summary → quiz CTA.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LessonContent, LessonSlide, CheckChoice } from "@/data/lessonContent";

interface Props {
  lesson: LessonContent;
  onStartQuiz: () => void;
  onClose: () => void;
}

/* ─── Slide renderers ─── */

function IntroSlide({ slide, lesson }: { slide: LessonSlide; lesson: LessonContent }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-6 py-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
        className={`w-24 h-24 rounded-3xl ${lesson.characterColor} flex items-center justify-center text-5xl shadow-2xl`}
      >
        {lesson.characterEmoji}
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-purple-400 mb-2">
          Lesson with {lesson.character}
        </p>
        <h1 className="text-3xl font-black text-white leading-tight mb-3">
          {slide.headline}
        </h1>
        <p className="text-gray-400 text-base max-w-sm leading-relaxed">
          {slide.subtext}
        </p>
      </motion.div>
    </div>
  );
}

function LearnSlide({ slide }: { slide: LessonSlide }) {
  return (
    <div className="flex flex-col gap-5 py-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-6xl text-center"
      >
        {slide.icon}
      </motion.div>
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-xl font-black text-white mb-3 text-center">{slide.title}</h2>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {slide.body}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function TipSlide({ slide, lesson }: { slide: LessonSlide; lesson: LessonContent }) {
  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className={`w-16 h-16 rounded-2xl ${lesson.characterColor} flex items-center justify-center text-3xl shadow-lg`}
      >
        {lesson.characterEmoji}
      </motion.div>
      {/* Speech bubble */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        {/* Bubble tail */}
        <div className="absolute -top-3 left-8 w-0 h-0 border-l-8 border-r-8 border-b-[12px] border-l-transparent border-r-transparent border-b-purple-500/30" />
        <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-purple-400 mb-2">
            💡 Pro Tip from {lesson.character}
          </p>
          <p className="text-gray-200 text-sm leading-relaxed">{slide.tipText}</p>
        </div>
      </motion.div>
    </div>
  );
}

function CheckSlide({
  slide,
  onAnswer,
}: {
  slide: LessonSlide;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const choices = slide.choices ?? [];

  const handlePick = (idx: number, choice: CheckChoice) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => onAnswer(choice.correct), 1200);
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
            Quick Check ✓
          </span>
        </div>
        <h2 className="text-lg font-black text-white leading-snug">{slide.question}</h2>
      </motion.div>

      <div className="grid gap-2.5">
        {choices.map((choice, idx) => {
          const isPicked = selected === idx;
          const isWrong = isPicked && !choice.correct;
          const isCorrect = isPicked && choice.correct;
          const revealCorrect = selected !== null && choice.correct && selected !== idx;

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => handlePick(idx, choice)}
              disabled={selected !== null}
              className={`w-full text-left rounded-2xl border p-4 transition-all text-sm font-semibold ${
                isCorrect
                  ? "border-green-400/60 bg-green-500/15 text-green-300"
                  : isWrong
                  ? "border-red-400/60 bg-red-500/15 text-red-300"
                  : revealCorrect
                  ? "border-green-400/40 bg-green-500/8 text-green-400/70"
                  : selected !== null
                  ? "border-white/5 bg-white/3 text-gray-500 cursor-not-allowed"
                  : "border-white/10 bg-white/5 text-gray-200 hover:border-purple-400/40 hover:bg-purple-500/10 active:scale-[0.98]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-black ${
                  isCorrect ? "border-green-400 bg-green-500 text-white" :
                  isWrong   ? "border-red-400 bg-red-500 text-white" :
                              "border-white/20 text-gray-500"
                }`}>
                  {isCorrect ? "✓" : isWrong ? "✗" : ["A","B","C","D"][idx]}
                </span>
                <div>
                  <p>{choice.text}</p>
                  {isPicked && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`mt-1.5 text-xs font-medium ${isCorrect ? "text-green-400" : "text-red-300"}`}
                    >
                      {choice.feedback}
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SummarySlide({
  slide,
  lesson,
  onStartQuiz,
}: {
  slide: LessonSlide;
  lesson: LessonContent;
  onStartQuiz: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 py-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className={`inline-flex w-16 h-16 rounded-2xl ${lesson.characterColor} items-center justify-center text-3xl mb-3 shadow-lg`}>
          {lesson.characterEmoji}
        </div>
        <h2 className="text-xl font-black text-white">Key Takeaways 🎓</h2>
        <p className="text-gray-400 text-xs mt-1">You've learned a lot! Here's what to remember:</p>
      </motion.div>

      <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/5 overflow-hidden">
        {(slide.takeaways ?? []).map((point, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.1 }}
            className="flex items-start gap-3 px-4 py-3"
          >
            <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-200 font-medium">{point}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          className="w-full rounded-2xl py-5 text-base font-black text-white shadow-xl"
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", boxShadow: "0 6px 24px rgba(124,58,237,0.4)" }}
          onClick={onStartQuiz}
        >
          {slide.quizLabel ?? "Start the Quiz!"} →
        </Button>
        <p className="text-center text-xs text-gray-500 mt-2 font-medium">
          Complete the quiz to mark this lesson done ✓
        </p>
      </motion.div>
    </div>
  );
}

/* ─── Progress dots ─── */
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === current ? 20 : 6,
            backgroundColor: i < current ? "#22c55e" : i === current ? "#a855f7" : "rgba(255,255,255,0.15)",
          }}
          transition={{ duration: 0.3 }}
          className="h-1.5 rounded-full"
        />
      ))}
    </div>
  );
}

/* ─── Main LessonPlayer ─── */
export default function LessonPlayer({ lesson, onStartQuiz, onClose }: Props) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [checkPassed, setCheckPassed] = useState(false);
  const [direction, setDirection] = useState(1);

  const slides = lesson.slides;
  const slide = slides[slideIdx];
  const isLast = slideIdx === slides.length - 1;
  const isFirst = slideIdx === 0;
  const isCheck = slide.type === "check";

  const goNext = () => {
    if (isLast) return;
    setDirection(1);
    setSlideIdx((i) => i + 1);
    setCheckPassed(false);
  };

  const goPrev = () => {
    if (isFirst) return;
    setDirection(-1);
    setSlideIdx((i) => i - 1);
    setCheckPassed(false);
  };

  const handleCheckAnswer = (correct: boolean) => {
    if (correct) setCheckPassed(true);
    else setCheckPassed(false);
    // Auto-advance after a moment regardless (learning, not gatekeeping)
    setTimeout(goNext, correct ? 1400 : 2000);
  };

  const canGoNext = !isCheck || checkPassed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        className="relative w-full max-w-md bg-[#0d1323] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <ProgressDots total={slides.length} current={slideIdx} />
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Slide content */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slideIdx}
              custom={direction}
              initial={{ x: direction * 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction * -40, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {slide.type === "intro" && <IntroSlide slide={slide} lesson={lesson} />}
              {slide.type === "learn" && <LearnSlide slide={slide} />}
              {slide.type === "tip"   && <TipSlide   slide={slide} lesson={lesson} />}
              {slide.type === "check" && (
                <CheckSlide slide={slide} onAnswer={handleCheckAnswer} />
              )}
              {slide.type === "summary" && (
                <SummarySlide slide={slide} lesson={lesson} onStartQuiz={onStartQuiz} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {slide.type !== "summary" && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5 flex-shrink-0">
            <button
              onClick={goPrev}
              disabled={isFirst}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-gray-500 hover:text-white hover:bg-white/8 transition-colors disabled:opacity-0"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            {/* Slide counter */}
            <span className="text-[11px] font-bold text-gray-600">
              {slideIdx + 1} / {slides.length}
            </span>

            {!isCheck && (
              <button
                onClick={goNext}
                disabled={isLast}
                className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold text-white bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-30"
              >
                {slideIdx === slides.length - 2 ? "Finish" : "Next"} <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {isCheck && (
              <span className="text-[11px] font-bold text-gray-500 italic">
                {checkPassed ? "✓ Correct!" : "Tap an answer"}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
