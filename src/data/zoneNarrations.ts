/** Story narrations for zone cutscene intros and between-game panels */

interface ZoneNarration {
  intro: string;
  afterGame: string[];
  villainTaunts: string[]; // progressively angrier
}

const DEFAULT_NARRATION: ZoneNarration = {
  intro: "A new threat has been detected in this sector. Guardian, your mission starts now!",
  afterGame: [
    "Great work! You cracked through the first layer of defences.",
    "The villain's grip is weakening. Keep pushing!",
    "Almost there — one more challenge to go!",
  ],
  villainTaunts: [
    "You got lucky!",
    "Don't think you can beat me!",
    "This can't be happening!",
    "FINE! You win... for now!",
  ],
};

export const ZONE_NARRATIONS: Record<string, ZoneNarration> = {
  hq: {
    intro: "Welcome to Cyber Hero Command, Guardian! Time to learn the basics of digital defence.",
    afterGame: [
      "Good start! You're learning the ropes.",
      "Your training is progressing well!",
      "Almost certified! One final test remains.",
    ],
    villainTaunts: ["A new recruit? How cute!", "You won't last long!", "Beginners always fail!", "Fine, you passed... barely!"],
  },
  "password-peak": {
    intro: "The Keybreaker has stolen the city's passwords. You must break through to recover them!",
    afterGame: [
      "You cracked the first lock! The Keybreaker is getting nervous...",
      "Another password recovered! The vault's defences are crumbling.",
      "One last encryption stands between you and victory!",
    ],
    villainTaunts: ["Those passwords were weak anyway!", "You can't crack my BEST ones!", "HOW are you doing this?!", "My keys... NO!"],
  },
  "encrypt-enclave": {
    intro: "Secret data is being transmitted unprotected. Encrypt it before the Keybreaker intercepts!",
    afterGame: [
      "First data stream encrypted! The enemy can't read it now.",
      "Your encryption skills are growing stronger!",
      "Just one more channel to secure!",
    ],
    villainTaunts: ["Encryption? I'll break it!", "My decryption tools are superior!", "Wait... I can't read this?!", "Impossible!"],
  },
  "code-canyon": {
    intro: "Corrupted code is spreading through the network. Debug it before it's too late!",
    afterGame: [
      "First bug squashed! The system is stabilizing.",
      "More clean code restored. You're a natural!",
      "Almost done — one last corrupted module!",
    ],
    villainTaunts: ["My bugs are everywhere!", "You missed one! Oh wait...", "Stop fixing everything!", "My beautiful bugs!"],
  },
  "signal-summit": {
    intro: "The mountain's communication tower is under attack. Restore the secure signal!",
    afterGame: [
      "Signal partially restored! The network is coming back online.",
      "Interference clearing up. Great work, Guardian!",
      "One final frequency to secure!",
    ],
    villainTaunts: ["I'll jam all your signals!", "Static is all you'll hear!", "The signal... it's getting through?!", "NO! My jammers!"],
  },
  "arctic-archive": {
    intro: "Critical backup data is at risk in the Arctic servers. Protect it from deletion!",
    afterGame: [
      "First backup secured! The data is safe.",
      "Another archive protected. The Keybreaker can't touch it now!",
      "One last server to lock down!",
    ],
    villainTaunts: ["I'll delete everything!", "Your backups are mine!", "How do you keep saving them?!", "My deletion malware... failed!"],
  },
  "pixel-port": {
    intro: "Social media accounts across LA are being hijacked. Stop the takeover!",
    afterGame: [
      "First account recovered! The users are safe.",
      "More profiles restored. You're a social media hero!",
      "One last platform to secure!",
    ],
    villainTaunts: ["Those accounts are mine!", "I'll post as whoever I want!", "Stop recovering them!", "All my fake accounts... gone!"],
  },
  "shadow-station": {
    intro: "Malware has infected the station's systems. Identify and quarantine the threats!",
    afterGame: [
      "First malware quarantined! The system is safer already.",
      "More threats neutralized. You're cleaning house!",
      "One last virus hiding in the shadows!",
    ],
    villainTaunts: ["My malware is undetectable!", "You'll never find them all!", "How did you spot that one?!", "All quarantined?! No!"],
  },
  "firewall-fortress": {
    intro: "The firewall defences need reinforcing. Build stronger barriers against intrusion!",
    afterGame: [
      "First firewall layer strengthened!",
      "Defences are holding strong. Keep building!",
      "One final wall to reinforce!",
    ],
    villainTaunts: ["I'll break through!", "Firewalls can't stop me!", "Why... won't... it... break?!", "These walls are too strong!"],
  },
};

export function getZoneNarration(zoneId: string): ZoneNarration {
  return ZONE_NARRATIONS[zoneId] || DEFAULT_NARRATION;
}
