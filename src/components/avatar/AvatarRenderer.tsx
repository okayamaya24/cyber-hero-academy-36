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
  const skinHi = lighten(skinTone, 35);
  const suitDk = darken(suitColor, 50);
  const suitMd = darken(suitColor, 20);
  const suitLt = lighten(suitColor, 50);
  const suitXLt = lighten(suitColor, 85);
  const hairDk = darken(hairColor, 35);
  const hairLt = lighten(hairColor, 45);
  const isGirl = characterType === "girl";

  const uid = `hr-${characterType}-${suitColor.replace("#", "")}-${hairColor.replace("#", "")}-${skinTone.replace("#", "")}-${hairStyle}-${accessory}`;

  return (
    <svg viewBox="0 0 220 340" width={size} height={size * (340 / 220)} className={className} style={{ display: "block" }}>
      <defs>
        {/* Suit body gradient — rich 3-stop */}
        <linearGradient id={`suit-${uid}`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor={suitLt} />
          <stop offset="45%" stopColor={suitColor} />
          <stop offset="100%" stopColor={suitDk} />
        </linearGradient>
        {/* Glossy shine overlay */}
        <linearGradient id={`shine-${uid}`} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="40%" stopColor="white" stopOpacity="0.08" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Cape gradient */}
        <linearGradient id={`cape-${uid}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={suitColor} stopOpacity="0.9" />
          <stop offset="60%" stopColor={suitMd} stopOpacity="0.8" />
          <stop offset="100%" stopColor={suitDk} stopOpacity="0.5" />
        </linearGradient>
        {/* Boot gradient */}
        <linearGradient id={`boot-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitMd} />
          <stop offset="100%" stopColor={suitDk} />
        </linearGradient>
        {/* Skin radial */}
        <radialGradient id={`skin-${uid}`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor={skinHi} />
          <stop offset="70%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </radialGradient>
        {/* Hair gradient */}
        <linearGradient id={`hair-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={hairLt} />
          <stop offset="50%" stopColor={hairColor} />
          <stop offset="100%" stopColor={hairDk} />
        </linearGradient>
        {/* Emblem glow */}
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="55%" stopColor={suitXLt} stopOpacity="0.5" />
          <stop offset="100%" stopColor={suitColor} stopOpacity="0" />
        </radialGradient>
        {/* Glove gradient */}
        <linearGradient id={`glove-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitColor} />
          <stop offset="100%" stopColor={suitDk} />
        </linearGradient>
      </defs>

      {/* ═══════════════ CAPE ═══════════════ */}
      <path
        d="M50 145 Q32 190 36 250 Q38 285 55 312 L110 306 L165 312 Q182 285 184 250 Q188 190 170 145 Z"
        fill={`url(#cape-${uid})`}
      />
      {/* Cape fold highlights */}
      <path d="M55 160 Q50 200 52 240" fill="none" stroke={suitLt} strokeWidth="1.5" strokeOpacity="0.15" />
      <path d="M165 160 Q170 200 168 240" fill="none" stroke={suitLt} strokeWidth="1.5" strokeOpacity="0.15" />
      <path d="M80 155 Q75 210 78 280" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.08" />

      {/* ═══════════════ LEGS ═══════════════ */}
      <path d="M78 240 L75 282 Q75 290 82 290 L98 290 Q102 290 102 284 L102 240 Z" fill={`url(#suit-${uid})`} />
      <path d="M118 240 L118 284 Q118 290 122 290 L138 290 Q145 290 145 282 L142 240 Z" fill={`url(#suit-${uid})`} />
      {/* Leg shine */}
      <path d="M82 245 L82 278" stroke="white" strokeWidth="3" strokeOpacity="0.08" strokeLinecap="round" />
      <path d="M125 245 L125 278" stroke="white" strokeWidth="3" strokeOpacity="0.08" strokeLinecap="round" />
      {/* Knee panels */}
      <ellipse cx="90" cy="258" rx="8" ry="5" fill={suitLt} fillOpacity="0.12" />
      <ellipse cx="130" cy="258" rx="8" ry="5" fill={suitLt} fillOpacity="0.12" />

      {/* ═══════════════ BOOTS ═══════════════ */}
      <path d="M72 280 L72 310 Q72 320 82 320 L102 320 Q106 320 106 314 L106 280 Z" fill={`url(#boot-${uid})`} />
      <path d="M114 280 L114 314 Q114 320 118 320 L138 320 Q148 320 148 310 L148 280 Z" fill={`url(#boot-${uid})`} />
      {/* Boot trim */}
      <path d="M72 284 L106 284" stroke={suitLt} strokeWidth="3" strokeOpacity="0.45" />
      <path d="M114 284 L148 284" stroke={suitLt} strokeWidth="3" strokeOpacity="0.45" />
      {/* Boot toe caps */}
      <path d="M76 316 Q89 322 102 316" fill={suitLt} fillOpacity="0.15" />
      <path d="M118 316 Q131 322 144 316" fill={suitLt} fillOpacity="0.15" />
      {/* Boot soles */}
      <rect x="72" y="317" width="34" height="5" rx="2.5" fill={suitDk} fillOpacity="0.55" />
      <rect x="114" y="317" width="34" height="5" rx="2.5" fill={suitDk} fillOpacity="0.55" />

      {/* ═══════════════ BODY / SUIT ═══════════════ */}
      <path
        d="M60 158 Q58 132 80 124 L96 118 Q110 114 124 118 L140 124 Q162 132 160 158 L160 248 L60 248 Z"
        fill={`url(#suit-${uid})`}
      />
      {/* Glossy overlay */}
      <path
        d="M60 158 Q58 132 80 124 L96 118 Q110 114 124 118 L140 124 Q162 132 160 158 L160 248 L60 248 Z"
        fill={`url(#shine-${uid})`}
      />

      {/* Chest panel — techy hero suit detail */}
      <path
        d="M78 135 L95 125 Q110 121 125 125 L142 135 L138 180 Q110 190 82 180 Z"
        fill={suitLt} fillOpacity="0.08"
        stroke={suitLt} strokeWidth="0.8" strokeOpacity="0.2"
      />

      {/* Collar / V-neckline */}
      <path d="M88 122 L110 148 L132 122" fill="none" stroke={suitDk} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />

      {/* Chest emblem — glowing star */}
      <circle cx="110" cy="162" r="16" fill={`url(#glow-${uid})`} />
      <polygon
        points="110,147 113.5,156 123,157.5 116,163 117.5,173 110,168 102.5,173 104,163 97,157.5 106.5,156"
        fill="white" fillOpacity="0.92"
      />
      <polygon
        points="110,149 112.5,156 121,157 115,162 116,170 110,166 104,170 105,162 99,157 107.5,156"
        fill={suitLt} fillOpacity="0.45"
      />

      {/* Tech lines on suit */}
      <path d="M70 185 L90 182" stroke={suitLt} strokeWidth="1" strokeOpacity="0.2" />
      <path d="M130 182 L150 185" stroke={suitLt} strokeWidth="1" strokeOpacity="0.2" />
      <path d="M72 205 L148 205" stroke={suitDk} strokeWidth="1" strokeOpacity="0.1" />

      {/* Belt */}
      <rect x="64" y="230" width="92" height="10" rx="5" fill={suitDk} fillOpacity="0.5" />
      <rect x="98" y="228" width="24" height="14" rx="5" fill={suitDk} fillOpacity="0.65" />
      <rect x="102" y="230" width="16" height="10" rx="4" fill="white" fillOpacity="0.4" />
      {/* Belt side lights */}
      <circle cx="80" cy="235" r="3" fill={suitLt} fillOpacity="0.3" />
      <circle cx="140" cy="235" r="3" fill={suitLt} fillOpacity="0.3" />

      {/* Shoulder pads — armored look */}
      <ellipse cx="66" cy="138" rx="16" ry="10" fill={suitColor} />
      <ellipse cx="66" cy="137" rx="12" ry="7" fill={suitLt} fillOpacity="0.2" />
      <ellipse cx="66" cy="136" rx="8" ry="4" fill="white" fillOpacity="0.1" />
      <ellipse cx="154" cy="138" rx="16" ry="10" fill={suitColor} />
      <ellipse cx="154" cy="137" rx="12" ry="7" fill={suitLt} fillOpacity="0.2" />
      <ellipse cx="154" cy="136" rx="8" ry="4" fill="white" fillOpacity="0.1" />

      {/* ═══════════════ ARMS ═══════════════ */}
      <path d="M60 145 Q42 172 48 212" fill="none" stroke={suitColor} strokeWidth="20" strokeLinecap="round" />
      <path d="M60 145 Q42 172 48 212" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" strokeOpacity="0.06" />
      <path d="M160 145 Q178 172 172 212" fill="none" stroke={suitColor} strokeWidth="20" strokeLinecap="round" />
      <path d="M160 145 Q178 172 172 212" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" strokeOpacity="0.06" />
      {/* Arm bands */}
      <path d="M50 175 Q46 180 50 185" fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.25" />
      <path d="M170 175 Q174 180 170 185" fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.25" />

      {/* Gloves */}
      <ellipse cx="48" cy="214" rx="13" ry="11" fill={`url(#glove-${uid})`} />
      <ellipse cx="48" cy="213" rx="10" ry="8" fill={suitColor} />
      <ellipse cx="48" cy="211" rx="6" ry="5" fill={suitLt} fillOpacity="0.15" />
      <ellipse cx="172" cy="214" rx="13" ry="11" fill={`url(#glove-${uid})`} />
      <ellipse cx="172" cy="213" rx="10" ry="8" fill={suitColor} />
      <ellipse cx="172" cy="211" rx="6" ry="5" fill={suitLt} fillOpacity="0.15" />

      {/* ═══════════════ NECK ═══════════════ */}
      <rect x="96" y="108" width="28" height="20" rx="10" fill={`url(#skin-${uid})`} />
      <rect x="98" y="108" width="24" height="5" rx="2.5" fill={suitDk} fillOpacity="0.12" />

      {/* ═══════════════ HAIR BACK LAYER ═══════════════ */}
      {hairBackLayer(characterType, hairStyle, uid, hairColor, hairDk, hairLt)}

      {/* ═══════════════ HEAD ═══════════════ */}
      {/* Main head — slightly larger, rounder for cartoon proportion */}
      <ellipse cx="110" cy="72" rx="44" ry="46" fill={`url(#skin-${uid})`} />
      {/* Forehead highlight */}
      <ellipse cx="102" cy="54" rx="22" ry="16" fill="white" fillOpacity="0.08" />
      {/* Cheek roundness */}
      <ellipse cx="74" cy="82" rx="10" ry="8" fill={skinHi} fillOpacity="0.12" />
      <ellipse cx="146" cy="82" rx="10" ry="8" fill={skinHi} fillOpacity="0.12" />

      {/* ═══════════════ EARS ═══════════════ */}
      <ellipse cx="64" cy="78" rx="8" ry="11" fill={skin} />
      <ellipse cx="64" cy="78" rx="5.5" ry="8" fill={skinShade} fillOpacity="0.12" />
      <ellipse cx="156" cy="78" rx="8" ry="11" fill={skin} />
      <ellipse cx="156" cy="78" rx="5.5" ry="8" fill={skinShade} fillOpacity="0.12" />

      {/* ═══════════════ FACE ═══════════════ */}
      {/* Big expressive eyes — cartoon style */}
      {/* Eye whites */}
      <ellipse cx="90" cy="76" rx="15" ry="14" fill="white" />
      <ellipse cx="130" cy="76" rx="15" ry="14" fill="white" />
      {/* Subtle eye outline */}
      <ellipse cx="90" cy="76" rx="15" ry="14" fill="none" stroke={skinShade} strokeWidth="0.6" strokeOpacity="0.2" />
      <ellipse cx="130" cy="76" rx="15" ry="14" fill="none" stroke={skinShade} strokeWidth="0.6" strokeOpacity="0.2" />

      {/* Iris — large and vibrant */}
      <circle cx="93" cy="77" r="9.5" fill="#2C1810" />
      <circle cx="133" cy="77" r="9.5" fill="#2C1810" />
      {/* Iris color ring */}
      <circle cx="93" cy="77" r="9.5" fill="none" stroke="#4A2D1A" strokeWidth="1.5" />
      <circle cx="133" cy="77" r="9.5" fill="none" stroke="#4A2D1A" strokeWidth="1.5" />

      {/* Pupil */}
      <circle cx="94" cy="76" r="5.5" fill="#0D0705" />
      <circle cx="134" cy="76" r="5.5" fill="#0D0705" />

      {/* Eye sparkle highlights — big anime style */}
      <circle cx="97" cy="72" r="4.5" fill="white" />
      <circle cx="137" cy="72" r="4.5" fill="white" />
      <circle cx="90" cy="80" r="2.2" fill="white" fillOpacity="0.6" />
      <circle cx="130" cy="80" r="2.2" fill="white" fillOpacity="0.6" />
      {/* Tiny extra sparkle */}
      <circle cx="98" cy="78" r="1.2" fill="white" fillOpacity="0.4" />
      <circle cx="138" cy="78" r="1.2" fill="white" fillOpacity="0.4" />

      {/* Eyelashes for girl — more dramatic */}
      {isGirl && (
        <>
          <line x1="78" y1="68" x2="80" y2="64" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" />
          <line x1="82" y1="65" x2="84" y2="61" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="142" y1="68" x2="140" y2="64" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" />
          <line x1="138" y1="65" x2="136" y2="61" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {/* Eyebrows — expressive arch */}
      <path
        d="M76 58 Q90 49 102 58"
        fill="none" stroke={darken(hairColor, 40)} strokeWidth="3.2" strokeLinecap="round"
      />
      <path
        d="M118 58 Q130 49 144 58"
        fill="none" stroke={darken(hairColor, 40)} strokeWidth="3.2" strokeLinecap="round"
      />

      {/* Nose — cute small */}
      <ellipse cx="110" cy="90" rx="3.5" ry="2.5" fill={skinShade} fillOpacity="0.22" />
      <ellipse cx="109" cy="89" rx="1.5" ry="1" fill="white" fillOpacity="0.1" />

      {/* Mouth — big confident smile */}
      <path
        d="M96 100 Q110 114 124 100"
        fill="none" stroke={skinShade} strokeWidth="3" strokeLinecap="round"
      />
      {/* Teeth peek */}
      <path
        d="M100 101 Q110 109 120 101"
        fill="white" fillOpacity="0.85"
      />
      {/* Lip highlight */}
      <path
        d="M102 102 Q110 107 118 102"
        fill="none" stroke="white" strokeWidth="0.5" strokeOpacity="0.15"
      />

      {/* Cheek blush — rosy */}
      <ellipse cx="74" cy="92" rx="10" ry="6" fill="#FF8888" fillOpacity="0.14" />
      <ellipse cx="146" cy="92" rx="10" ry="6" fill="#FF8888" fillOpacity="0.14" />

      {/* ═══════════════ ACCESSORY ═══════════════ */}
      {renderAccessory(accessory, suitColor, suitDk, suitLt, suitMd)}

      {/* ═══════════════ HAIR FRONT LAYER ═══════════════ */}
      {hairFrontLayer(characterType, hairStyle, uid, hairColor, hairDk, hairLt)}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────
   HAIR — BACK LAYER
   ──────────────────────────────────────────────────────── */
function hairBackLayer(
  type: AvatarConfig["characterType"],
  style: AvatarConfig["hairStyle"],
  uid: string,
  color: string,
  dk: string,
  lt: string,
) {
  switch (style) {
    case "bob":
      return (
        <>
          <path d="M68 68 Q60 95 66 125 Q72 142 86 144 L86 102 Q78 92 76 68 Z" fill={color} />
          <path d="M152 68 Q160 95 154 125 Q148 142 134 144 L134 102 Q142 92 144 68 Z" fill={color} />
          <path d="M70 82 Q66 102 68 122" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.12" />
          <path d="M150 82 Q154 102 152 122" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.12" />
        </>
      );
    case "ponytail":
      return (
        <>
          <path
            d="M146 42 Q168 52 172 78 Q174 105 164 138 Q160 155 154 168"
            fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
          />
          <path
            d="M146 42 Q168 52 172 78 Q174 105 164 138 Q160 155 154 168"
            fill="none" stroke={lt} strokeWidth="5" strokeLinecap="round" strokeOpacity="0.18"
          />
          <ellipse cx="146" cy="42" rx="7" ry="6" fill={dk} fillOpacity="0.35" />
          {/* Hair tie */}
          <ellipse cx="148" cy="46" rx="5" ry="3" fill={dk} fillOpacity="0.5" />
        </>
      );
    case "braids":
      return (
        <>
          <path d="M72 64 Q63 95 60 128 Q58 155 60 178" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" />
          <path d="M148 64 Q157 95 160 128 Q162 155 160 178" fill="none" stroke={color} strokeWidth="13" strokeLinecap="round" />
          {/* Braid texture */}
          {[85, 105, 125, 145, 165].map(y => (
            <g key={`bl-${y}`}>
              <line x1="60" y1={y - 4} x2="64" y2={y + 3} stroke={dk} strokeWidth="1.2" strokeOpacity="0.12" />
              <line x1="160" y1={y - 4} x2="156" y2={y + 3} stroke={dk} strokeWidth="1.2" strokeOpacity="0.12" />
            </g>
          ))}
          {/* Braid ends with beads */}
          <circle cx="60" cy="180" r="5.5" fill={color} />
          <circle cx="160" cy="180" r="5.5" fill={color} />
          <circle cx="60" cy="180" r="3" fill={lt} fillOpacity="0.3" />
          <circle cx="160" cy="180" r="3" fill={lt} fillOpacity="0.3" />
        </>
      );
    case "puffs":
      return (
        <>
          {/* Two big round puffs */}
          <circle cx="68" cy="42" r="22" fill={color} />
          <circle cx="152" cy="42" r="22" fill={color} />
          {/* Puff highlights */}
          <circle cx="62" cy="36" r="10" fill={lt} fillOpacity="0.1" />
          <circle cx="146" cy="36" r="10" fill={lt} fillOpacity="0.1" />
          {/* Puff texture bumps */}
          <circle cx="58" cy="34" r="7" fill={color} />
          <circle cx="74" cy="32" r="7" fill={color} />
          <circle cx="142" cy="34" r="7" fill={color} />
          <circle cx="158" cy="32" r="7" fill={color} />
          <circle cx="66" cy="50" r="6" fill={color} />
          <circle cx="154" cy="50" r="6" fill={color} />
        </>
      );
    case "afro":
      return (
        <>
          <ellipse cx="110" cy="44" rx="58" ry="46" fill={color} />
          <ellipse cx="110" cy="44" rx="52" ry="40" fill={lt} fillOpacity="0.07" />
          {/* Afro texture bumps on silhouette */}
          {[-44, -30, -16, 0, 16, 30, 44].map(dx => (
            <circle key={`af-${dx}`} cx={110 + dx} cy={10 + Math.abs(dx) * 0.18} r={9} fill={color} />
          ))}
        </>
      );
    default:
      return null;
  }
}

/* ────────────────────────────────────────────────────────
   HAIR — FRONT LAYER
   ──────────────────────────────────────────────────────── */
function hairFrontLayer(
  type: AvatarConfig["characterType"],
  style: AvatarConfig["hairStyle"],
  uid: string,
  color: string,
  dk: string,
  lt: string,
) {
  switch (style) {
    case "short":
      return (
        <>
          <path
            d="M74 56 Q74 32 110 26 Q146 32 146 56 Q110 46 74 56 Z"
            fill={`url(#hair-${uid})`}
          />
          <path d="M84 44 Q110 36 136 44" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.1" />
          {/* Hair strand detail */}
          <path d="M94 34 Q98 28 104 32" fill="none" stroke={lt} strokeWidth="1.2" strokeOpacity="0.15" />
        </>
      );
    case "fade":
      return (
        <>
          <path
            d="M82 52 Q84 32 110 26 Q136 32 138 52 Q110 42 82 52 Z"
            fill={`url(#hair-${uid})`}
          />
          <path d="M90 42 Q110 34 130 42" fill="none" stroke={dk} strokeWidth="0.7" strokeOpacity="0.08" />
        </>
      );
    case "spiky":
      return (
        <>
          <path
            d="M78 56 L88 38 L94 14 L104 34 L110 6 L118 32 L126 12 L134 38 L142 56 Q110 46 78 56 Z"
            fill={`url(#hair-${uid})`}
          />
          {/* Spike highlights */}
          <path d="M94 22 L96 34" stroke={lt} strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
          <path d="M110 14 L112 30" stroke={lt} strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
          <path d="M126 20 L128 34" stroke={lt} strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round" />
        </>
      );
    case "curly":
      return (
        <>
          <path
            d="M72 58 Q72 34 110 26 Q148 34 148 58 Q110 48 72 58 Z"
            fill={`url(#hair-${uid})`}
          />
          {/* Curly bumps */}
          <circle cx="80" cy="38" r="9" fill={color} />
          <circle cx="95" cy="30" r="10" fill={color} />
          <circle cx="110" cy="26" r="11" fill={color} />
          <circle cx="125" cy="30" r="10" fill={color} />
          <circle cx="140" cy="38" r="9" fill={color} />
          {/* Curl highlights */}
          <circle cx="108" cy="22" r="4" fill={lt} fillOpacity="0.12" />
        </>
      );
    case "afro":
      return (
        <>
          <path
            d="M54 58 Q50 18 110 4 Q170 18 166 58"
            fill={color}
          />
          {[62, 76, 92, 110, 128, 144, 158].map(x => (
            <circle key={`aft-${x}`} cx={x} cy={14 + Math.abs(x - 110) * 0.1} r={8} fill={color} />
          ))}
        </>
      );
    case "bob":
      return (
        <>
          <path
            d="M72 56 Q72 32 110 24 Q148 32 148 56 Q110 44 72 56 Z"
            fill={`url(#hair-${uid})`}
          />
          <path d="M82 46 Q110 38 138 46" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.1" />
          {/* Side hair strands */}
          <path d="M74 52 Q72 62 74 72" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <path d="M146 52 Q148 62 146 72" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "ponytail":
      return (
        <>
          <path
            d="M72 56 Q72 32 110 24 Q148 32 148 48 Q110 40 72 56 Z"
            fill={`url(#hair-${uid})`}
          />
          <path d="M84 44 Q110 34 140 42" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.08" />
        </>
      );
    case "braids":
      return (
        <>
          <path
            d="M72 58 Q72 34 110 26 Q148 34 148 58"
            fill={`url(#hair-${uid})`}
          />
          {/* Center part */}
          <line x1="110" y1="26" x2="110" y2="56" stroke={dk} strokeWidth="1.5" strokeOpacity="0.12" />
        </>
      );
    case "puffs":
      return (
        <>
          <path
            d="M78 54 Q78 34 110 28 Q142 34 142 54 Q110 44 78 54 Z"
            fill={`url(#hair-${uid})`}
          />
          {/* Center part */}
          <line x1="110" y1="28" x2="110" y2="50" stroke={dk} strokeWidth="1.2" strokeOpacity="0.1" />
        </>
      );
    default:
      return null;
  }
}

/* ────────────────────────────────────────────────────────
   ACCESSORIES
   ──────────────────────────────────────────────────────── */
function renderAccessory(
  acc: AvatarConfig["accessory"],
  suitColor: string,
  suitDk: string,
  suitLt: string,
  suitMd: string,
) {
  switch (acc) {
    case "goggles":
      return (
        <>
          <path d="M64 72 Q110 60 156 72" fill="none" stroke={suitColor} strokeWidth="4" />
          <rect x="74" y="65" width="30" height="24" rx="12" fill={suitColor} fillOpacity="0.18" stroke={suitColor} strokeWidth="3" />
          <rect x="116" y="65" width="30" height="24" rx="12" fill={suitColor} fillOpacity="0.18" stroke={suitColor} strokeWidth="3" />
          <line x1="104" y1="77" x2="116" y2="77" stroke={suitColor} strokeWidth="3" />
          {/* Lens glare */}
          <ellipse cx="85" cy="73" rx="5" ry="4" fill="white" fillOpacity="0.3" />
          <ellipse cx="127" cy="73" rx="5" ry="4" fill="white" fillOpacity="0.3" />
          {/* Tech detail */}
          <circle cx="74" cy="77" r="2" fill={suitLt} fillOpacity="0.4" />
          <circle cx="146" cy="77" r="2" fill={suitLt} fillOpacity="0.4" />
        </>
      );
    case "headband":
      return (
        <>
          <path
            d="M64 58 Q110 44 156 58"
            fill="none" stroke={suitColor} strokeWidth="8" strokeLinecap="round"
          />
          <path
            d="M64 58 Q110 44 156 58"
            fill="none" stroke={suitLt} strokeWidth="3" strokeOpacity="0.3"
          />
          {/* Headband emblem — star */}
          <circle cx="110" cy="52" r="7" fill={suitColor} />
          <polygon
            points="110,46 112,50 116,50.5 113,53 114,57 110,55 106,57 107,53 104,50.5 108,50"
            fill="white" fillOpacity="0.6"
          />
        </>
      );
    case "magnifying-glass":
      return (
        <>
          {/* Held in right hand */}
          <circle cx="182" cy="198" r="18" fill="none" stroke={suitDk} strokeWidth="4" />
          <circle cx="182" cy="198" r="15" fill="white" fillOpacity="0.1" />
          <circle cx="178" cy="194" r="5" fill="white" fillOpacity="0.25" />
          <line x1="196" y1="212" x2="208" y2="228" stroke={suitDk} strokeWidth="5" strokeLinecap="round" />
          {/* Lens shine */}
          <path d="M172 190 Q178 184 186 188" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round" />
        </>
      );
    case "tablet":
      return (
        <>
          {/* Held in left hand */}
          <rect x="18" y="192" width="32" height="42" rx="6" fill="#263238" />
          <rect x="21" y="196" width="26" height="34" rx="4" fill={suitColor} fillOpacity="0.3" />
          {/* Screen content — cyber icons */}
          <circle cx="30" cy="206" r="3" fill="white" fillOpacity="0.45" />
          <circle cx="40" cy="206" r="3" fill="white" fillOpacity="0.45" />
          <rect x="27" y="213" width="16" height="2.5" rx="1.2" fill="white" fillOpacity="0.3" />
          <rect x="27" y="218" width="11" height="2.5" rx="1.2" fill="white" fillOpacity="0.2" />
          {/* Screen glow */}
          <rect x="21" y="196" width="26" height="34" rx="4" fill="white" fillOpacity="0.04" />
        </>
      );
    default:
      return null;
  }
}
