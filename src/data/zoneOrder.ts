/** Static zone ordering per continent — used for sequential unlocking */

import { getZoneGames, getBossBattle } from "./zoneGames";
import { CUSTOM_MISSION_ZONES } from "./customZoneMissions";

export const ZONE_ORDER: Record<string, string[]> = {
  "north-america": ["hq", "password-peak", "pixel-port", "signal-summit", "code-canyon", "encrypt-enclave", "arctic-archive", "shadow-station", "firewall-fortress", "boss-keybreaker"],
  "europe": ["phish-lagoon", "download-dungeon", "code-castle", "wifi-watch", "data-fortress", "cyber-citadel", "boss-phisher"],
  "africa": ["stranger-shore", "dark-web-den", "kindness-citadel", "signal-savanna", "code-cape", "data-delta", "boss-troll"],
  "asia": ["privacy-palace", "browse-bazaar", "firewall-frontier", "cyberguard-academy", "network-nexus", "hack-haven", "tech-temple", "boss-phantom"],
  "south-america": ["kindness-kingdom", "social-fortress", "identity-isle", "jungle-junction", "cyber-coast", "boss-datathief"],
  "australia": ["malware-maze", "update-outpost", "antivirus-atoll", "outback-ops", "reef-recon", "boss-malware"],
  "antarctica": ["crypto-cavern", "algorithm-abyss", "code-citadel", "ice-intelligence", "boss-shadowbyte"],
};

/**
 * A zone is playable once it has content. Zones without games yet show as
 * "coming soon" and are skipped when unlocking, so they never block the boss
 * or the next continent. They slot back in automatically once games exist.
 */
export function isZonePlayable(zoneId: string): boolean {
  if (zoneId === "hq" || CUSTOM_MISSION_ZONES.has(zoneId)) return true;
  if (zoneId.startsWith("boss-")) return !!getBossBattle(zoneId);
  return !!getZoneGames(zoneId);
}

/** The unlock order with not-yet-built zones removed */
export function getPlayableOrder(continentId: string): string[] {
  return (ZONE_ORDER[continentId] ?? []).filter(isZonePlayable);
}

export function getNextZone(continentId: string, currentZoneId: string): string | null {
  const order = getPlayableOrder(continentId);
  if (order.length === 0) return null;
  const currentIndex = order.indexOf(currentZoneId);
  if (currentIndex === -1 || currentIndex >= order.length - 1) return null;
  return order[currentIndex + 1];
}

export function isLastRegularZone(continentId: string, currentZoneId: string): boolean {
  const order = getPlayableOrder(continentId);
  if (order.length === 0) return false;
  const currentIndex = order.indexOf(currentZoneId);
  // Last regular zone is the one right before the boss
  return currentIndex === order.length - 2;
}
