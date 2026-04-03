import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import byteSrc from "@/assets/byte-sidekick.png";
import { WORLDS, type DifficultyTier } from "@/data/adventureZones";

interface AdventureCutsceneProps {
  tier: DifficultyTier;
  onComplete: () => void;
}

const MISSION_BRIEFINGS: Record<DifficultyTier, string> = {
  junior:
    "Guardian! Oh no oh no oh no! 7 super sneaky villains are causing chaos ALL over the world! They're stealing passwords, sending fake messages, and causing trouble everywhere! We need a Cyber Hero — and that's YOU! Are you ready to save the world?!",
  hero:
    "Guardian — we've got a serious situation. 7 villains have launched attacks across every continent. Stolen data, cracked passwords, phishing traps — it's everywhere. The world needs a Cyber Hero. Your training starts NOW.",
  elite:
    "Cyber Hero — threat level critical. 7 sophisticated villains have simultaneously launched cyberattacks across all 7 continents. This is a coordinated operation and we need you to shut it down. Your mission begins immediately.",
};

const CONTINENT_REVEAL_ORDER = [
  { id: "north-america", x: "22%", y: "30%" },
  { id: "europe",        x: "48%", y: "28%" },
  { id: "africa",        x: "50%", y: "55%" },
  { id: "asia",          x: "68%", y: "32%" },
  { id: "south-america", x: "30%", y: "62%" },
  { id: "australia",     x: "78%", y: "65%" },
  { id: "antarctica",    x: "50%", y: "88%" },
];

type CutsceneStep = "dark" | "byte-enter" | "briefing" | "map-reveal" | "dramatic-text" | "zoom-out";

export default function AdventureCutscene({ tier, onComplete }: AdventureCutsceneProps) {
  const [step, setStep] = useState<CutsceneStep>("dark");
  const [revealedContinents, setRevealedContinents] = useState(0);

  const advance = useCallback(() => {
    setStep((prev) => {
      const order: CutsceneStep[] = ["dark", "byte-enter", "briefing", "map-reveal", "dramatic-text", "zoom-out"];
      const idx = order.indexOf(prev);
      if (idx < order.length - 1) return order[idx + 1];
      return prev;
    });
  }, []);

  // Auto-advance timers
  useEffect(() => {
    if (step === "dark") {
      const t = setTimeout(advance, 1200);
      return () => clearTimeout(t);
    }
    if (step === "byte-enter") {
      const t = setTimeout(advance, 1800);
      return () => clearTimeout(t);
    }
    if (step === "zoom-out") {
      const t = setTimeout(onComplete, 1000);
      return () => clearTimeout(t);
    }
  }, [step, advance, onComplete]);

  // Continent reveal sequence
  useEffect(() => {
    if (step !== "map-reveal") return;
    if (revealedContinents >= 7) {
      const t = setTimeout(advance, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealedContinents((c) => c + 1), 500);
    return () => clearTimeout(t);
  }, [step, revealedContinents, advance]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "hsl(220 30% 4%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute right-6 top-6 z-[110] rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white/50 backdrop-blur transition-colors hover:bg-white/10 hover:text-white/80"
      >
        Skip ▸
      </button>

      {/* Scan-lines overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[101]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(185,80%,48%,0.03) 2px, hsla(185,80%,48%,0.03) 4px)",
        }}
      />

      {/* ── Step 1: Dark with hum ── */}
      <AnimatePresence>
        {step === "dark" && (
          <motion.div
            key="dark"
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="h-1 w-40 rounded-full bg-cyan-400/60"
              animate={{ scaleX: [0.3, 1, 0.3], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 2: Byte flies in ── */}
      <AnimatePresence>
        {(step === "byte-enter" || step === "briefing") && (
          <motion.div
            key="byte-fly"
            className="absolute z-[103] flex flex-col items-center"
            initial={{ x: "-120vw", rotate: -20, scale: 0.6 }}
            animate={{ x: 0, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
          >
            {/* Glow ring */}
            <motion.div
              className="absolute -inset-6 rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(185,80%,48%,0.25), transparent 70%)",
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.img
              src={byteSrc}
              alt="Byte"
              className="relative h-28 w-28 drop-shadow-[0_0_20px_hsla(185,80%,48%,0.5)] sm:h-36 sm:w-36"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 3: Briefing text ── */}
      <AnimatePresence>
        {step === "briefing" && (
          <motion.div
            key="briefing"
            className="absolute inset-x-4 bottom-24 z-[104] mx-auto max-w-2xl sm:bottom-32"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="rounded-2xl border border-cyan-400/30 bg-[hsl(220,30%,10%)]/90 px-6 py-5 shadow-[0_0_40px_hsla(185,80%,48%,0.15)] backdrop-blur-sm">
              <p className="text-sm font-semibold leading-relaxed text-white sm:text-base">
                {MISSION_BRIEFINGS[tier]}
              </p>
            </div>
            <button
              onClick={advance}
              className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 transition-colors hover:bg-cyan-400/20"
            >
              Continue ▸
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 4: World map reveal ── */}
      <AnimatePresence>
        {(step === "map-reveal" || step === "dramatic-text") && (
          <motion.div
            key="map"
            className="absolute inset-0 z-[102] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Globe wireframe */}
            <motion.div
              className="relative h-[70vh] w-[90vw] max-w-3xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Background globe circle */}
              <div
                className="absolute inset-0 m-auto h-72 w-72 rounded-full border border-cyan-400/20 sm:h-96 sm:w-96"
                style={{
                  background:
                    "radial-gradient(circle, hsla(220,30%,12%,1) 0%, hsla(220,30%,6%,1) 100%)",
                  boxShadow: "0 0 80px hsla(185,80%,48%,0.1)",
                }}
              />

              {/* Continent pins */}
              {CONTINENT_REVEAL_ORDER.map((pos, i) => {
                const world = WORLDS.find((w) => w.id === pos.id)!;
                const visible = i < revealedContinents;
                return (
                  <motion.div
                    key={pos.id}
                    className="absolute z-10 flex flex-col items-center"
                    style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  >
                    {/* Pulse ring */}
                    {visible && (
                      <motion.div
                        className="absolute h-12 w-12 rounded-full border border-cyan-400/40"
                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[hsl(220,30%,12%)] text-lg shadow-[0_0_12px_hsla(185,80%,48%,0.3)]">
                      {world.villainEmoji}
                    </div>
                    <span className="mt-1 whitespace-nowrap text-[9px] font-bold uppercase tracking-wider text-cyan-300/80">
                      {world.villain}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 5: Dramatic text ── */}
      <AnimatePresence>
        {step === "dramatic-text" && (
          <motion.div
            key="dramatic"
            className="absolute inset-0 z-[105] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <h2
                className="text-3xl font-black uppercase tracking-widest text-white sm:text-5xl"
                style={{ textShadow: "0 0 40px hsla(185,80%,48%,0.4)" }}
              >
                7 VILLAINS. 7 WORLDS.
              </h2>
              <h2
                className="mt-2 text-3xl font-black uppercase tracking-widest text-cyan-400 sm:text-5xl"
                style={{ textShadow: "0 0 30px hsla(185,80%,48%,0.6)" }}
              >
                ONE CYBER HERO.
              </h2>
            </motion.div>
            {/* Auto-advance after 2.5s */}
            <AutoAdvance delay={2500} onAdvance={advance} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 6: Zoom out transition ── */}
      <AnimatePresence>
        {step === "zoom-out" && (
          <motion.div
            key="zoom"
            className="absolute inset-0 z-[106]"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 1.3 }}
            transition={{ duration: 1, ease: "easeIn" }}
            style={{ background: "hsl(220 30% 4%)" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Tiny helper — triggers a callback after a delay. */
function AutoAdvance({ delay, onAdvance }: { delay: number; onAdvance: () => void }) {
  useEffect(() => {
    const t = setTimeout(onAdvance, delay);
    return () => clearTimeout(t);
  }, [delay, onAdvance]);
  return null;
}
