import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getContinentById, type ContinentDef, type ZoneDef } from "@/data/continents";
import { getZoneGames, getBossBattle } from "@/data/zoneGames";
import HeroAvatar from "@/components/avatar/HeroAvatar";
import VillainSprite from "@/components/world/VillainSprite";
import StarfieldBackground from "@/components/world/StarfieldBackground";
import { Button } from "@/components/ui/button";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { GEO_URL, CONTINENT_COUNTRIES, CONTINENT_PROJECTIONS, ZONE_COORDINATES } from "@/data/continentMapConfig";

import keybreakerImg from "@/assets/villains/keybreaker.png";
import phisherKingImg from "@/assets/villains/phisher-king.png";
import firewallPhantomImg from "@/assets/villains/firewall-phantom.png";
import dataThiefImg from "@/assets/villains/data-thief.png";
import malwareMaxImg from "@/assets/villains/malware-max.png";
import shadowbyteImg from "@/assets/villains/shadowbyte.png";
import trollLordImg from "@/assets/villains/troll-lord.png";

/* ═══════════════════════════════════════════════════════════
   UNLOCK LOGIC
   ═══════════════════════════════════════════════════════════ */
const NA_UNLOCK_ORDER = [
  "hq",
  "pixel-port",
  "signal-summit",
  "code-canyon",
  "encrypt-enclave",
  "password-peak",
  "arctic-archive",
  "shadow-station",
  "firewall-fortress",
  "boss-keybreaker",
];

function getZoneStatus(
  zone: ZoneDef,
  allZones: ZoneDef[],
  zoneProgress: any[],
  continentId: string,
): "completed" | "available" | "locked" {
  const progress = zoneProgress.find((p) => p.zone_id === zone.id);
  if (progress?.status === "completed") return "completed";

  if (continentId === "north-america") {
    const idx = NA_UNLOCK_ORDER.indexOf(zone.id);
    if (idx === 0) return "available";
    if (idx < 0) return "locked";
    const prevId = NA_UNLOCK_ORDER[idx - 1];
    const prevDone = zoneProgress.find((p) => p.zone_id === prevId && p.status === "completed");
    return prevDone ? "available" : "locked";
  }

  if (zone.isBoss) {
    const nonBoss = allZones.filter((z) => !z.isBoss);
    const allDone = nonBoss.every((z) => zoneProgress.find((p) => p.zone_id === z.id && p.status === "completed"));
    return allDone ? "available" : "locked";
  }
  const i = allZones.indexOf(zone);
  if (i === 0) return "available";
  const prev = allZones[i - 1];
  const prevDone = zoneProgress.find((p) => p.zone_id === prev.id && p.status === "completed");
  return prevDone ? "available" : "locked";
}

/* ═══════════════════════════════════════════════════════════
   STORY SCRIPTS — ALL 7 CONTINENTS
   ═══════════════════════════════════════════════════════════ */
type SpeakerRole = "guide" | "villain";
interface DialogueLine {
  speaker: SpeakerRole;
  text: string;
}
interface ZoneStoryScript {
  intro: DialogueLine[];
  completion: DialogueLine[];
  xp: number;
  badge?: string;
}

/* ── Map intro per continent ────────────────────────── */
const CONTINENT_MAP_INTROS: Record<string, DialogueLine[]> = {
  "north-america": [
    { speaker: "villain", text: "Heh heh heh… No password can stop me! I've cracked them ALL, Guardian!" },
    { speaker: "guide", text: "Guardian — the Keybreaker has broken into systems across North America." },
    { speaker: "guide", text: "Start at HQ and begin your training. The Digital World is counting on you!" },
  ],
  europe: [
    { speaker: "villain", text: "Click the link, Guardian… I dare you! Every email is a trap I've set for you! 🎣" },
    { speaker: "guide", text: "The Phisher King has flooded Europe with fake emails and phishing traps." },
    { speaker: "guide", text: "People are falling for his tricks every minute. We need to stop him — starting now!" },
  ],
  africa: [
    { speaker: "villain", text: "I'll make everyone feel terrible online! Misery is my greatest weapon, Guardian!" },
    { speaker: "guide", text: "The Troll Lord's army is spreading cyberbullying and hate across Africa's networks." },
    { speaker: "guide", text: "Kindness is the most powerful shield there is. Let's take the fight to him!" },
  ],
  asia: [
    { speaker: "villain", text: "Your firewalls mean nothing to me. I've already been inside your system! 👻" },
    { speaker: "guide", text: "The Firewall Phantom is a ghost in Asia's networks — invisible and dangerous." },
    { speaker: "guide", text: "You'll need to use everything you know about privacy, firewalls, and encryption!" },
  ],
  "south-america": [
    { speaker: "villain", text: "Your data is MINE! Name, address, everything — I've got it all, Guardian!" },
    { speaker: "guide", text: "The Data Thief has been stealing personal information from kids across South America." },
    { speaker: "guide", text: "Learn to protect your identity and personal information — before it's too late!" },
  ],
  australia: [
    { speaker: "villain", text: "My viruses are EVERYWHERE, mate! Your device doesn't stand a chance!" },
    { speaker: "guide", text: "Malware Max has unleashed a swarm of viruses across Australia's devices." },
    { speaker: "guide", text: "Use your antivirus knowledge and safe download skills to clean up the damage!" },
  ],
  antarctica: [
    { speaker: "villain", text: "Impressive that you made it this far, Guardian. But you've never faced ME." },
    { speaker: "guide", text: "SHADOWBYTE is every cyber threat combined — the ultimate final challenge." },
    { speaker: "guide", text: "Use every skill you've learned across all six continents. This is it, Guardian!" },
  ],
};

/* ── Zone scripts per continent ─────────────────────── */
const ALL_ZONE_SCRIPTS: Record<string, Record<string, ZoneStoryScript>> = {
  /* ── NORTH AMERICA ── */
  "north-america": {
    hq: {
      xp: 100,
      badge: "CyberGuardian Recruit",
      intro: [
        { speaker: "guide", text: "Welcome to Cyber Hero Command! This is where every Guardian's journey begins." },
        { speaker: "villain", text: "A training room? While you study, I'll crack every account in the city…" },
        { speaker: "guide", text: "Ignore him. Complete your orientation to unlock your first mission!" },
      ],
      completion: [
        { speaker: "guide", text: "Orientation complete — you're officially a CyberGuardian recruit!" },
        { speaker: "guide", text: "Pixel Port in Los Angeles is now unlocked. Time to deploy!" },
        { speaker: "villain", text: "One city. There are thousands more. Enjoy this tiny victory…" },
      ],
    },
    "pixel-port": {
      xp: 150,
      badge: "Digital Balance Badge",
      intro: [
        { speaker: "villain", text: "Pixel Port — my favourite hunting ground. These kids have no idea!" },
        {
          speaker: "guide",
          text: "Teach them about digital balance and online safety. A healthy Guardian is a powerful one!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Pixel Port is secure! The kids here know how to balance their digital lives." },
        { speaker: "guide", text: "Digital Balance Badge earned! Signal Summit in Denver is now unlocked." },
      ],
    },
    "signal-summit": {
      xp: 175,
      badge: "WiFi Watchdog Badge",
      intro: [
        {
          speaker: "villain",
          text: "All your WiFi passwords are mine! Every café, every hotel — I own their networks!",
        },
        { speaker: "guide", text: "Learn to spot safe versus fake networks. Secure the relay stations!" },
      ],
      completion: [
        { speaker: "guide", text: "Signal Summit is clean! The Keybreaker's fake hotspots are destroyed." },
        { speaker: "guide", text: "WiFi Watchdog Badge earned! Code Canyon in Chicago is now open." },
      ],
    },
    "code-canyon": {
      xp: 200,
      badge: "Scam Spotter Badge",
      intro: [
        { speaker: "villain", text: "Act NOW or your account will be DELETED! Panic makes people careless…" },
        { speaker: "guide", text: "Slow down, think carefully, spot the scam. That's your mission here." },
      ],
      completion: [
        { speaker: "guide", text: "Code Canyon secured! Chicago's residents can now spot a scam anywhere." },
        { speaker: "guide", text: "Scam Spotter Badge earned! Encrypt Enclave in Toronto is now unlocked." },
      ],
    },
    "encrypt-enclave": {
      xp: 225,
      badge: "Code Breaker Badge",
      intro: [
        {
          speaker: "villain",
          text: "Your encryption is useless! I've cracked stronger codes than anything you can build!",
        },
        { speaker: "guide", text: "Master encryption and prove that strong codes are truly unbreakable!" },
      ],
      completion: [
        { speaker: "guide", text: "Encrypt Enclave is secure! The decryption bots are destroyed." },
        { speaker: "guide", text: "Code Breaker Badge earned! Password Peak in New York is now unlocked." },
      ],
    },
    "password-peak": {
      xp: 250,
      badge: "Password Master Badge",
      intro: [
        { speaker: "villain", text: "password123… fluffy… mybirthday… Your passwords are embarrassingly easy!" },
        { speaker: "guide", text: "Every strong password you create is a lock he can't pick. Build the fortress!" },
      ],
      completion: [
        { speaker: "guide", text: "Password Peak is ours! The Keybreaker's credential database is destroyed." },
        { speaker: "villain", text: "My passwords… YEARS of work! You'll pay for this, Guardian!" },
        { speaker: "guide", text: "Password Master Badge earned! Arctic Archive is now unlocked." },
      ],
    },
    "arctic-archive": {
      xp: 275,
      badge: "Data Guardian Badge",
      intro: [
        { speaker: "villain", text: "Cold storage won't save your secrets forever. My bots never get cold…" },
        { speaker: "guide", text: "Learn the 3-2-1 backup rule and protect the Archive!" },
      ],
      completion: [
        { speaker: "guide", text: "Arctic Archive is safe! Every backup is secured." },
        { speaker: "guide", text: "Data Guardian Badge earned! Shadow Station in Mexico City is now open." },
      ],
    },
    "shadow-station": {
      xp: 275,
      badge: "Game Guardian Badge",
      intro: [
        { speaker: "villain", text: "Want free in-game items? Just give me your password… such a simple trap." },
        { speaker: "guide", text: "Help kids here learn who to trust in online games!" },
      ],
      completion: [
        { speaker: "guide", text: "Shadow Station is clear! The fake gaming networks are shut down." },
        { speaker: "guide", text: "Game Guardian Badge earned! Firewall Fortress in Atlanta is now unlocked." },
      ],
    },
    "firewall-fortress": {
      xp: 300,
      badge: "Firewall Builder Badge",
      intro: [
        { speaker: "villain", text: "Your firewalls are useless against me! I phase right through them!" },
        { speaker: "guide", text: "Build the strongest firewall you can — then we go after the Keybreaker himself!" },
      ],
      completion: [
        { speaker: "guide", text: "Firewall Fortress is holding! The Keybreaker can't get through anymore." },
        { speaker: "guide", text: "Firewall Builder Badge earned. One zone left — the Keybreaker's Vault!" },
      ],
    },
    "boss-keybreaker": {
      xp: 500,
      badge: "North America Champion",
      intro: [
        { speaker: "guide", text: "This is it, Guardian. The Keybreaker's Vault — his true stronghold." },
        { speaker: "villain", text: "Welcome to my domain. No one leaves the Vault with their data intact." },
        { speaker: "guide", text: "You've trained for this. Go show him what a true CyberGuardian can do!" },
      ],
      completion: [
        { speaker: "villain", text: "I… I don't believe it. No Guardian has ever defeated me. It's over." },
        { speaker: "guide", text: "GUARDIAN! You did it! North America is free!" },
        { speaker: "guide", text: "North America Champion Badge earned! The Phisher King stirs in Europe…" },
      ],
    },
  },

  /* ── EUROPE ── */
  europe: {
    "phish-lagoon": {
      xp: 150,
      badge: "Phish Spotter Badge",
      intro: [
        { speaker: "villain", text: "Click the link… it's from your bank, I promise! 🎣 Heh heh heh…" },
        {
          speaker: "guide",
          text: "Phish Lagoon is crawling with fake emails. Learn to spot every one of the Phisher King's traps!",
        },
      ],
      completion: [
        {
          speaker: "guide",
          text: "Phish Lagoon is clear! The people of London can now spot a phishing email instantly.",
        },
        { speaker: "guide", text: "Phish Spotter Badge earned! Download Dungeon in Berlin is now unlocked." },
      ],
    },
    "download-dungeon": {
      xp: 175,
      badge: "Safe Download Badge",
      intro: [
        { speaker: "villain", text: "Free games! Free movies! Download everything… and let my malware in! 😈" },
        {
          speaker: "guide",
          text: "Only download from official sources. Never click suspicious links. Let's clean this dungeon out!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Download Dungeon cleared! Every piece of malware has been destroyed." },
        { speaker: "guide", text: "Safe Download Badge earned! Code Castle in Paris is now unlocked." },
      ],
    },
    "code-castle": {
      xp: 200,
      badge: "2FA Champion Badge",
      intro: [
        { speaker: "villain", text: "Stolen your password already… but wait, what's this 2FA code? Curse you!" },
        {
          speaker: "guide",
          text: "Two-factor authentication stops hackers even when they have your password. Master it!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Code Castle is secured! Two-factor authentication is now protecting everyone." },
        { speaker: "guide", text: "2FA Champion Badge earned! WiFi Watch in Oslo is now open." },
      ],
    },
    "wifi-watch": {
      xp: 200,
      badge: "Network Guardian Badge",
      intro: [
        { speaker: "villain", text: "Connect to my free WiFi… I'll intercept everything you send! 📶" },
        { speaker: "guide", text: "Public WiFi is dangerous. Learn to spot safe networks and protect your data!" },
      ],
      completion: [
        { speaker: "guide", text: "WiFi Watch secured! Oslo's networks are clean and safe again." },
        { speaker: "guide", text: "Network Guardian Badge earned! Data Fortress in Budapest is now unlocked." },
      ],
    },
    "data-fortress": {
      xp: 225,
      badge: "Data Defender Badge",
      intro: [
        { speaker: "villain", text: "Your personal data… address, birthday, school — all mine now!" },
        {
          speaker: "guide",
          text: "The Phisher King is harvesting personal data. Learn what to share and what to protect!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Data Fortress is secure! Personal information is protected across Hungary." },
        { speaker: "guide", text: "Data Defender Badge earned! Cyber Citadel in Madrid is now unlocked." },
      ],
    },
    "cyber-citadel": {
      xp: 250,
      badge: "Cyber Shield Badge",
      intro: [
        { speaker: "villain", text: "The citadel falls to me! Every defence you build, I tear down!" },
        {
          speaker: "guide",
          text: "This is the Phisher King's last foothold before his lair. Hold the line, Guardian!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Cyber Citadel is ours! The Phisher King is cornered." },
        { speaker: "guide", text: "Cyber Shield Badge earned! The Phisher King's Lair in Rome is now unlocked!" },
      ],
    },
    "boss-phisher": {
      xp: 500,
      badge: "Europe Champion",
      intro: [
        { speaker: "guide", text: "The Phisher King's Lair — Rome, Italy. His operation ends here." },
        {
          speaker: "villain",
          text: "One last link to click, Guardian… and everything you've built comes crashing down.",
        },
        { speaker: "guide", text: "Don't click anything he offers. Use everything you know. Let's finish this!" },
      ],
      completion: [
        { speaker: "villain", text: "My phishing empire… ruined! How did you see through every trap?!" },
        { speaker: "guide", text: "Europe is free! The Phisher King's nets are empty!" },
        { speaker: "guide", text: "Europe Champion Badge earned! The Troll Lord awaits in Africa…" },
      ],
    },
  },

  /* ── AFRICA ── */
  africa: {
    "stranger-shore": {
      xp: 150,
      badge: "Stranger Safety Badge",
      intro: [
        { speaker: "villain", text: "Trust me, little Guardian… I'm your friend! Tell me where you live!" },
        {
          speaker: "guide",
          text: "Stranger Shore is full of online predators pretending to be friends. Teach kids who to trust!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Stranger Shore is safe! Everyone here now knows how to handle online strangers." },
        { speaker: "guide", text: "Stranger Safety Badge earned! Dark Web Den in Cairo is now unlocked." },
      ],
    },
    "dark-web-den": {
      xp: 175,
      badge: "Shadow Buster Badge",
      intro: [
        { speaker: "villain", text: "The dark web is MY domain, Guardian. You don't belong here!" },
        { speaker: "guide", text: "The Troll Lord hides his worst operations here. Shine light into the shadows!" },
      ],
      completion: [
        { speaker: "guide", text: "Dark Web Den exposed! The Troll Lord's secret operation is shut down." },
        { speaker: "guide", text: "Shadow Buster Badge earned! Kindness Citadel in Nairobi is now unlocked." },
      ],
    },
    "kindness-citadel": {
      xp: 200,
      badge: "Kindness Champion Badge",
      intro: [
        { speaker: "villain", text: "I'll make everyone feel terrible! Nobody can stop my trolls!" },
        { speaker: "guide", text: "Be an upstander, not a bystander. Kindness is the most powerful shield there is!" },
      ],
      completion: [
        {
          speaker: "guide",
          text: "Kindness Citadel is glowing! The trolls have been driven out by courage and kindness.",
        },
        { speaker: "guide", text: "Kindness Champion Badge earned! Signal Savanna in Accra is now open." },
      ],
    },
    "signal-savanna": {
      xp: 200,
      badge: "Signal Safe Badge",
      intro: [
        { speaker: "villain", text: "My troll signals spread across the savanna! Nothing can stop them!" },
        { speaker: "guide", text: "The Troll Lord is using fake signals to spread misinformation. Let's stop them!" },
      ],
      completion: [
        { speaker: "guide", text: "Signal Savanna is clear! Accra's networks are troll-free." },
        { speaker: "guide", text: "Signal Safe Badge earned! Code Cape in Cape Town is now unlocked." },
      ],
    },
    "code-cape": {
      xp: 225,
      badge: "Code Cape Badge",
      intro: [
        { speaker: "villain", text: "The Cape of Good Hacking — that's what I call it now! Heh heh heh!" },
        { speaker: "guide", text: "The Troll Lord has corrupted Cape Town's systems. Time to clean them up!" },
      ],
      completion: [
        { speaker: "guide", text: "Code Cape is secured! Cape Town's systems are running clean again." },
        { speaker: "guide", text: "Code Cape Badge earned! Data Delta in Addis Ababa is now unlocked." },
      ],
    },
    "data-delta": {
      xp: 250,
      badge: "Data Delta Badge",
      intro: [
        { speaker: "villain", text: "Data flows through me now! Every byte in the Delta is mine!" },
        {
          speaker: "guide",
          text: "The Data Delta is the Troll Lord's last stronghold before his bridge. Clear it out!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Data Delta cleared! The Troll Lord is running out of places to hide." },
        { speaker: "guide", text: "Data Delta Badge earned! The Troll Lord's Bridge in the Sahara is now unlocked!" },
      ],
    },
    "boss-troll": {
      xp: 500,
      badge: "Africa Champion",
      intro: [
        {
          speaker: "guide",
          text: "The Troll Lord's Bridge — the Sahara Desert. His reign of online cruelty ends here.",
        },
        { speaker: "villain", text: "You want to cross MY bridge, Guardian? You'll have to defeat every troll first!" },
        { speaker: "guide", text: "Kindness, courage, and everything you've learned. Let's bring him down!" },
      ],
      completion: [
        { speaker: "villain", text: "My trolls… scattered! How did a little Guardian defeat them all?!" },
        { speaker: "guide", text: "Africa is free! The Troll Lord's bridge is destroyed!" },
        { speaker: "guide", text: "Africa Champion Badge earned! The Firewall Phantom haunts Asia…" },
      ],
    },
  },

  /* ── ASIA ── */
  asia: {
    "privacy-palace": {
      xp: 150,
      badge: "Privacy Pro Badge",
      intro: [
        { speaker: "villain", text: "Your app permissions are open doors to me. Every app you install… I'm watching!" },
        { speaker: "guide", text: "Learn to manage app permissions. Not every app needs access to everything!" },
      ],
      completion: [
        { speaker: "guide", text: "Privacy Palace is secured! App permissions are locked down across Dubai." },
        { speaker: "guide", text: "Privacy Pro Badge earned! Browse Bazaar in Mumbai is now unlocked." },
      ],
    },
    "browse-bazaar": {
      xp: 175,
      badge: "Safe Browser Badge",
      intro: [
        {
          speaker: "villain",
          text: "Every link in this bazaar leads somewhere dangerous. Click wisely… or not at all!",
        },
        {
          speaker: "guide",
          text: "Learn to spot safe websites, check for HTTPS, and never enter info on suspicious sites!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Browse Bazaar is safe! Mumbai's web users can now navigate safely." },
        { speaker: "guide", text: "Safe Browser Badge earned! Firewall Frontier in Seoul is now unlocked." },
      ],
    },
    "firewall-frontier": {
      xp: 200,
      badge: "Firewall Master Badge",
      intro: [
        {
          speaker: "villain",
          text: "I phase through firewalls like they're not even there. Because for me — they aren't!",
        },
        {
          speaker: "guide",
          text: "Seoul's firewalls are under attack. Learn how to build ones even a phantom can't phase through!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Firewall Frontier is holding! The Phantom can't breach Seoul's defences." },
        { speaker: "guide", text: "Firewall Master Badge earned! CyberGuard Academy in Tokyo is now unlocked." },
      ],
    },
    "cyberguard-academy": {
      xp: 225,
      badge: "Academy Honours Badge",
      intro: [
        { speaker: "villain", text: "An academy? I've already hacked the teacher's password! The irony…" },
        { speaker: "guide", text: "CyberGuard Academy is the heart of cyber defence in Asia. Protect it!" },
      ],
      completion: [
        { speaker: "guide", text: "CyberGuard Academy is secured! Tokyo's cyber defenders are stronger than ever." },
        { speaker: "guide", text: "Academy Honours Badge earned! Network Nexus in Singapore is now unlocked." },
      ],
    },
    "network-nexus": {
      xp: 225,
      badge: "Network Nexus Badge",
      intro: [
        { speaker: "villain", text: "Singapore's network nexus is mine. Every packet of data flows through ME!" },
        { speaker: "guide", text: "The Phantom controls the Network Nexus. Cut his connection and take it back!" },
      ],
      completion: [
        { speaker: "guide", text: "Network Nexus secured! Singapore's data flows safely again." },
        { speaker: "guide", text: "Network Nexus Badge earned! Hack Haven in Bangkok is now unlocked." },
      ],
    },
    "hack-haven": {
      xp: 250,
      badge: "Ethical Hacker Badge",
      intro: [
        {
          speaker: "villain",
          text: "Bangkok's Hack Haven — where all the best exploits are born. Welcome to my workshop!",
        },
        {
          speaker: "guide",
          text: "This is where the Phantom plans his attacks. Learn ethical hacking to shut him down!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Hack Haven cleared! The Phantom's workshop is destroyed." },
        { speaker: "guide", text: "Ethical Hacker Badge earned! Tech Temple in Beijing is now unlocked." },
      ],
    },
    "tech-temple": {
      xp: 275,
      badge: "Tech Temple Badge",
      intro: [
        { speaker: "villain", text: "The Tech Temple — ancient wisdom, modern hacking. Both are mine now!" },
        { speaker: "guide", text: "The Phantom's last stronghold before his Mainframe. Clear it and we end this!" },
      ],
      completion: [
        { speaker: "guide", text: "Tech Temple secured! The Phantom is retreating to his Mainframe." },
        {
          speaker: "guide",
          text: "Tech Temple Badge earned! The Phantom's Mainframe in the Himalayas is now unlocked!",
        },
      ],
    },
    "boss-phantom": {
      xp: 500,
      badge: "Asia Champion",
      intro: [
        { speaker: "guide", text: "The Phantom's Mainframe — hidden deep in the Himalayas. This is the final battle." },
        { speaker: "villain", text: "You can't fight what you can't see, Guardian. And you… can't see me." },
        {
          speaker: "guide",
          text: "Use encryption, firewalls, and everything you've learned. Make him visible — and defeat him!",
        },
      ],
      completion: [
        { speaker: "villain", text: "Impossible… I was a ghost. No one can catch a ghost… how?!" },
        { speaker: "guide", text: "Asia is free! The Firewall Phantom has been locked out of every system!" },
        { speaker: "guide", text: "Asia Champion Badge earned! The Data Thief operates in South America…" },
      ],
    },
  },

  /* ── SOUTH AMERICA ── */
  "south-america": {
    "kindness-kingdom": {
      xp: 150,
      badge: "Social Safety Badge",
      intro: [
        { speaker: "villain", text: "Social media is MY playground. Every post, every photo — I'm collecting it all!" },
        { speaker: "guide", text: "São Paulo's social networks are being harvested. Learn social media safety!" },
      ],
      completion: [
        { speaker: "guide", text: "Kindness Kingdom secured! Kids in São Paulo are posting safely." },
        { speaker: "guide", text: "Social Safety Badge earned! Social Fortress in Buenos Aires is now unlocked." },
      ],
    },
    "social-fortress": {
      xp: 175,
      badge: "Personal Data Badge",
      intro: [
        { speaker: "villain", text: "Your name, address, birthday — I have it all! Identity theft is so easy…" },
        { speaker: "guide", text: "The Data Thief is stealing personal information. Learn what to keep private!" },
      ],
      completion: [
        { speaker: "guide", text: "Social Fortress secured! Personal information is protected across Buenos Aires." },
        { speaker: "guide", text: "Personal Data Badge earned! Identity Isle in Lima is now unlocked." },
      ],
    },
    "identity-isle": {
      xp: 200,
      badge: "Identity Shield Badge",
      intro: [
        { speaker: "villain", text: "I'm you now, Guardian. Same name, same details. How does it feel?!" },
        { speaker: "guide", text: "Identity theft is the Data Thief's speciality. Learn to protect your identity!" },
      ],
      completion: [
        {
          speaker: "guide",
          text: "Identity Isle cleared! No more fake accounts stealing people's identities in Lima.",
        },
        { speaker: "guide", text: "Identity Shield Badge earned! Jungle Junction in Bogotá is now unlocked." },
      ],
    },
    "jungle-junction": {
      xp: 225,
      badge: "Jungle Junction Badge",
      intro: [
        { speaker: "villain", text: "Lost in the data jungle, Guardian? Every path leads to MY trap!" },
        { speaker: "guide", text: "The Data Thief has hidden traps all through Bogotá's networks. Navigate safely!" },
      ],
      completion: [
        { speaker: "guide", text: "Jungle Junction cleared! Bogotá's networks are trap-free." },
        { speaker: "guide", text: "Jungle Junction Badge earned! Cyber Coast in Santiago is now unlocked." },
      ],
    },
    "cyber-coast": {
      xp: 250,
      badge: "Cyber Coast Badge",
      intro: [
        { speaker: "villain", text: "Santiago's coastline is where I offload all my stolen data. You're too late!" },
        { speaker: "guide", text: "The Data Thief's last stop before his vault. Intercept the stolen data here!" },
      ],
      completion: [
        { speaker: "guide", text: "Cyber Coast cleared! The stolen data shipment has been stopped." },
        { speaker: "guide", text: "Cyber Coast Badge earned! The Data Thief's Vault in the Amazon is now unlocked!" },
      ],
    },
    "boss-datathief": {
      xp: 500,
      badge: "South America Champion",
      intro: [
        {
          speaker: "guide",
          text: "The Data Thief's Vault — deep in the Amazon Rainforest. All the stolen data is here.",
        },
        { speaker: "villain", text: "You came all this way just to lose to me? Bold move, little Guardian." },
        {
          speaker: "guide",
          text: "Everything you know about data protection, privacy, and identity. Use it all — now!",
        },
      ],
      completion: [
        { speaker: "villain", text: "My vault… my data… all gone! You've ruined everything!" },
        { speaker: "guide", text: "South America is free! Every piece of stolen data has been returned!" },
        { speaker: "guide", text: "South America Champion Badge earned! Malware Max has invaded Australia…" },
      ],
    },
  },

  /* ── AUSTRALIA ── */
  australia: {
    "malware-maze": {
      xp: 150,
      badge: "Virus Hunter Badge",
      intro: [
        { speaker: "villain", text: "Welcome to my maze, mate! Full of viruses, trojans, and ransomware! 🦘" },
        { speaker: "guide", text: "Navigate the Malware Maze carefully. Learn to identify every type of malware!" },
      ],
      completion: [
        { speaker: "guide", text: "Malware Maze cleared! Sydney's devices are virus-free." },
        { speaker: "guide", text: "Virus Hunter Badge earned! Update Outpost in Melbourne is now unlocked." },
      ],
    },
    "update-outpost": {
      xp: 175,
      badge: "Update Champion Badge",
      intro: [
        { speaker: "villain", text: "Outdated software is my best friend! Every missed update is a door I can open!" },
        { speaker: "guide", text: "Software updates patch the holes Malware Max exploits. Keep everything updated!" },
      ],
      completion: [
        { speaker: "guide", text: "Update Outpost secured! Melbourne's devices are all up to date." },
        { speaker: "guide", text: "Update Champion Badge earned! Antivirus Atoll in Brisbane is now unlocked." },
      ],
    },
    "antivirus-atoll": {
      xp: 200,
      badge: "Antivirus Expert Badge",
      intro: [
        { speaker: "villain", text: "Antivirus? Pfft! My viruses evolve faster than any scanner, mate!" },
        { speaker: "guide", text: "Learn how antivirus software works — and how to use it to defeat Malware Max!" },
      ],
      completion: [
        { speaker: "guide", text: "Antivirus Atoll secured! Brisbane's devices are protected and scanning." },
        { speaker: "guide", text: "Antivirus Expert Badge earned! Outback Ops in Alice Springs is now unlocked." },
      ],
    },
    "outback-ops": {
      xp: 225,
      badge: "Outback Ops Badge",
      intro: [
        { speaker: "villain", text: "The Outback — where no one can hear your device get infected! Heh heh!" },
        { speaker: "guide", text: "Malware Max has been using the Outback as a staging ground. Shut him down!" },
      ],
      completion: [
        { speaker: "guide", text: "Outback Ops cleared! Alice Springs' devices are clean." },
        { speaker: "guide", text: "Outback Ops Badge earned! Reef Recon in Cairns is now unlocked." },
      ],
    },
    "reef-recon": {
      xp: 250,
      badge: "Reef Recon Badge",
      intro: [
        { speaker: "villain", text: "Even underwater I spread my malware! Nothing is safe from Malware Max!" },
        { speaker: "guide", text: "The Great Barrier Reef's digital monitoring systems are infected. Save them!" },
      ],
      completion: [
        { speaker: "guide", text: "Reef Recon complete! Cairns' systems are clean and the reef is protected." },
        {
          speaker: "guide",
          text: "Reef Recon Badge earned! Malware Max's Pouch in Western Australia is now unlocked!",
        },
      ],
    },
    "boss-malware": {
      xp: 500,
      badge: "Australia Champion",
      intro: [
        {
          speaker: "guide",
          text: "Malware Max's Pouch — Western Australia. His entire virus collection is stored here.",
        },
        {
          speaker: "villain",
          text: "My viruses are EVERYWHERE, Guardian! You can't delete them all! I'm UNSTOPPABLE!",
        },
        {
          speaker: "guide",
          text: "Antivirus knowledge, safe downloads, updates — use everything. Let's clear him out!",
        },
      ],
      completion: [
        { speaker: "villain", text: "My pouch… empty! My viruses… gone! This can't be happening, mate!" },
        { speaker: "guide", text: "Australia is free! Malware Max's entire virus collection is deleted!" },
        { speaker: "guide", text: "Australia Champion Badge earned! SHADOWBYTE waits in Antarctica…" },
      ],
    },
  },

  /* ── ANTARCTICA ── */
  antarctica: {
    "crypto-cavern": {
      xp: 200,
      badge: "Crypto Expert Badge",
      intro: [
        {
          speaker: "villain",
          text: "You've made it to my domain, Guardian. Every step forward is a step into my trap.",
        },
        {
          speaker: "guide",
          text: "Crypto Cavern holds SHADOWBYTE's encryption keys. Master cryptography to break through!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Crypto Cavern cleared! SHADOWBYTE's encryption keys are in our hands now." },
        { speaker: "guide", text: "Crypto Expert Badge earned! Algorithm Abyss on the Ice Shelf is now accessible." },
      ],
    },
    "algorithm-abyss": {
      xp: 225,
      badge: "Algorithm Master Badge",
      intro: [
        { speaker: "villain", text: "My algorithms are perfect. They've never been cracked. Until now… maybe." },
        {
          speaker: "guide",
          text: "SHADOWBYTE's attack patterns are hidden in these algorithms. Find them and break them!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Algorithm Abyss conquered! SHADOWBYTE's attack patterns are exposed." },
        {
          speaker: "guide",
          text: "Algorithm Master Badge earned! Code Citadel at SHADOWBYTE's Fortress is now unlocked.",
        },
      ],
    },
    "code-citadel": {
      xp: 250,
      badge: "Code Citadel Badge",
      intro: [
        { speaker: "villain", text: "My citadel. My rules. My code. You're playing MY game now, Guardian." },
        { speaker: "guide", text: "This is SHADOWBYTE's command centre. Break through and we end this for good!" },
      ],
      completion: [
        { speaker: "guide", text: "Code Citadel breached! SHADOWBYTE's command centre is offline." },
        { speaker: "guide", text: "Code Citadel Badge earned! Ice Intelligence at McMurdo Station is now unlocked." },
      ],
    },
    "ice-intelligence": {
      xp: 275,
      badge: "Ice Intelligence Badge",
      intro: [
        { speaker: "villain", text: "Intelligence gathering is my speciality, Guardian. I know everything about you." },
        {
          speaker: "guide",
          text: "SHADOWBYTE has been collecting intelligence on every Guardian. Stop the data leak!",
        },
      ],
      completion: [
        { speaker: "guide", text: "Ice Intelligence cleared! SHADOWBYTE's intelligence files are destroyed." },
        {
          speaker: "guide",
          text: "Ice Intelligence Badge earned! SHADOWBYTE's Core awaits. This is the final battle.",
        },
      ],
    },
    "boss-shadowbyte": {
      xp: 1000,
      badge: "WORLD CHAMPION",
      intro: [
        {
          speaker: "guide",
          text: "SHADOWBYTE's Core — the centre of Antarctica. Every threat you've ever faced is inside.",
        },
        {
          speaker: "villain",
          text: "Impressive, Guardian. You've defeated every villain across every continent. But I am ALL of them.",
        },
        {
          speaker: "guide",
          text: "This is it. Use every skill from every continent. The Digital World is counting on you!",
        },
      ],
      completion: [
        { speaker: "villain", text: "…Impossible. I had every advantage. Every power. And still… you won." },
        {
          speaker: "guide",
          text: "GUARDIAN! You've done it! SHADOWBYTE is defeated — the entire Digital World is FREE!",
        },
        {
          speaker: "guide",
          text: "WORLD CHAMPION! You are the greatest CyberGuardian who has ever lived. Congratulations!",
        },
      ],
    },
  },
};

/* ── Helper: get script for current continent + zone ── */
function getScript(continentId: string, zoneId: string): ZoneStoryScript | null {
  return ALL_ZONE_SCRIPTS[continentId]?.[zoneId] ?? null;
}

/* ═══════════════════════════════════════════════════════════
   STORY ENGINE
   ═══════════════════════════════════════════════════════════ */
function useStoryEngine(childId: string | null, continentId: string) {
  const key = `cga_story_${continentId}_${childId ?? "guest"}`;
  const [seenIntros, setSeenIntros] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(key) ?? "[]"));
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(Array.from(seenIntros)));
  }, [seenIntros, key]);

  const [cutscene, setCutscene] = useState<{ lines: DialogueLine[]; index: number; onDone: () => void } | null>(null);
  const [completion, setCompletion] = useState<{
    zoneName: string;
    lines: DialogueLine[];
    index: number;
    xp: number;
    badge?: string;
    unlocksZoneName?: string;
    onDone: () => void;
  } | null>(null);

  const triggerIntro = useCallback(
    (zoneId: string, onEnter: () => void) => {
      if (seenIntros.has(zoneId)) {
        onEnter();
        return;
      }
      const script = getScript(continentId, zoneId);
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
    [seenIntros, continentId],
  );

  const triggerMapIntro = useCallback(() => {
    if (seenIntros.has("__map__")) return;
    const lines = CONTINENT_MAP_INTROS[continentId];
    if (!lines?.length) return;
    setCutscene({
      lines,
      index: 0,
      onDone: () => {
        setSeenIntros((p) => new Set(p).add("__map__"));
        setCutscene(null);
      },
    });
  }, [seenIntros, continentId]);

  const triggerCompletion = useCallback(
    (zoneId: string, zoneName: string, unlocksZoneName: string | undefined, onDone: () => void) => {
      const script = getScript(continentId, zoneId);
      if (!script?.completion?.length) {
        onDone();
        return;
      }
      setCompletion({
        zoneName,
        lines: script.completion,
        index: 0,
        xp: script.xp,
        badge: script.badge,
        unlocksZoneName,
        onDone,
      });
    },
    [continentId],
  );

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

  const advanceCompletion = useCallback(() => {
    setCompletion((prev) => {
      if (!prev) return null;
      const next = prev.index + 1;
      if (next >= prev.lines.length) {
        setTimeout(prev.onDone, 0);
        return null;
      }
      return { ...prev, index: next };
    });
  }, []);
  const skipCompletion = useCallback(() => {
    setCompletion((prev) => {
      if (prev) setTimeout(prev.onDone, 0);
      return null;
    });
  }, []);

  return {
    cutscene,
    completion,
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
   VILLAIN ASSETS
   ═══════════════════════════════════════════════════════════ */
const VILLAIN_ASSETS: Record<string, { img: string; color: string }> = {
  "The Keybreaker": { img: keybreakerImg, color: "140, 85%, 50%" },
  "The Phisher King": { img: phisherKingImg, color: "195, 85%, 50%" },
  "The Firewall Phantom": { img: firewallPhantomImg, color: "300, 85%, 50%" },
  "The Data Thief": { img: dataThiefImg, color: "175, 85%, 45%" },
  "Malware Max": { img: malwareMaxImg, color: "110, 100%, 55%" },
  SHADOWBYTE: { img: shadowbyteImg, color: "249, 100%, 65%" },
  "The Troll Lord": { img: trollLordImg, color: "82, 100%, 50%" },
};

/* ═══════════════════════════════════════════════════════════
   TYPEWRITER
   ═══════════════════════════════════════════════════════════ */
function useTypewriter(text: string, speed = 24) {
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

/* ═══════════════════════════════════════════════════════════
   CUTSCENE PLAYER
   ═══════════════════════════════════════════════════════════ */
function CutscenePlayer({
  lines,
  index,
  onAdvance,
  onSkip,
  avatarConfig,
  playerName,
  villainName,
}: {
  lines: DialogueLine[];
  index: number;
  onAdvance: () => void;
  onSkip: () => void;
  avatarConfig: Record<string, any> | null;
  playerName: string;
  villainName: string;
}) {
  const line = lines[index];
  const isVillain = line.speaker === "villain";
  const { shown, done, finish } = useTypewriter(line.text);
  const asset = VILLAIN_ASSETS[villainName];
  const hue = asset?.color.split(",")[0] ?? "195";

  const handleClick = useCallback(() => {
    if (!done) finish();
    else onAdvance();
  }, [done, finish, onAdvance]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleClick]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-end pb-14 cursor-pointer px-4"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }}
      onClick={handleClick}
    >
      <div className="absolute top-0 left-0 right-0 h-16 bg-black/75 backdrop-blur-sm" />
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-2">
        {lines.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === index ? 22 : 7 }}
            className={`h-1.5 rounded-full ${i === index ? "bg-[hsl(195_80%_60%)]" : i < index ? "bg-white/40" : "bg-white/15"}`}
          />
        ))}
      </div>
      <button
        className="absolute top-4 right-4 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold text-white/40 hover:text-white/70 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onSkip();
        }}
      >
        SKIP ▶▶
      </button>

      <motion.div
        key={index}
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl border-2 overflow-hidden"
        style={{
          borderColor: isVillain ? `hsla(${hue},70%,50%,0.45)` : "hsl(195,80%,50%,0.45)",
          background: isVillain ? `hsla(${hue},35%,7%,0.97)` : "hsl(210,50%,11%,0.97)",
          boxShadow: `0 0 40px ${isVillain ? `hsla(${hue},70%,40%,0.12)` : "hsl(195,80%,40%,0.12)"}`,
        }}
      >
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
        <div className="flex items-start gap-4 px-5 py-5">
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div
              className="rounded-2xl border-2 overflow-hidden flex items-center justify-center"
              style={{
                width: 80,
                height: 80,
                borderColor: isVillain ? `hsla(${hue},60%,45%,0.55)` : "hsl(195,80%,50%,0.55)",
                background: isVillain ? `hsla(${hue},40%,10%,0.85)` : "hsl(210,45%,16%,0.9)",
                boxShadow: `0 0 14px ${isVillain ? `hsla(${hue},60%,45%,0.2)` : "hsl(195,80%,50%,0.15)"}`,
              }}
            >
              {isVillain && asset ? (
                <img
                  src={asset.img}
                  alt={villainName}
                  className="w-full h-full object-cover object-top"
                  style={{ transform: "scale(1.4) translateY(8px)" }}
                  draggable={false}
                />
              ) : isVillain ? (
                <span className="text-3xl">🦹</span>
              ) : (
                <div className="w-full h-full flex items-center justify-center p-1">
                  <HeroAvatar avatarConfig={avatarConfig} size={68} fallbackEmoji="🦸" />
                </div>
              )}
            </div>
            <div className="flex gap-0.5 h-3 items-end">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={done ? { height: "3px" } : { height: ["3px", "10px", "3px"] }}
                  transition={{ repeat: Infinity, duration: 0.55, delay: i * 0.12 }}
                  className="w-1 rounded-full"
                  style={{ background: isVillain ? `hsla(${hue},70%,60%,0.7)` : "hsl(195,80%,60%,0.7)" }}
                />
              ))}
            </div>
          </div>
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
  unlocksZoneName,
  onAdvance,
  onSkip,
  avatarConfig,
  playerName,
  villainName,
}: {
  zoneName: string;
  lines: DialogueLine[];
  index: number;
  xp: number;
  badge?: string;
  unlocksZoneName?: string;
  onAdvance: () => void;
  onSkip: () => void;
  avatarConfig: Record<string, any> | null;
  playerName: string;
  villainName: string;
}) {
  const isLast = index >= lines.length - 1;
  const [xpCount, setXpCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const asset = VILLAIN_ASSETS[villainName];
  const hue = asset?.color.split(",")[0] ?? "195";

  useEffect(() => {
    if (!isLast) return;
    let n = 0;
    const step = Math.ceil(xp / 40);
    const id = setInterval(() => {
      n = Math.min(n + step, xp);
      setXpCount(n);
      if (n >= xp) clearInterval(id);
    }, 28);
    const t1 = setTimeout(() => setShowBadge(true), 550);
    const t2 = setTimeout(() => setShowUnlock(true), 1050);
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
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.88, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="w-full max-w-md rounded-3xl border border-[hsl(160_65%_50%/0.3)] bg-[hsl(210_40%_11%)] p-6 shadow-[0_0_60px_hsl(160_65%_50%/0.1)]"
      >
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
        <div className="mb-5 space-y-2 max-h-52 overflow-y-auto">
          {lines.map((l, i) => {
            const iv = l.speaker === "villain";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: i <= index ? 1 : 0.12, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-start gap-2.5 rounded-xl p-3 text-sm ${
                  i === index
                    ? iv
                      ? "bg-[hsl(0_30%_12%/0.7)] border border-[hsl(0_60%_45%/0.2)]"
                      : "bg-[hsl(195_80%_50%/0.1)] border border-[hsl(195_80%_50%/0.2)]"
                    : "border border-transparent"
                }`}
              >
                <div
                  className="flex-shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden border"
                  style={{
                    borderColor: iv ? `hsla(${hue},60%,40%,0.4)` : "hsl(195,80%,50%,0.3)",
                    background: iv ? `hsla(${hue},40%,10%,0.8)` : "hsl(210,45%,16%,0.8)",
                  }}
                >
                  {iv && asset ? (
                    <img
                      src={asset.img}
                      alt={villainName}
                      className="w-full h-full object-cover object-top"
                      style={{ transform: "scale(1.4) translateY(4px)" }}
                    />
                  ) : iv ? (
                    <span className="text-xs">🦹</span>
                  ) : (
                    <HeroAvatar avatarConfig={avatarConfig} size={26} fallbackEmoji="🦸" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-[9px] font-bold tracking-wide uppercase mb-0.5 ${iv ? `text-[hsla(${hue},65%,62%,1)]` : "text-[hsl(195_80%_60%)]"}`}
                  >
                    {iv ? villainName : playerName}
                  </p>
                  <p className="text-white/80 leading-snug">{l.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        {isLast && (
          <div className="mb-5 flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[90px] rounded-xl border border-[hsl(45_90%_55%/0.25)] bg-[hsl(45_90%_55%/0.08)] p-3 text-center">
              <p className="text-[9px] text-white/40 uppercase tracking-wide mb-1">XP Earned</p>
              <p className="text-2xl font-bold text-[hsl(45_90%_60%)] tabular-nums">+{xpCount}</p>
            </div>
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
            {unlocksZoneName && (
              <motion.div
                animate={{ opacity: showUnlock ? 1 : 0, y: showUnlock ? 0 : 8 }}
                className="w-full rounded-xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(195_80%_50%/0.06)] p-3"
              >
                <p className="text-[9px] text-[hsl(195_80%_60%)] uppercase tracking-wide mb-1.5">🔓 Zone Unlocked</p>
                <span className="rounded-full bg-[hsl(195_80%_50%/0.12)] border border-[hsl(195_80%_50%/0.2)] px-3 py-1 text-[11px] font-bold text-[hsl(195_80%_70%)]">
                  {unlocksZoneName}
                </span>
              </motion.div>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          {!isLast ? (
            <>
              <Button
                className="flex-1 bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white border-0 font-bold"
                onClick={onAdvance}
              >
                Continue →
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
   UNLOCK BURST
   ═══════════════════════════════════════════════════════════ */
function UnlockBurst({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
    >
      <div className="relative flex items-center justify-center">
        {[80, 130, 180].map((size, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.9, delay: i * 0.15 }}
            className="absolute rounded-full border-2 border-[hsl(195_80%_60%/0.5)]"
            style={{ width: size, height: size }}
          />
        ))}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, delay: 0.05 }}
          className="text-5xl"
          style={{ filter: "drop-shadow(0 0 16px hsl(195 80% 60% / 0.9))" }}
        >
          🔓
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VILLAIN CHARACTER (unchanged from original)
   ═══════════════════════════════════════════════════════════ */
const VILLAIN_TAUNTS: Record<string, string[]> = {
  "The Keybreaker": [
    "No password can stop me!",
    "I've cracked them ALL, Guardian!",
    "Your encryption is useless!",
    "Give up now while you can!",
  ],
  "The Phisher King": [
    "Click the link... I dare you! 🎣",
    "A prize is waiting just for you!",
    "Every email is a trap!",
    "Open the message... if you trust me.",
  ],
  "The Troll Lord": [
    "Did you just try to argue with me? Cute. 💅",
    "I live in the comments. I AM the comments.",
    "Ratio incoming. Brace yourself. 🧨",
    "Your opinion has been flagged as irrelevant.",
    "I don't start drama. I finish it.",
    "Every post you make feeds me stronger. 👑",
    "Touch grass? Never heard of it.",
  ],
  "The Firewall Phantom": [
    "Your firewall means nothing to me.",
    "I've already been inside your system.",
    "Every packet you send... I intercept.",
    "You can't fight what you can't see. 👻",
  ],
  "The Data Thief": [
    "This network is mine. Every node.",
    "I don't block threats. I become them.",
    "Your data passed through me before you knew.",
    "Every lock you see? I placed it.",
  ],
  "Malware Max": [
    "Bugs aren't problems. They're my pets. 🐛",
    "I didn't break your system. I improved it.",
    "Every crash is just a feature I added.",
    "Warning: me. That's the only warning you'll get. ⚠️",
    "Your antivirus is crying right now.",
    "I've got a bug for every occasion!",
    "Chaos is just code that's having fun.",
  ],
  SHADOWBYTE: [
    "Every password you've ever used... I have it.",
    "The cold doesn't bother me. Neither do you.",
    "I don't hack systems. I erase them.",
    "Your credentials expired the moment I arrived.",
    "Nothing survives the void. Not even your data.",
    "I've been watching from the dark since you started.",
    "Silence is my weapon. The breach already happened.",
  ],
};
const VILLAIN_DYNAMIC_TAUNTS: Record<
  string,
  { locked: string; available: string; completed: string; boss: string; first?: string; lastLocked?: string }
> = {
  "The Keybreaker": {
    locked: "Too weak. I broke that instantly.",
    available: "Let's see if you're actually secure.",
    completed: "Hmm… not bad.",
    boss: "You'll never break my code!",
  },
  "The Phisher King": {
    locked: "Locked out? Maybe this email can help...",
    available: "Go ahead... click something.",
    completed: "You spotted that one... impressive.",
    boss: "One click is all I need!",
  },
  "The Troll Lord": {
    locked: "LOL that zone is locked. Good luck finding the key. 😈",
    available: "Ooooh going for that one? Bold move. Let's see it. 👀",
    completed: "Okay fine. You cleared that. Don't let it go to your head.",
    boss: "You actually made it to ME?! This just got interesting. 😈",
    first: "First move detected. Let the trolling begin.",
    lastLocked: "One more zone and you face the Troll Lord herself. Nervous?",
  },
  "The Firewall Phantom": {
    locked: "That zone is sealed. I sealed it myself.",
    available: "Brave. Let's see if you're ready.",
    completed: "You got lucky.",
    boss: "You actually made it here? ...Impressive.",
  },
  "The Data Thief": {
    locked: "That one stays locked until I say.",
    available: "You can try. I've seen better fail.",
    completed: "Fine. That zone is yours.",
    boss: "You came all this way just to lose? Bold.",
  },
  "Malware Max": {
    locked: "Oh that one's locked? I locked it. With a bug. 🐛",
    available: "Ooooh you're gonna click that? This'll be fun.",
    completed: "You beat that zone?! Okay okay... respect. Tiny respect.",
    boss: "YOU FOUND ME! Let's see if you can keep up! ⚡",
    first: "Here we GOOOOO! Try to keep up!",
    lastLocked: "Almost there! My best bugs are waiting for you.",
  },
  SHADOWBYTE: {
    locked: "That zone is frozen solid. I made sure of it.",
    available: "Go ahead. Walk into the cold.",
    completed: "Hmm. You cleared that one. I underestimated you.",
    boss: "You reached the void. Few ever do. Fewer survive.",
    first: "Into the darkness you go. I'll be watching.",
    lastLocked: "One last gate stands between you and me.",
  },
};

function VillainCharacter({
  villainName,
  hoveredNodeStatus,
}: {
  villainName: string;
  hoveredNodeStatus?: string | null;
}) {
  const taunts = VILLAIN_TAUNTS[villainName] || ["..."];
  const [tauntIdx, setTauntIdx] = useState(0);
  const [showShimmer, setShowShimmer] = useState(false);
  const asset = VILLAIN_ASSETS[villainName];
  const dynamicTaunts = VILLAIN_DYNAMIC_TAUNTS[villainName];
  const isShadowbyte = villainName === "SHADOWBYTE";
  const isTrollLord = villainName === "The Troll Lord";
  const [emojiBurst, setEmojiBurst] = useState(false);
  useEffect(() => {
    if (hoveredNodeStatus) return;
    const interval = setInterval(() => setTauntIdx((i) => (i + 1) % taunts.length), 3000);
    return () => clearInterval(interval);
  }, [taunts.length, hoveredNodeStatus]);

  useEffect(() => {
    const baseDelay = isShadowbyte ? 8000 : isTrollLord ? 5000 : 6000;
    const randRange = isShadowbyte ? 2000 : isTrollLord ? 2000 : 3000;
    const schedule = () =>
      setTimeout(
        () => {
          setShowShimmer(true);
          setTimeout(() => setShowShimmer(false), 600);
          if (isTrollLord) {
            setEmojiBurst(true);
            setTimeout(() => setEmojiBurst(false), 800);
          }
          schedule();
        },
        baseDelay + Math.random() * randRange,
      );
    const t = schedule();
    return () => clearTimeout(t as any);
  }, [isShadowbyte, isTrollLord]);

  const bubbleText =
    hoveredNodeStatus && dynamicTaunts
      ? dynamicTaunts[hoveredNodeStatus as keyof typeof dynamicTaunts] || taunts[tauntIdx]
      : taunts[tauntIdx];
  const bubbleKey = hoveredNodeStatus || `idle-${tauntIdx}`;
  const glowHsl = asset?.color ?? "140, 85%, 50%";
  const hueVal = glowHsl.split(",")[0];
  
  const textColor = isShadowbyte ? "#9d8cff" : isTrollLord ? "#c8ff44" : `hsl(${hueVal}, 70%, 72%)`;
  const borderColor = isShadowbyte ? "rgba(91,77,255,0.4)" : isTrollLord ? "rgba(170,255,0,0.4)" : `hsla(${hueVal}, 75%, 50%, 0.3)`;
  const bubbleBg = isShadowbyte ? "rgba(4,6,20,0.92)" : isTrollLord ? "rgba(8,14,4,0.92)" : "hsla(210,40%,10%,0.88)";

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="absolute bottom-5 right-5 z-20 flex flex-col items-end gap-1 md:bottom-6 md:right-6"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={bubbleKey}
          initial={{ opacity: 0, scale: 0.85, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 6 }}
          transition={{ duration: 0.3 }}
          className="relative mr-2 mb-1 max-w-[170px] md:mr-3 md:max-w-[210px] rounded-xl rounded-br-sm px-3 py-2 shadow-xl backdrop-blur-md"
          style={{
            background: bubbleBg,
            border: `1px solid ${borderColor}`,
            boxShadow: isShadowbyte
              ? `0 0 20px rgba(91,77,255,0.3)`
              : isTrollLord
              ? `0 0 20px rgba(170,255,0,0.3)`
              : `0 0 18px hsla(${hueVal},80%,50%,0.15)`,
          }}
        >
          {isShadowbyte && (
            <span className="block mb-1 text-[8px] tracking-[0.2em] uppercase" style={{ color: "#5B4DFF", fontFamily: "'Share Tech Mono', 'Orbitron', monospace" }}>
              // SHADOWBYTE.exe
            </span>
          )}
          {isTrollLord && (
            <span className="block mb-1 text-[8px] tracking-[0.2em] uppercase" style={{ color: "#AAFF00", fontFamily: "'Share Tech Mono', 'Orbitron', monospace" }}>
              // TROLL_LORD.exe
            </span>
          )}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: isShadowbyte
                ? [
                    `0 0 20px rgba(91,77,255,0.3)`,
                    `0 0 50px rgba(91,77,255,0.7)`,
                    `0 0 20px rgba(91,77,255,0.3)`,
                  ]
                : isTrollLord
                ? [
                    `0 0 20px rgba(170,255,0,0.3)`,
                    `0 0 50px rgba(170,255,0,0.7)`,
                    `0 0 20px rgba(170,255,0,0.3)`,
                  ]
                : [
                    `0 0 20px hsla(${hueVal},80%,50%,0.15)`,
                    `0 0 40px hsla(${hueVal},80%,50%,0.35)`,
                    `0 0 20px hsla(${hueVal},80%,50%,0.15)`,
                  ],
            }}
            transition={{ repeat: Infinity, duration: isShadowbyte ? 3 : isTrollLord ? 2 : 2.5 }}
          />
          <p className="text-[11px] md:text-xs font-medium italic leading-snug" style={{ color: textColor }}>
            "{bubbleText}"
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="ml-0.5 inline-block"
            >
              ▌
            </motion.span>
          </p>
          <div
            className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45"
            style={{
              background: bubbleBg,
              borderRight: `1px solid ${borderColor}`,
              borderBottom: `1px solid ${borderColor}`,
            }}
          />
        </motion.div>
      </AnimatePresence>
      <motion.div
        animate={{ y: isShadowbyte ? [0, -8, 0] : isTrollLord ? [0, -11, 0] : [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: isShadowbyte ? 4 : isTrollLord ? 2.5 : 3, ease: "easeInOut" }}
        whileHover={{ scale: 1.06 }}
        className="relative cursor-default"
      >
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={{
            background: `radial-gradient(circle, hsla(${glowHsl},0.25) 0%, transparent 70%)`,
            filter: "blur(12px)",
            transform: "scale(1.3)",
          }}
        />
        {asset ? (
          <div className="relative">
            <img
              src={asset.img}
              alt={villainName}
              className="relative z-10 w-[150px] h-auto md:w-[190px]"
              style={{ filter: `drop-shadow(0 0 16px hsla(${glowHsl},0.35))` }}
              draggable={false}
            />
            <AnimatePresence>
              {showShimmer && (
                isShadowbyte ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: [0, 0.5, 0], scale: [0.6, 1.6, 2] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 z-20 pointer-events-none rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(91,77,255,0.35) 0%, rgba(91,77,255,0.1) 40%, transparent 70%)",
                      filter: "blur(6px)",
                    }}
                  />
                ) : (
                  <motion.div
                    initial={{ left: "-30%", opacity: 0 }}
                    animate={{ left: "130%", opacity: [0, 0.7, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute top-0 z-20 h-full w-[30%] pointer-events-none"
                    style={{
                      background: `linear-gradient(90deg, transparent, hsla(${hueVal},80%,60%,0.4), transparent)`,
                      filter: "blur(4px)",
                    }}
                  />
                )
              )}
            </AnimatePresence>
          </div>
        ) : (
          <VillainSprite villainName={villainName} size={120} menacing />
        )}
        {villainName === "Malware Max" && (
          <>
            <motion.span
              animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
              className="absolute -top-1 -left-3 z-30 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest"
              style={{
                background: "hsla(110,100%,55%,0.12)",
                border: "1px solid hsla(110,100%,55%,0.35)",
                color: "#39FF14",
                fontFamily: "'Orbitron', monospace",
                textShadow: "0 0 6px hsla(110,100%,55%,0.5)",
              }}
            >
              BUG DETECTED
            </motion.span>
            <motion.span
              animate={{ y: [0, -3, 0], opacity: [0.6, 0.9, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 1.0 }}
              className="absolute -bottom-1 -left-2 z-30 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest"
              style={{
                background: "hsla(25,100%,50%,0.12)",
                border: "1px solid hsla(25,100%,50%,0.35)",
                color: "#FF6B00",
                fontFamily: "'Orbitron', monospace",
                textShadow: "0 0 6px hsla(25,100%,50%,0.5)",
              }}
            >
              ERROR
            </motion.span>
          </>
        )}
        {isShadowbyte && (
          <>
            {/* Eye flicker overlay */}
            <motion.div
              className="absolute top-[28%] left-[32%] w-[36%] h-[8%] z-30 pointer-events-none"
              animate={{ opacity: [0.9, 0.4, 0.9, 1, 0.5, 0.9] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{
                background: "radial-gradient(ellipse, rgba(0,207,255,0.25) 0%, transparent 70%)",
                filter: "blur(4px)",
              }}
            />
            <motion.span
              animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.5 }}
              className="absolute -top-1 -left-3 z-30 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest"
              style={{
                background: "rgba(91,77,255,0.12)",
                border: "1px solid rgba(91,77,255,0.35)",
                color: "#5B4DFF",
                fontFamily: "'Orbitron', monospace",
                textShadow: "0 0 6px rgba(91,77,255,0.5)",
              }}
            >
              SHADOW
            </motion.span>
            <motion.span
              animate={{ y: [0, -3, 0], opacity: [0.6, 0.9, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, delay: 1.2 }}
              className="absolute -bottom-1 -left-2 z-30 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest"
              style={{
                background: "rgba(0,207,255,0.1)",
                border: "1px solid rgba(0,207,255,0.3)",
                color: "#00CFFF",
                fontFamily: "'Orbitron', monospace",
                textShadow: "0 0 6px rgba(0,207,255,0.5)",
              }}
            >
              BREACHED
            </motion.span>
          </>
        )}
        {isTrollLord && (
          <>
            {/* Floating glitchy tags */}
            <motion.span
              animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: 0.3 }}
              className="absolute -top-1 -left-3 z-30 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest"
              style={{
                background: "rgba(170,255,0,0.12)",
                border: "1px solid rgba(170,255,0,0.35)",
                color: "#AAFF00",
                fontFamily: "'Orbitron', monospace",
                textShadow: "0 0 6px rgba(170,255,0,0.5)",
              }}
            >
              TROLLED!
            </motion.span>
            <motion.span
              animate={{ y: [0, -3, 0], opacity: [0.6, 0.9, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 1.0 }}
              className="absolute -bottom-1 -left-2 z-30 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest"
              style={{
                background: "rgba(255,45,139,0.12)",
                border: "1px solid rgba(255,45,139,0.35)",
                color: "#FF2D8B",
                fontFamily: "'Orbitron', monospace",
                textShadow: "0 0 6px rgba(255,45,139,0.5)",
              }}
            >
              PWNED!
            </motion.span>
            {/* Pink accent flicker */}
            <motion.div
              className="absolute inset-0 z-20 pointer-events-none rounded-full"
              animate={{ opacity: [0, 0.15, 0, 0.1, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              style={{
                background: "radial-gradient(circle, rgba(255,45,139,0.2) 0%, transparent 60%)",
                filter: "blur(8px)",
              }}
            />
            {/* Emoji burst */}
            <AnimatePresence>
              {emojiBurst && (
                <>
                  {["😈", "🔥", "💀", "👑"].map((e, i) => (
                    <motion.span
                      key={`emoji-${i}`}
                      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                      animate={{
                        opacity: 0,
                        scale: 0.5,
                        x: (i % 2 === 0 ? -1 : 1) * (20 + i * 10),
                        y: -(15 + i * 8),
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7 }}
                      className="absolute top-1/3 left-1/2 z-40 text-sm pointer-events-none"
                    >
                      {e}
                    </motion.span>
                  ))}
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ZONE MISSION PANEL
   ═══════════════════════════════════════════════════════════ */
function ZoneMissionPanel({
  zone,
  continent,
  onClose,
  onDeploy,
}: {
  zone: ZoneDef;
  continent: ContinentDef;
  onClose: () => void;
  onDeploy: () => void;
}) {
  const hasGames = !!(getZoneGames(zone.id) || getBossBattle(zone.id));
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl bg-[hsl(210_40%_20%)]">
            {zone.icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{zone.name.toUpperCase()}</h2>
            <p className="text-xs text-[hsl(195_60%_60%)]">
              {zone.city} · {continent.name}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/10 transition-colors">
            <X className="h-5 w-5 text-white/50" />
          </button>
        </div>
        {zone.isBoss ? (
          <div className="text-center py-6">
            <span className="text-4xl mb-3 block">⚔️</span>
            <p className="text-sm text-white/70 mb-4">
              Defeat {continent.villain} to secure {continent.name}!
            </p>
            {hasGames ? (
              <Button onClick={onDeploy} className="bg-[hsl(0_70%_45%)] hover:bg-[hsl(0_70%_40%)] text-white font-bold">
                ⚔️ START BOSS BATTLE
              </Button>
            ) : (
              <p className="text-xs text-white/40">Boss Battle unlocks after completing all zones</p>
            )}
          </div>
        ) : zone.isHQ ? (
          <div className="text-center py-6">
            <span className="text-4xl mb-3 block">🏠</span>
            <p className="text-sm text-white/70 mb-4">Welcome, Guardian! Complete your orientation!</p>
            <Button
              onClick={onDeploy}
              className="bg-[hsl(45_90%_50%)] hover:bg-[hsl(45_90%_45%)] text-[hsl(210_40%_10%)] font-bold"
            >
              🚀 BEGIN ORIENTATION
            </Button>
          </div>
        ) : hasGames ? (
          <div className="text-center py-6">
            <p className="text-sm text-white/70 mb-4">4 games await you in this zone!</p>
            <Button
              onClick={onDeploy}
              className="bg-[hsl(195_80%_50%)] hover:bg-[hsl(195_80%_45%)] text-white font-bold"
            >
              🚀 DEPLOY MISSION
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">🚧</span>
            <p className="text-sm text-white/70 mb-1">Mission content coming soon</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN SCREEN
   ═══════════════════════════════════════════════════════════ */
export default function ContinentMapScreen() {
  const { continentId } = useParams<{ continentId: string }>();
  const { user, activeChildId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedZone, setSelectedZone] = useState<ZoneDef | null>(null);
  const [hoveredNodeStatus, setHoveredNodeStatus] = useState<string | null>(null);
  const [showUnlockBurst, setShowUnlockBurst] = useState(false);

  const continent = getContinentById(continentId || "");

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!activeChildId) navigate("/dashboard");
    else if (!continent) navigate("/world-map");
  }, [user, activeChildId, continent, navigate]);

  const { data: child } = useQuery({
    queryKey: ["child", activeChildId],
    queryFn: async () => {
      const { data, error } = await supabase.from("child_profiles").select("*").eq("id", activeChildId!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId,
  });

  const { data: zoneProgress = [] } = useQuery({
    queryKey: ["zone_progress", activeChildId, continentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("zone_progress")
        .select("*")
        .eq("child_id", activeChildId!)
        .eq("continent_id", continentId!);
      if (error) throw error;
      return data;
    },
    enabled: !!activeChildId && !!continentId,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const avatarConfig = child?.avatar_config as Record<string, any> | null;
  const playerName = (child as any)?.name ?? "Guardian";
  const isAntarctica = continent?.id === "antarctica";

  const zoneStatuses = useMemo(() => {
    if (!continent) return [];
    return continent.zones.map((zone) => getZoneStatus(zone, continent.zones, zoneProgress, continentId ?? ""));
  }, [continent, zoneProgress, continentId]);

  const zoneCoords = useMemo(() => ZONE_COORDINATES[continentId || ""] || [], [continentId]);
  const projection = CONTINENT_PROJECTIONS[continentId || ""];
  const countryCodes = CONTINENT_COUNTRIES[continentId || ""] || [];

  // Story engine — keyed per continent so each continent has its own seen intros
  const story = useStoryEngine(activeChildId, continentId ?? "unknown");

  useEffect(() => {
    const t = setTimeout(() => story.triggerMapIntro(), 900);
    return () => clearTimeout(t);
  }, [continentId]); // re-fire when continent changes

  // Handle ?completed= from zone game screen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const completedId = params.get("completed");
    if (!completedId || !continent) return;
    window.history.replaceState({}, "", window.location.pathname);
    queryClient.invalidateQueries({ queryKey: ["zone_progress", activeChildId, continentId] });
    const zone = continent.zones.find((z) => z.id === completedId);
    if (!zone) return;

    // Find next zone in this continent's order
    const currentIdx = continent.zones.findIndex((z) => z.id === completedId);
    const nextZone = continent.zones[currentIdx + 1];

    setShowUnlockBurst(true);
    setTimeout(() => {
      story.triggerCompletion(completedId, zone.name, nextZone?.name, () => {});
    }, 2400);
  }, [continent]);

  const handleZoneClick = (zone: ZoneDef, index: number) => {
    if (zoneStatuses[index] === "locked") return;
    story.triggerIntro(zone.id, () => setSelectedZone(zone));
  };

  if (!continent) return null;

  const markerColors = (zone: ZoneDef, status: string) => {
    if (zone.isHQ) return { fill: "#f5c518", stroke: "#f5c518", glow: "rgba(245,197,24,0.45)" };
    if (zone.isBoss) return { fill: "#ff2d55", stroke: "#ff2d55", glow: "rgba(255,45,85,0.4)" };
    if (status === "completed") return { fill: "#00ff88", stroke: "#00ff88", glow: "rgba(0,255,136,0.35)" };
    if (status === "available") return { fill: "#00ffe7", stroke: "#00ffe7", glow: "rgba(0,255,231,0.35)" };
    return { fill: "#2a3a5a", stroke: "#4a6a9a", glow: "none" };
  };

  return (
    <div
      className="min-h-screen pb-24 pt-20 relative overflow-hidden"
      style={{ background: isAntarctica ? "linear-gradient(160deg, #050a14, #0a1f3a, #081525)" : "#050a14" }}
    >
      <StarfieldBackground variant={isAntarctica ? "snow" : "default"} />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(195 80% 60% / 0.015) 2px, hsl(195 80% 60% / 0.015) 4px)",
        }}
      />

      <div className="relative z-[2] mx-auto max-w-6xl px-4">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/world-map")}
          className="mb-4 flex items-center gap-2 rounded-xl border border-[hsl(195_80%_50%/0.2)] bg-[hsl(210_40%_14%/0.8)] px-4 py-2 text-sm font-bold text-[hsl(195_80%_70%)] backdrop-blur-md hover:bg-[hsl(210_40%_14%)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> BACK TO WORLD SELECT
        </motion.button>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            {continent.emoji} {continent.name.toUpperCase()} —{" "}
            <span className="text-[hsl(0_80%_65%)]">{continent.villain.toUpperCase()}'S DOMAIN</span>
          </h1>
        </motion.div>

        <div
          className="relative mx-auto w-full rounded-2xl border border-[hsl(195_80%_50%/0.15)] overflow-hidden shadow-2xl"
          style={{
            aspectRatio: "16/10",
            maxWidth: "900px",
            background: isAntarctica
              ? "radial-gradient(ellipse at 50% 45%, #0a1f3a, #050d1a)"
              : "radial-gradient(ellipse at 50% 45%, #0d1f37, #050d1a)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, hsl(195 80% 60%) 0.5px, transparent 0.5px)",
              backgroundSize: "24px 24px",
            }}
          />

          {projection && (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: projection.center, scale: projection.scale }}
              style={{ width: "100%", height: "100%" }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies
                    .filter((geo) => countryCodes.includes(geo.id))
                    .map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#0d2137"
                        stroke="#1a4a6a"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "#0a3a5a", outline: "none" },
                          pressed: { outline: "none" },
                        }}
                      />
                    ))
                }
              </Geographies>

              {zoneCoords.slice(0, -1).map((from, i) => {
                const to = zoneCoords[i + 1];
                const fromStatus = zoneStatuses[i],
                  toStatus = zoneStatuses[i + 1];
                const bothDone = fromStatus === "completed" && toStatus === "completed";
                const available = fromStatus === "completed" && toStatus !== "locked";
                return (
                  <Line
                    key={`line-${i}`}
                    from={[from.lng, from.lat]}
                    to={[to.lng, to.lat]}
                    stroke={bothDone || available ? "hsl(195, 85%, 55%)" : "hsl(200, 25%, 50%)"}
                    strokeWidth={bothDone ? 2.5 : 1.5}
                    strokeOpacity={bothDone ? 0.7 : available ? 0.45 : 0.25}
                    strokeDasharray={bothDone ? "none" : available ? "6 4" : "4 3"}
                    strokeLinecap="round"
                  />
                );
              })}

              {continent.zones.map((zone, i) => {
                const coord = zoneCoords.find((c) => c.id === zone.id);
                if (!coord) return null;
                const status = zoneStatuses[i] || "locked";
                const colors = markerColors(zone, status);
                const isLocked = status === "locked";
                const isAvailable = status === "available";
                const isCompleted = status === "completed";
                const r = zone.isHQ ? 20 : zone.isBoss ? 18 : 14;
                const lockedZones = zoneStatuses.filter((s, idx) => s === "locked" && !continent.zones[idx]?.isBoss);
                const isLastLocked = isLocked && lockedZones.length === 1;

                return (
                  <Marker
                    key={zone.id}
                    coordinates={[coord.lng, coord.lat]}
                    onClick={() => handleZoneClick(zone, i)}
                    onMouseEnter={() => {
                      const isFirst = i === 0 && status !== "completed";
                      if (isFirst) setHoveredNodeStatus("first");
                      else if (isLastLocked) setHoveredNodeStatus("lastLocked");
                      else setHoveredNodeStatus(zone.isBoss ? "boss" : status);
                    }}
                    onMouseLeave={() => setHoveredNodeStatus(null)}
                    style={{ cursor: isLocked ? "not-allowed" : "pointer" }}
                  >
                    {!isLocked && (
                      <circle r={r + 6} fill="none" stroke={colors.stroke} strokeWidth={1.5} opacity={0.4}>
                        <animate
                          attributeName="r"
                          values={`${r + 2};${r + 14};${r + 2}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {!isLocked && (
                      <circle r={r + 3} fill={colors.glow} opacity={0.3}>
                        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      r={r}
                      fill={isLocked ? "#2a3a5a" : colors.fill}
                      stroke={isLocked ? "#4a6a9a" : colors.stroke}
                      strokeWidth={2.5}
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={zone.isHQ || zone.isBoss ? 18 : 14}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {isLocked ? "🔒" : isCompleted ? "✅" : zone.icon}
                    </text>
                    <text
                      textAnchor="middle"
                      y={r + 18}
                      fontSize={11}
                      fontWeight="bold"
                      fill={isLocked ? "rgba(255,255,255,0.6)" : zone.isBoss ? "#ff6b8a" : "#fff"}
                      style={{ pointerEvents: "none", userSelect: "none", textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
                    >
                      {zone.name}
                    </text>
                    <text
                      textAnchor="middle"
                      y={r + 30}
                      fontSize={8}
                      fill={isLocked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.7)"}
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {zone.city}
                    </text>
                    {isAvailable && (
                      <text
                        textAnchor="middle"
                        y={r + 42}
                        fontSize={8}
                        fontWeight="bold"
                        fill={zone.isBoss ? "#ff6b8a" : zone.isHQ ? "#f5c518" : "#00ffe7"}
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        {zone.isBoss ? "⚔️ FIGHT" : zone.isHQ ? "▶ START" : "▶ DEPLOY"}
                        <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
                      </text>
                    )}
                  </Marker>
                );
              })}
            </ComposableMap>
          )}

          <VillainCharacter villainName={continent.villain} hoveredNodeStatus={hoveredNodeStatus} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-white/60"
        >
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[hsl(195_80%_50%)] animate-pulse" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[hsl(160_65%_50%)]" /> Secured
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#2a3a5a] border border-[#4a6a9a]" /> Locked
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[hsl(0_80%_50%)]" /> ⚔️ Boss
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-6 left-4 z-50 md:bottom-8 md:left-6"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[hsl(195_80%_50%/0.5)] bg-[hsl(210_40%_14%/0.9)] shadow-[0_0_20px_hsl(195_85%_50%/0.3)]">
          <HeroAvatar avatarConfig={avatarConfig} size={36} fallbackEmoji="🦸" />
        </div>
      </motion.div>

      <AnimatePresence>{showUnlockBurst && <UnlockBurst onDone={() => setShowUnlockBurst(false)} />}</AnimatePresence>

      <AnimatePresence>
        {story.cutscene && (
          <CutscenePlayer
            lines={story.cutscene.lines}
            index={story.cutscene.index}
            onAdvance={story.advanceCutscene}
            onSkip={story.skipCutscene}
            avatarConfig={avatarConfig}
            playerName={playerName}
            villainName={continent.villain}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {story.completion && (
          <ZoneCompletionPanel
            zoneName={story.completion.zoneName}
            lines={story.completion.lines}
            index={story.completion.index}
            xp={story.completion.xp}
            badge={story.completion.badge}
            unlocksZoneName={story.completion.unlocksZoneName}
            onAdvance={story.advanceCompletion}
            onSkip={story.skipCompletion}
            avatarConfig={avatarConfig}
            playerName={playerName}
            villainName={continent.villain}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedZone && (
          <ZoneMissionPanel
            zone={selectedZone}
            continent={continent}
            onClose={() => setSelectedZone(null)}
            onDeploy={() => {
              setSelectedZone(null);
              navigate(`/world-map/${continentId}/${selectedZone.id}`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
