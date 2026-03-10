import { supabase } from "@/integrations/supabase/client";
import { ALL_BADGES, MISSIONS, type LearningMode } from "@/data/missions";

export interface BadgeCheckContext {
  childId: string;
  missionId?: string;
  score?: number;
  totalGames?: number;
  learningMode?: LearningMode;
  streak?: number;
  completedMissionIds?: string[];
  earnedBadgeIds?: Set<string>;
  // Mini-game counters (from completed games history)
  wordSearchWins?: number;
  memoryWins?: number;
  sortGameWins?: number;
  secretKeeperWins?: number;
  bossWins?: number;
}

export async function awardBadge(childId: string, badgeId: string) {
  const badge = ALL_BADGES.find((b) => b.id === badgeId);
  if (!badge) return;

  await supabase.from("earned_badges").upsert(
    {
      child_id: childId,
      badge_id: badge.id,
      badge_name: badge.name,
      badge_icon: badge.icon,
    },
    { onConflict: "child_id,badge_id" }
  );
}

export async function checkAndAwardBadges(ctx: BadgeCheckContext) {
  const newBadges: string[] = [];
  const earned = ctx.earnedBadgeIds ?? new Set<string>();

  // Streak badges
  if (ctx.streak && ctx.streak >= 1 && !earned.has("daily-learner")) {
    newBadges.push("daily-learner");
  }
  if (ctx.streak && ctx.streak >= 3 && !earned.has("3-day-streak")) {
    newBadges.push("3-day-streak");
  }
  if (ctx.streak && ctx.streak >= 7 && !earned.has("7-day-streak")) {
    newBadges.push("7-day-streak");
  }

  // Deep practice badge
  if (ctx.learningMode === "deep" && ctx.score === ctx.totalGames && !earned.has("deep-practice-hero")) {
    newBadges.push("deep-practice-hero");
  }

  // Mini-game badges
  if ((ctx.wordSearchWins ?? 0) >= 5 && !earned.has("word-search-winner")) {
    newBadges.push("word-search-winner");
  }
  if ((ctx.memoryWins ?? 0) >= 5 && !earned.has("memory-master")) {
    newBadges.push("memory-master");
  }
  if ((ctx.sortGameWins ?? 0) >= 10 && !earned.has("website-detective")) {
    newBadges.push("website-detective");
  }
  if ((ctx.secretKeeperWins ?? 0) >= 5 && !earned.has("secret-safe-keeper")) {
    newBadges.push("secret-safe-keeper");
  }
  if ((ctx.bossWins ?? 0) >= 1 && !earned.has("boss-battle-beginner")) {
    newBadges.push("boss-battle-beginner");
  }
  if ((ctx.bossWins ?? 0) >= 5 && !earned.has("boss-battle-champion")) {
    newBadges.push("boss-battle-champion");
  }

  // Cyber Champion: all missions completed
  const completedIds = ctx.completedMissionIds ?? [];
  const allMissionIds = MISSIONS.map((m) => m.id);
  if (allMissionIds.every((id) => completedIds.includes(id)) && !earned.has("cyber-champion")) {
    newBadges.push("cyber-champion");
  }

  // Master Hero: all other badges earned
  const nonMasterBadges = ALL_BADGES.filter((b) => b.id !== "master-hero").map((b) => b.id);
  const allEarnedAfter = new Set([...earned, ...newBadges]);
  if (nonMasterBadges.every((id) => allEarnedAfter.has(id)) && !earned.has("master-hero")) {
    newBadges.push("master-hero");
  }

  // Award all new badges
  for (const badgeId of newBadges) {
    await awardBadge(ctx.childId, badgeId);
  }

  return newBadges;
}
