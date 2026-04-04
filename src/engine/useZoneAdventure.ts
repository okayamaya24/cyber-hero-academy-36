/**
 * Adventure Engine — Zone adventure flow hook.
 * Manages the phase state machine for zone gameplay:
 * cutscene → playing → story_panel → debrief → complete → boss_unlocked
 */

import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getNextZone } from "@/data/zoneOrder";
import { getContinentConfig } from "./continentRegistry";
import { getNarration, getCompletionDialogue } from "./dialogue";
import { computeStars } from "./progression";
import {
  saveZoneCompletion,
  saveGameCompletion,
  unlockNextZone,
  awardXp,
} from "./useAdventureProgress";
import type { ZoneNarrationDef, DialogueLine } from "./types";
import type { ContinentDef, ZoneDef } from "@/data/continents";

export type AdventurePhase =
  | "cutscene"
  | "playing"
  | "story_panel"
  | "debrief"
  | "complete"
  | "boss_unlocked";

export interface UseZoneAdventureParams {
  continentId: string;
  zoneId: string;
  continent: ContinentDef;
  zone: ZoneDef;
  childId: string | null;
  childPoints: number;
  isBoss: boolean;
  isHQ: boolean;
}

export interface UseZoneAdventureReturn {
  phase: AdventurePhase;
  setPhase: (p: AdventurePhase) => void;
  activeTab: number;
  setActiveTab: (t: number) => void;
  completedGames: Set<number>;
  totalMistakes: number;
  finalStars: number;
  bossZoneForUnlock: string | null;
  narration: ZoneNarrationDef;
  completionLines: DialogueLine[];
  zoneXp: number;
  zoneBadge: string | undefined;
  handleGameComplete: (gameIndex: number, passed: boolean, stars: number) => Promise<void>;
  handleStoryPanelContinue: () => void;
  handleDebriefDone: () => void;
}

export function useZoneAdventure(params: UseZoneAdventureParams): UseZoneAdventureReturn {
  const { continentId, zoneId, continent, zone, childId, childPoints, isBoss, isHQ } = params;
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<AdventurePhase>("cutscene");
  const [activeTab, setActiveTab] = useState(0);
  const [completedGames, setCompletedGames] = useState<Set<number>>(new Set());
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [pendingNextTab, setPendingNextTab] = useState<number | null>(null);
  const [bossZoneForUnlock, setBossZoneForUnlock] = useState<string | null>(null);
  const [finalStars, setFinalStars] = useState(3);

  // Try engine config first, fall back to legacy data
  const config = getContinentConfig(continentId);

  const narration: ZoneNarrationDef = config
    ? getNarration(zoneId, config.zoneNarrations)
    : getNarration(zoneId, {}); // will return default

  const completionLines: DialogueLine[] = config
    ? getCompletionDialogue(zoneId, config.zoneCompletionDialogue)
    : [];

  const zoneReward = config?.zoneRewards[zoneId] ?? { xp: 100 };
  const zoneXp = zoneReward.xp;
  const zoneBadge = zoneReward.badge;

  useEffect(() => {
    if (isBoss) setPhase("playing");
  }, [isBoss]);

  // Restore completed games from existing progress
  useEffect(() => {
    if (!childId || !zoneId) return;
    const fetchProgress = async () => {
      const { data } = await supabase
        .from("mission_progress")
        .select("*")
        .eq("child_id", childId)
        .like("mission_id", `zone_${zoneId}_%`);
      if (!data) return;
      const done = new Set<number>();
      data.forEach((p: any) => {
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
    };
    fetchProgress();
  }, [childId, zoneId]);

  const handleZoneComplete = async (stars: number) => {
    if (!childId) return;

    await saveZoneCompletion({
      childId,
      continentId,
      zoneId,
      stars,
    });

    if (isHQ) {
      await supabase.from("child_profiles").update({ hq_completed: true }).eq("id", childId);
    }

    await awardXp(childId, childPoints, zoneXp);

    const nextZoneId = getNextZone(continentId, zoneId);
    if (nextZoneId) {
      await unlockNextZone({ childId, continentId, nextZoneId });
      const bossZone = continent.zones.find((z) => z.isBoss);
      if (bossZone && nextZoneId === bossZone.id) {
        setBossZoneForUnlock(bossZone.id);
      }
    }

    queryClient.invalidateQueries({ queryKey: ["zone_progress"] });
    queryClient.invalidateQueries({ queryKey: ["child"] });
  };

  const handleGameComplete = async (gameIndex: number, passed: boolean, stars: number) => {
    if (!childId) return;

    const mistakes = stars === 3 ? 0 : stars === 2 ? 1 : 2;
    setTotalMistakes((prev) => prev + mistakes);

    const gameKeys = ["quiz", "mini", "puzzle", "dragdrop"];
    const missionId = `zone_${zoneId}_${gameKeys[gameIndex]}`;

    await saveGameCompletion({
      childId,
      missionId,
      stars,
      gameType: gameKeys[gameIndex],
    });

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

    queryClient.invalidateQueries({ queryKey: ["child", childId] });
  };

  const handleStoryPanelContinue = useCallback(() => {
    if (pendingNextTab !== null) {
      setActiveTab(pendingNextTab);
      setPendingNextTab(null);
    }
    setPhase("playing");
  }, [pendingNextTab]);

  const handleDebriefDone = useCallback(() => {
    setPhase("complete");
  }, []);

  return {
    phase,
    setPhase,
    activeTab,
    setActiveTab,
    completedGames,
    totalMistakes,
    finalStars,
    bossZoneForUnlock,
    narration,
    completionLines,
    zoneXp,
    zoneBadge,
    handleGameComplete,
    handleStoryPanelContinue,
    handleDebriefDone,
  };
}
