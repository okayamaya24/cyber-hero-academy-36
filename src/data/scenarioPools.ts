/**
 * Rotating Scenario Pools
 * 
 * Expandable content pools that mini-games can pull from dynamically.
 * To add new content, simply append to the relevant pool array.
 * Game mechanics stay the same — only the scenarios rotate.
 */

import type { AgeTier } from "./missions";

export interface ScenarioItem {
  id: string;
  text: string;
  isCorrect: boolean; // true = safe/correct, false = scam/dangerous
  explanation: string;
  tier: AgeTier | "all";
}

// ─── PHISHING SCENARIOS ──────────────────────────────────────
export const PHISHING_SCENARIOS: ScenarioItem[] = [
  // Junior
  { id: "phish-amazon-jr", tier: "junior", text: "🎁 You won a FREE Amazon gift card! Click here!", isCorrect: false, explanation: "Nobody gives free gift cards online. This is a scam!" },
  { id: "phish-roblox-jr", tier: "junior", text: "⚠️ Your Roblox account will be DELETED! Click to save it!", isCorrect: false, explanation: "Real Roblox never threatens to delete your account like this!" },
  { id: "phish-tiktok-jr", tier: "junior", text: "🎵 You won a TikTok dance contest! Send your address for the prize!", isCorrect: false, explanation: "Never send your address to strangers online, even for prizes!" },
  { id: "phish-school-jr", tier: "junior", text: "📚 Reminder: bring your permission slip tomorrow! - Ms. Johnson", isCorrect: true, explanation: "A reminder from your teacher on the school app is safe!" },
  { id: "phish-youtube-jr", tier: "junior", text: "🏆 You're the 1 MILLIONTH viewer! Click for FREE iPad!", isCorrect: false, explanation: "These are fake prize messages. YouTube doesn't give away iPads!" },
  { id: "phish-parent-jr", tier: "junior", text: "🍕 Hey sweetie, pizza for dinner tonight! Love, Mom", isCorrect: true, explanation: "A normal message from your parent is safe!" },

  // Defender
  { id: "phish-netflix-def", tier: "defender", text: "Your Netflix payment failed. Update at netfl1x-billing.com", isCorrect: false, explanation: "Notice 'netfl1x' uses a 1! Real Netflix is netflix.com." },
  { id: "phish-fortnite-def", tier: "defender", text: "FREE V-Bucks generator! Download now at v-bucks-free.xyz", isCorrect: false, explanation: "V-Bucks can only be bought through Epic Games. This is malware!" },
  { id: "phish-discord-def", tier: "defender", text: "Hey, I'm a Minecraft admin. Give me your login for free diamonds!", isCorrect: false, explanation: "No real admin asks for your password through messages!" },
  { id: "phish-bank-def", tier: "defender", text: "Your bank detected suspicious activity. Call 1-800-SCAM-BANK", isCorrect: false, explanation: "Banks never use phone numbers like this. Call the number on your card!" },
  { id: "phish-teacher-def", tier: "defender", text: "Field trip to the science museum next Friday! - school@myschool.edu", isCorrect: true, explanation: "Official school emails about known events are typically safe." },
  { id: "phish-instagram-def", tier: "defender", text: "Someone tried to log into your Instagram. Verify at insta-secure.net", isCorrect: false, explanation: "Instagram uses @instagram.com emails, not insta-secure.net!" },

  // Guardian
  { id: "phish-paypal-guard", tier: "guardian", text: "Unusual login from Russia detected. Verify at paypa1-security.com", isCorrect: false, explanation: "'paypa1' uses a 1 instead of l. Classic domain spoofing!" },
  { id: "phish-ceo-guard", tier: "guardian", text: "CEO urgently needs you to buy gift cards for a client", isCorrect: false, explanation: "CEO gift card requests are a common business email compromise attack!" },
  { id: "phish-crypto-guard", tier: "guardian", text: "Double your Bitcoin! Send 0.1 BTC to this wallet address!", isCorrect: false, explanation: "Cryptocurrency doubling scams are always fraudulent." },
  { id: "phish-google-guard", tier: "guardian", text: "Your session expired at gooogle.com. Re-enter your password.", isCorrect: false, explanation: "'gooogle.com' has three o's — typosquatting!" },
  { id: "phish-library-guard", tier: "guardian", text: "New resources added to the school library portal - librarian@school.edu", isCorrect: true, explanation: "Official school communications from known staff are typically safe." },
  { id: "phish-job-guard", tier: "guardian", text: "Work from home! $5000/week! No experience needed! Apply now!", isCorrect: false, explanation: "Too-good-to-be-true job offers are always scams." },
];

// ─── SAFE VS DANGEROUS WEBSITE SCENARIOS ─────────────────────
export const WEBSITE_SCENARIOS: ScenarioItem[] = [
  { id: "web-google", tier: "all", text: "google.com", isCorrect: true, explanation: "Google is a well-known, trusted website." },
  { id: "web-g00gle", tier: "all", text: "g00gle.com (zeros instead of o's)", isCorrect: false, explanation: "This uses numbers to mimic Google — it's a fake!" },
  { id: "web-wikipedia", tier: "all", text: "wikipedia.org", isCorrect: true, explanation: "Wikipedia is a trusted educational resource." },
  { id: "web-free-games", tier: "all", text: "free-minecraft-hacks.xyz", isCorrect: false, explanation: "Sites offering free game hacks are usually malware!" },
  { id: "web-youtube", tier: "all", text: "youtube.com", isCorrect: true, explanation: "YouTube is a well-known video platform." },
  { id: "web-y0utube", tier: "all", text: "y0utube-premium.com", isCorrect: false, explanation: "This uses a zero and adds '-premium' — URL spoofing!" },
  { id: "web-amazon", tier: "all", text: "amazon.com", isCorrect: true, explanation: "Amazon is a legitimate shopping website." },
  { id: "web-arnazon", tier: "all", text: "arnazon.com (rn looks like m)", isCorrect: false, explanation: "'arnazon' uses 'rn' to look like 'm' — typosquatting!" },
  { id: "web-school", tier: "all", text: "myschool.edu", isCorrect: true, explanation: ".edu domains belong to educational institutions." },
  { id: "web-virus-scan", tier: "all", text: "free-virus-scan-now.com", isCorrect: false, explanation: "Sites offering free virus scans are often malware themselves!" },
  { id: "web-nike", tier: "defender", text: "nikee-outlet-deals.com", isCorrect: false, explanation: "Misspelled brand + 'outlet deals' = counterfeit scam!" },
  { id: "web-bbc", tier: "defender", text: "bbc.com/news", isCorrect: true, explanation: "BBC is a well-known, legitimate news source." },
  { id: "web-roblox", tier: "all", text: "roblox.com", isCorrect: true, explanation: "Roblox is a legitimate gaming platform." },
  { id: "web-r0blox", tier: "all", text: "r0blox-free.com", isCorrect: false, explanation: "Uses a zero and adds '-free' — classic URL spoofing!" },
];

// ─── PASSWORD SCENARIOS ──────────────────────────────────────
export interface PasswordScenario {
  id: string;
  password: string;
  strength: "weak" | "medium" | "strong";
  explanation: string;
  tier: AgeTier | "all";
}

export const PASSWORD_SCENARIOS: PasswordScenario[] = [
  { id: "pw-123456", tier: "all", password: "123456", strength: "weak", explanation: "One of the most commonly hacked passwords ever!" },
  { id: "pw-password", tier: "all", password: "password", strength: "weak", explanation: "'password' is literally the first thing hackers try!" },
  { id: "pw-tiger7", tier: "junior", password: "Tiger7!", strength: "medium", explanation: "Mixes letters, numbers, and symbols — decent but could be longer!" },
  { id: "pw-bludragon", tier: "defender", password: "BlueTiger$42Rain", strength: "strong", explanation: "Long, uses mixed case, numbers, symbols, and unrelated words!" },
  { id: "pw-summer", tier: "defender", password: "Summer2024!", strength: "medium", explanation: "Season + year patterns are common. Hackers try these first!" },
  { id: "pw-passphrase", tier: "guardian", password: "PurpleDragon$Flies@Night9", strength: "strong", explanation: "Long passphrases with symbols are very strong and memorable!" },
  { id: "pw-qwerty", tier: "all", password: "qwerty", strength: "weak", explanation: "Keyboard patterns are some of the first things hackers try!" },
  { id: "pw-ilovecats", tier: "junior", password: "ilovecats", strength: "weak", explanation: "Common phrases without numbers or symbols are easy to guess!" },
  { id: "pw-m1n3craft", tier: "defender", password: "M!n3cr@ft$2024", strength: "strong", explanation: "Symbol substitutions + numbers + mixed case = strong!" },
  { id: "pw-correct-horse", tier: "guardian", password: "correct horse battery staple", strength: "strong", explanation: "Long random-word passphrases are very strong!" },
];

// ─── PRIVACY INFO SCENARIOS ──────────────────────────────────
export interface PrivacyScenario {
  id: string;
  info: string;
  isPrivate: boolean;
  explanation: string;
  tier: AgeTier | "all";
}

export const PRIVACY_SCENARIOS: PrivacyScenario[] = [
  { id: "priv-color", tier: "all", info: "Your favorite color", isPrivate: false, explanation: "Favorite colors are general info — safe to share!" },
  { id: "priv-address", tier: "all", info: "Your home address", isPrivate: true, explanation: "Your address is very private! Never share it online." },
  { id: "priv-school", tier: "all", info: "Your school name", isPrivate: true, explanation: "Your school name helps strangers find you!" },
  { id: "priv-pet", tier: "all", info: "Your pet's name", isPrivate: false, explanation: "Pet names are generally safe, but don't use them as passwords!" },
  { id: "priv-phone", tier: "all", info: "Your phone number", isPrivate: true, explanation: "Phone numbers are private — only share with trusted people." },
  { id: "priv-movie", tier: "all", info: "Your favorite movie", isPrivate: false, explanation: "Sharing entertainment preferences is totally fine!" },
  { id: "priv-birthday", tier: "defender", info: "Your exact birthday", isPrivate: true, explanation: "Full birth dates help with identity theft!" },
  { id: "priv-username", tier: "all", info: "Your creative username (CosmicPlayer42)", isPrivate: false, explanation: "Creative usernames that don't reveal real info are safe!" },
  { id: "priv-routine", tier: "guardian", info: "Your daily schedule and routine", isPrivate: true, explanation: "Sharing routines helps criminals predict where you'll be!" },
  { id: "priv-food", tier: "all", info: "Your favorite food", isPrivate: false, explanation: "Sharing food preferences is perfectly safe!" },
];

// ─── HELPER: GET SCENARIOS BY TIER ───────────────────────────

export function getScenariosByTier<T extends { tier: AgeTier | "all" }>(
  pool: T[],
  tier: AgeTier,
  count?: number
): T[] {
  const eligible = pool.filter((s) => s.tier === "all" || s.tier === tier);
  if (!count) return eligible;
  
  // Shuffle and take `count` items
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getRandomScenarios<T extends { tier: AgeTier | "all" }>(
  pool: T[],
  tier: AgeTier,
  count: number
): T[] {
  return getScenariosByTier(pool, tier, count);
}
