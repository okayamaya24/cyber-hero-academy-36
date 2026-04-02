import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import VillainSprite from "@/components/world/VillainSprite";
import NarrativeChoice from "@/components/zone/NarrativeChoice";
import { getZoneNarrativeChoices } from "@/data/narrativeChoices";

interface ZoneStoryPanelProps {
  villainName: string;
  narration: string;
  villainTaunt: string;
  gameIndex: number; // 0-3, used for villain anger
  zoneId?: string;
  onContinue: () => void;
}

export default function ZoneStoryPanel({
  villainName,
  narration,
  villainTaunt,
  gameIndex,
  zoneId,
  onContinue,
}: ZoneStoryPanelProps) {
  const [showChoice, setShowChoice] = useState(false);
  const narrativeChoices = getZoneNarrativeChoices(zoneId || "");
  const storyChoice = narrativeChoices?.storyChoices?.[gameIndex];
  // Auto-dismiss after 8 seconds (longer if there's a choice)
  useEffect(() => {
    if (storyChoice) return; // don't auto-dismiss when there's a choice
    const t = setTimeout(onContinue, 6000);
    return () => clearTimeout(t);
  }, [onContinue, storyChoice]);

  const villainSize = Math.max(40, 60 - gameIndex * 8); // shrinks as player wins

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onContinue} />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-lg mx-4 mb-8 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_10%/0.95)] p-5 backdrop-blur-md"
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="flex items-start gap-4">
          {/* Villain reaction */}
          <motion.div
            animate={gameIndex >= 2 ? { x: [-2, 2, -2], rotate: [-3, 3, -3] } : {}}
            transition={{ repeat: Infinity, duration: 0.4 }}
          >
            <VillainSprite villainName={villainName} size={villainSize} menacing={gameIndex < 2} />
          </motion.div>

          <div className="flex-1">
            {/* Narration */}
            <p className="text-sm text-white/80 mb-2 leading-relaxed">{narration}</p>

            {/* Villain taunt */}
            <p className="text-xs font-bold text-[hsl(0_80%_65%)] italic">"{villainTaunt}"</p>
          </div>
        </div>

        <motion.button
          onClick={onContinue}
          className="mt-4 w-full rounded-lg bg-[hsl(195_80%_50%/0.2)] border border-[hsl(195_80%_50%/0.3)] py-2 text-sm font-bold text-[hsl(195_80%_70%)] tracking-wider"
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          CONTINUE ▶
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
