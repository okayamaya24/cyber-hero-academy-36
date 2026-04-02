/**
 * Adventure Engine — Shared progression logic.
 * Zone unlocking, status computation, star/XP calculations.
 */

import type { ZoneDef } from "@/data/continents";
import { ZONE_ORDER } from "@/data/zoneOrder";

/**
 * Compute zone status: completed | available | locked
 * Uses the static ZONE_ORDER registry for sequential unlocking.
 */
export function computeZoneStatus(
  zone: ZoneDef,
  allZones: ZoneDef[],
  zoneProgress: Array<{ zone_id: string; status: string }>,
  continentId: string,
): "completed" | "available" | "locked" {
  const progress = zoneProgress.find((p) => p.zone_id === zone.id);
  if (progress?.status === "completed") return "completed";

  const order = ZONE_ORDER[continentId];
  if (order) {
    const idx = order.indexOf(zone.id);
    if (idx === 0) return "available";
    if (idx < 0) return "locked";
    const prevId = order[idx - 1];
    const prevDone = zoneProgress.find((p) => p.zone_id === prevId && p.status === "completed");
    return prevDone ? "available" : "locked";
  }

  // Fallback: generic sequential unlock
  if (zone.isBoss) {
    const nonBoss = allZones.filter((z) => !z.isBoss);
    const allDone = nonBoss.every((z) =>
      zoneProgress.find((p) => p.zone_id === z.id && p.status === "completed"),
    );
    return allDone ? "available" : "locked";
  }
  const i = allZones.indexOf(zone);
  if (i === 0) return "available";
  const prev = allZones[i - 1];
  const prevDone = zoneProgress.find((p) => p.zone_id === prev.id && p.status === "completed");
  return prevDone ? "available" : "locked";
}

/**
 * Compute stars from mistake count.
 */
export function computeStars(mistakes: number): number {
  if (mistakes === 0) return 3;
  if (mistakes === 1) return 2;
  return 1;
}

/**
 * Compute player level from total XP.
 */
export function computeLevel(totalXp: number): number {
  return Math.floor(totalXp / 500) + 1;
}

/**
 * Get XP per game completion based on age tier.
 */
export type AgeTier = "junior" | "defender" | "guardian";

export function getAgeTier(age: number): AgeTier {
  if (age <= 7) return "junior";
  if (age <= 10) return "defender";
  return "guardian";
}

export function getXpPerGame(tier: AgeTier): number {
  switch (tier) {
    case "junior": return 50;
    case "defender": return 100;
    case "guardian": return 150;
  }
}
