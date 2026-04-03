import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, CheckCircle2, XCircle, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WORLDS, getDifficultyTier, type ZoneContent } from "@/data/adventureZones";
import ByteSidekick from "@/components/adventure/ByteSidekick";

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

  const handleAnswer = (idx: number) => {
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
    setScreen("complete");

    const reactions: Record<number, string> = {
      3: "🎉 PERFECT! You're a true Cyber Hero!",
      2: "Nice work, hero! Almost perfect!",
      1: "Good try! Practice makes perfect!",
    };
    setByteMsg(reactions[stars]);

    if (activeChildId) {
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

      const newPoints = (child?.points ?? 0) + content.xpReward;
      await supabase
        .from("child_profiles")
        .update({ points: newPoints })
        .eq("id", activeChildId);

      queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
      queryClient.invalidateQueries({ queryKey: ["mission_progress", activeChildId] });
    }
  };

  const stars =
    screen === "complete"
      ? score === totalQ
        ? 3
        : score >= totalQ * 0.6
          ? 2
          : 1
      : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-hero py-4">
        <div className="container mx-auto flex items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/adventure/${worldId}`)}
            className="text-primary-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-primary-foreground">
              {zone.emoji} {zone.name}
            </h1>
            <p className="text-xs text-primary-foreground/80">{world.name}</p>
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
              className="rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-card"
            >
              <h2 className="text-2xl font-bold">{content.storyTitle}</h2>
              <div className="my-6 flex items-center justify-center rounded-2xl bg-muted/50 py-12 text-6xl">
                {zone.emoji}
              </div>
              <p className="leading-relaxed text-muted-foreground">
                {content.storyText}
              </p>
              <Button
                variant="hero"
                size="lg"
                className="mt-6 w-full"
                onClick={() => setScreen("minigame")}
              >
                Continue →
              </Button>
            </motion.div>
          )}

          {/* ===== SCREEN 2: MINI GAME (placeholder) ===== */}
          {screen === "minigame" && (
            <motion.div
              key="minigame"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="rounded-3xl border-2 border-primary/20 bg-card p-6 text-center shadow-card"
            >
              <Gamepad2 className="mx-auto mb-4 h-16 w-16 text-primary" />
              <h2 className="text-2xl font-bold">Mini Game</h2>
              <p className="mt-2 text-muted-foreground">
                Interactive challenge coming soon!
              </p>
              <div className="my-8 rounded-2xl bg-muted/40 py-16 text-5xl">
                🎮
              </div>
              <Button
                variant="hero"
                size="lg"
                className="w-full"
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

          {/* ===== SCREEN 3: CHALLENGE QUESTIONS ===== */}
          {screen === "challenge" && (
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-card"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-muted-foreground">
                  Question {currentQ + 1} of {totalQ}
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  {score}/{currentQ} correct
                </span>
              </div>

              <h3 className="text-lg font-bold leading-snug">
                {questions[currentQ].question}
              </h3>

              <div className="mt-6 space-y-3">
                {questions[currentQ].options.map((opt, idx) => {
                  const isCorrect = idx === questions[currentQ].correctIndex;
                  const wasChosen = answered === idx;

                  let style = "border-border bg-card hover:border-primary/50 hover:bg-primary/5";
                  if (answered !== null) {
                    if (isCorrect) style = "border-secondary bg-secondary/10";
                    else if (wasChosen) style = "border-destructive bg-destructive/10";
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
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />
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
              className="rounded-3xl border-2 border-accent/30 bg-card p-8 text-center shadow-playful"
            >
              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
              >
                🏆
              </motion.div>
              <h2 className="mt-4 text-2xl font-bold">Zone Complete!</h2>
              <p className="mt-1 text-muted-foreground">
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
                      className={`h-10 w-10 ${s <= stars ? "fill-accent text-accent" : "text-muted"}`}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <p className="font-bold text-2xl text-primary">
                    {score}/{totalQ}
                  </p>
                  <p className="text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="font-bold text-2xl text-accent">
                    +{content.xpReward}
                  </p>
                  <p className="text-muted-foreground">XP Earned</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
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
