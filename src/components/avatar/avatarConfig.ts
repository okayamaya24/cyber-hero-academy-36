export interface AvatarConfig {
  characterType: "boy" | "girl" | "hero";
  skinTone: string;
  hairStyle: "short" | "curly" | "long" | "braids" | "ponytail" | "afro" | "none";
  hairColor: string;
  suitColor: string;
  accessory: "none" | "headband" | "goggles" | "magnifying-glass" | "tablet";
}

export const DEFAULT_AVATAR: AvatarConfig = {
  characterType: "boy",
  skinTone: "#F5C6A0",
  hairStyle: "short",
  hairColor: "#3B2417",
  suitColor: "#3B82F6",
  accessory: "none",
};

export const SKIN_TONES = [
  { color: "#FDDCB5", label: "Light" },
  { color: "#F5C6A0", label: "Fair" },
  { color: "#E8A978", label: "Medium" },
  { color: "#C68642", label: "Tan" },
  { color: "#8D5524", label: "Brown" },
  { color: "#5C3317", label: "Dark" },
];

export const HAIR_COLORS = [
  { color: "#1A1A1A", label: "Black" },
  { color: "#3B2417", label: "Brown" },
  { color: "#D4A74A", label: "Blonde" },
  { color: "#C0392B", label: "Red" },
  { color: "#9B59B6", label: "Purple" },
  { color: "#2ECC71", label: "Green" },
  { color: "#3498DB", label: "Blue" },
];

export const SUIT_COLORS = [
  { color: "#3B82F6", label: "Blue" },
  { color: "#10B981", label: "Green" },
  { color: "#8B5CF6", label: "Purple" },
  { color: "#EC4899", label: "Pink" },
  { color: "#14B8A6", label: "Teal" },
];

export const CHARACTER_TYPES = [
  { type: "boy" as const, label: "Boy", emoji: "👦" },
  { type: "girl" as const, label: "Girl", emoji: "👧" },
  { type: "hero" as const, label: "Hero", emoji: "⭐" },
];

export const HAIR_STYLES = [
  { style: "short" as const, label: "Short" },
  { style: "curly" as const, label: "Curly" },
  { style: "long" as const, label: "Long" },
  { style: "braids" as const, label: "Braids" },
  { style: "ponytail" as const, label: "Ponytail" },
  { style: "afro" as const, label: "Afro" },
];

export const ACCESSORIES = [
  { type: "none" as const, label: "None", emoji: "❌" },
  { type: "headband" as const, label: "Headband", emoji: "🎀" },
  { type: "goggles" as const, label: "Goggles", emoji: "🥽" },
  { type: "magnifying-glass" as const, label: "Magnifier", emoji: "🔍" },
  { type: "tablet" as const, label: "Tablet", emoji: "📱" },
];
