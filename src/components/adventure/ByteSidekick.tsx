import { motion, AnimatePresence } from "framer-motion";
import byteSrc from "@/assets/byte-sidekick.png";

interface ByteSidekickProps {
  message?: string;
  visible?: boolean;
  onDismiss?: () => void;
  size?: number;
}

export default function ByteSidekick({
  message,
  visible = true,
  onDismiss,
  size = 100,
}: ByteSidekickProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {message && (
            <motion.div
              className="max-w-xs rounded-2xl border-2 border-primary/30 bg-card px-4 py-3 shadow-playful"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.2 }}
              onClick={onDismiss}
            >
              <p className="text-sm font-semibold leading-snug">{message}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Tap to continue</p>
            </motion.div>
          )}

          <motion.img
            src={byteSrc}
            alt="Byte the sidekick"
            style={{ width: size, height: size }}
            className="cursor-pointer drop-shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            draggable={false}
            onClick={onDismiss}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
