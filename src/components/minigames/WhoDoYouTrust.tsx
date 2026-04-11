import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props { onComplete: (stars: number) => void; }

const SCENARIOS = [
  { text: "A friend at school asks for your password to help with homework.", trust: false, tip: "Never share passwords, even with friends!" },
  { text: "Your parent asks you to update your password together.", trust: true, tip: "Parents/guardians help keep you safe online." },
  { text: "A pop-up says 'You won a prize! Enter your password to claim it.'", trust: false, tip: "Real prizes never ask for passwords!" },
  { text: "Your teacher asks you to log in to a school website in class.", trust: true, tip: "Teachers guide you to safe websites." },
  { text: "A stranger online says they're from tech support and need your password.", trust: false, tip: "Real tech support never asks for passwords!" },
];

export default function WhoDoYouTrust({ onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const s = SCENARIOS[idx];
  if (!s) {
    const stars = score >= 4 ? 3 : score >= 3 ? 2 : 1;
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <span className="text-5xl">🤔</span>
        <h2 className="text-2xl font-bold text-white">Who Do You Trust Complete!</h2>
        <p className="text-[#00d4ff]">{score}/{SCENARIOS.length} correct — {"⭐".repeat(stars)}</p>
        <Button onClick={() => onComplete(stars)} className="bg-[#00d4ff] text-black font-bold mt-4">Continue</Button>
      </div>
    );
  }

  const judge = (trusted: boolean) => {
    if (trusted === s.trust) setScore(sc => sc + 1);
    setShowTip(true);
    setTimeout(() => { setShowTip(false); setIdx(idx + 1); }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 gap-6">
      <h3 className="text-xl font-bold text-white">🤔 Who Do You Trust?</h3>
      <motion.div key={idx} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="bg-black/40 border border-white/20 rounded-xl p-6 max-w-md text-center">
        <p className="text-white text-base">{s.text}</p>
      </motion.div>
      {showTip ? (
        <p className="text-[#00d4ff] text-sm font-medium max-w-sm text-center">{s.tip}</p>
      ) : (
        <div className="flex gap-4">
          <Button onClick={() => judge(true)} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6">✅ Trust</Button>
          <Button onClick={() => judge(false)} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6">🚫 Don't Trust</Button>
        </div>
      )}
      <p className="text-white/40 text-sm">{idx + 1}/{SCENARIOS.length}</p>
    </div>
  );
}
