import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ScamSorterProps {
  onComplete: (stars: number) => void;
}

interface Message {
  id: number;
  sender: string;
  text: string;
  isScam: boolean;
  type: string;
}

const ROUNDS: Message[][] = [
  [
    { id: 1, sender: "YOUR BANK", text: "URGENT: Click NOW to save your account!!!", isScam: true, type: "phishing" },
    { id: 2, sender: "Mum", text: "Don't forget football practice at 4pm", isScam: false, type: "personal" },
    { id: 3, sender: "PRIZE HQ", text: "YOU WON 1000000! Claim your prize NOW!", isScam: true, type: "prize" },
    { id: 4, sender: "School", text: "Your homework is due Friday. Good luck!", isScam: false, type: "school" },
    { id: 5, sender: "FREE GEMS", text: "Get FREE Robux! Just share your password!", isScam: true, type: "gaming" },
    { id: 6, sender: "Dad", text: "I'll pick you up after school today", isScam: false, type: "personal" },
  ],
  [
    { id: 1, sender: "support@amaz0n.com", text: "Your order cancelled. Verify your details.", isScam: true, type: "phishing" },
    { id: 2, sender: "Amazon", text: "Your package has been delivered.", isScam: false, type: "shopping" },
    { id: 3, sender: "School IT", text: "System update tonight. No action needed.", isScam: false, type: "school" },
    { id: 4, sender: "PayPaI Support", text: "Account suspended. Login immediately.", isScam: true, type: "phishing" },
    { id: 5, sender: "GameZone", text: "Your tournament invite expires in 24 HOURS!", isScam: true, type: "urgency" },
    { id: 6, sender: "Netflix", text: "New episodes of your favourite show available.", isScam: false, type: "entertainment" },
  ],
  [
    { id: 1, sender: "security@google.com", text: "Someone signed in from new device. Was this you?", isScam: false, type: "security" },
    { id: 2, sender: "security@googIe.com", text: "Account access detected. Verify NOW or lose access.", isScam: true, type: "phishing" },
    { id: 3, sender: "Your Friend Jake", text: "Happy birthday!! Hope you have an amazing day", isScam: false, type: "personal" },
    { id: 4, sender: "Your Friend Jake", text: "Check out this link http://bit.ly/xK9p2", isScam: true, type: "phishing" },
    { id: 5, sender: "Apple Support", text: "iCloud storage full. Upgrade at apple.com/storage", isScam: false, type: "tech" },
    { id: 6, sender: "AppIe Support", text: "Apple ID locked. Verify at apple-secure-id.net", isScam: true, type: "phishing" },
  ],
];

const ROUND_TIMERS = [8, 7, 6];

const VILLAIN_WRONG = [
  "YES! You fell for it — CLASSIC! 😈",
  "Ha! Panic makes you click! Every time! 😂",
  "GOTCHA! Another one for the Keybreaker! 🎉",
];
const VILLAIN_RIGHT = [
  "WHAT?! How did you spot that?! 😤",
  "IMPOSSIBLE! Stop being so smart! 😡",
  "No no no! That was my BEST fake! 🤬",
];

export default function ScamSorter({ onComplete }: ScamSorterProps) {
  const [round, setRound] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [roundStars, setRoundStars] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean; isScam: boolean; quip: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIMERS[0]);
  const [showRoundEnd, setShowRoundEnd] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentMessages = ROUNDS[round];
  const currentMsg = currentMessages?.[msgIndex];
  const maxTime = ROUND_TIMERS[round];

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const advanceMessage = useCallback(() => {
    if (msgIndex + 1 >= currentMessages.length) {
      const stars = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
      setRoundStars((prev) => [...prev, stars]);
      setShowRoundEnd(true);
    } else {
      setMsgIndex((i) => i + 1);
      setTimeLeft(maxTime);
    }
  }, [msgIndex, currentMessages, mistakes, maxTime]);

  const handleAnswer = useCallback(
    (answeredScam: boolean) => {
      if (feedback || showRoundEnd || gameOver) return;
      clearTimer();
      const correct = answeredScam === currentMsg.isScam;
      let newMistakes = mistakes;
      if (!correct) {
        newMistakes = mistakes + 1;
        setMistakes(newMistakes);
        setHearts((h) => Math.max(0, h - 1));
      }
      const quip = correct
        ? VILLAIN_RIGHT[Math.floor(Math.random() * VILLAIN_RIGHT.length)]
        : VILLAIN_WRONG[Math.floor(Math.random() * VILLAIN_WRONG.length)];
      setFeedback({ correct, isScam: currentMsg.isScam, quip });
      feedbackTimeout.current = setTimeout(() => {
        setFeedback(null);
        advanceMessage();
      }, 1600);
    },
    [feedback, showRoundEnd, gameOver, clearTimer, currentMsg, mistakes, advanceMessage]
  );

  // Timer
  useEffect(() => {
    if (feedback || showRoundEnd || gameOver) return;
    clearTimer();
    setTimeLeft(maxTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          clearTimer();
          // timeout = wrong
          setMistakes((m) => m + 1);
          setHearts((h) => Math.max(0, h - 1));
          setFeedback({ correct: false, isScam: currentMsg.isScam, quip: "⏰ TIME'S UP! Too slow — I win that one! 😈" });
          feedbackTimeout.current = setTimeout(() => {
            setFeedback(null);
            advanceMessage();
          }, 1400);
          return 0;
        }
        return t - 0.05;
      });
    }, 50);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgIndex, round, showRoundEnd, gameOver]);

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimer();
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, [clearTimer]);

  const handleNextRound = () => {
    if (round + 1 >= ROUNDS.length) {
      setGameOver(true);
      const avg = Math.round(
        [...roundStars].reduce((a, b) => a + b, 0) / roundStars.length
      );
      setTimeout(() => onComplete(avg), 1200);
      return;
    }
    setRound((r) => r + 1);
    setMsgIndex(0);
    setMistakes(0);
    setShowRoundEnd(false);
  };

  if (gameOver) {
    const avg = Math.round(roundStars.reduce((a, b) => a + b, 0) / roundStars.length);
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-10"
      >
        <span className="text-5xl">🏆</span>
        <h2 className="text-2xl font-bold text-white">Mission Complete!</h2>
        <div className="text-3xl">{"⭐".repeat(avg)}{"☆".repeat(3 - avg)}</div>
        <p className="text-white/60 text-sm">You're a real Scam Spotter!</p>
      </motion.div>
    );
  }

  if (showRoundEnd) {
    const stars = roundStars[roundStars.length - 1];
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-10"
      >
        <span className="text-4xl">📧</span>
        <h2 className="text-xl font-bold text-white">Round {round + 1} Complete!</h2>
        <div className="text-3xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</div>
        <p className="text-sm text-white/50">{mistakes} mistake{mistakes !== 1 ? "s" : ""}</p>
        <Button
          onClick={handleNextRound}
          className="mt-2 bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_40%)] text-white font-bold px-8"
        >
          {round + 1 >= ROUNDS.length ? "See Results" : "Next Round →"}
        </Button>
      </motion.div>
    );
  }

  const pct = (timeLeft / maxTime) * 100;

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-2 max-w-md mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-mono text-white/50">ROUND {round + 1}/3</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-lg ${i < hearts ? "" : "opacity-20"}`}>❤️</span>
          ))}
        </div>
        <span className="text-xs font-mono text-white/50">
          {msgIndex + 1}/{currentMessages.length}
        </span>
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

      {/* Message card */}
      <AnimatePresence mode="wait">
        {currentMsg && !feedback && (
          <motion.div
            key={`${round}-${msgIndex}`}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-2xl border border-white/10 bg-[hsl(210_40%_14%/0.9)] p-5 backdrop-blur-md"
          >
            <p className="text-xs font-mono text-[hsl(195_80%_60%)] mb-1 uppercase tracking-wider">
              From: {currentMsg.sender}
            </p>
            <p className="text-white text-base leading-relaxed">{currentMsg.text}</p>
          </motion.div>
        )}

        {feedback && (
          <motion.div
            key="feedback"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`w-full rounded-2xl border p-5 text-center ${
              feedback.correct
                ? "border-green-500/40 bg-green-900/30"
                : "border-red-500/40 bg-red-900/30"
            }`}
          >
            <span className="text-3xl">{feedback.correct ? "✅" : "❌"}</span>
            <p className="text-white font-bold mt-2">
              {feedback.correct ? "Correct!" : "Wrong!"}
            </p>
            <p className="text-white/60 text-sm mt-1">
              That was {feedback.isScam ? "a SCAM 🚨" : "LEGIT ✅"}
            </p>
            <p className={`text-xs font-bold italic mt-2 ${feedback.correct ? "text-orange-300" : "text-red-300"}`}>
              {feedback.quip}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      {!feedback && (
        <div className="flex gap-3 w-full">
          <Button
            onClick={() => handleAnswer(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-6 rounded-xl"
          >
            🚨 SCAM
          </Button>
          <Button
            onClick={() => handleAnswer(false)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-6 rounded-xl"
          >
            ✅ LEGIT
          </Button>
        </div>
      )}
    </div>
  );
}
