import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import keybreakerImg from "@/assets/villains/keybreaker.png";
import phisherKingImg from "@/assets/villains/phisher-king.png";
import firewallPhantomImg from "@/assets/villains/firewall-phantom.png";
import dataThiefImg from "@/assets/villains/data-thief.png";

/* ── Villain config ─────────────────────────────────── */
const VILLAIN_CONFIG: Record<string, { img: string; color: string; glowColor: string }> = {
  "The Keybreaker": { img: keybreakerImg, color: "140, 85%, 50%", glowColor: "rgba(0,255,100,0.25)" },
  "The Phisher King": { img: phisherKingImg, color: "195, 85%, 50%", glowColor: "rgba(0,200,255,0.25)" },
  "The Firewall Phantom": { img: firewallPhantomImg, color: "300, 85%, 50%", glowColor: "rgba(200,0,255,0.25)" },
  "The Data Thief": { img: dataThiefImg, color: "175, 85%, 45%", glowColor: "rgba(0,255,200,0.25)" },
};

/* ── Dialogue lines per zone intro ─────────────────── */
interface DialogueLine {
  speaker: "guide" | "villain";
  text: string;
}

const ZONE_DIALOGUE: Record<string, DialogueLine[]> = {
  hq: [
    {
      speaker: "villain",
      text: "A training room? How adorable. While you study, I'll crack every account in the city…",
    },
    {
      speaker: "guide",
      text: "Welcome to Cyber Hero Command! Complete your orientation to unlock your first mission.",
    },
    { speaker: "guide", text: "Knowledge is your most powerful weapon, Guardian. Let's begin!" },
  ],
  "pixel-port": [
    { speaker: "villain", text: "Pixel Port — my favourite hunting ground. These kids have no idea how to stay safe!" },
    { speaker: "guide", text: "The Keybreaker's been exploiting bad screen habits here in Los Angeles." },
    {
      speaker: "guide",
      text: "Teach them about digital balance and online safety. A healthy Guardian is a powerful one!",
    },
  ],
  "signal-summit": [
    { speaker: "villain", text: "All your WiFi passwords are mine! Every café, every hotel — I own their networks!" },
    { speaker: "guide", text: "He's running Man-in-the-Middle attacks across Denver's relay stations." },
    { speaker: "guide", text: "Learn to spot safe versus fake networks. Secure the summit before it's too late!" },
  ],
  "code-canyon": [
    { speaker: "villain", text: "Act NOW or your account will be DELETED! Panic makes people careless… heh heh." },
    { speaker: "guide", text: "Chicago's digital canyons are full of scam traps and social engineering attacks." },
    { speaker: "guide", text: "Slow down, think carefully, spot the scam. That's your mission here." },
  ],
  "encrypt-enclave": [
    {
      speaker: "villain",
      text: "Your encryption is useless! I've cracked stronger codes than anything you can build!",
    },
    {
      speaker: "guide",
      text: "Toronto's encryption systems are under attack. The Keybreaker wants to expose every private message.",
    },
    { speaker: "guide", text: "He's bluffing. Master encryption and prove that strong codes are truly unbreakable!" },
  ],
  "password-peak": [
    { speaker: "villain", text: "password123… fluffy… mybirthday… Your passwords are embarrassingly easy!" },
    { speaker: "guide", text: "Password Peak is the Keybreaker's favourite playground in New York." },
    { speaker: "guide", text: "Every strong password you create is a lock he can't pick. Build the fortress!" },
  ],
  "arctic-archive": [
    { speaker: "villain", text: "Cold storage won't save your secrets forever. My bots never get cold…" },
    { speaker: "guide", text: "The Arctic Archive holds the world's most important backups in Vancouver." },
    { speaker: "guide", text: "Learn the 3-2-1 backup rule and protect the Archive before it's too late!" },
  ],
  "shadow-station": [
    { speaker: "villain", text: "Want free in-game items? Just give me your password… such a simple trap." },
    { speaker: "guide", text: "Shadow Station is packed with fake gaming sites targeting kids in Mexico City." },
    {
      speaker: "guide",
      text: "Help kids here learn who to trust in online games — and what to do when something feels wrong.",
    },
  ],
  "firewall-fortress": [
    { speaker: "villain", text: "Your firewalls are useless against me! I phase right through them!" },
    {
      speaker: "guide",
      text: "Firewall Fortress in Atlanta is the last line of defence before the Keybreaker's Vault.",
    },
    { speaker: "guide", text: "Build the strongest firewall you can — then we go after the Keybreaker himself!" },
  ],
};

const DEFAULT_DIALOGUE: DialogueLine[] = [
  { speaker: "villain", text: "You think you can stop me here? Think again, Guardian!" },
  { speaker: "guide", text: "This zone needs your help. Study the mission carefully." },
  { speaker: "guide", text: "You've got this — let's begin!" },
];

/* ── Typewriter hook ────────────────────────────────── */
function useTypewriter(text: string, speed = 22) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setShown("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  const finish = useCallback(() => {
    setShown(text);
    setDone(true);
  }, [text]);
  return { shown, done, finish };
}

/* ── Props ─────────────────────────────────────────── */
interface ZoneCutsceneIntroProps {
  villainName: string;
  zoneName: string;
  zoneIcon: string;
  zoneId?: string;
  storyNarration: string;
  villainTaunt: string;
  onStart: () => void;
}

/* ── Component ─────────────────────────────────────── */
export default function ZoneCutsceneIntro({
  villainName,
  zoneName,
  zoneIcon,
  zoneId,
  storyNarration,
  villainTaunt,
  onStart,
}: ZoneCutsceneIntroProps) {
  const { activeChildId } = useAuth();
  const [lineIndex, setLineIndex] = useState(0);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      return data;
    },
    enabled: !!activeChildId,
  });

  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const playerName = (child as any)?.name ?? "Guardian";

  const villainCfg = VILLAIN_CONFIG[villainName];
  const hue = villainCfg?.color.split(",")[0] ?? "195";

  // Use zone-specific dialogue or fall back to narration prop
  const lines: DialogueLine[] = (zoneId && ZONE_DIALOGUE[zoneId]) ?? [
    { speaker: "villain", text: villainTaunt },
    { speaker: "guide", text: storyNarration },
    { speaker: "guide", text: "Let's begin your mission, Guardian!" },
  ];

  const currentLine = lines[lineIndex];
  const isVillain = currentLine.speaker === "villain";
  const { shown, done, finish } = useTypewriter(currentLine.text);

  const handleAdvance = useCallback(() => {
    if (!done) {
      finish();
      return;
    }
    if (lineIndex < lines.length - 1) {
      setLineIndex((i) => i + 1);
    } else {
      onStart();
    }
  }, [done, finish, lineIndex, lines.length, onStart]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleAdvance]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-end pb-16 cursor-pointer"
      style={{
        background: "linear-gradient(160deg, #050a14 0%, #0a1428 60%, #120a1e 100%)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleAdvance}
    >
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,200,255,0.012) 2px, rgba(100,200,255,0.012) 4px)",
        }}
      />

      {/* Villain image — large, centered, atmospheric */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative">
          {/* Glow behind villain */}
          <div
            className="absolute inset-0 rounded-full blur-3xl scale-150 opacity-40"
            style={{ background: villainCfg?.glowColor ?? "rgba(0,200,255,0.2)" }}
          />

          {villainCfg ? (
            <motion.img
              src={villainCfg.img}
              alt={villainName}
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 0.22, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-[280px] md:w-[360px] h-auto select-none"
              style={{ filter: `drop-shadow(0 0 40px hsla(${hue},80%,50%,0.4))` }}
              draggable={false}
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} className="text-[180px] select-none">
              🦹
            </motion.div>
          )}
        </div>
      </div>

      {/* Zone title — top */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-20 left-0 right-0 text-center px-4"
      >
        <p className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase mb-2">Entering Zone</p>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
          {zoneIcon} {zoneName.toUpperCase()}
        </h1>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div
            className="h-px flex-1 max-w-[80px]"
            style={{ background: `linear-gradient(to right, transparent, hsla(${hue},80%,50%,0.5))` }}
          />
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: `hsla(${hue},70%,65%,1)` }}>
            {villainName}'s Domain
          </span>
          <div
            className="h-px flex-1 max-w-[80px]"
            style={{ background: `linear-gradient(to left, transparent, hsla(${hue},80%,50%,0.5))` }}
          />
        </div>
      </motion.div>

      {/* Bottom cinematic gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(5,10,20,0.97) 0%, rgba(5,10,20,0.7) 60%, transparent 100%)",
        }}
      />

      {/* Progress dots */}
      <div className="absolute bottom-[170px] left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {lines.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === lineIndex ? 22 : 7 }}
            className={`h-1.5 rounded-full transition-colors ${
              i === lineIndex ? "bg-[hsl(195_80%_60%)]" : i < lineIndex ? "bg-white/40" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      {/* Skip button */}
      <button
        className="absolute top-6 right-4 z-20 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] font-bold text-white/40 hover:text-white/70 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        SKIP ▶▶
      </button>

      {/* Dialogue box */}
      <motion.div
        key={lineIndex}
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`relative z-10 w-full max-w-lg mx-4 rounded-2xl border-2 p-5 backdrop-blur-xl shadow-2xl ${
          isVillain
            ? `border-[hsla(${hue},70%,50%,0.45)] bg-[rgba(10,5,5,0.97)]`
            : "border-[hsl(195_80%_50%/0.4)] bg-[rgba(5,12,24,0.97)]"
        }`}
        style={{
          boxShadow: `0 0 40px hsla(${isVillain ? hue : "195"},80%,50%,0.12), 0 20px 60px rgba(0,0,0,0.6)`,
        }}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full border-2 overflow-hidden ${
              isVillain
                ? `border-[hsla(${hue},70%,50%,0.6)] bg-black/40`
                : "border-[hsl(195_80%_50%/0.6)] bg-[hsl(210_40%_18%)]"
            }`}
          >
            {isVillain && villainCfg ? (
              <img src={villainCfg.img} alt={villainName} className="w-full h-full object-cover object-top scale-125" />
            ) : isVillain ? (
              <span className="text-2xl">🦹</span>
            ) : (
              <HeroAvatar avatarConfig={avatarConfig} size={40} fallbackEmoji="🦸" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`mb-1.5 text-[10px] font-bold tracking-widest uppercase ${
                isVillain ? `text-[hsla(${hue},70%,65%,1)]` : "text-[hsl(195_80%_65%)]"
              }`}
            >
              {isVillain ? villainName : playerName}
            </p>

            <p className="text-sm leading-relaxed text-white min-h-[3rem]">
              {shown}
              {!done && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.65 }}
                  className={`inline-block w-0.5 h-4 ml-0.5 rounded-full align-middle ${
                    isVillain ? `bg-[hsla(${hue},70%,65%,1)]` : "bg-[hsl(195_80%_65%)]"
                  }`}
                />
              )}
            </p>

            {done && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.35, 0.8, 0.35] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-2 text-[10px] text-white/35"
              >
                {lineIndex < lines.length - 1 ? "Tap to continue…" : "Tap to begin!"}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
