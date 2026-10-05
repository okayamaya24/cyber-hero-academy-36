import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const TEACHER_SIGNUP = "/signup?type=school";

const worlds = [
  { world: "North America", villain: "The Keybreaker", topic: "Passwords & account security", color: "#ff4444" },
  { world: "Europe", villain: "The Phisher King", topic: "Phishing, fake messages & suspicious links", color: "#4488cc" },
  { world: "Africa", villain: "The Troll Lord", topic: "Cyberbullying & digital citizenship", color: "#66aa33" },
  { world: "Asia", villain: "The Firewall Phantom", topic: "Device security & digital footprint", color: "#6644cc" },
  { world: "South America", villain: "The Data Thief", topic: "Personal data & privacy settings", color: "#cc44aa" },
  { world: "Australia", villain: "Malware Max", topic: "Malware, viruses & safe downloads", color: "#ff8800" },
  { world: "Antarctica", villain: "Shadowbyte", topic: "Identity theft & final review", color: "#8888cc" },
];

const lessons = [
  "Password Safety",
  "Cyber Clues",
  "Device Defender",
  "Scam Detection",
  "Safe Websites",
  "Phishy Messages",
  "Personal Info",
  "Smart Sharing",
  "Internet Detective",
  "Malware Monsters",
  "Stranger Safety",
  "Safe Downloads",
];

const classroomFeatures = [
  { icon: "📋", title: "Add your whole class at once", desc: "Upload a simple CSV of student names, or add students one by one." },
  { icon: "🙅", title: "No student emails needed", desc: "Students log in with a username, so you never have to collect their email addresses." },
  { icon: "📊", title: "See class progress", desc: "Check which missions each student has finished and who might need extra help." },
  { icon: "💬", title: "Discussion prompts", desc: "Ready-made questions to kick off classroom conversations about online safety." },
  { icon: "🏆", title: "Badges & leaderboard", desc: "Students earn XP and badges, with a class leaderboard for friendly competition." },
  { icon: "💻", title: "Runs in the browser", desc: "Nothing to install. Works on Chromebooks, laptops, and tablets." },
];

const standards = [
  {
    framework: "CSTA K–12 Computer Science Standards",
    items: [
      { code: "1B-NI-05", grades: "Grades 3–5", text: "Discuss real-world cybersecurity problems and how personal information can be protected." },
      { code: "2-NI-05", grades: "Grades 6–8", text: "Explain how physical and digital security measures protect electronic information." },
      { code: "2-NI-06", grades: "Grades 6–8", text: "Apply multiple methods of encryption to model the secure transmission of information." },
    ],
  },
  {
    framework: "ISTE Standards for Students — Digital Citizen (1.2)",
    items: [
      { code: "1.2.a", grades: "All grades", text: "Cultivate and manage their digital identity and reputation." },
      { code: "1.2.b", grades: "All grades", text: "Engage in positive, safe, legal and ethical behavior online." },
      { code: "1.2.d", grades: "All grades", text: "Manage personal data to maintain digital privacy and security." },
    ],
  },
];

const lessonPlan = [
  { time: "5 min", title: "Warm-up", desc: "Ask the class: \"Have you ever gotten a message that seemed too good to be true? What did it say?\" Collect a few answers on the board." },
  { time: "10 min", title: "Watch & learn", desc: "Play the \"Phishy Messages\" video lesson from the Learn tab on the board. Pause at each check-in question and let the class vote." },
  { time: "20 min", title: "Mission time", desc: "Students play Spot the Phish in the Training Center, deciding whether each email and text is safe or a phishing trick." },
  { time: "10 min", title: "Wrap-up", desc: "Exit ticket: students write down two warning signs of a phishing message and one thing they'd do if they got one." },
];

const faqs = [
  { q: "What ages and grades is it for?", a: "Cyber Hero Academy is built for ages 8–12, roughly grades 3–6. Content adjusts to each student's level." },
  { q: "How long does a lesson take?", a: "Video lessons are short, and missions are broken into bite-sized games, so it fits a single class period or a center rotation." },
  { q: "Do students need their own email?", a: "No. You create student accounts from your Teacher Portal and each student gets a username to log in with." },
  { q: "Is it safe for kids?", a: "Yes. All content is age-appropriate, there are no ads, and students can't message each other or strangers." },
  { q: "What does it cost?", a: "It's free for classrooms during our pilot. Pilot teachers help shape what we build next." },
];

export default function ForSchoolsPage() {
  return (
    <div className="min-h-screen bg-[#080c18] text-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f4a] via-[#080c18] to-[#081a12]" />
          <div className="absolute -top-20 left-1/3 h-[500px] w-[600px] rounded-full bg-[#00d4ff]/[0.07] blur-3xl" />
        </div>

        <motion.div
          className="container relative mx-auto max-w-4xl px-4 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-5 flex flex-wrap justify-center gap-2 text-sm font-bold">
            <span className="rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-4 py-2 text-[#00d4ff]">🏫 For Schools</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-gray-300">Grades 3–6 · Ages 8–12</span>
            <span className="rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 px-4 py-2 text-[#00ff88]">Free during our pilot</span>
          </div>

          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Cybersecurity lessons your students will{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, #00d4ff, #00ff88)" }}>
              ask to play
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-400">
            Cyber Hero Academy turns online safety into a game. Students defeat villains by learning to spot scams,
            build strong passwords, and protect their privacy. You get ready-to-teach lessons and a portal to track
            every student's progress.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="xl"
                className="rounded-full font-black text-[#080c18] shadow-[0_0_24px_rgba(0,212,255,0.35)]"
                style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                asChild
              >
                <Link to={TEACHER_SIGNUP}>Create a Free Teacher Account</Link>
              </Button>
            </motion.div>
            <a
              href="#lesson-plan"
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              See a sample lesson plan ↓
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── WHY IT MATTERS ── */}
      <section className="border-y border-white/[0.04] bg-[#0a0e1a] py-16">
        <div className="container mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-3">
          {[
            { icon: "📱", title: "Kids are online earlier", desc: "Grades 3–6 is when many students get their first phone, gaming account, or group chat." },
            { icon: "🎣", title: "The tricks target them too", desc: "Scam messages, fake prizes, and password theft don't check how old you are." },
            { icon: "🧠", title: "Habits stick when they start early", desc: "Students who practice safe choices in a game are ready when it happens for real." },
          ].map((item) => (
            <div key={item.title} className="text-center md:text-left">
              <div className="mb-3 text-4xl">{item.icon}</div>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Curriculum overview"
            title="7 worlds. 7 villains. One skill each."
            subtitle="Each world is a unit built around one cybersecurity topic, ending in a boss battle that reviews everything students learned."
          />

          <motion.div
            className="overflow-hidden rounded-2xl border border-white/[0.08]"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="hidden grid-cols-[1fr_1.2fr_2fr] gap-4 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 sm:grid">
              <span>World</span>
              <span>Villain</span>
              <span>What students learn</span>
            </div>
            {worlds.map((w) => (
              <motion.div
                key={w.world}
                variants={fadeUp}
                className="grid gap-1 border-t border-white/[0.06] px-5 py-4 first:border-t-0 sm:grid-cols-[1fr_1.2fr_2fr] sm:gap-4 sm:first:border-t"
              >
                <span className="font-bold">🌍 {w.world}</span>
                <span className="font-semibold" style={{ color: w.color }}>{w.villain}</span>
                <span className="text-gray-400">{w.topic}</span>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 rounded-2xl border border-[#ffd700]/20 bg-[#ffd700]/[0.05] p-6">
            <h3 className="mb-1 text-lg font-bold">🎬 Plus 12 short video lessons</h3>
            <p className="mb-4 text-sm text-gray-400">
              Each lesson has check-in questions and games built in. They're perfect for whole-class instruction on the board.
            </p>
            <div className="flex flex-wrap gap-2">
              {lessons.map((l) => (
                <span key={l} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-300">
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLASSROOM TOOLS ── */}
      <section className="border-y border-white/[0.04] bg-[#0a0e1a] py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Teacher Portal"
            title="Built for real classrooms"
            subtitle="Everything you need to run it with 25 students, not just one."
          />
          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {classroomFeatures.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="rounded-2xl border border-white/[0.06] bg-[#0d1323] p-6"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-2 font-bold">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STANDARDS ── */}
      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <SectionHeading
            eyebrow="Standards alignment"
            title="Supports the standards you already teach"
            subtitle="Missions and lessons map to national computer science and digital citizenship standards."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {standards.map((s) => (
              <div key={s.framework} className="rounded-2xl border border-white/[0.08] bg-[#0d1323] p-6">
                <h3 className="mb-4 font-bold text-[#00d4ff]">{s.framework}</h3>
                <ul className="space-y-4">
                  {s.items.map((item) => (
                    <li key={item.code} className="flex gap-3">
                      <span className="h-fit shrink-0 rounded-md bg-white/10 px-2 py-1 font-mono text-xs font-bold">{item.code}</span>
                      <div>
                        <p className="text-sm text-gray-300">{item.text}</p>
                        <p className="mt-1 text-xs text-gray-500">{item.grades}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SAMPLE LESSON PLAN ── */}
      <section id="lesson-plan" className="scroll-mt-20 border-y border-white/[0.04] bg-[#0a0e1a] py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <SectionHeading
            eyebrow="Sample lesson plan"
            title="Spot the Phish 🎣"
            subtitle="A ready-to-teach 45-minute lesson. No prep beyond logging in."
          />

          <div className="overflow-hidden rounded-2xl border border-[#4488cc]/30 bg-[#0d1323]">
            <div className="grid gap-4 border-b border-white/[0.06] p-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Grades</p>
                <p className="font-semibold">3–6</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Time</p>
                <p className="font-semibold">45 minutes</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Standards</p>
                <p className="font-semibold">CSTA 1B-NI-05 · ISTE 1.2.b</p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Objective</p>
                <p className="text-gray-300">
                  Students will be able to name warning signs of a phishing message and explain what to do when they get one.
                </p>
              </div>
              <div className="sm:col-span-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">You'll need</p>
                <p className="text-gray-300">A projector or smartboard, and one device per student (or per pair).</p>
              </div>
            </div>

            <ol className="divide-y divide-white/[0.06]">
              {lessonPlan.map((step, i) => (
                <li key={step.title} className="flex gap-4 p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#4488cc]/20 font-black text-[#7fb2e5]">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold">
                      {step.title} <span className="ml-1 text-sm font-semibold text-gray-500">· {step.time}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-400">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── PILOT ── */}
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div
            className="relative overflow-hidden rounded-3xl p-8 md:p-12"
            style={{ background: "linear-gradient(135deg, #0d1f4a 0%, #081a12 60%, #1a0d2a 100%)" }}
          >
            <div className="relative z-10 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
              <div>
                <div className="mb-3 inline-block rounded-full border border-[#00ff88]/30 bg-[#00ff88]/10 px-4 py-1 text-sm font-bold text-[#00ff88]">
                  Pilot program
                </div>
                <h2 className="text-3xl font-black md:text-4xl">Free for classrooms during our pilot</h2>
                <p className="mt-3 text-gray-400">
                  Get full access for your whole class while we grow. In return, we'd love to hear what works for you and your
                  students.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-300">
                  <li>✅ All 7 worlds, missions, and boss battles</li>
                  <li>✅ All 12 video lessons</li>
                  <li>✅ Teacher Portal with class progress</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
                <p className="mb-4 font-bold">Get started in 3 steps</p>
                <ol className="space-y-3 text-sm text-gray-300">
                  <li><span className="font-black text-[#00d4ff]">1.</span> Create a free teacher account</li>
                  <li><span className="font-black text-[#00d4ff]">2.</span> Add your students (or upload a CSV)</li>
                  <li><span className="font-black text-[#00d4ff]">3.</span> Students log in and start playing</li>
                </ol>
                <Button
                  size="lg"
                  className="mt-6 w-full rounded-full font-black text-[#080c18]"
                  style={{ background: "linear-gradient(90deg, #00d4ff, #00ff88)" }}
                  asChild
                >
                  <Link to={TEACHER_SIGNUP}>Create a Free Teacher Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-white/[0.04] bg-[#0a0e1a] py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <SectionHeading eyebrow="Questions" title="Teacher FAQ" />
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-white/[0.08] bg-[#0d1323] p-5 open:border-[#00d4ff]/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                  {f.q}
                  <span className="text-[#00d4ff] transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm text-gray-400">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#080c18] py-8 text-center text-sm text-gray-600">
        <p>© 2026 Cyber Hero Academy · Making the internet safer for kids! 🛡️</p>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      className="mb-10 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <p className="mb-2 text-sm font-bold uppercase tracking-wider text-[#00d4ff]">{eyebrow}</p>
      <h2 className="text-3xl font-black md:text-4xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-gray-500">{subtitle}</p>}
    </motion.div>
  );
}
