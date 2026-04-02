import { motion } from "framer-motion";
import VillainSprite from "@/components/world/VillainSprite";

interface ZoneCompleteScreenProps {
  zoneName: string;
  zoneIcon: string;
  villainName: string;
  stars: number; // 1-3
  xpEarned: number;
  onBackToMap: () => void;
}

const VILLAIN_REACTIONS = [
  { text: "I'll get you next time!", anger: false },
  { text: "You got lucky this time!", anger: true },
  { text: "No... impossible!", anger: true },
];

export default function ZoneCompleteScreen({
  zoneName,
  zoneIcon,
  villainName,
  stars,
  xpEarned,
  onBackToMap,
}: ZoneCompleteScreenProps) {
  const reaction = VILLAIN_REACTIONS[Math.min(stars - 1, 2)];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(180deg, #050a14 0%, #0a2018 50%, #050a14 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Confetti for 3 stars */}
      {stars === 3 && <Confetti />}

      {/* Stars */}
      <div className="flex gap-3 mb-6">
        {[1, 2, 3].map((s) => (
          <motion.span
            key={s}
            initial={{ scale: 0, rotate: -180 }}
            animate={s <= stars ? { scale: 1, rotate: 0 } : { scale: 0.6, rotate: 0, opacity: 0.2 }}
            transition={{ delay: 0.3 + s * 0.3, type: "spring", stiffness: 200 }}
            className="text-4xl md:text-5xl"
          >
            ⭐
          </motion.span>
        ))}
      </div>

      {/* Zone secured */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="text-center mb-6"
      >
         <h1 className="text-2xl font-black text-white mb-1">
           {zoneIcon} {zoneName.toUpperCase()}
         </h1>
         <p className="text-lg font-bold text-[hsl(160_65%_60%)]">CHAPTER COMPLETE ✅</p>
      </motion.div>

      {/* XP */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.0, type: "spring" }}
        className="mb-8 rounded-xl bg-[hsl(195_80%_50%/0.15)] border border-[hsl(195_80%_50%/0.3)] px-6 py-3"
      >
        <p className="text-xl font-black text-[hsl(195_80%_70%)]">+{xpEarned} XP</p>
      </motion.div>

      {/* Villain reaction */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <motion.div animate={reaction.anger ? { x: [-2, 2, -2] } : {}} transition={{ repeat: Infinity, duration: 0.3 }}>
          <VillainSprite
            villainName={villainName}
            size={stars === 3 ? 40 : stars === 2 ? 55 : 70}
            menacing={stars === 1}
          />
        </motion.div>
        <p className="text-sm font-bold text-[hsl(0_80%_65%)] italic max-w-[200px]">"{reaction.text}"</p>
      </motion.div>

      {/* Back to map */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0 }}
        onClick={onBackToMap}
         className="rounded-xl border border-[hsl(195_80%_50%/0.4)] bg-[hsl(195_80%_50%/0.15)] px-8 py-3 font-bold text-[hsl(195_80%_70%)] text-sm tracking-wider"
       >
         ◄ CONTINUE ADVENTURE
      </motion.button>
    </motion.div>
  );
}

/** Simple confetti particles */
function Confetti() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: ["#00ffe7", "#f5c518", "#00ff88", "#ff6b9d", "#9b59b6"][i % 5],
    size: 4 + Math.random() * 6,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: -10,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          animate={{ y: [0, window.innerHeight + 20], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)], opacity: [1, 0] }}
          transition={{ delay: p.delay, duration: p.duration, ease: "easeIn", repeat: Infinity, repeatDelay: 1 }}
        />
      ))}
    </div>
  );
}
