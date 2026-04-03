export type DifficultyTier = "junior" | "hero" | "elite";

export function getDifficultyTier(age: number): DifficultyTier {
  if (age <= 8) return "junior";
  if (age <= 11) return "hero";
  return "elite";
}

export interface ZoneQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ZoneContent {
  storyTitle: string;
  storyText: string;
  questions: ZoneQuestion[];
  xpReward: number;
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
  villain: string;
  zones: WorldZone[];
  byteIntro: Record<DifficultyTier, string>;
}

export const WORLDS: WorldContinent[] = [
  {
    id: "north-america",
    name: "North America",
    emoji: "🌎",
    color: "from-primary to-cyber-teal",
    villain: "The Keybreaker",
    byteIntro: {
      junior:
        "Whoa! A new Cyber Hero! I'm Byte! The Keybreaker is breaking passwords everywhere! Let's stop him! 🔐",
      hero:
        "Guardian! The Keybreaker is on the loose across North America — cracking passwords and breaking into accounts. Ready to learn how to stop him?",
      elite:
        "Cyber Hero — the Keybreaker has been systematically compromising accounts across North America. Your mission: master password security and shut him down.",
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
            storyText:
              "Oh no! The Keybreaker just opened someone's account because their password was '1234'. That's like using a paper lock on a treasure chest! Let's learn how to make super strong passwords!",
            questions: [
              {
                question: "Which password is the strongest?",
                options: ["1234", "password", "Tr33H0use!9"],
                correctIndex: 2,
              },
              {
                question: "Should you share your password with friends?",
                options: ["Yes, always!", "No, keep it secret", "Only best friends"],
                correctIndex: 1,
              },
              {
                question: "What makes a password strong?",
                options: [
                  "Being short",
                  "Using letters, numbers & symbols",
                  "Using your name",
                ],
                correctIndex: 1,
              },
            ],
            xpReward: 50,
          },
          hero: {
            storyTitle: "Cracking the Code",
            storyText:
              "The Keybreaker uses programs that try thousands of passwords per second. Simple passwords fall instantly. Your mission: understand what makes passwords unbreakable and protect accounts across the region.",
            questions: [
              {
                question: "What is a brute-force attack?",
                options: [
                  "Guessing passwords one by one very fast",
                  "Asking someone for their password",
                  "Resetting a password",
                ],
                correctIndex: 0,
              },
              {
                question: "Which is the best password strategy?",
                options: [
                  "Use your birthday",
                  "Use a passphrase with mixed characters",
                  "Use the same password everywhere",
                ],
                correctIndex: 1,
              },
              {
                question: "How often should you change important passwords?",
                options: ["Never", "Every few months", "Only when hacked"],
                correctIndex: 1,
              },
            ],
            xpReward: 100,
          },
          elite: {
            storyTitle: "The Keybreaker's Algorithm",
            storyText:
              "Intelligence reports show The Keybreaker is using rainbow tables and credential stuffing to compromise accounts at scale. Understanding hashing, salting, and multi-factor authentication is critical to shutting down this operation.",
            questions: [
              {
                question: "What is credential stuffing?",
                options: [
                  "Using leaked credentials on multiple sites",
                  "Creating fake accounts",
                  "Encrypting passwords",
                ],
                correctIndex: 0,
              },
              {
                question:
                  "Why is multi-factor authentication (MFA) effective?",
                options: [
                  "It uses longer passwords",
                  "It requires something you know AND something you have",
                  "It blocks all hackers",
                ],
                correctIndex: 1,
              },
              {
                question: "What does 'salting' a password mean?",
                options: [
                  "Adding random data before hashing",
                  "Making it longer",
                  "Encrypting it twice",
                ],
                correctIndex: 0,
              },
              {
                question:
                  "Which attack uses precomputed hash tables?",
                options: [
                  "Phishing",
                  "Rainbow table attack",
                  "Social engineering",
                ],
                correctIndex: 1,
              },
            ],
            xpReward: 150,
          },
        },
      },
    ],
  },
];
