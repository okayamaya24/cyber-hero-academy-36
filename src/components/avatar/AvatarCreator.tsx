import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import AvatarRenderer from "./AvatarRenderer";
import {
  type AvatarConfig,
  DEFAULT_AVATAR,
  SKIN_TONES,
  HAIR_COLORS,
  SUIT_COLORS,
  CHARACTER_TYPES,
  HAIR_STYLES,
  ACCESSORIES,
} from "./avatarConfig";

interface AvatarCreatorProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  saving?: boolean;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wide">{children}</h3>;
}

function ColorButton({ color, selected, onClick, label }: { color: string; selected: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative h-10 w-10 rounded-full transition-all ${
        selected ? "ring-3 ring-primary ring-offset-2 ring-offset-background" : "hover:ring-2 hover:ring-primary/30 hover:ring-offset-1"
      }`}
      style={{ backgroundColor: color }}
      title={label}
    >
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow-md">✓</span>
      )}
    </motion.button>
  );
}

function OptionButton({ selected, onClick, children, className = "" }: { selected: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 transition-all text-center ${
        selected ? "border-primary bg-primary/10 shadow-playful" : "border-border bg-card hover:border-primary/40"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

export default function AvatarCreator({ initialConfig, onSave, saving }: AvatarCreatorProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_AVATAR);

  const update = (partial: Partial<AvatarConfig>) => setConfig((c) => ({ ...c, ...partial }));

  return (
    <div className="space-y-6">
      {/* Large Avatar Preview */}
      <div className="flex justify-center">
        <motion.div
          key={JSON.stringify(config)}
          initial={{ scale: 0.95, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="rounded-full shadow-playful bg-card p-2"
        >
          <AvatarRenderer config={config} size={180} />
        </motion.div>
      </div>

      <div className="space-y-5 rounded-2xl border bg-card p-5 shadow-card">
        {/* Character Type */}
        <div>
          <SectionTitle>Character Type</SectionTitle>
          <div className="grid grid-cols-4 gap-2">
            {CHARACTER_TYPES.map((ct) => (
              <OptionButton key={ct.type} selected={config.characterType === ct.type} onClick={() => update({ characterType: ct.type, hairStyle: ct.type === "robot" ? "none" : config.hairStyle === "none" ? "short" : config.hairStyle })}>
                <span className="text-2xl">{ct.emoji}</span>
                <span className="text-[11px] font-semibold">{ct.label}</span>
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Skin Tone (hide for robot) */}
        {config.characterType !== "robot" && (
          <div>
            <SectionTitle>Skin Tone</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {SKIN_TONES.map((s) => (
                <ColorButton key={s.color} color={s.color} label={s.label} selected={config.skinTone === s.color} onClick={() => update({ skinTone: s.color })} />
              ))}
            </div>
          </div>
        )}

        {/* Hair Style (hide for robot) */}
        {config.characterType !== "robot" && (
          <div>
            <SectionTitle>Hair Style</SectionTitle>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {HAIR_STYLES.map((h) => (
                <OptionButton key={h.style} selected={config.hairStyle === h.style} onClick={() => update({ hairStyle: h.style })}>
                  <span className="text-[11px] font-semibold">{h.label}</span>
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {/* Hair Color (hide for robot) */}
        {config.characterType !== "robot" && (
          <div>
            <SectionTitle>Hair Color</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {HAIR_COLORS.map((h) => (
                <ColorButton key={h.color} color={h.color} label={h.label} selected={config.hairColor === h.color} onClick={() => update({ hairColor: h.color })} />
              ))}
            </div>
          </div>
        )}

        {/* Hero Suit Color */}
        <div>
          <SectionTitle>Hero Suit Color</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {SUIT_COLORS.map((s) => (
              <ColorButton key={s.color} color={s.color} label={s.label} selected={config.suitColor === s.color} onClick={() => update({ suitColor: s.color })} />
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div>
          <SectionTitle>Accessory</SectionTitle>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ACCESSORIES.map((a) => (
              <OptionButton key={a.type} selected={config.accessory === a.type} onClick={() => update({ accessory: a.type })}>
                <span className="text-xl">{a.emoji}</span>
                <span className="text-[10px] font-semibold">{a.label}</span>
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="hero"
        size="lg"
        className="w-full text-base"
        disabled={saving}
        onClick={() => onSave(config)}
      >
        <Save className="mr-2 h-5 w-5" />
        {saving ? "Saving..." : "Save My Hero!"}
      </Button>
    </div>
  );
}
