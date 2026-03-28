/* ─── Geographic config for react-simple-maps continent rendering ─── */
export const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/** ISO-3166-1 numeric country codes per continent */
export const CONTINENT_COUNTRIES: Record<string, string[]> = {
  "north-america": ["840", "124", "484", "192", "332", "388", "320", "188", "558", "591", "222", "340", "214", "630"],
  europe: [
    "826",
    "276",
    "250",
    "724",
    "380",
    "620",
    "528",
    "056",
    "756",
    "040",
    "752",
    "578",
    "208",
    "246",
    "616",
    "203",
    "300",
    "642",
    "348",
    "372",
    "804",
    "112",
    "643",
  ],
  africa: [
    "566",
    "818",
    "404",
    "710",
    "012",
    "504",
    "788",
    "516",
    "072",
    "800",
    "834",
    "231",
    "706",
    "288",
    "384",
    "180",
    "178",
    "024",
    "508",
    "450",
    "562",
    "466",
    "854",
    "120",
    "148",
    "694",
    "736",
    "716",
    "226",
    "266",
    "140",
    "646",
    "768",
    "204",
    "270",
    "624",
    "232",
    "262",
    "174",
  ],
  asia: [
    "784",
    "356",
    "410",
    "392",
    "156",
    "682",
    "364",
    "050",
    "764",
    "704",
    "458",
    "360",
    "608",
    "524",
    "144",
    "586",
    "760",
    "368",
    "400",
    "792",
    "398",
    "860",
    "496",
    "408",
    "116",
    "418",
    "104",
    "634",
    "512",
    "414",
    "048",
    "275",
    "422",
  ],
  "south-america": ["076", "032", "604", "152", "170", "858", "068", "600", "218", "862", "328", "740", "254"],
  australia: ["036", "554", "598", "242", "090", "548", "540"],
  antarctica: ["010"],
};

/** Projection settings per continent — center + scale for ComposableMap */
export const CONTINENT_PROJECTIONS: Record<string, { center: [number, number]; scale: number }> = {
  "north-america": { center: [-93, 37], scale: 580 },
  europe: { center: [12, 53], scale: 900 },
  africa: { center: [22, 2], scale: 360 },
  asia: { center: [90, 35], scale: 300 },
  "south-america": { center: [-60, -15], scale: 400 },
  australia: { center: [134, -28], scale: 520 },
  antarctica: { center: [0, -85], scale: 280 },
};

/** Zone coordinates per continent — matches continents.ts zone ids */
export const ZONE_COORDINATES: Record<string, { id: string; lat: number; lng: number }[]> = {
  "north-america": [
    { id: "hq", lat: 32.8, lng: -96.8 }, // Dallas, Texas
    { id: "password-peak", lat: 40.7, lng: -74.0 }, // New York, USA
    { id: "encrypt-enclave", lat: 43.7, lng: -79.4 }, // Toronto, Canada
    { id: "code-canyon", lat: 44.9, lng: -93.1 }, // Minneapolis
    { id: "signal-summit", lat: 39.7, lng: -104.9 }, // Denver
    { id: "arctic-archive", lat: 49.2, lng: -123.1 }, // Vancouver, Canada
    { id: "pixel-port", lat: 34.0, lng: -118.2 }, // Los Angeles
    { id: "shadow-station", lat: 19.4, lng: -99.1 }, // Mexico City, Mexico
    { id: "boss-keybreaker", lat: 47.5, lng: -107.0 }, // Montana
  ],
  europe: [
    { id: "phish-lagoon", lat: 51.5, lng: -0.1 }, // London, UK — far west
    { id: "code-castle", lat: 48.9, lng: 2.3 }, // Paris, France — west
    { id: "cyber-citadel", lat: 40.4, lng: -3.7 }, // Madrid, Spain — southwest
    { id: "download-dungeon", lat: 54.7, lng: 25.3 }, // Vilnius, Lithuania — northeast
    { id: "wifi-watch", lat: 59.3, lng: 18.1 }, // Stockholm, Sweden — north
    { id: "data-fortress", lat: 44.8, lng: 20.5 }, // Belgrade, Serbia — southeast
    { id: "boss-phisher", lat: 41.9, lng: 12.5 }, // Rome, Italy — south center
  ],
  africa: [
    { id: "stranger-shore", lat: 6.5, lng: 3.4 },
    { id: "dark-web-den", lat: 30.0, lng: 31.2 },
    { id: "kindness-citadel", lat: -1.3, lng: 36.8 },
    { id: "signal-savanna", lat: 5.6, lng: -0.2 },
    { id: "code-cape", lat: -33.9, lng: 18.4 },
    { id: "data-delta", lat: 9.0, lng: 38.7 },
    { id: "boss-troll", lat: 23.0, lng: 12.0 },
  ],
  asia: [
    { id: "privacy-palace", lat: 25.2, lng: 55.3 },
    { id: "browse-bazaar", lat: 19.1, lng: 72.9 },
    { id: "firewall-frontier", lat: 37.6, lng: 127.0 },
    { id: "cyberguard-academy", lat: 35.7, lng: 139.7 },
    { id: "network-nexus", lat: 1.3, lng: 103.8 },
    { id: "hack-haven", lat: 13.7, lng: 100.5 },
    { id: "tech-temple", lat: 39.9, lng: 116.4 },
    { id: "boss-phantom", lat: 28.0, lng: 86.9 },
  ],
  "south-america": [
    { id: "kindness-kingdom", lat: -23.5, lng: -46.6 },
    { id: "social-fortress", lat: -34.6, lng: -58.4 },
    { id: "identity-isle", lat: -12.0, lng: -77.0 },
    { id: "jungle-junction", lat: 4.7, lng: -74.1 },
    { id: "cyber-coast", lat: -33.4, lng: -70.6 },
    { id: "boss-datathief", lat: -3.0, lng: -60.0 },
  ],
  australia: [
    { id: "malware-maze", lat: -33.9, lng: 151.2 },
    { id: "update-outpost", lat: -37.8, lng: 145.0 },
    { id: "antivirus-atoll", lat: -27.5, lng: 153.0 },
    { id: "outback-ops", lat: -23.7, lng: 133.9 },
    { id: "reef-recon", lat: -16.9, lng: 145.8 },
    { id: "boss-malware", lat: -25.0, lng: 134.0 },
  ],
  antarctica: [
    { id: "crypto-cavern", lat: -80.0, lng: -45.0 },
    { id: "algorithm-abyss", lat: -82.0, lng: 0.0 },
    { id: "code-citadel", lat: -84.0, lng: 45.0 },
    { id: "ice-intelligence", lat: -77.8, lng: 166.7 },
    { id: "boss-shadowbyte", lat: -89.0, lng: 0.0 },
  ],
};
