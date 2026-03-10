import { Shield, BookOpen, Users, BarChart3, Lock, Heart, Gamepad2, Eye, Award, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const missions = [
  { icon: "🎣", title: "Phishing Protection", desc: "Kids learn to spot fake emails, messages, and scam websites before clicking." },
  { icon: "🔐", title: "Password Strength", desc: "Interactive games teach how to build strong, memorable passwords." },
  { icon: "🌐", title: "Safe Websites", desc: "Children practice sorting safe sites from dangerous ones in fun drag-and-drop activities." },
  { icon: "🛡️", title: "Privacy Awareness", desc: "Missions show kids what personal info to keep secret and why it matters." },
  { icon: "🦠", title: "Malware Awareness", desc: "Kids discover how viruses and malware work — and how to stay protected." },
];

const steps = [
  { num: "1", icon: Users, title: "Create Your Account", desc: "Sign up in seconds — no credit card needed." },
  { num: "2", icon: Heart, title: "Add Child Profiles", desc: "Create profiles for each child with age-appropriate content." },
  { num: "3", icon: Gamepad2, title: "Kids Play & Learn", desc: "Children complete cybersecurity missions through fun mini-games." },
  { num: "4", icon: BarChart3, title: "Track Progress", desc: "Monitor badges, points, streaks, and learning milestones from your dashboard." },
];

const dashboardFeatures = [
  { icon: BarChart3, title: "Progress Tracking", desc: "See which missions are complete, scores earned, and current level at a glance." },
  { icon: BookOpen, title: "Learning Modes", desc: "Choose Quick Play, Standard, Deep Practice, or Auto-Generate for each child's pace." },
  { icon: Award, title: "Badges & Points", desc: "Kids earn collectible badges and points that make learning feel like an adventure." },
  { icon: Eye, title: "Activity Monitoring", desc: "Review daily challenges, streaks, and time spent learning — all in one place." },
];

export default function ForParentsPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Section 1 — Introduction */}
      <section className="relative overflow-hidden py-16 sm:py-24" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Shield className="mx-auto mb-4 h-16 w-16 drop-shadow-lg" />
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1} className="font-display text-3xl sm:text-5xl font-bold leading-tight mb-4">
            Cyber Hero Academy
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2} className="text-lg sm:text-xl font-medium opacity-90 max-w-2xl mx-auto">
            Teaching Kids Cyber Safety Through Play
          </motion.p>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mt-4 max-w-xl mx-auto opacity-80">
            A colorful, game-based cybersecurity learning platform designed for children ages 5–12. Kids complete missions, earn badges, and build real-world digital safety skills — all while having fun.
          </motion.p>
        </div>
      </section>

      {/* Section 2 — What Kids Learn */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-center font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">What Kids Learn</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">Every mission teaches a core cybersecurity concept through interactive mini-games.</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {missions.map((m, i) => (
            <motion.div key={m.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full border-border/60 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <span className="text-4xl mb-3 block">{m.icon}</span>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">{m.title}</h3>
                  <p className="text-sm text-muted-foreground">{m.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 3 — How It Works */}
      <section className="bg-muted/40 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-center font-display text-2xl sm:text-3xl font-bold text-foreground mb-10">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground font-bold text-xl" style={{ background: "var(--gradient-hero)" }}>
                  {s.num}
                </div>
                <s.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Parent Dashboard Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-center font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Parent Dashboard</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-lg mx-auto">Everything you need to stay involved in your child's learning journey.</p>
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {dashboardFeatures.map((f, i) => (
            <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <Card className="h-full border-border/60">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 5 — Why Cybersecurity Matters */}
      <section className="py-16" style={{ background: "var(--gradient-mission)" }}>
        <div className="container mx-auto px-4 text-center text-primary-foreground max-w-3xl">
          <ShieldCheck className="mx-auto mb-4 h-12 w-12" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">Why Cybersecurity Matters</h2>
          <p className="opacity-90 leading-relaxed">
            Children are going online younger than ever — yet most aren't taught how to stay safe. Phishing scams, weak passwords, and data privacy risks affect kids just as much as adults. By teaching digital safety skills early, we help children build habits that protect them for life. Cyber Hero Academy turns these critical lessons into something kids actually want to do.
          </p>
        </div>
      </section>

      {/* Section 6 — Safety & Privacy */}
      <section className="container mx-auto px-4 py-16 text-center max-w-3xl">
        <Lock className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">Safety & Privacy</h2>
        <p className="text-muted-foreground leading-relaxed">
          Cyber Hero Academy is built with child safety at its core. All content is age-appropriate and reviewed for accuracy. Parents maintain full control — from creating child profiles to setting learning modes and reviewing progress. No ads, no third-party tracking, and no personal data shared. Your family's privacy is our priority.
        </p>
      </section>
    </div>
  );
}
