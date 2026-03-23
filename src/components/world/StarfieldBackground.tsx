import { motion } from "framer-motion";

interface StarfieldBackgroundProps {
  variant?: "default" | "snow";
}

export default function StarfieldBackground({ variant = "default" }: StarfieldBackgroundProps) {
  const count = variant === "snow" ? 80 : 60;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const size = variant === "snow" ? Math.random() * 3 + 1 : Math.random() * 2.5 + 0.5;
        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${variant === "snow" ? "bg-white/40" : "bg-white"}`}
            style={{
              width: size,
              height: size,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.05,
            }}
            animate={
              variant === "snow"
                ? { y: [0, 600], opacity: [0.3, 0] }
                : { opacity: [0.05, 0.4, 0.05] }
            }
            transition={
              variant === "snow"
                ? { repeat: Infinity, duration: Math.random() * 8 + 6, delay: Math.random() * 5, ease: "linear" }
                : { repeat: Infinity, duration: Math.random() * 4 + 2, delay: Math.random() * 3 }
            }
          />
        );
      })}
    </div>
  );
}
