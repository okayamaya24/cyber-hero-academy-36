import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import QuizGame from '@/components/games/QuizGame';

const QUESTIONS = {
  junior: [
    { question: 'Before believing something online, you should...', options: ['Share it right away!', 'Check if it\'s true first!'], correct: 1, explanation: 'Not everything online is true — always check before sharing!' },
    { question: 'A good way to check if something is true is to...', options: ['Believe whoever said it first', 'Look it up on more than one trusted website'], correct: 1, explanation: 'Check multiple trusted sources before believing something!' },
    { question: 'Fake news is...', options: ['News you don\'t like', 'False stories that look real online'], correct: 1, explanation: 'Fake news is made-up stories designed to trick or confuse people!' },
    { question: 'Who should you trust for real news?', options: ['Random people on social media', 'Known news organizations and official sources'], correct: 1, explanation: 'Trusted news sources have journalists who check their facts!' },
    { question: 'A photo online can be...', options: ['Always real', 'Edited or taken out of context to be misleading'], correct: 1, explanation: 'Photos can be changed or used in the wrong context — always investigate!' },
  ],
  hero: [
    { question: 'What is misinformation vs. disinformation?', options: ['They are the same thing', 'Misinformation is false but unintentional; disinformation is deliberately false', 'Disinformation is less harmful', 'Misinformation only spreads offline'], correct: 1, explanation: 'Intent matters: misinformation = accidentally false; disinformation = deliberately deceiving.' },
    { question: 'What is a "deepfake"?', options: ['A very convincing lie', 'AI-generated synthetic media that replaces someone\'s likeness realistically', 'A hacked photo', 'A type of phishing'], correct: 1, explanation: 'Deepfakes use AI to create convincing fake videos/audio of real people — increasingly used in disinformation.' },
    { question: 'Lateral reading to verify information means...', options: ['Reading more of the same article', 'Leaving the site to check what others say about the source', 'Scrolling to the bottom for citations', 'Reading left-to-right carefully'], correct: 1, explanation: 'Fact-checkers use lateral reading — checking the source\'s credibility from outside before trusting the content.' },
    { question: 'What does it mean if a website has no author attribution?', options: ['The article is automatically unreliable', 'It\'s a red flag worth investigating further', 'Anonymous sources are always honest', 'The organization is the author'], correct: 1, explanation: 'No byline is a flag — check if the site has an About page and who runs it before trusting.' },
    { question: 'Confirmation bias affects online research by...', options: ['Making you read faster', 'Leading you to favor information that confirms existing beliefs', 'Improving accuracy', 'Helping you find primary sources'], correct: 1, explanation: 'We naturally seek out info that confirms what we already believe — actively seek out opposing viewpoints!' },
  ],
  elite: [
    { question: 'What is astroturfing in the context of online manipulation?', options: ['Fake environmental campaigns', 'Creating the illusion of grassroots support using coordinated fake accounts', 'Flooding search results with false info', 'Impersonating journalists'], correct: 1, explanation: 'Astroturfing manufactures fake public opinion — it looks organic but is coordinated and inauthentic.' },
    { question: 'Information laundering describes...', options: ['Cleaning up old misinformation', 'Moving false information through legitimate-seeming sources to obscure its origin', 'Deleting disinformation', 'Watermarking authentic content'], correct: 1, explanation: 'Disinfo starts on fringe sites, gets cited by partisan blogs, then picked up by mainstream outlets — laundering its origin.' },
    { question: 'The liar\'s dividend refers to...', options: ['Profiting from fake news', 'Using deepfake existence as an excuse to deny authentic evidence', 'Paying influencers to spread misinformation', 'Fake whistleblowers'], correct: 1, explanation: 'Even if deepfakes aren\'t used, their existence lets people claim real evidence is fake — benefiting bad actors.' },
    { question: 'Computational propaganda uses...', options: ['Advanced hacking techniques', 'Bots, algorithms, and automation to amplify political messaging at scale', 'Deepfakes only', 'Human-only social media campaigns'], correct: 1, explanation: 'Computational propaganda weaponizes social media algorithms — bots amplify content to create artificial trending.' },
    { question: 'What is a coordinated inauthentic behavior (CIB) campaign?', options: ['Organized political advertising', 'Networks of fake accounts working together to manipulate public discourse', 'Government censorship', 'Legitimate influencer marketing'], correct: 1, explanation: 'CIB is when actors hide their true identity/coordination to push narratives — platforms remove these networks regularly.' },
  ],
};

export default function InternetDetective() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Internet Detective" category="Quiz" xpReward={100} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => (
        <QuizGame ageTier={ageTier} questions={QUESTIONS[ageTier]} onComplete={onComplete} characterName="Professor Hoot" characterEmoji="🔎" />
      )}
    </GameShell>
  );
}
