import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Save, Sparkles } from "lucide-react";
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

function SectionTitle({ children, emoji }: { children: React.ReactNode; emoji?: string }) {
  return (
    <h3 className="text-sm font-bold text-foreground mb-2.5 flex items-center gap-1.5">
      {emoji && <span className="text-base">{emoji}</span>}
      {children}
    </h3>
  );
}

function ColorButton({ color, selected, onClick, label }: { color: string; selected: boolean; onClick: () => void; label: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative h-11 w-11 rounded-full transition-all border-2 ${
        selected ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-playful" : "border-transparent hover:border-primary/30"
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
      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-all text-center ${
        selected ? "border-primary bg-primary/10 shadow-playful" : "border-border bg-card hover:border-primary/30 hover:bg-muted/50"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

export default function AvatarCreator({ initialConfig, onSave, saving }: AvatarCreatorProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_AVATAR);

  const update = (partial: Partial<AvatarConfig>) => setConfig((c) => ({ ...c, ...partial }));

  const hairPreviewConfig = (style: AvatarConfig["hairStyle"]): AvatarConfig => ({
    ...config,
    hairStyle: style,
    accessory: "none",
  });

  return (
    <div className="space-y-6">
      {/* Large Avatar Preview */}
      <div className="flex justify-center">
        <motion.div
          key={JSON.stringify(config)}
          initial={{ scale: 0.9, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, type: "spring", stiffness: 200 }}
          className="rounded-full shadow-playful bg-card p-2 border-4 border-primary/20"
        >
          <AvatarRenderer config={config} size={180} />
        </motion.div>
      </div>

      <div className="space-y-5 rounded-3xl border-2 border-border bg-card p-5 shadow-card">
        {/* Character Type */}
        <div>
          <SectionTitle emoji="🦸">Choose Your Hero</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            {CHARACTER_TYPES.map((ct) => (
              <OptionButton
                key={ct.type}
                selected={config.characterType === ct.type}
                onClick={() => update({ characterType: ct.type })}
              >
                <div className="w-14 h-14 flex items-center justify-center">
                  <AvatarRenderer
                    config={{ ...config, characterType: ct.type, accessory: "none" }}
                    size={56}
                  />
                </div>
                <span className="text-xs font-bold">{ct.label}</span>
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Skin Tone */}
        <div>
          <SectionTitle emoji="🎨">Skin Tone</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {SKIN_TONES.map((s) => (
              <ColorButton key={s.color} color={s.color} label={s.label} selected={config.skinTone === s.color} onClick={() => update({ skinTone: s.color })} />
            ))}
          </div>
        </div>

        {/* Hair Style */}
        <div>
          <SectionTitle emoji="💇">Hair Style</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {HAIR_STYLES.map((h) => (
              <OptionButton key={h.style} selected={config.hairStyle === h.style} onClick={() => update({ hairStyle: h.style })}>
                <div className="w-9 h-9 flex items-center justify-center">
                  <AvatarRenderer config={hairPreviewConfig(h.style)} size={36} />
                </div>
                <span className="text-[10px] font-bold">{h.label}</span>
              </OptionButton>
            ))}
          </div>
        </div>

        {/* Hair Color */}
        <div>
          <SectionTitle emoji="🖌️">Hair Color</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {HAIR_COLORS.map((h) => (
              <ColorButton key={h.color} color={h.color} label={h.label} selected={config.hairColor === h.color} onClick={() => update({ hairColor: h.color })} />
            ))}
          </div>
        </div>

        {/* Hero Suit Color */}
        <div>
          <SectionTitle emoji="🛡️">Suit Color</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {SUIT_COLORS.map((s) => (
              <ColorButton key={s.color} color={s.color} label={s.label} selected={config.suitColor === s.color} onClick={() => update({ suitColor: s.color })} />
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div>
          <SectionTitle emoji="⚡">Accessory</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {ACCESSORIES.map((a) => (
              <OptionButton key={a.type} selected={config.accessory === a.type} onClick={() => update({ accessory: a.type })}>
                <span className="text-xl">{a.emoji}</span>
                <span className="text-[10px] font-bold">{a.label}</span>
              </OptionButton>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="hero"
        size="lg"
        className="w-full text-base gap-2"
        disabled={saving}
        onClick={() => onSave(config)}
      >
        <Sparkles className="h-5 w-5" />
        {saving ? "Creating Hero..." : "Save My Hero!"}
      </Button>
    </div>
  );
}
