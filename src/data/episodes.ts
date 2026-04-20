/**
 * Episode registry — maps zone IDs to their episode data.
 */
import { ZONE1_SCENES, ZONE1_EPISODE_TITLE } from "@/data/zone1_password_peak";

export interface EpisodeData {
  title: string;
  scenes: unknown;
}

const EPISODES: Record<string, EpisodeData> = {
  "password-peak": {
    title: ZONE1_EPISODE_TITLE,
    scenes: ZONE1_SCENES,
  },
};

export function getZoneEpisode(zoneId: string): EpisodeData | null {
  return EPISODES[zoneId] ?? null;
}
