import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import heroKidsGroup from "@/assets/hero-kids-group.png";
import heroCharacter from "@/assets/hero-character.png";
import robotGuide from "@/assets/robot-guide.png";
import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";

const guides = [
  { name: "Captain Cyber", role: "Your Hero Guide", image: heroCharacter },
  { name: "Robo Buddy", role: "Tech Expert", image: robotGuide },
  { name: "Detective Whiskers", role: "Scam Spotter", image: detectiveCat },
  { name: "Professor Hoot", role: "Safety Teacher", image: wiseOwl },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FLOATING = ["🌟", "⭐", "✨", "🛡️", "⚡", "🔐", "🎮", "💎"];

export default function HomePage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#080c18]">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-16 md:py-28">
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f4a] via-[#080c18] to-[#081a12]" />
          <div className="absolute -top-20 left-1/3 w-[600px] h-[500px] rounded-full bg-[#00d4ff]/7 blur-3xl" />
          <div className="absolute top-10 right-1/4 w-[400px] h-[400px] rounded-full bg-[#00ff88]/5 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.022]" style={{
            backgroundImage: "linear-gradient(rgba(0,212,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.4) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }} />
          {/* Floating emojis */}
          {FLOATING.map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute select-none pointer-events-none text-xl md:text-2xl"
              style={{ left: `${8 + i * 11}%`, top: `${10 + (i % 4) * 18}%` }}
              animate={{ y: [0, -14, 0], opacity: [0.25, 0.65, 0.25], rotate: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 3 + i * 0.4, delay: i * 0.3 }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="container relative mx-auto flex flex-col items-center gap-10 px-4 text-center md:flex-row md:gap-12 md:text-left">
          {/* Left: text */}
          <motion.div
            className="flex-1 space-y-7"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-4 py-2 text-sm font-bold text-[#00d4ff]">
              ⭐ For Kids Ages 5–12 · Free to Play!
            </div>

            <h1 className="text-5xl font-black leading-none text-white md:text-7xl">
              Become a{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #00d4ff, #00ff88, #ffd700)" }}
              >
                Cyber Hero!
              </span>
            </h1>

            <p className="max-w-lg text-lg text-gray-400">
              Stop villains, earn badges, and save the internet! Learn real cybersecurity skills through awesome games and missions. 🦸‍♀️⚡
            </p>

            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="xl"
                  className="rounded-full font-black text-[#080c18] shadow-[0_0_24px_rgba(0,212,255,0.35)] hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] transition-shadow"
                  style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                  asChild
                >
                  <Link to="/signup">🚀 Start Your Adventure</Link>
                </Button>
              </motion.div>
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Already a hero? Log In →
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:justify-start">
              {[
                { emoji: "🎮", text: "30+ Mini-Games" },
                { emoji: "🏅", text: "Earn Real Badges" },
                { emoji: "🆓", text: "100% Free" },
              ].map((s) => (
                <span key={s.text} className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{s.emoji}</span> {s.text}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right: hero image */}
          <motion.div
            className="flex flex-1 justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 scale-110 rounded-full bg-[#00d4ff]/10 blur-3xl" />
              <motion.img
                src={heroKidsGroup}
                alt="Diverse group of kids as Cyber Heroes"
                className="relative w-full max-w-md drop-shadow-[0_0_40px_rgba(0,212,255,0.25)] md:max-w-lg"
                animate={{ y: [0, -12, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT YOU'LL LEARN ── */}
      <section className="border-y border-white/[0.04] bg-[#0a0e1a] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-white md:text-4xl">What You'll Learn 🧠</h2>
            <p className="mt-3 text-gray-500">Super cool skills to keep you safe in the digital world!</p>
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {[
              { icon: "🎮", title: "Fun Missions", desc: "Complete exciting cybersecurity missions and level up your skills!", color: "#00d4ff" },
              { icon: "🛡️", title: "Stay Safe Online", desc: "Discover how to protect yourself from scams and online dangers.", color: "#00ff88" },
              { icon: "🏅", title: "Earn Badges", desc: "Collect awesome badges and rewards as you master each skill!", color: "#ffd700" },
              { icon: "👨‍👩‍👧", title: "Parent Dashboard", desc: "Parents can track progress and celebrate every win together.", color: "#a78bfa" },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${f.color}12, transparent)`,
                  border: `1px solid ${f.color}22`,
                }}
                whileHover={{ boxShadow: `0 0 28px ${f.color}22` }}
              >
                <div className="mb-4 text-4xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-white">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MEET YOUR GUIDES ── */}
      <section className="bg-[#080c18] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-white md:text-4xl">Meet Your Guides 👋</h2>
            <p className="mt-3 text-gray-500">Friendly characters who'll help you on every mission!</p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {guides.map((g, i) => (
              <motion.div
                key={g.name}
                variants={fadeUp}
                className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#0d1323] p-6 text-center transition-all hover:-translate-y-2"
                whileHover={{ borderColor: "rgba(0,212,255,0.28)", boxShadow: "0 0 24px rgba(0,212,255,0.12)" }}
              >
                <motion.img
                  src={g.image}
                  alt={g.name}
                  className="mb-4 h-32 w-32 object-contain drop-shadow-lg"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5 + i * 0.35, ease: "easeInOut" }}
                />
                <h3 className="text-lg font-bold text-white">{g.name}</h3>
                <p className="text-sm text-gray-500">{g.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-[#0a0e1a] py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{ background: "linear-gradient(135deg, #0d1f4a 0%, #081a12 60%, #1a0d2a 100%)" }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-[#00d4ff]/8 blur-3xl" />
              <div className="absolute right-1/4 bottom-0 h-64 w-64 rounded-full bg-[#00ff88]/8 blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="mb-4 text-5xl">🚀</div>
              <h2 className="mb-4 text-3xl font-black text-white md:text-4xl">Ready to Start Your Mission?</h2>
              <p className="mb-8 text-lg text-gray-400">Join kids around the world learning to stay safe online!</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="xl"
                  className="rounded-full font-black text-[#080c18] shadow-[0_0_24px_rgba(0,212,255,0.35)] hover:shadow-[0_0_44px_rgba(0,212,255,0.55)] transition-shadow"
                  style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                  asChild
                >
                  <Link to="/signup">Begin Your Journey 🚀</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#080c18] py-8 text-center text-sm text-gray-600">
        <p>© 2026 Cyber Hero Academy · Making the internet safer for kids! 🛡️</p>
      </footer>
    </div>
  );
}
