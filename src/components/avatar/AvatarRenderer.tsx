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
        {/* Background circle */}
        <circle cx="100" cy="100" r="96" fill={`url(#bg-${uid})`} />
        <circle cx="100" cy="100" r="96" fill="none" stroke={suitColor} strokeWidth="3" strokeOpacity="0.25" />

        {/* Cape - behind everything */}
        <path
          d="M52 138 Q38 170 50 200 L100 195 L150 200 Q162 170 148 138 Z"
          fill={suitColor}
          fillOpacity="0.55"
        />
        <path
          d="M52 138 Q45 165 50 200"
          fill="none" stroke={suitDarker} strokeWidth="1.5" strokeOpacity="0.3"
        />
        <path
          d="M148 138 Q155 165 150 200"
          fill="none" stroke={suitDarker} strokeWidth="1.5" strokeOpacity="0.3"
        />

        {/* Body / Hero Suit */}
        <path
          d="M58 155 Q58 132 76 126 L88 122 Q100 118 112 122 L124 126 Q142 132 142 155 L142 200 L58 200 Z"
          fill={`url(#suit-grad-${uid})`}
        />
        {/* Suit collar V */}
        <path d="M84 122 L100 140 L116 122" fill="none" stroke={suitDarker} strokeWidth="2.5" strokeLinecap="round" />
        {/* Chest emblem - star/diamond */}
        <polygon points="100,143 105,149 103,156 97,156 95,149" fill="white" fillOpacity="0.85" />
        <polygon points="100,145 103,149 101,154 99,154 97,149" fill={suitLighter} fillOpacity="0.6" />
        {/* Tech lines on suit */}
        <path d="M76 140 L82 155" fill="none" stroke={suitLighter} strokeWidth="1.2" strokeOpacity="0.4" />
        <path d="M124 140 L118 155" fill="none" stroke={suitLighter} strokeWidth="1.2" strokeOpacity="0.4" />
        <path d="M70 160 L75 175" fill="none" stroke={suitLighter} strokeWidth="1" strokeOpacity="0.3" />
        <path d="M130 160 L125 175" fill="none" stroke={suitLighter} strokeWidth="1" strokeOpacity="0.3" />
        {/* Shoulder pads */}
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

        {/* Neck */}
        <rect x="90" y="112" width="20" height="14" rx="5" fill={faceColor} />

        {/* Head */}
        <ellipse cx="100" cy="78" rx="38" ry="40" fill={faceColor} />

        {/* Ears */}
        <ellipse cx="63" cy="80" rx="7" ry="9" fill={faceColor} />
        <ellipse cx="63" cy="80" rx="4" ry="5.5" fill={faceDarker} fillOpacity="0.25" />
        <ellipse cx="137" cy="80" rx="7" ry="9" fill={faceColor} />
        <ellipse cx="137" cy="80" rx="4" ry="5.5" fill={faceDarker} fillOpacity="0.25" />

        {/* Hair - rendered behind face features */}
        {renderHair(hairStyle, hairColor)}

        {/* Eyes - big and expressive */}
        <>
          {/* Eye whites */}
          <ellipse cx="84" cy="76" rx="11" ry="10" fill="white" />
          <ellipse cx="116" cy="76" rx="11" ry="10" fill="white" />
          {/* Irises */}
          <circle cx="86" cy="77" r="6.5" fill="#2C1810" />
          <circle cx="118" cy="77" r="6.5" fill="#2C1810" />
          {/* Pupils */}
          <circle cx="87.5" cy="75.5" r="2.5" fill="white" />
          <circle cx="119.5" cy="75.5" r="2.5" fill="white" />
          {/* Smaller glint */}
          <circle cx="84" cy="79" r="1.2" fill="white" fillOpacity="0.6" />
          <circle cx="116" cy="79" r="1.2" fill="white" fillOpacity="0.6" />
          {/* Eyelashes for girl */}
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
        </>

        {/* Eyebrows */}
        <path d="M76 65 Q84 60 92 65" fill="none" stroke={darken(hairColor, 20)} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M108 65 Q116 60 124 65" fill="none" stroke={darken(hairColor, 20)} strokeWidth="2.8" strokeLinecap="round" />

        {/* Nose */}
        <ellipse cx="100" cy="88" rx="3.5" ry="2.5" fill={faceDarker} fillOpacity="0.35" />

        {/* Mouth - big friendly smile */}
        <path d="M88 98 Q100 110 112 98" fill="none" stroke={faceDarker} strokeWidth="2.8" strokeLinecap="round" />
        {/* Tooth for extra cuteness on hero type */}
        {characterType === "hero" && (
          <rect x="97" y="98" width="6" height="4" rx="1" fill="white" fillOpacity="0.9" />
        )}

        {/* Cheek blush */}
        <circle cx="70" cy="92" r="8" fill="#FF9999" fillOpacity="0.2" />
        <circle cx="130" cy="92" r="8" fill="#FF9999" fillOpacity="0.2" />

        {/* Accessories */}
        {renderAccessory(accessory, suitColor, suitDarker)}
      </g>
    </svg>
  );
}

function renderHair(style: AvatarConfig["hairStyle"], color: string) {
  const darker = darken(color, 15);

  switch (style) {
    case "short":
      return (
        <>
          <path d="M62 73 Q62 40 100 35 Q138 40 138 73 L136 63 Q132 46 100 42 Q68 46 64 63 Z" fill={color} />
          <path d="M66 62 Q72 48 100 44 Q128 48 134 62" fill="none" stroke={darker} strokeWidth="1" strokeOpacity="0.25" />
        </>
      );
    case "curly":
      return (
        <>
          <path d="M60 76 Q58 40 100 34 Q142 40 140 76" fill={color} />
          <circle cx="66" cy="48" r="11" fill={color} />
          <circle cx="82" cy="37" r="12" fill={color} />
          <circle cx="100" cy="33" r="12" fill={color} />
          <circle cx="118" cy="37" r="12" fill={color} />
          <circle cx="134" cy="48" r="11" fill={color} />
          <circle cx="57" cy="64" r="10" fill={color} />
          <circle cx="143" cy="64" r="10" fill={color} />
          <circle cx="54" cy="80" r="8" fill={color} />
          <circle cx="146" cy="80" r="8" fill={color} />
          {/* Subtle highlights */}
          <circle cx="75" cy="38" r="3" fill="white" fillOpacity="0.08" />
          <circle cx="125" cy="38" r="3" fill="white" fillOpacity="0.08" />
        </>
      );
    case "long":
      return (
        <>
          <path d="M60 76 Q58 38 100 32 Q142 38 140 76" fill={color} />
          {/* Left side flowing */}
          <path d="M60 76 Q54 95 53 118 Q52 140 57 155 L63 155 Q59 140 59 118 Q59 95 62 78 Z" fill={color} />
          {/* Right side flowing */}
          <path d="M140 76 Q146 95 147 118 Q148 140 143 155 L137 155 Q141 140 141 118 Q141 95 138 78 Z" fill={color} />
          {/* Hair strand lines */}
          <path d="M57 95 Q55 115 56 135" fill="none" stroke={darker} strokeWidth="0.8" strokeOpacity="0.15" />
          <path d="M143 95 Q145 115 144 135" fill="none" stroke={darker} strokeWidth="0.8" strokeOpacity="0.15" />
          <path d="M60 90 Q58 110 59 130" fill="none" stroke={darker} strokeWidth="0.6" strokeOpacity="0.1" />
          <path d="M140 90 Q142 110 141 130" fill="none" stroke={darker} strokeWidth="0.6" strokeOpacity="0.1" />
        </>
      );
    case "braids":
      return (
        <>
          <path d="M60 76 Q58 38 100 32 Q142 38 140 76" fill={color} />
          {/* Left braid */}
          <path d="M65 80 Q60 85 62 95 Q64 105 60 115 Q58 125 62 135 Q64 142 62 150"
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
          <path d="M65 80 Q70 88 66 98 Q62 108 66 118 Q70 128 66 138 Q62 145 66 152"
            fill="none" stroke={darker} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.2" />
          <circle cx="62" cy="153" r="5.5" fill={color} />
          <circle cx="62" cy="153" r="3" fill={darker} fillOpacity="0.15" />
          {/* Right braid */}
          <path d="M135 80 Q140 85 138 95 Q136 105 140 115 Q142 125 138 135 Q136 142 138 150"
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
          <path d="M135 80 Q130 88 134 98 Q138 108 134 118 Q130 128 134 138 Q138 145 134 152"
            fill="none" stroke={darker} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.2" />
          <circle cx="138" cy="153" r="5.5" fill={color} />
          <circle cx="138" cy="153" r="3" fill={darker} fillOpacity="0.15" />
        </>
      );
    case "ponytail":
      return (
        <>
          <path d="M60 76 Q58 38 100 32 Q142 38 140 76" fill={color} />
          {/* Hair tie */}
          <ellipse cx="132" cy="48" rx="6" ry="5" fill={darker} fillOpacity="0.4" />
          {/* Ponytail flowing back */}
          <path d="M132 48 Q152 50 153 70 Q154 95 148 118 Q143 135 138 148" fill={color} />
          <path d="M132 48 Q148 54 150 72 Q152 92 147 115" fill="none" stroke={darker} strokeWidth="0.8" strokeOpacity="0.15" />
          {/* Ponytail tip */}
          <path d="M138 148 Q134 155 139 158 Q144 155 141 148" fill={color} />
        </>
      );
    case "afro":
      return (
        <>
          <ellipse cx="100" cy="60" rx="56" ry="50" fill={color} />
          <ellipse cx="100" cy="62" rx="52" ry="46" fill={darker} fillOpacity="0.05" />
          {/* Texture bumps */}
          <circle cx="62" cy="42" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx="78" cy="28" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx="100" cy="22" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx="122" cy="28" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx="138" cy="42" r="3" fill={darker} fillOpacity="0.08" />
          <circle cx="52" cy="62" r="2.5" fill={darker} fillOpacity="0.08" />
          <circle cx="148" cy="62" r="2.5" fill={darker} fillOpacity="0.08" />
          <circle cx="56" cy="80" r="2" fill={darker} fillOpacity="0.06" />
          <circle cx="144" cy="80" r="2" fill={darker} fillOpacity="0.06" />
        </>
      );
    case "none":
      return null;
    default:
      return null;
  }
}

function renderAccessory(accessory: AvatarConfig["accessory"], suitColor: string, suitDarker: string) {
  switch (accessory) {
    case "mask":
      return (
        <>
          {/* Superhero domino mask */}
          <path d="M68 72 Q76 66 84 70 L88 72 Q94 68 100 68 Q106 68 112 72 L116 70 Q124 66 132 72 L130 80 Q124 84 116 80 Q112 78 100 78 Q88 78 84 80 Q76 84 70 80 Z"
            fill={suitColor} />
          <path d="M68 72 Q76 66 84 70 L88 72 Q94 68 100 68 Q106 68 112 72 L116 70 Q124 66 132 72 L130 80 Q124 84 116 80 Q112 78 100 78 Q88 78 84 80 Q76 84 70 80 Z"
            fill="none" stroke={suitDarker} strokeWidth="1.5" />
          {/* Eye cutouts */}
          <ellipse cx="82" cy="76" rx="8" ry="5.5" fill="white" fillOpacity="0" />
          <ellipse cx="118" cy="76" rx="8" ry="5.5" fill="white" fillOpacity="0" />
        </>
      );
    case "goggles":
      return (
        <>
          <rect x="66" y="66" width="32" height="22" rx="9" fill={suitColor} fillOpacity="0.25" stroke={suitColor} strokeWidth="3" />
          <rect x="102" y="66" width="32" height="22" rx="9" fill={suitColor} fillOpacity="0.25" stroke={suitColor} strokeWidth="3" />
          <line x1="98" y1="77" x2="102" y2="77" stroke={suitColor} strokeWidth="3" />
          <path d="M66 74 Q52 70 52 77 Q52 84 66 80" fill="none" stroke={suitColor} strokeWidth="2.5" />
          <path d="M134 74 Q148 70 148 77 Q148 84 134 80" fill="none" stroke={suitColor} strokeWidth="2.5" />
          {/* Lens glare */}
          <ellipse cx="76" cy="73" rx="4" ry="2.5" fill="white" fillOpacity="0.2" transform="rotate(-15 76 73)" />
          <ellipse cx="112" cy="73" rx="4" ry="2.5" fill="white" fillOpacity="0.2" transform="rotate(-15 112 73)" />
        </>
      );
    case "magnifying-glass":
      return (
        <>
          {/* Held in right hand area */}
          <circle cx="155" cy="155" r="14" fill="none" stroke={suitDarker} strokeWidth="3.5" />
          <circle cx="155" cy="155" r="12" fill="white" fillOpacity="0.15" />
          <line x1="165" y1="165" x2="175" y2="178" stroke={suitDarker} strokeWidth="4" strokeLinecap="round" />
          {/* Lens glare */}
          <ellipse cx="151" cy="151" rx="4" ry="2.5" fill="white" fillOpacity="0.3" transform="rotate(-30 151 151)" />
        </>
      );
    case "tablet":
      return (
        <>
          {/* Held tablet in left hand area */}
          <rect x="28" y="148" width="24" height="32" rx="4" fill="#263238" />
          <rect x="30" y="151" width="20" height="25" rx="2" fill={suitColor} fillOpacity="0.4" />
          {/* Screen content lines */}
          <line x1="33" y1="156" x2="47" y2="156" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" />
          <line x1="33" y1="161" x2="44" y2="161" stroke="white" strokeWidth="1.2" strokeOpacity="0.35" />
          <line x1="33" y1="166" x2="41" y2="166" stroke="white" strokeWidth="1" strokeOpacity="0.25" />
          {/* Home button */}
          <circle cx="40" cy="178" r="1.5" fill="white" fillOpacity="0.3" />
        </>
      );
    default:
      return null;
  }
}
