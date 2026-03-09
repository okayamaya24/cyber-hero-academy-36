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

interface BossQuestion {
  question: string;
  options: string[];
  correct: number;
  taunt: string;
}

const BOSSES: Record<string, { name: string; emoji: string; color: string }> = {
  "scam-detection": { name: "Phishy the Scammer", emoji: "🐟", color: "text-destructive" },
  "password-safety": { name: "Crackbot 9000", emoji: "🤖", color: "text-accent" },
  "safe-websites": { name: "Malware Mike", emoji: "🦠", color: "text-primary" },
  "personal-info": { name: "Data Thief", emoji: "🕵️", color: "text-destructive" },
};

const BOSS_QUESTIONS: Record<string, Record<AgeTier, BossQuestion[]>> = {
  "scam-detection": {
    junior: [
      { question: "What should you do if someone online offers you free candy?", options: ["Accept it!", "Tell a parent", "Give them your address"], correct: 1, taunt: "Hehe, just give me your info!" },
      { question: "How can you tell if a message is a scam?", options: ["It asks for personal info", "It's from your mom", "It has nice pictures"], correct: 0, taunt: "You'll never figure out my tricks!" },
      { question: "What does a phishing email try to do?", options: ["Send you fish", "Steal your information", "Help you"], correct: 1, taunt: "My emails look SO real!" },
    ],
    defender: [
      { question: "Which is a sign of a phishing email?", options: ["Urgent language and threats", "Correct grammar", "Known sender"], correct: 0, taunt: "My phishing emails are getting smarter!" },
      { question: "What should you check in a suspicious link?", options: ["The color", "The actual URL domain", "The font"], correct: 1, taunt: "You can't read my URLs!" },
      { question: "What is social engineering?", options: ["Building bridges", "Tricking people into revealing info", "Coding"], correct: 1, taunt: "I trick thousands every day!" },
    ],
    guardian: [
      { question: "What is spear phishing?", options: ["Fishing with a spear", "Targeted phishing at specific people", "Random spam"], correct: 1, taunt: "I know everything about my targets!" },
      { question: "Which header should you check in suspicious emails?", options: ["Font size", "Reply-To and Return-Path", "Subject line color"], correct: 1, taunt: "I spoof headers perfectly!" },
      { question: "What is pretexting?", options: ["Writing a preface", "Creating a fake scenario to get info", "Testing software"], correct: 1, taunt: "My stories are so convincing!" },
    ],
  },
  "password-safety": {
    junior: [
      { question: "Which password is strongest?", options: ["1234", "password", "BlueCat!9"], correct: 2, taunt: "I crack simple passwords in seconds!" },
      { question: "Should you share your password with friends?", options: ["Yes, they're my friends!", "No, passwords are secret", "Only best friends"], correct: 1, taunt: "Friends share everything, right? Hehe!" },
      { question: "What makes a password strong?", options: ["Being short", "Using your name", "Mixing letters, numbers, symbols"], correct: 2, taunt: "Short passwords are MY favorite!" },
    ],
    defender: [
      { question: "How often should you change important passwords?", options: ["Never", "Every few months", "Only when hacked"], correct: 1, taunt: "Don't change them... makes my job easier!" },
      { question: "What is a password manager?", options: ["A person who remembers passwords", "Software that securely stores passwords", "A notebook"], correct: 1, taunt: "Write them on sticky notes instead!" },
      { question: "Why shouldn't you reuse passwords?", options: ["It's boring", "One breach exposes all accounts", "They expire faster"], correct: 1, taunt: "Reuse makes my job SO easy!" },
    ],
    guardian: [
      { question: "What is credential stuffing?", options: ["Filling envelopes", "Using leaked passwords on other sites", "Creating new accounts"], correct: 1, taunt: "I have billions of leaked credentials!" },
      { question: "Which is more secure?", options: ["8-char complex password", "4-word passphrase", "Both are equal"], correct: 1, taunt: "Short passwords fall first!" },
      { question: "What does salting a password hash mean?", options: ["Adding seasoning", "Adding random data before hashing", "Encrypting twice"], correct: 1, taunt: "Rainbow tables are my secret weapon!" },
    ],
  },
  "safe-websites": {
    junior: [
      { question: "What does the lock icon in a browser mean?", options: ["The site is locked out", "The connection is secure", "Free stuff inside"], correct: 1, taunt: "Ignore that little lock!" },
      { question: "Which website ending is usually safest?", options: [".xyz", ".gov", ".free"], correct: 1, taunt: "All websites are the same, right?" },
      { question: "What should you do if a website looks strange?", options: ["Keep browsing", "Leave and tell a parent", "Download things from it"], correct: 1, taunt: "Stay on my website... forever!" },
    ],
    defender: [
      { question: "What does HTTPS stand for?", options: ["Hyper Text Transfer Protocol Secure", "High Tech Password System", "Home Transfer Page Service"], correct: 0, taunt: "HTTP is just fine!" },
      { question: "What is a pop-up ad?", options: ["A helpful message", "Often annoying/dangerous advertising", "A security feature"], correct: 1, taunt: "Click ALL the pop-ups!" },
      { question: "What is a secure DNS?", options: ["A type of music", "Encrypted domain name lookups", "A gaming system"], correct: 1, taunt: "DNS? Who cares about that!" },
    ],
    guardian: [
      { question: "What is a man-in-the-middle attack?", options: ["Standing between people", "Intercepting communications", "A sports play"], correct: 1, taunt: "I'm already between you and the server!" },
      { question: "What does a TLS certificate verify?", options: ["Website speed", "Website identity", "Website color"], correct: 1, taunt: "Certificates are just decoration!" },
      { question: "What is domain squatting?", options: ["Camping on domains", "Registering similar domains to trick users", "Buying cheap domains"], correct: 1, taunt: "gooogle.com is totally legit!" },
    ],
  },
  "personal-info": {
    junior: [
      { question: "Which is okay to share online?", options: ["Your address", "Your favorite color", "Your phone number"], correct: 1, taunt: "Tell me EVERYTHING about yourself!" },
      { question: "Who should you tell your password to?", options: ["Your teacher", "Nobody except parents", "Your best friend"], correct: 1, taunt: "Share your password with me!" },
      { question: "Is it safe to post photos of your house online?", options: ["Yes, it's pretty!", "No, it shows where you live", "Only on weekends"], correct: 1, taunt: "Show me where you live!" },
    ],
    defender: [
      { question: "What is personally identifiable information (PII)?", options: ["Your opinions", "Data that can identify you", "Public knowledge"], correct: 1, taunt: "PII is useless to me... not!" },
      { question: "Why are privacy settings important?", options: ["They look cool", "They control who sees your info", "They don't matter"], correct: 1, taunt: "Leave everything public!" },
      { question: "What should you do before downloading an app?", options: ["Just download it", "Check permissions it requests", "Ask your pet"], correct: 1, taunt: "Apps never steal data, right?" },
    ],
    guardian: [
      { question: "What is data minimization?", options: ["Shrinking files", "Only collecting necessary data", "Deleting everything"], correct: 1, taunt: "The more data, the better!" },
      { question: "What does GDPR protect?", options: ["Game downloads", "Personal data privacy rights", "Business profits"], correct: 1, taunt: "Privacy laws can't stop me!" },
      { question: "What is digital footprint?", options: ["Computer shoe size", "Trail of data you leave online", "Website design"], correct: 1, taunt: "I'm tracking your every click!" },
    ],
  },
};

export default function BossBattleGame({ missionId, ageTier, guideImage, guideName, onComplete }: Props) {
  const boss = BOSSES[missionId] ?? BOSSES["scam-detection"];
  const questions = useMemo(() => {
    const qs = BOSS_QUESTIONS[missionId]?.[ageTier] ?? BOSS_QUESTIONS["scam-detection"][ageTier];
    return [...qs].sort(() => Math.random() - 0.5);
  }, [missionId, ageTier]);

  const totalHP = questions.length * 30;
  const [bossHP, setBossHP] = useState(totalHP);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [defeated, setDefeated] = useState(false);
  const [shaking, setShaking] = useState(false);

  const q = questions[currentQ];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) {
      setCorrectCount((c) => c + 1);
      setBossHP((hp) => Math.max(0, hp - 30));
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const next = () => {
    setSelected(null);
    if (currentQ + 1 >= questions.length || bossHP <= 0) {
      setDefeated(true);
    } else {
      setCurrentQ((i) => i + 1);
    }
  };

  if (defeated) {
    const won = correctCount >= questions.length * 0.6;
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
        <p className="text-6xl">{won ? "🏆" : "💪"}</p>
        <p className="text-xl font-bold">
          {won ? `${boss.name} defeated!` : `${boss.name} escaped!`}
        </p>
        <p className="text-sm text-muted-foreground">
          {won ? "Your cyber knowledge saved the day!" : "Train harder and try again, hero!"}
        </p>
        <Button variant="hero" className="w-full py-5 text-base" onClick={() => onComplete(won)}>
          Continue ✨
        </Button>
      </motion.div>
    );
  }

  const hpPercent = (bossHP / totalHP) * 100;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <img src={guideImage} alt={guideName} className="h-12 w-12 object-contain" />
        <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-left">
          <p className="font-semibold text-sm">
            ⚔️ Answer correctly to defeat {boss.name}!
          </p>
        </div>
      </div>

      {/* Boss display */}
      <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4 mb-4">
        <div className="flex items-center gap-3">
          <motion.span
            className="text-5xl"
            animate={shaking ? { x: [0, -10, 10, -10, 10, 0], rotate: [0, -5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            {boss.emoji}
          </motion.span>
          <div className="flex-1">
            <p className={`font-bold text-sm ${boss.color}`}>{boss.name}</p>
            <div className="mt-1 h-4 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-destructive"
                animate={{ width: `${hpPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">HP: {bossHP}/{totalHP}</p>
          </div>
        </div>
        {selected === null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-xs italic text-muted-foreground text-center"
          >
            "{q.taunt}"
          </motion.p>
        )}
      </div>

      {/* Question */}
      <p className="font-bold text-base mb-3 text-center">{q.question}</p>

      <div className="space-y-2">
        {q.options.map((opt, idx) => {
          let style = "border-2 border-border bg-card hover:border-primary/50";
          if (selected !== null) {
            if (idx === q.correct) style = "border-2 border-secondary bg-secondary/10";
            else if (idx === selected) style = "border-2 border-destructive bg-destructive/10";
            else style = "border-2 border-border bg-card opacity-50";
          }

          return (
            <motion.button
              key={idx}
              whileTap={selected === null ? { scale: 0.98 } : {}}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              className={`w-full rounded-xl p-4 text-left font-semibold text-sm transition-all ${style}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      {selected !== null && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
          <div className={`rounded-xl p-3 mb-3 text-center ${
            selected === q.correct ? "bg-secondary/10" : "bg-destructive/10"
          }`}>
            <p className="font-bold text-sm">
              {selected === q.correct ? "⚔️ Critical hit! -30 HP!" : "😊 Miss! The boss dodged!"}
            </p>
          </div>
          <Button variant="hero" className="w-full py-5 text-base" onClick={next}>
            {currentQ + 1 < questions.length && bossHP > 0 ? "Next Attack! ⚔️" : "Finish Battle! 🏆"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
