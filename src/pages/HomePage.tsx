import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, Star, Gamepad2, Users, Award, BookOpen } from "lucide-react";
import heroKidsGroup from "@/assets/hero-kids-group.png";
import heroCharacter from "@/assets/hero-character.png";
import robotGuide from "@/assets/robot-guide.png";
import detectiveCat from "@/assets/detective-cat.png";
import wiseOwl from "@/assets/wise-owl.png";

const features = [
  {
    icon: Gamepad2,
    title: "Fun Missions",
    description: "Learn cybersecurity through exciting game-based missions!",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Stay Safe Online",
    description: "Discover how to protect yourself from scams and dangers.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Award,
    title: "Earn Badges",
    description: "Collect cool badges and certificates as you learn!",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Parent Dashboard",
    description: "Parents and teachers can track learning progress.",
    color: "bg-cyber-purple/10 text-cyber-purple",
  },
];

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

export default function HomePage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="container relative mx-auto flex flex-col items-center gap-8 px-4 text-center md:flex-row md:text-left">
          <motion.div
            className="flex-1 space-y-6"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Star className="h-4 w-4" /> For Kids Ages 5–12
            </div>

            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Become a{" "}
              <span className="bg-gradient-to-r from-primary via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
                Cyber Hero!
              </span>
            </h1>

            <p className="max-w-lg text-lg text-muted-foreground">
              Learn to stay safe online through fun missions, games, and awesome cartoon guides. Start your
              cybersecurity adventure today!
            </p>

            <div className="flex flex-wrap justify-center gap-4 md:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">Start Adventure</Link>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="xl">
                    <BookOpen className="mr-2 h-5 w-5" />
                    For Parents
                  </Button>
                </DialogTrigger>

                <DialogContent className="w-[92vw] max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden p-0">
                  <div className="flex h-full min-h-0 flex-col">
                    <DialogHeader className="shrink-0 border-b px-6 py-5 text-left">
                      <DialogTitle className="text-2xl font-bold">For Parents</DialogTitle>
                      <DialogDescription className="text-base text-muted-foreground">
                        Cyber Hero Academy is an interactive cybersecurity learning platform designed for kids ages
                        5–12.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                      <div className="space-y-6">
                        <div>
                          <h3 className="mb-2 text-lg font-bold">What kids learn</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>🛡 How to spot phishing scams and suspicious messages</li>
                            <li>🔐 How to create strong passwords</li>
                            <li>🌐 How to identify safe websites</li>
                            <li>🔒 How to protect personal information online</li>
                            <li>💻 How to avoid unsafe downloads and malware</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="mb-2 text-lg font-bold">How it works</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>1. Parents create a secure account</li>
                            <li>2. Add one or more child profiles</li>
                            <li>3. Kids complete missions and mini-games</li>
                            <li>4. Parents track progress, points, and badges</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="mb-2 text-lg font-bold">Parent dashboard features</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>📊 Track child progress and completed missions</li>
                            <li>🎯 Adjust learning modes and challenge levels</li>
                            <li>🏅 View badges, rewards, and achievements</li>
                            <li>👨‍👩‍👧 Manage child profiles in one place</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="mb-2 text-lg font-bold">Safe and child-friendly</h3>
                          <p className="text-sm text-muted-foreground">
                            Cyber Hero Academy is designed to be parent-controlled, age-appropriate, and educational. It
                            helps children build strong digital safety habits through guided play.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 border-t px-6 py-4">
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                          <Link to="/parents">Learn More</Link>
                        </Button>

                        <Button variant="hero" asChild>
                          <Link to="/signup">Create Parent Account</Link>
                        </Button>

                        <Button variant="outline" asChild>
                          <Link to="/login">Parent Login</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-1 justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img
              src={heroKidsGroup}
              alt="Diverse group of kids as Cyber Heroes"
              className="w-full max-w-md drop-shadow-2xl md:max-w-lg"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold md:text-4xl">What You'll Learn</h2>
            <p className="mt-3 text-muted-foreground">Super cool skills to keep you safe in the digital world!</p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="group rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-playful"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Meet Your Guides */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold md:text-4xl">Meet Your Guides</h2>
            <p className="mt-3 text-muted-foreground">Friendly characters who'll help you on your journey!</p>
          </motion.div>

          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {guides.map((g) => (
              <motion.div
                key={g.name}
                variants={fadeUp}
                className="flex flex-col items-center rounded-2xl border bg-card p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-playful"
              >
                <img src={g.image} alt={g.name} className="mb-4 h-32 w-32 animate-bounce-gentle object-contain" />
                <h3 className="text-lg font-bold">{g.name}</h3>
                <p className="text-sm text-muted-foreground">{g.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="gradient-hero rounded-3xl p-12 text-center text-primary-foreground"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Ready to Start Your Mission?</h2>
            <p className="mb-8 text-lg opacity-90">Join thousands of kids learning to be safe online!</p>
            <Button
              size="xl"
              className="bg-card font-bold text-foreground shadow-lg transition-transform hover:scale-105 hover:bg-card/90"
              asChild
            >
              <Link to="/dashboard">Begin Your Journey 🚀</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 Cyber Hero Academy. Making the internet safer for kids!</p>
      </footer>
    </div>
  );
}
