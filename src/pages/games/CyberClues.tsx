import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import QuizGame from '@/components/games/QuizGame';

const QUESTIONS = {
  junior: [
    { question: 'What do cyber heroes do?', options: ['Break into computers', 'Protect people online and keep data safe!'], correct: 1, explanation: 'Cyber heroes use their skills to protect — not to harm!' },
    { question: 'A hacker who helps companies find security holes is called a...', options: ['Criminal hacker', 'White hat hacker — an ethical hacker!'], correct: 1, explanation: 'Ethical hackers (white hats) test security with permission to help fix it!' },
    { question: 'The internet is...', options: ['A place with no rules', 'A global network connecting billions of devices'], correct: 1, explanation: 'The internet connects devices worldwide — and has rules to keep it safe!' },
    { question: 'Cybersecurity protects...', options: ['Only computers', 'Computers, phones, data, and people online!'], correct: 1, explanation: 'Cybersecurity keeps all our digital devices and information safe!' },
    { question: 'Being a good digital citizen means...', options: ['Doing whatever you want online', 'Being kind, safe, and responsible online'], correct: 1, explanation: 'The same rules that apply in real life apply online too!' },
  ],
  hero: [
    { question: 'What is the CIA triad in cybersecurity?', options: ['Central Intelligence Agency', 'Confidentiality, Integrity, Availability', 'Cyber Intrusion Assessment', 'Certificate, Identity, Authentication'], correct: 1, explanation: 'The CIA triad is the foundation of cybersecurity: keep data secret, accurate, and accessible!' },
    { question: 'What is a zero-trust security model?', options: ['No security policies', 'Never trust, always verify — even inside the network', 'Only trust verified users once', 'Blocking all external access'], correct: 1, explanation: 'Zero-trust assumes no user or device is trusted by default — verification required for every access.' },
    { question: 'What is the difference between authentication and authorization?', options: ['They are the same thing', 'Authentication verifies identity; authorization determines what access is granted', 'Authorization comes first', 'Authentication is optional'], correct: 1, explanation: 'Auth-N = who are you? Auth-Z = what can you do? Both are needed for secure access control!' },
    { question: 'What is a honeypot in cybersecurity?', options: ['Malware that steals data', 'A decoy system designed to attract and detect attackers', 'A type of encryption', 'A network monitoring tool'], correct: 1, explanation: 'Honeypots lure attackers into fake systems, letting defenders study attack methods safely!' },
    { question: 'Defense in depth means...', options: ['A very strong single security layer', 'Multiple overlapping security layers so one failure doesn\'t compromise everything', 'Deep encryption of all data', 'Defending only critical systems'], correct: 1, explanation: 'Multiple layers (firewall + antivirus + MFA + monitoring) ensure no single point of failure!' },
  ],
  elite: [
    { question: 'What is the kill chain in cybersecurity?', options: ['A method of encryption', 'A framework describing stages of a cyberattack from reconnaissance to action', 'A type of DoS attack', 'A network topology'], correct: 1, explanation: 'The Lockheed Martin Cyber Kill Chain: Recon → Weaponize → Deliver → Exploit → Install → C2 → Action.' },
    { question: 'MITRE ATT&CK is...', options: ['An antivirus product', 'A knowledge base of adversary tactics, techniques, and procedures', 'A firewall standard', 'A vulnerability scanner'], correct: 1, explanation: 'ATT&CK (Adversarial Tactics, Techniques & Common Knowledge) documents real-world attack patterns used by defenders.' },
    { question: 'What is threat intelligence?', options: ['Guessing what attackers might do', 'Evidence-based knowledge about existing or emerging threats used to inform decisions', 'Monitoring network traffic', 'Running vulnerability scans'], correct: 1, explanation: 'Threat intel provides context about adversaries, their capabilities, and indicators of compromise.' },
    { question: 'Red team vs blue team exercises differ from penetration testing because...', options: ['They use different tools', 'They are continuous adversarial simulations testing both offense and defense simultaneously', 'Red teams use social engineering', 'Blue teams do the attacking'], correct: 1, explanation: 'Red/blue exercises simulate real ongoing attacks — red attacks, blue defends, purple teams share knowledge.' },
    { question: 'What is OSINT and why is it valuable to both attackers and defenders?', options: ['A security certification', 'Open Source Intelligence — gathering info from public sources for reconnaissance or defense', 'A network scanning protocol', 'A type of social engineering'], correct: 1, explanation: 'Attackers use OSINT to profile targets; defenders use it to understand their own exposure and threat actors.' },
  ],
};

export default function CyberClues() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Cyber Clues" category="Quiz" xpReward={100} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => (
        <QuizGame ageTier={ageTier} questions={QUESTIONS[ageTier]} onComplete={onComplete} characterName="Professor Hoot" characterEmoji="🔍" />
      )}
    </GameShell>
  );
}
