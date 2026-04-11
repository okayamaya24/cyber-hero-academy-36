import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import LockAndLearn from "@/components/minigames/LockAndLearn";
import StrongOrSmash from "@/components/minigames/StrongOrSmash";
import WhoDoYouTrust from "@/components/minigames/WhoDoYouTrust";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import keybreakerImg from "@/assets/villains/keybreaker.png";
import type { EpisodeScene } from "@/data/zone1_password_peak";

/* ── Speaker color map ─────────────────────────── */
const SPEAKER_COLORS: Record<string, string> = {
  BYTE: "#00d4ff",
  "THE KEYBREAKER": "#00ff88",
  GUARDIAN: "#ffd700",
};

/* ── Character sprite with real images ─────────── */
function CharacterSprite({
  name,
  position,
  avatarConfig,
}: {
  name: string;
  position: "left" | "center" | "right";
  expression: string;
  avatarConfig?: Record<string, any> | null;
}) {
  const posClass =
    position === "left"
      ? "left-[4%] bottom-[8%]"
      : position === "right"
      ? "right-[4%] bottom-[8%]"
      : "left-1/2 bottom-[12%] -translate-x-1/2";

  const isByte       = name === "BYTE";
  const isKeybreaker = name.toUpperCase().includes("KEYBREAKER") || name.toUpperCase().includes("VILLAIN");
  const isPlayer     = !isByte && !isKeybreaker;

  const glowColor = isByte ? "#00d4ff" : isKeybreaker ? "#ff4466" : "#ffd700";
  const label     = isByte ? "BYTE" : isKeybreaker ? "KEYBREAKER" : "YOU";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.85 }}
      transition={{ type: "spring", damping: 18, stiffness: 180 }}
      className={`absolute ${posClass} z-10 flex flex-col items-center`}
    >
      {/* Glow ring behind character */}
      <motion.div
        animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: glowColor, opacity: 0.25 }}
      />

      {/* Character image or fallback */}
      <div className={`relative z-10 flex items-end justify-center ${position === "center" ? "w-72 h-96 md:w-96 md:h-[28rem]" : "w-48 h-60 md:w-64 md:h-80"}`}>
        {isByte ? (
          <img
            src="/byte-character.png"
            alt="Byte"
            className="h-full w-full object-contain drop-shadow-[0_0_24px_rgba(0,212,255,0.7)]"
          />
        ) : isKeybreaker ? (
          <img
            src={keybreakerImg}
            alt="The Keybreaker"
            className="h-full w-full object-contain object-top drop-shadow-[0_0_24px_rgba(255,68,102,0.7)]"
          />
        ) : (
          /* Player — their created hero avatar */
          <div className="flex flex-col items-center justify-end h-full">
            <HeroAvatar
              avatarConfig={avatarConfig}
              fallbackEmoji="🦸"
              size={240}
              className="drop-shadow-[0_0_16px_rgba(255,215,0,0.6)] max-h-full w-auto"
            />
          </div>
        )}
      </div>

      {/* Name badge */}
      <motion.span
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mt-1.5 rounded-lg px-2.5 py-0.5 text-[9px] font-black tracking-widest uppercase backdrop-blur-sm"
        style={{
          color: glowColor,
          background: `${glowColor}18`,
          border: `1px solid ${glowColor}40`,
        }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}

/* ── Typewriter hook ───────────────────────────── */
function useTypewriter(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;
    const interval = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  const skip = useCallback(() => {
    setDisplayed(text);
    setDone(true);
  }, [text]);

  return { displayed, done, skip };
}

/* ── Mini-game router — real games ─────────────── */
function MiniGameRouter({
  gameName,
  onComplete,
}: {
  gameName: string;
  onComplete: () => void;
}) {
  const wrapper = "fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto";

  const bg = { background: "linear-gradient(135deg, #050a14 0%, #0d1a2f 50%, #050a14 100%)" };

  if (gameName === "lock-and-learn") {
    return (
      <div className={wrapper} style={bg}>
        <div className="w-full max-w-md">
          <LockAndLearn onComplete={() => onComplete()} />
        </div>
      </div>
    );
  }

  if (gameName === "strong-or-smash") {
    return (
      <div className={wrapper} style={bg}>
        <div className="w-full max-w-md">
          <StrongOrSmash onComplete={() => onComplete()} />
        </div>
      </div>
    );
  }

  if (gameName === "who-do-you-trust") {
    return (
      <div className={wrapper} style={bg}>
        <div className="w-full max-w-lg">
          <WhoDoYouTrust onComplete={() => onComplete()} />
        </div>
      </div>
    );
  }

  /* Fallback for future games not yet built */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0a0e2a 0%, #1a1040 50%, #0d1a2f 100%)" }}
    >
      <div className="text-center px-6">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-6xl mb-6">
          🎮
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {gameName.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
        </h2>
        <p className="text-white/50 text-sm mb-8">Challenge coming soon!</p>
        <Button
          onClick={onComplete}
          className="bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-[#0a0e2a] font-bold text-lg px-8 py-3 rounded-xl hover:scale-105 transition-transform border-0"
        >
          ✅ Continue
        </Button>
      </div>
    </motion.div>
  );
}

/* ── Completion screen ─────────────────────────── */
function CompletionScreen({
  xp,
  badge,
  message,
  onReturn,
}: {
  xp: number;
  badge: string;
  message: string;
  onReturn: () => void;
}) {
  const [xpCount, setXpCount] = useState(0);

  useEffect(() => {
    let n = 0;
    const step = Math.ceil(xp / 40);
    const id = setInterval(() => {
      n = Math.min(n + step, xp);
      setXpCount(n);
      if (n >= xp) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [xp]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0a2a1a 0%, #1a4a2a 50%, #0d3a1f 100%)" }}
    >
      {/* Particle celebration */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ["#00d4ff", "#00ff88", "#ffd700", "#ff6b8a"][i % 4],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100 - Math.random() * 200],
            opacity: [1, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 18 }}
        className="relative w-full max-w-md rounded-3xl border border-[#00ff88]/30 bg-[#0a1a14]/90 p-8 backdrop-blur-lg shadow-[0_0_80px_rgba(0,255,136,0.15)]"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">ZONE COMPLETE!</h2>
          <p className="text-white/60 text-sm mb-6">{message}</p>

          <div className="flex gap-4 justify-center mb-6">
            <div className="rounded-2xl border border-[#ffd700]/30 bg-[#ffd700]/10 px-6 py-4 text-center">
              <Zap className="w-5 h-5 text-[#ffd700] mx-auto mb-1" />
              <p className="text-2xl font-bold text-[#ffd700] tabular-nums">+{xpCount}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">XP Earned</p>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="rounded-2xl border border-[#00ff88]/30 bg-[#00ff88]/10 px-6 py-4 text-center"
            >
              <Award className="w-5 h-5 text-[#00ff88] mx-auto mb-1" />
              <p className="text-sm font-bold text-[#00ff88]">🏅 {badge}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">New Badge</p>
            </motion.div>
          </div>

          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3].map((s) => (
              <motion.span
                key={s}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + s * 0.15, type: "spring" }}
                className="text-2xl"
              >
                ⭐
              </motion.span>
            ))}
          </div>

          <Button
            onClick={onReturn}
            className="w-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-[#0a0e2a] font-bold text-lg rounded-xl hover:scale-105 transition-transform border-0"
          >
            🗺️ Return to Map
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main EpisodePlayer ────────────────────────── */
interface EpisodePlayerProps {
  scenes: EpisodeScene[];
  playerName: string;
  avatarConfig?: Record<string, any> | null;
  onComplete: (xp: number, badge: string) => void;
  onExit: () => void;
}

export default function EpisodePlayer({ scenes, playerName, avatarConfig, onComplete, onExit }: EpisodePlayerProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [extraDialogue, setExtraDialogue] = useState<string | null>(null);
  const [showExtra, setShowExtra] = useState(false);

  const scene = scenes[sceneIndex];
  if (!scene) return null;

  // Replace GUARDIAN name
  const resolvedCharacters = scene.characters?.map((c) =>
    c.name === "GUARDIAN" ? { ...c, name: playerName.toUpperCase() } : c,
  );

  const speakerLabel = scene.speaker === "GUARDIAN" ? playerName : scene.speaker;
  const speakerColor = scene.speaker === "GUARDIAN" ? SPEAKER_COLORS.GUARDIAN : (SPEAKER_COLORS[scene.speaker] || "#fff");

  // Ending screen
  if (scene.isEnding) {
    return (
      <CompletionScreen
        xp={scene.xpReward || 0}
        badge={scene.badge || ""}
        message={scene.completionMessage || "Zone complete!"}
        onReturn={() => onComplete(scene.xpReward || 0, scene.badge || "")}
      />
    );
  }

  // Mini-game
  if (showMiniGame && scene.miniGame) {
    return (
      <MiniGameRouter
        gameName={scene.miniGame}
        onComplete={() => {
          setShowMiniGame(false);
          if (scene.nextScene !== undefined) setSceneIndex(scene.nextScene);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex flex-col" style={{ background: scene.background }}>
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.1) 2px, rgba(0,212,255,0.1) 4px)",
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/10 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="h-4 w-4" /> EXIT
        </button>
        <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
          Scene {sceneIndex + 1} / {scenes.length}
        </span>
      </div>

      {/* Characters area (top 60%) */}
      <div className="relative flex-1 z-[5]">
        <AnimatePresence mode="wait">
          {resolvedCharacters?.map((char) => (
            <CharacterSprite
              key={`${sceneIndex}-${char.name}-${char.position}`}
              name={char.name}
              position={char.position}
              expression={char.expression}
              avatarConfig={avatarConfig}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Dialogue box (bottom 40%) */}
      <motion.div
        key={sceneIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 border-t border-white/10 bg-[#0a0e1a]/90 backdrop-blur-xl"
        style={{ minHeight: "35%" }}
      >
        <div className="px-5 pt-4 pb-6 max-w-2xl mx-auto">
          {/* Speaker label */}
          <span
            className="inline-block rounded-lg px-3 py-1 text-[11px] font-bold tracking-wider uppercase mb-3"
            style={{
              color: speakerColor,
              background: `${speakerColor}15`,
              border: `1px solid ${speakerColor}30`,
            }}
          >
            {speakerLabel}
          </span>

          {/* Dialogue text */}
          {showExtra && extraDialogue ? (
            <ExtraDialogueView
              mainText={scene.dialogue}
              extraText={extraDialogue}
              onDone={() => {
                setShowExtra(false);
                setExtraDialogue(null);
                if (scene.miniGame) {
                  setShowMiniGame(true);
                } else if (scene.nextScene !== undefined) {
                  setSceneIndex(scene.nextScene);
                }
              }}
            />
          ) : (
            <DialogueView
              text={scene.dialogue}
              hasChoices={!!scene.choices?.length}
              hasMiniGame={!!scene.miniGame}
              onAdvance={() => {
                if (scene.miniGame) {
                  setShowMiniGame(true);
                } else if (scene.nextScene !== undefined) {
                  setSceneIndex(scene.nextScene);
                }
              }}
            />
          )}

          {/* Choices */}
          {scene.choices && !showExtra && (
            <ChoicesView
              choices={scene.choices}
              onSelect={(choice) => {
                if (choice.extraDialogue) {
                  setExtraDialogue(choice.extraDialogue);
                  setShowExtra(true);
                } else {
                  setSceneIndex(choice.nextScene);
                }
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Dialogue with typewriter ──────────────────── */
function DialogueView({
  text,
  hasChoices,
  hasMiniGame,
  onAdvance,
}: {
  text: string;
  hasChoices: boolean;
  hasMiniGame: boolean;
  onAdvance: () => void;
}) {
  const { displayed, done, skip } = useTypewriter(text);

  const handleClick = useCallback(() => {
    if (!done) {
      skip();
    } else if (!hasChoices) {
      onAdvance();
    }
  }, [done, hasChoices, skip, onAdvance]);

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

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <p className="text-white/90 text-sm md:text-base leading-relaxed min-h-[3rem]">
        {displayed}
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="ml-0.5 inline-block text-[#00d4ff]"
          >
            ▌
          </motion.span>
        )}
      </p>
      {done && !hasChoices && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/30 text-xs mt-3"
        >
          {hasMiniGame ? "▶ Tap to start challenge" : "▶ Tap to continue"}
        </motion.p>
      )}
    </div>
  );
}

/* ── Extra dialogue (after choice with extra text) */
function ExtraDialogueView({
  mainText,
  extraText,
  onDone,
}: {
  mainText: string;
  extraText: string;
  onDone: () => void;
}) {
  const { displayed, done, skip } = useTypewriter(extraText);

  const handleClick = useCallback(() => {
    if (!done) skip();
    else onDone();
  }, [done, skip, onDone]);

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

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <p className="text-white/50 text-sm mb-2">{mainText}</p>
      <p className="text-[#00d4ff] text-sm md:text-base leading-relaxed">
        💬 {displayed}
        {!done && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="ml-0.5 inline-block"
          >
            ▌
          </motion.span>
        )}
      </p>
      {done && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/30 text-xs mt-3">
          ▶ Tap to continue
        </motion.p>
      )}
    </div>
  );
}

/* ── Choice buttons ────────────────────────────── */
function ChoicesView({
  choices,
  onSelect,
}: {
  choices: NonNullable<EpisodeScene["choices"]>;
  onSelect: (choice: NonNullable<EpisodeScene["choices"]>[0]) => void;
}) {
  const { done } = useTypewriter(""); // just to wait for dialogue

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-4 flex flex-col gap-2"
    >
      {choices.map((choice, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.15 }}
          onClick={() => onSelect(choice)}
          className="w-full text-left rounded-xl border border-[#00d4ff]/30 bg-[#00d4ff]/5 px-4 py-3 text-sm font-medium text-white/90 hover:bg-[#00d4ff]/15 hover:border-[#00d4ff]/50 hover:scale-[1.02] transition-all backdrop-blur-sm"
        >
          <span className="text-[#00d4ff] mr-2">▸</span>
          {choice.text}
        </motion.button>
      ))}
    </motion.div>
  );
}
