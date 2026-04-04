import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, CheckCircle2, XCircle, ChevronRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WORLDS, getDifficultyTier, type ZoneContent } from "@/data/adventureZones";
import LockAndLearnGame from "@/components/minigames/LockAndLearnGame";
import StrongOrSmashGame from "@/components/minigames/StrongOrSmashGame";
import PasswordChefGame from "@/components/minigames/PasswordChefGame";
import WhoDoYouTrustGame from "@/components/minigames/WhoDoYouTrustGame";
import KeyMatcherGame from "@/components/minigames/KeyMatcherGame";
import RealOrFakeGame from "@/components/minigames/RealOrFakeGame";
import SceneEngine from "@/components/adventure/SceneEngine";
import ZONE1_SCRIPT from "@/data/zone1Script";

type Screen = "threat-alert" | "battle" | "fireback" | "victory" | "defeat";
type VillainMood = "idle" | "attacking" | "laughing" | "stumbling" | "defeated";
type ByteMood = "idle" | "panicked" | "worried" | "cheering" | "sad";

const MAX_LIVES = 3;
const MAX_THREAT = 100;
const THREAT_DRAIN_PER_SECOND = 1.5;
const THREAT_ON_WRONG = 20;
const THREAT_REPAIR_ON_CORRECT = 12;

export default function ZoneExperiencePage() {
  const { worldId, zoneId } = useParams<{ worldId: string; zoneId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeChildId } = useAuth();

  // Screen state
  const [screen, setScreen] = useState<Screen>("threat-alert");
  const [alertCountdown, setAlertCountdown] = useState(5);

  // Battle state
  const [threat, setThreat] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [miniGameDone, setMiniGameDone] = useState(false);
  const [villainMood, setVillainMood] = useState<VillainMood>("idle");
  const [byteMood, setByteMood] = useState<ByteMood>("idle");
  const [byteMsg, setByteMsg] = useState<string | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [lockCracks, setLockCracks] = useState(0); // 0-5 crack levels

  // Fire back (questions) state
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [fireEffect, setFireEffect] = useState<"hit" | "miss" | null>(null);

  const threatRef = useRef(threat);
  threatRef.current = threat;
  const livesRef = useRef(lives);
  livesRef.current = lives;

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("child_profiles")
        .select("age, points")
        .eq("id", activeChildId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const world = WORLDS.find((w) => w.id === worldId);
  const zone = world?.zones.find((z) => z.id === zoneId);
  const tier = child ? getDifficultyTier(child.age) : "hero";
  const content: ZoneContent | undefined = zone?.content[tier];
  const currentZoneIndex = world?.zones.findIndex((z) => z.id === zoneId) ?? -1;
  const nextZone = world?.zones[currentZoneIndex + 1] ?? null;

  // ── THREAT ALERT countdown ──
  useEffect(() => {
    if (screen !== "threat-alert") return;
    if (alertCountdown <= 0) {
      setScreen("battle");
      setVillainMood("attacking");
      setByteMood("panicked");
      setByteMsg("He's breaking in RIGHT NOW — stop him! 🚨");
      return;
    }
    const t = setTimeout(() => setAlertCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, alertCountdown]);

  // ── THREAT BAR drain during battle ──
  useEffect(() => {
    if (screen !== "battle") return;
    const interval = setInterval(() => {
      setThreat((prev) => {
        const next = Math.min(MAX_THREAT, prev + THREAT_DRAIN_PER_SECOND);
        setLockCracks(Math.floor((next / MAX_THREAT) * 5));
        if (next >= MAX_THREAT) {
          clearInterval(interval);
          handleLifeLost();
        }
        // Update villain mood based on threat level
        if (next > 70) {
          setVillainMood("attacking");
          setByteMood("panicked");
          setByteMsg("He's almost through! HURRY! 😱");
        } else if (next > 40) {
          setVillainMood("attacking");
          setByteMood("worried");
          setByteMsg("Keep going — don't let him crack it!");
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen]);

  const handleLifeLost = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 600);
    setVillainMood("laughing");
    setByteMood("sad");

    const newLives = livesRef.current - 1;
    setLives(newLives);

    if (newLives <= 0) {
      setScreen("defeat");
    } else {
      setByteMsg(`He broke through! ${newLives} ${newLives === 1 ? "life" : "lives"} left — push him back! 💪`);
      setThreat(0);
      setLockCracks(0);
      setTimeout(() => {
        setVillainMood("attacking");
        setByteMood("worried");
      }, 1500);
    }
  }, []);

  const handleMiniGameComplete = useCallback(() => {
    setMiniGameDone(true);
    setVillainMood("stumbling");
    setByteMood("cheering");
    setByteMsg("You pushed him back! Now FIRE BACK with everything you've got! ⚡");
    setTimeout(() => {
      setScreen("fireback");
      setVillainMood("attacking");
      setByteMood("worried");
      setByteMsg(null);
    }, 2000);
  }, []);

  // Called from mini game when player gets something right/wrong
  const handleMiniGameHit = useCallback((correct: boolean) => {
    if (correct) {
      setThreat((prev) => {
        const next = Math.max(0, prev - THREAT_REPAIR_ON_CORRECT);
        setLockCracks(Math.floor((next / MAX_THREAT) * 5));
        return next;
      });
      setVillainMood("stumbling");
      setByteMood("cheering");
      setByteMsg("Nice! He's stumbling! 💥");
      setTimeout(() => {
        setVillainMood("attacking");
        setByteMood("worried");
        setByteMsg(null);
      }, 800);
    } else {
      setThreat((prev) => {
        const next = Math.min(MAX_THREAT, prev + THREAT_ON_WRONG);
        setLockCracks(Math.floor((next / MAX_THREAT) * 5));
        return next;
      });
      setVillainMood("laughing");
      setByteMood("panicked");
      setByteMsg("Wrong! He's getting stronger! 😰");
      setScreenShake(true);
      setTimeout(() => {
        setScreenShake(false);
        setVillainMood("attacking");
        setByteMood("worried");
        setByteMsg(null);
      }, 800);
    }
  }, []);

  // ── FIRE BACK (questions) ──
  const handleAnswer = (idx: number) => {
    if (answered !== null || !content) return;
    setAnswered(idx);
    const correct = idx === content.questions[currentQ].correctIndex;
    if (correct) {
      setScore((s) => s + 1);
      setFireEffect("hit");
      setVillainMood("stumbling");
      setByteMood("cheering");
      setByteMsg("DIRECT HIT! He's reeling! 💥");
      setThreat((prev) => Math.max(0, prev - THREAT_REPAIR_ON_CORRECT));
    } else {
      setFireEffect("miss");
      setVillainMood("laughing");
      setByteMood("panicked");
      setByteMsg("He dodged it! Don't let him recover! 😰");
      setThreat((prev) => Math.min(MAX_THREAT, prev + THREAT_ON_WRONG));
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 600);
    }

    setTimeout(() => {
      setFireEffect(null);
      setAnswered(null);
      const totalQ = content.questions.length;
      if (currentQ + 1 >= totalQ) {
        const fs = correct ? score + 1 : score;
        setFinalScore(fs);
        handleZoneComplete(fs, totalQ);
      } else {
        setCurrentQ((q) => q + 1);
        setVillainMood("attacking");
        setByteMood("worried");
        setByteMsg(null);
      }
    }, 1200);
  };

  const handleZoneComplete = async (fs: number, totalQ: number) => {
    const stars = fs === totalQ ? 3 : fs >= totalQ * 0.6 ? 2 : 1;
    setVillainMood("defeated");
    setByteMood("cheering");
    setByteMsg("YOU DID IT! He's DEFEATED! 🎉🎉🎉");

    setTimeout(() => setScreen("victory"), 1500);

    if (activeChildId && content) {
      await supabase.from("mission_progress").upsert(
        {
          child_id: activeChildId,
          mission_id: `${worldId}-${zoneId}`,
          status: "completed",
          score: fs,
          max_score: totalQ,
          stars_earned: stars,
          completed_at: new Date().toISOString(),
          current_question: totalQ,
        },
        { onConflict: "child_id,mission_id" },
      );
      await supabase.from("zone_progress").upsert(
        {
          child_id: activeChildId,
          continent_id: worldId!,
          zone_id: zoneId!,
          status: "completed",
          stars_earned: stars,
          games_completed: 4,
          total_games: 4,
        },
        { onConflict: "child_id,zone_id" },
      );
      const newPoints = (child?.points ?? 0) + (content?.xpReward ?? 0);
      await supabase.from("child_profiles").update({ points: newPoints }).eq("id", activeChildId);
      queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
      queryClient.invalidateQueries({ queryKey: ["mission_progress", activeChildId] });
      queryClient.invalidateQueries({ queryKey: ["zone_progress", activeChildId, worldId] });
    }
  };

  const handleRetry = () => {
    setScreen("threat-alert");
    setAlertCountdown(5);
    setThreat(0);
    setLives(MAX_LIVES);
    setLockCracks(0);
    setMiniGameDone(false);
    setCurrentQ(0);
    setScore(0);
    setFinalScore(0);
    setAnswered(null);
    setFireEffect(null);
    setVillainMood("idle");
    setByteMood("idle");
    setByteMsg(null);
  };

  const handleNextZone = () => {
    if (nextZone) {
      navigate(`/adventure/${worldId}/${nextZone.id}`);
    } else {
      navigate(`/adventure/${worldId}`);
    }
  };

  if (!world || !zone || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Zone not found.</p>
      </div>
    );
  }

  const totalQ = content.questions.length;
  const stars = finalScore === totalQ ? 3 : finalScore >= totalQ * 0.6 ? 2 : 1;

  const renderMiniGame = () => {
    const cfg = content.miniGame;
    switch (cfg.type) {
      case "lock-and-learn":
        return <LockAndLearnGame config={cfg} onComplete={handleMiniGameComplete} />;
      case "strong-or-smash":
        return <StrongOrSmashGame config={cfg} onComplete={handleMiniGameComplete} />;
      case "password-chef":
        return <PasswordChefGame config={cfg} onComplete={handleMiniGameComplete} />;
      case "who-do-you-trust":
        return <WhoDoYouTrustGame config={cfg} onComplete={handleMiniGameComplete} />;
      case "key-matcher":
        return <KeyMatcherGame config={cfg} onComplete={handleMiniGameComplete} />;
      case "real-or-fake":
        return <RealOrFakeGame config={cfg} onComplete={handleMiniGameComplete} />;
      default:
        return <div className="text-center text-white/60">Mini game coming soon!</div>;
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-[hsl(220,30%,8%)] text-white pb-24 overflow-hidden"
      animate={screenShake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${world.color} py-4`}>
        <div className="container mx-auto flex items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/adventure/${worldId}`)}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">
              {zone.emoji} {zone.name}
            </h1>
            <p className="text-xs text-white/70">{world.name}</p>
          </div>
          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur">
            Zone {currentZoneIndex + 1} of {world.zones.length}
          </div>
        </div>
      </div>

      <div className="container mx-auto mt-4 max-w-2xl px-4 space-y-4">
        {/* ── THREAT ALERT ── */}
        <AnimatePresence>
          {screen === "threat-alert" && (
            <motion.div
              key="threat-alert"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-3xl border-2 border-red-500/50 bg-red-950/40 p-8 text-center backdrop-blur"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="text-6xl"
              >
                🚨
              </motion.div>
              <h2 className="mt-4 text-3xl font-extrabold text-red-400">THREAT DETECTED!</h2>
              <p className="mt-2 text-white/70">
                {world.villain} is attacking {zone.name}!
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="text-white/50 text-sm">Battle starts in</span>
                <motion.span
                  key={alertCountdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-5xl font-extrabold text-red-400"
                >
                  {alertCountdown}
                </motion.span>
              </div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="mt-4 text-sm font-bold text-red-300"
              >
                GET READY GUARDIAN!
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BATTLE PHASE ── */}
        {(screen === "battle" || screen === "fireback") && (
          <>
            {/* Battle HUD */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
              <div className="flex items-center gap-4">
                {/* Lives */}
                <div className="flex gap-1">
                  {Array.from({ length: MAX_LIVES }).map((_, i) => (
                    <Shield
                      key={i}
                      className={`h-6 w-6 ${i < lives ? "fill-cyan-400 text-cyan-400" : "text-white/20"}`}
                    />
                  ))}
                </div>

                {/* Threat bar — lock cracking */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-xs font-bold">
                    <span className="text-white/50">🔒 LOCK INTEGRITY</span>
                    <span
                      className={threat > 70 ? "text-red-400" : threat > 40 ? "text-amber-400" : "text-emerald-400"}
                    >
                      {Math.round(100 - threat)}%
                    </span>
                  </div>
                  <div className="relative h-4 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className={`absolute inset-y-0 left-0 rounded-full transition-colors ${
                        threat > 70 ? "bg-red-500" : threat > 40 ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                      animate={{ width: `${threat}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    {/* Crack marks */}
                    {lockCracks >= 1 && <div className="absolute inset-y-0 left-[20%] w-px bg-black/40 rotate-12" />}
                    {lockCracks >= 2 && <div className="absolute inset-y-0 left-[40%] w-px bg-black/40 -rotate-6" />}
                    {lockCracks >= 3 && <div className="absolute inset-y-0 left-[55%] w-px bg-black/40 rotate-12" />}
                    {lockCracks >= 4 && <div className="absolute inset-y-0 left-[70%] w-px bg-black/40 -rotate-12" />}
                    {lockCracks >= 5 && <div className="absolute inset-y-0 left-[85%] w-px bg-black/40 rotate-6" />}
                  </div>
                </div>

                {/* Villain icon */}
                <motion.div
                  animate={
                    villainMood === "attacking"
                      ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }
                      : villainMood === "laughing"
                        ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                        : villainMood === "stumbling"
                          ? { x: [0, 8, -8, 4, 0], rotate: [0, 15, -15, 0] }
                          : villainMood === "defeated"
                            ? { scale: [1, 0.5], opacity: [1, 0] }
                            : {}
                  }
                  transition={{ repeat: villainMood === "attacking" ? Infinity : 0, duration: 1 }}
                  className="text-3xl"
                >
                  {world.villainEmoji}
                </motion.div>
              </div>
            </div>

            {/* Byte speech bubble */}
            <AnimatePresence>
              {byteMsg && (
                <motion.div
                  key={byteMsg}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-bold backdrop-blur ${
                    byteMood === "cheering"
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                      : byteMood === "panicked"
                        ? "border-red-400/30 bg-red-400/10 text-red-300"
                        : byteMood === "worried"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                          : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                  }`}
                >
                  🤖 Byte: {byteMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ── MINI GAME ── */}
        {screen === "battle" && (
          <motion.div
            key="battle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border-2 border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            {renderMiniGame()}
          </motion.div>
        )}

        {/* ── FIRE BACK (questions) ── */}
        {screen === "fireback" && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`q-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className={`rounded-3xl border-2 p-6 backdrop-blur transition-colors ${
                fireEffect === "hit"
                  ? "border-emerald-400/50 bg-emerald-400/5"
                  : fireEffect === "miss"
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-white/10 bg-white/5"
              }`}
            >
              {/* Fire Back header */}
              <div className="mb-4 flex items-center justify-between">
                <motion.h2
                  className="text-xl font-extrabold text-amber-400"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  ⚡ FIRE BACK!
                </motion.h2>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
                  {currentQ + 1} / {totalQ}
                </span>
              </div>

              {/* Fire effect overlay */}
              <AnimatePresence>
                {fireEffect === "hit" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 1.5] }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none z-10"
                  >
                    💥
                  </motion.div>
                )}
                {fireEffect === "miss" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 flex items-center justify-center text-6xl pointer-events-none z-10"
                  >
                    💨
                  </motion.div>
                )}
              </AnimatePresence>

              <h3 className="text-lg font-bold leading-snug relative">{content.questions[currentQ].question}</h3>

              <div className="mt-5 space-y-3 relative">
                {content.questions[currentQ].options.map((opt, idx) => {
                  const isCorrect = idx === content.questions[currentQ].correctIndex;
                  const wasChosen = answered === idx;

                  let style = "border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-amber-400/5";
                  if (answered !== null) {
                    if (isCorrect) style = "border-emerald-400/60 bg-emerald-400/10";
                    else if (wasChosen) style = "border-red-500/60 bg-red-500/10";
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.97 }}
                      disabled={answered !== null}
                      onClick={() => handleAnswer(idx)}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold transition-colors ${style}`}
                    >
                      {answered !== null && isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
                      {answered !== null && wasChosen && !isCorrect && (
                        <XCircle className="h-5 w-5 shrink-0 text-red-400" />
                      )}
                      <span>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── VICTORY ── */}
        {screen === "victory" && (
          <motion.div
            key="victory"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-amber-400/30 bg-white/5 p-8 text-center backdrop-blur"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: 3, duration: 0.5 }}
              className="text-7xl"
            >
              🏆
            </motion.div>

            {/* Floating XP particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: 0 }}
                animate={{
                  opacity: 0,
                  y: -80 - Math.random() * 60,
                  x: (Math.random() - 0.5) * 120,
                }}
                transition={{ delay: i * 0.1, duration: 1 }}
                className="absolute text-amber-400 font-extrabold text-sm pointer-events-none"
                style={{ left: "50%", top: "30%" }}
              >
                +XP
              </motion.div>
            ))}

            <h2 className="mt-4 text-3xl font-extrabold text-amber-400">VICTORY!</h2>
            <p className="mt-1 text-white/60">{world.villain} has been defeated! 💥</p>
            <p className="mt-1 text-sm font-bold text-cyan-300">🤖 Byte: {content.completeMessage}</p>

            {/* Stars */}
            <div className="my-6 flex justify-center gap-3">
              {[1, 2, 3].map((s) => (
                <motion.div
                  key={s}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: s * 0.25, type: "spring", stiffness: 200 }}
                >
                  <Star className={`h-12 w-12 ${s <= stars ? "fill-amber-400 text-amber-400" : "text-white/20"}`} />
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <p className="text-2xl font-extrabold text-primary">
                  {finalScore}/{totalQ}
                </p>
                <p className="text-white/50">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-amber-400">+{content.xpReward}</p>
                <p className="text-white/50">XP Earned</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-cyan-400">
                  {lives}/{MAX_LIVES}
                </p>
                <p className="text-white/50">Lives Left</p>
              </div>
            </div>

            {/* Next zone preview */}
            {nextZone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-left"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400/60">Up Next</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl">{nextZone.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white">{nextZone.name}</p>
                    <p className="text-xs text-white/50 truncate">{nextZone.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-cyan-400/50" />
                </div>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="hero" size="lg" className="w-full" onClick={handleNextZone}>
                {nextZone ? `Next Zone: ${nextZone.name} →` : "🎉 All Zones Complete!"}
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => navigate(`/adventure/${worldId}`)}
                >
                  Zone List
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                  onClick={() => navigate("/adventure")}
                >
                  Adventure Map
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── DEFEAT ── */}
        {screen === "defeat" && (
          <motion.div
            key="defeat"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 border-red-500/30 bg-red-950/20 p-8 text-center backdrop-blur"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: 2, duration: 0.4 }}
              className="text-7xl"
            >
              💀
            </motion.div>
            <h2 className="mt-4 text-3xl font-extrabold text-red-400">HE GOT THROUGH!</h2>
            <p className="mt-2 text-white/60">{world.villain} broke the lock...</p>
            <p className="mt-2 text-sm font-bold text-cyan-300">
              🤖 Byte: "He got through… but we slowed him down. You've got this — try again!"
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <Button variant="hero" size="lg" className="px-8" onClick={handleRetry}>
                🔄 Try Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate(`/adventure/${worldId}`)}
              >
                Zone List
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
