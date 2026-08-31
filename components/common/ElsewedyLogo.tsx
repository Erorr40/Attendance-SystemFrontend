import React from 'react';
import logo from '../../assets/branding/logo.webp';

interface ElsewedyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
  variant?: 'default' | 'dark' | 'white';
  withShine?: boolean;
}

export const ElsewedyLogo: React.FC<ElsewedyLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  subtitleText = 'ATTENDANCE SYSTEM',
  className = '',
  variant = 'default',
}) => {
  // Size scales
  const sizeMap = {
    sm: { height: 28, text: 'text-sm', sub: 'text-[9px]', gap: 'gap-2', iconSize: 24 },
    md: { height: 38, text: 'text-base', sub: 'text-[10px]', gap: 'gap-2.5', iconSize: 32 },
    lg: { height: 50, text: 'text-xl', sub: 'text-xs', gap: 'gap-3.5', iconSize: 44 },
    xl: { height: 72, text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm', gap: 'gap-4', iconSize: 64 },
  };

  const currentSize = sizeMap[size];

  const isWhiteVariant = variant === 'dark' || variant === 'white';
  // Color schemes: adaptive to dark mode or explicit white variant
  const textColor = isWhiteVariant ? 'text-white' : 'text-[#263238] dark:text-white';
  const subColor = isWhiteVariant ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400';
  const iatsBadge = isWhiteVariant
    ? 'bg-red-500/20 text-white border-red-500/40'
    : 'bg-red-600/10 dark:bg-red-500/20 text-[#E5252A] dark:text-red-400 border-red-500/20';

  return (
    <div className={`inline-flex items-center ${currentSize.gap} relative select-none ${className}`}>
      <img
        src={logo}
        alt="Elsewedy Logo"
        className="shrink-0 object-contain"
        style={{ width: currentSize.iconSize, height: currentSize.iconSize }}
      />

      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight ${textColor} ${currentSize.text} font-sans uppercase`}
            style={{ letterSpacing: '0.04em' }}
          >
            ELSEWEDY
          </span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest hidden sm:inline ${iatsBadge}`}>
            IATS
          </span>
        </div>

        {showSubtitle && (
          <span
            className={`font-semibold tracking-widest ${subColor} ${currentSize.sub} uppercase mt-1`}
            style={{ letterSpacing: '0.12em' }}
          >
            {subtitleText}
          </span>
        )}
      </div>
    </div>
  );
};
