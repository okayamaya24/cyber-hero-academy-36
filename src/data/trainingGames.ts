import type { AgeTier } from "./missions";

export interface WordSearchPuzzle {
  id: string;
  title: string;
  zone: string;
  zoneIcon: string;
  description: string;
  wordsByTier: Record<AgeTier, string[]>;
  gridSizeByTier: Record<AgeTier, number>;
}

export interface CrosswordClue {
  number: number;
  direction: "across" | "down";
  clue: string;
  answer: string;
  juniorClue?: string;
  guardianClue?: string;
}

export interface CrosswordPuzzle {
  id: string;
  title: string;
  zone: string;
  zoneIcon: string;
  description: string;
  clues: CrosswordClue[];
}

export interface DragDropGameDef {
  id: string;
  title: string;
  zone: string;
  zoneIcon: string;
  description: string;
  subType: "sort" | "password-builder";
  sortMissionId?: string;
}

/* ─── Word Search Puzzles ──────────────────────────────── */

export const WORD_SEARCH_PUZZLES: WordSearchPuzzle[] = [
  {
    id: "ws_password_hunt",
    title: "Password Hunt",
    zone: "Password Peak",
    zoneIcon: "🏔️",
    description: "Find hidden password-related words!",
    wordsByTier: {
      junior: ["LOCK", "SAFE", "CODE", "KEY", "HIDE"],
      defender: ["PASSWORD", "STRONG", "UPPERCASE", "NUMBER", "SYMBOL", "SECURE", "LOCK", "PROTECT"],
      guardian: ["ENCRYPTION", "FIREWALL", "PROTOCOL", "UPPERCASE", "CYBERSECURE"],
    },
    gridSizeByTier: { junior: 8, defender: 12, guardian: 14 },
  },
  {
    id: "ws_phishing_detective",
    title: "Phishing Detective",
    zone: "Phish Lagoon",
    zoneIcon: "🐟",
    description: "Spot phishing-related words hidden in the grid!",
    wordsByTier: {
      junior: ["FAKE", "TRICK", "SAFE", "STOP", "TELL"],
      defender: ["PHISHING", "SCAM", "FAKE", "VIRUS", "SPAM", "ALERT", "DANGER", "REPORT"],
      guardian: ["PHISHING", "MALWARE", "SPOOFING", "CREDENTIAL", "RANSOMWARE", "DECEPTION"],
    },
    gridSizeByTier: { junior: 8, defender: 12, guardian: 14 },
  },
  {
    id: "ws_privacy_patrol",
    title: "Privacy Patrol",
    zone: "Privacy Palace",
    zoneIcon: "🏰",
    description: "Find privacy-related words to keep your info safe!",
    wordsByTier: {
      junior: ["SAFE", "TELL", "STOP", "HELP", "KIND"],
      defender: ["PRIVATE", "SECRET", "ADDRESS", "SHARE", "TRUST", "STRANGER", "BLOCK", "HELP"],
      guardian: ["ANONYMOUS", "ENCRYPTED", "GEOLOCATION", "SURVEILLANCE", "BIOMETRIC"],
    },
    gridSizeByTier: { junior: 8, defender: 12, guardian: 14 },
  },
];

/* ─── Crossword Puzzles ────────────────────────────────── */

export const CROSSWORD_PUZZLES: CrosswordPuzzle[] = [
  {
    id: "cw_cyber_basics",
    title: "Cyber Basics",
    zone: "CyberGuard Academy",
    zoneIcon: "🎓",
    description: "Test your cyber vocabulary knowledge!",
    clues: [
      { number: 1, direction: "across", clue: "A secret code to protect your account", answer: "PASSWORD", juniorClue: "Keeps your account safe", guardianClue: "Alphanumeric credential for authentication" },
      { number: 3, direction: "across", clue: "Fake emails that try to trick you", answer: "PHISHING", juniorClue: "Tricky fake emails", guardianClue: "Social engineering via fraudulent communications" },
      { number: 5, direction: "across", clue: "Harmful software that damages computers", answer: "VIRUS", juniorClue: "Bad computer bug", guardianClue: "Self-replicating malicious code" },
      { number: 7, direction: "across", clue: "Keeping personal info private", answer: "PRIVACY", juniorClue: "Keeping secrets safe", guardianClue: "Right to control access to personal data" },
      { number: 2, direction: "down", clue: "A wall that blocks bad guys online", answer: "FIREWALL", juniorClue: "Blocks bad stuff", guardianClue: "Network security system monitoring traffic" },
      { number: 4, direction: "down", clue: "A safe place to store passwords", answer: "VAULT", juniorClue: "Safe storage", guardianClue: "Encrypted credential management repository" },
      { number: 6, direction: "down", clue: "Never share this with strangers", answer: "NAME", juniorClue: "What you're called", guardianClue: "Personally identifiable information" },
    ],
  },
  {
    id: "cw_stay_safe",
    title: "Stay Safe Online",
    zone: "Browse Bazaar",
    zoneIcon: "🏪",
    description: "Complete the crossword to prove your safety skills!",
    clues: [
      { number: 1, direction: "across", clue: "Always ask this person before going online", answer: "PARENT", juniorClue: "Ask them first", guardianClue: "Primary guardian overseeing digital access" },
      { number: 3, direction: "across", clue: "Don't talk to these people online", answer: "STRANGER", juniorClue: "Someone you don't know", guardianClue: "Unverified individual in digital space" },
      { number: 5, direction: "across", clue: "A trustworthy website starts with this", answer: "HTTPS", juniorClue: "Safe website letters", guardianClue: "Transport layer security protocol indicator" },
      { number: 7, direction: "across", clue: "What you should do to bad messages", answer: "REPORT", juniorClue: "Tell someone about it", guardianClue: "Formal notification to administrators" },
      { number: 2, direction: "down", clue: "Lock your account with this", answer: "PASSWORD", juniorClue: "Secret code", guardianClue: "Authentication credential" },
      { number: 4, direction: "down", clue: "Keep this secret — your home location", answer: "ADDRESS", juniorClue: "Where you live", guardianClue: "Physical location data subject to privacy" },
      { number: 6, direction: "down", clue: "Be kind online, this is called cyber __", answer: "KINDNESS", juniorClue: "Being nice", guardianClue: "Positive digital citizenship behavior" },
    ],
  },
];

/* ─── Drag & Drop Games ────────────────────────────────── */

export const DRAG_DROP_GAMES: DragDropGameDef[] = [
  {
    id: "dd_scam_sorter",
    title: "Safe or Scam? Sorter",
    zone: "Phish Lagoon",
    zoneIcon: "🐟",
    description: "Sort messages into safe or scam categories!",
    subType: "sort",
    sortMissionId: "scam-detection",
  },
  {
    id: "dd_password_builder",
    title: "Build a Strong Password",
    zone: "Password Peak",
    zoneIcon: "🏔️",
    description: "Build the strongest password you can!",
    subType: "password-builder",
  },
];
