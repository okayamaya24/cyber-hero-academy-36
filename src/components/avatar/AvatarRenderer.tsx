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

function alpha(hex: string, a: number): string {
  return `${hex}${Math.round(a * 255).toString(16).padStart(2, "0")}`;
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
  const skinShade = darken(skinTone, 30);
  const skinHi = lighten(skinTone, 30);
  const suitDk = darken(suitColor, 55);
  const suitMd = darken(suitColor, 25);
  const suitLt = lighten(suitColor, 55);
  const suitXLt = lighten(suitColor, 90);
  const hairDk = darken(hairColor, 30);
  const hairLt = lighten(hairColor, 40);
  const isGirl = characterType === "girl";

  const uid = `hv-${characterType}-${suitColor.replace("#", "")}-${hairColor.replace("#", "")}-${skinTone.replace("#", "")}-${hairStyle}-${accessory}`;

  // Full-body hero layout — viewBox 0 0 200 320
  return (
    <svg viewBox="0 0 200 320" width={size} height={size * (320 / 200)} className={className} style={{ display: "block" }}>
      <defs>
        {/* Suit gradient */}
        <linearGradient id={`suit-${uid}`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor={suitLt} />
          <stop offset="50%" stopColor={suitColor} />
          <stop offset="100%" stopColor={suitDk} />
        </linearGradient>
        {/* Suit shine */}
        <linearGradient id={`shine-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Cape gradient */}
        <linearGradient id={`cape-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitColor} />
          <stop offset="100%" stopColor={suitDk} stopOpacity="0.7" />
        </linearGradient>
        {/* Boot gradient */}
        <linearGradient id={`boot-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitMd} />
          <stop offset="100%" stopColor={suitDk} />
        </linearGradient>
        {/* Skin gradient */}
        <radialGradient id={`skin-${uid}`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={skinHi} />
          <stop offset="100%" stopColor={skin} />
        </radialGradient>
        {/* Hair gradient */}
        <linearGradient id={`hair-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={hairLt} />
          <stop offset="100%" stopColor={hairColor} />
        </linearGradient>
        {/* Emblem glow */}
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="70%" stopColor={suitLt} stopOpacity="0.4" />
          <stop offset="100%" stopColor={suitColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ═══ CAPE ═══ */}
      <path
        d={`M46 138 Q30 180 34 240 Q36 275 50 300 L100 295 L150 300 Q164 275 166 240 Q170 180 154 138 Z`}
        fill={`url(#cape-${uid})`}
      />
      <path
        d={`M46 138 Q44 160 46 180`}
        fill="none" stroke={suitDk} strokeWidth="1" strokeOpacity="0.2"
      />
      <path
        d={`M154 138 Q156 160 154 180`}
        fill="none" stroke={suitDk} strokeWidth="1" strokeOpacity="0.2"
      />

      {/* ═══ LEGS ═══ */}
      <rect x="72" y="228" width="22" height="52" rx="8" fill={`url(#suit-${uid})`} />
      <rect x="106" y="228" width="22" height="52" rx="8" fill={`url(#suit-${uid})`} />

      {/* ═══ BOOTS ═══ */}
      <path d="M68 270 L68 298 Q68 308 78 308 L96 308 Q100 308 100 304 L100 270 Z" fill={`url(#boot-${uid})`} />
      <path d="M100 270 L100 304 Q100 308 104 308 L122 308 Q132 308 132 298 L132 270 Z" fill={`url(#boot-${uid})`} />
      {/* Boot tops */}
      <path d="M68 274 L100 274" stroke={suitLt} strokeWidth="2.5" strokeOpacity="0.5" />
      <path d="M100 274 L132 274" stroke={suitLt} strokeWidth="2.5" strokeOpacity="0.5" />
      {/* Boot soles */}
      <rect x="68" y="305" width="32" height="5" rx="2.5" fill={suitDk} fillOpacity="0.6" />
      <rect x="100" y="305" width="32" height="5" rx="2.5" fill={suitDk} fillOpacity="0.6" />

      {/* ═══ BODY / SUIT ═══ */}
      <path
        d={`M56 155 Q56 130 76 122 L90 117 Q100 114 110 117 L124 122 Q144 130 144 155 L144 235 L56 235 Z`}
        fill={`url(#suit-${uid})`}
      />
      <path
        d={`M56 155 Q56 130 76 122 L90 117 Q100 114 110 117 L124 122 Q144 130 144 155 L144 235 L56 235 Z`}
        fill={`url(#shine-${uid})`}
      />

      {/* Collar / V-neckline */}
      <path
        d="M84 120 L100 142 L116 120"
        fill="none" stroke={suitDk} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5"
      />

      {/* Chest emblem — star burst */}
      <circle cx="100" cy="162" r="14" fill={`url(#glow-${uid})`} />
      <polygon
        points="100,149 103,157 112,158 106,163 107,172 100,167 93,172 94,163 88,158 97,157"
        fill="white" fillOpacity="0.9"
      />
      <polygon
        points="100,151 102,157 110,158 105,162 106,169 100,165 94,169 95,162 90,158 98,157"
        fill={suitLt} fillOpacity="0.5"
      />

      {/* Suit detail lines */}
      <path d="M62 180 L138 180" stroke={suitDk} strokeWidth="1.2" strokeOpacity="0.15" />
      <path d="M64 200 L136 200" stroke={suitDk} strokeWidth="1.2" strokeOpacity="0.15" />

      {/* Belt */}
      <rect x="60" y="220" width="80" height="8" rx="4" fill={suitDk} fillOpacity="0.5" />
      <rect x="90" y="218" width="20" height="12" rx="4" fill={suitDk} fillOpacity="0.65" />
      <rect x="94" y="220" width="12" height="8" rx="3" fill="white" fillOpacity="0.45" />

      {/* Shoulder pads */}
      <ellipse cx="63" cy="134" rx="14" ry="8" fill={suitColor} />
      <ellipse cx="63" cy="134" rx="14" ry="8" fill="white" fillOpacity="0.1" />
      <ellipse cx="63" cy="133" rx="10" ry="5" fill={suitLt} fillOpacity="0.2" />
      <ellipse cx="137" cy="134" rx="14" ry="8" fill={suitColor} />
      <ellipse cx="137" cy="134" rx="14" ry="8" fill="white" fillOpacity="0.1" />
      <ellipse cx="137" cy="133" rx="10" ry="5" fill={suitLt} fillOpacity="0.2" />

      {/* ═══ ARMS ═══ */}
      <path d="M56 140 Q40 165 46 200" fill="none" stroke={suitColor} strokeWidth="18" strokeLinecap="round" />
      <path d="M56 140 Q40 165 46 200" fill="none" stroke="white" strokeWidth="18" strokeLinecap="round" strokeOpacity="0.06" />
      <path d="M144 140 Q160 165 154 200" fill="none" stroke={suitColor} strokeWidth="18" strokeLinecap="round" />
      <path d="M144 140 Q160 165 154 200" fill="none" stroke="white" strokeWidth="18" strokeLinecap="round" strokeOpacity="0.06" />

      {/* Gloves */}
      <ellipse cx="46" cy="202" rx="11" ry="9" fill={suitDk} />
      <ellipse cx="46" cy="202" rx="9" ry="7" fill={suitMd} />
      <ellipse cx="46" cy="200" rx="7" ry="5.5" fill={suitColor} />
      <ellipse cx="154" cy="202" rx="11" ry="9" fill={suitDk} />
      <ellipse cx="154" cy="202" rx="9" ry="7" fill={suitMd} />
      <ellipse cx="154" cy="200" rx="7" ry="5.5" fill={suitColor} />

      {/* ═══ NECK ═══ */}
      <rect x="88" y="105" width="24" height="18" rx="8" fill={`url(#skin-${uid})`} />
      <rect x="90" y="105" width="20" height="4" rx="2" fill={suitDk} fillOpacity="0.15" />

      {/* ═══ HAIR BACK LAYER ═══ */}
      {hairBackLayer(characterType, hairStyle, uid, hairColor, hairDk, hairLt)}

      {/* ═══ HEAD ═══ */}
      <ellipse cx="100" cy="72" rx="40" ry="42" fill={`url(#skin-${uid})`} />
      {/* Subtle face highlight */}
      <ellipse cx="92" cy="58" rx="18" ry="14" fill="white" fillOpacity="0.08" />

      {/* ═══ EARS ═══ */}
      <ellipse cx="58" cy="76" rx="7" ry="10" fill={skin} />
      <ellipse cx="58" cy="76" rx="5" ry="7" fill={skinShade} fillOpacity="0.15" />
      <ellipse cx="142" cy="76" rx="7" ry="10" fill={skin} />
      <ellipse cx="142" cy="76" rx="5" ry="7" fill={skinShade} fillOpacity="0.15" />

      {/* ═══ FACE ═══ */}
      {/* Eyes */}
      <ellipse cx="82" cy="76" rx="13" ry="12.5" fill="white" />
      <ellipse cx="118" cy="76" rx="13" ry="12.5" fill="white" />
      {/* Eye border */}
      <ellipse cx="82" cy="76" rx="13" ry="12.5" fill="none" stroke={skinShade} strokeWidth="0.5" strokeOpacity="0.2" />
      <ellipse cx="118" cy="76" rx="13" ry="12.5" fill="none" stroke={skinShade} strokeWidth="0.5" strokeOpacity="0.2" />

      {/* Iris */}
      <circle cx="84" cy="77" r="8" fill="#2C1810" />
      <circle cx="120" cy="77" r="8" fill="#2C1810" />
      {/* Pupil */}
      <circle cx="85" cy="76" r="4.5" fill="#1a0e08" />
      <circle cx="121" cy="76" r="4.5" fill="#1a0e08" />
      {/* Eye highlights */}
      <circle cx="87" cy="73" r="3.5" fill="white" />
      <circle cx="123" cy="73" r="3.5" fill="white" />
      <circle cx="82" cy="79" r="1.8" fill="white" fillOpacity="0.5" />
      <circle cx="118" cy="79" r="1.8" fill="white" fillOpacity="0.5" />

      {/* Eyelashes for girl */}
      {isGirl && (
        <>
          <line x1="72" y1="70" x2="74" y2="66" stroke="#2C1810" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="130" y1="70" x2="128" y2="66" stroke="#2C1810" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="75" y1="67" x2="78" y2="64" stroke="#2C1810" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="127" y1="67" x2="124" y2="64" stroke="#2C1810" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}

      {/* Eyebrows */}
      <path
        d={`M72 60 Q82 53 92 60`}
        fill="none" stroke={darken(hairColor, 40)} strokeWidth="2.8" strokeLinecap="round"
      />
      <path
        d={`M108 60 Q118 53 128 60`}
        fill="none" stroke={darken(hairColor, 40)} strokeWidth="2.8" strokeLinecap="round"
      />

      {/* Nose */}
      <ellipse cx="100" cy="88" rx="3.5" ry="2.5" fill={skinShade} fillOpacity="0.25" />

      {/* Mouth — big happy smile */}
      <path
        d="M88 97 Q100 110 112 97"
        fill="none" stroke={skinShade} strokeWidth="2.8" strokeLinecap="round"
      />
      {/* Teeth peek */}
      <path
        d="M92 98 Q100 105 108 98"
        fill="white" fillOpacity="0.85"
      />

      {/* Cheek blush */}
      <circle cx="70" cy="90" r="9" fill="#FF9999" fillOpacity="0.15" />
      <circle cx="130" cy="90" r="9" fill="#FF9999" fillOpacity="0.15" />

      {/* ═══ ACCESSORY ═══ */}
      {renderAccessory(accessory, suitColor, suitDk, suitLt, suitMd)}

      {/* ═══ HAIR FRONT LAYER ═══ */}
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
          <path
            d="M62 68 Q56 90 62 120 Q68 138 80 140 L80 100 Q72 90 70 68 Z"
            fill={color}
          />
          <path
            d="M138 68 Q144 90 138 120 Q132 138 120 140 L120 100 Q128 90 130 68 Z"
            fill={color}
          />
          <path d="M64 80 Q60 100 64 118" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.15" />
          <path d="M136 80 Q140 100 136 118" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.15" />
        </>
      );
    case "ponytail":
      return (
        <>
          <path
            d="M132 42 Q152 50 156 76 Q158 100 150 130 Q146 148 140 160"
            fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          />
          <path
            d="M132 42 Q152 50 156 76 Q158 100 150 130 Q146 148 140 160"
            fill="none" stroke={lt} strokeWidth="4" strokeLinecap="round" strokeOpacity="0.2"
          />
          <ellipse cx="132" cy="42" rx="6" ry="5" fill={dk} fillOpacity="0.4" />
        </>
      );
    case "braids":
      return (
        <>
          <path d="M66 62 Q58 90 56 120 Q54 148 56 170" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" />
          <path d="M134 62 Q142 90 144 120 Q146 148 144 170" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" />
          {/* braid texture */}
          {[80, 100, 120, 140, 160].map(y => (
            <g key={`bl-${y}`}>
              <line x1="56" y1={y-5} x2="60" y2={y+2} stroke={dk} strokeWidth="1" strokeOpacity="0.15" />
              <line x1="144" y1={y-5} x2="140" y2={y+2} stroke={dk} strokeWidth="1" strokeOpacity="0.15" />
            </g>
          ))}
          {/* braid ends */}
          <circle cx="56" cy="172" r="5" fill={color} />
          <circle cx="144" cy="172" r="5" fill={color} />
        </>
      );
    case "puffs":
      return (
        <>
          <circle cx="62" cy="44" r="18" fill={color} />
          <circle cx="138" cy="44" r="18" fill={color} />
          <circle cx="62" cy="44" r="14" fill={lt} fillOpacity="0.12" />
          <circle cx="138" cy="44" r="14" fill={lt} fillOpacity="0.12" />
          {/* puff texture */}
          <circle cx="56" cy="38" r="6" fill={color} />
          <circle cx="68" cy="36" r="6" fill={color} />
          <circle cx="132" cy="38" r="6" fill={color} />
          <circle cx="144" cy="36" r="6" fill={color} />
        </>
      );
    case "afro":
      return (
        <>
          <ellipse cx="100" cy="46" rx="54" ry="42" fill={color} />
          <ellipse cx="100" cy="46" rx="48" ry="36" fill={lt} fillOpacity="0.08" />
          {/* afro texture bumps */}
          {[-40, -26, -12, 2, 16, 30, 44].map(dx => (
            <circle key={`af-${dx}`} cx={100 + dx} cy={14 + Math.abs(dx) * 0.15} r={8 + Math.random()} fill={color} />
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
  const scalpTop = 30;

  switch (style) {
    case "short":
      return (
        <>
          <path
            d={`M68 56 Q68 34 100 28 Q132 34 132 56 Q100 48 68 56 Z`}
            fill={`url(#hair-${uid})`}
          />
          <path d="M78 46 Q100 38 122 46" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.12" />
        </>
      );
    case "fade":
      return (
        <>
          <path
            d={`M76 52 Q78 34 100 28 Q122 34 124 52 Q100 44 76 52 Z`}
            fill={`url(#hair-${uid})`}
          />
          <path d="M82 44 Q100 38 118 44" fill="none" stroke={dk} strokeWidth="0.6" strokeOpacity="0.1" />
        </>
      );
    case "spiky":
      return (
        <path
          d={`M72 56 L82 40 L88 18 L96 36 L100 10 L106 34 L114 16 L120 40 L128 56 Q100 48 72 56 Z`}
          fill={`url(#hair-${uid})`}
        />
      );
    case "curly":
      return (
        <>
          <path
            d={`M66 58 Q66 36 100 28 Q134 36 134 58 Q100 50 66 58 Z`}
            fill={`url(#hair-${uid})`}
          />
          {/* Curly bumps */}
          <circle cx="74" cy="40" r="8" fill={color} />
          <circle cx="88" cy="32" r="9" fill={color} />
          <circle cx="100" cy="28" r="10" fill={color} />
          <circle cx="114" cy="32" r="9" fill={color} />
          <circle cx="128" cy="40" r="8" fill={color} />
        </>
      );
    case "afro":
      return (
        <>
          <path
            d={`M48 58 Q46 20 100 6 Q154 20 152 58`}
            fill={color}
          />
          {[56, 70, 84, 100, 116, 130, 144].map(x => (
            <circle key={`aft-${x}`} cx={x} cy={16 + Math.abs(x - 100) * 0.12} r={7} fill={color} />
          ))}
        </>
      );
    case "bob":
      return (
        <>
          <path
            d={`M66 56 Q66 34 100 26 Q134 34 134 56 Q100 46 66 56 Z`}
            fill={`url(#hair-${uid})`}
          />
          <path d="M76 48 Q100 40 124 48" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.12" />
        </>
      );
    case "ponytail":
      return (
        <>
          <path
            d={`M66 56 Q66 34 100 26 Q134 34 134 48 Q100 42 66 56 Z`}
            fill={`url(#hair-${uid})`}
          />
          <path d="M78 44 Q100 36 126 42" fill="none" stroke={dk} strokeWidth="0.8" strokeOpacity="0.1" />
        </>
      );
    case "braids":
      return (
        <>
          <path
            d={`M66 58 Q66 34 100 28 Q134 34 134 58`}
            fill={`url(#hair-${uid})`}
          />
          {/* Center part */}
          <line x1="100" y1="28" x2="100" y2="56" stroke={dk} strokeWidth="1.5" strokeOpacity="0.15" />
        </>
      );
    case "puffs":
      return (
        <>
          <path
            d={`M72 54 Q72 36 100 30 Q128 36 128 54 Q100 46 72 54 Z`}
            fill={`url(#hair-${uid})`}
          />
          {/* Center part */}
          <line x1="100" y1="30" x2="100" y2="50" stroke={dk} strokeWidth="1.2" strokeOpacity="0.12" />
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
          <path d="M58 72 Q100 62 142 72" fill="none" stroke={suitColor} strokeWidth="3.5" />
          <rect x="68" y="66" width="28" height="22" rx="11" fill={suitColor} fillOpacity="0.2" stroke={suitColor} strokeWidth="2.5" />
          <rect x="104" y="66" width="28" height="22" rx="11" fill={suitColor} fillOpacity="0.2" stroke={suitColor} strokeWidth="2.5" />
          <line x1="96" y1="77" x2="104" y2="77" stroke={suitColor} strokeWidth="2.5" />
          {/* Lens glare */}
          <ellipse cx="78" cy="74" rx="4" ry="3" fill="white" fillOpacity="0.3" />
          <ellipse cx="114" cy="74" rx="4" ry="3" fill="white" fillOpacity="0.3" />
        </>
      );
    case "headband":
      return (
        <>
          <path
            d="M58 60 Q100 48 142 60"
            fill="none" stroke={suitColor} strokeWidth="7" strokeLinecap="round"
          />
          <path
            d="M58 60 Q100 48 142 60"
            fill="none" stroke={suitLt} strokeWidth="2.5" strokeOpacity="0.35"
          />
          {/* Headband emblem */}
          <circle cx="100" cy="54" r="5" fill={suitColor} />
          <circle cx="100" cy="54" r="3" fill="white" fillOpacity="0.5" />
        </>
      );
    case "magnifying-glass":
      return (
        <>
          {/* Held in right hand area */}
          <circle cx="164" cy="186" r="16" fill="none" stroke={suitDk} strokeWidth="3.5" />
          <circle cx="164" cy="186" r="13" fill="white" fillOpacity="0.12" />
          <circle cx="160" cy="182" r="4" fill="white" fillOpacity="0.25" />
          <line x1="176" y1="198" x2="186" y2="212" stroke={suitDk} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "tablet":
      return (
        <>
          {/* Held in left hand area */}
          <rect x="20" y="180" width="28" height="38" rx="5" fill="#263238" />
          <rect x="23" y="184" width="22" height="30" rx="3" fill={suitColor} fillOpacity="0.35" />
          {/* Screen icons */}
          <circle cx="30" cy="192" r="2.5" fill="white" fillOpacity="0.5" />
          <circle cx="38" cy="192" r="2.5" fill="white" fillOpacity="0.5" />
          <rect x="27" y="198" width="14" height="2" rx="1" fill="white" fillOpacity="0.3" />
          <rect x="27" y="203" width="10" height="2" rx="1" fill="white" fillOpacity="0.2" />
        </>
      );
    default:
      return null;
  }
}
