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
  const isClickable = !!onDismiss;

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
              className="max-w-xs rounded-2xl border border-cyan-400/30 bg-[hsl(220,30%,14%)] px-4 py-3 shadow-[0_0_20px_hsl(185_80%_48%/0.15)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ delay: 0.2 }}
              onClick={onDismiss}
              style={{ cursor: isClickable ? "pointer" : "default" }}
            >
              <p className="text-sm font-semibold leading-snug text-white">{message}</p>
              {isClickable && (
                <p className="mt-1 text-[10px] text-cyan-400/60">Tap to continue →</p>
              )}
            </motion.div>
          )}

          <motion.img
            src={byteSrc}
            alt="Byte the sidekick"
            className="drop-shadow-[0_0_12px_hsl(185_80%_48%/0.4)]"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            draggable={false}
            onClick={onDismiss}
            style={{ width: size, height: size, cursor: isClickable ? "pointer" : "default" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
