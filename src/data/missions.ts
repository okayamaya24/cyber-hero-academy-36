import { AlertTriangle, Lock, Eye, Shield } from "lucide-react";
import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";
import robotGuide from "@/assets/robot-guide.png";
import heroCharacter from "@/assets/hero-character.png";

export type AgeTier = "junior" | "defender" | "guardian";
export type LearningMode = "quick" | "standard" | "deep" | "auto";
export type MiniGameType =
  | "quiz"
  | "email-detective"
  | "word-search"
  | "password-builder"
  | "password-fixer"
  | "strength-tester"
  | "scenario"
  | "drag-sort"
  | "spot-the-difference"
  | "sort-game"
  | "memory"
  | "boss-battle"
  | "secret-keeper";

export const MINI_GAME_META: Record<MiniGameType, { label: string; emoji: string; color: string }> = {
  "quiz": { label: "Quiz", emoji: "❓", color: "text-primary" },
  "email-detective": { label: "Email Detective", emoji: "🔍", color: "text-accent" },
  "word-search": { label: "Word Search", emoji: "🔤", color: "text-secondary" },
  "password-builder": { label: "Password Builder", emoji: "🔧", color: "text-primary" },
  "password-fixer": { label: "Password Fixer", emoji: "🛠️", color: "text-accent" },
  "strength-tester": { label: "Strength Tester", emoji: "💪", color: "text-secondary" },
  "scenario": { label: "Scenario", emoji: "🎭", color: "text-primary" },
  "drag-sort": { label: "Drag & Sort", emoji: "🧩", color: "text-primary" },
  "spot-the-difference": { label: "Spot the Difference", emoji: "👁️", color: "text-accent" },
  "sort-game": { label: "Safe vs Dangerous", emoji: "⚖️", color: "text-accent" },
  "memory": { label: "Memory Match", emoji: "🧠", color: "text-secondary" },
  "boss-battle": { label: "Boss Battle", emoji: "⚔️", color: "text-destructive" },
  "secret-keeper": { label: "Secret Keeper", emoji: "🤫", color: "text-primary" },
};

export interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  miniGameType: MiniGameType;
  sender?: string;
  subject?: string;
  body?: string;
  fakeLink?: string;
  senderIcon?: string;
}

export interface GuideCharacter {
  name: string;
  image: string;
  role?: string;
}

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  guide: GuideCharacter;
  /** Mini-game types featured in each level (Training, Challenge, Mastery) */
  levelMiniGames: [MiniGameType[], MiniGameType[], MiniGameType[]];
  questionsByTier: Record<AgeTier, Question[]>;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
}

export const CAPTAIN_CYBER: GuideCharacter = {
  name: "Captain Cyber",
  image: heroCharacter,
  role: "Adventure Guide",
};

export const LEVEL_NAMES = ["Training", "Challenge", "Mastery"] as const;
export const LEVEL_EMOJIS = ["🎯", "⚔️", "👑"] as const;

export const LEARNING_MODE_CONFIG: Record<LearningMode, {
  label: string;
  gamesPerLevel: number;
  totalGames: number;
  description: string;
  emoji: string;
}> = {
  quick: { label: "Quick Play", gamesPerLevel: 1, totalGames: 3, description: "3 games · ~5 min", emoji: "⚡" },
  standard: { label: "Standard", gamesPerLevel: 2, totalGames: 6, description: "6 games · ~10 min", emoji: "📚" },
  deep: { label: "Deep Practice", gamesPerLevel: 3, totalGames: 9, description: "9+ games · ~15 min", emoji: "🧠" },
  auto: { label: "Auto-Generate More", gamesPerLevel: 3, totalGames: 10, description: "Unlimited practice", emoji: "♾️" },
};

export function getAgeTier(age: number): AgeTier {
  if (age <= 7) return "junior";
  if (age <= 10) return "defender";
  return "guardian";
}

export function getTierLabel(tier: AgeTier): string {
  switch (tier) {
    case "junior": return "Junior Heroes";
    case "defender": return "Cyber Defenders";
    case "guardian": return "Cyber Guardians";
  }
}

export function getTierEmoji(tier: AgeTier): string {
  switch (tier) {
    case "junior": return "🌟";
    case "defender": return "🛡️";
    case "guardian": return "⚔️";
  }
}

export function getPointsPerCorrect(tier: AgeTier): number {
  switch (tier) {
    case "junior": return 10;
    case "defender": return 15;
    case "guardian": return 20;
  }
}

export function getMissionQuestions(mission: MissionDef, age: number): Question[] {
  return mission.questionsByTier[getAgeTier(age)];
}

export function getTotalGames(mode: LearningMode): number {
  return LEARNING_MODE_CONFIG[mode].totalGames;
}

export interface MissionLevel {
  name: string;
  emoji: string;
  level: number;
  questions: Question[];
  locked: boolean;
  miniGameTypes: MiniGameType[];
}

export function getMissionLevels(
  mission: MissionDef,
  age: number,
  mode: LearningMode,
  completedGames: number
): MissionLevel[] {
  const allQuestions = getMissionQuestions(mission, age);
  const config = LEARNING_MODE_CONFIG[mode];
  const gamesPerLevel = config.gamesPerLevel;

  return LEVEL_NAMES.map((name, i) => {
    const questions: Question[] = [];
    for (let j = 0; j < gamesPerLevel; j++) {
      const qIdx = (i * gamesPerLevel + j) % allQuestions.length;
      questions.push(allQuestions[qIdx]);
    }
    const levelStart = i * gamesPerLevel;
    const locked = i > 0 && completedGames < levelStart;
    return {
      name,
      emoji: LEVEL_EMOJIS[i],
      level: i + 1,
      questions,
      locked,
      miniGameTypes: mission.levelMiniGames[i] || [],
    };
  });
}

export function getMissionGames(mission: MissionDef, age: number, mode: LearningMode): Question[] {
  const allQuestions = getMissionQuestions(mission, age);
  const config = LEARNING_MODE_CONFIG[mode];
  const total = config.totalGames;
  const games: Question[] = [];
  for (let i = 0; i < total; i++) {
    games.push(allQuestions[i % allQuestions.length]);
  }
  return games;
}

// ─── MISSIONS ──────────────────────────────────────────────────

export const MISSIONS: MissionDef[] = [
  {
    id: "scam-detection",
    title: "Spot the Scam!",
    description: "Learn to tell real messages from fake ones. Detective Whiskers will help!",
    icon: AlertTriangle,
    color: "text-accent",
    bgColor: "bg-accent/10",
    guide: { name: "Detective Whiskers", image: detectiveCat },
    levelMiniGames: [
      ["quiz", "sort-game"],
      ["email-detective", "word-search", "memory"],
      ["sort-game", "boss-battle"],
    ],
    badgeId: "scam-spotter",
    badgeName: "Scam Spotter",
    badgeIcon: "🔍",
    questionsByTier: {
      junior: [
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "🎁 Mystery Prize Bot",
          senderIcon: "🎁",
          subject: "You won a FREE toy!",
          body: "Click the big button to get your toy NOW!!! 🧸🎉",
          fakeLink: "👉 CLICK HERE FOR TOY",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Nobody gives free toys to strangers online. If it sounds too good, tell a grown-up!",
        },
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "Mom 💕",
          senderIcon: "👩",
          subject: "Dinner time!",
          body: "Hey sweetie, dinner is ready! Come to the kitchen. Love you! 🍕",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "That's safe! Messages from your family that you recognize are totally okay. 💕",
        },
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "⚠️ VIRUS ALERT",
          senderIcon: "⚠️",
          subject: "YOUR TABLET HAS A VIRUS!!!",
          body: "Call this number RIGHT NOW or your tablet will BREAK! 😱📞",
          fakeLink: "📞 CALL 1-800-FAKE",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Real virus warnings don't yell at you or ask you to call a number. Close it and tell an adult!",
        },
        {
          question: "Which of these words are scam warning signs? Pick the scam word!",
          miniGameType: "word-search",
          options: ["Homework", "FREE!!!", "Library"],
          correct: 1,
          explanation: "Words like FREE!!! with lots of exclamation marks are often used in scams to trick you!",
        },
        {
          question: "Is this message safe or a scam?",
          miniGameType: "quiz",
          sender: "Ms. Johnson 📚",
          senderIcon: "👩‍🏫",
          subject: "Homework reminder",
          body: "Don't forget to read chapter 3 for tomorrow! Have a great evening!",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "That's safe! Your teacher is just reminding you about homework on the school app. 📚",
        },
        {
          question: "Which word is a scam red flag?",
          miniGameType: "word-search",
          options: ["Please", "URGENT!!!", "Thanks"],
          correct: 1,
          explanation: "The word URGENT!!! with exclamation marks is a common scam trick to pressure you!",
        },
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "Cool_Stranger_99",
          senderIcon: "🕵️",
          subject: "I can make you FAMOUS!",
          body: "Hey kid! Send me your photo and I'll put you on TV! You'll be a STAR! ⭐📸",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "That's a scam! Never send photos to strangers online. Real TV people don't ask random kids for photos!",
        },
        {
          question: "Spot the difference: Which email address looks fake?",
          miniGameType: "spot-the-difference",
          options: ["mom@family.com", "m0m@fam1ly.com", "dad@family.com"],
          correct: 1,
          explanation: "m0m@fam1ly.com uses numbers instead of letters — that's a trick scammers use! Always look carefully at email addresses.",
        },
        {
          question: "A pop-up says 'You are the 1,000,000th visitor! Click to claim your prize!' What should you do?",
          miniGameType: "quiz",
          options: ["Click it!", "Close it and tell an adult"],
          correct: 1,
          explanation: "These pop-ups are always scams! Close them and tell a grown-up.",
        },
      ],
      defender: [
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "security@r0blox-alerts.com",
          senderIcon: "🎮",
          subject: "URGENT: Your Roblox account will be DELETED",
          body: "Dear user, we detected suspicious activity on your account. Your account will be permanently deleted in 24 hours unless you verify your identity. Click the link below and enter your password immediately.",
          fakeLink: "🔗 r0blox-verify.com/save-account",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Phishing scam! Notice the email uses 'r0blox' (with a zero) not 'Roblox.' Real companies never ask for your password in an email.",
        },
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "school@myschool.edu",
          senderIcon: "🏫",
          subject: "Field Trip to Science Museum — Next Friday",
          body: "Dear parents, this is a reminder that the field trip is next Friday. Please return the signed permission slip by Wednesday.",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "This looks safe! The email matches what your teacher mentioned, comes from the official school address.",
        },
        {
          question: "Find the scam word! Which of these is a red flag in an email?",
          miniGameType: "word-search",
          options: ["Sincerely", "ACT NOW OR ELSE", "Best regards"],
          correct: 1,
          explanation: "'ACT NOW OR ELSE' is a pressure tactic used by scammers to make you panic and click without thinking!",
        },
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "+1-555-WINNER",
          senderIcon: "📱",
          subject: "🎉 CONGRATULATIONS!!! 🎉",
          body: "You've been randomly selected to win a FREE iPhone 15!! Click the link within 10 minutes or you'll lose your prize!",
          fakeLink: "🔗 bit.ly/fr33-ph0ne-now",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Classic scam! Suspicious shortened link with numbers replacing letters, urgency pressure, nobody gives away phones.",
        },
        {
          question: "Spot the fake URL! Which link is suspicious?",
          miniGameType: "spot-the-difference",
          options: ["roblox.com/games", "r0blox-free.com/games", "roblox.com/catalog"],
          correct: 1,
          explanation: "r0blox-free.com uses a zero instead of 'o' and adds '-free' — classic URL spoofing technique!",
        },
        {
          question: "A YouTube ad says 'Download this mod for unlimited V-Bucks!' What do you do?",
          miniGameType: "quiz",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "V-Bucks can only be bought through the official Fortnite store. 'Unlimited V-Bucks' mods are always scams or malware.",
        },
        {
          question: "Which email greeting is a scam warning sign?",
          miniGameType: "word-search",
          options: ["Hi Sarah,", "Dear Valued Customer,", "Hey team,"],
          correct: 1,
          explanation: "'Dear Valued Customer' is generic — real companies usually use your name. Scammers send mass emails without knowing who you are!",
        },
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "YouTube Ads",
          senderIcon: "▶️",
          subject: "New update for Dragon Quest!",
          body: "Dragon Quest Heroes has a new expansion! Download it from the official App Store today.",
          fakeLink: "🔗 apps.apple.com/dragon-quest",
          options: ["Safe", "Scam"],
          correct: 0,
          explanation: "This is likely safe! The link goes to the official App Store.",
        },
        {
          question: "Is this message safe or a scam?",
          miniGameType: "email-detective",
          sender: "xX_MinecraftAdmin_Xx",
          senderIcon: "💬",
          subject: "FREE DIAMONDS — Discord DM",
          body: "Hey! I'm an official Minecraft admin. Give me your login details and I'll add 10,000 diamonds!",
          options: ["Safe", "Scam"],
          correct: 1,
          explanation: "Scam! No real game admin asks for your password through DMs.",
        },
      ],
      guardian: [
        {
          question: "What do you think about this email?",
          miniGameType: "email-detective",
          sender: "noreply@amaz0n-security.com",
          senderIcon: "📧",
          subject: "URGENT: Suspicious Activity Detected on Your Account",
          body: "We have detected an unauthorized purchase of $847.99. Verify your payment information within 2 hours to prevent suspension.",
          fakeLink: "🔗 amaz0n-security.com/verify-payment",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "Phishing! 'amaz0n' uses a zero. Urgency pressure ('2 hours') is manipulation. Real Amazon emails come from @amazon.com.",
        },
        {
          question: "Spot the suspicious domain!",
          miniGameType: "spot-the-difference",
          options: ["amazon.com/orders", "amaz0n-deals.net/orders", "amazon.com/help"],
          correct: 1,
          explanation: "amaz0n-deals.net uses a zero and a different domain extension — typosquatting to steal your info!",
        },
        {
          question: "What do you think about this notification?",
          miniGameType: "quiz",
          sender: "Google Classroom",
          senderIcon: "📖",
          subject: "New Assignment: Chapter 5 Reading Response",
          body: "Mrs. Chen posted a new assignment in English Language Arts. Due: Friday at 3pm.",
          fakeLink: "🔗 docs.google.com/document/d/...",
          options: ["Safe", "Scam", "Unsure"],
          correct: 0,
          explanation: "Safe. Google Classroom, known teacher, Google Doc link — all consistent and expected.",
        },
        {
          question: "Which phrase is a social engineering red flag?",
          miniGameType: "word-search",
          options: ["Please review at your convenience", "Your account will be TERMINATED in 24 HOURS", "See the attached report"],
          correct: 1,
          explanation: "Urgency + threats = manipulation. Legitimate organizations don't threaten account termination with ALL CAPS deadlines.",
        },
        {
          question: "What do you think about this ad?",
          miniGameType: "email-detective",
          sender: "CyberKids Academy Pro",
          senderIcon: "📢",
          subject: "🎓 FREE Cybersecurity Course for Kids!",
          body: "Enroll your child — completely FREE! We just need your parent's credit card for age verification. You will NOT be charged.",
          fakeLink: "🔗 cyberkids-pro.net/enroll-free",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "If it's free, why need a credit card? 'Age verification' via credit card is a trick for hidden fees.",
        },
        {
          question: "What do you think about this website?",
          miniGameType: "spot-the-difference",
          sender: "gooogle.com",
          senderIcon: "🌐",
          subject: "Sign in to your Google Account",
          body: "Your session has expired. Please enter your email and password to continue.",
          fakeLink: "🔗 gooogle.com/accounts/signin",
          options: ["Safe", "Scam", "Unsure"],
          correct: 1,
          explanation: "Typosquatting — 'gooogle.com' has three o's. Real Google is google.com. Always check the URL!",
        },
        {
          question: "What do you think about this link from a friend?",
          miniGameType: "quiz",
          sender: "Alex (your friend)",
          senderIcon: "👋",
          subject: "Check out this cool science article!",
          body: "Hey! Look at this amazing discovery about a new deep-sea fish. It's from BBC News.",
          fakeLink: "🔗 https://www.bbc.com/news/science-environment/deep-sea-fish",
          options: ["Safe", "Scam", "Unsure"],
          correct: 0,
          explanation: "Appears safe. BBC.com is well-known, HTTPS, shared by a friend. Still verify surprising claims independently!",
        },
        {
          question: "Identify the phishing indicator!",
          miniGameType: "word-search",
          options: ["Order #12345", "Click HERE or your data will be SOLD", "Shipping update"],
          correct: 1,
          explanation: "Threatening language about data being sold is a fear-based manipulation tactic used in phishing emails.",
        },
        {
          question: "A website certificate warning says 'Your connection is not private.' The content looks fine.",
          miniGameType: "scenario",
          options: ["Proceed anyway", "Leave the site", "Unsure"],
          correct: 1,
          explanation: "Never ignore certificate warnings! Your data could be intercepted even if content looks fine.",
        },
      ],
    },
  },
  {
    id: "password-safety",
    title: "Password Power!",
    description: "Create super strong passwords that no villain can crack! Robo Buddy has your back!",
    icon: Lock,
    color: "text-primary",
    bgColor: "bg-primary/10",
    guide: { name: "Robo Buddy", image: robotGuide },
    levelMiniGames: [
      ["password-builder", "quiz"],
      ["memory", "sort-game"],
      ["password-builder", "boss-battle"],
    ],
      ["password-builder", "scenario", "strength-tester"],
    ],
    badgeId: "password-pro",
    badgeName: "Password Pro",
    badgeIcon: "🔐",
    questionsByTier: {
      junior: [
        { question: "Should you tell your password to your best friend? 🤫", miniGameType: "quiz", options: ["Yes, friends share!", "No, keep it secret!"], correct: 1, explanation: "Keep passwords secret! Only share with your parents." },
        { question: "Build a stronger password! Which is better?", miniGameType: "password-builder", options: ["abc", "Tiger7!"], correct: 1, explanation: "Tiger7! mixes letters, numbers, and symbols — much stronger than 'abc'!" },
        { question: "Your parent helps you create a password. Is that okay? 👨‍👩‍👧", miniGameType: "quiz", options: ["Yes!", "No!"], correct: 0, explanation: "Yes! Parents can help you make a strong, safe password." },
        { question: "Fix this weak password! '123456' needs to become...", miniGameType: "password-fixer", options: ["654321", "Stars123!", "111111"], correct: 1, explanation: "Stars123! is much better — it has letters, numbers, AND a symbol!" },
        { question: "Test this password's strength: 'password'", miniGameType: "strength-tester", options: ["Super Strong 💪", "Very Weak 😱"], correct: 1, explanation: "'password' is one of the most commonly hacked passwords ever! Never use it!" },
        { question: "Using your favorite animal + a number + a symbol, like 'Tiger7!' 🐯", miniGameType: "password-builder", options: ["Bad idea", "Good idea!"], correct: 1, explanation: "Good job! Mixing words, numbers, and symbols makes a stronger password." },
        { question: "Writing your password on a sticky note on your computer. 📝", miniGameType: "scenario", options: ["Good idea", "Bad idea!"], correct: 1, explanation: "Never write passwords where others can see them!" },
        { question: "Fix this password: 'ilovecats'", miniGameType: "password-fixer", options: ["ILoveCats!", "1L0v3C@ts!99", "catsss"], correct: 1, explanation: "1L0v3C@ts!99 replaces letters with numbers and symbols — way harder to guess!" },
        { question: "How strong is 'MyDog2024'?", miniGameType: "strength-tester", options: ["Medium — could be better", "Super strong!"], correct: 0, explanation: "It's okay, but personal info like pet names + year is guessable. Add symbols!" },
      ],
      defender: [
        { question: "Build the strongest password:", miniGameType: "password-builder", options: ["BlueTiger$42Rain", "password123", "qwerty"], correct: 0, explanation: "'BlueTiger$42Rain' mixes words, symbols, and numbers — much stronger than common passwords." },
        { question: "A website says 'Save your password in your browser.' Should you on your own device?", miniGameType: "scenario", options: ["Yes, it's convenient", "Never save passwords"], correct: 0, explanation: "Saving passwords on YOUR OWN device is generally okay, but never on shared computers." },
        { question: "Fix this weak password: 'minecraft'", miniGameType: "password-fixer", options: ["Minecraft1", "M!n3cr@ft$2024", "minecraftgame"], correct: 1, explanation: "M!n3cr@ft$2024 uses symbol substitutions, mixed case, and numbers — much stronger!" },
        { question: "Test strength: 'Tr0ub4dor&3'", miniGameType: "strength-tester", options: ["Strong 💪", "Weak ❌"], correct: 0, explanation: "This password uses mixed case, numbers, and symbols with good length — it's strong!" },
        { question: "Your friend asks for your game password to 'help you level up.' What do you do?", miniGameType: "scenario", options: ["Share it, they're a friend", "Keep it secret"], correct: 1, explanation: "Never share passwords, even with friends! They could accidentally share it." },
        { question: "Using the same password for every website:", miniGameType: "quiz", options: ["Convenient and fine", "Dangerous!"], correct: 1, explanation: "If one site gets hacked, all your accounts are at risk. Use different passwords!" },
        { question: "Build a passphrase: which is strongest?", miniGameType: "password-builder", options: ["correct horse battery staple", "abcdefgh", "11111111"], correct: 0, explanation: "Long passphrases made of random words are very strong and memorable!" },
        { question: "A password manager app helps store passwords securely:", miniGameType: "quiz", options: ["Good idea", "Bad idea"], correct: 0, explanation: "Password managers create and remember strong, unique passwords for you!" },
        { question: "How strong is 'Summer2024!'?", miniGameType: "strength-tester", options: ["Decent but predictable", "Very strong"], correct: 0, explanation: "Season + year patterns are very common. Hackers try these first!" },
      ],
      guardian: [
        { question: "Build the best password approach:", miniGameType: "password-builder", options: ["Use your name + birthday", "Create 'PurpleDragon$Flies@Night9'", "Unsure"], correct: 1, explanation: "Passphrases are long, memorable, and hard to crack. Never use personal info." },
        { question: "Two-factor authentication (2FA) — worth the hassle?", miniGameType: "scenario", options: ["Yes, much safer", "No, passwords are enough", "Unsure"], correct: 0, explanation: "2FA is one of the best protections. Even if someone steals your password, they can't get in." },
        { question: "Fix this situation: You got an email saying 'Your password was compromised. Click to reset.'", miniGameType: "password-fixer", options: ["Click the link", "Go to the website directly", "Unsure"], correct: 1, explanation: "Never click reset links in unexpected emails. Type the URL yourself." },
        { question: "Test: A data breach exposed your password on one site. You use it on 3 others.", miniGameType: "strength-tester", options: ["Change only the breached site", "Change all four passwords", "Unsure"], correct: 1, explanation: "Change ALL matching passwords. 'Credential stuffing' tries stolen passwords on other sites automatically." },
        { question: "A 'password strength checker' website asks you to type your actual password:", miniGameType: "scenario", options: ["Go ahead", "Don't enter your real password", "Unsure"], correct: 1, explanation: "Never type real passwords into third-party websites! Use offline tools or your password manager's checker." },
        { question: "Build the most secure login setup:", miniGameType: "password-builder", options: ["Strong password only", "Strong password + 2FA + password manager", "Same password everywhere"], correct: 1, explanation: "The triple combo of unique strong passwords, 2FA, and a password manager is the gold standard!" },
        { question: "Fix: You discover your bank and social media use the same password.", miniGameType: "password-fixer", options: ["It's fine, they're both secure sites", "Change one immediately", "Change both immediately"], correct: 2, explanation: "Change both! Never reuse passwords between financial and social accounts. Use a password manager." },
        { question: "How strong is a 6-character password with mixed case?", miniGameType: "strength-tester", options: ["Strong enough", "Too short, even with mixed case"], correct: 1, explanation: "6 characters can be brute-forced in minutes. Use at least 12+ characters." },
        { question: "Your company requires password changes every 30 days:", miniGameType: "scenario", options: ["Good security practice", "Actually counterproductive", "Unsure"], correct: 1, explanation: "Frequent forced changes lead to weaker passwords. Modern guidance: change only when compromised, use strong unique passwords." },
      ],
    },
  },
  {
    id: "safe-websites",
    title: "Safe Sites Explorer",
    description: "Learn to spot safe websites from dangerous ones!",
    icon: Eye,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    guide: { name: "Detective Whiskers", image: detectiveCat },
    levelMiniGames: [
      ["quiz", "spot-the-difference"],
      ["scenario", "quiz"],
      ["spot-the-difference", "scenario", "quiz"],
    ],
    badgeId: "safe-surfer",
    badgeName: "Safe Surfer",
    badgeIcon: "🏄",
    questionsByTier: {
      junior: [
        { question: "A website has lots of flashing 'YOU WIN!' banners. Is it safe? 🎰", miniGameType: "quiz", options: ["Safe", "Scam"], correct: 1, explanation: "Websites with lots of flashy 'win' messages are usually not safe!" },
        { question: "Spot the difference: Which website name looks fake?", miniGameType: "spot-the-difference", options: ["google.com", "go0gle.com", "youtube.com"], correct: 1, explanation: "go0gle.com has a zero instead of the letter 'o' — that's a fake copycat site!" },
        { question: "Your parent shows you a website for kids' games they checked first. 🎮", miniGameType: "quiz", options: ["Safe", "Scam"], correct: 0, explanation: "If a parent checked the website first, it's safe to use!" },
        { question: "A website asks you to type your name and where you live. 🏠", miniGameType: "scenario", options: ["Safe", "Scam"], correct: 1, explanation: "Never type where you live on a website! Tell a grown-up." },
        { question: "You visit the library website your teacher told you about. 📖", miniGameType: "quiz", options: ["Safe", "Scam"], correct: 0, explanation: "Websites recommended by teachers are usually safe and helpful!" },
        { question: "A website says 'Download this to make your computer faster!' ⚡", miniGameType: "scenario", options: ["Safe", "Scam"], correct: 1, explanation: "Don't download things from websites you don't know!" },
        { question: "Spot the fake: Which app store is real?", miniGameType: "spot-the-difference", options: ["App Store", "Free App Store Downloads", "Google Play"], correct: 1, explanation: "'Free App Store Downloads' is not a real store — stick to official App Store and Google Play!" },
        { question: "A pop-up says your tablet needs an update. Close it?", miniGameType: "quiz", options: ["Close it!", "Click update"], correct: 0, explanation: "Always close pop-ups about updates! Real updates come from your device settings." },
        { question: "A website has a padlock 🔒 icon next to its name. What does it mean?", miniGameType: "quiz", options: ["It's secure", "It's dangerous"], correct: 0, explanation: "The padlock means the website uses encryption to protect your information!" },
      ],
      defender: [
        { question: "A website URL starts with 'http://' instead of 'https://'. It asks for your email.", miniGameType: "scenario", options: ["Safe", "Scam"], correct: 1, explanation: "The 's' in 'https' means secure. Without it, your info isn't encrypted." },
        { question: "Spot the fake URL:", miniGameType: "spot-the-difference", options: ["wikipedia.org", "wiki-pedia.org.free", "en.wikipedia.org"], correct: 1, explanation: "'wiki-pedia.org.free' has hyphens and an extra domain — not the real Wikipedia!" },
        { question: "Wikipedia.org for a school project research:", miniGameType: "quiz", options: ["Safe", "Scam"], correct: 0, explanation: "Wikipedia is generally safe. Verify important facts with other sources too!" },
        { question: "'free-minecraft-hacks.xyz' offers free game mods:", miniGameType: "scenario", options: ["Safe", "Scam"], correct: 1, explanation: "'.xyz' domains offering 'free hacks' are often loaded with malware." },
        { question: "Your school's official website URL matches the school letterhead:", miniGameType: "quiz", options: ["Safe", "Scam"], correct: 0, explanation: "Safe! Verifying URLs against official sources is a great habit." },
        { question: "A homework site has tons of pop-ups and asks you to disable your ad blocker:", miniGameType: "scenario", options: ["Safe", "Scam"], correct: 1, explanation: "Excessive pop-ups + pressure to disable ad blockers = likely malicious." },
        { question: "Spot the suspicious URL:", miniGameType: "spot-the-difference", options: ["youtube.com/watch", "y0utube-premium.com", "youtu.be/abc"], correct: 1, explanation: "y0utube-premium.com uses a zero and adds '-premium' — URL spoofing!" },
        { question: "A search result is the first result for 'Fortnite download' but it's a sponsored ad:", miniGameType: "quiz", options: ["Always safe", "Check the URL carefully"], correct: 1, explanation: "Sponsored search results can be from anyone — always verify the URL is the official site!" },
        { question: "A site asks you to install a browser extension to 'enhance security':", miniGameType: "scenario", options: ["Install it", "Skip it"], correct: 1, explanation: "Random browser extensions can steal your data. Only install from trusted sources!" },
      ],
      guardian: [
        { question: "A site with 90% discounts has URL 'nikee-outlet-deals.com' (double 'e'):", miniGameType: "spot-the-difference", options: ["Safe", "Scam", "Unsure"], correct: 1, explanation: "Misspelled brand URL + too-good prices = counterfeit scam or credit card harvesting." },
        { question: "Downloading a PDF reader from adobe.com:", miniGameType: "quiz", options: ["Safe", "Scam", "Unsure"], correct: 0, explanation: "Official website downloads are the safest approach." },
        { question: "A site lets you watch new movies free but needs a 'special video player':", miniGameType: "scenario", options: ["Safe", "Scam", "Unsure"], correct: 1, explanation: "Classic malware trick. Legitimate services don't need special player downloads." },
        { question: "Spot the fake shopping site:", miniGameType: "spot-the-difference", options: ["amazon.com", "arnazon.com (rn = m)", "amazon.co.uk"], correct: 1, explanation: "'arnazon' uses 'rn' to look like 'm' — a sophisticated typosquatting technique!" },
        { question: "A coding tutorial site recommended by a YouTuber, has HTTPS and clear contact info:", miniGameType: "quiz", options: ["Safe", "Scam", "Unsure"], correct: 0, explanation: "Multiple trust signals: known recommendation, HTTPS, transparency. Strong positive indicators." },
        { question: "Browser shows 'Your connection is not private' warning. Content looks fine.", miniGameType: "scenario", options: ["Proceed anyway", "Leave the site", "Unsure"], correct: 1, explanation: "Never ignore certificate warnings! Your data could be intercepted." },
        { question: "Spot the difference: Which SSL certificate info is concerning?", miniGameType: "spot-the-difference", options: ["Issued to: Google LLC", "Issued to: Unknown Organization", "Issued to: Amazon.com Inc."], correct: 1, explanation: "'Unknown Organization' means the site's identity isn't verified — a major red flag for entering any personal data." },
        { question: "A QR code on a poster leads to a URL you don't recognize:", miniGameType: "scenario", options: ["Scan and visit", "Check the URL first", "Unsure"], correct: 1, explanation: "QR codes can link to malicious sites. Always check where the URL leads before entering any info!" },
        { question: "A website shows a countdown timer: 'Deal expires in 2:00 minutes!'", miniGameType: "quiz", options: ["Hurry and buy!", "Ignore the pressure", "Unsure"], correct: 1, explanation: "Fake urgency timers are a dark pattern to pressure you into impulsive decisions." },
      ],
    },
  },
  {
    id: "personal-info",
    title: "Secret Keeper",
    description: "Protect your personal information like a true Cyber Hero! Professor Hoot guides you!",
    icon: Shield,
    color: "text-cyber-purple",
    bgColor: "bg-cyber-purple/10",
    guide: { name: "Professor Hoot", image: wiseOwl },
    levelMiniGames: [
      ["scenario", "quiz"],
      ["quiz", "drag-sort"],
      ["scenario", "word-search", "quiz"],
    ],
    badgeId: "privacy-knight",
    badgeName: "Privacy Knight",
    badgeIcon: "🛡️",
    questionsByTier: {
      junior: [
        { question: "Someone online asks: 'What school do you go to?' Should you tell them? 🏫", miniGameType: "scenario", options: ["Tell them", "Keep it secret!"], correct: 1, explanation: "Never tell strangers online where your school is!" },
        { question: "Sort: Which info is PRIVATE? (Don't share online!)", miniGameType: "drag-sort", options: ["Your favorite color", "Your home address", "Your favorite movie"], correct: 1, explanation: "Your home address is private! Favorite colors and movies are okay to share." },
        { question: "Your parent posts a family photo on their private account. 📷", miniGameType: "quiz", options: ["Okay", "Not okay"], correct: 0, explanation: "When parents share on private accounts they control, that's their decision to make." },
        { question: "A game asks for your real birthday and full name to play. 🎂", miniGameType: "scenario", options: ["Give the info", "Ask a parent!"], correct: 1, explanation: "Games don't need your real birthday or full name. Ask a parent for help!" },
        { question: "You tell your parent about a weird message you got online. 💬", miniGameType: "quiz", options: ["Good idea!", "Bad idea"], correct: 0, explanation: "Great job! Always tell a trusted adult about weird messages." },
        { question: "A stranger online wants to video chat with you. 📹", miniGameType: "scenario", options: ["Sure!", "No way!"], correct: 1, explanation: "Never video chat with strangers! Tell a grown-up right away." },
        { question: "Sort: Which is safe to use as a username?", miniGameType: "drag-sort", options: ["CosmicPlayer42", "JohnSmith_Age8_NYC", "CoolGamer99"], correct: 1, explanation: "JohnSmith_Age8_NYC reveals your real name, age, AND city! Use creative names like CosmicPlayer42." },
        { question: "Someone asks for your phone number in an online game:", miniGameType: "scenario", options: ["Share it", "Don't share it!"], correct: 1, explanation: "Never share your phone number with people you meet online!" },
        { question: "Is it okay to share your favorite food online?", miniGameType: "quiz", options: ["Yes, that's fine!", "No, keep it secret"], correct: 0, explanation: "Sharing general things like your favorite food is fine — just don't share private info like your address!" },
      ],
      defender: [
        { question: "A quiz asks for your full name, birthday, and pet's name for your 'superhero name':", miniGameType: "scenario", options: ["Fun, do it!", "Skip it, it's a data trap"], correct: 1, explanation: "These quizzes collect data that could guess your passwords or security questions!" },
        { question: "You use 'CosmicPlayer42' instead of your real name for a gaming profile:", miniGameType: "quiz", options: ["Smart choice!", "You should use your real name"], correct: 0, explanation: "Smart! Creative usernames protect your identity." },
        { question: "A classmate wants you to share your live location on a messaging app:", miniGameType: "scenario", options: ["Share it", "Don't share"], correct: 1, explanation: "Even with friends, sharing live location digitally is risky. Agree on a meeting place instead." },
        { question: "Sort: Which permission does a flashlight app actually need?", miniGameType: "drag-sort", options: ["Camera flash", "Your contacts", "Your location"], correct: 0, explanation: "A flashlight only needs camera flash access! Contacts and location are unnecessary data grabs." },
        { question: "A school activity form asks for your name, grade, and parent's email:", miniGameType: "quiz", options: ["Seems okay", "Don't fill it out"], correct: 0, explanation: "School activities with parent involvement are typically safe and responsible." },
        { question: "An app asks for contacts, camera, microphone, AND location — but it's just a calculator:", miniGameType: "scenario", options: ["Allow all", "That's suspicious!"], correct: 1, explanation: "A calculator needs NONE of those! Only grant permissions that make sense for the app." },
        { question: "Which info is safe for your public profile?", miniGameType: "drag-sort", options: ["Your nickname", "Your school name", "Your phone number"], correct: 0, explanation: "Only nicknames are safe for public profiles. School name and phone number are private!" },
        { question: "A website says they'll share your data with 'third-party partners for marketing':", miniGameType: "quiz", options: ["Normal, accept", "Be cautious"], correct: 1, explanation: "This means your data could be sold. Minimize what you share and read privacy policies!" },
        { question: "Your friend tags you at a specific location with your full name without permission:", miniGameType: "scenario", options: ["It's fine", "Ask them to remove it"], correct: 1, explanation: "You have the right to control your digital footprint. Ask them to remove the tag." },
      ],
      guardian: [
        { question: "A platform suggests making your profile public to 'get more followers.' Your profile has school name, city, and photos.", miniGameType: "scenario", options: ["Make it public", "Keep it private", "Unsure"], correct: 1, explanation: "Keep profiles with personal info private. More followers isn't worth the safety risk." },
        { question: "You notice your house number and street sign in a selfie background before posting:", miniGameType: "quiz", options: ["Post it", "Crop or retake", "Unsure"], correct: 1, explanation: "Always check backgrounds! Visible addresses can reveal your location." },
        { question: "Sort the privacy risk level:", miniGameType: "drag-sort", options: ["Sharing your favorite book", "Sharing your daily routine", "Sharing your school schedule"], correct: 0, explanation: "Favorite books are low risk. Daily routines and schedules help criminals plan! Share cautiously." },
        { question: "A survey offers $10 for your family's income, devices owned, and daily routine:", miniGameType: "scenario", options: ["Worth $10", "Too much personal info", "Unsure"], correct: 1, explanation: "This data helps criminals plan targeted scams or even break-ins. Not worth any reward." },
        { question: "Your school requires a new app that asks for more permissions than needed:", miniGameType: "scenario", options: ["Grant all permissions", "Ask the school about it", "Unsure"], correct: 1, explanation: "Question unnecessary permissions even from school apps. Advocate for your privacy!" },
        { question: "Identify the privacy risk:", miniGameType: "word-search", options: ["Username: GamerPro", "Bio: 'Student at Lincoln Middle, Class of 2026'", "Status: 'Love pizza 🍕'"], correct: 1, explanation: "A bio with your school name and graduation year narrows down exactly who you are and where to find you." },
        { question: "A genealogy site asks for your family tree, birth dates, and maiden names:", miniGameType: "scenario", options: ["Fine for family history", "Those are common security answers!", "Unsure"], correct: 1, explanation: "Maiden names and birth dates are common security question answers. Sharing them publicly compromises your accounts." },
        { question: "Your connected fitness app shares your running route publicly by default:", miniGameType: "quiz", options: ["No big deal", "Change to private", "Unsure"], correct: 1, explanation: "Public running routes reveal where you live and your schedule. Always check sharing settings on fitness apps!" },
        { question: "A friend shares a photo of your group's concert tickets with barcodes visible:", miniGameType: "scenario", options: ["Cool, we're going!", "Ask them to blur the barcodes", "Unsure"], correct: 1, explanation: "Visible barcodes can be copied and used by someone else. Always blur or cover ticket details before sharing!" },
      ],
    },
  },
];

export const ALL_BADGES = [
  { id: "scam-spotter", name: "Scam Spotter", icon: "🔍" },
  { id: "password-pro", name: "Password Pro", icon: "🔐" },
  { id: "safe-surfer", name: "Safe Surfer", icon: "🏄" },
  { id: "privacy-knight", name: "Privacy Knight", icon: "🛡️" },
  { id: "cyber-champion", name: "Cyber Champion", icon: "🏆" },
  { id: "master-hero", name: "Master Hero", icon: "⭐" },
];
