import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  MISSIONS,
  ALL_BADGES,
  getTotalGames,
  LEARNING_MODE_CONFIG,
  type LearningMode,
} from "@/data/missions";
import { getLevelRank, getNextRank, getProgressToNextLevel } from "@/data/levelTitles";
import { GUIDE_REGISTRY } from "@/data/guides";
import robotGuide from "@/assets/robot-guide.png";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import DailyChallenge from "@/components/DailyChallenge";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

const BYTE_TIPS = [
  "Real sites use https:// — always check the lock icon before clicking! 🔒",
  "Never share your password — not even with your best friend! 🙅",
  "A strong password uses letters, numbers AND symbols. Try a passphrase! 💪",
  "If an email seems too good to be true, it probably is — that's phishing! 🎣",
  "Always ask a trusted adult before clicking a link you don't recognise. 👋",
  "Log out of accounts when you're done, especially on shared computers! 🚪",
  "Two-factor authentication is like a double lock on your accounts! 🔐",
  "Don't post personal info like your address or school online. 🛡️",
];

export default function KidDashboard() {
  const { user, activeChildId, setActiveChildId } = useAuth();
  const navigate = useNavigate();
  const { data: platformSettings } = usePlatformSettings();
  const worldMapEnabled = platformSettings?.world_map_enabled ?? false;

  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * BYTE_TIPS.length));
  const [tipVisible, setTipVisible] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!activeChildId && user) setActiveChildId(user.id);
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

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ["earned_badges", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("earned_badges").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  if (!child) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-slate-500">Loading your dashboard...</div>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/kid-dashboard")}>
            Click here if this takes too long
          </Button>
        </div>
      </div>
    );
  }

  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const totalGamesPerMission = getTotalGames(learningMode);
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge_id));

  const inProgressMissions = MISSIONS.filter((m) => missionProgress.find((p) => p.mission_id === m.id)?.status === "in_progress");
  const notStartedMissions = MISSIONS.filter((m) => { const mp = missionProgress.find((p) => p.mission_id === m.id); return !mp || mp.status === "not_started"; });
  const activeMission = inProgressMissions[0] ?? notStartedMissions[0] ?? null;
  const activeMissionProgress = activeMission ? missionProgress.find((p) => p.mission_id === activeMission.id) : null;
  const activeMissionGames = activeMissionProgress?.status === "completed" ? totalGamesPerMission : (activeMissionProgress?.current_question ?? 0);
  const activeMissionPct = totalGamesPerMission > 0 ? (activeMissionGames / totalGamesPerMission) * 100 : 0;

  const xpProgress = getProgressToNextLevel(child.points);
  const rank = getLevelRank(child.level);
  const nextRank = getNextRank(child.level);

  const earnedBadgeList = ALL_BADGES.filter((b) => earnedBadgeIds.has(b.id)).slice(0, 6);

  const totalGamesCompleted = missionProgress.reduce((acc, mp) => {
    if (mp.status === "completed") return acc + totalGamesPerMission;
    return acc + (mp.current_question ?? 0);
  }, 0);

  function cycleTip() {
    setTipVisible(false);
    setTimeout(() => {
      setTipIndex((i) => (i + 1) % BYTE_TIPS.length);
      setTipVisible(true);
    }, 200);
  }

  const streakDays = ["M", "T", "W", "T", "F", "S", "S"];
  const streakCount = child.streak ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── DARK HERO HEADER ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f0a2e 0%, #1e0a5e 50%, #0a1a4e 100%)" }}
      >
        {/* Glow orb */}
        <div className="pointer-events-none absolute right-24 -top-16 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />

        <div className="container relative z-10 mx-auto flex items-center gap-6 px-6 py-7">
          {/* Avatar */}
          <motion.div
            className="relative flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="rounded-full p-[3px] shadow-xl"
              style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)", boxShadow: "0 0 24px rgba(124,58,237,0.5)" }}>
              <HeroAvatar
                avatarConfig={(child as any).avatar_config as Record<string, any> | null}
                size={80}
                fallbackEmoji={child.avatar}
                className="rounded-full"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-yellow-900 shadow-lg ring-2 ring-white">
              {child.level}
            </div>
          </motion.div>

          {/* Name + XP */}
          <motion.div className="flex-1" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <p className="mb-0.5 text-[11px] font-black uppercase tracking-widest text-purple-300/70">Welcome back, Guardian</p>
            <h1 className="text-3xl font-black text-white">Hey, {child.name}! 👋</h1>
            <div className="mt-1.5 mb-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-200">
              ⚡ {rank.title} · Level {child.level}
            </div>
            <div className="flex items-center gap-3 max-w-xs">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#7c3aed,#22d3ee)", boxShadow: "0 0 8px rgba(34,211,238,0.6)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress.percent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
                />
              </div>
              <span className="text-[11px] font-bold text-white/50 whitespace-nowrap">{xpProgress.current} / {xpProgress.needed} XP</span>
            </div>
          </motion.div>

          {/* HUD stats */}
          <motion.div className="hidden gap-3 sm:flex" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
            {[
              { val: totalGamesCompleted, lbl: "Games" },
              { val: earnedBadges.length, lbl: "Badges" },
              { val: `${streakCount}🔥`, lbl: "Streak" },
            ].map((s) => (
              <div key={s.lbl} className="min-w-[76px] rounded-xl border border-white/10 bg-white/7 px-4 py-3 text-center"
                style={{ background: "rgba(255,255,255,0.07)" }}>
                <p className="font-orbitron text-lg font-bold text-white">{s.val}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-white/40">{s.lbl}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Curved bottom edge */}
        <div className="h-8 bg-slate-50" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </div>

      {/* ── BODY ── */}
      <div className="container mx-auto px-4 pb-24 pt-6 max-w-5xl">

        {/* TOP ROW: Active Mission + Daily Quest + Streak */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_260px_176px]">

          {/* Active Mission */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-4 rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            onClick={() => navigate(activeMission ? `/missions?mission=${activeMission.id}` : "/missions")}
          >
            <div className="flex-shrink-0 text-5xl">
              {activeMission ? activeMission.badgeIcon : "🎯"}
            </div>
            <div className="flex-1 min-w-0">
              <span className="mb-1.5 inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-purple-700">
                🔥 Active Mission
              </span>
              <h3 className="text-lg font-black text-slate-900">{activeMission?.title ?? "No mission yet"}</h3>
              <p className="text-sm text-slate-400">{activeMission?.description ?? "Start your first mission!"}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all"
                  style={{ width: `${activeMissionPct}%` }} />
              </div>
              <p className="mt-1 text-[11px] font-semibold text-slate-400">{activeMissionGames}/{totalGamesPerMission} games</p>
            </div>
            <Button
              className="flex-shrink-0 flex-col gap-0.5 rounded-xl px-5 py-3 text-sm font-black shadow-md"
              style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}
            >
              ▶ {activeMissionProgress?.status === "in_progress" ? "Continue" : "Start"}
              <span className="text-[10px] font-semibold opacity-70">+XP waiting!</span>
            </Button>
          </motion.div>

          {/* Daily Quest */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="rounded-2xl border-2 border-yellow-300 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            style={{ background: "linear-gradient(135deg,#fef3c7,#fffbeb)" }}
          >
            <DailyChallenge childId={child.id} childAge={child.age} compact />
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            className="rounded-2xl border-2 border-orange-300 p-5 text-center shadow-sm"
            style={{ background: "linear-gradient(135deg,#fff7ed,#fff)" }}
          >
            <span className="block text-4xl" style={{ animation: "flame 1.5s ease-in-out infinite alternate" }}>🔥</span>
            <p className="font-orbitron mt-1 text-4xl font-black text-orange-500">{streakCount}</p>
            <p className="mt-0.5 text-[11px] font-black uppercase tracking-wide text-slate-400">Day Streak</p>
            <div className="mt-3 flex justify-center gap-1">
              {streakDays.map((d, i) => (
                <div key={i} className={`flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-black ${
                  i < streakCount ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-300"
                }`}>{d}</div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* MIDDLE ROW: XP/Rank + Earned Badges */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-[216px_1fr]">

          {/* XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-purple-200 p-5 shadow-sm"
            style={{ background: "linear-gradient(135deg,#ede9fe,#f5f3ff)" }}
          >
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-purple-600">Total XP</p>
            <p className="font-orbitron text-4xl font-black text-purple-900">{child.points.toLocaleString()}</p>
            <p className="mb-4 text-[11px] font-bold text-purple-400">Experience Points</p>
            <div className="mb-1 flex justify-between text-xs font-bold">
              <span className="text-purple-800">⚡ {rank.title}</span>
              {nextRank && <span className="text-purple-400">→ {nextRank.title}</span>}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-purple-200/50">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
                style={{ width: `${xpProgress.percent}%` }} />
            </div>
            {nextRank && <p className="mt-1.5 text-[11px] font-bold text-purple-400">{xpProgress.needed - xpProgress.current} XP to next rank 🚀</p>}
          </motion.div>

          {/* Earned Badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-black text-slate-900">🏅 Earned Badges</h2>
              <Link to="/missions" className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-black text-purple-700 transition-colors hover:bg-purple-100">
                See all {ALL_BADGES.length} →
              </Link>
            </div>

            {earnedBadgeList.length === 0 ? (
              <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-sm font-bold text-slate-400">Complete missions to earn badges! 🎯</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {earnedBadgeList.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.03 }}
                    className="flex items-center gap-2.5 rounded-xl border border-purple-100 bg-purple-50/60 px-3 py-2.5 transition-all hover:border-purple-300"
                  >
                    <span className="text-2xl flex-shrink-0">{badge.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-800">{badge.name}</p>
                      <p className="text-[10px] font-semibold text-purple-500">Earned ✓</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* World Map link if enabled */}
        {worldMapEnabled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="mb-5"
          >
            <Button variant="outline" className="w-full rounded-xl py-5 text-sm font-bold" asChild>
              <Link to="/world-map">🗺️ Adventure Mode — Explore the World Map</Link>
            </Button>
          </motion.div>
        )}

      </div>

      {/* ── BYTE FLOATING CORNER ── */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 cursor-pointer"
        onClick={cycleTip}
        title="Click for a new tip!"
      >
        <AnimatePresence mode="wait">
          {tipVisible && (
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="max-w-[210px] rounded-2xl rounded-br-sm border border-cyan-200 bg-white p-3 shadow-lg"
            >
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-cyan-600">⚡ Byte says:</p>
              <p className="text-xs font-bold leading-relaxed text-slate-700">{BYTE_TIPS[tipIndex]}</p>
              <p className="mt-1.5 text-[9px] text-slate-300 font-semibold">tap for another tip</p>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="relative"
        >
          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-cyan-300 bg-cyan-50 shadow-lg"
            style={{ boxShadow: "0 4px 16px rgba(6,182,212,0.25)" }}>
            <img src={robotGuide} alt="Byte" className="h-full w-full object-contain p-1" />
          </div>
          <div className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-cyan-400"
            style={{ animation: "pulse 2s ease-in-out infinite" }} />
        </motion.div>
      </div>

      <style>{`
        @keyframes flame { from { transform: scale(1) rotate(-3deg); } to { transform: scale(1.12) rotate(3deg); } }
        .font-orbitron { font-family: 'Orbitron', 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}
