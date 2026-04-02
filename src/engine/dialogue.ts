/**
 * Adventure Engine — Dialogue system helpers.
 * Used by both ContinentMapScreen (story engine) and ZoneGameScreen (debrief).
 */

import type { DialogueLine, DialogueScene, ZoneNarrationDef } from "./types";

const DEFAULT_NARRATION: ZoneNarrationDef = {
  intro: "A new threat has been detected in this sector. Guardian, your mission starts now!",
  afterGame: [
    "Great work! You cracked through the first layer of defences.",
    "The villain's grip is weakening. Keep pushing!",
    "Almost there — one more challenge to go!",
  ],
  villainTaunts: [
    "You got lucky!",
    "Don't think you can beat me!",
    "This can't be happening!",
    "FINE! You win... for now!",
  ],
};

const DEFAULT_COMPLETION: DialogueLine[] = [
  { speaker: "guide", text: "Zone secured! Outstanding work, Guardian!" },
  { speaker: "guide", text: "The Digital World is safer because of you." },
];

/**
 * Get narration for a zone, with fallback.
 */
export function getNarration(
  zoneId: string,
  narrations: Record<string, ZoneNarrationDef>,
): ZoneNarrationDef {
  return narrations[zoneId] || DEFAULT_NARRATION;
}

/**
 * Get completion dialogue for a zone, with fallback.
 */
export function getCompletionDialogue(
  zoneId: string,
  dialogues: Record<string, DialogueLine[]>,
): DialogueLine[] {
  return dialogues[zoneId] || DEFAULT_COMPLETION;
}

/**
 * Create a dialogue scene from lines with optional choices.
 */
export function createScene(lines: DialogueLine[]): DialogueScene {
  return { lines };
}

/**
 * Get the villain's anger level based on zones completed.
 * Used for progressive villain taunts during story panels.
 */
export function getVillainAngerLevel(
  zonesCompleted: number,
  totalZones: number,
): "confident" | "worried" | "desperate" {
  const ratio = zonesCompleted / Math.max(totalZones, 1);
  if (ratio < 0.4) return "confident";
  if (ratio < 0.75) return "worried";
  return "desperate";
}
