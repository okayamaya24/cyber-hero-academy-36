import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MiniGameConfig } from "@/data/adventureZones";

interface Props {
  config: MiniGameConfig;
  onComplete: (score: number, total: number) => void;
}

export default function StrongOrSmashGame({ config, onComplete }: Props) {
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

  const handleSwipe = (direction: "left" | "right") => {
    if (finished || currentIdx >= total) return;
    const item = items[currentIdx];
    const isStrong = item.correct;
    const correct = (direction === "right" && isStrong) || (direction === "left" && !isStrong);

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
    }, 600);
  };

  const pct = Math.round((timeLeft / config.timerSeconds) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">💪 Strong or Smash?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Swipe right for STRONG passwords, left for WEAK ones!
        </p>
      </div>

      {/* Timer */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-primary" animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>

      <div className="flex items-center justify-between text-sm font-bold text-muted-foreground">
        <span>{timeLeft}s</span>
        <span>{currentIdx}/{total}</span>
      </div>

      {/* Card */}
      {!finished && currentIdx < total && (
        <div className="relative flex min-h-[200px] items-center justify-center">
          <AnimatePresence mode="wait">
            <PasswordCard
              key={currentIdx}
              label={items[currentIdx].label}
              onSwipe={handleSwipe}
              feedback={feedback}
            />
          </AnimatePresence>
        </div>
      )}

      {/* Buttons as alternative to swipe */}
      {!finished && currentIdx < total && (
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="flex-1 border-destructive/30 text-destructive" onClick={() => handleSwipe("left")}>
            ← WEAK
          </Button>
          <Button variant="outline" size="lg" className="flex-1 border-secondary/30 text-secondary" onClick={() => handleSwipe("right")}>
            STRONG →
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

function PasswordCard({ label, onSwipe, feedback }: { label: string; onSwipe: (d: "left" | "right") => void; feedback: "correct" | "wrong" | null }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const bgLeft = useTransform(x, [-100, 0], [0.3, 0]);
  const bgRight = useTransform(x, [0, 100], [0, 0.3]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80) onSwipe("right");
    else if (info.offset.x < -80) onSwipe("left");
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0, x: 200 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate }}
      onDragEnd={handleDragEnd}
      className={`w-full cursor-grab rounded-3xl border-2 p-8 text-center shadow-lg active:cursor-grabbing ${
        feedback === "correct"
          ? "border-secondary bg-secondary/10"
          : feedback === "wrong"
          ? "border-destructive bg-destructive/10"
          : "border-primary/20 bg-card"
      }`}
    >
      <p className="select-none font-mono text-2xl font-bold tracking-wide sm:text-3xl">{label}</p>
      {feedback && (
        <p className={`mt-3 text-lg font-bold ${feedback === "correct" ? "text-secondary" : "text-destructive"}`}>
          {feedback === "correct" ? "✅ Correct!" : "❌ Wrong!"}
        </p>
      )}
    </motion.div>
  );
}
