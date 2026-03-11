import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, ArrowRight, Mail, ExternalLink, Flame, Lock as LockIcon, Gamepad2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import WordSearchGame from "@/components/minigames/WordSearchGame";
import PasswordBuilderGame from "@/components/minigames/PasswordBuilderGame";
import SortGame from "@/components/minigames/SortGame";
import SecretKeeperGame from "@/components/minigames/SecretKeeperGame";
import MemoryGame from "@/components/minigames/MemoryGame";
import BossBattleGame from "@/components/minigames/BossBattleGame";
import {
  MISSIONS,
  CAPTAIN_CYBER,
  MINI_GAME_META,
  type MissionDef,
  type Question,
  type LearningMode,
  type MiniGameType,
  type GuideCharacter,
  getMissionGames,
  getMissionLevels,
  getTotalGames,
  getAgeTier,
  getTierLabel,
  getTierEmoji,
  getPointsPerCorrect,
  LEARNING_MODE_CONFIG,
  LEVEL_NAMES,
} from "@/data/missions";
import { checkAndAwardBadges } from "@/lib/badges";

import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";
import robotGuide from "@/assets/robot-guide.png";
import heroCharacter from "@/assets/hero-character.png";

const ALL_GUIDES: Record<string, GuideCharacter> = {
  "Captain Cyber": {
    name: "Captain Cyber",
    image: heroCharacter,
    role: "Adventure Guide",
  },
  "Detective Whiskers": { name: "Detective Whiskers", image: detectiveCat },
  "Robo Buddy": { name: "Robo Buddy", image: robotGuide },
  "Professor Hoot": { name: "Professor Hoot", image: wiseOwl },
};

const MISSION_SUPPORT: Record<string, string[]> = {
  "scam-detection": ["Captain Cyber", "Professor Hoot"],
  "password-safety": ["Captain Cyber", "Professor Hoot"],
  "safe-websites": ["Detective Whiskers", "Robo Buddy"],
  "personal-info": ["Captain Cyber", "Detective Whiskers"],
  "malware-monsters": ["Robo Buddy", "Captain Cyber"],
  "phishy-messages": ["Detective Whiskers", "Professor Hoot"],
  "smart-sharing": ["Professor Hoot", "Captain Cyber"],
  "device-defender": ["Robo Buddy", "Detective Whiskers"],
  "cyber-clues": ["Detective Whiskers", "Captain Cyber"],
  "internet-detective": ["Professor Hoot", "Robo Buddy"],
};

function getSupportGuide(missionId: string, gameIndex: number): GuideCharacter {
  const supports = MISSION_SUPPORT[missionId] ?? ["Captain Cyber"];
  const name = supports[gameIndex % supports.length];
  return ALL_GUIDES[name] ?? ALL_GUIDES["Captain Cyber"];
}

const CUSTOM_GAME_TYPES: MiniGameType[] = [
  "word-search",
  "password-builder",
  "sort-game",
  "secret-keeper",
  "memory",
  "boss-battle",
];

const ENCOURAGEMENTS_PERFECT = [
  "You're a Cyber Superstar! 🌟",
  "PERFECT! The internet is safer because of YOU! 🛡️",
  "Incredible! You're a true Cyber Hero! 🦸",
  "Wow! Not a single mistake! You're amazing! 🏆",
];
const ENCOURAGEMENTS_GOOD = [
  "Great work, hero! You're learning fast! 🚀",
  "Amazing effort! Keep it up! 💪",
  "You're getting stronger every day! 🌟",
  "Nice job! Practice makes perfect! ⭐",
];
const ENCOURAGEMENTS_TRY = [
  "Nice try! Every hero keeps practicing! 💪",
  "Don't give up! You'll do even better next time! 🌈",
  "Good effort! Learning is what heroes do! 📚",
  "You're on your way! Try again to beat your score! 🎯",
];

const CAPTAIN_INTROS: Record<string, string> = {
  "scam-detection": "Welcome, hero! Detective Whiskers needs your help spotting scams. Are you ready? Let's go! 🕵️",
  "password-safety":
    "Hey there, champion! Robo Buddy has prepared some password challenges. Let's make your passwords unbreakable! 🤖",
  "safe-websites":
    "Time to explore the web safely! Detective Whiskers will guide you through dangerous sites. Stay sharp! 🔍",
  "personal-info": "Privacy is your superpower! Professor Hoot will teach you to guard your secrets. Let's begin! 🦉",
  "malware-monsters": "Malware is lurking! Robo Buddy will help you fight off viruses and trojans. Let's do this! 🤖",
  "phishy-messages": "Phishing attacks are everywhere! Detective Whiskers will teach you to spot them. Ready? 🐱",
  "smart-sharing": "Sharing is caring — but only when done safely! Professor Hoot will guide you! 🦉",
  "device-defender": "Your devices need protection! Robo Buddy knows all the tricks. Let's secure them! 🛡️",
  "cyber-clues": "Put on your detective hat! Detective Whiskers has mysteries to solve! 🔍",
  "internet-detective": "Not everything online is true! Professor Hoot will teach you to find the facts! 🦉",
};

function getEncouragement(score: number, total: number) {
  const ratio = score / total;
  const pool = ratio === 1 ? ENCOURAGEMENTS_PERFECT : ratio >= 0.6 ? ENCOURAGEMENTS_GOOD : ENCOURAGEMENTS_TRY;
  return pool[Math.floor(Math.random() * pool.length)];
}

function MiniGameTypeBadge({ type }: { type: MiniGameType }) {
  const meta = MINI_GAME_META[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold ${meta.color}`}
    >
      {meta.emoji} {meta.label}
    </span>
  );
}

function MessageCard({ q, isJunior }: { q: Question; isJunior: boolean }) {
  if (!q.sender) return null;

  return (
    <div
      className={`mb-6 overflow-hidden rounded-2xl border-2 border-border bg-background shadow-card ${
        isJunior ? "text-lg" : ""
      }`}
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card text-xl shadow-sm">
          {q.senderIcon || "📧"}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`truncate font-bold ${isJunior ? "text-base" : "text-sm"}`}>{q.sender}</p>
          {!isJunior && q.sender.includes("@") && (
            <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
              <Mail className="h-3 w-3" /> {q.sender}
            </p>
          )}
        </div>
      </div>

      {q.subject && (
        <div className="border-b border-border px-4 py-2">
          <p className={`font-bold ${isJunior ? "text-lg" : "text-sm"}`}>{q.subject}</p>
        </div>
      )}

      <div className="px-4 py-4">
        <p className={`leading-relaxed text-foreground ${isJunior ? "text-base" : "text-sm"}`}>{q.body}</p>

        {q.fakeLink && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="truncate font-mono text-xs">{q.fakeLink}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getModeAwareMissionProgress(progressRows: any[], missionId: string, expectedTotalGames: number) {
  const row = progressRows.find((p) => p.mission_id === missionId);
  if (!row) return null;

  if ((row.max_score ?? expectedTotalGames) !== expectedTotalGames) {
    return null;
  }

  return row;
}

export default function MissionsPage() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeMission, setActiveMission] = useState<MissionDef | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
  }, [user, activeChildId, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();

      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("mission_progress").select("*").eq("child_id", activeChildId!);

      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const age = child?.age ?? 7;
  const tier = getAgeTier(age);
  const tierLabel = getTierLabel(tier);
  const tierEmoji = getTierEmoji(tier);
  const pointsPerCorrect = getPointsPerCorrect(tier);
  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const modeConfig = LEARNING_MODE_CONFIG[learningMode];

  const getGames = (mission: MissionDef) => getMissionGames(mission, age, learningMode);

  const startMission = (mission: MissionDef) => {
    setActiveMission(mission);
    setShowIntro(true);

    const expectedTotalGames = getTotalGames(learningMode);
    const existing = getModeAwareMissionProgress(missionProgress, mission.id, expectedTotalGames);

    const games = getGames(mission);
    const startQ = existing?.status === "in_progress" ? Math.min(existing.current_question, games.length - 1) : 0;

    setCurrentQ(startQ);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(existing?.status === "in_progress" ? (existing.score ?? 0) : 0);
    setMissionComplete(false);
    setGameKey((k) => k + 1);
  };

  const beginPlay = () => setShowIntro(false);

  const resetMission = () => {
    setActiveMission(null);
    setMissionComplete(false);
    setShowIntro(false);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const handleCustomGameComplete = (correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    setSelectedAnswer(correct ? 0 : -1);
    setShowResult(true);
  };

  const handleAnswer = (idx: number) => {
    if (showResult || !activeMission) return;

    const games = getGames(activeMission);
    setSelectedAnswer(idx);
    setShowResult(true);

    if (idx === games[currentQ].correct) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = async () => {
    if (!activeMission || !activeChildId) return;

    const games = getGames(activeMission);
    const nextQ = currentQ + 1;
    const isLast = nextQ >= games.length;

    await supabase.from("mission_progress").upsert(
      {
        child_id: activeChildId,
        mission_id: activeMission.id,
        status: isLast ? "completed" : "in_progress",
        score,
        max_score: games.length,
        current_question: isLast ? games.length : nextQ,
        completed_at: isLast ? new Date().toISOString() : null,
      },
      { onConflict: "child_id,mission_id" },
    );

    if (isLast) {
      const pointsEarned = score * pointsPerCorrect;

      const { data: childData } = await supabase
        .from("child_profiles")
        .select("points, streak, level, last_activity_date")
        .eq("id", activeChildId)
        .single();

      if (childData) {
        const today = new Date().toISOString().split("T")[0];
        const newStreak = childData.last_activity_date === today ? childData.streak : childData.streak + 1;
        const newPoints = childData.points + pointsEarned;
        const newLevel = Math.floor(newPoints / 200) + 1;

        await supabase
          .from("child_profiles")
          .update({
            points: newPoints,
            streak: newStreak,
            level: newLevel,
            last_activity_date: today,
          })
          .eq("id", activeChildId);
      }

      await supabase.from("earned_badges").upsert(
        {
          child_id: activeChildId,
          badge_id: activeMission.badgeId,
          badge_name: activeMission.badgeName,
          badge_icon: activeMission.badgeIcon,
        },
        { onConflict: "child_id,badge_id" },
      );

      const { data: allProgress } = await supabase.from("mission_progress").select("*").eq("child_id", activeChildId);

      const { data: allBadges } = await supabase.from("earned_badges").select("*").eq("child_id", activeChildId);

      const completedMissionIds = (allProgress ?? []).filter((p) => p.status === "completed").map((p) => p.mission_id);

      const totalCompleted = (allProgress ?? []).reduce((acc, p) => acc + (p.score ?? 0), 0);

      await checkAndAwardBadges({
        childId: activeChildId,
        missionId: activeMission.id,
        score,
        totalGames: games.length,
        learningMode,
        streak: childData
          ? childData.last_activity_date === new Date().toISOString().split("T")[0]
            ? childData.streak
            : childData.streak + 1
          : 1,
        completedMissionIds,
        earnedBadgeIds: new Set((allBadges ?? []).map((b) => b.badge_id)),
        wordSearchWins: Math.floor(totalCompleted / 2),
        memoryWins: Math.floor(totalCompleted / 3),
        sortGameWins: Math.floor(totalCompleted / 2),
        secretKeeperWins: Math.floor(totalCompleted / 3),
        bossWins: completedMissionIds.length,
      });

      await queryClient.invalidateQueries({
        queryKey: ["mission_progress", activeChildId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["earned_badges", activeChildId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["child", activeChildId],
      });
      await queryClient.invalidateQueries({ queryKey: ["mission_progress"] });
      await queryClient.invalidateQueries({ queryKey: ["earned_badges"] });
      await queryClient.invalidateQueries({ queryKey: ["child"] });

      setMissionComplete(true);
    } else {
      setCurrentQ(nextQ);
      setSelectedAnswer(null);
      setShowResult(false);
      setGameKey((k) => k + 1);
    }
  };

  const getCurrentLevel = () => {
    if (!activeMission) return null;

    const gamesPerLevel = modeConfig.gamesPerLevel;
    const levelIndex = Math.floor(currentQ / gamesPerLevel);
    const gameInLevel = (currentQ % gamesPerLevel) + 1;

    return {
      levelIndex,
      levelName: LEVEL_NAMES[Math.min(levelIndex, 2)],
      gameInLevel,
      gamesPerLevel,
    };
  };

  if (activeMission && showIntro) {
    const levels = getMissionLevels(activeMission, age, learningMode, 0);
    const supportGuides = (MISSION_SUPPORT[activeMission.id] ?? []).map((n) => ALL_GUIDES[n]).filter(Boolean);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="rounded-3xl border-2 bg-card p-8 text-center shadow-playful">
            <motion.img
              src={CAPTAIN_CYBER.image}
              alt={CAPTAIN_CYBER.name}
              className="mx-auto mb-4 h-24 w-24 object-contain"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            />

            <Badge className="mb-3 border-0 bg-accent/20 text-accent">
              ⚡ {CAPTAIN_CYBER.name} · {CAPTAIN_CYBER.role}
            </Badge>

            <div className="mb-4 rounded-2xl bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">
                {CAPTAIN_INTROS[activeMission.id] || "Let's start this mission, hero!"}
              </p>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <img
                src={activeMission.guide.image}
                alt={activeMission.guide.name}
                className="h-12 w-12 object-contain"
              />
              <div className="text-left">
                <h2 className="text-xl font-bold">{activeMission.title}</h2>
                <p className="text-xs text-muted-foreground">Main Guide: {activeMission.guide.name}</p>
              </div>
            </div>

            {supportGuides.length > 0 && (
              <div className="mb-4 flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Support:</span>
                {supportGuides.map((g) => (
                  <div key={g.name} className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                    <img src={g.image} alt={g.name} className="h-5 w-5 object-contain" />
                    <span className="text-[10px] font-semibold">{g.name}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="mb-6 space-y-2">
              {levels.map((level) => (
                <div key={level.level} className="rounded-xl border bg-muted/30 p-3 text-left">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-lg">{level.emoji}</span>
                    <span className="text-sm font-bold">
                      Level {level.level}: {level.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {level.miniGameTypes.map((type, i) => (
                      <MiniGameTypeBadge key={i} type={type} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetMission}>
                ← Back
              </Button>
              <Button variant="hero" className="flex-1 text-base" onClick={beginPlay}>
                Let's Go! 🚀
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (activeMission && !missionComplete && !showIntro) {
    const games = getGames(activeMission);
    const q = games[currentQ];
    const isCustom = CUSTOM_GAME_TYPES.includes(q.miniGameType);
    const isJunior = tier === "junior";
    const hasMessageCard = !!q.sender;
    const runningPoints = score * pointsPerCorrect;
    const levelInfo = getCurrentLevel();
    const gameMeta = MINI_GAME_META[q.miniGameType];
    const supportGuide = getSupportGuide(activeMission.id, currentQ);
    const isCorrect = isCustom ? selectedAnswer === 0 : selectedAnswer === q.correct;

    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="container mx-auto max-w-2xl px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={resetMission}
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                ← Back
              </button>

              <div className="text-center">
                <h2 className="text-sm font-bold">{activeMission.title}</h2>
                <div className="mt-0.5 flex items-center justify-center gap-2">
                  <Badge variant="outline" className="px-2 py-0 text-[10px]">
                    {tierEmoji} {tierLabel}
                  </Badge>
                  {levelInfo && (
                    <Badge className="border-0 bg-primary/10 px-2 py-0 text-[10px] text-primary">
                      {levelInfo.levelName}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm font-bold text-accent">
                <Star className="h-4 w-4" />
                {runningPoints}
              </div>
            </div>

            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  Game {currentQ + 1}/{games.length}
                  <MiniGameTypeBadge type={q.miniGameType} />
                </span>
                <span>{score} correct</span>
              </div>
              <Progress value={((currentQ + 1) / games.length) * 100} className="h-2" />
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-2xl px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`game-${gameKey}-${currentQ}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">{gameMeta.emoji}</span>
                <span className={`text-sm font-bold ${gameMeta.color}`}>{gameMeta.label}</span>
              </div>

              {isCustom && !showResult && (
                <>
                  {q.miniGameType === "word-search" && (
                    <WordSearchGame
                      key={gameKey}
                      missionId={activeMission.id}
                      ageTier={tier}
                      guideImage={activeMission.guide.image}
                      guideName={activeMission.guide.name}
                      onComplete={handleCustomGameComplete}
                    />
                  )}
                  {q.miniGameType === "password-builder" && (
                    <PasswordBuilderGame
                      key={gameKey}
                      ageTier={tier}
                      guideImage={activeMission.guide.image}
                      guideName={activeMission.guide.name}
                      onComplete={handleCustomGameComplete}
                    />
                  )}
                  {q.miniGameType === "sort-game" && (
                    <SortGame
                      key={gameKey}
                      missionId={activeMission.id}
                      ageTier={tier}
                      guideImage={activeMission.guide.image}
                      guideName={activeMission.guide.name}
                      onComplete={handleCustomGameComplete}
                    />
                  )}
                  {q.miniGameType === "secret-keeper" && (
                    <SecretKeeperGame
                      key={gameKey}
                      ageTier={tier}
                      guideImage={activeMission.guide.image}
                      guideName={activeMission.guide.name}
                      onComplete={handleCustomGameComplete}
                    />
                  )}
                  {q.miniGameType === "memory" && (
                    <MemoryGame
                      key={gameKey}
                      ageTier={tier}
                      guideImage={activeMission.guide.image}
                      guideName={activeMission.guide.name}
                      onComplete={handleCustomGameComplete}
                    />
                  )}
                  {q.miniGameType === "boss-battle" && (
                    <BossBattleGame
                      key={gameKey}
                      missionId={activeMission.id}
                      ageTier={tier}
                      guideImage={activeMission.guide.image}
                      guideName={activeMission.guide.name}
                      onComplete={handleCustomGameComplete}
                    />
                  )}
                </>
              )}

              {!isCustom && !showResult && (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <img
                      src={activeMission.guide.image}
                      alt={activeMission.guide.name}
                      className="h-12 w-12 object-contain"
                    />
                    <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2">
                      <p className={`font-semibold ${isJunior ? "text-base" : "text-sm"}`}>{q.question}</p>
                    </div>
                  </div>

                  {hasMessageCard && <MessageCard q={q} isJunior={isJunior} />}

                  <div
                    className={`grid gap-3 ${
                      q.options.length === 2 ? "grid-cols-2" : q.options.length === 3 ? "grid-cols-3" : "grid-cols-1"
                    }`}
                  >
                    {q.options.map((opt, idx) => {
                      let emoji = "";

                      if (q.miniGameType === "email-detective" || q.miniGameType === "quiz") {
                        const lower = opt.toLowerCase();
                        const isSafe =
                          lower === "safe" ||
                          lower === "yes!" ||
                          lower === "okay" ||
                          lower === "good idea!" ||
                          lower === "smart choice!";
                        const isScam =
                          lower === "scam" ||
                          lower === "no way!" ||
                          lower === "bad idea!" ||
                          lower === "keep it secret!" ||
                          lower === "don't share it!";

                        emoji = isSafe ? "✅" : isScam ? "🚫" : lower === "unsure" ? "🤔" : "";
                      } else if (q.miniGameType === "scenario") {
                        emoji = "🎭";
                      } else {
                        emoji = MINI_GAME_META[q.miniGameType]?.emoji || "";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          className="group relative cursor-pointer rounded-2xl border-2 border-border bg-card p-5 text-center font-bold transition-all hover:scale-[1.03] hover:border-primary/50 hover:shadow-md active:scale-95"
                        >
                          <span className={`mb-1 block ${isJunior ? "text-4xl" : "text-2xl"}`}>{emoji}</span>
                          <span className={isJunior ? "text-lg" : "text-base"}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {showResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                  <div
                    className={`rounded-2xl p-5 ${
                      isCorrect
                        ? "border-2 border-secondary/30 bg-secondary/10"
                        : "border-2 border-accent/30 bg-accent/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={supportGuide.image}
                        alt={supportGuide.name}
                        className="h-10 w-10 shrink-0 object-contain"
                      />
                      <div>
                        <p className="mb-0.5 text-xs text-muted-foreground">{supportGuide.name} says:</p>
                        <p className="text-base font-bold">{isCorrect ? "🎉 Great job!" : "😊 Nice try!"}</p>

                        {!isCustom && (
                          <p
                            className={`mt-1 leading-relaxed text-muted-foreground ${
                              isJunior ? "text-base" : "text-sm"
                            }`}
                          >
                            {q.explanation}
                          </p>
                        )}

                        {isCustom && (
                          <p
                            className={`mt-1 leading-relaxed text-muted-foreground ${
                              isJunior ? "text-base" : "text-sm"
                            }`}
                          >
                            {isCorrect
                              ? "Excellent work, hero! Keep it up!"
                              : "Good effort! Keep practicing and you'll get even better!"}
                          </p>
                        )}

                        {isCorrect && (
                          <p className="mt-2 flex items-center gap-1 text-sm font-bold text-accent">
                            <Star className="h-4 w-4" /> +{pointsPerCorrect} points!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button variant="hero" className="mt-4 w-full py-6 text-base" onClick={nextQuestion}>
                    {currentQ + 1 < games.length ? (
                      <>
                        Next Game <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      <>See My Results 🎉</>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (missionComplete && activeMission) {
    const games = getGames(activeMission);
    const total = games.length;
    const perfect = score === total;
    const totalPoints = score * pointsPerCorrect;
    const encouragement = getEncouragement(score, total);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl border-2 bg-card p-8 text-center shadow-playful">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {perfect && (
                <>
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.6 }}
                    transition={{ delay: 0.3 }}
                    className="absolute left-6 top-4 text-3xl"
                  >
                    🎊
                  </motion.div>
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.6 }}
                    transition={{ delay: 0.5 }}
                    className="absolute right-8 top-8 text-2xl"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.6 }}
                    transition={{ delay: 0.7 }}
                    className="absolute bottom-16 left-8 text-2xl"
                  >
                    🌟
                  </motion.div>
                </>
              )}
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mb-4 flex items-center justify-center gap-3"
            >
              <img src={CAPTAIN_CYBER.image} alt={CAPTAIN_CYBER.name} className="h-16 w-16 object-contain" />
              <img
                src={activeMission.guide.image}
                alt={activeMission.guide.name}
                className="h-14 w-14 object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-4 text-7xl"
            >
              {perfect ? "🏆" : score >= total * 0.6 ? "⭐" : "💪"}
            </motion.div>

            <h2 className="text-2xl font-bold">
              {perfect ? "Perfect Score!" : score >= total * 0.6 ? "Mission Complete!" : "Good Try!"}
            </h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 rounded-xl bg-muted/50 p-3"
            >
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Captain Cyber says:</p>
              <p className="text-sm font-bold text-primary">{encouragement}</p>
            </motion.div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted p-3">
                <div className="text-2xl font-bold">
                  {score}/{total}
                </div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>

              <div className="rounded-xl bg-accent/10 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-accent">
                  <Star className="h-5 w-5" />
                  {totalPoints}
                </div>
                <div className="text-xs text-muted-foreground">Points</div>
              </div>

              <div className="rounded-xl bg-destructive/10 p-3">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Flame className="h-5 w-5 text-destructive" />
                  +1
                </div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-accent/40 bg-accent/20 px-5 py-2"
            >
              <span className="text-2xl">{activeMission.badgeIcon}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-accent">Badge Earned!</p>
                <p className="text-sm font-bold">{activeMission.badgeName}</p>
              </div>
            </motion.div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={resetMission}>
                Back to Missions
              </Button>
              <Button variant="hero" className="flex-1" onClick={() => navigate("/dashboard")}>
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold md:text-4xl">🎮 Learning Missions</h1>
          <p className="mt-2 text-muted-foreground">Explore all missions and become a Cyber Hero!</p>

          {child && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="px-4 py-1 text-sm">
                {tierEmoji} {tierLabel} · Age {age} · {pointsPerCorrect} pts per question
              </Badge>
              <Badge className="border-0 bg-primary/10 px-4 py-1 text-sm text-primary">
                {modeConfig.emoji} {modeConfig.label}
              </Badge>
            </div>
          )}
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {MISSIONS.map((m) => {
            const totalGames = getTotalGames(learningMode);
            const mp = getModeAwareMissionProgress(missionProgress, m.id, totalGames);
            const completedGames = mp?.status === "completed" ? totalGames : (mp?.current_question ?? 0);
            const isCompleted = mp?.status === "completed";
            const isInProgress = mp?.status === "in_progress";
            const levels = getMissionLevels(m, age, learningMode, completedGames);

            return (
              <motion.div
                key={m.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="group overflow-hidden rounded-2xl border-2 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-playful"
              >
                <div className={`p-6 ${m.bgColor}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow">
                      <m.icon className={`h-7 w-7 ${m.color}`} />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {totalGames} games · 3 levels · {m.guide.name}
                      </p>
                    </div>

                    <img
                      src={m.guide.image}
                      alt={m.guide.name}
                      className="ml-auto h-16 w-16 object-contain opacity-80 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </div>

                <div className="p-6">
                  <p className="mb-4 text-sm text-muted-foreground">{m.description}</p>

                  <div className="mb-4 grid grid-cols-3 gap-2">
                    {levels.map((level) => {
                      const levelStart = (level.level - 1) * modeConfig.gamesPerLevel;
                      const levelEnd = levelStart + modeConfig.gamesPerLevel;
                      const levelCompleted = Math.min(
                        Math.max(completedGames - levelStart, 0),
                        modeConfig.gamesPerLevel,
                      );
                      const levelDone = levelCompleted >= modeConfig.gamesPerLevel;
                      const levelActive = completedGames >= levelStart && completedGames < levelEnd;

                      return (
                        <div
                          key={level.level}
                          className={`rounded-xl border p-2 text-center text-xs transition-all ${
                            levelDone
                              ? "border-secondary/40 bg-secondary/10"
                              : level.locked
                                ? "border-border bg-muted/50 opacity-60"
                                : levelActive
                                  ? "border-primary/40 bg-primary/10"
                                  : "border-border bg-muted/30"
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-center gap-1">
                            {level.locked ? (
                              <LockIcon className="h-3 w-3 text-muted-foreground" />
                            ) : levelDone ? (
                              <CheckCircle2 className="h-3 w-3 text-secondary" />
                            ) : (
                              <span className="text-sm">{level.emoji}</span>
                            )}
                          </div>

                          <p className="font-semibold">{level.name}</p>
                          <p className="text-muted-foreground">
                            {levelCompleted}/{modeConfig.gamesPerLevel}
                          </p>

                          <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                            {level.miniGameTypes.slice(0, 2).map((type, i) => (
                              <span key={i} className="text-[9px]" title={MINI_GAME_META[type].label}>
                                {MINI_GAME_META[type].emoji}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-semibold">Total Progress</span>
                      <span className="font-bold text-primary">
                        {completedGames}/{totalGames} games
                      </span>
                    </div>
                    <Progress value={totalGames > 0 ? (completedGames / totalGames) * 100 : 0} className="h-2.5" />
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <Badge className="border-0 bg-secondary text-secondary-foreground">✓ Completed</Badge>
                      <span className="text-xs text-muted-foreground">
                        Score: {mp?.score}/{mp?.max_score}
                      </span>
                      <Button variant="outline" size="sm" className="ml-auto" onClick={() => startMission(m)}>
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <Button variant="hero" className="w-full" onClick={() => startMission(m)}>
                      {isInProgress ? (
                        <>
                          Continue Mission → <Gamepad2 className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>Start Mission 🚀</>
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
