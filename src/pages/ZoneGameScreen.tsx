import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContinentById } from "@/data/continents";
import { getZoneGames, getBossBattle } from "@/data/zoneGames";
import { getAgeTier, getPointsPerCorrect } from "@/data/missions";
import { getNextZone } from "@/data/zoneOrder";
import { getZoneNarration } from "@/data/zoneNarrations";
import StarfieldBackground from "@/components/world/StarfieldBackground";
import ZoneQuizGame from "@/components/minigames/ZoneQuizGame";
import WordSearchGame from "@/components/minigames/WordSearchGame";
import CrosswordGame from "@/components/training/CrosswordGame";
import ZoneDragDropGame, { CONVEYOR_ZONES } from "@/components/minigames/ZoneDragDropGame";
import MiniGamePlaceholder from "@/components/minigames/MiniGamePlaceholder";
import BossBattleScreen from "@/components/minigames/BossBattleScreen";
import ZoneCutsceneIntro from "@/components/zone/ZoneCutsceneIntro";
import ZoneStoryPanel from "@/components/zone/ZoneStoryPanel";
import ZoneCompleteScreen from "@/components/zone/ZoneCompleteScreen";
import BossUnlockedCutscene from "@/components/zone/BossUnlockedCutscene";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import HQOrientation from "@/components/zone/HQOrientation";
import { Button } from "@/components/ui/button";

import keybreakerImg from "@/assets/villains/keybreaker.png";
import phisherKingImg from "@/assets/villains/phisher-king.png";
import firewallPhantomImg from "@/assets/villains/firewall-phantom.png";
import dataThiefImg from "@/assets/villains/data-thief.png";

/* ── Villain assets ─────────────────────────────────── */
const VILLAIN_ASSETS: Record<string, { img: string; color: string }> = {
  "The Keybreaker": { img: keybreakerImg, color: "140, 85%, 50%" },
  "The Phisher King": { img: phisherKingImg, color: "195, 85%, 50%" },
  "The Firewall Phantom": { img: firewallPhantomImg, color: "300, 85%, 50%" },
  "The Data Thief": { img: dataThiefImg, color: "175, 85%, 45%" },
};

/* ── Zone rewards ───────────────────────────────────── */
const ZONE_REWARDS: Record<string, { xp: number; badge?: string }> = {
  hq: { xp: 100, badge: "CyberGuardian Recruit" },
  "pixel-port": { xp: 150, badge: "Digital Balance Badge" },
  "signal-summit": { xp: 175, badge: "WiFi Watchdog Badge" },
  "code-canyon": { xp: 200, badge: "Scam Spotter Badge" },
  "encrypt-enclave": { xp: 225, badge: "Code Breaker Badge" },
  "password-peak": { xp: 250, badge: "Password Master Badge" },
  "arctic-archive": { xp: 275, badge: "Data Guardian Badge" },
  "shadow-station": { xp: 275, badge: "Game Guardian Badge" },
  "firewall-fortress": { xp: 300, badge: "Firewall Builder Badge" },
  "boss-keybreaker": { xp: 500, badge: "North America Champion" },
};

/* ── Completion dialogue ────────────────────────────── */
interface CompletionLine {
  speaker: "guide" | "villain";
  text: string;
}

const ZONE_COMPLETION_DIALOGUE: Record<string, CompletionLine[]> = {
  hq: [
    { speaker: "guide", text: "Orientation complete — you're officially a CyberGuardian recruit!" },
    {
      speaker: "guide",
      text: "Pixel Port in Los Angeles is now unlocked. The Keybreaker has been causing chaos there!",
    },
    { speaker: "villain", text: "One city. There are thousands more. Enjoy this tiny victory…" },
  ],
  "pixel-port": [
    { speaker: "guide", text: "Pixel Port secured! The kids here now know how to balance their digital lives." },
    { speaker: "villain", text: "Hmph. One port. I have the whole coastline!" },
    { speaker: "guide", text: "Digital Balance Badge earned! Signal Summit in Denver is now unlocked." },
  ],
  "signal-summit": [
    { speaker: "guide", text: "Signal Summit is clean! The Keybreaker's fake hotspots are destroyed." },
    { speaker: "villain", text: "You cleared one relay tower. I have hundreds. This changes nothing!" },
    { speaker: "guide", text: "WiFi Watchdog Badge earned! Code Canyon in Chicago is now open." },
  ],
  "code-canyon": [
    { speaker: "guide", text: "Code Canyon secured! Chicago's residents can now spot a scam from a mile away." },
    { speaker: "villain", text: "You think you've won? I invented social engineering!" },
    { speaker: "guide", text: "Scam Spotter Badge earned! Encrypt Enclave in Toronto is now unlocked." },
  ],
  "encrypt-enclave": [
    { speaker: "guide", text: "Encrypt Enclave is secure! The Keybreaker's decryption bots are destroyed." },
    { speaker: "guide", text: "Code Breaker Badge earned! Password Peak in New York is now unlocked." },
  ],
  "password-peak": [
    { speaker: "guide", text: "Password Peak is ours! The Keybreaker's stolen credential database is destroyed." },
    { speaker: "villain", text: "My… my passwords… YEARS of work! You'll pay for this, Guardian!" },
    { speaker: "guide", text: "Password Master Badge earned! Arctic Archive in Vancouver is now unlocked." },
  ],
  "arctic-archive": [
    {
      speaker: "guide",
      text: "Arctic Archive is safe! Every backup is secured — the Keybreaker's bots are shut down.",
    },
    { speaker: "guide", text: "Data Guardian Badge earned! Shadow Station in Mexico City is now open." },
  ],
  "shadow-station": [
    { speaker: "guide", text: "Shadow Station is clear! The fake gaming networks are shut down." },
    { speaker: "villain", text: "Fine. But the Firewall Fortress won't fall so easily…" },
    { speaker: "guide", text: "Game Guardian Badge earned! Firewall Fortress in Atlanta is now unlocked." },
  ],
  "firewall-fortress": [
    { speaker: "guide", text: "Firewall Fortress is holding! The Keybreaker can't get through anymore." },
    { speaker: "villain", text: "You think you've won? My Vault still stands, Guardian." },
    { speaker: "guide", text: "Firewall Builder Badge earned. There's only one zone left… the Keybreaker's Vault." },
  ],
};

const DEFAULT_COMPLETION: CompletionLine[] = [
  { speaker: "guide", text: "Zone secured! Outstanding work, Guardian!" },
  { speaker: "guide", text: "The Digital World is safer because of you." },
];

/* ── Zone completion debrief ────────────────────────── */
function ZoneCompletionDebrief({
  zoneId,
  zoneName,
  zoneIcon,
  villainName,
  stars,
  xp,
  badge,
  avatarConfig,
  playerName,
  onDone,
}: {
  zoneId: string;
  zoneName: string;
  zoneIcon: string;
  villainName: string;
  stars: number;
  xp: number;
  badge?: string;
  avatarConfig: Record<string, any> | null;
  playerName: string;
  onDone: () => void;
}) {
  const lines = ZONE_COMPLETION_DIALOGUE[zoneId] ?? DEFAULT_COMPLETION;
  const [lineIndex, setLineIndex] = useState(0);
  const isLast = lineIndex >= lines.length - 1;
  const [xpCount, setXpCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const villainAsset = VILLAIN_ASSETS[villainName];
  const hue = villainAsset?.color.split(",")[0] ?? "195";

  useEffect(() => {
    if (!isLast) return;
    let n = 0;
    const step = Math.ceil(xp / 40);
    const id = setInterval(() => {
      n = Math.min(n + step, xp);
      setXpCount(n);
      if (n >= xp) clearInterval(id);
    }, 28);
    const t = setTimeout(() => setShowBadge(true), 600);
    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, [isLast, xp]);

  const handleClick = useCallback(() => {
    if (isLast) onDone();
    else setLineIndex((i) => i + 1);
  }, [isLast, onDone]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleClick]);

  const currentLine = lines[lineIndex];
  const isVillain = currentLine.speaker === "villain";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={handleClick}
    >
      <motion.div
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="w-full max-w-md rounded-3xl border border-[hsl(160_65%_50%/0.3)] bg-[hsl(210_40%_10%)] p-6 shadow-[0_0_60px_hsl(160_65%_50%/0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[hsl(160_65%_50%/0.6)] bg-[hsl(160_65%_50%/0.12)] text-xl"
          >
            ✅
          </motion.div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[hsl(160_65%_55%)] uppercase">Zone Secured!</p>
            <p className="text-lg font-bold text-white">
              {zoneIcon} {zoneName}
            </p>
          </div>
          <div className="ml-auto flex gap-1">
            {[1, 2, 3].map((s) => (
              <motion.span
                key={s}
                initial={{ scale: 0 }}
                animate={{ scale: s <= stars ? 1 : 0.6 }}
                transition={{ delay: 0.1 * s, type: "spring" }}
                className={`text-xl ${s <= stars ? "opacity-100" : "opacity-20"}`}
              >
                ⭐
              </motion.span>
            ))}
          </div>
        </div>

        <div className="mb-5 space-y-2 max-h-52 overflow-y-auto">
          {lines.map((l, i) => {
            const iv = l.speaker === "villain";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: i <= lineIndex ? 1 : 0.12, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-start gap-2.5 rounded-xl p-3 text-sm ${
                  i === lineIndex
                    ? iv
                      ? "bg-[hsl(0_30%_12%/0.7)] border border-[hsl(0_60%_45%/0.2)]"
                      : "bg-[hsl(195_80%_50%/0.1)] border border-[hsl(195_80%_50%/0.2)]"
                    : "border border-transparent"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full overflow-hidden border border-white/10">
                  {iv && villainAsset ? (
                    <img
                      src={villainAsset.img}
                      alt={villainName}
                      className="w-full h-full object-cover object-top"
                      style={{
                        transform:
                          villainName === "The Data Thief"
                            ? "scale(2.2) translateY(28px)"
                            : "scale(1.4) translateY(4px)",
                      }}
                    />
                  ) : iv ? (
                    <span className="text-xs">🦹</span>
                  ) : (
                    <HeroAvatar avatarConfig={avatarConfig} size={20} fallbackEmoji="🦸" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-[9px] font-bold tracking-wide uppercase mb-0.5 ${iv ? `text-[hsla(${hue},65%,62%,1)]` : "text-[hsl(195_80%_60%)]"}`}
                  >
                    {iv ? villainName : playerName}
                  </p>
                  <p className="text-white/80 leading-snug">{l.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {isLast && (
          <div className="mb-5 flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[90px] rounded-xl border border-[hsl(45_90%_55%/0.25)] bg-[hsl(45_90%_55%/0.08)] p-3 text-center">
              <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">XP Earned</p>
              <p className="text-2xl font-bold text-[hsl(45_90%_60%)] tabular-nums">+{xpCount}</p>
            </div>
            {badge && (
              <motion.div
                animate={{ opacity: showBadge ? 1 : 0, scale: showBadge ? 1 : 0.85 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex-1 min-w-[110px] rounded-xl border border-[hsl(160_65%_50%/0.25)] bg-[hsl(160_65%_50%/0.08)] p-3 text-center"
              >
                <p className="text-lg mb-0.5">🏅</p>
                <p className="text-[9px] text-[hsl(160_65%_55%)] uppercase tracking-wide">New Badge</p>
                <p className="text-[10px] font-bold text-white/70 mt-0.5 leading-tight">{badge}</p>
              </motion.div>
            )}
          </div>
        )}

        <div onClick={handleClick}>
          {!isLast ? (
            <Button className="w-full bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white border-0 font-bold">
              Continue →
            </Button>
          ) : (
            <Button className="w-full border border-[hsl(160_65%_50%/0.3)] bg-[hsl(160_65%_50%/0.12)] hover:bg-[hsl(160_65%_50%/0.2)] text-[hsl(160_65%_60%)] font-bold">
              Back to Map →
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Phase type ─────────────────────────────────────── */
type AdventurePhase = "cutscene" | "playing" | "story_panel" | "debrief" | "complete" | "boss_unlocked";

/* ══════════════════════════════════════════════════════
   MAIN SCREEN
   ══════════════════════════════════════════════════════ */
export default function ZoneGameScreen() {
  const { continentId, zoneId } = useParams<{ continentId: string; zoneId: string }>();
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const continent = getContinentById(continentId || "");
  const zone = continent?.zones.find((z) => z.id === zoneId);
  const isBoss = zone?.isBoss;
  const isHQ = zone?.isHQ;
  const gameContent = isBoss ? null : getZoneGames(zoneId || "");
  const bossContent = isBoss ? getBossBattle(zoneId || "") : null;
  const narration = getZoneNarration(zoneId || "");

  const [phase, setPhase] = useState<AdventurePhase>("cutscene");
  const [activeTab, setActiveTab] = useState(0);
  const [completedGames, setCompletedGames] = useState<Set<number>>(new Set());
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [pendingNextTab, setPendingNextTab] = useState<number | null>(null);
  const [bossZoneForUnlock, setBossZoneForUnlock] = useState<string | null>(null);
  const [finalStars, setFinalStars] = useState(3);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/dashboard");
    else if (!continent || !zone) navigate("/world-map");
  }, [user, activeChildId, continent, zone, navigate]);

  useEffect(() => {
    if (isBoss) setPhase("playing");
  }, [isBoss]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: existingProgress = [] } = useQuery({
    queryKey: ["zone_game_progress", activeChildId, zoneId],
    queryFn: async () => {
      const { data } = await supabase
        .from("mission_progress")
        .select("*")
        .eq("child_id", activeChildId!)
        .like("mission_id", `zone_${zoneId}_%`);
      return data || [];
    },
    enabled: !!activeChildId && !!zoneId,
  });

  useEffect(() => {
    const done = new Set<number>();
    existingProgress.forEach((p: any) => {
      if (p.status === "completed") {
        if (p.mission_id.endsWith("_quiz")) done.add(0);
        if (p.mission_id.endsWith("_mini")) done.add(1);
        if (p.mission_id.endsWith("_puzzle")) done.add(2);
        if (p.mission_id.endsWith("_dragdrop")) done.add(3);
      }
    });
    if (done.size > 0) {
      setCompletedGames(done);
      setPhase("playing");
    }
  }, [existingProgress]);

  const ageTier = child ? getAgeTier(child.age) : ("defender" as const);
  const pointsPerGame = getPointsPerCorrect(ageTier) * 5;
  const zoneRewards = ZONE_REWARDS[zoneId ?? ""] ?? { xp: 100 };

  const computeStars = useCallback((mistakes: number) => {
    if (mistakes === 0) return 3;
    if (mistakes === 1) return 2;
    return 1;
  }, []);

  const handleZoneComplete = async (stars: number) => {
    if (!activeChildId || !zoneId || !continentId) return;
    await supabase.from("zone_progress").upsert(
      {
        child_id: activeChildId,
        continent_id: continentId,
        zone_id: zoneId,
        status: "completed",
        games_completed: 4,
        total_games: 4,
        stars_earned: stars,
      },
      { onConflict: "child_id,zone_id" },
    );

    if (isHQ) await supabase.from("child_profiles").update({ hq_completed: true }).eq("id", activeChildId);

    if (child) {
      const newPoints = (child.points || 0) + zoneRewards.xp;
      const newLevel = Math.floor(newPoints / 500) + 1;
      await supabase.from("child_profiles").update({ points: newPoints, level: newLevel }).eq("id", activeChildId);
    }

    const nextZoneId = getNextZone(continentId, zoneId);
    if (nextZoneId) {
      await supabase.from("zone_progress").upsert(
        {
          child_id: activeChildId,
          continent_id: continentId,
          zone_id: nextZoneId,
          status: "available",
          games_completed: 0,
          total_games: 4,
          stars_earned: 0,
        },
        { onConflict: "child_id,zone_id" },
      );
      const bossZone = continent?.zones.find((z) => z.isBoss);
      if (bossZone && nextZoneId === bossZone.id) setBossZoneForUnlock(bossZone.id);
    }

    queryClient.invalidateQueries({ queryKey: ["zone_progress"] });
    queryClient.invalidateQueries({ queryKey: ["child"] });
  };

  const handleGameComplete = async (gameIndex: number, passed: boolean, stars: number) => {
    if (!activeChildId || !zoneId) return;
    const mistakes = stars === 3 ? 0 : stars === 2 ? 1 : 2;
    setTotalMistakes((prev) => prev + mistakes);

    const gameKeys = ["quiz", "mini", "puzzle", "dragdrop"];
    await supabase.from("mission_progress").upsert(
      {
        child_id: activeChildId,
        mission_id: `zone_${zoneId}_${gameKeys[gameIndex]}`,
        status: "completed",
        score: stars,
        max_score: 3,
        stars_earned: stars,
        game_type: gameKeys[gameIndex],
        completed_at: new Date().toISOString(),
      },
      { onConflict: "child_id,mission_id" },
    );

    const newCompleted = new Set(completedGames);
    newCompleted.add(gameIndex);
    setCompletedGames(newCompleted);

    if (newCompleted.size >= 4) {
      const fs = computeStars(totalMistakes + mistakes);
      setFinalStars(fs);
      await handleZoneComplete(fs);
      setPhase("debrief");
    } else {
      let nextTab = gameIndex;
      for (let i = gameIndex + 1; i < 4; i++) {
        if (!newCompleted.has(i)) {
          nextTab = i;
          break;
        }
      }
      setPendingNextTab(nextTab);
      setPhase("story_panel");
    }
    queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
  };

  const handleStoryPanelContinue = useCallback(() => {
    if (pendingNextTab !== null) {
      setActiveTab(pendingNextTab);
      setPendingNextTab(null);
    }
    setPhase("playing");
  }, [pendingNextTab]);

  const handleDebriefDone = useCallback(() => setPhase("complete"), []);

  const handleBossComplete = async (won: boolean, stars: number) => {
    if (!activeChildId || !zoneId || !continentId) return;
    const isFinalBoss = zoneId === "boss-shadowbyte";

    await supabase.from("zone_progress").upsert(
      {
        child_id: activeChildId,
        continent_id: continentId,
        zone_id: zoneId,
        status: "completed",
        games_completed: 4,
        total_games: 4,
        stars_earned: stars,
      },
      { onConflict: "child_id,zone_id" },
    );

    await supabase.from("continent_progress").upsert(
      {
        child_id: activeChildId,
        continent_id: continentId,
        status: "completed",
        boss_defeated: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "child_id,continent_id" },
    );

    if (child) {
      const updates: any = {
        villains_defeated: (child.villains_defeated || 0) + 1,
        points: (child.points || 0) + pointsPerGame * 2,
      };
      if (isFinalBoss) {
        updates.master_certificate_earned = true;
        updates.worlds_completed = 7;
      }
      await supabase.from("child_profiles").update(updates).eq("id", activeChildId);
    }

    queryClient.invalidateQueries({ queryKey: ["zone_progress"] });
    queryClient.invalidateQueries({ queryKey: ["continent_progress"] });
    queryClient.invalidateQueries({ queryKey: ["child"] });

    setTimeout(
      () => {
        if (isFinalBoss) navigate("/certificate");
        else navigate(`/world-map/${continentId}?completed=${zoneId}`);
      },
      isFinalBoss ? 5000 : 2500,
    );
  };

  if (!continent || !zone) return null;

  const villainAsset = VILLAIN_ASSETS[continent.villain];
  const hue = villainAsset?.color.split(",")[0] ?? "195";
  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const playerName = (child as any)?.name ?? "Guardian";

  /* ── HQ Orientation ── */
  if (phase === "cutscene" && isHQ) {
    return <HQOrientation playerName={playerName} avatarConfig={avatarConfig} onComplete={() => setPhase("playing")} />;
  }

  /* ── Cutscene intro ── */
  if (phase === "cutscene" && !isBoss) {
    return (
      <AnimatePresence>
        <ZoneCutsceneIntro
          villainName={continent.villain}
          zoneName={zone.name}
          zoneIcon={zone.icon}
          zoneId={zoneId}
          storyNarration={narration.intro}
          villainTaunt={narration.villainTaunts[0] || continent.villainTaunt}
          onStart={() => setPhase("playing")}
        />
      </AnimatePresence>
    );
  }

  /* ── Story panel between games ── */
  if (phase === "story_panel") {
    const gamesDone = completedGames.size;
    return (
      <AnimatePresence>
        <div className="min-h-screen relative" style={{ background: "#050a14" }}>
          <StarfieldBackground />
          <ZoneStoryPanel
            villainName={continent.villain}
            narration={
              narration.afterGame[Math.min(gamesDone - 1, narration.afterGame.length - 1)] || "Keep going, Guardian!"
            }
            villainTaunt={
              narration.villainTaunts[Math.min(gamesDone, narration.villainTaunts.length - 1)] || "You won't win!"
            }
            gameIndex={gamesDone}
            onContinue={handleStoryPanelContinue}
          />
        </div>
      </AnimatePresence>
    );
  }

  /* ── Zone completion debrief ── */
  if (phase === "debrief" && zone && continent) {
    return (
      <AnimatePresence>
        <div className="min-h-screen relative" style={{ background: "#050a14" }}>
          <StarfieldBackground />
          <ZoneCompletionDebrief
            zoneId={zoneId ?? ""}
            zoneName={zone.name}
            zoneIcon={zone.icon}
            villainName={continent.villain}
            stars={finalStars}
            xp={zoneRewards.xp}
            badge={zoneRewards.badge}
            avatarConfig={avatarConfig}
            playerName={playerName}
            onDone={handleDebriefDone}
          />
        </div>
      </AnimatePresence>
    );
  }

  /* ── Zone complete screen ── */
  if (phase === "complete") {
    return (
      <AnimatePresence>
        <ZoneCompleteScreen
          zoneName={zone.name}
          zoneIcon={zone.icon}
          villainName={continent.villain}
          stars={finalStars}
          xpEarned={zoneRewards.xp}
          onBackToMap={() => {
            if (bossZoneForUnlock) setPhase("boss_unlocked" as AdventurePhase);
            else navigate(`/world-map/${continentId}?completed=${zoneId}`);
          }}
        />
      </AnimatePresence>
    );
  }

  /* ── Boss unlocked cutscene ── */
  if (phase === "boss_unlocked" && bossZoneForUnlock) {
    const bossZone = continent.zones.find((z) => z.id === bossZoneForUnlock);
    return (
      <AnimatePresence>
        <BossUnlockedCutscene
          villainName={continent.villain}
          bossZoneName={bossZone?.name || "Boss Vault"}
          villainTaunt={continent.villainTaunt}
          onFaceBoss={() => navigate(`/zone/${continentId}/${bossZoneForUnlock}`)}
          onReturnToMap={() => navigate(`/world-map/${continentId}?completed=${zoneId}`)}
        />
      </AnimatePresence>
    );
  }

  /* ── Boss battle ── */
  if (isBoss && bossContent) {
    return (
      <div className="min-h-screen pb-24 pt-20 relative overflow-hidden" style={{ background: "#050a14" }}>
        <StarfieldBackground />
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 80% 60% / 0.02) 2px, hsl(0 80% 60% / 0.02) 4px)",
          }}
        />
        <div className="relative z-[2] mx-auto max-w-4xl px-4">
          <BossBattleScreen
            villainName={continent.villain}
            bossName={zone.name}
            content={bossContent}
            onComplete={handleBossComplete}
            onBack={() => navigate(`/world-map/${continentId}`)}
          />
        </div>
      </div>
    );
  }

  /* ── No game content ── */
  if (!gameContent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#050a14" }}>
        <div className="text-center">
          <span className="text-4xl block mb-3">🚧</span>
          <p className="text-white/60 text-sm">Games coming soon for this zone!</p>
          <Button onClick={() => navigate(`/world-map/${continentId}`)} className="mt-4" variant="ghost">
            ◄ Back to Map
          </Button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     REGULAR ZONE GAMES — LINEAR FLOW
     ══════════════════════════════════════════════════════ */
  const hasCrossword = !!gameContent.crossword;
  const currentGame = activeTab;
  const villainTaunt = narration.villainTaunts[currentGame] || "You won't stop me, Guardian!";
  const guideNarration = narration.afterGame[currentGame] || "Keep going, you've got this!";
  const GAME_LABELS = ["Story Quiz", "Mini Game", hasCrossword ? "Crossword" : "Word Search", "Drag & Drop"];
  const GAME_ICONS = ["📖", "🎮", "🧩", "🎯"];

  const renderCurrentGame = () => {
    if (currentGame === 0 && !completedGames.has(0)) {
      return (
        <ZoneQuizGame
          title={gameContent.quiz.title}
          questions={gameContent.quiz.questions}
          onComplete={(passed, stars) => handleGameComplete(0, passed, stars)}
        />
      );
    }
    if (currentGame === 1 && !completedGames.has(1)) {
      return (
        <MiniGamePlaceholder
          type={gameContent.miniGame.type}
          title={gameContent.miniGame.title}
          description={gameContent.miniGame.description}
          onComplete={(passed) => handleGameComplete(1, passed, passed ? 3 : 1)}
          villainName={continent?.villain}
        />
      );
    }
    if (currentGame === 2 && !completedGames.has(2)) {
      if (gameContent.wordSearch) {
        return (
          <div className="p-4">
            <WordSearchGame
              ageTier={ageTier}
              guideImage=""
              guideName=""
              onComplete={(passed) => handleGameComplete(2, passed, passed ? 3 : 1)}
              customWords={gameContent.wordSearch[ageTier].words}
              customGridSize={gameContent.wordSearch[ageTier].size}
            />
          </div>
        );
      }
      if (gameContent.crossword) {
        return (
          <div className="p-4">
            <CrosswordGame
              puzzle={{
                id: `zone_${zoneId}_crossword`,
                title: zone.name + " Crossword",
                zone: zone.name,
                zoneIcon: zone.icon,
                description: "",
                clues: gameContent.crossword.clues,
              }}
              ageTier={ageTier}
              onComplete={(passed, stars) => handleGameComplete(2, passed, stars)}
            />
          </div>
        );
      }
    }
    if (currentGame === 3 && !completedGames.has(3)) {
      return (
        <ZoneDragDropGame
          items={gameContent.dragDrop.items}
          buckets={gameContent.dragDrop.buckets}
          mode={CONVEYOR_ZONES.has(zoneId || "") ? "conveyor" : "physics"}
          onComplete={(passed, stars) => handleGameComplete(3, passed, stars)}
        />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#050a14" }}>
      <StarfieldBackground />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
        }}
      />

      <div className="relative z-[2] flex flex-col min-h-screen">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-white/5">
          <Button
            onClick={() => navigate(`/world-map/${continentId}`)}
            variant="ghost"
            className="text-[hsl(195_80%_70%)] hover:bg-white/5 text-sm px-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> MAP
          </Button>

          <div className="flex flex-col items-center">
            <p className="text-[11px] font-bold tracking-widest text-white/50 uppercase">
              {zone.icon} {zone.name}
            </p>
            <p className="text-[9px] text-white/20">{zone.city}</p>
          </div>

          <div
            className="relative flex h-9 w-9 items-center justify-center rounded-full border overflow-hidden flex-shrink-0"
            style={{ borderColor: `hsla(${hue},70%,50%,0.4)`, background: `hsla(${hue},50%,10%,0.8)` }}
          >
            {villainAsset ? (
              <img
                src={villainAsset.img}
                alt={continent.villain}
                className="w-full h-full object-cover object-top"
                style={{
                  transform:
                    continent.villain === "The Data Thief"
                      ? "scale(2.2) translateY(28px)"
                      : "scale(1.4) translateY(8px)",
                }}
              />
            ) : (
              <span className="text-base">🦹</span>
            )}
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 10px hsla(${hue},70%,50%,0.5)` }}
            />
          </div>
        </div>

        {/* ── Main layout: villain | game | hero ── */}
        <div className="flex flex-1 gap-4 px-4 py-5 max-w-5xl mx-auto w-full">
          {/* Villain column */}
          <div className="hidden md:flex flex-col items-center gap-3 w-32 flex-shrink-0 pt-2">
            {villainAsset ? (
              <motion.img
                src={villainAsset.img}
                alt={continent.villain}
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-28 h-auto drop-shadow-lg"
                style={{ filter: `drop-shadow(0 0 14px hsla(${hue},80%,50%,0.45))` }}
                draggable={false}
              />
            ) : (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-7xl"
              >
                🦹
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={`taunt-${currentGame}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl rounded-tl-sm border px-3 py-2 text-center w-full"
                style={{ borderColor: `hsla(${hue},60%,45%,0.35)`, background: `hsla(${hue},40%,8%,0.85)` }}
              >
                <p className="text-[9px] font-semibold italic leading-snug" style={{ color: `hsla(${hue},70%,68%,1)` }}>
                  "{villainTaunt}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Game column */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Challenge label + progress dots */}
            <div className="flex items-center gap-2 px-1">
              <span className="text-lg">{GAME_ICONS[currentGame]}</span>
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Challenge {currentGame + 1} of 4
                </p>
                <p className="text-sm font-bold text-white">{GAME_LABELS[currentGame]}</p>
              </div>
              <div className="ml-auto flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      completedGames.has(i)
                        ? "w-6 bg-[hsl(160_65%_50%)]"
                        : i === currentGame
                          ? "w-6 bg-[hsl(195_80%_60%)]"
                          : "w-2 bg-white/15"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Game card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`game-${currentGame}`}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="rounded-2xl border border-[hsl(195_80%_50%/0.15)] bg-[hsl(210_40%_12%/0.85)] backdrop-blur-md overflow-hidden"
              >
                {renderCurrentGame()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Hero column */}
          <div className="hidden md:flex flex-col items-center gap-3 w-32 flex-shrink-0 pt-2">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.45)] bg-[hsl(210_40%_16%/0.85)] shadow-[0_0_20px_hsl(195_80%_50%/0.15)]">
              <HeroAvatar avatarConfig={avatarConfig} size={70} fallbackEmoji="🦸" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`guide-${currentGame}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl rounded-tr-sm border border-[hsl(195_80%_50%/0.3)] bg-[hsl(210_60%_12%/0.85)] px-3 py-2 text-center w-full"
              >
                <p className="text-[9px] font-semibold text-[hsl(195_80%_68%)] leading-snug italic">
                  "{guideNarration}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* DEV button */}
        {import.meta.env.DEV && (
          <button
            onClick={async () => {
              await handleZoneComplete(3);
              navigate(`/world-map/${continentId}?completed=${zoneId}`);
            }}
            className="fixed bottom-4 left-4 z-[9999] rounded-lg bg-yellow-600/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-500"
          >
            🔧 DEV: Force Zone Complete
          </button>
        )}
      </div>
    </div>
  );
}

function CompletedState({ label, onReplay }: { label: string; onReplay: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <span className="text-4xl">✅</span>
      <h3 className="text-lg font-bold text-white">{label} Completed!</h3>
      <Button onClick={onReplay} variant="ghost" className="text-[hsl(195_80%_60%)] text-xs">
        🔄 Replay
      </Button>
    </div>
  );
}
