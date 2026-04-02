/**
 * Adventure Engine — Shared React hook for zone/continent progress queries.
 * Wraps Supabase queries so every screen uses the same data shape.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { computeZoneStatus } from "./progression";
import type { ZoneDef } from "@/data/continents";

export interface ZoneProgressRow {
  id: string;
  child_id: string;
  continent_id: string;
  zone_id: string;
  status: string;
  games_completed: number;
  total_games: number;
  stars_earned: number;
  unlocked_at: string | null;
  created_at: string;
}

/**
 * Fetch zone progress for a child on a specific continent.
 */
export function useZoneProgress(childId: string | null, continentId: string | null) {
  return useQuery({
    queryKey: ["zone_progress", childId, continentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zone_progress")
        .select("*")
        .eq("child_id", childId!)
        .eq("continent_id", continentId!);
      if (error) throw error;
      return (data || []) as ZoneProgressRow[];
    },
    enabled: !!childId && !!continentId,
    refetchOnMount: "always" as const,
    staleTime: 0,
  });
}

/**
 * Compute zone statuses for all zones in a continent.
 */
export function useZoneStatuses(
  zones: ZoneDef[],
  zoneProgress: ZoneProgressRow[],
  continentId: string,
) {
  return zones.map((zone) => computeZoneStatus(zone, zones, zoneProgress, continentId));
}

/**
 * Fetch child profile data.
 */
export function useChildProfile(childId: string | null) {
  return useQuery({
    queryKey: ["child", childId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("id", childId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!childId,
  });
}

/**
 * Save zone completion to the database.
 */
export async function saveZoneCompletion(params: {
  childId: string;
  continentId: string;
  zoneId: string;
  stars: number;
  gamesCompleted?: number;
  totalGames?: number;
}) {
  const { childId, continentId, zoneId, stars, gamesCompleted = 4, totalGames = 4 } = params;

  await supabase.from("zone_progress").upsert(
    {
      child_id: childId,
      continent_id: continentId,
      zone_id: zoneId,
      status: "completed",
      games_completed: gamesCompleted,
      total_games: totalGames,
      stars_earned: stars,
    },
    { onConflict: "child_id,zone_id" },
  );
}

/**
 * Save game (mission) completion to the database.
 */
export async function saveGameCompletion(params: {
  childId: string;
  missionId: string;
  stars: number;
  gameType: string;
}) {
  await supabase.from("mission_progress").upsert(
    {
      child_id: params.childId,
      mission_id: params.missionId,
      status: "completed",
      score: params.stars,
      max_score: 3,
      stars_earned: params.stars,
      game_type: params.gameType,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "child_id,mission_id" },
  );
}

/**
 * Save boss completion and update continent progress.
 */
export async function saveBossCompletion(params: {
  childId: string;
  continentId: string;
  zoneId: string;
  stars: number;
  isFinalBoss: boolean;
  childPoints: number;
  villainsDefeated: number;
  xpBonus: number;
}) {
  const { childId, continentId, zoneId, stars, isFinalBoss, childPoints, villainsDefeated, xpBonus } = params;

  await supabase.from("zone_progress").upsert(
    {
      child_id: childId,
      continent_id: continentId,
      zone_id: zoneId,
      status: "completed",
      games_completed: 4,
      total_games: 4,
      stars_earned: stars,
    },
    { onConflict: "child_id,zone_id" },
  );

  await supabase.from("continent_progress").upsert(
    {
      child_id: childId,
      continent_id: continentId,
      status: "completed",
      boss_defeated: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "child_id,continent_id" },
  );

  const updates: Record<string, any> = {
    villains_defeated: villainsDefeated + 1,
    points: childPoints + xpBonus,
  };
  if (isFinalBoss) {
    updates.master_certificate_earned = true;
    updates.worlds_completed = 7;
  }
  await supabase.from("child_profiles").update(updates).eq("id", childId);
}

/**
 * Unlock the next zone in sequence.
 */
export async function unlockNextZone(params: {
  childId: string;
  continentId: string;
  nextZoneId: string;
}) {
  await supabase.from("zone_progress").upsert(
    {
      child_id: params.childId,
      continent_id: params.continentId,
      zone_id: params.nextZoneId,
      status: "available",
      games_completed: 0,
      total_games: 4,
      stars_earned: 0,
    },
    { onConflict: "child_id,zone_id" },
  );
}

/**
 * Award XP and recalculate level.
 */
export async function awardXp(childId: string, currentPoints: number, xpToAdd: number) {
  const newPoints = currentPoints + xpToAdd;
  const newLevel = Math.floor(newPoints / 500) + 1;
  await supabase
    .from("child_profiles")
    .update({ points: newPoints, level: newLevel })
    .eq("id", childId);
}
