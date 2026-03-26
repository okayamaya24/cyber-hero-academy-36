import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronLeft, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getContinentById, type ContinentDef, type ZoneDef } from "@/data/continents";
import { getZoneGames, getBossBattle } from "@/data/zoneGames";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import VillainSprite from "@/components/world/VillainSprite";
import StarfieldBackground from "@/components/world/StarfieldBackground";
import { Button } from "@/components/ui/button";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import {
  GEO_URL,
  CONTINENT_COUNTRIES,
  CONTINENT_PROJECTIONS,
  ZONE_COORDINATES,
} from "@/data/continentMapConfig";
import NorthAmericaBoard from "@/components/world/NorthAmericaBoard";

/* ─── Villain Taunts ─────────────────────────────────────── */
const VILLAIN_TAUNTS: Record<string, string[]> = {
  "The Keybreaker": ["No password can stop me!", "I've cracked them ALL, Guardian!", "Your encryption is useless!", "Give up now while you can!"],
  "The Phisher King": ["Click the link... I dare you! 🎣", "Every email is a trap!", "Your inbox belongs to ME!", "Can you spot the fake? I think not!"],
  "The Troll Lord": ["I'll make everyone feel bad!", "My trolls are EVERYWHERE!", "Kindness won't save you!", "The internet is MINE!"],
  "The Firewall Phantom": ["I am the ghost in the machine!", "Your firewalls can't stop me!", "I phase through your defences!", "The network belongs to me now!"],
  "The Data Thief": ["Your data is MINE!", "I know your name, address, everything!", "Privacy? What privacy?", "I've stolen it all already!"],
  "Malware Max": ["My viruses are EVERYWHERE, mate!", "Your device doesn't stand a chance!", "Hop hop hop — infected!", "No update can save you now!"],
  "SHADOWBYTE": ["You dare face ME?", "I am every threat combined.", "Your Cyber Hero skills end HERE.", "The digital world is already mine."],
};

/* ─── Villain Character ─────────────────────────────────── */
function VillainCharacter({ villainName }: { villainName: string }) {
  const taunts = VILLAIN_TAUNTS[villainName] || ["..."];
  const [tauntIdx, setTauntIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTauntIdx((i) => (i + 1) % taunts.length), 8000);
    return () => clearInterval(interval);
  }, [taunts.length]);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
      className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2 md:bottom-8 md:right-6">
      <AnimatePresence mode="wait">
        <motion.div key={tauntIdx} initial={{ opacity: 0, scale: 0.85, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 4 }}
          className="relative max-w-[200px] rounded-xl rounded-br-sm border border-[hsl(0_80%_55%/0.25)] bg-[hsl(0_40%_14%/0.9)] px-3 py-2 shadow-lg backdrop-blur-md">
          <p className="text-[10px] text-[hsl(0_80%_70%)] italic leading-snug">"{taunts[tauntIdx]}"</p>
          <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-[hsl(0_40%_14%/0.9)] border-r border-b border-[hsl(0_80%_55%/0.25)]" />
        </motion.div>
      </AnimatePresence>
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}>
        <VillainSprite villainName={villainName} size={80} menacing />
      </motion.div>
    </motion.div>
  );
}

/* ─── Zone Mission Panel ─────────────────────────────────── */
function ZoneMissionPanel({ zone, continent, onClose, onDeploy }: {
  zone: ZoneDef; continent: ContinentDef; onClose: () => void; onDeploy: () => void;
}) {
  const hasGames = !!(getZoneGames(zone.id) || getBossBattle(zone.id));
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl bg-[hsl(210_40%_20%)]">{zone.icon}</div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{zone.name.toUpperCase()}</h2>
            <p className="text-xs text-[hsl(195_60%_60%)]">{zone.city} · {continent.name}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>
        {zone.isBoss ? (
          <div className="text-center py-6">
            <span className="text-4xl mb-3 block">⚔️</span>
            <p className="text-sm text-white/70 mb-4">Defeat {continent.villain} to unlock the next world!</p>
            {hasGames ? (
              <Button onClick={onDeploy} className="bg-[hsl(0_70%_45%)] hover:bg-[hsl(0_70%_40%)] text-white font-bold">⚔️ START BOSS BATTLE</Button>
            ) : (
              <p className="text-xs text-white/40">Boss Battle unlocks after completing all zones</p>
            )}
          </div>
        ) : zone.isHQ ? (
          <div className="text-center py-6">
            <span className="text-4xl mb-3 block">🏠</span>
            <p className="text-sm text-white/70 mb-4">Welcome, Guardian! Complete your orientation!</p>
            <Button onClick={onDeploy} className="bg-[hsl(45_90%_50%)] hover:bg-[hsl(45_90%_45%)] text-[hsl(210_40%_10%)] font-bold">🚀 BEGIN ORIENTATION</Button>
          </div>
        ) : hasGames ? (
          <div className="text-center py-6">
            <p className="text-sm text-white/70 mb-4">4 games await you in this zone!</p>
            <Button onClick={onDeploy} className="bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white font-bold">🚀 DEPLOY MISSION</Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">🚧</span>
            <p className="text-sm text-white/70 mb-1">Mission content coming soon</p>
            <p className="text-xs text-white/40">Zone: {zone.name}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Continent Map Screen ──────────────────────────── */
export default function ContinentMapScreen() {
  const { continentId } = useParams<{ continentId: string }>();
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<ZoneDef | null>(null);

  const continent = getContinentById(continentId || "");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
    else if (!continent) navigate("/world-map");
  }, [user, activeChildId, continent, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: zoneProgress = [] } = useQuery({
    queryKey: ["zone_progress", activeChildId, continentId],
    queryFn: async () => {
      const { data, error } = await supabase.from("zone_progress").select("*").eq("child_id", activeChildId!).eq("continent_id", continentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId && !!continentId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const isAntarctica = continent?.id === "antarctica";

  const zoneStatuses = useMemo(() => {
    if (!continent) return [];
    return continent.zones.map((zone, i) => {
      const progress = zoneProgress.find((p: any) => p.zone_id === zone.id);
      if (progress?.status === "completed") return "completed";
      if (i === 0) return "available";
      const prevZone = continent.zones[i - 1];
      const prevProgress = zoneProgress.find((p: any) => p.zone_id === prevZone.id);
      if (prevProgress?.status === "completed") return "available";
      return "locked";
    });
  }, [continent, zoneProgress]);

  const zoneCoords = useMemo(() => ZONE_COORDINATES[continentId || ""] || [], [continentId]);
  const projection = CONTINENT_PROJECTIONS[continentId || ""];
  const countryCodes = CONTINENT_COUNTRIES[continentId || ""] || [];

  const handleZoneClick = (zone: ZoneDef, index: number) => {
    if (zoneStatuses[index] === "locked") return;
    setSelectedZone(zone);
  };

  if (!continent) return null;

  /* Color helpers for zone markers */
  const markerColors = (zone: ZoneDef, status: string) => {
    if (zone.isHQ) return { fill: "#f5c518", stroke: "#f5c518", glow: "rgba(245,197,24,0.45)" };
    if (zone.isBoss) return { fill: "#ff2d55", stroke: "#ff2d55", glow: "rgba(255,45,85,0.4)" };
    if (status === "completed") return { fill: "#00ff88", stroke: "#00ff88", glow: "rgba(0,255,136,0.35)" };
    if (status === "available") return { fill: "#00ffe7", stroke: "#00ffe7", glow: "rgba(0,255,231,0.35)" };
    return { fill: "#2a3a5a", stroke: "#3a4a6a", glow: "none" };
  };

  return (
    <div className="min-h-screen pb-24 pt-20 relative overflow-hidden"
      style={{ background: isAntarctica ? "linear-gradient(160deg, #050a14, #0a1f3a, #081525)" : "#050a14" }}>
      <StarfieldBackground variant={isAntarctica ? "snow" : "default"} />
      <div className="pointer-events-none absolute inset-0 z-[1]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
      }} />

      <div className="relative z-[2] mx-auto max-w-6xl px-4">
        {/* Back button */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate("/world-map")}
          className="mb-4 flex items-center gap-2 rounded-xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] px-4 py-2 text-sm font-bold text-[hsl(195_80%_70%)] backdrop-blur-md hover:bg-[hsl(210_40%_14%)] transition-colors">
          <ChevronLeft className="h-4 w-4" /> BACK TO WORLD SELECT
        </motion.button>

        {/* Continent Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {continent.emoji} {continent.name.toUpperCase()} — <span className="text-[hsl(0_80%_65%)]">{continent.villain.toUpperCase()}'S DOMAIN</span>
          </h1>
        </motion.div>

        {/* ─── MAP AREA ─────────────────── */}
        {continentId === "north-america" ? (
          <div className="mx-auto" style={{ maxWidth: "960px" }}>
            <NorthAmericaBoard
              zones={continent.zones}
              zoneStatuses={zoneStatuses}
              onZoneClick={handleZoneClick}
            />
          </div>
        ) : (
          <div className="relative mx-auto w-full rounded-2xl border border-[hsl(195_80%_50%/0.15)] overflow-hidden shadow-2xl"
            style={{
              aspectRatio: "16/10",
              maxWidth: "900px",
              background: isAntarctica
                ? "radial-gradient(ellipse at 50% 45%, #0a1f3a, #050d1a)"
                : "radial-gradient(ellipse at 50% 45%, #0d1f37, #050d1a)",
            }}>

            {/* Dot grid overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
              backgroundImage: "radial-gradient(circle, hsl(195 80% 60%) 0.5px, transparent 0.5px)",
              backgroundSize: "24px 24px",
            }} />

            {projection && (
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ center: projection.center, scale: projection.scale }}
                style={{ width: "100%", height: "100%" }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies
                      .filter((geo) => countryCodes.includes(geo.id))
                      .map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#0d2137"
                          stroke="#1a4a6a"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "#0a3a5a", outline: "none" },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                  }
                </Geographies>

                {zoneCoords.slice(0, -1).map((from, i) => {
                  const to = zoneCoords[i + 1];
                  const fromStatus = zoneStatuses[i];
                  const toStatus = zoneStatuses[i + 1];
                  const bothDone = fromStatus === "completed" && toStatus === "completed";
                  const available = fromStatus === "completed" && toStatus !== "locked";
                  return (
                    <Line key={`line-${i}`} from={[from.lng, from.lat]} to={[to.lng, to.lat]}
                      stroke={bothDone ? "hsl(195,85%,55%)" : available ? "hsl(195,85%,55%)" : "hsl(200,15%,40%)"}
                      strokeWidth={bothDone ? 2 : 1}
                      strokeOpacity={bothDone ? 0.6 : available ? 0.35 : 0.12}
                      strokeDasharray={bothDone ? "none" : available ? "6 4" : "4 3"}
                      strokeLinecap="round" />
                  );
                })}

                {continent.zones.map((zone, i) => {
                  const coord = zoneCoords.find((c) => c.id === zone.id);
                  if (!coord) return null;
                  const status = zoneStatuses[i] || "locked";
                  const colors = markerColors(zone, status);
                  const isLocked = status === "locked";
                  const isAvailable = status === "available";
                  const isCompleted = status === "completed";
                  const r = zone.isHQ ? 14 : zone.isBoss ? 12 : 9;
                  return (
                    <Marker key={zone.id} coordinates={[coord.lng, coord.lat]}
                      onClick={() => handleZoneClick(zone, i)}
                      style={{ cursor: isLocked ? "not-allowed" : "pointer" }}>
                      {!isLocked && (
                        <circle r={r + 6} fill="none" stroke={colors.stroke} strokeWidth={1.5} opacity={0.4}>
                          <animate attributeName="r" values={`${r+2};${r+14};${r+2}`} dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {!isLocked && (
                        <circle r={r + 3} fill={colors.glow} opacity={0.3}>
                          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle r={r} fill={isLocked ? "#1a2540" : colors.fill} stroke={colors.stroke}
                        strokeWidth={2} opacity={isLocked ? 0.35 : 1} />
                      <text textAnchor="middle" dominantBaseline="central"
                        fontSize={zone.isHQ || zone.isBoss ? 12 : 10}
                        style={{ pointerEvents: "none", userSelect: "none" }}>
                        {isLocked ? "🔒" : isCompleted ? "✅" : zone.icon}
                      </text>
                      <text textAnchor="middle" y={r + 14} fontSize={7} fontWeight="bold"
                        fill={isLocked ? "rgba(255,255,255,0.2)" : zone.isBoss ? "#ff6b8a" : "#fff"}
                        opacity={isLocked ? 0.4 : 0.85}
                        style={{ pointerEvents: "none", userSelect: "none" }}>
                        {zone.name}
                      </text>
                      <text textAnchor="middle" y={r + 22} fontSize={5} fill="rgba(255,255,255,0.3)"
                        style={{ pointerEvents: "none", userSelect: "none" }}>
                        {zone.city}
                      </text>
                      {isAvailable && (
                        <text textAnchor="middle" y={r + 30} fontSize={5.5} fontWeight="bold"
                          fill={zone.isBoss ? "#ff6b8a" : "#00ffe7"}
                          style={{ pointerEvents: "none", userSelect: "none" }}>
                          {zone.isBoss ? "⚔️ FIGHT" : "▶ DEPLOY"}
                          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
                        </text>
                      )}
                    </Marker>
                  );
                })}
              </ComposableMap>
            )}
          </div>
        )}

        {/* Legend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[hsl(195_80%_50%)] animate-pulse" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[hsl(160_65%_50%)]" /> Secured</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-white/10 border border-white/10" /> Locked</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[hsl(0_80%_50%)]" /> ⚔️ Boss</span>
        </motion.div>
      </div>

      {/* Villain Character */}
      <VillainCharacter villainName={continent.villain} />

      {/* Guide avatar */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="fixed bottom-6 left-4 z-50 flex flex-col items-start gap-2 md:bottom-8 md:left-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.9)] shadow-[0_0_20px_hsl(195_85%_50%/0.3)]">
          <HeroAvatar avatarConfig={avatarConfig} size={36} fallbackEmoji="🦸" />
        </div>
      </motion.div>

      {/* Zone Panel */}
      <AnimatePresence>
        {selectedZone && continent && (
          <ZoneMissionPanel zone={selectedZone} continent={continent} onClose={() => setSelectedZone(null)}
            onDeploy={() => { setSelectedZone(null); navigate(`/world-map/${continentId}/${selectedZone.id}`); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
