/**
 * Arcade Foundation — barrel export
 * Import everything a game needs from this single entry point:
 *
 *   import { GameShell, BinaryButtons, ScenarioCard, FeedbackOverlay } from '@/components/arcade';
 */

export { default as GameShell } from './GameShell';
export { default as TopBar } from './TopBar';
export { default as TimerRing } from './TimerRing';
export { default as ScoreDisplay } from './ScoreDisplay';
export { default as ProgressBar } from './ProgressBar';
export { default as FeedbackOverlay } from './FeedbackOverlay';
export { default as WinScreen } from './WinScreen';
export { default as LoseScreen } from './LoseScreen';
export { default as BinaryButtons } from './BinaryButtons';
export { default as ScenarioCard } from './ScenarioCard';

// Types
export type {
  AgeTier,
  GameResult,
  FeedbackVariant,
  FeedbackState,
  GamePhase,
  BinaryOption,
  ScenarioData,
  GameChildProps,
} from './types';

export { AGE_TIER_LABELS } from './types';
