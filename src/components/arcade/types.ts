/**
 * Arcade Foundation — Shared types
 * Import from here in every game so types stay in sync.
 */

// ── Age Tiers ────────────────────────────────────────────────────────────────
export type AgeTier = 'junior' | 'hero' | 'elite';

export const AGE_TIER_LABELS: Record<AgeTier, string> = {
  junior: '🐣 Junior Hero',
  hero: '⚡ Hero',
  elite: '🔥 Elite Hero',
};

// ── Game Result ───────────────────────────────────────────────────────────────
export interface GameResult {
  score: number;
  maxScore: number;
  /** 1–3 stars computed from score/maxScore ratio */
  stars: number;
  /** XP rewarded this session */
  xpEarned: number;
  /** ms the player spent — optional, set by timed games */
  durationMs?: number;
}

// ── Feedback State ────────────────────────────────────────────────────────────
export type FeedbackVariant = 'correct' | 'wrong' | 'timeout' | 'neutral';

export interface FeedbackState {
  visible: boolean;
  variant: FeedbackVariant;
  /** Short line shown inside the overlay, e.g. "Nice work!" */
  message?: string;
  /** Byte tip shown below the message */
  tip?: string;
}

// ── Game Phase ────────────────────────────────────────────────────────────────
export type GamePhase = 'playing' | 'feedback' | 'win' | 'lose';

// ── Binary choice option ──────────────────────────────────────────────────────
export interface BinaryOption {
  label: string;
  icon?: string;       // emoji or URL
  color?: 'green' | 'red' | 'cyan' | 'orange';
}

// ── Scenario Card data ────────────────────────────────────────────────────────
export interface ScenarioData {
  id: string;
  /** Main text / question shown on the card */
  content: string;
  /** Optional supporting detail */
  subtext?: string;
  /** Emoji or image URL */
  icon?: string;
  /** Category badge label */
  badge?: string;
  /** Badge colour key */
  badgeColor?: 'cyan' | 'green' | 'orange' | 'red' | 'purple';
}

// ── Children render-prop types ────────────────────────────────────────────────
export interface GameChildProps {
  ageTier: AgeTier;
  /** Call when the game round is over */
  onComplete: (score: number, maxScore: number) => void;
  /** Call to trigger instant lose (e.g. hearts = 0) */
  onFail?: () => void;
}
