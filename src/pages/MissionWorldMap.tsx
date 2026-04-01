import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Star, Zap, Shield, MessageCircle, ChevronRight, Trophy, X, Globe, Radio } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  MISSIONS,
  getTotalGames,
  getMissionLevels,
  LEARNING_MODE_CONFIG,
  MINI_GAME_META,
  type LearningMode,
} from "@/data/missions";
import { getLevelRank } from "@/data/levelTitles";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import { Button } from "@/components/ui/button";

/* ─── City node definitions ─────────────────────────────── */
const CITY_NODES = [
  {
    id: "password-safety",
    name: "Password Peak",
    city: "New York, USA",
    icon: "🔑",
    description: "Forge unbreakable passwords at the summit!",
    hue: 195,
    x: 22,
    y: 38,
  },
  {
    id: "scam-detection",
    name: "Phish Lagoon",
    city: "London, UK",
    icon: "🎣",
    description: "Catch phishy scams before they catch you!",
    hue: 30,
    x: 45,
    y: 22,
  },
  {
    id: "safe-websites",
    name: "Browse Bazaar",
    city: "Mumbai, India",
    icon: "🌐",
    description: "Navigate the web marketplace safely!",
    hue: 175,
    x: 70,
    y: 45,
  },
  {
    id: "personal-info",
    name: "Privacy Palace",
    city: "Dubai, UAE",
    icon: "🛡️",
    description: "Guard your secrets in the royal palace!",
    hue: 270,
    x: 62,
    y: 42,
  },
  {
    id: "malware-monsters",
    name: "Download Dungeon",
    city: "Berlin, Germany",
    icon: "⬇️",
    description: "Defeat malware lurking in the dungeon depths!",
    hue: 0,
    x: 52,
    y: 20,
  },
  {
    id: "smart-sharing",
    name: "Stranger Shore",
    city: "Lagos, Nigeria",
    icon: "🚷",
    description: "Learn who to trust on the mysterious shore!",
    hue: 45,
    x: 48,
    y: 58,
  },
  {
    id: "phishy-messages",
    name: "Kindness Kingdom",
    city: "São Paulo, Brazil",
    icon: "💖",
    description: "Spread kindness and fight cyberbullying!",
    hue: 330,
    x: 28,
    y: 68,
  },
  {
    id: "malware-maze",
    name: "Malware Maze",
    city: "Sydney, Australia",
    icon: "🦠",
    description: "Navigate the maze of malicious software!",
    hue: 120,
    x: 82,
    y: 72,
  },
  {
    id: "firewall-frontier",
    name: "Firewall Frontier",
    city: "Seoul, South Korea",
    icon: "🧱",
    description: "Build walls to keep threats out!",
    hue: 210,
    x: 80,
    y: 28,
  },
  {
    id: "dark-web-den",
    name: "Dark Web Den",
    city: "Cairo, Egypt",
    icon: "🕸️",
    description: "Shine light into the darkest corners!",
    hue: 280,
    x: 55,
    y: 48,
  },
  {
    id: "encrypt-enclave",
    name: "Encrypt Enclave",
    city: "Toronto, Canada",
    icon: "🔐",
    description: "Master the art of secret codes!",
    hue: 160,
    x: 18,
    y: 28,
  },
  {
    id: "cyberguard-academy",
    name: "Cyber Hero Command",
    city: "Global HQ",
    icon: "🏠",
    description: "Your home base — begin your mission here!",
    hue: 45,
    x: 12,
    y: 50,
    isHub: true,
  },
];

const CONNECTIONS: [number, number][] = [
  [11, 0],
  [11, 10],
  [11, 1],
  [0, 10],
  [0, 6],
  [1, 4],
  [1, 5],
  [3, 9],
  [3, 2],
  [2, 8],
  [2, 7],
  [5, 6],
];

type NodeStatus = "completed" | "unlocked" | "locked" | "gated";

function getStars(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const r = score / maxScore;
  if (r >= 0.9) return 3;
  if (r >= 0.6) return 2;
  if (r > 0) return 1;
  return 0;
}

/* ═══════════════════════════════════════════════════════════
   STORY SYSTEM
   ═══════════════════════════════════════════════════════════ */

type SpeakerRole = "guide" | "villain" | "system";

interface DialogueLine {
  speaker: SpeakerRole;
  /** villain name shown in bubble — guide uses player name */
  villainName?: string;
  text: string;
  emotion?: "neutral" | "happy" | "serious" | "warning" | "excited";
}

interface ZoneScript {
  intro: DialogueLine[];
  completion: DialogueLine[];
  badge?: string;
  xp: number;
  unlocks: string[]; // zone ids
}

/* ── Per-zone story scripts ─────────────────────────────── */
const ZONE_SCRIPTS: Record<string, ZoneScript> = {
  __map__: {
    xp: 0,
    unlocks: [],
    intro: [
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "Heh heh heh… No password can stop me! I've cracked them ALL, Guardian!",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Guardian — something is very wrong. The Keybreaker has cracked into systems across the Digital World.",
      },
      {
        speaker: "guide",
        emotion: "excited",
        text: "Start at HQ and begin your training. The Digital World is counting on you!",
      },
    ],
    completion: [],
  },
  "cyberguard-academy": {
    xp: 100,
    unlocks: ["password-safety", "encrypt-enclave"],
    intro: [
      {
        speaker: "guide",
        emotion: "happy",
        text: "Welcome to Cyber Hero Command! This is where every Guardian's journey begins.",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Complete your orientation to unlock your first zones. Knowledge is your most powerful weapon!",
      },
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "A training room? How adorable. While you study, I'll be cracking every account in the city…",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Orientation complete! You're officially a CyberGuardian recruit!",
      },
      {
        speaker: "guide",
        emotion: "happy",
        text: "Password Peak and Encrypt Enclave are now open. Choose your first mission!",
      },
    ],
  },
  "password-safety": {
    xp: 150,
    unlocks: ["encrypt-enclave", "phishy-messages"],
    badge: "Password Master Badge",
    intro: [
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "password123… fluffy… mybirthday… Your passwords are embarrassingly easy. I crack them before breakfast.",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Password Peak is the Keybreaker's favourite playground. He steals thousands of weak passwords every hour.",
      },
      {
        speaker: "guide",
        emotion: "excited",
        text: "Every strong password you create is a lock he can't pick. Let's build an unbreakable fortress!",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Password Peak is secured! The Keybreaker's stolen credential database is destroyed.",
      },
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "My… my passwords… YEARS of work! You'll pay for this, Guardian!",
      },
      {
        speaker: "guide",
        emotion: "happy",
        text: "Password Master Badge earned! Two new zones are opening up — keep going!",
      },
    ],
  },
  "scam-detection": {
    xp: 175,
    unlocks: ["malware-monsters", "smart-sharing"],
    badge: "Scam Spotter Badge",
    intro: [
      {
        speaker: "guide",
        emotion: "warning",
        text: "Phish Lagoon is crawling with traps. The Keybreaker lures people in with fake emails and prize pop-ups.",
      },
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "Act NOW or lose your account forever! Heh heh — panic makes people careless…",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Slow down, think carefully, and spot the scam. That's your mission here.",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Phish Lagoon is clear! No more fake emails fooling people in this zone.",
      },
      {
        speaker: "guide",
        emotion: "happy",
        text: "Scam Spotter Badge unlocked! Download Dungeon and Stranger Shore are now open.",
      },
    ],
  },
  "safe-websites": {
    xp: 175,
    unlocks: ["firewall-frontier", "malware-maze"],
    badge: "Safe Browser Badge",
    intro: [
      {
        speaker: "guide",
        emotion: "serious",
        text: "Browse Bazaar looks like a marketplace — but the Keybreaker has planted fake websites everywhere.",
      },
      {
        speaker: "guide",
        emotion: "excited",
        text: "Learn to spot the padlock, check for HTTPS, and never enter personal info on suspicious sites!",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Browse Bazaar is safe again! You've exposed every fake website the Keybreaker planted.",
      },
      {
        speaker: "guide",
        emotion: "happy",
        text: "Safe Browser Badge earned! Firewall Frontier and Malware Maze are now unlocked.",
      },
    ],
  },
  "personal-info": {
    xp: 175,
    unlocks: ["dark-web-den", "safe-websites"],
    badge: "Privacy Guardian Badge",
    intro: [
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "Your data is MINE! Name, address, school — I've got it all. What will you do, little Guardian?",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Privacy Palace holds the secrets of thousands of kids. The Keybreaker wants all of it.",
      },
      {
        speaker: "guide",
        emotion: "excited",
        text: "Learn what's safe to share and what must stay private. Protect the palace!",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Privacy Palace is secured! The Keybreaker can't steal what's properly protected.",
      },
      {
        speaker: "guide",
        emotion: "happy",
        text: "Privacy Guardian Badge earned! Dark Web Den and Browse Bazaar are now open.",
      },
    ],
  },
  "malware-monsters": {
    xp: 200,
    unlocks: ["dark-web-den"],
    badge: "Virus Buster Badge",
    intro: [
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "My viruses are EVERYWHERE! Your device doesn't stand a chance against my malware army!",
      },
      {
        speaker: "guide",
        emotion: "warning",
        text: "Download Dungeon is packed with the Keybreaker's malware. Every unsafe download is a trap.",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Only download from official sources. Never click suspicious links. Let's clean this dungeon out!",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Download Dungeon cleared! Every piece of malware has been destroyed.",
      },
      { speaker: "guide", emotion: "happy", text: "Virus Buster Badge is yours! Dark Web Den is now accessible." },
    ],
  },
  "smart-sharing": {
    xp: 175,
    unlocks: ["phishy-messages"],
    badge: "Stranger Safety Badge",
    intro: [
      {
        speaker: "guide",
        emotion: "warning",
        text: "Stranger Shore is tricky — some people online pretend to be friends to steal information.",
      },
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "Want free in-game items? Just tell me where you live… It's that simple, little Guardian.",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Teach the people here who to trust online — and what to do when something feels wrong.",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Stranger Shore is safe! Everyone here now knows how to handle online strangers.",
      },
      { speaker: "guide", emotion: "happy", text: "Stranger Safety Badge earned! Kindness Kingdom is now unlocked." },
    ],
  },
  "phishy-messages": {
    xp: 200,
    unlocks: [],
    badge: "Kindness Champion Badge",
    intro: [
      {
        speaker: "guide",
        emotion: "warning",
        text: "Kindness Kingdom is under attack — the Keybreaker's trolls are spreading mean messages everywhere.",
      },
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "I'll make everyone feel terrible online! Misery is my greatest weapon, Guardian!",
      },
      {
        speaker: "guide",
        emotion: "excited",
        text: "Be an upstander, not a bystander. Kindness is the most powerful shield there is!",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Kindness Kingdom is glowing! The trolls have been driven out by kindness and courage.",
      },
      {
        speaker: "guide",
        emotion: "happy",
        text: "Kindness Champion Badge earned! You're becoming a true Cyber Hero, Guardian!",
      },
    ],
  },
  "malware-maze": {
    xp: 225,
    unlocks: [],
    badge: "Maze Master Badge",
    intro: [
      {
        speaker: "guide",
        emotion: "warning",
        text: "Malware Maze is a labyrinth of viruses, ransomware, and trojans. One wrong turn and you're infected!",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Use your antivirus knowledge and safe browsing skills to navigate through safely.",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Malware Maze conquered! You navigated every threat without a single infection.",
      },
      { speaker: "guide", emotion: "happy", text: "Maze Master Badge is yours!" },
    ],
  },
  "firewall-frontier": {
    xp: 225,
    unlocks: [],
    badge: "Firewall Builder Badge",
    intro: [
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "Your firewalls are useless against me! I am the ghost in the machine — I phase right through!",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Firewall Frontier is the last line of defence for this region's networks. We need to strengthen it.",
      },
      {
        speaker: "guide",
        emotion: "excited",
        text: "Learn how firewalls block threats — and build one strong enough to stop even the Keybreaker!",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Firewall Frontier is holding strong! The Keybreaker can't get through anymore.",
      },
      { speaker: "guide", emotion: "happy", text: "Firewall Builder Badge earned!" },
    ],
  },
  "dark-web-den": {
    xp: 250,
    unlocks: [],
    badge: "Shadow Buster Badge",
    intro: [
      {
        speaker: "guide",
        emotion: "warning",
        text: "Dark Web Den is the most dangerous zone yet. The Keybreaker hides his most secret operations here.",
      },
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "You dare enter my domain? The dark web holds secrets you're not ready to face, little Guardian…",
      },
      {
        speaker: "guide",
        emotion: "serious",
        text: "Shine light into the shadows. Expose the threats and get out safely. Stay focused!",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Dark Web Den exposed! The Keybreaker's secret operation is shut down.",
      },
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "Impressive, Guardian. But this isn't over. Not by a long shot…",
      },
      { speaker: "guide", emotion: "happy", text: "Shadow Buster Badge earned! You're nearly unstoppable now!" },
    ],
  },
  "encrypt-enclave": {
    xp: 200,
    unlocks: ["personal-info"],
    badge: "Code Breaker Badge",
    intro: [
      {
        speaker: "guide",
        emotion: "serious",
        text: "Encrypt Enclave holds the Digital World's most powerful secret codes. The Keybreaker wants to crack them all.",
      },
      {
        speaker: "villain",
        villainName: "The Keybreaker",
        emotion: "warning",
        text: "Your encryption is useless! I've cracked stronger codes than anything you can build!",
      },
      {
        speaker: "guide",
        emotion: "excited",
        text: "He's bluffing. Master encryption and prove that strong codes are truly unbreakable!",
      },
    ],
    completion: [
      {
        speaker: "guide",
        emotion: "excited",
        text: "Encrypt Enclave secured! The Keybreaker's decryption bots have been destroyed.",
      },
      { speaker: "guide", emotion: "happy", text: "Code Breaker Badge earned! Privacy Palace is now open." },
    ],
  },
};

/* ── Ambient chatter lines ──────────────────────────────── */
interface AmbientLine {
  speaker: SpeakerRole;
  villainName?: string;
  text: string;
  nearZone?: string;
}

const AMBIENT_LINES: AmbientLine[] = [
  { speaker: "guide", text: "Remember — always tell a trusted adult if something online feels wrong! 🛡️" },
  { speaker: "guide", text: "Strong passwords are your first line of defence, Guardian. 🔑" },
  { speaker: "guide", text: "The Keybreaker is getting desperate — that means we're winning! 💪" },
  { speaker: "guide", text: "Look for the padlock icon before entering any personal info online. 🔒" },
  { speaker: "guide", text: "If it seems too good to be true, it's almost certainly a scam! 🎣" },
  { speaker: "guide", text: "Never share personal info in online games — even with 'friends'. 🎮" },
  {
    speaker: "villain",
    villainName: "The Keybreaker",
    text: "Heh heh… I'm watching every move you make, Guardian…",
    nearZone: "dark-web-den",
  },
  {
    speaker: "villain",
    villainName: "The Keybreaker",
    text: "Act NOW or your account will be DELETED! Panic is my greatest weapon!",
    nearZone: "scam-detection",
  },
  {
    speaker: "villain",
    villainName: "The Keybreaker",
    text: "password123? mybirthday? Thank you for making this so easy…",
    nearZone: "password-safety",
  },
  {
    speaker: "villain",
    villainName: "The Keybreaker",
    text: "My fake WiFi networks are everywhere. Which one will you fall for?",
    nearZone: "safe-websites",
  },
];

/* ── useStoryEngine ─────────────────────────────────────── */
function useStoryEngine(childId: string | null) {
  const storageKey = `cga_story_${childId ?? "guest"}`;

  const [seenIntros, setSeenIntros] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(seenIntros)));
  }, [seenIntros, storageKey]);

  // ── Cutscene state ──
  const [cutscene, setCutscene] = useState<{
    lines: DialogueLine[];
    index: number;
    onDone: () => void;
  } | null>(null);

  // ── Completion panel state ──
  const [completion, setCompletion] = useState<{
    zoneName: string;
    lines: DialogueLine[];
    index: number;
    xp: number;
    badge?: string;
    unlocks: string[];
    onDone: (unlocked: string[]) => void;
  } | null>(null);

  // ── Ambient state ──
  const [ambientLine, setAmbientLine] = useState<AmbientLine | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const ambientTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleAmbient = useCallback(() => {
    if (ambientTimer.current) clearTimeout(ambientTimer.current);
    ambientTimer.current = setTimeout(
      () => {
        const pool = AMBIENT_LINES.filter((l) => !l.nearZone || l.nearZone === activeZone);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setAmbientLine(pick);
        setTimeout(() => {
          setAmbientLine(null);
          scheduleAmbient();
        }, 5000);
      },
      9000 + Math.random() * 8000,
    );
  }, [activeZone]);

  useEffect(() => {
    if (!cutscene && !completion) scheduleAmbient();
    return () => {
      if (ambientTimer.current) clearTimeout(ambientTimer.current);
    };
  }, [cutscene, completion, scheduleAmbient]);

  // ── Trigger zone intro ──
  const triggerIntro = useCallback(
    (zoneId: string, onEnter: () => void) => {
      setActiveZone(zoneId);
      if (seenIntros.has(zoneId)) {
        onEnter();
        return;
      }
      const script = ZONE_SCRIPTS[zoneId];
      if (!script?.intro?.length) {
        setSeenIntros((p) => new Set(p).add(zoneId));
        onEnter();
        return;
      }
      setCutscene({
        lines: script.intro,
        index: 0,
        onDone: () => {
          setSeenIntros((p) => new Set(p).add(zoneId));
          setCutscene(null);
          onEnter();
        },
      });
    },
    [seenIntros],
  );

  // ── Trigger map world intro ──
  const triggerMapIntro = useCallback(() => {
    if (seenIntros.has("__map__")) return;
    const script = ZONE_SCRIPTS["__map__"];
    if (!script?.intro?.length) return;
    setCutscene({
      lines: script.intro,
      index: 0,
      onDone: () => {
        setSeenIntros((p) => new Set(p).add("__map__"));
        setCutscene(null);
      },
    });
  }, [seenIntros]);

  // ── Trigger zone completion ──
  const triggerCompletion = useCallback((zoneId: string, zoneName: string, onDone: (unlocked: string[]) => void) => {
    const script = ZONE_SCRIPTS[zoneId];
    if (!script) {
      onDone([]);
      return;
    }
    setCompletion({
      zoneName,
      lines: script.completion,
      index: 0,
      xp: script.xp,
      badge: script.badge,
      unlocks: script.unlocks,
      onDone,
    });
  }, []);

  // ── Advance cutscene ──
  const advanceCutscene = useCallback(() => {
    setCutscene((prev) => {
      if (!prev) return null;
      const next = prev.index + 1;
      if (next >= prev.lines.length) {
        setTimeout(prev.onDone, 0);
        return null;
      }
      return { ...prev, index: next };
    });
  }, []);

  const skipCutscene = useCallback(() => {
    setCutscene((prev) => {
      if (prev) setTimeout(prev.onDone, 0);
      return null;
    });
  }, []);

  // ── Advance completion ──
  const advanceCompletion = useCallback(() => {
    setCompletion((prev) => {
      if (!prev) return null;
      const next = prev.index + 1;
      if (next >= prev.lines.length) {
        setTimeout(() => prev.onDone(prev.unlocks), 0);
        return null;
      }
      return { ...prev, index: next };
    });
  }, []);

  const skipCompletion = useCallback(() => {
    setCompletion((prev) => {
      if (prev) setTimeout(() => prev.onDone(prev.unlocks), 0);
      return null;
    });
  }, []);

  return {
    cutscene,
    completion,
    ambientLine,
    triggerIntro,
    triggerMapIntro,
    triggerCompletion,
    advanceCutscene,
    skipCutscene,
    advanceCompletion,
    skipCompletion,
  };
}

/* ═══════════════════════════════════════════════════════════
   CUTSCENE PLAYER
   ═══════════════════════════════════════════════════════════ */
function useTypewriter(text: string, speed = 25) {
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

function CutscenePlayer({
  lines,
  index,
  onAdvance,
  onSkip,
  avatarConfig,
  playerName,
}: {
  lines: DialogueLine[];
  index: number;
  onAdvance: () => void;
  onSkip: () => void;
  avatarConfig: Record<string, any> | null;
  playerName: string;
}) {
  const line = lines[index];
  const isVillain = line.speaker === "villain";
  const { shown, done, finish } = useTypewriter(line.text);

  const handleClick = useCallback(() => {
    if (!done) finish();
    else onAdvance();
  }, [done, finish, onAdvance]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-end pb-16 cursor-pointer"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)" }}
      onClick={handleClick}
    >
      {/* Top cinematic bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black/70 backdrop-blur-sm" />

      {/* Progress dots */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {lines.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === index ? 20 : 6 }}
            className={`h-1.5 rounded-full transition-colors ${
              i === index ? "bg-[hsl(195_80%_60%)]" : i < index ? "bg-white/40" : "bg-white/15"
            }`}
          />
        ))}
      </div>

      {/* Skip */}
      <button
        className="absolute top-4 right-4 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] font-bold text-white/40 backdrop-blur-sm hover:text-white/70 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
      >
        SKIP ▶▶
      </button>

      {/* Dialogue box */}
      <motion.div
        key={index}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full max-w-lg mx-4 rounded-2xl border-2 p-5 backdrop-blur-xl shadow-2xl ${
          isVillain
            ? "border-[hsl(0_70%_50%/0.4)] bg-[hsl(0_30%_10%/0.95)] shadow-[0_0_40px_hsl(0_70%_50%/0.15)]"
            : "border-[hsl(195_80%_50%/0.4)] bg-[hsl(210_40%_12%/0.97)] shadow-[0_0_40px_hsl(195_80%_50%/0.15)]"
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className={`flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full border-2 ${
              isVillain
                ? "border-[hsl(0_70%_50%/0.5)] bg-[hsl(0_40%_15%)]"
                : "border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_18%)]"
            }`}
          >
            {isVillain ? (
              <span className="text-2xl">🦹</span>
            ) : (
              <HeroAvatar avatarConfig={avatarConfig} size={40} fallbackEmoji="🦸" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Speaker name */}
            <p
              className={`mb-1.5 text-[10px] font-bold tracking-widest uppercase ${
                isVillain ? "text-[hsl(0_70%_65%)]" : "text-[hsl(195_80%_65%)]"
              }`}
            >
              {isVillain ? (line.villainName ?? "Villain") : playerName}
            </p>

            {/* Dialogue text */}
            <p className="text-sm leading-relaxed text-white min-h-[3rem]">
              {shown}
              {!done && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className={`inline-block w-0.5 h-4 ml-0.5 rounded-full align-middle ${
                    isVillain ? "bg-[hsl(0_70%_65%)]" : "bg-[hsl(195_80%_65%)]"
                  }`}
                />
              )}
            </p>

            {done && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="mt-2 text-[10px] text-white/35"
              >
                {index < lines.length - 1 ? "Tap to continue…" : "Tap to begin!"}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ZONE COMPLETION PANEL
   ═══════════════════════════════════════════════════════════ */
function ZoneCompletionPanel({
  zoneName,
  lines,
  index,
  xp,
  badge,
  unlocks,
  zoneNameMap,
  onAdvance,
  onSkip,
  avatarConfig,
  playerName,
}: {
  zoneName: string;
  lines: DialogueLine[];
  index: number;
  xp: number;
  badge?: string;
  unlocks: string[];
  zoneNameMap: Record<string, string>;
  onAdvance: () => void;
  onSkip: () => void;
  avatarConfig: Record<string, any> | null;
  playerName: string;
}) {
  const isLast = index >= lines.length - 1;
  const [xpCount, setXpCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [showUnlocks, setShowUnlocks] = useState(false);

  useEffect(() => {
    if (!isLast) return;
    let n = 0;
    const step = Math.ceil(xp / 40);
    const id = setInterval(() => {
      n = Math.min(n + step, xp);
      setXpCount(n);
      if (n >= xp) clearInterval(id);
    }, 28);
    const t1 = setTimeout(() => setShowBadge(true), 600);
    const t2 = setTimeout(() => setShowUnlocks(true), 1100);
    return () => {
      clearInterval(id);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isLast, xp]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.88, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="w-full max-w-md rounded-3xl border border-[hsl(160_65%_50%/0.3)] bg-[hsl(210_40%_11%)] p-6 shadow-[0_0_60px_hsl(160_65%_50%/0.12)]"
      >
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[hsl(160_65%_50%/0.6)] bg-[hsl(160_65%_50%/0.12)] text-xl"
          >
            ✅
          </motion.div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[hsl(160_65%_55%)] uppercase">Zone Secured!</p>
            <p className="text-lg font-bold text-white">{zoneName}</p>
          </div>
        </div>

        {/* Debrief dialogue */}
        <div className="mb-5 space-y-2 max-h-48 overflow-y-auto">
          {lines.map((l, i) => {
            const isVillain = l.speaker === "villain";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: i <= index ? 1 : 0.15, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-start gap-2.5 rounded-xl p-3 text-sm transition-all ${
                  i === index
                    ? isVillain
                      ? "bg-[hsl(0_40%_15%/0.6)] border border-[hsl(0_70%_50%/0.2)]"
                      : "bg-[hsl(195_80%_50%/0.1)] border border-[hsl(195_80%_50%/0.2)]"
                    : "bg-transparent border border-transparent"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isVillain ? (
                    <span className="text-sm">🦹</span>
                  ) : (
                    <HeroAvatar avatarConfig={avatarConfig} size={18} fallbackEmoji="🦸" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-[9px] font-bold tracking-wide uppercase mb-0.5 ${
                      isVillain ? "text-[hsl(0_70%_60%)]" : "text-[hsl(195_80%_60%)]"
                    }`}
                  >
                    {isVillain ? (l.villainName ?? "Villain") : playerName}
                  </p>
                  <p className="text-white/80 leading-snug">{l.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Rewards — only on last line */}
        {isLast && (
          <div className="mb-5 flex gap-3 flex-wrap">
            {/* XP */}
            <div className="flex-1 min-w-[90px] rounded-xl border border-[hsl(45_90%_55%/0.25)] bg-[hsl(45_90%_55%/0.08)] p-3 text-center">
              <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">XP Earned</p>
              <p className="text-2xl font-bold text-[hsl(45_90%_60%)] tabular-nums">+{xpCount}</p>
            </div>

            {/* Badge */}
            {badge && (
              <motion.div
                animate={{ opacity: showBadge ? 1 : 0, scale: showBadge ? 1 : 0.85 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex-1 min-w-[110px] rounded-xl border border-[hsl(160_65%_50%/0.25)] bg-[hsl(160_65%_50%/0.08)] p-3 text-center"
              >
                <p className="text-lg mb-0.5">🏅</p>
                <p className="text-[9px] text-[hsl(160_65%_55%)] uppercase tracking-wide">New Badge</p>
                <p className="text-[10px] font-bold text-white/70 mt-0.5 leading-tight">{badge}</p>
              </motion.div>
            )}

            {/* Unlocks */}
            {unlocks.length > 0 && (
              <motion.div
                animate={{ opacity: showUnlocks ? 1 : 0, y: showUnlocks ? 0 : 8 }}
                className="w-full rounded-xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(195_80%_50%/0.06)] p-3"
              >
                <p className="text-[9px] text-[hsl(195_80%_60%)] uppercase tracking-wide mb-2">🔓 Zones Unlocked</p>
                <div className="flex flex-wrap gap-1.5">
                  {unlocks.map((id) => (
                    <span
                      key={id}
                      className="rounded-full bg-[hsl(195_80%_50%/0.12)] border border-[hsl(195_80%_50%/0.2)] px-2.5 py-0.5 text-[10px] font-bold text-[hsl(195_80%_70%)]"
                    >
                      {zoneNameMap[id] ?? id}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!isLast ? (
            <>
              <Button
                className="flex-1 bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white border-0 font-bold"
                onClick={onAdvance}
              >
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <button className="text-[11px] text-white/30 hover:text-white/60 transition-colors px-2" onClick={onSkip}>
                Skip
              </button>
            </>
          ) : (
            <Button
              className="w-full border border-[hsl(160_65%_50%/0.3)] bg-[hsl(160_65%_50%/0.12)] hover:bg-[hsl(160_65%_50%/0.2)] text-[hsl(160_65%_60%)] font-bold"
              onClick={onSkip}
            >
              Back to Map →
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AMBIENT BUBBLE
   ═══════════════════════════════════════════════════════════ */
function AmbientBubble({
  line,
  avatarConfig,
  playerName,
}: {
  line: AmbientLine;
  avatarConfig: Record<string, any> | null;
  playerName: string;
}) {
  const isVillain = line.speaker === "villain";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.94 }}
      className={`fixed bottom-28 right-4 z-50 flex items-start gap-2.5 max-w-[220px] rounded-2xl border p-3 shadow-xl backdrop-blur-md md:bottom-12 md:right-6 ${
        isVillain
          ? "border-[hsl(0_70%_50%/0.3)] bg-[hsl(0_30%_10%/0.92)] rounded-br-sm"
          : "border-[hsl(195_80%_50%/0.25)] bg-[hsl(210_40%_14%/0.92)] rounded-br-sm"
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isVillain ? (
          <span className="text-base">🦹</span>
        ) : (
          <HeroAvatar avatarConfig={avatarConfig} size={20} fallbackEmoji="🦸" />
        )}
      </div>
      <div>
        <p
          className={`text-[9px] font-bold tracking-wide uppercase mb-0.5 ${
            isVillain ? "text-[hsl(0_70%_60%)]" : "text-[hsl(195_80%_60%)]"
          }`}
        >
          {isVillain ? (line.villainName ?? "Villain") : playerName}
        </p>
        <p className="text-[11px] text-white/80 leading-snug">{line.text}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   UNLOCK ANIMATION
   ═══════════════════════════════════════════════════════════ */
function UnlockBurst({ x, y, name, onDone }: { x: number; y: number; name: string; onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "label" | "out">("in");
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("label"), 400);
    const t2 = setTimeout(() => setPhase("out"), 2000);
    const t3 = setTimeout(onDone, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);
  if (phase === "out") return null;
  return (
    <div className="pointer-events-none absolute z-30" style={{ left: x, top: y, transform: "translate(-50%,-50%)" }}>
      {[60, 90, 120].map((size, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.9, delay: i * 0.18, ease: "easeOut" }}
          className="absolute rounded-full border border-[hsl(195_80%_60%/0.5)]"
          style={{ width: size, height: size, top: -size / 2, left: -size / 2 }}
        />
      ))}
      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, delay: 0.05 }}
        className="block text-2xl"
        style={{ filter: "drop-shadow(0 0 8px hsl(195 80% 60% / 0.8))" }}
      >
        🔓
      </motion.span>
      {phase === "label" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[hsl(195_80%_50%/0.3)] bg-[hsl(210_40%_14%/0.9)] px-3 py-1 text-[10px] font-bold text-[hsl(195_80%_70%)]"
        >
          {name} unlocked!
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SVG CONNECTIONS (unchanged)
   ═══════════════════════════════════════════════════════════ */
function MapConnections({ statuses, hqCompleted }: { statuses: NodeStatus[]; hqCompleted: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="connGlow">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="goldGlow">
          <feGaussianBlur stdDeviation="0.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {CONNECTIONS.map(([a, b], i) => {
        const from = CITY_NODES[a],
          to = CITY_NODES[b];
        const isHQConn = from.isHub || to.isHub;
        const aStatus = from.isHub ? "unlocked" : statuses[a];
        const bStatus = to.isHub ? "unlocked" : statuses[b];
        const bothDone = aStatus === "completed" && bStatus === "completed";
        const anyUnlocked = aStatus !== "locked" && aStatus !== "gated" && bStatus !== "locked" && bStatus !== "gated";
        let stroke: string, dashArr: string, filterAttr: string | undefined;
        if (isHQConn) {
          stroke = hqCompleted ? "hsl(45 90% 55% / 0.4)" : "hsl(45 90% 55% / 0.25)";
          dashArr = "1.5 1";
          filterAttr = "url(#goldGlow)";
        } else if (bothDone) {
          stroke = "hsl(160 65% 55% / 0.6)";
          dashArr = "none";
          filterAttr = "url(#connGlow)";
        } else if (anyUnlocked) {
          stroke = "hsl(195 85% 60% / 0.3)";
          dashArr = "1 0.8";
        } else {
          stroke = "hsl(200 15% 40% / 0.08)";
          dashArr = "1 0.8";
        }
        const mx = (from.x + to.x) / 2,
          my = (from.y + to.y) / 2;
        const dx = to.x - from.x,
          dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const off = len * 0.12;
        const cx = mx + (-dy / len) * off,
          cy = my + (dx / len) * off;
        return (
          <path
            key={i}
            d={`M${from.x},${from.y} Q${cx},${cy} ${to.x},${to.y}`}
            fill="none"
            stroke={stroke}
            strokeWidth={bothDone ? 0.5 : 0.3}
            strokeDasharray={dashArr}
            strokeLinecap="round"
            filter={filterAttr}
          />
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   HUD BAR (unchanged)
   ═══════════════════════════════════════════════════════════ */
function HUDBar({
  playerName,
  level,
  points,
  zonesSecured,
  totalZones,
}: {
  playerName: string;
  level: number;
  points: number;
  zonesSecured: number;
  totalZones: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] px-4 py-2.5 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-[hsl(195_80%_70%)] font-bold">
          <Globe className="h-3.5 w-3.5" />
          OPERATIVE: <span className="text-white">{playerName}</span>
        </span>
        <span className="hidden sm:inline text-[hsl(195_80%_50%/0.3)]">|</span>
        <span className="hidden sm:flex items-center gap-1 text-[hsl(160_70%_60%)]">
          <Zap className="h-3.5 w-3.5" />
          LVL {level} · {points} XP
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-[hsl(195_80%_70%)]">
          <Shield className="h-3.5 w-3.5" />
          ZONES:{" "}
          <span className="font-bold text-white">
            {zonesSecured}/{totalZones}
          </span>
        </span>
        <span className="rounded-full bg-[hsl(45_90%_55%/0.15)] border border-[hsl(45_90%_55%/0.3)] px-2 py-0.5 text-[10px] font-bold text-[hsl(45_90%_65%)]">
          🛡️ GUARDIAN MODE
        </span>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WORLD DETAIL PANEL (preserved — no changes needed)
   ═══════════════════════════════════════════════════════════ */
function WorldDetailPanel({
  world,
  mission,
  missionProgress,
  learningMode,
  age,
  onClose,
  onStartLevel,
}: {
  world: (typeof CITY_NODES)[number];
  mission: (typeof MISSIONS)[number] | undefined;
  missionProgress: any[];
  learningMode: LearningMode;
  age: number;
  onClose: () => void;
  onStartLevel: (missionId: string, levelIndex: number) => void;
}) {
  if (world.isHub) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(45_90%_55%/0.25)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl bg-[hsl(45_80%_30%)]">
              🏠
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">CYBER HERO COMMAND // GLOBAL HQ</h2>
              <p className="text-xs text-[hsl(45_90%_65%)]">Your home base and training ground</p>
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
              <X className="h-5 w-5 text-white/50" />
            </button>
          </div>
          <p className="mb-5 text-sm text-white/70 leading-relaxed">
            Welcome, Guardian! This is your home base. Complete your orientation mission to unlock your first zone and
            begin protecting the digital world.
          </p>
          <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-[hsl(45_90%_55%/0.3)] bg-[hsl(45_90%_55%/0.08)] p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(45_80%_45%/0.2)] text-lg">
              🎯
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">OP: GUARDIAN ORIENTATION</p>
              <p className="text-[10px] text-white/40">Difficulty: ◆◇◇◇◇ · TUTORIAL</p>
              <p className="text-[10px] text-[hsl(45_90%_65%)]">+100 XP · Unlocks: Password Peak + Encrypt Enclave</p>
            </div>
          </div>
          <Button
            className="w-full text-sm font-bold bg-[hsl(45_90%_50%)] hover:bg-[hsl(45_90%_45%)] text-[hsl(210_40%_10%)] border-0 shadow-[0_0_20px_hsl(45_90%_50%/0.3)]"
            onClick={() => onStartLevel("password-safety", 0)}
          >
            🚀 BEGIN ORIENTATION
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  if (!mission) return null;

  const totalGames = getTotalGames(learningMode);
  const modeConfig = LEARNING_MODE_CONFIG[learningMode];
  const progressRow = missionProgress.find((p: any) => p.mission_id === mission.id);
  const completedGames = progressRow?.status === "completed" ? totalGames : (progressRow?.current_question ?? 0);
  const levels = getMissionLevels(mission, age, learningMode, completedGames);
  const STEP_LABELS = ["Mission 1", "Mission 2", "Boss Battle"];
  const STEP_ICONS = ["🎯", "⚔️", "🐉"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-lg rounded-t-3xl border-t border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_12%)] p-6 pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ background: `hsl(${world.hue} 70% 30%)` }}
          >
            {world.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{world.name}</h2>
            <p className="text-xs text-[hsl(195_60%_60%)]">
              {world.city} · {world.description}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <img src={mission.guide.image} alt={mission.guide.name} className="h-10 w-10 object-contain" />
          <div>
            <p className="text-xs font-bold text-white">{mission.guide.name}</p>
            <p className="text-[10px] text-white/50">Your guide for this zone</p>
          </div>
        </div>
        <div className="space-y-3">
          {levels.map((level, i) => {
            const levelStart = i * modeConfig.gamesPerLevel;
            const levelEnd = levelStart + modeConfig.gamesPerLevel;
            const levelCompleted = Math.min(Math.max(completedGames - levelStart, 0), modeConfig.gamesPerLevel);
            const levelDone = levelCompleted >= modeConfig.gamesPerLevel;
            const levelActive = completedGames >= levelStart && completedGames < levelEnd;
            const isLocked = level.locked;
            const isBoss = i === levels.length - 1;
            return (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  levelDone
                    ? "border-[hsl(160_65%_50%/0.4)] bg-[hsl(160_65%_50%/0.1)]"
                    : levelActive
                      ? "border-[hsl(195_80%_50%/0.4)] bg-[hsl(195_80%_50%/0.1)]"
                      : isLocked
                        ? "border-white/5 bg-white/[0.03] opacity-50"
                        : "border-white/5 bg-white/[0.03]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
                    levelDone ? "bg-[hsl(160_65%_50%/0.2)]" : levelActive ? "bg-[hsl(195_80%_50%/0.2)]" : "bg-white/5"
                  }`}
                >
                  {isLocked ? <Lock className="h-4 w-4 text-white/30" /> : <span>{STEP_ICONS[i]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{STEP_LABELS[i]}</p>
                    {isBoss && !isLocked && (
                      <span className="rounded-full bg-[hsl(0_80%_60%/0.2)] px-2 py-0.5 text-[9px] font-bold text-[hsl(0_80%_70%)]">
                        BOSS
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-white/40">
                    {level.name} · {levelCompleted}/{modeConfig.gamesPerLevel} games
                  </p>
                  <div className="mt-1 flex gap-1">
                    {level.miniGameTypes.slice(0, 3).map((type, j) => (
                      <span key={j} className="text-[10px]" title={MINI_GAME_META[type].label}>
                        {MINI_GAME_META[type].emoji}
                      </span>
                    ))}
                  </div>
                </div>
                {levelDone ? (
                  <div className="flex items-center gap-1 text-[hsl(160_65%_55%)]">
                    <Trophy className="h-4 w-4" />
                    <span className="text-xs font-bold">Done</span>
                  </div>
                ) : levelActive ? (
                  <Button
                    size="sm"
                    className="text-xs bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white border-0"
                    onClick={() => onStartLevel(mission.id, i)}
                  >
                    {completedGames > 0 ? "Continue" : isBoss ? "Fight!" : "Deploy"}{" "}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                ) : isLocked ? (
                  <Lock className="h-4 w-4 text-white/20" />
                ) : null}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-white/40">
          <span>
            {completedGames}/{totalGames} games completed
          </span>
          {progressRow?.status === "completed" && (
            <span className="flex items-center gap-1 font-bold text-[hsl(160_65%_55%)]">
              <Trophy className="h-3.5 w-3.5" /> Zone Secured!
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function MissionWorldMap() {
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mapRef = useRef<HTMLDivElement>(null);

  const [selectedWorld, setSelectedWorld] = useState<(typeof CITY_NODES)[number] | null>(null);
  const [hasClickedHQ, setHasClickedHQ] = useState(() => localStorage.getItem("cyber_hero_hq_clicked") === "true");
  const [pendingUnlocks, setPendingUnlocks] = useState<{ id: string; x: number; y: number; name: string }[]>([]);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/dashboard");
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

  const { data: missionProgress = [] } = useQuery({
    queryKey: ["mission_progress", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("mission_progress").select("*").eq("child_id", activeChildId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const hqCompleted = !!(child as any)?.hq_completed;
  const learningMode = ((child as any)?.learning_mode as LearningMode) || "standard";
  const level = child?.level ?? 1;
  const points = child?.points ?? 0;
  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const age = child?.age ?? 7;
  const playerName = child?.name ?? "Guardian";

  useEffect(() => {
    if (child && !avatarConfig?.heroSrc) navigate("/edit-avatar");
  }, [child, avatarConfig, navigate]);

  const missionIds = new Set(MISSIONS.map((m) => m.id));

  const nodeStatuses = useMemo(() => {
    const expectedTotal = getTotalGames(learningMode);
    const sequentialIds = [
      "password-safety",
      "scam-detection",
      "safe-websites",
      "personal-info",
      "malware-monsters",
      "smart-sharing",
      "phishy-messages",
    ];
    return CITY_NODES.map((node) => {
      if (node.isHub) return { status: "unlocked" as const, stars: 0 };
      if (!hqCompleted) {
        if (node.id === "password-safety" || node.id === "encrypt-enclave")
          return { status: "gated" as const, stars: 0 };
        return { status: "locked" as const, stars: 0 };
      }
      if (!missionIds.has(node.id)) return { status: "locked" as const, stars: 0 };
      const seqIndex = sequentialIds.indexOf(node.id);
      const progress = missionProgress.find(
        (p: any) => p.mission_id === node.id && (p.max_score ?? expectedTotal) === expectedTotal,
      );
      if (progress?.status === "completed")
        return { status: "completed" as const, stars: getStars(progress.score, progress.max_score) };
      if (seqIndex === 0) return { status: "unlocked" as const, stars: 0 };
      if (seqIndex > 0) {
        const prevDone = missionProgress.find(
          (p: any) => p.mission_id === sequentialIds[seqIndex - 1] && p.status === "completed",
        );
        return { status: prevDone ? ("unlocked" as const) : ("locked" as const), stars: 0 };
      }
      return { status: "locked" as const, stars: 0 };
    });
  }, [missionProgress, learningMode, hqCompleted]);

  const completedCount = nodeStatuses.filter((n) => n.status === "completed").length;
  const totalPlayable = CITY_NODES.filter((n) => missionIds.has(n.id)).length;

  // ── Story engine ──
  const story = useStoryEngine(activeChildId);

  // Trigger world intro on first load
  useEffect(() => {
    const t = setTimeout(() => story.triggerMapIntro(), 1000);
    return () => clearTimeout(t);
  }, []);

  // Zone name map for unlock labels
  const zoneNameMap = useMemo(() => Object.fromEntries(CITY_NODES.map((n) => [n.id, n.name])), []);

  // Get pixel position of a node relative to map container
  const getNodePos = useCallback((zoneId: string) => {
    if (!mapRef.current) return { x: 0, y: 0 };
    const el = mapRef.current.querySelector(`[data-zone="${zoneId}"]`);
    if (!el) return { x: 0, y: 0 };
    const mr = mapRef.current.getBoundingClientRect();
    const nr = el.getBoundingClientRect();
    return { x: nr.left - mr.left + nr.width / 2, y: nr.top - mr.top + nr.height / 2 };
  }, []);

  const handleNodeClick = (node: (typeof CITY_NODES)[number], index: number) => {
    if (node.isHub) {
      if (!hasClickedHQ) {
        setHasClickedHQ(true);
        localStorage.setItem("cyber_hero_hq_clicked", "true");
      }
      story.triggerIntro("cyberguard-academy", () => setSelectedWorld(node));
      return;
    }
    const { status } = nodeStatuses[index];
    if (status === "gated" || status === "locked") return;
    story.triggerIntro(node.id, () => setSelectedWorld(node));
  };

  const handleHQComplete = async () => {
    if (!activeChildId) return;
    await supabase
      .from("child_profiles")
      .update({ hq_completed: true } as any)
      .eq("id", activeChildId);
    queryClient.invalidateQueries({ queryKey: ["child", activeChildId] });
    setSelectedWorld(null);
    // Trigger HQ completion debrief
    story.triggerCompletion("cyberguard-academy", "Cyber Hero Command", (unlocked) => {
      const bursts = unlocked.map((id) => ({ id, name: zoneNameMap[id] ?? id, ...getNodePos(id) }));
      setPendingUnlocks(bursts);
    });
  };

  const handleStartLevel = (missionId: string, _levelIndex: number) => {
    if (selectedWorld?.isHub) {
      handleHQComplete();
      navigate(`/missions?mission=${missionId}`);
      return;
    }
    setSelectedWorld(null);
    navigate(`/missions?mission=${missionId}`);
  };

  // Call this from your mission completion screen when a zone is finished:
  // story.triggerCompletion(zoneId, zoneName, (unlocked) => { ... })
  // For now wired to a dev helper below.

  const selectedMission = selectedWorld ? MISSIONS.find((m) => m.id === selectedWorld.id) : undefined;

  return (
    <div
      className="min-h-screen pb-24 pt-20 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, hsl(220 45% 10%), hsl(210 50% 14%), hsl(200 40% 12%))" }}
    >
      {/* Starfield */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2.5 + 0.5,
              height: Math.random() * 2.5 + 0.5,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.05,
            }}
            animate={{ opacity: [0.05, 0.4, 0.05] }}
            transition={{ repeat: Infinity, duration: Math.random() * 4 + 2, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-6xl px-4">
        <HUDBar
          playerName={playerName}
          level={level}
          points={points}
          zonesSecured={completedCount}
          totalZones={totalPlayable}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-3 text-center"
        >
          <p className="text-xs text-[hsl(45_90%_65%/0.7)] font-medium">
            🏆 Secure all zones to earn your Cyber Guardian Certificate!
          </p>
        </motion.div>

        {/* MAP */}
        <div className="relative mx-auto w-full" style={{ aspectRatio: "16/10", maxWidth: "900px" }}>
          <div
            className="absolute inset-0 rounded-2xl border border-[hsl(195_80%_50%/0.15)] overflow-hidden shadow-2xl"
            style={{ background: "radial-gradient(ellipse at 50% 45%, hsl(210 50% 16% / 0.95), hsl(220 45% 10%))" }}
          >
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, hsl(195 80% 60%) 0.5px, transparent 0.5px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="absolute inset-[10%] rounded-full border border-[hsl(195_80%_50%/0.06)]" />
            <div className="absolute inset-[20%] rounded-full border border-[hsl(195_80%_50%/0.04)]" />
            <div className="absolute top-[45%] left-0 right-0 h-px bg-[hsl(195_80%_50%/0.04)]" />
            <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[hsl(195_80%_50%/0.04)]" />
          </div>

          <MapConnections statuses={nodeStatuses.map((n) => n.status)} hqCompleted={hqCompleted} />

          {/* Map container ref for unlock animation positioning */}
          <div ref={mapRef} className="absolute inset-0">
            {/* Unlock burst animations */}
            {pendingUnlocks.map((u) => (
              <UnlockBurst
                key={u.id}
                x={u.x}
                y={u.y}
                name={u.name}
                onDone={() => setPendingUnlocks((p) => p.filter((i) => i.id !== u.id))}
              />
            ))}

            {/* City Nodes */}
            {CITY_NODES.map((node, index) => {
              if (node.isHub) {
                return (
                  <motion.div
                    key={node.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="absolute z-20"
                    style={{ top: `${node.y}%`, left: `${node.x}%`, transform: "translate(-50%, -50%)" }}
                    data-zone={node.id}
                  >
                    {!hqCompleted && !hasClickedHQ && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, x: [0, 6, 0] }}
                        transition={{ x: { repeat: Infinity, duration: 1.2 }, opacity: { duration: 0.5 } }}
                        className="absolute -right-28 top-1/2 -translate-y-1/2 flex items-center gap-1 z-30"
                      >
                        <span className="text-[hsl(45_90%_60%)] text-lg">→</span>
                        <span className="rounded-full bg-[hsl(45_90%_55%/0.2)] border border-[hsl(45_90%_55%/0.4)] px-2.5 py-1 text-[10px] font-bold text-[hsl(45_90%_70%)] whitespace-nowrap shadow-[0_0_12px_hsl(45_90%_55%/0.2)]">
                          Start here!
                        </span>
                      </motion.div>
                    )}
                    <motion.button
                      onClick={() => handleNodeClick(node, index)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ repeat: Infinity, duration: 3.5 }}
                        className="absolute -inset-3 md:-inset-4 rounded-full border-2 border-[hsl(45_90%_55%/0.5)]"
                      />
                      <div
                        className="relative flex h-14 w-14 md:h-[68px] md:w-[68px] items-center justify-center rounded-full border-2 border-[hsl(45_90%_55%/0.6)] shadow-[0_0_30px_hsl(45_90%_55%/0.35)] backdrop-blur-md"
                        style={{ background: "radial-gradient(circle, hsl(45 85% 45% / 0.3), hsl(35 50% 18% / 0.9))" }}
                      >
                        <span className="text-2xl md:text-3xl drop-shadow-md">🏠</span>
                      </div>
                      <div className="mt-1.5 rounded-full bg-[hsl(45_90%_55%/0.15)] px-2.5 py-0.5 border border-[hsl(45_90%_55%/0.25)]">
                        <p className="text-[8px] md:text-[10px] font-bold text-[hsl(45_90%_70%)] whitespace-nowrap tracking-wide">
                          HQ — Cyber Hero Command
                        </p>
                      </div>
                      <p className="mt-0.5 text-[6px] md:text-[7px] text-[hsl(45_90%_60%/0.6)] whitespace-nowrap">
                        {hqCompleted ? "Home Base" : "Begin your mission here"}
                      </p>
                    </motion.button>
                  </motion.div>
                );
              }

              const { status, stars } = nodeStatuses[index];
              const isGated = status === "gated";
              const isClickable = status !== "locked" && status !== "gated";
              const hasMission = missionIds.has(node.id);
              const isCurrentTarget = status === "unlocked" && hasMission;

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.06, type: "spring", stiffness: 180 }}
                  className="absolute z-10"
                  style={{ top: `${node.y}%`, left: `${node.x}%`, transform: "translate(-50%, -50%)" }}
                  data-zone={node.id}
                >
                  <motion.button
                    onClick={() => handleNodeClick(node, index)}
                    disabled={!isClickable}
                    whileHover={isClickable ? { scale: 1.12 } : {}}
                    whileTap={isClickable ? { scale: 0.93 } : {}}
                    className={`group relative flex flex-col items-center transition-all ${
                      status === "locked"
                        ? "opacity-30 cursor-not-allowed"
                        : isGated
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                    }`}
                  >
                    {isCurrentTarget && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -inset-2 rounded-full border border-[hsl(195_80%_50%/0.5)]"
                      />
                    )}
                    {isGated && (
                      <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="absolute -inset-1.5 rounded-full border border-[hsl(45_90%_55%/0.4)]"
                      />
                    )}
                    <div
                      className={`relative flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 text-lg md:text-xl transition-all duration-200 ${
                        status === "completed"
                          ? "border-[hsl(160_65%_50%/0.6)] shadow-[0_0_18px_hsl(160_65%_50%/0.35)]"
                          : status === "unlocked"
                            ? `border-[hsl(${node.hue}_70%_55%/0.6)] shadow-[0_0_18px_hsl(${node.hue}_70%_55%/0.25)]`
                            : isGated
                              ? "border-[hsl(45_90%_55%/0.3)]"
                              : "border-white/10"
                      }`}
                      style={{
                        background:
                          status === "locked"
                            ? "hsl(220 30% 18%)"
                            : isGated
                              ? "hsl(35 30% 18%)"
                              : `radial-gradient(circle, hsl(${node.hue} 60% 35%), hsl(${node.hue} 50% 20%))`,
                      }}
                    >
                      {status === "locked" || isGated ? (
                        <Lock className={`h-4 w-4 ${isGated ? "text-[hsl(45_90%_55%/0.4)]" : "text-white/20"}`} />
                      ) : status === "completed" ? (
                        <span className="text-sm">✅</span>
                      ) : (
                        <span className="drop-shadow-md">{node.icon}</span>
                      )}
                    </div>
                    {status === "completed" && stars > 0 && (
                      <div className="mt-0.5 flex gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`h-2.5 w-2.5 ${s <= stars ? "text-[hsl(45_90%_60%)] fill-[hsl(45_90%_60%)]" : "text-white/15"}`}
                          />
                        ))}
                      </div>
                    )}
                    <div
                      className={`mt-1 rounded-md px-1.5 py-0.5 backdrop-blur-sm ${status === "locked" || isGated ? "bg-white/[0.03]" : "bg-[hsl(210_40%_14%/0.8)]"}`}
                    >
                      <p
                        className={`text-[7px] md:text-[9px] font-bold leading-tight whitespace-nowrap tracking-wide ${
                          status === "locked"
                            ? "text-white/20"
                            : isGated
                              ? "text-[hsl(45_90%_55%/0.4)]"
                              : "text-white/80"
                        }`}
                      >
                        {node.name}
                      </p>
                      <p
                        className={`text-[6px] md:text-[7px] leading-tight whitespace-nowrap ${status === "locked" || isGated ? "text-white/10" : "text-white/30"}`}
                      >
                        {node.city}
                      </p>
                    </div>
                    {isCurrentTarget && (
                      <motion.span
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="mt-0.5 text-[7px] md:text-[9px] font-bold text-[hsl(195_80%_60%)] tracking-widest"
                      >
                        ▶ DEPLOY
                      </motion.span>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/40"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)]" /> ⭐ HQ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(195_80%_50%)] animate-pulse" /> 🔵 Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[hsl(160_65%_50%)]" /> 🟢 Secured
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10 border border-white/10" /> ⚫ Locked
          </span>
          <span className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-[hsl(45_90%_60%)]" /> 📶 Coming Soon
          </span>
        </motion.div>
      </div>

      {/* Ambient bubble — shows when no cutscene active */}
      <AnimatePresence>
        {story.ambientLine && !story.cutscene && !story.completion && (
          <AmbientBubble line={story.ambientLine} avatarConfig={avatarConfig} playerName={playerName} />
        )}
      </AnimatePresence>

      {/* Cutscene player */}
      <AnimatePresence>
        {story.cutscene && (
          <CutscenePlayer
            lines={story.cutscene.lines}
            index={story.cutscene.index}
            onAdvance={story.advanceCutscene}
            onSkip={story.skipCutscene}
            avatarConfig={avatarConfig}
            playerName={playerName}
          />
        )}
      </AnimatePresence>

      {/* Zone completion panel */}
      <AnimatePresence>
        {story.completion && (
          <ZoneCompletionPanel
            zoneName={story.completion.zoneName}
            lines={story.completion.lines}
            index={story.completion.index}
            xp={story.completion.xp}
            badge={story.completion.badge}
            unlocks={story.completion.unlocks}
            zoneNameMap={zoneNameMap}
            onAdvance={story.advanceCompletion}
            onSkip={story.skipCompletion}
            avatarConfig={avatarConfig}
            playerName={playerName}
          />
        )}
      </AnimatePresence>

      {/* World detail panel */}
      <AnimatePresence>
        {selectedWorld && (
          <WorldDetailPanel
            world={selectedWorld}
            mission={selectedMission}
            missionProgress={missionProgress}
            learningMode={learningMode}
            age={age}
            onClose={() => setSelectedWorld(null)}
            onStartLevel={handleStartLevel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HOW TO TRIGGER ZONE COMPLETION FROM YOUR MISSION PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When a player finishes all games in a zone, on your missions
page after writing to Supabase, navigate back to the map
with a query param:

  navigate(`/world-map?completed=${missionId}`);

Then in this component add a useEffect:

  const completedZoneId = new URLSearchParams(window.location.search).get("completed");
  useEffect(() => {
    if (!completedZoneId) return;
    const node = CITY_NODES.find(n => n.id === completedZoneId);
    if (!node) return;
    story.triggerCompletion(completedZoneId, node.name, (unlocked) => {
      const bursts = unlocked.map(id => ({ id, name: zoneNameMap[id] ?? id, ...getNodePos(id) }));
      setPendingUnlocks(bursts);
    });
  }, [completedZoneId]);
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
