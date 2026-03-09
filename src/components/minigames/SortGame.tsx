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
  category: "safe" | "dangerous";
  explanation: string;
}

const SORT_ITEMS: Record<string, Record<AgeTier, SortItem[]>> = {
  "safe-websites": {
    junior: [
      { text: "www.coolkidsgames.com 🔒", category: "safe", explanation: "This site has a lock icon — it's secure!" },
      { text: "FREE-PRIZES-NOW.com", category: "dangerous", explanation: "Websites offering free prizes are usually scams!" },
      { text: "www.library.org 🔒", category: "safe", explanation: "Library websites are trustworthy!" },
      { text: "download-free-games.xyz", category: "dangerous", explanation: "Unknown download sites can have viruses!" },
      { text: "www.nationalgeographic.com/kids 🔒", category: "safe", explanation: "Known educational sites are safe!" },
      { text: "U-WON-1000-DOLLARS.com", category: "dangerous", explanation: "Nobody gives away money like that!" },
    ],
    defender: [
      { text: "https://www.khanacademy.org", category: "safe", explanation: "Khan Academy is a trusted learning site." },
      { text: "http://free-robux-generator.com", category: "dangerous", explanation: "Free game currency sites steal your info!" },
      { text: "https://scratch.mit.edu", category: "safe", explanation: "Scratch is run by MIT — very trustworthy!" },
      { text: "download-minecraft-free.tk", category: "dangerous", explanation: ".tk domains and free downloads are risky!" },
      { text: "https://www.nasa.gov", category: "safe", explanation: ".gov sites are run by the government." },
      { text: "click-here-to-win.biz", category: "dangerous", explanation: ".biz domains with prizes are suspicious!" },
    ],
    guardian: [
      { text: "https://github.com", category: "safe", explanation: "GitHub is a well-known developer platform." },
      { text: "http://paypa1.com/verify", category: "dangerous", explanation: "Notice 'paypa1' uses a '1' instead of 'l' — it's spoofing!" },
      { text: "https://www.wikipedia.org", category: "safe", explanation: "Wikipedia is a trusted encyclopedia." },
      { text: "http://amaz0n-deals.ru", category: "dangerous", explanation: "Misspelled names + .ru domain = phishing!" },
      { text: "https://www.wolframalpha.com", category: "safe", explanation: "Wolfram Alpha is a legitimate computation engine." },
      { text: "http://verify-your-account-now.com", category: "dangerous", explanation: "Urgency + vague domain = social engineering!" },
    ],
  },
  "scam-detection": {
    junior: [
      { text: "Your friend sent you a photo 📸", category: "safe", explanation: "Messages from friends you know are usually safe!" },
      { text: "YOU WON A FREE iPAD!!!", category: "dangerous", explanation: "Nobody gives away free iPads to random people!" },
      { text: "Homework reminder from teacher 📚", category: "safe", explanation: "Messages from your teacher are safe!" },
      { text: "Click here or your account is DELETED", category: "dangerous", explanation: "Scary messages trying to rush you are scams!" },
      { text: "Mom texted: come home for dinner", category: "safe", explanation: "Messages from family are safe!" },
      { text: "A stranger wants your address 📍", category: "dangerous", explanation: "Never share your address with strangers!" },
    ],
    defender: [
      { text: "School newsletter email", category: "safe", explanation: "Official school communications are trustworthy." },
      { text: "\"Your Roblox account will be banned!\"", category: "dangerous", explanation: "Scare tactics are a common scam technique." },
      { text: "Library overdue book notification", category: "safe", explanation: "Libraries send legitimate reminders." },
      { text: "\"Send gift cards to unlock your prize\"", category: "dangerous", explanation: "Gift card requests are always scams!" },
      { text: "Family group chat message", category: "safe", explanation: "Known family contacts are safe." },
      { text: "\"Verify your password via this link\"", category: "dangerous", explanation: "Legitimate services never ask for passwords via links." },
    ],
    guardian: [
      { text: "Two-factor authentication code from Google", category: "safe", explanation: "2FA codes from services you use are legitimate." },
      { text: "\"Your Netflix is suspended — click to fix\"", category: "dangerous", explanation: "Go to netflix.com directly instead of clicking links." },
      { text: "Password reset you requested", category: "safe", explanation: "If YOU requested it, it's legitimate." },
      { text: "\"IRS owes you $5000 — claim now\"", category: "dangerous", explanation: "Government agencies never contact you this way." },
      { text: "Software update notification from OS", category: "safe", explanation: "Official OS updates are safe." },
      { text: "\"Your photos have been leaked — pay now\"", category: "dangerous", explanation: "Extortion emails are scams — don't respond." },
    ],
  },
  "password-safety": {
    junior: [
      { text: "MyDog123!", category: "safe", explanation: "Has letters, numbers, and a symbol — good start!" },
      { text: "password", category: "dangerous", explanation: "'password' is the easiest password to guess!" },
      { text: "StarFish#77", category: "safe", explanation: "Mix of words, symbols and numbers!" },
      { text: "1234", category: "dangerous", explanation: "Too short and too easy to guess!" },
      { text: "BlueRocket!9", category: "safe", explanation: "Creative and strong!" },
      { text: "abcabc", category: "dangerous", explanation: "Repeated simple letters are weak!" },
    ],
    defender: [
      { text: "Tr0pic@lFish42", category: "safe", explanation: "Great mix of characters and substitutions!" },
      { text: "qwerty123", category: "dangerous", explanation: "Keyboard patterns are easily guessed!" },
      { text: "Ph0en!x_R1s3s", category: "safe", explanation: "Creative substitutions make this strong!" },
      { text: "iloveyou", category: "dangerous", explanation: "Common phrases are in every hacker's dictionary!" },
      { text: "C0sm!c_St@rm#7", category: "safe", explanation: "Long with many character types!" },
      { text: "admin2024", category: "dangerous", explanation: "Common words + year = easily cracked!" },
    ],
    guardian: [
      { text: "xK9#mP2$vL7@nQ", category: "safe", explanation: "Random characters are the strongest!" },
      { text: "letmein", category: "dangerous", explanation: "One of the top 10 most common passwords!" },
      { text: "Correct-Horse-Battery-Staple", category: "safe", explanation: "Passphrase style — long and memorable!" },
      { text: "123456789", category: "dangerous", explanation: "Sequential numbers are instantly cracked!" },
      { text: "7h3_Qu!ck_Br0wn_F0x", category: "safe", explanation: "Modified phrase with substitutions!" },
      { text: "football2024", category: "dangerous", explanation: "Common word + year is easily guessed!" },
    ],
  },
  "personal-info": {
    junior: [
      { text: "Your favorite color", category: "safe", explanation: "Favorite colors don't reveal personal details!" },
      { text: "Your home address", category: "dangerous", explanation: "Never share where you live online!" },
      { text: "Your favorite cartoon", category: "safe", explanation: "Talking about shows you like is fine!" },
      { text: "Your school name and class", category: "dangerous", explanation: "Strangers could use this to find you!" },
      { text: "Your favorite food", category: "safe", explanation: "Food preferences are safe to share!" },
      { text: "Your phone number", category: "dangerous", explanation: "Only share your number with trusted people!" },
    ],
    defender: [
      { text: "A drawing you made", category: "safe", explanation: "Sharing artwork is fine!" },
      { text: "Your parents' credit card number", category: "dangerous", explanation: "Financial info is always private!" },
      { text: "Your opinion on a movie", category: "safe", explanation: "Opinions are safe to share!" },
      { text: "A photo showing your house number", category: "dangerous", explanation: "Photos can reveal your location!" },
      { text: "Your favorite sports team", category: "safe", explanation: "Supporting a team is public info!" },
      { text: "Your email password", category: "dangerous", explanation: "NEVER share passwords with anyone!" },
    ],
    guardian: [
      { text: "A meme you found funny", category: "safe", explanation: "Sharing humor is fine!" },
      { text: "Your Social Security Number", category: "dangerous", explanation: "SSN enables identity theft!" },
      { text: "Your thoughts on a book", category: "safe", explanation: "Book reviews are safe!" },
      { text: "Your daily schedule and location", category: "dangerous", explanation: "Routines reveal when you're vulnerable!" },
      { text: "A game recommendation", category: "safe", explanation: "Game suggestions are harmless!" },
      { text: "Your mother's maiden name", category: "dangerous", explanation: "Often used as a security question!" },
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

  const handleSort = (choice: "safe" | "dangerous") => {
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

  if (done) {
    const allCorrect = correctCount >= items.length * 0.8;
    return (
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
        <p className="text-5xl">{allCorrect ? "🎉" : "💪"}</p>
        <p className="text-lg font-bold">
          {allCorrect ? "Amazing sorting skills!" : "Good effort! Keep practicing!"}
        </p>
        <p className="text-sm text-muted-foreground">
          You got {correctCount}/{items.length} correct!
        </p>
        <Button variant="hero" className="w-full py-5 text-base" onClick={() => onComplete(allCorrect)}>
          Continue ✨
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center gap-3 mb-4">
        <img src={guideImage} alt={guideName} className="h-12 w-12 object-contain" />
        <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-left">
          <p className="font-semibold text-sm">
            {missionId === "personal-info"
              ? "🤫 Should you share this online? Sort each item!"
              : missionId === "password-safety"
              ? "🔐 Is this a strong password or a weak one? Sort them!"
              : "🛡️ Sort each item into the correct category!"}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        Item {currentIdx + 1} of {items.length}
      </p>

      <AnimatePresence mode="wait">
        {!feedback ? (
          <motion.div
            key={currentIdx}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
          >
            <div className="rounded-2xl border-2 border-border bg-card p-6 mb-6 shadow-card">
              <p className="text-lg font-bold">{current.text}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSort(missionId === "personal-info" ? "safe" : "safe")}
                className="rounded-2xl border-2 border-secondary/40 bg-secondary/10 p-6 text-center hover:bg-secondary/20 transition-colors active:scale-95"
              >
                <span className="block text-4xl mb-2">
                  {missionId === "personal-info" ? "👍" : missionId === "password-safety" ? "💪" : "✅"}
                </span>
                <span className="font-bold text-sm">
                  {missionId === "personal-info" ? "OK to Share" : missionId === "password-safety" ? "Strong" : "Safe"}
                </span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSort("dangerous")}
                className="rounded-2xl border-2 border-destructive/40 bg-destructive/10 p-6 text-center hover:bg-destructive/20 transition-colors active:scale-95"
              >
                <span className="block text-4xl mb-2">
                  {missionId === "personal-info" ? "🤫" : missionId === "password-safety" ? "💔" : "⚠️"}
                </span>
                <span className="font-bold text-sm">
                  {missionId === "personal-info" ? "Keep Private" : missionId === "password-safety" ? "Weak" : "Dangerous"}
                </span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className={`rounded-2xl p-5 mb-4 ${
              feedback.correct
                ? "bg-secondary/10 border-2 border-secondary/30"
                : "bg-destructive/10 border-2 border-destructive/30"
            }`}>
              <p className="text-3xl mb-2">{feedback.correct ? "🎉" : "😊"}</p>
              <p className="font-bold text-base mb-1">
                {feedback.correct ? "Correct!" : "Not quite!"}
              </p>
              <p className="text-sm text-muted-foreground">{feedback.explanation}</p>
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
