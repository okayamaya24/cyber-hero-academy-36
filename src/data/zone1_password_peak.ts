/**
 * Zone 1 — Password Peak: "Password Plains — The Cracking Hour"
 * Visual novel episode data for the EpisodePlayer.
 */

export interface EpisodeCharacter {
  name: string;
  position: "left" | "center" | "right";
  expression: "happy" | "neutral" | "scared" | "angry" | "determined";
}

export interface EpisodeScene {
  background: string;
  characters?: EpisodeCharacter[];
  speaker: string;
  dialogue: string;
  choices?: { text: string; nextScene: number; extraDialogue?: string }[];
  miniGame?: string;
  nextScene?: number;
  isEnding?: boolean;
  xpReward?: number;
  badge?: string;
  completionMessage?: string;
}

export const ZONE1_EPISODE_TITLE = "Password Plains — The Cracking Hour";

export const ZONE1_SCENES: EpisodeScene[] = [
  // Scene 0 — Opening
  {
    background: "linear-gradient(135deg, #0a0e2a 0%, #1a1040 50%, #0d1a2f 100%)",
    characters: [
      { name: "BYTE", position: "left", expression: "scared" },
      { name: "GUARDIAN", position: "right", expression: "determined" },
    ],
    speaker: "BYTE",
    dialogue: "Guardian! The Keybreaker has blocked the Digital City gates with weak passwords! We need to climb Password Peak and build super-strong ones!",
    nextScene: 1,
  },
  // Scene 1 — Keybreaker appears
  {
    background: "linear-gradient(135deg, #1a0a2a 0%, #2a1040 50%, #150d2f 100%)",
    characters: [
      { name: "THE KEYBREAKER", position: "center", expression: "angry" },
    ],
    speaker: "THE KEYBREAKER",
    dialogue: "Mwahaha! These passwords are UNBREAKABLE! Come back when you've trained more, rookie!",
    nextScene: 2,
  },
  // Scene 2 — Byte teaches
  {
    background: "linear-gradient(135deg, #0a1a2a 0%, #102a40 50%, #0d1f2f 100%)",
    characters: [
      { name: "BYTE", position: "left", expression: "happy" },
      { name: "GUARDIAN", position: "right", expression: "determined" },
    ],
    speaker: "BYTE",
    dialogue: "A strong password needs uppercase letters, numbers, AND symbols — and it should be long! Never use your name or birthday.",
    choices: [
      { text: "Got it — let's go!", nextScene: 3 },
      { text: "What counts as long enough?", nextScene: 3, extraDialogue: "At least 12 characters — the longer the better!" },
    ],
  },
  // Scene 3 — Mini-game 1
  {
    background: "linear-gradient(135deg, #0d1f3a 0%, #1a2a4a 50%, #0a152a 100%)",
    speaker: "BYTE",
    dialogue: "Time to put that into practice! Show the Keybreaker what a real password looks like.",
    miniGame: "lock-and-learn",
    nextScene: 4,
  },
  // Scene 4 — Keybreaker deal
  {
    background: "linear-gradient(135deg, #1a0d2a 0%, #2a1545 50%, #150a2f 100%)",
    characters: [
      { name: "THE KEYBREAKER", position: "left", expression: "angry" },
      { name: "GUARDIAN", position: "right", expression: "determined" },
    ],
    speaker: "THE KEYBREAKER",
    dialogue: "Impressive… but I have a deal for you. Stop now and I won't lock the whole city. What do you say?",
    choices: [
      { text: "No deal, Keybreaker!", nextScene: 5 },
      { text: "We hesitate…", nextScene: 5, extraDialogue: "Stay strong, Guardian — don't trust him!" },
    ],
  },
  // Scene 5 — Mini-game 2
  {
    background: "linear-gradient(135deg, #0a1f3a 0%, #152a4a 50%, #0d1a2f 100%)",
    speaker: "BYTE",
    dialogue: "The Keybreaker is throwing everything at us — we need to know the difference between a strong password and a weak one. Fast!",
    miniGame: "strong-or-smash",
    nextScene: 6,
  },
  // Scene 6 — Mini-game 3
  {
    background: "linear-gradient(135deg, #1a1030 0%, #2a1a4a 50%, #0d0a2f 100%)",
    characters: [
      { name: "THE KEYBREAKER", position: "left", expression: "angry" },
      { name: "GUARDIAN", position: "right", expression: "determined" },
    ],
    speaker: "THE KEYBREAKER",
    dialogue: "You can't trust everything online — even I could pretend to be someone helpful. Can you tell who's real?",
    miniGame: "who-do-you-trust",
    nextScene: 7,
  },
  // Scene 7 — Final choice
  {
    background: "linear-gradient(135deg, #0a2a3a 0%, #1a3a5a 50%, #0d2a4a 100%)",
    characters: [
      { name: "GUARDIAN", position: "center", expression: "determined" },
      { name: "BYTE", position: "right", expression: "happy" },
    ],
    speaker: "BYTE",
    dialogue: "The gates are opening! The Keybreaker is retreating!",
    choices: [
      { text: "I'll lead the defense!", nextScene: 8 },
      { text: "We did it together!", nextScene: 9 },
    ],
  },
  // Scene 8 — Victory A
  {
    background: "linear-gradient(135deg, #0a3a2a 0%, #1a5a3a 50%, #0d4a2f 100%)",
    speaker: "BYTE",
    dialogue: "You led the charge, Guardian! The Keybreaker can't believe it. The Digital City gates are OPEN!",
    isEnding: true,
    xpReward: 150,
    badge: "Password Pro",
    completionMessage: "Yippee! The gates are open and the Keybreaker is worried!",
  },
  // Scene 9 — Victory B
  {
    background: "linear-gradient(135deg, #0a3a2a 0%, #1a5a3a 50%, #0d4a2f 100%)",
    characters: [
      { name: "GUARDIAN", position: "left", expression: "happy" },
      { name: "BYTE", position: "right", expression: "happy" },
    ],
    speaker: "BYTE",
    dialogue: "Together we cracked it! The Keybreaker is running — and the whole city is cheering!",
    isEnding: true,
    xpReward: 150,
    badge: "Password Pro",
    completionMessage: "Yippee! The gates are open and the Keybreaker is worried!",
  },
];
