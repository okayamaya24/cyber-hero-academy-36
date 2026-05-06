import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, CheckCircle2, ArrowRight, Mail, ExternalLink, Flame, Lock as LockIcon, Gamepad2, ChevronRight, BookOpen } from "lucide-react";
import LearningModeTab from "@/components/learning/LearningModeTab";
import { isGameUnlockedByLessons, getGameTeacher } from "@/data/learningMode";
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

/* ─── Category color/icon/glow themes ─── */
const CATEGORY_THEMES: Record<string, { color: string; glow: string; icon: string }> = {
  "Arcade":      { color: "#00d4ff", glow: "rgba(0,212,255,0.22)",   icon: "🕹️" },
  "Keyboard":    { color: "#ff6b6b", glow: "rgba(255,107,107,0.22)", icon: "⌨️" },
  "Puzzle":      { color: "#a855f7", glow: "rgba(168,85,247,0.22)",  icon: "🧩" },
  "Sort":        { color: "#00ff88", glow: "rgba(0,255,136,0.22)",   icon: "🎯" },
  "Speed":       { color: "#ffd700", glow: "rgba(255,215,0,0.22)",   icon: "⚡" },
  "Memory":      { color: "#ec4899", glow: "rgba(236,72,153,0.22)",  icon: "🃏" },
  "Word Search": { color: "#38bdf8", glow: "rgba(56,189,248,0.22)",  icon: "🔍" },
  "Crossword":   { color: "#f97316", glow: "rgba(249,115,22,0.22)",  icon: "✏️" },
  "Drag & Drop": { color: "#4ade80", glow: "rgba(74,222,128,0.22)",  icon: "🖱️" },
  "Quiz":        { color: "#fbbf24", glow: "rgba(251,191,36,0.22)",  icon: "🎮" },
};

/* ─── Difficulty per category ─── */
const CATEGORY_DIFFICULTY: Record<string, { label: string; level: number; color: string }> = {
  "Arcade":      { label: "Medium", level: 2, color: "#ffd700" },
  "Keyboard":    { label: "Hard",   level: 3, color: "#ff6b6b" },
  "Puzzle":      { label: "Medium", level: 2, color: "#a855f7" },
  "Sort":        { label: "Easy",   level: 1, color: "#00ff88" },
  "Speed":       { label: "Hard",   level: 3, color: "#ff6b6b" },
  "Memory":      { label: "Easy",   level: 1, color: "#ec4899" },
  "Word Search": { label: "Easy",   level: 1, color: "#38bdf8" },
  "Crossword":   { label: "Medium", level: 2, color: "#f97316" },
  "Drag & Drop": { label: "Easy",   level: 1, color: "#4ade80" },
  "Quiz":        { label: "Medium", level: 2, color: "#fbbf24" },
};

/* ─── Section Header ─── */
function SectionHeader({
  icon, title, count, color,
}: {
  icon: string; title: string; count?: number; color?: string;
}) {
  const c = color ?? "#00d4ff";
  return (
    <div className="flex items-center gap-3 mb-5 mt-12 first:mt-0">
      <div
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{ background: `${c}12`, border: `1px solid ${c}28` }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-extrabold text-white leading-tight">{title}</h2>
        {count !== undefined && (
          <p className="text-[11px] text-gray-600">{count} game{count !== 1 ? "s" : ""}</p>
        )}
      </div>
      <div className="h-px flex-1 max-w-[160px]" style={{ background: `linear-gradient(90deg, ${c}35, transparent)` }} />
    </div>
  );
}

/* ─── Neon Game Card ─── */
function NeonGameCard({
  title, description, stars, typeBadge, locked, onClick, isNew, isHot,
}: {
  title: string; description: string; stars: number; typeBadge: string;
  locked?: boolean; onClick: () => void; isNew?: boolean; isHot?: boolean;
}) {
  const theme    = CATEGORY_THEMES[typeBadge]     ?? CATEGORY_THEMES["Quiz"];
  const diff     = CATEGORY_DIFFICULTY[typeBadge] ?? CATEGORY_DIFFICULTY["Quiz"];
  const mastered = stars === 3;

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl border bg-[#0d1323] flex flex-col ${
        locked
          ? "border-white/6 opacity-50 cursor-not-allowed"
          : "border-white/8 cursor-pointer"
      }`}
      onClick={locked ? undefined : onClick}
      whileHover={locked ? undefined : { y: -3, scale: 1.015 }}
      whileTap={locked  ? undefined : { scale: 0.975 }}
      transition={{ duration: 0.16 }}
    >
      {/* Top accent bar */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{ background: locked ? "rgba(255,255,255,0.05)" : theme.color }}
      />

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/45 rounded-2xl gap-2">
          <LockIcon className="h-7 w-7 text-white/25" />
          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Coming Soon</span>
        </div>
      )}

      {/* Status badge — top-right corner */}
      {!locked && (
        <div className="absolute top-[14px] right-3 z-10">
          {mastered ? (
            <span className="rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wide"
              style={{ color: "#ffd700", borderColor: "rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.1)" }}>
              ★ MASTERED
            </span>
          ) : isNew ? (
            <span className="rounded-full bg-[#00ff88] px-2 py-0.5 text-[9px] font-black text-[#0a0e1a] tracking-widest shadow-sm">
              NEW
            </span>
          ) : isHot ? (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-black text-white tracking-widest shadow-sm"
              style={{ background: "linear-gradient(90deg,#f97316,#ef4444)" }}>
              🔥 HOT
            </span>
          ) : null}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Icon + category badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[22px] leading-none">{theme.icon}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ color: theme.color, background: `${theme.color}10`, border: `1px solid ${theme.color}25` }}
          >
            {typeBadge}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-extrabold text-white mb-1.5 line-clamp-1 pr-2">{title}</h3>

        {/* Description */}
        <p className="text-[11px] text-gray-400/90 mb-4 line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>

        {/* Difficulty bar */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex gap-[3px]">
            {[1, 2, 3].map((d) => (
              <div
                key={d}
                className="h-1.5 w-5 rounded-full"
                style={{ background: d <= diff.level ? diff.color : "rgba(255,255,255,0.07)" }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold" style={{ color: diff.color }}>{diff.label}</span>
        </div>

        {/* Stars + play button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-0.5">
            {[1, 2, 3].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${s <= stars ? "text-yellow-400 fill-yellow-400" : "text-white/10"}`}
              />
            ))}
          </div>

          {locked ? (
            <span className="rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/20">Locked</span>
          ) : (
            <button
              className="relative rounded-full px-4 py-1.5 text-[11px] font-extrabold text-[#080c18] overflow-hidden
                         transition-all hover:shadow-lg active:scale-95 hover:brightness-110"
              style={{ background: theme.color }}
              onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
              {stars > 0 ? "▶ Replay" : "▶ Play"}
            </button>
          )}
        </div>
      </div>

      {/* Hover inset glow */}
      {!locked && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 28px ${theme.glow}` }}
        />
      )}
    </motion.div>
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

  // Tab state — must be before any early returns (React hooks rules)
  const [activeTab, setActiveTab] = useState<"learn" | "games">("learn");

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
     VIEW: Training Center Hub
     ═══════════════════════════════════════════ */

  const points  = child?.points  ?? 0;
  const streak  = child?.streak  ?? 0;
  const level   = child?.level   ?? 1;
  const rank       = getLevelRank(level);
  const xpProgress = getProgressToNextLevel(points);
  const nextRank   = getNextRank(level);
  const isJuniorTier      = tier === "junior";
  const trainingTierLabel = getTrainingTierLabel(tier);
  const trainingTierEmoji = getTrainingTierEmoji(tier);
  const playerName = (child as any)?.name ?? "Guardian";

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

  /** A game is locked if admin locked it OR the lesson hasn't been completed yet */
  const isGameLocked = (gameId: string) =>
    isGameLockedByAdmin(gameId) || !isGameUnlockedByLessons(gameId, completedMissionIds);

  /* ── Full Game Catalog ── */
  const arcadeGames = [
    { id: "virus-vaporizer",  title: "Virus Vaporizer",  desc: "Zap viruses before they infect your files!",           badge: "Arcade", route: "/games/virus-vaporizer",  locked: isGameLocked("virus-vaporizer"), isHot: true },
    { id: "spot-the-phish",   title: "Spot the Phish",   desc: "Swipe safe or phishing on emails and texts!",          badge: "Arcade", route: "/games/spot-the-phish",   locked: isGameLocked("spot-the-phish") },
    { id: "firewall-blitz",   title: "Firewall Blitz",   desc: "Block threats flying across the screen in lanes!",     badge: "Arcade", route: "/games/firewall-blitz",   locked: isGameLocked("firewall-blitz") },
    { id: "hacker-chase",     title: "Hacker Chase",     desc: "Chase the hacker through the digital world!",          badge: "Arcade", route: "/games/hacker-chase",     locked: isGameLocked("hacker-chase"),   isNew: true },
  ];

  const keyboardGames = [
    { id: "type-to-defend",        title: "Type to Defend",        desc: "Type the word fast to destroy threats before they reach your base!", badge: "Keyboard", route: "/games/type-to-defend",        locked: isGameLocked("type-to-defend"),        isHot: true },
    { id: "password-cracker-race", title: "Password Cracker Race", desc: "Race a hacker bot — type strong passwords before it guesses them!", badge: "Keyboard", route: "/games/password-cracker-race", locked: isGameLocked("password-cracker-race") },
    { id: "code-typer",            title: "Code Typer",            desc: "Type safe commands to neutralize malicious code before it executes!", badge: "Keyboard", route: "/games/code-typer",           locked: isGameLocked("code-typer") },
    { id: "decrypt-message",       title: "Decrypt the Message",   desc: "Decode a scrambled secret message letter by letter!",               badge: "Keyboard", route: "/games/decrypt-the-message",   locked: isGameLocked("decrypt-message") },
    { id: "firewall-typer",        title: "Firewall Typer",        desc: "Words fly in from both sides — type them to block them!",           badge: "Keyboard", route: "/games/firewall-typer",        locked: isGameLocked("firewall-typer"),        isNew: true },
  ];

  const puzzleGames = [
    { id: "cyber-escape",          title: "Cyber Escape Room", desc: "Solve 4 puzzles to escape the hacker's lair!",                    badge: "Puzzle", route: "/games/cyber-escape-room", locked: isGameLocked("cyber-escape"),          isHot: true },
    { id: "code-breaker",          title: "Code Breaker",      desc: "Crack the cipher and decode the secret message!",                 badge: "Puzzle", route: "/games/code-breaker",      locked: isGameLocked("code-breaker") },
    { id: "password-tower",        title: "Password Tower",    desc: "Stack password ingredients to build the strongest password!",     badge: "Puzzle", route: "/games/password-tower",    locked: isGameLocked("password-tower") },
    { id: "lock-the-vault-puzzle", title: "Lock the Vault",    desc: "Solve the sequence to seal the vault before the hacker gets in!", badge: "Puzzle", route: "/games/lock-the-vault",    locked: isGameLocked("lock-the-vault-puzzle"), isNew: true },
  ];

  const sortGames = [
    { id: "safe-danger-sort", title: "Safe or Danger? Rapid Sort", desc: "Items flash fast — hit Safe or Danger as quick as you can!", badge: "Sort", route: "/games/safe-or-danger-sort",  locked: isGameLocked("safe-danger-sort") },
    { id: "real-or-fake",     title: "Real or Fake Website",       desc: "Spot the fake website before you click!",                  badge: "Sort", route: "/games/real-or-fake-website", locked: isGameLocked("real-or-fake") },
    { id: "trust-or-trash",   title: "Trust or Trash",             desc: "Decide if messages and links are trustworthy or trash!",   badge: "Sort", route: "/games/trust-or-trash",       locked: isGameLocked("trust-or-trash"),   isHot: true },
    ...MISSIONS.filter((m) => m.id === "scam-detection").map((m) => ({
      id: m.id, title: "Spot the Phish (Quiz)", desc: "Sort real from fake messages!", badge: "Sort",
      locked: isGameLocked(m.id), stars: getStandaloneStars(m.id), mission: m,
    })),
    ...DRAG_DROP_GAMES.filter((g) => g.subType === "sort").map((g) => ({
      id: g.id, title: g.title, desc: g.description, badge: "Sort",
      locked: isGameLocked(g.id), stars: getStandaloneStars(g.id), dragdrop: g,
    })),
  ];

  const speedGames = [
    { id: "quiz-blitz",           title: "Byte's Quiz Blitz",      desc: "Byte fires questions for 60 seconds — answer as many as you can!", badge: "Speed", route: "/games/bytes-quiz-blitz",        locked: isGameLocked("quiz-blitz"),           isHot: true },
    { id: "true-false-lightning", title: "True or False Lightning", desc: "Cyber facts flash fast — TRUE or FALSE? Streak multiplier!",      badge: "Speed", route: "/games/true-or-false-lightning", locked: isGameLocked("true-false-lightning") },
    { id: "beat-the-clock",       title: "Beat the Clock Trivia",   desc: "Answer before the timer hits zero — every second counts!",        badge: "Speed", route: "/games/beat-the-clock-trivia",   locked: isGameLocked("beat-the-clock") },
  ];

  const memoryGames = [
    { id: "cyber-memory",    title: "Cyber Memory Match", desc: "Flip cards to match cyber threat pairs!",                   badge: "Memory", route: "/games/cyber-memory-match", locked: isGameLocked("cyber-memory"),    isHot: true },
    { id: "sequence-shield", title: "Sequence Shield",    desc: "Remember and repeat the sequence to activate your shield!", badge: "Memory", route: "/games/sequence-shield",    locked: isGameLocked("sequence-shield"), isNew: true },
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
    locked: isGameLocked(p.id), stars: getStandaloneStars(p.id),
    route: WORD_SEARCH_ROUTES[p.id], wordsearch: WORD_SEARCH_ROUTES[p.id] ? undefined : p,
  }));

  const crosswordGames = CROSSWORD_PUZZLES.map((p) => ({
    id: p.id, title: p.title, desc: p.description, badge: "Crossword",
    locked: isGameLocked(p.id), stars: getStandaloneStars(p.id),
    route: CROSSWORD_ROUTES[p.id], crossword: CROSSWORD_ROUTES[p.id] ? undefined : p,
  }));

  const dragDropGames = [
    ...DRAG_DROP_GAMES.map((g) => ({
      id: g.id, title: g.title, desc: g.description, badge: "Drag & Drop",
      locked: isGameLocked(g.id), stars: getStandaloneStars(g.id), dragdrop: g,
    })),
    { id: "lock-the-vault-dd", title: "Lock the Vault", desc: "Drag the correct keys into the right locks before time runs out!", badge: "Drag & Drop", route: "/games/lock-the-vault-drag", locked: isGameLocked("lock-the-vault-dd") },
  ];

  const quizMissions = MISSIONS.map((m) => ({
    id: m.id, title: m.title, desc: m.description, badge: "Quiz",
    locked: isGameLocked(m.id),
    stars: (() => {
      const totalGames = getTotalGames(learningMode);
      const mp = getModeAwareMissionProgress(missionProgress, m.id, totalGames);
      return getStarsFromProgress(mp);
    })(),
    mission: m,
  }));

  const sections = [
    {
      icon: "🎮", title: "Action Games", badge: "Arcade", color: "#00d4ff",
      games: [...arcadeGames, ...(tier !== "junior" ? keyboardGames : []), ...speedGames],
    },
    {
      icon: "🧩", title: "Brain Games", badge: "Puzzle", color: "#a855f7",
      games: [...puzzleGames, ...sortGames, ...memoryGames],
    },
    {
      icon: "🔍", title: "Word & Language", badge: "Word Search", color: "#38bdf8",
      games: [...wordSearchGames, ...crosswordGames, ...dragDropGames],
    },
  ];

  // Featured game (Byte's Pick — rotates daily)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const featuredGame = WORD_SEARCH_PUZZLES[dayOfYear % WORD_SEARCH_PUZZLES.length];

  // Recommended game — first unplayed, unlocked game
  const allGames = [...arcadeGames, ...puzzleGames, ...quizMissions];
  const recommendedGame = allGames.find(g => !g.locked && (g.stars ?? 0) === 0);

  // In-progress missions — for "Continue Playing"
  const inProgressMissions = quizMissions
    .filter((g) => {
      const mp = missionProgress.find((p: any) => p.mission_id === g.id);
      return (mp as any)?.status === "in_progress";
    })
    .slice(0, 3);

  const handleStartLesson = (missionId: string) => {
    const mission = MISSIONS.find((m) => m.id === missionId);
    if (mission) startMission(mission);
  };

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
    if (game.dragdrop)  { launchStandaloneGame("dragdrop",  game.dragdrop.id,  game.dragdrop.title,  game.dragdrop);  return; }
  };

  /* ── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ──
     RENDER
  ── ─── ─── ─── ─── ─── ─── ─── ─── ─── ─── ── */
  return (
    <div className="min-h-screen bg-[#080c18] pb-28 relative">

      {/* ── SIMPLE HEADER ── */}
      <div className="border-b border-white/[0.05] bg-[#0d1528]">
        <div className="container mx-auto max-w-5xl px-4 py-5">
          <motion.div
            className="flex items-center justify-between gap-3 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <p className="text-[10px] font-extrabold tracking-[0.2em] text-[#00d4ff] uppercase mb-0.5">🎮 Training Center</p>
              <h1 className="text-2xl font-black text-white">
                Pick a game{playerName !== "Guardian" ? `, ${playerName}` : ""}!
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {isJuniorTier ? "Every game makes you a smarter hero 🌟" : "Train hard, level up, protect the world ⚡"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                tier === "junior" ? "border-yellow-400/30 bg-yellow-400/8 text-yellow-300"
                  : tier === "defender" ? "border-[#00d4ff]/30 bg-[#00d4ff]/8 text-[#00d4ff]"
                  : "border-red-400/30 bg-red-400/8 text-red-300"
              }`}>
                {trainingTierEmoji} {trainingTierLabel}
              </span>
              {streak > 0 && (
                <div className="flex items-center gap-1 rounded-full border border-orange-500/25 bg-orange-500/8 px-2.5 py-1">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  <span className="text-sm font-extrabold text-orange-400">{streak}</span>
                  <span className="text-[10px] text-orange-400/60">streak</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── TAB SWITCHER ── */}
      <div className="bg-[#0d1528] px-4 pt-4 pb-0">
        <div className="container mx-auto max-w-5xl">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("learn")}
              className={`flex items-center gap-2 rounded-t-xl px-6 py-3 text-sm font-extrabold transition-all ${
                activeTab === "learn"
                  ? "bg-white text-purple-700 shadow-lg"
                  : "bg-white/10 text-gray-400 hover:bg-white/15 hover:text-white"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              📚 Learn
            </button>
            <button
              onClick={() => setActiveTab("games")}
              className={`flex items-center gap-2 rounded-t-xl px-6 py-3 text-sm font-extrabold transition-all ${
                activeTab === "games"
                  ? "bg-white text-cyan-700 shadow-lg"
                  : "bg-white/10 text-gray-400 hover:bg-white/15 hover:text-white"
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
              🎮 Games
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          CONTENT AREA
      ════════════════════════════════════ */}
      <div className="container mx-auto px-4 max-w-5xl mt-8">

        {/* ── LEARN TAB ── */}
        {activeTab === "learn" && (
          <LearningModeTab
            completedMissionIds={completedMissionIds}
            missionProgress={missionProgress}
            onStartLesson={handleStartLesson}
            childName={playerName}
          />
        )}

        {/* ── GAMES TAB ── */}
        {activeTab === "games" && (<>

        {/* ── LEARN FIRST BANNER ── */}
        {completedMissionIds.size === 0 && (
          <motion.div
            className="mb-8 flex items-start gap-3 rounded-2xl border border-purple-500/25 bg-purple-500/8 p-4"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-2xl flex-shrink-0">🔒</span>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-purple-300">Complete a lesson to unlock games!</p>
              <p className="text-xs text-gray-400 mt-0.5">Head to the <button onClick={() => setActiveTab("learn")} className="text-purple-400 underline font-bold">Learn tab</button> first — finishing lessons unlocks games here.</p>
            </div>
          </motion.div>
        )}

        {/* ── CONTINUE PLAYING ── (only shown when there are in-progress missions) */}
        {inProgressMissions.length > 0 && (
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <h2 className="text-base font-extrabold text-white">Continue Playing</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {inProgressMissions.map((g) => {
                const theme = CATEGORY_THEMES[g.badge] ?? CATEGORY_THEMES["Quiz"];
                return (
                  <motion.button
                    key={g.id}
                    className="flex items-center gap-3 rounded-2xl border border-[#00ff88]/18 bg-[#0c1a12] p-4 text-left
                               hover:border-[#00ff88]/35 transition-colors"
                    onClick={() => handleGameClick(g)}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="text-2xl leading-none">{theme.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-extrabold text-[#00ff88] uppercase tracking-wider">In Progress</p>
                      <p className="text-sm font-bold text-white truncate">{g.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#00ff88]/50 flex-shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── RECOMMENDED FOR YOU ── */}
        {recommendedGame && (
          <motion.div
            className="mb-10 rounded-2xl border border-[#00ff88]/20 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #091510 0%, #0c1a14 100%)" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4 p-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#00ff88]/15 flex items-center justify-center text-2xl">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#00ff88] mb-0.5">⭐ Recommended for You</p>
                <p className="text-base font-bold text-white truncate">{recommendedGame.title}</p>
                <p className="text-xs text-gray-500 truncate">{recommendedGame.desc}</p>
              </div>
              <button
                onClick={() => handleGameClick(recommendedGame)}
                className="flex-shrink-0 rounded-full px-5 py-2 text-sm font-extrabold text-[#080c18] transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(90deg, #00ff88, #00d4ff)" }}
              >
                Play Now
              </button>
            </div>
          </motion.div>
        )}

        {/* ── BYTE'S PICK / SPOTLIGHT ── */}
        <motion.div
          className="mb-10 relative overflow-hidden rounded-2xl border border-[#00d4ff]/22"
          style={{ background: "linear-gradient(135deg, #0d1929 0%, #0f2040 65%, #0a1628 100%)" }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Glow orb */}
          <div className="pointer-events-none absolute right-0 top-0 w-56 h-56 rounded-full bg-[#00d4ff]/7 blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="pointer-events-none absolute left-1/3 bottom-0 w-40 h-40 rounded-full bg-[#00ff88]/5 blur-2xl translate-y-1/2" />

          <div className="relative z-10 flex items-center gap-5 p-6">
            <motion.img
              src={heroCharacter}
              alt="Byte"
              className={`object-contain flex-shrink-0 drop-shadow-[0_0_18px_rgba(0,212,255,0.5)] ${isJuniorTier ? "h-28 w-28" : "h-24 w-24"}`}
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#00d4ff]/38 bg-[#00d4ff]/12 px-2.5 py-0.5 text-[10px] font-extrabold text-[#00d4ff] uppercase tracking-wider">
                  ⭐ Byte's Pick
                </span>
                <span className="text-[10px] text-gray-500">Today's recommendation</span>
              </div>
              <p className="text-xl font-extrabold text-white leading-tight mb-1">{featuredGame.title}</p>
              <p className="text-xs text-gray-400 mb-4 line-clamp-1">{featuredGame.description}</p>
              <button
                onClick={() =>
                  launchStandaloneGame("wordsearch", featuredGame.id, featuredGame.title, {
                    words: featuredGame.wordsByTier[tier],
                    gridSize: featuredGame.gridSizeByTier[tier],
                  })
                }
                className="rounded-full px-6 py-2.5 text-sm font-extrabold text-[#080c18] transition-all
                           hover:shadow-[0_0_22px_rgba(0,212,255,0.4)] hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(90deg,#00d4ff,#00ff88)" }}
              >
                🎮 Play Now
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── QUIZ CHALLENGES ── */}
        <SectionHeader icon="🎮" title="Quiz Challenges" count={quizMissions.length} color="#fbbf24" />
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

        {/* ── ALL GAME SECTIONS ── */}
        {sections.map((section) => {
          const sectionTheme = CATEGORY_THEMES[section.badge] ?? CATEGORY_THEMES["Quiz"];
          return (
            <div key={section.title}>
              <SectionHeader
                icon={section.icon}
                title={section.title}
                count={section.games.length}
                color={sectionTheme.color}
              />
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {section.games.map((g: any) => (
                  <NeonGameCard
                    key={g.id}
                    title={g.title}
                    description={g.desc}
                    stars={g.stars ?? 0}
                    typeBadge={g.badge}
                    locked={g.locked ?? false}
                    isNew={g.isNew}
                    isHot={g.isHot}
                    onClick={() => handleGameClick(g)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        </>)}

      </div>{/* /container */}

      {/* ── BYTE FLOATING BUDDY ── */}
      <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none">
        <motion.div
          className="pointer-events-auto rounded-2xl rounded-br-sm border border-[#00d4ff]/22 bg-[#0d1323]/96 backdrop-blur px-4 py-2.5 max-w-[220px] shadow-xl"
          initial={{ opacity: 0, x: 22 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <p className="text-xs text-gray-300 leading-relaxed">
            {isJuniorTier
              ? "Let's play a game together! You're doing AMAZING! 🌟💪"
              : "Pick a game and let's train, Guardian! 💪"}
          </p>
        </motion.div>
        <motion.img
          src={heroCharacter}
          alt="Byte"
          className={`object-contain drop-shadow-[0_0_14px_rgba(0,212,255,0.42)] ${isJuniorTier ? "h-20 w-20" : "h-16 w-16"}`}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: isJuniorTier ? 2 : 2.5, ease: "easeInOut" }}
        />
      </div>

    </div>
  );
}
