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

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: n >> 16, g: (n >> 8) & 0xff, b: n & 0xff };
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
  const skinHi = lighten(skinTone, 40);
  const skinDeep = darken(skinTone, 55);
  const suitDk = darken(suitColor, 55);
  const suitMd = darken(suitColor, 25);
  const suitLt = lighten(suitColor, 55);
  const suitXLt = lighten(suitColor, 90);
  const suitGlow = lighten(suitColor, 110);
  const hairDk = darken(hairColor, 40);
  const hairLt = lighten(hairColor, 50);
  const hairMd = darken(hairColor, 15);
  const isGirl = characterType === "girl";

  const uid = `hr-${characterType}-${suitColor.replace("#", "")}-${hairColor.replace("#", "")}-${skinTone.replace("#", "")}-${hairStyle}-${accessory}`;

  return (
    <svg viewBox="0 0 240 380" width={size} height={size * (380 / 240)} className={className} style={{ display: "block" }}>
      <defs>
        {/* Suit body gradient — 4-stop rich depth */}
        <linearGradient id={`suit-${uid}`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={suitLt} />
          <stop offset="30%" stopColor={suitColor} />
          <stop offset="70%" stopColor={suitMd} />
          <stop offset="100%" stopColor={suitDk} />
        </linearGradient>
        {/* Glossy highlight strip */}
        <linearGradient id={`shine-${uid}`} x1="0.35" y1="0" x2="0.65" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="30%" stopColor="white" stopOpacity="0.12" />
          <stop offset="60%" stopColor="white" stopOpacity="0.03" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Cape gradient — dramatic */}
        <linearGradient id={`cape-${uid}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={suitColor} stopOpacity="0.95" />
          <stop offset="40%" stopColor={suitMd} stopOpacity="0.85" />
          <stop offset="80%" stopColor={suitDk} stopOpacity="0.6" />
          <stop offset="100%" stopColor={suitDk} stopOpacity="0.35" />
        </linearGradient>
        {/* Cape inner */}
        <linearGradient id={`cape-in-${uid}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={suitDk} stopOpacity="0.7" />
          <stop offset="100%" stopColor={darken(suitColor, 80)} stopOpacity="0.5" />
        </linearGradient>
        {/* Boot gradient */}
        <linearGradient id={`boot-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitMd} />
          <stop offset="100%" stopColor={suitDk} />
        </linearGradient>
        {/* Skin radial — 3D feel */}
        <radialGradient id={`skin-${uid}`} cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor={skinHi} />
          <stop offset="55%" stopColor={skin} />
          <stop offset="100%" stopColor={skinShade} />
        </radialGradient>
        {/* Skin flat for body parts */}
        <linearGradient id={`skin-arm-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skinHi} />
          <stop offset="100%" stopColor={skinShade} />
        </linearGradient>
        {/* Hair gradient — multistop for volume */}
        <linearGradient id={`hair-${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={hairLt} />
          <stop offset="35%" stopColor={hairColor} />
          <stop offset="75%" stopColor={hairMd} />
          <stop offset="100%" stopColor={hairDk} />
        </linearGradient>
        <radialGradient id={`hair-rad-${uid}`} cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor={hairLt} />
          <stop offset="50%" stopColor={hairColor} />
          <stop offset="100%" stopColor={hairDk} />
        </radialGradient>
        {/* Emblem glow */}
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.98" />
          <stop offset="40%" stopColor={suitGlow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={suitColor} stopOpacity="0" />
        </radialGradient>
        {/* Emblem outer glow */}
        <radialGradient id={`glow2-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={suitLt} stopOpacity="0.4" />
          <stop offset="100%" stopColor={suitColor} stopOpacity="0" />
        </radialGradient>
        {/* Glove gradient */}
        <linearGradient id={`glove-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={suitLt} />
          <stop offset="50%" stopColor={suitColor} />
          <stop offset="100%" stopColor={suitDk} />
        </linearGradient>
        {/* Eye gradient */}
        <radialGradient id={`eye-${uid}`} cx="45%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#4A3520" />
          <stop offset="60%" stopColor="#2C1810" />
          <stop offset="100%" stopColor="#1A0D08" />
        </radialGradient>
      </defs>

      {/* ═══════════════ CAPE ═══════════════ */}
      <path
        d="M52 158 Q30 200 32 270 Q34 310 56 345 L120 338 L184 345 Q206 310 208 270 Q210 200 188 158 Z"
        fill={`url(#cape-${uid})`}
      />
      {/* Cape inner lining visible at edges */}
      <path d="M56 170 Q38 210 40 268 Q42 300 56 330" fill="none" stroke={suitDk} strokeWidth="3" strokeOpacity="0.15" />
      <path d="M184 170 Q202 210 200 268 Q198 300 184 330" fill="none" stroke={suitDk} strokeWidth="3" strokeOpacity="0.15" />
      {/* Cape fold highlights */}
      <path d="M62 175 Q55 220 58 270" fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.12" />
      <path d="M178 175 Q185 220 182 270" fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.12" />
      <path d="M90 168 Q82 230 85 310" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.06" />
      <path d="M150 168 Q158 230 155 310" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.06" />
      {/* Cape bottom flow detail */}
      <path d="M56 340 Q75 348 90 340 Q105 333 120 338 Q135 333 150 340 Q165 348 184 340" fill="none" stroke={suitLt} strokeWidth="1.5" strokeOpacity="0.1" />

      {/* ═══════════════ LEGS ═══════════════ */}
      {/* Left leg */}
      <path d="M82 268 Q80 290 78 310 Q78 318 86 318 L104 318 Q108 318 108 312 L108 268 Z" fill={`url(#suit-${uid})`} />
      {/* Right leg */}
      <path d="M132 268 L132 312 Q132 318 136 318 L154 318 Q162 318 162 310 Q160 290 158 268 Z" fill={`url(#suit-${uid})`} />
      {/* Leg shine strips */}
      <path d="M90 272 L90 306" stroke="white" strokeWidth="4" strokeOpacity="0.06" strokeLinecap="round" />
      <path d="M140 272 L140 306" stroke="white" strokeWidth="4" strokeOpacity="0.06" strokeLinecap="round" />
      {/* Knee armor panels */}
      <ellipse cx="95" cy="286" rx="10" ry="7" fill={suitLt} fillOpacity="0.1" />
      <ellipse cx="95" cy="286" rx="6" ry="4" fill="white" fillOpacity="0.04" />
      <ellipse cx="145" cy="286" rx="10" ry="7" fill={suitLt} fillOpacity="0.1" />
      <ellipse cx="145" cy="286" rx="6" ry="4" fill="white" fillOpacity="0.04" />

      {/* ═══════════════ BOOTS ═══════════════ */}
      <path d="M74 308 L74 342 Q74 354 86 354 L108 354 Q114 354 114 346 L114 308 Z" fill={`url(#boot-${uid})`} />
      <path d="M126 308 L126 346 Q126 354 132 354 L154 354 Q164 354 164 342 L166 308 Z" fill={`url(#boot-${uid})`} />
      {/* Boot trim bands */}
      <path d="M74 312 L114 312" stroke={suitLt} strokeWidth="4" strokeOpacity="0.5" />
      <path d="M126 312 L166 312" stroke={suitLt} strokeWidth="4" strokeOpacity="0.5" />
      {/* Boot accents */}
      <path d="M80 314 L80 340" stroke={suitLt} strokeWidth="1.5" strokeOpacity="0.12" />
      <path d="M132 314 L132 340" stroke={suitLt} strokeWidth="1.5" strokeOpacity="0.12" />
      {/* Boot toe caps */}
      <path d="M78 348 Q94 358 110 348" fill={suitLt} fillOpacity="0.12" />
      <path d="M130 348 Q146 358 160 348" fill={suitLt} fillOpacity="0.12" />
      {/* Soles */}
      <rect x="74" y="350" width="40" height="6" rx="3" fill={suitDk} fillOpacity="0.6" />
      <rect x="126" y="350" width="40" height="6" rx="3" fill={suitDk} fillOpacity="0.6" />

      {/* ═══════════════ BODY / SUIT ═══════════════ */}
      <path
        d="M62 170 Q58 142 84 132 L102 126 Q120 122 138 126 L156 132 Q182 142 178 170 L180 276 L60 276 Z"
        fill={`url(#suit-${uid})`}
      />
      {/* Glossy overlay */}
      <path
        d="M62 170 Q58 142 84 132 L102 126 Q120 122 138 126 L156 132 Q182 142 178 170 L180 276 L60 276 Z"
        fill={`url(#shine-${uid})`}
      />

      {/* Suit panel lines — techy armor segments */}
      <path d="M80 140 L80 200" stroke={suitDk} strokeWidth="1" strokeOpacity="0.1" />
      <path d="M160 140 L160 200" stroke={suitDk} strokeWidth="1" strokeOpacity="0.1" />
      <path d="M70 200 L170 200" stroke={suitDk} strokeWidth="0.8" strokeOpacity="0.08" />
      
      {/* Chest panel — V-shaped armor plate */}
      <path
        d="M82 144 L100 132 Q120 128 140 132 L158 144 L152 198 Q120 210 88 198 Z"
        fill={suitLt} fillOpacity="0.07"
        stroke={suitLt} strokeWidth="0.8" strokeOpacity="0.18"
      />
      {/* Chest panel inner glow line */}
      <path
        d="M90 146 L104 136 Q120 132 136 136 L150 146"
        fill="none" stroke={suitLt} strokeWidth="0.6" strokeOpacity="0.2"
      />

      {/* Collar / High-tech V-neckline */}
      <path d="M92 130 L120 162 L148 130" fill="none" stroke={suitDk} strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" />
      <path d="M94 132 L120 158 L146 132" fill="none" stroke={suitLt} strokeWidth="1" strokeLinecap="round" strokeOpacity="0.15" />

      {/* ═══ CHEST EMBLEM — Glowing cyber star ═══ */}
      <circle cx="120" cy="178" r="22" fill={`url(#glow2-${uid})`} />
      <circle cx="120" cy="178" r="18" fill={`url(#glow-${uid})`} />
      <polygon
        points="120,161 124,172 136,173 127,180 129,192 120,186 111,192 113,180 104,173 116,172"
        fill="white" fillOpacity="0.95"
      />
      <polygon
        points="120,164 123,172 133,173 126,179 127,189 120,184 113,189 114,179 107,173 117,172"
        fill={suitLt} fillOpacity="0.4"
      />
      {/* Emblem pulse ring */}
      <circle cx="120" cy="178" r="20" fill="none" stroke={suitLt} strokeWidth="0.6" strokeOpacity="0.25" />

      {/* Side suit accents — tech stripe */}
      <path d="M64 175 L64 255" stroke={suitLt} strokeWidth="2.5" strokeOpacity="0.15" />
      <path d="M176 175 L176 255" stroke={suitLt} strokeWidth="2.5" strokeOpacity="0.15" />

      {/* Belt — armored utility belt */}
      <rect x="64" y="256" width="112" height="14" rx="7" fill={suitDk} fillOpacity="0.55" />
      <rect x="64" y="256" width="112" height="14" rx="7" fill="none" stroke={suitLt} strokeWidth="0.5" strokeOpacity="0.2" />
      {/* Belt buckle */}
      <rect x="104" y="253" width="32" height="20" rx="7" fill={suitDk} fillOpacity="0.7" />
      <rect x="108" y="256" width="24" height="14" rx="5" fill="white" fillOpacity="0.35" />
      <polygon points="120,259 122,263 126,263.5 123,266 123.5,270 120,268 116.5,270 117,266 114,263.5 118,263" fill={suitColor} fillOpacity="0.6" />
      {/* Belt pouches */}
      <rect x="72" y="258" width="14" height="10" rx="3" fill={suitDk} fillOpacity="0.3" />
      <rect x="154" y="258" width="14" height="10" rx="3" fill={suitDk} fillOpacity="0.3" />
      {/* Belt lights */}
      <circle cx="86" cy="263" r="3.5" fill={suitLt} fillOpacity="0.35" />
      <circle cx="86" cy="263" r="1.5" fill="white" fillOpacity="0.4" />
      <circle cx="154" cy="263" r="3.5" fill={suitLt} fillOpacity="0.35" />
      <circle cx="154" cy="263" r="1.5" fill="white" fillOpacity="0.4" />

      {/* Shoulder pads — armored, layered */}
      <ellipse cx="68" cy="150" rx="20" ry="13" fill={suitColor} />
      <ellipse cx="68" cy="149" rx="16" ry="10" fill={suitLt} fillOpacity="0.18" />
      <ellipse cx="68" cy="148" rx="10" ry="6" fill="white" fillOpacity="0.08" />
      <path d="M54 150 Q68 142 82 150" fill="none" stroke={suitLt} strokeWidth="0.8" strokeOpacity="0.2" />
      <ellipse cx="172" cy="150" rx="20" ry="13" fill={suitColor} />
      <ellipse cx="172" cy="149" rx="16" ry="10" fill={suitLt} fillOpacity="0.18" />
      <ellipse cx="172" cy="148" rx="10" ry="6" fill="white" fillOpacity="0.08" />
      <path d="M158 150 Q172 142 186 150" fill="none" stroke={suitLt} strokeWidth="0.8" strokeOpacity="0.2" />

      {/* ═══════════════ ARMS ═══════════════ */}
      {/* Left arm */}
      <path d="M62 158 Q40 188 46 235" fill="none" stroke={suitColor} strokeWidth="24" strokeLinecap="round" />
      <path d="M62 158 Q40 188 46 235" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round" strokeOpacity="0.05" />
      {/* Arm panel line */}
      <path d="M52 190 Q48 200 50 210" fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.2" />
      {/* Right arm */}
      <path d="M178 158 Q200 188 194 235" fill="none" stroke={suitColor} strokeWidth="24" strokeLinecap="round" />
      <path d="M178 158 Q200 188 194 235" fill="none" stroke="white" strokeWidth="24" strokeLinecap="round" strokeOpacity="0.05" />
      <path d="M188 190 Q192 200 190 210" fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.2" />

      {/* Gloves — detailed with finger hints */}
      <ellipse cx="46" cy="238" rx="16" ry="14" fill={`url(#glove-${uid})`} />
      <ellipse cx="46" cy="236" rx="12" ry="10" fill={suitColor} />
      <ellipse cx="46" cy="234" rx="7" ry="6" fill={suitLt} fillOpacity="0.12" />
      {/* Glove cuff */}
      <path d="M34 225 Q46 220 58 225" fill="none" stroke={suitLt} strokeWidth="3" strokeOpacity="0.35" />
      <ellipse cx="194" cy="238" rx="16" ry="14" fill={`url(#glove-${uid})`} />
      <ellipse cx="194" cy="236" rx="12" ry="10" fill={suitColor} />
      <ellipse cx="194" cy="234" rx="7" ry="6" fill={suitLt} fillOpacity="0.12" />
      <path d="M182 225 Q194 220 206 225" fill="none" stroke={suitLt} strokeWidth="3" strokeOpacity="0.35" />

      {/* ═══════════════ NECK ═══════════════ */}
      <rect x="104" y="114" width="32" height="24" rx="12" fill={`url(#skin-${uid})`} />
      {/* Collar overlay */}
      <rect x="106" y="114" width="28" height="6" rx="3" fill={suitDk} fillOpacity="0.12" />

      {/* ═══════════════ HAIR BACK LAYER ═══════════════ */}
      {hairBackLayer(characterType, hairStyle, uid, hairColor, hairDk, hairLt, hairMd)}

      {/* ═══════════════ HEAD ═══════════════ */}
      {/* Main head — large cartoon proportioned */}
      <ellipse cx="120" cy="78" rx="50" ry="52" fill={`url(#skin-${uid})`} />
      {/* Forehead soft highlight */}
      <ellipse cx="110" cy="56" rx="26" ry="20" fill="white" fillOpacity="0.07" />
      {/* Jaw line subtle shadow */}
      <path d="M76 94 Q120 120 164 94" fill="none" stroke={skinDeep} strokeWidth="1" strokeOpacity="0.06" />
      {/* Cheek roundness highlights */}
      <ellipse cx="78" cy="90" rx="12" ry="9" fill={skinHi} fillOpacity="0.1" />
      <ellipse cx="162" cy="90" rx="12" ry="9" fill={skinHi} fillOpacity="0.1" />

      {/* ═══════════════ EARS ═══════════════ */}
      <ellipse cx="68" cy="84" rx="9" ry="13" fill={skin} />
      <ellipse cx="68" cy="84" rx="6" ry="9" fill={skinShade} fillOpacity="0.1" />
      <ellipse cx="172" cy="84" rx="9" ry="13" fill={skin} />
      <ellipse cx="172" cy="84" rx="6" ry="9" fill={skinShade} fillOpacity="0.1" />

      {/* ═══════════════ FACE ═══════════════ */}
      {/* Big expressive cartoon eyes */}
      {/* Eye whites with subtle shadow */}
      <ellipse cx="100" cy="82" rx="17" ry="16" fill="white" />
      <ellipse cx="100" cy="80" rx="17" ry="16" fill="white" fillOpacity="0.5" />
      <ellipse cx="140" cy="82" rx="17" ry="16" fill="white" />
      <ellipse cx="140" cy="80" rx="17" ry="16" fill="white" fillOpacity="0.5" />
      {/* Upper eyelid shadow */}
      <ellipse cx="100" cy="76" rx="17" ry="10" fill={skinShade} fillOpacity="0.06" />
      <ellipse cx="140" cy="76" rx="17" ry="10" fill={skinShade} fillOpacity="0.06" />

      {/* Iris — large, vibrant, with depth */}
      <circle cx="103" cy="83" r="11" fill={`url(#eye-${uid})`} />
      <circle cx="143" cy="83" r="11" fill={`url(#eye-${uid})`} />
      {/* Iris colour ring */}
      <circle cx="103" cy="83" r="11" fill="none" stroke="#3D2214" strokeWidth="1.5" />
      <circle cx="143" cy="83" r="11" fill="none" stroke="#3D2214" strokeWidth="1.5" />
      {/* Iris inner detail ring */}
      <circle cx="103" cy="83" r="8" fill="none" stroke="#5A3A20" strokeWidth="0.5" strokeOpacity="0.3" />
      <circle cx="143" cy="83" r="8" fill="none" stroke="#5A3A20" strokeWidth="0.5" strokeOpacity="0.3" />

      {/* Pupil — deep black */}
      <circle cx="104" cy="82" r="6" fill="#0A0604" />
      <circle cx="144" cy="82" r="6" fill="#0A0604" />

      {/* Eye sparkle highlights — multi-layer anime style */}
      <circle cx="108" cy="77" r="5.5" fill="white" />
      <circle cx="148" cy="77" r="5.5" fill="white" />
      <circle cx="99" cy="87" r="3" fill="white" fillOpacity="0.55" />
      <circle cx="139" cy="87" r="3" fill="white" fillOpacity="0.55" />
      <circle cx="109" cy="84" r="1.5" fill="white" fillOpacity="0.35" />
      <circle cx="149" cy="84" r="1.5" fill="white" fillOpacity="0.35" />

      {/* Subtle eye outline */}
      <ellipse cx="100" cy="82" rx="17" ry="16" fill="none" stroke={skinShade} strokeWidth="0.7" strokeOpacity="0.15" />
      <ellipse cx="140" cy="82" rx="17" ry="16" fill="none" stroke={skinShade} strokeWidth="0.7" strokeOpacity="0.15" />

      {/* Eyelashes — dramatic for girl, subtle for boy */}
      {isGirl ? (
        <>
          <line x1="86" y1="72" x2="88" y2="67" stroke="#2C1810" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="90" y1="69" x2="93" y2="64" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" />
          <line x1="95" y1="67" x2="98" y2="63" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="154" y1="72" x2="152" y2="67" stroke="#2C1810" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="150" y1="69" x2="147" y2="64" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" />
          <line x1="145" y1="67" x2="142" y2="63" stroke="#2C1810" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M84 72 Q92 68 100 71" fill="none" stroke={skinDeep} strokeWidth="1" strokeOpacity="0.15" />
          <path d="M156 72 Q148 68 140 71" fill="none" stroke={skinDeep} strokeWidth="1" strokeOpacity="0.15" />
        </>
      )}

      {/* Eyebrows — thick, expressive, hero-confident */}
      <path
        d="M82 62 Q98 50 114 62"
        fill="none" stroke={darken(hairColor, 45)} strokeWidth="3.8" strokeLinecap="round"
      />
      <path
        d="M126 62 Q142 50 158 62"
        fill="none" stroke={darken(hairColor, 45)} strokeWidth="3.8" strokeLinecap="round"
      />
      {/* Brow highlight */}
      <path d="M86 62 Q98 53 110 62" fill="none" stroke={lighten(hairColor, 20)} strokeWidth="1" strokeOpacity="0.1" />
      <path d="M130 62 Q142 53 154 62" fill="none" stroke={lighten(hairColor, 20)} strokeWidth="1" strokeOpacity="0.1" />

      {/* Nose — cute, softly rendered */}
      <ellipse cx="120" cy="98" rx="4" ry="3" fill={skinShade} fillOpacity="0.2" />
      <ellipse cx="119" cy="97" rx="2" ry="1.2" fill="white" fillOpacity="0.08" />

      {/* Mouth — big, confident, friendly smile */}
      <path
        d="M104 108 Q120 124 136 108"
        fill="none" stroke={skinShade} strokeWidth="3.2" strokeLinecap="round"
      />
      {/* Teeth peek */}
      <path
        d="M108 109 Q120 118 132 109"
        fill="white" fillOpacity="0.88"
      />
      {/* Lower lip subtle */}
      <path
        d="M110 116 Q120 120 130 116"
        fill={skinShade} fillOpacity="0.06"
      />

      {/* Cheek blush — rosy warmth */}
      <ellipse cx="78" cy="100" rx="12" ry="7" fill="#FF8888" fillOpacity="0.13" />
      <ellipse cx="162" cy="100" rx="12" ry="7" fill="#FF8888" fillOpacity="0.13" />

      {/* Chin dimple hint */}
      <ellipse cx="120" cy="120" rx="3" ry="2" fill={skinShade} fillOpacity="0.06" />

      {/* ═══════════════ ACCESSORY ═══════════════ */}
      {renderAccessory(accessory, suitColor, suitDk, suitLt, suitMd, suitXLt)}

      {/* ═══════════════ HAIR FRONT LAYER ═══════════════ */}
      {hairFrontLayer(characterType, hairStyle, uid, hairColor, hairDk, hairLt, hairMd)}
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
  md: string,
) {
  switch (style) {
    case "bob":
      return (
        <>
          <path d="M72 72 Q62 100 68 135 Q76 158 92 160 L92 108 Q82 96 80 72 Z" fill={color} />
          <path d="M168 72 Q178 100 172 135 Q164 158 148 160 L148 108 Q158 96 160 72 Z" fill={color} />
          <path d="M74 86 Q70 110 72 132" fill="none" stroke={dk} strokeWidth="1.2" strokeOpacity="0.1" />
          <path d="M166 86 Q170 110 168 132" fill="none" stroke={dk} strokeWidth="1.2" strokeOpacity="0.1" />
          {/* Volume strands */}
          <path d="M76 100 Q72 115 76 130" fill="none" stroke={lt} strokeWidth="1" strokeOpacity="0.08" />
          <path d="M164 100 Q168 115 164 130" fill="none" stroke={lt} strokeWidth="1" strokeOpacity="0.08" />
        </>
      );
    case "ponytail":
      return (
        <>
          <path
            d="M162 46 Q186 58 190 88 Q192 118 182 152 Q178 170 170 186"
            fill="none" stroke={color} strokeWidth="20" strokeLinecap="round"
          />
          <path
            d="M162 46 Q186 58 190 88 Q192 118 182 152 Q178 170 170 186"
            fill="none" stroke={lt} strokeWidth="6" strokeLinecap="round" strokeOpacity="0.15"
          />
          {/* Hair tie */}
          <ellipse cx="164" cy="50" rx="8" ry="5" fill={dk} fillOpacity="0.45" />
          <ellipse cx="164" cy="50" rx="5" ry="3" fill={lt} fillOpacity="0.1" />
          {/* Ponytail strand details */}
          <path d="M178 70 Q182 100 180 140" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.08" />
          <path d="M172 65 Q176 95 174 135" fill="none" stroke={lt} strokeWidth="1" strokeOpacity="0.06" />
        </>
      );
    case "braids":
      return (
        <>
          <path d="M78 68 Q66 102 62 140 Q60 168 62 198" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
          <path d="M162 68 Q174 102 178 140 Q180 168 178 198" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" />
          {/* Braid texture — zigzag pattern */}
          {[90, 110, 130, 150, 170, 190].map(y => (
            <g key={`bl-${y}`}>
              <line x1="60" y1={y - 5} x2="66" y2={y + 4} stroke={dk} strokeWidth="1.3" strokeOpacity="0.1" />
              <line x1="178" y1={y - 5} x2="172" y2={y + 4} stroke={dk} strokeWidth="1.3" strokeOpacity="0.1" />
            </g>
          ))}
          {/* Braid ends — beads */}
          <circle cx="62" cy="200" r="7" fill={color} />
          <circle cx="178" cy="200" r="7" fill={color} />
          <circle cx="62" cy="200" r="4" fill={lt} fillOpacity="0.25" />
          <circle cx="178" cy="200" r="4" fill={lt} fillOpacity="0.25" />
        </>
      );
    case "puffs":
      return (
        <>
          {/* Two big round puffs — voluminous */}
          <circle cx="72" cy="44" r="28" fill={color} />
          <circle cx="168" cy="44" r="28" fill={color} />
          {/* Puff highlights */}
          <circle cx="64" cy="36" r="12" fill={lt} fillOpacity="0.08" />
          <circle cx="160" cy="36" r="12" fill={lt} fillOpacity="0.08" />
          {/* Puff texture bumps for volume */}
          <circle cx="58" cy="34" r="9" fill={color} />
          <circle cx="80" cy="30" r="9" fill={color} />
          <circle cx="156" cy="34" r="9" fill={color} />
          <circle cx="176" cy="30" r="9" fill={color} />
          <circle cx="70" cy="54" r="8" fill={color} />
          <circle cx="170" cy="54" r="8" fill={color} />
          {/* Puff ties */}
          <ellipse cx="82" cy="58" rx="4" ry="3" fill={dk} fillOpacity="0.3" />
          <ellipse cx="158" cy="58" rx="4" ry="3" fill={dk} fillOpacity="0.3" />
        </>
      );
    case "afro":
      return (
        <>
          <ellipse cx="120" cy="48" rx="66" ry="54" fill={color} />
          <ellipse cx="120" cy="48" rx="58" ry="46" fill={lt} fillOpacity="0.06" />
          {/* Afro texture bumps on silhouette */}
          {[-52, -36, -20, 0, 20, 36, 52].map(dx => (
            <circle key={`af-${dx}`} cx={120 + dx} cy={8 + Math.abs(dx) * 0.2} r={11} fill={color} />
          ))}
          {/* Inner volume highlight */}
          <ellipse cx="110" cy="38" rx="20" ry="16" fill={lt} fillOpacity="0.04" />
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
  md: string,
) {
  switch (style) {
    case "short":
      return (
        <>
          <path
            d="M78 60 Q78 32 120 24 Q162 32 162 60 Q120 48 78 60 Z"
            fill={`url(#hair-${uid})`}
          />
          {/* Hair strand texture */}
          <path d="M90 44 Q120 34 150 44" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.08" />
          <path d="M100 36 Q106 28 114 34" fill="none" stroke={lt} strokeWidth="1.5" strokeOpacity="0.12" />
          <path d="M128 36 Q134 30 140 36" fill="none" stroke={lt} strokeWidth="1" strokeOpacity="0.08" />
          {/* Top volume */}
          <ellipse cx="120" cy="30" rx="20" ry="6" fill={color} fillOpacity="0.3" />
        </>
      );
    case "fade":
      return (
        <>
          <path
            d="M88 56 Q90 32 120 24 Q150 32 152 56 Q120 44 88 56 Z"
            fill={`url(#hair-${uid})`}
          />
          {/* Side fade — gradient shading */}
          <path d="M78 62 Q78 48 88 56" fill={color} fillOpacity="0.3" />
          <path d="M162 62 Q162 48 152 56" fill={color} fillOpacity="0.3" />
          <path d="M96 44 Q120 34 144 44" fill="none" stroke={dk} strokeWidth="0.7" strokeOpacity="0.06" />
        </>
      );
    case "spiky":
      return (
        <>
          <path
            d="M82 60 L94 40 L102 10 L112 36 L120 2 L128 34 L138 8 L148 40 L158 60 Q120 48 82 60 Z"
            fill={`url(#hair-${uid})`}
          />
          {/* Spike highlights — shine on each spike */}
          <path d="M102 18 L104 36" stroke={lt} strokeWidth="2" strokeOpacity="0.18" strokeLinecap="round" />
          <path d="M120 10 L122 32" stroke={lt} strokeWidth="2" strokeOpacity="0.18" strokeLinecap="round" />
          <path d="M138 16 L140 36" stroke={lt} strokeWidth="2" strokeOpacity="0.18" strokeLinecap="round" />
          {/* Base blend */}
          <path d="M86 58 Q120 46 154 58" fill={md} fillOpacity="0.15" />
        </>
      );
    case "curly":
      return (
        <>
          <path
            d="M76 62 Q76 36 120 26 Q164 36 164 62 Q120 50 76 62 Z"
            fill={`url(#hair-${uid})`}
          />
          {/* Curly bumps — layered for volume */}
          <circle cx="84" cy="40" r="11" fill={color} />
          <circle cx="100" cy="32" r="12" fill={color} />
          <circle cx="120" cy="28" r="13" fill={color} />
          <circle cx="140" cy="32" r="12" fill={color} />
          <circle cx="156" cy="40" r="11" fill={color} />
          {/* Extra curl row */}
          <circle cx="92" cy="48" r="8" fill={color} />
          <circle cx="148" cy="48" r="8" fill={color} />
          {/* Curl highlights */}
          <circle cx="118" cy="24" r="5" fill={lt} fillOpacity="0.1" />
          <circle cx="98" cy="30" r="3" fill={lt} fillOpacity="0.08" />
        </>
      );
    case "afro":
      return (
        <>
          <path
            d="M56 62 Q50 16 120 0 Q190 16 184 62"
            fill={color}
          />
          {/* Top bumps */}
          {[68, 84, 102, 120, 138, 156, 172].map(x => (
            <circle key={`aft-${x}`} cx={x} cy={10 + Math.abs(x - 120) * 0.12} r={10} fill={color} />
          ))}
          {/* Volume shine */}
          <ellipse cx="108" cy="20" rx="18" ry="10" fill={lt} fillOpacity="0.06" />
        </>
      );
    case "bob":
      return (
        <>
          <path
            d="M76 60 Q76 34 120 24 Q164 34 164 60 Q120 46 76 60 Z"
            fill={`url(#hair-${uid})`}
          />
          <path d="M88 48 Q120 38 152 48" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.08" />
          {/* Side curtains */}
          <path d="M78 56 Q76 68 78 80" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <path d="M162 56 Q164 68 162 80" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
          {/* Volume highlight */}
          <ellipse cx="120" cy="32" rx="16" ry="6" fill={lt} fillOpacity="0.08" />
        </>
      );
    case "ponytail":
      return (
        <>
          <path
            d="M78 60 Q78 34 120 24 Q164 34 164 52 Q120 42 78 60 Z"
            fill={`url(#hair-${uid})`}
          />
          <path d="M90 46 Q120 36 156 44" fill="none" stroke={dk} strokeWidth="1" strokeOpacity="0.06" />
          {/* Side swept bangs */}
          <path d="M82 56 Q86 48 96 52" fill={color} fillOpacity="0.6" />
        </>
      );
    case "braids":
      return (
        <>
          <path
            d="M78 62 Q78 36 120 26 Q162 36 162 62"
            fill={`url(#hair-${uid})`}
          />
          {/* Center part */}
          <line x1="120" y1="26" x2="120" y2="60" stroke={dk} strokeWidth="1.8" strokeOpacity="0.1" />
          {/* Side hair volume */}
          <path d="M82 58 Q80 50 86 48" fill={color} fillOpacity="0.4" />
          <path d="M158 58 Q160 50 154 48" fill={color} fillOpacity="0.4" />
        </>
      );
    case "puffs":
      return (
        <>
          <path
            d="M82 58 Q82 36 120 28 Q158 36 158 58 Q120 46 82 58 Z"
            fill={`url(#hair-${uid})`}
          />
          {/* Center part */}
          <line x1="120" y1="28" x2="120" y2="54" stroke={dk} strokeWidth="1.5" strokeOpacity="0.08" />
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
  suitXLt: string,
) {
  switch (acc) {
    case "goggles":
      return (
        <>
          {/* Strap */}
          <path d="M68 78 Q120 64 172 78" fill="none" stroke={suitColor} strokeWidth="5" />
          <path d="M68 78 Q120 64 172 78" fill="none" stroke={suitLt} strokeWidth="2" strokeOpacity="0.2" />
          {/* Left lens */}
          <rect x="78" y="70" width="34" height="28" rx="14" fill={suitColor} fillOpacity="0.15" stroke={suitColor} strokeWidth="3.5" />
          {/* Right lens */}
          <rect x="128" y="70" width="34" height="28" rx="14" fill={suitColor} fillOpacity="0.15" stroke={suitColor} strokeWidth="3.5" />
          {/* Bridge */}
          <line x1="112" y1="84" x2="128" y2="84" stroke={suitColor} strokeWidth="3.5" />
          {/* Lens glare */}
          <ellipse cx="90" cy="78" rx="7" ry="5" fill="white" fillOpacity="0.3" />
          <ellipse cx="140" cy="78" rx="7" ry="5" fill="white" fillOpacity="0.3" />
          {/* Tech dots on frame */}
          <circle cx="78" cy="84" r="2.5" fill={suitLt} fillOpacity="0.45" />
          <circle cx="162" cy="84" r="2.5" fill={suitLt} fillOpacity="0.45" />
        </>
      );
    case "headband":
      return (
        <>
          <path
            d="M68 62 Q120 46 172 62"
            fill="none" stroke={suitColor} strokeWidth="10" strokeLinecap="round"
          />
          <path
            d="M68 62 Q120 46 172 62"
            fill="none" stroke={suitLt} strokeWidth="4" strokeOpacity="0.25"
          />
          {/* Headband emblem — star in circle */}
          <circle cx="120" cy="55" r="9" fill={suitColor} />
          <circle cx="120" cy="55" r="7" fill={suitDk} fillOpacity="0.3" />
          <polygon
            points="120,48 122.5,53 128,53.5 124,56.5 125,62 120,59.5 115,62 116,56.5 112,53.5 117.5,53"
            fill="white" fillOpacity="0.7"
          />
          {/* Side emblem dots */}
          <circle cx="92" cy="58" r="2.5" fill={suitLt} fillOpacity="0.3" />
          <circle cx="148" cy="58" r="2.5" fill={suitLt} fillOpacity="0.3" />
        </>
      );
    case "magnifying-glass":
      return (
        <>
          {/* Held in right hand */}
          <circle cx="204" cy="220" r="22" fill="none" stroke={suitDk} strokeWidth="5" />
          <circle cx="204" cy="220" r="18" fill="white" fillOpacity="0.08" />
          <circle cx="204" cy="220" r="16" fill={suitColor} fillOpacity="0.06" />
          {/* Lens shine */}
          <circle cx="198" cy="214" r="7" fill="white" fillOpacity="0.22" />
          <path d="M192 210 Q200 204 210 210" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />
          {/* Handle */}
          <line x1="220" y1="238" x2="234" y2="258" stroke={suitDk} strokeWidth="6" strokeLinecap="round" />
          <line x1="220" y1="238" x2="234" y2="258" stroke={suitLt} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.2" />
        </>
      );
    case "tablet":
      return (
        <>
          {/* Held in left hand */}
          <rect x="12" y="212" width="38" height="50" rx="7" fill="#263238" />
          <rect x="12" y="212" width="38" height="50" rx="7" fill="none" stroke="#37474F" strokeWidth="1" />
          {/* Screen */}
          <rect x="16" y="217" width="30" height="40" rx="5" fill={suitColor} fillOpacity="0.25" />
          {/* Screen content — cyber icons */}
          <circle cx="26" cy="228" r="4" fill="white" fillOpacity="0.4" />
          <circle cx="38" cy="228" r="4" fill="white" fillOpacity="0.4" />
          <rect x="23" y="236" width="18" height="3" rx="1.5" fill="white" fillOpacity="0.25" />
          <rect x="23" y="242" width="12" height="3" rx="1.5" fill="white" fillOpacity="0.18" />
          <rect x="23" y="248" width="15" height="2" rx="1" fill="white" fillOpacity="0.12" />
          {/* Screen glow overlay */}
          <rect x="16" y="217" width="30" height="40" rx="5" fill="white" fillOpacity="0.03" />
          {/* Home button indicator */}
          <circle cx="31" cy="259" r="1.5" fill="#546E7A" />
        </>
      );
    default:
      return null;
  }
}
