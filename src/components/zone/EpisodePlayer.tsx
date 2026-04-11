/**
 * Zone-aware EpisodePlayer wrapper.
 * Re-exports the core EpisodePlayer with the interface ZoneGameScreen expects.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Star, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import MiniGamePlaceholder from "@/components/minigames/MiniGamePlaceholder";
import type { EpisodeScene } from "@/data/zone1_password_peak";

/* ── Types ── */
export interface EpisodeData {
  title: string;
  scenes: EpisodeScene[];
}

export interface EpisodeResult {
  endingType: "victory" | "defeat";
  xpEarned: number;
  badge?: string;
}

interface Props {
  episode: EpisodeData;
  baseXp: number;
  badge?: string;
  onComplete: (result: EpisodeResult) => void;
  onSkip: () => void;
}

/* ── Speaker color map ── */
const SPEAKER_COLORS: Record<string, string> = {
  BYTE: "#00d4ff",
  "THE KEYBREAKER": "#00ff88",
  GUARDIAN: "#ffd700",
};

/* ── Character sprite ── */
function CharacterSprite({ name, position, expression }: { name: string; position: "left" | "center" | "right"; expression: string }) {
  const posClass = position === "left" ? "left-[8%]" : position === "right" ? "right-[8%]" : "left-1/2 -translate-x-1/2";
  const expressionEmoji: Record<string, string> = { happy: "😊", neutral: "😐", scared: "😰", angry: "😠", determined: "💪" };
  const charEmoji: Record<string, string> = { BYTE: "🦊", "THE KEYBREAKER": "🦹", GUARDIAN: "🦸" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`absolute bottom-[30%] ${posClass}`}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-6xl md:text-7xl">{charEmoji[name] || "👤"}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: SPEAKER_COLORS[name] || "#fff", background: "rgba(0,0,0,0.5)" }}>
          {name} {expressionEmoji[expression] || ""}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Typewriter hook ── */
function useTypewriter(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  const skip = useCallback(() => { setDisplayed(text); setDone(true); }, [text]);
  return { displayed, done, skip };
}

/* ── Main component ── */
export default function EpisodePlayer({ episode, baseXp, badge, onComplete, onSkip }: Props) {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [extraDialogue, setExtraDialogue] = useState<string | null>(null);
  const scene = episode.scenes[sceneIdx];

  const { displayed, done, skip: skipTypewriter } = useTypewriter(
    extraDialogue || scene?.dialogue || "", 25
  );

  if (!scene) return null;

  const advance = (nextIdx?: number) => {
    setExtraDialogue(null);
    const target = nextIdx ?? scene.nextScene;
    if (target === undefined || target >= episode.scenes.length) return;
    const next = episode.scenes[target];
    if (next.isEnding) {
      setSceneIdx(target);
      setShowCompletion(true);
      return;
    }
    if (next.miniGame) {
      setSceneIdx(target);
      setShowMiniGame(true);
      return;
    }
    setSceneIdx(target);
  };

  const handleClick = () => {
    if (!done) { skipTypewriter(); return; }
    if (extraDialogue) { setExtraDialogue(null); return; }
    if (scene.choices) return; // must pick
    if (scene.miniGame && !showMiniGame) { setShowMiniGame(true); return; }
    advance();
  };

  const handleChoice = (choice: { text: string; nextScene: number; extraDialogue?: string }) => {
    if (choice.extraDialogue) {
      setExtraDialogue(choice.extraDialogue);
      // After extra dialogue, clicking will advance to choice.nextScene
      setTimeout(() => {
        const handler = () => { advance(choice.nextScene); document.removeEventListener("click", handler); };
        document.addEventListener("click", handler, { once: true });
      }, 100);
      return;
    }
    advance(choice.nextScene);
  };

  const handleMiniGameComplete = (passed: boolean) => {
    setShowMiniGame(false);
    if (passed) advance();
  };

  // Mini-game screen
  if (showMiniGame && scene.miniGame) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0e1a]">
        <MiniGamePlaceholder
          type={scene.miniGame}
          title={scene.miniGame.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          description="Complete this challenge to continue the story!"
          onComplete={handleMiniGameComplete}
        />
      </div>
    );
  }

  // Completion screen
  if (showCompletion) {
    const xp = scene.xpReward || baseXp || 100;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            <Star className="w-20 h-20 text-yellow-400 mx-auto" fill="currentColor" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">Zone Complete!</h1>
          <p className="text-white/70 max-w-md">{scene.completionMessage || scene.dialogue}</p>
          <div className="flex gap-6 justify-center">
            <div className="flex items-center gap-2 text-[#00d4ff]"><Zap className="w-5 h-5" /> +{xp} XP</div>
            {(scene.badge || badge) && <div className="flex items-center gap-2 text-[#ffd700]"><Award className="w-5 h-5" /> {scene.badge || badge}</div>}
          </div>
          <Button onClick={() => onComplete({ endingType: "victory", xpEarned: xp, badge: scene.badge || badge })}
            className="bg-[#00d4ff] hover:bg-[#00b8e0] text-black font-bold px-8 py-3 text-lg">
            Return to Map
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden cursor-pointer" onClick={handleClick}
      style={{ background: scene.background || "#0a0e1a" }}>
      {/* Skip button */}
      <button onClick={(e) => { e.stopPropagation(); onSkip(); }}
        className="absolute top-4 right-4 z-50 text-white/50 hover:text-white text-sm px-3 py-1 rounded border border-white/20">
        Skip Episode ▸
      </button>

      {/* Characters */}
      <AnimatePresence mode="wait">
        {scene.characters?.map((c) => (
          <CharacterSprite key={`${c.name}-${sceneIdx}`} name={c.name} position={c.position} expression={c.expression} />
        ))}
      </AnimatePresence>

      {/* Dialogue box */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16 pb-6 px-6" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-3xl mx-auto" onClick={handleClick}>
          {scene.speaker && (
            <span className="text-sm font-bold px-3 py-1 rounded-t" style={{ color: SPEAKER_COLORS[scene.speaker] || "#fff" }}>
              {scene.speaker}
            </span>
          )}
          <div className="bg-black/60 backdrop-blur-md rounded-xl p-5 border border-white/10 mt-1">
            <p className="text-white text-base md:text-lg leading-relaxed min-h-[3rem]">{displayed}</p>
            {!done && <span className="inline-block w-2 h-5 bg-[#00d4ff] animate-pulse ml-1" />}
          </div>

          {/* Choices */}
          {done && !extraDialogue && scene.choices && (
            <div className="flex flex-col gap-3 mt-4">
              {scene.choices.map((c, i) => (
                <Button key={i} variant="outline" onClick={(e) => { e.stopPropagation(); handleChoice(c); }}
                  className="border-[#00d4ff]/40 hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 text-white text-left justify-start py-3 px-5">
                  {c.text}
                </Button>
              ))}
            </div>
          )}

          {!done && <p className="text-white/30 text-xs mt-2 text-center">Tap to skip</p>}
          {done && !scene.choices && <p className="text-white/30 text-xs mt-2 text-center">Tap to continue ▸</p>}
        </div>
      </div>
    </motion.div>
  );
}
