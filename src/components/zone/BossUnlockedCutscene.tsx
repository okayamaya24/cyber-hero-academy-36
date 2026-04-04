import { motion } from "framer-motion";
import VillainSprite from "@/components/world/VillainSprite";

interface BossUnlockedCutsceneProps {
  villainName: string;
  bossZoneName: string;
  villainTaunt: string;
  onFaceBoss: () => void;
  onReturnToMap: () => void;
}

export default function BossUnlockedCutscene({
  villainName,
  bossZoneName,
  villainTaunt,
  onFaceBoss,
  onReturnToMap,
}: BossUnlockedCutsceneProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(180deg, #1a0505 0%, #2a0a0a 50%, #0a0505 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Red pulse overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(0 80% 30% / 0.15) 0%, transparent 70%)" }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* Villain — LARGE */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 80 }}
        className="relative z-10 mb-4"
      >
        <motion.div animate={{ x: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 0.3 }}>
          <VillainSprite villainName={villainName} size={160} menacing />
        </motion.div>
      </motion.div>

      {/* Boss zone name slams in */}
      <motion.h1
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
        className="relative z-10 text-2xl md:text-3xl font-black text-[hsl(0_80%_65%)] text-center mb-3"
      >
        ⚔️ {bossZoneName.toUpperCase()} — NOW OPEN
      </motion.h1>

      {/* Villain taunt */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="relative z-10 text-sm font-bold text-[hsl(0_80%_70%)] italic text-center mx-8 mb-2"
      >
        "{villainTaunt}"
      </motion.p>

      {/* Dramatic text */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
        className="relative z-10 text-sm text-white/60 text-center mx-8 mb-10"
      >
        You've proven yourself, Guardian. Now face {villainName}!
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="relative z-10 flex flex-col gap-3"
      >
        <button
          onClick={onFaceBoss}
          className="rounded-xl border border-[hsl(0_80%_50%/0.5)] bg-[hsl(0_80%_50%/0.2)] px-8 py-3 font-bold text-[hsl(0_80%_70%)] text-lg tracking-wider"
        >
          <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
            ⚔️ FACE THE BOSS
          </motion.span>
        </button>
        <button
          onClick={onReturnToMap}
          className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm text-white/50 tracking-wider"
        >
          ◄ RETURN TO MAP
        </button>
      </motion.div>
    </motion.div>
  );
}
