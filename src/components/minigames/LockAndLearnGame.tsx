import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MiniGameConfig } from "@/data/adventureZones";

interface Props {
  config: MiniGameConfig;
  onComplete: (score: number, total: number) => void;
}

export default function LockAndLearnGame({ config, onComplete }: Props) {
  const [timeLeft, setTimeLeft] = useState(config.timerSeconds);
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const correctCount = config.items.filter((i) => i.correct).length;

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished]);

  const endGame = useCallback(() => {
    setFinished(true);
    let score = 0;
    config.items.forEach((item, i) => {
      if (item.correct && tapped.has(i)) score++;
      if (!item.correct && !tapped.has(i)) score++;
    });
    const pct = Math.round((score / config.items.length) * 100);
    onComplete(pct >= 60 ? 1 : 0, 1);
  }, [tapped, config, onComplete]);

  const handleTap = (idx: number) => {
    if (finished) return;
    setTapped((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  };

  const pct = Math.round((timeLeft / config.timerSeconds) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">🔒 Lock & Learn</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap only the locks that are password-protected!
        </p>
      </div>

      {/* Timer */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <p className="text-center text-sm font-bold text-muted-foreground">{timeLeft}s</p>

      {/* Lock grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <AnimatePresence>
          {config.items.map((item, i) => {
            const selected = tapped.has(i);
            const isProtected = item.correct;
            const showHint = config.hints && isProtected;

            return (
              <motion.button
                key={i}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.08, type: "spring" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTap(i)}
                disabled={finished}
                className={`relative flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 text-3xl transition-all ${
                  selected
                    ? "border-primary bg-primary/15 shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                    : showHint
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <span>{isProtected ? "🔒" : "🔓"}</span>
                {finished && (
                  <span className="text-xs font-bold">
                    {isProtected ? "✅" : "❌"}
                  </span>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {!finished && (
        <Button variant="hero" size="lg" className="w-full" onClick={endGame}>
          Submit Answers
        </Button>
      )}
    </div>
  );
}
