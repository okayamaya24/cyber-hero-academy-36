import { type AvatarConfig } from "./avatarConfig";

interface AvatarRendererProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Anchor points for consistent positioning
const ANCHORS = {
  headCx: 100,
  headCy: 78,
  headRx: 38,
  headRy: 40,
  scalpTop: 38,   // top of head
  scalpLeft: 62,   // left edge of head
  scalpRight: 138, // right edge of head
  eyeY: 76,
  eyeLeftX: 84,
  eyeRightX: 116,
};

export default function AvatarRenderer({ config, size = 120, className = "", fallbackEmoji }: AvatarRendererProps) {
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
  const faceColor = skinTone;
  const faceDarker = darken(skinTone, 20);
  const suitDarker = darken(suitColor, 35);
  const suitLighter = lighten(suitColor, 50);
  const hasLashes = characterType === "girl";
  const uid = suitColor.replace("#", "") + hairColor.replace("#", "");

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id={`clip-${uid}`}>
          <circle cx="100" cy="100" r="96" />
        </clipPath>
        <radialGradient id={`bg-${uid}`} cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor={suitLighter} stopOpacity="0.35" />
          <stop offset="100%" stopColor={suitColor} stopOpacity="0.12" />
        </radialGradient>
        <linearGradient id={`suit-grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitLighter} />
          <stop offset="100%" stopColor={suitColor} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        {/* Background */}
        <circle cx="100" cy="100" r="96" fill={`url(#bg-${uid})`} />
        <circle cx="100" cy="100" r="96" fill="none" stroke={suitColor} strokeWidth="3" strokeOpacity="0.25" />

        {/* LAYER 1: Cape */}
        <path
          d="M52 138 Q38 170 50 200 L100 195 L150 200 Q162 170 148 138 Z"
          fill={suitColor} fillOpacity="0.55"
        />

        {/* LAYER 2: Body / Suit */}
        <path
          d="M58 155 Q58 132 76 126 L88 122 Q100 118 112 122 L124 126 Q142 132 142 155 L142 200 L58 200 Z"
          fill={`url(#suit-grad-${uid})`}
        />
        <path d="M84 122 L100 140 L116 122" fill="none" stroke={suitDarker} strokeWidth="2.5" strokeLinecap="round" />
        <polygon points="100,143 105,149 103,156 97,156 95,149" fill="white" fillOpacity="0.85" />
        <polygon points="100,145 103,149 101,154 99,154 97,149" fill={suitLighter} fillOpacity="0.6" />
        <path d="M76 140 L82 155" fill="none" stroke={suitLighter} strokeWidth="1.2" strokeOpacity="0.4" />
        <path d="M124 140 L118 155" fill="none" stroke={suitLighter} strokeWidth="1.2" strokeOpacity="0.4" />
        <ellipse cx="70" cy="133" rx="12" ry="6" fill={suitDarker} fillOpacity="0.35" />
        <ellipse cx="130" cy="133" rx="12" ry="6" fill={suitDarker} fillOpacity="0.35" />

        {/* Gloves */}
        <ellipse cx="56" cy="172" rx="8" ry="6" fill={suitDarker} />
        <ellipse cx="56" cy="172" rx="6" ry="4.5" fill={suitColor} />
        <ellipse cx="144" cy="172" rx="8" ry="6" fill={suitDarker} />
        <ellipse cx="144" cy="172" rx="6" ry="4.5" fill={suitColor} />

        {/* Arms */}
        <path d="M58 138 Q48 155 56 172" fill="none" stroke={suitColor} strokeWidth="14" strokeLinecap="round" />
        <path d="M142 138 Q152 155 144 172" fill="none" stroke={suitColor} strokeWidth="14" strokeLinecap="round" />

        {/* Belt */}
        <rect x="65" y="165" width="70" height="6" rx="3" fill={suitDarker} fillOpacity="0.5" />
        <rect x="94" y="163" width="12" height="10" rx="3" fill={suitDarker} fillOpacity="0.7" />
        <rect x="97" y="165" width="6" height="6" rx="2" fill="white" fillOpacity="0.5" />

        {/* LAYER 3: Neck */}
        <rect x="90" y="112" width="20" height="14" rx="5" fill={faceColor} />

        {/* LAYER 4: Hair back layer (behind head for long/braids/ponytail) */}
        {renderHairBack(hairStyle, hairColor)}

        {/* LAYER 5: Head */}
        <ellipse cx={ANCHORS.headCx} cy={ANCHORS.headCy} rx={ANCHORS.headRx} ry={ANCHORS.headRy} fill={faceColor} />

        {/* Ears */}
        <ellipse cx="63" cy="80" rx="7" ry="9" fill={faceColor} />
        <ellipse cx="63" cy="80" rx="4" ry="5.5" fill={faceDarker} fillOpacity="0.25" />
        <ellipse cx="137" cy="80" rx="7" ry="9" fill={faceColor} />
        <ellipse cx="137" cy="80" rx="4" ry="5.5" fill={faceDarker} fillOpacity="0.25" />

        {/* LAYER 6: Eyes */}
        <ellipse cx={ANCHORS.eyeLeftX} cy={ANCHORS.eyeY} rx="11" ry="10" fill="white" />
        <ellipse cx={ANCHORS.eyeRightX} cy={ANCHORS.eyeY} rx="11" ry="10" fill="white" />
        <circle cx="86" cy="77" r="6.5" fill="#2C1810" />
        <circle cx="118" cy="77" r="6.5" fill="#2C1810" />
        <circle cx="87.5" cy="75.5" r="2.5" fill="white" />
        <circle cx="119.5" cy="75.5" r="2.5" fill="white" />
        <circle cx="84" cy="79" r="1.2" fill="white" fillOpacity="0.6" />
        <circle cx="116" cy="79" r="1.2" fill="white" fillOpacity="0.6" />
        {hasLashes && (
          <>
            <line x1="74" y1="70" x2="76.5" y2="67.5" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="78" y1="68" x2="79" y2="65" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="94" y1="70" x2="91.5" y2="67.5" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="106" y1="70" x2="108.5" y2="67.5" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="122" y1="68" x2="121" y2="65" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="126" y1="70" x2="123.5" y2="67.5" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
          </>
        )}

        {/* Eyebrows */}
        <path d="M76 65 Q84 60 92 65" fill="none" stroke={darken(hairColor, 20)} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M108 65 Q116 60 124 65" fill="none" stroke={darken(hairColor, 20)} strokeWidth="2.8" strokeLinecap="round" />

        {/* Nose */}
        <ellipse cx="100" cy="88" rx="3.5" ry="2.5" fill={faceDarker} fillOpacity="0.35" />

        {/* Mouth */}
        <path d="M88 98 Q100 110 112 98" fill="none" stroke={faceDarker} strokeWidth="2.8" strokeLinecap="round" />
        {characterType === "hero" && (
          <rect x="97" y="98" width="6" height="4" rx="1" fill="white" fillOpacity="0.9" />
        )}

        {/* Cheek blush */}
        <circle cx="70" cy="92" r="8" fill="#FF9999" fillOpacity="0.2" />
        <circle cx="130" cy="92" r="8" fill="#FF9999" fillOpacity="0.2" />

        {/* LAYER 7: Mask (above face, below hair front) */}
        {accessory === "mask" && renderMask(suitColor, suitDarker)}

        {/* LAYER 8: Hair front layer (on top of face/mask) */}
        {renderHairFront(hairStyle, hairColor)}

        {/* LAYER 9: Non-mask accessories */}
        {accessory !== "mask" && renderAccessory(accessory, suitColor, suitDarker)}
      </g>
    </svg>
  );
}

/**
 * Hair that renders BEHIND the head (side strands, back hair, braids, ponytail tail).
 */
function renderHairBack(style: AvatarConfig["hairStyle"], color: string) {
  const darker = darken(color, 15);

  switch (style) {
    case "long":
      return (
        <>
          {/* Side strands behind head */}
          <path d="M60 60 Q54 85 53 110 Q52 135 57 155 L63 155 Q59 135 59 110 Q59 85 62 62 Z" fill={color} />
          <path d="M140 60 Q146 85 147 110 Q148 135 143 155 L137 155 Q141 135 141 110 Q141 85 138 62 Z" fill={color} />
          <path d="M57 90 Q55 115 56 140" fill="none" stroke={darker} strokeWidth="0.8" strokeOpacity="0.15" />
          <path d="M143 90 Q145 115 144 140" fill="none" stroke={darker} strokeWidth="0.8" strokeOpacity="0.15" />
        </>
      );
    case "braids":
      return (
        <>
          {/* Left braid behind head */}
          <path d="M68 65 Q63 80 62 95 Q61 110 63 125 Q65 135 62 148"
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
          {/* Braid texture */}
          <path d="M68 70 L64 80 L68 90 L64 100 L68 110 L64 120 L68 130 L64 140 L66 148"
            fill="none" stroke={darker} strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
          <circle cx="63" cy="151" r="5" fill={color} />
          <circle cx="63" cy="151" r="2.5" fill={darker} fillOpacity="0.15" />

          {/* Right braid behind head */}
          <path d="M132 65 Q137 80 138 95 Q139 110 137 125 Q135 135 138 148"
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
          <path d="M132 70 L136 80 L132 90 L136 100 L132 110 L136 120 L132 130 L136 140 L134 148"
            fill="none" stroke={darker} strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
          <circle cx="137" cy="151" r="5" fill={color} />
          <circle cx="137" cy="151" r="2.5" fill={darker} fillOpacity="0.15" />
        </>
      );
    case "ponytail":
      return (
        <>
          {/* Ponytail flowing from back of head */}
          <path d="M130 50 Q148 55 150 75 Q152 100 146 125 Q142 140 138 150"
            fill={color} />
          <path d="M130 52 Q145 58 148 76 Q150 98 145 122"
            fill="none" stroke={darker} strokeWidth="0.8" strokeOpacity="0.15" />
          {/* Hair tie */}
          <ellipse cx="131" cy="50" rx="5" ry="4" fill={darker} fillOpacity="0.45" />
          {/* Ponytail tip */}
          <path d="M138 148 Q135 156 140 158 Q145 154 141 148" fill={color} />
        </>
      );
    case "afro":
      return (
        <>
          {/* Large afro silhouette behind head */}
          <ellipse cx={ANCHORS.headCx} cy="65" rx="54" ry="52" fill={color} />
          <ellipse cx={ANCHORS.headCx} cy="67" rx="50" ry="48" fill={darker} fillOpacity="0.04" />
        </>
      );
    default:
      return null;
  }
}

/**
 * Hair that renders ON TOP of the head (scalp cap, bangs, front volume).
 * Anchored to ANCHORS.scalpTop so it sits naturally.
 */
function renderHairFront(style: AvatarConfig["hairStyle"], color: string) {
  const darker = darken(color, 15);
  const { scalpTop, scalpLeft, scalpRight, headCx } = ANCHORS;

  switch (style) {
    case "short":
      return (
        <>
          {/* Scalp cap - anchored to top of head ellipse */}
          <path
            d={`M${scalpLeft} 70 Q${scalpLeft} ${scalpTop + 2} ${headCx} ${scalpTop - 3} Q${scalpRight} ${scalpTop + 2} ${scalpRight} 70 L${scalpRight - 2} 62 Q${scalpRight - 6} ${scalpTop + 8} ${headCx} ${scalpTop + 4} Q${scalpLeft + 6} ${scalpTop + 8} ${scalpLeft + 2} 62 Z`}
            fill={color}
          />
          <path
            d={`M${scalpLeft + 4} 62 Q${scalpLeft + 10} ${scalpTop + 10} ${headCx} ${scalpTop + 6} Q${scalpRight - 10} ${scalpTop + 10} ${scalpRight - 4} 62`}
            fill="none" stroke={darker} strokeWidth="1" strokeOpacity="0.2"
          />
        </>
      );
    case "curly":
      return (
        <>
          {/* Curly volume on top - clusters anchored to scalp */}
          <path d={`M${scalpLeft - 2} 72 Q${scalpLeft - 4} ${scalpTop} ${headCx} ${scalpTop - 6} Q${scalpRight + 4} ${scalpTop} ${scalpRight + 2} 72`} fill={color} />
          {/* Curly puffs along the scalp line */}
          <circle cx={scalpLeft + 4} cy={scalpTop + 10} r="10" fill={color} />
          <circle cx={scalpLeft + 18} cy={scalpTop} r="11" fill={color} />
          <circle cx={headCx} cy={scalpTop - 5} r="12" fill={color} />
          <circle cx={scalpRight - 18} cy={scalpTop} r="11" fill={color} />
          <circle cx={scalpRight - 4} cy={scalpTop + 10} r="10" fill={color} />
          {/* Side puffs */}
          <circle cx={scalpLeft - 5} cy="62" r="9" fill={color} />
          <circle cx={scalpRight + 5} cy="62" r="9" fill={color} />
          <circle cx={scalpLeft - 7} cy="78" r="7" fill={color} />
          <circle cx={scalpRight + 7} cy="78" r="7" fill={color} />
          {/* Highlights */}
          <circle cx={headCx - 15} cy={scalpTop} r="2.5" fill="white" fillOpacity="0.08" />
          <circle cx={headCx + 15} cy={scalpTop} r="2.5" fill="white" fillOpacity="0.08" />
        </>
      );
    case "long":
      return (
        <>
          {/* Scalp cap on top */}
          <path
            d={`M${scalpLeft - 2} 72 Q${scalpLeft - 2} ${scalpTop - 2} ${headCx} ${scalpTop - 8} Q${scalpRight + 2} ${scalpTop - 2} ${scalpRight + 2} 72`}
            fill={color}
          />
          {/* Bangs */}
          <path d={`M${scalpLeft + 2} 68 Q${scalpLeft + 12} 58 ${headCx - 6} 62 Q${headCx + 6} 66 ${headCx + 12} 60 Q${scalpRight - 8} 56 ${scalpRight - 2} 68`}
            fill={color} />
          <path d={`M${scalpLeft + 6} 65 Q${headCx} 56 ${scalpRight - 6} 65`}
            fill="none" stroke={darker} strokeWidth="0.7" strokeOpacity="0.12" />
        </>
      );
    case "braids":
      return (
        <>
          {/* Scalp cap */}
          <path
            d={`M${scalpLeft} 72 Q${scalpLeft} ${scalpTop} ${headCx} ${scalpTop - 6} Q${scalpRight} ${scalpTop} ${scalpRight} 72`}
            fill={color}
          />
          {/* Center part line */}
          <line x1={headCx} y1={scalpTop - 4} x2={headCx} y2="65" stroke={darker} strokeWidth="1.2" strokeOpacity="0.2" />
        </>
      );
    case "ponytail":
      return (
        <>
          {/* Scalp cap with swept-back look */}
          <path
            d={`M${scalpLeft} 72 Q${scalpLeft - 2} ${scalpTop} ${headCx} ${scalpTop - 6} Q${scalpRight + 2} ${scalpTop - 2} ${scalpRight + 2} 68`}
            fill={color}
          />
          {/* Swept lines */}
          <path d={`M${scalpLeft + 8} 58 Q${headCx} ${scalpTop + 2} ${scalpRight - 2} 52`}
            fill="none" stroke={darker} strokeWidth="0.8" strokeOpacity="0.15" />
          <path d={`M${scalpLeft + 12} 54 Q${headCx} ${scalpTop} ${scalpRight - 6} 48`}
            fill="none" stroke={darker} strokeWidth="0.6" strokeOpacity="0.1" />
        </>
      );
    case "afro":
      return (
        <>
          {/* Front volume above forehead - sits on top of head */}
          <path
            d={`M${scalpLeft - 14} 80 Q${scalpLeft - 16} 30 ${headCx} 15 Q${scalpRight + 16} 30 ${scalpRight + 14} 80`}
            fill={color}
          />
          {/* Texture bumps */}
          <circle cx={scalpLeft} cy="28" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx={headCx - 15} cy="18" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx={headCx} cy="14" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx={headCx + 15} cy="18" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx={scalpRight} cy="28" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx={scalpLeft - 10} cy="55" r="2.5" fill={darker} fillOpacity="0.06" />
          <circle cx={scalpRight + 10} cy="55" r="2.5" fill={darker} fillOpacity="0.06" />
        </>
      );
    case "none":
      return null;
    default:
      return null;
  }
}

/**
 * Mask rendered relative to eye anchor points.
 */
function renderMask(suitColor: string, suitDarker: string) {
  const { eyeY, eyeLeftX, eyeRightX, headCx } = ANCHORS;
  const maskTop = eyeY - 8;
  const maskBot = eyeY + 6;

  return (
    <>
      <path
        d={`M${eyeLeftX - 16} ${maskTop} Q${eyeLeftX - 6} ${maskTop - 6} ${eyeLeftX} ${maskTop - 2} L${eyeLeftX + 6} ${eyeY - 4} Q${headCx - 4} ${maskTop - 2} ${headCx} ${maskTop - 2} Q${headCx + 4} ${maskTop - 2} ${eyeRightX - 6} ${eyeY - 4} L${eyeRightX} ${maskTop - 2} Q${eyeRightX + 6} ${maskTop - 6} ${eyeRightX + 16} ${maskTop} L${eyeRightX + 14} ${maskBot} Q${eyeRightX + 6} ${maskBot + 2} ${eyeRightX} ${maskBot} Q${headCx + 6} ${maskBot - 2} ${headCx} ${maskBot - 2} Q${headCx - 6} ${maskBot - 2} ${eyeLeftX} ${maskBot} Q${eyeLeftX - 6} ${maskBot + 2} ${eyeLeftX - 14} ${maskBot} Z`}
        fill={suitColor}
      />
      <path
        d={`M${eyeLeftX - 16} ${maskTop} Q${eyeLeftX - 6} ${maskTop - 6} ${eyeLeftX} ${maskTop - 2} L${eyeLeftX + 6} ${eyeY - 4} Q${headCx - 4} ${maskTop - 2} ${headCx} ${maskTop - 2} Q${headCx + 4} ${maskTop - 2} ${eyeRightX - 6} ${eyeY - 4} L${eyeRightX} ${maskTop - 2} Q${eyeRightX + 6} ${maskTop - 6} ${eyeRightX + 16} ${maskTop} L${eyeRightX + 14} ${maskBot} Q${eyeRightX + 6} ${maskBot + 2} ${eyeRightX} ${maskBot} Q${headCx + 6} ${maskBot - 2} ${headCx} ${maskBot - 2} Q${headCx - 6} ${maskBot - 2} ${eyeLeftX} ${maskBot} Q${eyeLeftX - 6} ${maskBot + 2} ${eyeLeftX - 14} ${maskBot} Z`}
        fill="none" stroke={suitDarker} strokeWidth="1.5"
      />
    </>
  );
}

function renderAccessory(accessory: AvatarConfig["accessory"], suitColor: string, suitDarker: string) {
  switch (accessory) {
    case "goggles":
      return (
        <>
          <rect x="66" y="66" width="32" height="22" rx="9" fill={suitColor} fillOpacity="0.25" stroke={suitColor} strokeWidth="3" />
          <rect x="102" y="66" width="32" height="22" rx="9" fill={suitColor} fillOpacity="0.25" stroke={suitColor} strokeWidth="3" />
          <line x1="98" y1="77" x2="102" y2="77" stroke={suitColor} strokeWidth="3" />
          <path d="M66 74 Q52 70 52 77 Q52 84 66 80" fill="none" stroke={suitColor} strokeWidth="2.5" />
          <path d="M134 74 Q148 70 148 77 Q148 84 134 80" fill="none" stroke={suitColor} strokeWidth="2.5" />
          <ellipse cx="76" cy="73" rx="4" ry="2.5" fill="white" fillOpacity="0.2" transform="rotate(-15 76 73)" />
          <ellipse cx="112" cy="73" rx="4" ry="2.5" fill="white" fillOpacity="0.2" transform="rotate(-15 112 73)" />
        </>
      );
    case "magnifying-glass":
      return (
        <>
          <circle cx="155" cy="155" r="14" fill="none" stroke={suitDarker} strokeWidth="3.5" />
          <circle cx="155" cy="155" r="12" fill="white" fillOpacity="0.15" />
          <line x1="165" y1="165" x2="175" y2="178" stroke={suitDarker} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="151" cy="151" rx="4" ry="2.5" fill="white" fillOpacity="0.3" transform="rotate(-30 151 151)" />
        </>
      );
    case "tablet":
      return (
        <>
          <rect x="28" y="148" width="24" height="32" rx="4" fill="#263238" />
          <rect x="30" y="151" width="20" height="25" rx="2" fill={suitColor} fillOpacity="0.4" />
          <line x1="33" y1="156" x2="47" y2="156" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="33" y1="161" x2="44" y2="161" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
          <line x1="33" y1="166" x2="41" y2="166" stroke="white" strokeWidth="1" strokeOpacity="0.25" />
          <circle cx="40" cy="178" r="1.5" fill="white" fillOpacity="0.3" />
        </>
      );
    default:
      return null;
  }
}
