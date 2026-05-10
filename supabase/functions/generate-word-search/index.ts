const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SIZE_TO_COUNT: Record<string, number> = {
  small: 6,
  medium: 8,
  large: 10,
  expert: 12,
};

const TIER_GUIDANCE: Record<string, string> = {
  junior:
    "ages 5-7. Use SHORT, simple, kid-friendly cybersecurity words (3-6 letters). Examples: SAFE, WIFI, LINK, SPAM, VIRUS, HACKER.",
  hero:
    "ages 8-10. Use MEDIUM difficulty cybersecurity words (5-9 letters). Examples: PHISHING, MALWARE, FIREWALL, BACKUP, PRIVACY.",
  elite:
    "ages 11-12. Use ADVANCED cybersecurity words (7-12 letters). Examples: ENCRYPTION, RANSOMWARE, AUTHENTICATION, VULNERABILITY, CREDENTIALS.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier = "hero", puzzleSize = "medium", topic = "cybersecurity" } =
      await req.json();

    const count = SIZE_TO_COUNT[puzzleSize] ?? 8;
    const guidance = TIER_GUIDANCE[tier] ?? TIER_GUIDANCE.hero;

    // Max letter length so words fit the grid (rough heuristic per size)
    const maxLen =
      puzzleSize === "small"
        ? 6
        : puzzleSize === "medium"
          ? 8
          : puzzleSize === "large"
            ? 10
            : 12;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You generate cybersecurity word lists for a kids' word search game.
Tier: ${tier} — ${guidance}
Topic: ${topic}
Return EXACTLY ${count} unique words. Each word must be:
- UPPERCASE only
- letters A-Z only (no spaces, no digits, no punctuation, no hyphens)
- between 3 and ${maxLen} letters
- no duplicates
- relevant to cybersecurity / online safety / the given topic`;

    const response = await fetch(
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
            {
              role: "user",
              content: `Generate ${count} cybersecurity word search words for a ${tier} player on topic "${topic}".`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_word_list",
                description: "Return the generated word search word list.",
                parameters: {
                  type: "object",
                  properties: {
                    words: {
                      type: "array",
                      items: { type: "string" },
                      minItems: count,
                      maxItems: count,
                    },
                  },
                  required: ["words"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_word_list" },
          },
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const args =
      data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let words: string[] = [];
    try {
      words = JSON.parse(args ?? "{}").words ?? [];
    } catch (e) {
      console.error("Failed to parse tool args:", args, e);
    }

    // Sanitize: uppercase, letters only, dedupe, length filter, trim to count
    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const raw of words) {
      if (typeof raw !== "string") continue;
      const w = raw.toUpperCase().replace(/[^A-Z]/g, "");
      if (w.length < 3 || w.length > maxLen) continue;
      if (seen.has(w)) continue;
      seen.add(w);
      cleaned.push(w);
      if (cleaned.length >= count) break;
    }

    // Fallback fill if model returned too few valid words
    const FALLBACKS: Record<string, string[]> = {
      junior: ["SAFE", "WIFI", "LINK", "SPAM", "VIRUS", "HACKER", "LOGIN", "EMAIL"],
      hero: ["PHISHING", "MALWARE", "FIREWALL", "BACKUP", "PRIVACY", "PASSWORD", "ANTIVIRUS", "ENCRYPT"],
      elite: ["ENCRYPTION", "RANSOMWARE", "CREDENTIALS", "AUTHENTIC", "VULNERABLE", "CYBERATTACK", "BIOMETRIC", "BREACH", "EXPLOIT", "INTRUSION", "FORENSICS", "PHISHING"],
    };
    const fb = FALLBACKS[tier] ?? FALLBACKS.hero;
    for (const w of fb) {
      if (cleaned.length >= count) break;
      const u = w.toUpperCase();
      if (u.length > maxLen) continue;
      if (!seen.has(u)) {
        seen.add(u);
        cleaned.push(u);
      }
    }

    return new Response(JSON.stringify({ words: cleaned }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("generate-word-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
