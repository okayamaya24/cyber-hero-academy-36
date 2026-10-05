/**
 * Picture passwords: each student taps 2 of these pictures, in order, to log in
 * with their class code. Stored as "id,id" (e.g. "dog,pizza").
 * Keep ids in sync with supabase/functions/class-login/index.ts.
 */

export const PICTURES = [
  { id: "dog", emoji: "🐶", label: "Dog" },
  { id: "cat", emoji: "🐱", label: "Cat" },
  { id: "frog", emoji: "🐸", label: "Frog" },
  { id: "pizza", emoji: "🍕", label: "Pizza" },
  { id: "icecream", emoji: "🍦", label: "Ice cream" },
  { id: "ball", emoji: "⚽", label: "Ball" },
  { id: "rocket", emoji: "🚀", label: "Rocket" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow" },
  { id: "star", emoji: "⭐", label: "Star" },
] as const;

export type PictureId = (typeof PICTURES)[number]["id"];

export const PICTURE_PASSWORD_LENGTH = 2;

export function generatePicturePassword(): string {
  const buf = new Uint32Array(PICTURE_PASSWORD_LENGTH);
  crypto.getRandomValues(buf);
  // 2^32 isn't a multiple of 9, but the bias (< 1 in 400 million) doesn't matter here
  return Array.from(buf, (n) => PICTURES[n % PICTURES.length].id).join(",");
}

export function picturesToEmoji(pictures: string): string {
  return pictures
    .split(",")
    .map((id) => PICTURES.find((p) => p.id === id)?.emoji ?? "❓")
    .join(" ");
}

export function picturesToLabel(pictures: string): string {
  return pictures
    .split(",")
    .map((id) => PICTURES.find((p) => p.id === id)?.label ?? id)
    .join(" then ");
}
