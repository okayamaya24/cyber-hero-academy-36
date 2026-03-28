import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContinentById } from "@/data/continents";
import { getZoneGames, getBossBattle } from "@/data/zoneGames";
import { getAgeTier, getPointsPerCorrect } from "@/data/missions";
import { getNextZone } from "@/data/zoneOrder";
import { getZoneNarration } from "@/data/zoneNarrations";
import StarfieldBackground from "@/components/world/StarfieldBackground";
import VillainSprite from "@/components/world/VillainSprite";
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
import { Button } from "@/components/ui/button";

const GAME_TABS = [
  { key: "quiz", label: "Story Quiz", icon: "📖" },
  { key: "mini", label: "Mini Game", icon: "🎮" },
  { key: "puzzle", label: "Puzzle", icon: "🧩" },
  { key: "dragdrop", label: "Drag & Drop", icon: "🎯" },
];

type AdventurePhase = "cutscene" | "playing" | "story_panel" | "complete" | "boss_unlocked";

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

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
    else if (!continent || !zone) navigate("/world-map");
  }, [user, activeChildId, continent, zone, navigate]);

  // Skip cutscene for boss zones
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
      setPhase("playing"); // skip cutscene if resuming
    }
  }, [existingProgress]);

  const ageTier = child ? getAgeTier(child.age) : "defender" as const;
  const pointsPerGame = getPointsPerCorrect(ageTier) * 5;
  const XP_PER_ZONE = 100;

  const computeStars = useCallback((mistakes: number) => {
    if (mistakes === 0) return 3;
    if (mistakes === 1) return 2;
    return 1;
  }, []);

  const handleZoneComplete = async (stars: number) => {
    if (!activeChildId || !zoneId || !continentId) return;

    await supabase.from("zone_progress").upsert({
      child_id: activeChildId,
      continent_id: continentId,
      zone_id: zoneId,
      status: "completed",
      games_completed: 4,
      total_games: 4,
      stars_earned: stars,
    }, { onConflict: "child_id,zone_id" });

    if (isHQ) {
      await supabase.from("child_profiles").update({ hq_completed: true }).eq("id", activeChildId);
    }

    // Award flat XP
    if (child) {
      const newPoints = (child.points || 0) + XP_PER_ZONE;
      const newLevel = Math.floor(newPoints / 500) + 1;
      await supabase.from("child_profiles").update({ points: newPoints, level: newLevel }).eq("id", activeChildId);
    }

    const nextZoneId = getNextZone(continentId, zoneId);
    if (nextZoneId) {
      await supabase.from("zone_progress").upsert({
        child_id: activeChildId,
        continent_id: continentId,
        zone_id: nextZoneId,
        status: "available",
        games_completed: 0,
        total_games: 4,
        stars_earned: 0,
      }, { onConflict: "child_id,zone_id" });

      // Check if next zone is the boss (all regular zones done)
      const bossZone = continent?.zones.find((z) => z.isBoss);
      if (bossZone && nextZoneId === bossZone.id) {
        setBossZoneForUnlock(bossZone.id);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["zone_progress"] });
    queryClient.invalidateQueries({ queryKey: ["child"] });
  };

  const handleGameComplete = async (gameIndex: number, passed: boolean, stars: number) => {
    if (!activeChildId || !zoneId) return;

    const mistakes = stars === 3 ? 0 : stars === 2 ? 1 : 2;
    setTotalMistakes((prev) => prev + mistakes);

    const gameKeys = ["quiz", "mini", "puzzle", "dragdrop"];
    const missionId = `zone_${zoneId}_${gameKeys[gameIndex]}`;

    await supabase.from("mission_progress").upsert({
      child_id: activeChildId,
      mission_id: missionId,
      status: "completed",
      score: stars,
      max_score: 3,
      stars_earned: stars,
      game_type: gameKeys[gameIndex],
      completed_at: new Date().toISOString(),
    }, { onConflict: "child_id,mission_id" });

    const newCompleted = new Set(completedGames);
    newCompleted.add(gameIndex);
    setCompletedGames(newCompleted);

    if (newCompleted.size >= 4) {
      // All games done — show complete screen
      const finalStars = computeStars(totalMistakes + mistakes);
      await handleZoneComplete(finalStars);
      setPhase("complete");
    } else {
      // Find next uncompleted tab and show story panel
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

  const handleBossComplete = async (won: boolean, stars: number) => {
    if (!activeChildId || !zoneId || !continentId) return;

    const isFinalBoss = zoneId === "boss-shadowbyte";

    await supabase.from("zone_progress").upsert({
      child_id: activeChildId,
      continent_id: continentId,
      zone_id: zoneId,
      status: "completed",
      games_completed: 4,
      total_games: 4,
      stars_earned: stars,
    }, { onConflict: "child_id,zone_id" });

    await supabase.from("continent_progress").upsert({
      child_id: activeChildId,
      continent_id: continentId,
      status: "completed",
      boss_defeated: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: "child_id,continent_id" });

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

    setTimeout(() => {
      if (isFinalBoss) navigate("/certificate");
      else navigate(`/world-map/${continentId}`);
    }, isFinalBoss ? 5000 : 3000);
  };

  if (!continent || !zone) return null;

  // ─── Cutscene Intro ──────────────────────────
  if (phase === "cutscene" && !isBoss) {
    return (
      <AnimatePresence>
        <ZoneCutsceneIntro
          villainName={continent.villain}
          zoneName={zone.name}
          zoneIcon={zone.icon}
          storyNarration={narration.intro}
          villainTaunt={narration.villainTaunts[0] || continent.villainTaunt}
          onStart={() => setPhase("playing")}
        />
      </AnimatePresence>
    );
  }

  // ─── Story Panel Between Games ────────────────
  if (phase === "story_panel") {
    const gamesDone = completedGames.size;
    return (
      <AnimatePresence>
        <div className="min-h-screen relative" style={{ background: "#050a14" }}>
          <StarfieldBackground />
          <ZoneStoryPanel
            villainName={continent.villain}
            narration={narration.afterGame[Math.min(gamesDone - 1, narration.afterGame.length - 1)] || "Keep going, Guardian!"}
            villainTaunt={narration.villainTaunts[Math.min(gamesDone, narration.villainTaunts.length - 1)] || "You won't win!"}
            gameIndex={gamesDone}
            onContinue={handleStoryPanelContinue}
          />
        </div>
      </AnimatePresence>
    );
  }

  // ─── Zone Complete Screen ─────────────────────
  if (phase === "complete") {
    const finalStars = computeStars(totalMistakes);
    return (
      <AnimatePresence>
        <ZoneCompleteScreen
          zoneName={zone.name}
          zoneIcon={zone.icon}
          villainName={continent.villain}
          stars={finalStars}
          xpEarned={XP_PER_ZONE}
          onBackToMap={() => {
            if (bossZoneForUnlock) {
              setPhase("boss_unlocked" as AdventurePhase);
            } else {
              navigate(`/world-map/${continentId}`);
            }
          }}
        />
      </AnimatePresence>
    );
  }

  // ─── Boss Unlocked Cutscene ───────────────────
  if (phase === "boss_unlocked" && bossZoneForUnlock) {
    const bossZone = continent.zones.find((z) => z.id === bossZoneForUnlock);
    return (
      <AnimatePresence>
        <BossUnlockedCutscene
          villainName={continent.villain}
          bossZoneName={bossZone?.name || "Boss Vault"}
          villainTaunt={continent.villainTaunt}
          onFaceBoss={() => navigate(`/zone/${continentId}/${bossZoneForUnlock}`)}
          onReturnToMap={() => navigate(`/world-map/${continentId}`)}
        />
      </AnimatePresence>
    );
  }

  // ─── Boss Battle ─────────────────────────────
  if (isBoss && bossContent) {
    return (
      <div className="min-h-screen pb-24 pt-20 relative overflow-hidden" style={{ background: "#050a14" }}>
        <StarfieldBackground />
        <div className="pointer-events-none absolute inset-0 z-[1]" style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 80% 60% / 0.02) 2px, hsl(0 80% 60% / 0.02) 4px)",
        }} />
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

  // ─── No game content ────────────────────────
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

  // ─── Regular Zone Games ─────────────────────
  const hasCrossword = !!gameContent.crossword;
  const puzzleLabel = hasCrossword ? "Crossword" : "Word Search";

  return (
    <div className="min-h-screen pb-24 pt-20 relative overflow-hidden" style={{ background: "#050a14" }}>
      <StarfieldBackground />
      <div className="pointer-events-none absolute inset-0 z-[1]" style={{
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
      }} />

      <div className="relative z-[2] mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigate(`/world-map/${continentId}`)}
            variant="ghost"
            className="text-[hsl(195_80%_70%)] hover:bg-white/5 text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> BACK TO MAP
          </Button>

          <div className="flex items-center gap-2">
            <VillainSprite villainName={continent.villain} size={32} menacing />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="text-lg md:text-xl font-bold text-white">
            {zone.icon} {zone.name.toUpperCase()} <span className="text-white/40">// {zone.city}</span>
          </h1>
          <p className="text-xs text-[hsl(195_80%_60%)] mt-1 font-mono">
            ZONE PROGRESS: {completedGames.size}/4 GAMES COMPLETE
          </p>
        </motion.div>

        {/* Game Tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto">
          {GAME_TABS.map((tab, i) => {
            const isCompleted = completedGames.has(i);
            const isLocked = i > 0 && !completedGames.has(i - 1) && !isCompleted;
            const isActive = activeTab === i;

            return (
              <button
                key={tab.key}
                onClick={() => !isLocked && setActiveTab(i)}
                disabled={isLocked}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[hsl(195_80%_50%/0.2)] text-[hsl(195_80%_70%)] border border-[hsl(195_80%_50%/0.3)]"
                    : isCompleted
                      ? "bg-[hsl(160_65%_30%/0.2)] text-[hsl(160_65%_60%)] border border-[hsl(160_65%_50%/0.2)]"
                      : isLocked
                        ? "bg-white/[0.03] text-white/20 border border-white/5 cursor-not-allowed"
                        : "bg-white/[0.05] text-white/40 border border-white/10 hover:bg-white/10"
                }`}
              >
                {isLocked ? <Lock className="h-3 w-3" /> : isCompleted ? "✅" : tab.icon}
                {i === 2 ? puzzleLabel : tab.label}
              </button>
            );
          })}
        </div>

        {/* Game Content */}
        <div className="rounded-2xl border border-[hsl(195_80%_50%/0.15)] bg-[hsl(210_40%_12%/0.8)] backdrop-blur-md min-h-[400px]">
          {activeTab === 0 && !completedGames.has(0) && (
            <ZoneQuizGame
              title={gameContent.quiz.title}
              questions={gameContent.quiz.questions}
              onComplete={(passed, stars) => handleGameComplete(0, passed, stars)}
            />
          )}
          {activeTab === 0 && completedGames.has(0) && (
            <CompletedState label="Story Quiz" onReplay={() => { setCompletedGames((s) => { const n = new Set(s); n.delete(0); return n; }); }} />
          )}

          {activeTab === 1 && !completedGames.has(1) && (
            <MiniGamePlaceholder
              type={gameContent.miniGame.type}
              title={gameContent.miniGame.title}
              description={gameContent.miniGame.description}
              onComplete={(passed) => handleGameComplete(1, passed, 3)}
            />
          )}
          {activeTab === 1 && completedGames.has(1) && (
            <CompletedState label="Mini Game" onReplay={() => { setCompletedGames((s) => { const n = new Set(s); n.delete(1); return n; }); }} />
          )}

          {activeTab === 2 && !completedGames.has(2) && gameContent.wordSearch && (
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
          )}
          {activeTab === 2 && !completedGames.has(2) && gameContent.crossword && (
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
          )}
          {activeTab === 2 && completedGames.has(2) && (
            <CompletedState label={puzzleLabel} onReplay={() => { setCompletedGames((s) => { const n = new Set(s); n.delete(2); return n; }); }} />
          )}

          {activeTab === 3 && !completedGames.has(3) && (
            <ZoneDragDropGame
              items={gameContent.dragDrop.items}
              buckets={gameContent.dragDrop.buckets}
              mode={CONVEYOR_ZONES.has(zoneId || "") ? "conveyor" : "physics"}
              onComplete={(passed, stars) => handleGameComplete(3, passed, stars)}
            />
          )}
          {activeTab === 3 && completedGames.has(3) && (
            <CompletedState label="Drag & Drop" onReplay={() => { setCompletedGames((s) => { const n = new Set(s); n.delete(3); return n; }); }} />
          )}
        </div>

        {import.meta.env.DEV && (
          <button
            onClick={async () => {
              await handleZoneComplete(3);
              navigate(`/world-map/${continentId}`);
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
