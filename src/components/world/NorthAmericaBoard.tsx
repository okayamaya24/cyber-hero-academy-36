import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ZoneDef } from "@/data/continents";

/* ─── Node positions as % of container — mapped to real geography ─── */
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  "hq":              { x: 72, y: 48 },   // Washington DC area
  "password-peak":   { x: 75, y: 35 },   // New York area
  "encrypt-enclave": { x: 68, y: 28 },   // Toronto area
  "code-canyon":     { x: 48, y: 52 },   // Denver area
  "signal-summit":   { x: 58, y: 38 },   // Chicago area
  "arctic-archive":  { x: 28, y: 30 },   // Vancouver area
  "pixel-port":      { x: 30, y: 48 },   // San Francisco area
  "shadow-station":  { x: 50, y: 75 },   // Mexico City area
  "boss-keybreaker": { x: 73, y: 62 },   // Miami / boss fortress
};

/* ─── Connection path order ─── */
const PATH_ORDER = [
  "hq", "password-peak", "encrypt-enclave", "signal-summit",
  "code-canyon", "pixel-port", "arctic-archive",
  "shadow-station", "boss-keybreaker",
];

/* ─── Zone visual config ─── */
const ZONE_ENVIRONMENTS: Record<string, { emoji: string; label: string; color: string }> = {
  "hq":              { emoji: "🏛️", label: "Command", color: "hsl(45 90% 50%)" },
  "password-peak":   { emoji: "🔑", label: "Peak",    color: "hsl(195 85% 55%)" },
  "encrypt-enclave": { emoji: "🏰", label: "Fortress", color: "hsl(260 60% 55%)" },
  "code-canyon":     { emoji: "🏜️", label: "Canyon",  color: "hsl(30 80% 50%)" },
  "signal-summit":   { emoji: "📡", label: "Tower",   color: "hsl(175 70% 50%)" },
  "arctic-archive":  { emoji: "❄️", label: "Archive", color: "hsl(200 80% 70%)" },
  "pixel-port":      { emoji: "🌆", label: "Port",    color: "hsl(280 60% 55%)" },
  "shadow-station":  { emoji: "🌑", label: "Station", color: "hsl(260 40% 40%)" },
  "boss-keybreaker": { emoji: "💀", label: "Vault",   color: "hsl(0 80% 50%)" },
};

/* ─── Realistic North America SVG paths ─── */
const CONTINENT_MAIN = `
  M 22,8 L 26,7 L 32,6 L 38,5 L 44,6 L 50,8 L 54,7 L 58,6 L 62,7
  L 66,9 L 70,8 L 74,10 L 76,13 L 78,17 L 80,22 L 79,26 L 77,30
  L 76,34 L 75,37 L 74,40 L 73,43 L 74,46 L 75,49 L 74,52
  L 72,55 L 70,58 L 68,60 L 66,63 L 68,66 L 70,68 L 72,65
  L 75,63 L 77,66 L 76,70 L 73,72 L 70,73 L 67,72 L 64,70
  L 62,68 L 60,70 L 57,72 L 54,74 L 52,76 L 50,78 L 48,80
  L 45,82 L 42,83 L 40,82 L 38,80 L 36,77 L 34,74 L 32,72
  L 30,70 L 28,68 L 26,64 L 25,60 L 24,56 L 23,52 L 22,48
  L 21,44 L 20,40 L 19,36 L 18,32 L 18,28 L 19,24 L 20,20
  L 20,16 L 21,12 Z
`;

const ALASKA_PATH = `M 10,14 L 14,12 L 18,13 L 20,16 L 18,19 L 15,20 L 12,19 L 10,17 Z`;
const GREENLAND_PATH = `M 72,4 L 76,3 L 80,4 L 82,7 L 81,10 L 78,11 L 75,10 L 73,7 Z`;

/* Great Lakes */
const GREAT_LAKES = `M 58,28 Q 60,27 62,28 Q 63,29 62,30 Q 60,31 58,30 Q 57,29 58,28 Z
  M 63,29 Q 65,28 66,30 Q 66,31 64,31 Q 63,30 63,29 Z`;

/* ─── Floating particles (reduced) ─── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const dur = Math.random() * 6 + 5;
        const delay = Math.random() * 5;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${x}%`,
              top: `${y}%`,
              background: i % 3 === 0
                ? "hsl(195 85% 60%)"
                : i % 3 === 1
                  ? "hsl(160 65% 55%)"
                  : "hsl(45 90% 60%)",
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: dur,
              delay,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

interface Props {
  zones: ZoneDef[];
  zoneStatuses: string[];
  onZoneClick: (zone: ZoneDef, index: number) => void;
}

export default function NorthAmericaBoard({ zones, zoneStatuses, onZoneClick }: Props) {
  /* Build SVG path for the route */
  const routePath = useMemo(() => {
    const points = PATH_ORDER.map((id) => {
      const pos = NODE_POSITIONS[id];
      return pos ? { x: pos.x, y: pos.y } : null;
    }).filter(Boolean) as { x: number; y: number }[];

    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      const cpy = (prev.y + curr.y) / 2 - 3;
      d += ` Q ${cpx} ${cpy}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, []);

  /* Furthest completed index */
  const completedPathIndex = useMemo(() => {
    let last = -1;
    PATH_ORDER.forEach((id, i) => {
      const zi = zones.findIndex((z) => z.id === id);
      if (zi >= 0 && zoneStatuses[zi] === "completed") last = i;
    });
    return last;
  }, [zones, zoneStatuses]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-primary/15"
      style={{
        aspectRatio: "16/10",
        maxWidth: "1000px",
      }}
    >
      {/* ── Dark tech background ── */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 50% 50%, hsl(215 50% 12%), hsl(220 45% 7%) 70%, hsl(225 40% 4%))
        `,
      }} />

      {/* ── Hex grid texture ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexGrid" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
            <path d="M14 16 L28 24 L28 40 L14 48 L0 40 L0 24 Z" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>

      {/* ── North America continent silhouette ── */}
      <svg viewBox="0 0 100 90" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Regional shading: lighter top (Canada), medium middle (US), darker bottom (Mexico) */}
          <linearGradient id="continentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(200 60% 35%)" stopOpacity="0.14" />
            <stop offset="40%" stopColor="hsl(210 50% 28%)" stopOpacity="0.10" />
            <stop offset="75%" stopColor="hsl(220 40% 22%)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(225 35% 18%)" stopOpacity="0.06" />
          </linearGradient>
          <filter id="subtleGlow">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>

        {/* Main continent */}
        <path
          d={CONTINENT_MAIN}
          fill="url(#continentGrad)"
          stroke="hsl(195 70% 45%)"
          strokeWidth="0.4"
          strokeOpacity="0.3"
        />
        {/* Coastline highlight (brighter inner stroke) */}
        <path
          d={CONTINENT_MAIN}
          fill="none"
          stroke="hsl(195 80% 55%)"
          strokeWidth="0.15"
          strokeOpacity="0.15"
          strokeDasharray="2 1"
        />

        {/* Alaska */}
        <path
          d={ALASKA_PATH}
          fill="hsl(200 60% 30%)"
          fillOpacity="0.12"
          stroke="hsl(195 70% 45%)"
          strokeWidth="0.3"
          strokeOpacity="0.25"
        />

        {/* Greenland */}
        <path
          d={GREENLAND_PATH}
          fill="hsl(200 50% 35%)"
          fillOpacity="0.08"
          stroke="hsl(195 70% 45%)"
          strokeWidth="0.3"
          strokeOpacity="0.2"
        />

        {/* Great Lakes */}
        <path
          d={GREAT_LAKES}
          fill="hsl(210 60% 40%)"
          fillOpacity="0.15"
          stroke="hsl(195 80% 55%)"
          strokeWidth="0.2"
          strokeOpacity="0.2"
        />

        {/* Subtle terrain lines */}
        <path d="M 30,35 Q 40,32 50,36" fill="none" stroke="hsl(195 50% 40%)" strokeWidth="0.15" strokeOpacity="0.1" />
        <path d="M 35,50 Q 45,47 55,52" fill="none" stroke="hsl(195 50% 40%)" strokeWidth="0.12" strokeOpacity="0.08" />
        <path d="M 25,42 Q 32,39 38,44" fill="none" stroke="hsl(195 50% 40%)" strokeWidth="0.12" strokeOpacity="0.06" />
      </svg>

      {/* ── Floating particles ── */}
      <FloatingParticles />

      {/* ── Route SVG overlay (subdued) ── */}
      <svg viewBox="0 0 100 90" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
        {/* Background locked path — faint dashed */}
        <path d={routePath} fill="none" stroke="hsl(210 25% 25%)" strokeWidth="0.4"
          strokeDasharray="1.5 1.5" strokeLinecap="round" strokeOpacity="0.3" />

        {/* Completed path — subtle glow */}
        {completedPathIndex >= 0 && (
          <path d={routePath} fill="none" stroke="hsl(195 70% 45%)" strokeWidth="0.7"
            strokeLinecap="round" strokeOpacity="0.35"
            strokeDasharray={`${(completedPathIndex + 1) * 14} 200`} />
        )}
      </svg>

      {/* ── Segment connection lines (subtle) ── */}
      <svg viewBox="0 0 100 90" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid meet">
        {PATH_ORDER.slice(0, -1).map((fromId, i) => {
          const toId = PATH_ORDER[i + 1];
          const from = NODE_POSITIONS[fromId];
          const to = NODE_POSITIONS[toId];
          if (!from || !to) return null;

          const fromZoneIdx = zones.findIndex((z) => z.id === fromId);
          const toZoneIdx = zones.findIndex((z) => z.id === toId);
          const fromDone = fromZoneIdx >= 0 && zoneStatuses[fromZoneIdx] === "completed";
          const toDone = toZoneIdx >= 0 && zoneStatuses[toZoneIdx] === "completed";
          const toAvail = toZoneIdx >= 0 && zoneStatuses[toZoneIdx] === "available";

          const color = fromDone && toDone
            ? "hsl(160 65% 45%)"
            : fromDone && toAvail
              ? "hsl(195 70% 50%)"
              : "hsl(210 20% 22%)";
          const opacity = fromDone ? 0.4 : 0.1;
          const width = fromDone && toDone ? 0.5 : 0.3;

          const cpx = (from.x + to.x) / 2;
          const cpy = (from.y + to.y) / 2 - 3;

          return (
            <path key={`seg-${i}`}
              d={`M ${from.x} ${from.y} Q ${cpx} ${cpy}, ${to.x} ${to.y}`}
              fill="none" stroke={color} strokeWidth={width} strokeOpacity={opacity}
              strokeLinecap="round" strokeDasharray={fromDone ? "none" : "1 1"} />
          );
        })}
      </svg>

      {/* ── Zone Nodes ── */}
      {zones.map((zone, i) => {
        const pos = NODE_POSITIONS[zone.id];
        if (!pos) return null;
        const status = zoneStatuses[i] || "locked";
        const isLocked = status === "locked";
        const isCompleted = status === "completed";
        const isAvailable = status === "available";

        const nodeSize = zone.isHQ ? 52 : zone.isBoss ? 50 : 42;

        const bgColor = zone.isHQ
          ? "linear-gradient(135deg, hsl(45 90% 50%), hsl(35 95% 42%))"
          : zone.isBoss
            ? "linear-gradient(135deg, hsl(0 70% 40%), hsl(340 80% 35%))"
            : isCompleted
              ? "linear-gradient(135deg, hsl(160 65% 42%), hsl(145 70% 35%))"
              : isAvailable
                ? "linear-gradient(135deg, hsl(195 85% 45%), hsl(185 80% 40%))"
                : "linear-gradient(135deg, hsl(210 30% 20%), hsl(215 25% 16%))";

        const borderColor = zone.isHQ
          ? "hsl(45 90% 60%)"
          : zone.isBoss
            ? "hsl(0 80% 55%)"
            : isCompleted
              ? "hsl(160 65% 55%)"
              : isAvailable
                ? "hsl(195 85% 60%)"
                : "hsl(210 20% 28%)";

        const glowShadow = zone.isHQ
          ? "0 0 16px hsl(45 90% 50% / 0.4), 0 3px 10px hsl(0 0% 0% / 0.3)"
          : zone.isBoss
            ? "0 0 16px hsl(0 80% 50% / 0.4), 0 3px 10px hsl(0 0% 0% / 0.3)"
            : isCompleted
              ? "0 0 12px hsl(160 65% 50% / 0.3), 0 3px 8px hsl(0 0% 0% / 0.3)"
              : isAvailable
                ? "0 0 14px hsl(195 85% 55% / 0.35), 0 3px 8px hsl(0 0% 0% / 0.3)"
                : "0 2px 6px hsl(0 0% 0% / 0.3)";

        return (
          <motion.div
            key={zone.id}
            className="absolute flex flex-col items-center"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: zone.isHQ || zone.isBoss ? 20 : 10,
            }}
            initial={{ opacity: 0, scale: 0.3, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.3, type: "spring", stiffness: 200, damping: 18 }}
          >
            {/* Pulse ring for available */}
            {isAvailable && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: nodeSize + 16,
                  height: nodeSize + 16,
                  border: `1.5px solid ${borderColor}`,
                  opacity: 0,
                }}
                animate={{ opacity: [0, 0.3, 0], scale: [1, 1.4, 1.6] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
              />
            )}

            {/* Main node button */}
            <motion.button
              onClick={() => !isLocked && onZoneClick(zone, i)}
              disabled={isLocked}
              className="relative flex items-center justify-center rounded-full transition-transform"
              style={{
                width: nodeSize,
                height: nodeSize,
                background: bgColor,
                border: `2.5px solid ${borderColor}`,
                boxShadow: glowShadow,
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.35 : 1,
              }}
              whileHover={!isLocked ? { scale: 1.15 } : {}}
              whileTap={!isLocked ? { scale: 0.92 } : {}}
            >
              <span className="text-lg select-none" style={{ filter: isLocked ? "grayscale(1)" : "none" }}>
                {isLocked ? "🔒" : isCompleted ? "✅" : zone.icon}
              </span>

              {!isLocked && (
                <div className="absolute inset-[2px] rounded-full border border-white/20 pointer-events-none" />
              )}

              {isCompleted && (
                <motion.div
                  className="absolute -top-1 -right-1 text-xs"
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  ✨
                </motion.div>
              )}
            </motion.button>

            {/* Label */}
            <div className="mt-1.5 text-center max-w-[90px]">
              <p
                className="text-[9px] md:text-[11px] font-bold leading-tight drop-shadow-lg"
                style={{
                  color: isLocked
                    ? "hsl(210 20% 40%)"
                    : zone.isBoss
                      ? "hsl(0 80% 70%)"
                      : zone.isHQ
                        ? "hsl(45 90% 70%)"
                        : "white",
                  textShadow: isLocked ? "none" : "0 1px 3px rgba(0,0,0,0.6)",
                }}
              >
                {zone.name.replace(" — Cyber Hero Command", "")}
              </p>
              {!isLocked && (
                <p className="text-[7px] md:text-[8px] mt-0.5" style={{ color: "hsl(195 50% 50% / 0.6)" }}>
                  {zone.city}
                </p>
              )}
            </div>

            {/* GO badge */}
            {isAvailable && !zone.isHQ && !zone.isBoss && (
              <motion.div
                className="absolute -top-2 -right-2 rounded-full px-1.5 py-0.5 text-[7px] font-bold"
                style={{
                  background: "hsl(195 85% 50%)",
                  color: "white",
                  boxShadow: "0 2px 8px hsl(195 85% 50% / 0.4)",
                }}
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                GO!
              </motion.div>
            )}

            {/* Boss FIGHT badge */}
            {zone.isBoss && isAvailable && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[7px] font-bold"
                style={{
                  background: "hsl(0 80% 50%)",
                  color: "white",
                  boxShadow: "0 2px 10px hsl(0 80% 50% / 0.5)",
                }}
                animate={{ y: [-2, 2, -2], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                ⚔️ FIGHT!
              </motion.div>
            )}

            {/* HQ start badge */}
            {zone.isHQ && isAvailable && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[8px] font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(45 90% 50%), hsl(35 95% 45%))",
                  color: "hsl(210 40% 10%)",
                  boxShadow: "0 2px 10px hsl(45 90% 50% / 0.5)",
                }}
                animate={{ y: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                ⭐ START HERE!
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* ── Corner circuit decorations (subtle) ── */}
      <svg className="absolute top-0 left-0 w-20 h-20 opacity-[0.06] pointer-events-none" viewBox="0 0 100 100">
        <path d="M0 20 L20 20 L20 0" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="1" />
        <circle cx="20" cy="20" r="2" fill="hsl(195 80% 60%)" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-20 h-20 opacity-[0.06] pointer-events-none" viewBox="0 0 100 100">
        <path d="M100 80 L80 80 L80 100" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="1" />
        <circle cx="80" cy="80" r="2" fill="hsl(195 80% 60%)" />
      </svg>

      {/* ── Scan line overlay ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.012]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60%) 2px, hsl(195 80% 60%) 3px)",
      }} />
    </div>
  );
}
