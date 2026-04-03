import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MiniGameConfig } from "@/data/adventureZones";

interface Props {
  config: MiniGameConfig;
  onComplete: (score: number, total: number) => void;
}

export default function LockAndLearnGame({ config, onComplete }: Props) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const totalItems = config.items.length;

  const results = useMemo(() => {
    let correctCount = 0;

    const itemResults = config.items.map((item, index) => {
      const isSelected = selectedItems.has(index);
      const isCorrectChoice = item.correct;

      const gotItRight = (isCorrectChoice && isSelected) || (!isCorrectChoice && !isSelected);

      if (gotItRight) correctCount++;

      return {
        ...item,
        index,
        isSelected,
        gotItRight,
      };
    });

    return {
      itemResults,
      correctCount,
      passed: correctCount / totalItems >= (config.passThreshold ?? 60) / 100,
    };
  }, [config.items, config.passThreshold, selectedItems, totalItems]);

  const handleToggle = (index: number) => {
    if (submitted) return;

    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleContinue = () => {
    onComplete(results.passed ? 1 : 0, 1);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="rounded-[30px] border border-white/10 bg-[#151d28] p-4 shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:p-6">
        {/* inner frame */}
        <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,#1b2432_0%,#171f2c_100%)] p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-[28px] font-extrabold tracking-tight text-white sm:text-[34px]">🔐 Lock &amp; Learn</h2>
            <p className="mt-2 text-sm text-[#8ea0b7] sm:text-base">
              Tap the locks that are <span className="font-bold text-[#36c8ff]">password-protected!</span>
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.itemResults.map((item) => {
              const showSelected = item.isSelected && !submitted;
              const showCorrectReveal = submitted && item.gotItRight;
              const showWrongReveal = submitted && !item.gotItRight;

              return (
                <motion.button
                  key={item.index}
                  type="button"
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: item.index * 0.04 }}
                  whileTap={!submitted ? { scale: 0.97 } : undefined}
                  onClick={() => handleToggle(item.index)}
                  disabled={submitted}
                  className={[
                    "relative min-h-[124px] rounded-[24px] border px-4 py-4 text-center transition-all duration-200",
                    "flex flex-col items-center justify-center",
                    showCorrectReveal
                      ? "border-[#39ff6d] bg-[#173f33] shadow-[0_0_18px_rgba(57,255,109,0.32),inset_0_0_12px_rgba(57,255,109,0.08)]"
                      : showWrongReveal
                        ? "border-[#ff6b81] bg-[#3a2130]"
                        : showSelected
                          ? "border-[#36c8ff] bg-[#193247] shadow-[0_0_14px_rgba(54,200,255,0.24)]"
                          : "border-[#2a394c] bg-[#182230] hover:border-[#36c8ff]/40 hover:bg-[#1a2635]",
                  ].join(" ")}
                >
                  {/* status badge */}
                  <AnimatePresence>
                    {(submitted ? item.gotItRight : item.isSelected) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={`absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white shadow-lg ${
                          submitted ? (item.gotItRight ? "bg-[#43db59]" : "bg-[#ff5b72]") : "bg-[#36c8ff]"
                        }`}
                      >
                        {submitted ? (item.gotItRight ? "✓" : "✕") : "✓"}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* lock icon */}
                  <div className="mb-2 text-3xl sm:text-4xl">{submitted ? (item.correct ? "🔒" : "🔓") : "🔒"}</div>

                  {/* text */}
                  <div className="max-w-[150px] whitespace-pre-line text-[11px] font-medium leading-[1.25] text-[#90a5b8] sm:text-xs">
                    {item.label}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Results */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 rounded-[24px] border px-6 py-5 text-center ${
                  results.passed ? "border-[#2ecf73]/30 bg-[#1f4b3d]" : "border-[#f59e0b]/30 bg-[#4a3820]"
                }`}
              >
                <p className="text-2xl font-extrabold text-white sm:text-3xl">
                  {results.passed ? "🎉 Great job, Hero!" : "💪 Keep training, Hero!"}
                </p>
                <p className="mt-2 text-sm text-[#9eb1be] sm:text-base">
                  You got <span className="font-bold text-[#36c8ff]">{results.correctCount}</span> out of{" "}
                  <span className="font-bold text-[#36c8ff]">{totalItems}</span> right!
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <div className="mt-6">
            {!submitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-[20px] bg-gradient-to-r from-[#46b6e8] to-[#42d96f] px-6 py-4 text-base font-extrabold text-white shadow-[0_10px_28px_rgba(66,217,111,0.25)] transition-transform duration-200 hover:scale-[1.01]"
              >
                Check My Answers →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleContinue}
                className="w-full rounded-[20px] bg-gradient-to-r from-[#46b6e8] to-[#42d96f] px-6 py-4 text-base font-extrabold text-white shadow-[0_10px_28px_rgba(66,217,111,0.25)] transition-transform duration-200 hover:scale-[1.01]"
              >
                Start Challenge Questions →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
