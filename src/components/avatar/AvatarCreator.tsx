import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import AvatarRenderer from "./AvatarRenderer";
import {
  type AvatarConfig,
  DEFAULT_AVATAR,
  SKIN_TONES,
  HAIR_COLORS,
  SUIT_COLORS,
  CHARACTER_TYPES,
  BOY_HAIR_STYLES,
  GIRL_HAIR_STYLES,
  ACCESSORIES,
} from "./avatarConfig";

interface AvatarCreatorProps {
  initialConfig?: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  saving?: boolean;
}

function SectionTitle({ children, emoji }: { children: React.ReactNode; emoji?: string }) {
  return (
    <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-bold text-foreground">
      {emoji && <span className="text-base">{emoji}</span>}
      {children}
    </h3>
  );
}

function ColorButton({
  color,
  selected,
  onClick,
  label,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`relative h-11 w-11 rounded-full border-2 transition-all ${
        selected
          ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background shadow-playful"
          : "border-transparent hover:border-primary/30"
      }`}
      style={{ backgroundColor: color }}
      title={label}
      aria-label={label}
    >
      {selected && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
          ✓
        </span>
      )}
    </motion.button>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all ${
        selected
          ? "border-primary bg-primary/10 shadow-playful"
          : "border-border bg-card hover:border-primary/30 hover:bg-muted/50"
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

export default function AvatarCreator({ initialConfig, onSave, saving }: AvatarCreatorProps) {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || DEFAULT_AVATAR);

  const activeHairStyles = useMemo(() => {
    return config.characterType === "girl" ? GIRL_HAIR_STYLES : BOY_HAIR_STYLES;
  }, [config.characterType]);

  const update = (partial: Partial<AvatarConfig>) => {
    setConfig((current) => ({ ...current, ...partial }));
  };

  const handleCharacterTypeChange = (type: AvatarConfig["characterType"]) => {
    const defaultHairStyle = type === "girl" ? "bob" : "short";

    setConfig((current) => ({
      ...current,
      characterType: type,
      hairStyle: defaultHairStyle,
      accessory: current.accessory === "headband" && type === "boy" ? "none" : current.accessory,
    }));
  };

  const hairPreviewConfig = (style: AvatarConfig["hairStyle"]): AvatarConfig => ({
    ...config,
    hairStyle: style,
    accessory: "none",
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <motion.div
          key={JSON.stringify(config)}
          initial={{ scale: 0.9, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, type: "spring", stiffness: 200 }}
          className="rounded-3xl border-4 border-primary/20 bg-gradient-to-b from-card to-muted/50 p-4 shadow-playful"
        >
          <AvatarRenderer config={config} size={140} />
        </motion.div>
      </div>

      <div className="space-y-5 rounded-3xl border-2 border-border bg-card p-5 shadow-card">
        <div>
          <SectionTitle emoji="🦸">Choose Your Hero</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {CHARACTER_TYPES.map((ct) => (
              <OptionButton
                key={ct.type}
                selected={config.characterType === ct.type}
                onClick={() => handleCharacterTypeChange(ct.type)}
              >
                <div className="flex h-16 w-12 items-center justify-center overflow-hidden">
                  <AvatarRenderer
                    config={{
                      ...config,
                      characterType: ct.type,
                      hairStyle: ct.type === "girl" ? "bob" : "short",
                      accessory: "none",
                    }}
                    size={48}
                  />
                </div>
                <span className="text-xs font-bold">{ct.label}</span>
              </OptionButton>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle emoji="🎨">Skin Tone</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {SKIN_TONES.map((s) => (
              <ColorButton
                key={s.color}
                color={s.color}
                label={s.label}
                selected={config.skinTone === s.color}
                onClick={() => update({ skinTone: s.color })}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionTitle emoji="💇">
            {config.characterType === "girl" ? "Girl Hair Style" : "Boy Hair Style"}
          </SectionTitle>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {activeHairStyles.map((h) => (
              <OptionButton
                key={h.style}
                selected={config.hairStyle === h.style}
                onClick={() => update({ hairStyle: h.style })}
              >
                <div className="flex h-9 w-9 items-center justify-center">
                  <AvatarRenderer config={hairPreviewConfig(h.style)} size={36} />
                </div>
                <span className="text-[10px] font-bold">{h.label}</span>
              </OptionButton>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle emoji="🖌️">Hair Color</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {HAIR_COLORS.map((h) => (
              <ColorButton
                key={h.color}
                color={h.color}
                label={h.label}
                selected={config.hairColor === h.color}
                onClick={() => update({ hairColor: h.color })}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionTitle emoji="🛡️">Suit Color</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {SUIT_COLORS.map((s) => (
              <ColorButton
                key={s.color}
                color={s.color}
                label={s.label}
                selected={config.suitColor === s.color}
                onClick={() => update({ suitColor: s.color })}
              />
            ))}
          </div>
        </div>

        <div>
          <SectionTitle emoji="⚡">Accessory</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {ACCESSORIES.map((a) => (
              <OptionButton
                key={a.type}
                selected={config.accessory === a.type}
                onClick={() => update({ accessory: a.type })}
              >
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
        className="w-full gap-2 text-base"
        disabled={saving}
        onClick={() => onSave(config)}
      >
        <Sparkles className="h-5 w-5" />
        {saving ? "Creating Hero..." : "Save My Hero!"}
      </Button>
    </div>
  );
}
