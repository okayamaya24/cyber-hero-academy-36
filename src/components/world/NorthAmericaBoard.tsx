import { useMemo } from "react";
import { motion } from "framer-motion";
import type { ZoneDef } from "@/data/continents";

/* ─── Board node positions as % of container (x, y) ─── */
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  "hq":              { x: 82, y: 72 },
  "password-peak":   { x: 72, y: 55 },
  "encrypt-enclave": { x: 58, y: 38 },
  "code-canyon":     { x: 42, y: 50 },
  "signal-summit":   { x: 30, y: 35 },
  "arctic-archive":  { x: 15, y: 18 },
  "pixel-port":      { x: 18, y: 65 },
  "shadow-station":  { x: 38, y: 82 },
  "boss-keybreaker": { x: 50, y: 14 },
};

/* ─── Connection path order ─── */
const PATH_ORDER = [
  "hq", "password-peak", "encrypt-enclave", "code-canyon",
  "signal-summit", "arctic-archive", "pixel-port", "shadow-station",
  "boss-keybreaker",
];

/* ─── Landmark decorations ─── */
const LANDMARKS = [
  { x: 75, y: 20, icon: "🏔️", label: "Rockies", size: 24 },
  { x: 90, y: 45, icon: "🗽", label: "", size: 20 },
  { x: 10, y: 42, icon: "🌲", label: "", size: 18 },
  { x: 55, y: 68, icon: "🌵", label: "", size: 18 },
  { x: 28, y: 58, icon: "🏜️", label: "", size: 16 },
  { x: 65, y: 85, icon: "🌴", label: "", size: 16 },
  { x: 48, y: 28, icon: "🦌", label: "", size: 14 },
  { x: 88, y: 82, icon: "⚡", label: "", size: 14 },
];

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
      const cpy = Math.min(prev.y, curr.y) - 5;
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
    <div className="relative w-full rounded-2xl overflow-hidden border border-[hsl(var(--primary)/0.15)]"
      style={{
        aspectRatio: "16/10",
        maxWidth: "960px",
        background: "radial-gradient(ellipse at 30% 35%, hsl(210 55% 18%), hsl(215 50% 10%) 60%, hsl(220 45% 6%))",
      }}>

      {/* ── Hex grid background ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
            <path d="M14 16 L28 24 L28 40 L14 48 L0 40 L0 24 Z" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      {/* ── Stylized continent silhouette ── */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" preserveAspectRatio="none">
        <path
          d="M45,2 L55,3 L65,5 L72,8 L78,5 L85,8 L88,14 L90,22 L88,30 L85,35 L82,42 L80,50 L78,55 L75,58 L72,60 L68,62 L65,60 L60,58 L55,62 L52,68 L48,72 L45,78 L42,82 L38,88 L35,92 L30,95 L25,92 L22,88 L20,82 L18,75 L15,68 L12,60 L10,52 L12,45 L15,38 L18,32 L20,28 L22,22 L25,18 L28,12 L32,8 L38,4 Z"
          fill="hsl(195 80% 50%)"
        />
      </svg>

      {/* ── Ambient glow spots ── */}
      <div className="absolute w-48 h-48 rounded-full blur-[80px] opacity-[0.08] pointer-events-none"
        style={{ background: "hsl(195 85% 50%)", top: "20%", left: "30%" }} />
      <div className="absolute w-36 h-36 rounded-full blur-[60px] opacity-[0.06] pointer-events-none"
        style={{ background: "hsl(160 65% 48%)", bottom: "25%", right: "20%" }} />
      <div className="absolute w-40 h-40 rounded-full blur-[70px] opacity-[0.05] pointer-events-none"
        style={{ background: "hsl(0 80% 50%)", top: "5%", left: "45%" }} />

      {/* ── Landmark decorations ── */}
      {LANDMARKS.map((lm, i) => (
        <div key={i} className="absolute pointer-events-none select-none opacity-30"
          style={{ left: `${lm.x}%`, top: `${lm.y}%`, fontSize: lm.size, transform: "translate(-50%, -50%)" }}>
          {lm.icon}
        </div>
      ))}

      {/* ── Route SVG overlay ── */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="routeGradLocked" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(210 30% 30%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(210 30% 25%)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="routeGradActive" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(195 85% 55%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(160 65% 50%)" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glowLine">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Locked base path */}
        <path d={routePath} fill="none" stroke="url(#routeGradLocked)" strokeWidth="0.6"
          strokeDasharray="1.5 1" strokeLinecap="round" />

        {/* Active/completed glow path */}
        {completedPathIndex >= 0 && (
          <path d={routePath} fill="none" stroke="url(#routeGradActive)" strokeWidth="0.8"
            strokeLinecap="round" filter="url(#glowLine)"
            strokeDasharray={`${(completedPathIndex + 1) * 12} 200`} />
        )}
      </svg>

      {/* ── Segment connection lines (HTML overlay for animation) ── */}
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
          const opacity = fromDone ? 0.7 : 0.2;
          const width = fromDone && toDone ? 0.7 : 0.4;

          const cpx = (from.x + to.x) / 2;
          const cpy = Math.min(from.y, to.y) - 5;

          return (
            <path key={`seg-${i}`}
              d={`M ${from.x} ${from.y} Q ${cpx} ${cpy}, ${to.x} ${to.y}`}
              fill="none" stroke={color} strokeWidth={width} strokeOpacity={opacity}
              strokeLinecap="round" strokeDasharray={fromDone ? "none" : "1 0.8"} />
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

        /* Node sizing */
        const nodeSize = zone.isHQ ? 56 : zone.isBoss ? 52 : 44;

        /* Colors */
        const bgColor = zone.isHQ
          ? "linear-gradient(135deg, hsl(45 90% 50%), hsl(35 95% 45%))"
          : zone.isBoss
            ? "linear-gradient(135deg, hsl(0 70% 45%), hsl(340 80% 40%))"
            : isCompleted
              ? "linear-gradient(135deg, hsl(160 65% 42%), hsl(145 70% 38%))"
              : isAvailable
                ? "linear-gradient(135deg, hsl(195 85% 48%), hsl(185 80% 42%))"
                : "linear-gradient(135deg, hsl(210 30% 22%), hsl(215 25% 18%))";

        const borderColor = zone.isHQ
          ? "hsl(45 90% 60%)"
          : zone.isBoss
            ? "hsl(0 80% 55%)"
            : isCompleted
              ? "hsl(160 65% 55%)"
              : isAvailable
                ? "hsl(195 85% 60%)"
                : "hsl(210 20% 30%)";

        const glowColor = zone.isHQ
          ? "0 0 20px hsl(45 90% 50% / 0.4), 0 0 40px hsl(45 90% 50% / 0.15)"
          : zone.isBoss
            ? "0 0 20px hsl(0 80% 50% / 0.4), 0 0 40px hsl(0 80% 50% / 0.15)"
            : isCompleted
              ? "0 0 16px hsl(160 65% 50% / 0.3)"
              : isAvailable
                ? "0 0 16px hsl(195 85% 55% / 0.35), 0 0 32px hsl(195 85% 55% / 0.1)"
                : "none";

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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 + 0.2, type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Pulse ring for available/HQ/boss */}
            {!isLocked && (
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: nodeSize + 16,
                  height: nodeSize + 16,
                  border: `2px solid ${borderColor}`,
                  opacity: 0,
                }}
                animate={{ opacity: [0, 0.4, 0], scale: [1, 1.4, 1.6] }}
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
                border: `3px solid ${borderColor}`,
                boxShadow: glowColor,
                cursor: isLocked ? "not-allowed" : "pointer",
                opacity: isLocked ? 0.4 : 1,
              }}
              whileHover={!isLocked ? { scale: 1.15 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
            >
              <span className="text-lg select-none" style={{ filter: isLocked ? "grayscale(1)" : "none" }}>
                {isLocked ? "🔒" : isCompleted ? "✅" : zone.icon}
              </span>

              {/* Inner ring highlight */}
              {!isLocked && (
                <div className="absolute inset-[3px] rounded-full border border-white/20 pointer-events-none" />
              )}
            </motion.button>

            {/* Label */}
            <div className="mt-1.5 text-center max-w-[90px]">
              <p className="text-[10px] md:text-xs font-bold leading-tight drop-shadow-lg"
                style={{
                  color: isLocked
                    ? "hsl(210 20% 45%)"
                    : zone.isBoss
                      ? "hsl(0 80% 70%)"
                      : zone.isHQ
                        ? "hsl(45 90% 70%)"
                        : "white",
                }}>
                {zone.name.replace(" — Cyber Hero Command", "")}
              </p>
              {!isLocked && (
                <p className="text-[8px] md:text-[9px] mt-0.5"
                  style={{ color: "hsl(195 60% 60% / 0.6)" }}>
                  {zone.city}
                </p>
              )}
            </div>

            {/* Deploy badge for available */}
            {isAvailable && !zone.isHQ && (
              <motion.div
                className="absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[7px] font-bold"
                style={{
                  background: "hsl(195 85% 50%)",
                  color: "white",
                  boxShadow: "0 2px 8px hsl(195 85% 50% / 0.4)",
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                GO!
              </motion.div>
            )}

            {/* HQ start badge */}
            {zone.isHQ && isAvailable && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-bold"
                style={{
                  background: "hsl(45 90% 50%)",
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

      {/* ── Boss fortress decoration ── */}
      <div className="absolute pointer-events-none select-none"
        style={{ left: "50%", top: "4%", transform: "translateX(-50%)" }}>
        <motion.div
          className="text-3xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          🏰
        </motion.div>
      </div>

      {/* ── Corner decorative circuit lines ── */}
      <svg className="absolute top-0 left-0 w-24 h-24 opacity-[0.08] pointer-events-none" viewBox="0 0 100 100">
        <path d="M0 20 L20 20 L20 0" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="1" />
        <path d="M0 40 L40 40 L40 0" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
        <circle cx="20" cy="20" r="2" fill="hsl(195 80% 60%)" />
      </svg>
      <svg className="absolute bottom-0 right-0 w-24 h-24 opacity-[0.08] pointer-events-none" viewBox="0 0 100 100">
        <path d="M100 80 L80 80 L80 100" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="1" />
        <path d="M100 60 L60 60 L60 100" fill="none" stroke="hsl(195 80% 60%)" strokeWidth="0.5" />
        <circle cx="80" cy="80" r="2" fill="hsl(195 80% 60%)" />
      </svg>
    </div>
  );
}
