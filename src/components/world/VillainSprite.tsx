import { motion } from "framer-motion";

/* Simple CSS/SVG villain sprites — no external images */
const VILLAIN_STYLES: Record<string, { colors: string[]; shape: string; eyeColor: string }> = {
  "The Keybreaker":      { colors: ["#8b0000", "#ff4444"], shape: "M25,15 L75,15 L85,50 L75,85 L25,85 L15,50 Z", eyeColor: "#ff0" },
  "The Phisher King":    { colors: ["#1a3a5c", "#4488cc"], shape: "M30,10 L70,10 L80,40 L70,80 L50,90 L30,80 L20,40 Z", eyeColor: "#0ff" },
  "The Troll Lord":      { colors: ["#2d4a1e", "#66aa33"], shape: "M20,20 L50,5 L80,20 L85,60 L65,85 L35,85 L15,60 Z", eyeColor: "#f80" },
  "The Firewall Phantom":{ colors: ["#1a1a3c", "#6644cc"], shape: "M50,5 L85,30 L80,70 L50,90 L20,70 L15,30 Z", eyeColor: "#f0f" },
  "The Data Thief":      { colors: ["#3a1a3a", "#cc44aa"], shape: "M25,15 L75,15 L80,50 L65,85 L35,85 L20,50 Z", eyeColor: "#0f0" },
  "Malware Max":         { colors: ["#4a2a00", "#ff8800"], shape: "M30,10 L70,10 L85,45 L70,85 L30,85 L15,45 Z", eyeColor: "#f00" },
  "SHADOWBYTE":          { colors: ["#0a0a1a", "#333355"], shape: "M50,2 L90,25 L85,75 L50,98 L15,75 L10,25 Z", eyeColor: "#f00" },
};

interface VillainSpriteProps {
  villainName: string;
  size?: number;
  className?: string;
  menacing?: boolean;
}

export default function VillainSprite({ villainName, size = 80, className = "", menacing = false }: VillainSpriteProps) {
  const style = VILLAIN_STYLES[villainName] || VILLAIN_STYLES["The Keybreaker"];

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      animate={menacing ? { y: [0, -4, 0], rotate: [0, -2, 2, 0] } : { y: [0, -3, 0] }}
      transition={{ repeat: Infinity, duration: menacing ? 1.5 : 3, ease: "easeInOut" }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <linearGradient id={`vg-${villainName.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={style.colors[1]} />
            <stop offset="100%" stopColor={style.colors[0]} />
          </linearGradient>
          <filter id="villainGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Body */}
        <path
          d={style.shape}
          fill={`url(#vg-${villainName.replace(/\s/g, "")})`}
          stroke={style.colors[1]}
          strokeWidth="1.5"
          opacity="0.9"
          filter="url(#villainGlow)"
        />
        {/* Eyes */}
        <motion.circle
          cx="38" cy="42" r="4"
          fill={style.eyeColor}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        />
        <motion.circle
          cx="62" cy="42" r="4"
          fill={style.eyeColor}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        />
        {/* Mouth */}
        <path d="M38,60 Q50,70 62,60" fill="none" stroke={style.eyeColor} strokeWidth="2" opacity="0.6" />
      </svg>
    </motion.div>
  );
}
