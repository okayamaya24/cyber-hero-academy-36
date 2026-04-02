/**
 * Adventure Engine — Barrel export.
 * Import everything from '@/engine' in consuming code.
 */

// Types
export type {
  SpeakerRole,
  DialogueLine,
  DialogueChoice,
  DialogueScene,
  ZoneStoryScript,
  VillainAsset,
  VillainTaunts,
  ZoneNarrationDef,
  MiniGameDef,
  ZoneQuizQuestion,
  ZoneWordSearch,
  ZoneDragDropItem,
  ZoneDragDrop,
  ZoneCrossword,
  ZoneGameContent,
  BossBattleContent,
  ContinentConfig,
} from "./types";

// Progression logic
export {
  computeZoneStatus,
  computeStars,
  computeLevel,
  getAgeTier,
  getXpPerGame,
} from "./progression";

// Dialogue helpers
export {
  getNarration,
  getCompletionDialogue,
  createScene,
  getVillainAngerLevel,
} from "./dialogue";

// Registry
export {
  registerContinent,
  getContinentConfig,
  isContinentMigrated,
  getRegisteredContinents,
} from "./continentRegistry";

// Progress hooks & DB helpers
export {
  useZoneProgress,
  useZoneStatuses,
  useChildProfile,
  saveZoneCompletion,
  saveGameCompletion,
  saveBossCompletion,
  unlockNextZone,
  awardXp,
} from "./useAdventureProgress";

// Zone adventure flow hook
export {
  useZoneAdventure,
} from "./useZoneAdventure";
export type {
  AdventurePhase,
  UseZoneAdventureParams,
  UseZoneAdventureReturn,
} from "./useZoneAdventure";
