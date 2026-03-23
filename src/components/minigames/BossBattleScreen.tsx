import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import VillainSprite from "@/components/world/VillainSprite";
import type { BossBattleContent } from "@/data/zoneGames";

interface Props {
  villainName: string;
  bossName: string;
  content: BossBattleContent;
  onComplete: (won: boolean, stars: number) => void;
  onBack: () => void;
}

export default function BossBattleScreen({ villainName, bossName, content, onComplete, onBack }: Props) {
  const totalRounds = content.finalRound ? 3 : 2;
  const [round, setRound] = useState(1);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const [defenseIndex, setDefenseIndex] = useState(0);
  const [defenseCorrect, setDefenseCorrect] = useState(0);
  const [defenseFeedback, setDefenseFeedback] = useState<string | null>(null);

  const [patternIndex, setPatternIndex] = useState(0);
  const [patternCorrect, setPatternCorrect] = useState(0);
  const [patternFeedback, setPatternFeedback] = useState<string | null>(null);

  const [playerHP, setPlayerHP] = useState(100);
  const [villainHP, setVillainHP] = useState(100);
  const [done, setDone] = useState(false);
  const [victory, setVictory] = useState(false);

  const isFinal = !!content.isFinalBoss;
  const totalQuiz = content.quizQuestions.length;
  const totalDefense = content.defenseRound.items.length;
  const totalPatterns = content.finalRound?.patterns.length || 0;

  const calcStars = () => {
    const total = totalQuiz + totalDefense + totalPatterns;
    const correct = quizCorrect + defenseCorrect + patternCorrect;
    const pct = correct / total;
    return pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
  };

  // ─── QUIZ ───────────────────────────────────
  const handleQuizSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    const isCorrect = idx === content.quizQuestions[quizIndex].answer;
    if (isCorrect) {
      setQuizCorrect((c) => c + 1);
      setVillainHP((hp) => Math.max(0, hp - Math.floor((isFinal ? 33 : 50) / totalQuiz)));
    } else {
      setPlayerHP((hp) => Math.max(0, hp - 10));
    }
  };

  const handleQuizNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (quizIndex + 1 >= totalQuiz) setRound(2);
    else setQuizIndex((i) => i + 1);
  };

  // ─── DEFENSE ────────────────────────────────
  const handleDefenseAction = (action: string) => {
    if (defenseFeedback) return;
    const item = content.defenseRound.items[defenseIndex];
    let isCorrect = false;
    if (content.defenseRound.type === "shield-dodge") isCorrect = action === item.correctAction;
    else if (content.defenseRound.type === "scam-real") isCorrect = (action === "SCAM") === item.isScam;
    else if (content.defenseRound.type === "kindness") isCorrect = action === item.kindResponse;

    if (isCorrect) {
      setDefenseCorrect((c) => c + 1);
      setVillainHP((hp) => Math.max(0, hp - Math.floor((isFinal ? 33 : 50) / totalDefense)));
      setDefenseFeedback("✅ " + (item.explanation || "Correct!"));
    } else {
      setPlayerHP((hp) => Math.max(0, hp - 8));
      setDefenseFeedback("❌ " + (item.explanation || "Not quite!"));
    }

    setTimeout(() => {
      setDefenseFeedback(null);
      if (defenseIndex + 1 >= totalDefense) {
        if (content.finalRound) setRound(3);
        else finishBattle();
      } else setDefenseIndex((i) => i + 1);
    }, 1500);
  };

  // ─── PATTERN (Round 3) ──────────────────────
  const handlePatternSelect = (answer: string) => {
    if (patternFeedback) return;
    const pattern = content.finalRound!.patterns[patternIndex];
    const isCorrect = answer === pattern.answer;
    if (isCorrect) {
      setPatternCorrect((c) => c + 1);
      setVillainHP((hp) => Math.max(0, hp - Math.floor(34 / totalPatterns)));
      setPatternFeedback("✅ Code cracked!");
    } else {
      setPlayerHP((hp) => Math.max(0, hp - 10));
      setPatternFeedback("❌ Wrong pattern!");
    }
    setTimeout(() => {
      setPatternFeedback(null);
      if (patternIndex + 1 >= totalPatterns) finishBattle();
      else setPatternIndex((i) => i + 1);
    }, 1200);
  };

  const finishBattle = () => {
    setDone(true);
    setVictory(true);
    setTimeout(() => onComplete(true, calcStars()), isFinal ? 4000 : 1500);
  };

  // ─── VICTORY ────────────────────────────────
  if (done) {
    const stars = calcStars();
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-4 py-8">
        {isFinal && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ duration: 1.2 }}
            className="text-6xl mb-2"
          >
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
            className="mt-4 text-5xl">
            🎉🎊🎉
          </motion.div>
        )}
      </motion.div>
    );
  }

  const q = content.quizQuestions[quizIndex];
  const defItem = content.defenseRound.items[defenseIndex];
  const pattern = content.finalRound?.patterns[patternIndex];

  return (
    <div className="flex flex-col gap-4 py-4 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-white/50 text-xs">◄ RETREAT</Button>
        <div className="text-center">
          <span className={`text-xs font-mono ${isFinal ? "text-[hsl(45_90%_60%)]" : "text-[hsl(0_80%_60%)]"}`}>
            ⚔️ {isFinal ? "FINAL " : ""}BOSS BATTLE — ROUND {round} OF {totalRounds}
          </span>
          <h2 className="text-lg font-bold text-white">{bossName}</h2>
        </div>
        <div className="w-20" />
      </div>

      {/* Health Bars */}
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-[10px] text-[hsl(195_80%_60%)] mb-1">🦸 YOU</p>
          <Progress value={playerHP} className="h-3 bg-[hsl(210_40%_18%)]" />
        </div>
        <div className="flex-1">
          <p className={`text-[10px] mb-1 text-right ${isFinal ? "text-[hsl(270_80%_60%)]" : "text-[hsl(0_80%_60%)]"}`}>
            💀 {villainName.toUpperCase()}
          </p>
          <Progress value={villainHP} className="h-3 bg-[hsl(210_40%_18%)]" />
        </div>
      </div>

      {/* Villain */}
      <div className="flex justify-center">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <VillainSprite villainName={villainName} size={isFinal ? 100 : 80} menacing />
        </motion.div>
      </div>

      {/* ROUND 1: Quiz */}
      {round === 1 && q && (
        <div>
          <p className="text-xs text-white/40 font-mono mb-2">QUESTION {quizIndex + 1}/{totalQuiz}</p>
          <h3 className="text-sm font-bold text-white mb-3">{q.q}</h3>
          <div className="flex flex-col gap-2">
            {q.choices.map((choice, idx) => {
              let cls = "bg-[hsl(210_40%_18%)] hover:bg-[hsl(210_40%_25%)] border border-[hsl(195_80%_50%/0.15)] text-white";
              if (selected !== null) {
                if (idx === q.answer) cls = "bg-[hsl(160_65%_30%)] border-[hsl(160_65%_50%/0.5)] text-white";
                else if (idx === selected) cls = "bg-[hsl(0_65%_30%)] border-[hsl(0_65%_50%/0.5)] text-white";
              }
              return (
                <button key={idx} onClick={() => handleQuizSelect(idx)} disabled={selected !== null}
                  className={`rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all border ${cls}`}>
                  {choice}
                </button>
              );
            })}
          </div>
          {showExplanation && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
              <p className="text-xs text-[hsl(195_80%_70%)] mb-2">💡 {q.explanation}</p>
              <Button onClick={handleQuizNext} size="sm" className="bg-[hsl(195_80%_50%)] text-white font-bold text-xs">
                {quizIndex + 1 >= totalQuiz ? "Start Defense Round →" : "Next →"}
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* ROUND 2: Defense */}
      {round === 2 && defItem && (
        <div className="text-center">
          <p className="text-xs text-white/40 font-mono mb-2">{content.defenseRound.title} — {defenseIndex + 1}/{totalDefense}</p>
          <AnimatePresence mode="wait">
            <motion.div key={defenseIndex} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }}
              className="rounded-xl border border-[hsl(0_80%_50%/0.3)] bg-[hsl(0_40%_14%/0.6)] px-5 py-4 mb-4">
              {content.defenseRound.type === "shield-dodge" && <p className="text-sm font-bold text-[hsl(0_80%_70%)]">{defItem.text}</p>}
              {content.defenseRound.type === "scam-real" && <p className="text-sm font-medium text-white">{defItem.preview}</p>}
              {content.defenseRound.type === "kindness" && <p className="text-sm font-bold text-[hsl(0_80%_70%)]">"{defItem.attack}"</p>}
            </motion.div>
          </AnimatePresence>
          {defenseFeedback && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/70 mb-3">{defenseFeedback}</motion.p>}
          <div className="flex flex-wrap justify-center gap-3">
            {content.defenseRound.type === "shield-dodge" && (
              <>
                <Button onClick={() => handleDefenseAction("SHIELD")} disabled={!!defenseFeedback} className="bg-[hsl(195_80%_40%)] hover:bg-[hsl(195_80%_35%)] text-white font-bold">🛡️ SHIELD</Button>
                <Button onClick={() => handleDefenseAction("DODGE")} disabled={!!defenseFeedback} className="bg-[hsl(45_80%_40%)] hover:bg-[hsl(45_80%_35%)] text-white font-bold">⚡ DODGE</Button>
              </>
            )}
            {content.defenseRound.type === "scam-real" && (
              <>
                <Button onClick={() => handleDefenseAction("SCAM")} disabled={!!defenseFeedback} className="bg-[hsl(0_70%_40%)] hover:bg-[hsl(0_70%_35%)] text-white font-bold">🚨 SCAM</Button>
                <Button onClick={() => handleDefenseAction("REAL")} disabled={!!defenseFeedback} className="bg-[hsl(160_60%_35%)] hover:bg-[hsl(160_60%_30%)] text-white font-bold">✅ REAL</Button>
              </>
            )}
            {content.defenseRound.type === "kindness" && (
              [defItem.kindResponse, ...(defItem.wrongResponses || [])].sort(() => Math.random() - 0.5).map((resp: string, i: number) => (
                <Button key={i} onClick={() => handleDefenseAction(resp)} disabled={!!defenseFeedback}
                  className="bg-[hsl(210_40%_18%)] hover:bg-[hsl(210_40%_25%)] border border-[hsl(195_80%_50%/0.15)] text-white font-medium text-xs px-4 py-2">
                  {resp}
                </Button>
              ))
            )}
          </div>
        </div>
      )}

      {/* ROUND 3: Pattern Breaking (Final Boss only) */}
      {round === 3 && pattern && (
        <div className="text-center">
          <p className="text-xs text-white/40 font-mono mb-2">{content.finalRound!.title} — {patternIndex + 1}/{totalPatterns}</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            {pattern.sequence.map((s, i) => (
              <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}
                className="text-3xl bg-[hsl(210_40%_18%)] rounded-lg px-3 py-2">{s}</motion.span>
            ))}
            <span className="text-3xl text-[hsl(45_90%_60%)] animate-pulse">❓</span>
          </div>
          {patternFeedback && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/70 mb-3">{patternFeedback}</motion.p>}
          <div className="flex justify-center gap-3">
            {pattern.options.map((opt) => (
              <Button key={opt} onClick={() => handlePatternSelect(opt)} disabled={!!patternFeedback}
                className="bg-[hsl(210_40%_18%)] hover:bg-[hsl(210_40%_25%)] border border-[hsl(45_90%_50%/0.3)] text-white font-bold text-xl px-5 py-3">
                {opt}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
