import { motion, AnimatePresence } from "framer-motion";
import VillainSprite from "@/components/world/VillainSprite";

interface ZoneCutsceneIntroProps {
  villainName: string;
  zoneName: string;
  zoneIcon: string;
  storyNarration: string;
  villainTaunt: string;
  onStart: () => void;
}

export default function ZoneCutsceneIntro({
  villainName,
  zoneName,
  zoneIcon,
  storyNarration,
  villainTaunt,
  onStart,
}: ZoneCutsceneIntroProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(180deg, #050a14 0%, #0a1428 50%, #120a1e 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Villain */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
        className="mb-4"
      >
        <VillainSprite villainName={villainName} size={120} menacing />
      </motion.div>

      {/* Villain taunt bubble */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative mx-6 mb-6 max-w-sm rounded-xl border border-[hsl(0_70%_50%/0.3)] bg-[hsl(0_50%_15%/0.6)] px-5 py-3 text-center backdrop-blur-sm"
      >
        <p className="text-sm font-bold text-[hsl(0_80%_70%)] italic">"{villainTaunt}"</p>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-[hsl(0_50%_15%/0.6)] border-l border-t border-[hsl(0_70%_50%/0.3)]" />
      </motion.div>

      {/* Zone title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, type: "spring" }}
        className="text-2xl md:text-3xl font-black text-white text-center mb-2"
      >
        {zoneIcon} ENTERING: {zoneName.toUpperCase()}
      </motion.h1>

      {/* Story narration */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="text-sm text-white/60 text-center mx-8 max-w-md mb-10 leading-relaxed"
      >
        {storyNarration}
      </motion.p>

      {/* TAP TO BEGIN */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        onClick={onStart}
        className="relative rounded-xl border border-[hsl(195_80%_50%/0.4)] bg-[hsl(195_80%_50%/0.15)] px-8 py-3 font-bold text-[hsl(195_80%_70%)] text-lg tracking-wider"
      >
        <motion.span
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          ⚡ TAP TO BEGIN
        </motion.span>
      </motion.button>
    </motion.div>
  );
}
