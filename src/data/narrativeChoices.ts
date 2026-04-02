import type { NarrativeOption } from "@/components/zone/NarrativeChoice";

/**
 * Narrative choices shown during cutscenes and story panels per zone.
 * Each zone can have a `cutsceneChoice` (shown at end of intro cutscene)
 * and `storyChoices` (shown after each game in story panels, indexed by game number).
 */
export interface ZoneNarrativeChoices {
  cutsceneChoice?: {
    prompt: string;
    options: NarrativeOption[];
  };
  storyChoices?: Record<number, {
    prompt: string;
    options: NarrativeOption[];
  }>;
}

const ZONE_NARRATIVE_CHOICES: Record<string, ZoneNarrativeChoices> = {
  /* ── NORTH AMERICA ── */
  "pixel-port": {
    cutsceneChoice: {
      prompt: "The Keybreaker has set traps across Pixel Port. How will you approach?",
      options: [
        { label: "Warn the local kids first", response: "Smart — knowledge is your best shield!", xpBonus: 10 },
        { label: "Hack the Keybreaker's own traps", response: "Bold move! Let's turn his tricks against him.", xpBonus: 15 },
        { label: "Set up a safe browsing perimeter", response: "Defensive strategy — a true Guardian move.", xpBonus: 10 },
      ],
    },
    storyChoices: {
      1: {
        prompt: "A suspicious pop-up appeared. What do you tell the kids?",
        options: [
          { label: "Never click pop-ups from unknown sources", response: "Exactly! Awareness is power.", xpBonus: 5 },
          { label: "Check the URL before interacting", response: "Great instinct — always verify first.", xpBonus: 5 },
        ],
      },
    },
  },
  "signal-summit": {
    cutsceneChoice: {
      prompt: "You've arrived at Signal Summit. The Keybreaker controls the WiFi here. Your move?",
      options: [
        { label: "Scan for rogue access points", response: "Smart — always verify the network first!", xpBonus: 10 },
        { label: "Set up an encrypted channel", response: "A secure tunnel — the Keybreaker can't intercept that!", xpBonus: 15 },
      ],
    },
  },
  "code-canyon": {
    cutsceneChoice: {
      prompt: "The Keybreaker is using social engineering in Code Canyon. How do you fight back?",
      options: [
        { label: "Teach people to question urgency", response: "Yes! Scammers love fake deadlines.", xpBonus: 10 },
        { label: "Build a scam detection database", response: "Knowledge base activated — great strategy!", xpBonus: 15 },
      ],
    },
  },
  "encrypt-enclave": {
    cutsceneChoice: {
      prompt: "The Keybreaker's decryption bots are closing in. What's your encryption strategy?",
      options: [
        { label: "Use multi-layer encryption", response: "Layers of protection — he'll never crack it!", xpBonus: 15 },
        { label: "Deploy a decoy ciphertext", response: "Clever misdirection! The bots will waste time.", xpBonus: 10 },
      ],
    },
  },
  "password-peak": {
    cutsceneChoice: {
      prompt: "The Keybreaker has stolen millions of weak passwords. Your priority?",
      options: [
        { label: "Create unbreakable passphrases", response: "Long and unique — the strongest locks!", xpBonus: 15 },
        { label: "Enable 2FA for everyone", response: "Double security — even stolen passwords can't help him!", xpBonus: 15 },
        { label: "Expose his stolen database", response: "Transparency defeats secrecy!", xpBonus: 10 },
      ],
    },
  },
  "arctic-archive": {
    cutsceneChoice: {
      prompt: "The Keybreaker's bots are targeting backup servers. How do you protect them?",
      options: [
        { label: "Apply the 3-2-1 backup rule", response: "Three copies, two media types, one offsite. Perfect!", xpBonus: 15 },
        { label: "Air-gap the most critical data", response: "No network connection means no remote attack!", xpBonus: 10 },
      ],
    },
  },
  "shadow-station": {
    cutsceneChoice: {
      prompt: "Kids are sharing passwords in online games. How do you help?",
      options: [
        { label: "Show them the risks with examples", response: "Real stories make the best lessons!", xpBonus: 10 },
        { label: "Create a 'trust checklist' tool", response: "A practical tool they can use every time!", xpBonus: 15 },
      ],
    },
  },
  "firewall-fortress": {
    cutsceneChoice: {
      prompt: "The Keybreaker is preparing his final assault. How do you fortify the fortress?",
      options: [
        { label: "Build layered firewall rules", response: "Multiple defence lines — the strongest approach!", xpBonus: 15 },
        { label: "Deploy an intrusion detection system", response: "If he gets past one layer, you'll know instantly!", xpBonus: 10 },
      ],
    },
  },
};

export function getZoneNarrativeChoices(zoneId: string): ZoneNarrativeChoices | null {
  return ZONE_NARRATIVE_CHOICES[zoneId] ?? null;
}
