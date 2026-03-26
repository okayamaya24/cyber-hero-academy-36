import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ZoneDef } from "@/data/continents";

/* ─── Board node positions as % of container (x, y) ─── */
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  "hq":              { x: 82, y: 74 },
  "password-peak":   { x: 75, y: 55 },
  "encrypt-enclave": { x: 60, y: 38 },
  "code-canyon":     { x: 45, y: 52 },
  "signal-summit":   { x: 32, y: 34 },
  "arctic-archive":  { x: 16, y: 18 },
  "pixel-port":      { x: 18, y: 62 },
  "shadow-station":  { x: 40, y: 82 },
  "boss-keybreaker": { x: 50, y: 12 },
};

/* ─── Connection path order ─── */
const PATH_ORDER = [
  "hq", "password-peak", "encrypt-enclave", "code-canyon",
  "signal-summit", "arctic-archive", "pixel-port", "shadow-station",
  "boss-keybreaker",
];

/* ─── Terrain / environment layers behind each zone ─── */
const ZONE_ENVIRONMENTS: Record<string, { emoji: string; label: string; color: string; size: number }> = {
  "hq":              { emoji: "🏛️", label: "Command", color: "hsl(45 90% 50%)", size: 38 },
  "password-peak":   { emoji: "⛰️", label: "Peak",    color: "hsl(195 85% 55%)", size: 32 },
  "encrypt-enclave": { emoji: "🏰", label: "Fortress", color: "hsl(260 60% 55%)", size: 30 },
  "code-canyon":     { emoji: "🏜️", label: "Canyon",  color: "hsl(30 80% 50%)", size: 28 },
  "signal-summit":   { emoji: "📡", label: "Tower",   color: "hsl(175 70% 50%)", size: 28 },
  "arctic-archive":  { emoji: "❄️", label: "Archive", color: "hsl(200 80% 70%)", size: 28 },
  "pixel-port":      { emoji: "🌆", label: "Port",    color: "hsl(280 60% 55%)", size: 28 },
  "shadow-station":  { emoji: "🌑", label: "Station", color: "hsl(260 40% 40%)", size: 28 },
  "boss-keybreaker": { emoji: "💀", label: "Vault",   color: "hsl(0 80% 50%)", size: 36 },
};

/* ─── Decorative landmarks scattered across the map ─── */
const LANDMARKS = [
  { x: 8, y: 8, emoji: "🌌", size: 22, opacity: 0.2 },
  { x: 92, y: 12, emoji: "🛰️", size: 18, opacity: 0.25 },
  { x: 5, y: 45, emoji: "🌲", size: 16, opacity: 0.15 },
  { x: 10, y: 82, emoji: "🌊", size: 18, opacity: 0.15 },
  { x: 65, y: 90, emoji: "🌴", size: 16, opacity: 0.15 },
  { x: 90, y: 90, emoji: "⚡", size: 14, opacity: 0.2 },
  { x: 30, y: 12, emoji: "🦌", size: 14, opacity: 0.12 },
  { x: 70, y: 25, emoji: "🏔️", size: 20, opacity: 0.18 },
  { x: 55, y: 70, emoji: "🌵", size: 16, opacity: 0.15 },
  { x: 88, y: 45, emoji: "🗽", size: 18, opacity: 0.2 },
  { x: 28, y: 75, emoji: "🏜️", size: 14, opacity: 0.12 },
  { x: 48, y: 95, emoji: "🌋", size: 16, opacity: 0.15 },
  { x: 75, y: 8, emoji: "🛡️", size: 14, opacity: 0.18 },
  { x: 35, y: 50, emoji: "⚙️", size: 12, opacity: 0.1 },
];

/* ─── Floating particles for ambiance ─── */
function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 35 }).map((_, i) => {
        const size = Math.random() * 3 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const dur = Math.random() * 6 + 4;
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
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
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

/* ─── Animated energy pulse along the path ─── */
function PathEnergyPulse({ routePath, completedIndex }: { routePath: string; completedIndex: number }) {
  if (completedIndex < 0 || !routePath) return null;
  return (
    <>
      {[0, 1, 2].map((i) => (
        <circle key={i} r="1.5" fill="hsl(195 85% 70%)" opacity="0">
          <animateMotion
            path={routePath}
            dur={`${6 + i * 2}s`}
            begin={`${i * 2}s`}
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0;0.8;0.8;0" dur={`${6 + i * 2}s`} begin={`${i * 2}s`} repeatCount="indefinite" />
          <animate attributeName="r" values="1;2.5;1" dur={`${6 + i * 2}s`} begin={`${i * 2}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

interface Props {
  zones: ZoneDef[];
  zoneStatuses: string[];
  onZoneClick: (zone: ZoneDef, index: number) => void;
}

export default function NorthAmericaBoard({ zones, zoneStatuses, onZoneClick }: Props) {
  /* Build SVG path for the glowing route */
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
      const cpy = Math.min(prev.y, curr.y) - 8;
      d += ` Q ${cpx} ${cpy}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, []);

  /* Find furthest completed index for path progress */
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
        maxWidth: "960px",
      }}
    >
      {/* ── Multi-layer background ── */}
      <div className="absolute inset-0" style={{
        background: `
          radial-gradient(ellipse at 82% 74%, hsl(45 60% 18% / 0.3) 0%, transparent 25%),
          radial-gradient(ellipse at 50% 12%, hsl(0 60% 15% / 0.4) 0%, transparent 20%),
          radial-gradient(ellipse at 16% 18%, hsl(200 60% 20% / 0.3) 0%, transparent 20%),
          radial-gradient(ellipse at 30% 50%, hsl(175 50% 15% / 0.25) 0%, transparent 30%),
          radial-gradient(ellipse at 50% 50%, hsl(210 55% 16%), hsl(215 50% 10%) 55%, hsl(220 45% 6%))
        `,
      }} />

      {/* ── Terrain texture layer ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hexGrid" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
            <path d="M14 16 L28 24 L28 40 L14 48 L0 40 L0 24 Z" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>

      {/* ── Continent silhouette (stylized) ── */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="continentFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(195 80% 50%)" stopOpacity="0.08" />
            <stop offset="50%" stopColor="hsl(175 60% 45%)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="hsl(210 50% 40%)" stopOpacity="0.03" />
          </linearGradient>
          <filter id="continentGlow">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <path
          d="M45,2 L55,3 L65,5 L72,8 L78,5 L85,8 L88,14 L90,22 L88,30 L85,35 L82,42 L80,50 L78,55 L75,58 L72,60 L68,62 L65,60 L60,58 L55,62 L52,68 L48,72 L45,78 L42,82 L38,88 L35,92 L30,95 L25,92 L22,88 L20,82 L18,75 L15,68 L12,60 L10,52 L12,45 L15,38 L18,32 L20,28 L22,22 L25,18 L28,12 L32,8 L38,4 Z"
          fill="url(#continentFill)"
          stroke="hsl(195 80% 50%)"
          strokeWidth="0.3"
          strokeOpacity="0.15"
        />
        {/* Terrain elevation lines */}
        <path d="M25,30 Q35,22 45,28 Q55,34 65,26" fill="none" stroke="hsl(195 70% 50%)" strokeWidth="0.2" strokeOpacity="0.1" />
        <path d="M15,50 Q25,42 35,48 Q45,54 55,46" fill="none" stroke="hsl(195 70% 50%)" strokeWidth="0.15" strokeOpacity="0.08" />
        <path d="M30,70 Q40,62 50,68 Q60,74 70,66" fill="none" stroke="hsl(195 70% 50%)" strokeWidth="0.15" strokeOpacity="0.06" />
      </svg>

      {/* ── Ambient glow spots per zone ── */}
      {Object.entries(NODE_POSITIONS).map(([id, pos]) => {
        const env = ZONE_ENVIRONMENTS[id];
        if (!env) return null;
        const zi = zones.findIndex((z) => z.id === id);
        const isLocked = zi >= 0 && zoneStatuses[zi] === "locked";
        return (
          <div
            key={`glow-${id}`}
            className="absolute rounded-full blur-[50px] pointer-events-none transition-opacity duration-1000"
            style={{
              width: 120,
              height: 120,
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              background: env.color,
              opacity: isLocked ? 0.03 : 0.12,
            }}
          />
        );
      })}

      {/* ── Floating particles ── */}
      <FloatingParticles />

      {/* ── Landmark decorations ── */}
      {LANDMARKS.map((lm, i) => (
        <motion.div
          key={`lm-${i}`}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${lm.x}%`,
            top: `${lm.y}%`,
            fontSize: lm.size,
            transform: "translate(-50%, -50%)",
            opacity: lm.opacity,
          }}
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "easeInOut" }}
        >
          {lm.emoji}
        </motion.div>
      ))}

      {/* ── Route SVG overlay ── */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeLocked" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(210 30% 35%)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(210 30% 25%)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="routeActive" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(195 85% 55%)" stopOpacity="0.7" />
            <stop offset="50%" stopColor="hsl(175 70% 50%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(160 65% 50%)" stopOpacity="0.5" />
          </linearGradient>
          <filter id="pathGlow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="pathGlowStrong">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background locked path — dashed */}
        <path d={routePath} fill="none" stroke="url(#routeLocked)" strokeWidth="1"
          strokeDasharray="2 1.5" strokeLinecap="round" />

        {/* Active/completed glow path — thick and glowing */}
        {completedPathIndex >= 0 && (
          <>
            <path d={routePath} fill="none" stroke="url(#routeActive)" strokeWidth="1.8"
              strokeLinecap="round" filter="url(#pathGlowStrong)"
              strokeDasharray={`${(completedPathIndex + 1) * 14} 200`} />
            <path d={routePath} fill="none" stroke="hsl(195 90% 70%)" strokeWidth="0.6"
              strokeLinecap="round" filter="url(#pathGlow)"
              strokeDasharray={`${(completedPathIndex + 1) * 14} 200`} opacity="0.5" />
          </>
        )}

        {/* Energy pulses travelling along the path */}
        <PathEnergyPulse routePath={routePath} completedIndex={completedPathIndex} />
      </svg>

      {/* ── Segment connection lines ── */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
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
            ? "hsl(160 65% 50%)"
            : fromDone && toAvail
              ? "hsl(195 85% 55%)"
              : "hsl(210 25% 28%)";
          const opacity = fromDone ? 0.7 : 0.15;
          const width = fromDone && toDone ? 0.9 : 0.5;

          const cpx = (from.x + to.x) / 2;
          const cpy = Math.min(from.y, to.y) - 8;

          return (
            <path key={`seg-${i}`}
              d={`M ${from.x} ${from.y} Q ${cpx} ${cpy}, ${to.x} ${to.y}`}
              fill="none" stroke={color} strokeWidth={width} strokeOpacity={opacity}
              strokeLinecap="round" strokeDasharray={fromDone ? "none" : "1.5 1"} />
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
        const env = ZONE_ENVIRONMENTS[zone.id];

        /* Node sizing */
        const nodeSize = zone.isHQ ? 58 : zone.isBoss ? 56 : 48;

        /* Colors */
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
          ? "0 0 24px hsl(45 90% 50% / 0.5), 0 0 48px hsl(45 90% 50% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.3)"
          : zone.isBoss
            ? "0 0 24px hsl(0 80% 50% / 0.5), 0 0 48px hsl(0 80% 50% / 0.2), 0 4px 16px hsl(0 0% 0% / 0.3)"
            : isCompleted
              ? "0 0 20px hsl(160 65% 50% / 0.4), 0 4px 12px hsl(0 0% 0% / 0.3)"
              : isAvailable
                ? "0 0 20px hsl(195 85% 55% / 0.45), 0 0 40px hsl(195 85% 55% / 0.15), 0 4px 12px hsl(0 0% 0% / 0.3)"
                : "0 2px 8px hsl(0 0% 0% / 0.3)";

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
            initial={{ opacity: 0, scale: 0.3, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.08 + 0.3, type: "spring", stiffness: 200, damping: 18 }}
          >
            {/* Environment base (terrain beneath node) */}
            {env && !isLocked && (
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: nodeSize + 30,
                  height: nodeSize + 30,
                  background: `radial-gradient(circle, ${env.color}15 0%, transparent 70%)`,
                  border: `1px solid ${env.color}20`,
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              />
            )}

            {/* Outer pulse rings for non-locked */}
            {!isLocked && (
              <>
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: nodeSize + 20,
                    height: nodeSize + 20,
                    border: `2px solid ${borderColor}`,
                    opacity: 0,
                  }}
                  animate={{ opacity: [0, 0.35, 0], scale: [1, 1.5, 1.8] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: nodeSize + 12,
                    height: nodeSize + 12,
                    border: `1px solid ${borderColor}`,
                    opacity: 0,
                  }}
                  animate={{ opacity: [0, 0.2, 0], scale: [1, 1.3, 1.5] }}
                  transition={{ repeat: Infinity, duration: 2.5, delay: 0.8, ease: "easeOut" }}
                />
              </>
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
                border: `3px solid ${borderColor}`,
                boxShadow: glowShadow,
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.35 : 1,
              }}
              whileHover={!isLocked ? { scale: 1.18, rotate: 2 } : {}}
              whileTap={!isLocked ? { scale: 0.92 } : {}}
            >
              <span className="text-xl select-none" style={{ filter: isLocked ? "grayscale(1)" : "none" }}>
                {isLocked ? "🔒" : isCompleted ? "✅" : zone.icon}
              </span>

              {/* Inner highlight ring */}
              {!isLocked && (
                <div className="absolute inset-[3px] rounded-full border border-white/25 pointer-events-none" />
              )}

              {/* Completed sparkle effect */}
              {isCompleted && (
                <motion.div
                  className="absolute -top-1 -right-1 text-sm"
                  animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  ✨
                </motion.div>
              )}
            </motion.button>

            {/* Label area */}
            <div className="mt-2 text-center max-w-[100px]">
              <p
                className="text-[10px] md:text-xs font-bold leading-tight drop-shadow-lg"
                style={{
                  color: isLocked
                    ? "hsl(210 20% 40%)"
                    : zone.isBoss
                      ? "hsl(0 80% 70%)"
                      : zone.isHQ
                        ? "hsl(45 90% 70%)"
                        : "white",
                  textShadow: isLocked ? "none" : "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {zone.name.replace(" — Cyber Hero Command", "")}
              </p>
              {!isLocked && (
                <p className="text-[8px] md:text-[9px] mt-0.5" style={{ color: "hsl(195 60% 55% / 0.7)" }}>
                  {zone.city}
                </p>
              )}
            </div>

            {/* Deploy badge for available */}
            {isAvailable && !zone.isHQ && !zone.isBoss && (
              <motion.div
                className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[8px] font-bold"
                style={{
                  background: "hsl(195 85% 50%)",
                  color: "white",
                  boxShadow: "0 2px 10px hsl(195 85% 50% / 0.5)",
                }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                GO!
              </motion.div>
            )}

            {/* Boss FIGHT badge */}
            {zone.isBoss && isAvailable && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[8px] font-bold"
                style={{
                  background: "hsl(0 80% 50%)",
                  color: "white",
                  boxShadow: "0 2px 12px hsl(0 80% 50% / 0.6)",
                }}
                animate={{ y: [-3, 3, -3], scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                ⚔️ FIGHT!
              </motion.div>
            )}

            {/* HQ start badge */}
            {zone.isHQ && isAvailable && (
              <motion.div
                className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[9px] font-bold"
                style={{
                  background: "linear-gradient(135deg, hsl(45 90% 50%), hsl(35 95% 45%))",
                  color: "hsl(210 40% 10%)",
                  boxShadow: "0 2px 12px hsl(45 90% 50% / 0.6)",
                }}
                animate={{ y: [-3, 3, -3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                ⭐ START HERE!
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* ── Boss fortress decoration ── */}
      <div className="absolute pointer-events-none select-none" style={{ left: "50%", top: "2%", transform: "translateX(-50%)" }}>
        <motion.div
          className="flex flex-col items-center"
          animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <span className="text-3xl">🏰</span>
          <span className="text-[7px] font-bold mt-0.5" style={{ color: "hsl(0 80% 60% / 0.5)" }}>KEYBREAKER'S DOMAIN</span>
        </motion.div>
      </div>

      {/* ── Corner circuit decorations ── */}
      <svg className="absolute top-0 left-0 w-28 h-28 opacity-[0.1] pointer-events-none" viewBox="0 0 100 100">
        <path d="M0 20 L20 20 L20 0" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="1" />
        <path d="M0 40 L40 40 L40 0" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
        <path d="M0 55 L30 55 L30 30 L55 30 L55 0" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.3" />
        <circle cx="20" cy="20" r="2.5" fill="hsl(195 80% 60%)" />
        <circle cx="40" cy="40" r="1.5" fill="hsl(195 80% 60%)" />
        <circle cx="55" cy="30" r="1" fill="hsl(195 80% 60%)" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-28 h-28 opacity-[0.1] pointer-events-none" viewBox="0 0 100 100">
        <path d="M100 80 L80 80 L80 100" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="1" />
        <path d="M100 60 L60 60 L60 100" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
        <path d="M100 45 L70 45 L70 70 L45 70 L45 100" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.3" />
        <circle cx="80" cy="80" r="2.5" fill="hsl(195 80% 60%)" />
        <circle cx="60" cy="60" r="1.5" fill="hsl(195 80% 60%)" />
        <circle cx="70" cy="70" r="1" fill="hsl(195 80% 60%)" />
      </svg>
      <svg className="absolute top-0 right-0 w-20 h-20 opacity-[0.06] pointer-events-none" viewBox="0 0 100 100">
        <path d="M100 20 L80 20 L80 0" fill="none" stroke="hsl(0 70% 55%)" strokeWidth="1" />
        <circle cx="80" cy="20" r="2" fill="hsl(0 70% 55%)" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-20 h-20 opacity-[0.06] pointer-events-none" viewBox="0 0 100 100">
        <path d="M0 80 L20 80 L20 100" fill="none" stroke="hsl(160 65% 50%)" strokeWidth="1" />
        <circle cx="20" cy="80" r="2" fill="hsl(160 65% 50%)" />
      </svg>

      {/* ── Scan line overlay ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60%) 2px, hsl(195 80% 60%) 3px)",
      }} />
    </div>
  );
}
