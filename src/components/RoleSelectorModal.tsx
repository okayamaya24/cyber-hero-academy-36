import { motion, AnimatePresence } from "framer-motion";
import { Rocket, ShieldCheck, Sparkles, Shield } from "lucide-react";

interface RoleSelectorModalProps {
  open: boolean;
  onSelectChild: () => void;
  onSelectParent: () => void;
}

export default function RoleSelectorModal({ open, onSelectChild, onSelectParent }: RoleSelectorModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full gradient-hero shadow-glow"
              >
                <Shield className="h-8 w-8 text-primary-foreground" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground">
                Who is using Cyber Hero Academy right now?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose your mode to continue
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Child Mode */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSelectChild}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-gradient-to-br from-accent/20 to-secondary/20 p-6 shadow-sm transition-colors hover:border-accent hover:shadow-playful"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                  <Rocket className="h-8 w-8 text-accent" />
                </div>
                <span className="text-lg font-bold text-foreground">Child Mode</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" /> Start playing!
                </span>
              </motion.button>

              {/* Parent Mode */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={onSelectParent}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-gradient-to-br from-primary/10 to-muted/30 p-6 shadow-sm transition-colors hover:border-primary hover:shadow-card"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <span className="text-lg font-bold text-foreground">Parent Mode</span>
                <span className="text-xs text-muted-foreground">
                  Progress & settings
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
