/**
 * Episode registry — maps zone IDs to their episode data.
 */
import { ZONE1_SCENES, ZONE1_EPISODE_TITLE, type EpisodeScene } from "@/data/zone1_password_peak";
import type { EpisodeData } from "@/components/zone/EpisodePlayer";

const EPISODES: Record<string, EpisodeData> = {
  "password-peak": {
    title: ZONE1_EPISODE_TITLE,
    scenes: ZONE1_SCENES,
  },
};

export function getZoneEpisode(zoneId: string): EpisodeData | null {
  return EPISODES[zoneId] ?? null;
}
