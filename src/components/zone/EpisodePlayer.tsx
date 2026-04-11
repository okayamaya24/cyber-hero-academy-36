/**
 * EpisodePlayer — Pixar-style branching episode player.
 * Handles multi-scene dialogue, choices, inline mini-games, and 3 endings.
 * Used by ZoneGameScreen when episode data exists for a zone.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import MiniGamePlaceholder from "@/components/minigames/MiniGamePlaceholder";

import keybreakerImg from "@/assets/villains/keybreaker.png";
import phisherKingImg from "@/assets/villains/phisher-king.png";
import firewallPhantomImg from "@/assets/villains/firewall-phantom.png";
import dataThiefImg from "@/assets/villains/data-thief.png";
import byteImg from "@/assets/robot-guide.png";

/* ── Types ─────────────────────────────────────────── */

export interface EpisodeChoice {
  label: string;
  extraDialogue?: string; // extra line shown after choosing, before nextSceneId
  nextSceneId: string;
  xpBonus?: number;
}

export interface EpisodeScene {
  id: string;
  speaker: "guide" | "villain" | "narrator";
  text: string;
  choices?: EpisodeChoice[];
  miniGameId?: string;
  miniGameTitle?: string;
  miniGameDescription?: string;
  isEnding?: boolean;
  endingType?: "victory-a" | "victory-b" | "defeat";
  nextSceneId?: string;
  retrySceneId?: string;  // for defeat endings — where to retry from
  xpReward?: number;
  badge?: string;
  completionMessage?: string;
}

export interface EpisodeData {
  villainName: string;
  zoneName: string;
  zoneIcon?: string;
  scenes: Record<string, EpisodeScene>;
  startSceneId: string;
}

export interface EpisodeResult {
  endingType: string;
  xpEarned: number;
  badge?: string;
  completionMessage?: string;
}

interface EpisodePlayerProps {
  episode: EpisodeData;
  baseXp?: number;
  badge?: string;
  onComplete: (result: EpisodeResult) => void;
  onSkip?: () => void;
}

/* ── Villain config ─────────────────────────────────── */

const VILLAIN_CONFIG: Record<string, { img: string; color: string; glowColor: string }> = {
  "The Keybreaker":     { img: keybreakerImg,     color: "140, 85%, 50%", glowColor: "rgba(0,255,100,0.2)"  },
  "The Phisher King":   { img: phisherKingImg,     color: "195, 85%, 50%", glowColor: "rgba(0,200,255,0.2)"  },
  "The Firewall Phantom": { img: firewallPhantomImg, color: "300, 85%, 50%", glowColor: "rgba(200,0,255,0.2)" },
  "The Data Thief":     { img: dataThiefImg,       color: "175, 85%, 45%", glowColor: "rgba(0,255,200,0.2)"  },
};

/* ── Typewriter hook ─────────────────────────────────── */

function useTypewriter(text: string, speed = 22) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  const finish = useCallback(() => {
    setShown(text);
    setDone(true);
  }, [text]);

  return { shown, done, finish };
}

/* ── Main Component ──────────────────────────────────── */

export default function EpisodePlayer({
  episode,
  baseXp = 150,
  badge,
  onComplete,
  onSkip,
}: EpisodePlayerProps) {
  const { activeChildId } = useAuth();

  const [currentSceneId, setCurrentSceneId] = useState(episode.startSceneId);
  const [chosenOption, setChosenOption]       = useState<string | null>(null);
  const [extraDialogue, setExtraDialogue]     = useState<string | null>(null);
  const [showingExtra, setShowingExtra]       = useState(false);
  const [totalXpBonus, setTotalXpBonus]       = useState(0);
  const [showMiniGame, setShowMiniGame]       = useState(false);
  const [miniGameDone, setMiniGameDone]       = useState(false);
  const pendingNextRef                        = useRef<string>("");

  const { data: child } = useQuery({
    queryKey: ["child-ep", activeChildId],
    queryFn: async () => {
      const { data } = await supabase
        .from("child_profiles")
        .select("*")
        .eq("id", activeChildId!)
        .single();
      return data;
    },
    enabled: !!activeChildId,
  });

  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const playerName   = (child as any)?.name ?? "Guardian";

  const scene       = episode.scenes[currentSceneId];
  const villainCfg  = VILLAIN_CONFIG[episode.villainName];
  const hue         = villainCfg?.color.split(",")[0] ?? "140";
  const isVillain   = scene?.speaker === "villain";
  const isNarrator  = scene?.speaker === "narrator";

  // What text are we showing right now?
  const displayText = showingExtra && extraDialogue ? extraDialogue : (scene?.text ?? "");
  const { shown, done, finish } = useTypewriter(displayText);

  // Reset mini-game state when scene changes
  useEffect(() => {
    setShowMiniGame(false);
    setMiniGameDone(false);
  }, [currentSceneId]);

  // Keyboard: space/enter advances
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (scene?.choices && !chosenOption) return; // wait for choice
      if (scene?.miniGameId && !miniGameDone) return; // wait for game
      if (scene?.isEnding) return;
      handleAdvance();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const goToScene = (id: string) => {
    setCurrentSceneId(id);
    setChosenOption(null);
    setExtraDialogue(null);
    setShowingExtra(false);
  };

  const handleAdvance = useCallback(() => {
    if (!done) { finish(); return; }

    // After extra dialogue, go to the pending next scene
    if (showingExtra) {
      const next = pendingNextRef.current;
      if (next) goToScene(next);
      return;
    }

    // Block until choice is made
    if (scene?.choices && scene.choices.length > 0 && !chosenOption) return;

    // Block until mini-game is complete
    if (scene?.miniGameId && !miniGameDone) return;

    // Normal advance
    if (scene?.nextSceneId) goToScene(scene.nextSceneId);
  }, [done, finish, showingExtra, scene, chosenOption, miniGameDone]);

  const handleChoice = (choice: EpisodeChoice) => {
    setChosenOption(choice.label);
    if (choice.xpBonus) setTotalXpBonus(prev => prev + choice.xpBonus!);

    if (choice.extraDialogue) {
      // Store where to go AFTER the extra dialogue
      pendingNextRef.current = choice.nextSceneId;
      setTimeout(() => {
        setExtraDialogue(choice.extraDialogue!);
        setShowingExtra(true);
      }, 1000);
    } else {
      setTimeout(() => goToScene(choice.nextSceneId), 1000);
    }
  };

  const handleMiniGameComplete = () => {
    setMiniGameDone(true);
    setShowMiniGame(false);
  };

  const handleEndingComplete = () => {
    const xpEarned = baseXp + totalXpBonus + (scene?.xpReward ?? 0);
    onComplete({
      endingType:        scene?.endingType ?? "victory-a",
      xpEarned,
      badge:             scene?.badge ?? badge,
      completionMessage: scene?.completionMessage,
    });
  };

  const handleRetry = () => {
    const retryId = scene?.retrySceneId ?? episode.startSceneId;
    setTotalXpBonus(0);
    goToScene(retryId);
  };

  if (!scene) return null;

  const borderColor = isVillain
    ? `hsla(${hue},70%,50%,0.45)`
    : isNarrator
    ? "hsl(45,80%,50%,0.45)"
    : "hsl(195,80%,50%,0.45)";

  const cardBg = isVillain
    ? `linear-gradient(160deg, hsla(${hue},35%,8%,0.97), rgba(5,10,20,0.97))`
    : isNarrator
    ? "linear-gradient(160deg, hsl(45,30%,10%,0.97), rgba(5,10,20,0.97))"
    : "linear-gradient(160deg, hsl(210,50%,12%,0.97), rgba(5,10,20,0.97))";

  const speakerColor = isVillain
    ? `hsla(${hue},70%,65%,1)`
    : isNarrator
    ? "hsl(45,80%,65%)"
    : "hsl(195,80%,65%)";

  const cursorColor = isVillain ? `hsla(${hue},70%,65%,1)` : "hsl(195,80%,65%)";
  const barColor    = isVillain ? `hsla(${hue},70%,60%,0.7)` : "hsl(195,80%,60%,0.7)";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-4 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #050a14 0%, #0a1428 60%, #120a1e 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (scene.isEnding) return;
        if (scene.choices && !chosenOption) return;
        if (scene.miniGameId && !miniGameDone) return;
        handleAdvance();
      }}
    >
      {/* Scanlines overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,200,255,0.01) 2px, rgba(100,200,255,0.01) 4px)",
        }}
      />

      {/* Villain glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-3xl opacity-15"
          style={{ background: villainCfg?.glowColor ?? "rgba(0,200,255,0.15)" }}
        />
      </div>

      {/* Skip button */}
      {onSkip && !scene.isEnding && (
        <button
          className="absolute top-5 right-4 z-20 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/40 hover:text-white/70 transition-colors"
          onClick={e => { e.stopPropagation(); onSkip(); }}
        >
          SKIP ▶▶
        </button>
      )}

      {/* Zone label */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase mb-1">
          {episode.zoneIcon && `${episode.zoneIcon} `}{episode.zoneName}
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-14" style={{ background: `linear-gradient(to right, transparent, hsla(${hue},80%,50%,0.5))` }} />
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: `hsla(${hue},70%,65%,1)` }}>
            {episode.villainName}'s Domain
          </span>
          <div className="h-px w-14" style={{ background: `linear-gradient(to left, transparent, hsla(${hue},80%,50%,0.5))` }} />
        </div>
      </motion.div>

      {/* ── DIALOGUE CARD ── */}
      {!scene.isEnding && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSceneId}-${showingExtra ? "x" : "m"}`}
            initial={{ y: 18, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="w-full max-w-sm rounded-2xl border-2 overflow-hidden"
            style={{
              borderColor,
              background: cardBg,
              boxShadow: `0 0 40px ${isVillain ? `hsla(${hue},70%,40%,0.15)` : "hsl(195,80%,40%,0.15)"}, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
          >
            {/* Speaker strip */}
            <div
              className="flex items-center gap-2 px-5 pt-4 pb-3 border-b"
              style={{ borderColor: isVillain ? `hsla(${hue},60%,40%,0.2)` : "hsl(195,80%,50%,0.15)" }}
            >
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: speakerColor }}>
                {isVillain ? episode.villainName : isNarrator ? "Narrator" : "Byte"}
              </span>
              {!isVillain && !isNarrator && (
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: "hsl(195,80%,50%,0.15)", color: "hsl(195,80%,70%)" }}>
                  Guide
                </span>
              )}
            </div>

            {/* Portrait + dialogue row */}
            <div className="flex items-start gap-4 px-5 py-5">
              {/* Portrait */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div
                  className="rounded-2xl border-2 overflow-hidden flex items-center justify-center"
                  style={{
                    width: 80, height: 80,
                    borderColor: isVillain ? `hsla(${hue},60%,45%,0.55)` : "hsl(195,80%,50%,0.55)",
                    background:  isVillain ? `hsla(${hue},40%,10%,0.85)` : "hsl(210,45%,16%,0.9)",
                  }}
                >
                  {isVillain && villainCfg ? (
                    <img src={villainCfg.img} alt={episode.villainName} className="w-full h-full object-cover object-top" style={{ transform: "scale(1.4) translateY(8px)" }} draggable={false} />
                  ) : isVillain ? (
                    <span className="text-3xl">🦹</span>
                  ) : isNarrator ? (
                    <span className="text-3xl">⚡</span>
                  ) : (
                    /* Byte — the guide */
                    <img src={byteImg} alt="Byte" className="w-full h-full object-contain p-1" draggable={false} />
                  )}
                </div>
                {/* Speaking bars */}
                <div className="flex gap-0.5 h-3 items-end">
                  {[0,1,2].map(i => (
                    <motion.div
                      key={i}
                      animate={done ? { height: "3px" } : { height: ["3px","10px","3px"] }}
                      transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.12, ease: "easeInOut" }}
                      className="w-1 rounded-full"
                      style={{ background: barColor }}
                    />
                  ))}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm leading-relaxed text-white min-h-[3.5rem]">
                  {shown}
                  {!done && (
                    <motion.span
                      animate={{ opacity: [1,0,1] }}
                      transition={{ repeat: Infinity, duration: 0.65 }}
                      className="inline-block w-0.5 h-4 ml-0.5 rounded-full align-middle"
                      style={{ background: cursorColor }}
                    />
                  )}
                </p>
                {done && !scene.choices && !scene.miniGameId && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mt-2 text-[10px] text-white/35"
                  >
                    Tap to continue…
                  </motion.p>
                )}
                {done && scene.miniGameId && miniGameDone && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mt-2 text-[10px] text-white/35"
                  >
                    Challenge complete — tap to continue…
                  </motion.p>
                )}
              </div>
            </div>

            {/* Mini-game launch button */}
            {done && scene.miniGameId && !miniGameDone && !showMiniGame && (
              <div className="px-5 pb-5">
                <motion.button
                  onClick={e => { e.stopPropagation(); setShowMiniGame(true); }}
                  className="w-full rounded-xl border py-3 text-sm font-bold tracking-wider"
                  style={{ borderColor: `hsla(${hue},70%,50%,0.4)`, background: `hsla(${hue},40%,15%,0.6)`, color: `hsla(${hue},70%,70%,1)` }}
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ⚡ {scene.miniGameTitle ?? "Start Challenge"} →
                </motion.button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── CHOICES ── */}
      <AnimatePresence>
        {done && !showingExtra && scene.choices && scene.choices.length > 0 && !chosenOption && !scene.isEnding && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm space-y-2"
            onClick={e => e.stopPropagation()}
          >
            <p className="text-[10px] font-bold tracking-[0.2em] text-[hsl(45_90%_65%)] uppercase text-center mb-2">
              ⚡ Your Choice, Guardian
            </p>
            {scene.choices.map((choice, i) => (
              <motion.button
                key={i}
                onClick={() => handleChoice(choice)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl border px-4 py-3 text-left text-sm font-medium text-white/80 border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.7)] hover:border-[hsl(195_80%_50%/0.5)] hover:bg-[hsl(195_80%_50%/0.1)] transition-all"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold shrink-0" style={{ borderColor: "hsl(195,80%,50%,0.4)", color: "hsl(195,80%,70%)" }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{choice.label}</span>
                  {choice.xpBonus && (
                    <span className="text-[10px] font-bold text-[hsl(45_90%_60%)]">+{choice.xpBonus} XP</span>
                  )}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ENDING SCREEN ── */}
      <AnimatePresence>
        {scene.isEnding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm text-center space-y-4"
            onClick={e => e.stopPropagation()}
          >
            {scene.endingType !== "defeat" ? (
              <>
                {/* Stars burst */}
                <div className="relative flex justify-center gap-3 pt-2">
                  {[1,2,3].map((s) => (
                    <motion.span
                      key={s}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: s * 0.2, type: "spring", stiffness: 220 }}
                      className="text-4xl"
                    >⭐</motion.span>
                  ))}
                </div>

                {/* Confetti rain */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  {[...Array(16)].map((_,i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${5 + i * 6}%`,
                        top: -8,
                        background: ["#ffd700","#00ffcc","#ff6b6b","#a78bfa","#34d399","#fb923c","#60a5fa","#f472b6"][i % 8],
                      }}
                      animate={{ y: [0, 340], rotate: [0, 360 * (i % 2 === 0 ? 1 : -1)], opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 2 + (i % 4) * 0.4, delay: i * 0.12, ease: "easeIn" }}
                    />
                  ))}
                </div>

                {/* Zone name */}
                <div className="text-center">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-[hsl(45_90%_60%)] uppercase mb-1">
                    ⚡ Zone Secured!
                  </p>
                  <h2 className="text-lg font-black text-white">{episode.zoneName}</h2>
                </div>

                {/* Villain defeated card */}
                {villainCfg && (
                  <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 w-full"
                    style={{
                      borderColor: `hsla(${hue},60%,45%,0.25)`,
                      background: `hsla(${hue},35%,10%,0.8)`,
                    }}
                  >
                    <div
                      className="relative flex-shrink-0 rounded-xl overflow-hidden border-2"
                      style={{ width: 56, height: 56, borderColor: `hsla(${hue},60%,45%,0.4)` }}
                    >
                      <img
                        src={villainCfg.img}
                        alt={episode.villainName}
                        className="w-full h-full object-cover object-top grayscale opacity-60"
                        style={{ transform: "scale(1.5) translateY(6px)" }}
                      />
                      {/* Defeated X */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">❌</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wide">{episode.villainName}</p>
                      <p className="text-sm font-bold italic" style={{ color: `hsla(${hue},70%,65%,0.8)` }}>
                        {scene.completionMessage ?? `"No… this can't be happening!"` }
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* XP & badge */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-3 w-full"
                >
                  <div className="flex-1 rounded-xl border border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.08)] p-3 text-center">
                    <p className="text-[9px] text-white/40 uppercase tracking-wide mb-0.5">XP Earned</p>
                    <p className="text-xl font-black text-[hsl(45_90%_60%)]">
                      +{baseXp + totalXpBonus + (scene.xpReward ?? 0)}
                    </p>
                  </div>
                  {(scene.badge ?? badge) && (
                    <div className="flex-1 rounded-xl border border-[hsl(160_65%_50%/0.3)] bg-[hsl(160_65%_50%/0.08)] p-3 text-center">
                      <p className="text-lg">🏅</p>
                      <p className="text-[9px] font-bold text-[hsl(160_65%_55%)] leading-tight mt-0.5">
                        {scene.badge ?? badge}
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.button
                  onClick={handleEndingComplete}
                  className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wider text-black"
                  style={{ background: "hsl(45,90%,60%)" }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  ◄ Back to Map
                </motion.button>
              </>
            ) : (
              <>
                {/* Villain taunting on defeat */}
                {villainCfg && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="rounded-2xl overflow-hidden border-2 mx-auto"
                    style={{
                      width: 90, height: 90,
                      borderColor: `hsla(${hue},60%,45%,0.6)`,
                      background: `hsla(${hue},40%,10%,0.9)`,
                    }}
                  >
                    <img
                      src={villainCfg.img}
                      alt={episode.villainName}
                      className="w-full h-full object-cover object-top"
                      style={{ transform: "scale(1.5) translateY(8px)" }}
                    />
                  </motion.div>
                )}
                <div className="text-center">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-[hsl(0_80%_60%)] uppercase mb-2">
                    The Keybreaker wins this round…
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {scene.completionMessage ?? "Almost! You've got this — try again!"}
                  </p>
                </div>
                <div className="flex gap-3 w-full">
                  <motion.button
                    onClick={handleRetry}
                    className="flex-1 rounded-xl py-3 text-sm font-bold tracking-wider"
                    style={{ background: `hsla(${hue},50%,30%,0.5)`, border: `1px solid hsla(${hue},60%,50%,0.4)`, color: `hsla(${hue},70%,70%,1)` }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Try Again ↺
                  </motion.button>
                  <motion.button
                    onClick={handleEndingComplete}
                    className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-bold text-white/40 tracking-wider"
                    whileHover={{ scale: 1.02 }}
                  >
                    Skip →
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── INLINE MINI-GAME OVERLAY ── */}
      <AnimatePresence>
        {showMiniGame && scene.miniGameId && (
          <motion.div
            className="fixed inset-0 z-[60] bg-[#050a14]/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <MiniGamePlaceholder
              type={scene.miniGameId}
              title={scene.miniGameTitle ?? scene.miniGameId}
              description={scene.miniGameDescription ?? "Complete the challenge to continue the story!"}
              onComplete={() => handleMiniGameComplete()}
              villainName={episode.villainName}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
