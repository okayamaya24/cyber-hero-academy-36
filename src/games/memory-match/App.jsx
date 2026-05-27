import { useEffect, useState } from "react";
import { saveMemoryMatchResult } from "./lib/saveMemoryMatchResult";
import { generateMemoryMatchPairs } from "./lib/generateMemoryMatchPairs";

const PAIRS_BY_TIER = {
  junior: [
    {
      term: "PASSWORD",
      definition: "A secret word used to log in"
    },
    {
      term: "WIFI",
      definition: "A wireless internet connection"
    },
    {
      term: "SAFE LINK",
      definition: "A link you can trust"
    },
    {
      term: "ADULT",
      definition: "Someone you ask for help online"
    }
  ],

  hero: [
    {
      term: "PHISHING",
      definition: "A fake message trying to trick you"
    },
    {
      term: "MALWARE",
      definition: "Bad software that can harm a device"
    },
    {
      term: "PRIVACY",
      definition: "Keeping personal information protected"
    },
    {
      term: "FIREWALL",
      definition: "A shield that helps block cyber threats"
    },
    {
      term: "HACKER",
      definition: "Someone who tries to break into systems"
    },
    {
      term: "2FA",
      definition: "A second step to protect your account"
    }
  ],

  elite: [
    {
      term: "ENCRYPTION",
      definition: "Turning data into a secret code"
    },
    {
      term: "BREACH",
      definition: "When private data gets exposed"
    },
    {
      term: "EXPLOIT",
      definition: "A weakness attackers use"
    },
    {
      term: "TROJAN",
      definition: "Malware disguised as something safe"
    },
    {
      term: "BOTNET",
      definition: "A group of infected devices controlled together"
    },
    {
      term: "SPYWARE",
      definition: "Software that secretly watches activity"
    },
    {
      term: "VPN",
      definition: "A tool that helps protect internet traffic"
    },
    {
      term: "ZERO DAY",
      definition: "A security flaw not fixed yet"
    }
  ]
};

const TOPICS_BY_TIER = {
  junior: [
    "internet safety",
    "password safety",
    "safe gaming",
    "online kindness",
    "trusted adults"
  ],
  hero: [
    "phishing",
    "malware",
    "privacy",
    "social engineering",
    "wifi security"
  ],
  elite: [
    "encryption",
    "data breaches",
    "network defense",
    "ethical hacking",
    "cyber attacks"
  ]
};

function getRandomTopic(tier) {
  const topics = TOPICS_BY_TIER[tier];
  return topics[Math.floor(Math.random() * topics.length)];
}

function cleanPairs(pairs, tier) {
  const maxPairs =
    tier === "junior"
      ? 4
      : tier === "hero"
      ? 6
      : 8;

  const seenTerms = new Set();

  return pairs
    .map((pair) => ({
      term: String(pair.term || "")
        .toUpperCase()
        .replace(/[^A-Z0-9 ]/g, "")
        .trim(),
      definition: String(pair.definition || "").trim()
    }))
    .filter((pair) => pair.term && pair.definition)
    .filter((pair) => {
      if (seenTerms.has(pair.term)) return false;
      seenTerms.add(pair.term);
      return true;
    })
    .slice(0, maxPairs);
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildCards(pairs) {
  const cards = [];

  pairs.forEach((pair, index) => {
    cards.push({
      id: `${index}-term`,
      pairId: index,
      type: "term",
      text: pair.term
    });

    cards.push({
      id: `${index}-definition`,
      pairId: index,
      type: "definition",
      text: pair.definition
    });
  });

  return shuffle(cards);
}

function getInitialTier() {
  const age = parseInt(new URLSearchParams(window.location.search).get("age") || "0");
  if (age >= 5 && age <= 8)  return "junior";
  if (age >= 9 && age <= 12) return "hero";
  if (age > 12)              return "elite";
  return "junior";
}

export default function App() {
  const [tier, setTier] = useState(getInitialTier);
  const [cards, setCards] = useState(() => buildCards(PAIRS_BY_TIER[getInitialTier()]));
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [message, setMessage] = useState("Flip cards to match cyber terms!");
  const [missionComplete, setMissionComplete] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [savingResult, setSavingResult] = useState(false);

  const pairs = cards.length / 2;

  useEffect(() => {
    resetGame(getInitialTier());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (missionComplete) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [missionComplete]);

  useEffect(() => {
    if (matchedPairIds.length === pairs) {
      setMissionComplete(true);
      setMessage("Mission complete!");
    }
  }, [matchedPairIds, pairs]);

  useEffect(() => {
    async function saveResult() {
      if (!missionComplete || resultSaved || savingResult) return;

      try {
        setSavingResult(true);

        await saveMemoryMatchResult({
          tier,
          xpEarned: getXP(),
          stars: getStars(),
          completionTime: secondsElapsed,
          attempts
        });

        console.log("Memory Match result saved!");
        setResultSaved(true);
      } catch (error) {
        console.error("Failed to save Memory Match result:", error);
      } finally {
        setSavingResult(false);
      }
    }

    saveResult();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // secondsElapsed & attempts are intentionally omitted — they are frozen when
  // missionComplete=true (timer stops), so the closure always captures the
  // correct final values. Including them would re-run the save every second.
  }, [missionComplete, resultSaved, savingResult, tier]);

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getXP() {
    const baseXP =
      tier === "junior"
        ? 100
        : tier === "hero"
        ? 180
        : 300;

    const speedBonus =
      secondsElapsed < 60
        ? 60
        : secondsElapsed < 120
        ? 30
        : 0;

    const accuracyBonus =
      attempts <= pairs + 2
        ? 50
        : attempts <= pairs + 5
        ? 25
        : 0;

    return baseXP + speedBonus + accuracyBonus;
  }

  function getStars() {
  if (attempts <= pairs + 2 && secondsElapsed <= 60) {
    return "⭐⭐⭐";
  }

  if (attempts <= pairs + 5 && secondsElapsed <= 120) {
    return "⭐⭐";
  }

  return "⭐";
}

  async function resetGame(nextTier = tier) {
  setTier(nextTier);
  setFlippedCards([]);
  setMatchedPairIds([]);
  setAttempts(0);
  setSecondsElapsed(0);
  setMissionComplete(false);
  setResultSaved(false);
  setSavingResult(false);
  setMessage("Byte is building your memory mission...");

  const fallbackPairs = PAIRS_BY_TIER[nextTier];
  const topic = getRandomTopic(nextTier);

  try {
    const aiPairs = await generateMemoryMatchPairs({
      tier: nextTier,
      topic
    });

    const cleanedPairs = cleanPairs(aiPairs, nextTier);

    if (cleanedPairs.length < 4) {
      throw new Error("Not enough valid memory pairs returned.");
    }

    setCards(buildCards(cleanedPairs));
    setMessage("Flip cards to match cyber terms!");
  } catch (error) {
    console.error("AI memory mission failed. Using fallback pairs:", error);
    setCards(buildCards(fallbackPairs));
    setMessage("Backup mission loaded. Flip cards to match cyber terms!");
  }
}

  function handleCardClick(card) {
    if (missionComplete) return;

    const alreadyMatched = matchedPairIds.includes(card.pairId);
    const alreadyFlipped = flippedCards.some(
      (flipped) => flipped.id === card.id
    );

    if (alreadyMatched || alreadyFlipped || flippedCards.length === 2) {
      return;
    }

    const nextFlipped = [...flippedCards, card];

    setFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setAttempts((prev) => prev + 1);

      const [first, second] = nextFlipped;

      const isMatch =
        first.pairId === second.pairId &&
        first.type !== second.type;

      if (isMatch) {
        setMatchedPairIds((prev) => [...prev, first.pairId]);

        setMessage(
          `✅ Match found: ${
            first.type === "term" ? first.text : second.text
          }!`
        );

        setTimeout(() => {
          setFlippedCards([]);
        }, 700);
      } else {
        setMessage("❌ Not a match. Try again!");

        setTimeout(() => {
          setFlippedCards([]);
        }, 900);
      }
    }
  }

  function isCardVisible(card) {
    return (
      flippedCards.some((flipped) => flipped.id === card.id) ||
      matchedPairIds.includes(card.pairId)
    );
  }

  function isCardMatched(card) {
    return matchedPairIds.includes(card.pairId);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#040218",
        color: "white",
        padding: "24px",
        fontFamily: "Arial"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
        <button
          onClick={() => { window.location.href = "/missions"; }}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "white",
            padding: "8px 14px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            marginBottom: "16px"
          }}
        >
          ← Back to Games
        </button>

        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "22px"
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(32px, 5vw, 54px)"
              }}
            >
              Cyber Memory Match
            </h1>

            <p
              style={{
                color: "#08b6aa",
                fontWeight: "bold",
                marginBottom: 0
              }}
            >
              Match cybersecurity words with their meanings.
            </p>

            <p
              style={{
                color: "#facc15",
                fontWeight: "bold"
              }}
            >
              {message}
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#0b1120",
              border: "1px solid #08b6aa",
              borderRadius: "16px",
              padding: "16px 20px",
              fontWeight: "bold",
              color: "#08b6aa",
              textAlign: "center"
            }}
          >
            ⏱️ {formatTime(secondsElapsed)}
            <br />
            Attempts: {attempts}
          </div>
        </header>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "24px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => resetGame(tier)}
            style={{
              backgroundColor: "#08b6aa",
              color: "#000",
              border: "none",
              padding: "10px 16px",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            🔄 New Mission
          </button>
        </div>

        <main
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: tier === "elite" ? "12px" : "16px"
          }}
        >
          {cards.map((card) => {
            const visible = isCardVisible(card);
            const matched = isCardMatched(card);

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                style={{
                  perspective: "1000px",
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    minHeight:
                      tier === "junior"
                        ? "150px"
                        : tier === "hero"
                        ? "130px"
                        : "105px",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s",
                    transform:
                      visible || matched
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)"
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                      borderRadius: "20px",
                      background:
                        "linear-gradient(135deg, #081225 0%, #111c35 100%)",
                      border: "1px solid #334155",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "38px",
                      boxShadow: "0 0 18px rgba(8,182,170,0.12)"
                    }}
                  >
                    🛡️
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderRadius: "20px",
                      padding: "16px",
                      background: matched
                        ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                        : "linear-gradient(135deg, #14d8cc 0%, #08b6aa 100%)",
                      color: "#000",
                      fontWeight: "bold",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      boxShadow: matched
                        ? "0 0 25px rgba(34,197,94,0.45)"
                        : "0 0 20px rgba(20,216,204,0.35)"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        opacity: 0.7
                      }}
                    >
                      {card.type}
                    </div>

                    <div
                      style={{
                        fontSize:
                          card.type === "definition"
                            ? "clamp(13px, 1.2vw, 18px)"
                            : "clamp(18px, 1.8vw, 28px)"
                      }}
                    >
                      {card.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {missionComplete && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.75)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
              padding: "20px"
            }}
          >
            <div
              style={{
                backgroundColor: "#04142d",
                border: "2px solid #08b6aa",
                borderRadius: "26px",
                padding: "36px",
                width: "100%",
                maxWidth: "430px",
                textAlign: "center",
                boxShadow: "0 0 40px rgba(8,182,170,0.45)"
              }}
            >
              <h1
                style={{
                  color: "#08b6aa",
                  fontSize: "38px",
                  marginBottom: "12px"
                }}
              >
                🎉 Mission Complete!
              </h1>

              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "18px"
                }}
              >
                {getStars()}
              </div>

              <div
                style={{
                  color: "#fff",
                  fontSize: "36px",
                  fontWeight: "bold",
                  marginBottom: "14px"
                }}
              >
                +{getXP()} XP
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                  fontSize: "18px"
                }}
              >
                Time: {formatTime(secondsElapsed)}
              </p>

              <p
                style={{
                  color: "#facc15",
                  fontWeight: "bold",
                  fontSize: "18px"
                }}
              >
                Attempts: {attempts}
              </p>

              <p
                style={{
                  color: resultSaved ? "#22c55e" : "#facc15",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                {resultSaved
                  ? "✅ Progress Saved"
                  : savingResult
                  ? "Saving progress..."
                  : "Preparing save..."}
              </p>

              <button
                onClick={() => resetGame(tier)}
                style={{
                  backgroundColor: "#08b6aa",
                  color: "#000",
                  border: "none",
                  padding: "14px 26px",
                  borderRadius: "14px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  cursor: "pointer"
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

