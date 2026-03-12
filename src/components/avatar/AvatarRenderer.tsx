import { type AvatarConfig } from "./avatarConfig";

interface AvatarRendererProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

/* ── colour helpers ─────────────────────────────────── */
function darken(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
function lighten(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/*
 * Template-based Cyber Hero avatar renderer.
 *
 * viewBox 0 0 200 240 — centred on head/torso.
 * Clipped to a circle for preview.
 *
 * Rendering order (bottom → top):
 *  1. Cape
 *  2. Body / suit + arms + gloves
 *  3. Neck
 *  4. Hair back layer
 *  5. Head (skin ellipse)
 *  6. Ears
 *  7. Face (eyes, brows, nose, mouth, blush)
 *  8. Accessory (goggles/headband — ON face)
 *  9. Hair front layer (bangs/cap — ON TOP)
 */

export default function AvatarRenderer({
  config,
  size = 120,
  className = "",
  fallbackEmoji,
}: AvatarRendererProps) {
  if (!config || !config.characterType) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-muted ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {fallbackEmoji || "🦸"}
      </div>
    );
  }

  const { characterType, skinTone, hairStyle, hairColor, suitColor, accessory } = config;
  const skin = skinTone;
  const skinShade = darken(skinTone, 25);
  const suitDk = darken(suitColor, 45);
  const suitLt = lighten(suitColor, 50);
  const hairDk = darken(hairColor, 25);
  const isGirl = characterType === "girl";
  const uid = `av-${suitColor.replace("#", "")}${hairColor.replace("#", "")}${skinTone.replace("#", "")}`;

  /* ── Anchor points ── */
  const headCx = 100;
  const headCy = 80;
  const headRx = 38;
  const headRy = 40;
  const scalpTop = headCy - headRy; // 40
  const eyeY = 82;
  const eyeLx = 83;
  const eyeRx = 117;

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size}
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          <circle cx="100" cy="105" r="98" />
        </clipPath>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitLt} />
          <stop offset="100%" stopColor={suitColor} />
        </linearGradient>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={suitLt} stopOpacity="0.25" />
          <stop offset="100%" stopColor={suitColor} stopOpacity="0.06" />
        </radialGradient>
        {/* Suit highlight for chest */}
        <linearGradient id={`sh-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        {/* Background circle */}
        <circle cx="100" cy="105" r="98" fill={`url(#bg-${uid})`} />
        <circle cx="100" cy="105" r="98" fill="none" stroke={suitColor} strokeWidth="2" strokeOpacity="0.15" />

        {/* ─── 1. CAPE ─── */}
        <path
          d="M50 148 Q36 178 44 220 L100 216 L156 220 Q164 178 150 148 Z"
          fill={suitColor} fillOpacity="0.35"
        />
        <path d="M50 148 Q36 178 44 220" fill="none" stroke={suitDk} strokeWidth="1" strokeOpacity="0.12" />
        <path d="M150 148 Q164 178 156 220" fill="none" stroke={suitDk} strokeWidth="1" strokeOpacity="0.12" />

        {/* ─── 2. BODY / SUIT ─── */}
        <path
          d="M58 158 Q58 136 76 129 L90 125 Q100 122 110 125 L124 129 Q142 136 142 158 L142 220 L58 220 Z"
          fill={`url(#sg-${uid})`}
        />
        {/* Suit shine overlay */}
        <path
          d="M58 158 Q58 136 76 129 L90 125 Q100 122 110 125 L124 129 Q142 136 142 158 L142 220 L58 220 Z"
          fill={`url(#sh-${uid})`}
        />
        {/* Collar V-line */}
        <path d="M86 127 L100 144 L114 127" fill="none" stroke={suitDk} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45" />
        {/* Chest star emblem */}
        <polygon points="100,146 103,152 109,153 105,157 106,164 100,160 94,164 95,157 91,153 97,152" fill="white" fillOpacity="0.85" />
        <polygon points="100,148 102,152 107,153 104,156 105,161 100,158 95,161 96,156 93,153 98,152" fill={suitLt} fillOpacity="0.45" />
        {/* Tech accent lines */}
        <path d="M77 144 L80 160" fill="none" stroke={suitLt} strokeWidth="1" strokeOpacity="0.25" />
        <path d="M123 144 L120 160" fill="none" stroke={suitLt} strokeWidth="1" strokeOpacity="0.25" />
        {/* Shoulder pads */}
        <ellipse cx="69" cy="137" rx="12" ry="6.5" fill={suitDk} fillOpacity="0.25" />
        <ellipse cx="131" cy="137" rx="12" ry="6.5" fill={suitDk} fillOpacity="0.25" />
        {/* Belt */}
        <rect x="64" y="174" width="72" height="6" rx="3" fill={suitDk} fillOpacity="0.4" />
        <rect x="93" y="172" width="14" height="10" rx="3" fill={suitDk} fillOpacity="0.55" />
        <rect x="96" y="174" width="8" height="6" rx="2" fill="white" fillOpacity="0.4" />

        {/* ─── 3. ARMS + GLOVES ─── */}
        <path d="M58 142 Q46 160 52 182" fill="none" stroke={suitColor} strokeWidth="14" strokeLinecap="round" />
        <path d="M142 142 Q154 160 148 182" fill="none" stroke={suitColor} strokeWidth="14" strokeLinecap="round" />
        {/* Gloves */}
        <ellipse cx="52" cy="184" rx="8.5" ry="6.5" fill={suitDk} />
        <ellipse cx="52" cy="184" rx="6.5" ry="5" fill={suitColor} />
        <ellipse cx="148" cy="184" rx="8.5" ry="6.5" fill={suitDk} />
        <ellipse cx="148" cy="184" rx="6.5" ry="5" fill={suitColor} />

        {/* ─── 4. NECK ─── */}
        <rect x="90" y="115" width="20" height="15" rx="6" fill={skin} />

        {/* ─── 5. HAIR BACK ─── */}
        {hairBackLayer(hairStyle, hairColor, hairDk, headCx, headCy, headRx, headRy)}

        {/* ─── 6. HEAD ─── */}
        <ellipse cx={headCx} cy={headCy} rx={headRx} ry={headRy} fill={skin} />
        {/* Subtle head highlight */}
        <ellipse cx={headCx - 8} cy={headCy - 14} rx={16} ry={12} fill="white" fillOpacity="0.06" />

        {/* ─── 7. EARS ─── */}
        <ellipse cx={headCx - headRx + 2} cy={headCy + 4} rx="6.5" ry="9" fill={skin} />
        <ellipse cx={headCx - headRx + 2} cy={headCy + 4} rx="3.5" ry="5.5" fill={skinShade} fillOpacity="0.18" />
        <ellipse cx={headCx + headRx - 2} cy={headCy + 4} rx="6.5" ry="9" fill={skin} />
        <ellipse cx={headCx + headRx - 2} cy={headCy + 4} rx="3.5" ry="5.5" fill={skinShade} fillOpacity="0.18" />

        {/* ─── 8. FACE ─── */}
        {/* Eye whites */}
        <ellipse cx={eyeLx} cy={eyeY} rx="11.5" ry="11" fill="white" />
        <ellipse cx={eyeRx} cy={eyeY} rx="11.5" ry="11" fill="white" />
        {/* Irises */}
        <circle cx={eyeLx + 1.5} cy={eyeY + 1} r="7" fill="#2C1810" />
        <circle cx={eyeRx + 1.5} cy={eyeY + 1} r="7" fill="#2C1810" />
        {/* Pupils */}
        <circle cx={eyeLx + 2} cy={eyeY - 0.5} r="3.5" fill="#1a0e08" />
        <circle cx={eyeRx + 2} cy={eyeY - 0.5} r="3.5" fill="#1a0e08" />
        {/* Eye highlights */}
        <circle cx={eyeLx + 3.5} cy={eyeY - 2} r="2.8" fill="white" />
        <circle cx={eyeRx + 3.5} cy={eyeY - 2} r="2.8" fill="white" />
        <circle cx={eyeLx} cy={eyeY + 3} r="1.4" fill="white" fillOpacity="0.45" />
        <circle cx={eyeRx} cy={eyeY + 3} r="1.4" fill="white" fillOpacity="0.45" />

        {/* Lashes for girl */}
        {isGirl && (
          <>
            <line x1={eyeLx - 10} y1={eyeY - 5} x2={eyeLx - 8} y2={eyeY - 9} stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1={eyeLx - 6} y1={eyeY - 8} x2={eyeLx - 5} y2={eyeY - 12} stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={eyeLx + 9} y1={eyeY - 6} x2={eyeLx + 7} y2={eyeY - 10} stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1={eyeRx - 9} y1={eyeY - 6} x2={eyeRx - 7} y2={eyeY - 10} stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1={eyeRx + 6} y1={eyeY - 8} x2={eyeRx + 5} y2={eyeY - 12} stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
            <line x1={eyeRx + 10} y1={eyeY - 5} x2={eyeRx + 8} y2={eyeY - 9} stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
        {/* Eyebrows */}
        <path d={`M${eyeLx - 9} ${eyeY - 14} Q${eyeLx} ${eyeY - 20} ${eyeLx + 9} ${eyeY - 14}`} fill="none" stroke={darken(hairColor, 35)} strokeWidth="2.5" strokeLinecap="round" />
        <path d={`M${eyeRx - 9} ${eyeY - 14} Q${eyeRx} ${eyeY - 20} ${eyeRx + 9} ${eyeY - 14}`} fill="none" stroke={darken(hairColor, 35)} strokeWidth="2.5" strokeLinecap="round" />
        {/* Nose */}
        <ellipse cx={headCx} cy={eyeY + 12} rx="3.2" ry="2.2" fill={skinShade} fillOpacity="0.25" />
        {/* Mouth — friendly open smile */}
        <path d={`M${headCx - 11} ${eyeY + 20} Q${headCx} ${eyeY + 32} ${headCx + 11} ${eyeY + 20}`} fill="none" stroke={skinShade} strokeWidth="2.5" strokeLinecap="round" />
        {/* Teeth */}
        {/* Cheek blush */}
        <circle cx={headCx - 28} cy={eyeY + 14} r="8" fill="#FF9999" fillOpacity="0.15" />
        <circle cx={headCx + 28} cy={eyeY + 14} r="8" fill="#FF9999" fillOpacity="0.15" />

        {/* ─── 9. ACCESSORY (face-level) ─── */}
        {renderAccessory(accessory, suitColor, suitDk, suitLt, eyeY, eyeLx, eyeRx, headCx)}

        {/* ─── 10. HAIR FRONT ─── */}
        {hairFrontLayer(hairStyle, hairColor, hairDk, isGirl, headCx, scalpTop, headRx)}
      </g>
    </svg>
  );
}

/* ========================================================================
   HAIR — BACK LAYER
   Renders behind the head ellipse.
   ======================================================================== */
function hairBackLayer(
  style: AvatarConfig["hairStyle"],
  color: string, dk: string,
  cx: number, cy: number, rx: number, ry: number,
) {
  const scalpTop = cy - ry;
  const left = cx - rx;
  const right = cx + rx;

  switch (style) {
    case "bob":
      return (
        <>
          <path d={`M${left} ${cy - 14} Q${left - 6} ${cy + 20} ${left - 4} ${cy + 60} Q${left - 4} ${cy + 70} ${left + 4} ${cy + 72} L${left + 10} ${cy + 72} Q${left + 4} ${cy + 65} ${left + 4} ${cy + 55} Q${left + 4} ${cy + 15} ${left + 2} ${cy - 10} Z`} fill={color} />
          <path d={`M${right} ${cy - 14} Q${right + 6} ${cy + 20} ${right + 4} ${cy + 60} Q${right + 4} ${cy + 70} ${right - 4} ${cy + 72} L${right - 10} ${cy + 72} Q${right - 4} ${cy + 65} ${right - 4} ${cy + 55} Q${right - 4} ${cy + 15} ${right - 2} ${cy - 10} Z`} fill={color} />
          <path d={`M${left - 1} ${cy + 10} Q${left - 3} ${cy + 40} ${left} ${cy + 55}`} fill="none" stroke={dk} strokeWidth="0.7" strokeOpacity="0.1" />
          <path d={`M${right + 1} ${cy + 10} Q${right + 3} ${cy + 40} ${right} ${cy + 55}`} fill="none" stroke={dk} strokeWidth="0.7" strokeOpacity="0.1" />
        </>
      );
    case "puffs":
      return (
        <>
          {/* Left puff */}
          <circle cx={left - 6} cy={cy - 4} r="18" fill={color} />
          <circle cx={left - 6} cy={cy - 4} r="14" fill={dk} fillOpacity="0.03" />
          {/* Right puff */}
          <circle cx={right + 6} cy={cy - 4} r="18" fill={color} />
          <circle cx={right + 6} cy={cy - 4} r="14" fill={dk} fillOpacity="0.03" />
          {/* Hair ties */}
          <ellipse cx={left + 2} cy={cy - 10} rx="4" ry="3" fill={dk} fillOpacity="0.3" />
          <ellipse cx={right - 2} cy={cy - 10} rx="4" ry="3" fill={dk} fillOpacity="0.3" />
        </>
      );
    case "side-ponytail":
      return (
        <>
          <path d={`M${right - 12} ${scalpTop + 8} Q${right + 14} ${scalpTop + 16} ${right + 16} ${cy + 4} Q${right + 18} ${cy + 30} ${right + 12} ${cy + 60} Q${right + 8} ${cy + 78} ${right + 4} ${cy + 88}`} fill={color} />
          <path d={`M${right - 10} ${scalpTop + 10} Q${right + 10} ${scalpTop + 20} ${right + 12} ${cy}`} fill="none" stroke={dk} strokeWidth="0.7" strokeOpacity="0.1" />
          <ellipse cx={right - 10} cy={scalpTop + 8} rx="4.5" ry="3.5" fill={dk} fillOpacity="0.35" />
          <path d={`M${right + 4} ${cy + 86} Q${right + 1} ${cy + 94} ${right + 6} ${cy + 96}`} fill={color} />
        </>
      );
    case "afro":
      return (
        <>
          <ellipse cx={cx} cy={cy - 10} rx={rx + 18} ry={ry + 14} fill={color} />
          <ellipse cx={cx} cy={cy - 8} rx={rx + 14} ry={ry + 10} fill={dk} fillOpacity="0.03" />
        </>
      );
    default:
      return null;
  }
}

/* ========================================================================
   HAIR — FRONT LAYER
   Renders ON TOP of face/eyes. Scalp cap and bangs.
   Anchored to head ellipse so it hugs naturally.
   ======================================================================== */
function hairFrontLayer(
  style: AvatarConfig["hairStyle"],
  color: string, dk: string, isGirl: boolean,
  cx: number, scalpTop: number, rx: number,
) {
  const left = cx - rx;
  const right = cx + rx;
  const bangBase = scalpTop + 34; // where bangs end — above eyes

  switch (style) {
    case "short":
      return (
        <>
          {/* Tight cap */}
          <path
            d={`M${left + 2} ${bangBase} Q${left + 2} ${scalpTop + 2} ${cx} ${scalpTop - 2} Q${right - 2} ${scalpTop + 2} ${right - 2} ${bangBase} L${right - 4} ${bangBase - 6} Q${right - 8} ${scalpTop + 8} ${cx} ${scalpTop + 4} Q${left + 8} ${scalpTop + 8} ${left + 4} ${bangBase - 6} Z`}
            fill={color}
          />
          {/* Part line */}
          <path d={`M${left + 10} ${bangBase - 8} Q${cx} ${scalpTop + 2} ${right - 10} ${bangBase - 8}`} fill="none" stroke={dk} strokeWidth="0.7" strokeOpacity="0.12" />
        </>
      );
    case "curly":
      return (
        <>
          {/* Voluminous curly puffs */}
          <path d={`M${left - 4} ${bangBase + 2} Q${left - 8} ${scalpTop - 2} ${cx} ${scalpTop - 10} Q${right + 8} ${scalpTop - 2} ${right + 4} ${bangBase + 2}`} fill={color} />
          <circle cx={left + 6} cy={scalpTop + 8} r="10" fill={color} />
          <circle cx={cx - 14} cy={scalpTop - 2} r="11" fill={color} />
          <circle cx={cx} cy={scalpTop - 6} r="12" fill={color} />
          <circle cx={cx + 14} cy={scalpTop - 2} r="11" fill={color} />
          <circle cx={right - 6} cy={scalpTop + 8} r="10" fill={color} />
          {/* Side puffs */}
          <circle cx={left - 4} cy={scalpTop + 24} r="9" fill={color} />
          <circle cx={right + 4} cy={scalpTop + 24} r="9" fill={color} />
          <circle cx={left - 6} cy={scalpTop + 38} r="7" fill={color} />
          <circle cx={right + 6} cy={scalpTop + 38} r="7" fill={color} />
        </>
      );
    case "bob":
      return (
        <>
          <path d={`M${left} ${bangBase} Q${left} ${scalpTop} ${cx} ${scalpTop - 6} Q${right} ${scalpTop} ${right} ${bangBase}`} fill={color} />
          <path d={`M${left + 4} ${bangBase} Q${left + 14} ${bangBase - 10} ${cx - 8} ${bangBase - 4} Q${cx + 4} ${bangBase + 2} ${cx + 12} ${bangBase - 6} Q${right - 10} ${bangBase - 14} ${right - 4} ${bangBase}`} fill={color} />
          <path d={`M${left + 10} ${bangBase - 4} Q${cx} ${scalpTop + 10} ${right - 10} ${bangBase - 4}`} fill="none" stroke={dk} strokeWidth="0.5" strokeOpacity="0.08" />
        </>
      );
    case "puffs":
      return (
        <>
          <path d={`M${left + 2} ${bangBase} Q${left + 2} ${scalpTop + 2} ${cx} ${scalpTop - 4} Q${right - 2} ${scalpTop + 2} ${right - 2} ${bangBase}`} fill={color} />
          <line x1={cx} y1={scalpTop - 2} x2={cx} y2={bangBase - 2} stroke={dk} strokeWidth="1.2" strokeOpacity="0.15" />
        </>
      );
    case "side-ponytail":
      return (
        <>
          <path d={`M${left + 2} ${bangBase} Q${left} ${scalpTop + 2} ${cx} ${scalpTop - 4} Q${right} ${scalpTop} ${right} ${bangBase - 6}`} fill={color} />
          <path d={`M${left + 12} ${scalpTop + 14} Q${cx} ${scalpTop + 2} ${right - 8} ${scalpTop + 10}`} fill="none" stroke={dk} strokeWidth="0.7" strokeOpacity="0.1" />
        </>
      );
    case "afro":
      return (
        <>
          <path d={`M${left - 16} ${bangBase + 4} Q${left - 20} ${scalpTop - 18} ${cx} ${scalpTop - 28} Q${right + 20} ${scalpTop - 18} ${right + 16} ${bangBase + 4}`} fill={color} />
          <circle cx={left + 2} cy={scalpTop - 12} r="3" fill={dk} fillOpacity="0.05" />
          <circle cx={cx - 14} cy={scalpTop - 20} r="3" fill={dk} fillOpacity="0.05" />
          <circle cx={cx} cy={scalpTop - 24} r="3" fill={dk} fillOpacity="0.05" />
          <circle cx={cx + 14} cy={scalpTop - 20} r="3" fill={dk} fillOpacity="0.05" />
          <circle cx={right - 2} cy={scalpTop - 12} r="3" fill={dk} fillOpacity="0.05" />
          <circle cx={left - 12} cy={scalpTop + 16} r="3" fill={dk} fillOpacity="0.04" />
          <circle cx={right + 12} cy={scalpTop + 16} r="3" fill={dk} fillOpacity="0.04" />
        </>
      );
    default:
      return null;
  }
}

/* ========================================================================
   ACCESSORIES — rendered between face and front hair.
   Positioned relative to eye anchors.
   ======================================================================== */
function renderAccessory(
  acc: AvatarConfig["accessory"],
  suitColor: string, suitDk: string, suitLt: string,
  eyeY: number, eyeLx: number, eyeRx: number, cx: number,
) {
  switch (acc) {
    case "goggles":
      return (
        <>
          {/* Strap */}
          <path d={`M${eyeLx - 22} ${eyeY - 4} Q${cx} ${eyeY - 12} ${eyeRx + 22} ${eyeY - 4}`} fill="none" stroke={suitColor} strokeWidth="3" />
          {/* Left lens */}
          <rect x={eyeLx - 14} y={eyeY - 10} width="28" height="21" rx="10" fill={suitColor} fillOpacity="0.18" stroke={suitColor} strokeWidth="2.5" />
          {/* Right lens */}
          <rect x={eyeRx - 14} y={eyeY - 10} width="28" height="21" rx="10" fill={suitColor} fillOpacity="0.18" stroke={suitColor} strokeWidth="2.5" />
          {/* Bridge */}
          <line x1={eyeLx + 14} y1={eyeY + 1} x2={eyeRx - 14} y2={eyeY + 1} stroke={suitColor} strokeWidth="2.5" />
          {/* Lens glare */}
          <ellipse cx={eyeLx - 4} cy={eyeY - 3} rx="4" ry="2.5" fill="white" fillOpacity="0.2" transform={`rotate(-15 ${eyeLx - 4} ${eyeY - 3})`} />
          <ellipse cx={eyeRx - 4} cy={eyeY - 3} rx="4" ry="2.5" fill="white" fillOpacity="0.2" transform={`rotate(-15 ${eyeRx - 4} ${eyeY - 3})`} />
        </>
      );
    case "headband":
      return (
        <>
          {/* Headband across forehead */}
          <path d={`M${eyeLx - 22} ${eyeY - 16} Q${cx} ${eyeY - 26} ${eyeRx + 22} ${eyeY - 16}`} fill="none" stroke={suitColor} strokeWidth="6" strokeLinecap="round" />
          <path d={`M${eyeLx - 22} ${eyeY - 16} Q${cx} ${eyeY - 26} ${eyeRx + 22} ${eyeY - 16}`} fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.3" />
          {/* Side tech circles */}
          <circle cx={eyeLx - 20} cy={eyeY - 14} r="3.5" fill={suitDk} fillOpacity="0.5" />
          <circle cx={eyeLx - 20} cy={eyeY - 14} r="1.8" fill="white" fillOpacity="0.3" />
          <circle cx={eyeRx + 20} cy={eyeY - 14} r="3.5" fill={suitDk} fillOpacity="0.5" />
          <circle cx={eyeRx + 20} cy={eyeY - 14} r="1.8" fill="white" fillOpacity="0.3" />
        </>
      );
    case "magnifying-glass":
      return (
        <>
          {/* Held near right hand */}
          <circle cx="158" cy="168" r="13" fill="none" stroke={suitDk} strokeWidth="3.2" />
          <circle cx="158" cy="168" r="10.5" fill="white" fillOpacity="0.1" />
          <line x1="168" y1="178" x2="177" y2="190" stroke={suitDk} strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="154" cy="164" rx="4" ry="2.5" fill="white" fillOpacity="0.22" transform="rotate(-30 154 164)" />
        </>
      );
    case "tablet":
      return (
        <>
          {/* Held near left hand */}
          <rect x="26" y="161" width="24" height="32" rx="4" fill="#263238" />
          <rect x="28" y="164" width="20" height="25" rx="2" fill={suitColor} fillOpacity="0.3" />
          <line x1="32" y1="170" x2="44" y2="170" stroke="white" strokeWidth="1.4" strokeOpacity="0.4" />
          <line x1="32" y1="175" x2="42" y2="175" stroke="white" strokeWidth="1.1" strokeOpacity="0.25" />
          <line x1="32" y1="180" x2="38" y2="180" stroke="white" strokeWidth="0.9" strokeOpacity="0.18" />
          <circle cx="38" cy="191" r="1.4" fill="white" fillOpacity="0.22" />
        </>
      );
    default:
      return null;
  }
}
