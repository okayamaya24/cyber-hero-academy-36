/**
 * North America — short episodes for all zones except HQ, Password Peak, and Boss.
 */

import type { EpisodeData } from "@/components/zone/EpisodePlayer";

/* ── PIXEL PORT — Los Angeles ─────────────────────────────
   Topic: Spotting scams and fake offers online
   Mini-game: scam-spotter (ScamSorter)
──────────────────────────────────────────────────────── */
export const pixelPortEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Pixel Port — Los Angeles, USA",
  zoneIcon:     "🎬",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Los Angeles — city of screens. The more time kids spend online without thinking, the more doors they leave open. And I love an open door.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "The Keybreaker is flooding Pixel Port with fake offers and scam links. They look real — but they're traps! Simple rule: if it's TOO good to be true, it's a scam. Ready to test it?",
      miniGameId:          "scam-spotter",
      miniGameTitle:       "Scam Spotter",
      miniGameDescription: "Sort the real offers from the sneaky scams. The Keybreaker made some look VERY convincing — don't be fooled!",
      nextSceneId:         "s2",
    },
    s2: {
      id: "s2", speaker: "villain",
      text: "You think you can outsmart ALL my fake offers?! I have THOUSANDS more. Pixel Port isn't safe yet…",
      choices: [
        { label: "We'll keep fighting — one scam at a time!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We'll protect this city together.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Pixel Port is scam-free! The people of LA know exactly what to look for now.",
      isEnding: true, endingType: "victory-a", xpReward: 150, badge: "Scam Spotter Badge",
      completionMessage: "Impossible! They spotted EVERY trap! Fine… Denver is next, and my WiFi tricks are FAR more subtle.",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "Together you cleared Pixel Port! The Keybreaker's scam network is down.",
      isEnding: true, endingType: "victory-b", xpReward: 150, badge: "Scam Spotter Badge",
      completionMessage: "You won THIS battle. Signal Summit in Denver is mine — no one can resist a free WiFi network!",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "The tricky ones copy real brand names exactly. Look for spelling mistakes in the URL and deals that sound way too good. Try again?",
      isEnding: true, endingType: "defeat", retrySceneId: "s1",
      completionMessage: "Check the web address carefully — one wrong letter means fake!",
    },
  },
};

/* ── SIGNAL SUMMIT — Denver ───────────────────────────────
   Topic: Safe WiFi networks vs fake hotspots
   Mini-game: shield-dodge (ShieldDodge)
──────────────────────────────────────────────────────── */
export const signalSummitEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Signal Summit — Denver, USA",
  zoneIcon:     "📡",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Every café, hotel, airport in Denver — I control their WiFi. The moment someone connects to 'FREE_WIFI_DENVER', everything they type is MINE.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Never use public WiFi for anything private. When in doubt — use your phone's data instead. The Keybreaker's bots are attacking! Use your shield!",
      miniGameId:          "shield-dodge",
      miniGameTitle:       "Signal Shield",
      miniGameDescription: "The Keybreaker's WiFi attacks are incoming! Dodge the fake signals and block the data thieves before they steal your connection.",
      nextSceneId:         "s2",
    },
    s2: {
      id: "s2", speaker: "villain",
      text: "My fake hotspots… destroyed?! HOW?! Fine — Code Canyon in Chicago is next. Panic makes people click anything. ANYTHING.",
      choices: [
        { label: "Denver is safe — on to Chicago!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We protect every city together.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Signal Summit secured! Every fake hotspot in Denver is destroyed.",
      isEnding: true, endingType: "victory-a", xpReward: 175, badge: "WiFi Watchdog Badge",
      completionMessage: "My beautiful fake networks… gone. Code Canyon is FULL of panicking people. I'll be waiting.",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "The summit is clear! Together you blocked every fake signal the Keybreaker sent.",
      isEnding: true, endingType: "victory-b", xpReward: 175, badge: "WiFi Watchdog Badge",
      completionMessage: "Code Canyon in Chicago is next — and fear is my favourite weapon.",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "Dodge left and right to avoid attacks, and block when the shield symbol flashes. Stay sharp! Try again?",
      isEnding: true, endingType: "defeat", retrySceneId: "s1",
      completionMessage: "The timing gets easier once you spot the pattern!",
    },
  },
};

/* ── CODE CANYON — Chicago ────────────────────────────────
   Topic: Urgent scams, fake alerts, emotional manipulation
   Mini-game: scam-spotter (ScamSorter)
──────────────────────────────────────────────────────── */
export const codeCanyonEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Code Canyon — Chicago, USA",
  zoneIcon:     "⚡",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "ACT NOW or your account gets DELETED IN 5 MINUTES! Ha — scared people don't stop to think. They just click.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Golden rule: SLOW DOWN. Real emergencies don't happen through pop-ups. If an alert makes you panic — that's the trap. Ready to filter them out?",
      miniGameId:          "scam-spotter",
      miniGameTitle:       "Panic Filter",
      miniGameDescription: "The Keybreaker is sending fake urgent alerts! Sort the real warnings from his panic traps before people click the wrong thing.",
      nextSceneId:         "s2",
    },
    s2: {
      id: "s2", speaker: "villain",
      text: "You SLOWED DOWN?! Nobody is supposed to slow down and THINK! Ugh. Fine. Toronto's encryption is next.",
      choices: [
        { label: "Chicago stays calm — we move on!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We'll tackle every trick together.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Code Canyon is clear! Chicago's citizens know the panic trick now — everyone stopped and thought before clicking.",
      isEnding: true, endingType: "victory-a", xpReward: 200, badge: "Scam Spotter Badge",
      completionMessage: "They… THOUGHT about it. Impossible! Encrypt Enclave in Toronto better hold up…",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "Together you broke the panic trap! When the Keybreaker tries urgency — nobody bites.",
      isEnding: true, endingType: "victory-b", xpReward: 200, badge: "Scam Spotter Badge",
      completionMessage: "Teamwork defeated my panic weapon. I'll need a more sophisticated plan for Toronto…",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "The tricky ones add a real company's logo — but logos can be copied. Always check the actual web address. Give it another go!",
      isEnding: true, endingType: "defeat", retrySceneId: "s1",
      completionMessage: "Look past the logo — check the URL. You've got this!",
    },
  },
};

/* ── ENCRYPT ENCLAVE — Toronto ────────────────────────────
   Topic: Encryption, 2FA, keeping data private
   Mini-game: who-do-you-trust (WhoDoYouTrust)
──────────────────────────────────────────────────────── */
export const encryptEnclaveEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Encrypt Enclave — Toronto, Canada",
  zoneIcon:     "🔒",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Toronto — the tech capital. Everyone thinks their data is 'encrypted'. Ha! A password alone means nothing to me. One layer is NEVER enough.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "A password alone isn't enough! We need TWO locks — that's 2FA. First your password, then a code sent to your phone. Even if the Keybreaker steals the password, he can't get in without your phone! Spot the real secure sites from his fakes!",
      miniGameId:          "who-do-you-trust",
      miniGameTitle:       "Double Lock",
      miniGameDescription: "The Keybreaker built fake 2FA screens to trick you into giving him BOTH your password AND your code. Spot the real login pages!",
      nextSceneId:         "s2",
    },
    s2: {
      id: "s2", speaker: "villain",
      text: "TWO layers?! That's actually annoying. Arctic Archive in Vancouver stores backup data — and data without a backup is data I can DELETE FOREVER.",
      choices: [
        { label: "Two locks beat you every time!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We'll double-lock everything together.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Encrypt Enclave secured! The Keybreaker can steal a password — but he can't steal a phone at the same time.",
      isEnding: true, endingType: "victory-a", xpReward: 225, badge: "Code Breaker Badge",
      completionMessage: "Two factors… I hate two factors. Arctic Archive is my next target. No backup = I can destroy data forever!",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "Double protection activated! Toronto is a two-lock fortress now.",
      isEnding: true, endingType: "victory-b", xpReward: 225, badge: "Code Breaker Badge",
      completionMessage: "Fine. TWO factors beats me here. I'll go after the backups in Vancouver!",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "The Keybreaker copies the exact look of real sites. Check the padlock AND the URL spelling — one wrong letter means it's fake. Try again!",
      isEnding: true, endingType: "defeat", retrySceneId: "s1",
      completionMessage: "Padlock + URL spelling. You've almost got it!",
    },
  },
};

/* ── ARCTIC ARCHIVE — Vancouver ───────────────────────────
   Topic: Data backups, 3-2-1 rule
   Mini-game: strong-or-smash (StrongOrSmash)
──────────────────────────────────────────────────────── */
export const arcticArchiveEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Arctic Archive — Vancouver, Canada",
  zoneIcon:     "🧊",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Vancouver's Arctic Archive — cold storage for everyone's most important files. Photos, schoolwork, memories. If I delete them here… they're gone FOREVER.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "The 3-2-1 rule: THREE copies, TWO storage types, ONE copy somewhere else. Like spare keys — you need them before disaster strikes. Which backup systems are STRONG? Which will SMASH?",
      miniGameId:          "strong-or-smash",
      miniGameTitle:       "Backup or Bust",
      miniGameDescription: "The Keybreaker is targeting backup systems! Decide FAST — is each setup STRONG enough or dangerously WEAK?",
      nextSceneId:         "s2",
    },
    s2: {
      id: "s2", speaker: "villain",
      text: "Three copies?! I can't delete THREE COPIES at once! This is completely unfair. Fine. Shadow Station in Mexico City — gamers there trust everyone online…",
      choices: [
        { label: "3-2-1 rule — the Archive is safe!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We protect data together!", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Arctic Archive protected! The Keybreaker can't destroy what he can't reach — and he can't destroy three copies at once.",
      isEnding: true, endingType: "victory-a", xpReward: 275, badge: "Data Guardian Badge",
      completionMessage: "Three copies! Outrageous. On to Shadow Station — gamers trust everyone. Especially people offering free in-game items…",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "The Archive is frozen solid and totally safe! No attack can wipe something that exists in three places at once.",
      isEnding: true, endingType: "victory-b", xpReward: 275, badge: "Data Guardian Badge",
      completionMessage: "Triple backup! Shadow Station's gamers will be easier targets. They're always looking for free stuff…",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "One copy on the same device doesn't count — that gets deleted too! Look for setups with copies in DIFFERENT places. Try again?",
      isEnding: true, endingType: "defeat", retrySceneId: "s1",
      completionMessage: "Multiple locations is the key. One device = one point of failure!",
    },
  },
};

/* ── SHADOW STATION — Mexico City ─────────────────────────
   Topic: Online gaming safety, who to trust
   Mini-game: who-do-you-trust (WhoDoYouTrust)
──────────────────────────────────────────────────────── */
export const shadowStationEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Shadow Station — Mexico City, Mexico",
  zoneIcon:     "🎮",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "'Want free in-game coins? Just click here!' Children are SO trusting in games. It's almost too easy.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Real players NEVER need your password to give you something. Real game admins NEVER ask for passwords in chat. Too good an offer = a trap. Who can you actually trust?",
      miniGameId:          "who-do-you-trust",
      miniGameTitle:       "Gamer's Guard",
      miniGameDescription: "The Keybreaker is hiding among the players! Spot the safe sites from his fake accounts — don't give up your login details for ANY offer.",
      nextSceneId:         "s2",
    },
    s2: {
      id: "s2", speaker: "villain",
      text: "You didn't fall for ANY of my offers?! Even the LEGENDARY rare weapon?! Ugh. Firewall Fortress in Atlanta is my last stronghold.",
      choices: [
        { label: "Shadow Station is safe — bring on Atlanta!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We watch out for each other online.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Shadow Station secured! Every gamer here knows — no password sharing, no matter how good the offer sounds.",
      isEnding: true, endingType: "victory-a", xpReward: 275, badge: "Game Guardian Badge",
      completionMessage: "They didn't even want the LEGENDARY ITEM! Firewall Fortress is my last defence before my vault…",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "The station is clear! Looking out for each other online is one of the best things gamers can do.",
      isEnding: true, endingType: "victory-b", xpReward: 275, badge: "Game Guardian Badge",
      completionMessage: "Teamwork in a game defeated me?! Firewall Fortress is all that stands between you and my vault now.",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "Real game admins NEVER ask for passwords in chat — ever. If they do, it's always fake. Try again!",
      isEnding: true, endingType: "defeat", retrySceneId: "s1",
      completionMessage: "Real admins never ask for passwords in chat. You've got this!",
    },
  },
};

/* ── FIREWALL FORTRESS — Atlanta ──────────────────────────
   Topic: Firewalls, device security, software updates
   Mini-game: shield-dodge (ShieldDodge)
──────────────────────────────────────────────────────── */
export const firewallFortressEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Firewall Fortress — Atlanta, USA",
  zoneIcon:     "🔥",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "A firewall is like a guard at a door… but guards get tired. And outdated software? That's a door left WIDE open for me.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Three rules: firewall ON, update immediately, never download from unknown sites. The Keybreaker is throwing everything at the fortress — use your shield to keep him out!",
      miniGameId:          "shield-dodge",
      miniGameTitle:       "Fortress Defense",
      miniGameDescription: "The Keybreaker is launching his final assault! Block every attack wave before he finds a gap in the firewall. This is the last line of defence before his vault!",
      nextSceneId:         "s2",
    },
    s2: {
      id: "s2", speaker: "villain",
      text: "My fortress… You blocked EVERY attack? No gaps?! Then there's only one thing left — my vault. Face me there if you DARE.",
      choices: [
        { label: "The vault is next — bring it on!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We'll face him together!", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Firewall Fortress is OURS! The Keybreaker's last stronghold has fallen. The path to the final battle is open.",
      isEnding: true, endingType: "victory-a", xpReward: 300, badge: "Firewall Builder Badge",
      completionMessage: "My fortress… fallen. Come face me in my vault, Guardian — if you're brave enough.",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "Together you broke through! One last zone stands between you and the Keybreaker's defeat.",
      isEnding: true, endingType: "victory-b", xpReward: 300, badge: "Firewall Builder Badge",
      completionMessage: "Everything is gone except my vault. Come find me there. This ends in the vault.",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "Block first, then dodge — find the rhythm and you'll clear it. The shield is your friend! Try again?",
      isEnding: true, endingType: "defeat", retrySceneId: "s1",
      completionMessage: "Block first, dodge second — find the rhythm!",
    },
  },
};
