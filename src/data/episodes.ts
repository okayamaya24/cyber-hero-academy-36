/**
 * Episode registry — maps zone IDs to their Pixar-style episode data.
 * ZoneGameScreen calls getZoneEpisode(zoneId); zones with an entry here
 * use the full EpisodePlayer flow instead of the cutscene + tab-game flow.
 */
import type { EpisodeData } from "@/components/zone/EpisodePlayer";
import { zone1Episode } from "./episodes/zone1_passwordPeak";
import {
  pixelPortEpisode,
  signalSummitEpisode,
  codeCanyonEpisode,
  encryptEnclaveEpisode,
  arcticArchiveEpisode,
  shadowStationEpisode,
  firewallFortressEpisode,
} from "./episodes/northAmericaZones";

const EPISODES: Record<string, EpisodeData> = {
  // North America
  "pixel-port":        pixelPortEpisode,
  "signal-summit":     signalSummitEpisode,
  "code-canyon":       codeCanyonEpisode,
  "encrypt-enclave":   encryptEnclaveEpisode,
  "password-peak":     zone1Episode,
  "arctic-archive":    arcticArchiveEpisode,
  "shadow-station":    shadowStationEpisode,
  "firewall-fortress": firewallFortressEpisode,
  // Europe, Africa, Asia... episodes added here as scripted
};

export function getZoneEpisode(zoneId: string): EpisodeData | null {
  return EPISODES[zoneId] ?? null;
}
