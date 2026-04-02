/**
 * Adventure Engine — Continent config registry.
 * Each continent registers its config here; screens look up configs at runtime.
 */

import type { ContinentConfig } from "./types";

const registry = new Map<string, ContinentConfig>();

/**
 * Register a continent's config. Called once per continent module.
 */
export function registerContinent(config: ContinentConfig): void {
  registry.set(config.id, config);
}

/**
 * Look up a continent config. Returns null if not yet registered
 * (continent still uses legacy inline data).
 */
export function getContinentConfig(continentId: string): ContinentConfig | null {
  return registry.get(continentId) ?? null;
}

/**
 * Check if a continent has been migrated to the engine.
 */
export function isContinentMigrated(continentId: string): boolean {
  return registry.has(continentId);
}

/**
 * Get all registered continent IDs.
 */
export function getRegisteredContinents(): string[] {
  return Array.from(registry.keys());
}
