import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MiniGameConfig } from "@/data/adventureZones";

interface Props {
  config: MiniGameConfig;
  onComplete: (score: number, total: number) => void;
}

const KEY_COLORS = [
  "bg-cyan-500/20 border-cyan-400/40 text-cyan-300",
  "bg-violet-500/20 border-violet-400/40 text-violet-300",
  "bg-amber-500/20 border-amber-400/40 text-amber-300",
  "bg-emerald-500/20 border-emerald-400/40 text-emerald-300",
  "bg-rose-500/20 border-rose-400/40 text-rose-300",
  "bg-sky-500/20 border-sky-400/40 text-sky-300",
  "bg-orange-500/20 border-orange-400/40 text-orange-300",
  "bg-pink-500/20 border-pink-400/40 text-pink-300",
  "bg-teal-500/20 border-teal-400/40 text-teal-300",
  "bg-indigo-500/20 border-indigo-400/40 text-indigo-300",
  "bg-lime-500/20 border-lime-400/40 text-lime-300",
  "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-300",
];

export default function KeyMatcherGame({ config, onComplete }: Props) {
  const items = config.items.filter((i) => i.correct); // Only "correct" items are real pairs
  const total = items.length;

  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);
  const [timeLeft, setTimeLeft] = useState(config.timerSeconds);
  const [finished, setFinished] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  // Shuffle door order
  const [doorOrder] = useState<number[]>(() => {
    const order = items.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  });

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) { endGame(); return; }
    const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, finished]);

  const endGame = useCallback(() => {
    if (finished) return;
    setFinished(true);
    onComplete(matched.size, total);
  }, [finished, matched.size, total, onComplete]);

  useEffect(() => {
    if (matched.size === total && total > 0 && !finished) {
      setFinished(true);
      onComplete(total, total);
    }
  }, [matched.size, total, finished, onComplete]);

  const handleKeyClick = (keyIdx: number) => {
    if (finished || matched.has(keyIdx)) return;
    setSelectedKey(keyIdx);
    setWrongPair(null);
  };

  const handleDoorClick = (doorIdx: number) => {
    if (finished || selectedKey === null || matched.has(doorIdx)) return;

    if (selectedKey === doorIdx) {
      // Correct match
      setMatched((prev) => {
        const n = new Set(prev);
        n.add(doorIdx);
        return n;
      });
      setSelectedKey(null);
    } else {
      // Wrong match
      setMistakes((m) => m + 1);
      setWrongPair([selectedKey, doorIdx]);
      setTimeout(() => {
        setWrongPair(null);
        setSelectedKey(null);
      }, 800);
    }
  };

  const pct = Math.round((timeLeft / config.timerSeconds) * 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">🔑 Key Matcher</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Match each unique key to its own door — no key opens two doors!
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
        <span>{matched.size}/{total} matched</span>
      </div>

      {/* Keys row */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">🔑 Keys</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => {
            const isMatched = matched.has(i);
            const isSelected = selectedKey === i;
            const colorClass = KEY_COLORS[i % KEY_COLORS.length];

            return (
              <motion.button
                key={`key-${i}`}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleKeyClick(i)}
                disabled={isMatched || finished}
                className={`rounded-xl border-2 px-3 py-2 text-xs font-bold transition-all ${
                  isMatched
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400 opacity-50"
                    : isSelected
                    ? `${colorClass} ring-2 ring-primary shadow-lg`
                    : `${colorClass} hover:scale-105`
                }`}
              >
                🔑 {item.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Doors grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">🚪 Doors</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {doorOrder.map((doorIdx) => {
            const item = items[doorIdx];
            const isMatched = matched.has(doorIdx);
            const isWrong = wrongPair && wrongPair[1] === doorIdx;

            return (
              <motion.button
                key={`door-${doorIdx}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDoorClick(doorIdx)}
                disabled={isMatched || finished}
                className={`flex h-16 items-center justify-center rounded-2xl border-2 text-sm font-bold transition-all ${
                  isMatched
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                    : isWrong
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-white/10 bg-white/5 hover:border-primary/30 hover:bg-primary/5"
                }`}
              >
                {isMatched ? "✅" : "🚪"} {item.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {finished && (
        <div className="text-center">
          <p className="text-xl font-bold">{matched.size}/{total} Matched!</p>
          {mistakes > 0 && <p className="text-sm text-muted-foreground">{mistakes} mistake{mistakes > 1 ? "s" : ""}</p>}
        </div>
      )}
    </div>
  );
}
