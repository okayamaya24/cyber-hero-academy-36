/**
 * Episode registry — maps zone IDs to their Pixar-style episode data.
 * ZoneGameScreen calls getZoneEpisode(zoneId); zones with an entry here
 * use the full EpisodePlayer flow instead of the cutscene + tab-game flow.
 */
import type { EpisodeData } from "@/components/zone/EpisodePlayer";
import { zone1Episode } from "./episodes/zone1_passwordPeak";

const EPISODES: Record<string, EpisodeData> = {
  "password-peak": zone1Episode,
  // Add zone 2–10 episodes here as they are scripted
};

export function getZoneEpisode(zoneId: string): EpisodeData | null {
  return EPISODES[zoneId] ?? null;
}
