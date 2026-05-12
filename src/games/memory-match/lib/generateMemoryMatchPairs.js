import { supabase } from "./supabase";

const FALLBACK_PAIRS = {
  junior: [
    { term: "PASSWORD", definition: "A secret word used to log in." },
    { term: "WIFI", definition: "How devices connect to the internet without wires." },
    { term: "VIRUS", definition: "Bad software that can hurt your computer." },
    { term: "HACKER", definition: "Someone who tries to break into computers." },
    { term: "SHIELD", definition: "Something that keeps your device safe." },
    { term: "SPAM", definition: "Junk messages you did not ask for." }
  ],
  hero: [
    { term: "PHISHING", definition: "Fake messages that try to trick you into sharing info." },
    { term: "MALWARE", definition: "Harmful software that can damage your device." },
    { term: "FIREWALL", definition: "A guard that blocks bad traffic on a network." },
    { term: "PRIVACY", definition: "Keeping your personal info to yourself." },
    { term: "SCAM", definition: "A trick to steal your money or info." },
    { term: "BACKUP", definition: "An extra copy of your files in case they are lost." },
    { term: "ANTIVIRUS", definition: "A tool that finds and removes viruses." },
    { term: "USERNAME", definition: "The name you use to sign in to an account." }
  ],
  elite: [
    { term: "ENCRYPTION", definition: "Scrambling data so only the right person can read it." },
    { term: "RANSOMWARE", definition: "Malware that locks files and demands payment." },
    { term: "CREDENTIALS", definition: "Your login info like username and password." },
    { term: "AUTHENTICATION", definition: "Proving you are who you say you are online." },
    { term: "VULNERABILITY", definition: "A weakness that attackers can exploit." },
    { term: "CYBERATTACK", definition: "An attempt to damage or steal from a computer system." },
    { term: "TWOFACTOR", definition: "Using two steps to verify your identity." },
    { term: "BREACH", definition: "When private data is stolen or exposed." }
  ]
};

const COUNT_BY_TIER = { junior: 4, hero: 6, elite: 8 };

function getFallback(tier) {
  const key = String(tier ?? "junior").toLowerCase();
  const list = FALLBACK_PAIRS[key] ?? FALLBACK_PAIRS.junior;
  const count = COUNT_BY_TIER[key] ?? 4;
  return list.slice(0, count);
}

export async function generateMemoryMatchPairs({ tier, topic }) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "generate-memory-match",
      {
        body: { tier, topic }
      }
    );

    if (error) {
      console.error("AI memory match generation failed:", error);
      return getFallback(tier);
    }

    if (!data?.pairs || !Array.isArray(data.pairs) || data.pairs.length === 0) {
      console.warn("AI returned no pairs, using fallback.");
      return getFallback(tier);
    }

    return data.pairs;
  } catch (e) {
    console.error("Memory match generation threw, using fallback:", e);
    return getFallback(tier);
  }
}
