import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { PICTURES, PICTURE_PASSWORD_LENGTH } from "@/lib/picturePassword";

const SAVED_CODE_KEY = "cha_class_code";

interface Student {
  id: string;
  name: string;
  avatar: string;
  avatarConfig: Record<string, unknown> | null;
}

class ClassLoginError extends Error {
  locked?: boolean;
}

async function callClassLogin<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("class-login", { body });
  if (error) {
    const details = await (error as { context?: Response }).context?.json?.().catch(() => null);
    if (details?.reason) console.warn(`class-login: ${details.reason}`);
    const err = new ClassLoginError(details?.error ?? "Something went wrong. Try again!");
    err.locked = !!details?.locked;
    throw err;
  }
  return data as T;
}

function readSavedCode(): string {
  try {
    return localStorage.getItem(SAVED_CODE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveCode(code: string | null) {
  try {
    if (code) localStorage.setItem(SAVED_CODE_KEY, code);
    else localStorage.removeItem(SAVED_CODE_KEY);
  } catch {
    // Storage blocked (private mode) — the kid just types the code again next time
  }
}

export default function ClassLoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<"code" | "hero" | "pictures">("code");
  const [code, setCode] = useState("");
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  // Remembered class on this device → jump straight to "tap your hero"
  useEffect(() => {
    const saved = readSavedCode();
    if (saved) loadRoster(saved, true);
  }, []);

  async function loadRoster(rawCode: string, fromSaved = false) {
    const clean = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setCode(clean);
    setError("");
    setBusy(true);
    try {
      const data = await callClassLogin<{ className: string; students: Student[] }>({ action: "roster", code: clean });
      setClassName(data.className);
      setStudents(data.students);
      saveCode(clean);
      setStep("hero");
    } catch (e) {
      if (fromSaved) saveCode(null);
      else setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function tapPicture(id: string) {
    if (busy || !student) return;
    const next = [...picked, id];
    setPicked(next);
    setError("");
    if (next.length < PICTURE_PASSWORD_LENGTH) return;

    setBusy(true);
    try {
      const { token_hash } = await callClassLogin<{ token_hash: string }>({
        action: "login",
        code,
        studentId: student.id,
        pictures: next,
      });
      // Current Supabase expects "email" for magic link tokens; older setups used "magiclink"
      let { error: otpError } = await supabase.auth.verifyOtp({ token_hash, type: "email" });
      if (otpError) ({ error: otpError } = await supabase.auth.verifyOtp({ token_hash, type: "magiclink" }));
      if (otpError) {
        console.warn("class-login: verify_otp_failed", otpError.message);
        throw new Error("Something went wrong. Try again!");
      }
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError((e as Error).message);
      setPicked([]);
      if ((e as ClassLoginError).locked) setStep("hero");
    } finally {
      setBusy(false);
    }
  }

  function switchClass() {
    saveCode(null);
    setCode("");
    setStudents([]);
    setStudent(null);
    setPicked([]);
    setError("");
    setStep("code");
  }

  return (
    <div className="min-h-screen bg-[#080c18] px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-20 left-1/3 h-[500px] w-[600px] rounded-full bg-[#00d4ff]/[0.07] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#00ff88]/[0.05] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <AnimatePresence mode="wait">
          {/* ── Step 1: class code ── */}
          {step === "code" && (
            <motion.div
              key="code"
              className="mx-auto max-w-md text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-4 text-6xl">🎒</div>
              <h1 className="text-3xl font-black md:text-4xl">Enter your class code</h1>
              <p className="mt-2 text-gray-400">Your teacher has it. It's 6 letters and numbers.</p>

              <form
                className="mt-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  loadRoster(code);
                }}
              >
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  placeholder="ABC123"
                  aria-label="Class code"
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  className="w-full rounded-2xl border-2 border-[#00d4ff]/30 bg-white/5 px-4 py-4 text-center font-mono text-4xl font-black tracking-[0.3em] text-white placeholder:text-white/15 focus:border-[#00d4ff] focus:outline-none"
                />
                {error && <p className="mt-3 font-semibold text-[#ff6b6b]">{error}</p>}
                <Button
                  type="submit"
                  size="xl"
                  disabled={code.length !== 6 || busy}
                  className="mt-6 w-full rounded-full font-black text-[#080c18]"
                  style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                >
                  {busy ? "Finding your class…" : "Let's Go! 🚀"}
                </Button>
              </form>

              <Link to="/login" className="mt-8 inline-block text-sm text-gray-500 hover:text-gray-300">
                Have a username and password instead? Log in here →
              </Link>
            </motion.div>
          )}

          {/* ── Step 2: tap your hero ── */}
          {step === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-[#00d4ff]">{className}</p>
                <h1 className="mt-1 text-3xl font-black md:text-4xl">Tap your hero!</h1>
                {error && <p className="mt-3 font-semibold text-[#ff6b6b]">{error}</p>}
              </div>

              {students.length === 0 ? (
                <p className="text-center text-gray-400">No heroes in this class yet. Ask your teacher!</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {students.map((s) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setStudent(s);
                        setPicked([]);
                        setError("");
                        setStep("pictures");
                      }}
                      className="flex flex-col items-center rounded-2xl border border-white/10 bg-[#0d1323] p-4 transition-colors hover:border-[#00d4ff]/50"
                    >
                      <HeroAvatar avatarConfig={s.avatarConfig} fallbackEmoji={s.avatar} size={88} />
                      <span className="mt-2 font-bold">{s.name}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              <div className="mt-10 text-center">
                <button type="button" onClick={switchClass} className="text-sm text-gray-500 hover:text-gray-300">
                  Not your class? Enter a different code
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: secret pictures ── */}
          {step === "pictures" && student && (
            <motion.div
              key="pictures"
              className="mx-auto max-w-md text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <HeroAvatar
                avatarConfig={student.avatarConfig}
                fallbackEmoji={student.avatar}
                size={96}
                className="mx-auto"
              />
              <h1 className="mt-3 text-3xl font-black">Hi, {student.name.split(" ")[0]}!</h1>
              <p className="mt-1 text-gray-400">Tap your {PICTURE_PASSWORD_LENGTH} secret pictures in order.</p>

              {/* Progress dots */}
              <div className="my-6 flex justify-center gap-3" aria-live="polite">
                {Array.from({ length: PICTURE_PASSWORD_LENGTH }, (_, i) => (
                  <div
                    key={i}
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-3xl ${
                      picked[i] ? "border-[#00ff88] bg-[#00ff88]/10" : "border-dashed border-white/20"
                    }`}
                  >
                    {picked[i] ? "✱" : ""}
                  </div>
                ))}
              </div>

              {error && <p className="mb-4 font-semibold text-[#ff6b6b]">{error}</p>}

              <div className="grid grid-cols-3 gap-3">
                {PICTURES.map((p) => (
                  <motion.button
                    key={p.id}
                    type="button"
                    aria-label={p.label}
                    disabled={busy}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => tapPicture(p.id)}
                    className="flex aspect-square items-center justify-center rounded-2xl border-2 border-white/10 bg-[#0d1323] text-5xl transition-colors hover:border-[#00d4ff]/60 disabled:opacity-50 sm:text-6xl"
                  >
                    {p.emoji}
                  </motion.button>
                ))}
              </div>

              {busy && <p className="mt-4 text-[#00d4ff]">Checking… 🔐</p>}

              <button
                type="button"
                onClick={() => {
                  setStudent(null);
                  setPicked([]);
                  setError("");
                  setStep("hero");
                }}
                className="mt-8 text-sm text-gray-500 hover:text-gray-300"
              >
                ← That's not me
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
