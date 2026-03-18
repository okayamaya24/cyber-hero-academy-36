import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ALL_BADGES } from "@/data/missions";
import HeroAvatar from "@/components/avatar/HeroAvatar";

export default function CertificatePage() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/select-child");
  }, [user, activeChildId, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: earnedBadges = [] } = useQuery({
    queryKey: ["earned_badges", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("earned_badges").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const allEarned = earnedBadges.length >= ALL_BADGES.length;
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const handlePrint = () => {
    window.print();
  };

  if (!child) {
    return <div className="flex min-h-screen items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  }

  if (!allEarned) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Award className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Certificate Not Yet Unlocked</h2>
          <p className="text-muted-foreground mb-4">
            Earn all {ALL_BADGES.length} badges to unlock your Certified Cyber Hero certificate!
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            You've earned {earnedBadges.length} of {ALL_BADGES.length} badges so far. Keep going! 🚀
          </p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Action buttons - hidden in print */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <Button variant="hero" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print Certificate
          </Button>
        </div>

        {/* Certificate */}
        <motion.div
          ref={certRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mx-auto max-w-2xl"
        >
          <div className="relative overflow-hidden rounded-3xl border-4 border-accent bg-card p-10 shadow-playful print:shadow-none print:border-2">
            {/* Decorative corners */}
            <div className="absolute top-4 left-4 text-4xl opacity-40">🌟</div>
            <div className="absolute top-4 right-4 text-4xl opacity-40">🌟</div>
            <div className="absolute bottom-4 left-4 text-4xl opacity-40">🌟</div>
            <div className="absolute bottom-4 right-4 text-4xl opacity-40">🌟</div>

            <div className="text-center">
              {/* Trophy */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-4 text-7xl"
              >
                🏆
              </motion.div>

              {/* Title */}
              <h1 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Certificate of Achievement
              </h1>
              <h2 className="text-4xl font-bold text-primary mb-2" style={{ fontFamily: "Georgia, serif" }}>
                Certified Cyber Hero
              </h2>

              {/* Decorative line */}
              <div className="mx-auto mb-6 h-1 w-32 rounded-full bg-gradient-to-r from-primary via-accent to-secondary" />

              {/* Subtitle */}
              <p className="text-muted-foreground mb-2">This certificate is proudly awarded to</p>

              {/* Child name */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl font-bold mb-4"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {child.name}
              </motion.h3>

              {/* Description */}
              <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                For demonstrating exceptional knowledge and skill in cybersecurity
                by earning all <strong>{ALL_BADGES.length} badges</strong> in the
                Cyber Hero Academy.
              </p>

              {/* Badges display */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {ALL_BADGES.map((b) => (
                  <span key={b.id} className="text-2xl" title={b.name}>
                    {b.icon}
                  </span>
                ))}
              </div>

              {/* Date */}
              <div className="mx-auto h-px w-48 bg-border mb-3" />
              <p className="text-sm text-muted-foreground">{dateStr}</p>

              {/* Signature area */}
              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl mb-1">🦸</div>
                  <div className="h-px w-32 bg-border mb-1" />
                  <p className="text-xs text-muted-foreground">Captain Cyber</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">🛡️</div>
                  <div className="h-px w-32 bg-border mb-1" />
                  <p className="text-xs text-muted-foreground">Cyber Hero Academy</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Celebration message - hidden in print */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-8 max-w-md text-center print:hidden"
        >
          <h3 className="text-2xl font-bold mb-2">🎉 Congratulations! 🎉</h3>
          <p className="text-muted-foreground">
            You've completed all missions and earned every badge.
            You are a true Cyber Hero! Print your certificate and show it off!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
