/**
 * Safe or Not? — Arcade Foundation Preview Game
 *
 * A quick 8-scenario judgment game that previews the shared arcade components:
 *   GameShell · ScenarioCard · BinaryButtons · FeedbackOverlay · ProgressBar
 *
 * Route: /games/safe-or-not
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  GameShell,
  ScenarioCard,
  BinaryButtons,
  FeedbackOverlay,
  ProgressBar,
} from '@/components/arcade';
import type { FeedbackState, GameChildProps, ScenarioData } from '@/components/arcade';

// ── Scenario data ─────────────────────────────────────────────────────────────

interface Scenario extends ScenarioData {
  isSafe: boolean;
  correctMessage: string;
  wrongMessage: string;
  tip: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    icon: '📧',
    badge: 'Email',
    badgeColor: 'orange',
    content: 'You get an email saying "YOU WON a FREE iPad! Click HERE to claim it NOW!"',
    subtext: 'From: freeprizez@win-claim.biz',
    isSafe: false,
    correctMessage: 'Smart move, Guardian!',
    wrongMessage: "That's a scam!",
    tip: '🎁 Real prizes never arrive in random emails — and real companies don\'t use .biz addresses like that.',
  },
  {
    id: 's2',
    icon: '🔐',
    badge: 'Password',
    badgeColor: 'green',
    content: 'You create a password: T!ger$un7Bolt#',
    subtext: 'Mix of uppercase, symbols, numbers — 13 characters long',
    isSafe: true,
    correctMessage: 'Strong password!',
    wrongMessage: 'Actually that\'s super secure!',
    tip: '💪 Long passwords with mixed characters are very hard to crack. Great choice!',
  },
  {
    id: 's3',
    icon: '👤',
    badge: 'Online Chat',
    badgeColor: 'red',
    content: 'A stranger in a game chat asks: "What school do you go to?"',
    subtext: 'You\'ve never spoken to this person before',
    isSafe: false,
    correctMessage: 'Good instinct!',
    wrongMessage: 'Be careful!',
    tip: '🏫 Never share your school, address, or any personal info with strangers online.',
  },
  {
    id: 's4',
    icon: '🔒',
    badge: 'Website',
    badgeColor: 'cyan',
    content: 'You visit a site that starts with https://',
    subtext: 'There\'s a padlock icon next to the address',
    isSafe: true,
    correctMessage: 'Correct!',
    wrongMessage: 'HTTPS is actually safer!',
    tip: '🔒 HTTPS means the connection is encrypted. Always check for the padlock before entering any info.',
  },
  {
    id: 's5',
    icon: '📲',
    badge: 'App Download',
    badgeColor: 'orange',
    content: 'A pop-up says: "Download SuperGame FREE from our website — bypass the app store!"',
    subtext: 'Not from the official Apple or Google Play store',
    isSafe: false,
    correctMessage: 'Nice catch!',
    wrongMessage: 'That\'s risky!',
    tip: '📱 Only download apps from official stores — they check apps for malware. Random websites don\'t.',
  },
  {
    id: 's6',
    icon: '🔑',
    badge: 'Account Security',
    badgeColor: 'green',
    content: 'You turn on two-factor authentication (2FA) for your account',
    subtext: 'Now you need your password AND a code sent to your phone',
    isSafe: true,
    correctMessage: 'Smart defender!',
    wrongMessage: '2FA is actually great security!',
    tip: '🛡️ Two-factor authentication stops hackers even if they steal your password.',
  },
  {
    id: 's7',
    icon: '📡',
    badge: 'WiFi',
    badgeColor: 'orange',
    content: 'You log in to your bank account on free public WiFi at the mall',
    subtext: 'The network is open — no password required',
    isSafe: false,
    correctMessage: 'Good thinking!',
    wrongMessage: 'Public WiFi is risky!',
    tip: '☕ Public WiFi can let attackers snoop on your traffic. Save banking for home or use a VPN.',
  },
  {
    id: 's8',
    icon: '⬆️',
    badge: 'Software',
    badgeColor: 'green',
    content: 'Your phone shows "Software update available." You install it right away.',
    subtext: 'The update is from your phone\'s official manufacturer',
    isSafe: true,
    correctMessage: 'Exactly right!',
    wrongMessage: 'Updates are actually important!',
    tip: '🔧 Updates patch security holes. Hackers exploit outdated software — staying current keeps you safe.',
  },
];

// ── Inner game (receives render-prop from GameShell) ──────────────────────────

function SafeOrNotGame({ onComplete, onFail: _onFail }: GameChildProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>({
    visible: false,
    variant: 'neutral',
  });

  const current = SCENARIOS[index];
  const total = SCENARIOS.length;

  const handleChoice = useCallback(
    (choice: 'a' | 'b') => {
      if (feedback.visible) return;

      // 'a' = Safe, 'b' = Not Safe
      const playerSaysItsSafe = choice === 'a';
      const isCorrect = playerSaysItsSafe === current.isSafe;

      setFeedback({
        visible: true,
        variant: isCorrect ? 'correct' : 'wrong',
        message: isCorrect ? current.correctMessage : current.wrongMessage,
        tip: current.tip,
      });

      if (isCorrect) setScore((s) => s + 1);
    },
    [feedback.visible, current],
  );

  const handleFeedbackDone = useCallback(() => {
    setFeedback({ visible: false, variant: 'neutral' });

    const next = index + 1;
    if (next >= total) {
      // Small delay so the overlay clears before the win screen appears
      setTimeout(() => onComplete(score + (feedback.variant === 'correct' ? 1 : 0), total), 50);
    } else {
      setIndex(next);
    }
  }, [index, total, score, feedback.variant, onComplete]);

  return (
    <div className="flex flex-col h-full min-h-0 px-5 py-5 gap-5">
      {/* Progress */}
      <ProgressBar current={index + 1} total={total} color="cyan" />

      {/* Scenario card */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <ScenarioCard
            key={current.id}
            id={current.id}
            icon={current.icon}
            badge={current.badge}
            badgeColor={current.badgeColor}
            content={current.content}
            subtext={current.subtext}
            textSize="md"
          />
        </AnimatePresence>
      </div>

      {/* Binary buttons */}
      <BinaryButtons
        optionA={{ label: 'Safe ✅', icon: '🛡️', color: 'green' }}
        optionB={{ label: 'Not Safe ⚠️', icon: '🚨', color: 'red' }}
        onSelect={handleChoice}
        disabled={feedback.visible}
        layout="row"
        size="md"
      />

      {/* Feedback overlay */}
      <FeedbackOverlay
        state={feedback}
        onDone={handleFeedbackDone}
        duration={1800}
      />
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function SafeOrNot() {
  const navigate = useNavigate();

  return (
    <GameShell
      title="Safe or Not?"
      category="Cyber Awareness"
      xpReward={80}
      ageTier="hero"
      onClose={() => navigate(-1)}
      exitLabel="Back to Training"
      winMessage="You've got great instincts, Guardian! 🛡️"
      loseTip="Think about who is asking and what they want — that usually reveals the trap!"
    >
      {(props) => <SafeOrNotGame {...props} />}
    </GameShell>
  );
}
