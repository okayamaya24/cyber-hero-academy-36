import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Map } from "lucide-react";

interface HQOrientationProps {
  playerName: string;
  avatarConfig: any;
  onComplete: (choiceId: string) => void;
}

// --- Mini-game data ---
const PASSWORDS = [
  {
    id: "p1",
    value: "fluffy",
    answer: "weak" as const,
    byteComment: "Yep — too short, no numbers or symbols. He'll crack this in two seconds.",
  },
  {
    id: "p2",
    value: "T!ger92$",
    answer: "strong" as const,
    byteComment: "Now THAT'S a lock. Strong, weird, and beautiful.",
  },
  {
    id: "p3",
    value: "password123",
    answer: "weak" as const,
    byteComment: "This one's basically a welcome mat that says COME IN.",
  },
];

// --- Choice data ---
const CHOICES = [
  {
    id: "A",
    text: "Because if someone gets mine, they can pretend to be me.",
    byteResponse: "Exactly. Identity. That's the real stakes — it's not just an account, it's YOU.",
  },
  {
    id: "B",
    text: "Because everything important is locked behind one.",
    byteResponse: "Right — passwords are the keys to your whole digital life. One weak one puts everything at risk.",
  },
  {
    id: "C",
    text: "Honestly… I'm not totally sure yet.",
    byteResponse:
      "Honest answer. Best kind. That's why we're doing this — by the end of North America, you'll know exactly why. Let's go find out together.",
  },
];

type PasswordGuess = "strong" | "weak" | null;

const HQOrientation = ({ playerName, avatarConfig, onComplete }: HQOrientationProps) => {
  const [step, setStep] = useState(0);

  // Mini-game state
  const [guesses, setGuesses] = useState<Record<string, PasswordGuess>>({
    p1: null,
    p2: null,
    p3: null,
  });
  const [minigameSubmitted, setMinigameSubmitted] = useState(false);

  // Choice state
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [choiceConfirmed, setChoiceConfirmed] = useState(false);

  const allGuessed = PASSWORDS.every((p) => guesses[p.id] !== null);

  const handleGuess = (id: string, guess: "strong" | "weak") => {
    if (minigameSubmitted) return;
    setGuesses((prev) => ({ ...prev, [id]: guess }));
  };

  const TOTAL_STEPS = 5;

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(210,40%,8%)] overflow-y-auto">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* ── STEP 0 — Doors Open ── */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-6 max-w-md px-6 text-center py-12"
          >
            {/* Byte avatar placeholder */}
            <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 flex items-center justify-center text-5xl">
              🦊
            </div>

            <div className="flex items-center gap-3">
              <HeroAvatar avatarConfig={avatarConfig} size={48} />
              <span className="text-cyan-300 font-bold text-lg font-mono">{playerName}</span>
            </div>

            {/* Byte speech bubble */}
            <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-6 py-4 text-left relative">
              <div className="absolute -top-3 left-6 w-4 h-4 bg-cyan-950 border-l border-t border-cyan-500/40 rotate-45" />
              <p className="text-cyan-100 text-base leading-relaxed">
                <span className="text-cyan-400 font-bold">BYTE:</span>{" "}
                <em>"...We just had these fixed. Don't judge us."</em>
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-600/40 rounded-2xl px-6 py-4">
              <p className="text-white text-base leading-relaxed">
                The doors finally whoosh open. Byte perks up, eyes wide.
              </p>
            </div>

            <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-6 py-4 text-left">
              <p className="text-cyan-100 text-base leading-relaxed">
                <span className="text-cyan-400 font-bold">BYTE:</span> "Welcome to Cyber Hero Command — headquarters of
                every hero protecting the Digital World. That's me too, by the way. I'm Byte. I'm basically the brains
                of this operation."
                <br />
                <br />
                <em className="text-cyan-300/70 text-sm">...The other heroes disagree. They are wrong.</em>
              </p>
            </div>

            <StepDots current={0} total={TOTAL_STEPS} />
            <Button
              onClick={next}
              className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-lg"
            >
              Keep going →
            </Button>
          </motion.div>
        )}

        {/* ── STEP 1 — The Briefing ── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-6 max-w-md px-6 text-center py-12"
          >
            {/* Keybreaker alert card */}
            <div className="w-full bg-red-950/60 border border-red-500/50 rounded-2xl px-6 py-4 flex items-center gap-4">
              <div className="text-4xl shrink-0">🔐</div>
              <div className="text-left">
                <p className="text-red-400 font-bold text-sm uppercase tracking-widest">Threat Detected</p>
                <p className="text-white font-bold text-lg">THE KEYBREAKER</p>
                <p className="text-red-300/80 text-sm">Active in North America</p>
              </div>
            </div>

            <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-6 py-4 text-left">
              <p className="text-cyan-100 text-base leading-relaxed">
                <span className="text-cyan-400 font-bold">BYTE:</span> "The Keybreaker has been attacking passwords all
                across North America. Cracking weak ones, tricking people into giving them away, breaking into
                accounts."
              </p>
            </div>

            {/* Stakes moment */}
            <div className="bg-slate-800/60 border border-slate-600/40 rounded-2xl px-6 py-4 text-left">
              <p className="text-slate-300 text-sm leading-relaxed italic">
                A kid can't log into their game. A teacher loses her class documents. A family photo album disappears.
              </p>
            </div>

            <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-6 py-4 text-left">
              <p className="text-cyan-100 text-base leading-relaxed">
                <span className="text-cyan-400 font-bold">BYTE:</span>{" "}
                <span className="text-cyan-200">
                  Real people are losing real things. Their memories. Their work. Their privacy.
                </span>
                <br />
                <br />
                Good news: <span className="text-cyan-400 font-bold">YOU'RE here now.</span> And The Keybreaker doesn't
                know that yet.
              </p>
            </div>

            <StepDots current={1} total={TOTAL_STEPS} />
            <Button
              onClick={next}
              className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-lg"
            >
              I'm ready →
            </Button>
          </motion.div>
        )}

        {/* ── STEP 2 — Mini-game: Lock Check ── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-5 max-w-md px-6 text-center py-12 w-full"
          >
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Lock className="w-8 h-8 text-cyan-400" />
            </div>

            <h2 className="text-2xl font-bold text-white font-['Orbitron']">Lock Check</h2>

            <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-5 py-3 text-left w-full">
              <p className="text-cyan-100 text-sm leading-relaxed">
                <span className="text-cyan-400 font-bold">BYTE:</span> "Before you hit the field — quick test. Tell me
                which of these passwords are strong and which ones The Keybreaker will crack first."
              </p>
            </div>

            {/* Password cards */}
            <div className="flex flex-col gap-3 w-full">
              {PASSWORDS.map((pw) => {
                const guess = guesses[pw.id];
                const isCorrect = guess === pw.answer;
                const showResult = minigameSubmitted && guess !== null;

                return (
                  <div
                    key={pw.id}
                    className={`rounded-xl border px-4 py-3 transition-all ${
                      showResult
                        ? isCorrect
                          ? "border-green-500/60 bg-green-950/40"
                          : "border-red-500/60 bg-red-950/40"
                        : "border-slate-600/40 bg-slate-800/60"
                    }`}
                  >
                    <p className="text-white font-mono text-lg font-bold mb-2">{pw.value}</p>

                    {!minigameSubmitted && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleGuess(pw.id, "strong")}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                            guess === "strong"
                              ? "bg-green-600 border-green-500 text-white"
                              : "border-green-700/50 text-green-400 hover:bg-green-900/40"
                          }`}
                        >
                          🔒 STRONG
                        </button>
                        <button
                          onClick={() => handleGuess(pw.id, "weak")}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-all ${
                            guess === "weak"
                              ? "bg-red-600 border-red-500 text-white"
                              : "border-red-700/50 text-red-400 hover:bg-red-900/40"
                          }`}
                        >
                          💥 WEAK
                        </button>
                      </div>
                    )}

                    {showResult && (
                      <p className={`text-sm mt-1 ${isCorrect ? "text-green-300" : "text-red-300"}`}>
                        {isCorrect ? "✓ " : "✗ "}
                        <span className="text-cyan-300 font-semibold">BYTE:</span> "{pw.byteComment}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit / Next */}
            {!minigameSubmitted ? (
              <Button
                disabled={!allGuessed}
                onClick={() => setMinigameSubmitted(true)}
                className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-lg disabled:opacity-40"
              >
                Check answers
              </Button>
            ) : (
              <Button
                onClick={next}
                className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-lg"
              >
                Got it — let's move →
              </Button>
            )}

            <StepDots current={2} total={TOTAL_STEPS} />
          </motion.div>
        )}

        {/* ── STEP 3 — Choice: Why do passwords matter? ── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-5 max-w-md px-6 text-center py-12 w-full"
          >
            <div className="text-4xl">🦊</div>
            <h2 className="text-xl font-bold text-white font-['Orbitron']">Before you go…</h2>

            <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-5 py-4 text-left w-full">
              <p className="text-cyan-100 text-base leading-relaxed">
                <span className="text-cyan-400 font-bold">BYTE:</span> "Quick question. Why do YOU think passwords
                matter?"
              </p>
            </div>

            {/* Choice buttons */}
            {!choiceConfirmed && (
              <div className="flex flex-col gap-3 w-full">
                {CHOICES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedChoice(c.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all ${
                      selectedChoice === c.id
                        ? "border-cyan-400 bg-cyan-900/60 text-white"
                        : "border-slate-600/40 bg-slate-800/40 text-slate-300 hover:border-cyan-600/50"
                    }`}
                  >
                    {c.text}
                  </button>
                ))}
              </div>
            )}

            {/* Byte response after selection */}
            {selectedChoice && !choiceConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-5 py-4 text-left w-full"
              >
                <p className="text-cyan-100 text-base leading-relaxed">
                  <span className="text-cyan-400 font-bold">BYTE:</span> "
                  {CHOICES.find((c) => c.id === selectedChoice)?.byteResponse}"
                </p>
              </motion.div>
            )}

            {selectedChoice && !choiceConfirmed && (
              <Button
                onClick={() => setChoiceConfirmed(true)}
                className="mt-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-lg"
              >
                That's my answer →
              </Button>
            )}

            {choiceConfirmed && (
              <Button
                onClick={next}
                className="mt-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl text-lg"
              >
                Let's go →
              </Button>
            )}

            <StepDots current={3} total={TOTAL_STEPS} />
          </motion.div>
        )}

        {/* ── STEP 4 — First Mission / Map Unlock ── */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center gap-6 max-w-md px-6 text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400/60 flex items-center justify-center">
              <Map className="w-10 h-10 text-cyan-400" />
            </div>

            <h2 className="text-2xl font-bold text-white font-['Orbitron']">Mission Incoming</h2>

            <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-6 py-4 text-left">
              <p className="text-cyan-100 text-base leading-relaxed">
                <span className="text-cyan-400 font-bold">BYTE:</span> "Your first mission is at{" "}
                <span className="text-white font-bold">Password Peak, New York.</span> The Keybreaker's been hitting it
                the hardest — most important accounts in the city are there."
              </p>
            </div>

            {/* Zone unlock card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full bg-gradient-to-r from-cyan-900/60 to-cyan-800/40 border border-cyan-400/50 rounded-2xl px-6 py-4 flex items-center gap-4"
            >
              <div className="text-4xl">🗽</div>
              <div className="text-left">
                <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Zone 1 — Unlocked</p>
                <p className="text-white font-bold text-lg">Password Peak</p>
                <p className="text-cyan-300/70 text-sm">New York, USA</p>
              </div>
              <div className="ml-auto text-2xl">✨</div>
            </motion.div>

            <div className="bg-cyan-950/80 border border-cyan-500/40 rounded-2xl px-6 py-4 text-left">
              <p className="text-cyan-100 text-base leading-relaxed">
                <span className="text-cyan-400 font-bold">BYTE:</span> "Guardian. Password Peak is waiting. The
                Keybreaker's already there."
                <br />
                <br />
                <span className="text-cyan-300/70 text-sm italic">
                  ...Also the pizza in New York is genuinely incredible so that's a bonus.
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <HeroAvatar avatarConfig={avatarConfig} size={40} />
              <span className="text-cyan-300/70 text-sm font-mono">{playerName} — HQ Orientation complete</span>
            </div>

            <StepDots current={4} total={TOTAL_STEPS} />
            <Button
              onClick={() => onComplete(selectedChoice ?? "A")}
              className="mt-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold px-10 py-4 rounded-xl text-xl shadow-lg shadow-cyan-900/50"
            >
              Enter the Map 🗺️
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Dot progress indicator ──
const StepDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex gap-2 mt-2">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all duration-300 ${
          i === current ? "w-6 h-3 bg-cyan-400" : "w-3 h-3 bg-cyan-900/60"
        }`}
      />
    ))}
  </div>
);

export default HQOrientation;
