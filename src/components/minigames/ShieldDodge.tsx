import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ShieldDodgeProps {
  onComplete: (stars: number) => void;
  villainName?: string;
}

interface Attack {
  id: number;
  icon: string;
  text: string;
  subtext: string;
  correctAction: "SHIELD" | "DODGE";
  explanation: string;
}

const WAVES: Attack[][] = [
  [
    { id: 1, icon: "🔑", text: "CRACKING: password123", subtext: "Weak password detected", correctAction: "SHIELD", explanation: "Weak passwords are easily cracked!" },
    { id: 2, icon: "📧", text: "FREE V-BUCKS for your password", subtext: "Suspicious offer", correctAction: "SHIELD", explanation: "Never share passwords for free items!" },
    { id: 3, icon: "✅", text: "Strong password: X7mK9pQ", subtext: "Complex password", correctAction: "DODGE", explanation: "Strong passwords cannot be cracked. You are safe!" },
    { id: 4, icon: "📡", text: "FAKE WIFI: Free_Villain_Wifi", subtext: "Unknown network", correctAction: "SHIELD", explanation: "Never connect to unverified WiFi!" },
    { id: 5, icon: "🔒", text: "2FA code active on account", subtext: "Extra security layer", correctAction: "DODGE", explanation: "2FA protects you even if password stolen!" },
    { id: 6, icon: "🎣", text: "PHISHING: Click to claim prize", subtext: "Too good to be true", correctAction: "SHIELD", explanation: "Too good to be true means always a scam!" },
    { id: 7, icon: "💻", text: "HTTPS website with padlock", subtext: "Secure connection", correctAction: "DODGE", explanation: "HTTPS with padlock means encrypted and safe!" },
    { id: 8, icon: "🔑", text: "CRACKING: mybirthday2010", subtext: "Personal info password", correctAction: "SHIELD", explanation: "Never use birthdays in passwords!" },
  ],
  [
    { id: 1, icon: "📱", text: "Flashlight app needs location", subtext: "Suspicious permission", correctAction: "SHIELD", explanation: "Flashlight apps do not need your location!" },
    { id: 2, icon: "🔐", text: "End-to-end encrypted message", subtext: "Secure messaging", correctAction: "DODGE", explanation: "Encrypted messages cannot be read by others!" },
    { id: 3, icon: "💾", text: "Download from random website", subtext: "Unknown source", correctAction: "SHIELD", explanation: "Only download from official sources!" },
    { id: 4, icon: "🏪", text: "Official App Store download", subtext: "Verified source", correctAction: "DODGE", explanation: "Official app stores verify apps. Safe!" },
    { id: 5, icon: "🧊", text: "No backup of important files", subtext: "Data at risk", correctAction: "SHIELD", explanation: "Without backups ransomware wins!" },
    { id: 6, icon: "☁️", text: "Files backed up to cloud daily", subtext: "Protected data", correctAction: "DODGE", explanation: "Cloud backups defeat ransomware!" },
    { id: 7, icon: "👤", text: "Stranger asking where you live", subtext: "Personal info request", correctAction: "SHIELD", explanation: "Never share location with online strangers!" },
    { id: 8, icon: "🌐", text: "http site with no padlock", subtext: "Insecure connection", correctAction: "SHIELD", explanation: "HTTP without padlock is not safe!" },
  ],
  [
    { id: 1, icon: "🔑", text: "CRACKING: Qr5vL8z complex", subtext: "Strong password", correctAction: "DODGE", explanation: "Random chars with symbols are uncrackable!" },
    { id: 2, icon: "📧", text: "URGENT: Account DELETED in 1hr", subtext: "Fear tactic", correctAction: "SHIELD", explanation: "Urgency is always a scam trick!" },
    { id: 3, icon: "🛡️", text: "Firewall blocking unknown IP", subtext: "Active protection", correctAction: "DODGE", explanation: "Your firewall is working — you are protected!" },
    { id: 4, icon: "🎮", text: "Meet me in real life for items", subtext: "Stranger danger", correctAction: "SHIELD", explanation: "NEVER agree to meet online strangers in real life!" },
    { id: 5, icon: "✅", text: "Official game update available", subtext: "Verified update", correctAction: "DODGE", explanation: "Official updates are always safe!" },
    { id: 6, icon: "👁️", text: "App tracking location all day", subtext: "Privacy violation", correctAction: "SHIELD", explanation: "Apps should not track location constantly!" },
    { id: 7, icon: "💙", text: "Kindness stops a cyberbully", subtext: "Positive action", correctAction: "DODGE", explanation: "Kindness defeats trolls every time!" },
    { id: 8, icon: "🔑", text: "CRACKING ALL PASSWORDS NOW", subtext: "Full attack", correctAction: "SHIELD", explanation: "Strong passwords and 2FA stop the villain cold!" },
  ],
];

const WAVE_TIMERS = [6, 5, 4];

export default function ShieldDodge({ onComplete, villainName }: ShieldDodgeProps) {
  const [wave, setWave] = useState(0);
  const [atkIndex, setAtkIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [hits, setHits] = useState(0);
  const [waveStars, setWaveStars] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(WAVE_TIMERS[0]);
  const [showWaveEnd, setShowWaveEnd] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [heroShake, setHeroShake] = useState(false);
  const [villainShake, setVillainShake] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentAttacks = WAVES[wave];
  const currentAtk = currentAttacks?.[atkIndex];
  const maxTime = WAVE_TIMERS[wave];

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const advanceAttack = useCallback(() => {
    if (atkIndex + 1 >= currentAttacks.length) {
      const stars = hits === 0 ? 3 : hits <= 2 ? 2 : 1;
      setWaveStars((prev) => [...prev, stars]);
      setShowWaveEnd(true);
    } else {
      setAtkIndex((i) => i + 1);
      setTimeLeft(maxTime);
    }
  }, [atkIndex, currentAttacks, hits, maxTime]);

  const handleAction = useCallback(
    (action: "SHIELD" | "DODGE") => {
      if (feedback || showWaveEnd || gameOver) return;
      clearTimer();
      const correct = action === currentAtk.correctAction;
      if (!correct) {
        setHits((h) => h + 1);
        setHearts((h) => Math.max(0, h - 1));
        setHeroShake(true);
        setTimeout(() => setHeroShake(false), 500);
      } else {
        setVillainShake(true);
        setTimeout(() => setVillainShake(false), 500);
      }
      setFeedback({ correct, explanation: currentAtk.explanation });
      feedbackTimeout.current = setTimeout(() => {
        setFeedback(null);
        advanceAttack();
      }, 1600);
    },
    [feedback, showWaveEnd, gameOver, clearTimer, currentAtk, advanceAttack]
  );

  // Timer
  useEffect(() => {
    if (feedback || showWaveEnd || gameOver) return;
    clearTimer();
    setTimeLeft(maxTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearTimer();
          setHits((h) => h + 1);
          setHearts((h2) => Math.max(0, h2 - 1));
          setHeroShake(true);
          setTimeout(() => setHeroShake(false), 500);
          setFeedback({ correct: false, explanation: currentAtk.explanation });
          feedbackTimeout.current = setTimeout(() => {
            setFeedback(null);
            advanceAttack();
          }, 1600);
          return 0;
        }
        return t - 0.05;
      });
    }, 50);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atkIndex, wave, showWaveEnd, gameOver]);

  useEffect(() => {
    return () => {
      clearTimer();
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, [clearTimer]);

  const handleNextWave = () => {
    if (wave + 1 >= WAVES.length) {
      setGameOver(true);
      const avg = Math.round(waveStars.reduce((a, b) => a + b, 0) / waveStars.length);
      setTimeout(() => onComplete(avg), 1200);
      return;
    }
    setWave((w) => w + 1);
    setAtkIndex(0);
    setHits(0);
    setShowWaveEnd(false);
  };

  const vName = villainName || "The Villain";

  if (gameOver) {
    const avg = Math.round(waveStars.reduce((a, b) => a + b, 0) / waveStars.length);
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center gap-4 py-10">
        <span className="text-5xl">🏆</span>
        <h2 className="text-2xl font-bold text-white">Battle Won!</h2>
        <div className="text-3xl">{"⭐".repeat(avg)}{"☆".repeat(3 - avg)}</div>
        <p className="text-white/60 text-sm">{vName} has been defeated!</p>
      </motion.div>
    );
  }

  if (showWaveEnd) {
    const stars = waveStars[waveStars.length - 1];
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center gap-4 py-10">
        <span className="text-4xl">⚔️</span>
        <h2 className="text-xl font-bold text-white">Wave {wave + 1} Complete!</h2>
        <div className="text-3xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</div>
        <p className="text-sm text-white/50">{hits} hit{hits !== 1 ? "s" : ""} taken</p>
        <Button onClick={handleNextWave} className="mt-2 bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_40%)] text-white font-bold px-8">
          {wave + 1 >= WAVES.length ? "See Results" : "Next Wave →"}
        </Button>
      </motion.div>
    );
  }

  const pct = (timeLeft / maxTime) * 100;

  return (
    <div className="flex flex-col items-center gap-3 py-4 px-2 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-mono text-white/50">WAVE {wave + 1}/3</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-lg ${i < hearts ? "" : "opacity-20"}`}>❤️</span>
          ))}
        </div>
        <span className="text-xs font-mono text-white/50">{atkIndex + 1}/{currentAttacks.length}</span>
      </div>

      {/* Arena */}
      <div className="flex items-center justify-between w-full px-4 py-2">
        <motion.span
          animate={heroShake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="text-5xl"
        >
          🦸
        </motion.span>
        <span className="text-xs font-mono text-white/30">VS</span>
        <motion.span
          animate={villainShake ? { x: [0, 8, -8, 6, -6, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="text-5xl"
        >
          🦹
        </motion.span>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: pct > 40 ? "hsl(195, 80%, 50%)" : pct > 20 ? "hsl(40, 90%, 55%)" : "hsl(0, 80%, 55%)",
          }}
        />
      </div>

      {/* Attack card */}
      <AnimatePresence mode="wait">
        {currentAtk && !feedback && (
          <motion.div
            key={`${wave}-${atkIndex}`}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-2xl border border-white/10 bg-[hsl(210_40%_14%/0.9)] p-5 backdrop-blur-md text-center"
          >
            <span className="text-4xl">{currentAtk.icon}</span>
            <p className="text-white font-bold mt-2">{currentAtk.text}</p>
            <p className="text-white/40 text-xs mt-1">{currentAtk.subtext}</p>
          </motion.div>
        )}

        {feedback && (
          <motion.div
            key="feedback"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`w-full rounded-2xl border p-5 text-center ${
              feedback.correct ? "border-green-500/40 bg-green-900/30" : "border-red-500/40 bg-red-900/30"
            }`}
          >
            <span className="text-3xl">{feedback.correct ? "🛡️" : "💥"}</span>
            <p className="text-white font-bold mt-2">{feedback.correct ? "Blocked!" : "Hit taken!"}</p>
            <p className="text-white/60 text-sm mt-1">{feedback.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      {!feedback && (
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => handleAction("SHIELD")}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg py-6 rounded-xl"
          >
            🛡️ SHIELD
          </Button>
          <Button
            onClick={() => handleAction("DODGE")}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-lg py-6 rounded-xl"
          >
            ⚡ DODGE
          </Button>
        </div>
      )}
    </div>
  );
}
