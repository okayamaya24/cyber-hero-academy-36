import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import byteSrc from "@/assets/byte-sidekick.png";
import keybreakerSrc from "@/assets/keybreaker-villain.png";
import bgPasswordPlains from "@/assets/bg-password-plains.jpg";
import type { SceneEntry, CharacterSlot } from "@/data/zone1Script";

/* ── backgrounds map ── */
const BACKGROUNDS: Record<string, string> = {
  "password-plains": bgPasswordPlains,
};

/* ── speaker colours ── */
const SPEAKER_COLORS: Record<string, string> = {
  byte: "text-cyan-400",
  keybreaker: "text-purple-400",
  guardian: "text-amber-400",
  narrator: "text-white/60 italic",
};

const SPEAKER_LABELS: Record<string, string> = {
  byte: "Byte",
  keybreaker: "The Keybreaker",
  guardian: "Guardian",
  narrator: "",
};

/* ── props ── */
interface SceneEngineProps {
  script: SceneEntry[];
  heroSrc?: string | null;
  miniGameConfig: any;
  renderMiniGame: (type: string, fast: boolean, onComplete: () => void) => React.ReactNode;
  onComplete: () => void;
}

export default function SceneEngine({
  script,
  heroSrc,
  miniGameConfig,
  renderMiniGame,
  onComplete,
}: SceneEngineProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [textDone, setTextDone] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scene = script.find((s) => s.id === sceneIndex);

  /* ── typewriter effect ── */
  useEffect(() => {
    if (!scene || scene.type === "minigame") return;
    if (scene.type === "choice") {
      setDisplayedText(scene.text);
      setTextDone(true);
      return;
    }

    setDisplayedText("");
    setTextDone(false);
    let i = 0;
    const full = scene.text;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      i++;
      setDisplayedText(full.slice(0, i));
      if (i >= full.length) {
        setTextDone(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 25);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sceneIndex, scene?.id]);

  /* ── advance to next scene ── */
  const advance = useCallback(() => {
    if (!scene) return;
    // If typewriter not done, skip to end
    if (!textDone && scene.type === "dialogue") {
      if (timerRef.current) clearInterval(timerRef.current);
      setDisplayedText(scene.text);
      setTextDone(true);
      return;
    }
    const nextId = scene.next !== undefined ? scene.next : scene.id + 1;
    if (nextId === -1) {
      onComplete();
      return;
    }
    // skip empty narrator scenes
    const nextScene = script.find((s) => s.id === nextId);
    if (nextScene && nextScene.speaker === "narrator" && nextScene.text === "") {
      const afterId = nextScene.next !== undefined ? nextScene.next : nextScene.id + 1;
      setSceneIndex(afterId);
    } else {
      setSceneIndex(nextId);
    }
  }, [scene, textDone, onComplete, script]);

  /* ── handle choice ── */
  const handleChoice = (nextId: number) => {
    setSceneIndex(nextId);
  };

  /* ── handle minigame entry ── */
  useEffect(() => {
    if (scene?.type === "minigame") {
      setShowMiniGame(true);
    }
  }, [scene?.type, scene?.id]);

  const handleMiniGameDone = useCallback(() => {
    setShowMiniGame(false);
    if (!scene) return;
    const nextId = scene.next !== undefined ? scene.next : scene.id + 1;
    setSceneIndex(nextId);
  }, [scene]);

  if (!scene) {
    onComplete();
    return null;
  }

  /* ── mini game fullscreen ── */
  if (showMiniGame && scene.type === "minigame") {
    return (
      <div className="fixed inset-0 z-50 bg-[hsl(220,30%,8%)]">
        {renderMiniGame(scene.miniGameType || "", !!scene.miniGameFast, handleMiniGameDone)}
      </div>
    );
  }

  const bg = scene.background
    ? BACKGROUNDS[scene.background] || BACKGROUNDS["password-plains"]
    : BACKGROUNDS["password-plains"];

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[hsl(220,30%,8%)]" onClick={scene.type === "dialogue" ? advance : undefined}>
      {/* ── Scene area (top 60%) ── */}
      <div className="relative flex-[6] overflow-hidden">
        {/* Background */}
        <AnimatePresence mode="wait">
          <motion.img
            key={bg}
            src={bg}
            alt="Scene background"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        </AnimatePresence>

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,30%,8%)] via-transparent to-transparent" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400/40"
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 20}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.5, delay: i * 0.3 }}
          />
        ))}

        {/* Characters */}
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-4 sm:px-12 sm:pb-8">
          {/* Left character */}
          <CharacterSprite
            slot={scene.characterLeft}
            heroSrc={heroSrc}
            isSpeaking={scene.speakerSide === "left"}
            side="left"
          />
          {/* Right character */}
          <CharacterSprite
            slot={scene.characterRight}
            heroSrc={heroSrc}
            isSpeaking={scene.speakerSide === "right"}
            side="right"
          />
        </div>
      </div>

      {/* ── Dialogue area (bottom 40%) ── */}
      <div className="relative flex-[4] flex flex-col justify-end">
        <div className="relative mx-2 mb-3 sm:mx-6 sm:mb-6">
          <AnimatePresence mode="wait">
            {scene.type === "choice" ? (
              <motion.div
                key={`choice-${scene.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="rounded-2xl border border-cyan-400/20 bg-[hsl(220,30%,10%)]/90 p-4 sm:p-6 backdrop-blur-lg"
              >
                {/* Question */}
                <p className="mb-4 text-center text-sm font-bold text-white/80 sm:text-base">
                  {scene.text}
                </p>
                {/* Choice buttons */}
                <div className="space-y-3">
                  {scene.choices?.map((choice, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChoice(choice.next);
                      }}
                      className="w-full rounded-xl border-2 border-cyan-400/30 bg-cyan-400/5 px-4 py-3 text-left text-sm font-semibold text-white transition-all hover:border-cyan-400/60 hover:bg-cyan-400/10 hover:shadow-[0_0_20px_hsl(185_80%_48%/0.15)] active:scale-[0.98] sm:text-base"
                    >
                      {choice.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`dialogue-${scene.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/10 bg-[hsl(220,30%,10%)]/90 p-4 sm:p-6 backdrop-blur-lg"
              >
                {/* Speaker name */}
                {scene.speaker !== "narrator" && (
                  <p className={`mb-1 text-xs font-extrabold uppercase tracking-wider ${SPEAKER_COLORS[scene.speaker]}`}>
                    {SPEAKER_LABELS[scene.speaker]}
                  </p>
                )}
                {/* Dialogue text */}
                <p
                  className={`text-sm leading-relaxed sm:text-base ${
                    scene.speaker === "narrator" ? "italic text-white/60" : "text-white"
                  }`}
                >
                  {displayedText}
                  {!textDone && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                      className="ml-0.5 inline-block h-4 w-0.5 bg-white"
                    />
                  )}
                </p>
                {/* Tap to continue */}
                {textDone && (
                  <motion.p
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="mt-2 text-right text-[10px] font-bold text-cyan-400/60"
                  >
                    Tap to continue ▸
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Character Sprite ── */
function CharacterSprite({
  slot,
  heroSrc,
  isSpeaking,
  side,
}: {
  slot?: CharacterSlot;
  heroSrc?: string | null;
  isSpeaking: boolean;
  side: "left" | "right";
}) {
  if (!slot) return <div className="w-24 sm:w-32" />;

  let src: string | null = null;
  if (slot === "byte") src = byteSrc;
  else if (slot === "keybreaker") src = keybreakerSrc;
  else if (slot === "guardian") src = heroSrc || null;

  if (!src) {
    // fallback emoji for guardian without avatar
    return (
      <motion.div
        className={`flex h-24 w-24 items-center justify-center text-5xl sm:h-32 sm:w-32 transition-opacity ${
          isSpeaking ? "opacity-100" : "opacity-40"
        }`}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
      >
        🦸
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
    >
      {/* Speaking glow */}
      {isSpeaking && (
        <motion.div
          className="absolute -inset-2 rounded-full"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            background:
              slot === "keybreaker"
                ? "radial-gradient(circle, hsl(280 80% 60% / 0.3), transparent 70%)"
                : slot === "byte"
                  ? "radial-gradient(circle, hsl(185 80% 48% / 0.3), transparent 70%)"
                  : "radial-gradient(circle, hsl(45 90% 60% / 0.3), transparent 70%)",
          }}
        />
      )}
      <motion.img
        src={src}
        alt={slot}
        className={`relative h-24 w-24 object-contain drop-shadow-lg transition-opacity duration-300 sm:h-32 sm:w-32 ${
          isSpeaking ? "opacity-100" : "opacity-40"
        } ${side === "right" && slot === "keybreaker" ? "" : ""}`}
        style={side === "right" ? { transform: "scaleX(-1)" } : undefined}
        draggable={false}
      />
    </motion.div>
  );
}
