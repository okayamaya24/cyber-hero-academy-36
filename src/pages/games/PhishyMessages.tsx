import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import QuizGame from '@/components/games/QuizGame';

const QUESTIONS = {
  junior: [
    { question: 'A message says "Click here to get a FREE toy!" What do you do?', options: ['Click it!', 'Ignore it — it might be a trick!'], correct: 1, explanation: 'Free prize messages are almost always tricks to steal your info!' },
    { question: 'A friend\'s account sends you a weird link. You should...', options: ['Click it right away!', 'Ask your friend if they really sent it first'], correct: 1, explanation: 'Friends\' accounts can get hacked! Always check before clicking.' },
    { question: 'A message with lots of spelling mistakes asking for your password is probably...', options: ['Real', 'Fake — a phishing message!'], correct: 1, explanation: 'Spelling mistakes are a big red flag in suspicious messages!' },
    { question: 'Phishing messages try to...', options: ['Help you stay safe', 'Trick you into giving away private info'], correct: 1, explanation: 'Phishing = fishing for your personal information!' },
    { question: 'If a message makes you feel scared or rushed, you should...', options: ['Act fast!', 'Slow down and check with an adult'], correct: 1, explanation: 'Scammers make you panic so you act without thinking. Always slow down!' },
  ],
  hero: [
    { question: 'What is spear phishing?', options: ['A random phishing email', 'A targeted phishing attack using personal info about the victim', 'Phishing via phone calls', 'Malware disguised as phishing'], correct: 1, explanation: 'Spear phishing is personalized — attackers research you to make the attack more convincing!' },
    { question: 'Which is a sign of a phishing email?', options: ['Your name in the greeting', 'A generic greeting like "Dear Customer"', 'The company logo', 'A specific order number'], correct: 1, explanation: 'Generic greetings suggest mass phishing — real companies usually use your name!' },
    { question: 'A phishing email contains a link to "paypa1.com". What is wrong?', options: ['Nothing', 'The domain uses "1" instead of "l" — it\'s a fake site', 'The link is too short', 'It doesn\'t use HTTPS'], correct: 1, explanation: 'Character substitution (1 for l, 0 for o) is a classic phishing domain trick!' },
    { question: 'What should you do if you think you clicked a phishing link?', options: ['Nothing — it\'s probably fine', 'Change your passwords and report it immediately'], correct: 1, explanation: 'Act fast! Change passwords and enable 2FA on affected accounts right away.' },
    { question: 'SMS phishing is also called...', options: ['Vishing', 'Smishing', 'Spear phishing', 'Whaling'], correct: 1, explanation: 'Smishing = SMS phishing. Text message scams are increasingly common!' },
  ],
  elite: [
    { question: 'What makes Business Email Compromise (BEC) different from typical phishing?', options: ['It uses malware attachments', 'It impersonates executives to authorize fraudulent transfers without malicious links', 'It targets random users', 'It always involves fake invoices'], correct: 1, explanation: 'BEC relies purely on social engineering — no malware needed. FBI reports billions lost annually.' },
    { question: 'Domain spoofing via homograph attack uses...', options: ['Misspelled domains', 'Visually identical Unicode characters in domain names', 'Expired domains', 'Subdomain takeover'], correct: 1, explanation: 'Unicode allows characters from other alphabets that look identical to Latin letters to the human eye.' },
    { question: 'DMARC helps prevent phishing by...', options: ['Encrypting email content', 'Allowing domain owners to specify how unauthenticated emails should be handled', 'Blocking all external emails', 'Scanning for malicious links'], correct: 1, explanation: 'DMARC (with SPF and DKIM) lets organizations tell email providers to reject or quarantine spoofed emails.' },
    { question: 'A phishing email passes all email authentication checks. This likely means...', options: ['The email is legitimate', 'The attacker used a compromised legitimate account or similar-looking domain', 'Authentication is broken', 'The email has no malicious content'], correct: 1, explanation: 'Attackers increasingly use compromised accounts or lookalike domains that pass authentication checks.' },
    { question: 'Callback phishing (telephone-oriented attack delivery) avoids detection by...', options: ['Using no links', 'Including only a phone number — malware delivered via callback', 'Encrypting the payload', 'Using image-only emails'], correct: 1, explanation: 'TOAD attacks use no URLs or attachments — just a phone number. Victims call and get socially engineered into installing malware.' },
  ],
};

export default function PhishyMessages() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Phishy Messages" category="Quiz" xpReward={100} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => (
        <QuizGame ageTier={ageTier} questions={QUESTIONS[ageTier]} onComplete={onComplete} characterName="Detective Whiskers" characterEmoji="🕵️" />
      )}
    </GameShell>
  );
}
