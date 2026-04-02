import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface NarrativeOption {
  label: string;
  response: string;
  xpBonus?: number;
}

interface NarrativeChoiceProps {
  prompt: string;
  options: NarrativeOption[];
  onChoose: (option: NarrativeOption, index: number) => void;
}

/**
 * A reusable narrative choice card shown during cutscenes and story panels.
 * Displays a prompt and 2-3 clickable options with animated feedback.
 */
export default function NarrativeChoice({ prompt, options, onChoose }: NarrativeChoiceProps) {
  const [chosen, setChosen] = useState<number | null>(null);
  const selectedOption = chosen !== null ? options[chosen] : null;

  const handleClick = (index: number) => {
    if (chosen !== null) return;
    setChosen(index);
    setTimeout(() => onChoose(options[index], index), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm mx-auto mt-4"
    >
      {/* Prompt */}
      <p className="text-[10px] font-bold tracking-[0.2em] text-[hsl(45_90%_65%)] uppercase text-center mb-3">
        ⚡ Your Choice
      </p>
      <p className="text-sm text-white/80 text-center mb-4 leading-relaxed">{prompt}</p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => {
          const isChosen = chosen === i;
          const isDimmed = chosen !== null && !isChosen;
          return (
            <motion.button
              key={i}
              onClick={() => handleClick(i)}
              disabled={chosen !== null}
              whileHover={chosen === null ? { scale: 1.02 } : {}}
              whileTap={chosen === null ? { scale: 0.98 } : {}}
              animate={{
                opacity: isDimmed ? 0.3 : 1,
                scale: isChosen ? 1.03 : 1,
              }}
              className={`relative rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                isChosen
                  ? "border-[hsl(160_65%_50%/0.5)] bg-[hsl(160_65%_50%/0.12)] text-[hsl(160_65%_70%)]"
                  : "border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.7)] text-white/80 hover:border-[hsl(195_80%_50%/0.5)] hover:bg-[hsl(195_80%_50%/0.1)]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold shrink-0"
                  style={{
                    borderColor: isChosen ? "hsl(160,65%,50%)" : "hsl(195,80%,50%,0.4)",
                    color: isChosen ? "hsl(160,65%,60%)" : "hsl(195,80%,70%)",
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.label}
              </span>
              {isChosen && opt.xpBonus && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 right-3 text-[10px] font-bold text-[hsl(45_90%_60%)]"
                >
                  +{opt.xpBonus} XP
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Response after choosing */}
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl border border-[hsl(160_65%_50%/0.2)] bg-[hsl(160_65%_50%/0.06)] p-3 text-center"
          >
            <p className="text-xs text-white/70 italic">"{selectedOption.response}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
