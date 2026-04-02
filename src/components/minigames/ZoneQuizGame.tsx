import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ZoneQuizQuestion } from "@/data/zoneGames";

interface Props {
  title: string;
  questions: ZoneQuizQuestion[];
  onComplete: (passed: boolean, stars: number) => void;
}

export default function ZoneQuizGame({ title, questions, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [done, setDone] = useState(false);

  const q = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    if (idx === q.answer) setCorrect((c) => c + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (currentIndex + 1 >= questions.length) {
      setDone(true);
      const finalCorrect = selected === q.answer ? correct : correct; // already counted
      const pct = (selected === q.answer ? correct + 1 : correct) / questions.length;
      // Recount properly
      const total = questions.length;
      const c = selected === q.answer ? correct : correct;
      const p = c / total;
      const stars = p >= 0.9 ? 3 : p >= 0.6 ? 2 : 1;
      setTimeout(() => onComplete(true, stars), 800);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (done) {
    const pct = correct / questions.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
        <span className="text-5xl">🎉</span>
        <h3 className="text-xl font-bold text-white">Quiz Complete!</h3>
        <p className="text-sm text-white/60">{correct}/{questions.length} correct</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-2xl ${s <= stars ? "" : "opacity-20"}`}>⭐</span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 px-4 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span className="font-mono">QUESTION {currentIndex + 1}/{questions.length}</span>
        <span>✅ {correct}</span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
        >
          <h3 className="text-base font-bold text-white mb-4">{q.q}</h3>

          <div className="flex flex-col gap-2">
            {q.choices.map((choice, idx) => {
              let btnClass = "bg-[hsl(210_40%_18%)] hover:bg-[hsl(210_40%_25%)] border border-[hsl(195_80%_50%/0.15)] text-white";
              if (selected !== null) {
                if (idx === q.answer) btnClass = "bg-[hsl(160_65%_30%)] border border-[hsl(160_65%_50%/0.5)] text-white";
                else if (idx === selected) btnClass = "bg-[hsl(0_65%_30%)] border border-[hsl(0_65%_50%/0.5)] text-white";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${btnClass}`}
                >
                  {choice}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl bg-[hsl(210_40%_12%/0.8)] border border-[hsl(195_80%_50%/0.15)] p-4"
              >
                <p className="text-xs text-[hsl(195_80%_70%)]">💡 {q.explanation}</p>
                <Button
                  onClick={handleNext}
                  className="mt-3 bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white font-bold text-sm"
                  size="sm"
                >
                  {currentIndex + 1 >= questions.length ? "Finish Quiz" : "Next Question →"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
