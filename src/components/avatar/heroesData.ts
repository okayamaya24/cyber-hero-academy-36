// 160 hero sprites: 8 characters × 5 suit colors × 4 accessory states.
// Images live in public/heroes/<key>.webp so browsers only download the ones
// they show. (They used to be base64 text in this file: 77 MB in every page load.)

const HERO_KEYS = [
  "boy-black-blue", "boy-black-green", "boy-black-pink", "boy-black-purple",
  "boy-black-teal", "boy-dark-blue", "boy-dark-green", "boy-dark-pink",
  "boy-dark-purple", "boy-dark-teal", "boy-light-blue", "boy-light-green",
  "boy-light-pink", "boy-light-purple", "boy-light-teal", "girl-brown-blue",
  "girl-brown-green", "girl-brown-pink", "girl-brown-purple", "girl-brown-teal",
  "girl-light-blue", "girl-light-green", "girl-light-pink", "girl-light-purple",
  "girl-light-teal", "girl-puffs-blue", "girl-puffs-green", "girl-puffs-pink",
  "girl-puffs-purple", "girl-puffs-teal", "boy-tan-blue", "boy-tan-green",
  "boy-tan-pink", "boy-tan-purple", "boy-tan-teal", "girl-tan-blue",
  "girl-tan-green", "girl-tan-pink", "girl-tan-purple", "girl-tan-teal",
  "girl-puffs-magnifier-blue", "girl-puffs-magnifier-green", "girl-puffs-magnifier-pink", "girl-puffs-magnifier-purple",
  "girl-puffs-magnifier-teal", "girl-puffs-shield-blue", "girl-puffs-shield-green", "girl-puffs-shield-pink",
  "girl-puffs-shield-purple", "girl-puffs-shield-teal", "girl-puffs-tablet-blue", "girl-puffs-tablet-green",
  "girl-puffs-tablet-pink", "girl-puffs-tablet-purple", "girl-puffs-tablet-teal", "girl-light-magnifier-blue",
  "girl-light-magnifier-green", "girl-light-magnifier-pink", "girl-light-magnifier-purple", "girl-light-magnifier-teal",
  "girl-light-shield-blue", "girl-light-shield-green", "girl-light-shield-pink", "girl-light-shield-purple",
  "girl-light-shield-teal", "girl-light-tablet-blue", "girl-light-tablet-green", "girl-light-tablet-pink",
  "girl-light-tablet-purple", "girl-light-tablet-teal", "boy-dark-magnifier-blue", "boy-dark-magnifier-green",
  "boy-dark-magnifier-pink", "boy-dark-magnifier-purple", "boy-dark-magnifier-teal", "boy-dark-shield-blue",
  "boy-dark-shield-green", "boy-dark-shield-pink", "boy-dark-shield-purple", "boy-dark-shield-teal",
  "boy-dark-tablet-blue", "boy-dark-tablet-green", "boy-dark-tablet-pink", "boy-dark-tablet-purple",
  "boy-dark-tablet-teal", "boy-tan-magnifier-blue", "boy-tan-magnifier-green", "boy-tan-magnifier-pink",
  "boy-tan-magnifier-purple", "boy-tan-magnifier-teal", "boy-tan-shield-blue", "boy-tan-shield-green",
  "boy-tan-shield-pink", "boy-tan-shield-purple", "boy-tan-shield-teal", "boy-tan-tablet-blue",
  "boy-tan-tablet-green", "boy-tan-tablet-pink", "boy-tan-tablet-purple", "boy-tan-tablet-teal",
  "boy-light-magnifier-blue", "boy-light-magnifier-green", "boy-light-magnifier-pink", "boy-light-magnifier-purple",
  "boy-light-magnifier-teal", "boy-light-shield-blue", "boy-light-shield-green", "boy-light-shield-pink",
  "boy-light-shield-purple", "boy-light-shield-teal", "boy-light-tablet-blue", "boy-light-tablet-green",
  "boy-light-tablet-pink", "boy-light-tablet-purple", "boy-light-tablet-teal", "boy-black-shield-blue",
  "boy-black-shield-green", "boy-black-shield-pink", "boy-black-shield-purple", "boy-black-shield-teal",
  "boy-black-tablet-blue", "boy-black-tablet-green", "boy-black-tablet-pink", "boy-black-tablet-purple",
  "boy-black-tablet-teal", "boy-black-magnifier-blue", "boy-black-magnifier-green", "boy-black-magnifier-pink",
  "boy-black-magnifier-purple", "boy-black-magnifier-teal", "girl-tan-magnifier-blue", "girl-tan-magnifier-green",
  "girl-tan-magnifier-pink", "girl-tan-magnifier-purple", "girl-tan-magnifier-teal", "girl-tan-shield-blue",
  "girl-tan-shield-green", "girl-tan-shield-pink", "girl-tan-shield-purple", "girl-tan-shield-teal",
  "girl-tan-tablet-blue", "girl-tan-tablet-green", "girl-tan-tablet-pink", "girl-tan-tablet-purple",
  "girl-tan-tablet-teal", "girl-brown-magnifier-blue", "girl-brown-magnifier-green", "girl-brown-magnifier-pink",
  "girl-brown-magnifier-purple", "girl-brown-magnifier-teal", "girl-brown-shield-blue", "girl-brown-shield-green",
  "girl-brown-shield-pink", "girl-brown-shield-purple", "girl-brown-shield-teal", "girl-brown-tablet-blue",
  "girl-brown-tablet-green", "girl-brown-tablet-pink", "girl-brown-tablet-purple", "girl-brown-tablet-teal",
];

// Bump when the images change so browsers don't keep showing cached old versions
const HERO_IMAGE_VERSION = 2;

export const HEROES: Record<string, string> = Object.fromEntries(
  HERO_KEYS.map((key) => [key, `/heroes/${key}.webp?v=${HERO_IMAGE_VERSION}`]),
);

// Which character art each skin tone + gender uses (mirrors SKINS in CyberHeroCreator)
const SKIN_CHARS: Record<string, { girl: string; boy: string }> = {
  light: { girl: "girl-light", boy: "boy-light" },
  tan: { girl: "girl-tan", boy: "boy-tan" },
  brown: { girl: "girl-brown", boy: "boy-dark" },
  dark: { girl: "girl-puffs", boy: "boy-black" },
};

/** Hero image URL from a saved avatar config (gender, skin, suitKey, accessory). */
export function heroUrlFromConfig(config: Record<string, unknown> | null | undefined): string | null {
  if (!config) return null;
  const { gender, skin, suitKey, accessory } = config as Record<string, string | undefined>;
  const char = skin && (gender === "girl" || gender === "boy") ? SKIN_CHARS[skin]?.[gender] : undefined;
  if (!char || !suitKey) return null;
  const key = !accessory || accessory === "none" ? `${char}-${suitKey}` : `${char}-${accessory}-${suitKey}`;
  return HEROES[key] ?? HEROES[`${char}-${suitKey}`] ?? null;
}
