import AvatarRenderer from "./AvatarRenderer";
import type { AvatarConfig } from "./avatarConfig";

interface HeroAvatarProps {
  avatarConfig: Record<string, any> | null | undefined;
  fallbackEmoji?: string;
  size?: number;
  className?: string;
}

/**
 * Renders a child's saved Cyber Hero image if available,
 * otherwise falls back to the old AvatarRenderer / emoji.
 */
export default function HeroAvatar({
  avatarConfig,
  fallbackEmoji = "🦸",
  size = 80,
  className = "",
}: HeroAvatarProps) {
  const heroSrc = avatarConfig?.heroSrc as string | undefined;

  if (heroSrc) {
    return (
      <img
        src={heroSrc}
        alt="Cyber Hero"
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
        draggable={false}
      />
    );
  }

  return (
    <AvatarRenderer
      config={avatarConfig as AvatarConfig | null}
      size={size}
      fallbackEmoji={fallbackEmoji}
      className={className}
    />
  );
}
