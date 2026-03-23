import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import VillainSprite from "@/components/world/VillainSprite";
import BossDodgeRound from "./BossDodgeRound";
import BossRapidFireRound from "./BossRapidFireRound";
import BossMazeRound from "./BossMazeRound";
import type { BossBattleContent } from "@/data/zoneGames";

interface Props {
  villainName: string;
  bossName: string;
  content: BossBattleContent;
  onComplete: (won: boolean, stars: number) => void;
  onBack: () => void;
}

export default function BossBattleScreen({ villainName, bossName, content, onComplete, onBack }: Props) {
  const totalRounds = 3;
  const [round, setRound] = useState(1);
  const [playerHP, setPlayerHP] = useState(100);
  const [villainHP, setVillainHP] = useState(100);
  const [done, setDone] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [totalDamageDealt, setTotalDamageDealt] = useState(0);
  const isFinal = !!content.isFinalBoss;

  // Villain taunt based on HP
  const villainTaunt = useMemo(() => {
    if (villainHP > 75) return "You don't stand a chance!";
    if (villainHP > 50) return "Lucky shot... but I'm far from done!";
    if (villainHP > 25) return "No... this can't be happening!";
    return "I won't... be defeated...!";
  }, [villainHP]);

  const calcStars = useCallback(() => {
    if (playerHP >= 70) return 3;
    if (playerHP >= 40) return 2;
    return 1;
  }, [playerHP]);

  // Build dodge threats from defense round items
  const dodgeThreats = useMemo(() => {
    const items = content.defenseRound.items;
    return items.map((item: any) => {
      if (content.defenseRound.type === "shield-dodge") {
        return { text: item.text, isGood: item.correctAction === "DODGE" };
      }
      if (content.defenseRound.type === "scam-real") {
        return { text: item.preview || item.text, isGood: !item.isScam };
      }
      if (content.defenseRound.type === "kindness") {
        return { text: item.attack || item.text, isGood: false };
      }
      return { text: item.text || "Threat", isGood: false };
    });
  }, [content.defenseRound]);

  const handleRoundEnd = useCallback((roundNum: number) => (damageDealt: number, damageTaken: number) => {
    const hpDamageToVillain = Math.min(villainHP, Math.floor(damageDealt * 0.6));
    const hpDamageToPlayer = Math.min(playerHP, Math.floor(damageTaken * 0.4));

    setVillainHP((hp) => Math.max(0, hp - hpDamageToVillain));
    setPlayerHP((hp) => Math.max(0, hp - hpDamageToPlayer));
    setTotalDamageDealt((d) => d + damageDealt);

    setTransitioning(true);
    setTimeout(() => {
      setTransitioning(false);
      if (roundNum < totalRounds) {
        setRound(roundNum + 1);
      } else {
        setDone(true);
        setTimeout(() => onComplete(true, playerHP > 40 ? (playerHP > 70 ? 3 : 2) : 1), isFinal ? 4000 : 1500);
      }
    }, 1500);
  }, [villainHP, playerHP, isFinal, onComplete]);

  // ─── VICTORY ────────────────────────────────
  if (done) {
    const stars = calcStars();
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 py-8">
        {isFinal && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 1.2 }} className="text-6xl mb-2">
            🏆
          </motion.div>
        )}
        <motion.div animate={isFinal ? { scale: [1, 0.5, 0], rotate: [0, 180, 360] } : { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 0.8 }}>
          <VillainSprite villainName={villainName} size={isFinal ? 120 : 96} menacing={false} />
        </motion.div>
        <h2 className={`text-2xl font-bold ${isFinal ? "text-[hsl(45_90%_60%)]" : "text-[hsl(160_65%_60%)]"}`}>
          {isFinal ? "👑 SHADOWBYTE DEFEATED!" : "🏆 VILLAIN DEFEATED!"}
        </h2>
        {isFinal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center">
            <p className="text-sm text-[hsl(45_90%_70%)] font-bold mb-1">🏆 CYBER GUARDIAN MASTER CERTIFICATE UNLOCKED</p>
            <p className="text-xs text-white/50">7/7 VILLAINS DEFEATED — You are a TRUE Cyber Guardian!</p>
          </motion.div>
        )}
        <p className="text-sm text-white/60">{villainName} has been vanquished!</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + s * 0.2 }}
              className={`text-3xl ${s <= stars ? "" : "opacity-20"}`}>⭐</motion.span>
          ))}
        </div>
        {isFinal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-4 text-5xl">
            🎉🎊🎉
          </motion.div>
        )}
      </motion.div>
    );
  }

  // ─── Round transition ──────────────────────
  if (transitioning) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-4">
        <VillainSprite villainName={villainName} size={80} menacing />
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }}
          className="text-sm font-bold text-[hsl(0_80%_60%)] italic">"{villainTaunt}"</motion.p>
        <p className="text-xs text-white/40 font-mono">ROUND {round + 1} INCOMING...</p>
      </motion.div>
    );
  }

  const roundLabels = ["⚔️ DODGE ATTACKS", "⚡ RAPID FIRE", "🗺️ MAZE STRIKE"];

  return (
    <div className="flex flex-col gap-4 py-4 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-white/50 text-xs">◄ RETREAT</Button>
        <div className="text-center">
          <span className={`text-xs font-mono ${isFinal ? "text-[hsl(45_90%_60%)]" : "text-[hsl(0_80%_60%)]"}`}>
            {isFinal ? "⚔️ FINAL BOSS BATTLE" : "⚔️ BOSS BATTLE"} — ROUND {round}/{totalRounds}
          </span>
          <h2 className="text-lg font-bold text-white">{bossName}</h2>
          <p className="text-[10px] text-white/40">{roundLabels[round - 1]}</p>
        </div>
        <div className="w-20" />
      </div>

      {/* Health Bars */}
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-[10px] text-[hsl(195_80%_60%)] mb-1">🦸 YOU — {playerHP}HP</p>
          <div className="h-3 rounded-full bg-[hsl(210_40%_18%)] overflow-hidden">
            <motion.div className="h-full rounded-full bg-[hsl(195_80%_50%)]" animate={{ width: `${playerHP}%` }} />
          </div>
        </div>
        <div className="flex-1">
          <p className={`text-[10px] mb-1 text-right ${isFinal ? "text-[hsl(270_80%_60%)]" : "text-[hsl(0_80%_60%)]"}`}>
            💀 {villainName.toUpperCase()} — {villainHP}HP
          </p>
          <div className="h-3 rounded-full bg-[hsl(210_40%_18%)] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: isFinal ? "hsl(270 80% 50%)" : "hsl(0 70% 50%)" }}
              animate={{ width: `${villainHP}%` }}
            />
          </div>
        </div>
      </div>

      {/* Villain (smaller during gameplay) */}
      <div className="flex justify-center">
        <motion.div
          animate={{
            y: [0, -5, 0],
            filter: villainHP < 25 ? ["brightness(1)", "brightness(1.5)", "brightness(1)"] : undefined,
          }}
          transition={{ repeat: Infinity, duration: villainHP < 50 ? 1 : 2 }}
        >
          <VillainSprite villainName={villainName} size={isFinal ? 72 : 56} menacing />
        </motion.div>
      </div>

      {/* Round Content */}
      {round === 1 && (
        <BossDodgeRound threats={dodgeThreats} onRoundEnd={handleRoundEnd(1)} />
      )}
      {round === 2 && (
        <BossRapidFireRound
          questions={content.quizQuestions}
          timePerQuestion={4}
          onRoundEnd={handleRoundEnd(2)}
        />
      )}
      {round === 3 && (
        <BossMazeRound
          size={isFinal ? 11 : 9}
          onRoundEnd={handleRoundEnd(3)}
        />
      )}
    </div>
  );
}
