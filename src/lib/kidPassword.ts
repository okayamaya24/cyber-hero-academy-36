/**
 * Random, kid-friendly passwords for teacher-created student accounts,
 * e.g. "brave-tiger-482". Easy for an 8-year-old to type, but not guessable
 * from the student's name or username.
 */

const ADJECTIVES = [
  "brave", "bright", "calm", "clever", "cosmic", "cozy", "daring", "eager",
  "fancy", "fast", "fierce", "fluffy", "friendly", "fuzzy", "gentle", "giant",
  "glowing", "golden", "happy", "jolly", "kind", "lucky", "magic", "mighty",
  "neon", "noble", "orange", "polite", "proud", "purple", "quick", "quiet",
  "rapid", "rocket", "royal", "rusty", "shiny", "silly", "silver", "sleepy",
  "smart", "snowy", "speedy", "sunny", "super", "swift", "tiny", "turbo",
];

const ANIMALS = [
  "badger", "bear", "beaver", "bunny", "camel", "cheetah", "dolphin", "dragon",
  "eagle", "falcon", "ferret", "fox", "gecko", "giraffe", "gorilla", "hamster",
  "hawk", "hippo", "iguana", "jaguar", "koala", "lemur", "lion", "llama",
  "lobster", "moose", "narwhal", "octopus", "otter", "owl", "panda", "parrot",
  "penguin", "puffin", "rabbit", "raccoon", "rhino", "robin", "salmon", "seal",
  "shark", "sloth", "tiger", "toucan", "turtle", "walrus", "whale", "zebra",
];

function randomInt(max: number): number {
  // Rejection sampling so every value is equally likely
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

export function generateKidPassword(): string {
  const adjective = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const animal = ANIMALS[randomInt(ANIMALS.length)];
  const number = String(randomInt(900) + 100);
  return `${adjective}-${animal}-${number}`;
}
