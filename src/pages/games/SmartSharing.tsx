import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import QuizGame from '@/components/games/QuizGame';
import { QUIZ_DATA } from '@/data/quizData';

export default function SmartSharing() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Smart Sharing" category="Quiz" xpReward={100} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => (
        <QuizGame ageTier={ageTier} questions={QUIZ_DATA['smart-sharing'][ageTier]} onComplete={onComplete} characterName="Byte" characterEmoji="🤝" />
      )}
    </GameShell>
  );
}
