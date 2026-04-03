import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MiniGameConfig } from "@/data/adventureZones";

interface Props {
  config: MiniGameConfig;
  onComplete: (score: number, total: number) => void;
}

export default function LockAndLearnGame({ config, onComplete }: Props) {
  const [tapped, setTapped] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const scoreRef = useRef(0);

  const endGame = useCallback(() => {
    setFinished(true);
    let s = 0;
    config.items.forEach((item, i) => {
      if (item.correct && tapped.has(i)) s++;
      if (!item.correct && !tapped.has(i)) s++;
    });
    scoreRef.current = s;
    setTimeout(() => setShowResults(true), 600);
    const pct = Math.round((s / config.items.length) * 100);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">🔐 Lock & Learn</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the locks that are <span className="font-bold text-primary">password-protected!</span>
        </p>
      </div>

      {/* Lock grid */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {config.items.map((item, i) => {
          const selected = tapped.has(i);
          const isProtected = item.correct;
          // After reveal: green = password-protected, red = not protected
          // Badge shows if the player got it right or wrong
          const playerWasRight = finished && ((isProtected && selected) || (!isProtected && !selected));

          return (
            <motion.button
              key={i}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.06, type: "spring" }}
              whileTap={!finished ? { scale: 0.88 } : {}}
              onClick={() => handleTap(i)}
              disabled={finished}
              className={`relative flex h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all duration-200 ${
                finished
                  ? isProtected
                    ? "border-green-500 bg-green-500/15 shadow-[0_0_14px_rgba(34,197,94,0.4)]"
                    : "border-red-500 bg-red-500/10"
                  : selected
                    ? "border-primary bg-primary/15 shadow-[0_0_12px_hsl(var(--primary)/0.35)] scale-[1.04]"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {/* All locks look identical during play — reveal after finish */}
              <span className="text-3xl">{finished ? (isProtected ? "🔒" : "🔓") : "🔐"}</span>

              {/* Scenario label */}
              {item.label && (
                <span className="px-2 text-center text-[10px] font-medium leading-tight text-muted-foreground whitespace-pre-line">
                  {item.label}
                </span>
              )}

              {/* ✅ = player got it right, ❌ = player missed or tapped wrong */}
              <AnimatePresence>
                {finished && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.04, type: "spring" }}
                    className="absolute -right-1 -top-1 text-sm"
                  >
                    {playerWasRight ? "✅" : "❌"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Results banner */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-4 text-center ${
              scoreRef.current / config.items.length >= 0.6
                ? "border-green-500/30 bg-green-500/15"
                : "border-orange-500/30 bg-orange-500/15"
            }`}
          >
            <p className="text-2xl font-bold">
              {scoreRef.current / config.items.length >= 0.6 ? "🎉 Great job, Hero!" : "💪 Keep training!"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You got <span className="font-bold text-foreground">{scoreRef.current}</span> out of{" "}
              <span className="font-bold text-foreground">{config.items.length}</span> right!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!finished && (
        <Button variant="hero" size="lg" className="w-full" onClick={endGame}>
          Submit Answers →
        </Button>
      )}
    </div>
  );
}
