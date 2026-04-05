import React from 'react';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import WordSearchGame from '@/components/games/WordSearchGame';

const WORDS: Record<AgeTier, string[]> = {
  junior: ['PRIVATE', 'SECRET', 'SAFE', 'GUARD', 'HIDE', 'BLOCK'],
  hero:   ['PRIVACY', 'PERSONAL', 'DATA', 'PROTECT', 'IDENTITY', 'SECURITY', 'SETTINGS', 'LOCATION'],
  elite:  ['PRIVACY', 'GDPR', 'METADATA', 'COOKIES', 'TRACKING', 'FINGERPRINT', 'ANONYMITY', 'ENCRYPTION', 'CONSENT', 'DISCLOSURE'],
};

export default function PrivacyPatrol() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Privacy Patrol" category="Word Search" xpReward={100} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => (
        <WordSearchGame ageTier={ageTier} words={WORDS[ageTier]} title="Patrol for privacy words!" onComplete={onComplete} />
      )}
    </GameShell>
  );
}
