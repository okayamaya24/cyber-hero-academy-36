import { useState } from "react";

// ── Age detection ─────────────────────────────────────────────────────────────
function getMode() {
  const params = new URLSearchParams(window.location.search);
  const age = parseInt(params.get("age") || "0");
  if (age >= 5 && age <= 8) return "kids";
  if (age > 8)              return "pro";
  return "picker";
}

// ── Kids cards (ages 5-8) ─────────────────────────────────────────────────────
const KIDS_CARDS = [
  {
    id: "k1",
    emoji: "🎮",
    text: "A message says: \"Give us your Roblox password to get FREE Robux!\"",
    type: "danger",
    clue: "Never share your password — not even for free stuff! Real games never ask for it."
  },
  {
    id: "k2",
    emoji: "🧸",
    text: "Your mum texts: \"I'm at the shops, want me to pick up a snack?\"",
    type: "ok",
    clue: "It's from your mum! A message from someone you know and trust is fine."
  },
  {
    id: "k3",
    emoji: "🍬",
    text: "A stranger online says: \"Come meet me at the park, I have free candy!\"",
    type: "danger",
    clue: "Never meet a stranger from the internet! Always tell a grown-up."
  },
  {
    id: "k4",
    emoji: "🏫",
    text: "Your teacher posts: \"Remember to bring your library book tomorrow!\"",
    type: "ok",
    clue: "A reminder from your teacher is totally safe and expected."
  },
  {
    id: "k5",
    emoji: "🎁",
    text: "A pop-up says: \"You WON a free toy! Send your home address to claim it!\"",
    type: "danger",
    clue: "Never give your home address to strangers online — this is a trap!"
  },
  {
    id: "k6",
    emoji: "👾",
    text: "Your friend says in the game chat: \"Want to join my server? Here's the invite!\"",
    type: "ok",
    clue: "An invite from a real friend you already know is fine to accept."
  },
  {
    id: "k7",
    emoji: "📱",
    text: "A message says: \"Your account will be DELETED in 1 hour unless you click here!\"",
    type: "danger",
    clue: "Scary countdown messages are tricks to make you panic and click! Ignore them."
  },
  {
    id: "k8",
    emoji: "📚",
    text: "The school library app says: \"Your book is due back in 2 days.\"",
    type: "ok",
    clue: "A reminder from your school app is normal and safe."
  },
  {
    id: "k9",
    emoji: "🤑",
    text: "A website says: \"Answer 1 question and win $1,000! Enter your name and address!\"",
    type: "danger",
    clue: "Real contests don't work this way. Never give personal info to random websites."
  },
  {
    id: "k10",
    emoji: "⚽",
    text: "Your football coach messages the group: \"Training moved to 4pm this Saturday.\"",
    type: "ok",
    clue: "A message from your coach about training is completely normal and safe."
  },
];

const ALL_CARDS = [
  // ── SCAMS ──
  {
    id: 1,
    text: "You won a FREE iPhone! Click now to claim your prize!",
    type: "scam",
    clue: "\"Too good to be true\" — real companies don't randomly give away free phones."
  },
  {
    id: 2,
    text: "Verify your password immediately at amaz0n-login.net",
    type: "scam",
    clue: "Fake URL — notice the zero (0) swapped for the letter O. Always check the domain."
  },
  {
    id: 3,
    text: "Click this link or your game account will be deleted in 24 hours!",
    type: "scam",
    clue: "Scare tactic — real companies never threaten to delete accounts via random links."
  },
  {
    id: 4,
    text: "URGENT: Your Netflix is suspended. Login at netflix-verify.com now.",
    type: "scam",
    clue: "Fake domain — official Netflix emails only link to netflix.com, nothing else."
  },
  {
    id: 5,
    text: "Congrats! You've been selected for a $1,000 gift card. Claim in 10 minutes!",
    type: "scam",
    clue: "Fake prize + fake urgency — scammers use time pressure to stop you from thinking."
  },
  {
    id: 6,
    text: "Your PayPal is limited. Fix it now at paypal-secure-login.com",
    type: "scam",
    clue: "Fake domain — all legitimate PayPal links go through paypal.com only."
  },
  {
    id: 7,
    text: "Hey it's me, lost my phone — can you send $50 on Cash App real quick?",
    type: "scam",
    clue: "Impersonation scam — always call the person directly to verify before sending money."
  },
  {
    id: 8,
    text: "WARNING: 3 viruses detected on your device! Call 1-800-555-0199 immediately!",
    type: "scam",
    clue: "Fake tech support — your browser cannot detect viruses. This is a scare tactic."
  },
  {
    id: 9,
    text: "IRS Notice: Reply with your Social Security Number to receive your refund.",
    type: "scam",
    clue: "Government agencies never ask for sensitive info over text or email."
  },
  {
    id: 10,
    text: "You are our 1,000,000th visitor! Send us your home address to claim your prize.",
    type: "scam",
    clue: "Classic prize scam — no legitimate company awards prizes this way."
  },
  // ── SAFE ──
  {
    id: 11,
    text: "Your teacher shared the homework assignment in Google Classroom.",
    type: "safe",
    clue: "Expected message from a trusted, familiar source with no suspicious links."
  },
  {
    id: 12,
    text: "Reminder from your bank: We will NEVER ask for your password by email or text.",
    type: "safe",
    clue: "A safety reminder — it's not asking you for anything, just informing you."
  },
  {
    id: 13,
    text: "Your Amazon order has shipped! Track your package in the Amazon app.",
    type: "safe",
    clue: "Expected order update that directs you to the official app, not an unknown link."
  },
  {
    id: 14,
    text: "Google Alert: New sign-in to your account. Wasn't you? Secure it at google.com",
    type: "safe",
    clue: "Legitimate security alert pointing to the real google.com domain."
  },
  {
    id: 15,
    text: "Doctor's office: Your appointment is confirmed for Tuesday at 2:00 PM.",
    type: "safe",
    clue: "Expected reminder from a known source — not asking for personal info."
  },
  {
    id: 16,
    text: "Spotify: Your subscription renews on the 15th. Manage it at spotify.com/account.",
    type: "safe",
    clue: "Legitimate notification using the correct official spotify.com domain."
  },
  {
    id: 17,
    text: "School newsletter: Picture day is this Friday — dress code reminder.",
    type: "safe",
    clue: "Expected communication from a known institution with no suspicious requests."
  },
  {
    id: 18,
    text: "Library reminder: Your borrowed book is due back in 3 days.",
    type: "safe",
    clue: "Routine reminder with no links and no requests for personal information."
  },
  {
    id: 19,
    text: "Instagram: Your friend commented on your photo.",
    type: "safe",
    clue: "Normal social notification — not asking you to do anything sensitive."
  },
  {
    id: 20,
    text: "Password reset requested for your account. Ignore this email if it wasn't you.",
    type: "safe",
    clue: "Standard security email — it tells you to ignore it if you didn't request it."
  },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState(getMode);
  if (mode === "picker") return <ModePicker onSelect={setMode} />;
  if (mode === "kids")   return <KidsGame />;
  return <ProGame />;
}

// ── Mode picker ───────────────────────────────────────────────────────────────
function ModePicker({ onSelect }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      color: "white", fontFamily: "Arial, sans-serif",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{ fontSize: "56px", marginBottom: "10px" }}>🕵️</div>
      <h1 style={{ fontSize: "40px", color: "#08b6aa", margin: "0 0 6px", textAlign: "center" }}>Scam Sorter</h1>
      <p style={{ color: "#facc15", fontWeight: "bold", marginBottom: "44px", textAlign: "center" }}>How old are you?</p>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { mode: "kids", emoji: "🎮", title: "Ages 5 – 8", desc: "Spot sneaky messages in kid-friendly situations!", color: "#f472b6" },
          { mode: "pro",  emoji: "💻", title: "Ages 9 +",   desc: "Sort real-world scams and cyber threats.",          color: "#08b6aa" },
        ].map(opt => (
          <ModeCard key={opt.mode} {...opt} onClick={() => onSelect(opt.mode)} />
        ))}
      </div>
    </div>
  );
}

function ModeCard({ emoji, title, desc, color, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? `${color}22` : "#0b1120",
        border: `2px solid ${color}`, borderRadius: "24px",
        padding: "36px 40px", textAlign: "center", cursor: "pointer",
        color: "white", width: "240px",
        boxShadow: hover ? `0 0 30px ${color}55` : "none",
        transition: "all 0.2s ease",
      }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>{emoji}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold", color, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "14px", color: "#94a3b8" }}>{desc}</div>
    </button>
  );
}

// ── KIDS GAME (ages 5-8) ──────────────────────────────────────────────────────
function KidsGame() {
  const [screen, setScreen]   = useState("start");
  const [cards, setCards]     = useState([]);
  const [index, setIndex]     = useState(0);
  const [score, setScore]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [lives, setLives]     = useState(5);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong]     = useState(0);
  const [locked, setLocked]   = useState(false);
  const [result, setResult]   = useState(null);

  function startGame() {
    setCards(shuffle(KIDS_CARDS));
    setIndex(0); setScore(0); setStreak(0); setLives(5);
    setCorrect(0); setWrong(0); setLocked(false); setResult(null);
    setScreen("playing");
  }

  function answer(choice) {
    if (locked) return;
    const card = cards[index];
    const isCorrect = choice === card.type;
    setLocked(true);

    const newStreak  = isCorrect ? streak + 1 : 0;
    const newScore   = isCorrect ? score + 10 + newStreak * 2 : score;
    const newLives   = isCorrect ? lives : lives - 1;

    setResult(isCorrect ? "correct" : "wrong");
    setScore(newScore); setStreak(newStreak); setLives(newLives);
    if (isCorrect) setCorrect(c => c + 1); else setWrong(w => w + 1);

    setTimeout(() => {
      setResult(null); setLocked(false);
      const next = index + 1;
      if (newLives <= 0 || next >= cards.length) setScreen("over");
      else setIndex(next);
    }, 1800);
  }

  if (screen === "start") return <KidsStart onStart={startGame} />;
  if (screen === "over")  return <KidsOver score={score} correct={correct} wrong={wrong} onPlay={startGame} />;

  const card     = cards[index];
  const progress = (index / cards.length) * 100;
  const cardBg     = result === "correct" ? "#052e1a" : result === "wrong" ? "#3b0a0a" : "#0b1120";
  const cardBorder = result === "correct" ? "#22c55e" : result === "wrong" ? "#ef4444" : "#a78bfa";
  const cardGlow   = result === "correct" ? "0 0 40px rgba(34,197,94,0.4)" : result === "wrong" ? "0 0 40px rgba(239,68,68,0.4)" : "0 0 28px rgba(167,139,250,0.2)";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      color: "white", fontFamily: "Arial, sans-serif",
      padding: "20px 16px 40px",
    }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", color: "#a78bfa" }}>🕵️ Scam Sorter</h1>
            <p style={{ color: "#facc15", fontWeight: "bold", fontSize: "13px", margin: "2px 0 0" }}>Is this message OK or NOT OK?</p>
          </div>
          <div style={{
            background: "#0b1120", border: "1px solid rgba(167,139,250,0.4)",
            borderRadius: "14px", padding: "10px 16px",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px",
            fontSize: "12px", fontWeight: "bold", textAlign: "center",
          }}>
            <span style={{ color: "#64748b" }}>Score</span>
            <span style={{ color: "#64748b" }}>Streak</span>
            <span style={{ fontSize: "20px", color: "#a78bfa" }}>{score}</span>
            <span style={{ fontSize: "20px" }}>🔥 {streak}</span>
          </div>
        </div>

        {/* Lives + counter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "18px", letterSpacing: "3px" }}>
            {"❤️".repeat(lives)}{"🖤".repeat(5 - lives)}
          </div>
          <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "bold" }}>
            {index + 1} of {cards.length}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: "8px", background: "#1e293b", borderRadius: "999px", overflow: "hidden", marginBottom: "18px" }}>
          <div style={{
            height: "100%", width: `${progress}%`,
            background: "linear-gradient(90deg,#a78bfa,#c4b5fd)",
            borderRadius: "999px", transition: "width 0.4s ease",
          }} />
        </div>

        {/* Card */}
        <div style={{
          background: cardBg, border: `3px solid ${cardBorder}`,
          borderRadius: "28px", padding: "28px 24px",
          minHeight: "220px", boxShadow: cardGlow,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", marginBottom: "20px",
          transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        }}>
          <div style={{ fontSize: "52px", marginBottom: "14px" }}>{card.emoji}</div>
          <div style={{ fontSize: "clamp(16px,2.8vw,22px)", fontWeight: "bold", lineHeight: 1.4, color: "#f1f5f9" }}>
            {card.text}
          </div>

          {result && (
            <div style={{
              marginTop: "20px", padding: "14px 18px",
              background: result === "correct" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${result === "correct" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              borderRadius: "14px", fontSize: "15px", lineHeight: 1.5, width: "100%",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>
                {result === "correct" ? "🎉" : "😬"}
              </div>
              <span style={{ fontWeight: "bold", color: result === "correct" ? "#22c55e" : "#ef4444" }}>
                {result === "correct" ? "That's right! " : "Not quite! "}
              </span>
              <span style={{ color: "#cbd5e1" }}>{card.clue}</span>
            </div>
          )}
        </div>

        {/* Big kid-friendly buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <button onClick={() => answer("ok")} disabled={locked} style={{
            padding: "26px 16px", borderRadius: "22px",
            border: "3px solid #22c55e",
            background: locked ? "rgba(5,46,26,0.5)" : "#052e1a",
            color: locked ? "rgba(34,197,94,0.4)" : "#22c55e",
            cursor: locked ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontSize: "36px" }}>😊</span>
            <span style={{ fontSize: "22px", fontWeight: "900" }}>LOOKS OK</span>
          </button>

          <button onClick={() => answer("danger")} disabled={locked} style={{
            padding: "26px 16px", borderRadius: "22px",
            border: "3px solid #ef4444",
            background: locked ? "rgba(59,10,10,0.5)" : "#3b0a0a",
            color: locked ? "rgba(239,68,68,0.4)" : "#ef4444",
            cursor: locked ? "not-allowed" : "pointer",
            transition: "all 0.15s",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontSize: "36px" }}>🚨</span>
            <span style={{ fontSize: "22px", fontWeight: "900" }}>DANGER!</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function KidsStart({ onStart }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      color: "white", fontFamily: "Arial, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 20px",
    }}>
      <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "10px" }}>🕵️</div>
        <h1 style={{ fontSize: "38px", color: "#a78bfa", margin: "0 0 6px" }}>Scam Sorter</h1>
        <p style={{ color: "#facc15", fontWeight: "bold", fontSize: "17px", margin: "0 0 28px" }}>
          Can YOU spot the sneaky messages?
        </p>

        <div style={{
          background: "#0b1120", border: "1px solid rgba(167,139,250,0.25)",
          borderRadius: "20px", padding: "22px 26px", marginBottom: "28px",
          textAlign: "left", display: "grid", gap: "14px",
        }}>
          {[
            ["📨", "Read each message carefully"],
            ["😊", "Press LOOKS OK if it seems safe"],
            ["🚨", "Press DANGER if something feels wrong"],
            ["❤️", "You have 5 lives — wrong answers cost a heart"],
            ["💡", "After each answer you'll learn WHY!"],
          ].map(([emoji, text], i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <span style={{ fontSize: "24px", flexShrink: 0 }}>{emoji}</span>
              <span style={{ color: "#cbd5e1", fontSize: "15px" }}>{text}</span>
            </div>
          ))}
        </div>

        <button onClick={onStart} style={{
          background: "linear-gradient(135deg,#c4b5fd,#a78bfa)",
          color: "#000", border: "none",
          padding: "16px 52px", borderRadius: "18px",
          fontWeight: "bold", fontSize: "22px", cursor: "pointer",
          boxShadow: "0 0 24px rgba(167,139,250,0.4)",
        }}>
          Let's Play! 🎮
        </button>
      </div>
    </div>
  );
}

function KidsOver({ score, correct, wrong, onPlay }) {
  const total    = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const badge    = accuracy >= 80 ? "🏆" : accuracy >= 60 ? "⭐" : "💪";
  const msg      = accuracy >= 80 ? "Wow! You're a scam-spotting superstar!" : accuracy >= 60 ? "Great job! Keep practising!" : "Good try! You'll get them next time!";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      color: "white", fontFamily: "Arial, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "32px 20px",
    }}>
      <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "8px" }}>{badge}</div>
        <h1 style={{ fontSize: "36px", color: "#a78bfa", margin: "0 0 6px" }}>Well done!</h1>
        <p style={{ color: "#94a3b8", fontSize: "16px", margin: "0 0 24px" }}>{msg}</p>

        <div style={{
          background: "#0b1120", border: "2px solid rgba(167,139,250,0.35)",
          borderRadius: "20px", padding: "20px", marginBottom: "24px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px",
        }}>
          <StatBox label="Your Score"  value={score}        color="#a78bfa" />
          <StatBox label="Accuracy"    value={`${accuracy}%`} color={accuracy >= 80 ? "#22c55e" : accuracy >= 60 ? "#facc15" : "#ef4444"} />
          <StatBox label="✅ Correct"  value={correct}      color="#22c55e" />
          <StatBox label="❌ Wrong"    value={wrong}        color="#ef4444" />
        </div>

        <button onClick={onPlay} style={{
          background: "linear-gradient(135deg,#c4b5fd,#a78bfa)",
          color: "#000", border: "none",
          padding: "14px 44px", borderRadius: "16px",
          fontWeight: "bold", fontSize: "20px", cursor: "pointer",
        }}>
          Play Again! 🎮
        </button>
      </div>
    </div>
  );
}

// ── PRO GAME (ages 9+) — renamed wrapper ──────────────────────────────────────
function ProGame() {
  const [screen, setScreen]   = useState("start");
  const [cards, setCards]     = useState([]);
  const [index, setIndex]     = useState(0);
  const [score, setScore]     = useState(0);
  const [streak, setStreak]   = useState(0);
  const [lives, setLives]     = useState(3);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong]     = useState(0);
  const [locked, setLocked]   = useState(false);
  const [result, setResult]   = useState(null); // "correct" | "wrong" | null
  const [highScore, setHighScore] = useState(
    () => parseInt(localStorage.getItem("scam-hs") || "0")
  );

  function startGame() {
    setCards(shuffle(ALL_CARDS));
    setIndex(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setCorrect(0);
    setWrong(0);
    setLocked(false);
    setResult(null);
    setScreen("playing");
  }

  function answer(choice) {
    if (locked) return;
    const card = cards[index];
    const isCorrect = choice === card.type;
    setLocked(true);

    const newStreak  = isCorrect ? streak + 1 : 0;
    const newScore   = isCorrect ? score + 10 + newStreak * 2 : score;
    const newLives   = isCorrect ? lives : lives - 1;
    const newCorrect = isCorrect ? correct + 1 : correct;
    const newWrong   = isCorrect ? wrong : wrong + 1;

    setResult(isCorrect ? "correct" : "wrong");
    setScore(newScore);
    setStreak(newStreak);
    setLives(newLives);
    setCorrect(newCorrect);
    setWrong(newWrong);

    setTimeout(() => {
      setResult(null);
      setLocked(false);
      const next = index + 1;
      if (newLives <= 0 || next >= cards.length) {
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem("scam-hs", String(newScore));
        }
        setScreen("over");
      } else {
        setIndex(next);
      }
    }, 1600);
  }

  if (screen === "start") {
    return <StartScreen onStart={startGame} highScore={highScore} />;
  }

  if (screen === "over") {
    return (
      <GameOver
        score={score}
        correct={correct}
        wrong={wrong}
        total={correct + wrong}
        highScore={highScore}
        onPlay={startGame}
      />
    );
  }

  const card     = cards[index];
  const progress = (index / cards.length) * 100;

  const cardBg     = result === "correct" ? "#052e1a" : result === "wrong" ? "#3b0a0a" : "#0b1120";
  const cardBorder = result === "correct" ? "#22c55e" : result === "wrong" ? "#ef4444" : "#08b6aa";
  const cardGlow   = result === "correct"
    ? "0 0 40px rgba(34,197,94,0.35)"
    : result === "wrong"
    ? "0 0 40px rgba(239,68,68,0.35)"
    : "0 0 28px rgba(8,182,170,0.18)";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: "24px 20px 40px",
    }}>
      <div style={{ maxWidth: "780px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(26px,4vw,44px)", color: "#08b6aa" }}>
              Scam Sorter
            </h1>
            <p style={{ color: "#facc15", fontWeight: "bold", fontSize: "13px", margin: "2px 0 0" }}>
              Sort messages into SAFE or SCAM before hackers trick you.
            </p>
          </div>
          <div style={{
            background: "#0b1120",
            border: "1px solid rgba(8,182,170,0.4)",
            borderRadius: "16px",
            padding: "10px 18px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2px 20px",
            fontSize: "13px",
            fontWeight: "bold",
            textAlign: "center",
          }}>
            <span style={{ color: "#64748b" }}>Score</span>
            <span style={{ color: "#64748b" }}>Streak</span>
            <span style={{ fontSize: "22px", color: "#08b6aa" }}>{score}</span>
            <span style={{ fontSize: "22px" }}>🔥 {streak}</span>
          </div>
        </div>

        {/* Lives + card counter */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div style={{ fontSize: "20px", letterSpacing: "3px" }}>
            {"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}
          </div>
          <div style={{ color: "#64748b", fontSize: "13px", fontWeight: "bold" }}>
            Card {index + 1} of {cards.length}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: "6px", background: "#1e293b", borderRadius: "999px", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg,#08b6aa,#14d8cc)",
            borderRadius: "999px",
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* Message card */}
        <div style={{
          background: cardBg,
          border: `2px solid ${cardBorder}`,
          borderRadius: "24px",
          padding: "32px 28px",
          minHeight: "200px",
          boxShadow: cardGlow,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
          marginBottom: "18px",
          transition: "background 0.2s, border-color 0.2s, box-shadow 0.2s",
        }}>
          <div style={{
            color: "#475569",
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            fontSize: "11px",
            marginBottom: "18px",
          }}>
            📨 Incoming Message
          </div>

          <div style={{ fontSize: "clamp(17px,2.8vw,26px)", fontWeight: "900", lineHeight: 1.35 }}>
            {card.text}
          </div>

          {/* Inline feedback — shown on the card itself */}
          {result && (
            <div style={{
              marginTop: "22px",
              padding: "14px 18px",
              background: result === "correct" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${result === "correct" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              borderRadius: "14px",
              fontSize: "14px",
              lineHeight: 1.5,
            }}>
              <span style={{ fontWeight: "bold", color: result === "correct" ? "#22c55e" : "#ef4444" }}>
                {result === "correct" ? "✅ Correct! " : "❌ Not quite. "}
              </span>
              <span style={{ color: "#cbd5e1" }}>{card.clue}</span>
            </div>
          )}
        </div>

        {/* SAFE / SCAM buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <button
            onClick={() => answer("safe")}
            disabled={locked}
            style={{
              padding: "22px",
              borderRadius: "20px",
              border: "2px solid #22c55e",
              background: locked ? "rgba(5,46,26,0.5)" : "#052e1a",
              color: locked ? "rgba(34,197,94,0.4)" : "#22c55e",
              fontSize: "clamp(18px,2.5vw,26px)",
              fontWeight: "900",
              cursor: locked ? "not-allowed" : "pointer",
              boxShadow: locked ? "none" : "0 0 20px rgba(34,197,94,0.2)",
              transition: "all 0.15s",
            }}
          >
            ✅ SAFE
          </button>

          <button
            onClick={() => answer("scam")}
            disabled={locked}
            style={{
              padding: "22px",
              borderRadius: "20px",
              border: "2px solid #ef4444",
              background: locked ? "rgba(59,10,10,0.5)" : "#3b0a0a",
              color: locked ? "rgba(239,68,68,0.4)" : "#ef4444",
              fontSize: "clamp(18px,2.5vw,26px)",
              fontWeight: "900",
              cursor: locked ? "not-allowed" : "pointer",
              boxShadow: locked ? "none" : "0 0 20px rgba(239,68,68,0.2)",
              transition: "all 0.15s",
            }}
          >
            🚨 SCAM
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Start Screen ──────────────────────────────────────────────────────────────
function StartScreen({ onStart, highScore }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      color: "white",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
    }}>
      <div style={{ maxWidth: "580px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "60px", marginBottom: "10px" }}>🕵️</div>
        <h1 style={{ fontSize: "48px", color: "#08b6aa", margin: "0 0 8px" }}>Scam Sorter</h1>
        <p style={{ color: "#facc15", fontWeight: "bold", fontSize: "17px", margin: "0 0 30px" }}>
          Sort messages into SAFE or SCAM before hackers trick you.
        </p>

        <div style={{
          background: "#0b1120",
          border: "1px solid rgba(8,182,170,0.25)",
          borderRadius: "20px",
          padding: "22px 26px",
          marginBottom: "28px",
          textAlign: "left",
          display: "grid",
          gap: "14px",
        }}>
          {[
            ["📨", "Read each incoming message carefully"],
            ["🚨", <>Tap <b style={{ color: "#ef4444" }}>SCAM</b> or <b style={{ color: "#22c55e" }}>SAFE</b> — wrong answers cost a life ❤️</>],
            ["🔥", "Build a streak to earn bonus points"],
            ["❤️", "You have 3 lives — lose them all and the mission ends!"],
            ["💡", "Read the explanation after each answer to learn why"],
          ].map(([emoji, text], i) => (
            <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "20px", flexShrink: 0 }}>{emoji}</span>
              <span style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        {highScore > 0 && (
          <div style={{ color: "#facc15", fontWeight: "bold", fontSize: "15px", marginBottom: "20px" }}>
            🏆 Best Score: {highScore}
          </div>
        )}

        <button onClick={onStart} style={{
          background: "linear-gradient(135deg,#14d8cc,#08b6aa)",
          color: "#000",
          border: "none",
          padding: "15px 48px",
          borderRadius: "16px",
          fontWeight: "bold",
          fontSize: "20px",
          cursor: "pointer",
          boxShadow: "0 0 24px rgba(20,216,204,0.4)",
        }}>
          Start Mission
        </button>
      </div>
    </div>
  );
}

// ── Game Over Screen ──────────────────────────────────────────────────────────
function GameOver({ score, correct, wrong, total, highScore, onPlay }) {
  const accuracy  = total > 0 ? Math.round((correct / total) * 100) : 0;
  const isNewHigh = score >= highScore && score > 0;
  const badge     = accuracy >= 80 ? "🏆" : accuracy >= 60 ? "🛡️" : "😅";
  const msg       = accuracy >= 80
    ? "Outstanding! You're a scam-spotting expert."
    : accuracy >= 60
    ? "Good work — keep practising to sharpen your skills."
    : "Scammers got you this time. Try again!";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      color: "white",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
    }}>
      <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "8px" }}>{badge}</div>
        <h1 style={{ fontSize: "38px", color: "#08b6aa", margin: "0 0 6px" }}>Mission Complete!</h1>
        <p style={{ color: "#94a3b8", fontSize: "15px", margin: "0 0 24px" }}>{msg}</p>

        {isNewHigh && (
          <div style={{
            background: "rgba(250,204,21,0.1)",
            border: "1px solid #facc15",
            borderRadius: "12px",
            padding: "10px 16px",
            color: "#facc15",
            fontWeight: "bold",
            marginBottom: "20px",
            fontSize: "15px",
          }}>
            🌟 New High Score!
          </div>
        )}

        {/* Stats grid */}
        <div style={{
          background: "#0b1120",
          border: "2px solid rgba(8,182,170,0.35)",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}>
          <StatBox label="Final Score"  value={score}        color="#08b6aa" />
          <StatBox label="Accuracy"     value={`${accuracy}%`} color={accuracy >= 80 ? "#22c55e" : accuracy >= 60 ? "#facc15" : "#ef4444"} />
          <StatBox label="✅ Correct"   value={correct}      color="#22c55e" />
          <StatBox label="❌ Wrong"     value={wrong}        color="#ef4444" />
        </div>

        {!isNewHigh && highScore > 0 && (
          <div style={{ color: "#475569", fontSize: "13px", marginBottom: "16px" }}>
            Best: {highScore}
          </div>
        )}

        <button onClick={onPlay} style={{
          background: "linear-gradient(135deg,#14d8cc,#08b6aa)",
          color: "#000",
          border: "none",
          padding: "14px 44px",
          borderRadius: "14px",
          fontWeight: "bold",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(20,216,204,0.35)",
        }}>
          Play Again
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: "#020617",
      borderRadius: "14px",
      padding: "16px 12px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "28px", fontWeight: "bold", color }}>{value}</div>
      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{label}</div>
    </div>
  );
}
