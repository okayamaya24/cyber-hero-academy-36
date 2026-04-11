import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props { onComplete: (stars: number) => void; }

const QUESTIONS = [
  { prompt: "Which is a strong password?", options: ["password123", "M!x3d$tr0ng99", "myname"], answer: 1 },
  { prompt: "What makes a password strong?", options: ["Your birthday", "Short & simple", "Mix of letters, numbers & symbols"], answer: 2 },
  { prompt: "How long should a strong password be?", options: ["4 characters", "8 characters", "12+ characters"], answer: 2 },
];

export default function LockAndLearn({ onComplete }: Props) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const q = QUESTIONS[qi];
  if (!q) {
    const stars = score >= 3 ? 3 : score >= 2 ? 2 : 1;
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <span className="text-5xl">🔐</span>
        <h2 className="text-2xl font-bold text-white">Lock & Learn Complete!</h2>
        <p className="text-[#00d4ff]">{score}/{QUESTIONS.length} correct — {"⭐".repeat(stars)}</p>
        <Button onClick={() => onComplete(stars)} className="bg-[#00d4ff] text-black font-bold mt-4">Continue</Button>
      </div>
    );
  }

  const pick = (i: number) => {
    setSelected(i);
    if (i === q.answer) setScore(s => s + 1);
    setTimeout(() => { setSelected(null); setQi(qi + 1); }, 800);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 gap-6">
      <h3 className="text-xl font-bold text-white">🔐 Lock & Learn</h3>
      <p className="text-white/80 text-center">{q.prompt}</p>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {q.options.map((o, i) => (
          <motion.button key={i} whileTap={{ scale: 0.95 }} onClick={() => selected === null && pick(i)}
            className={`p-3 rounded-xl border text-left text-white font-medium transition-colors ${
              selected === i ? (i === q.answer ? "border-green-400 bg-green-400/20" : "border-red-400 bg-red-400/20") : "border-white/20 hover:border-[#00d4ff]/50"
            }`}>
            {o}
          </motion.button>
        ))}
      </div>
      <p className="text-white/40 text-sm">{qi + 1}/{QUESTIONS.length}</p>
    </div>
  );
}
