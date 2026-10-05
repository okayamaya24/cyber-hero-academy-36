// Draws a Scam Sorter message the way kids would really see it:
// a text bubble, game chat line, DM, YouTube comment, email, or pop-up.

const CHANNELS = {
  text:    { icon: "💬", label: "Text message",  accent: "#22c55e" },
  game:    { icon: "🎮", label: "Game chat",     accent: "#facc15" },
  dm:      { icon: "📩", label: "Direct message", accent: "#818cf8" },
  youtube: { icon: "▶️", label: "Video comment",  accent: "#ef4444" },
  email:   { icon: "📧", label: "Email",          accent: "#38bdf8" },
  popup:   { icon: "⚠️", label: "Pop-up",         accent: "#f97316" },
};

function initials(name) {
  const clean = name.replace(/[^\p{L}\p{N} ]/gu, "").trim();
  return (clean[0] || "?").toUpperCase();
}

export default function MessageCard({ card }) {
  const ch = CHANNELS[card.channel] ?? CHANNELS.text;

  return (
    <div style={{ width: "100%", textAlign: "left" }}>
      {/* Which app this came from */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        fontSize: "11px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase",
        color: ch.accent, background: `${ch.accent}18`, border: `1px solid ${ch.accent}40`,
        borderRadius: "999px", padding: "4px 10px", marginBottom: "14px",
      }}>
        <span>{ch.icon}</span> {ch.label}
      </div>

      {card.channel === "popup" ? (
        // Pop-up: a fake system warning box
        <div style={{
          background: "#fff7ed", color: "#7c2d12", borderRadius: "12px",
          border: "3px solid #f97316", padding: "18px", textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontSize: "clamp(16px,2.6vw,21px)", fontWeight: 900, lineHeight: 1.35 }}>{card.text}</div>
          <div style={{
            marginTop: "12px", display: "inline-block", background: "#f97316", color: "white",
            fontWeight: 900, borderRadius: "8px", padding: "8px 18px", fontSize: "14px",
          }}>
            OK
          </div>
        </div>
      ) : card.channel === "email" ? (
        // Email: sender line + body
        <div style={{ background: "#f8fafc", color: "#0f172a", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ background: "#e2e8f0", padding: "10px 14px", fontSize: "13px" }}>
            <span style={{ color: "#64748b" }}>From: </span>
            <span style={{ fontWeight: "bold", wordBreak: "break-word" }}>{card.from}</span>
          </div>
          <div style={{ padding: "14px", fontSize: "clamp(15px,2.4vw,19px)", lineHeight: 1.45 }}>{card.text}</div>
        </div>
      ) : card.channel === "text" ? (
        // Phone text: name on top, grey bubble
        <div>
          <div style={{ textAlign: "center", fontSize: "13px", color: "#94a3b8", marginBottom: "8px", fontWeight: "bold" }}>
            {card.from}
          </div>
          <div style={{
            display: "inline-block", maxWidth: "88%", background: "#334155", color: "#f1f5f9",
            borderRadius: "20px 20px 20px 6px", padding: "12px 16px",
            fontSize: "clamp(15px,2.4vw,19px)", lineHeight: 1.45,
          }}>
            {card.text}
          </div>
        </div>
      ) : (
        // Game chat, DM, and video comments: avatar + name + message
        <div style={{
          display: "flex", gap: "12px", alignItems: "flex-start",
          background: card.channel === "game" ? "rgba(0,0,0,0.35)" : "transparent",
          borderRadius: "12px", padding: card.channel === "game" ? "12px" : 0,
          fontFamily: card.channel === "game" ? "ui-monospace, Menlo, monospace" : "inherit",
        }}>
          <div style={{
            flexShrink: 0, width: "40px", height: "40px", borderRadius: "50%",
            background: `${ch.accent}30`, border: `2px solid ${ch.accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, color: ch.accent, fontFamily: "Arial, sans-serif",
          }}>
            {initials(card.from)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: "bold", color: ch.accent, fontSize: "14px", marginBottom: "3px", wordBreak: "break-word" }}>
              {card.from}
            </div>
            <div style={{ color: "#f1f5f9", fontSize: "clamp(15px,2.4vw,19px)", lineHeight: 1.45, wordBreak: "break-word" }}>
              {card.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
