import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { AgeTier } from "@/data/missions";

interface Props {
  ageTier: AgeTier;
  guideImage: string;
  guideName: string;
  onComplete: (correct: boolean) => void;
}

interface Scenario {
  situation: string;
  emoji: string;
  choices: { text: string; correct: boolean; feedback: string }[];
}

const SCENARIOS: Record<AgeTier, Scenario[]> = {
  junior: [
    {
      situation: "A new online friend asks: \"What school do you go to?\"",
      emoji: "🏫",
      choices: [
        { text: "Tell them my school name", correct: false, feedback: "Don't share your school name with people you only know online!" },
        { text: "Say \"I can't share that!\"", correct: true, feedback: "Great choice! Your school name could help someone find you." },
        { text: "Ask a parent first", correct: true, feedback: "Asking a parent is always smart when someone asks for information!" },
      ],
    },
    {
      situation: "A website asks for your birthday to give you a free gift 🎁",
      emoji: "🎂",
      choices: [
        { text: "Type in my real birthday", correct: false, feedback: "Your birthday is personal info — don't give it to random websites!" },
        { text: "Close the website", correct: true, feedback: "Smart! Free gifts that ask for personal info are usually tricks." },
        { text: "Ask my parent to help", correct: true, feedback: "Always ask a parent when a website wants your information!" },
      ],
    },
    {
      situation: "Your friend wants to post a photo of you online.",
      emoji: "📸",
      choices: [
        { text: "Say yes right away!", correct: false, feedback: "Always check with a parent before photos go online!" },
        { text: "Ask if my parent says it's okay", correct: true, feedback: "Perfect! Always get permission before photos are shared." },
        { text: "Ask them not to post it", correct: true, feedback: "It's your photo — you have the right to say no!" },
      ],
    },
    {
      situation: "A game asks you to type your home address to get a prize.",
      emoji: "🏠",
      choices: [
        { text: "Type my address for the prize", correct: false, feedback: "NEVER share your address online! No prize is worth that." },
        { text: "Tell my parent about it", correct: true, feedback: "Great thinking! A parent can help figure out if it's safe." },
        { text: "Skip the prize", correct: true, feedback: "Smart! Real prizes don't need your home address." },
      ],
    },
  ],
  defender: [
    {
      situation: "Someone in a game chat says: \"Send me a selfie so I know you're real!\"",
      emoji: "🤳",
      choices: [
        { text: "Send a photo", correct: false, feedback: "Never send photos to strangers online! They could misuse them." },
        { text: "Block and report them", correct: true, feedback: "Perfect! Asking for photos is a red flag." },
        { text: "Ignore the message", correct: true, feedback: "Ignoring is also a good choice when something feels wrong." },
      ],
    },
    {
      situation: "A social media quiz asks for your pet's name, your street, and your birthday.",
      emoji: "📋",
      choices: [
        { text: "It's just a quiz — fill it out!", correct: false, feedback: "These quizzes often collect info used in security questions!" },
        { text: "Skip the quiz", correct: true, feedback: "Smart! These quizzes are designed to harvest personal data." },
        { text: "Use fake answers", correct: true, feedback: "Using fake info is a creative way to stay safe!" },
      ],
    },
    {
      situation: "An email says your account was hacked and asks you to reply with your password.",
      emoji: "🔓",
      choices: [
        { text: "Reply with my password to fix it", correct: false, feedback: "Legitimate companies NEVER ask for passwords in emails!" },
        { text: "Go to the official website directly", correct: true, feedback: "Always go directly to the website — never through email links." },
        { text: "Delete the email", correct: true, feedback: "Deleting suspicious emails is always safe!" },
      ],
    },
    {
      situation: "Your classmate wants to share their Netflix password with you.",
      emoji: "🎬",
      choices: [
        { text: "Accept and share mine too", correct: false, feedback: "Sharing passwords can lead to account problems for both of you!" },
        { text: "Politely decline", correct: true, feedback: "Good call! Passwords should stay private, even among friends." },
        { text: "Tell them it's not safe", correct: true, feedback: "Educating others about password safety makes everyone safer!" },
      ],
    },
  ],
  guardian: [
    {
      situation: "A website offers a free VPN but requires your email, phone, and location access.",
      emoji: "🌐",
      choices: [
        { text: "Sign up — free VPN sounds great!", correct: false, feedback: "Free VPNs that collect lots of data often sell your information." },
        { text: "Research the VPN company first", correct: true, feedback: "Smart! Always verify a company's reputation before sharing data." },
        { text: "Use a reputable paid VPN instead", correct: true, feedback: "Paid VPNs with good reputations are much more trustworthy." },
      ],
    },
    {
      situation: "An app asks for access to your contacts, camera, microphone, and location.",
      emoji: "📱",
      choices: [
        { text: "Allow all — I want to use the app", correct: false, feedback: "Apps should only need permissions relevant to their function!" },
        { text: "Only allow what's necessary", correct: true, feedback: "Excellent! Grant minimum permissions — it's called 'least privilege.'" },
        { text: "Check what the app actually needs", correct: true, feedback: "Reading permissions carefully is a sign of digital literacy!" },
      ],
    },
    {
      situation: "Someone offers to pay you to post an ad on your social media with a link.",
      emoji: "💰",
      choices: [
        { text: "Post it — easy money!", correct: false, feedback: "The link could be malicious, and you'd be responsible for spreading it." },
        { text: "Research the company and link first", correct: true, feedback: "Always verify before promoting anything to your followers." },
        { text: "Decline the offer", correct: true, feedback: "When in doubt, it's safest to decline." },
      ],
    },
    {
      situation: "A data breach notification says your email was found in a leak.",
      emoji: "🚨",
      choices: [
        { text: "Ignore it — probably fake", correct: false, feedback: "Legitimate breach notifications (like from HaveIBeenPwned) should be acted on!" },
        { text: "Change passwords for affected accounts", correct: true, feedback: "Immediately changing passwords is the right response!" },
        { text: "Enable 2FA on important accounts", correct: true, feedback: "Two-factor authentication adds crucial extra security!" },
      ],
    },
  ],
};

export default function SecretKeeperGame({ ageTier, guideImage, guideName, onComplete }: Props) {
  const scenarios = useMemo(() => {
    return [...SCENARIOS[ageTier]].sort(() => Math.random() - 0.5).slice(0, 4);
  }, [ageTier]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const scenario = scenarios[currentIdx];

  const handleChoice = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (scenario.choices[idx].correct) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    setSelected(null);
    if (currentIdx + 1 >= scenarios.length) {
      setDone(true);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  };

  if (done) {
    const allCorrect = correctCount >= scenarios.length * 0.75;
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
        <p className="text-5xl">{allCorrect ? "🛡️" : "💪"}</p>
        <p className="text-lg font-bold">
          {allCorrect ? "You're a Secret Keeper pro!" : "Keep practicing your privacy skills!"}
        </p>
        <p className="text-sm text-muted-foreground">
          {correctCount}/{scenarios.length} correct decisions
        </p>
        <Button variant="hero" className="w-full py-5 text-base" onClick={() => onComplete(allCorrect)}>
          Continue ✨
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <img src={guideImage} alt={guideName} className="h-12 w-12 object-contain" />
        <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-left">
          <p className="font-semibold text-sm">
            🤫 What would YOU do? Make the safest choice!
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 text-center">
        Scenario {currentIdx + 1} of {scenarios.length}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
        >
          <div className="rounded-2xl border-2 border-border bg-card p-5 mb-4 text-center shadow-card">
            <span className="text-4xl block mb-3">{scenario.emoji}</span>
            <p className="font-bold text-base">{scenario.situation}</p>
          </div>

          <div className="space-y-3">
            {scenario.choices.map((choice, idx) => {
              let style = "border-2 border-border bg-card hover:border-primary/50";
              if (selected !== null) {
                if (choice.correct) style = "border-2 border-secondary bg-secondary/10";
                else if (idx === selected && !choice.correct) style = "border-2 border-destructive bg-destructive/10";
                else style = "border-2 border-border bg-card opacity-50";
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={selected === null ? { scale: 0.98 } : {}}
                  onClick={() => handleChoice(idx)}
                  disabled={selected !== null}
                  className={`w-full rounded-2xl p-4 text-left transition-all ${style}`}
                >
                  <p className="font-semibold text-sm">{choice.text}</p>
                  {selected !== null && (idx === selected || choice.correct) && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="text-xs text-muted-foreground mt-2"
                    >
                      {choice.feedback}
                    </motion.p>
                  )}
                </motion.button>
              );
            })}
          </div>

          {selected !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button variant="hero" className="w-full mt-4 py-5 text-base" onClick={next}>
                {currentIdx + 1 < scenarios.length ? "Next Scenario →" : "See Results 🎉"}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
