import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';

export interface UserAvatarProps {
  name?: string | null;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
  animate?: boolean;
  bordered?: boolean;
  withShine?: boolean;
  statusBadge?: React.ReactNode;
}

/**
 * Extracts clean 2-letter uppercase initials from full name,
 * intelligently removing titles (Eng, Dr, Prof) and suffixes.
 */
export function getInitials(name?: string | null): string {
  if (!name || typeof name !== 'string') return 'ES';

  // 1. Remove bracketed text e.g. (HR), (Board), (Faculty)
  let clean = name.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();

  // 2. Remove common title prefixes
  clean = clean.replace(/^(eng\.?|dr\.?|prof\.?|mr\.?|ms\.?|mrs\.?|faculty|instructor|admin)\s+/i, '').trim();

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'ES';
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  // First letter of first word + First letter of last word
  const firstChar = words[0][0] || 'E';
  const lastChar = words[words.length - 1][0] || 'S';
  return `${firstChar}${lastChar}`.toUpperCase();
}

/**
 * Deterministic gradient palette based on string hash
 */
const GRADIENT_PALETTES = [
  'from-[#B30F13] via-[#E5252A] to-[#FF4D4F]', // Elsewedy Crimson
  'from-[#1E293B] via-[#334155] to-[#475569]', // Institutional Slate
  'from-[#312E81] via-[#4338CA] to-[#6366F1]', // Indigo Tech
  'from-[#064E3B] via-[#047857] to-[#10B981]', // Emerald Bio
  'from-[#78350F] via-[#B45309] to-[#F59E0B]', // Amber Gold
  'from-[#4C1D95] via-[#6D28D9] to-[#8B5CF6]', // Royal Purple
  'from-[#164E63] via-[#0E7490] to-[#06B6D4]', // Cyan Gate
  'from-[#831843] via-[#BE185D] to-[#F43F5E]', // Rose Velvet
  'from-[#0F172A] via-[#1E1B4B] to-[#312E81]', // Midnight Blue
  'from-[#991B1B] via-[#DC2626] to-[#EF4444]', // Ruby Flame
];

function getGradientIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % GRADIENT_PALETTES.length;
}

const SIZE_MAP: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
  xl: { container: 'w-14 h-14', text: 'text-lg' },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl' },
  '3xl': { container: 'w-24 h-24 sm:w-28 sm:h-28', text: 'text-3xl sm:text-4xl' },
};

const SHAPE_MAP: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-2xl',
  square: 'rounded-lg',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Faculty Member',
  size = 'md',
  shape = 'circle',
  className = '',
  animate = true,
  bordered = true,
  withShine = true,
  statusBadge,
}) => {
  const initials = useMemo(() => getInitials(name), [name]);
  const gradient = useMemo(() => {
    const idx = getGradientIndex(name || 'Elsewedy');
    return GRADIENT_PALETTES[idx];
  }, [name]);

  const sizeStyle = SIZE_MAP[size] || SIZE_MAP.md;
  const shapeStyle = SHAPE_MAP[shape] || SHAPE_MAP.circle;

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <motion.div
        whileHover={animate ? { scale: 1.05 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={`
          relative overflow-hidden flex items-center justify-center font-extrabold tracking-wider text-white select-none
          bg-gradient-to-br ${gradient}
          ${sizeStyle.container} ${shapeStyle} ${sizeStyle.text}
          ${bordered ? 'border-2 border-white/20 dark:border-white/10 shadow-sm' : ''}
          group
        `}
        title={name || 'Faculty Member'}
      >
        {/* Subtle Radial Gloss Overlay */}
        <div className="absolute inset-0 bg-radial from-white/25 via-transparent to-black/20 pointer-events-none" />

        {/* Animated Light Shimmer Streak */}
        {withShine && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
        )}

        {/* Dynamic Initials Text */}
        <span className="relative z-10 font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          {initials}
        </span>
      </motion.div>

      {/* Optional Status Badge or Ping */}
      {statusBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 z-20">
          {statusBadge}
        </div>
      )}
    </div>
  );
};
