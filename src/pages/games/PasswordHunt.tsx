import React from 'react';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import WordSearchGame from '@/components/games/WordSearchGame';

const WORDS: Record<AgeTier, string[]> = {
  junior: ['PASSWORD', 'LOCK', 'KEY', 'SAFE', 'CODE', 'SECRET'],
  hero:   ['PASSWORD', 'ENCRYPT', 'FIREWALL', 'PRIVATE', 'SECURE', 'HACKER', 'VIRUS', 'ANTIVIRUS'],
  elite:  ['AUTHENTICATION', 'ENCRYPTION', 'VULNERABILITY', 'CREDENTIAL', 'MULTIFACTOR', 'BIOMETRIC', 'PASSPHRASE', 'SALTING', 'HASHING', 'ENTROPY'],
};

export default function PasswordHunt() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Password Hunt" category="Word Search" xpReward={100} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => (
        <WordSearchGame ageTier={ageTier} words={WORDS[ageTier]} title="Find the password words!" onComplete={onComplete} />
      )}
    </GameShell>
  );
}
