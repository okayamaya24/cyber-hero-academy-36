import { useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Zap, Shield, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WORLDS, getDifficultyTier } from "@/data/adventureZones";
import AdventureCutscene from "@/components/adventure/AdventureCutscene";
import { Progress } from "@/components/ui/progress";

/* ── floating particles ────────────────────────────────── */
function Particles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        dur: Math.random() * 6 + 4,
        delay: Math.random() * 4,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-cyber-aqua/30"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ── main page ─────────────────────────────────────────── */
export default function AdventureMapPage() {
  const navigate = useNavigate();
  const { activeChildId } = useAuth();
  const [showCutscene, setShowCutscene] = useState(true);

  const handleCutsceneComplete = useCallback(() => {
    setShowCutscene(false);
  }, []);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("id", activeChildId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: continentProgress = [] } = useQuery({
    queryKey: ["continent_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("continent_progress")
        .select("*")
        .eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const tier = child ? getDifficultyTier(child.age) : "hero";

  const handleWorldClick = (worldId: string) => {
    navigate(`/adventure/${worldId}`);
  };

  const worldsCompleted = child?.worlds_completed ?? 0;

  return (
    <>
      {/* Cutscene overlay */}
      <AnimatePresence>
        {showCutscene && (
          <AdventureCutscene tier={tier} onComplete={handleCutsceneComplete} />
        )}
      </AnimatePresence>

    <div className="relative min-h-screen bg-[hsl(220,30%,8%)] text-white overflow-hidden">
      <Particles />

      {/* ── top HUD ─────────────────────────────────────── */}
      <header className="relative z-10">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-2">
          {/* left: player info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur">
              <Globe className="h-4 w-4 text-cyber-aqua" />
              <span className="font-bold">{child?.name ?? "Guardian"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur">
              <Zap className="h-4 w-4 text-accent" />
              <span className="font-bold">LVL {child?.level ?? 1}</span>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur sm:flex">
              <span className="text-accent font-bold">{child?.points ?? 0} XP</span>
            </div>
          </div>

          {/* right: worlds counter + guardian badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur">
              <Shield className="h-4 w-4 text-cyber-teal" />
              <span className="font-bold">WORLDS: {worldsCompleted}/7</span>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-sm backdrop-blur sm:flex">
              <span>🛡️</span>
              <span className="font-bold text-cyan-300">GUARDIAN MODE</span>
            </div>
          </div>
        </div>

        {/* nav links */}
        <div className="container mx-auto flex gap-6 px-4 py-2">
          {[
            { label: "Dashboard", to: "/dashboard" },
            { label: "Missions", to: "/missions" },
            { label: "Parents", to: "/for-parents" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-semibold text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </header>

      {/* ── heading ─────────────────────────────────────── */}
      <div className="relative z-10 container mx-auto px-4 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-end gap-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              🌍 SELECT YOUR WORLD
            </h1>
            <span className="mb-1 hidden text-sm font-bold uppercase tracking-widest text-white/40 sm:block">
              Cyber Hero Academy
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-accent">
            Complete all 7 worlds to earn your Master Cyber Guardian Certificate!
          </p>
        </motion.div>
      </div>

      {/* ── world grid ──────────────────────────────────── */}
      <div className="relative z-10 container mx-auto px-4 pt-4 pb-32">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {WORLDS.map((world, i) => {
            const cp = continentProgress.find((c) => c.continent_id === world.id);
            const zonesCompleted = cp?.zones_completed ?? 0;
            const total = world.totalZones;
            const pct = total > 0 ? Math.round((zonesCompleted / total) * 100) : 0;

            return (
              <motion.button
                key={world.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleWorldClick(world.id)}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${world.color} backdrop-blur-sm p-5 text-left transition-shadow hover:shadow-[0_0_30px_hsl(185_80%_48%/0.25)]`}
              >
                {/* glow ring on hover */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 transition-all group-hover:ring-cyan-400/30" />

                {/* emoji */}
                <span className="text-4xl">{world.emoji}</span>

                {/* name */}
                <h3 className={`mt-3 text-lg font-extrabold ${world.villainColor}`}>
                  {world.name}
                </h3>

                {/* villain */}
                <div className="mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Villain
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-lg">{world.villainEmoji}</span>
                    <span className="text-sm font-bold text-white/90">{world.villain}</span>
                  </div>
                </div>

                {/* zone count */}
                <p className="mt-3 text-xs text-white/50">
                  {world.totalZones} Zones + 1 Boss Battle
                </p>

                {/* progress */}
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-white/40">
                    <span>{zonesCompleted}/{total} Zones</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-cyber-aqua to-cyber-teal"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.08 + 0.3, duration: 0.6 }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 py-2 text-xs font-bold uppercase tracking-wider text-cyan-300 transition-colors group-hover:bg-cyan-400/20">
                  {pct > 0 ? "Continue" : "In Progress"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>

                {/* background emoji watermark */}
                <div className="pointer-events-none absolute -bottom-6 -right-4 text-[6rem] leading-none opacity-[0.04] transition-transform group-hover:scale-110">
                  {world.emoji}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Byte sidekick (always visible with default msg, or world intro) ── */}
      <ByteSidekick
        visible={showByte}
        message={byteMessage ?? "Choose a world to begin your mission, Guardian! 🌍"}
        onDismiss={byteMessage ? handleByteDismiss : undefined}
      />
    </div>
    </>
  );
}
