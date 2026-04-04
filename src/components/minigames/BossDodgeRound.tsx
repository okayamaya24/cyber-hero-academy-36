import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Projectile {
  id: number;
  label: string;
  isGood: boolean;
  x: number;
  y: number;
  speed: number;
}

interface Props {
  threats: { text: string; isGood: boolean }[];
  onRoundEnd: (damageDealt: number, damageTaken: number) => void;
}

export default function BossDodgeRound({ threats, onRoundEnd }: Props) {
  const [shieldX, setShieldX] = useState(45);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [spawned, setSpawned] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [flashes, setFlashes] = useState<{ id: number; x: number; color: string }[]>([]);
  const frameRef = useRef<number>(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval>>();
  const gameActiveRef = useRef(true);
  const shieldXRef = useRef(shieldX);
  shieldXRef.current = shieldX;

  const SHIELD_WIDTH = 15;
  const PROJECTILE_SIZE = 3;

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setShieldX((x) => Math.max(0, x - 6));
      if (e.key === "ArrowRight") setShieldX((x) => Math.min(100 - SHIELD_WIDTH, x + 6));
      if (e.key === "a" || e.key === "A") setShieldX((x) => Math.max(0, x - 6));
      if (e.key === "d" || e.key === "D") setShieldX((x) => Math.min(100 - SHIELD_WIDTH, x + 6));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Touch/mouse controls
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setShieldX(Math.max(0, Math.min(100 - SHIELD_WIDTH, pct - SHIELD_WIDTH / 2)));
  }, []);

  // Spawn projectiles
  useEffect(() => {
    let idx = 0;
    spawnTimerRef.current = setInterval(() => {
      if (idx >= threats.length) {
        clearInterval(spawnTimerRef.current);
        return;
      }
      const t = threats[idx];
      setProjectiles((prev) => [
        ...prev,
        {
          id: idx,
          label: t.text,
          isGood: t.isGood,
          x: 10 + Math.random() * 75,
          y: 0,
          speed: 0.6 + Math.random() * 0.3,
        },
      ]);
      setSpawned((s) => s + 1);
      idx++;
    }, 1500);

    return () => clearInterval(spawnTimerRef.current);
  }, [threats]);

  // Game loop
  useEffect(() => {
    const loop = () => {
      if (!gameActiveRef.current) return;
      setProjectiles((prev) => {
        const newProjs: Projectile[] = [];
        for (const p of prev) {
          const newY = p.y + p.speed;

          // Check if hit shield (y >= 85)
          if (newY >= 82 && newY <= 92) {
            const sx = shieldXRef.current;
            if (p.x >= sx - PROJECTILE_SIZE && p.x <= sx + SHIELD_WIDTH + PROJECTILE_SIZE) {
              // Hit shield
              if (!p.isGood) {
                // Blocked bad = good
                setDamageDealt((d) => d + 10);
                setFlashes((f) => [...f, { id: p.id, x: p.x, color: "hsl(160 65% 50%)" }]);
              } else {
                // Blocked good = bad
                setDamageTaken((d) => d + 10);
                setFlashes((f) => [...f, { id: p.id, x: p.x, color: "hsl(0 65% 50%)" }]);
              }
              continue; // Remove projectile
            }
          }

          // Off screen
          if (newY > 100) {
            if (!p.isGood) {
              // Missed bad = damage
              setDamageTaken((d) => d + 8);
            }
            continue;
          }

          newProjs.push({ ...p, y: newY });
        }
        return newProjs;
      });
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // Clear flashes
  useEffect(() => {
    if (flashes.length > 0) {
      const t = setTimeout(() => setFlashes([]), 500);
      return () => clearTimeout(t);
    }
  }, [flashes]);

  // End round when all projectiles processed
  useEffect(() => {
    if (spawned >= threats.length && projectiles.length === 0 && spawned > 0) {
      gameActiveRef.current = false;
      setTimeout(() => onRoundEnd(damageDealt, damageTaken), 800);
    }
  }, [spawned, projectiles.length, threats.length, damageDealt, damageTaken, onRoundEnd]);

  return (
    <div className="text-center mb-4">
      <p className="text-xs text-white/50 mb-2 font-mono">🛡️ BLOCK bad threats, DODGE good items! Use ← → arrows or drag</p>

      <div
        className="relative w-full rounded-xl border border-[hsl(0_80%_50%/0.2)] bg-[hsl(210_40%_8%)] overflow-hidden"
        style={{ aspectRatio: "16/10" }}
        onPointerMove={handlePointerMove}
      >
        {/* Projectiles */}
        {projectiles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute rounded-lg px-2 py-1 text-[8px] font-bold whitespace-nowrap ${
              p.isGood
                ? "bg-[hsl(160_65%_30%)] border border-[hsl(160_65%_50%/0.5)] text-[hsl(160_65%_80%)]"
                : "bg-[hsl(0_65%_30%)] border border-[hsl(0_65%_50%/0.5)] text-[hsl(0_65%_80%)]"
            }`}
            style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}
          >
            {p.label}
          </motion.div>
        ))}

        {/* Hit flashes */}
        {flashes.map((f) => (
          <motion.div
            key={f.id + "-flash"}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            className="absolute w-4 h-4 rounded-full"
            style={{ left: `${f.x}%`, top: "82%", background: f.color }}
          />
        ))}

        {/* Shield */}
        <motion.div
          className="absolute bottom-[8%] h-[6%] rounded-full bg-gradient-to-r from-[hsl(195_80%_40%)] via-[hsl(195_80%_55%)] to-[hsl(195_80%_40%)] shadow-[0_0_15px_hsl(195_80%_50%/0.5)]"
          style={{ left: `${shieldX}%`, width: `${SHIELD_WIDTH}%` }}
          animate={{ left: `${shieldX}%` }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold">🛡️</div>
        </motion.div>
      </div>

      <div className="flex justify-between mt-2 text-xs text-white/40 px-2">
        <span>Damage dealt: {damageDealt}</span>
        <span>Damage taken: {damageTaken}</span>
      </div>
    </div>
  );
}
