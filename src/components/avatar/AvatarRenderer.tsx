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

interface AvatarRendererProps {
  config?: AvatarConfig | null;
  size?: number;
  className?: string;
  fallbackEmoji?: string;
}

// Map skin tone hex → character variant
const SKIN_TO_VARIANT: Record<string, string> = {
  "#FDDCB5": "white",
  "#F5C6A0": "white",
  "#E8A978": "mexican",
  "#C68642": "indian",
  "#8D5524": "black",
  "#5C3317": "black",
};

const BASE_IMAGES: Record<string, Record<string, string>> = {
  boy: {
    white: boyWhite,
    black: boyBlack,
    mexican: boyMexican,
    asian: boyAsian,
    indian: boyIndian,
  },
  girl: {
    white: girlWhite,
    black: girlBlack,
    mexican: girlMexican,
    asian: girlAsian,
    indian: girlIndian,
  },
};

export default function AvatarRenderer({
  config,
  size = 120,
  className = "",
  fallbackEmoji = "🦸",
}: AvatarRendererProps) {
  const baseImage = useMemo(() => {
    if (!config) return null;
    const variant = SKIN_TO_VARIANT[config.skinTone] ?? "white";
    const gender = config.characterType === "girl" ? "girl" : "boy";
    return BASE_IMAGES[gender][variant] ?? BASE_IMAGES[gender].white;
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

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size * 1.3 }}
    >
      <img
        src={baseImage}
        alt="Hero avatar"
        className="absolute inset-0 h-full w-full object-contain"
        style={{ zIndex: 1 }}
        draggable={false}
      />
    </div>
  );
}
