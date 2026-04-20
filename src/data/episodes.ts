/**
 * Episode registry — maps zone IDs to their episode data.
 * Currently empty; ContinentMapScreen uses its own visual-novel EpisodePlayer
 * with ZONE1_SCENES directly. Zones without entries here fall back to the
 * cutscene intro flow in ZoneGameScreen.
 */
import type { EpisodeData } from "@/components/zone/EpisodePlayer";

const EPISODES: Record<string, EpisodeData> = {};

export function getZoneEpisode(zoneId: string): EpisodeData | null {
  return EPISODES[zoneId] ?? null;
}
