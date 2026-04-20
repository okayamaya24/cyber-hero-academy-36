/**
 * Episode Registry
 * Maps zone IDs to their Pixar-style episode data.
 * Zones without an entry fall back to the existing cutscene + mini-game tab flow.
 */

import type { EpisodeData } from "@/components/zone/EpisodePlayer";
import { zone1Episode } from "./zone1_passwordPeak";

const EPISODE_REGISTRY: Record<string, EpisodeData> = {
  "password-peak": zone1Episode,
  // Zone 2–8 episodes will be added here as they are scripted
};

/**
 * Returns episode data for a zone, or null if not yet scripted.
 */
export function getZoneEpisode(zoneId: string): EpisodeData | null {
  return EPISODE_REGISTRY[zoneId] ?? null;
}
