/**
 * Zones played as a story mission (a custom component) instead of the
 * standard quiz / mini-game / puzzle / sorting tabs.
 * Component lookup lives in ZoneGameScreen; this list is data-only so the
 * unlock logic can use it without importing UI.
 */
export const CUSTOM_MISSION_ZONES = new Set<string>(["wifi-watch"]);

/** Trophy badge earned for winning each story mission */
export const MISSION_TROPHIES: Record<string, string> = {
  "wifi-watch": "trophy-fake-router",
};
