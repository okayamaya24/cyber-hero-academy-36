import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import QuizGame from '@/components/games/QuizGame';

const QUESTIONS = {
  junior: [
    { question: 'Which of these is private information?', options: ['Your favorite color', 'Your home address'], correct: 1, explanation: 'Your home address is private — never share it online!' },
    { question: 'Should you tell a stranger your full name online?', options: ['Yes!', 'No — keep it private!'], correct: 1, explanation: 'Your full name is personal info — keep it safe!' },
    { question: 'Your phone number is...', options: ['Safe to post everywhere', 'Private — only share with trusted people'], correct: 1, explanation: 'Your phone number is private information!' },
    { question: 'If someone asks for your school name online, you should...', options: ['Tell them!', 'Say no and tell an adult'], correct: 1, explanation: 'Your school name helps strangers find you in real life!' },
    { question: 'Private info is info that...', options: ['Anyone can know', 'Only trusted people should know'], correct: 1, explanation: 'Private means personal — guard it carefully!' },
  ],
  hero: [
    { question: 'What is PII?', options: ['A type of password', 'Personally Identifiable Information that can identify you', 'A privacy browser', 'A security certificate'], correct: 1, explanation: 'PII includes name, address, SSN, email — info that identifies a specific person.' },
    { question: 'Which is an example of sensitive PII?', options: ['Your city', 'Your Social Security number', 'Your favorite sport', 'Your age range'], correct: 1, explanation: 'SSNs are highly sensitive PII that can be used for identity theft!' },
    { question: 'You should use a unique username that...', options: ['Includes your real name for trust', 'Does not reveal your real identity', 'Matches your email address', 'Is easy to remember like your birthday'], correct: 1, explanation: 'Usernames should protect your real identity online!' },
    { question: 'What does a privacy policy tell you?', options: ['How to stay safe online', 'How a company collects and uses your data', 'Which websites are safe', 'How to delete your account'], correct: 1, explanation: 'Always read privacy policies to know how your data is used!' },
    { question: 'Geotagging in photos can reveal your...', options: ['Password', 'Exact location', 'Phone number', 'Email address'], correct: 1, explanation: 'Photo metadata can contain GPS coordinates showing exactly where you were!' },
  ],
  elite: [
    { question: 'What does data minimization mean in privacy law?', options: ['Deleting data after use', 'Only collecting data necessary for the stated purpose', 'Minimizing who has data access', 'Encrypting all collected data'], correct: 1, explanation: 'GDPR and CCPA require organizations to collect only what they genuinely need.' },
    { question: 'Which regulation protects children\'s online privacy in the US?', options: ['GDPR', 'COPPA', 'HIPAA', 'PCI-DSS'], correct: 1, explanation: "COPPA (Children's Online Privacy Protection Act) requires parental consent for collecting data from under-13s." },
    { question: 'Pseudonymization differs from anonymization because...', options: ['It is stronger', 'It replaces identifiers but data can still be re-identified with additional info', 'It deletes the data', 'It is less secure'], correct: 1, explanation: 'Pseudonymized data is not fully anonymous — the original identity can potentially be restored.' },
    { question: 'The right to data portability allows users to...', options: ['Delete their data', 'Receive their data in a machine-readable format to transfer to another service', 'Correct inaccurate data', 'Opt out of data collection'], correct: 1, explanation: 'GDPR Article 20 gives users the right to receive and transfer their personal data between services.' },
    { question: 'A data breach notification requirement means...', options: ['Companies must prevent all breaches', 'Organizations must notify affected individuals within a specified timeframe', 'Users must report their own breaches', 'IT teams must log all access'], correct: 1, explanation: 'GDPR requires breach notification within 72 hours; many US states have similar laws.' },
  ],
};

export default function SecretKeeper() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Secret Keeper" category="Quiz" xpReward={100} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => (
        <QuizGame ageTier={ageTier} questions={QUESTIONS[ageTier]} onComplete={onComplete} characterName="Professor Hoot" characterEmoji="🦉" />
      )}
    </GameShell>
  );
}
