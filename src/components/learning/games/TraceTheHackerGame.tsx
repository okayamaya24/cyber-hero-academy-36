/**
 * TraceTheHackerGame — Hero Lesson 2: Cyber Clues & Digital Trails
 * Players sort digital clues as SAFE or SUSPICIOUS across 4 rounds.
 * Difficulty scales by childAge: junior / defender / guardian.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; childAge?: number; }

interface Clue {
  emoji: string;
  title: string;
  detail: string;
  suspicious: boolean;
  explanation: string;
}

interface Round {
  roundTitle: string;
  icon: string;
  description: string;
  clues: Clue[];
}

/* ── JUNIOR (ages 5–7) — very obvious differences ── */
const ROUNDS_JUNIOR: Round[] = [
  {
    roundTitle: "Website Check",
    icon: "🌐",
    description: "Is this website safe or not safe?",
    clues: [
      {
        emoji: "🔒",
        title: "https://roblox.com",
        detail: "Has a lock icon and it's the real Roblox website",
        suspicious: false,
        explanation: "✅ The real Roblox website with a lock — safe to visit! Always check for the lock! 🔒",
      },
      {
        emoji: "💀",
        title: "freerobux4u.xyz",
        detail: "No lock, weird name, says FREE ROBUX inside!",
        suspicious: true,
        explanation: "🚨 Fake! No lock + weird .xyz name + free Robux promise = a trap! Real Roblox never gives free Robux on random sites.",
      },
      {
        emoji: "🔒",
        title: "https://youtube.com",
        detail: "Has a lock icon — you watch videos here with your family",
        suspicious: false,
        explanation: "✅ The real YouTube with a lock — totally safe to visit! 😊",
      },
    ],
  },
  {
    roundTitle: "Message Check",
    icon: "💬",
    description: "Is this message safe or a trick?",
    clues: [
      {
        emoji: "📚",
        title: "\"Don't forget — show & tell is Friday!\"",
        detail: "From your teacher on the school app",
        suspicious: false,
        explanation: "✅ A reminder from your teacher — totally normal and safe!",
      },
      {
        emoji: "🎁",
        title: "\"YOU WON A FREE IPAD! Click now!!!\"",
        detail: "From a stranger you've never heard of",
        suspicious: true,
        explanation: "🚨 Strangers don't give away free iPads! This is a trick to steal your info. Tell a grown-up!",
      },
      {
        emoji: "🙋",
        title: "\"Can you help me with the math homework?\"",
        detail: "From your best friend's account",
        suspicious: false,
        explanation: "✅ A question from your friend — totally normal! 😊",
      },
    ],
  },
  {
    roundTitle: "Download Check",
    icon: "📥",
    description: "Safe to download or dangerous?",
    clues: [
      {
        emoji: "📄",
        title: "Colouring sheet from teacher",
        detail: "Shared by your teacher on the school website",
        suspicious: false,
        explanation: "✅ A file from your teacher's school site — safe to download!",
      },
      {
        emoji: "😈",
        title: "\"FREE_MINECRAFT_HACK.exe\"",
        detail: "Found on a random website promising free Minecraft",
        suspicious: true,
        explanation: "🚨 Never download this! Fake free game files hide viruses. Always ask a grown-up before downloading anything!",
      },
      {
        emoji: "🎵",
        title: "Spotify app from the App Store",
        detail: "Your parents helped you download it from the official store",
        suspicious: false,
        explanation: "✅ Official apps from the real App Store are safe — enjoy your music! 🎶",
      },
    ],
  },
  {
    roundTitle: "Account Clues",
    icon: "🔍",
    description: "Does this look normal or suspicious?",
    clues: [
      {
        emoji: "🏠",
        title: "Login from your home on your tablet",
        detail: "At 4 PM after school — your normal time",
        suspicious: false,
        explanation: "✅ Your home, your tablet, your usual time — that's just YOU! All normal.",
      },
      {
        emoji: "🌍",
        title: "Login from a faraway country at 3 AM",
        detail: "You were definitely asleep at home",
        suspicious: true,
        explanation: "🚨 A faraway country + 3 AM while you sleep = someone else used your account! Tell a grown-up right away!",
      },
      {
        emoji: "❤️",
        title: "Your friend liked your drawing",
        detail: "Normal notification from someone you know",
        suspicious: false,
        explanation: "✅ A like from a friend you know — that's just normal and nice! 😊",
      },
    ],
  },
];

/* ── DEFENDER (ages 8–10) — scenarios requiring thought ── */
const ROUNDS_DEFENDER: Round[] = [
  {
    roundTitle: "Website Detective",
    icon: "🌐",
    description: "Is this website safe or suspicious?",
    clues: [
      {
        emoji: "🔒",
        title: "https://roblox.com",
        detail: "Lock icon, official Roblox domain, no typos",
        suspicious: false,
        explanation: "✅ Real Roblox URL with a lock and https:// — totally safe to log in!",
      },
      {
        emoji: "⚠️",
        title: "http://r0blox-freegems.com",
        detail: "No lock, 'o' replaced with '0', promises free Robux",
        suspicious: true,
        explanation: "🚨 Fake! The '0' instead of 'o' and free Robux promise = phishing site. Real Roblox never gives free Robux on random sites!",
      },
      {
        emoji: "🔒",
        title: "https://youtube.com",
        detail: "Lock icon, exact official domain, no weird spelling",
        suspicious: false,
        explanation: "✅ Real YouTube URL with https:// — safe to visit!",
      },
    ],
  },
  {
    roundTitle: "Message Scanner",
    icon: "💬",
    description: "Is this message safe or a scam?",
    clues: [
      {
        emoji: "🎁",
        title: "\"Your Minecraft account WON free Minecoins!\"",
        detail: "From a stranger via Discord DM — click to claim!",
        suspicious: true,
        explanation: "🚨 Strangers don't give away free Minecoins! This is a scam to steal your Minecraft login.",
      },
      {
        emoji: "📚",
        title: "\"Don't forget your science project is due Friday\"",
        detail: "From your teacher's official school email",
        suspicious: false,
        explanation: "✅ A reminder from your real teacher's school email — totally normal and safe!",
      },
      {
        emoji: "🔑",
        title: "\"Send me your Roblox password so I can gift you items\"",
        detail: "From someone in your game friend list",
        suspicious: true,
        explanation: "🚨 NEVER share your password — not even to friends! No real person needs it to gift you anything.",
      },
    ],
  },
  {
    roundTitle: "Download Inspection",
    icon: "📥",
    description: "Safe to download or dangerous?",
    clues: [
      {
        emoji: "🎮",
        title: "\"FREE_FORTNITE_VBUCKS_HACK.exe\"",
        detail: "Random site promises unlimited V-Bucks for free",
        suspicious: true,
        explanation: "🚨 .exe files from random sites = virus. Fortnite V-Bucks are never free from unofficial sites!",
      },
      {
        emoji: "📄",
        title: "History essay template PDF",
        detail: "Shared by your teacher on the school portal",
        suspicious: false,
        explanation: "✅ A PDF from your school's official portal — safe to download and use!",
      },
      {
        emoji: "💾",
        title: "USB drive someone left at school",
        detail: "Found on a desk — curious what games are on it?",
        suspicious: true,
        explanation: "🚨 Hackers leave infected USB drives on purpose! Never plug in a found USB drive — tell an adult instead.",
      },
    ],
  },
  {
    roundTitle: "Hidden Clue Hunt",
    icon: "🔍",
    description: "Spot the sneaky hacker clue!",
    clues: [
      {
        emoji: "🌍",
        title: "Your Roblox account logged in from Brazil at 2 AM",
        detail: "You were asleep at home in your own country",
        suspicious: true,
        explanation: "🚨 A login from another country while you're asleep = someone hacked your account! Change your password immediately!",
      },
      {
        emoji: "📧",
        title: "Email from noreply@youtube.com",
        detail: "Says your channel comment got a reply — links to youtube.com",
        suspicious: false,
        explanation: "✅ Official YouTube domain, links to the real site — this is a normal notification email!",
      },
      {
        emoji: "💳",
        title: "Pop-up: \"Enter your details to unlock premium Roblox\"",
        detail: "Appears on a random website while you're browsing",
        suspicious: true,
        explanation: "🚨 Random pop-ups asking for your details are always scams. Real Roblox Premium is only bought on roblox.com!",
      },
    ],
  },
];

/* ── GUARDIAN (ages 11+) — technical, subtle, multi-step reasoning ── */
const ROUNDS_GUARDIAN: Round[] = [
  {
    roundTitle: "URL Forensics",
    icon: "🌐",
    description: "Analyze the URL — safe or an attack?",
    clues: [
      {
        emoji: "🔒",
        title: "https://secure.mybank.com/login",
        detail: "Subdomain of the real bank's domain — lock present",
        suspicious: false,
        explanation: "✅ A legitimate subdomain (secure.mybank.com) is still the real bank's domain. Subdomains are standard practice for login portals.",
      },
      {
        emoji: "⚠️",
        title: "https://mybank-secure.com/login",
        detail: "Hyphenated domain — NOT a subdomain of mybank.com",
        suspicious: true,
        explanation: "🚨 'mybank-secure.com' is a completely different domain from 'mybank.com'. Hackers register hyphenated look-alikes — this is typosquatting!",
      },
      {
        emoji: "❌",
        title: "https://paypa1.com",
        detail: "The letter 'l' is replaced with the number '1'",
        suspicious: true,
        explanation: "🚨 Classic typosquatting — 'paypa1.com' vs 'paypal.com'. The number 1 looks like a lowercase L. Never trust an almost-right URL.",
      },
    ],
  },
  {
    roundTitle: "Email Header Analysis",
    icon: "📧",
    description: "Read the full context — phishing or real?",
    clues: [
      {
        emoji: "✅",
        title: "From: support@amazon.com",
        detail: "Order confirmation matching your recent purchase history",
        suspicious: false,
        explanation: "✅ Official @amazon.com domain + info matching your real account = legitimate. Phishers can't match your private order details.",
      },
      {
        emoji: "🎣",
        title: "From: support@amazon-refunds.net",
        detail: "\"Urgent: your refund requires immediate action\" — link provided",
        suspicious: true,
        explanation: "🚨 'amazon-refunds.net' is NOT Amazon's domain. Urgency + third-party domain + action link = classic phishing attack. Never click.",
      },
      {
        emoji: "🔒",
        title: "From: noreply@github.com",
        detail: "Security alert about a pull request you submitted 10 mins ago",
        suspicious: false,
        explanation: "✅ Official @github.com domain + matches an action YOU just took = real notification. Timing and context match your own activity.",
      },
    ],
  },
  {
    roundTitle: "File Threat Assessment",
    icon: "📁",
    description: "Is this file safe to open?",
    clues: [
      {
        emoji: "📄",
        title: "quarterly_report.pdf",
        detail: "Sent by your colleague — you've exchanged files with them before",
        suspicious: false,
        explanation: "✅ Known sender, established file-sharing history, standard .pdf extension — safe. Context matters in threat assessment.",
      },
      {
        emoji: "💣",
        title: "invoice.pdf.exe",
        detail: "Double extension — shows as PDF icon in some file browsers",
        suspicious: true,
        explanation: "🚨 Double extension trick! Windows often hides the .exe part so it looks like a PDF icon. Executing this runs malicious code. Always show file extensions!",
      },
      {
        emoji: "🤔",
        title: "project_update.zip",
        detail: "From a colleague — but you've NEVER received files from them before",
        suspicious: true,
        explanation: "⚠️ Unexpected files from unusual senders are a major red flag. Even from 'known' senders — their account may be compromised. Verify via another channel before opening.",
      },
    ],
  },
  {
    roundTitle: "Advanced Login Analysis",
    icon: "🔍",
    description: "Apply threat intelligence — normal or attack?",
    clues: [
      {
        emoji: "🛡️",
        title: "Login from VPN IP — same city as always",
        detail: "You always route through this VPN provider",
        suspicious: false,
        explanation: "✅ If YOU set up and use a consistent VPN, logins from that VPN's IP are expected. Pattern consistency = normal.",
      },
      {
        emoji: "🧅",
        title: "Login from Tor exit node — correct password used",
        detail: "Tor Browser detected — login succeeded on first try",
        suspicious: true,
        explanation: "🚨 Tor exit nodes are used to anonymize location. A correct-password login through Tor likely means your credentials were stolen and someone is hiding their location.",
      },
      {
        emoji: "📱",
        title: "New device login — followed by 2FA approval",
        detail: "You received and approved the authentication code",
        suspicious: false,
        explanation: "✅ 2FA (two-factor authentication) is the safety net for new devices. Since YOU approved it, this is legitimate. 2FA working as designed!",
      },
    ],
  },
];

function getTier(age?: number): "junior" | "defender" | "guardian" {
  if (!age || age < 8) return "junior";
  if (age < 11) return "defender";
  return "guardian";
}

export default function TraceTheHackerGame({ onComplete, childAge }: Props) {
  const tier = getTier(childAge);
  const ROUNDS = tier === "junior" ? ROUNDS_JUNIOR : tier === "guardian" ? ROUNDS_GUARDIAN : ROUNDS_DEFENDER;

  const [roundIdx, setRoundIdx] = useState(0);
  const [clueIdx, setClueIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const round = ROUNDS[roundIdx];
  const clue = round.clues[clueIdx];
  const totalClues = ROUNDS.reduce((acc, r) => acc + r.clues.length, 0);
  const completedClues = ROUNDS.slice(0, roundIdx).reduce((acc, r) => acc + r.clues.length, 0) + clueIdx;

  function handleAnswer(guessSuspicious: boolean) {
    if (result !== null) return;
    const correct = guessSuspicious === clue.suspicious;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      setResult(null);
      const nextClueIdx = clueIdx + 1;
      if (nextClueIdx < round.clues.length) {
        setClueIdx(nextClueIdx);
      } else {
        const nextRoundIdx = roundIdx + 1;
        if (nextRoundIdx < ROUNDS.length) {
          setRoundIdx(nextRoundIdx);
          setClueIdx(0);
        } else {
          setDone(true);
        }
      }
    }, 1800);
  }

  if (done) {
    const pct = Math.round((score / totalClues) * 100);
    return (
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="flex flex-col items-center gap-5 py-6 text-center"
      >
        <div className="text-6xl">{pct >= 70 ? "🕵️" : "🔍"}</div>
        <div>
          <h3 className="text-xl font-black text-white mb-1">
            {pct >= 70 ? "Case Closed! 🎉" : "Keep Investigating!"}
          </h3>
          <p className="text-white/60 text-sm">
            {score}/{totalClues} clues cracked — {pct}% detective accuracy
          </p>
        </div>
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs font-bold text-cyan-400 mb-1">🏅 Cyber Detective Skill</p>
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <p className="text-[10px] text-white/40 mt-1 text-right">{pct}%</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          className="w-full rounded-2xl py-3.5 font-black text-white text-sm"
          style={{ background: "linear-gradient(135deg, #08b6aa, #08b6aa88)" }}
        >
          Continue →
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-cyan-400"
            animate={{ width: `${(completedClues / totalClues) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold text-white/40">{completedClues}/{totalClues}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xl">{round.icon}</span>
        <div>
          <p className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">
            Round {roundIdx + 1} — {round.roundTitle}
          </p>
          <p className="text-white/50 text-xs">{round.description}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${roundIdx}-${clueIdx}`}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`rounded-2xl border-2 p-4 transition-all ${
            result === "correct"
              ? "border-green-400 bg-green-400/10"
              : result === "wrong"
              ? "border-red-400 bg-red-400/10"
              : "border-white/15 bg-white/5"
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{clue.emoji}</span>
            <div>
              <p className="font-black text-white text-sm leading-snug">{clue.title}</p>
              <p className="text-white/50 text-xs mt-0.5">{clue.detail}</p>
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-xs font-semibold rounded-xl px-3 py-2 mb-2 ${
                  result === "correct"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/15 text-red-300"
                }`}
              >
                {result === "correct" ? "🎯 Correct! " : "💡 "}
                {clue.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {result === null && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAnswer(false)}
                className="rounded-xl py-2.5 font-black text-sm text-white border-2 border-green-400/40 bg-green-500/15 hover:bg-green-500/25 transition-colors"
              >
                ✅ SAFE
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAnswer(true)}
                className="rounded-xl py-2.5 font-black text-sm text-white border-2 border-red-400/40 bg-red-500/15 hover:bg-red-500/25 transition-colors"
              >
                🚨 SUSPICIOUS
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-1">
        {Array.from({ length: totalClues }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i < completedClues ? "bg-cyan-400 w-4" : "bg-white/15 w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
