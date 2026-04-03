import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import keybreakerSrc from "@/assets/keybreaker-villain.png";
import byteSrc from "@/assets/byte-sidekick.png";

interface VillainIntroProps {
  onComplete: () => void;
}

type Phase = "dark" | "villain-enter" | "villain-speak" | "byte-respond" | "villain-exit";

const PHASE_DURATIONS: Record<Phase, number> = {
  dark: 500,
  "villain-enter": 800,
  "villain-speak": 1200,
  "byte-respond": 1200,
  "villain-exit": 300,
};

export default function VillainIntro({ onComplete }: VillainIntroProps) {
  const [phase, setPhase] = useState<Phase>("dark");

  useEffect(() => {
    const advance = (from: Phase, to: Phase | null) => {
      return setTimeout(() => {
        if (to) setPhase(to);
        else onComplete();
      }, PHASE_DURATIONS[from]);
    };

    let t: ReturnType<typeof setTimeout>;
    switch (phase) {
      case "dark":
        t = advance("dark", "villain-enter");
        break;
      case "villain-enter":
        t = advance("villain-enter", "villain-speak");
        break;
      case "villain-speak":
        t = advance("villain-speak", "byte-respond");
        break;
      case "byte-respond":
        t = advance("byte-respond", "villain-exit");
        break;
      case "villain-exit":
        t = advance("villain-exit", null);
        break;
    }
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute right-4 top-4 z-[110] rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white/60 backdrop-blur transition hover:bg-white/20 hover:text-white"
      >
        SKIP ›
      </button>

      {/* Glitch scanlines overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }}
      />

      {/* Villain */}
      <AnimatePresence>
        {(phase === "villain-enter" || phase === "villain-speak" || phase === "byte-respond") && (
          <motion.div
            className="absolute flex flex-col items-center"
            initial={{ y: 300, scale: 1.3, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.7, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
          >
            <motion.img
              src={keybreakerSrc}
              alt="The Keybreaker"
              className="h-56 w-auto drop-shadow-[0_0_40px_rgba(168,85,247,0.5)] sm:h-72"
              animate={{
                filter: [
                  "drop-shadow(0 0 40px rgba(168,85,247,0.5))",
                  "drop-shadow(0 0 60px rgba(168,85,247,0.8))",
                  "drop-shadow(0 0 40px rgba(168,85,247,0.5))",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Villain speech */}
      <AnimatePresence>
        {phase === "villain-speak" && (
          <motion.div
            className="absolute bottom-28 mx-6 max-w-md sm:bottom-32"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="rounded-2xl border border-purple-500/40 bg-purple-950/80 px-6 py-4 shadow-[0_0_30px_rgba(168,85,247,0.3)] backdrop-blur">
              <motion.p
                className="text-center text-lg font-extrabold text-purple-200 sm:text-xl"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                style={{
                  textShadow: "0 0 10px rgba(168,85,247,0.6), 0 0 30px rgba(168,85,247,0.3)",
                }}
              >
                "No password can stop me! North America is MINE!"
              </motion.p>
              <p className="mt-1 text-center text-xs font-bold text-purple-400/60">
                — The Keybreaker
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Byte response */}
      <AnimatePresence>
        {phase === "byte-respond" && (
          <>
            <motion.img
              src={byteSrc}
              alt="Byte"
              className="absolute bottom-36 right-8 h-20 w-20 drop-shadow-[0_0_20px_hsl(185,80%,48%,0.6)] sm:h-24 sm:w-24"
              initial={{ x: 200, opacity: 0, rotate: -20 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            />
            <motion.div
              className="absolute bottom-20 mx-6 max-w-sm sm:bottom-24"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="rounded-2xl border border-cyan-400/40 bg-[hsl(220,30%,12%)]/90 px-5 py-3 shadow-[0_0_20px_hsl(185,80%,48%,0.2)] backdrop-blur">
                <p className="text-center text-base font-extrabold text-cyan-200 sm:text-lg">
                  "Oh yeah? We'll see about that! Let's GO Guardian!"
                </p>
                <p className="mt-1 text-center text-xs font-bold text-cyan-400/50">— Byte</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
