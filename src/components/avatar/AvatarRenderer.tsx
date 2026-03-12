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
 * Template-based avatar renderer.
 *
 * viewBox 0 0 200 240 — character is drawn to fill this space.
 * The component clips to a circle for preview but keeps the full
 * character visible by centering within a shifted circle.
 *
 * Rendering order (bottom → top):
 *  1. Cape
 *  2. Body / suit
 *  3. Arms + gloves
 *  4. Neck
 *  5. Hair back (long/braids/ponytail/afro back volume)
 *  6. Head (skin)
 *  7. Ears
 *  8. Eyes + eyebrows + nose + mouth + blush
 *  9. Accessory layer (goggles / headband sit ON the face)
 * 10. Hair front (bangs / scalp cap — always on top so it wraps)
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
  const skinShade = darken(skinTone, 22);
  const suitDk = darken(suitColor, 40);
  const suitLt = lighten(suitColor, 45);
  const hairDk = darken(hairColor, 20);
  const isGirl = characterType === "girl";
  const uid = `av-${suitColor.replace("#", "")}${hairColor.replace("#", "")}${skinTone.replace("#", "")}`;

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={size}
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        {/* clip to circle centred on upper-body/head area */}
        <clipPath id={`clip-${uid}`}>
          <circle cx="100" cy="105" r="98" />
        </clipPath>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitLt} />
          <stop offset="100%" stopColor={suitColor} />
        </linearGradient>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor={suitLt} stopOpacity="0.30" />
          <stop offset="100%" stopColor={suitColor} stopOpacity="0.08" />
        </radialGradient>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        {/* Background */}
        <circle cx="100" cy="105" r="98" fill={`url(#bg-${uid})`} />
        <circle cx="100" cy="105" r="98" fill="none" stroke={suitColor} strokeWidth="2.5" strokeOpacity="0.2" />

        {/* ─── 1. CAPE ─── */}
        <path
          d="M48 145 Q34 175 44 220 L100 215 L156 220 Q166 175 152 145 Z"
          fill={suitColor} fillOpacity="0.45"
        />
        <path d="M48 145 Q34 175 44 220" fill="none" stroke={suitDk} strokeWidth="1" strokeOpacity="0.15" />
        <path d="M152 145 Q166 175 156 220" fill="none" stroke={suitDk} strokeWidth="1" strokeOpacity="0.15" />

        {/* ─── 2. BODY / SUIT ─── */}
        <path
          d="M56 160 Q56 138 74 130 L88 126 Q100 122 112 126 L126 130 Q144 138 144 160 L144 220 L56 220 Z"
          fill={`url(#sg-${uid})`}
        />
        {/* Suit collar V */}
        <path d="M84 128 L100 146 L116 128" fill="none" stroke={suitDk} strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.5" />
        {/* Chest emblem — star */}
        <polygon points="100,147 103,153 110,154 105,159 106,166 100,162 94,166 95,159 90,154 97,153" fill="white" fillOpacity="0.85" />
        <polygon points="100,149 102,153 107,154 104,157 105,163 100,160 95,163 96,157 93,154 98,153" fill={suitLt} fillOpacity="0.5" />
        {/* Tech lines */}
        <path d="M76 145 L80 162" fill="none" stroke={suitLt} strokeWidth="1" strokeOpacity="0.3" />
        <path d="M124 145 L120 162" fill="none" stroke={suitLt} strokeWidth="1" strokeOpacity="0.3" />
        <path d="M72 155 L76 165" fill="none" stroke={suitLt} strokeWidth="0.8" strokeOpacity="0.2" />
        <path d="M128 155 L124 165" fill="none" stroke={suitLt} strokeWidth="0.8" strokeOpacity="0.2" />
        {/* Shoulder pads */}
        <ellipse cx="68" cy="138" rx="13" ry="7" fill={suitDk} fillOpacity="0.3" />
        <ellipse cx="132" cy="138" rx="13" ry="7" fill={suitDk} fillOpacity="0.3" />

        {/* Belt */}
        <rect x="63" y="172" width="74" height="6" rx="3" fill={suitDk} fillOpacity="0.45" />
        <rect x="93" y="170" width="14" height="10" rx="3" fill={suitDk} fillOpacity="0.6" />
        <rect x="96" y="172" width="8" height="6" rx="2" fill="white" fillOpacity="0.45" />

        {/* ─── 3. ARMS + GLOVES ─── */}
        <path d="M56 143 Q45 162 52 182" fill="none" stroke={suitColor} strokeWidth="15" strokeLinecap="round" />
        <path d="M144 143 Q155 162 148 182" fill="none" stroke={suitColor} strokeWidth="15" strokeLinecap="round" />
        <ellipse cx="52" cy="184" rx="9" ry="7" fill={suitDk} />
        <ellipse cx="52" cy="184" rx="7" ry="5" fill={suitColor} />
        <ellipse cx="148" cy="184" rx="9" ry="7" fill={suitDk} />
        <ellipse cx="148" cy="184" rx="7" ry="5" fill={suitColor} />

        {/* ─── 4. NECK ─── */}
        <rect x="89" y="116" width="22" height="16" rx="6" fill={skin} />

        {/* ─── 5. HAIR BACK ─── */}
        {hairBackLayer(hairStyle, hairColor, hairDk)}

        {/* ─── 6. HEAD ─── */}
        <ellipse cx="100" cy="82" rx="40" ry="42" fill={skin} />

        {/* ─── 7. EARS ─── */}
        <ellipse cx="61" cy="84" rx="7" ry="10" fill={skin} />
        <ellipse cx="61" cy="84" rx="4" ry="6" fill={skinShade} fillOpacity="0.2" />
        <ellipse cx="139" cy="84" rx="7" ry="10" fill={skin} />
        <ellipse cx="139" cy="84" rx="4" ry="6" fill={skinShade} fillOpacity="0.2" />

        {/* ─── 8. FACE ─── */}
        {/* Eyes */}
        <ellipse cx="82" cy="80" rx="12" ry="11" fill="white" />
        <ellipse cx="118" cy="80" rx="12" ry="11" fill="white" />
        <circle cx="84" cy="81" r="7" fill="#2C1810" />
        <circle cx="120" cy="81" r="7" fill="#2C1810" />
        {/* Pupils / highlights */}
        <circle cx="86" cy="79" r="2.8" fill="white" />
        <circle cx="122" cy="79" r="2.8" fill="white" />
        <circle cx="82" cy="83" r="1.3" fill="white" fillOpacity="0.5" />
        <circle cx="118" cy="83" r="1.3" fill="white" fillOpacity="0.5" />
        {/* Lashes for girl */}
        {isGirl && (
          <>
            <line x1="72" y1="74" x2="74" y2="71" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="76" y1="72" x2="77" y2="68.5" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="92" y1="74" x2="90" y2="71" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="108" y1="74" x2="110" y2="71" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="124" y1="72" x2="123" y2="68.5" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="128" y1="74" x2="126" y2="71" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}
        {/* Eyebrows */}
        <path d="M74 68 Q82 63 90 68" fill="none" stroke={darken(hairColor, 30)} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M110 68 Q118 63 126 68" fill="none" stroke={darken(hairColor, 30)} strokeWidth="2.5" strokeLinecap="round" />
        {/* Nose */}
        <ellipse cx="100" cy="92" rx="3.5" ry="2.5" fill={skinShade} fillOpacity="0.3" />
        {/* Mouth — friendly smile */}
        <path d="M88 102 Q100 114 112 102" fill="none" stroke={skinShade} strokeWidth="2.5" strokeLinecap="round" />
        {/* Teeth for hero variant */}
        {characterType === "hero" && (
          <rect x="96" y="102" width="8" height="4" rx="1.5" fill="white" fillOpacity="0.9" />
        )}
        {/* Cheek blush */}
        <circle cx="68" cy="96" r="8" fill="#FF9999" fillOpacity="0.18" />
        <circle cx="132" cy="96" r="8" fill="#FF9999" fillOpacity="0.18" />

        {/* ─── 9. ACCESSORY (face-level) ─── */}
        {renderAccessory(accessory, suitColor, suitDk, suitLt)}

        {/* ─── 10. HAIR FRONT ─── */}
        {hairFrontLayer(hairStyle, hairColor, hairDk, isGirl)}
      </g>
    </svg>
  );
}

/* ========================================================================
   HAIR — BACK LAYER
   Renders behind the head ellipse so it peeks out naturally.
   ======================================================================== */
function hairBackLayer(style: AvatarConfig["hairStyle"], color: string, dk: string) {
  switch (style) {
    case "long":
      return (
        <>
          {/* Two long curtains falling behind head */}
          <path d="M58 62 Q52 90 52 120 Q52 148 58 165 L66 165 Q62 148 62 120 Q62 90 64 65 Z" fill={color} />
          <path d="M142 62 Q148 90 148 120 Q148 148 142 165 L134 165 Q138 148 138 120 Q138 90 136 65 Z" fill={color} />
          <path d="M56 95 Q54 120 57 148" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.12" />
          <path d="M144 95 Q146 120 143 148" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.12" />
        </>
      );
    case "braids":
      return (
        <>
          {/* Left braid */}
          <path d="M66 65 Q60 85 60 105 Q60 125 62 145 Q63 155 60 168"
            fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" />
          <path d="M66 72 L62 82 L66 92 L62 102 L66 112 L62 122 L66 132 L62 142 L64 155"
            fill="none" stroke={dk} strokeWidth="1.8" strokeOpacity="0.15" strokeLinecap="round" />
          <circle cx="61" cy="170" r="5.5" fill={color} />
          <circle cx="61" cy="170" r="2.8" fill={dk} fillOpacity="0.12" />
          {/* Right braid */}
          <path d="M134 65 Q140 85 140 105 Q140 125 138 145 Q137 155 140 168"
            fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" />
          <path d="M134 72 L138 82 L134 92 L138 102 L134 112 L138 122 L134 132 L138 142 L136 155"
            fill="none" stroke={dk} strokeWidth="1.8" strokeOpacity="0.15" strokeLinecap="round" />
          <circle cx="139" cy="170" r="5.5" fill={color} />
          <circle cx="139" cy="170" r="2.8" fill={dk} fillOpacity="0.12" />
        </>
      );
    case "ponytail":
      return (
        <>
          {/* Ponytail flowing from upper-back of head */}
          <path d="M128 48 Q150 55 152 80 Q154 110 148 140 Q144 155 140 168" fill={color} />
          <path d="M130 50 Q147 58 150 78 Q152 106 147 136" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.12" />
          {/* Hair tie */}
          <ellipse cx="129" cy="48" rx="5" ry="4" fill={dk} fillOpacity="0.4" />
          {/* Tip */}
          <path d="M140 166 Q137 174 142 176 Q147 172 143 166" fill={color} />
        </>
      );
    case "afro":
      return (
        <>
          {/* Large afro silhouette behind head */}
          <ellipse cx="100" cy="68" rx="56" ry="55" fill={color} />
          <ellipse cx="100" cy="70" rx="52" ry="50" fill={dk} fillOpacity="0.03" />
        </>
      );
    default:
      return null;
  }
}

/* ========================================================================
   HAIR — FRONT LAYER
   Renders ON TOP of face/eyes. This is the visible scalp cap and bangs.
   Hair is anchored to head ellipse (cx=100, cy=82, rx=40, ry=42) so
   scalpTop ≈ 40, scalpL ≈ 60, scalpR ≈ 140.
   ======================================================================== */
function hairFrontLayer(style: AvatarConfig["hairStyle"], color: string, dk: string, isGirl: boolean) {
  switch (style) {
    case "short":
      return (
        <>
          {/* Tight scalp cap */}
          <path
            d="M62 74 Q62 42 100 37 Q138 42 138 74 L136 66 Q132 48 100 43 Q68 48 64 66 Z"
            fill={color}
          />
          {/* Subtle part line */}
          <path d="M68 64 Q100 42 132 64" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.15" />
        </>
      );
    case "curly":
      return (
        <>
          {/* Voluminous curly top */}
          <path d="M56 76 Q54 38 100 30 Q146 38 144 76" fill={color} />
          {/* Curly puffs */}
          <circle cx="66" cy="50" r="11" fill={color} />
          <circle cx="82" cy="38" r="12" fill={color} />
          <circle cx="100" cy="33" r="13" fill={color} />
          <circle cx="118" cy="38" r="12" fill={color} />
          <circle cx="134" cy="50" r="11" fill={color} />
          {/* Side puffs */}
          <circle cx="56" cy="66" r="10" fill={color} />
          <circle cx="144" cy="66" r="10" fill={color} />
          <circle cx="54" cy="82" r="8" fill={color} />
          <circle cx="146" cy="82" r="8" fill={color} />
          {/* Texture highlights */}
          <circle cx="90" cy="36" r="2" fill="white" fillOpacity="0.06" />
          <circle cx="112" cy="36" r="2" fill="white" fillOpacity="0.06" />
        </>
      );
    case "long":
      return (
        <>
          {/* Scalp cap */}
          <path d="M58 76 Q58 38 100 32 Q142 38 142 76" fill={color} />
          {/* Bangs — soft wave */}
          <path d="M64 72 Q74 60 90 66 Q100 70 110 64 Q126 56 136 72" fill={color} />
          <path d="M70 68 Q100 52 130 68" fill="none" stroke={dk} strokeWidth="0.6" strokeOpacity="0.1" />
        </>
      );
    case "braids":
      return (
        <>
          {/* Scalp cap */}
          <path d="M62 74 Q62 40 100 34 Q138 40 138 74" fill={color} />
          {/* Centre part */}
          <line x1="100" y1="36" x2="100" y2="68" stroke={dk} strokeWidth="1.2" strokeOpacity="0.18" />
          {/* Side part lines */}
          <path d="M80 42 Q85 55 82 68" fill="none" stroke={dk} strokeWidth="0.6" strokeOpacity="0.1" />
          <path d="M120 42 Q115 55 118 68" fill="none" stroke={dk} strokeWidth="0.6" strokeOpacity="0.1" />
        </>
      );
    case "ponytail":
      return (
        <>
          {/* Swept-back scalp cap */}
          <path d="M62 76 Q60 40 100 34 Q140 38 140 72" fill={color} />
          {/* Swept lines */}
          <path d="M70 58 Q100 40 134 50" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.12" />
          <path d="M74 52 Q100 38 130 46" fill="none" stroke={dk} strokeWidth="0.6" strokeOpacity="0.08" />
        </>
      );
    case "afro":
      return (
        <>
          {/* Front volume — large arc above forehead */}
          <path d="M44 84 Q42 24 100 12 Q158 24 156 84" fill={color} />
          {/* Texture bumps */}
          <circle cx="64" cy="28" r="3" fill={dk} fillOpacity="0.06" />
          <circle cx="82" cy="18" r="3" fill={dk} fillOpacity="0.06" />
          <circle cx="100" cy="14" r="3" fill={dk} fillOpacity="0.06" />
          <circle cx="118" cy="18" r="3" fill={dk} fillOpacity="0.06" />
          <circle cx="136" cy="28" r="3" fill={dk} fillOpacity="0.06" />
          {/* Side volumes */}
          <circle cx="48" cy="60" r="3" fill={dk} fillOpacity="0.04" />
          <circle cx="152" cy="60" r="3" fill={dk} fillOpacity="0.04" />
        </>
      );
    case "none":
      return null;
    default:
      return null;
  }
}

/* ========================================================================
   ACCESSORIES — rendered between face and front hair
   Positioned relative to eye centres (82,80) and (118,80).
   ======================================================================== */
function renderAccessory(acc: AvatarConfig["accessory"], suitColor: string, suitDk: string, suitLt: string) {
  switch (acc) {
    case "goggles":
      return (
        <>
          {/* Strap */}
          <path d="M56 76 Q100 68 144 76" fill="none" stroke={suitColor} strokeWidth="3" />
          {/* Left lens */}
          <rect x="64" y="70" width="30" height="22" rx="10" fill={suitColor} fillOpacity="0.2" stroke={suitColor} strokeWidth="2.5" />
          {/* Right lens */}
          <rect x="106" y="70" width="30" height="22" rx="10" fill={suitColor} fillOpacity="0.2" stroke={suitColor} strokeWidth="2.5" />
          {/* Bridge */}
          <line x1="94" y1="81" x2="106" y2="81" stroke={suitColor} strokeWidth="2.5" />
          {/* Side arms */}
          <path d="M64 78 Q52 74 50 80 Q50 86 64 84" fill="none" stroke={suitColor} strokeWidth="2" />
          <path d="M136 78 Q148 74 150 80 Q150 86 136 84" fill="none" stroke={suitColor} strokeWidth="2" />
          {/* Lens glare */}
          <ellipse cx="74" cy="77" rx="4" ry="2.5" fill="white" fillOpacity="0.18" transform="rotate(-15 74 77)" />
          <ellipse cx="116" cy="77" rx="4" ry="2.5" fill="white" fillOpacity="0.18" transform="rotate(-15 116 77)" />
        </>
      );
    case "headband":
      return (
        <>
          {/* Headband across forehead */}
          <path d="M58 66 Q100 56 142 66" fill="none" stroke={suitColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M58 66 Q100 56 142 66" fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.3" />
          {/* Side tech detail */}
          <circle cx="60" cy="67" r="3.5" fill={suitDk} fillOpacity="0.5" />
          <circle cx="60" cy="67" r="1.8" fill="white" fillOpacity="0.3" />
          <circle cx="140" cy="67" r="3.5" fill={suitDk} fillOpacity="0.5" />
          <circle cx="140" cy="67" r="1.8" fill="white" fillOpacity="0.3" />
        </>
      );
    case "magnifying-glass":
      return (
        <>
          {/* Held in right hand area */}
          <circle cx="158" cy="168" r="14" fill="none" stroke={suitDk} strokeWidth="3.5" />
          <circle cx="158" cy="168" r="11.5" fill="white" fillOpacity="0.12" />
          <line x1="168" y1="178" x2="178" y2="192" stroke={suitDk} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="154" cy="164" rx="4" ry="2.5" fill="white" fillOpacity="0.25" transform="rotate(-30 154 164)" />
        </>
      );
    case "tablet":
      return (
        <>
          {/* Held in left hand area */}
          <rect x="24" y="160" width="26" height="34" rx="4" fill="#263238" />
          <rect x="26" y="163" width="22" height="27" rx="2" fill={suitColor} fillOpacity="0.35" />
          <line x1="30" y1="169" x2="44" y2="169" stroke="white" strokeWidth="1.5" strokeOpacity="0.45" />
          <line x1="30" y1="174" x2="42" y2="174" stroke="white" strokeWidth="1.2" strokeOpacity="0.3" />
          <line x1="30" y1="179" x2="38" y2="179" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
          <circle cx="37" cy="192" r="1.5" fill="white" fillOpacity="0.25" />
        </>
      );
    default:
      return null;
  }
}
