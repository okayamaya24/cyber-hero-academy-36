/**
 * What each villain says during their boss battle, by how much health they have
 * left, plus their (silly) last words when defeated.
 */

export interface BossLines {
  /** [100–76 HP, 75–51, 50–26, 25–0] */
  taunts: [string, string, string, string];
  defeated: string;
}

const LINES: Record<string, BossLines> = {
  "the keybreaker": {
    taunts: [
      "No password can stop me, Guardian!",
      "Lucky guess! My next lock-pick won't miss.",
      "Wait... why are your passwords so LONG?!",
      "Twelve characters AND symbols?! Not fair!",
    ],
    defeated: "Nooo! My keys... they don't fit ANYTHING anymore! 🔑💥",
  },
  "the phisher king": {
    taunts: [
      "Click the link... I dare you! 🎣",
      "You spotted that one? Try THIS shiny prize!",
      "Stop checking the sender's address!",
      "My hooks... they're all tangled up!",
    ],
    defeated: "Curses! Nobody bites anymore... back to fishing for actual fish. 🐟",
  },
  "the troll lord": {
    taunts: [
      "I live in the comments. I AM the comments.",
      "You can't just... be KIND back! That's cheating!",
      "Stop blocking and reporting me! 😤",
      "Everyone's being nice. My power is fading!",
    ],
    defeated: "Fine... I'll go touch grass. Happy now?! 🌱",
  },
  "the firewall phantom": {
    taunts: [
      "You can't fight what you can't see. 👻",
      "Who turned on your updates?!",
      "Your firewall is... actually working?!",
      "I'm fading... too much security!",
    ],
    defeated: "Booo... I've been patched out of existence! 👻💨",
  },
  "the data thief": {
    taunts: [
      "Your secrets will be mine!",
      "Why won't you share your address?! Rude!",
      "Private accounts?! I can't see ANYTHING!",
      "My bag of stolen data is... empty?!",
    ],
    defeated: "All that sneaking for nothing! Your privacy settings are too strong! 🔒",
  },
  "malware max": {
    taunts: [
      "Bugs aren't problems. They're my pets! 🐛",
      "Hey! Don't scan that file!",
      "You only download from official stores?! Boring!",
      "My bugs... they're running away!",
    ],
    defeated: "Error 404: Malware Max not found! *bzzzt* 🐛💥",
  },
  shadowbyte: {
    taunts: [
      "Every password you've ever used... I have it.",
      "Impossible. No one has made it this far.",
      "You learned from ALL of them?!",
      "The breach... is closing...!",
    ],
    defeated: "The Digital World is... safe? You really are a Cyber Guardian... ⚡",
  },
};

const GENERIC: BossLines = {
  taunts: [
    "You don't stand a chance!",
    "Lucky shot... but I'm far from done!",
    "No... this can't be happening!",
    "I won't... be defeated...!",
  ],
  defeated: "Nooooo! I've been defeated!",
};

export function getBossLines(villainName: string): BossLines {
  return LINES[villainName.trim().toLowerCase()] ?? GENERIC;
}

export function bossTaunt(villainName: string, villainHP: number): string {
  const t = getBossLines(villainName).taunts;
  if (villainHP > 75) return t[0];
  if (villainHP > 50) return t[1];
  if (villainHP > 25) return t[2];
  return t[3];
}

/** Byte's advice before each round of a boss battle */
export const BYTE_ROUND_TIPS = [
  { title: "Round 1: Shields up! 🛡️", text: "Read each thing flying at you. Block the bad stuff with your shield, and let the good things pass by!" },
  { title: "Round 2: Rapid fire! ⚡", text: "Quick questions! Trust what you learned in this world's zones." },
  { title: "Round 3: Maze strike! 🗺️", text: "Find your way through the maze to land the final hit. You've got this!" },
];
