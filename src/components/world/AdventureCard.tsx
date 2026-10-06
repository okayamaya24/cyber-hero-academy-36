import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CONTINENTS } from "@/data/continents";
import { isZonePlayable } from "@/data/zoneOrder";
import VillainSprite from "@/components/world/VillainSprite";

/**
 * Big dashboard card for Adventure Mode: the continent the kid is on now,
 * its villain, and how many zones they've cleared.
 */
export default function AdventureCard({ childId }: { childId: string }) {
  const { data: continentProgress = [] } = useQuery({
    queryKey: ["continent_progress", childId],
    queryFn: async () => {
      const { data, error } = await supabase.from("continent_progress").select("continent_id, boss_defeated").eq("child_id", childId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: zoneProgress = [] } = useQuery({
    queryKey: ["zone_progress", childId],
    queryFn: async () => {
      const { data, error } = await supabase.from("zone_progress").select("zone_id, status").eq("child_id", childId);
      if (error) throw error;
      return data ?? [];
    },
  });

  const ordered = [...CONTINENTS].sort((a, b) => a.unlockOrder - b.unlockOrder);
  const defeated = new Set(continentProgress.filter((c) => c.boss_defeated).map((c) => c.continent_id));
  // Continents unlock one at a time, so the current one is the first boss not yet beaten
  const current = ordered.find((c) => !defeated.has(c.id));
  const allDone = !current;
  const continent = current ?? ordered[ordered.length - 1];

  const zones = continent.zones.filter((z) => !z.isBoss && isZonePlayable(z.id));
  const doneIds = new Set(zoneProgress.filter((z) => z.status === "completed").map((z) => z.zone_id));
  const cleared = zones.filter((z) => doneIds.has(z.id)).length;
  const bossReady = zones.length > 0 && cleared >= zones.length;
  const pct = zones.length ? Math.round((cleared / zones.length) * 100) : 0;
  const worldsBeaten = defeated.size;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
      <Link
        to={allDone ? "/world-map" : `/world-map/${continent.id}`}
        className="group relative block overflow-hidden rounded-3xl border-2 border-cyan-400/40 p-5 shadow-xl transition-transform hover:-translate-y-0.5 sm:p-6"
        style={{ background: "linear-gradient(135deg, #0b1a3d 0%, #13104a 55%, #2a0d3d 100%)" }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex items-center gap-4 sm:gap-6">
          <div className="hidden shrink-0 sm:block">
            <VillainSprite villainName={continent.villain} size={120} menacing={!allDone} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-widest text-cyan-300">
              🗺️ Adventure Mode · {worldsBeaten}/7 worlds saved
            </p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
              {allDone ? "You saved the Digital World! 🏆" : `${continent.emoji} ${continent.name}`}
            </h2>
            {!allDone && (
              <p className="mt-1 text-sm text-white/70">
                {bossReady ? (
                  <>
                    <span className="font-bold text-rose-300">{continent.villain}</span> is waiting in the boss lair. Are you ready?
                  </>
                ) : (
                  <>
                    Stop <span className="font-bold text-rose-300">{continent.villain}</span>!
                  </>
                )}
              </p>
            )}
            {!allDone && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs font-bold text-white/60">
                  <span>{cleared} of {zones.length} zones cleared</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            )}
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-sm font-black text-[#06111f] shadow-lg transition-transform group-hover:scale-105">
              {allDone ? "Visit the World Map" : bossReady ? "⚔️ Face the boss!" : cleared === 0 ? "▶ Start the adventure" : "▶ Continue adventure"}
            </span>
          </div>
          <div className="shrink-0 sm:hidden">
            <VillainSprite villainName={continent.villain} size={84} menacing={!allDone} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
