import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props { onComplete: (stars: number) => void; }

const PASSWORDS = [
  { text: "123456", strong: false },
  { text: "Gr@v!ty#2025xQ", strong: true },
  { text: "password", strong: false },
  { text: "B1u3$ky!Rocket", strong: true },
  { text: "qwerty", strong: false },
  { text: "Z3br@Str!pe88!", strong: true },
];

export default function StrongOrSmash({ onComplete }: Props) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const pw = PASSWORDS[idx];
  if (!pw) {
    const stars = score >= 5 ? 3 : score >= 3 ? 2 : 1;
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <span className="text-5xl">💪</span>
        <h2 className="text-2xl font-bold text-white">Strong or Smash Complete!</h2>
        <p className="text-[#00d4ff]">{score}/{PASSWORDS.length} correct — {"⭐".repeat(stars)}</p>
        <Button onClick={() => onComplete(stars)} className="bg-[#00d4ff] text-black font-bold mt-4">Continue</Button>
      </div>
    );
  }

  const judge = (isStrong: boolean) => {
    const correct = isStrong === pw.strong;
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? "correct" : "wrong");
    setTimeout(() => { setFeedback(null); setIdx(idx + 1); }, 600);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 gap-6">
      <h3 className="text-xl font-bold text-white">💪 Strong or Smash?</h3>
      <p className="text-white/60 text-sm">Is this password strong or weak?</p>
      <motion.div key={idx} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-black/40 border border-white/20 rounded-xl px-8 py-6 text-center">
        <p className="text-2xl font-mono text-white">{pw.text}</p>
      </motion.div>
      {feedback ? (
        <p className={`text-lg font-bold ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}>
          {feedback === "correct" ? "✅ Correct!" : "❌ Not quite!"}
        </p>
      ) : (
        <div className="flex gap-4">
          <Button onClick={() => judge(true)} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6">💪 Strong</Button>
          <Button onClick={() => judge(false)} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6">💥 Smash</Button>
        </div>
      )}
      <p className="text-white/40 text-sm">{idx + 1}/{PASSWORDS.length}</p>
    </div>
  );
}
