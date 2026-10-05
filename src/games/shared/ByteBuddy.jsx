// Byte, the robot fox sidekick, reacting inside games with a speech bubble.
// mood: "happy" (bounces), "oops" (tilts), "think" (gentle float)
import byteImg from "@/assets/home/byte.webp";

const STYLE = `
  @keyframes byteHappy { 0%,100% { transform: translateY(0) } 30% { transform: translateY(-14px) rotate(-4deg) } 60% { transform: translateY(0) rotate(3deg) } }
  @keyframes byteOops  { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-8deg) } 75% { transform: rotate(6deg) } }
  @keyframes byteThink { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-5px) } }
  @keyframes bubbleIn  { from { opacity: 0; transform: translateY(6px) scale(0.96) } to { opacity: 1; transform: none } }
`;
if (typeof document !== "undefined" && !document.getElementById("byte-buddy-styles")) {
  const s = document.createElement("style");
  s.id = "byte-buddy-styles";
  s.textContent = STYLE;
  document.head.appendChild(s);
}

const MOOD = {
  happy: { anim: "byteHappy 0.7s ease-out", color: "#22c55e", bg: "rgba(5,46,26,0.92)" },
  oops:  { anim: "byteOops 0.6s ease-in-out", color: "#f59e0b", bg: "rgba(59,32,5,0.92)" },
  think: { anim: "byteThink 2.4s ease-in-out infinite", color: "#00d4ff", bg: "rgba(4,20,45,0.92)" },
};

const HAPPY_OPENERS = ["Nice catch! 🎉", "You got it! ⭐", "Woohoo! 🦊", "Scam spotted! 🔍", "That's my Guardian! 💪"];
const OOPS_OPENERS = ["Ooh, tricky one! 🤔", "Almost! Here's the trick:", "Don't worry, that one fools lots of people!", "Oops! Let me show you:"];

/** A random friendly opener for Byte's reaction (stable per key so it doesn't flicker on re-render). */
export function byteOpener(correct, key = 0) {
  const list = correct ? HAPPY_OPENERS : OOPS_OPENERS;
  const n = typeof key === "number" ? key : String(key).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return list[Math.abs(n) % list.length];
}

export default function ByteBuddy({ mood = "think", title, children, size = 64, compact = false }) {
  const m = MOOD[mood] ?? MOOD.think;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: compact ? "8px" : "12px", width: "100%", textAlign: "left" }}>
      <img
        key={mood + String(title)}          // restart the animation on each new reaction
        src={byteImg}
        alt="Byte"
        draggable={false}
        style={{ width: size, height: "auto", flexShrink: 0, animation: m.anim, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.45))" }}
      />
      <div
        key={"b" + String(title)}
        style={{
          position: "relative", flex: 1, minWidth: 0,
          background: m.bg, border: `2px solid ${m.color}`, borderRadius: "16px 16px 16px 4px",
          padding: compact ? "8px 10px" : "12px 14px", color: "#e2e8f0",
          fontSize: compact ? "13px" : "15px", lineHeight: 1.45, animation: "bubbleIn 0.25s ease-out",
        }}
      >
        {title && <div style={{ fontWeight: 900, color: m.color, marginBottom: children ? "3px" : 0 }}>{title}</div>}
        {children}
      </div>
    </div>
  );
}
