import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import QuizGame from '@/components/games/QuizGame';
import { QUIZ_DATA } from '@/data/quizData';

export default function SpotTheScam() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Spot the Scam!" category="Quiz" xpReward={100} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => (
        <QuizGame ageTier={ageTier} questions={QUIZ_DATA['spot-the-scam'][ageTier]} onComplete={onComplete} characterName="Detective Whiskers" characterEmoji="🕵️" />
      )}
    </GameShell>
  );
}
