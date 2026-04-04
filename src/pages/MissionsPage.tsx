import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, ArrowRight, Mail, ExternalLink, Flame, Lock as LockIcon, Gamepad2, Trophy, Zap, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import WordSearchGame from "@/components/minigames/WordSearchGame";
import PasswordBuilderGame from "@/components/minigames/PasswordBuilderGame";
import SortGame from "@/components/minigames/SortGame";
import SecretKeeperGame from "@/components/minigames/SecretKeeperGame";
import MemoryGame from "@/components/minigames/MemoryGame";
import BossBattleGame from "@/components/minigames/BossBattleGame";
import CrosswordGame from "@/components/training/CrosswordGame";
import {
  MISSIONS,
  MINI_GAME_META,
  type MissionDef,
  type Question,
  type LearningMode,
  type MiniGameType,
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
import { GUIDE_REGISTRY, getSupportGuide, getMissionIntro } from "@/data/guides";
import { getLevelRank } from "@/data/levelTitles";
import { getActiveEvents, type EventMission } from "@/data/eventMissions";
import {
  WORD_SEARCH_PUZZLES,
  CROSSWORD_PUZZLES,
  DRAG_DROP_GAMES,
  type WordSearchPuzzle,
  type CrosswordPuzzle,
  type DragDropGameDef,
} from "@/data/trainingGames";

import heroCharacter from "@/assets/hero-character.png";

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

const CAPTAIN_CYBER = GUIDE_REGISTRY["captain-cyber"];

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
      className={`mb-6 overflow-hidden rounded-2xl border-2 border-border bg-background shadow-card ${isJunior ? "text-lg" : ""}`}
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
  if ((row.max_score ?? expectedTotalGames) !== expectedTotalGames) return null;
  return row;
}

function getStarsFromProgress(mp: any) {
  if (!mp || !mp.max_score) return 0;
  const ratio = mp.score / mp.max_score;
  return ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
}

/* ─── Section Header ─── */
function SectionHeader({ icon, title, isNew }: { icon: string; title: string; isNew?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-8 first:mt-0">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl font-bold">{title}</h2>
      {isNew && <Badge className="border-0 bg-secondary/20 text-secondary text-xs">🆕 NEW</Badge>}
    </div>
  );
}

/* ─── Game Card (generic) ─── */
function GameCard({
  title,
  zone,
  zoneIcon,
  description,
  stars,
  bestScore,
  maxScore,
  typeBadge,
  guideImage,
  onClick,
}: {
  title: string;
  zone: string;
  zoneIcon: string;
  description: string;
  stars: number;
  bestScore?: number;
  maxScore?: number;
  typeBadge: string;
  guideImage?: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="group overflow-hidden rounded-2xl border-2 bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-playful"
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{zoneIcon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold truncate">{title}</h3>
            <p className="text-xs text-muted-foreground">{zone}</p>
          </div>
          {guideImage && (
            <img
              src={guideImage}
              alt=""
              className="h-10 w-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-0.5">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s <= stars ? "text-accent fill-[hsl(var(--accent))]" : "text-muted"}`}
              />
            ))}
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">{typeBadge}</span>
        </div>

        {bestScore !== undefined && maxScore !== undefined && (
          <p className="text-xs text-muted-foreground mb-3">
            Best: {bestScore}/{maxScore}
          </p>
        )}

        <Button variant="outline" className="w-full" size="sm" onClick={onClick}>
          <Gamepad2 className="mr-2 h-3.5 w-3.5" />
          Play {stars > 0 ? "Again" : "Now"}
        </Button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function MissionsPage() {
  const { user, activeChildId, setActiveChildId } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Quiz gameplay state
  const [activeMission, setActiveMission] = useState<MissionDef | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [missionComplete, setMissionComplete] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Standalone game state
  const [standaloneGame, setStandaloneGame] = useState<{
    type: "wordsearch" | "crossword" | "dragdrop";
    gameId: string;
    title: string;
    data?: any;
  } | null>(null);
  const [standaloneResult, setStandaloneResult] = useState<{ stars: number; passed: boolean; xpEarned: number } | null>(
    null,
  );
  const [standaloneStartTime, setStandaloneStartTime] = useState(0);

  // Filters
  const [worldFilter, setWorldFilter] = useState<string>("all");
  const [starFilter, setStarFilter] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!activeChildId && user) {
      setActiveChildId(user.id);
    }
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
    setStandaloneGame(null);
    setStandaloneResult(null);
  };

  useEffect(() => {
    const missionIdFromUrl = searchParams.get("mission");
    if (!missionIdFromUrl || !child || activeMission) return;
    const missionToOpen = MISSIONS.find((m) => m.id === missionIdFromUrl);
    if (!missionToOpen) return;
    startMission(missionToOpen);
    setSearchParams({}, { replace: true });
  }, [child, activeMission, searchParams, setSearchParams]);

  const beginPlay = () => setShowIntro(false);

  const resetAll = () => {
    setActiveMission(null);
    setMissionComplete(false);
    setShowIntro(false);
    setShowResult(false);
    setSelectedAnswer(null);
    setStandaloneGame(null);
    setStandaloneResult(null);
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
    if (idx === games[currentQ].correct) setScore((s) => s + 1);
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
          .update({ points: newPoints, streak: newStreak, level: newLevel, last_activity_date: today })
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

      await queryClient.invalidateQueries({ queryKey: ["mission_progress", activeChildId] });
      await queryClient.invalidateQueries({ queryKey: ["earned_badges", activeChildId] });
      await queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
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
    return { levelIndex, levelName: LEVEL_NAMES[Math.min(levelIndex, 2)], gameInLevel, gamesPerLevel };
  };

  /* ── Standalone game handlers ── */

  const launchStandaloneGame = (
    type: "wordsearch" | "crossword" | "dragdrop",
    gameId: string,
    title: string,
    data?: any,
  ) => {
    setStandaloneGame({ type, gameId, title, data });
    setStandaloneResult(null);
    setStandaloneStartTime(Date.now());
    setActiveMission(null);
  };

  const handleStandaloneComplete = async (passed: boolean, stars: number = passed ? 2 : 1) => {
    if (!standaloneGame || !activeChildId) return;

    const xpEarned = stars * pointsPerCorrect;

    await supabase.from("mission_progress").upsert(
      {
        child_id: activeChildId,
        mission_id: standaloneGame.gameId,
        status: "completed",
        score: stars,
        max_score: 3,
        current_question: 1,
        completed_at: new Date().toISOString(),
      } as any,
      { onConflict: "child_id,mission_id" },
    );

    const { data: childData } = await supabase
      .from("child_profiles")
      .select("points, level, last_activity_date, streak")
      .eq("id", activeChildId)
      .single();

    if (childData) {
      const today = new Date().toISOString().split("T")[0];
      const newStreak = childData.last_activity_date === today ? childData.streak : childData.streak + 1;
      const newPoints = childData.points + xpEarned;
      const newLevel = Math.floor(newPoints / 200) + 1;
      await supabase
        .from("child_profiles")
        .update({ points: newPoints, level: newLevel, streak: newStreak, last_activity_date: today })
        .eq("id", activeChildId);
    }

    await queryClient.invalidateQueries({ queryKey: ["mission_progress", activeChildId] });
    await queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });

    setStandaloneResult({ stars, passed, xpEarned });
  };

  /* ═══════════════════════════════════════════
     VIEW: Quiz Mission Intro
     ═══════════════════════════════════════════ */
  if (activeMission && showIntro) {
    const levels = getMissionLevels(activeMission, age, learningMode, 0);
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
        <motion.div
          className="fixed bottom-4 left-4 z-20 flex flex-col items-center gap-1 pointer-events-none md:bottom-8 md:left-8"
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 0.4, duration: 0.8 }}
        >
          <motion.img
            src={activeMission.guide.image}
            alt={activeMission.guide.name}
            className="h-28 w-28 md:h-36 md:w-36 object-contain drop-shadow-xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          />
          <div className="rounded-2xl bg-card/90 backdrop-blur px-3 py-1.5 shadow-lg border border-border text-center">
            <p className="text-xs font-bold">{activeMission.guide.name}</p>
            <p className="text-[10px] text-muted-foreground">Your Guide</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="rounded-3xl border-2 bg-card p-8 md:p-10 text-center shadow-playful">
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
            <div className="mb-5 rounded-2xl bg-muted/50 p-5">
              <p className="text-base font-medium text-foreground">{getMissionIntro(activeMission.id)}</p>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <img
                src={activeMission.guide.image}
                alt={activeMission.guide.name}
                className="h-14 w-14 object-contain"
              />
              <div className="text-left">
                <h2 className="text-2xl font-bold">{activeMission.title}</h2>
                <p className="text-sm text-muted-foreground">Main Guide: {activeMission.guide.name}</p>
              </div>
            </div>
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
              <Button variant="outline" className="flex-1" onClick={resetAll}>
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

  /* ═══════════════════════════════════════════
     VIEW: Quiz Gameplay
     ═══════════════════════════════════════════ */
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
      <div className="min-h-screen bg-background relative">
        <motion.div
          className="fixed bottom-4 right-4 z-20 flex flex-col items-center gap-1 pointer-events-none md:bottom-8 md:right-8"
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
        >
          <motion.img
            src={activeMission.guide.image}
            alt={activeMission.guide.name}
            className="h-20 w-20 md:h-28 md:w-28 object-contain drop-shadow-xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          <div className="rounded-xl bg-card/90 backdrop-blur px-2.5 py-1 shadow-md border border-border text-center">
            <p className="text-[10px] font-bold">{activeMission.guide.name}</p>
          </div>
        </motion.div>

        <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="container mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={resetAll}
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
                  Game {currentQ + 1}/{games.length} <MiniGameTypeBadge type={q.miniGameType} />
                </span>
                <span>{score} correct</span>
              </div>
              <Progress value={((currentQ + 1) / games.length) * 100} className="h-2" />
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-8">
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
                  <div className="mb-5 flex items-start gap-4">
                    <img
                      src={activeMission.guide.image}
                      alt={activeMission.guide.name}
                      className="h-14 w-14 object-contain"
                    />
                    <div className="rounded-2xl rounded-bl-sm bg-muted px-5 py-3">
                      <p className={`font-semibold ${isJunior ? "text-lg" : "text-base"}`}>{q.question}</p>
                    </div>
                  </div>
                  {hasMessageCard && <MessageCard q={q} isJunior={isJunior} />}
                  <div
                    className={`grid gap-3 ${q.options.length === 2 ? "grid-cols-2" : q.options.length === 3 ? "grid-cols-3" : "grid-cols-1"}`}
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
                          className="group relative cursor-pointer rounded-2xl border-2 border-border bg-card p-6 md:p-7 text-center font-bold transition-all hover:scale-[1.03] hover:border-primary/50 hover:shadow-md active:scale-95"
                        >
                          <span className={`mb-1 block ${isJunior ? "text-4xl" : "text-3xl"}`}>{emoji}</span>
                          <span className={isJunior ? "text-xl" : "text-lg"}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {showResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                  <div
                    className={`rounded-2xl p-6 md:p-7 ${isCorrect ? "border-2 border-secondary/30 bg-secondary/10" : "border-2 border-accent/30 bg-accent/10"}`}
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
                            className={`mt-1 leading-relaxed text-muted-foreground ${isJunior ? "text-base" : "text-sm"}`}
                          >
                            {q.explanation}
                          </p>
                        )}
                        {isCustom && (
                          <p
                            className={`mt-1 leading-relaxed text-muted-foreground ${isJunior ? "text-base" : "text-sm"}`}
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

  /* ═══════════════════════════════════════════
     VIEW: Quiz Mission Complete
     ═══════════════════════════════════════════ */
  if (activeMission && missionComplete) {
    const games = getGames(activeMission);
    const totalPoints = score * pointsPerCorrect;
    const starCount = score / games.length >= 0.9 ? 3 : score / games.length >= 0.6 ? 2 : 1;
    const encouragement = getEncouragement(score, games.length);

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center space-y-5"
        >
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold">Mission Complete!</h2>
          <p className="text-lg text-muted-foreground">{encouragement}</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-4xl ${s <= starCount ? "" : "opacity-20"}`}>
                ⭐
              </span>
            ))}
          </div>
          <div className="rounded-2xl border bg-card p-5 space-y-2">
            <p className="text-sm text-muted-foreground">
              Score: {score}/{games.length}
            </p>
            <p className="text-lg font-bold text-accent">+{totalPoints} XP earned!</p>
            <p className="text-xs text-muted-foreground">
              Badge earned: {activeMission.badgeIcon} {activeMission.badgeName}
            </p>
          </div>
          <Button variant="hero" className="w-full py-5 text-base" onClick={resetAll}>
            Back to Training Center 🏋️
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     VIEW: Standalone Game Play
     ═══════════════════════════════════════════ */
  if (standaloneGame && !standaloneResult) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="container mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-center justify-between">
              <button onClick={resetAll} className="text-sm font-semibold text-muted-foreground hover:text-foreground">
                ← Back
              </button>
              <h2 className="text-sm font-bold">{standaloneGame.title}</h2>
              <Badge variant="outline" className="px-2 py-0 text-[10px]">
                {tierEmoji} {tierLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-3xl px-4 py-8">
          {standaloneGame.type === "wordsearch" && (
            <WordSearchGame
              key={standaloneGame.gameId}
              ageTier={tier}
              guideImage={heroCharacter}
              guideName="Captain Cyber"
              customWords={standaloneGame.data?.words}
              customGridSize={standaloneGame.data?.gridSize}
              onComplete={(passed) => {
                const elapsed = (Date.now() - standaloneStartTime) / 1000;
                let stars = 1;
                if (tier === "junior") stars = 3;
                else if (tier === "defender") stars = elapsed < 180 ? 3 : elapsed < 360 ? 2 : 1;
                else stars = elapsed < 120 ? 3 : elapsed < 240 ? 2 : 1;
                handleStandaloneComplete(passed, stars);
              }}
            />
          )}

          {standaloneGame.type === "crossword" && standaloneGame.data && (
            <CrosswordGame
              key={standaloneGame.gameId}
              puzzle={standaloneGame.data}
              ageTier={tier}
              onComplete={(passed, stars) => handleStandaloneComplete(passed, stars)}
            />
          )}

          {standaloneGame.type === "dragdrop" && standaloneGame.data?.subType === "sort" && (
            <SortGame
              key={standaloneGame.gameId}
              missionId={standaloneGame.data.sortMissionId || "scam-detection"}
              ageTier={tier}
              guideImage={heroCharacter}
              guideName="Captain Cyber"
              onComplete={(passed) => handleStandaloneComplete(passed, passed ? 2 : 1)}
            />
          )}

          {standaloneGame.type === "dragdrop" && standaloneGame.data?.subType === "password-builder" && (
            <PasswordBuilderGame
              key={standaloneGame.gameId}
              ageTier={tier}
              guideImage={heroCharacter}
              guideName="Captain Cyber"
              onComplete={(passed) => handleStandaloneComplete(passed, passed ? 2 : 1)}
            />
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     VIEW: Standalone Game Complete
     ═══════════════════════════════════════════ */
  if (standaloneResult) {
    const tierMsg =
      tier === "junior"
        ? "WOW! You're a STAR! 🌟"
        : tier === "defender"
          ? "Great job, Defender! Keep it up!"
          : "Mission complete, Operative. Impressive work.";
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center space-y-5"
        >
          <div className="text-6xl">{standaloneResult.passed ? "🎉" : "💪"}</div>
          <h2 className="text-3xl font-bold">{standaloneResult.passed ? "Great Work!" : "Nice Try!"}</h2>
          <p className="text-lg text-muted-foreground">{tierMsg}</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <span key={s} className={`text-4xl ${s <= standaloneResult.stars ? "" : "opacity-20"}`}>
                ⭐
              </span>
            ))}
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-lg font-bold text-accent">+{standaloneResult.xpEarned} XP earned!</p>
          </div>
          <Button variant="hero" className="w-full py-5 text-base" onClick={resetAll}>
            Back to Training Center 🏋️
          </Button>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     VIEW: Training Center — Futuristic Hub
     ═══════════════════════════════════════════ */

  const completedMissions = MISSIONS.filter((m) => {
    const totalGames = getTotalGames(learningMode);
    const mp = getModeAwareMissionProgress(missionProgress, m.id, totalGames);
    return mp?.status === "completed";
  });

  const getStandaloneStars = (gameId: string) => {
    const mp = missionProgress.find((p) => p.mission_id === gameId);
    return mp ? getStarsFromProgress(mp) : 0;
  };

  const level = child?.level ?? 1;
  const points = child?.points ?? 0;
  const streak = child?.streak ?? 0;
  const rank = getLevelRank(level);
  const nextRank = getNextRank(level);
  const xpProgress = getProgressToNextLevel(points);

  // Daily missions (static for now)
  const dailyMissions = [
    { id: "dm1", label: "Play any Arcade game", xp: 30, done: false },
    { id: "dm2", label: "Get 3 stars on a quiz", xp: 50, done: false },
    { id: "dm3", label: "Beat your Phish score", xp: 40, done: false },
  ];
  const allDailyDone = dailyMissions.every((m) => m.done);

  // Featured game (Byte's Pick)
  const featuredGame = WORD_SEARCH_PUZZLES[0];

  // Game sections data
  const GAME_SECTIONS = [
    {
      icon: "🕹️",
      title: "Arcade Games",
      badge: "Arcade",
      color: "from-cyan-500/20 to-cyan-500/5",
      borderColor: "border-cyan-500/30",
      games: [
        { id: "arcade-virus", title: "Virus Vaporizer", desc: "Blast viruses before they spread!", locked: true },
        { id: "arcade-hacker", title: "Hacker Chase", desc: "Chase down the hacker through the network!", locked: true },
        { id: "arcade-firewall", title: "Firewall Blitz", desc: "Build firewalls to block incoming attacks!", locked: true },
      ],
    },
    {
      icon: "🧩",
      title: "Puzzle Games",
      badge: "Puzzle",
      color: "from-purple-500/20 to-purple-500/5",
      borderColor: "border-purple-500/30",
      games: [
        { id: "puzzle-code", title: "Code Breaker", desc: "Crack the encrypted codes!", locked: true },
        { id: "puzzle-escape", title: "Cyber Escape Room", desc: "Solve puzzles to escape the virus lab!", locked: true },
        { id: "puzzle-tower", title: "Password Tower", desc: "Stack strong passwords to build the tower!", locked: true },
      ],
    },
    {
      icon: "🎯",
      title: "Sort & Decide",
      badge: "Sort",
      color: "from-green-500/20 to-green-500/5",
      borderColor: "border-green-500/30",
      games: [
        ...DRAG_DROP_GAMES.filter((g) => g.subType === "sort").map((g) => ({
          id: g.id,
          title: g.title,
          desc: g.description,
          locked: false,
          action: () => launchStandaloneGame("dragdrop", g.id, g.title, g),
          stars: getStandaloneStars(g.id),
        })),
        { id: "sort-real-fake", title: "Real or Fake?", desc: "Identify genuine vs spoofed login pages!", locked: true },
      ],
    },
    {
      icon: "⚡",
      title: "Speed Rounds",
      badge: "Speed",
      color: "from-yellow-500/20 to-yellow-500/5",
      borderColor: "border-yellow-500/30",
      games: completedMissions.slice(0, 3).map((m) => {
        const totalGames = getTotalGames(learningMode);
        const mp = getModeAwareMissionProgress(missionProgress, m.id, totalGames);
        return {
          id: m.id,
          title: m.title,
          desc: m.description,
          locked: false,
          action: () => startMission(m),
          stars: getStarsFromProgress(mp),
        };
      }),
    },
    {
      icon: "🃏",
      title: "Memory & Match",
      badge: "Memory",
      color: "from-pink-500/20 to-pink-500/5",
      borderColor: "border-pink-500/30",
      games: [
        { id: "mem-cyber", title: "Cyber Memory Match", desc: "Match cybersecurity terms and icons!", locked: true },
        { id: "mem-threat", title: "Threat or Safe?", desc: "Remember and classify threats!", locked: true },
      ],
    },
    {
      icon: "🔍",
      title: "Word Games",
      badge: "Word",
      color: "from-teal-500/20 to-teal-500/5",
      borderColor: "border-teal-500/30",
      games: WORD_SEARCH_PUZZLES.map((p) => ({
        id: p.id,
        title: p.title,
        desc: p.description,
        locked: false,
        action: () =>
          launchStandaloneGame("wordsearch", p.id, p.title, {
            words: p.wordsByTier[tier],
            gridSize: p.gridSizeByTier[tier],
          }),
        stars: getStandaloneStars(p.id),
      })),
    },
    {
      icon: "✏️",
      title: "Crossword Puzzles",
      badge: "Crossword",
      color: "from-orange-500/20 to-orange-500/5",
      borderColor: "border-orange-500/30",
      games: CROSSWORD_PUZZLES.map((p) => ({
        id: p.id,
        title: p.title,
        desc: p.description,
        locked: false,
        action: () => launchStandaloneGame("crossword", p.id, p.title, p),
        stars: getStandaloneStars(p.id),
      })),
    },
    {
      icon: "🖱️",
      title: "Drag & Drop",
      badge: "Drag & Drop",
      color: "from-indigo-500/20 to-indigo-500/5",
      borderColor: "border-indigo-500/30",
      games: DRAG_DROP_GAMES.map((g) => ({
        id: g.id,
        title: g.title,
        desc: g.description,
        locked: false,
        action: () => launchStandaloneGame("dragdrop", g.id, g.title, g),
        stars: getStandaloneStars(g.id),
      })),
    },
  ];

  // Leaderboard placeholder
  const leaderboard = [
    { rank: 1, name: "CyberNinja", xp: 1850 },
    { rank: 2, name: "PixelDefender", xp: 1620 },
    { rank: 3, name: "ShieldMaster", xp: 1480 },
    { rank: 4, name: "ByteHero", xp: 1340 },
    { rank: 5, name: "FirewallKid", xp: 1200 },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, #0a0e1a 0%, #0f1628 40%, #0a0e1a 100%)" }}>
      {/* Subtle grid overlay */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <div className="relative z-10">
        {/* ═══ Hero Section ═══ */}
        <div className="border-b border-cyan-500/10 pb-8 pt-10">
          <div className="container mx-auto max-w-5xl px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-white" style={{
                textShadow: "0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(0,212,255,0.15)"
              }}>
                ⚡ Training Center
              </h1>
              <p className="mt-2 text-cyan-300/70 text-lg">Level up your cyber skills, Guardian!</p>
            </motion.div>

            {/* Stat Chips */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-5"
            >
              {[
                { icon: "🔥", label: `${streak}-Day Streak`, glow: "rgba(255,100,0,0.3)" },
                { icon: "⭐", label: `${points} XP`, glow: "rgba(255,200,0,0.3)" },
                { icon: "🏆", label: `Rank: ${rank.title}`, glow: "rgba(0,255,136,0.3)" },
              ].map((chip) => (
                <div
                  key={chip.label}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
                  style={{ boxShadow: `0 0 15px ${chip.glow}` }}
                >
                  <span className="text-base">{chip.icon}</span>
                  <span className="text-sm font-bold text-white/90">{chip.label}</span>
                </div>
              ))}
            </motion.div>

            {/* XP Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto max-w-md"
            >
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-cyan-400/70 font-semibold">Level {level}</span>
                {nextRank && <span className="text-cyan-400/70 font-semibold">Next: {nextRank.title} {nextRank.emoji}</span>}
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5 border border-cyan-500/20">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress.percent}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
              <p className="mt-1 text-center text-[11px] text-white/40">{xpProgress.current}/{xpProgress.needed} XP to next level</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-6 space-y-8">

          {/* ═══ Daily Missions ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-cyan-500/20 p-5 md:p-6"
            style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,255,136,0.04) 100%)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-400" />
                TODAY'S MISSIONS 🎯
              </h2>
              <span className="text-xs font-mono text-cyan-400/60 bg-cyan-400/10 px-3 py-1 rounded-full">Resets in 14h 22m</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 mb-4">
              {dailyMissions.map((dm) => (
                <div
                  key={dm.id}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                    dm.done
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                    dm.done ? "border-green-400 bg-green-400 text-black" : "border-white/20"
                  }`}>
                    {dm.done && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">{dm.label}</p>
                    <p className="text-xs text-cyan-400/60">+{dm.xp} XP</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              disabled={!allDailyDone}
              className={`w-full sm:w-auto font-bold ${
                allDailyDone
                  ? "bg-gradient-to-r from-cyan-500 to-green-500 text-black hover:from-cyan-400 hover:to-green-400"
                  : "bg-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              {allDailyDone ? "🎉 Claim Bonus!" : "Complete all missions to claim bonus"}
            </Button>
          </motion.div>

          {/* ═══ Byte's Pick ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-cyan-500/30 p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(0,212,255,0.02) 100%)",
              boxShadow: "0 0 30px rgba(0,212,255,0.08)",
            }}
          >
            <motion.img
              src={heroCharacter}
              alt="Byte"
              className="h-20 w-20 object-contain drop-shadow-lg shrink-0"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-cyan-400 text-sm font-bold mb-1">👾 Byte says: Try this one today, Guardian!</p>
              <h3 className="text-xl font-bold text-white">{featuredGame.title}</h3>
              <p className="text-sm text-white/50 mt-0.5">{featuredGame.description}</p>
            </div>
            <Button
              onClick={() =>
                launchStandaloneGame("wordsearch", featuredGame.id, featuredGame.title, {
                  words: featuredGame.wordsByTier[tier],
                  gridSize: featuredGame.gridSizeByTier[tier],
                })
              }
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold px-6 hover:from-cyan-400 hover:to-cyan-300 shrink-0"
            >
              Play Now ▶
            </Button>
          </motion.div>

          {/* ═══ Game Sections ═══ */}
          {GAME_SECTIONS.map((section, sIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + sIdx * 0.04 }}
            >
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                {section.title}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                {section.games.map((game: any) => (
                  <div
                    key={game.id}
                    className={`group relative min-w-[220px] max-w-[260px] flex-shrink-0 rounded-2xl border bg-gradient-to-b ${section.color} backdrop-blur-sm transition-all duration-300 ${
                      game.locked
                        ? "border-white/5 opacity-60"
                        : `${section.borderColor} hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(0,212,255,0.15)]`
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white/70">
                          {section.badge}
                        </span>
                        {game.locked ? (
                          <LockIcon className="h-4 w-4 text-white/30" />
                        ) : (
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((s: number) => (
                              <Star
                                key={s}
                                className={`h-3.5 w-3.5 ${s <= (game.stars || 0) ? "text-yellow-400 fill-yellow-400" : "text-white/15"}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mb-1 truncate">{game.title}</h3>
                      <p className="text-xs text-white/40 mb-4 line-clamp-2">{game.desc}</p>
                      {game.locked ? (
                        <div className="group/lock relative">
                          <Button disabled size="sm" className="w-full bg-white/5 text-white/20 cursor-not-allowed border-0">
                            <LockIcon className="mr-1.5 h-3 w-3" /> Locked
                          </Button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/lock:block rounded-lg bg-black/90 border border-white/10 px-3 py-2 text-xs text-white/70 whitespace-nowrap z-20">
                            Complete Adventure zones to unlock
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-cyan-500/90 to-cyan-400/90 text-black font-bold border-0 hover:from-cyan-400 hover:to-cyan-300"
                          onClick={game.action}
                        >
                          <Gamepad2 className="mr-1.5 h-3.5 w-3.5" />
                          Play Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* ═══ Leaderboard ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl border border-yellow-500/20 p-5 md:p-6"
            style={{ background: "linear-gradient(135deg, rgba(255,200,0,0.05) 0%, rgba(255,200,0,0.01) 100%)" }}
          >
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-yellow-400" />
              🏆 Top Guardians This Week
            </h2>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-black ${
                    entry.rank === 1 ? "bg-yellow-400 text-black" :
                    entry.rank === 2 ? "bg-gray-300 text-black" :
                    entry.rank === 3 ? "bg-amber-600 text-white" :
                    "bg-white/10 text-white/50"
                  }`}>
                    {entry.rank}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/10" />
                  <span className="flex-1 font-semibold text-white/80 text-sm">{entry.name}</span>
                  <span className="text-sm font-bold text-yellow-400/80">{entry.xp.toLocaleString()} XP</span>
                </div>
              ))}
              {/* Player row */}
              <div className="flex items-center gap-3 rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 mt-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-black text-cyan-400">
                  12
                </span>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400/40 to-green-400/40 border border-cyan-400/30" />
                <span className="flex-1 font-bold text-cyan-400 text-sm">You</span>
                <span className="text-sm font-bold text-cyan-400">{points} XP</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ═══ Byte Fixed Character ═══ */}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-1 md:bottom-8 md:right-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="rounded-xl border border-cyan-500/20 bg-black/80 backdrop-blur-sm px-3 py-2 text-xs text-cyan-300 max-w-[180px] text-center mb-1"
          style={{ boxShadow: "0 0 15px rgba(0,212,255,0.1)" }}
        >
          Pick a game and let's train, Guardian! 💪
        </motion.div>
        <motion.img
          src={heroCharacter}
          alt="Byte"
          className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-lg"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
