/**
 * Centralized Guide Character Registry
 * 
 * All guide characters and their mission/game assignments are defined here.
 * To add a new guide, add an entry to GUIDE_REGISTRY.
 * To change which guide appears where, update GUIDE_ASSIGNMENTS.
 */

import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";
import robotGuide from "@/assets/robot-guide.png";
import heroCharacter from "@/assets/hero-character.png";

export interface GuideCharacter {
  id: string;
  name: string;
  image: string;
  role: string;
  specialties: string[];
  /** Intro dialogue templates — randomly picked per appearance */
  intros: string[];
  /** Encouragement lines for correct answers */
  encourageCorrect: string[];
  /** Encouragement lines for incorrect answers */
  encourageTryAgain: string[];
}

// ─── GUIDE REGISTRY ──────────────────────────────────────────
export const GUIDE_REGISTRY: Record<string, GuideCharacter> = {
  "captain-cyber": {
    id: "captain-cyber",
    name: "Captain Cyber",
    image: heroCharacter,
    role: "Adventure Guide",
    specialties: ["mission-intros", "boss-battles", "celebrations", "encouragement"],
    intros: [
      "Welcome, Cyber Hero! Ready for an amazing adventure? Let's go! 🚀",
      "Hey champion! It's time to level up your cyber skills! 💪",
      "Another day, another mission! You're getting stronger every time! ⭐",
    ],
    encourageCorrect: [
      "🎉 Outstanding work, hero!",
      "🌟 You're a natural!",
      "💪 That's the cyber spirit!",
    ],
    encourageTryAgain: [
      "💪 Every hero keeps practicing!",
      "🌈 You'll nail it next time!",
      "📚 Learning is what heroes do!",
    ],
  },
  "detective-whiskers": {
    id: "detective-whiskers",
    name: "Detective Whiskers",
    image: detectiveCat,
    role: "Scam Spotter",
    specialties: ["phishing-detection", "fake-websites", "suspicious-messages", "scam-spotting"],
    intros: [
      "Hmm… something smells fishy! Let's investigate together! 🔍",
      "My whiskers are tingling — there are scams to catch! 🐱",
      "Detective Whiskers on the case! Let's find the fakes! 🕵️",
    ],
    encourageCorrect: [
      "🔍 Sharp eyes, detective!",
      "🐱 My whiskers approve!",
      "🎯 Case solved!",
    ],
    encourageTryAgain: [
      "🔍 Look more carefully next time!",
      "🐱 Even detectives miss clues sometimes!",
      "📋 Let's review the evidence again!",
    ],
  },
  "robo-buddy": {
    id: "robo-buddy",
    name: "Robo Buddy",
    image: robotGuide,
    role: "Tech Expert",
    specialties: ["passwords", "device-safety", "technology", "malware"],
    intros: [
      "Beep boop! Ready to power up your tech skills? 🤖",
      "Systems online! Let's build some super strong defenses! 🛡️",
      "Robo Buddy activated! Time for a tech challenge! ⚡",
    ],
    encourageCorrect: [
      "🤖 Processing… EXCELLENT!",
      "⚡ Systems report: AWESOME!",
      "🛡️ Defenses holding strong!",
    ],
    encourageTryAgain: [
      "🤖 Recalibrating… try again!",
      "⚡ Even robots learn from mistakes!",
      "🔧 Let's debug that answer!",
    ],
  },
  "professor-hoot": {
    id: "professor-hoot",
    name: "Professor Hoot",
    image: wiseOwl,
    role: "Safety Teacher",
    specialties: ["privacy", "personal-info", "digital-citizenship", "safe-sharing"],
    intros: [
      "Hoo-hoo! Class is in session! Let's learn about staying safe! 🦉",
      "Wisdom time! Professor Hoot has important lessons today! 📚",
      "Listen carefully, young hero — knowledge is your greatest shield! 🛡️",
    ],
    encourageCorrect: [
      "🦉 Wise choice!",
      "📚 A+ work, student!",
      "🎓 You're graduating to expert!",
    ],
    encourageTryAgain: [
      "🦉 Hmm, let's think about that again!",
      "📚 Every lesson makes you wiser!",
      "🎓 Wisdom comes with practice!",
    ],
  },
};

// ─── MISSION → GUIDE ASSIGNMENTS ─────────────────────────────
// Primary guide for each mission (drives the floating mascot + intro)
export const MISSION_GUIDE_MAP: Record<string, string> = {
  "scam-detection": "detective-whiskers",
  "password-safety": "robo-buddy",
  "safe-websites": "detective-whiskers",
  "personal-info": "professor-hoot",
  "malware-monsters": "robo-buddy",
  "phishy-messages": "detective-whiskers",
  "smart-sharing": "professor-hoot",
  "device-defender": "robo-buddy",
  "cyber-clues": "detective-whiskers",
  "internet-detective": "professor-hoot",
};

// Support guides that rotate in for feedback during games
export const MISSION_SUPPORT_GUIDES: Record<string, string[]> = {
  "scam-detection": ["captain-cyber", "professor-hoot"],
  "password-safety": ["captain-cyber", "professor-hoot"],
  "safe-websites": ["robo-buddy", "captain-cyber"],
  "personal-info": ["captain-cyber", "detective-whiskers"],
  "malware-monsters": ["captain-cyber", "detective-whiskers"],
  "phishy-messages": ["professor-hoot", "captain-cyber"],
  "smart-sharing": ["captain-cyber", "detective-whiskers"],
  "device-defender": ["detective-whiskers", "captain-cyber"],
  "cyber-clues": ["captain-cyber", "professor-hoot"],
  "internet-detective": ["robo-buddy", "captain-cyber"],
};

// Game type → default guide (fallback when mission doesn't specify)
export const GAME_TYPE_GUIDE_MAP: Record<string, string> = {
  "password-builder": "robo-buddy",
  "password-fixer": "robo-buddy",
  "strength-tester": "robo-buddy",
  "email-detective": "detective-whiskers",
  "word-search": "detective-whiskers",
  "spot-the-difference": "detective-whiskers",
  "secret-keeper": "professor-hoot",
  "sort-game": "professor-hoot",
  "memory": "robo-buddy",
  "boss-battle": "captain-cyber",
  "quiz": "captain-cyber",
  "scenario": "professor-hoot",
  "drag-sort": "professor-hoot",
};

// ─── CAPTAIN CYBER MISSION INTROS ────────────────────────────
export const CAPTAIN_MISSION_INTROS: Record<string, string> = {
  "scam-detection": "Welcome, hero! Detective Whiskers needs your help spotting scams. Are you ready? Let's go! 🕵️",
  "password-safety": "Hey there, champion! Robo Buddy has prepared some password challenges. Let's make your passwords unbreakable! 🤖",
  "safe-websites": "Time to explore the web safely! Detective Whiskers will guide you through dangerous sites. Stay sharp! 🔍",
  "personal-info": "Privacy is your superpower! Professor Hoot will teach you to guard your secrets. Let's begin! 🦉",
  "malware-monsters": "Malware is lurking! Robo Buddy will help you fight off viruses and trojans. Let's do this! 🤖",
  "phishy-messages": "Phishing attacks are everywhere! Detective Whiskers will teach you to spot them. Ready? 🐱",
  "smart-sharing": "Sharing is caring — but only when done safely! Professor Hoot will guide you! 🦉",
  "device-defender": "Your devices need protection! Robo Buddy knows all the tricks. Let's secure them! 🛡️",
  "cyber-clues": "Put on your detective hat! Detective Whiskers has mysteries to solve! 🔍",
  "internet-detective": "Not everything online is true! Professor Hoot will teach you to find the facts! 🦉",
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────

export function getGuide(guideId: string): GuideCharacter {
  return GUIDE_REGISTRY[guideId] ?? GUIDE_REGISTRY["captain-cyber"];
}

export function getMissionGuide(missionId: string): GuideCharacter {
  const guideId = MISSION_GUIDE_MAP[missionId] ?? "captain-cyber";
  return getGuide(guideId);
}

export function getSupportGuide(missionId: string, gameIndex: number): GuideCharacter {
  const supports = MISSION_SUPPORT_GUIDES[missionId] ?? ["captain-cyber"];
  const guideId = supports[gameIndex % supports.length];
  return getGuide(guideId);
}

export function getGameTypeGuide(gameType: string): GuideCharacter {
  const guideId = GAME_TYPE_GUIDE_MAP[gameType] ?? "captain-cyber";
  return getGuide(guideId);
}

export function getGuideIntro(guide: GuideCharacter): string {
  return guide.intros[Math.floor(Math.random() * guide.intros.length)];
}

export function getGuideEncouragement(guide: GuideCharacter, correct: boolean): string {
  const pool = correct ? guide.encourageCorrect : guide.encourageTryAgain;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getMissionIntro(missionId: string): string {
  return CAPTAIN_MISSION_INTROS[missionId] ?? "Let's start this mission, hero! 🚀";
}
