/**
 * BinaryButtons — Two large tap targets for binary-choice games.
 * Works for: Safe/Unsafe, Real/Fake, Strong/Weak, True/False, Yes/No.
 *
 * Usage:
 *   <BinaryButtons
 *     optionA={{ label: 'Safe', icon: '🛡️', color: 'green' }}
 *     optionB={{ label: 'Unsafe', icon: '⚠️', color: 'red' }}
 *     onSelect={(which) => handleAnswer(which)}
 *   />
 */

import { motion } from 'framer-motion';
import type { BinaryOption } from './types';

interface BinaryButtonsProps {
  optionA: BinaryOption;
  optionB: BinaryOption;
  /** 'a' or 'b' — which was selected */
  onSelect: (choice: 'a' | 'b') => void;
  /** Disable both buttons (e.g. during feedback) */
  disabled?: boolean;
  /** Layout: 'row' side-by-side or 'column' stacked (default 'row') */
  layout?: 'row' | 'column';
  /** Button size preset (default 'md') */
  size?: 'sm' | 'md' | 'lg';
}

const COLOR_MAP = {
  green: {
    base: 'bg-green-500/20 border-green-500/60 text-green-300',
    hover: 'hover:bg-green-500/35 hover:border-green-400',
    glow: 'rgba(74,222,128,0.3)',
    active: 'active:bg-green-500/50',
  },
  red: {
    base: 'bg-red-500/20 border-red-500/60 text-red-300',
    hover: 'hover:bg-red-500/35 hover:border-red-400',
    glow: 'rgba(239,68,68,0.3)',
    active: 'active:bg-red-500/50',
  },
  cyan: {
    base: 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300',
    hover: 'hover:bg-cyan-500/35 hover:border-cyan-400',
    glow: 'rgba(34,211,238,0.3)',
    active: 'active:bg-cyan-500/50',
  },
  orange: {
    base: 'bg-orange-500/20 border-orange-500/60 text-orange-300',
    hover: 'hover:bg-orange-500/35 hover:border-orange-400',
    glow: 'rgba(251,146,60,0.3)',
    active: 'active:bg-orange-500/50',
  },
};

const SIZE_MAP = {
  sm: { wrapper: 'gap-3', btn: 'py-3 px-5 rounded-2xl', icon: 'text-3xl', label: 'text-sm' },
  md: { wrapper: 'gap-4', btn: 'py-5 px-6 rounded-2xl', icon: 'text-4xl', label: 'text-base' },
  lg: { wrapper: 'gap-4', btn: 'py-7 px-8 rounded-3xl', icon: 'text-5xl', label: 'text-lg' },
};

interface ButtonProps {
  option: BinaryOption;
  choice: 'a' | 'b';
  onSelect: (choice: 'a' | 'b') => void;
  disabled: boolean;
  sizeKey: 'sm' | 'md' | 'lg';
}

function Btn({ option, choice, onSelect, disabled, sizeKey }: ButtonProps) {
  const color = option.color ?? 'cyan';
  const c = COLOR_MAP[color];
  const s = SIZE_MAP[sizeKey];

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.94 }}
      whileHover={disabled ? {} : { scale: 1.03 }}
      onClick={() => !disabled && onSelect(choice)}
      disabled={disabled}
      className={`
        flex-1 flex flex-col items-center justify-center gap-2 border-2
        font-black transition-colors select-none
        ${c.base} ${c.hover} ${c.active}
        ${s.btn}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        fontFamily: 'var(--font-display)',
        boxShadow: disabled ? undefined : `0 4px 24px ${c.glow}`,
      }}
    >
      {option.icon && (
        <span className={`${s.icon} leading-none`} aria-hidden>
          {option.icon}
        </span>
      )}
      <span className={`${s.label} leading-tight`}>{option.label}</span>
    </motion.button>
  );
}

export default function BinaryButtons({
  optionA,
  optionB,
  onSelect,
  disabled = false,
  layout = 'row',
  size = 'md',
}: BinaryButtonsProps) {
  const s = SIZE_MAP[size];
  const flexDir = layout === 'row' ? 'flex-row' : 'flex-col';

  return (
    <div className={`flex ${flexDir} ${s.wrapper} w-full`}>
      <Btn option={optionA} choice="a" onSelect={onSelect} disabled={disabled} sizeKey={size} />
      <Btn option={optionB} choice="b" onSelect={onSelect} disabled={disabled} sizeKey={size} />
    </div>
  );
}
