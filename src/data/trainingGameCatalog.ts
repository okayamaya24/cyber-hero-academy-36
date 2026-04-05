/**
 * Master catalog of all Training Center games.
 * Both AdminGamesPage and MissionsPage reference this single source of truth.
 * The `id` field must match what's stored in `training_game_settings.id`.
 */

export interface TrainingGameEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: string;
  /** If set, completing this Adventure zone auto-unlocks the game */
  linkedZone?: string;
}

export const TRAINING_GAME_CATALOG: TrainingGameEntry[] = [
  // ── Arcade Games ──
  { id: "virus-vaporizer", title: "Virus Vaporizer", description: "Zap viruses before they infect your files!", category: "Arcade", categoryIcon: "🕹️" },
  { id: "spot-the-phish", title: "Spot the Phish", description: "Swipe safe or phishing on emails and texts!", category: "Arcade", categoryIcon: "🕹️" },
  { id: "firewall-blitz", title: "Firewall Blitz", description: "Block threats flying across the screen in lanes!", category: "Arcade", categoryIcon: "🕹️" },
  { id: "hacker-chase", title: "Hacker Chase", description: "Chase the hacker through the digital world!", category: "Arcade", categoryIcon: "🕹️" },

  // ── Keyboard Games ──
  { id: "type-to-defend", title: "Type to Defend", description: "Type the word fast to destroy threats before they reach your base!", category: "Keyboard", categoryIcon: "⌨️" },
  { id: "password-cracker-race", title: "Password Cracker Race", description: "Race a hacker bot — type strong passwords before it guesses them!", category: "Keyboard", categoryIcon: "⌨️" },
  { id: "code-typer", title: "Code Typer", description: "Type safe commands to neutralize malicious code before it executes!", category: "Keyboard", categoryIcon: "⌨️" },
  { id: "decrypt-message", title: "Decrypt the Message", description: "Decode a scrambled secret message letter by letter!", category: "Keyboard", categoryIcon: "⌨️" },
  { id: "firewall-typer", title: "Firewall Typer", description: "Words fly in from both sides — type them to block them!", category: "Keyboard", categoryIcon: "⌨️" },

  // ── Puzzle Games ──
  { id: "cyber-escape", title: "Cyber Escape Room", description: "Solve 4 puzzles to escape the hacker's lair!", category: "Puzzle", categoryIcon: "🧩" },
  { id: "code-breaker", title: "Code Breaker", description: "Crack the cipher and decode the secret message!", category: "Puzzle", categoryIcon: "🧩" },
  { id: "password-tower", title: "Password Tower", description: "Stack password ingredients to build the strongest password!", category: "Puzzle", categoryIcon: "🧩" },
  { id: "lock-the-vault-puzzle", title: "Lock the Vault", description: "Solve the sequence to seal the vault before the hacker gets in!", category: "Puzzle", categoryIcon: "🧩" },

  // ── Sort & Decide ──
  { id: "safe-danger-sort", title: "Safe or Danger? Rapid Sort", description: "Items flash fast — hit Safe or Danger as quick as you can!", category: "Sort", categoryIcon: "🎯" },
  { id: "real-or-fake", title: "Real or Fake Website", description: "Spot the fake website before you click!", category: "Sort", categoryIcon: "🎯" },
  { id: "trust-or-trash", title: "Trust or Trash", description: "Decide if messages and links are trustworthy or trash!", category: "Sort", categoryIcon: "🎯" },

  // ── Speed Rounds ──
  { id: "quiz-blitz", title: "Byte's Quiz Blitz", description: "Byte fires questions for 60 seconds — answer as many as you can!", category: "Speed", categoryIcon: "⚡" },
  { id: "true-false-lightning", title: "True or False Lightning", description: "Cyber facts flash fast — TRUE or FALSE? Streak multiplier!", category: "Speed", categoryIcon: "⚡" },
  { id: "beat-the-clock", title: "Beat the Clock Trivia", description: "Answer before the timer hits zero — every second counts!", category: "Speed", categoryIcon: "⚡" },

  // ── Memory & Match ──
  { id: "cyber-memory", title: "Cyber Memory Match", description: "Flip cards to match cyber threat pairs!", category: "Memory", categoryIcon: "🃏" },
  { id: "sequence-shield", title: "Sequence Shield", description: "Remember and repeat the sequence to activate your shield!", category: "Memory", categoryIcon: "🃏" },

  // ── Word Search ──
  { id: "ws_password_hunt", title: "Password Hunt", description: "Find hidden password-related words!", category: "Word Search", categoryIcon: "🔍" },
  { id: "ws_phishing_detective", title: "Phishing Detective", description: "Spot phishing words hidden in the puzzle!", category: "Word Search", categoryIcon: "🔍" },
  { id: "ws_privacy_patrol", title: "Privacy Patrol", description: "Find privacy-related words to keep your info safe!", category: "Word Search", categoryIcon: "🔍" },

  // ── Crossword ──
  { id: "cw_cyber_basics", title: "Cyber Basics", description: "Test your cyber vocabulary knowledge!", category: "Crossword", categoryIcon: "✏️" },
  { id: "cw_stay_safe", title: "Stay Safe Online", description: "Complete the crossword to prove your safety skills!", category: "Crossword", categoryIcon: "✏️" },

  // ── Drag & Drop ──
  { id: "dd_password_builder", title: "Build a Strong Password", description: "Drag the right ingredients to build the strongest password!", category: "Drag & Drop", categoryIcon: "🖱️" },
  { id: "dd_scam_sorter", title: "Safe or Scam Sorter", description: "Drag messages into safe or scam buckets!", category: "Drag & Drop", categoryIcon: "🖱️" },
  { id: "lock-the-vault-dd", title: "Lock the Vault", description: "Drag the correct keys into the right locks before time runs out!", category: "Drag & Drop", categoryIcon: "🖱️" },
];

/** All unique categories in order */
export const TRAINING_CATEGORIES = [...new Set(TRAINING_GAME_CATALOG.map((g) => g.category))];

/** Quick lookup by id */
export const TRAINING_GAME_MAP = new Map(TRAINING_GAME_CATALOG.map((g) => [g.id, g]));
