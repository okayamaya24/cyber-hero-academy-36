export type DifficultyTier = "junior" | "hero" | "elite";

export function getDifficultyTier(age: number): DifficultyTier {
  if (age <= 8) return "junior";
  if (age <= 11) return "hero";
  return "elite";
}

export function getTierLabel(tier: DifficultyTier): string {
  switch (tier) {
    case "junior": return "Junior Hero";
    case "hero": return "Hero";
    case "elite": return "Elite Hero";
  }
}

export interface ZoneQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface MiniGameConfig {
  type: string;
  timerSeconds: number;
  items: MiniGameItem[];
  hints: boolean;
  passThreshold?: number;
}

export interface MiniGameItem {
  label: string;
  correct: boolean;
}

export interface ZoneContent {
  storyTitle: string;
  storyText: string;
  miniGame: MiniGameConfig;
  questions: ZoneQuestion[];
  xpReward: number;
  completeMessage: string;
}

export interface WorldZone {
  id: string;
  name: string;
  emoji: string;
  description: string;
  content: Record<DifficultyTier, ZoneContent>;
}

export interface WorldContinent {
  id: string;
  name: string;
  emoji: string;
  color: string;
  villainColor: string;
  villain: string;
  villainEmoji: string;
  totalZones: number;
  zones: WorldZone[];
  byteIntro: Record<DifficultyTier, string>;
}

export const WORLDS: WorldContinent[] = [
  {
    id: "north-america",
    name: "North America",
    emoji: "🌎",
    color: "from-cyan-500/20 to-blue-600/20",
    villainColor: "text-cyan-400",
    villain: "THE KEYBREAKER",
    villainEmoji: "🔓",
    totalZones: 8,
    byteIntro: {
      junior: "Whoa! A new Cyber Hero! I'm Byte! The Keybreaker is breaking passwords everywhere! Let's stop him! 🔐",
      hero: "Guardian! The Keybreaker is on the loose across North America — cracking passwords and breaking into accounts. Ready to learn how to stop him?",
      elite: "Cyber Hero — the Keybreaker has been systematically compromising accounts across North America. Your mission: master password security and shut him down.",
    },
    zones: [
      {
        id: "na-zone-1",
        name: "Password Plains",
        emoji: "🔑",
        description: "Learn why strong passwords matter",
        content: {
          junior: {
            storyTitle: "The Weak Lock",
            storyText: "Oh no! The Keybreaker just opened someone's account because their password was '1234'. That's like using a paper lock on a treasure chest! Let's learn how to make super strong passwords!",
            questions: [
              { question: "Which password is the strongest?", options: ["1234", "password", "Tr33H0use!9"], correctIndex: 2 },
              { question: "Should you share your password with friends?", options: ["Yes, always!", "No, keep it secret", "Only best friends"], correctIndex: 1 },
              { question: "What makes a password strong?", options: ["Being short", "Using letters, numbers & symbols", "Using your name"], correctIndex: 1 },
            ],
            xpReward: 50,
          },
          hero: {
            storyTitle: "Cracking the Code",
            storyText: "The Keybreaker uses programs that try thousands of passwords per second. Simple passwords fall instantly. Your mission: understand what makes passwords unbreakable.",
            questions: [
              { question: "What is a brute-force attack?", options: ["Guessing passwords one by one very fast", "Asking someone for their password", "Resetting a password"], correctIndex: 0 },
              { question: "Which is the best password strategy?", options: ["Use your birthday", "Use a passphrase with mixed characters", "Use the same password everywhere"], correctIndex: 1 },
              { question: "How often should you change important passwords?", options: ["Never", "Every few months", "Only when hacked"], correctIndex: 1 },
            ],
            xpReward: 100,
          },
          elite: {
            storyTitle: "The Keybreaker's Algorithm",
            storyText: "Intelligence reports show The Keybreaker is using rainbow tables and credential stuffing to compromise accounts at scale. Understanding hashing, salting, and MFA is critical.",
            questions: [
              { question: "What is credential stuffing?", options: ["Using leaked credentials on multiple sites", "Creating fake accounts", "Encrypting passwords"], correctIndex: 0 },
              { question: "Why is MFA effective?", options: ["It uses longer passwords", "It requires something you know AND something you have", "It blocks all hackers"], correctIndex: 1 },
              { question: "What does 'salting' a password mean?", options: ["Adding random data before hashing", "Making it longer", "Encrypting it twice"], correctIndex: 0 },
              { question: "Which attack uses precomputed hash tables?", options: ["Phishing", "Rainbow table attack", "Social engineering"], correctIndex: 1 },
            ],
            xpReward: 150,
          },
        },
      },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    emoji: "🏰",
    color: "from-violet-500/20 to-purple-600/20",
    villainColor: "text-violet-400",
    villain: "THE PHISHER KING",
    villainEmoji: "🎣",
    totalZones: 6,
    byteIntro: {
      junior: "Watch out! The Phisher King sends tricky messages to steal your info! Let's learn to spot his tricks! 🎣",
      hero: "The Phisher King rules Europe's dark web — sending fake emails and messages to trick people. Time to learn how to identify phishing!",
      elite: "The Phisher King orchestrates sophisticated social engineering campaigns across Europe. Your mission: master phishing detection and defense.",
    },
    zones: [],
  },
  {
    id: "africa",
    name: "Africa",
    emoji: "🌍",
    color: "from-amber-500/20 to-orange-600/20",
    villainColor: "text-amber-400",
    villain: "THE TROLL LORD",
    villainEmoji: "👹",
    totalZones: 6,
    byteIntro: {
      junior: "The Troll Lord is being mean to people online! Let's learn how to stay safe and be kind! 💪",
      hero: "The Troll Lord spreads cyberbullying across Africa. Your mission: learn how to handle online harassment and protect others.",
      elite: "The Troll Lord weaponizes social platforms for targeted harassment campaigns. Master digital citizenship and counter-trolling strategies.",
    },
    zones: [],
  },
  {
    id: "asia",
    name: "Asia",
    emoji: "🏯",
    color: "from-rose-500/20 to-red-600/20",
    villainColor: "text-rose-400",
    villain: "THE FIREWALL PHANTOM",
    villainEmoji: "👻",
    totalZones: 7,
    byteIntro: {
      junior: "The Firewall Phantom sneaks into computers! Let's build walls to keep him out! 🧱",
      hero: "The Firewall Phantom exploits network vulnerabilities across Asia. Learn about firewalls, encryption, and network security!",
      elite: "The Firewall Phantom breaches enterprise networks using zero-day exploits. Your mission: master network defense and intrusion detection.",
    },
    zones: [],
  },
  {
    id: "south-america",
    name: "South America",
    emoji: "🌿",
    color: "from-emerald-500/20 to-green-600/20",
    villainColor: "text-emerald-400",
    villain: "THE DATA THIEF",
    villainEmoji: "🦹",
    totalZones: 5,
    byteIntro: {
      junior: "The Data Thief is stealing people's personal info! Let's learn what to keep private! 🔒",
      hero: "The Data Thief harvests personal data across South America. Learn to protect your digital identity and privacy!",
      elite: "The Data Thief runs sophisticated data exfiltration operations. Master data privacy, encryption, and digital rights management.",
    },
    zones: [],
  },
  {
    id: "australia",
    name: "Australia",
    emoji: "🦘",
    color: "from-sky-500/20 to-teal-600/20",
    villainColor: "text-sky-400",
    villain: "MALWARE MAX",
    villainEmoji: "🦠",
    totalZones: 5,
    byteIntro: {
      junior: "Malware Max hides bad stuff in games and apps! Let's learn to spot his tricks! 🛡️",
      hero: "Malware Max spreads viruses and trojans across Australia. Learn to identify and defend against malware!",
      elite: "Malware Max deploys polymorphic malware and ransomware at scale. Master malware analysis and incident response protocols.",
    },
    zones: [],
  },
  {
    id: "antarctica",
    name: "Antarctica",
    emoji: "❄️",
    color: "from-slate-400/20 to-blue-400/20",
    villainColor: "text-slate-300",
    villain: "SHADOWBYTE",
    villainEmoji: "🌑",
    totalZones: 4,
    byteIntro: {
      junior: "Shadowbyte hides in the darkest corners of the internet! This is the final challenge! ⚡",
      hero: "Shadowbyte is the ultimate villain — master of all cyber threats. Prove you're ready to be a true Cyber Guardian!",
      elite: "Shadowbyte orchestrates advanced persistent threats from the shadows. This is your final exam — demonstrate mastery of all cybersecurity domains.",
    },
    zones: [],
  },
];
