import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MiniGameConfig } from "@/data/adventureZones";

interface Props {
  config: MiniGameConfig;
  onComplete: (score: number, total: number) => void;
}

export default function RealOrFakeGame({ config, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.timerSeconds);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const items = config.items;
  const total = items.length;

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) { endGame(); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished]);

  const endGame = useCallback(() => {
    if (finished) return;
    setFinished(true);
    onComplete(score, total);
  }, [finished, score, total, onComplete]);

  const handleAnswer = (saidReal: boolean) => {
    if (finished || currentIdx >= total) return;
    const item = items[currentIdx];
    const correct = (saidReal && item.correct) || (!saidReal && !item.correct);

    if (correct) setScore((s) => s + 1);
    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      if (currentIdx + 1 >= total) {
        setFinished(true);
        onComplete(correct ? score + 1 : score, total);
      } else {
        setCurrentIdx((i) => i + 1);
      }
    }, 900);
  };

  const pct = Math.round((timeLeft / config.timerSeconds) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">🚪 Real or Fake?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Is this login page REAL or FAKE? Look carefully!
        </p>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
        <span>{timeLeft}s</span>
        <span>{currentIdx}/{total}</span>
      </div>

      {!finished && currentIdx < total && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`rounded-3xl border-2 p-5 text-center ${
              feedback === "correct"
                ? "border-emerald-400/50 bg-emerald-400/10"
                : feedback === "wrong"
                ? "border-destructive/50 bg-destructive/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            {/* Fake browser bar */}
            <div className="mx-auto mb-4 max-w-sm rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="flex items-center gap-2 rounded bg-black/30 px-3 py-1.5">
                <span className="text-xs">{items[currentIdx].correct ? "🔒" : "⚠️"}</span>
                <span className="font-mono text-xs text-white/70 truncate">{items[currentIdx].label}</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-3xl mb-2">{items[currentIdx].correct ? "🏢" : "🎭"}</div>
              <p className="text-sm font-semibold text-white/60">Login Page</p>
              <div className="mt-3 space-y-2 mx-auto max-w-[200px]">
                <div className="h-6 rounded bg-white/10" />
                <div className="h-6 rounded bg-white/10" />
                <div className="h-8 rounded bg-primary/30" />
              </div>
            </div>

            {feedback && (
              <p className={`mt-3 text-sm font-bold ${feedback === "correct" ? "text-emerald-400" : "text-destructive"}`}>
                {feedback === "correct" ? "✅ Correct!" : `❌ Wrong — this was ${items[currentIdx].correct ? "REAL" : "FAKE"}!`}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {!finished && currentIdx < total && feedback === null && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10"
            onClick={() => handleAnswer(true)}
          >
            ✅ REAL
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => handleAnswer(false)}
          >
            🚫 FAKE
          </Button>
        </div>
      )}

      {finished && (
        <div className="text-center">
          <p className="text-xl font-bold">{score}/{total} Correct!</p>
        </div>
      )}
    </div>
  );
}
