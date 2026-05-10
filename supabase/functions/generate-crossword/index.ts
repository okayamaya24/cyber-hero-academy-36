// Generate cybersecurity crossword content via Lovable AI Gateway (OpenAI models).
// POST { tier: "junior" | "hero" | "elite", topic: string }
// Returns { title, size: 15, words: [{ answer, clue }] }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Tier = "junior" | "hero" | "elite";

const TIER_LENGTHS: Record<Tier, { min: number; max: number }> = {
  junior: { min: 3, max: 8 },
  hero: { min: 4, max: 10 },
  elite: { min: 4, max: 12 },
};

const TIER_GUIDE: Record<Tier, string> = {
  junior:
    "Ages 5–7. Answers MUST be 3–8 letters. Use very simple internet safety words like SAFE, HELP, ADULT, SECRET, LOGIN, KIND, BLOCK, TRUST, RULES, ASK, STOP, SHARE, PRIVATE, PARENT. Clues must be short, friendly, and use easy words a young child understands. Avoid jargon.",
  hero:
    "Ages 8–12. Answers MUST be 4–10 letters. Prefer medium cybersecurity vocabulary like PASSWORD, PHISHING, MALWARE, HACKER, PRIVACY, COOKIE, LOGIN, VERIFY, FIREWALL, SCAM, ALERT, TRUST, LINK, SPAM, VIRUS, UPDATE, BACKUP. Clues should be clear, age-appropriate, and lightly explanatory.",
  elite:
    "Ages 12+. Answers MUST be 4–12 letters. Prefer advanced cybersecurity terms like FIREWALL, BOTNET, TROJAN, SPYWARE, BREACH, PATCH, VPN, PHISHING, MALWARE, HASH, TOKEN, THREAT, EXPLOIT, ZERODAY (write 'zero day' as ZERODAY), RANSOM, ENCRYPT, SPOOF, CIPHER, PAYLOAD. Clues can be more technical but still clear.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => null);
    const tier = body?.tier as Tier | undefined;
    const topic = typeof body?.topic === "string" ? body.topic.trim() : "";

    if (!tier || !["junior", "hero", "elite"].includes(tier)) {
      return new Response(
        JSON.stringify({ error: "tier must be 'junior', 'hero', or 'elite'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!topic || topic.length > 200) {
      return new Response(
        JSON.stringify({ error: "topic is required (max 200 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = `You generate cybersecurity-themed crossword puzzle word lists for kids.
Tier rules: ${TIER_GUIDE[tier]}
Hard rules:
- Generate 10 to 15 words.
- ANSWERS must be UPPERCASE A-Z only. No spaces, digits, hyphens, apostrophes, or punctuation.
- Each answer must be 3–12 letters.
- All answers must be unique.
- Clues must be kid-friendly, clear, and a single sentence (no answer leakage).
- Title should be short and themed.`;

    const userPrompt = `Topic: ${topic}\nTier: ${tier}\nReturn the crossword word list.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_crossword",
              description: "Return the crossword puzzle word list.",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  words: {
                    type: "array",
                    minItems: 10,
                    maxItems: 15,
                    items: {
                      type: "object",
                      properties: {
                        answer: { type: "string" },
                        clue: { type: "string" },
                      },
                      required: ["answer", "clue"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["title", "words"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_crossword" } },
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await aiRes.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsStr = toolCall?.function?.arguments;
    if (!argsStr) {
      console.error("No tool call in AI response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured output" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: { title: string; words: { answer: string; clue: string }[] };
    try {
      parsed = JSON.parse(argsStr);
    } catch (e) {
      console.error("Failed to parse tool args:", argsStr);
      return new Response(
        JSON.stringify({ error: "Failed to parse AI output" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Sanitize: uppercase, strip non A-Z, dedupe, length 3-12
    const seen = new Set<string>();
    const words = (parsed.words ?? [])
      .map((w) => ({
        answer: String(w.answer ?? "").toUpperCase().replace(/[^A-Z]/g, ""),
        clue: String(w.clue ?? "").trim(),
      }))
      .filter((w) => {
        if (w.answer.length < 3 || w.answer.length > 12) return false;
        if (!w.clue) return false;
        if (seen.has(w.answer)) return false;
        seen.add(w.answer);
        return true;
      })
      .slice(0, 15);

    if (words.length < 10) {
      return new Response(
        JSON.stringify({ error: "AI returned too few valid words, please retry." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = {
      title: String(parsed.title || `${topic} Crossword`).slice(0, 80),
      size: 15,
      words,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-crossword error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
