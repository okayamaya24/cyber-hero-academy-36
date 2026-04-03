import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, CheckCircle2, XCircle, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WORLDS, getDifficultyTier, type ZoneContent } from "@/data/adventureZones";
import ByteSidekick from "@/components/adventure/ByteSidekick";
import LockAndLearnGame from "@/components/minigames/LockAndLearnGame";
import StrongOrSmashGame from "@/components/minigames/StrongOrSmashGame";
import PasswordChefGame from "@/components/minigames/PasswordChefGame";

type Screen = "story" | "minigame" | "challenge" | "complete";

export default function ZoneExperiencePage() {
  const { worldId, zoneId } = useParams<{ worldId: string; zoneId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeChildId } = useAuth();

  const [screen, setScreen] = useState<Screen>("story");
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [byteMsg, setByteMsg] = useState<string | null>(null);
  const [miniGameDone, setMiniGameDone] = useState(false);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("age, points")
        .eq("id", activeChildId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const handleMiniGameComplete = useCallback((_score: number, _total: number) => {
    setMiniGameDone(true);
  }, []);

  const world = WORLDS.find((w) => w.id === worldId);
  const zone = world?.zones.find((z) => z.id === zoneId);
  const tier = child ? getDifficultyTier(child.age) : "hero";
  const content: ZoneContent | undefined = zone?.content[tier];

  if (!world || !zone || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Zone not found.</p>
      </div>
    );
  }

  const questions = content.questions;
  const totalQ = questions.length;

    if (answered !== null) return;
    setAnswered(idx);
    const correct = idx === questions[currentQ].correctIndex;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentQ + 1 < totalQ) {
        setCurrentQ((q) => q + 1);
        setAnswered(null);
      } else {
        handleComplete(correct ? score + 1 : score);
      }
    }, 1200);
  };

  const handleComplete = async (finalScore: number) => {
    const stars = finalScore === totalQ ? 3 : finalScore >= totalQ * 0.6 ? 2 : 1;
    setScore(finalScore);
    setScreen("complete");
    setByteMsg(content.completeMessage);

    if (activeChildId) {
      // Update mission progress
      await supabase.from("mission_progress").upsert(
        {
          child_id: activeChildId,
          mission_id: `${worldId}-${zoneId}`,
          status: "completed",
          score: finalScore,
          max_score: totalQ,
          stars_earned: stars,
          completed_at: new Date().toISOString(),
          current_question: totalQ,
        },
        { onConflict: "child_id,mission_id" }
      );

      // Update zone progress
      await supabase.from("zone_progress").upsert(
        {
          child_id: activeChildId,
          continent_id: worldId!,
          zone_id: zoneId!,
          status: "completed",
          stars_earned: stars,
          games_completed: 4,
          total_games: 4,
        },
        { onConflict: "child_id,zone_id" }
      );

      // Update points
      const newPoints = (child?.points ?? 0) + content.xpReward;
      await supabase
        .from("child_profiles")
        .update({ points: newPoints })
        .eq("id", activeChildId);

      queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
      queryClient.invalidateQueries({ queryKey: ["mission_progress", activeChildId] });
      queryClient.invalidateQueries({ queryKey: ["zone_progress", activeChildId, worldId] });
    }
  };




  const stars =
    screen === "complete"
      ? score === totalQ ? 3 : score >= totalQ * 0.6 ? 2 : 1
      : 0;

  const renderMiniGame = () => {
    const cfg = content.miniGame;
    switch (cfg.type) {
      case "lock-and-learn":
        return <LockAndLearnGame config={cfg} onComplete={handleMiniGameComplete} />;
      case "strong-or-smash":
        return <StrongOrSmashGame config={cfg} onComplete={handleMiniGameComplete} />;
      case "password-chef":
        return <PasswordChefGame config={cfg} onComplete={handleMiniGameComplete} />;
      default:
        return (
          <div className="text-center">
            <Gamepad2 className="mx-auto mb-4 h-16 w-16 text-primary" />
            <h2 className="text-2xl font-bold">Mini Game</h2>
            <p className="mt-2 text-muted-foreground">Coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(220,30%,8%)] text-white pb-24">
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${world.color} py-4`}>
        <div className="container mx-auto flex items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/adventure/${worldId}`)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">
              {zone.emoji} {zone.name}
            </h1>
            <p className="text-xs text-white/70">{world.name}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-6 max-w-2xl px-4">
        <AnimatePresence mode="wait">
          {/* ===== SCREEN 1: STORY ===== */}
          {screen === "story" && (
            <motion.div
              key="story"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="rounded-3xl border-2 border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <h2 className="text-2xl font-bold">{content.storyTitle}</h2>
              <div className="my-6 flex items-center justify-center rounded-2xl bg-white/5 py-12 text-6xl">
                {zone.emoji}
              </div>
              <p className="leading-relaxed text-white/70">{content.storyText}</p>
              <Button
                variant="hero"
                size="lg"
                className="mt-6 w-full"
                onClick={() => { setScreen("minigame"); setMiniGameDone(false); }}
              >
                Continue →
              </Button>
            </motion.div>
          )}

          {/* ===== SCREEN 2: MINI GAME ===== */}
          {screen === "minigame" && (
            <motion.div
              key="minigame"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="rounded-3xl border-2 border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              {renderMiniGame()}
              {miniGameDone && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    variant="hero"
                    size="lg"
                    className="mt-6 w-full"
                    onClick={() => {
                      setScreen("challenge");
                      setCurrentQ(0);
                      setScore(0);
                      setAnswered(null);
                    }}
                  >
                    Start Challenge Questions →
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ===== SCREEN 3: CHALLENGE QUESTIONS ===== */}
          {screen === "challenge" && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="rounded-3xl border-2 border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-white/50">
                  Question {currentQ + 1} of {totalQ}
                </span>
                <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-bold text-primary">
                  {score}/{currentQ} correct
                </span>
              </div>

              <h3 className="text-lg font-bold leading-snug">{questions[currentQ].question}</h3>

              <div className="mt-6 space-y-3">
                {questions[currentQ].options.map((opt, idx) => {
                  const isCorrect = idx === questions[currentQ].correctIndex;
                  const wasChosen = answered === idx;

                  let style = "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-primary/5";
                  if (answered !== null) {
                    if (isCorrect) style = "border-emerald-400/50 bg-emerald-400/10";
                    else if (wasChosen) style = "border-destructive/50 bg-destructive/10";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.97 }}
                      disabled={answered !== null}
                      onClick={() => handleAnswer(idx)}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold transition-colors ${style}`}
                    >
                      {answered !== null && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                      )}
                      {answered !== null && wasChosen && !isCorrect && (
                        <XCircle className="h-5 w-5 shrink-0 text-destructive" />
                      )}
                      <span>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ===== SCREEN 4: ZONE COMPLETE ===== */}
          {screen === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border-2 border-amber-400/20 bg-white/5 p-8 text-center backdrop-blur"
            >
              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                🏆
              </motion.div>
              <h2 className="mt-4 text-2xl font-bold">Zone Complete!</h2>
              <p className="mt-1 text-white/50">
                {zone.name} — {world.name}
              </p>

              <div className="my-6 flex justify-center gap-2">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: s * 0.2, type: "spring" }}
                  >
                    <Star
                      className={`h-10 w-10 ${s <= stars ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <p className="font-bold text-2xl text-primary">{score}/{totalQ}</p>
                  <p className="text-white/50">Correct</p>
                </div>
                <div>
                  <p className="font-bold text-2xl text-amber-400">+{content.xpReward}</p>
                  <p className="text-white/50">XP Earned</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => navigate(`/adventure/${worldId}`)}
                >
                  Back to Zones
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={() => navigate("/adventure")}
                >
                  Adventure Map
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ByteSidekick
        visible={!!byteMsg}
        message={byteMsg ?? undefined}
        onDismiss={() => setByteMsg(null)}
      />
    </div>
  );
}
