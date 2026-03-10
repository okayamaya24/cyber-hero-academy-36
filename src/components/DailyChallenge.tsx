import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MINI_GAME_META, type MiniGameType, type AgeTier } from "@/data/missions";

import WordSearchGame from "@/components/minigames/WordSearchGame";
import PasswordBuilderGame from "@/components/minigames/PasswordBuilderGame";
import SortGame from "@/components/minigames/SortGame";
import SecretKeeperGame from "@/components/minigames/SecretKeeperGame";
import MemoryGame from "@/components/minigames/MemoryGame";
import BossBattleGame from "@/components/minigames/BossBattleGame";

import robotGuide from "@/assets/robot-guide.png";

const DAILY_GAME_POOL: MiniGameType[] = [
  "word-search",
  "password-builder",
  "sort-game",
  "secret-keeper",
  "memory",
  "boss-battle",
];

function getDailyGameType(childId: string): MiniGameType {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  const seed = childId + today;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return DAILY_GAME_POOL[Math.abs(hash) % DAILY_GAME_POOL.length];
}

interface DailyChallengeProps {
  childId: string;
  childAge: number;
}

export default function DailyChallenge({ childId, childAge }: DailyChallengeProps) {
  const [playing, setPlaying] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const queryClient = useQueryClient();

  const today = new Date().toISOString().slice(0, 10);
  const gameType = useMemo(() => getDailyGameType(childId), [childId]);
  const gameMeta = MINI_GAME_META[gameType];
  const ageTier: AgeTier = childAge <= 7 ? "junior" : childAge <= 10 ? "defender" : "guardian";

  const { data: challenge, isLoading } = useQuery({
    queryKey: ["daily_challenge", childId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_challenges" as any)
        .select("*")
        .eq("child_id", childId)
        .eq("challenge_date", today)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as { id: string; completed: boolean; points_awarded: number } | null;
    },
  });

  const isCompleted = challenge?.completed || justCompleted;

  const handleComplete = async (success: boolean) => {
    setPlaying(false);
    if (!success) return;

    const points = 20;

    if (challenge) {
      await supabase
        .from("daily_challenges" as any)
        .update({ completed: true, points_awarded: points } as any)
        .eq("id", (challenge as any).id);
    } else {
      await supabase.from("daily_challenges" as any).insert({
        child_id: childId,
        challenge_date: today,
        game_type: gameType,
        completed: true,
        points_awarded: points,
      } as any);
    }

    const { data: currentChild } = await supabase
      .from("child_profiles")
      .select("points")
      .eq("id", childId)
      .single();

    if (currentChild) {
      await supabase
        .from("child_profiles")
        .update({ points: currentChild.points + points })
        .eq("id", childId);
    }

    setJustCompleted(true);
    queryClient.invalidateQueries({ queryKey: ["daily_challenge", childId] });
    queryClient.invalidateQueries({ queryKey: ["child", childId] });
  };

  const defaultMissionId = "scam-detection";
  const guideImage = robotGuide;
  const guideName = "Robo Buddy";

  const renderGame = () => {
    switch (gameType) {
      case "word-search":
        return <WordSearchGame missionId={defaultMissionId} ageTier={ageTier} guideImage={guideImage} guideName={guideName} onComplete={handleComplete} />;
      case "password-builder":
        return <PasswordBuilderGame ageTier={ageTier} guideImage={guideImage} guideName={guideName} onComplete={handleComplete} />;
      case "sort-game":
        return <SortGame missionId={defaultMissionId} ageTier={ageTier} guideImage={guideImage} guideName={guideName} onComplete={handleComplete} />;
      case "secret-keeper":
        return <SecretKeeperGame ageTier={ageTier} guideImage={guideImage} guideName={guideName} onComplete={handleComplete} />;
      case "memory":
        return <MemoryGame ageTier={ageTier} guideImage={guideImage} guideName={guideName} onComplete={handleComplete} />;
      case "boss-battle":
        return <BossBattleGame missionId={defaultMissionId} ageTier={ageTier} guideImage={guideImage} guideName={guideName} onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  if (isLoading) return null;

  return (
    <AnimatePresence mode="wait">
      {playing ? (
        <motion.div
          key="game"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="rounded-2xl border-2 border-accent bg-card p-4 shadow-card"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> Daily Challenge: {gameMeta.label}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setPlaying(false)}>
              Close
            </Button>
          </div>
          {renderGame()}
        </motion.div>
      ) : (
        <motion.div
          key="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`relative overflow-hidden rounded-2xl border-2 p-5 shadow-card transition-all ${
            isCompleted
              ? "border-secondary/50 bg-secondary/5"
              : "border-accent bg-gradient-to-r from-accent/10 via-card to-primary/10"
          }`}
        >
          {/* Decorative sparkles */}
          {!isCompleted && (
            <div className="absolute -top-2 -right-2 text-4xl opacity-20 animate-pulse">✨</div>
          )}

          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl ${
                isCompleted ? "bg-secondary/20" : "bg-accent/20"
              }`}
            >
              {isCompleted ? "✅" : gameMeta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg">Daily Cyber Challenge</h3>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-bold text-secondary">
                    <CheckCircle2 className="h-3 w-3" /> Completed!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-accent">
                    <Star className="h-3 w-3" /> +20 Points
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isCompleted
                  ? "Great job! Come back tomorrow for a new challenge! 🎉"
                  : `Today's challenge: ${gameMeta.label} ${gameMeta.emoji} — Can you beat it?`}
              </p>
            </div>
            {!isCompleted && (
              <Button
                variant="hero"
                size="sm"
                className="shrink-0"
                onClick={() => {
                  // Create the record if it doesn't exist
                  if (!challenge) {
                    supabase.from("daily_challenges" as any).insert({
                      child_id: childId,
                      challenge_date: today,
                      game_type: gameType,
                      completed: false,
                      points_awarded: 0,
                    } as any).then(() => {
                      queryClient.invalidateQueries({ queryKey: ["daily_challenge", childId] });
                    });
                  }
                  setPlaying(true);
                }}
              >
                <Zap className="mr-1 h-4 w-4" /> Play Now!
              </Button>
            )}
          </div>

          {justCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-xl bg-secondary/10 p-3 text-center"
            >
              <span className="text-2xl">🎉</span>
              <p className="font-bold text-secondary">+20 Points Earned!</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
