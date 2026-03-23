import { useState } from "react";
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
  const [round, setRound] = useState<1 | 2>(1);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Defense round state
  const [defenseIndex, setDefenseIndex] = useState(0);
  const [defenseCorrect, setDefenseCorrect] = useState(0);
  const [defenseFeedback, setDefenseFeedback] = useState<string | null>(null);

  const [playerHP, setPlayerHP] = useState(100);
  const [villainHP, setVillainHP] = useState(100);
  const [done, setDone] = useState(false);

  const totalQuiz = content.quizQuestions.length;
  const totalDefense = content.defenseRound.items.length;

  // ─── QUIZ ROUND ─────────────────────────────
  const handleQuizSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowExplanation(true);
    const isCorrect = idx === content.quizQuestions[quizIndex].answer;
    if (isCorrect) {
      setQuizCorrect((c) => c + 1);
      setVillainHP((hp) => Math.max(0, hp - Math.floor(50 / totalQuiz)));
    } else {
      setPlayerHP((hp) => Math.max(0, hp - 10));
    }
  };

  const handleQuizNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (quizIndex + 1 >= totalQuiz) {
      setRound(2);
    } else {
      setQuizIndex((i) => i + 1);
    }
  };

  // ─── DEFENSE ROUND ─────────────────────────
  const handleDefenseAction = (action: string) => {
    if (defenseFeedback) return;
    const item = content.defenseRound.items[defenseIndex];
    let isCorrect = false;

    if (content.defenseRound.type === "shield-dodge") {
      isCorrect = action === item.correctAction;
    } else if (content.defenseRound.type === "scam-real") {
      isCorrect = (action === "SCAM") === item.isScam;
    } else if (content.defenseRound.type === "kindness") {
      isCorrect = action === item.kindResponse;
    }

    if (isCorrect) {
      setDefenseCorrect((c) => c + 1);
      setVillainHP((hp) => Math.max(0, hp - Math.floor(50 / totalDefense)));
      setDefenseFeedback("✅ " + (item.explanation || "Correct!"));
    } else {
      setPlayerHP((hp) => Math.max(0, hp - 8));
      setDefenseFeedback("❌ " + (item.explanation || "Not quite!"));
    }

    setTimeout(() => {
      setDefenseFeedback(null);
      if (defenseIndex + 1 >= totalDefense) {
        setDone(true);
        const totalCorrect = quizCorrect + (isCorrect ? defenseCorrect + 1 : defenseCorrect);
        const total = totalQuiz + totalDefense;
        const pct = totalCorrect / total;
        const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
        setTimeout(() => onComplete(true, stars), 1500);
      } else {
        setDefenseIndex((i) => i + 1);
      }
    }, 1500);
  };

  // ─── DONE ───────────────────────────────────
  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-6 py-12">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 0.8 }}>
          <VillainSprite villainName={villainName} size={96} menacing={false} />
        </motion.div>
        <h2 className="text-2xl font-bold text-[hsl(160_65%_60%)]">🏆 VILLAIN DEFEATED!</h2>
        <p className="text-sm text-white/60">{villainName} has been vanquished!</p>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => {
            const totalCorrect = quizCorrect + defenseCorrect;
            const total = totalQuiz + totalDefense;
            const pct = totalCorrect / total;
            const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1;
            return <span key={s} className={`text-3xl ${s <= stars ? "" : "opacity-20"}`}>⭐</span>;
          })}
        </div>
      </motion.div>
    );
  }

  const q = content.quizQuestions[quizIndex];
  const defItem = content.defenseRound.items[defenseIndex];

  return (
    <div className="flex flex-col gap-4 py-4 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-white/50 text-xs">◄ RETREAT</Button>
        <div className="text-center">
          <span className="text-xs font-mono text-[hsl(0_80%_60%)]">⚔️ BOSS BATTLE — ROUND {round} OF 2</span>
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
          <p className="text-[10px] text-[hsl(0_80%_60%)] mb-1 text-right">💀 {villainName.toUpperCase()}</p>
          <Progress value={villainHP} className="h-3 bg-[hsl(210_40%_18%)]" />
        </div>
      </div>

      {/* Villain */}
      <div className="flex justify-center">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <VillainSprite villainName={villainName} size={80} menacing />
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
              {content.defenseRound.type === "shield-dodge" && (
                <p className="text-sm font-bold text-[hsl(0_80%_70%)]">{defItem.text}</p>
              )}
              {content.defenseRound.type === "scam-real" && (
                <p className="text-sm font-medium text-white">{defItem.preview}</p>
              )}
              {content.defenseRound.type === "kindness" && (
                <p className="text-sm font-bold text-[hsl(0_80%_70%)]">"{defItem.attack}"</p>
              )}
            </motion.div>
          </AnimatePresence>

          {defenseFeedback && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/70 mb-3">{defenseFeedback}</motion.p>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {content.defenseRound.type === "shield-dodge" && (
              <>
                <Button onClick={() => handleDefenseAction("SHIELD")} disabled={!!defenseFeedback}
                  className="bg-[hsl(195_80%_40%)] hover:bg-[hsl(195_80%_35%)] text-white font-bold">🛡️ SHIELD</Button>
                <Button onClick={() => handleDefenseAction("DODGE")} disabled={!!defenseFeedback}
                  className="bg-[hsl(45_80%_40%)] hover:bg-[hsl(45_80%_35%)] text-white font-bold">⚡ DODGE</Button>
              </>
            )}
            {content.defenseRound.type === "scam-real" && (
              <>
                <Button onClick={() => handleDefenseAction("SCAM")} disabled={!!defenseFeedback}
                  className="bg-[hsl(0_70%_40%)] hover:bg-[hsl(0_70%_35%)] text-white font-bold">🚨 SCAM</Button>
                <Button onClick={() => handleDefenseAction("REAL")} disabled={!!defenseFeedback}
                  className="bg-[hsl(160_60%_35%)] hover:bg-[hsl(160_60%_30%)] text-white font-bold">✅ REAL</Button>
              </>
            )}
            {content.defenseRound.type === "kindness" && (
              <>
                {[defItem.kindResponse, ...(defItem.wrongResponses || [])].sort(() => Math.random() - 0.5).map((resp: string, i: number) => (
                  <Button key={i} onClick={() => handleDefenseAction(resp)} disabled={!!defenseFeedback}
                    className="bg-[hsl(210_40%_18%)] hover:bg-[hsl(210_40%_25%)] border border-[hsl(195_80%_50%/0.15)] text-white font-medium text-xs px-4 py-2">
                    {resp}
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
