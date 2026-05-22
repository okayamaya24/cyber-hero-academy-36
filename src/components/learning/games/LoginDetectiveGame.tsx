/**
 * LoginDetectiveGame — Hero Lesson 2: Cyber Clues & Digital Trails
 * Show login records. Tap NORMAL or SUSPICIOUS for each.
 * Difficulty scales by childAge: junior / defender / guardian.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; childAge?: number; }

interface Login {
  location: string;
  time: string;
  device: string;
  suspicious: boolean;
  clue: string;
}

const LOGINS_JUNIOR: Login[] = [
  {
    location: "📍 Your City",
    time: "Today at 4:00 PM",
    device: "Your tablet",
    suspicious: false,
    clue: "Your city, your tablet, right after school — that's YOU! Everything looks normal. ✅",
  },
  {
    location: "📍 Your City",
    time: "Last night at 1:30 AM",
    device: "Unknown phone",
    suspicious: true,
    clue: "⚠️ Same city but 1:30 AM? You were fast asleep! Someone else used an unknown phone to get in. That's a hacker!",
  },
  {
    location: "📍 Grandma's City",
    time: "Last Saturday at 2:00 PM",
    device: "Your phone",
    suspicious: false,
    clue: "You visited grandma last weekend — that's YOU logging in from her house on your own phone! Totally fine. ✅",
  },
  {
    location: "📍 Another Country",
    time: "Today at 4:01 PM",
    device: "Unknown device",
    suspicious: true,
    clue: "⚠️ A different country ONE minute after your normal login? Someone else broke into your account at the exact same time!",
  },
  {
    location: "📍 Your City",
    time: "This morning at 8:15 AM",
    device: "School Chromebook",
    suspicious: false,
    clue: "Your city, school device, morning before class — that's you logging in at school. Nothing weird here! ✅",
  },
];

const LOGINS_DEFENDER: Login[] = [
  {
    location: "📍 Your City",
    time: "Today at 5:00 PM",
    device: "Chrome · your laptop",
    suspicious: false,
    clue: "Your city, your usual browser and laptop, after school. That's definitely you. ✅",
  },
  {
    location: "📍 Your City",
    time: "Today at 5:00 PM",
    device: "Safari · Unknown iPhone",
    suspicious: true,
    clue: "⚠️ Exact same time as your normal login but a totally different phone? Two people can't log in at the exact same second — one of them is a hacker!",
  },
  {
    location: "📍 Miami, FL",
    time: "Saturday at 11:15 AM",
    device: "Your phone",
    suspicious: false,
    clue: "You were on a family trip to Miami last weekend — that's YOU on your own phone. Logins from places you visit are fine! ✅",
  },
  {
    location: "📍 Your City",
    time: "Today at 4:45 AM",
    device: "Your laptop",
    suspicious: true,
    clue: "⚠️ Same city, same laptop — but 4:45 AM? You were asleep! Someone got into your account using your password. Change it immediately!",
  },
  {
    location: "📍 Your City",
    time: "Yesterday at 9:00 PM",
    device: "Firefox · your laptop",
    suspicious: false,
    clue: "Different browser than usual but same city and your device — you were just trying Firefox. That's fine! ✅",
  },
];

const LOGINS_GUARDIAN: Login[] = [
  {
    location: "📍 Home ISP · New York, NY",
    time: "Wednesday at 6:14 PM",
    device: "Chrome 124 · Windows 11",
    suspicious: false,
    clue: "Your home ISP, known browser and OS version, normal evening time — everything consistent. ✅",
  },
  {
    location: "📍 Home ISP · New York, NY",
    time: "Wednesday at 6:15 PM",
    device: "Chrome 124 · Windows 10",
    suspicious: true,
    clue: "⚠️ Same home IP and browser but Windows 10 vs Windows 11 one minute later — that's a physically different machine. Possible credential theft and concurrent session from another device on your network.",
  },
  {
    location: "📍 VPN Exit Node · New York, NY",
    time: "Friday at 3:20 PM",
    device: "Chrome 124 · macOS",
    suspicious: false,
    clue: "VPN IPs show a different address than your real ISP — but if you always use this VPN provider, this login is still YOU. Consistent VPN usage = normal. ✅",
  },
  {
    location: "📍 Data Center IP (AWS us-east-1)",
    time: "Thursday at 2:08 AM",
    device: "python-requests/2.31.0",
    suspicious: true,
    clue: "⚠️ AWS data center IP + python-requests user-agent = automated script, not a browser. At 2 AM. This is a credential-stuffing bot, not a human login.",
  },
  {
    location: "📍 Mobile Carrier IP",
    time: "Saturday at 1:05 PM",
    device: "Safari · iOS 17",
    suspicious: false,
    clue: "Mobile carrier IPs differ from home ISPs — this is your phone on cell data, not Wi-Fi. The carrier IP changing is expected and totally normal. ✅",
  },
];

function getTier(age?: number): "junior" | "defender" | "guardian" {
  if (!age || age < 8) return "junior";
  if (age < 11) return "defender";
  return "guardian";
}

export default function LoginDetectiveGame({ onComplete, childAge }: Props) {
  const tier = getTier(childAge);
  const LOGINS = tier === "junior" ? LOGINS_JUNIOR : tier === "guardian" ? LOGINS_GUARDIAN : LOGINS_DEFENDER;

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const login = LOGINS[round];

  const handleAnswer = (guessSuspicious: boolean) => {
    if (result !== null) return;
    const correct = guessSuspicious === login.suspicious;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round < LOGINS.length - 1) {
        setRound((r) => r + 1);
        setResult(null);
      } else {
        setDone(true);
      }
    }, 2200);
  };

  if (done) {
    const stars = score === LOGINS.length ? 3 : score >= Math.ceil(LOGINS.length * 0.6) ? 2 : 1;
    return (
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4">
        <div className="text-5xl">🕵️</div>
        <h2 className="text-xl font-black text-white">{score}/{LOGINS.length} flagged correctly!</h2>
        <p className="text-sm font-bold text-purple-300">
          {score === LOGINS.length
            ? "Perfect detective work! You'd spot a hacker instantly! 🦸"
            : score >= Math.ceil(LOGINS.length * 0.6)
            ? "Good instincts! Watch for unknown locations and weird devices."
            : "Tricky! Look for: unknown cities, odd hours, and unfamiliar devices."}
        </p>
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15, type: "spring", bounce: 0.7 }}>
              <span className={`text-3xl ${i < stars ? "" : "grayscale opacity-30"}`}>⭐</span>
            </motion.div>
          ))}
        </div>
        <button onClick={onComplete}
          className="w-full rounded-2xl py-4 font-black text-[#080c18] transition-all hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)" }}>
          Continue →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="py-2 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-purple-400"
            animate={{ width: `${(round / LOGINS.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{LOGINS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-purple-400 text-center tracking-wider">🔍 LOGIN DETECTIVE</p>

      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }} transition={{ duration: 0.2 }}>

          <div className={`rounded-2xl border-2 overflow-hidden mb-3 transition-colors ${
            result === "correct" ? "border-green-400" :
            result === "wrong"   ? "border-red-400"   : "border-white/10"
          }`}>
            <div className="bg-white/8 border-b border-white/10 px-4 py-2.5">
              <p className="text-[10px] font-extrabold text-purple-400 tracking-wider mb-1">🔐 ACCOUNT LOGIN ACTIVITY</p>
              <p className="text-base font-black text-white">{login.location}</p>
            </div>
            <div className="px-4 py-3 space-y-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14 flex-shrink-0">Time:</span>
                <span className="text-xs font-bold text-white">{login.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-14 flex-shrink-0">Device:</span>
                <span className="text-xs font-bold text-white">{login.device}</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className={`rounded-xl px-3 py-2.5 text-xs font-semibold leading-relaxed mb-3 ${
                  result === "correct"
                    ? "bg-green-500/15 border border-green-400/30 text-green-300"
                    : "bg-red-500/15 border border-red-400/30 text-red-300"
                }`}>
                {result === "correct" ? "✓ " : "✗ "}{login.clue}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(false)}
                className="rounded-2xl border-2 border-green-400/40 bg-green-500/15 py-4 font-black text-green-300 text-sm hover:bg-green-500/25 transition-colors">
                ✅ Normal
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(true)}
                className="rounded-2xl border-2 border-red-400/40 bg-red-500/15 py-4 font-black text-red-300 text-sm hover:bg-red-500/25 transition-colors">
                🚨 Suspicious!
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
