import { useMemo } from "react";
import { type AvatarConfig } from "./avatarConfig";

import row1Base from "@/assets/sprites/row1-base-heroes.png";
import row2Suits from "@/assets/sprites/row2-suit-overlays.png";
import row3HairBoys from "@/assets/sprites/row3-hair-boys.png";
import row4HairGirls from "@/assets/sprites/row4-hair-girls.png";
import row5Accessories from "@/assets/sprites/row5-accessories.png";

interface AvatarRendererProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

/* ── Sprite index maps ─────────────────────────── */

// Row 1: 10 columns — boys 0-4, girls 5-9
// Order per gender: white, black, mexican, asian, indian
const SKIN_TO_INDEX: Record<string, number> = {
  "#FDDCB5": 0, // Light  → white
  "#F5C6A0": 0, // Fair   → white
  "#E8A978": 2, // Medium → mexican
  "#C68642": 3, // Tan    → asian
  "#8D5524": 4, // Brown  → indian
  "#5C3317": 1, // Dark   → black
};

// Row 2: 5 columns — blue, green, purple, pink, teal
const SUIT_TO_INDEX: Record<string, number> = {
  "#3B82F6": 0,
  "#10B981": 1,
  "#8B5CF6": 2,
  "#EC4899": 3,
  "#14B8A6": 4,
};

// Row 3: 5 columns — short, curly, fade, afro, spiky
const BOY_HAIR_TO_INDEX: Record<string, number> = {
  short: 0,
  curly: 1,
  fade: 2,
  afro: 3,
  spiky: 4,
};

// Row 4: 5 columns — bob, puffs, ponytail, braids, long
const GIRL_HAIR_TO_INDEX: Record<string, number> = {
  bob: 0,
  puffs: 1,
  ponytail: 2,
  braids: 3,
  long: 4,
  curly: 1, // fallback curly → puffs sprite
};

// Row 5: 5 columns — goggles, tablet, magnifier, shield, laptop
const ACCESSORY_TO_INDEX: Record<string, number> = {
  goggles: 0,
  tablet: 1,
  "magnifying-glass": 2,
  headband: 3, // maps to shield sprite
  laptop: 4,
};

/* ── Sprite layer component ────────────────────── */

interface SpriteLayerProps {
  src: string;
  columns: number;
  index: number;
  size: number;
}

function SpriteLayer({ src, columns, index, size }: SpriteLayerProps) {
  // We show one "cell" of the sprite sheet by scaling the background
  // so each cell fills `size` px, then offset to the correct column.
  const bgSize = `${columns * 100}% 100%`;
  const xPercent = columns <= 1 ? 0 : (index / (columns - 1)) * 100;
  const bgPos = `${xPercent}% 0%`;

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: bgSize,
        backgroundPosition: bgPos,
        backgroundRepeat: "no-repeat",
        imageRendering: "auto",
      }}
    />
  );
}

/* ── Main renderer ─────────────────────────────── */

export default function AvatarRenderer({
  config,
  size = 120,
  className = "",
  fallbackEmoji = "🦸",
}: AvatarRendererProps) {
  const layers = useMemo(() => {
    if (!config) return null;

    const { characterType, skinTone, hairStyle, suitColor, accessory } = config;

    // Base character index (row 1 has 10 columns: 0-4 boys, 5-9 girls)
    const skinIndex = SKIN_TO_INDEX[skinTone] ?? 0;
    const baseIndex = characterType === "girl" ? skinIndex + 5 : skinIndex;

    // Suit index (row 2 has 5 columns)
    const suitIndex = SUIT_TO_INDEX[suitColor] ?? 0;

    // Hair index
    const hairSrc = characterType === "girl" ? row4HairGirls : row3HairBoys;
    const hairMap = characterType === "girl" ? GIRL_HAIR_TO_INDEX : BOY_HAIR_TO_INDEX;
    const hairIndex = hairMap[hairStyle] ?? 0;

    // Accessory index (row 5 has 5 columns)
    const accIndex = accessory !== "none" ? ACCESSORY_TO_INDEX[accessory] : null;

    return { baseIndex, suitIndex, hairSrc, hairIndex, accIndex };
  }, [config]);

  if (!config || !layers) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-muted ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.5 }}>{fallbackEmoji}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size * 1.2 }}
    >
      {/* Layer 1: Base hero character */}
      <SpriteLayer src={row1Base} columns={10} index={layers.baseIndex} size={size} />

      {/* Layer 2: Suit color overlay */}
      <SpriteLayer src={row2Suits} columns={5} index={layers.suitIndex} size={size} />

      {/* Layer 3: Hair */}
      <SpriteLayer src={layers.hairSrc} columns={5} index={layers.hairIndex} size={size} />

      {/* Layer 4: Accessory */}
      {layers.accIndex !== null && (
        <SpriteLayer src={row5Accessories} columns={5} index={layers.accIndex} size={size} />
      )}
    </div>
  );
}
