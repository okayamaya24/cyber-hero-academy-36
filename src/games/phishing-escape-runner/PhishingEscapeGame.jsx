import { useEffect, useState, useRef } from "react";

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
    animation: laneScroll 0.22s linear infinite;
  }
`;
if (typeof document !== "undefined" && !document.getElementById("phishing-escape-styles")) {
  const s = document.createElement("style");
  s.id = "phishing-escape-styles";
  s.textContent = LANE_STYLE;
  document.head.appendChild(s);
}

const LANES = [0, 1, 2];
const LANE_W = 130;
const GAME_W = LANE_W * 3;

const OBSTACLE_TYPES = [
  { emoji: "🎣", label: "Phishing Email", danger: true },
  { emoji: "🦠", label: "Malware",        danger: true },
  { emoji: "⚠️",  label: "Scam Link",     danger: true },
  { emoji: "🛡️",  label: "Safe Shield",   danger: false },
  { emoji: "✅",  label: "Safe Link",     danger: false },
];

function randomObstacle() {
  return OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
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
  const [highScore, setHighScore]   = useState(
    () => parseInt(localStorage.getItem("phishing-hs") || "0")
  );
  const [isNewHigh, setIsNewHigh] = useState(false);

  // Refs — read inside intervals without causing restarts
  const playerLaneRef      = useRef(1);
  const collisionLockedRef = useRef(false);
  const invulnerableRef    = useRef(false);
  const livesRef           = useRef(3);
  const scoreRef           = useRef(0);
  const levelRef           = useRef(1);
  const gameStateRef       = useRef("start");
  const obstaclesRef       = useRef([]);

  function moveLane(lane) {
    playerLaneRef.current = lane;
    setPlayerLane(lane);
  }

  // ── Keyboard (empty deps — reads only refs) ──
  useEffect(() => {
    function onKey(e) {
      const gs = gameStateRef.current;
      if ((gs === "start" || gs === "over") && (e.key === "Enter" || e.key === " ")) {
        startGame(); return;
      }
      if (gs !== "playing") return;
      if (e.key === "ArrowLeft")  moveLane(Math.max(0, playerLaneRef.current - 1));
      if (e.key === "ArrowRight") moveLane(Math.min(2, playerLaneRef.current + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Level ramp every 15 s ──
  useEffect(() => {
    if (gameState !== "playing") return;
    const id = setInterval(() => {
      setLevel(l => {
        const next = Math.min(l + 1, 10);
        levelRef.current = next;
        return next;
      });
    }, 15000);
    return () => clearInterval(id);
  }, [gameState]);

  // ── Spawn — self-adjusting timeout so rate auto-updates with level ──
  useEffect(() => {
    if (gameState !== "playing") return;
    let tid;
    function spawn() {
      const newObstacle = { id: Date.now() + Math.random(), lane: Math.floor(Math.random() * 3), y: -100, ...randomObstacle() };
      obstaclesRef.current = [...obstaclesRef.current, newObstacle];
      setObstacles(obstaclesRef.current);
      tid = setTimeout(spawn, Math.max(600, 1500 - (levelRef.current - 1) * 120));
    }
    tid = setTimeout(spawn, Math.max(600, 1500 - (levelRef.current - 1) * 120));
    return () => clearTimeout(tid);
  }, [gameState]);

  // ── Move + collide — only depends on gameState ──
  useEffect(() => {
    if (gameState !== "playing") return;

    const id = setInterval(() => {
      // Read from ref (not state) so this never needs to re-register,
      // and side effects only run once — not doubled by React Strict Mode.
      let bonus = 0;
      let hit   = false;
      const speed = 10 + (levelRef.current - 1) * 2;

      const next = obstaclesRef.current
        .map(o => ({ ...o, y: o.y + speed }))
        .filter(o => o.y < 950)
        .filter(o => {
          const collides = o.lane === playerLaneRef.current && o.y > 610 && o.y < 760;
          if (!collides) return true;
          if (o.danger && !collisionLockedRef.current && !hit) hit = true;
          if (!o.danger) bonus += 10;
          return false;
        });

      obstaclesRef.current = next;
      setObstacles(next);

      if (bonus > 0) {
        scoreRef.current += bonus;
        setScore(s => s + bonus);
      }

      if (hit) {
        collisionLockedRef.current = true;
        invulnerableRef.current    = true;
        setInvulnerable(true);

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
            invulnerableRef.current    = false;
            setInvulnerable(false);
          }, 1000);
        }
      }

      scoreRef.current += 1;
      setScore(s => s + 1);
    }, 50);

    return () => clearInterval(id);
  }, [gameState]);

  // ── Save high score ──
  useEffect(() => {
    if (gameState !== "over") return;
    const final = scoreRef.current;
    if (final > highScore) {
      setHighScore(final);
      setIsNewHigh(true);
      localStorage.setItem("phishing-hs", String(final));
    } else {
      setIsNewHigh(false);
    }
  }, [gameState]);

  function startGame() {
    obstaclesRef.current = [];
    setObstacles([]);
    setScore(0);         scoreRef.current      = 0;
    setLives(3);         livesRef.current      = 3;
    setLevel(1);         levelRef.current      = 1;
    setHitFlash(false);
    setInvulnerable(false);
    collisionLockedRef.current = false;
    invulnerableRef.current    = false;
    moveLane(1);
    gameStateRef.current = "playing";
    setGameState("playing");
  }

  const playerBg   = hitFlash     ? "linear-gradient(135deg,#ef4444,#991b1b)"
                   : invulnerable ? "linear-gradient(135deg,#a78bfa,#7c3aed)"
                                  : "linear-gradient(135deg,#14d8cc,#08b6aa)";
  const playerGlow = hitFlash     ? "0 0 35px rgba(239,68,68,0.9)"
                   : invulnerable ? "0 0 25px rgba(167,139,250,0.8)"
                                  : "0 0 28px rgba(20,216,204,0.5)";

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "Arial, sans-serif", color: "white", overflow: "hidden",
    }}>

      {/* HUD */}
      <div style={{ width: `${GAME_W}px`, padding: "18px 0 10px" }}>
        <h1 style={{ margin: 0, fontSize: "40px", color: "#08b6aa", textAlign: "center", letterSpacing: "-0.5px" }}>
          Phishing Escape
        </h1>
        <p style={{ color: "#facc15", fontWeight: "bold", textAlign: "center", margin: "4px 0 0", fontSize: "13px" }}>
          Dodge cyber threats. Collect safe items for bonus points.
        </p>
        {gameState === "playing" && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: "14px", padding: "10px 14px",
            background: "rgba(8,182,170,0.08)", border: "1px solid rgba(8,182,170,0.2)",
            borderRadius: "12px", fontSize: "16px", fontWeight: "bold",
          }}>
            <span>Score: <span style={{ color: "#08b6aa" }}>{score}</span></span>
            <span style={{ color: "#a78bfa", fontSize: "13px" }}>LEVEL {level}{level >= 5 ? " 🔥" : ""}</span>
            <span>{"❤️".repeat(lives)}{"🖤".repeat(3 - lives)}</span>
          </div>
        )}
      </div>

      {/* Track */}
      <div style={{
        position: "relative", width: `${GAME_W}px`, height: "calc(100vh - 130px)",
        display: "flex", borderRadius: "0 0 16px 16px", overflow: "hidden",
      }}>

        {LANES.map(lane => (
          <div key={lane} style={{
            width: `${LANE_W}px`, height: "100%", position: "relative",
            borderLeft:  lane === 0 ? "2px solid rgba(8,182,170,0.35)" : "1px solid rgba(8,182,170,0.12)",
            borderRight: lane === 2 ? "2px solid rgba(8,182,170,0.35)" : "none",
            background: "linear-gradient(180deg,rgba(8,182,170,0.025),transparent)",
            overflow: "hidden",
          }}>
            <div className="lane-dash" />
          </div>
        ))}

        {obstacles.map(o => (
          <div key={o.id} style={{
            position: "absolute",
            left: `${o.lane * LANE_W + (LANE_W - 88) / 2}px`,
            top: `${o.y}px`,
            width: "88px", height: "88px", borderRadius: "18px",
            backgroundColor: "#0b1929",
            border: `2px solid ${o.danger ? "#ef4444" : "#22c55e"}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            boxShadow: o.danger ? "0 0 16px rgba(239,68,68,0.45)" : "0 0 16px rgba(34,197,94,0.45)",
          }}>
            <div style={{ fontSize: "32px", lineHeight: 1 }}>{o.emoji}</div>
            <div style={{ fontSize: "10px", marginTop: "5px", textAlign: "center", padding: "0 5px", color: "#cbd5e1" }}>
              {o.label}
            </div>
          </div>
        ))}

        {gameState === "playing" && (
          <div style={{
            position: "absolute", bottom: "36px",
            left: `${playerLane * LANE_W + (LANE_W - 98) / 2}px`,
            width: "98px", height: "98px", borderRadius: "22px",
            background: playerBg, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "46px",
            boxShadow: playerGlow, transition: "left 0.12s ease",
          }}>
            🛡️
          </div>
        )}

        {/* Start screen */}
        {gameState === "start" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(2,6,23,0.9)",
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "16px", zIndex: 100,
          }}>
            <div style={{ fontSize: "60px" }}>🛡️</div>
            <h2 style={{ color: "#08b6aa", fontSize: "26px", margin: 0 }}>Ready to defend?</h2>
            <div style={{
              background: "rgba(8,182,170,0.08)", border: "1px solid rgba(8,182,170,0.25)",
              borderRadius: "14px", padding: "16px 22px", fontSize: "13px",
              color: "#94a3b8", lineHeight: "2", textAlign: "center", width: "80%",
            }}>
              <div>⬅️ ➡️ Arrow keys to switch lanes</div>
              <div><span style={{ color: "#ef4444" }}>🎣 🦠 ⚠️</span> Dodge — costs a life</div>
              <div><span style={{ color: "#22c55e" }}>✅ 🛡️</span> Collect — +10 bonus points</div>
              <div style={{ color: "#a78bfa", marginTop: "4px" }}>Speed increases every 15 seconds</div>
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
            <div style={{ color: "#475569", fontSize: "12px" }}>or press Enter / Space</div>
          </div>
        )}

        {/* Game over */}
        {gameState === "over" && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.82)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100,
          }}>
            <div style={{
              background: "#04142d", border: "2px solid #ef4444", borderRadius: "24px",
              padding: "36px 32px", textAlign: "center", width: "86%",
              boxShadow: "0 0 40px rgba(239,68,68,0.25)",
            }}>
              <div style={{ fontSize: "40px", marginBottom: "8px" }}>💀</div>
              <h1 style={{ color: "#ef4444", fontSize: "30px", margin: "0 0 10px" }}>SYSTEM BREACH</h1>
              <p style={{ color: "#fff", fontSize: "20px", margin: "0 0 4px" }}>
                Score: <strong>{scoreRef.current}</strong>
              </p>
              {isNewHigh
                ? <p style={{ color: "#facc15", fontWeight: "bold", margin: "4px 0 16px" }}>🏆 New High Score!</p>
                : <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 16px" }}>Best: {highScore}</p>
              }
              <button onClick={startGame} style={{
                background: "linear-gradient(135deg,#14d8cc,#08b6aa)", color: "#000",
                border: "none", padding: "12px 28px", borderRadius: "12px",
                fontWeight: "bold", fontSize: "15px", cursor: "pointer",
              }}>
                Restart Mission
              </button>
              <div style={{ color: "#475569", fontSize: "12px", marginTop: "10px" }}>or press Enter / Space</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
