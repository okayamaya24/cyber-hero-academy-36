import { useMemo } from "react";
import { type AvatarConfig } from "./avatarConfig";

// Base hero imports
import boyWhite from "@/assets/avatar/base/boy-white.png";
import boyBlack from "@/assets/avatar/base/boy-black.png";
import boyMexican from "@/assets/avatar/base/boy-mexican.png";
import boyAsian from "@/assets/avatar/base/boy-asian.png";
import boyIndian from "@/assets/avatar/base/boy-indian.png";
import girlWhite from "@/assets/avatar/base/girl-white.png";
import girlBlack from "@/assets/avatar/base/girl-black.png";
import girlMexican from "@/assets/avatar/base/girl-mexican.png";
import girlAsian from "@/assets/avatar/base/girl-asian.png";
import girlIndian from "@/assets/avatar/base/girl-indian.png";

// Girl hair imports
import girlHairBob from "@/assets/avatar/hair/girl-hair-bob.png";
import girlHairPuffs from "@/assets/avatar/hair/girl-hair-puffs.png";
import girlHairPonytail from "@/assets/avatar/hair/girl-hair-ponytail.png";
import girlHairBraids from "@/assets/avatar/hair/girl-hair-braids.png";
import girlHairLong from "@/assets/avatar/hair/girl-hair-long.png";

interface AvatarRendererProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

const SKIN_TO_VARIANT: Record<string, string> = {
  "#FDDCB5": "white",
  "#F5C6A0": "white",
  "#E8A978": "mexican",
  "#C68642": "indian",
  "#8D5524": "black",
  "#5C3317": "black",
};

const BASE_IMAGES: Record<string, Record<string, string>> = {
  boy: { white: boyWhite, black: boyBlack, mexican: boyMexican, asian: boyAsian, indian: boyIndian },
  girl: { white: girlWhite, black: girlBlack, mexican: girlMexican, asian: girlAsian, indian: girlIndian },
};

const GIRL_HAIR_IMAGES: Record<string, string> = {
  bob: girlHairBob,
  puffs: girlHairPuffs,
  ponytail: girlHairPonytail,
  braids: girlHairBraids,
  long: girlHairLong,
};

export default function AvatarRenderer({
  config,
  size = 120,
  className = "",
  fallbackEmoji = "🦸",
}: AvatarRendererProps) {
  const { baseImage, hairImage } = useMemo(() => {
    if (!config) return { baseImage: null, hairImage: null };
    const variant = SKIN_TO_VARIANT[config.skinTone] ?? "white";
    const gender = config.characterType === "girl" ? "girl" : "boy";
    const base = BASE_IMAGES[gender][variant] ?? BASE_IMAGES[gender].white;

    let hair: string | null = null;
    if (config.hairStyle && config.hairStyle !== "none") {
      if (gender === "girl") {
        hair = GIRL_HAIR_IMAGES[config.hairStyle] ?? null;
      }
      // Boy hair assets can be added later
    }

    return { baseImage: base, hairImage: hair };
  }, [config]);

  if (!config || !baseImage) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-muted ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.5 }}>{fallbackEmoji}</span>
      </div>
    );
  }

  const containerHeight = size * 1.3;

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: containerHeight }}
    >
      {/* Layer 1: Base character */}
      <img
        src={baseImage}
        alt="Hero avatar"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ zIndex: 1 }}
        draggable={false}
      />

      {/* Layer 2: Hairstyle */}
      {hairImage && (
        <img
          src={hairImage}
          alt="Hair"
          className="absolute object-contain"
          style={{
            zIndex: 2,
            width: "60%",
            left: "20%",
            top: "0%",
          }}
          draggable={false}
        />
      )}

      {/* Layer 3: Accessory - placeholder for future assets */}
    </div>
  );
}
