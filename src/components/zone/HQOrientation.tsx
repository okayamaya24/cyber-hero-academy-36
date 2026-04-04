import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Star } from "lucide-react";
import HeroAvatar from "@/components/avatar/HeroAvatar";

interface HQOrientationProps {
  playerName: string;
  avatarConfig?: any;
  onComplete: (choiceId: string) => void;
}

const PASSWORDS = [
  { text: "fluffy", strength: "weak" as const, hint: "Too short — no numbers or symbols" },
  { text: "T!ger92$", strength: "strong" as const, hint: "Long, mixed symbols and numbers!" },
  { text: "password123", strength: "weak" as const, hint: "Too common — hackers try this first" },
];

const CHOICES = [
  { id: "A", text: "So no one can steal our stuff online", emoji: "🔐", correct: true },
  { id: "B", text: "Because computers need them to work", emoji: "💻", correct: false },
  { id: "C", text: "To make the internet faster", emoji: "⚡", correct: false },
];

export default function HQOrientation({ playerName, avatarConfig, onComplete }: HQOrientationProps) {
  const [step, setStep] = useState(0);
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [minigameSubmitted, setMinigameSubmitted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const next = () => setStep((s) => s + 1);
  const allGuessed = PASSWORDS.every((p) => guesses[p.text]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0a0f1e] flex flex-col items-center overflow-y-auto"
    >
      {/* Progress dots */}
      <div className="sticky top-0 w-full flex justify-center pt-4 pb-3 bg-[#0a0f1e]/95 backdrop-blur-sm z-10">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step ? "w-8 h-3 bg-cyan-400" : i < step ? "w-3 h-3 bg-cyan-700" : "w-3 h-3 bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-2xl px-4 py-6">
        <AnimatePresence mode="wait">
          {/* ── STEP 0: Doors Open ── */}
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Byte's first line — image LEFT of bubble */}
              <div className="flex items-start gap-3">
                <img
                  src="/byte-character.png"
                  alt="Byte"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                />
                <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                  <p className="text-white italic">"...We just had these fixed. Don't judge us."</p>
                </div>
              </div>

              {/* Narration */}
              <div className="mx-2 bg-slate-800/50 rounded-2xl px-4 py-3">
                <p className="text-slate-400 italic text-sm text-center">
                  The doors finally whoosh open. Byte perks up, eyes wide.
                </p>
              </div>

              {/* Jake appears — avatar LEFT of content */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1 flex-shrink-0 w-20">
                  <HeroAvatar avatarConfig={avatarConfig} size={52} fallbackEmoji="🦸" />
                  <span className="text-cyan-300 font-bold text-xs">{playerName}</span>
                </div>
                <div className="flex-1 bg-slate-700/50 border border-slate-600/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-slate-200 italic text-sm">*steps through the doors and looks around*</p>
                </div>
              </div>

              {/* Byte's welcome — image LEFT of bubble */}
              <div className="flex items-start gap-3">
                <img
                  src="/byte-character.png"
                  alt="Byte"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                />
                <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                  <p className="text-white">
                    "Welcome to Cyber Hero Command — headquarters of every hero protecting the Digital World. That's me
                    too, by the way. I'm Byte. I'm basically the brains of this operation."
                  </p>
                  <p className="text-cyan-300/70 italic text-sm mt-2">...The other heroes disagree. They are wrong.</p>
                </div>
              </div>

              <button
                onClick={next}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all text-lg mt-2"
              >
                Keep going →
              </button>
            </motion.div>
          )}

          {/* ── STEP 1: The Briefing ── */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Keybreaker villain at top with red bubble */}
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-red-500/70 bg-red-950/60 flex items-center justify-center shadow-[0_0_16px_rgba(220,38,38,0.4)]">
                  <span className="text-5xl">🔓</span>
                </div>
                <div className="flex-1 bg-red-950/70 border border-red-500/60 rounded-2xl rounded-tl-sm p-4 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                  <p className="text-red-400 font-bold text-xs uppercase tracking-widest mb-1">⚠ Threat Detected</p>
                  <p className="text-white font-bold text-xl">THE KEYBREAKER</p>
                  <p className="text-red-300/80 text-sm mt-0.5">
                    "Password Plains — North America — is MINE. Don't even try."
                  </p>
                </div>
              </div>

              {/* Byte briefing */}
              <div className="flex items-start gap-3">
                <img
                  src="/byte-character.png"
                  alt="Byte"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                />
                <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                  <p className="text-white">
                    "The Keybreaker has been attacking passwords all across North America. Cracking weak ones, tricking
                    people into giving them away, breaking into accounts."
                  </p>
                </div>
              </div>

              {/* Stakes */}
              <div className="mx-2 bg-slate-800/50 rounded-2xl px-4 py-3">
                <p className="text-slate-300 italic text-sm">
                  A kid can't log into their game. A teacher loses her class documents. A family photo album disappears.
                </p>
              </div>

              {/* Byte continues */}
              <div className="flex items-start gap-3">
                <img
                  src="/byte-character.png"
                  alt="Byte"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                />
                <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                  <p className="text-white">
                    "Real people are losing real things. Their memories. Their work. Their privacy."
                  </p>
                  <p className="text-white mt-2">
                    Good news: <span className="text-cyan-400 font-bold">YOU'RE here now.</span> And The Keybreaker
                    doesn't know that yet.
                  </p>
                </div>
              </div>

              <button
                onClick={next}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all text-lg mt-2"
              >
                I'm ready →
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Lock Check Mini-Game ── */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src="/byte-character.png"
                  alt="Byte"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                />
                <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                  <p className="text-white">
                    "Quick training check! Tell me which of these passwords are strong and which ones The Keybreaker
                    will crack first."
                  </p>
                </div>
              </div>

              <p className="text-center text-slate-400 text-sm">
                Tap <span className="text-green-400 font-bold">STRONG 💪</span> or{" "}
                <span className="text-red-400 font-bold">WEAK 💥</span> for each one:
              </p>

              {PASSWORDS.map((pw) => {
                const guess = guesses[pw.text];
                const isCorrect = guess === pw.strength;
                const showResult = minigameSubmitted && !!guess;
                return (
                  <div
                    key={pw.text}
                    className={`rounded-2xl border px-4 py-4 transition-all ${
                      showResult
                        ? isCorrect
                          ? "border-green-500/60 bg-green-950/30"
                          : "border-red-500/60 bg-red-950/30"
                        : "border-slate-600/50 bg-slate-800/60"
                    }`}
                  >
                    <code className="text-cyan-300 text-2xl font-mono font-bold block mb-3">{pw.text}</code>
                    {!minigameSubmitted && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setGuesses((p) => ({ ...p, [pw.text]: "strong" }))}
                          className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-all ${
                            guess === "strong"
                              ? "bg-green-600 border-green-500 text-white"
                              : "border-green-700/50 text-green-400 hover:bg-green-900/40"
                          }`}
                        >
                          💪 Strong
                        </button>
                        <button
                          onClick={() => setGuesses((p) => ({ ...p, [pw.text]: "weak" }))}
                          className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-all ${
                            guess === "weak"
                              ? "bg-red-600 border-red-500 text-white"
                              : "border-red-700/50 text-red-400 hover:bg-red-900/40"
                          }`}
                        >
                          💥 Weak
                        </button>
                      </div>
                    )}
                    {showResult && (
                      <div
                        className={`flex items-center gap-2 text-sm mt-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}
                      >
                        {isCorrect ? <CheckCircle size={15} /> : <XCircle size={15} />}
                        <span>
                          {isCorrect ? "Correct! " : "Not quite — "}
                          {pw.hint}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {!minigameSubmitted ? (
                <button
                  disabled={!allGuessed}
                  onClick={() => setMinigameSubmitted(true)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-bold py-3 rounded-xl transition-all text-lg"
                >
                  Check answers
                </button>
              ) : (
                <button
                  onClick={next}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all text-lg"
                >
                  Nice work! Keep going →
                </button>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: Choice — Why Passwords Matter ── */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src="/byte-character.png"
                  alt="Byte"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                />
                <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                  <p className="text-white">
                    "Before we send you out there — quick question. Why do YOU think passwords matter?"
                  </p>
                </div>
              </div>

              {/* Question card */}
              <div className="bg-slate-800/70 border-2 border-cyan-500/30 rounded-2xl p-5 text-center">
                <p className="text-white font-bold text-xl">Why do passwords matter?</p>
                <p className="text-slate-400 text-sm mt-1">Pick the best answer below 👇</p>
              </div>

              {/* Choice buttons — always visible on step 3 */}
              <div className="space-y-3">
                {CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => {
                      if (!selectedChoice) setSelectedChoice(choice.id);
                    }}
                    disabled={!!selectedChoice}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-medium flex items-center gap-4 ${
                      selectedChoice
                        ? choice.correct
                          ? "border-green-500 bg-green-900/30 text-white"
                          : selectedChoice === choice.id
                            ? "border-red-500 bg-red-900/30 text-white"
                            : "border-slate-700 bg-slate-800/20 text-slate-500"
                        : "border-slate-600 bg-slate-800/60 text-white hover:border-cyan-400 hover:bg-slate-700/60 cursor-pointer"
                    }`}
                  >
                    <span className="text-2xl">{choice.emoji}</span>
                    <span className="flex-1">
                      <span className="text-cyan-400 font-bold">{choice.id}. </span>
                      {choice.text}
                    </span>
                    {selectedChoice && choice.correct && (
                      <CheckCircle className="text-green-400 flex-shrink-0" size={20} />
                    )}
                    {selectedChoice && selectedChoice === choice.id && !choice.correct && (
                      <XCircle className="text-red-400 flex-shrink-0" size={20} />
                    )}
                  </button>
                ))}
              </div>

              {/* Byte responds after choice */}
              {selectedChoice && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <img
                      src="/byte-character.png"
                      alt="Byte"
                      className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                    />
                    <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                      <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                      <p className="text-white">
                        {selectedChoice === "A"
                          ? "\"Exactly. Passwords protect everything that's yours online. That's why The Keybreaker goes after them first.\""
                          : '"Almost! Passwords protect everything that belongs to you online — your accounts, your stuff, your identity. That\'s why they matter."'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={next}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-xl transition-all text-lg"
                  >
                    Got it — what's the mission? →
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: Mission Unlock ── */}
          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <img
                  src="/byte-character.png"
                  alt="Byte"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                />
                <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                  <p className="text-white">
                    "Okay, <strong className="text-cyan-300">{playerName}</strong>. Orientation complete. Time to head
                    out."
                  </p>
                  <p className="text-white mt-2">
                    "The Keybreaker is moving through North America. Your first stop:{" "}
                    <span className="text-cyan-400 font-bold">Password Peak, New York.</span>"
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-2 border-cyan-500/60 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(34,211,238,0.15)]"
              >
                <div className="text-5xl mb-3">🗽</div>
                <p className="text-cyan-400 font-bold text-xs uppercase tracking-widest mb-1">Zone Unlocked</p>
                <p className="text-white font-bold text-3xl">Password Peak</p>
                <p className="text-slate-400 text-sm mt-1">New York, USA — Zone 1 of 8</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-slate-300 text-sm">Stop The Keybreaker here to advance</span>
                </div>
              </motion.div>

              <div className="flex items-start gap-3">
                <img
                  src="/byte-character.png"
                  alt="Byte"
                  className="w-20 h-20 object-contain flex-shrink-0 drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                />
                <div className="flex-1 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl rounded-tl-sm p-4">
                  <p className="text-cyan-400 font-bold text-xs uppercase tracking-wide mb-1">Byte</p>
                  <p className="text-white italic">
                    "I'll be right behind you. Probably. Maybe. I'm definitely not scared."
                  </p>
                  <p className="text-cyan-300/60 italic text-sm mt-1">...Byte's ears flatten slightly.</p>
                </div>
              </div>

              <button
                onClick={() => onComplete(selectedChoice || "A")}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold py-4 rounded-xl transition-all text-xl shadow-lg shadow-cyan-500/30"
              >
                🚀 Begin Mission!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
