import { type AvatarConfig, DEFAULT_AVATAR } from "./avatarConfig";

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
  // If no config or empty, show fallback emoji
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
  const isRobot = characterType === "robot";
  const faceColor = isRobot ? "#B0BEC5" : skinTone;
  const faceDarker = isRobot ? "#90A4AE" : darken(skinTone, 20);
  const suitDarker = darken(suitColor, 30);
  const suitLighter = lighten(suitColor, 40);
  const hasLashes = characterType === "girl";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <clipPath id="circleClip">
          <circle cx="100" cy="100" r="96" />
        </clipPath>
        <radialGradient id={`bg-${suitColor.replace('#','')}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={suitLighter} stopOpacity="0.3" />
          <stop offset="100%" stopColor={suitColor} stopOpacity="0.15" />
        </radialGradient>
      </defs>

      <g clipPath="url(#circleClip)">
        {/* Background */}
        <circle cx="100" cy="100" r="96" fill={`url(#bg-${suitColor.replace('#','')})`} />
        <circle cx="100" cy="100" r="96" fill="none" stroke={suitColor} strokeWidth="3" strokeOpacity="0.3" />

        {/* Cape (behind body) */}
        {accessory === "cape" && (
          <path d="M55 130 Q45 180 60 195 L100 185 L140 195 Q155 180 145 130 Z" fill={suitColor} fillOpacity="0.6" />
        )}

        {/* Body / Suit */}
        <path
          d="M60 155 Q60 135 75 128 L85 125 Q100 120 115 125 L125 128 Q140 135 140 155 L140 200 L60 200 Z"
          fill={suitColor}
        />
        {/* Suit detail - collar */}
        <path d="M85 125 L100 138 L115 125" fill="none" stroke={suitDarker} strokeWidth="2.5" strokeLinecap="round" />
        {/* Suit emblem */}
        <circle cx="100" cy="150" r="8" fill={suitDarker} fillOpacity="0.3" />
        <path d="M96 150 L100 145 L104 150 L100 155 Z" fill="white" fillOpacity="0.7" />

        {/* Neck */}
        <rect x="90" y="115" width="20" height="15" rx="4" fill={faceColor} />

        {/* Head */}
        {isRobot ? (
          <>
            <rect x="65" y="45" width="70" height="72" rx="12" fill={faceColor} />
            {/* Antenna */}
            <line x1="100" y1="45" x2="100" y2="30" stroke="#78909C" strokeWidth="3" />
            <circle cx="100" cy="27" r="5" fill={suitColor} />
            {/* Robot ears */}
            <rect x="58" y="65" width="8" height="20" rx="3" fill="#78909C" />
            <rect x="134" y="65" width="8" height="20" rx="3" fill="#78909C" />
          </>
        ) : (
          <ellipse cx="100" cy="80" rx="38" ry="40" fill={faceColor} />
        )}

        {/* Ears (non-robot) */}
        {!isRobot && (
          <>
            <ellipse cx="63" cy="82" rx="7" ry="9" fill={faceColor} />
            <ellipse cx="63" cy="82" rx="4" ry="5" fill={faceDarker} fillOpacity="0.3" />
            <ellipse cx="137" cy="82" rx="7" ry="9" fill={faceColor} />
            <ellipse cx="137" cy="82" rx="4" ry="5" fill={faceDarker} fillOpacity="0.3" />
          </>
        )}

        {/* Hair */}
        {!isRobot && renderHair(hairStyle, hairColor)}

        {/* Eyes */}
        {isRobot ? (
          <>
            <rect x="78" y="68" width="16" height="12" rx="3" fill="#263238" />
            <rect x="81" y="71" width="5" height="6" rx="1" fill={suitColor} />
            <rect x="106" y="68" width="16" height="12" rx="3" fill="#263238" />
            <rect x="109" y="71" width="5" height="6" rx="1" fill={suitColor} />
          </>
        ) : (
          <>
            {/* Eye whites */}
            <ellipse cx="85" cy="78" rx="9" ry="8" fill="white" />
            <ellipse cx="115" cy="78" rx="9" ry="8" fill="white" />
            {/* Irises */}
            <circle cx="87" cy="79" r="5" fill="#2C1810" />
            <circle cx="117" cy="79" r="5" fill="#2C1810" />
            {/* Pupils */}
            <circle cx="88" cy="78" r="2" fill="white" />
            <circle cx="118" cy="78" r="2" fill="white" />
            {/* Eyelashes (girl) */}
            {hasLashes && (
              <>
                <line x1="77" y1="73" x2="79" y2="71" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="93" y1="73" x2="91" y2="71" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="107" y1="73" x2="109" y2="71" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="123" y1="73" x2="121" y2="71" stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </>
        )}

        {/* Eyebrows */}
        {!isRobot && (
          <>
            <path d="M78 68 Q85 64 92 68" fill="none" stroke={darken(hairColor, 20)} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M108 68 Q115 64 122 68" fill="none" stroke={darken(hairColor, 20)} strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}

        {/* Nose */}
        {!isRobot && (
          <ellipse cx="100" cy="90" rx="3" ry="2.5" fill={faceDarker} fillOpacity="0.4" />
        )}

        {/* Mouth */}
        {isRobot ? (
          <rect x="88" y="93" width="24" height="4" rx="2" fill="#263238" />
        ) : (
          <path d="M90 100 Q100 110 110 100" fill="none" stroke={faceDarker} strokeWidth="2.5" strokeLinecap="round" />
        )}

        {/* Cheeks (blush - non-robot) */}
        {!isRobot && (
          <>
            <circle cx="72" cy="93" r="7" fill="#FF9999" fillOpacity="0.25" />
            <circle cx="128" cy="93" r="7" fill="#FF9999" fillOpacity="0.25" />
          </>
        )}

        {/* Accessories */}
        {renderAccessory(accessory, suitColor)}
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
          <path d="M62 75 Q62 42 100 38 Q138 42 138 75 L135 65 Q130 48 100 44 Q70 48 65 65 Z" fill={color} />
          <path d="M65 65 Q70 50 100 46 Q130 50 135 65" fill="none" stroke={darker} strokeWidth="1" strokeOpacity="0.3" />
        </>
      );
    case "curly":
      return (
        <>
          <path d="M58 80 Q55 40 100 35 Q145 40 142 80" fill={color} />
          <circle cx="62" cy="55" r="8" fill={color} />
          <circle cx="75" cy="43" r="9" fill={color} />
          <circle cx="93" cy="37" r="9" fill={color} />
          <circle cx="110" cy="37" r="9" fill={color} />
          <circle cx="125" cy="43" r="9" fill={color} />
          <circle cx="138" cy="55" r="8" fill={color} />
          <circle cx="58" cy="72" r="7" fill={color} />
          <circle cx="142" cy="72" r="7" fill={color} />
        </>
      );
    case "long":
      return (
        <>
          <path d="M60 75 Q60 40 100 35 Q140 40 140 75" fill={color} />
          <path d="M60 75 Q58 120 65 145" fill={color} stroke={darker} strokeWidth="0.5" />
          <path d="M140 75 Q142 120 135 145" fill={color} stroke={darker} strokeWidth="0.5" />
          <path d="M63 80 L58 140" fill="none" stroke={darker} strokeWidth="1" strokeOpacity="0.2" />
          <path d="M137 80 L142 140" fill="none" stroke={darker} strokeWidth="1" strokeOpacity="0.2" />
        </>
      );
    case "braids":
      return (
        <>
          <path d="M60 75 Q60 40 100 35 Q140 40 140 75" fill={color} />
          {/* Left braid */}
          <path d="M65 80 Q60 100 63 120 Q66 135 60 155" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          <path d="M65 80 Q70 100 67 120 Q64 135 70 155" fill="none" stroke={darker} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.3" />
          <circle cx="60" cy="158" r="4" fill={color} />
          {/* Right braid */}
          <path d="M135 80 Q140 100 137 120 Q134 135 140 155" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
          <path d="M135 80 Q130 100 133 120 Q136 135 130 155" fill="none" stroke={darker} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.3" />
          <circle cx="140" cy="158" r="4" fill={color} />
        </>
      );
    case "ponytail":
      return (
        <>
          <path d="M60 75 Q60 40 100 35 Q140 40 140 75" fill={color} />
          {/* Ponytail */}
          <path d="M115 45 Q140 35 145 55 Q150 80 140 115 Q135 130 130 140" fill={color} />
          <path d="M120 50 Q140 45 143 60" fill="none" stroke={darker} strokeWidth="1" strokeOpacity="0.2" />
          {/* Hair tie */}
          <circle cx="118" cy="47" r="4" fill={darker} fillOpacity="0.4" />
        </>
      );
    case "afro":
      return (
        <>
          <ellipse cx="100" cy="65" rx="52" ry="45" fill={color} />
          <ellipse cx="100" cy="65" rx="48" ry="41" fill={darker} fillOpacity="0.1" />
          {/* Texture dots */}
          <circle cx="70" cy="48" r="2" fill={darker} fillOpacity="0.15" />
          <circle cx="85" cy="35" r="2" fill={darker} fillOpacity="0.15" />
          <circle cx="115" cy="35" r="2" fill={darker} fillOpacity="0.15" />
          <circle cx="130" cy="48" r="2" fill={darker} fillOpacity="0.15" />
          <circle cx="58" cy="65" r="2" fill={darker} fillOpacity="0.15" />
          <circle cx="142" cy="65" r="2" fill={darker} fillOpacity="0.15" />
        </>
      );
    default:
      return null;
  }
}

function renderAccessory(accessory: AvatarConfig["accessory"], suitColor: string) {
  switch (accessory) {
    case "glasses":
      return (
        <>
          <circle cx="85" cy="78" r="13" fill="none" stroke="#333" strokeWidth="2.5" />
          <circle cx="115" cy="78" r="13" fill="none" stroke="#333" strokeWidth="2.5" />
          <line x1="98" y1="78" x2="102" y2="78" stroke="#333" strokeWidth="2.5" />
          <line x1="72" y1="76" x2="64" y2="74" stroke="#333" strokeWidth="2" />
          <line x1="128" y1="76" x2="136" y2="74" stroke="#333" strokeWidth="2" />
        </>
      );
    case "goggles":
      return (
        <>
          <rect x="68" y="67" width="30" height="22" rx="8" fill={suitColor} fillOpacity="0.3" stroke={suitColor} strokeWidth="3" />
          <rect x="102" y="67" width="30" height="22" rx="8" fill={suitColor} fillOpacity="0.3" stroke={suitColor} strokeWidth="3" />
          <line x1="98" y1="78" x2="102" y2="78" stroke={suitColor} strokeWidth="3" />
          {/* Strap */}
          <path d="M68 75 Q55 72 55 78 Q55 84 68 81" fill="none" stroke={suitColor} strokeWidth="2" />
          <path d="M132 75 Q145 72 145 78 Q145 84 132 81" fill="none" stroke={suitColor} strokeWidth="2" />
        </>
      );
    case "headset":
      return (
        <>
          {/* Headband */}
          <path d="M62 75 Q62 45 100 40 Q138 45 138 75" fill="none" stroke="#444" strokeWidth="4" />
          {/* Ear pieces */}
          <rect x="54" y="70" width="12" height="18" rx="4" fill="#444" />
          <rect x="134" y="70" width="12" height="18" rx="4" fill="#444" />
          <rect x="56" y="72" width="8" height="14" rx="3" fill={suitColor} fillOpacity="0.5" />
          <rect x="136" y="72" width="8" height="14" rx="3" fill={suitColor} fillOpacity="0.5" />
          {/* Mic */}
          <path d="M55 85 Q50 95 55 102" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="55" cy="104" r="3" fill="#444" />
        </>
      );
    case "visor":
      return (
        <rect x="65" y="68" width="70" height="18" rx="9" fill={suitColor} fillOpacity="0.5" stroke={suitColor} strokeWidth="2" />
      );
    default:
      return null;
  }
}
