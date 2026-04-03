import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { MiniGameConfig } from "@/data/adventureZones";

interface Props {
  config: MiniGameConfig;
  onComplete: (score: number, total: number) => void;
}

const INGREDIENT_COLORS = [
  "bg-cyan-500/15 border-cyan-400/30 text-cyan-300",
  "bg-violet-500/15 border-violet-400/30 text-violet-300",
  "bg-amber-500/15 border-amber-400/30 text-amber-300",
  "bg-rose-500/15 border-rose-400/30 text-rose-300",
  "bg-emerald-500/15 border-emerald-400/30 text-emerald-300",
  "bg-sky-500/15 border-sky-400/30 text-sky-300",
  "bg-orange-500/15 border-orange-400/30 text-orange-300",
  "bg-pink-500/15 border-pink-400/30 text-pink-300",
];

export default function PasswordChefGame({ config, onComplete }: Props) {
  const [bowl, setBowl] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const items = config.items;
  const threshold = config.passThreshold ?? 60;

  const correctIngredients = items.filter((i) => i.correct).length;
  const selectedCorrect = Array.from(bowl).filter((i) => items[i].correct).length;
  const selectedWrong = Array.from(bowl).filter((i) => !items[i].correct).length;

  // Strength: percentage of correct ingredients added minus penalties for wrong ones
  const rawStrength = correctIngredients > 0
    ? Math.max(0, Math.round(((selectedCorrect - selectedWrong) / correctIngredients) * 100))
    : 0;
  const strength = Math.min(100, rawStrength);

  const toggleIngredient = (idx: number) => {
    if (submitted) return;
    setBowl((prev) => {
      const n = new Set(prev);
      if (n.has(idx)) n.delete(idx);
      else n.add(idx);
      return n;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const passed = strength >= threshold;
    onComplete(passed ? 1 : 0, 1);
  };

  const strengthColor =
    strength >= 80 ? "bg-emerald-500" : strength >= 50 ? "bg-amber-500" : "bg-destructive";

  const strengthLabel =
    strength >= 80 ? "🔥 SUPER STRONG" : strength >= 50 ? "💪 Getting there..." : "😬 Too weak!";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">👨‍🍳 Password Chef</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag ingredients into the bowl to build the strongest password!
        </p>
      </div>

      {/* Strength meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-muted-foreground">Password Strength</span>
          <span>{strengthLabel}</span>
        </div>
        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted/30">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${strengthColor}`}
            animate={{ width: `${strength}%` }}
            transition={{ type: "spring", stiffness: 100 }}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Must reach {threshold}% to pass
        </p>
      </div>

      {/* Mixing bowl */}
      <div className="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/5 p-4 min-h-[80px]">
        <p className="text-xs font-bold uppercase tracking-wider text-primary/40 mb-2">
          🍳 Mixing Bowl
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from(bowl).map((idx) => (
            <motion.span
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`rounded-full border px-3 py-1 text-sm font-bold ${
                submitted
                  ? items[idx].correct
                    ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300"
                    : "border-destructive/50 bg-destructive/20 text-destructive"
                  : INGREDIENT_COLORS[idx % INGREDIENT_COLORS.length]
              }`}
            >
              {items[idx].label} {submitted && (items[idx].correct ? "✅" : "❌")}
            </motion.span>
          ))}
          {bowl.size === 0 && (
            <p className="text-sm text-muted-foreground">Tap ingredients below to add them!</p>
          )}
        </div>
      </div>

      {/* Ingredient shelf */}
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => {
          const inBowl = bowl.has(i);
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleIngredient(i)}
              disabled={submitted}
              className={`rounded-2xl border-2 p-4 text-left text-sm font-bold transition-all ${
                inBowl
                  ? "border-primary bg-primary/10 opacity-50"
                  : `border-border bg-card hover:border-primary/30 ${config.hints ? INGREDIENT_COLORS[i % INGREDIENT_COLORS.length] : ""}`
              }`}
            >
              {item.label}
              {inBowl && <span className="ml-2">✓</span>}
            </motion.button>
          );
        })}
      </div>

      {!submitted && (
        <Button variant="hero" size="lg" className="w-full" onClick={handleSubmit}>
          Cook My Password! 🍪
        </Button>
      )}
    </div>
  );
}
