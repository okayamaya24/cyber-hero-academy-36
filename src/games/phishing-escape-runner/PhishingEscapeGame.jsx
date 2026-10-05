import { useEffect, useState, useRef, useCallback } from "react";
import ByteBuddy, { byteOpener } from "../shared/ByteBuddy";

// Inject lane-dash animation styles once — self-contained so no global CSS needed
const LANE_STYLE = `
  @keyframes laneScroll {
    from { transform: translateY(0); }
    to   { transform: translateY(40px); }
  }
  .lane-dash {
    position: absolute; left: 50%; top: -40px;
    transform: translateX(-50%);
    width: 2px; height: calc(100% + 80px);
    background: repeating-linear-gradient(
      to bottom,
      rgba(8,182,170,0.25) 0px, rgba(8,182,170,0.25) 18px,
      transparent 18px, transparent 40px
    );
    animation: laneScroll 0.35s linear infinite;
  }
`;
if (typeof document !== "undefined" && !document.getElementById("phishing-escape-styles")) {
  const s = document.createElement("style");
  s.id = "phishing-escape-styles";
  s.textContent = LANE_STYLE;
  document.head.appendChild(s);
}

const LANES = [0, 1, 2];
const MAX_LANE_W = 150;
const ITEM_H = 96;
const PLAYER_SIZE = 84;
const PLAYER_BOTTOM = 18;

// Every item is a message kids have to READ. Nothing is color-coded, so the
// only way to win is to spot the trick.
const MESSAGES = [
  // Tricks: dodge these
  { icon: "🎮", text: "FREE ROBUX!! click here 👉", danger: true, why: "Free Robux offers are always tricks to steal your account." },
  { icon: "⚠️", text: "Your account will be BANNED. Log in now!", danger: true, why: "Scary countdowns with a link are how scammers rush you." },
  { icon: "🎁", text: "You won an iPhone! Claim it now", danger: true, why: "If it's too good to be true, it's a trick." },
  { icon: "🎮", text: "send me ur password for a free skin", danger: true, why: "Never share your password, not even for free stuff." },
  { icon: "📩", text: "is this you in this video?? 😂 bit.ly/x2k", danger: true, why: "\"Is this you?\" plus a short link is a classic trick." },
  { icon: "💾", text: "Download FreeVBucks.exe", danger: true, why: "Downloads promising free stuff hide viruses." },
  { icon: "📩", text: "what's ur address? i'll mail u a gift", danger: true, why: "Never tell online strangers where you live." },
  { icon: "📩", text: "don't tell your parents we're talking ok?", danger: true, why: "Secrets from your parents = danger. Tell a grown-up!" },
  { icon: "🚨", text: "3 VIRUSES FOUND! Tap to clean now", danger: true, why: "Scary pop-ups are fake. Close them and tell a grown-up." },
  { icon: "💬", text: "This is Support. Reply with your 6-digit code", danger: true, why: "Codes sent to you are keys. Real support never asks for them." },
  // Safe: catch these for points
  { icon: "💬", text: "Mom: dinner at 6 🍝", danger: false },
  { icon: "💬", text: "Coach: practice moved to 4pm", danger: false },
  { icon: "📧", text: "Teacher: great job on your project!", danger: false },
  { icon: "💬", text: "Grandma: love you kiddo ❤️", danger: false },
  { icon: "🎮", text: "Teammate: nice shot!!", danger: false },
  { icon: "📩", text: "Friend: wanna play after school?", danger: false },
  { icon: "📧", text: "Library: your book is due Friday", danger: false },
];

function randomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

function readHighScore() {
  try {
    return parseInt(localStorage.getItem("phishing-hs") || "0");
  } catch {
    return 0;
  }
}

export default function App() {
  const [gameState, setGameState]   = useState("start");
  const [playerLane, setPlayerLane] = useState(1);
  const [obstacles, setObstacles]   = useState([]);
  const [score, setScore]           = useState(0);
  const [lives, setLives]           = useState(3);
  const [hitFlash, setHitFlash]     = useState(false);
  const [invulnerable, setInvulnerable] = useState(false);
  const [level, setLevel]           = useState(1);
  const [highScore, setHighScore]   = useState(readHighScore);
  const [isNewHigh, setIsNewHigh]   = useState(false);
  const [toast, setToast]           = useState(null);     // { good, text }
  const [fooledBy, setFooledBy]     = useState([]);       // tricks that cost a life, for the recap
  const [laneW, setLaneW]           = useState(MAX_LANE_W);
  const [trackH, setTrackH]         = useState(600);

  // Refs — read inside intervals without causing restarts
  const playerLaneRef      = useRef(1);
  const collisionLockedRef = useRef(false);
  const livesRef           = useRef(3);
  const scoreRef           = useRef(0);
  const levelRef           = useRef(1);
  const gameStateRef       = useRef("start");
  const obstaclesRef       = useRef([]);
  const trackRef           = useRef(null);
  const trackHRef          = useRef(600);
  const toastTimerRef      = useRef(null);

  const gameW = laneW * 3;

  function moveLane(lane) {
    const clamped = Math.max(0, Math.min(2, lane));
    playerLaneRef.current = clamped;
    setPlayerLane(clamped);
  }

  const showToast = useCallback((good, text) => {
    clearTimeout(toastTimerRef.current);
    setToast({ good, text });
    toastTimerRef.current = setTimeout(() => setToast(null), good ? 900 : 3200);
  }, []);

  // ── Fit the track to the screen (laptops, tablets, phones) ──
  useEffect(() => {
    function measure() {
      setLaneW(Math.min(MAX_LANE_W, Math.floor((window.innerWidth - 24) / 3)));
      if (trackRef.current) {
        const h = trackRef.current.clientHeight;
        trackHRef.current = h;
        setTrackH(h);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [gameState]);

  // ── Keyboard (empty deps — reads only refs) ──
  useEffect(() => {
    function onKey(e) {
      const gs = gameStateRef.current;
      if ((gs === "start" || gs === "over") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        startGame(); return;
      }
      if (gs !== "playing") return;
      if (e.key === "ArrowLeft")  moveLane(playerLaneRef.current - 1);
      if (e.key === "ArrowRight") moveLane(playerLaneRef.current + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Level ramp every 20 s ──
  useEffect(() => {
    if (gameState !== "playing") return;
    const id = setInterval(() => {
      setLevel(l => {
        const next = Math.min(l + 1, 8);
        levelRef.current = next;
        return next;
      });
    }, 20000);
    return () => clearInterval(id);
  }, [gameState]);

  // ── Spawn: never two in the same row, so there's always a way through ──
  useEffect(() => {
    if (gameState !== "playing") return;
    let tid;
    function spawn() {
      const newObstacle = {
        id: Date.now() + Math.random(),
        lane: Math.floor(Math.random() * 3),
        y: -ITEM_H,
        ...randomMessage(),
      };
      obstaclesRef.current = [...obstaclesRef.current, newObstacle];
      setObstacles(obstaclesRef.current);
      tid = setTimeout(spawn, Math.max(1100, 2000 - (levelRef.current - 1) * 120));
    }
    tid = setTimeout(spawn, 600);
    return () => clearTimeout(tid);
  }, [gameState]);

  // ── Move + collide ──
  useEffect(() => {
    if (gameState !== "playing") return;

    const id = setInterval(() => {
      let bonus = 0;
      let hitBy = null;
      // Slow enough to read: about 4–5 seconds top to bottom at level 1
      const speed = 6 + (levelRef.current - 1) * 1.2;
      const H = trackHRef.current;
      const playerTop = H - PLAYER_BOTTOM - PLAYER_SIZE;

      const next = obstaclesRef.current
        .map(o => ({ ...o, y: o.y + speed }))
        .filter(o => o.y < H + 20)
        .filter(o => {
          const collides =
            o.lane === playerLaneRef.current &&
            o.y + ITEM_H > playerTop + 14 &&
            o.y < playerTop + PLAYER_SIZE - 14;
          if (!collides) return true;
          if (o.danger) {
            if (collisionLockedRef.current) return true; // still flashing — let it pass
            hitBy = hitBy ?? o;
          } else {
            bonus += 10;
          }
          return false;
        });

      obstaclesRef.current = next;
      setObstacles(next);

      if (bonus > 0) {
        scoreRef.current += bonus;
        setScore(s => s + bonus);
        showToast(true, "Safe message! +10 ✅");
      }

      if (hitBy) {
        collisionLockedRef.current = true;
        setInvulnerable(true);
        showToast(false, `"${hitBy.text}" was a trick! ${hitBy.why}`);
        setFooledBy(list => (list.some(t => t.text === hitBy.text) ? list : [...list, hitBy]));

        const newLives = livesRef.current - 1;
        livesRef.current = newLives;
        setLives(newLives);

        if (newLives <= 0) {
          gameStateRef.current = "over";
          setGameState("over");
        } else {
          setHitFlash(true);
          setTimeout(() => setHitFlash(false), 180);
          setTimeout(() => {
            collisionLockedRef.current = false;
            setInvulnerable(false);
          }, 1200);
        }
      }

      scoreRef.current += 1;
      setScore(s => s + 1);
    }, 50);

    return () => clearInterval(id);
  }, [gameState, showToast]);

  // ── Save high score ──
  useEffect(() => {
    if (gameState !== "over") return;
    const final = scoreRef.current;
    if (final > highScore) {
      setHighScore(final);
      setIsNewHigh(true);
      try { localStorage.setItem("phishing-hs", String(final)); } catch { /* storage blocked */ }
    } else {
      setIsNewHigh(false);
    }
  }, [gameState]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  function startGame() {
    obstaclesRef.current = [];
    setObstacles([]);
    setScore(0);         scoreRef.current      = 0;
    setLives(3);         livesRef.current      = 3;
    setLevel(1);         levelRef.current      = 1;
    setHitFlash(false);
    setInvulnerable(false);
    setToast(null);
    setFooledBy([]);
    collisionLockedRef.current = false;
    moveLane(1);
    gameStateRef.current = "playing";
    setGameState("playing");
  }

  // Tap or click a lane to move there (tablets, touchscreens, the future app)
  function onTrackPointerDown(e) {
    if (gameStateRef.current !== "playing" || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    moveLane(Math.floor(((e.clientX - rect.left) / rect.width) * 3));
  }

  const playerBg   = hitFlash     ? "linear-gradient(135deg,#ef4444,#991b1b)"
                   : invulnerable ? "linear-gradient(135deg,#a78bfa,#7c3aed)"
                                  : "linear-gradient(135deg,#14d8cc,#08b6aa)";
  const playerGlow = hitFlash     ? "0 0 35px rgba(239,68,68,0.9)"
                   : invulnerable ? "0 0 25px rgba(167,139,250,0.8)"
                                  : "0 0 28px rgba(20,216,204,0.5)";

  const arrowBtn = {
    flex: 1, padding: "14px 0", borderRadius: "14px", fontSize: "26px", fontWeight: 900,
    background: "rgba(8,182,170,0.12)", border: "2px solid rgba(8,182,170,0.4)", color: "#14d8cc",
    cursor: "pointer", touchAction: "manipulation", userSelect: "none",
  };

  return (
    <div style={{
      height: "100dvh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "Arial, sans-serif", color: "white", overflow: "hidden",
    }}>

      {/* HUD */}
      <div style={{ width: `${gameW}px`, maxWidth: "100%", padding: "10px 0 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <button
            onClick={() => { window.location.href = "/missions"; }}
            style={{
              background: "none", border: "1px solid rgba(8,182,170,0.35)",
              color: "#08b6aa", borderRadius: "10px", padding: "5px 12px",
              fontSize: "12px", fontWeight: "bold", cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: "clamp(20px,5vw,28px)", color: "#08b6aa" }}>Phishing Escape</h1>
          <span style={{ width: "54px" }} />
        </div>
        {gameState === "playing" && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: "8px", padding: "8px 12px",
            background: "rgba(8,182,170,0.08)", border: "1px solid rgba(8,182,170,0.2)",
            borderRadius: "12px", fontSize: "15px", fontWeight: "bold",
          }}>
            <span>Score: <span style={{ color: "#08b6aa" }}>{score}</span></span>
            <span style={{ color: "#a78bfa", fontSize: "12px" }}>LEVEL {level}{level >= 5 ? " 🔥" : ""}</span>
            <span>{"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}</span>
          </div>
        )}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
        style={{
          position: "relative", width: `${gameW}px`, flex: 1, minHeight: "320px",
          display: "flex", borderRadius: "16px", overflow: "hidden", touchAction: "manipulation",
        }}
      >
        {LANES.map(lane => (
          <div key={lane} style={{
            width: `${laneW}px`, height: "100%", position: "relative",
            borderLeft:  lane === 0 ? "2px solid rgba(8,182,170,0.35)" : "1px solid rgba(8,182,170,0.12)",
            borderRight: lane === 2 ? "2px solid rgba(8,182,170,0.35)" : "none",
            background: "linear-gradient(180deg,rgba(8,182,170,0.025),transparent)",
            overflow: "hidden",
          }}>
            <div className="lane-dash" />
          </div>
        ))}

        {/* Falling messages — all the same neutral style, so kids have to read them */}
        {obstacles.map(o => (
          <div key={o.id} style={{
            position: "absolute",
            left: `${o.lane * laneW + 6}px`,
            top: `${o.y}px`,
            width: `${laneW - 12}px`, height: `${ITEM_H}px`, borderRadius: "14px",
            backgroundColor: "#f1f5f9", color: "#0f172a",
            border: "2px solid #94a3b8",
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "6px 8px", boxSizing: "border-box",
            boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}>
            <div style={{ fontSize: "16px", lineHeight: 1, marginBottom: "4px" }}>{o.icon}</div>
            <div style={{ fontSize: laneW < 120 ? "11px" : "12.5px", fontWeight: "bold", lineHeight: 1.25 }}>
              {o.text}
            </div>
          </div>
        ))}

        {gameState === "playing" && (
          <div style={{
            position: "absolute", bottom: `${PLAYER_BOTTOM}px`,
            left: `${playerLane * laneW + (laneW - PLAYER_SIZE) / 2}px`,
            width: `${PLAYER_SIZE}px`, height: `${PLAYER_SIZE}px`, borderRadius: "22px",
            background: playerBg, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "40px",
            boxShadow: playerGlow, transition: "left 0.12s ease",
            pointerEvents: "none",
          }}>
            🛡️
          </div>
        )}

        {/* What just happened, and why */}
        {gameState === "playing" && toast && (
          <div style={{ position: "absolute", top: "8px", left: "8px", right: "8px", zIndex: 50, pointerEvents: "none" }}>
            <ByteBuddy
              mood={toast.good ? "happy" : "oops"}
              title={toast.good ? toast.text : byteOpener(false, toast.text)}
              size={48}
              compact
            >
              {toast.good ? null : toast.text}
            </ByteBuddy>
          </div>
        )}

        {/* Start screen */}
        {gameState === "start" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(2,6,23,0.92)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "14px", zIndex: 100, padding: "16px",
          }}>
            <h2 style={{ color: "#08b6aa", fontSize: "24px", margin: 0 }}>Read fast, Guardian!</h2>
            <div style={{ width: "100%", maxWidth: "340px" }}>
              <ByteBuddy mood="think" title="I'll watch your back! 🦊" size={56} compact>
                If a trick gets through, I'll tell you what gave it away.
              </ByteBuddy>
            </div>
            <div style={{
              background: "rgba(8,182,170,0.08)", border: "1px solid rgba(8,182,170,0.25)",
              borderRadius: "14px", padding: "14px 18px", fontSize: "14px",
              color: "#cbd5e1", lineHeight: 1.8, textAlign: "center", width: "100%", maxWidth: "340px",
              boxSizing: "border-box",
            }}>
              <div>📨 Messages fall toward you. <b>Read them!</b></div>
              <div>✅ <b>Catch</b> safe messages for +10</div>
              <div>🚫 <b>Dodge</b> tricks or lose a ❤️</div>
              <div style={{ color: "#94a3b8", marginTop: "4px" }}>Tap a lane, use ◀ ▶, or the arrow keys</div>
            </div>
            {highScore > 0 && (
              <div style={{ color: "#facc15", fontWeight: "bold", fontSize: "15px" }}>🏆 Best: {highScore}</div>
            )}
            <button onClick={startGame} style={{
              background: "linear-gradient(135deg,#14d8cc,#08b6aa)", color: "#000",
              border: "none", padding: "13px 36px", borderRadius: "14px",
              fontWeight: "bold", fontSize: "17px", cursor: "pointer",
              boxShadow: "0 0 20px rgba(20,216,204,0.4)",
            }}>
              Start Mission
            </button>
          </div>
        )}

        {/* Game over, with a recap of the tricks that got through */}
        {gameState === "over" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100, padding: "12px",
          }}>
            <div style={{
              background: "#04142d", border: "2px solid #ef4444", borderRadius: "22px",
              padding: "22px 18px", textAlign: "center", width: "100%", maxWidth: "380px",
              maxHeight: "100%", overflowY: "auto", boxSizing: "border-box",
              boxShadow: "0 0 40px rgba(239,68,68,0.25)",
            }}>
              <h1 style={{ color: "#ef4444", fontSize: "26px", margin: "0 0 6px" }}>SYSTEM BREACH</h1>
              <p style={{ color: "#fff", fontSize: "19px", margin: "0 0 2px" }}>
                Score: <strong>{scoreRef.current}</strong>
              </p>
              {isNewHigh
                ? <p style={{ color: "#facc15", fontWeight: "bold", margin: "2px 0 12px" }}>🏆 New High Score!</p>
                : <p style={{ color: "#64748b", fontSize: "13px", margin: "2px 0 12px" }}>Best: {highScore}</p>
              }
              {fooledBy.length > 0 && (
                <div style={{ textAlign: "left", marginBottom: "14px" }}>
                  <div style={{ marginBottom: "10px" }}>
                    <ByteBuddy mood="oops" title="Let's learn from these! 🔍" size={48} compact>
                      Here are the tricks that got past you. Spot them next time!
                    </ByteBuddy>
                  </div>
                  {fooledBy.map(t => (
                    <div key={t.text} style={{
                      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: "10px", padding: "8px 10px", marginBottom: "6px", fontSize: "13px", lineHeight: 1.4,
                    }}>
                      <div style={{ fontWeight: "bold", color: "#fecaca" }}>"{t.text}"</div>
                      <div style={{ color: "#cbd5e1" }}>{t.why}</div>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={startGame} style={{
                background: "linear-gradient(135deg,#14d8cc,#08b6aa)", color: "#000",
                border: "none", padding: "12px 28px", borderRadius: "12px",
                fontWeight: "bold", fontSize: "15px", cursor: "pointer",
              }}>
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Big touch buttons */}
      <div style={{ display: "flex", gap: "10px", width: `${gameW}px`, padding: "8px 0 10px", flexShrink: 0 }}>
        <button
          aria-label="Move left"
          style={arrowBtn}
          onPointerDown={(e) => { e.preventDefault(); moveLane(playerLaneRef.current - 1); }}
        >
          ◀
        </button>
        <button
          aria-label="Move right"
          style={arrowBtn}
          onPointerDown={(e) => { e.preventDefault(); moveLane(playerLaneRef.current + 1); }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
