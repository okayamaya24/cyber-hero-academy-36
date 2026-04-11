import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, ArrowRight, Mail, ExternalLink, Flame, Lock as LockIcon, Gamepad2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTrainingGameSettings, type TrainingGameSetting } from "@/hooks/useTrainingGameSettings";
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
  type AgeTier,
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
import { getLevelRank, getNextRank, getProgressToNextLevel } from "@/data/levelTitles";
import { getActiveEvents, type EventMission } from "@/data/eventMissions";
import {
  WORD_SEARCH_PUZZLES,
  CROSSWORD_PUZZLES,
  DRAG_DROP_GAMES,
  type WordSearchPuzzle,
  type CrosswordPuzzle,
  type DragDropGameDef,
} from "@/data/trainingGames";

const heroCharacter = "/byte-character.png";

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

function getTrainingTierLabel(tier: AgeTier): string {
  switch (tier) {
    case "junior": return "Junior Hero";
    case "defender": return "Hero";
    case "guardian": return "Elite Hero";
  }
}

function getTrainingTierEmoji(tier: AgeTier): string {
  switch (tier) {
    case "junior": return "🐣";
    case "defender": return "⚡";
    case "guardian": return "🔥";
  }
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
function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5 mt-10 first:mt-0">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl font-extrabold tracking-wide text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">{title}</h2>
    </div>
  );
}

/* ─── Neon Game Card ─── */
function NeonGameCard({
  title,
  description,
  stars,
  typeBadge,
  locked,
  onClick,
}: {
  title: string;
  description: string;
  stars: number;
  typeBadge: string;
  locked?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="group relative" title={locked ? "Coming soon, Guardian! Keep training." : undefined}>
      <motion.div
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        className={`relative overflow-hidden rounded-2xl border bg-[#0f1729] p-5 transition-all ${
          locked
            ? "border-white/10 opacity-60 cursor-not-allowed"
            : "border-[#00d4ff]/30 hover:border-[#00d4ff]/70 hover:shadow-[0_0_24px_rgba(0,212,255,0.15)] cursor-pointer hover:-translate-y-1"
        }`}
        onClick={locked ? undefined : onClick}
        whileHover={locked ? undefined : { scale: 1.02 }}
      >
        {locked && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl">
            <LockIcon className="h-8 w-8 text-white/40" />
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white truncate">{title}</h3>
          <span className="shrink-0 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 text-[10px] font-bold text-[#00d4ff]">
            {typeBadge}
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-4 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
              />
            ))}
          </div>
          {locked ? (
            <span className="rounded-full bg-gray-700 px-4 py-1.5 text-xs font-bold text-gray-500">
              Locked
            </span>
          ) : (
            <button className="rounded-full bg-[#00d4ff] px-4 py-1.5 text-xs font-bold text-[#0a0e1a] transition-all hover:bg-[#00d4ff]/80 hover:shadow-[0_0_12px_rgba(0,212,255,0.4)]">
              {stars > 0 ? "Play Again" : "Play Now"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Horizontal scroll wrapper ─── */
function HScrollSection({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-4 md:overflow-visible md:pb-0">
      {children}
    </div>
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

  const { data: trainingSettings = [] } = useTrainingGameSettings();

  const { data: zoneProgress = [] } = useQuery({
    queryKey: ["zone_progress", activeChildId],
    queryFn: async () => {
      const { data } = await supabase.from("zone_progress").select("*").eq("child_id", activeChildId!);
      return data ?? [];
    },
    enabled: !!activeChildId,
  });

  const age = child?.age ?? 7;
  const tier = getAgeTier(age);

  // Adventure completion override: if zone completed, game is always unlocked
  const completedZoneIds = new Set(
    zoneProgress.filter((zp: any) => zp.status === "completed").map((zp: any) => zp.zone_id)
  );

  const isGameLockedByAdmin = (gameId: string): boolean => {
    // Adventure completion always wins
    if (completedZoneIds.has(gameId)) return false;

    const setting = trainingSettings.find((s) => s.id === gameId);
    if (!setting) return true; // default locked if not in DB
    if (!setting.unlocked) return true;
    const tierKey = tier === "junior" ? "tier_junior" : tier === "defender" ? "tier_hero" : "tier_elite";
    return !setting[tierKey];
  };
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
     VIEW: Training Center Hub (Redesigned)
     ═══════════════════════════════════════════ */

  const points = child?.points ?? 0;
  const streak = child?.streak ?? 0;
  const level = child?.level ?? 1;
  const rank = getLevelRank(level);
  const xpProgress = getProgressToNextLevel(points);
  const nextRank = getNextRank(level);
  const isJuniorTier = tier === "junior";
  const trainingTierLabel = getTrainingTierLabel(tier);
  const trainingTierEmoji = getTrainingTierEmoji(tier);

  const completedMissionIds = new Set(
    MISSIONS.filter((m) => {
      const totalGames = getTotalGames(learningMode);
      const mp = getModeAwareMissionProgress(missionProgress, m.id, totalGames);
      return mp?.status === "completed";
    }).map((m) => m.id),
  );

  const getStandaloneStars = (gameId: string) => {
    const mp = missionProgress.find((p) => p.mission_id === gameId);
    return mp ? getStarsFromProgress(mp) : 0;
  };

  /* ── Full Game Catalog ── */
  const arcadeGames = [
    { id: "virus-vaporizer",  title: "Virus Vaporizer",  desc: "Zap viruses before they infect your files!",           badge: "Arcade", route: "/games/virus-vaporizer",  locked: isGameLockedByAdmin("virus-vaporizer") },
    { id: "spot-the-phish",   title: "Spot the Phish",   desc: "Swipe safe or phishing on emails and texts!",          badge: "Arcade", route: "/games/spot-the-phish",   locked: isGameLockedByAdmin("spot-the-phish") },
    { id: "firewall-blitz",   title: "Firewall Blitz",   desc: "Block threats flying across the screen in lanes!",     badge: "Arcade", route: "/games/firewall-blitz",   locked: isGameLockedByAdmin("firewall-blitz") },
    { id: "hacker-chase",     title: "Hacker Chase",     desc: "Chase the hacker through the digital world!",          badge: "Arcade", route: "/games/hacker-chase",     locked: isGameLockedByAdmin("hacker-chase") },
  ];

  const keyboardGames = [
    { id: "type-to-defend",        title: "Type to Defend",        desc: "Type the word fast to destroy threats before they reach your base!", badge: "Keyboard", route: "/games/type-to-defend",        locked: isGameLockedByAdmin("type-to-defend") },
    { id: "password-cracker-race", title: "Password Cracker Race", desc: "Race a hacker bot — type strong passwords before it guesses them!", badge: "Keyboard", route: "/games/password-cracker-race", locked: isGameLockedByAdmin("password-cracker-race") },
    { id: "code-typer",            title: "Code Typer",            desc: "Type safe commands to neutralize malicious code before it executes!", badge: "Keyboard", route: "/games/code-typer",           locked: isGameLockedByAdmin("code-typer") },
    { id: "decrypt-message",       title: "Decrypt the Message",   desc: "Decode a scrambled secret message letter by letter!",               badge: "Keyboard", route: "/games/decrypt-the-message",   locked: isGameLockedByAdmin("decrypt-message") },
    { id: "firewall-typer",        title: "Firewall Typer",        desc: "Words fly in from both sides — type them to block them!",           badge: "Keyboard", route: "/games/firewall-typer",        locked: isGameLockedByAdmin("firewall-typer") },
  ];

  const puzzleGames = [
    { id: "cyber-escape",        title: "Cyber Escape Room", desc: "Solve 4 puzzles to escape the hacker's lair!",                    badge: "Puzzle", route: "/games/cyber-escape-room", locked: isGameLockedByAdmin("cyber-escape") },
    { id: "code-breaker",        title: "Code Breaker",      desc: "Crack the cipher and decode the secret message!",                 badge: "Puzzle", route: "/games/code-breaker",      locked: isGameLockedByAdmin("code-breaker") },
    { id: "password-tower",      title: "Password Tower",    desc: "Stack password ingredients to build the strongest password!",     badge: "Puzzle", route: "/games/password-tower",    locked: isGameLockedByAdmin("password-tower") },
    { id: "lock-the-vault-puzzle", title: "Lock the Vault",  desc: "Solve the sequence to seal the vault before the hacker gets in!", badge: "Puzzle", route: "/games/lock-the-vault",    locked: isGameLockedByAdmin("lock-the-vault-puzzle") },
  ];

  const sortGames = [
    { id: "safe-danger-sort", title: "Safe or Danger? Rapid Sort", desc: "Items flash fast — hit Safe or Danger as quick as you can!", badge: "Sort", route: "/games/safe-or-danger-sort",   locked: isGameLockedByAdmin("safe-danger-sort") },
    { id: "real-or-fake",     title: "Real or Fake Website",       desc: "Spot the fake website before you click!",                  badge: "Sort", route: "/games/real-or-fake-website",  locked: isGameLockedByAdmin("real-or-fake") },
    { id: "trust-or-trash",   title: "Trust or Trash",             desc: "Decide if messages and links are trustworthy or trash!",   badge: "Sort", route: "/games/trust-or-trash",        locked: isGameLockedByAdmin("trust-or-trash") },
    ...MISSIONS.filter((m) => m.id === "scam-detection").map((m) => ({
      id: m.id, title: "Spot the Phish (Quiz)", desc: "Sort real from fake messages!", badge: "Sort",
      locked: isGameLockedByAdmin(m.id), stars: getStandaloneStars(m.id), mission: m,
    })),
    ...DRAG_DROP_GAMES.filter((g) => g.subType === "sort").map((g) => ({
      id: g.id, title: g.title, desc: g.description, badge: "Sort",
      locked: isGameLockedByAdmin(g.id), stars: getStandaloneStars(g.id), dragdrop: g,
    })),
  ];

  const speedGames = [
    { id: "quiz-blitz",           title: "Byte's Quiz Blitz",       desc: "Byte fires questions for 60 seconds — answer as many as you can!", badge: "Speed", route: "/games/bytes-quiz-blitz",         locked: isGameLockedByAdmin("quiz-blitz") },
    { id: "true-false-lightning", title: "True or False Lightning",  desc: "Cyber facts flash fast — TRUE or FALSE? Streak multiplier!",      badge: "Speed", route: "/games/true-or-false-lightning",  locked: isGameLockedByAdmin("true-false-lightning") },
    { id: "beat-the-clock",       title: "Beat the Clock Trivia",    desc: "Answer before the timer hits zero — every second counts!",        badge: "Speed", route: "/games/beat-the-clock-trivia",    locked: isGameLockedByAdmin("beat-the-clock") },
  ];

  const memoryGames = [
    { id: "cyber-memory",    title: "Cyber Memory Match", desc: "Flip cards to match cyber threat pairs!",                   badge: "Memory", route: "/games/cyber-memory-match", locked: isGameLockedByAdmin("cyber-memory") },
    { id: "sequence-shield", title: "Sequence Shield",    desc: "Remember and repeat the sequence to activate your shield!", badge: "Memory", route: "/games/sequence-shield",    locked: isGameLockedByAdmin("sequence-shield") },
  ];

  const WORD_SEARCH_ROUTES: Record<string, string> = {
    ws_password_hunt:      "/games/password-hunt",
    ws_phishing_detective: "/games/phishing-detective",
    ws_privacy_patrol:     "/games/privacy-patrol",
  };

  const CROSSWORD_ROUTES: Record<string, string> = {
    cw_cyber_basics: "/games/cyber-basics",
    cw_stay_safe:    "/games/stay-safe-online",
  };

  const wordSearchGames = WORD_SEARCH_PUZZLES.map((p) => ({
    id: p.id, title: p.title, desc: p.description, badge: "Word Search",
    locked: isGameLockedByAdmin(p.id), stars: getStandaloneStars(p.id),
    route: WORD_SEARCH_ROUTES[p.id], wordsearch: WORD_SEARCH_ROUTES[p.id] ? undefined : p,
  }));

  const crosswordGames = CROSSWORD_PUZZLES.map((p) => ({
    id: p.id, title: p.title, desc: p.description, badge: "Crossword",
    locked: isGameLockedByAdmin(p.id), stars: getStandaloneStars(p.id),
    route: CROSSWORD_ROUTES[p.id], crossword: CROSSWORD_ROUTES[p.id] ? undefined : p,
  }));

  const dragDropGames = [
    ...DRAG_DROP_GAMES.map((g) => ({
      id: g.id, title: g.title, desc: g.description, badge: "Drag & Drop",
      locked: isGameLockedByAdmin(g.id), stars: getStandaloneStars(g.id), dragdrop: g,
    })),
    { id: "lock-the-vault-dd", title: "Lock the Vault", desc: "Drag the correct keys into the right locks before time runs out!", badge: "Drag & Drop", route: "/games/lock-the-vault-drag", locked: isGameLockedByAdmin("lock-the-vault-dd") },
  ];

  // Quiz missions
  const quizMissions = MISSIONS.map((m) => ({
    id: m.id, title: m.title, desc: m.description, badge: "Quiz",
    locked: isGameLockedByAdmin(m.id),
    stars: (() => {
      const totalGames = getTotalGames(learningMode);
      const mp = getModeAwareMissionProgress(missionProgress, m.id, totalGames);
      return getStarsFromProgress(mp);
    })(),
    mission: m,
  }));

  const sections = [
    { icon: "🕹️", title: "Arcade Games", games: arcadeGames, color: "border-[#00d4ff]" },
    ...(tier !== "junior" ? [{ icon: "⌨️", title: "Keyboard Games", games: keyboardGames, color: "border-[#ff6b6b]" }] : []),
    { icon: "🧩", title: "Puzzle Games", games: puzzleGames, color: "border-[#a855f7]" },
    { icon: "🎯", title: "Sort & Decide", games: sortGames, color: "border-[#00ff88]" },
    { icon: "⚡", title: "Speed Rounds", games: speedGames, color: "border-yellow-400" },
    { icon: "🃏", title: "Memory & Match", games: memoryGames, color: "border-pink-400" },
    { icon: "🔍", title: "Word Search Games", games: wordSearchGames, color: "border-[#00d4ff]" },
    { icon: "✏️", title: "Crossword Puzzles", games: crosswordGames, color: "border-orange-400" },
    { icon: "🖱️", title: "Drag & Drop Games", games: dragDropGames, color: "border-[#00ff88]" },
  ];

  // Featured game (Byte's Pick)
  const featuredGame = WORD_SEARCH_PUZZLES[0];

  // Countdown to midnight reset
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msLeft = midnight.getTime() - now.getTime();
  const hoursLeft = Math.floor(msLeft / 3600000);
  const minutesLeft = Math.floor((msLeft % 3600000) / 60000);
  const countdownLabel = `${hoursLeft}h ${minutesLeft}m`;

  // Daily missions (tier-aware text)
  const dailyMissions = tier === "junior"
    ? [
        { name: "Play any Word Search game", xp: 20, done: false },
        { name: "Try a Drag & Drop game", xp: 25, done: false },
        { name: "Complete a Crossword puzzle", xp: 30, done: false },
      ]
    : tier === "defender"
      ? [
          { name: "Play any Arcade game", xp: 30, done: false },
          { name: "Get 3 stars on a Speed Round", xp: 50, done: false },
          { name: "Complete a Puzzle game", xp: 40, done: false },
        ]
      : [
          { name: "Get 3 stars on any game", xp: 50, done: false },
          { name: "Complete a Keyboard challenge", xp: 60, done: false },
          { name: "Beat your best Sort score", xp: 40, done: false },
        ];


  const handleGameClick = (game: any) => {
    if (game.locked) return;
    if (game.route) { navigate(game.route); return; }
    if (game.mission) { startMission(game.mission); return; }
    if (game.wordsearch) {
      const p = game.wordsearch;
      launchStandaloneGame("wordsearch", p.id, p.title, { words: p.wordsByTier[tier], gridSize: p.gridSizeByTier[tier] });
      return;
    }
    if (game.crossword) { launchStandaloneGame("crossword", game.crossword.id, game.crossword.title, game.crossword); return; }
    if (game.dragdrop) { launchStandaloneGame("dragdrop", game.dragdrop.id, game.dragdrop.title, game.dragdrop); return; }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-24 relative">
      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00d4ff]/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 max-w-5xl pt-10 pb-6 relative z-10">
          <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-[0_0_20px_rgba(0,212,255,0.4)]">
                ⚡ Training Center
              </h1>
              <div className="group relative">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border ${
                  tier === "junior"
                    ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-300"
                    : tier === "defender"
                      ? "border-[#00d4ff]/40 bg-[#00d4ff]/10 text-[#00d4ff]"
                      : "border-red-400/40 bg-red-400/10 text-red-300"
                }`}>
                  {trainingTierEmoji} {trainingTierLabel}
                </span>
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a2035] border border-white/10 px-3 py-2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg pointer-events-none">
                  Based on your age at signup
                </div>
              </div>
            </div>
            <p className="mt-2 text-gray-400 text-lg">Level up your cyber skills, Guardian!</p>
          </motion.div>

          {/* Stat chips */}
          <motion.div
            className="mt-5 flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-400">
              <Flame className="h-4 w-4" /> {streak}-Day Streak
            </div>
            <div className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-400">
              ⭐ {points} XP
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-4 py-2 text-sm font-bold text-[#00d4ff]">
              🏆 Rank: {rank.title}
            </div>
          </motion.div>

          {/* XP Progress bar */}
          <motion.div
            className="mt-5 mx-auto max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Level {level}</span>
              <span>{nextRank ? `Next: ${nextRank.title}` : "Max Rank!"}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-[#1a2035] border border-[#00d4ff]/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88]"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress.percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ boxShadow: "0 0 12px rgba(0,212,255,0.5)" }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              {xpProgress.current} / {xpProgress.needed} XP to next level
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        {/* ── Daily Missions ── */}
        <motion.div
          className="mt-6 rounded-2xl border border-[#00ff88]/30 bg-gradient-to-r from-[#00ff88]/5 to-[#00d4ff]/5 p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-white">
              🎯 Daily Missions
            </h2>
            <span className="text-xs text-gray-400 font-mono">Resets in {countdownLabel}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {dailyMissions.map((dm, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  dm.done
                    ? "border-[#00ff88]/40 bg-[#00ff88]/10"
                    : "border-white/10 bg-[#0f1729]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center ${
                    dm.done ? "border-[#00ff88] bg-[#00ff88]" : "border-gray-600"
                  }`}>
                    {dm.done && <CheckCircle2 className="h-3.5 w-3.5 text-[#0a0e1a]" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{dm.name}</p>
                    <p className="text-xs text-[#00ff88] font-bold mt-1">+{dm.xp} XP</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Complete each challenge to earn bonus XP — check back daily for new missions!</p>
          </div>
        </motion.div>

        {/* ── Byte's Pick ── */}
        <motion.div
          className="mt-8 rounded-2xl border border-[#00d4ff]/30 bg-gradient-to-r from-[#0f1729] to-[#131b2e] p-5 flex items-center gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <img
            src={heroCharacter}
            alt="Byte"
            className={`object-contain drop-shadow-[0_0_10px_rgba(0,212,255,0.3)] ${isJuniorTier ? "h-24 w-24" : "h-20 w-20"}`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#00d4ff] font-bold uppercase tracking-wider mb-1">Byte's Pick</p>
            <p className="text-gray-400 text-sm mb-1">Byte says: Try this one today, Guardian! 👾</p>
            <p className="text-lg font-bold text-white">{featuredGame.title}</p>
          </div>
          <button
            onClick={() =>
              launchStandaloneGame("wordsearch", featuredGame.id, featuredGame.title, {
                words: featuredGame.wordsByTier[tier],
                gridSize: featuredGame.gridSizeByTier[tier],
              })
            }
            className="shrink-0 rounded-full bg-[#00d4ff] px-6 py-2.5 text-sm font-bold text-[#0a0e1a] transition-all hover:bg-[#00d4ff]/80 hover:shadow-[0_0_16px_rgba(0,212,255,0.4)]"
          >
            Play Now
          </button>
        </motion.div>

        {/* ── Quiz Challenges section ── */}
        <SectionHeader icon="🎮" title="Quiz Challenges" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quizMissions.map((g) => (
            <NeonGameCard
              key={g.id}
              title={g.title}
              description={g.desc}
              stars={g.stars}
              typeBadge={g.badge}
              locked={g.locked}
              onClick={() => handleGameClick(g)}
            />
          ))}
        </div>

        {/* ── All other game sections ── */}
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-3 mb-5 mt-10">
              <div className={`w-1 h-8 rounded-full ${section.color}`} />
              <span className="text-2xl">{section.icon}</span>
              <h2 className="text-xl font-extrabold tracking-wide text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]">{section.title}</h2>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {section.games.map((g: any) => (
                <NeonGameCard
                  key={g.id}
                  title={g.title}
                  description={g.desc}
                  stars={g.stars ?? 0}
                  typeBadge={g.badge}
                  locked={g.locked ?? false}
                  onClick={() => handleGameClick(g)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* ── Your Stats ── */}
        <motion.div
          className="mt-10 rounded-2xl border border-yellow-500/20 bg-[#0f1729] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-lg font-extrabold text-yellow-400 mb-1 drop-shadow-[0_0_8px_rgba(255,200,0,0.3)]">
            🏆 Your Progress
          </h2>
          <p className="text-xs text-gray-500 mb-4">Keep training to climb the ranks, Guardian!</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 text-center">
              <p className="text-2xl font-extrabold text-yellow-400">{points.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Total XP</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 text-center">
              <p className="text-2xl font-extrabold text-[#00ff88]">{completedMissionIds.size}</p>
              <p className="text-xs text-gray-500 mt-1">Missions Done</p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4 text-center">
              <p className="text-2xl font-extrabold text-orange-400">{streak}</p>
              <p className="text-xs text-gray-500 mt-1">Day Streak</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-4">Global leaderboards coming soon!</p>
        </motion.div>
      </div>

      {/* ── Byte floating character ── */}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2">
        <motion.div
          className="rounded-2xl rounded-br-sm border border-[#00d4ff]/30 bg-[#0f1729]/95 backdrop-blur px-4 py-2.5 max-w-[220px] shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-xs text-gray-300">
            {isJuniorTier
              ? "Let's play a game together! You're doing AMAZING! 🌟💪"
              : "Pick a game and let's train, Guardian! 💪"}
          </p>
        </motion.div>
        <motion.img
          src={heroCharacter}
          alt="Byte"
          className={`object-contain drop-shadow-[0_0_12px_rgba(0,212,255,0.4)] ${isJuniorTier ? "h-20 w-20" : "h-16 w-16"}`}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: isJuniorTier ? 2 : 2.5, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
