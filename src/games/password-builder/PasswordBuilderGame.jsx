import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── Shared strength logic ─────────────────────────────────────────────────
function calculateStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)                score += 25;
  if (/[A-Z]/.test(password))             score += 20;
  if (/[0-9]/.test(password))             score += 20;
  if (/[^A-Za-z0-9]/.test(password))      score += 20;
  if (password.length >= 12)              score += 15;
  return Math.min(score, 100);
}

function getStrengthData(score, empty) {
  if (empty) return { label: "", color: "#334155", message: "Start typing to check your password strength.", glow: "transparent" };
  if (score < 30) return { label: "WEAK",   color: "#ef4444", message: "Hackers can crack this in seconds.",  glow: "#ef444440" };
  if (score < 70) return { label: "MEDIUM", color: "#facc15", message: "Better — but still vulnerable.",     glow: "#facc1540" };
  if (score < 85) return { label: "STRONG", color: "#22c55e", message: "Good password! Hard to crack.",      glow: "#22c55e40" };
  return                 { label: "SHIELD", color: "#08b6aa", message: "Excellent cyber defense! 🛡️",       glow: "#08b6aa40" };
}

function getCrackTime(score, empty) {
  if (empty)      return "—";
  if (score < 30) return "Under a second";
  if (score < 50) return "A few minutes";
  if (score < 70) return "Hours to days";
  if (score < 85) return "Months to years";
  return                 "Centuries 🔒";
}

// ─── Kids click-to-build data ──────────────────────────────────────────────
const WORD_TILES = [
  { word: "CAT",   emoji: "🐱", color: "#f472b6" },
  { word: "DOG",   emoji: "🐶", color: "#fb923c" },
  { word: "SUN",   emoji: "☀️",  color: "#facc15" },
  { word: "STAR",  emoji: "⭐",  color: "#facc15" },
  { word: "MOON",  emoji: "🌙",  color: "#a78bfa" },
  { word: "FIRE",  emoji: "🔥",  color: "#ef4444" },
  { word: "ICE",   emoji: "❄️",  color: "#67e8f9" },
  { word: "ZAP",   emoji: "⚡",  color: "#fbbf24" },
  { word: "HERO",  emoji: "🦸",  color: "#60a5fa" },
  { word: "NINJA", emoji: "🥷",  color: "#94a3b8" },
  { word: "SUPER", emoji: "💪",  color: "#34d399" },
  { word: "GOLD",  emoji: "🏆",  color: "#fbbf24" },
  { word: "FOX",   emoji: "🦊",  color: "#fb923c" },
  { word: "BEE",   emoji: "🐝",  color: "#facc15" },
  { word: "ROCK",  emoji: "🪨",  color: "#94a3b8" },
  { word: "COOL",  emoji: "😎",  color: "#08b6aa" },
];

const NUMBER_TILES = [
  { val: "1", emoji: "1️⃣" }, { val: "2", emoji: "2️⃣" }, { val: "3", emoji: "3️⃣" },
  { val: "4", emoji: "4️⃣" }, { val: "5", emoji: "5️⃣" }, { val: "6", emoji: "6️⃣" },
  { val: "7", emoji: "7️⃣" }, { val: "8", emoji: "8️⃣" }, { val: "9", emoji: "9️⃣" },
  { val: "0", emoji: "0️⃣" }, { val: "42", emoji: "✨" }, { val: "99", emoji: "💯" },
];

const SYMBOL_TILES = [
  { val: "!", label: "!", desc: "Bang" },
  { val: "@", label: "@", desc: "At" },
  { val: "#", label: "#", desc: "Hash" },
  { val: "$", label: "$", desc: "Dollar" },
  { val: "*", label: "*", desc: "Star" },
  { val: "?", label: "?", desc: "Question" },
  { val: "&", label: "&", desc: "And" },
  { val: "+", label: "+", desc: "Plus" },
];

const CASTLE_STAGES = [
  { emoji: "🏚️", label: "No walls yet!",    color: "#64748b" },
  { emoji: "🧱", label: "Building walls…",  color: "#f97316" },
  { emoji: "🏰", label: "Castle rising!",   color: "#facc15" },
  { emoji: "🏯", label: "Almost safe!",     color: "#22c55e" },
  { emoji: "⚔️🏰", label: "Fortress mode!", color: "#08b6aa" },
];

function getCastleStage(score) {
  if (score === 0)  return CASTLE_STAGES[0];
  if (score < 30)   return CASTLE_STAGES[1];
  if (score < 60)   return CASTLE_STAGES[2];
  if (score < 85)   return CASTLE_STAGES[3];
  return CASTLE_STAGES[4];
}

// ─── Age detection ─────────────────────────────────────────────────────────
function getMode(ageProp) {
  // Prop takes priority (lesson mode), then URL param
  if (ageProp !== undefined) {
    const a = parseInt(ageProp);
    if (a >= 5 && a <= 8) return "kids";
    if (a > 8)            return "pro";
  }
  const params = new URLSearchParams(window.location.search);
  const age = parseInt(params.get("age") || "0");
  if (age >= 5 && age <= 8) return "kids";
  if (age > 8)              return "pro";
  return "picker";
}

// ─── Root component ────────────────────────────────────────────────────────
export default function PasswordBuilderGame({ age, onComplete, embedded = false }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(() => getMode(age));

  function handleBack() {
    if (embedded && onComplete) return onComplete();
    navigate(-1);
  }

  return (
    <div style={{
      minHeight: embedded ? "auto" : "100vh",
      background: "linear-gradient(180deg,#020617 0%,#04142d 100%)",
      fontFamily: "Arial, sans-serif",
      color: "white",
    }}>
      {/* Back button (hidden when fully embedded in lesson flow) */}
      {!embedded && (
        <div style={{ padding: "16px 16px 0" }}>
          <button
            onClick={handleBack}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px", color: "white", padding: "8px 14px",
              cursor: "pointer", fontSize: "14px", fontWeight: "bold",
            }}
          >
            ← Back
          </button>
        </div>
      )}

      {mode === "picker" && <ModePicker onSelect={setMode} />}
      {mode === "kids"   && <KidsBuilder onComplete={onComplete} embedded={embedded} />}
      {mode === "pro"    && <ProBuilder  onComplete={onComplete} embedded={embedded} />}
    </div>
  );
}

// ─── Mode picker ───────────────────────────────────────────────────────────
function ModePicker({ onSelect }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "80vh", padding: "40px 20px",
    }}>
      <div style={{ fontSize: "52px", marginBottom: "12px" }}>🛡️</div>
      <h1 style={{ fontSize: "36px", color: "#08b6aa", margin: "0 0 8px", textAlign: "center" }}>
        Password Builder
      </h1>
      <p style={{ color: "#facc15", fontWeight: "bold", marginBottom: "48px", textAlign: "center" }}>
        How old are you?
      </p>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
        <ModeCard emoji="🎮" title="Ages 5 – 8" desc="Click to build your secret password!" color="#a78bfa" onClick={() => onSelect("kids")} />
        <ModeCard emoji="💻" title="Ages 9 +"   desc="Type and test your password strength."  color="#08b6aa" onClick={() => onSelect("pro")} />
      </div>
    </div>
  );
}

function ModeCard({ emoji, title, desc, color, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? `${color}22` : "#0b1120",
        border: `2px solid ${color}`,
        borderRadius: "24px",
        padding: "36px 40px",
        textAlign: "center",
        cursor: "pointer",
        color: "white",
        width: "240px",
        boxShadow: hover ? `0 0 30px ${color}55` : "none",
        transition: "all 0.2s ease",
      }}
    >
      <div style={{ fontSize: "52px", marginBottom: "12px" }}>{emoji}</div>
      <div style={{ fontSize: "22px", fontWeight: "bold", color, marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "14px", color: "#94a3b8" }}>{desc}</div>
    </button>
  );
}

// ─── KIDS BUILDER (ages 5-8) ───────────────────────────────────────────────
function KidsBuilder({ onComplete, embedded }) {
  const [pieces, setPieces]             = useState([]);
  const [activeTab, setActiveTab]       = useState("words");
  const [showPassword, setShowPassword] = useState(false);
  const [celebrated, setCelebrated]     = useState(false);

  const pwString = pieces.map(p => p.text).join("");
  const score    = useMemo(() => calculateStrength(pwString), [pwString]);
  const castle   = getCastleStage(score);
  const empty    = pieces.length === 0;

  function addPiece(text, type) {
    if (pwString.length + text.length > 24) return;
    setPieces(p => [...p, { text, type, id: Date.now() + Math.random() }]);
  }

  function removeLast() { setPieces(p => p.slice(0, -1)); }
  function clearAll()   { setPieces([]); setCelebrated(false); }

  const checks = [
    { ok: pwString.length >= 8,          text: "8 or more characters",  emoji: "📏" },
    { ok: /[A-Z]/.test(pwString),        text: "Has BIG letters",       emoji: "🔠" },
    { ok: /[0-9]/.test(pwString),        text: "Has a number",          emoji: "🔢" },
    { ok: /[^A-Za-z0-9]/.test(pwString), text: "Has a special symbol",  emoji: "⚡" },
  ];
  const allDone = checks.every(c => c.ok);

  const TABS = [
    { key: "words",   label: "🐱 Words",   color: "#f472b6" },
    { key: "numbers", label: "🔢 Numbers", color: "#fbbf24" },
    { key: "symbols", label: "⚡ Symbols", color: "#34d399" },
  ];

  return (
    <div style={{ padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: "30px", color: "#a78bfa", margin: "0 0 4px" }}>
          🔐 Build Your Secret Password!
        </h1>
        <p style={{ textAlign: "center", color: "#facc15", fontWeight: "bold", margin: "0 0 18px", fontSize: "14px" }}>
          Pick words, numbers and symbols to snap together!
        </p>

        {/* Castle + password display */}
        <div style={{
          background: "#0b1120",
          border: `2px solid ${castle.color}`,
          borderRadius: "22px",
          padding: "18px",
          marginBottom: "14px",
          boxShadow: `0 0 28px ${castle.color}40`,
          transition: "border-color 0.4s, box-shadow 0.4s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
            <div style={{ fontSize: "48px", lineHeight: 1 }}>{castle.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "17px", fontWeight: "bold", color: castle.color, marginBottom: "6px" }}>
                {castle.label}
              </div>
              <div style={{ height: "14px", background: "#111827", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${score}%`,
                  background: castle.color, borderRadius: "999px",
                  transition: "width 0.4s ease, background 0.4s ease",
                }} />
              </div>
            </div>
          </div>

          <div style={{
            background: "#020617", border: "2px solid #1e293b", borderRadius: "14px",
            padding: "10px 12px", minHeight: "56px",
            display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap",
          }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", flex: 1, alignItems: "center" }}>
              {empty
                ? <span style={{ color: "#475569", fontSize: "15px" }}>Your password appears here — start clicking! 👇</span>
                : pieces.map((piece) => {
                    const bg    = piece.type === "word" ? "#3b0764" : piece.type === "number" ? "#78350f" : "#134e4a";
                    const col   = piece.type === "word" ? "#d8b4fe" : piece.type === "number" ? "#fde68a" : "#6ee7b7";
                    return (
                      <span key={piece.id} style={{
                        background: bg, color: col,
                        borderRadius: "10px", padding: "4px 10px",
                        fontSize: "18px", fontWeight: "bold",
                        fontFamily: "monospace", letterSpacing: "1px",
                      }}>
                        {showPassword ? piece.text : "•".repeat(piece.text.length)}
                      </span>
                    );
                  })
              }
            </div>
            <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
              <SmallBtn onClick={() => setShowPassword(s => !s)} color="#64748b">{showPassword ? "🙈" : "👁️"}</SmallBtn>
              <SmallBtn onClick={removeLast} color="#ef4444" disabled={empty}>⬅️</SmallBtn>
              <SmallBtn onClick={clearAll}   color="#ef4444" disabled={empty}>🗑️</SmallBtn>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: "10px 6px", borderRadius: "12px",
              border: `2px solid ${activeTab === tab.key ? tab.color : "#1e293b"}`,
              background: activeTab === tab.key ? `${tab.color}22` : "#0b1120",
              color: activeTab === tab.key ? tab.color : "#64748b",
              fontWeight: "bold", fontSize: "14px", cursor: "pointer",
              transition: "all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tile panel */}
        <div style={{
          background: "#0b1120", border: "2px solid #1e293b",
          borderRadius: "20px", padding: "16px", marginBottom: "14px", minHeight: "140px",
        }}>
          {activeTab === "words" && (
            <>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px", textAlign: "center" }}>
                Pick a fun word to start your password! 🎉
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                {WORD_TILES.map(w => (
                  <TileBtn key={w.word} color={w.color} onClick={() => addPiece(w.word, "word")}>
                    <span style={{ fontSize: "26px", lineHeight: 1 }}>{w.emoji}</span>
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: w.color, letterSpacing: "1px" }}>{w.word}</span>
                  </TileBtn>
                ))}
              </div>
            </>
          )}
          {activeTab === "numbers" && (
            <>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px", textAlign: "center" }}>
                Add a number to make it harder to crack! 🔢
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
                {NUMBER_TILES.map(n => (
                  <TileBtn key={n.val} color="#fbbf24" bg="#78350f33" onClick={() => addPiece(n.val, "number")}>
                    <span style={{ fontSize: "22px", lineHeight: 1 }}>{n.emoji}</span>
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "#fbbf24" }}>{n.val}</span>
                  </TileBtn>
                ))}
              </div>
            </>
          )}
          {activeTab === "symbols" && (
            <>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px", textAlign: "center" }}>
                Add a symbol to make your password super strong! ⚡
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                {SYMBOL_TILES.map(s => (
                  <TileBtn key={s.val} color="#34d399" bg="#13463633" onClick={() => addPiece(s.val, "symbol")}>
                    <span style={{ fontSize: "28px", fontWeight: "bold", color: "#34d399", lineHeight: 1 }}>{s.label}</span>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{s.desc}</span>
                  </TileBtn>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Checklist */}
        <div style={{
          background: "#0b1120",
          border: `2px solid ${allDone ? "#08b6aa" : "#1e293b"}`,
          borderRadius: "20px",
          padding: "16px",
          transition: "border-color 0.4s",
        }}>
          <div style={{ fontWeight: "bold", color: "#a78bfa", marginBottom: "12px", fontSize: "15px" }}>
            🏆 Password Challenges
          </div>
          <div style={{ display: "grid", gap: "10px" }}>
            {checks.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                fontSize: "15px",
                color: empty ? "#475569" : c.ok ? "#22c55e" : "#94a3b8",
                transition: "color 0.2s",
              }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "999px", flexShrink: 0,
                  background: !empty && c.ok ? "#22c55e" : "#1e293b",
                  border: !empty && c.ok ? "none" : "2px solid #334155",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", fontWeight: "bold", color: "#020617",
                  transition: "background 0.2s",
                }}>
                  {!empty && c.ok ? "✓" : c.emoji}
                </div>
                {c.text}
              </div>
            ))}
          </div>

          {allDone && (
            <div style={{
              marginTop: "16px",
              background: "linear-gradient(135deg,#134e4a,#0f172a)",
              border: "2px solid #08b6aa",
              borderRadius: "14px",
              padding: "16px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "32px", marginBottom: "6px" }}>🎉🛡️🎉</div>
              <div style={{ color: "#08b6aa", fontWeight: "bold", fontSize: "18px" }}>
                You built a super strong password!
              </div>
              <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
                Hackers won't be able to crack this one!
              </div>
              {embedded && onComplete && (
                <button
                  onClick={onComplete}
                  style={{
                    marginTop: "14px",
                    background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                    border: "none", borderRadius: "14px",
                    color: "white", fontWeight: "bold", fontSize: "16px",
                    padding: "12px 32px", cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
                  }}
                >
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TileBtn({ children, onClick, color, bg }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: bg ?? `${color}18`,
        border: `2px solid ${color}`,
        borderRadius: "14px",
        padding: "10px 14px",
        cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
        transform: pressed ? "scale(0.93)" : "scale(1)",
        transition: "transform 0.1s",
        minWidth: "68px",
      }}
    >
      {children}
    </button>
  );
}

function SmallBtn({ children, onClick, color, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "36px", height: "36px", borderRadius: "8px",
      border: `2px solid ${disabled ? "#1e293b" : color}`,
      background: disabled ? "#0d1b2e" : `${color}22`,
      color: disabled ? "#334155" : color,
      fontSize: "16px", cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      {children}
    </button>
  );
}

// ─── PRO BUILDER (ages 9+) ─────────────────────────────────────────────────
function ProBuilder({ onComplete, embedded }) {
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);

  const empty      = password.length === 0;
  const score      = useMemo(() => calculateStrength(password), [password]);
  const strength   = getStrengthData(score, empty);
  const crackTime  = getCrackTime(score, empty);
  const shieldPower = empty ? "—" : score < 30 ? "OFFLINE" : score < 70 ? "CHARGING" : score < 85 ? "ACTIVE" : "MAX POWER";
  const isStrong   = score >= 85;

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "40px", margin: "0 0 8px", color: "#08b6aa", textAlign: "center" }}>
          Password Builder
        </h1>
        <p style={{ color: "#facc15", fontWeight: "bold", fontSize: "16px", textAlign: "center", margin: "0 0 32px" }}>
          Build a password strong enough to stop hackers.
        </p>

        <div style={{
          backgroundColor: "#0b1120",
          border: `2px solid ${strength.color}`,
          borderRadius: "24px",
          padding: "28px",
          boxShadow: `0 0 40px ${strength.glow}`,
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}>
          {/* Input */}
          <div style={{ position: "relative", marginBottom: "20px" }}>
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create your password..."
              style={{
                width: "100%", padding: "16px 52px 16px 18px",
                borderRadius: "14px", border: "2px solid #334155",
                backgroundColor: "#020617", color: "white",
                fontSize: "20px", outline: "none",
                fontFamily: "monospace", boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => setShow(s => !s)}
              style={{
                position: "absolute", right: "14px", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "20px", color: "#94a3b8", padding: "4px",
              }}
            >
              {show ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Strength bar */}
          <div style={{ height: "22px", backgroundColor: "#111827", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
            <div style={{
              height: "100%", width: `${score}%`,
              backgroundColor: strength.color, borderRadius: "999px",
              transition: "width 0.35s ease, background-color 0.35s ease",
            }} />
          </div>

          {/* Label */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            {!empty && (
              <div style={{ fontSize: "28px", fontWeight: "bold", color: strength.color, marginBottom: "6px", letterSpacing: "2px" }}>
                {strength.label}
              </div>
            )}
            <div style={{ fontSize: "15px", color: empty ? "#64748b" : "#cbd5e1" }}>
              {strength.message}
            </div>
          </div>

          {/* Hacker status */}
          <div style={{
            backgroundColor: "#020617", border: "1px solid #1e293b",
            borderRadius: "18px", padding: "18px 20px", marginBottom: "20px", display: "grid", gap: "10px",
          }}>
            <div style={{ fontSize: "16px", fontWeight: "bold", color: strength.color }}>🧑‍💻 Hacker Attack Status</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#94a3b8" }}>
              <span>Estimated crack time</span>
              <span style={{ color: strength.color, fontWeight: "bold" }}>{crackTime}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#94a3b8" }}>
              <span>Shield power</span>
              <span style={{ color: strength.color, fontWeight: "bold" }}>{shieldPower}</span>
            </div>
            <div style={{ height: "10px", backgroundColor: "#111827", borderRadius: "999px", overflow: "hidden", marginTop: "4px" }}>
              <div style={{
                height: "100%", width: `${score}%`,
                backgroundColor: strength.color, borderRadius: "999px",
                transition: "width 0.35s ease, background-color 0.35s ease",
              }} />
            </div>
          </div>

          {/* Requirements */}
          <div style={{ display: "grid", gap: "10px" }}>
            <Req passed={!empty && password.length >= 8}                text="At least 8 characters"              empty={empty} />
            <Req passed={!empty && password.length >= 12}               text="At least 12 characters"             empty={empty} />
            <Req passed={!empty && /[A-Z]/.test(password)}              text="Contains uppercase letters"         empty={empty} />
            <Req passed={!empty && /[a-z]/.test(password)}              text="Contains lowercase letters"         empty={empty} />
            <Req passed={!empty && /[0-9]/.test(password)}              text="Contains numbers"                   empty={empty} />
            <Req passed={!empty && /[^A-Za-z0-9]/.test(password)}       text="Contains special symbols (!@#$…)"  empty={empty} />
          </div>

          {/* Continue button when strong enough */}
          {isStrong && embedded && onComplete && (
            <button
              onClick={onComplete}
              style={{
                width: "100%", marginTop: "20px",
                background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                border: "none", borderRadius: "14px",
                color: "white", fontWeight: "bold", fontSize: "16px",
                padding: "14px", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
              }}
            >
              💪 Password is strong — Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Req({ passed, text, empty }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      fontSize: "14px",
      color: empty ? "#475569" : passed ? "#22c55e" : "#64748b",
      transition: "color 0.2s ease",
    }}>
      <div style={{
        width: "22px", height: "22px", borderRadius: "999px", flexShrink: 0,
        backgroundColor: empty ? "#1e293b" : passed ? "#22c55e" : "#1e293b",
        border: empty ? "2px solid #334155" : passed ? "none" : "2px solid #334155",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "13px", fontWeight: "bold", color: "#020617",
        transition: "background-color 0.2s ease",
      }}>
        {!empty && passed ? "✓" : ""}
      </div>
      {text}
    </div>
  );
}
