import { useMemo } from "react";
import { type AvatarConfig } from "./avatarConfig";

// Body base imports
import boyBase from "@/assets/avatar/body/boy-base.png";
import girlBase from "@/assets/avatar/body/girl-base.png";

// Boy hair imports
import boyHairShort from "@/assets/avatar/hair/boy-hair-short.png";
import boyHairSpiky from "@/assets/avatar/hair/boy-hair-spiky.png";
import boyHairAfro from "@/assets/avatar/hair/boy-hair-afro.png";
import boyHairFade from "@/assets/avatar/hair/boy-hair-fade.png";

// Girl hair imports
import girlHairBob from "@/assets/avatar/hair/girl-hair-bob.png";
import girlHairPuffs from "@/assets/avatar/hair/girl-hair-puffs.png";
import girlHairPonytail from "@/assets/avatar/hair/girl-hair-ponytail.png";

interface AvatarRendererProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

const BODY_IMAGES: Record<string, string> = {
  boy: boyBase,
  girl: girlBase,
};

const BOY_HAIR_IMAGES: Record<string, string> = {
  short: boyHairShort,
  spiky: boyHairSpiky,
  afro: boyHairAfro,
  fade: boyHairFade,
};

const GIRL_HAIR_IMAGES: Record<string, string> = {
  bob: girlHairBob,
  puffs: girlHairPuffs,
  ponytail: girlHairPonytail,
};

export default function AvatarRenderer({
  config,
  size = 120,
  className = "",
  fallbackEmoji = "🦸",
}: AvatarRendererProps) {
  const { bodyImage, hairImage } = useMemo(() => {
    if (!config) return { bodyImage: null, hairImage: null };

    const gender = config.characterType === "girl" ? "girl" : "boy";
    const body = BODY_IMAGES[gender];

    let hair: string | null = null;
    if (config.hairStyle && config.hairStyle !== "none") {
      const hairMap = gender === "girl" ? GIRL_HAIR_IMAGES : BOY_HAIR_IMAGES;
      hair = hairMap[config.hairStyle] ?? null;
    }

    return { bodyImage: body, hairImage: hair };
  }, [config]);

  if (!config || !bodyImage) {
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
      {/* Layer 1: Base body */}
      <img
        src={bodyImage}
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
            width: "50%",
            left: "25%",
            top: "-5%",
          }}
          draggable={false}
        />
      )}
    </div>
  );
}
