import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Zap, Shield, MessageCircle, ChevronRight, Trophy, X, Globe, Radio, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  MISSIONS,
  getTotalGames,
  getMissionLevels,
  LEARNING_MODE_CONFIG,
  MINI_GAME_META,
  type LearningMode,
} from "@/data/missions";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { Button } from "@/components/ui/button";

const PROGRESSION_ORDER = [
  "password-safety",
  "encrypt-enclave",
  "safe-websites",
  "scam-detection",
  "personal-info",
  "malware-monsters",
  "smart-sharing",
  "phishy-messages",
  "malware-maze",
  "firewall-frontier",
  "dark-web-den",
] as const;

type CityNode = {
  id: string;
  name: string;
  city: string;
  icon: string;
  description: string;
  hue: number;
  x: number;
  y: number;
  isHub?: boolean;
};

/*
  Node positions use real geographic coordinates.
  Projection: x = (lon + 170) / 115 * 100
              y = (83 - lat) / 73 * 100
  This matches the WorldMapSVG viewBox="0 0 100 100" with preserveAspectRatio="none",
  so nodes snap to their correct positions on the land mass.
*/
const CITY_NODES: CityNode[] = [
  {
    id: "password-safety",
    name: "Password Peak",
    city: "New York, USA",
    icon: "🔑",
    description: "Forge unbreakable passwords at the summit!",
    hue: 195,
    x: 84, // 74°W, 40.7°N
    y: 58,
  },
  {
    id: "scam-detection",
    name: "Phish Lagoon",
    city: "San Francisco, USA",
    icon: "🎣",
    description: "Catch phishy scams before they catch you!",
    hue: 30,
    x: 41, // 122.5°W, 37.8°N
    y: 62,
  },
  {
    id: "safe-websites",
    name: "Browse Bazaar",
    city: "Chicago, USA",
    icon: "🌐",
    description: "Navigate the web marketplace safely!",
    hue: 175,
    x: 72, // 87.6°W, 41.9°N
    y: 56,
  },
  {
    id: "personal-info",
    name: "Privacy Palace",
    city: "Los Angeles, USA",
    icon: "🛡️",
    description: "Guard your secrets in the royal palace!",
    hue: 270,
    x: 45, // 118°W, 34°N
    y: 67,
  },
  {
    id: "malware-monsters",
    name: "Download Dungeon",
    city: "Denver, USA",
    icon: "⬇️",
    description: "Defeat malware lurking in the dungeon depths!",
    hue: 0,
    x: 57, // 104.9°W, 39.7°N
    y: 59,
  },
  {
    id: "smart-sharing",
    name: "Stranger Shore",
    city: "Miami, USA",
    icon: "🚷",
    description: "Learn who to trust on the mysterious shore!",
    hue: 45,
    x: 78, // 80°W, 25.8°N
    y: 78,
  },
  {
    id: "phishy-messages",
    name: "Kindness Kingdom",
    city: "Mexico City, Mexico",
    icon: "💖",
    description: "Spread kindness and fight cyberbullying!",
    hue: 330,
    x: 62, // 99.1°W, 19.4°N
    y: 87,
  },
  {
    id: "malware-maze",
    name: "Malware Maze",
    city: "Seattle, USA",
    icon: "🦠",
    description: "Navigate the maze of malicious software!",
    hue: 120,
    x: 42, // 122°W, 47.6°N
    y: 49,
  },
  {
    id: "firewall-frontier",
    name: "Firewall Frontier",
    city: "Montreal, Canada",
    icon: "🧱",
    description: "Build walls to keep threats out!",
    hue: 210,
    x: 84, // 73.6°W, 45.5°N
    y: 51,
  },
  {
    id: "dark-web-den",
    name: "Dark Web Den",
    city: "Vancouver, Canada",
    icon: "🕸️",
    description: "Shine light into the darkest corners!",
    hue: 280,
    x: 41, // 123°W, 49.3°N
    y: 46,
  },
  {
    id: "encrypt-enclave",
    name: "Encrypt Enclave",
    city: "Toronto, Canada",
    icon: "🔐",
    description: "Master the art of secret codes!",
    hue: 160,
    x: 79, // 79.4°W, 43.7°N
    y: 54,
  },
  {
    id: "cyberguard-academy",
    name: "Cyber Hero Command",
    city: "Washington D.C.",
    icon: "🏠",
    description: "Your home base — begin your mission here!",
    hue: 45,
    x: 81, // 77°W, 38.9°N
    y: 60,
    isHub: true,
  },
];

const CONNECTIONS: [number, number][] = [
  [11, 0],
  [11, 10],
  [11, 2],
  [0, 10],
  [10, 2],
  [2, 1],
  [1, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
];

type NodeStatus = "completed" | "unlocked" | "locked" | "gated";

function getStars(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const ratio = score / maxScore;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio > 0) return 1;
  return 0;
}

/* ─── North America SVG Map ─────────────────────────────────────────────── */
/*
  viewBox="0 0 100 100" + preserveAspectRatio="none" means SVG coords === %
  positions, so CITY_NODES x/y values map directly onto the land mass.

  Continent outline projection:
    x = (lon + 170) / 115 * 100   (lon in °W, positive)
    y = (83 - lat) / 73 * 100

  Path traces clockwise from S Mexico Pacific coast → up west coast →
  Alaska → Arctic → east coast → Gulf Coast → back to start.
*/
function WorldMapSVG() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="mapGlow" cx="45%" cy="45%" r="65%">
          <stop offset="0%" stopColor="hsl(210 60% 18%)" />
          <stop offset="100%" stopColor="hsl(220 50% 9%)" />
        </radialGradient>
        <filter id="landGlow" x="-4%" y="-4%" width="108%" height="108%">
          <feGaussianBlur stdDeviation="0.35" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="dotGrid" width="1.8" height="1.8" patternUnits="userSpaceOnUse">
          <circle cx="0.9" cy="0.9" r="0.07" fill="hsl(195 80% 60% / 0.15)" />
        </pattern>
        <linearGradient id="landGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210 40% 26%)" />
          <stop offset="100%" stopColor="hsl(215 35% 18%)" />
        </linearGradient>
        <radialGradient id="vig" cx="50%" cy="50%" r="70%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="hsl(220 50% 8% / 0.65)" />
        </radialGradient>
      </defs>

      {/* Ocean */}
      <rect width="100" height="100" fill="url(#mapGlow)" />
      <rect width="100" height="100" fill="url(#dotGrid)" />

      {/* Lat/lon reference grid */}
      {[20, 40, 60, 80].map((v) => (
        <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v}
          stroke="hsl(195 70% 55% / 0.05)" strokeWidth="0.06" strokeDasharray="0.5 1" />
      ))}
      {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
        <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100"
          stroke="hsl(195 70% 55% / 0.05)" strokeWidth="0.06" strokeDasharray="0.5 1" />
      ))}

      {/*
        North America continent outline — ~55 anchor points
        Selected geographic anchors (lon°W, lat°N → x, y):
          S Mexico Pacific   103°W  18°N  → 58, 89
          Baja CA tip        110°W  23°N  → 52, 82
          San Diego          117°W  32.5°N→ 46, 69
          LA                 118.5°W 34°N → 45, 67
          Point Conception   120.5°W 34.5°N→43, 66
          San Francisco      122.5°W 37.8°N→41, 62
          Cape Mendocino     124.4°W 40.4°N→40, 58
          Oregon coast       124.5°W 43°N  → 40, 55
          Columbia River     124°W  46.2°N → 40, 51
          Olympic Peninsula  124.7°W 47.9°N→ 39, 48
          Vancouver Island   123.4°W 48.4°N→ 41, 47
          BC coast           126°W  50.5°N → 38, 44
          Prince Rupert      130.3°W 54.3°N→ 35, 38
          Juneau             134.4°W 58.3°N→ 31, 33
          Yakutat            139.7°W 59.5°N→ 26, 31
          Kenai Peninsula    149.4°W 60.1°N→ 18, 31
          Kodiak area        152°W  57.5°N → 16, 35
          AK Peninsula tip   163°W  54.5°N →  6, 39
          Nome               165°W  64.5°N →  4, 25
          Seward Peninsula   168°W  65.5°N →  2, 24
          Barrow             156.5°W 71.4°N→ 12, 16
          North Slope        148°W  70.2°N → 19, 18
          Mackenzie Delta    136°W  69.4°N → 30, 19
          Banks Island       121°W  73°N   → 43, 14
          Ellesmere Island   87°W   83°N   → 72,  0
          Baffin N           73°W   73°N   → 84, 14
          Hudson Strait      63°W   63°N   → 93, 27
          Labrador           57°W   52°N   → 98, 43
          Nova Scotia        60°W   46°N   → 96, 51
          Gulf of Maine      70°W   43.5°N → 87, 53
          Cape Cod           70°W   42°N   → 87, 56
          New York           74°W   40.5°N → 84, 58
          Delaware           75.5°W 38.5°N → 82, 61
          Cape Hatteras      75.5°W 35.2°N → 82, 66
          Cape Fear          78°W   33.9°N → 80, 67
          Savannah           81°W   32°N   → 77, 70
          Jacksonville       81.5°W 30.5°N → 77, 72
          Cape Canaveral     80.6°W 28.5°N → 78, 75
          Miami              80.2°W 25.8°N → 78, 78
          Key West           81.8°W 24.6°N → 77, 80
          Tampa              82.5°W 27.8°N → 76, 75
          Pensacola          87.2°W 30.4°N → 72, 72
          New Orleans        90°W   29.9°N → 70, 73
          Galveston TX       94.8°W 29.3°N → 65, 74
          Corpus Christi     97.4°W 27.8°N → 63, 76
          Brownsville        97.5°W 26°N   → 63, 78
          Tampico            97.9°W 22.3°N → 63, 84
          Veracruz           96.1°W 19.2°N → 64, 87
          Tabasco/Campeche   91°W   18.8°N → 69, 88
          Yucatan coast      90°W   21°N   → 70, 85
          Tehuantepec Isth   94.6°W 16.3°N → 66, 91
          Oaxaca coast       96.7°W 15.9°N → 64, 92
          Acapulco           99.9°W 16.9°N → 61, 91
      */}
      <path
        d={`
          M 58,89
          L 52,82
          L 46,69 L 45,67 L 43,66
          L 41,62 L 40,58 L 40,55
          L 40,51 L 39,48 L 41,47
          L 38,44 L 35,38 L 31,33
          L 26,31 L 18,31 L 16,35
          L 6,39  L 4,25  L 2,24
          L 12,16 L 19,18 L 30,19
          L 43,14 L 72,0
          L 84,14 L 93,27 L 98,43
          L 96,51 L 87,53 L 87,56
          L 84,58 L 82,61
          L 82,66 L 80,67 L 77,70
          L 77,72 L 78,75 L 78,78
          L 77,80 L 76,75
          L 72,72 L 70,73 L 65,74
          L 63,76 L 63,78 L 63,84
          L 64,87 L 69,88 L 70,85
          L 66,91 L 64,92 L 61,91
          L 58,89 Z
        `}
        fill="url(#landGrad)"
        stroke="hsl(195 70% 50% / 0.5)"
        strokeWidth="0.15"
        strokeLinejoin="round"
        filter="url(#landGlow)"
      />

      {/* Country labels */}
      <text x="55" y="36" fontSize="1.2" fill="hsl(195 60% 55% / 0.35)"
        fontFamily="monospace" letterSpacing="0.4" textAnchor="middle">CANADA</text>
      <text x="62" y="64" fontSize="1.2" fill="hsl(195 60% 55% / 0.28)"
        fontFamily="monospace" letterSpacing="0.4" textAnchor="middle">UNITED STATES</text>
      <text x="58" y="83" fontSize="1.0" fill="hsl(195 60% 55% / 0.22)"
        fontFamily="monospace" letterSpacing="0.3" textAnchor="middle">MEXICO</text>

      {/* Vignette */}
      <rect width="100" height="100" fill="url(#vig)" />
    </svg>
  );
}

/* ─── Connection Paths ──────────────────────────────────────────────────── */
function MapConnections({ statuses, hqCompleted }: { statuses: NodeStatus[]; hqCompleted: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="connGlow">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {CONNECTIONS.map(([a, b], i) => {
        const from = CITY_NODES[a];
        const to = CITY_NODES[b];
        const isHQConn = from.isHub || to.isHub;
        const aStatus = from.isHub ? "unlocked" : statuses[a];
        const bStatus = to.isHub ? "unlocked" : statuses[b];
        const bothDone = aStatus === "completed" && bStatus === "completed";
        const anyUnlocked = aStatus !== "locked" && aStatus !== "gated" && bStatus !== "locked" && bStatus !== "gated";

        let stroke = "hsl(200 20% 50% / 0.07)";
        let strokeWidth = 0.2;
        let dashArr = "0.8 0.6";
        let filterAttr: string | undefined = undefined;

        if (bothDone) {
          stroke = "hsl(160 65% 55% / 0.7)";
          strokeWidth = 0.45;
          dashArr = "none";
          filterAttr = "url(#connGlow)";
        } else if (isHQConn) {
          stroke = hqCompleted ? "hsl(45 90% 55% / 0.5)" : "hsl(45 90% 55% / 0.2)";
          strokeWidth = 0.3;
          dashArr = "1.2 0.8";
        } else if (anyUnlocked) {
          stroke = "hsl(195 85% 60% / 0.35)";
          strokeWidth = 0.25;
          dashArr = "0.8 0.6";
        }

        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const off = len * 0.15;
        const cx = mx + (-dy / len) * off;
        const cy = my + (dx / len) * off;

        return (
          <path
            key={i}
            d={`M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArr}
            strokeLinecap="round"
            filter={filterAttr}
          />
        );
      })}
    </svg>
  );
}

/* ─── HUD ──────────────────────────────────────────────────────────────── */
function HUDBar({
  playerName,
  level,
  points,
  zonesSecured,
  totalZones,
}: {
  playerName: string;
  level: number;
  points: number;
  zonesSecured: number;
  totalZones: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.85)] px-4 py-2.5 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5 font-bold text-[hsl(195_80%_70%)]">
          <Globe className="h-3.5 w-3.5" />
          OPERATIVE: <span className="text-white">{playerName}</span>
        </span>
        <span className="hidden text-[hsl(195_80%_50%/0.3)] sm:inline">|</span>
        <span className="hidden items-center gap-1 text-[hsl(160_70%_60%)] sm:flex">
          <Zap className="h-3.5 w-3.5" />
          LVL {level} · {points} XP
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-[hsl(195_80%_70%)]">
          <Shield className="h-3.5 w-3.5" />
          ZONES:{" "}
          <span className="font-bold text-white">
            {zonesSecured}/{totalZones}
          </span>
        </span>
        <span className="rounded-full border border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.15)] px-2 py-0.5 text-[10px] font-bold text-[hsl(45_90%_65%)]">
          🛡️ GUARDIAN MODE
        </span>
      </div>
    </motion.div>
  );
}

const GUIDE_MESSAGES = {
  idle: [
    "Hey Guardian! Ready to protect the digital world? 🚀",
    "Every zone has secrets to discover! 🔍",
    "You're doing amazing, keep it up! 💪",
    "Tap the glowing zone to continue! 🎯",
  ],
  worldSelected: "Let's explore this zone! 🌟",
  worldLocked: "Finish the current zone to unlock the next one! 🔒",
  hqGated: "Complete HQ Orientation to unlock your first zone! 🏠",
  progress: "Great job! Keep going, hero! 🎉",
  hqComplete: "Amazing work, Guardian! Your first zone is now open! 🌟",
};

function GuideCharacter({
  avatarConfig,
  message,
  onTap,
}: {
  avatarConfig: Record<string, any> | null;
  message: string;
  onTap: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="fixed bottom-24 left-4 z-50 flex flex-col items-start gap-2 md:bottom-8 md:left-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-[220px] rounded-2xl rounded-bl-sm border border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.9)] px-3 py-2 shadow-lg backdrop-blur-md"
        >
          <p className="text-xs font-medium leading-snug text-white">{message}</p>
          <div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 border-b border-r border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.9)]" />
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={onTap}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.9)] shadow-[0_0_20px_hsl(195_85%_50%/0.3)]"
      >
        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
          <HeroAvatar avatarConfig={avatarConfig} size={36} fallbackEmoji="🦸" />
        </motion.div>
        <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(195_80%_55%)]">
          <MessageCircle className="h-3 w-3 text-white" />
        </div>
      </motion.button>
    </motion.div>
  );
}

/* ─── Detail Panel ─────────────────────────────────────────────────────── */
function WorldDetailPanel({
  world,
  mission,
  missionProgress,
  learningMode,
  age,
  onClose,
  onStartLevel,
}: {
  world: (typeof CITY_NODES)[number];
  mission: (typeof MISSIONS)[number] | undefined;
  missionProgress: any[];
  learningMode: LearningMode;
  age: number;
  onClose: () => void;
  onStartLevel: (missionId: string, levelIndex: number) => void;
}) {
  if (world.isHub) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(45_90%_55%/0.25)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(45_80%_30%)] text-2xl">
              🏠
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">CYBER HERO COMMAND // GLOBAL HQ</h2>
              <p className="text-xs text-[hsl(45_90%_65%)]">Your home base and training ground</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
              <X className="h-5 w-5 text-white/50" />
            </button>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-white/70">
            Welcome, Guardian! Complete your orientation mission to unlock your first cyber zone.
          </p>

          <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.08)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(45_80%_45%/0.2)] text-lg">
              🎯
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">OP: GUARDIAN ORIENTATION</p>
              <p className="text-[10px] text-white/40">Difficulty: ◆◇◇◇◇ · TUTORIAL</p>
              <p className="text-[10px] text-[hsl(45_90%_65%)]">+100 XP · Unlocks: Password Peak</p>
            </div>
          </div>

          <Button
            className="w-full border-0 bg-[hsl(45_90%_50%)] text-sm font-bold text-[hsl(210_40%_10%)] shadow-[0_0_20px_hsl(45_90%_50%/0.3)] hover:bg-[hsl(45_90%_45%)]"
            onClick={() => onStartLevel("password-safety", 0)}
          >
            🚀 BEGIN ORIENTATION
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (!mission) return null;

  const totalGames = getTotalGames(learningMode);
  const modeConfig = LEARNING_MODE_CONFIG[learningMode];
  const progressRow = missionProgress.find((p: any) => p.mission_id === mission.id);
  const completedGames = progressRow?.status === "completed" ? totalGames : (progressRow?.current_question ?? 0);
  const levels = getMissionLevels(mission, age, learningMode, completedGames);
  const STEP_LABELS = ["Mission 1", "Mission 2", "Boss Battle"];
  const STEP_ICONS = ["🎯", "⚔️", "🐉"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ background: `hsl(${world.hue} 70% 30%)` }}
          >
            {world.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{world.name}</h2>
            <p className="text-xs text-[hsl(195_60%_60%)]">
              {world.city} · {world.description}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <img src={mission.guide.image} alt={mission.guide.name} className="h-10 w-10 object-contain" />
          <div>
            <p className="text-xs font-bold text-white">{mission.guide.name}</p>
            <p className="text-[10px] text-white/50">Your guide for this zone</p>
          </div>
        </div>

        <div className="space-y-3">
          {levels.map((level, i) => {
            const levelStart = i * modeConfig.gamesPerLevel;
            const levelEnd = levelStart + modeConfig.gamesPerLevel;
            const levelCompleted = Math.min(Math.max(completedGames - levelStart, 0), modeConfig.gamesPerLevel);
            const levelDone = levelCompleted >= modeConfig.gamesPerLevel;
            const levelActive = completedGames >= levelStart && completedGames < levelEnd;
            const isLocked = level.locked;
            const isBoss = i === levels.length - 1;

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  levelDone
                    ? "border-[hsl(160_65%_50%/0.4)] bg-[hsl(160_65%_50%/0.1)]"
                    : levelActive
                      ? "border-[hsl(195_80%_50%/0.4)] bg-[hsl(195_80%_50%/0.1)]"
                      : isLocked
                        ? "border-white/5 bg-white/[0.03] opacity-50"
                        : "border-white/5 bg-white/[0.03]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
                    levelDone ? "bg-[hsl(160_65%_50%/0.2)]" : levelActive ? "bg-[hsl(195_80%_50%/0.2)]" : "bg-white/5"
                  }`}
                >
                  {isLocked ? <Lock className="h-4 w-4 text-white/30" /> : <span>{STEP_ICONS[i]}</span>}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{STEP_LABELS[i]}</p>
                    {isBoss && !isLocked && (
                      <span className="rounded-full bg-[hsl(0_80%_60%/0.2)] px-2 py-0.5 text-[9px] font-bold text-[hsl(0_80%_70%)]">
                        BOSS
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40">
                    {level.name} · {levelCompleted}/{modeConfig.gamesPerLevel} games
                  </p>
                  <div className="mt-1 flex gap-1">
                    {level.miniGameTypes.slice(0, 3).map((type, j) => (
                      <span key={j} className="text-[10px]" title={MINI_GAME_META[type].label}>
                        {MINI_GAME_META[type].emoji}
                      </span>
                    ))}
                  </div>
                </div>

                {levelDone ? (
                  <div className="flex items-center gap-1 text-[hsl(160_65%_55%)]">
                    <Trophy className="h-4 w-4" />
                    <span className="text-xs font-bold">Done</span>
                  </div>
                ) : levelActive ? (
                  <Button
                    size="sm"
                    className="border-0 bg-[hsl(195_80%_50%)] text-xs text-white hover:bg-[hsl(195_80%_45%)]"
                    onClick={() => onStartLevel(mission.id, i)}
                  >
                    {completedGames > 0 ? "Continue" : isBoss ? "Fight!" : "Deploy"}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-white/20" />
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-white/40">
          <span>
            {completedGames}/{totalGames} games completed
          </span>
          {progressRow?.status === "completed" && (
            <span className="flex items-center gap-1 font-bold text-[hsl(160_65%_55%)]">
              <Trophy className="h-3.5 w-3.5" /> Zone Secured!
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function MissionWorldMap() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [guideMessage, setGuideMessage] = useState(GUIDE_MESSAGES.idle[0]);
  const [idleIndex, setIdleIndex] = useState(0);
  const [selectedWorld, setSelectedWorld] = useState<(typeof CITY_NODES)[number] | null>(null);
  const [hasClickedHQ, setHasClickedHQ] = useState(() => {
    return localStorage.getItem("cyber_hero_hq_clicked") === "true";
  });

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
  }, [user, activeChildId, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("mission_progress").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const hqCompleted = !!(child as any)?.hq_completed;
  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const level = child?.level ?? 1;
  const points = child?.points ?? 0;
  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const hasAvatar = !!avatarConfig?.heroSrc;
  const age = child?.age ?? 7;
  const playerName = child?.name ?? "Guardian";

  useEffect(() => {
    if (child && !hasAvatar) navigate("/edit-avatar");
  }, [child, hasAvatar, navigate]);

  const missionIds = new Set(MISSIONS.map((m) => m.id));

  const nodeStatuses = useMemo(() => {
    const expectedTotal = getTotalGames(learningMode);

    return CITY_NODES.map((node) => {
      if (node.isHub) return { status: "unlocked" as const, stars: 0 };

      if (!missionIds.has(node.id)) return { status: "locked" as const, stars: 0 };

      if (!hqCompleted) {
        if (node.id === PROGRESSION_ORDER[0]) return { status: "gated" as const, stars: 0 };
        return { status: "locked" as const, stars: 0 };
      }

      const progress = missionProgress.find(
        (p: any) => p.mission_id === node.id && (p.max_score ?? expectedTotal) === expectedTotal,
      );

      if (progress?.status === "completed") {
        return {
          status: "completed" as const,
          stars: getStars(progress.score ?? expectedTotal, progress.max_score ?? expectedTotal),
        };
      }

      const currentIndex = PROGRESSION_ORDER.indexOf(node.id as (typeof PROGRESSION_ORDER)[number]);
      if (currentIndex === -1) return { status: "locked" as const, stars: 0 };
      if (currentIndex === 0) return { status: "unlocked" as const, stars: 0 };

      const previousMissionId = PROGRESSION_ORDER[currentIndex - 1];
      const previousCompleted = missionProgress.some(
        (p: any) => p.mission_id === previousMissionId && p.status === "completed",
      );

      return { status: previousCompleted ? ("unlocked" as const) : ("locked" as const), stars: 0 };
    });
  }, [missionProgress, learningMode, hqCompleted, missionIds]);

  const completedCount = nodeStatuses.filter((n) => n.status === "completed").length;
  const totalPlayable = CITY_NODES.filter((n) => !n.isHub && missionIds.has(n.id)).length;

  useEffect(() => {
    if (!hqCompleted) {
      setGuideMessage("Hey Guardian! Start at HQ to begin your journey! 🏠");
    } else if (completedCount > 0 && completedCount < totalPlayable) {
      setGuideMessage(GUIDE_MESSAGES.progress);
    }
  }, [completedCount, totalPlayable, hqCompleted]);

  const cycleIdleMessage = useCallback(() => {
    const next = (idleIndex + 1) % GUIDE_MESSAGES.idle.length;
    setIdleIndex(next);
    setGuideMessage(GUIDE_MESSAGES.idle[next]);
  }, [idleIndex]);

  const handleNodeClick = (node: (typeof CITY_NODES)[number], index: number) => {
    if (node.isHub) {
      if (!hasClickedHQ) {
        setHasClickedHQ(true);
        localStorage.setItem("cyber_hero_hq_clicked", "true");
      }
      setGuideMessage("Welcome to HQ, Guardian! 🏠");
      setSelectedWorld(node);
      return;
    }

    const { status } = nodeStatuses[index];
    if (status === "gated") { setGuideMessage(GUIDE_MESSAGES.hqGated); return; }
    if (status === "locked") { setGuideMessage(GUIDE_MESSAGES.worldLocked); return; }
    setGuideMessage(GUIDE_MESSAGES.worldSelected);
    setSelectedWorld(node);
  };

  const handleHQComplete = async () => {
    if (!activeChildId) return;
    await supabase.from("child_profiles").update({ hq_completed: true } as any).eq("id", activeChildId);
    queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
    setSelectedWorld(null);
    setGuideMessage(GUIDE_MESSAGES.hqComplete);
  };

  const handleStartLevel = (missionId: string, _levelIndex: number) => {
    if (selectedWorld?.isHub) {
      void handleHQComplete();
      navigate(`/missions?mission=${missionId}`);
      return;
    }
    setSelectedWorld(null);
    navigate(`/missions?mission=${missionId}`);
  };

  const selectedMission = selectedWorld ? MISSIONS.find((m) => m.id === selectedWorld.id) : undefined;

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 pt-20"
      style={{ background: "linear-gradient(160deg, hsl(220 45% 10%), hsl(210 50% 14%), hsl(200 40% 12%))" }}
    >
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 0.5,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.05,
            }}
            animate={{ opacity: [0.05, 0.4, 0.05] }}
            transition={{ repeat: Infinity, duration: Math.random() * 4 + 2, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/world-select")}
              className="w-fit rounded-full border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.65)] text-white hover:bg-[hsl(210_40%_18%/0.9)]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to World Select
            </Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                🌎 North America — <span className="text-[hsl(45_90%_65%)]">The Keybreaker&apos;s Domain</span>
              </h1>
              <p className="mt-1 text-sm text-[hsl(195_60%_70%/0.8)]">Finish each zone to unlock the next one.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(0_80%_60%/0.2)] bg-[hsl(210_40%_14%/0.75)] px-4 py-3 text-sm text-white/80 shadow-lg">
            <p className="font-bold text-[hsl(0_80%_70%)]">⚠ Villain Signal Detected</p>
            <p className="mt-1 text-xs text-white/60">"You&apos;ll never secure my network chaos!" — The Keybreaker</p>
          </div>
        </div>

        <HUDBar playerName={playerName} level={level} points={points} zonesSecured={completedCount} totalZones={totalPlayable} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-3 text-center"
        >
          <p className="text-xs font-medium text-[hsl(45_90%_65%/0.7)]">
            🏆 Secure all zones to earn your Cyber Guardian Certificate!
          </p>
        </motion.div>

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative mx-auto w-full"
          style={{ aspectRatio: "16/9", maxWidth: "960px" }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-[hsl(195_80%_50%/0.2)] shadow-[0_0_60px_hsl(210_60%_15%/0.8),inset_0_0_40px_hsl(210_50%_10%/0.5)]">
            <WorldMapSVG />
            {/* Corner brackets */}
            <div className="absolute left-3 top-3 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-[hsl(195_80%_50%/0.4)]" />
            <div className="absolute right-3 top-3 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-[hsl(195_80%_50%/0.4)]" />
            <div className="absolute bottom-3 left-3 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-[hsl(195_80%_50%/0.4)]" />
            <div className="absolute bottom-3 right-3 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-[hsl(195_80%_50%/0.4)]" />
          </div>

          <MapConnections statuses={nodeStatuses.map((n) => n.status)} hqCompleted={hqCompleted} />

          {CITY_NODES.map((node, index) => {
            if (node.isHub) {
              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 220 }}
                  className="absolute z-20"
                  style={{ top: `${node.y}%`, left: `${node.x}%`, transform: "translate(-50%, -50%)" }}
                >
                  {!hqCompleted && !hasClickedHQ && (
                    <motion.div
                      animate={{ x: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute -right-32 top-1/2 z-30 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap"
                    >
                      <span className="text-lg text-[hsl(45_90%_60%)]">→</span>
                      <span className="rounded-full border border-[hsl(45_90%_55%/0.4)] bg-[hsl(45_90%_55%/0.2)] px-2.5 py-1 text-[10px] font-bold text-[hsl(45_90%_70%)]">
                        Start here!
                      </span>
                    </motion.div>
                  )}
                  <motion.button
                    onClick={() => handleNodeClick(node, index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex cursor-pointer flex-col items-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 3.5 }}
                      className="absolute -inset-4 rounded-full border-2 border-[hsl(45_90%_55%/0.5)]"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.25, 0, 0.25] }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                      className="absolute -inset-2 rounded-full border border-[hsl(45_90%_55%/0.3)]"
                    />
                    <div
                      className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(45_90%_55%/0.7)] shadow-[0_0_32px_hsl(45_90%_55%/0.4)] backdrop-blur-md md:h-[68px] md:w-[68px]"
                      style={{ background: "radial-gradient(circle, hsl(45 85% 45% / 0.35), hsl(35 50% 18% / 0.9))" }}
                    >
                      <span className="text-2xl drop-shadow-md md:text-3xl">🏠</span>
                    </div>
                    <div className="mt-1.5 rounded-full border border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.15)] px-2.5 py-0.5 backdrop-blur-sm">
                      <p className="whitespace-nowrap text-[8px] font-bold tracking-wide text-[hsl(45_90%_75%)] md:text-[10px]">
                        HQ — Cyber Hero Command
                      </p>
                    </div>
                    <p className="mt-0.5 whitespace-nowrap text-[6px] text-[hsl(45_90%_60%/0.6)] md:text-[8px]">
                      {node.city}
                    </p>
                  </motion.button>
                </motion.div>
              );
            }

            const { status, stars } = nodeStatuses[index];
            const isGated = status === "gated";
            const isClickable = status !== "locked" && status !== "gated";
            const hasMission = missionIds.has(node.id);
            const isCurrentTarget = status === "unlocked" && hasMission;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + index * 0.05, type: "spring", stiffness: 200 }}
                className="absolute z-10"
                style={{ top: `${node.y}%`, left: `${node.x}%`, transform: "translate(-50%, -50%)" }}
              >
                <motion.button
                  onClick={() => handleNodeClick(node, index)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.15 } : {}}
                  whileTap={isClickable ? { scale: 0.92 } : {}}
                  className={`group relative flex flex-col items-center transition-all ${
                    status === "locked"
                      ? "cursor-not-allowed opacity-25"
                      : isGated
                        ? "cursor-not-allowed opacity-45"
                        : "cursor-pointer"
                  }`}
                >
                  {isCurrentTarget && (
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -inset-2.5 rounded-full border border-[hsl(195_80%_50%/0.6)]"
                    />
                  )}
                  {isGated && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.65, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="absolute -inset-1.5 rounded-full border border-[hsl(45_90%_55%/0.45)]"
                    />
                  )}

                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-base shadow-lg transition-all duration-200 md:h-11 md:w-11 md:text-lg ${
                      status === "completed"
                        ? "border-[hsl(160_65%_50%/0.7)] shadow-[0_0_20px_hsl(160_65%_50%/0.4)]"
                        : status === "unlocked"
                          ? `border-[hsl(${node.hue}_70%_55%/0.7)] shadow-[0_0_18px_hsl(${node.hue}_70%_55%/0.3)]`
                          : isGated
                            ? "border-[hsl(45_90%_55%/0.35)]"
                            : "border-white/10"
                    } ${isCurrentTarget ? "scale-110 ring-4 ring-[hsl(195_80%_50%/0.35)]" : ""}`}
                    style={{
                      background:
                        status === "locked"
                          ? "hsl(220 30% 16%)"
                          : isGated
                            ? "hsl(35 28% 16%)"
                            : `radial-gradient(circle at 35% 35%, hsl(${node.hue} 65% 38%), hsl(${node.hue} 50% 18%))`,
                    }}
                  >
                    {status === "locked" || isGated ? (
                      <Lock className={`h-3.5 w-3.5 ${isGated ? "text-[hsl(45_90%_55%/0.5)]" : "text-white/25"}`} />
                    ) : status === "completed" ? (
                      <span className="text-sm">✅</span>
                    ) : (
                      <span className="drop-shadow-sm">{node.icon}</span>
                    )}
                    {(status === "unlocked" || status === "completed") && (
                      <div className="absolute left-2 top-1 h-1 w-2 rotate-[-30deg] rounded-full bg-white/25" />
                    )}
                  </div>

                  {status === "completed" && stars > 0 && (
                    <div className="mt-0.5 flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-2.5 w-2.5 ${
                            s <= stars ? "fill-[hsl(45_90%_60%)] text-[hsl(45_90%_60%)]" : "text-white/15"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <div
                    className={`mt-1 max-w-[80px] rounded-md px-1.5 py-0.5 backdrop-blur-sm ${
                      status === "locked" || isGated ? "bg-black/20" : "bg-[hsl(210_40%_12%/0.85)]"
                    }`}
                  >
                    <p
                      className={`text-center text-[7px] font-bold leading-tight tracking-wide md:text-[9px] ${
                        status === "locked"
                          ? "text-white/20"
                          : isGated
                            ? "text-[hsl(45_90%_55%/0.45)]"
                            : "text-white/85"
                      }`}
                    >
                      {node.name}
                    </p>
                    <p
                      className={`text-center text-[5px] leading-tight md:text-[6px] ${
                        status === "locked" || isGated ? "text-white/10" : "text-white/35"
                      }`}
                    >
                      {node.city}
                    </p>
                  </div>

                  {isCurrentTarget && (
                    <motion.span
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="mt-0.5 text-[7px] font-bold tracking-widest text-[hsl(195_80%_65%)] md:text-[8px]"
                    >
                      🚀 START HERE
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)] shadow-[0_0_6px_hsl(45_90%_55%/0.5)]" />⭐ HQ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[hsl(195_80%_50%)]" />🔵 Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(160_65%_50%)]" />🟢 Secured
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-white/10 bg-white/10" />⚫ Locked
          </span>
          <span className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-[hsl(45_90%_60%)]" />📶 Coming Soon
          </span>
        </motion.div>
      </div>

      <GuideCharacter avatarConfig={avatarConfig} message={guideMessage} onTap={cycleIdleMessage} />

      <AnimatePresence>
        {selectedWorld && (
          <WorldDetailPanel
            world={selectedWorld}
            mission={selectedMission}
            missionProgress={missionProgress}
            learningMode={learningMode}
            age={age}
            onClose={() => setSelectedWorld(null)}
            onStartLevel={handleStartLevel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

**What changed, everything else is identical:**

1. **`CITY_NODES` x/y** — all 12 nodes repositioned to real lat/lon using `x=(lon+170)/115*100`, `y=(83-lat)/73*100`. Seattle/Vancouver are now top-left, NY/Montreal top-right, Miami bottom-right, Mexico City bottom-center, etc.

2. **`WorldMapSVG`** — replaced the old disconnected shape blobs with a single `<path>` tracing ~55 real geographic anchor points (west coast → Alaska → Arctic → east coast → Gulf → Mexico → back). `viewBox="0 0 100 100"` + `preserveAspectRatio="none"` means SVG coordinates equal container percentages, so nodes land exactly on their cities.    description: "Navigate the web marketplace safely!",
    hue: 175,
    x: 48,
    y: 34,
  },
  {
    id: "personal-info",
    name: "Privacy Palace",
    city: "Los Angeles, USA",
    icon: "🛡️",
    description: "Guard your secrets in the royal palace!",
    hue: 270,
    x: 12,
    y: 54,
  },
  {
    id: "malware-monsters",
    name: "Download Dungeon",
    city: "Denver, USA",
    icon: "⬇️",
    description: "Defeat malware lurking in the dungeon depths!",
    hue: 0,
    x: 28,
    y: 40,
  },
  {
    id: "smart-sharing",
    name: "Stranger Shore",
    city: "Miami, USA",
    icon: "🚷",
    description: "Learn who to trust on the mysterious shore!",
    hue: 45,
    x: 56,
    y: 57,
  },
  {
    id: "phishy-messages",
    name: "Kindness Kingdom",
    city: "Mexico City, Mexico",
    icon: "💖",
    description: "Spread kindness and fight cyberbullying!",
    hue: 330,
    x: 32,
    y: 68,
  },
  {
    id: "malware-maze",
    name: "Malware Maze",
    city: "Seattle, USA",
    icon: "🦠",
    description: "Navigate the maze of malicious software!",
    hue: 120,
    x: 12,
    y: 32,
  },
  {
    id: "firewall-frontier",
    name: "Firewall Frontier",
    city: "Montreal, Canada",
    icon: "🧱",
    description: "Build walls to keep threats out!",
    hue: 210,
    x: 62,
    y: 18,
  },
  {
    id: "dark-web-den",
    name: "Dark Web Den",
    city: "Vancouver, Canada",
    icon: "🕸️",
    description: "Shine light into the darkest corners!",
    hue: 280,
    x: 13,
    y: 18,
  },
  {
    id: "encrypt-enclave",
    name: "Encrypt Enclave",
    city: "Toronto, Canada",
    icon: "🔐",
    description: "Master the art of secret codes!",
    hue: 160,
    x: 52,
    y: 22,
  },
  {
    id: "cyberguard-academy",
    name: "Cyber Hero Command",
    city: "Washington D.C.",
    icon: "🏠",
    description: "Your home base — begin your mission here!",
    hue: 45,
    x: 63,
    y: 39,
    isHub: true,
  },
];

const CONNECTIONS: [number, number][] = [
  [11, 0],
  [11, 10],
  [11, 2],
  [0, 10],
  [10, 2],
  [2, 1],
  [1, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
];

type NodeStatus = "completed" | "unlocked" | "locked" | "gated";

function getStars(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const ratio = score / maxScore;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio > 0) return 1;
  return 0;
}

/* ─── North America SVG Map ─────────────────────────────────────────────── */
function WorldMapSVG() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 500"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="mapGlow" cx="45%" cy="45%" r="65%">
          <stop offset="0%" stopColor="hsl(210 60% 18%)" />
          <stop offset="100%" stopColor="hsl(220 50% 9%)" />
        </radialGradient>
        <filter id="landGlow" x="-4%" y="-4%" width="108%" height="108%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="dotGrid" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="0.7" fill="hsl(195 80% 60% / 0.1)" />
        </pattern>
        <linearGradient id="northGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210 40% 26%)" />
          <stop offset="100%" stopColor="hsl(215 35% 20%)" />
        </linearGradient>
        <linearGradient id="usaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(212 38% 24%)" />
          <stop offset="100%" stopColor="hsl(218 32% 18%)" />
        </linearGradient>
        <linearGradient id="mexicoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(215 35% 22%)" />
          <stop offset="100%" stopColor="hsl(220 30% 16%)" />
        </linearGradient>
        <radialGradient id="vig" cx="50%" cy="50%" r="70%">
          <stop offset="55%" stopColor="transparent" />
          <stop offset="100%" stopColor="hsl(220 50% 8% / 0.65)" />
        </radialGradient>
      </defs>

      <rect width="1000" height="500" fill="url(#mapGlow)" />
      <rect width="1000" height="500" fill="url(#dotGrid)" />

      {[100, 200, 300, 400].map((y) => (
        <line
          key={`h${y}`}
          x1="0"
          y1={y}
          x2="1000"
          y2={y}
          stroke="hsl(195 70% 55% / 0.05)"
          strokeWidth="0.6"
          strokeDasharray="5 10"
        />
      ))}
      {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="500"
          stroke="hsl(195 70% 55% / 0.05)"
          strokeWidth="0.6"
          strokeDasharray="5 10"
        />
      ))}

      <path
        d={`
          M 60,5  L 160,0  L 280,8  L 380,5  L 480,10  L 580,8
          L 660,15 L 720,20 L 750,35 L 730,50 L 700,55  L 660,52
          L 620,58 L 580,55 L 540,60 L 500,58 L 460,62 L 420,60
          L 380,58 L 340,65 L 300,62 L 260,68 L 220,65 L 180,60
          L 150,65 L 120,60 L 90,55  L 65,48  L 50,38  L 45,25 Z
        `}
        fill="url(#northGrad)"
        stroke="hsl(195 70% 45% / 0.4)"
        strokeWidth="1"
        strokeLinejoin="round"
        filter="url(#landGlow)"
      />

      <path
        d={`M 500,18 L 560,22 L 600,35 L 595,52 L 565,58 L 530,55 L 505,48 L 492,35 Z`}
        fill="hsl(215 55% 12%)"
        stroke="hsl(195 70% 45% / 0.2)"
        strokeWidth="0.6"
      />

      <ellipse cx="595" cy="62" rx="20" ry="6" fill="hsl(215 55% 13%)" opacity="0.8" />
      <ellipse cx="560" cy="65" rx="12" ry="4" fill="hsl(215 55% 13%)" opacity="0.8" />

      <path
        d={`
          M 65,48   L 90,55   L 120,60  L 150,65  L 180,60
          L 220,65  L 260,68  L 300,62  L 340,65  L 380,58
          L 420,60  L 460,62  L 500,58  L 540,60  L 580,55
          L 620,58  L 660,52  L 680,60  L 690,75  L 685,95
          L 670,115 L 650,130 L 640,148 L 620,158 L 580,162
          L 540,165 L 500,168 L 460,165 L 420,162 L 380,165
          L 340,162 L 300,165 L 260,162 L 220,155 L 190,145
          L 160,132 L 130,118 L 105,100 L 85,80   L 70,65 Z
        `}
        fill="url(#usaGrad)"
        stroke="hsl(195 70% 45% / 0.4)"
        strokeWidth="1"
        strokeLinejoin="round"
        filter="url(#landGlow)"
      />

      <path
        d={`M 620,158 L 635,170 L 630,190 L 615,200 L 600,188 L 595,172 L 610,162 Z`}
        fill="url(#usaGrad)"
        stroke="hsl(195 70% 45% / 0.35)"
        strokeWidth="0.8"
      />

      <path
        d={`M 25,55 L 60,50 L 75,62 L 72,80 L 55,88 L 30,85 L 18,72 Z`}
        fill="url(#northGrad)"
        stroke="hsl(195 70% 45% / 0.35)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      <path
        d={`
          M 190,145 L 220,155 L 260,162 L 300,165 L 340,162
          L 370,168 L 380,182 L 375,200 L 360,218 L 340,232
          L 315,245 L 290,252 L 268,245 L 250,230 L 240,212
          L 235,195 L 240,178 L 230,165 L 210,158 L 190,148 Z
        `}
        fill="url(#mexicoGrad)"
        stroke="hsl(195 70% 45% / 0.35)"
        strokeWidth="0.8"
        strokeLinejoin="round"
        filter="url(#landGlow)"
      />

      <path
        d={`M 760,0 L 840,0 L 870,18 L 860,35 L 835,42 L 800,38 L 772,25 Z`}
        fill="hsl(210 35% 20%)"
        stroke="hsl(195 70% 45% / 0.25)"
        strokeWidth="0.7"
      />

      <circle cx="660" cy="195" r="4" fill="hsl(210 35% 22%)" stroke="hsl(195 70% 45% / 0.25)" strokeWidth="0.5" />
      <circle cx="675" cy="205" r="3" fill="hsl(210 35% 22%)" stroke="hsl(195 70% 45% / 0.25)" strokeWidth="0.5" />
      <circle cx="690" cy="200" r="3.5" fill="hsl(210 35% 22%)" stroke="hsl(195 70% 45% / 0.25)" strokeWidth="0.5" />

      <text
        x="200"
        y="38"
        fontSize="9"
        fill="hsl(195 60% 55% / 0.3)"
        fontFamily="monospace"
        letterSpacing="3"
        textAnchor="middle"
      >
        CANADA
      </text>
      <text
        x="380"
        y="120"
        fontSize="9"
        fill="hsl(195 60% 55% / 0.25)"
        fontFamily="monospace"
        letterSpacing="3"
        textAnchor="middle"
      >
        UNITED STATES
      </text>
      <text
        x="295"
        y="215"
        fontSize="7.5"
        fill="hsl(195 60% 55% / 0.22)"
        fontFamily="monospace"
        letterSpacing="2"
        textAnchor="middle"
      >
        MEXICO
      </text>

      <rect width="1000" height="500" fill="url(#vig)" />
    </svg>
  );
}

/* ─── Connection Paths ──────────────────────────────────────────────────── */
function MapConnections({ statuses, hqCompleted }: { statuses: NodeStatus[]; hqCompleted: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="connGlow">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {CONNECTIONS.map(([a, b], i) => {
        const from = CITY_NODES[a];
        const to = CITY_NODES[b];
        const isHQConn = from.isHub || to.isHub;
        const aStatus = from.isHub ? "unlocked" : statuses[a];
        const bStatus = to.isHub ? "unlocked" : statuses[b];
        const bothDone = aStatus === "completed" && bStatus === "completed";
        const anyUnlocked = aStatus !== "locked" && aStatus !== "gated" && bStatus !== "locked" && bStatus !== "gated";

        let stroke = "hsl(200 20% 50% / 0.07)";
        let strokeWidth = 0.2;
        let dashArr = "0.8 0.6";
        let filterAttr: string | undefined = undefined;

        if (bothDone) {
          stroke = "hsl(160 65% 55% / 0.7)";
          strokeWidth = 0.45;
          dashArr = "none";
          filterAttr = "url(#connGlow)";
        } else if (isHQConn) {
          stroke = hqCompleted ? "hsl(45 90% 55% / 0.5)" : "hsl(45 90% 55% / 0.2)";
          strokeWidth = 0.3;
          dashArr = "1.2 0.8";
        } else if (anyUnlocked) {
          stroke = "hsl(195 85% 60% / 0.35)";
          strokeWidth = 0.25;
          dashArr = "0.8 0.6";
        }

        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const off = len * 0.15;
        const cx = mx + (-dy / len) * off;
        const cy = my + (dx / len) * off;

        return (
          <path
            key={i}
            d={`M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArr}
            strokeLinecap="round"
            filter={filterAttr}
          />
        );
      })}
    </svg>
  );
}

/* ─── HUD ──────────────────────────────────────────────────────────────── */
function HUDBar({
  playerName,
  level,
  points,
  zonesSecured,
  totalZones,
}: {
  playerName: string;
  level: number;
  points: number;
  zonesSecured: number;
  totalZones: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.85)] px-4 py-2.5 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5 font-bold text-[hsl(195_80%_70%)]">
          <Globe className="h-3.5 w-3.5" />
          OPERATIVE: <span className="text-white">{playerName}</span>
        </span>
        <span className="hidden text-[hsl(195_80%_50%/0.3)] sm:inline">|</span>
        <span className="hidden items-center gap-1 text-[hsl(160_70%_60%)] sm:flex">
          <Zap className="h-3.5 w-3.5" />
          LVL {level} · {points} XP
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-[hsl(195_80%_70%)]">
          <Shield className="h-3.5 w-3.5" />
          ZONES:{" "}
          <span className="font-bold text-white">
            {zonesSecured}/{totalZones}
          </span>
        </span>
        <span className="rounded-full border border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.15)] px-2 py-0.5 text-[10px] font-bold text-[hsl(45_90%_65%)]">
          🛡️ GUARDIAN MODE
        </span>
      </div>
    </motion.div>
  );
}

const GUIDE_MESSAGES = {
  idle: [
    "Hey Guardian! Ready to protect the digital world? 🚀",
    "Every zone has secrets to discover! 🔍",
    "You're doing amazing, keep it up! 💪",
    "Tap the glowing zone to continue! 🎯",
  ],
  worldSelected: "Let's explore this zone! 🌟",
  worldLocked: "Finish the current zone to unlock the next one! 🔒",
  hqGated: "Complete HQ Orientation to unlock your first zone! 🏠",
  progress: "Great job! Keep going, hero! 🎉",
  hqComplete: "Amazing work, Guardian! Your first zone is now open! 🌟",
};

function GuideCharacter({
  avatarConfig,
  message,
  onTap,
}: {
  avatarConfig: Record<string, any> | null;
  message: string;
  onTap: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="fixed bottom-24 left-4 z-50 flex flex-col items-start gap-2 md:bottom-8 md:left-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-[220px] rounded-2xl rounded-bl-sm border border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.9)] px-3 py-2 shadow-lg backdrop-blur-md"
        >
          <p className="text-xs font-medium leading-snug text-white">{message}</p>
          <div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 border-b border-r border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.9)]" />
        </motion.div>
      </AnimatePresence>

      <motion.button
        onClick={onTap}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.9)] shadow-[0_0_20px_hsl(195_85%_50%/0.3)]"
      >
        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
          <HeroAvatar avatarConfig={avatarConfig} size={36} fallbackEmoji="🦸" />
        </motion.div>
        <div className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(195_80%_55%)]">
          <MessageCircle className="h-3 w-3 text-white" />
        </div>
      </motion.button>
    </motion.div>
  );
}

/* ─── Detail Panel ─────────────────────────────────────────────────────── */
function WorldDetailPanel({
  world,
  mission,
  missionProgress,
  learningMode,
  age,
  onClose,
  onStartLevel,
}: {
  world: (typeof CITY_NODES)[number];
  mission: (typeof MISSIONS)[number] | undefined;
  missionProgress: any[];
  learningMode: LearningMode;
  age: number;
  onClose: () => void;
  onStartLevel: (missionId: string, levelIndex: number) => void;
}) {
  if (world.isHub) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(45_90%_55%/0.25)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(45_80%_30%)] text-2xl">
              🏠
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">CYBER HERO COMMAND // GLOBAL HQ</h2>
              <p className="text-xs text-[hsl(45_90%_65%)]">Your home base and training ground</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
              <X className="h-5 w-5 text-white/50" />
            </button>
          </div>

          <p className="mb-5 text-sm leading-relaxed text-white/70">
            Welcome, Guardian! Complete your orientation mission to unlock your first cyber zone.
          </p>

          <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.08)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(45_80%_45%/0.2)] text-lg">
              🎯
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">OP: GUARDIAN ORIENTATION</p>
              <p className="text-[10px] text-white/40">Difficulty: ◆◇◇◇◇ · TUTORIAL</p>
              <p className="text-[10px] text-[hsl(45_90%_65%)]">+100 XP · Unlocks: Password Peak</p>
            </div>
          </div>

          <Button
            className="w-full border-0 bg-[hsl(45_90%_50%)] text-sm font-bold text-[hsl(210_40%_10%)] shadow-[0_0_20px_hsl(45_90%_50%/0.3)] hover:bg-[hsl(45_90%_45%)]"
            onClick={() => onStartLevel("password-safety", 0)}
          >
            🚀 BEGIN ORIENTATION
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (!mission) return null;

  const totalGames = getTotalGames(learningMode);
  const modeConfig = LEARNING_MODE_CONFIG[learningMode];
  const progressRow = missionProgress.find((p: any) => p.mission_id === mission.id);
  const completedGames = progressRow?.status === "completed" ? totalGames : (progressRow?.current_question ?? 0);
  const levels = getMissionLevels(mission, age, learningMode, completedGames);
  const STEP_LABELS = ["Mission 1", "Mission 2", "Boss Battle"];
  const STEP_ICONS = ["🎯", "⚔️", "🐉"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ background: `hsl(${world.hue} 70% 30%)` }}
          >
            {world.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{world.name}</h2>
            <p className="text-xs text-[hsl(195_60%_60%)]">
              {world.city} · {world.description}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-white/10">
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <img src={mission.guide.image} alt={mission.guide.name} className="h-10 w-10 object-contain" />
          <div>
            <p className="text-xs font-bold text-white">{mission.guide.name}</p>
            <p className="text-[10px] text-white/50">Your guide for this zone</p>
          </div>
        </div>

        <div className="space-y-3">
          {levels.map((level, i) => {
            const levelStart = i * modeConfig.gamesPerLevel;
            const levelEnd = levelStart + modeConfig.gamesPerLevel;
            const levelCompleted = Math.min(Math.max(completedGames - levelStart, 0), modeConfig.gamesPerLevel);
            const levelDone = levelCompleted >= modeConfig.gamesPerLevel;
            const levelActive = completedGames >= levelStart && completedGames < levelEnd;
            const isLocked = level.locked;
            const isBoss = i === levels.length - 1;

            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  levelDone
                    ? "border-[hsl(160_65%_50%/0.4)] bg-[hsl(160_65%_50%/0.1)]"
                    : levelActive
                      ? "border-[hsl(195_80%_50%/0.4)] bg-[hsl(195_80%_50%/0.1)]"
                      : isLocked
                        ? "border-white/5 bg-white/[0.03] opacity-50"
                        : "border-white/5 bg-white/[0.03]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
                    levelDone ? "bg-[hsl(160_65%_50%/0.2)]" : levelActive ? "bg-[hsl(195_80%_50%/0.2)]" : "bg-white/5"
                  }`}
                >
                  {isLocked ? <Lock className="h-4 w-4 text-white/30" /> : <span>{STEP_ICONS[i]}</span>}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{STEP_LABELS[i]}</p>
                    {isBoss && !isLocked && (
                      <span className="rounded-full bg-[hsl(0_80%_60%/0.2)] px-2 py-0.5 text-[9px] font-bold text-[hsl(0_80%_70%)]">
                        BOSS
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40">
                    {level.name} · {levelCompleted}/{modeConfig.gamesPerLevel} games
                  </p>
                  <div className="mt-1 flex gap-1">
                    {level.miniGameTypes.slice(0, 3).map((type, j) => (
                      <span key={j} className="text-[10px]" title={MINI_GAME_META[type].label}>
                        {MINI_GAME_META[type].emoji}
                      </span>
                    ))}
                  </div>
                </div>

                {levelDone ? (
                  <div className="flex items-center gap-1 text-[hsl(160_65%_55%)]">
                    <Trophy className="h-4 w-4" />
                    <span className="text-xs font-bold">Done</span>
                  </div>
                ) : levelActive ? (
                  <Button
                    size="sm"
                    className="border-0 bg-[hsl(195_80%_50%)] text-xs text-white hover:bg-[hsl(195_80%_45%)]"
                    onClick={() => onStartLevel(mission.id, i)}
                  >
                    {completedGames > 0 ? "Continue" : isBoss ? "Fight!" : "Deploy"}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-white/20" />
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-white/40">
          <span>
            {completedGames}/{totalGames} games completed
          </span>
          {progressRow?.status === "completed" && (
            <span className="flex items-center gap-1 font-bold text-[hsl(160_65%_55%)]">
              <Trophy className="h-3.5 w-3.5" /> Zone Secured!
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */
export default function MissionWorldMap() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [guideMessage, setGuideMessage] = useState(GUIDE_MESSAGES.idle[0]);
  const [idleIndex, setIdleIndex] = useState(0);
  const [selectedWorld, setSelectedWorld] = useState<(typeof CITY_NODES)[number] | null>(null);
  const [hasClickedHQ, setHasClickedHQ] = useState(() => {
    return localStorage.getItem("cyber_hero_hq_clicked") === "true";
  });

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
  }, [user, activeChildId, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("mission_progress").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const hqCompleted = !!(child as any)?.hq_completed;
  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const level = child?.level ?? 1;
  const points = child?.points ?? 0;
  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const hasAvatar = !!avatarConfig?.heroSrc;
  const age = child?.age ?? 7;
  const playerName = child?.name ?? "Guardian";

  useEffect(() => {
    if (child && !hasAvatar) {
      navigate("/edit-avatar");
    }
  }, [child, hasAvatar, navigate]);

  const missionIds = new Set(MISSIONS.map((m) => m.id));

  const nodeStatuses = useMemo(() => {
    const expectedTotal = getTotalGames(learningMode);

    return CITY_NODES.map((node) => {
      if (node.isHub) {
        return { status: "unlocked" as const, stars: 0 };
      }

      if (!missionIds.has(node.id)) {
        return { status: "locked" as const, stars: 0 };
      }

      // Before HQ completion: only first mission is available to unlock next
      if (!hqCompleted) {
        if (node.id === PROGRESSION_ORDER[0]) {
          return { status: "gated" as const, stars: 0 };
        }
        return { status: "locked" as const, stars: 0 };
      }

      const progress = missionProgress.find(
        (p: any) => p.mission_id === node.id && (p.max_score ?? expectedTotal) === expectedTotal,
      );

      if (progress?.status === "completed") {
        return {
          status: "completed" as const,
          stars: getStars(progress.score ?? expectedTotal, progress.max_score ?? expectedTotal),
        };
      }

      const currentIndex = PROGRESSION_ORDER.indexOf(node.id as (typeof PROGRESSION_ORDER)[number]);

      if (currentIndex === -1) {
        return { status: "locked" as const, stars: 0 };
      }

      // First mission unlocks right after HQ
      if (currentIndex === 0) {
        return { status: "unlocked" as const, stars: 0 };
      }

      // Every mission unlocks only when the previous one is completed
      const previousMissionId = PROGRESSION_ORDER[currentIndex - 1];
      const previousCompleted = missionProgress.some(
        (p: any) => p.mission_id === previousMissionId && p.status === "completed",
      );

      return {
        status: previousCompleted ? ("unlocked" as const) : ("locked" as const),
        stars: 0,
      };
    });
  }, [missionProgress, learningMode, hqCompleted, missionIds]);

  const completedCount = nodeStatuses.filter((n) => n.status === "completed").length;
  const totalPlayable = CITY_NODES.filter((n) => !n.isHub && missionIds.has(n.id)).length;

  useEffect(() => {
    if (!hqCompleted) {
      setGuideMessage("Hey Guardian! Start at HQ to begin your journey! 🏠");
    } else if (completedCount > 0 && completedCount < totalPlayable) {
      setGuideMessage(GUIDE_MESSAGES.progress);
    }
  }, [completedCount, totalPlayable, hqCompleted]);

  const cycleIdleMessage = useCallback(() => {
    const next = (idleIndex + 1) % GUIDE_MESSAGES.idle.length;
    setIdleIndex(next);
    setGuideMessage(GUIDE_MESSAGES.idle[next]);
  }, [idleIndex]);

  const handleNodeClick = (node: (typeof CITY_NODES)[number], index: number) => {
    if (node.isHub) {
      if (!hasClickedHQ) {
        setHasClickedHQ(true);
        localStorage.setItem("cyber_hero_hq_clicked", "true");
      }
      setGuideMessage("Welcome to HQ, Guardian! 🏠");
      setSelectedWorld(node);
      return;
    }

    const { status } = nodeStatuses[index];

    if (status === "gated") {
      setGuideMessage(GUIDE_MESSAGES.hqGated);
      return;
    }

    if (status === "locked") {
      setGuideMessage(GUIDE_MESSAGES.worldLocked);
      return;
    }

    setGuideMessage(GUIDE_MESSAGES.worldSelected);
    setSelectedWorld(node);
  };

  const handleHQComplete = async () => {
    if (!activeChildId) return;

    await supabase
      .from("child_profiles")
      .update({ hq_completed: true } as any)
      .eq("id", activeChildId);

    queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
    setSelectedWorld(null);
    setGuideMessage(GUIDE_MESSAGES.hqComplete);
  };

  const handleStartLevel = (missionId: string, _levelIndex: number) => {
    if (selectedWorld?.isHub) {
      void handleHQComplete();
      navigate(`/missions?mission=${missionId}`);
      return;
    }

    setSelectedWorld(null);
    navigate(`/missions?mission=${missionId}`);
  };

  const selectedMission = selectedWorld ? MISSIONS.find((m) => m.id === selectedWorld.id) : undefined;

  return (
    <div
      className="relative min-h-screen overflow-hidden pb-24 pt-20"
      style={{ background: "linear-gradient(160deg, hsl(220 45% 10%), hsl(210 50% 14%), hsl(200 40% 12%))" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 0.5,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.05,
            }}
            animate={{ opacity: [0.05, 0.4, 0.05] }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 4 + 2,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-6xl px-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/world-select")}
              className="w-fit rounded-full border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.65)] text-white hover:bg-[hsl(210_40%_18%/0.9)]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to World Select
            </Button>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                🌎 North America — <span className="text-[hsl(45_90%_65%)]">The Keybreaker&apos;s Domain</span>
              </h1>
              <p className="mt-1 text-sm text-[hsl(195_60%_70%/0.8)]">Finish each zone to unlock the next one.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(0_80%_60%/0.2)] bg-[hsl(210_40%_14%/0.75)] px-4 py-3 text-sm text-white/80 shadow-lg">
            <p className="font-bold text-[hsl(0_80%_70%)]">⚠ Villain Signal Detected</p>
            <p className="mt-1 text-xs text-white/60">“You&apos;ll never secure my network chaos!” — The Keybreaker</p>
          </div>
        </div>

        <HUDBar
          playerName={playerName}
          level={level}
          points={points}
          zonesSecured={completedCount}
          totalZones={totalPlayable}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-3 text-center"
        >
          <p className="text-xs font-medium text-[hsl(45_90%_65%/0.7)]">
            🏆 Secure all zones to earn your Cyber Guardian Certificate!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative mx-auto w-full"
          style={{ aspectRatio: "16/9", maxWidth: "960px" }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-2xl border border-[hsl(195_80%_50%/0.2)] shadow-[0_0_60px_hsl(210_60%_15%/0.8),inset_0_0_40px_hsl(210_50%_10%/0.5)]">
            <WorldMapSVG />

            <div className="absolute left-3 top-3 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-[hsl(195_80%_50%/0.4)]" />
            <div className="absolute right-3 top-3 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-[hsl(195_80%_50%/0.4)]" />
            <div className="absolute bottom-3 left-3 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-[hsl(195_80%_50%/0.4)]" />
            <div className="absolute bottom-3 right-3 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-[hsl(195_80%_50%/0.4)]" />
          </div>

          <MapConnections statuses={nodeStatuses.map((n) => n.status)} hqCompleted={hqCompleted} />

          {CITY_NODES.map((node, index) => {
            if (node.isHub) {
              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 220 }}
                  className="absolute z-20"
                  style={{ top: `${node.y}%`, left: `${node.x}%`, transform: "translate(-50%, -50%)" }}
                >
                  {!hqCompleted && !hasClickedHQ && (
                    <motion.div
                      animate={{ x: [0, 6, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute -right-32 top-1/2 z-30 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap"
                    >
                      <span className="text-lg text-[hsl(45_90%_60%)]">→</span>
                      <span className="rounded-full border border-[hsl(45_90%_55%/0.4)] bg-[hsl(45_90%_55%/0.2)] px-2.5 py-1 text-[10px] font-bold text-[hsl(45_90%_70%)]">
                        Start here!
                      </span>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={() => handleNodeClick(node, index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex cursor-pointer flex-col items-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ repeat: Infinity, duration: 3.5 }}
                      className="absolute -inset-4 rounded-full border-2 border-[hsl(45_90%_55%/0.5)]"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.35, 1], opacity: [0.25, 0, 0.25] }}
                      transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
                      className="absolute -inset-2 rounded-full border border-[hsl(45_90%_55%/0.3)]"
                    />

                    <div
                      className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(45_90%_55%/0.7)] shadow-[0_0_32px_hsl(45_90%_55%/0.4)] backdrop-blur-md md:h-[68px] md:w-[68px]"
                      style={{ background: "radial-gradient(circle, hsl(45 85% 45% / 0.35), hsl(35 50% 18% / 0.9))" }}
                    >
                      <span className="text-2xl drop-shadow-md md:text-3xl">🏠</span>
                    </div>

                    <div className="mt-1.5 rounded-full border border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.15)] px-2.5 py-0.5 backdrop-blur-sm">
                      <p className="whitespace-nowrap text-[8px] font-bold tracking-wide text-[hsl(45_90%_75%)] md:text-[10px]">
                        HQ — Cyber Hero Command
                      </p>
                    </div>
                    <p className="mt-0.5 whitespace-nowrap text-[6px] text-[hsl(45_90%_60%/0.6)] md:text-[8px]">
                      {node.city}
                    </p>
                  </motion.button>
                </motion.div>
              );
            }

            const { status, stars } = nodeStatuses[index];
            const isGated = status === "gated";
            const isClickable = status !== "locked" && status !== "gated";
            const hasMission = missionIds.has(node.id);
            const isCurrentTarget = status === "unlocked" && hasMission;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + index * 0.05, type: "spring", stiffness: 200 }}
                className="absolute z-10"
                style={{ top: `${node.y}%`, left: `${node.x}%`, transform: "translate(-50%, -50%)" }}
              >
                <motion.button
                  onClick={() => handleNodeClick(node, index)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.15 } : {}}
                  whileTap={isClickable ? { scale: 0.92 } : {}}
                  className={`group relative flex flex-col items-center transition-all ${
                    status === "locked"
                      ? "cursor-not-allowed opacity-25"
                      : isGated
                        ? "cursor-not-allowed opacity-45"
                        : "cursor-pointer"
                  }`}
                >
                  {isCurrentTarget && (
                    <motion.div
                      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -inset-2.5 rounded-full border border-[hsl(195_80%_50%/0.6)]"
                    />
                  )}

                  {isGated && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.65, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="absolute -inset-1.5 rounded-full border border-[hsl(45_90%_55%/0.45)]"
                    />
                  )}

                  <div
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-base shadow-lg transition-all duration-200 md:h-11 md:w-11 md:text-lg ${
                      status === "completed"
                        ? "border-[hsl(160_65%_50%/0.7)] shadow-[0_0_20px_hsl(160_65%_50%/0.4)]"
                        : status === "unlocked"
                          ? `border-[hsl(${node.hue}_70%_55%/0.7)] shadow-[0_0_18px_hsl(${node.hue}_70%_55%/0.3)]`
                          : isGated
                            ? "border-[hsl(45_90%_55%/0.35)]"
                            : "border-white/10"
                    } ${isCurrentTarget ? "scale-110 ring-4 ring-[hsl(195_80%_50%/0.35)]" : ""}`}
                    style={{
                      background:
                        status === "locked"
                          ? "hsl(220 30% 16%)"
                          : isGated
                            ? "hsl(35 28% 16%)"
                            : `radial-gradient(circle at 35% 35%, hsl(${node.hue} 65% 38%), hsl(${node.hue} 50% 18%))`,
                    }}
                  >
                    {status === "locked" || isGated ? (
                      <Lock className={`h-3.5 w-3.5 ${isGated ? "text-[hsl(45_90%_55%/0.5)]" : "text-white/25"}`} />
                    ) : status === "completed" ? (
                      <span className="text-sm">✅</span>
                    ) : (
                      <span className="drop-shadow-sm">{node.icon}</span>
                    )}

                    {(status === "unlocked" || status === "completed") && (
                      <div className="absolute left-2 top-1 h-1 w-2 rotate-[-30deg] rounded-full bg-white/25" />
                    )}
                  </div>

                  {status === "completed" && stars > 0 && (
                    <div className="mt-0.5 flex gap-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`h-2.5 w-2.5 ${
                            s <= stars ? "fill-[hsl(45_90%_60%)] text-[hsl(45_90%_60%)]" : "text-white/15"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <div
                    className={`mt-1 max-w-[80px] rounded-md px-1.5 py-0.5 backdrop-blur-sm ${
                      status === "locked" || isGated ? "bg-black/20" : "bg-[hsl(210_40%_12%/0.85)]"
                    }`}
                  >
                    <p
                      className={`text-center text-[7px] font-bold leading-tight tracking-wide md:text-[9px] ${
                        status === "locked"
                          ? "text-white/20"
                          : isGated
                            ? "text-[hsl(45_90%_55%/0.45)]"
                            : "text-white/85"
                      }`}
                    >
                      {node.name}
                    </p>
                    <p
                      className={`text-center text-[5px] leading-tight md:text-[6px] ${
                        status === "locked" || isGated ? "text-white/10" : "text-white/35"
                      }`}
                    >
                      {node.city}
                    </p>
                  </div>

                  {isCurrentTarget && (
                    <motion.span
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="mt-0.5 text-[7px] font-bold tracking-widest text-[hsl(195_80%_65%)] md:text-[8px]"
                    >
                      🚀 START HERE
                    </motion.span>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)] shadow-[0_0_6px_hsl(45_90%_55%/0.5)]" />⭐ HQ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[hsl(195_80%_50%)]" />
            🔵 Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(160_65%_50%)]" />
            🟢 Secured
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-white/10 bg-white/10" />⚫ Locked
          </span>
          <span className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-[hsl(45_90%_60%)]" />
            📶 Coming Soon
          </span>
        </motion.div>
      </div>

      <GuideCharacter avatarConfig={avatarConfig} message={guideMessage} onTap={cycleIdleMessage} />

      <AnimatePresence>
        {selectedWorld && (
          <WorldDetailPanel
            world={selectedWorld}
            mission={selectedMission}
            missionProgress={missionProgress}
            learningMode={learningMode}
            age={age}
            onClose={() => setSelectedWorld(null)}
            onStartLevel={handleStartLevel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
