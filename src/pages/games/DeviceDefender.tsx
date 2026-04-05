import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameShell, { AgeTier } from '@/components/games/GameShell';
import QuizGame from '@/components/games/QuizGame';

const QUESTIONS = {
  junior: [
    { question: 'Should you keep your tablet password-protected?', options: ['No — it takes too long', 'Yes — it keeps it safe!'], correct: 1, explanation: 'A password stops others from accessing your device and your info!' },
    { question: 'You find a USB stick on the ground. You should...', options: ['Plug it in to see what\'s on it!', 'Give it to an adult — never plug in unknown USB drives!'], correct: 1, explanation: 'Unknown USB drives can have viruses that infect your device!' },
    { question: 'Keeping your apps updated helps...', options: ['Use more battery', 'Fix security problems!'], correct: 1, explanation: 'Updates patch security holes that bad guys could use!' },
    { question: 'You should only download apps from...', options: ['Any website that offers them free', 'Official stores like App Store or Google Play'], correct: 1, explanation: 'Official stores check apps for malware before listing them!' },
    { question: 'When you\'re done using a shared device, you should...', options: ['Just close the screen', 'Log out completely!'], correct: 1, explanation: 'Always log out so the next person can\'t access your accounts!' },
  ],
  hero: [
    { question: 'What is the purpose of device encryption?', options: ['Speed up the device', 'Make data unreadable without the correct key', 'Protect against viruses', 'Prevent unauthorized app installs'], correct: 1, explanation: 'Encryption scrambles your data — even if someone steals your device, they can\'t read your files!' },
    { question: 'Why is automatic screen lock important?', options: ['It saves battery', 'It prevents unauthorized access when you step away', 'It prevents overheating', 'It logs out of all apps'], correct: 1, explanation: 'Auto-lock ensures your device is protected even when you forget to lock it manually!' },
    { question: 'What does jailbreaking/rooting a device do to security?', options: ['Improves security by removing restrictions', 'Removes built-in security protections, increasing vulnerability', 'Has no effect on security', 'Enables stronger encryption'], correct: 1, explanation: 'Jailbreaking removes security controls — apps can access parts of the OS they normally cannot!' },
    { question: 'A suspicious app requests access to your contacts and microphone for a simple game. You should...', options: ['Allow it — it probably needs it', 'Deny excessive permissions — they are not needed for a game'], correct: 1, explanation: 'Apps should only request permissions they genuinely need. Excessive permissions = red flag!' },
    { question: 'What is MDM in the context of device security?', options: ['Mobile Data Management', 'Mobile Device Management — IT control over company devices', 'Multi-Device Mode', 'Malware Detection Module'], correct: 1, explanation: 'MDM allows organizations to remotely manage, monitor, and wipe corporate devices.' },
  ],
  elite: [
    { question: 'Secure Boot protects against...', options: ['Malware in running applications', 'Bootkit/rootkit infections by verifying bootloader integrity', 'Network attacks at startup', 'Unauthorized app installations'], correct: 1, explanation: 'Secure Boot ensures only signed, trusted code runs during the boot process, preventing low-level rootkits.' },
    { question: 'What is the purpose of a Trusted Platform Module (TPM)?', options: ['Speeding up encryption', 'Storing cryptographic keys and enabling hardware-based security', 'Managing device permissions', 'Monitoring network traffic'], correct: 1, explanation: 'TPM is a dedicated microchip that stores encryption keys, certificates, and passwords securely in hardware.' },
    { question: 'Container-based security on mobile devices (like Android Work Profile) provides...', options: ['Better battery life', 'Isolation between personal and work data with separate encryption', 'Faster app performance', 'Automatic malware scanning'], correct: 1, explanation: 'Work Profiles create an isolated environment — personal apps cannot access work data and vice versa.' },
    { question: 'What attack does Certificate Pinning help prevent on mobile apps?', options: ['SQL injection', 'Man-in-the-Middle attacks using fraudulent certificates', 'Brute force attacks', 'Session hijacking'], correct: 1, explanation: 'Certificate pinning hardcodes the expected certificate — MITM with a different (even valid) certificate fails.' },
    { question: 'Side-channel attacks on devices exploit...', options: ['Software vulnerabilities', 'Physical characteristics like power consumption and timing', 'Network protocols', 'Operating system calls'], correct: 1, explanation: 'Side-channel attacks (like Spectre/Meltdown) extract secrets from physical implementation characteristics, not code flaws.' },
  ],
};

export default function DeviceDefender() {
  const navigate = useNavigate();
  const ageTier: AgeTier = 'hero';
  return (
    <GameShell title="Device Defender" category="Quiz" xpReward={100} ageTier={ageTier} onClose={() => navigate('/missions')}>
      {({ ageTier, onComplete }) => (
        <QuizGame ageTier={ageTier} questions={QUESTIONS[ageTier]} onComplete={onComplete} characterName="Robo Buddy" characterEmoji="📱" />
      )}
    </GameShell>
  );
}
