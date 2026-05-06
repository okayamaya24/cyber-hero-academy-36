/**
 * Learning Mode Configuration
 *
 * Maps 4 guide characters → lessons → missions → unlocked games.
 * Kids must complete lessons IN ORDER before accessing the Games tab.
 */

export interface LearningLesson {
  id: string;           // unique lesson id
  title: string;        // lesson display title
  description: string;  // short description shown on card
  missionId: string | null; // maps to existing MISSIONS id (null = coming soon)
  comingSoon?: boolean;
}

export interface LearningCharacter {
  id: string;
  name: string;
  emoji: string;
  guideId: string;      // key in GUIDE_REGISTRY
  topic: string;        // topic label shown on card
  color: string;        // tailwind bg color for accent
  borderColor: string;  // tailwind border color
  textColor: string;    // tailwind text color
  lessons: LearningLesson[];
  /** Mission IDs whose completion unlocks this character */
  unlockedAfterCharacter: string | null; // null = always unlocked
  /** Game IDs (route-based) that unlock when ANY lesson here is completed */
  unlocksGameIds: string[];
}

export const LEARNING_CHARACTERS: LearningCharacter[] = [
  {
    id: "hero",
    name: "Your Hero",
    emoji: "🦸",
    guideId: "captain-cyber",
    topic: "Passwords & Devices",
    color: "bg-purple-100",
    borderColor: "border-purple-300",
    textColor: "text-purple-700",
    unlockedAfterCharacter: null, // always available
    lessons: [
      {
        id: "lesson-hero-1",
        title: "Creating Strong Passwords",
        description: "Learn what makes a password nearly impossible to crack.",
        missionId: "password-safety",
      },
      {
        id: "lesson-hero-2",
        title: "Cyber Clues & Digital Trails",
        description: "Discover the clues hackers leave behind — and how to spot them.",
        missionId: "cyber-clues",
      },
      {
        id: "lesson-hero-3",
        title: "Defending Your Devices",
        description: "Keep your phone, tablet, and computer safe from attacks.",
        missionId: "device-defender",
      },
    ],
    unlocksGameIds: [
      "password-tower",
      "password-cracker-race",
      "lock-the-vault-puzzle",
      "build-strong-password",
      "lock-the-vault",
      "password-hunt",
      "password-power",
      "sequence-shield",
    ],
  },
  {
    id: "whiskers",
    name: "Detective Whiskers",
    emoji: "🐱",
    guideId: "detective-whiskers",
    topic: "Phishing & Scams",
    color: "bg-amber-100",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
    unlockedAfterCharacter: "hero",
    lessons: [
      {
        id: "lesson-whiskers-1",
        title: "What Is Phishing?",
        description: "Spot the tricks scammers use to steal your info.",
        missionId: "scam-detection",
      },
      {
        id: "lesson-whiskers-2",
        title: "Fake Websites & Links",
        description: "Learn to tell a real website from a dangerous fake.",
        missionId: "safe-websites",
      },
      {
        id: "lesson-whiskers-3",
        title: "Suspicious Messages",
        description: "Texts and emails can be traps — here's how to spot them.",
        missionId: "phishy-messages",
      },
    ],
    unlocksGameIds: [
      "spot-the-phish",
      "phishing-detective",
      "real-or-fake-website",
      "spot-the-scam",
      "safe-or-scam-sorter",
      "internet-detective",
      "cyber-clues",
      "trust-or-trash",
    ],
  },
  {
    id: "hoot",
    name: "Professor Hoot",
    emoji: "🦉",
    guideId: "professor-hoot",
    topic: "Privacy & Safe Sharing",
    color: "bg-teal-100",
    borderColor: "border-teal-300",
    textColor: "text-teal-700",
    unlockedAfterCharacter: "whiskers",
    lessons: [
      {
        id: "lesson-hoot-1",
        title: "Your Personal Info",
        description: "What counts as personal info — and why you should protect it.",
        missionId: "personal-info",
      },
      {
        id: "lesson-hoot-2",
        title: "Smart Sharing Online",
        description: "Know what's safe to share and what should stay private.",
        missionId: "smart-sharing",
      },
      {
        id: "lesson-hoot-3",
        title: "Searching Safely",
        description: "Not everything online is true — learn to find the real facts.",
        missionId: "internet-detective",
      },
    ],
    unlocksGameIds: [
      "privacy-patrol",
      "smart-sharing",
      "stay-safe-online",
      "safe-or-not",
      "safe-sites-explorer",
      "secret-keeper",
      "cyber-basics",
    ],
  },
  {
    id: "robo",
    name: "Robo Buddy",
    emoji: "🤖",
    guideId: "robo-buddy",
    topic: "Malware & Online Safety",
    color: "bg-cyan-100",
    borderColor: "border-cyan-300",
    textColor: "text-cyan-700",
    unlockedAfterCharacter: "hoot",
    lessons: [
      {
        id: "lesson-robo-1",
        title: "Malware & Viruses",
        description: "Understand the monsters hiding in downloads and links.",
        missionId: "malware-monsters",
      },
      {
        id: "lesson-robo-2",
        title: "Strangers & Cyberbullying",
        description: "How to stay safe from strangers and handle mean behavior online.",
        missionId: null,
        comingSoon: true,
      },
      {
        id: "lesson-robo-3",
        title: "Safe Downloads",
        description: "Only download files that are safe — here's how to check.",
        missionId: null,
        comingSoon: true,
      },
    ],
    unlocksGameIds: [
      "virus-vaporizer",
      "firewall-blitz",
      "malware-monsters",
      "device-defender",
      "firewall-typer",
      "code-typer",
      "hacker-chase",
      "bytes-quiz-blitz",
    ],
  },
];

/** Get a character by id */
export function getLearningCharacter(id: string): LearningCharacter | undefined {
  return LEARNING_CHARACTERS.find((c) => c.id === id);
}

/** Check if a character is unlocked given completed mission IDs */
export function isCharacterUnlocked(
  character: LearningCharacter,
  completedMissionIds: Set<string>,
): boolean {
  if (!character.unlockedAfterCharacter) return true;
  const prevChar = LEARNING_CHARACTERS.find((c) => c.id === character.unlockedAfterCharacter);
  if (!prevChar) return true;
  // All non-coming-soon lessons of the previous character must be complete
  return prevChar.lessons
    .filter((l) => !l.comingSoon && l.missionId)
    .every((l) => completedMissionIds.has(l.missionId!));
}

/** Check if a specific lesson is unlocked */
export function isLessonUnlocked(
  character: LearningCharacter,
  lessonIndex: number,
  completedMissionIds: Set<string>,
): boolean {
  // Character itself must be unlocked
  if (!isCharacterUnlocked(character, completedMissionIds)) return false;
  // First lesson always unlocked if character is unlocked
  if (lessonIndex === 0) return true;
  // Subsequent lessons require the previous one to be done
  const prevLesson = character.lessons[lessonIndex - 1];
  if (prevLesson.comingSoon || !prevLesson.missionId) return false;
  return completedMissionIds.has(prevLesson.missionId);
}

/** Check if a game route is unlocked based on lesson progress */
export function isGameUnlockedByLessons(
  gameId: string,
  completedMissionIds: Set<string>,
): boolean {
  for (const character of LEARNING_CHARACTERS) {
    if (character.unlocksGameIds.includes(gameId)) {
      // Unlock if the kid has completed at least the first lesson of this character
      const firstLesson = character.lessons.find((l) => !l.comingSoon && l.missionId);
      if (!firstLesson) return false;
      return completedMissionIds.has(firstLesson.missionId!);
    }
  }
  // Games not in any character's list are always unlocked
  return true;
}

/** Get which character teaches a game */
export function getGameTeacher(gameId: string): LearningCharacter | null {
  return LEARNING_CHARACTERS.find((c) => c.unlocksGameIds.includes(gameId)) ?? null;
}
