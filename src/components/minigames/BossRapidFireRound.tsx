import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface Question {
  q: string;
  choices: string[];
  answer: number;
  explanation?: string;
}

interface Props {
  questions: Question[];
  timePerQuestion?: number;
  onRoundEnd: (damageDealt: number, damageTaken: number) => void;
}

export default function BossRapidFireRound({ questions, timePerQuestion = 5, onRoundEnd }: Props) {
  const shuffled = useRef([...questions].sort(() => Math.random() - 0.5));
  const [index, setIndex] = useState(0);
  const [chargeLevel, setChargeLevel] = useState(0); // 0–100
  const [timer, setTimer] = useState(timePerQuestion);
  const [selected, setSelected] = useState<number | null>(null);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [done, setDone] = useState(false);

  const q = shuffled.current[index];
  const total = shuffled.current.length;

  // Timer countdown
  useEffect(() => {
    if (done || selected !== null) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 0.1) {
          // Time's up — charge increases
          setChargeLevel((c) => Math.min(100, c + 15));
          setDamageTaken((d) => d + 8);
          advanceQuestion();
          return timePerQuestion;
        }
        return t - 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [done, selected, index]);

  const advanceQuestion = () => {
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTimer(timePerQuestion);
  };

  const handleSelect = (choice: number) => {
    if (selected !== null || done) return;
    setSelected(choice);

    if (choice === q.answer) {
      setChargeLevel((c) => Math.max(0, c - 20));
      setDamageDealt((d) => d + 10);
    } else {
      setChargeLevel((c) => Math.min(100, c + 12));
      setDamageTaken((d) => d + 10);
    }

    // Check if charge maxed
    setTimeout(() => {
      if (chargeLevel >= 95) {
        setDamageTaken((d) => d + 20);
      }
      advanceQuestion();
    }, 600);
  };

  useEffect(() => {
    if (done) {
      setTimeout(() => onRoundEnd(damageDealt, damageTaken), 500);
    }
  }, [done]);

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6">
        <p className="text-lg font-bold text-white">⚡ Charge Interrupted!</p>
        <p className="text-xs text-white/50 mt-1">Damage dealt: {damageDealt} | Damage taken: {damageTaken}</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Villain charge bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[hsl(0_80%_60%)] font-mono">⚡ MEGA ATTACK CHARGING...</span>
          <span className="text-[10px] text-[hsl(0_80%_60%)]">{Math.round(chargeLevel)}%</span>
        </div>
        <div className="h-4 rounded-full bg-[hsl(210_40%_15%)] overflow-hidden border border-[hsl(0_80%_50%/0.3)]">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, hsl(0 70% 40%), hsl(0 90% 50%), hsl(45 100% 50%))`,
            }}
            animate={{ width: `${chargeLevel}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 rounded-full bg-[hsl(210_40%_15%)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[hsl(195_80%_50%)]"
          animate={{ width: `${(timer / timePerQuestion) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          className="text-center"
        >
          <p className="text-xs text-white/40 font-mono mb-2">QUESTION {index + 1}/{total}</p>
          <h3 className="text-sm font-bold text-white mb-4">{q.q}</h3>

          <div className="flex flex-col gap-2 max-w-md mx-auto">
            {q.choices.map((choice, ci) => {
              let cls = "border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_18%)] hover:bg-[hsl(210_40%_25%)] text-white";
              if (selected !== null) {
                if (ci === q.answer) cls = "border-[hsl(160_65%_50%/0.5)] bg-[hsl(160_65%_25%)] text-white";
                else if (ci === selected) cls = "border-[hsl(0_65%_50%/0.5)] bg-[hsl(0_65%_25%)] text-white";
                else cls = "border-white/5 bg-white/[0.02] text-white/30";
              }
              return (
                <motion.button
                  key={ci}
                  onClick={() => handleSelect(ci)}
                  disabled={selected !== null}
                  whileTap={{ scale: 0.97 }}
                  className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium text-left transition-all ${cls}`}
                >
                  {choice}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <p className="text-xs text-white/30 text-center font-mono">
        ⏱️ {timer.toFixed(1)}s remaining
      </p>
    </div>
  );
}
