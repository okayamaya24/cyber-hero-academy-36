import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import byte from "@/assets/home/byte.webp";
import phisherKing from "@/assets/home/phisher-king.webp";
import keybreaker from "@/assets/home/keybreaker.webp";
import dataThief from "@/assets/home/data-thief.webp";

interface Round {
  villain: string;
  villainImage: string;
  color: string;
  setup: string;
  card: React.ReactNode;
  question: string;
  options: string[];
  correct: number;
  winLine: string;
  loseLine: string;
  lesson: string;
}

const rounds: Round[] = [
  {
    villain: "The Phisher King",
    villainImage: phisherKing,
    color: "#4488cc",
    setup: "A message pops up on your tablet…",
    card: (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left">
        <p className="text-xs text-gray-500">From: prizes@free-gamez-winner.net</p>
        <p className="mt-2 font-bold text-white">🎉 YOU WON a free game console!!</p>
        <p className="mt-1 text-sm text-gray-300">Click here in the next 5 MINUTES to claim it before it's gone! ⏰</p>
      </div>
    ),
    question: "What should you do?",
    options: ["Click it fast! 🏃", "It's a trick! 🚫"],
    correct: 1,
    winLine: "NOOO! How did you know?! 😤",
    loseLine: "Hehehe… gotcha! 🎣",
    lesson: "Real prizes don't rush you. A countdown is a trick to make you click before you think!",
  },
  {
    villain: "The Keybreaker",
    villainImage: keybreaker,
    color: "#ff4444",
    setup: "The Keybreaker is trying to crack your account!",
    card: null,
    question: "Which password is harder to crack?",
    options: ["fluffy123", "Purple$Taco$Jumps42"],
    correct: 1,
    winLine: "Ugh! That one's too strong to crack! 🔒",
    loseLine: "Cracked it in one second! 🔓",
    lesson: "Long passwords made of silly words, symbols, and numbers are super hard to crack!",
  },
  {
    villain: "The Data Thief",
    villainImage: dataThief,
    color: "#cc44aa",
    setup: "You're playing a game online when this appears…",
    card: (
      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left">
        <p className="font-bold text-white">🎁 Unlock a FREE golden skin!</p>
        <p className="mt-1 text-sm text-gray-300">Just type your home address and school name below.</p>
      </div>
    ),
    question: "What do you do?",
    options: ["Type it in 📝", "Ask a grown-up first 🙋"],
    correct: 1,
    winLine: "Hmph! I needed that info! 😠",
    loseLine: "Thanks for the info! 😈",
    lesson: "Never share your address, school, or full name online. Always check with a grown-up first!",
  },
];

export default function TrickSpotterDemo() {
  const [step, setStep] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const round = rounds[index];
  const answered = picked !== null;
  const gotIt = picked === round.correct;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === round.correct) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 < rounds.length) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      setStep("done");
    }
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setStep("play");
  };

  return (
    <section id="try-it" className="scroll-mt-20 bg-[#080c18] py-20">
      <div className="container mx-auto px-4">
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 px-4 py-2 text-sm font-bold text-[#00ff88]">
            🎮 No sign-up needed
          </div>
          <h2 className="text-3xl font-black text-white md:text-4xl">Try a Mission Right Now!</h2>
          <p className="mt-3 text-gray-500">Can you spot the villains' tricks? 3 quick challenges.</p>
        </motion.div>

        <div className="mx-auto flex min-h-[600px] max-w-2xl flex-col justify-center overflow-hidden md:min-h-[570px] rounded-3xl border border-[#00d4ff]/20 bg-[#0d1323] shadow-[0_0_60px_rgba(0,212,255,0.08)]">
          <AnimatePresence mode="wait">
            {step === "intro" && (
              <motion.div
                key="intro"
                className="flex flex-col items-center p-8 text-center md:p-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <motion.img
                  src={byte}
                  alt="Byte, your robot fox sidekick"
                  className="mb-4 h-32 w-auto"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                />
                <div className="mb-6 rounded-2xl border border-[#00d4ff]/25 bg-[#00d4ff]/10 px-5 py-3 text-white">
                  <span className="font-bold text-[#00d4ff]">Byte:</span> Hi, Guardian! Three villains are causing trouble. Ready to stop them?
                </div>
                <Button
                  size="xl"
                  className="rounded-full font-black text-[#080c18] shadow-[0_0_24px_rgba(0,212,255,0.35)]"
                  style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                  onClick={() => setStep("play")}
                >
                  ⚡ Let's Go!
                </Button>
              </motion.div>
            )}

            {step === "play" && (
              <motion.div
                key={`round-${index}`}
                className="p-6 md:p-8"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
              >
                {/* Progress */}
                <div className="mb-5 flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-400">
                    Challenge {index + 1} of {rounds.length}
                  </span>
                  <span className="font-bold text-[#ffd700]">⭐ {score}</span>
                </div>
                <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                    animate={{ width: `${((index + (answered ? 1 : 0)) / rounds.length) * 100}%` }}
                  />
                </div>

                {/* Villain */}
                <div className="mb-5 flex items-center gap-4">
                  <motion.img
                    src={round.villainImage}
                    alt={round.villain}
                    className="h-20 w-20 shrink-0 object-contain"
                    animate={answered && gotIt ? { rotate: [0, -8, 8, -8, 0], scale: 0.9 } : { y: [0, -4, 0] }}
                    transition={answered && gotIt ? { duration: 0.5 } : { repeat: Infinity, duration: 2 }}
                  />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: round.color }}>
                      {round.villain}
                    </p>
                    <p className="text-white">{answered ? (gotIt ? round.winLine : round.loseLine) : round.setup}</p>
                  </div>
                </div>

                {round.card && <div className="mb-5">{round.card}</div>}

                <p className="mb-3 text-lg font-bold text-white">{round.question}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {round.options.map((opt, i) => {
                    const isRight = i === round.correct;
                    const state = !answered ? "idle" : isRight ? "right" : i === picked ? "wrong" : "dim";
                    return (
                      <motion.button
                        key={opt}
                        type="button"
                        onClick={() => choose(i)}
                        disabled={answered}
                        whileHover={!answered ? { scale: 1.03 } : undefined}
                        whileTap={!answered ? { scale: 0.97 } : undefined}
                        className={`rounded-2xl border-2 px-4 py-4 text-left font-bold transition-colors ${
                          state === "idle"
                            ? "border-white/10 bg-white/[0.04] text-white hover:border-[#00d4ff]/60"
                            : state === "right"
                              ? "border-[#00ff88] bg-[#00ff88]/15 text-[#00ff88]"
                              : state === "wrong"
                                ? "border-[#ff4444] bg-[#ff4444]/15 text-[#ff6b6b]"
                                : "border-white/5 bg-transparent text-gray-600"
                        }`}
                      >
                        {opt}
                        {state === "right" && " ✅"}
                        {state === "wrong" && " ❌"}
                      </motion.button>
                    );
                  })}
                </div>

                <AnimatePresence>
                  {answered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-1 items-start gap-3 rounded-2xl border border-[#00d4ff]/25 bg-[#00d4ff]/10 p-4">
                        <img src={byte} alt="" className="h-10 w-auto shrink-0" />
                        <p className="text-sm text-white">
                          <span className="font-bold text-[#00d4ff]">{gotIt ? "Nice one!" : "Good try!"}</span> {round.lesson}
                        </p>
                      </div>
                      <Button
                        className="rounded-full px-6 font-black text-[#080c18]"
                        style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                        onClick={next}
                      >
                        {index + 1 < rounds.length ? "Next →" : "Finish 🏁"}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {step === "done" && (
              <motion.div
                key="done"
                className="flex flex-col items-center p-8 text-center md:p-10"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="mb-2 text-5xl">{score === rounds.length ? "🏆" : "⭐"}</div>
                <h3 className="text-2xl font-black text-white md:text-3xl">
                  {score === rounds.length ? "Perfect! You're a natural, Guardian!" : `You stopped ${score} of ${rounds.length} villains!`}
                </h3>
                <p className="mt-3 max-w-md text-gray-400">
                  {score === rounds.length
                    ? "Those villains didn't stand a chance. There's a whole world of missions waiting for you."
                    : "Every hero starts somewhere! Keep training and you'll beat them all."}
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <Button
                    size="xl"
                    className="rounded-full font-black text-[#080c18] shadow-[0_0_24px_rgba(0,212,255,0.35)]"
                    style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                    asChild
                  >
                    <Link to="/signup">🚀 Ask a Grown-Up to Sign You Up</Link>
                  </Button>
                  <button
                    type="button"
                    onClick={restart}
                    className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    🔁 Play Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
