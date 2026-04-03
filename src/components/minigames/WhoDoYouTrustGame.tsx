import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MiniGameConfig } from "@/data/adventureZones";

interface Props {
  config: MiniGameConfig;
  onComplete: (score: number, total: number) => void;
}

const CHARACTER_EMOJIS = ["🧑‍💻", "👧", "🧓", "👮", "🧑‍🏫", "🤖", "👨‍🔧", "🦹", "👩‍⚕️", "🕵️", "👨‍💼", "📞"];

export default function WhoDoYouTrustGame({ config, onComplete }: Props) {
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

  const handleAnswer = (shared: boolean) => {
    if (finished || currentIdx >= total) return;
    const item = items[currentIdx];
    // correct answer is always NO (never share) — item.correct = false means "don't share"
    const correct = !shared; // Always say NO

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
    }, 1000);
  };

  const pct = Math.round((timeLeft / config.timerSeconds) * 100);
  const emoji = CHARACTER_EMOJIS[currentIdx % CHARACTER_EMOJIS.length];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">🤫 Who Do You Trust?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Should you share your password? Tap YES or NO!
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`rounded-3xl border-2 p-6 text-center ${
              feedback === "correct"
                ? "border-emerald-400/50 bg-emerald-400/10"
                : feedback === "wrong"
                ? "border-destructive/50 bg-destructive/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="text-6xl mb-3">{emoji}</div>
            <p className="text-lg font-semibold leading-snug">
              {items[currentIdx].label}
            </p>
            {feedback && (
              <p className={`mt-2 text-sm font-bold ${feedback === "correct" ? "text-emerald-400" : "text-destructive"}`}>
                {feedback === "correct" ? "✅ Correct! Never share!" : "❌ Wrong — NEVER share your password!"}
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
            onClick={() => handleAnswer(false)}
          >
            🚫 NO — Keep Secret
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => handleAnswer(true)}
          >
            ✅ YES — Share It
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
