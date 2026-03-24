/* ─── Continent & Zone Definitions ─────────────────────────────────── */

export interface ZoneDef {
  id: string;
  name: string;
  icon: string;
  city: string;
  lat: number;
  lng: number;
  isBoss?: boolean;
  isHQ?: boolean;
}

export interface ContinentDef {
  id: string;
  name: string;
  emoji: string;
  villain: string;
  villainTaunt: string;
  route: string;
  zones: ZoneDef[];
  /** SVG path for simplified continent silhouette (viewBox 0 0 100 100) */
  silhouettePath: string;
  /** Unlock order — 0 = always unlocked, 6 = Antarctica (all bosses) */
  unlockOrder: number;
}

export const CONTINENTS: ContinentDef[] = [
  {
    id: "north-america",
    name: "North America",
    emoji: "🌎",
    villain: "The Keybreaker",
    villainTaunt: "No password can stop me! I've cracked them ALL, Guardian!",
    route: "/world-map/north-america",
    unlockOrder: 0,
    silhouettePath: "M30,15 L40,12 L55,10 L60,15 L58,25 L55,30 L50,35 L48,42 L45,48 L40,55 L35,60 L30,58 L25,50 L22,40 L20,30 L25,20 Z",
    zones: [
      { id: "hq", name: "HQ — Cyber Hero Command", icon: "🏠", city: "Washington D.C.", lat: 38.9, lng: -77.0, isHQ: true },
      { id: "password-peak", name: "Password Peak", icon: "🔑", city: "New York, USA", lat: 40.7, lng: -74.0 },
      { id: "encrypt-enclave", name: "Encrypt Enclave", icon: "🔐", city: "Toronto, Canada", lat: 43.7, lng: -79.4 },
      { id: "code-canyon", name: "Code Canyon", icon: "💻", city: "Chicago, USA", lat: 41.8, lng: -87.6 },
      { id: "signal-summit", name: "Signal Summit", icon: "📡", city: "Denver, USA", lat: 39.7, lng: -104.9 },
      { id: "arctic-archive", name: "Arctic Archive", icon: "🧊", city: "Vancouver, Canada", lat: 49.2, lng: -123.1 },
      { id: "pixel-port", name: "Pixel Port", icon: "📱", city: "Los Angeles, USA", lat: 34.0, lng: -118.2 },
      { id: "shadow-station", name: "Shadow Station", icon: "🌑", city: "Mexico City, Mexico", lat: 19.4, lng: -99.1 },
      { id: "boss-keybreaker", name: "Keybreaker's Vault", icon: "⚔️", city: "Rocky Mountains", lat: 39.5, lng: -106.0, isBoss: true },
    ],
  },
  {
    id: "europe",
    name: "Europe",
    emoji: "🏰",
    villain: "The Phisher King",
    villainTaunt: "Click the link, Guardian... I dare you! 🎣",
    route: "/world-map/europe",
    unlockOrder: 1,
    silhouettePath: "M35,20 L50,15 L65,18 L70,25 L68,35 L60,42 L55,45 L48,48 L40,45 L35,38 L33,30 Z",
    zones: [
      { id: "phish-lagoon", name: "Phish Lagoon", icon: "🎣", city: "London, UK", lat: 51.5, lng: -0.1 },
      { id: "download-dungeon", name: "Download Dungeon", icon: "💾", city: "Berlin, Germany", lat: 52.5, lng: 13.4 },
      { id: "code-castle", name: "Code Castle", icon: "🔐", city: "Paris, France", lat: 48.9, lng: 2.3 },
      { id: "wifi-watch", name: "WiFi Watch", icon: "📶", city: "Amsterdam, Netherlands", lat: 52.4, lng: 4.9 },
      { id: "data-fortress", name: "Data Fortress", icon: "🏰", city: "Zurich, Switzerland", lat: 47.4, lng: 8.5 },
      { id: "cyber-citadel", name: "Cyber Citadel", icon: "🛡️", city: "Madrid, Spain", lat: 40.4, lng: -3.7 },
      { id: "boss-phisher", name: "Phisher King's Lair", icon: "⚔️", city: "North Sea", lat: 56.0, lng: 3.0, isBoss: true },
    ],
  },
  {
    id: "africa",
    name: "Africa",
    emoji: "🌍",
    villain: "The Troll Lord",
    villainTaunt: "I'll make everyone feel bad online! You can't stop my trolls!",
    route: "/world-map/africa",
    unlockOrder: 2,
    silhouettePath: "M40,15 L55,12 L65,20 L68,35 L65,50 L58,60 L50,65 L42,62 L35,50 L32,35 L35,22 Z",
    zones: [
      { id: "stranger-shore", name: "Stranger Shore", icon: "👣", city: "Lagos, Nigeria", lat: 6.5, lng: 3.4 },
      { id: "dark-web-den", name: "Dark Web Den", icon: "🕸️", city: "Cairo, Egypt", lat: 30.0, lng: 31.2 },
      { id: "kindness-citadel", name: "Kindness Citadel", icon: "💙", city: "Nairobi, Kenya", lat: -1.3, lng: 36.8 },
      { id: "signal-savanna", name: "Signal Savanna", icon: "📡", city: "Accra, Ghana", lat: 5.6, lng: -0.2 },
      { id: "code-cape", name: "Code Cape", icon: "💻", city: "Cape Town, South Africa", lat: -33.9, lng: 18.4 },
      { id: "data-delta", name: "Data Delta", icon: "📊", city: "Addis Ababa, Ethiopia", lat: 9.0, lng: 38.7 },
      { id: "boss-troll", name: "Troll Lord's Bridge", icon: "⚔️", city: "Sahara Desert", lat: 23.0, lng: 12.0, isBoss: true },
    ],
  },
  {
    id: "asia",
    name: "Asia",
    emoji: "⛩️",
    villain: "The Firewall Phantom",
    villainTaunt: "Your firewalls are useless against me! I am the ghost in the machine!",
    route: "/world-map/asia",
    unlockOrder: 3,
    silhouettePath: "M25,15 L50,10 L75,15 L80,30 L75,45 L65,55 L50,58 L35,55 L25,45 L22,30 Z",
    zones: [
      { id: "privacy-palace", name: "Privacy Palace", icon: "🕵️", city: "Dubai, UAE", lat: 25.2, lng: 55.3 },
      { id: "browse-bazaar", name: "Browse Bazaar", icon: "🌐", city: "Mumbai, India", lat: 19.1, lng: 72.9 },
      { id: "firewall-frontier", name: "Firewall Frontier", icon: "🔥", city: "Seoul, South Korea", lat: 37.6, lng: 127.0 },
      { id: "cyberguard-academy", name: "CyberGuard Academy", icon: "🛡️", city: "Tokyo, Japan", lat: 35.7, lng: 139.7 },
      { id: "network-nexus", name: "Network Nexus", icon: "🌐", city: "Singapore", lat: 1.3, lng: 103.8 },
      { id: "hack-haven", name: "Hack Haven", icon: "🔓", city: "Bangkok, Thailand", lat: 13.7, lng: 100.5 },
      { id: "tech-temple", name: "Tech Temple", icon: "⛩️", city: "Beijing, China", lat: 39.9, lng: 116.4 },
      { id: "boss-phantom", name: "Phantom's Mainframe", icon: "⚔️", city: "Great Wall of China", lat: 40.4, lng: 116.6, isBoss: true },
    ],
  },
  {
    id: "south-america",
    name: "South America",
    emoji: "🌿",
    villain: "The Data Thief",
    villainTaunt: "Your data is MINE! Name, address, everything — I've got it all!",
    route: "/world-map/south-america",
    unlockOrder: 4,
    silhouettePath: "M42,10 L55,12 L60,22 L58,35 L55,50 L50,60 L45,68 L40,65 L35,55 L33,40 L35,25 L38,15 Z",
    zones: [
      { id: "kindness-kingdom", name: "Kindness Kingdom", icon: "💙", city: "São Paulo, Brazil", lat: -23.5, lng: -46.6 },
      { id: "social-fortress", name: "Social Fortress", icon: "📱", city: "Buenos Aires, Argentina", lat: -34.6, lng: -58.4 },
      { id: "identity-isle", name: "Identity Isle", icon: "🗝️", city: "Lima, Peru", lat: -12.0, lng: -77.0 },
      { id: "jungle-junction", name: "Jungle Junction", icon: "🌴", city: "Bogotá, Colombia", lat: 4.7, lng: -74.1 },
      { id: "cyber-coast", name: "Cyber Coast", icon: "🏖️", city: "Santiago, Chile", lat: -33.4, lng: -70.6 },
      { id: "boss-datathief", name: "Data Thief's Vault", icon: "⚔️", city: "Amazon Rainforest", lat: -3.0, lng: -60.0, isBoss: true },
    ],
  },
  {
    id: "australia",
    name: "Australia",
    emoji: "🦘",
    villain: "Malware Max",
    villainTaunt: "My viruses are EVERYWHERE! Your device doesn't stand a chance, mate!",
    route: "/world-map/australia",
    unlockOrder: 5,
    silhouettePath: "M25,30 L45,22 L65,25 L75,35 L72,50 L60,58 L45,60 L30,55 L22,42 Z",
    zones: [
      { id: "malware-maze", name: "Malware Maze", icon: "🦠", city: "Sydney", lat: -33.9, lng: 151.2 },
      { id: "update-outpost", name: "Update Outpost", icon: "🔄", city: "Melbourne", lat: -37.8, lng: 145.0 },
      { id: "antivirus-atoll", name: "Antivirus Atoll", icon: "🛡️", city: "Brisbane", lat: -27.5, lng: 153.0 },
      { id: "outback-ops", name: "Outback Ops", icon: "🏜️", city: "Alice Springs", lat: -23.7, lng: 133.9 },
      { id: "reef-recon", name: "Reef Recon", icon: "🐠", city: "Cairns", lat: -16.9, lng: 145.8 },
      { id: "boss-malware", name: "Malware Max's Pouch", icon: "⚔️", city: "Australian Outback", lat: -25.0, lng: 134.0, isBoss: true },
    ],
  },
  {
    id: "antarctica",
    name: "Antarctica",
    emoji: "❄️",
    villain: "SHADOWBYTE",
    villainTaunt: "Impressive, Guardian. But you've never faced ME. I am every threat combined.",
    route: "/world-map/antarctica",
    unlockOrder: 6,
    silhouettePath: "M15,45 L30,35 L50,30 L70,35 L85,45 L80,55 L65,60 L50,62 L35,60 L20,55 Z",
    zones: [
      { id: "crypto-cavern", name: "Crypto Cavern", icon: "🔬", city: "South Pole Base", lat: -90.0, lng: 0 },
      { id: "algorithm-abyss", name: "Algorithm Abyss", icon: "🧠", city: "Ice Shelf", lat: -75.0, lng: 0 },
      { id: "code-citadel", name: "Code Citadel", icon: "💻", city: "SHADOWBYTE's Fortress", lat: -80.0, lng: 45.0 },
      { id: "ice-intelligence", name: "Ice Intelligence", icon: "❄️", city: "McMurdo Station", lat: -77.8, lng: 166.7 },
      { id: "boss-shadowbyte", name: "SHADOWBYTE's Core", icon: "⚔️", city: "Center of Antarctica", lat: -85.0, lng: 0, isBoss: true },
    ],
  },
];

/** Get continent by id */
export function getContinentById(id: string): ContinentDef | undefined {
  return CONTINENTS.find((c) => c.id === id);
}

/** Unlock order: which continents must be beaten to unlock this one */
export function getContinentUnlockRequirements(continentId: string): string[] {
  const continent = getContinentById(continentId);
  if (!continent) return [];
  if (continent.unlockOrder === 0) return []; // North America always unlocked
  if (continent.unlockOrder === 6) {
    // Antarctica requires ALL 6 others
    return CONTINENTS.filter((c) => c.unlockOrder >= 0 && c.unlockOrder < 6).map((c) => c.id);
  }
  // Sequential: requires the previous continent boss defeated
  const prev = CONTINENTS.find((c) => c.unlockOrder === continent.unlockOrder - 1);
  return prev ? [prev.id] : [];
}
