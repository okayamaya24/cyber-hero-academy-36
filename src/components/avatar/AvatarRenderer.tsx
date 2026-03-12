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

export default function AvatarRenderer({ config, size = 120, className = "", fallbackEmoji }: AvatarRendererProps) {
  if (!config || !config.characterType) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-muted ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {fallbackEmoji || "🧒"}
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

  const uid = `av-${characterType}-${suitColor.replace("#", "")}-${hairColor.replace("#", "")}-${skinTone.replace("#", "")}-${hairStyle}`;

  const headCx = 100;
  const headCy = 80;
  const headRx = 38;
  const headRy = 40;
  const scalpTop = headCy - headRy;
  const eyeY = 82;
  const eyeLx = 83;
  const eyeRx = 117;

  return (
    <svg viewBox="0 0 200 220" width={size} height={size} className={className} style={{ display: "block" }}>
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

        <linearGradient id={`sh-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#clip-${uid})`}>
        <circle cx="100" cy="105" r="98" fill={`url(#bg-${uid})`} />
        <circle cx="100" cy="105" r="98" fill="none" stroke={suitColor} strokeWidth="2" strokeOpacity="0.15" />

        {/* Cape */}
        <path d="M50 148 Q36 178 44 220 L100 216 L156 220 Q164 178 150 148 Z" fill={suitColor} fillOpacity="0.35" />

        {/* Body */}
        <path
          d="M58 158 Q58 136 76 129 L90 125 Q100 122 110 125 L124 129 Q142 136 142 158 L142 220 L58 220 Z"
          fill={`url(#sg-${uid})`}
        />
        <path
          d="M58 158 Q58 136 76 129 L90 125 Q100 122 110 125 L124 129 Q142 136 142 158 L142 220 L58 220 Z"
          fill={`url(#sh-${uid})`}
        />

        <path
          d="M86 127 L100 144 L114 127"
          fill="none"
          stroke={suitDk}
          strokeWidth="2"
          strokeLinecap="round"
          strokeOpacity="0.45"
        />

        <polygon
          points="100,146 103,152 109,153 105,157 106,164 100,160 94,164 95,157 91,153 97,152"
          fill="white"
          fillOpacity="0.85"
        />
        <polygon
          points="100,148 102,152 107,153 104,156 105,161 100,158 95,161 96,156 93,153 98,152"
          fill={suitLt}
          fillOpacity="0.45"
        />

        <ellipse cx="69" cy="137" rx="12" ry="6.5" fill={suitDk} fillOpacity="0.25" />
        <ellipse cx="131" cy="137" rx="12" ry="6.5" fill={suitDk} fillOpacity="0.25" />

        <rect x="64" y="174" width="72" height="6" rx="3" fill={suitDk} fillOpacity="0.4" />
        <rect x="93" y="172" width="14" height="10" rx="3" fill={suitDk} fillOpacity="0.55" />
        <rect x="96" y="174" width="8" height="6" rx="2" fill="white" fillOpacity="0.4" />

        {/* Arms */}
        <path d="M58 142 Q46 160 52 182" fill="none" stroke={suitColor} strokeWidth="14" strokeLinecap="round" />
        <path d="M142 142 Q154 160 148 182" fill="none" stroke={suitColor} strokeWidth="14" strokeLinecap="round" />

        <ellipse cx="52" cy="184" rx="8.5" ry="6.5" fill={suitDk} />
        <ellipse cx="52" cy="184" rx="6.5" ry="5" fill={suitColor} />
        <ellipse cx="148" cy="184" rx="8.5" ry="6.5" fill={suitDk} />
        <ellipse cx="148" cy="184" rx="6.5" ry="5" fill={suitColor} />

        {/* Neck */}
        <rect x="90" y="115" width="20" height="15" rx="6" fill={skin} />

        {/* Hair back */}
        {hairBackLayer(characterType, hairStyle, hairColor, hairDk, headCx, headCy, headRx, headRy)}

        {/* Head */}
        <ellipse cx={headCx} cy={headCy} rx={headRx} ry={headRy} fill={skin} />
        <ellipse cx={headCx - 8} cy={headCy - 14} rx={16} ry={12} fill="white" fillOpacity="0.06" />

        {/* Ears */}
        <ellipse cx={headCx - headRx + 2} cy={headCy + 4} rx="6.5" ry="9" fill={skin} />
        <ellipse cx={headCx + headRx - 2} cy={headCy + 4} rx="6.5" ry="9" fill={skin} />

        {/* Face */}
        <ellipse cx={eyeLx} cy={eyeY} rx="11.5" ry="11" fill="white" />
        <ellipse cx={eyeRx} cy={eyeY} rx="11.5" ry="11" fill="white" />

        <circle cx={eyeLx + 1.5} cy={eyeY + 1} r="7" fill="#2C1810" />
        <circle cx={eyeRx + 1.5} cy={eyeY + 1} r="7" fill="#2C1810" />

        <circle cx={eyeLx + 2} cy={eyeY - 0.5} r="3.5" fill="#1a0e08" />
        <circle cx={eyeRx + 2} cy={eyeY - 0.5} r="3.5" fill="#1a0e08" />

        <circle cx={eyeLx + 3.5} cy={eyeY - 2} r="2.8" fill="white" />
        <circle cx={eyeRx + 3.5} cy={eyeY - 2} r="2.8" fill="white" />

        {isGirl && (
          <>
            <line
              x1={eyeLx - 9}
              y1={eyeY - 5}
              x2={eyeLx - 7}
              y2={eyeY - 8}
              stroke="#2C1810"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <line
              x1={eyeRx + 9}
              y1={eyeY - 5}
              x2={eyeRx + 7}
              y2={eyeY - 8}
              stroke="#2C1810"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </>
        )}

        <path
          d={`M${eyeLx - 9} ${eyeY - 14} Q${eyeLx} ${eyeY - 20} ${eyeLx + 9} ${eyeY - 14}`}
          fill="none"
          stroke={darken(hairColor, 35)}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d={`M${eyeRx - 9} ${eyeY - 14} Q${eyeRx} ${eyeY - 20} ${eyeRx + 9} ${eyeY - 14}`}
          fill="none"
          stroke={darken(hairColor, 35)}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <ellipse cx={headCx} cy={eyeY + 12} rx="3.2" ry="2.2" fill={skinShade} fillOpacity="0.25" />

        <path
          d={`M${headCx - 11} ${eyeY + 20} Q${headCx} ${eyeY + 30} ${headCx + 11} ${eyeY + 20}`}
          fill="none"
          stroke={skinShade}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle cx={headCx - 28} cy={eyeY + 14} r="8" fill="#FF9999" fillOpacity="0.15" />
        <circle cx={headCx + 28} cy={eyeY + 14} r="8" fill="#FF9999" fillOpacity="0.15" />

        {/* Accessory */}
        {renderAccessory(accessory, suitColor, suitDk, suitLt, eyeY, eyeLx, eyeRx, headCx)}

        {/* Hair front */}
        {hairFrontLayer(characterType, hairStyle, hairColor, hairDk, headCx, scalpTop, headRx)}
      </g>
    </svg>
  );
}

function hairBackLayer(
  characterType: AvatarConfig["characterType"],
  style: AvatarConfig["hairStyle"],
  color: string,
  dk: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
) {
  const scalpTop = cy - ry;
  const left = cx - rx;
  const right = cx + rx;

  switch (style) {
    case "bob":
      return (
        <>
          <path
            d={`M${left + 8} ${cy - 2}
               Q${left + 2} ${cy + 14} ${left + 10} ${cy + 40}
               Q${left + 16} ${cy + 54} ${left + 28} ${cy + 56}
               L${left + 34} ${cy + 56}
               Q${left + 24} ${cy + 38} ${left + 24} ${cy + 14}
               Q${left + 24} ${cy + 2} ${left + 22} ${cy - 8} Z`}
            fill={color}
          />
          <path
            d={`M${right - 8} ${cy - 2}
               Q${right - 2} ${cy + 14} ${right - 10} ${cy + 40}
               Q${right - 16} ${cy + 54} ${right - 28} ${cy + 56}
               L${right - 34} ${cy + 56}
               Q${right - 24} ${cy + 38} ${right - 24} ${cy + 14}
               Q${right - 24} ${cy + 2} ${right - 22} ${cy - 8} Z`}
            fill={color}
          />
        </>
      );

    case "ponytail":
      return (
        <>
          <path
            d={`M${right - 10} ${scalpTop + 10}
               Q${right + 16} ${scalpTop + 18} ${right + 18} ${cy + 4}
               Q${right + 20} ${cy + 24} ${right + 12} ${cy + 50}
               Q${right + 8} ${cy + 66} ${right + 4} ${cy + 76}`}
            fill={color}
          />
          <ellipse cx={right - 8} cy={scalpTop + 10} rx="4.5" ry="3.5" fill={dk} fillOpacity="0.35" />
        </>
      );

    case "braids":
      return (
        <>
          <path
            d={`M${left + 6} ${cy - 8}
               Q${left - 2} ${cy + 14} ${left} ${cy + 36}
               Q${left + 2} ${cy + 56} ${left} ${cy + 76}`}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d={`M${right - 6} ${cy - 8}
               Q${right + 2} ${cy + 14} ${right} ${cy + 36}
               Q${right - 2} ${cy + 56} ${right} ${cy + 76}`}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
          />
        </>
      );

    case "puffs":
      return (
        <>
          <circle cx={left + 6} cy={scalpTop + 14} r="13" fill={color} />
          <circle cx={right - 6} cy={scalpTop + 14} r="13" fill={color} />
        </>
      );

    default:
      return null;
  }
}

function hairFrontLayer(
  characterType: AvatarConfig["characterType"],
  style: AvatarConfig["hairStyle"],
  color: string,
  dk: string,
  cx: number,
  scalpTop: number,
  rx: number,
) {
  const left = cx - rx;
  const right = cx + rx;

  const hairlineY = scalpTop + 18;
  const bangY = scalpTop + 26;

  switch (style) {
    case "short":
      return (
        <path
          d={`M${left + 8} ${bangY}
             Q${left + 8} ${scalpTop + 6} ${cx} ${scalpTop + 2}
             Q${right - 8} ${scalpTop + 6} ${right - 8} ${bangY}
             Q${cx} ${bangY - 6} ${left + 8} ${bangY} Z`}
          fill={color}
        />
      );

    case "fade":
      return (
        <>
          <path
            d={`M${left + 14} ${bangY - 2}
               Q${left + 16} ${scalpTop + 8} ${cx} ${scalpTop + 2}
               Q${right - 16} ${scalpTop + 8} ${right - 14} ${bangY - 2}
               Q${cx} ${bangY - 8} ${left + 14} ${bangY - 2} Z`}
            fill={color}
          />
          <path
            d={`M${left + 18} ${bangY} Q${cx} ${bangY - 5} ${right - 18} ${bangY}`}
            fill="none"
            stroke={dk}
            strokeWidth="1"
            strokeOpacity="0.1"
          />
        </>
      );

    case "spiky":
      return (
        <path
          d={`M${left + 12} ${bangY + 2}
             L${left + 22} ${scalpTop + 12}
             L${left + 30} ${scalpTop - 2}
             L${cx - 8} ${scalpTop + 10}
             L${cx} ${scalpTop - 6}
             L${cx + 10} ${scalpTop + 8}
             L${right - 28} ${scalpTop - 2}
             L${right - 20} ${scalpTop + 12}
             L${right - 10} ${bangY + 2}
             Q${cx} ${bangY - 4} ${left + 12} ${bangY + 2} Z`}
          fill={color}
        />
      );

    case "curly":
      if (characterType === "boy") {
        return (
          <>
            <path
              d={`M${left + 10} ${hairlineY + 6}
                 Q${left + 10} ${scalpTop + 10} ${cx} ${scalpTop + 2}
                 Q${right - 10} ${scalpTop + 10} ${right - 10} ${hairlineY + 6}
                 Q${cx} ${hairlineY + 2} ${left + 10} ${hairlineY + 6} Z`}
              fill={color}
            />
            <circle cx={left + 18} cy={scalpTop + 10} r="7" fill={color} />
            <circle cx={cx - 10} cy={scalpTop + 2} r="8" fill={color} />
            <circle cx={cx + 2} cy={scalpTop} r="9" fill={color} />
            <circle cx={cx + 15} cy={scalpTop + 4} r="8" fill={color} />
            <circle cx={right - 18} cy={scalpTop + 12} r="7" fill={color} />
          </>
        );
      }

      return (
        <>
          <path
            d={`M${left + 8} ${hairlineY + 8}
               Q${left + 6} ${scalpTop + 10} ${cx} ${scalpTop + 4}
               Q${right - 6} ${scalpTop + 10} ${right - 8} ${hairlineY + 8}
               Q${cx} ${hairlineY + 2} ${left + 8} ${hairlineY + 8} Z`}
            fill={color}
          />
          <circle cx={left + 16} cy={scalpTop + 10} r="7" fill={color} />
          <circle cx={cx - 14} cy={scalpTop + 2} r="8" fill={color} />
          <circle cx={cx} cy={scalpTop - 1} r="9" fill={color} />
          <circle cx={cx + 14} cy={scalpTop + 2} r="8" fill={color} />
          <circle cx={right - 16} cy={scalpTop + 10} r="7" fill={color} />
        </>
      );

    case "afro":
      return (
        <>
          <path
            d={`M${left - 8} ${hairlineY + 8}
               Q${left - 10} ${scalpTop - 6} ${cx} ${scalpTop - 14}
               Q${right + 10} ${scalpTop - 6} ${right + 8} ${hairlineY + 8}`}
            fill={color}
          />
          <circle cx={left + 6} cy={scalpTop - 2} r="8" fill={color} />
          <circle cx={cx - 14} cy={scalpTop - 10} r="9" fill={color} />
          <circle cx={cx} cy={scalpTop - 14} r="10" fill={color} />
          <circle cx={cx + 14} cy={scalpTop - 10} r="9" fill={color} />
          <circle cx={right - 6} cy={scalpTop - 2} r="8" fill={color} />
        </>
      );

    case "bob":
      return (
        <>
          <path
            d={`M${left + 8} ${bangY}
               Q${left + 8} ${scalpTop + 6} ${cx} ${scalpTop + 1}
               Q${right - 8} ${scalpTop + 6} ${right - 8} ${bangY}
               Q${cx} ${bangY - 8} ${left + 8} ${bangY} Z`}
            fill={color}
          />
          <path
            d={`M${left + 14} ${bangY - 2} Q${cx} ${bangY + 4} ${right - 14} ${bangY - 2}`}
            fill="none"
            stroke={dk}
            strokeWidth="0.8"
            strokeOpacity="0.12"
          />
        </>
      );

    case "ponytail":
      return (
        <>
          <path
            d={`M${left + 8} ${hairlineY + 8}
               Q${left + 6} ${scalpTop + 8} ${cx} ${scalpTop + 2}
               Q${right - 4} ${scalpTop + 4} ${right - 6} ${hairlineY + 2}
               Q${cx} ${hairlineY - 2} ${left + 8} ${hairlineY + 8} Z`}
            fill={color}
          />
          <path
            d={`M${left + 18} ${scalpTop + 14} Q${cx} ${scalpTop + 2} ${right - 14} ${scalpTop + 10}`}
            fill="none"
            stroke={dk}
            strokeWidth="0.8"
            strokeOpacity="0.1"
          />
        </>
      );

    case "braids":
      return (
        <>
          <path
            d={`M${left + 8} ${hairlineY + 8}
               Q${left + 8} ${scalpTop + 6} ${cx} ${scalpTop + 2}
               Q${right - 8} ${scalpTop + 6} ${right - 8} ${hairlineY + 8}`}
            fill={color}
          />
          <line
            x1={cx}
            y1={scalpTop + 2}
            x2={cx}
            y2={hairlineY + 4}
            stroke={dk}
            strokeWidth="1.2"
            strokeOpacity="0.15"
          />
        </>
      );

    case "puffs":
      return (
        <>
          <path
            d={`M${left + 14} ${hairlineY + 8}
               Q${left + 14} ${scalpTop + 8} ${cx} ${scalpTop + 4}
               Q${right - 14} ${scalpTop + 8} ${right - 14} ${hairlineY + 8}
               Q${cx} ${hairlineY + 2} ${left + 14} ${hairlineY + 8} Z`}
            fill={color}
          />
        </>
      );

    default:
      return null;
  }
}

function renderAccessory(
  acc: AvatarConfig["accessory"],
  suitColor: string,
  suitDk: string,
  suitLt: string,
  eyeY: number,
  eyeLx: number,
  eyeRx: number,
  cx: number,
) {
  switch (acc) {
    case "goggles":
      return (
        <>
          <path
            d={`M${eyeLx - 22} ${eyeY - 4} Q${cx} ${eyeY - 12} ${eyeRx + 22} ${eyeY - 4}`}
            fill="none"
            stroke={suitColor}
            strokeWidth="3"
          />
          <rect
            x={eyeLx - 14}
            y={eyeY - 10}
            width="28"
            height="21"
            rx="10"
            fill={suitColor}
            fillOpacity="0.18"
            stroke={suitColor}
            strokeWidth="2.5"
          />
          <rect
            x={eyeRx - 14}
            y={eyeY - 10}
            width="28"
            height="21"
            rx="10"
            fill={suitColor}
            fillOpacity="0.18"
            stroke={suitColor}
            strokeWidth="2.5"
          />
          <line x1={eyeLx + 14} y1={eyeY + 1} x2={eyeRx - 14} y2={eyeY + 1} stroke={suitColor} strokeWidth="2.5" />
        </>
      );

    case "headband":
      return (
        <>
          <path
            d={`M${eyeLx - 22} ${eyeY - 16} Q${cx} ${eyeY - 26} ${eyeRx + 22} ${eyeY - 16}`}
            fill="none"
            stroke={suitColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={`M${eyeLx - 22} ${eyeY - 16} Q${cx} ${eyeY - 26} ${eyeRx + 22} ${eyeY - 16}`}
            fill="none"
            stroke={suitLt}
            strokeWidth="2"
            strokeOpacity="0.3"
          />
        </>
      );

    case "magnifying-glass":
      return (
        <>
          <circle cx="158" cy="168" r="13" fill="none" stroke={suitDk} strokeWidth="3.2" />
          <circle cx="158" cy="168" r="10.5" fill="white" fillOpacity="0.1" />
          <line x1="168" y1="178" x2="177" y2="190" stroke={suitDk} strokeWidth="3.5" strokeLinecap="round" />
        </>
      );

    case "tablet":
      return (
        <>
          <rect x="26" y="161" width="24" height="32" rx="4" fill="#263238" />
          <rect x="28" y="164" width="20" height="25" rx="2" fill={suitColor} fillOpacity="0.3" />
        </>
      );

    default:
      return null;
  }
}
