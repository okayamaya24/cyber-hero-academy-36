/**
 * North America — Continent config for the Adventure Engine.
 *
 * This is the first continent fully migrated to the shared engine.
 * It references existing game content from zoneGames.ts and story scripts
 * from ContinentMapScreen's ALL_ZONE_SCRIPTS (now extracted here).
 */

import { registerContinent } from "@/engine/continentRegistry";
import type { ContinentConfig, ZoneStoryScript, ZoneNarrationDef, DialogueLine } from "@/engine/types";
import { getZoneGames, getBossBattle } from "@/data/zoneGames";
import type { ZoneGameContent, BossBattleContent } from "@/data/zoneGames";
import keybreakerImg from "@/assets/villains/keybreaker.png";

/* ── Zone IDs in order ─────────────────────────────── */
const ZONE_IDS = [
  "hq", "pixel-port", "signal-summit", "code-canyon",
  "encrypt-enclave", "password-peak", "arctic-archive",
  "shadow-station", "firewall-fortress", "boss-keybreaker",
];

/* ── Map intro ─────────────────────────────────────── */
const mapIntro: DialogueLine[] = [
  { speaker: "villain", text: "Heh heh heh… No password can stop me! I've cracked them ALL, Guardian!" },
  { speaker: "guide", text: "Guardian — the Keybreaker has broken into systems across North America." },
  { speaker: "guide", text: "Start at HQ and begin your training. The Digital World is counting on you!" },
];

/* ── Zone story scripts ────────────────────────────── */
const zoneScripts: Record<string, ZoneStoryScript> = {
  hq: {
    xp: 100, badge: "CyberGuardian Recruit",
    intro: [
      { speaker: "guide", text: "Welcome to Cyber Hero Command! This is where every Guardian's journey begins." },
      { speaker: "villain", text: "A training room? While you study, I'll crack every account in the city…" },
      { speaker: "guide", text: "Ignore him. Complete your orientation to unlock your first mission!" },
    ],
    completion: [
      { speaker: "guide", text: "Orientation complete — you're officially a CyberGuardian recruit!" },
      { speaker: "guide", text: "Pixel Port in Los Angeles is now unlocked. Time to deploy!" },
      { speaker: "villain", text: "One city. There are thousands more. Enjoy this tiny victory…" },
    ],
  },
  "pixel-port": {
    xp: 150, badge: "Digital Balance Badge",
    intro: [
      { speaker: "villain", text: "Pixel Port — my favourite hunting ground. These kids have no idea!" },
      { speaker: "guide", text: "Teach them about digital balance and online safety. A healthy Guardian is a powerful one!" },
    ],
    completion: [
      { speaker: "guide", text: "Pixel Port is secure! The kids here know how to balance their digital lives." },
      { speaker: "guide", text: "Digital Balance Badge earned! Signal Summit in Denver is now unlocked." },
    ],
  },
  "signal-summit": {
    xp: 175, badge: "WiFi Watchdog Badge",
    intro: [
      { speaker: "villain", text: "All your WiFi passwords are mine! Every café, every hotel — I own their networks!" },
      { speaker: "guide", text: "Learn to spot safe versus fake networks. Secure the relay stations!" },
    ],
    completion: [
      { speaker: "guide", text: "Signal Summit is clean! The Keybreaker's fake hotspots are destroyed." },
      { speaker: "guide", text: "WiFi Watchdog Badge earned! Code Canyon in Chicago is now open." },
    ],
  },
  "code-canyon": {
    xp: 200, badge: "Scam Spotter Badge",
    intro: [
      { speaker: "villain", text: "Act NOW or your account will be DELETED! Panic makes people careless…" },
      { speaker: "guide", text: "Slow down, think carefully, spot the scam. That's your mission here." },
    ],
    completion: [
      { speaker: "guide", text: "Code Canyon secured! Chicago's residents can now spot a scam anywhere." },
      { speaker: "guide", text: "Scam Spotter Badge earned! Encrypt Enclave in Toronto is now unlocked." },
    ],
  },
  "encrypt-enclave": {
    xp: 225, badge: "Code Breaker Badge",
    intro: [
      { speaker: "villain", text: "Your encryption is useless! I've cracked stronger codes than anything you can build!" },
      { speaker: "guide", text: "Master encryption and prove that strong codes are truly unbreakable!" },
    ],
    completion: [
      { speaker: "guide", text: "Encrypt Enclave is secure! The decryption bots are destroyed." },
      { speaker: "guide", text: "Code Breaker Badge earned! Password Peak in New York is now unlocked." },
    ],
  },
  "password-peak": {
    xp: 250, badge: "Password Master Badge",
    intro: [
      { speaker: "villain", text: "password123… fluffy… mybirthday… Your passwords are embarrassingly easy!" },
      { speaker: "guide", text: "Every strong password you create is a lock he can't pick. Build the fortress!" },
    ],
    completion: [
      { speaker: "guide", text: "Password Peak is ours! The Keybreaker's credential database is destroyed." },
      { speaker: "villain", text: "My passwords… YEARS of work! You'll pay for this, Guardian!" },
      { speaker: "guide", text: "Password Master Badge earned! Arctic Archive is now unlocked." },
    ],
  },
  "arctic-archive": {
    xp: 275, badge: "Data Guardian Badge",
    intro: [
      { speaker: "villain", text: "Cold storage won't save your secrets forever. My bots never get cold…" },
      { speaker: "guide", text: "Learn the 3-2-1 backup rule and protect the Archive!" },
    ],
    completion: [
      { speaker: "guide", text: "Arctic Archive is safe! Every backup is secured." },
      { speaker: "guide", text: "Data Guardian Badge earned! Shadow Station in Mexico City is now open." },
    ],
  },
  "shadow-station": {
    xp: 275, badge: "Game Guardian Badge",
    intro: [
      { speaker: "villain", text: "Want free in-game items? Just give me your password… such a simple trap." },
      { speaker: "guide", text: "Help kids here learn who to trust in online games!" },
    ],
    completion: [
      { speaker: "guide", text: "Shadow Station is clear! The fake gaming networks are shut down." },
      { speaker: "guide", text: "Game Guardian Badge earned! Firewall Fortress in Atlanta is now unlocked." },
    ],
  },
  "firewall-fortress": {
    xp: 300, badge: "Firewall Builder Badge",
    intro: [
      { speaker: "villain", text: "Your firewalls are useless against me! I phase right through them!" },
      { speaker: "guide", text: "Build the strongest firewall you can — then we go after the Keybreaker himself!" },
    ],
    completion: [
      { speaker: "guide", text: "Firewall Fortress is holding! The Keybreaker can't get through anymore." },
      { speaker: "guide", text: "Firewall Builder Badge earned. One zone left — the Keybreaker's Vault!" },
    ],
  },
  "boss-keybreaker": {
    xp: 500, badge: "North America Champion",
    intro: [
      { speaker: "guide", text: "This is it, Guardian. The Keybreaker's Vault — his true stronghold." },
      { speaker: "villain", text: "Welcome to my domain. No one leaves the Vault with their data intact." },
      { speaker: "guide", text: "You've trained for this. Go show him what a true CyberGuardian can do!" },
    ],
    completion: [
      { speaker: "villain", text: "I… I don't believe it. No Guardian has ever defeated me. It's over." },
      { speaker: "guide", text: "GUARDIAN! You did it! North America is free!" },
      { speaker: "guide", text: "North America Champion Badge earned! The Phisher King stirs in Europe…" },
    ],
  },
};

/* ── Zone narrations (cutscene + between-game) ─────── */
const zoneNarrations: Record<string, ZoneNarrationDef> = {
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

/* ── Build zone rewards map ────────────────────────── */
const zoneRewards: Record<string, { xp: number; badge?: string }> = {};
for (const [id, script] of Object.entries(zoneScripts)) {
  zoneRewards[id] = { xp: script.xp, badge: script.badge };
}

/* ── Zone completion dialogue ──────────────────────── */
const zoneCompletionDialogue: Record<string, DialogueLine[]> = {};
for (const [id, script] of Object.entries(zoneScripts)) {
  zoneCompletionDialogue[id] = script.completion;
}

/* ── Collect zone games from existing data ─────────── */
const zoneGames: Record<string, ZoneGameContent> = {};
const bossBattles: Record<string, BossBattleContent> = {};
for (const zoneId of ZONE_IDS) {
  const games = getZoneGames(zoneId);
  if (games) zoneGames[zoneId] = games;
  const boss = getBossBattle(zoneId);
  if (boss) bossBattles[zoneId] = boss;
}

/* ── Register the config ───────────────────────────── */
const northAmericaConfig: ContinentConfig = {
  id: "north-america",
  mapIntro,
  zoneScripts,
  zoneGames,
  bossBattles,
  zoneNarrations,
  villainAsset: { img: keybreakerImg, color: "140, 85%, 50%" },
  villainTaunts: {
    idle: [
      "No password can stop me!",
      "I've cracked them ALL, Guardian!",
      "Your encryption is useless!",
      "Give up now while you can!",
    ],
    dynamic: {
      locked: "Too weak. I broke that instantly.",
      available: "Let's see if you're actually secure.",
      completed: "Hmm… not bad.",
      boss: "You'll never break my code!",
    },
  },
  zoneRewards,
  zoneCompletionDialogue,
};

registerContinent(northAmericaConfig);

export default northAmericaConfig;
