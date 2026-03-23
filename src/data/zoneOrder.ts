/** Static zone ordering per continent — used for sequential unlocking */

export const ZONE_ORDER: Record<string, string[]> = {
  "north-america": ["hq", "password-peak", "encrypt-enclave", "boss-keybreaker"],
  "europe": ["phish-lagoon", "download-dungeon", "code-castle", "boss-phisher"],
  "africa": ["stranger-shore", "dark-web-den", "kindness-citadel", "boss-troll"],
  "asia": ["privacy-palace", "browse-bazaar", "firewall-frontier", "cyberguard-academy", "boss-phantom"],
  "south-america": ["kindness-kingdom", "social-fortress", "identity-isle", "boss-datathief"],
  "australia": ["malware-maze", "update-outpost", "antivirus-atoll", "boss-malware"],
  "antarctica": ["crypto-cavern", "algorithm-abyss", "code-citadel", "boss-shadowbyte"],
};

export function getNextZone(continentId: string, currentZoneId: string): string | null {
  const order = ZONE_ORDER[continentId];
  if (!order) return null;
  const currentIndex = order.indexOf(currentZoneId);
  if (currentIndex === -1 || currentIndex >= order.length - 1) return null;
  return order[currentIndex + 1];
}

export function isLastRegularZone(continentId: string, currentZoneId: string): boolean {
  const order = ZONE_ORDER[continentId];
  if (!order) return false;
  const currentIndex = order.indexOf(currentZoneId);
  // Last regular zone is the one right before the boss
  return currentIndex === order.length - 2;
}
