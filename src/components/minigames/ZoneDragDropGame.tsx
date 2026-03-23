import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ZoneDragDropItem } from "@/data/zoneGames";

interface Props {
  items: ZoneDragDropItem[];
  buckets: string[];
  onComplete: (passed: boolean, stars: number) => void;
}

export default function ZoneDragDropGame({ items, buckets, onComplete }: Props) {
  const shuffled = useMemo(() => [...items].sort(() => Math.random() - 0.5), [items]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);
  const [done, setDone] = useState(false);

  const current = shuffled[currentIndex];

  const handleBucketClick = (bucket: string) => {
    if (!current || done) return;
    const isCorrect = current.bucket === bucket;
    if (isCorrect) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);

    setFeedback({ text: isCorrect ? "Correct! ✅" : `Not quite — this belongs in ${current.bucket}`, isCorrect });

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 >= shuffled.length) {
        setDone(true);
        const total = shuffled.length;
        const finalCorrect = isCorrect ? correct + 1 : correct;
        const pct = finalCorrect / total;
        const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
        setTimeout(() => onComplete(true, stars), 1200);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 1200);
  };

  if (done) {
    const total = shuffled.length;
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 py-8">
        <span className="text-5xl">🎉</span>
        <h3 className="text-xl font-bold text-white">Round Complete!</h3>
        <p className="text-sm text-white/60">{correct}/{total} correct</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <span key={s} className={`text-2xl ${s <= (correct / total >= 0.9 ? 3 : correct / total >= 0.7 ? 2 : 1) ? "" : "opacity-20"}`}>⭐</span>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 py-4 px-4">
      {/* Progress */}
      <div className="text-xs text-white/40 font-mono">
        ITEM {currentIndex + 1} OF {shuffled.length}
      </div>

      {/* Current item */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="rounded-xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.9)] px-6 py-4 text-center max-w-sm w-full"
        >
          <p className="text-sm font-medium text-white">{current?.text}</p>
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded-lg px-4 py-2 text-sm font-bold ${feedback.isCorrect ? "bg-[hsl(160_65%_35%/0.3)] text-[hsl(160_65%_70%)]" : "bg-[hsl(0_65%_35%/0.3)] text-[hsl(0_65%_70%)]"}`}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buckets */}
      <div className="flex flex-wrap justify-center gap-3">
        {buckets.map((bucket) => (
          <Button
            key={bucket}
            onClick={() => handleBucketClick(bucket)}
            disabled={!!feedback}
            className="bg-[hsl(210_40%_18%)] hover:bg-[hsl(210_40%_25%)] border border-[hsl(195_80%_50%/0.2)] text-white font-bold px-5 py-3 text-sm"
          >
            {bucket}
          </Button>
        ))}
      </div>

      {/* Score */}
      <div className="flex gap-4 text-xs text-white/40">
        <span>✅ {correct}</span>
        <span>❌ {wrong}</span>
      </div>
    </div>
  );
}
