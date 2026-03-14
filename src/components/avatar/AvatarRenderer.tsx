import { useMemo } from "react";
import { type AvatarConfig } from "./avatarConfig";
import spriteSheet from "@/assets/avatar/avatar-sprite-sheet.png";

interface AvatarRendererProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

/*
  Sprite sheet layout (8 columns × 4 rows):
  
  Row 0: Full characters, lighter skin
    cols 0-3: boys  (green, blue, red, purple suits)
    cols 4-7: girls (pink+headband, teal+puffs, purple+long, purple+braids)
  
  Row 1: Full characters, darker skin (same column layout)
  
  Row 2: Hair pieces
    0: headband, 1: short, 2: curly, 3: fade, 4: afro, 5: straight-long, 6: wavy, 7: cyber-shield
  
  Row 3: Hair + accessories
    0: short, 1: curly, 2: fade, 3: braids/ponytail, 4: goggles, 5: laptop, 6: cyber-shield
*/

// Map suit color → column within gender group (0-3)
const SUIT_COL: Record<string, number> = {
  "#10B981": 0, // Green
  "#3B82F6": 1, // Blue
  "#8B5CF6": 3, // Purple
  "#EC4899": 0, // Pink → green col for boys, will be overridden for girls
  "#14B8A6": 1, // Teal → blue col for boys, will be overridden for girls
};

// Girls have different suit mapping (cols 4-7)
const GIRL_SUIT_COL: Record<string, number> = {
  "#EC4899": 4, // Pink
  "#14B8A6": 5, // Teal
  "#8B5CF6": 6, // Purple
  "#3B82F6": 7, // Blue → dark purple col
  "#10B981": 5, // Green → teal col
};

// Skin tone → row (0 = lighter, 1 = darker)
function skinRow(skinTone: string): number {
  const darkTones = ["#8D5524", "#5C3317", "#C68642"];
  return darkTones.includes(skinTone) ? 1 : 0;
}

// Hair style → sprite position [row, col] in the bottom half of sheet
const HAIR_SPRITE: Record<string, [number, number] | null> = {
  none: null,
  // Boy hairs (row 3, cols 0-4 roughly)
  short: [3, 0],
  curly: [3, 1],
  fade: [3, 2],
  afro: [2, 4],
  spiky: [2, 3],
  // Girl hairs (row 2-3)
  bob: [2, 5],
  puffs: [2, 2],
  ponytail: [3, 3],
  braids: [2, 6],
  long: [2, 5],
};

// Accessory → sprite position [row, col]
const ACCESSORY_SPRITE: Record<string, [number, number] | null> = {
  none: null,
  goggles: [3, 4],
  laptop: [3, 5],
  "magnifying-glass": [3, 6],
  headband: [2, 0],
  tablet: [3, 5], // same as laptop
};

/* ── Sprite layer using CSS background-position ── */

function SpriteLayer({
  row,
  col,
  totalCols,
  totalRows,
  size,
  zIndex,
  offsetY = 0,
}: {
  row: number;
  col: number;
  totalCols: number;
  totalRows: number;
  size: number;
  zIndex: number;
  offsetY?: number;
}) {
  const xPct = totalCols <= 1 ? 0 : (col / (totalCols - 1)) * 100;
  const yPct = totalRows <= 1 ? 0 : (row / (totalRows - 1)) * 100;

  return (
    <div
      className="absolute left-0 right-0"
      style={{
        top: offsetY,
        width: size,
        height: size * 1.1,
        backgroundImage: `url(${spriteSheet})`,
        backgroundSize: `${totalCols * 100}% ${totalRows * 100}%`,
        backgroundPosition: `${xPct}% ${yPct}%`,
        backgroundRepeat: "no-repeat",
        zIndex,
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
    const { characterType, skinTone, suitColor, hairStyle, accessory } = config;

    // Base character: row from skin, col from gender+suit
    const row = skinRow(skinTone);
    const col =
      characterType === "girl"
        ? (GIRL_SUIT_COL[suitColor] ?? 4)
        : (SUIT_COL[suitColor] ?? 1);

    // Hair overlay
    const hair = HAIR_SPRITE[hairStyle] ?? null;

    // Accessory overlay
    const acc = accessory !== "none" ? (ACCESSORY_SPRITE[accessory] ?? null) : null;

    return { row, col, hair, acc };
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
    <div className={`relative overflow-hidden ${className}`} style={{ width: size, height: size * 1.1 }}>
      {/* Base character (includes suit + skin + default hair) */}
      <SpriteLayer row={layers.row} col={layers.col} totalCols={8} totalRows={4} size={size} zIndex={1} />

      {/* Hair overlay */}
      {layers.hair && (
        <SpriteLayer
          row={layers.hair[0]}
          col={layers.hair[1]}
          totalCols={8}
          totalRows={4}
          size={size * 0.7}
          zIndex={2}
          offsetY={-size * 0.05}
        />
      )}

      {/* Accessory overlay */}
      {layers.acc && (
        <SpriteLayer
          row={layers.acc[0]}
          col={layers.acc[1]}
          totalCols={8}
          totalRows={4}
          size={size * 0.5}
          zIndex={3}
          offsetY={size * 0.1}
        />
      )}
    </div>
  );
}
