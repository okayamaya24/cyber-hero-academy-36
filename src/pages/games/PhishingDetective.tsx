import React from 'react';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import WordSearchGame from '@/components/games/WordSearchGame';

const WORDS: Record<AgeTier, string[]> = {
  junior: ['PHISH', 'BAIT', 'FAKE', 'TRAP', 'SCAM', 'CLICK'],
  hero:   ['PHISHING', 'MALWARE', 'SPOOFING', 'MALICIOUS', 'DECEPTIVE', 'SUSPICIOUS', 'CREDENTIAL', 'FRAUDULENT'],
  elite:  ['PHISHING', 'SPEARPHISH', 'WHALING', 'SMISHING', 'VISHING', 'PRETEXTING', 'BAITING', 'TAILGATING', 'QUIDPROQUO', 'HONEYPOT'],
};

export default function PhishingDetective() {
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Phishing Detective" category="Word Search" xpReward={100} ageTier={ageTier} onClose={() => window.history.back()}>
      {({ ageTier, onComplete }) => (
        <WordSearchGame ageTier={ageTier} words={WORDS[ageTier]} title="Hunt down phishing terms!" onComplete={onComplete} />
      )}
    </GameShell>
  );
}
