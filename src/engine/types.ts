/**
 * Adventure Engine — Shared types for the continent/zone/mission system.
 * Every continent plugs into these types to share logic while keeping unique content.
 */

/* ── Dialogue ───────────────────────────────────────── */
export type SpeakerRole = "guide" | "villain";

export interface DialogueLine {
  speaker: SpeakerRole;
  text: string;
}

export interface DialogueChoice {
  label: string;
  nextLines?: DialogueLine[];
  effect?: string; // e.g. "xp:50" — extensible key
}

export interface DialogueScene {
  lines: DialogueLine[];
  choices?: DialogueChoice[]; // branching support
}

/* ── Zone Story Script ──────────────────────────────── */
export interface ZoneStoryScript {
  intro: DialogueLine[];
  completion: DialogueLine[];
  xp: number;
  badge?: string;
}

/* ── Villain ────────────────────────────────────────── */
export interface VillainAsset {
  img: string;
  color: string; // HSL string e.g. "140, 85%, 50%"
}

export interface VillainTaunts {
  idle: string[];
  dynamic: {
    locked: string;
    available: string;
    completed: string;
    boss: string;
    first?: string;
    lastLocked?: string;
  };
}

/* ── Zone Narration (cutscene intro + between-game) ── */
export interface ZoneNarrationDef {
  intro: string;
  afterGame: string[];
  villainTaunts: string[]; // progressively angrier
}

/* ── Mini-game definition ───────────────────────────── */
export interface MiniGameDef {
  type: string;
  title: string;
  description: string;
}

/* ── Zone game content ──────────────────────────────── */
export interface ZoneQuizQuestion {
  q: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface ZoneWordSearch {
  junior: { size: number; words: string[] };
  defender: { size: number; words: string[] };
  guardian: { size: number; words: string[] };
}

export interface ZoneDragDropItem {
  text: string;
  bucket: string;
}

export interface ZoneDragDrop {
  items: ZoneDragDropItem[];
  buckets: string[];
}

export interface ZoneCrossword {
  clues: Array<{
    number: number;
    direction: "across" | "down";
    clue: string;
    answer: string;
    juniorClue?: string;
    guardianClue?: string;
  }>;
  wordBank: string[];
}

export interface ZoneGameContent {
  quiz: { title: string; questions: ZoneQuizQuestion[] };
  miniGame: MiniGameDef;
  wordSearch?: ZoneWordSearch;
  crossword?: ZoneCrossword;
  dragDrop: ZoneDragDrop;
}

export interface BossBattleContent {
  isFinalBoss?: boolean;
  quizQuestions: ZoneQuizQuestion[];
  defenseRound: {
    type: "shield-dodge" | "scam-real" | "kindness";
    title: string;
    items: any[];
  };
  finalRound?: {
    title: string;
    patterns: { sequence: string[]; answer: string; options: string[] }[];
  };
}

/* ── Continent Config ───────────────────────────────── */
export interface ContinentConfig {
  id: string;

  /** Map intro dialogue shown first time player enters this continent */
  mapIntro: DialogueLine[];

  /** Per-zone story scripts (intro + completion dialogue, XP, badge) */
  zoneScripts: Record<string, ZoneStoryScript>;

  /** Per-zone game content */
  zoneGames: Record<string, ZoneGameContent>;

  /** Boss battle content (keyed by boss zone id) */
  bossBattles: Record<string, BossBattleContent>;

  /** Per-zone narrations for cutscene intros and between-game panels */
  zoneNarrations: Record<string, ZoneNarrationDef>;

  /** Villain visual config */
  villainAsset: VillainAsset;
  villainTaunts: VillainTaunts;

  /** Zone rewards (XP + optional badge per zone id) */
  zoneRewards: Record<string, { xp: number; badge?: string }>;

  /** Zone completion dialogue for the ZoneGameScreen debrief */
  zoneCompletionDialogue: Record<string, DialogueLine[]>;
}
