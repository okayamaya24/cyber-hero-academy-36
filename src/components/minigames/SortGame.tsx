import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { AgeTier } from "@/data/missions";

interface Props {
  missionId: string;
  ageTier: AgeTier;
  guideImage: string;
  guideName: string;
  onComplete: (correct: boolean) => void;
}

interface SortItem {
  text: string;
  category: "safe" | "suspicious";
  explanation: string;
}

const SORT_ITEMS: Record<string, Record<AgeTier, SortItem[]>> = {
  "safe-websites": {
    junior: [
      {
        text: "www.coolkidsgames.com 🔒",
        category: "safe",
        explanation: "This site has a lock icon, which is a good sign.",
      },
      {
        text: "FREE-PRIZES-NOW.com",
        category: "suspicious",
        explanation: "Websites offering free prizes are usually scams.",
      },
      { text: "www.library.org 🔒", category: "safe", explanation: "Library websites are trustworthy." },
      {
        text: "download-free-games.xyz",
        category: "suspicious",
        explanation: "Unknown download sites can have viruses.",
      },
      {
        text: "www.nationalgeographic.com/kids 🔒",
        category: "safe",
        explanation: "Known educational sites are usually safe.",
      },
      {
        text: "U-WON-1000-DOLLARS.com",
        category: "suspicious",
        explanation: "Nobody gives away money like that randomly.",
      },
    ],
    defender: [
      {
        text: "https://www.khanacademy.org",
        category: "safe",
        explanation: "Khan Academy is a trusted learning site.",
      },
      {
        text: "http://free-robux-generator.com",
        category: "suspicious",
        explanation: "Free game currency sites often steal your info.",
      },
      { text: "https://scratch.mit.edu", category: "safe", explanation: "Scratch is run by MIT and is trustworthy." },
      {
        text: "download-minecraft-free.tk",
        category: "suspicious",
        explanation: "Free download offers like this are risky.",
      },
      { text: "https://www.nasa.gov", category: "safe", explanation: ".gov sites are official government websites." },
      { text: "click-here-to-win.biz", category: "suspicious", explanation: "Prize links like this are suspicious." },
    ],
    guardian: [
      { text: "https://github.com", category: "safe", explanation: "GitHub is a well-known and legitimate platform." },
      {
        text: "http://paypa1.com/verify",
        category: "suspicious",
        explanation: "This uses a '1' instead of an 'l' to trick people.",
      },
      { text: "https://www.wikipedia.org", category: "safe", explanation: "Wikipedia is a trusted encyclopedia site." },
      {
        text: "http://amaz0n-deals.ru",
        category: "suspicious",
        explanation: "Misspelled names and odd domains are red flags.",
      },
      { text: "https://www.wolframalpha.com", category: "safe", explanation: "Wolfram Alpha is a legitimate tool." },
      {
        text: "http://verify-your-account-now.com",
        category: "suspicious",
        explanation: "Urgent account warnings like this are often scams.",
      },
    ],
  },
  "scam-detection": {
    junior: [
      {
        text: "Your friend sent you a photo 📸",
        category: "safe",
        explanation: "Messages from people you know are usually okay.",
      },
      {
        text: "YOU WON A FREE iPAD!!!",
        category: "suspicious",
        explanation: "Random free prize messages are usually fake.",
      },
      {
        text: "Homework reminder from teacher 📚",
        category: "safe",
        explanation: "Teacher reminders are normal and safe.",
      },
      {
        text: "Click here or your account is DELETED",
        category: "suspicious",
        explanation: "Scary rushed messages are a common trick.",
      },
      { text: "Mom texted: come home for dinner", category: "safe", explanation: "Messages from family are okay." },
      {
        text: "A stranger wants your address 📍",
        category: "suspicious",
        explanation: "Never share your address with strangers.",
      },
    ],
    defender: [
      {
        text: "School newsletter email",
        category: "safe",
        explanation: "Official school communication is trustworthy.",
      },
      {
        text: '"Your Roblox account will be banned!"',
        category: "suspicious",
        explanation: "Scare tactics are a common scam trick.",
      },
      {
        text: "Library overdue book notification",
        category: "safe",
        explanation: "Libraries send normal reminder messages.",
      },
      {
        text: '"Send gift cards to unlock your prize"',
        category: "suspicious",
        explanation: "Gift card requests are always suspicious.",
      },
      { text: "Family group chat message", category: "safe", explanation: "Known family contacts are usually safe." },
      {
        text: '"Verify your password via this link"',
        category: "suspicious",
        explanation: "Real services do not ask for passwords like this.",
      },
    ],
    guardian: [
      {
        text: "Two-factor authentication code from Google",
        category: "safe",
        explanation: "If you triggered it, a 2FA code can be legitimate.",
      },
      {
        text: '"Your Netflix is suspended — click to fix"',
        category: "suspicious",
        explanation: "Always go directly to the official site instead.",
      },
      {
        text: "Password reset you requested",
        category: "safe",
        explanation: "If you requested it, this can be legitimate.",
      },
      {
        text: '"IRS owes you $5000 — claim now"',
        category: "suspicious",
        explanation: "Government agencies do not contact people this way.",
      },
      {
        text: "Software update notification from OS",
        category: "safe",
        explanation: "Official operating system updates are normal.",
      },
      {
        text: '"Your photos have been leaked — pay now"',
        category: "suspicious",
        explanation: "This is an extortion scam.",
      },
    ],
  },
};

export default function SortGame({ missionId, ageTier, guideImage, guideName, onComplete }: Props) {
  const items = useMemo(() => {
    const list = SORT_ITEMS[missionId]?.[ageTier] ?? SORT_ITEMS["safe-websites"][ageTier];
    return [...list].sort(() => Math.random() - 0.5);
  }, [missionId, ageTier]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [done, setDone] = useState(false);

  const current = items[currentIdx];
  const progress = ((currentIdx + (feedback ? 1 : 0)) / items.length) * 100;

  const handleSort = (choice: "safe" | "suspicious") => {
    const isCorrect = choice === current.category;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setFeedback({ correct: isCorrect, explanation: current.explanation });
  };

  const next = () => {
    setFeedback(null);
    if (currentIdx + 1 >= items.length) {
      setDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  const guidePrompt =
    missionId === "password-safety"
      ? "🔐 Decide if this is safe or suspicious password behavior."
      : missionId === "scam-detection"
        ? "🕵️ Spot the scam and choose carefully."
        : "🛡️ Decide if this looks safe or suspicious.";

  if (done) {
    const percent = correctCount / items.length;
    const passed = percent >= 0.8;
    const badge =
      percent === 1
        ? "🏆 Perfect Protector"
        : percent >= 0.8
          ? "🛡️ Scam Spotter"
          : percent >= 0.6
            ? "✨ Cyber Learner"
            : "🌱 Training Hero";

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="space-y-5 text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-5xl">
          {passed ? "🎉" : "💪"}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold">{passed ? "Mission Complete!" : "Nice Try!"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You got {correctCount} out of {items.length} correct.
          </p>
        </div>

        <div className="mx-auto max-w-sm rounded-2xl border bg-card p-4 shadow-card">
          <p className="text-lg font-bold text-primary">{badge}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {passed ? "Your cyber skills are getting stronger." : "Practice helps you become a stronger cyber hero."}
          </p>
        </div>

        <Button variant="hero" className="w-full py-5 text-base" onClick={() => onComplete(passed)}>
          Continue ✨
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-4 flex items-start gap-3">
        <div className="shrink-0 rounded-2xl bg-card p-2 shadow-card">
          <img src={guideImage} alt={guideName} className="h-14 w-14 object-contain" />
        </div>
        <div className="flex-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-left">
          <p className="font-semibold text-sm">{guidePrompt}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>
            {currentIdx + 1} / {items.length}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Question {currentIdx + 1} of {items.length}
        </p>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          ⭐ {correctCount} correct
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div
            key={currentIdx}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
          >
            <div className="mb-6 rounded-3xl border-2 border-border bg-card p-6 shadow-card">
              <p className="text-lg font-bold leading-relaxed">{current.text}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSort("safe")}
                className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center transition-colors hover:bg-emerald-100"
              >
                <span className="mb-2 block text-4xl">✅</span>
                <span className="font-bold text-sm text-emerald-700">Safe</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleSort("suspicious")}
                className="rounded-3xl border-2 border-rose-300 bg-rose-50 p-6 text-center transition-colors hover:bg-rose-100"
              >
                <span className="mb-2 block text-4xl">⚠️</span>
                <span className="font-bold text-sm text-rose-700">Suspicious</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div
              className={`mb-4 rounded-3xl p-5 ${
                feedback.correct ? "border-2 border-emerald-300 bg-emerald-50" : "border-2 border-amber-300 bg-amber-50"
              }`}
            >
              <p className="mb-2 text-4xl">{feedback.correct ? "🎉" : "🤔"}</p>
              <p className="mb-1 text-base font-bold text-slate-900">
                {feedback.correct ? "Nice catch, Cyber Hero!" : "Good try, Cyber Hero!"}
              </p>
              <p className="text-sm text-slate-600">{feedback.explanation}</p>
              <p className="mt-2 text-xs font-semibold text-primary">
                {feedback.correct ? "+10 points" : "Keep learning and try the next one!"}
              </p>
            </div>

            <Button variant="hero" className="w-full py-5 text-base" onClick={next}>
              {currentIdx + 1 < items.length ? "Next Item →" : "See Results 🎉"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
