const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TIER_CONFIG: Record<string, { count: number; guidance: string }> = {
  junior: {
    count: 4,
    guidance:
      "Very simple, kid-friendly cybersecurity terms (ages 5-7). Use short, common words a young child can grasp. Definitions should be one short sentence using simple language.",
  },
  hero: {
    count: 6,
    guidance:
      "Medium difficulty cybersecurity terms (ages 8-10). Definitions should be clear and concise, one short sentence, age-appropriate.",
  },
  elite: {
    count: 8,
    guidance:
      "More advanced cybersecurity terms (ages 11-12). Definitions should be accurate but still concise and age-appropriate.",
  },
};

const FALLBACKS: Record<string, { term: string; definition: string }[]> = {
  junior: [
    { term: "PASSWORD", definition: "A secret word used to log in." },
    { term: "WIFI", definition: "How devices connect to the internet without wires." },
    { term: "VIRUS", definition: "Bad software that can hurt your computer." },
    { term: "SAFE", definition: "Means you are protected from harm online." },
    { term: "SPAM", definition: "Junk messages you did not ask for." },
    { term: "LINK", definition: "A button you tap to go to a website." },
    { term: "HACKER", definition: "Someone who tries to break into computers." },
    { term: "SHIELD", definition: "Something that keeps your device safe." },
  ],
  hero: [
    { term: "PHISHING", definition: "Fake messages that try to trick you into sharing info." },
    { term: "MALWARE", definition: "Harmful software that can damage your device." },
    { term: "FIREWALL", definition: "A guard that blocks bad traffic on a network." },
    { term: "BACKUP", definition: "An extra copy of your files in case they are lost." },
    { term: "PRIVACY", definition: "Keeping your personal info to yourself." },
    { term: "ANTIVIRUS", definition: "A tool that finds and removes viruses." },
    { term: "SCAM", definition: "A trick to steal your money or info." },
    { term: "USERNAME", definition: "The name you use to sign in to an account." },
  ],
  elite: [
    { term: "ENCRYPTION", definition: "Scrambling data so only the right person can read it." },
    { term: "RANSOMWARE", definition: "Malware that locks files and demands payment." },
    { term: "CREDENTIALS", definition: "Your login info like username and password." },
    { term: "AUTHENTICATION", definition: "Proving you are who you say you are online." },
    { term: "VULNERABILITY", definition: "A weakness that attackers can exploit." },
    { term: "CYBERATTACK", definition: "An attempt to damage or steal from a computer system." },
    { term: "TWOFACTOR", definition: "Using two steps to verify your identity." },
    { term: "BREACH", definition: "When private data is stolen or exposed." },
  ],
};

function sanitizePairs(
  pairs: any[],
  count: number,
): { term: string; definition: string }[] {
  const seen = new Set<string>();
  const out: { term: string; definition: string }[] = [];
  for (const p of pairs ?? []) {
    if (!p || typeof p !== "object") continue;
    const term = String(p.term ?? "").toUpperCase().replace(/[^A-Z]/g, "");
    const definition = String(p.definition ?? "").trim();
    if (!term || !definition) continue;
    if (seen.has(term)) continue;
    seen.add(term);
    out.push({ term, definition });
    if (out.length >= count) break;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier, topic } = await req.json();
    const tierKey = String(tier ?? "junior").toLowerCase();
    const cfg = TIER_CONFIG[tierKey] ?? TIER_CONFIG.junior;
    const count = cfg.count;
    const topicText = topic ? String(topic) : "general cybersecurity";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You generate memory match pairs for a children's CYBERSECURITY game.

STRICT RULE: Every single pair MUST be cybersecurity-related. Do NOT generate random general words, colors, animals, objects, school words, food, sports, or any unrelated vocabulary.

Allowed topic areas ONLY:
passwords, phishing, malware, privacy, safe browsing, scams, social engineering, encryption, firewalls, hackers, data breaches, viruses, secure Wi-Fi, two-factor authentication, online safety, cyberbullying, trusted adults, suspicious links, fake websites.

Tier: ${tierKey}. ${cfg.guidance}

Requirements for every pair:
- Must be clearly cybersecurity / online safety related (from the allowed topics above)
- Age-appropriate for the tier
- Term in UPPERCASE letters only (A-Z, no spaces, no digits, no punctuation)
- Definition: one short, clear sentence
- No duplicate terms

Return exactly ${count} pairs.`;

    const userPrompt = `Topic focus: ${topicText} (must stay strictly within cybersecurity / online safety). Generate ${count} cybersecurity memory match pairs.`;

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_memory_pairs",
                description: "Return memory match pairs",
                parameters: {
                  type: "object",
                  properties: {
                    pairs: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          term: { type: "string" },
                          definition: { type: "string" },
                        },
                        required: ["term", "definition"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["pairs"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_memory_pairs" },
          },
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      // fall through to fallback
      const pairs = FALLBACKS[tierKey].slice(0, count);
      return new Response(JSON.stringify({ pairs }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiResp.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    let pairs: { term: string; definition: string }[] = [];
    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        pairs = sanitizePairs(args.pairs, count);
      } catch (e) {
        console.error("Failed to parse tool args:", e);
      }
    }

    if (pairs.length < count) {
      const fallback = FALLBACKS[tierKey];
      const seen = new Set(pairs.map((p) => p.term));
      for (const f of fallback) {
        if (pairs.length >= count) break;
        if (seen.has(f.term)) continue;
        pairs.push(f);
        seen.add(f.term);
      }
    }

    return new Response(JSON.stringify({ pairs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-memory-match error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
