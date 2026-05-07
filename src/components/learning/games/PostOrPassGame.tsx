/**
 * PostOrPassGame — Hoot Lesson 2: Smart Sharing Online
 * Show 6 social media post scenarios. Tap SAFE TO POST or DON'T POST.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props { onComplete: () => void; }

const POSTS = [
  {
    avatar: "🎨",
    username: "StarBlaster42",
    content: "Look at this drawing I made today! So proud of it 🎉",
    hasImage: false,
    safeToPost: true,
    clue: "Sharing your creative work is great! It tells people nothing about where you live or who you really are. ✅",
  },
  {
    avatar: "📸",
    username: "coolkid_2024",
    content: "First day at Riverside Elementary School! 🏫 So excited to be in Mr. Thompson's class in Room 14!",
    hasImage: false,
    safeToPost: false,
    clue: "🚨 This reveals your school name, teacher's name, and room number — a stranger could use this to find you in real life!",
  },
  {
    avatar: "⚡",
    username: "NinjaOwl99",
    content: "Just finished Harry Potter for the 3rd time! Team Gryffindor forever 🦁 What's everyone's favourite book?",
    hasImage: false,
    safeToPost: true,
    clue: "Talking about books and asking others is a great way to connect online — no personal info shared! ✅",
  },
  {
    avatar: "🏠",
    username: "sarah_jones_2013",
    content: "Home alone until 6pm while mum and dad are at work! So bored 😴 anyone want to come over? 123 Oak Street!",
    hasImage: false,
    safeToPost: false,
    clue: "🚨 Never post that you're home alone OR your address! This tells strangers you're unsupervised and exactly where you live.",
  },
  {
    avatar: "🏆",
    username: "GameHero_X",
    content: "Finally hit Level 50 in my favourite game! New personal best! Who else plays? 🎮",
    hasImage: false,
    safeToPost: true,
    clue: "Sharing gaming achievements is fun and safe — it doesn't reveal anything personal about the real you! ✅",
  },
  {
    avatar: "🎂",
    username: "maya_b",
    content: "It's my birthday today! I'm turning 10, born March 15, 2014! Party at 45 Maple Ave at 3pm today 🎉",
    hasImage: false,
    safeToPost: false,
    clue: "🚨 Your exact birthday, birth year, and home address in one post is a goldmine for identity theft — keep this private!",
  },
];

export default function PostOrPassGame({ onComplete }: Props) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [done, setDone] = useState(false);

  const post = POSTS[round];

  const handleAnswer = (guessSafe: boolean) => {
    if (result !== null) return;
    const correct = guessSafe === post.safeToPost;
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (round < POSTS.length - 1) {
        setRound((r) => r + 1);
        setResult(null);
      } else {
        setDone(true);
      }
    }, 2200);
  };

  if (done) {
    const stars = score === 6 ? 3 : score >= 4 ? 2 : 1;
    return (
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center py-4 space-y-4">
        <div className="text-5xl">🦉</div>
        <h2 className="text-xl font-black text-white">{score}/{POSTS.length} sorted correctly!</h2>
        <p className="text-sm font-bold text-teal-300">
          {score === 6 ? "Perfect! Professor Hoot gives you a gold star! 🌟" :
           score >= 4 ? "Good judgement! Think: could this help a stranger find me in real life?" :
           "Before posting: ask yourself — does this reveal where I am or who I really am?"}
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
          style={{ background: "linear-gradient(135deg,#14b8a6,#06b6d4)" }}>
          Continue →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="py-2 space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-teal-400"
            animate={{ width: `${(round / POSTS.length) * 100}%` }} transition={{ duration: 0.3 }} />
        </div>
        <span className="text-[10px] font-bold text-white/40">{round + 1}/{POSTS.length}</span>
      </div>

      <p className="text-xs font-extrabold text-teal-400 text-center tracking-wider">📲 POST OR PASS?</p>

      <AnimatePresence mode="wait">
        <motion.div key={round} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* Social post mockup */}
          <div className={`rounded-2xl border-2 overflow-hidden mb-3 transition-colors ${
            result === "correct" ? "border-green-400" :
            result === "wrong" ? "border-red-400" : "border-white/10"
          }`}>
            <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                {post.avatar}
              </div>
              <div>
                <p className="text-xs font-black text-white">{post.username}</p>
                <p className="text-[10px] text-gray-400">Just now · 🌍 Public</p>
              </div>
            </div>
            <div className="px-4 py-4" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-sm text-white/85 leading-relaxed">{post.content}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/5">
                <span className="text-[11px] text-white/30">👍 Like</span>
                <span className="text-[11px] text-white/30">💬 Comment</span>
                <span className="text-[11px] text-white/30">↗️ Share</span>
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
                {result === "correct" ? "✓ " : "✗ "}{post.clue}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <div className="grid grid-cols-2 gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(true)}
                className="rounded-2xl border-2 border-teal-400/40 bg-teal-500/15 py-4 font-black text-teal-300 text-sm hover:bg-teal-500/25 transition-colors">
                ✅ Safe to Post
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleAnswer(false)}
                className="rounded-2xl border-2 border-red-400/40 bg-red-500/15 py-4 font-black text-red-300 text-sm hover:bg-red-500/25 transition-colors">
                🚫 Don't Post!
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
