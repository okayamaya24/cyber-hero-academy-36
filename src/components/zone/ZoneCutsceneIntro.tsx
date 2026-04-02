import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NarrativeChoice from "@/components/zone/NarrativeChoice";
import { getZoneNarrativeChoices } from "@/data/narrativeChoices";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

import keybreakerImg from "@/assets/villains/keybreaker.png";
import phisherKingImg from "@/assets/villains/phisher-king.png";
import firewallPhantomImg from "@/assets/villains/firewall-phantom.png";
import dataThiefImg from "@/assets/villains/data-thief.png";

const VILLAIN_CONFIG: Record<string, { img: string; color: string; glowColor: string }> = {
  "The Keybreaker": { img: keybreakerImg, color: "140, 85%, 50%", glowColor: "rgba(0,255,100,0.2)" },
  "The Phisher King": { img: phisherKingImg, color: "195, 85%, 50%", glowColor: "rgba(0,200,255,0.2)" },
  "The Firewall Phantom": { img: firewallPhantomImg, color: "300, 85%, 50%", glowColor: "rgba(200,0,255,0.2)" },
  "The Data Thief": { img: dataThiefImg, color: "175, 85%, 45%", glowColor: "rgba(0,255,200,0.2)" },
};

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
    { speaker: "guide", text: "Welcome to Cyber Hero Command! This is where every Guardian's journey begins." },
    { speaker: "guide", text: "Complete your orientation and unlock your first mission. Let's go!" },
  ],
  "pixel-port": [
    { speaker: "villain", text: "Pixel Port — my favourite hunting ground. These kids have no idea how to stay safe!" },
    { speaker: "guide", text: "The Keybreaker has been exploiting bad screen habits here in LA." },
    { speaker: "guide", text: "Teach the kids about digital balance. A healthy Guardian is a powerful one!" },
  ],
  "signal-summit": [
    { speaker: "villain", text: "All your WiFi passwords are mine! Every café, every hotel — I own their networks!" },
    { speaker: "guide", text: "He's running Man-in-the-Middle attacks across Denver's relay stations." },
    { speaker: "guide", text: "Learn to spot safe versus fake networks. Secure the summit!" },
  ],
  "code-canyon": [
    { speaker: "villain", text: "Act NOW or your account will be DELETED! Panic makes people careless…" },
    { speaker: "guide", text: "Chicago's digital canyons are full of scam traps and social engineering." },
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
    { speaker: "guide", text: "Master encryption and prove that strong codes are truly unbreakable!" },
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
    { speaker: "guide", text: "Shadow Station is packed with fake gaming sites targeting kids." },
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

interface ZoneCutsceneIntroProps {
  villainName: string;
  zoneName: string;
  zoneIcon: string;
  zoneId?: string;
  storyNarration: string;
  villainTaunt: string;
  onStart: () => void;
}

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
  const [showChoice, setShowChoice] = useState(false);
  const narrativeChoices = getZoneNarrativeChoices(zoneId || "");

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
    } else if (narrativeChoices?.cutsceneChoice && !showChoice) {
      setShowChoice(true);
    } else {
      onStart();
    }
  }, [done, finish, lineIndex, lines.length, onStart, narrativeChoices, showChoice]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleAdvance]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-4"
      style={{ background: "linear-gradient(160deg, #050a14 0%, #0a1428 60%, #120a1e 100%)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleAdvance}
    >
      {/* Scanlines overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(100,200,255,0.01) 2px, rgba(100,200,255,0.01) 4px)",
        }}
      />

      {/* Background villain glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-3xl opacity-15"
          style={{ background: villainCfg?.glowColor ?? "rgba(0,200,255,0.15)" }}
        />
      </div>

      {/* Skip button */}
      <button
        className="absolute top-5 right-4 z-20 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/40 hover:text-white/70 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        SKIP ▶▶
      </button>

      {/* Zone title */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center"
      >
        <p className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase mb-1">Chapter Begins</p>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
          {zoneIcon} {zoneName.toUpperCase()}
        </h1>
        <div className="mt-2 flex items-center justify-center gap-3">
          <div
            className="h-px w-14"
            style={{ background: `linear-gradient(to right, transparent, hsla(${hue},80%,50%,0.5))` }}
          />
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: `hsla(${hue},70%,65%,1)` }}>
            {villainName}'s Domain
          </span>
          <div
            className="h-px w-14"
            style={{ background: `linear-gradient(to left, transparent, hsla(${hue},80%,50%,0.5))` }}
          />
        </div>
      </motion.div>

      {/* ── DIALOGUE CARD ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`card-${lineIndex}`}
          initial={{ y: 18, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -10, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", damping: 24, stiffness: 300 }}
          className="w-full max-w-sm rounded-2xl border-2 overflow-hidden"
          style={{
            borderColor: isVillain ? `hsla(${hue},70%,50%,0.45)` : "hsl(195,80%,50%,0.45)",
            background: isVillain
              ? `linear-gradient(160deg, hsla(${hue},35%,8%,0.97), rgba(5,10,20,0.97))`
              : "linear-gradient(160deg, hsl(210,50%,12%,0.97), rgba(5,10,20,0.97))",
            boxShadow: `0 0 40px ${isVillain ? `hsla(${hue},70%,40%,0.15)` : "hsl(195,80%,40%,0.15)"}, 0 20px 60px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Top strip — speaker name */}
          <div
            className="flex items-center gap-2 px-5 pt-4 pb-3 border-b"
            style={{ borderColor: isVillain ? `hsla(${hue},60%,40%,0.2)` : "hsl(195,80%,50%,0.15)" }}
          >
            <span
              className="text-[11px] font-bold tracking-[0.15em] uppercase"
              style={{ color: isVillain ? `hsla(${hue},70%,65%,1)` : "hsl(195,80%,65%)" }}
            >
              {isVillain ? villainName : playerName}
            </span>
            {!isVillain && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                style={{ background: "hsl(195,80%,50%,0.15)", color: "hsl(195,80%,70%)" }}
              >
                CyberGuardian
              </span>
            )}
          </div>

          {/* Avatar + dialogue row */}
          <div className="flex items-start gap-4 px-5 py-5">
            {/* ── CHARACTER PORTRAIT ── */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              {/* Portrait box */}
              <div
                className="rounded-2xl border-2 overflow-hidden flex items-center justify-center"
                style={{
                  width: 80,
                  height: 80,
                  borderColor: isVillain ? `hsla(${hue},60%,45%,0.55)` : "hsl(195,80%,50%,0.55)",
                  background: isVillain ? `hsla(${hue},40%,10%,0.85)` : "hsl(210,45%,16%,0.9)",
                  boxShadow: isVillain ? `0 0 16px hsla(${hue},60%,45%,0.25)` : "0 0 16px hsl(195,80%,50%,0.2)",
                }}
              >
                {isVillain && villainCfg ? (
                  <img
                    src={villainCfg.img}
                    alt={villainName}
                    className="w-full h-full object-cover object-top"
                    style={{ transform: "scale(1.4) translateY(8px)" }}
                    draggable={false}
                  />
                ) : isVillain ? (
                  <span className="text-3xl">🦹</span>
                ) : (
                  /* Full hero avatar — prominently displayed */
                  <div className="w-full h-full flex items-center justify-center p-1">
                    <HeroAvatar avatarConfig={avatarConfig} size={68} fallbackEmoji="🦸" />
                  </div>
                )}
              </div>

              {/* Animated speaking bars */}
              <div className="flex gap-0.5 h-3 items-end">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={done ? { height: "3px" } : { height: ["3px", "10px", "3px"] }}
                    transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.12, ease: "easeInOut" }}
                    className="w-1 rounded-full"
                    style={{
                      background: isVillain ? `hsla(${hue},70%,60%,0.7)` : "hsl(195,80%,60%,0.7)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Dialogue text */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm leading-relaxed text-white min-h-[3.5rem]">
                {shown}
                {!done && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 0.65 }}
                    className="inline-block w-0.5 h-4 ml-0.5 rounded-full align-middle"
                    style={{ background: isVillain ? `hsla(${hue},70%,65%,1)` : "hsl(195,80%,65%)" }}
                  />
                )}
              </p>
              {done && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="mt-2 text-[10px] text-white/35"
                >
                  {lineIndex < lines.length - 1 ? "Tap to continue…" : "Tap to begin!"}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex gap-2">
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
    </motion.div>
  );
}
