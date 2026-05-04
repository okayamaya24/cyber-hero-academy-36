/**
 * North America — short episodes for all zones except HQ, Password Peak, and Boss.
 * Each episode: villain sets stakes → Byte teaches → 1 mini-game → win/lose screen.
 * Mini-games use real implemented games wherever they fit the topic.
 */

import type { EpisodeData } from "@/components/zone/EpisodePlayer";

/* ─────────────────────────────────────────────────────────────
   PIXEL PORT — Los Angeles
   Topic: Spotting scams and fake offers online
   Mini-game: scam-spotter (ScamSorter — real game)
───────────────────────────────────────────────────────────── */
export const pixelPortEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Pixel Port — Los Angeles, USA",
  zoneIcon:     "🎬",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Los Angeles — city of stars, city of SCREENS. The more time kids spend online without thinking, the more doors they leave open for me. And I love an open door.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Guardian — the Keybreaker is flooding Pixel Port with fake offers and scam links. They look real, but they're traps! We need to teach people here to spot the difference — fast.",
      nextSceneId: "s2",
    },
    s2: {
      id: "s2", speaker: "guide",
      text: "Here's the rule: if something online seems TOO good to be true — free games, prizes, celebrity giveaways — it's almost always a scam. Real companies don't need you to click a suspicious link to win something. Ready to test it?",
      miniGameId:          "scam-spotter",
      miniGameTitle:       "Scam Spotter",
      miniGameDescription: "Sort the real offers from the sneaky scams. The Keybreaker made some of them look VERY convincing — don't be fooled!",
      nextSceneId:         "s3",
    },
    s3: {
      id: "s3", speaker: "villain",
      text: "You think you can outsmart ALL my fake offers?! I have THOUSANDS more where those came from. Pixel Port isn't safe yet, Guardian…",
      choices: [
        { label: "We'll keep fighting — one scam at a time!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We'll protect this city together.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Pixel Port is scam-free! The Keybreaker's fake offers are all flagged. The people of LA know exactly what to look for now.",
      isEnding: true, endingType: "victory-a", xpReward: 150, badge: "Scam Spotter Badge",
      completionMessage: "Impossible! They spotted EVERY one of my traps! Fine… Denver is next, and my WiFi tricks are FAR more subtle.",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "Together you cleared Pixel Port! The Keybreaker's scam network is down. LA is safe — and now everyone here knows how to spot a fake.",
      isEnding: true, endingType: "victory-b", xpReward: 150, badge: "Scam Spotter Badge",
      completionMessage: "You won THIS battle. But Signal Summit in Denver is mine — no one can resist a free WiFi network!",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "Almost! The tricky ones are scams that copy real brand names exactly. Look for spelling mistakes in the URL and deals that sound way too good. Try again?",
      isEnding: true, endingType: "defeat", retrySceneId: "s2",
      completionMessage: "So close! The sneaky ones copy real brands. Check the web address carefully.",
    },
  },
};

/* ─────────────────────────────────────────────────────────────
   SIGNAL SUMMIT — Denver
   Topic: Safe WiFi networks vs fake hotspots
   Mini-game: shield-dodge (ShieldDodge — real game)
───────────────────────────────────────────────────────────── */
export const signalSummitEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Signal Summit — Denver, USA",
  zoneIcon:     "📡",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Every café, every hotel, every airport in Denver — I control their WiFi networks. The moment someone connects to 'FREE_WIFI_DENVER', everything they type is mine.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Guardian — the Keybreaker set up FAKE WiFi hotspots all over Denver. They look like real public WiFi, but they capture everything you send. Bank details, passwords, messages — all of it.",
      nextSceneId: "s2",
    },
    s2: {
      id: "s2", speaker: "guide",
      text: "The rules for safe WiFi: never use public WiFi for anything private. Look for the padlock icon. When in doubt, use your phone's data instead. The Keybreaker's bots are attacking — use your shield!",
      miniGameId:          "shield-dodge",
      miniGameTitle:       "Signal Shield",
      miniGameDescription: "The Keybreaker's WiFi attacks are incoming! Dodge the fake signals and block the data thieves before they steal your connection.",
      nextSceneId:         "s3",
    },
    s3: {
      id: "s3", speaker: "villain",
      text: "My fake hotspots… destroyed?! HOW?! Fine — I still have Code Canyon in Chicago. Panic makes people click anything, Guardian. ANYTHING.",
      choices: [
        { label: "Denver is safe — on to Chicago!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We protect every city together.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Signal Summit secured! Every fake hotspot in Denver is destroyed. The Keybreaker can't intercept another byte of data here.",
      isEnding: true, endingType: "victory-a", xpReward: 175, badge: "WiFi Watchdog Badge",
      completionMessage: "My beautiful fake networks… gone. But Code Canyon is FULL of panicking people clicking scary messages. I'll be waiting.",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "The summit is clear! Working together you blocked every fake signal the Keybreaker sent. Denver's connections are safe and private.",
      isEnding: true, endingType: "victory-b", xpReward: 175, badge: "WiFi Watchdog Badge",
      completionMessage: "This isn't over. Code Canyon in Chicago is next — and fear is my favourite weapon.",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "Almost there! Remember — dodge left and right to avoid the attacks, and block when the shield symbol flashes. The Keybreaker speeds up, so stay sharp. Try again?",
      isEnding: true, endingType: "defeat", retrySceneId: "s2",
      completionMessage: "Keep going — the timing gets easier once you spot the pattern!",
    },
  },
};

/* ─────────────────────────────────────────────────────────────
   CODE CANYON — Chicago
   Topic: Urgent scams, fake alerts, emotional manipulation
   Mini-game: scam-spotter (ScamSorter — real game)
───────────────────────────────────────────────────────────── */
export const codeCanyonEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Code Canyon — Chicago, USA",
  zoneIcon:     "⚡",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "ACT NOW or your account gets DELETED IN 5 MINUTES! Ha — panic is the most powerful weapon I have. Scared people don't stop to think. They just click.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Guardian — the Keybreaker is flooding Chicago with fake urgent alerts. 'Your account is hacked!' 'You've won a prize!' 'Act immediately!' They're designed to make you panic and click without thinking.",
      nextSceneId: "s2",
    },
    s2: {
      id: "s2", speaker: "guide",
      text: "The golden rule: SLOW DOWN. Real emergencies don't happen through pop-ups. If an alert makes you panic — that's the trap. Take a breath. Check the source. Never click a scary link without verifying it first.",
      miniGameId:          "scam-spotter",
      miniGameTitle:       "Panic Filter",
      miniGameDescription: "The Keybreaker is sending fake urgent alerts! Sort the real warnings from his panic traps before people click the wrong thing.",
      nextSceneId:         "s3",
    },
    s3: {
      id: "s3", speaker: "villain",
      text: "You SLOWED DOWN?! That's cheating! Nobody is supposed to slow down and THINK! Ugh. Fine. Toronto's encryption secrets are next — and code is harder to crack than panic.",
      choices: [
        { label: "Chicago stays calm — we move on!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We'll tackle every trick together.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Code Canyon is clear! Chicago's citizens know the panic trick now. The Keybreaker's urgent alerts aren't working anymore — because everyone stopped and thought before clicking.",
      isEnding: true, endingType: "victory-a", xpReward: 200, badge: "Scam Spotter Badge",
      completionMessage: "They… thought about it. Impossible! My best weapon, ruined. Encrypt Enclave in Toronto better hold up…",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "Together you broke the panic trap! The whole city knows to slow down now. When the Keybreaker tries the urgent trick — nobody bites.",
      isEnding: true, endingType: "victory-b", xpReward: 200, badge: "Scam Spotter Badge",
      completionMessage: "Teamwork defeated my panic weapon. Fine. I'll need a more sophisticated plan for Toronto…",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "The tricky ones add a real company's logo to make them look official. Always check the actual web address — logos can be copied, URLs can't be faked as easily. Give it another go!",
      isEnding: true, endingType: "defeat", retrySceneId: "s2",
      completionMessage: "Look past the logo — check the URL. You've got this!",
    },
  },
};

/* ─────────────────────────────────────────────────────────────
   ENCRYPT ENCLAVE — Toronto
   Topic: Encryption, 2FA, keeping data private
   Mini-game: who-do-you-trust (WhoDoYouTrust — real game)
───────────────────────────────────────────────────────────── */
export const encryptEnclaveEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Encrypt Enclave — Toronto, Canada",
  zoneIcon:     "🔒",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Toronto — the tech capital. Everyone here thinks their data is 'encrypted'. Ha! A password alone means nothing to me. One layer is never enough.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Guardian — the Keybreaker is right about one thing. A password on its own isn't enough anymore. We need TWO locks, not one. That's what 2FA means — two-factor authentication.",
      nextSceneId: "s2",
    },
    s2: {
      id: "s2", speaker: "guide",
      text: "2FA works like this: first you enter your password, then a secret code is sent to your phone. Even if the Keybreaker steals your password, he can't get in without your phone too. It's like a lock with TWO keys. Now — can you spot the real secure sites from his fakes?",
      miniGameId:          "who-do-you-trust",
      miniGameTitle:       "Double Lock",
      miniGameDescription: "The Keybreaker built fake 2FA screens to trick you into giving him BOTH your password AND your code. Spot the real login pages — don't fall for the doubles!",
      nextSceneId:         "s3",
    },
    s3: {
      id: "s3", speaker: "villain",
      text: "TWO layers?! That's… actually annoying. Fine. But Arctic Archive in Vancouver stores backup data — and data without a backup is data I can DELETE FOREVER.",
      choices: [
        { label: "Two locks beat you every time!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We'll double-lock everything together.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Encrypt Enclave secured! Toronto's accounts now have two layers of protection. The Keybreaker can steal a password — but he can't steal a phone at the same time.",
      isEnding: true, endingType: "victory-a", xpReward: 225, badge: "Code Breaker Badge",
      completionMessage: "Two factors… I hate two factors. Arctic Archive is my next target. No backup means I can destroy data forever!",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "Double protection activated! Working together you turned Toronto into a two-lock fortress. The Keybreaker needs more than a stolen password to break in now.",
      isEnding: true, endingType: "victory-b", xpReward: 225, badge: "Code Breaker Badge",
      completionMessage: "Fine. TWO factors beats me here. I'll go after the backups in Vancouver — no backup means permanent damage!",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "Sneaky! The Keybreaker copies the exact look of real sites. Check for the padlock in the address bar and look very carefully at the URL spelling. One wrong letter means it's fake. Try again!",
      isEnding: true, endingType: "defeat", retrySceneId: "s2",
      completionMessage: "Look at the padlock AND the URL spelling. You've almost got it!",
    },
  },
};

/* ─────────────────────────────────────────────────────────────
   ARCTIC ARCHIVE — Vancouver
   Topic: Data backups, 3-2-1 rule, protecting important files
   Mini-game: strong-or-smash (StrongOrSmash — real game, themed as backup check)
───────────────────────────────────────────────────────────── */
export const arcticArchiveEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Arctic Archive — Vancouver, Canada",
  zoneIcon:     "🧊",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Vancouver's Arctic Archive — the cold storage for everyone's most important files. Photos, schoolwork, memories. If I delete them here… they're gone FOREVER. No second chances.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Guardian — the 3-2-1 backup rule is the only thing standing between us and permanent data loss. Three copies of your data. Two different storage types. One copy stored somewhere else — like the cloud or a family member's house.",
      nextSceneId: "s2",
    },
    s2: {
      id: "s2", speaker: "guide",
      text: "Think of backups like spare keys — you never know you need them until you do. The Keybreaker is testing each storage system — we need to identify which ones are STRONG enough to survive his attacks and which ones will SMASH!",
      miniGameId:          "strong-or-smash",
      miniGameTitle:       "Backup or Bust",
      miniGameDescription: "The Keybreaker is targeting backup systems! Decide FAST — is each storage setup strong enough (STRONG) or dangerously weak (SMASH)?",
      nextSceneId:         "s3",
    },
    s3: {
      id: "s3", speaker: "villain",
      text: "Three copies?! I can't delete THREE COPIES at once! This is completely unfair. Fine. Shadow Station in Mexico City is full of gamers who trust everyone online…",
      choices: [
        { label: "3-2-1 rule — the Archive is safe!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We protect data together!", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Arctic Archive protected! Every file has three copies now. The Keybreaker can't destroy what he can't reach — and he definitely can't destroy three copies at once.",
      isEnding: true, endingType: "victory-a", xpReward: 275, badge: "Data Guardian Badge",
      completionMessage: "Three copies! This is an outrage. On to Shadow Station — gamers there trust everyone. Especially people offering free in-game items…",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "The Archive is frozen solid and totally safe! Together you set up the perfect backup system. No attack can wipe something that exists in three places at once.",
      isEnding: true, endingType: "victory-b", xpReward: 275, badge: "Data Guardian Badge",
      completionMessage: "Triple backup! I can't compete with that. Shadow Station's gamers will be easier targets. They're always looking for free stuff…",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "Remember: one copy on the same device doesn't count — that gets deleted too! Look for setups that have copies in multiple DIFFERENT places. Try again?",
      isEnding: true, endingType: "defeat", retrySceneId: "s2",
      completionMessage: "Multiple locations is the key. One device = one point of failure!",
    },
  },
};

/* ─────────────────────────────────────────────────────────────
   SHADOW STATION — Mexico City
   Topic: Online gaming safety, who to trust, in-game scams
   Mini-game: who-do-you-trust (WhoDoYouTrust — real game)
───────────────────────────────────────────────────────────── */
export const shadowStationEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Shadow Station — Mexico City, Mexico",
  zoneIcon:     "🎮",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Shadow Station — where the gamers live. 'Want free in-game coins? Just click here!' 'I'll trade you a rare item for your login!' Children are SO trusting in games. It's almost too easy.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Guardian — the Keybreaker is pretending to be other players online, offering free items and cheats in exchange for account details. No real player ever needs your password to give you something. Not ever.",
      nextSceneId: "s2",
    },
    s2: {
      id: "s2", speaker: "guide",
      text: "The rules: never share your password with ANYONE in a game — not even someone who says they're a game admin. Game companies never ask for passwords through chat. If someone offers something that sounds too good — it's a trap. Can you spot who's really safe to trust?",
      miniGameId:          "who-do-you-trust",
      miniGameTitle:       "Gamer's Guard",
      miniGameDescription: "The Keybreaker is hiding among the players! Spot the safe players from his fake accounts — don't give up your login details for ANY offer.",
      nextSceneId:         "s3",
    },
    s3: {
      id: "s3", speaker: "villain",
      text: "You didn't fall for ANY of my free item offers?! Even the legendary rare weapon?! Ugh. Fine. Firewall Fortress in Atlanta is my last stronghold before my vault. You'll never break through there.",
      choices: [
        { label: "Shadow Station is safe — bring on Atlanta!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We watch out for each other online.", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Shadow Station secured! Every gamer here knows the rules now — no password sharing, no matter how good the offer sounds. The Keybreaker lost his favourite hunting ground.",
      isEnding: true, endingType: "victory-a", xpReward: 275, badge: "Game Guardian Badge",
      completionMessage: "They didn't even want the LEGENDARY ITEM! I can't believe it. Firewall Fortress is my last defence before my vault…",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "The station is clear! Together you made every player here a little more careful. Looking out for each other online is one of the best things gamers can do.",
      isEnding: true, endingType: "victory-b", xpReward: 275, badge: "Game Guardian Badge",
      completionMessage: "Teamwork in a game defeated me?! Fine. Firewall Fortress is all that stands between you and my vault now.",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "The trickiest ones are fake game admin accounts — they look official. Remember: real game admins NEVER ask for your password through chat. If they do, it's always fake. Try again!",
      isEnding: true, endingType: "defeat", retrySceneId: "s2",
      completionMessage: "Real admins never ask for passwords in chat — ever. You've got this!",
    },
  },
};

/* ─────────────────────────────────────────────────────────────
   FIREWALL FORTRESS — Atlanta
   Topic: Firewalls, device security, software updates
   Mini-game: shield-dodge (ShieldDodge — real game)
───────────────────────────────────────────────────────────── */
export const firewallFortressEpisode: EpisodeData = {
  villainName:  "The Keybreaker",
  zoneName:     "Firewall Fortress — Atlanta, USA",
  zoneIcon:     "🔥",
  startSceneId: "s0",
  scenes: {
    s0: {
      id: "s0", speaker: "villain",
      text: "Firewall Fortress — the last thing standing between me and my vault. A firewall is like a guard at a door… but guards get tired. Guards miss things. And outdated software? That's a door left WIDE open.",
      nextSceneId: "s1",
    },
    s1: {
      id: "s1", speaker: "guide",
      text: "Guardian — a firewall is your device's security guard. It watches everything trying to get in and blocks the dangerous stuff. But it only works if you keep it updated. Old software has holes hackers already know about.",
      nextSceneId: "s2",
    },
    s2: {
      id: "s2", speaker: "guide",
      text: "Three rules for device security: keep your firewall ON, install updates as soon as they arrive, and never download software from sites you don't know. The Keybreaker is throwing everything at the fortress — use your shield to keep him out!",
      miniGameId:          "shield-dodge",
      miniGameTitle:       "Fortress Defense",
      miniGameDescription: "The Keybreaker is launching his final assault on the fortress! Block every attack wave before he finds a gap in the firewall. This is the last line of defence before his vault!",
      nextSceneId:         "s3",
    },
    s3: {
      id: "s3", speaker: "villain",
      text: "My… my fortress. You blocked EVERY attack? No gaps?! Then there's only one thing left — my vault. Face me there if you dare, Guardian. The Keybreaker's final battle awaits.",
      choices: [
        { label: "The vault is next — bring it on!", nextSceneId: "victory_a", xpBonus: 25 },
        { label: "We'll face him together!", nextSceneId: "victory_b", xpBonus: 15 },
      ],
    },
    victory_a: {
      id: "victory_a", speaker: "guide",
      text: "Firewall Fortress is OURS! The Keybreaker's last stronghold before his vault has fallen. Atlanta is secure — and the path to the final battle is open.",
      isEnding: true, endingType: "victory-a", xpReward: 300, badge: "Firewall Builder Badge",
      completionMessage: "My fortress… fallen. There's nowhere left to hide except my vault. Come face me there, Guardian — if you're brave enough.",
    },
    victory_b: {
      id: "victory_b", speaker: "guide",
      text: "Together you broke through! The fortress is secure and Atlanta's devices are protected. One last zone stands between you and the Keybreaker's defeat — his vault.",
      isEnding: true, endingType: "victory-b", xpReward: 300, badge: "Firewall Builder Badge",
      completionMessage: "Fine. Everything is gone except my vault. Come find me there, Guardian. This ends in the vault.",
    },
    defeat: {
      id: "defeat", speaker: "guide",
      text: "The attacks come faster each wave — watch for the pattern before diving in. Block first, then dodge. The shield is your friend! Try again?",
      isEnding: true, endingType: "defeat", retrySceneId: "s2",
      completionMessage: "Block first, dodge second — find the rhythm and you'll clear it!",
    },
  },
};
