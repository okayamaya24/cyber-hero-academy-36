import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import keybreakerSrc from "@/assets/keybreaker-villain.png";
import byteSrc from "@/assets/byte-sidekick.png";

interface VillainIntroProps {
  onComplete: () => void;
}

type Phase =
  | "dark"
  | "villain-enter"
  | "villain-speak-1"
  | "villain-speak-2"
  | "byte-enter"
  | "byte-respond-1"
  | "byte-respond-2"
  | "villain-exit";

const PHASE_DURATIONS: Record<Phase, number> = {
  dark: 500,
  "villain-enter": 1000,
  "villain-speak-1": 2500,
  "villain-speak-2": 2500,
  "byte-enter": 800,
  "byte-respond-1": 2500,
  "byte-respond-2": 2500,
  "villain-exit": 800,
};

const PHASE_ORDER: Phase[] = [
  "dark",
  "villain-enter",
  "villain-speak-1",
  "villain-speak-2",
  "byte-enter",
  "byte-respond-1",
  "byte-respond-2",
  "villain-exit",
];

export default function VillainIntro({ onComplete }: VillainIntroProps) {
  const [phase, setPhase] = useState<Phase>("dark");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const currentIndex = PHASE_ORDER.indexOf(phase);
    const nextPhase = PHASE_ORDER[currentIndex + 1];

    const t = setTimeout(() => {
      if (nextPhase) {
        setPhase(nextPhase);
        if (nextPhase === "villain-enter") setShake(true);
      } else {
        onComplete();
      }
    }, PHASE_DURATIONS[phase]);

    return () => clearTimeout(t);
  }, [phase, onComplete]);

  useEffect(() => {
    if (shake) {
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
  }, [shake]);

  const villainVisible =
    phase === "villain-enter" ||
    phase === "villain-speak-1" ||
    phase === "villain-speak-2" ||
    phase === "byte-enter" ||
    phase === "byte-respond-1" ||
    phase === "byte-respond-2";

  const byteVisible = phase === "byte-enter" || phase === "byte-respond-1" || phase === "byte-respond-2";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
      animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute right-4 top-4 z-[110] rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white/60 backdrop-blur transition hover:bg-white/20 hover:text-white"
      >
        SKIP ›
      </button>

      {/* Scanlines overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }}
      />

      {/* Glitch effect during villain-speak-1 */}
      <AnimatePresence>
        {phase === "villain-speak-1" && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-[105]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.08, 0, 0.05, 0, 0.1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(168,85,247,0.3) 0px, transparent 2px, transparent 40px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Villain */}
      <AnimatePresence>
        {villainVisible && (
          <motion.div
            className="absolute flex flex-col items-center"
            initial={{ y: 400, scale: 1.4, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ x: 600, opacity: 0, scale: 0.6, rotate: 15 }}
            transition={{ type: "spring", stiffness: 180, damping: 16 }}
          >
            <motion.img
              src={keybreakerSrc}
              alt="The Keybreaker"
              className="h-56 w-auto sm:h-72 drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]"
              animate={{
                filter: [
                  "drop-shadow(0 0 40px rgba(168,85,247,0.5))",
                  "drop-shadow(0 0 70px rgba(168,85,247,0.9))",
                  "drop-shadow(0 0 40px rgba(168,85,247,0.5))",
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Villain speech 1 */}
      <AnimatePresence>
        {phase === "villain-speak-1" && (
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
                "Hahaha! I am THE KEYBREAKER — and no password in North America can hold me back! I've cracked thousands
                of accounts and yours is NEXT!"
              </motion.p>
              <p className="mt-1 text-center text-xs font-bold text-purple-400/60">— The Keybreaker</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Villain speech 2 */}
      <AnimatePresence>
        {phase === "villain-speak-2" && (
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
                "Passwords? Locks? They're all USELESS against me! This world belongs to me now!"
              </motion.p>
              <p className="mt-1 text-center text-xs font-bold text-purple-400/60">— The Keybreaker</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Byte character */}
      <AnimatePresence>
        {byteVisible && (
          <motion.img
            src={byteSrc}
            alt="Byte"
            className="absolute bottom-36 right-8 h-20 w-20 sm:h-24 sm:w-24 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
            initial={{ x: 200, opacity: 0, rotate: -20 }}
            animate={
              phase === "byte-respond-2"
                ? { x: 0, opacity: 1, rotate: [0, -8, 8, -8, 8, 0], y: [0, -10, 0, -10, 0] }
                : { x: 0, opacity: 1, rotate: 0 }
            }
            exit={{ x: 200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
        )}
      </AnimatePresence>

      {/* Byte response 1 */}
      <AnimatePresence>
        {phase === "byte-respond-1" && (
          <motion.div
            className="absolute bottom-20 mx-6 max-w-sm sm:bottom-24"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="rounded-2xl border border-cyan-400/40 bg-[hsl(220,30%,12%)]/90 px-5 py-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur">
              <p className="text-center text-base font-extrabold text-cyan-200 sm:text-lg">
                "Oh I don't THINK so! Guardian — this guy has been terrorizing North America long enough. It's time we
                shut him DOWN!"
              </p>
              <p className="mt-1 text-center text-xs font-bold text-cyan-400/50">— Byte</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Byte response 2 */}
      <AnimatePresence>
        {phase === "byte-respond-2" && (
          <motion.div
            className="absolute bottom-20 mx-6 max-w-sm sm:bottom-24"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="rounded-2xl border border-cyan-400/40 bg-[hsl(220,30%,12%)]/90 px-5 py-3 shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur">
              <p className="text-center text-base font-extrabold text-cyan-200 sm:text-lg">
                "You think passwords are useless? We're about to prove you VERY wrong. Ready Guardian? Let's go take
                back North America!"
              </p>
              <p className="mt-1 text-center text-xs font-bold text-cyan-400/50">— Byte</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
