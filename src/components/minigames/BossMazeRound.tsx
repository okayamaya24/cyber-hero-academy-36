import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface MazeQuestion {
  q: string;
  choices: string[];
  answer: number;
}

interface Props {
  size?: number;
  questions?: MazeQuestion[];
  onRoundEnd: (damageDealt: number, damageTaken: number) => void;
}

type Cell = "wall" | "path" | "trap" | "question" | "key" | "exit";

function generateMaze(size: number): Cell[][] {
  // Simple maze generation
  const grid: Cell[][] = Array.from({ length: size }, () => Array(size).fill("wall"));

  // Carve paths using simple recursive backtracker (simplified)
  const visited = new Set<string>();

  const carve = (r: number, c: number) => {
    visited.add(`${r},${c}`);
    grid[r][c] = "path";
    const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited.has(`${nr},${nc}`)) {
        grid[r + dr / 2][c + dc / 2] = "path";
        carve(nr, nc);
      }
    }
  };

  // Start from top-left area
  carve(1, 1);

  // Ensure start and exit
  grid[1][1] = "path";
  grid[size - 2][size - 2] = "exit";

  // Add keys (3)
  let keysPlaced = 0;
  for (let r = 1; r < size - 1 && keysPlaced < 3; r++) {
    for (let c = 1; c < size - 1 && keysPlaced < 3; c++) {
      if (grid[r][c] === "path" && !(r === 1 && c === 1) && Math.random() < 0.08) {
        grid[r][c] = "key";
        keysPlaced++;
      }
    }
  }

  // Add a couple traps
  let trapsPlaced = 0;
  for (let r = 1; r < size - 1 && trapsPlaced < 2; r++) {
    for (let c = 1; c < size - 1 && trapsPlaced < 2; c++) {
      if (grid[r][c] === "path" && !(r === 1 && c === 1) && Math.random() < 0.06) {
        grid[r][c] = "trap";
        trapsPlaced++;
      }
    }
  }

  return grid;
}

export default function BossMazeRound({ size = 9, questions = [], onRoundEnd }: Props) {
  const [maze] = useState(() => generateMaze(size));
  const [playerPos, setPlayerPos] = useState({ r: 1, c: 1 });
  const [keysCollected, setKeysCollected] = useState(0);
  const [damageDealt, setDamageDealt] = useState(0);
  const [damageTaken, setDamageTaken] = useState(0);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("Navigate to the center! Collect 3 🔑");

  const cellSize = Math.min(36, Math.floor(350 / size));

  const move = useCallback((dr: number, dc: number) => {
    if (done) return;
    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;
    if (nr < 0 || nr >= size || nc < 0 || nc >= size) return;

    const cell = maze[nr][nc];
    if (cell === "wall") return;

    setPlayerPos({ r: nr, c: nc });

    if (cell === "key") {
      setKeysCollected((k) => k + 1);
      maze[nr][nc] = "path";
      setMessage("🔑 Key collected!");
      setDamageDealt((d) => d + 8);
    } else if (cell === "trap") {
      setDamageTaken((d) => d + 10);
      maze[nr][nc] = "path";
      setMessage("🔴 Trap! -10 HP");
    } else if (cell === "exit") {
      if (keysCollected >= 2) {
        setDone(true);
        setDamageDealt((d) => d + 20);
        setMessage("💥 FINAL STRIKE!");
      } else {
        setMessage(`Need ${3 - keysCollected} more 🔑!`);
        setPlayerPos({ r: playerPos.r, c: playerPos.c }); // Bounce back
      }
    }
  }, [playerPos, maze, done, keysCollected, size]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") move(-1, 0);
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") move(1, 0);
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") move(0, -1);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") move(0, 1);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [move]);

  useEffect(() => {
    if (done) {
      setTimeout(() => onRoundEnd(damageDealt, damageTaken), 1200);
    }
  }, [done]);

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <p className="text-xs text-white/50 font-mono">{message}</p>
      <p className="text-xs text-[hsl(45_90%_60%)]">🔑 {keysCollected}/3 Keys</p>

      {/* Maze grid */}
      <div
        className="border border-[hsl(195_80%_50%/0.2)] rounded-lg overflow-hidden bg-[hsl(210_40%_8%)]"
        style={{ display: "grid", gridTemplateColumns: `repeat(${size}, ${cellSize}px)` }}
      >
        {maze.map((row, r) =>
          row.map((cell, c) => {
            const isPlayer = r === playerPos.r && c === playerPos.c;
            let bg = "bg-[hsl(210_30%_6%)]"; // wall
            let content = "";

            if (cell === "path") bg = "bg-[hsl(210_40%_18%)]";
            else if (cell === "key") { bg = "bg-[hsl(45_80%_25%)]"; content = "🔑"; }
            else if (cell === "trap") { bg = "bg-[hsl(0_60%_20%)]"; content = "🔴"; }
            else if (cell === "exit") { bg = "bg-[hsl(160_60%_20%)]"; content = keysCollected >= 3 ? "💥" : "🚪"; }

            return (
              <div
                key={`${r}-${c}`}
                className={`flex items-center justify-center ${bg} border border-white/[0.03]`}
                style={{ width: cellSize, height: cellSize }}
                onClick={() => {
                  // Touch movement: move toward clicked cell
                  const dr = Math.sign(r - playerPos.r);
                  const dc = Math.sign(c - playerPos.c);
                  if (Math.abs(r - playerPos.r) + Math.abs(c - playerPos.c) === 1) {
                    move(dr, dc);
                  }
                }}
              >
                {isPlayer ? (
                  <motion.span
                    className="text-sm"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🦸
                  </motion.span>
                ) : (
                  <span className="text-[10px]">{content}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Touch directional pad */}
      <div className="grid grid-cols-3 gap-1 mt-2">
        <div />
        <button onClick={() => move(-1, 0)} className="rounded-lg bg-[hsl(210_40%_20%)] p-2 text-white text-xs hover:bg-[hsl(210_40%_30%)] active:scale-95">▲</button>
        <div />
        <button onClick={() => move(0, -1)} className="rounded-lg bg-[hsl(210_40%_20%)] p-2 text-white text-xs hover:bg-[hsl(210_40%_30%)] active:scale-95">◄</button>
        <div className="rounded-lg bg-[hsl(210_40%_15%)] p-2 text-[8px] text-white/30 flex items-center justify-center">WASD</div>
        <button onClick={() => move(0, 1)} className="rounded-lg bg-[hsl(210_40%_20%)] p-2 text-white text-xs hover:bg-[hsl(210_40%_30%)] active:scale-95">►</button>
        <div />
        <button onClick={() => move(1, 0)} className="rounded-lg bg-[hsl(210_40%_20%)] p-2 text-white text-xs hover:bg-[hsl(210_40%_30%)] active:scale-95">▼</button>
        <div />
      </div>
    </div>
  );
}
