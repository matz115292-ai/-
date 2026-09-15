import React from 'react';

interface BarqLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  theme?: 'dark' | 'light' | 'auto';
  showSubtitle?: boolean;
}

export const BarqLogoIcon: React.FC<{
  className?: string;
  size?: number | string;
  color?: string;
}> = ({ className = '', size = 36, color = 'currentColor' }) => {
  return (
    <svg 
      viewBox="0 0 300 300" 
      width={size} 
      height={size} 
      fill="none" 
      className={`shrink-0 transition-transform duration-200 ${className}`}
      aria-label="شعار برق العقارية"
    >
      <g id="barq-symbol" transform="translate(0, 15)">
        {/* Outer Diamond Frame */}
        <path 
          d="M 150 20 L 265 135 L 150 250 L 105 205" 
          stroke={color} 
          strokeWidth="11" 
          strokeLinecap="square" 
          strokeLinejoin="miter"
        />
        
        {/* Top Left Diamond Edge */}
        <path 
          d="M 150 20 L 115 55" 
          stroke={color} 
          strokeWidth="11" 
          strokeLinecap="square"
        />

        {/* Left Chevron (<) */}
        <path 
          d="M 105 85 L 40 140 L 85 178" 
          stroke={color} 
          strokeWidth="11" 
          strokeLinecap="square" 
          strokeLinejoin="miter"
        />

        {/* Vertical Stem 1 */}
        <line 
          x1="95" y1="78" 
          x2="95" y2="175" 
          stroke={color} 
          strokeWidth="11" 
          strokeLinecap="square"
        />

        {/* Vertical Stem 2 */}
        <line 
          x1="112" y1="52" 
          x2="112" y2="188" 
          stroke={color} 
          strokeWidth="11" 
          strokeLinecap="square"
        />

        {/* Horizontal Bottom Extended Base Bar */}
        <line 
          x1="70" y1="188" 
          x2="185" y2="188" 
          stroke={color} 
          strokeWidth="11" 
          strokeLinecap="square"
        />

        {/* Top Loop of 'B' */}
        <path 
          d="M 112 78 H 170 C 188 78, 196 86, 196 102 C 196 118, 188 124, 170 124 H 112" 
          stroke={color} 
          strokeWidth="11" 
          strokeLinecap="square" 
          strokeLinejoin="round"
        />

        {/* Bottom Loop of 'B' */}
        <path 
          d="M 112 124 H 172 C 192 124, 202 134, 202 154 C 202 174, 190 188, 170 188" 
          stroke={color} 
          strokeWidth="11" 
          strokeLinecap="square" 
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export const BarqLogo: React.FC<BarqLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  theme = 'auto',
  showSubtitle = true,
}) => {
  // Determine sizing values
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 54,
    xl: 72,
  };

  const currentIconSize = iconSizes[size];

  // Colors based on theme
  const textColorClass = 
    theme === 'dark' 
      ? 'text-white' 
      : theme === 'light' 
      ? 'text-slate-900' 
      : 'text-slate-900 dark:text-white';

  const subtextColorClass = 
    theme === 'dark' 
      ? 'text-slate-400' 
      : theme === 'light' 
      ? 'text-slate-500' 
      : 'text-slate-500 dark:text-slate-400';

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <BarqLogoIcon size={currentIconSize} />
      </div>
    );
  }

  if (variant === 'full') {
    // Vertical stacked card layout like the PDF sheet
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Diamond Emblem in polished container */}
        <div className="relative p-2.5 rounded-2xl flex items-center justify-center">
          <BarqLogoIcon 
            size={currentIconSize} 
            className="drop-shadow-xs"
          />
        </div>

        {/* Arabic Typography */}
        <div className={`mt-2.5 font-bold tracking-wide leading-tight ${textColorClass} ${
          size === 'xl' ? 'text-2xl sm:text-3xl' : size === 'lg' ? 'text-xl sm:text-2xl' : 'text-lg'
        }`}>
          بـرق الـعـقـاريـة
        </div>

        {/* English Typography */}
        {showSubtitle && (
          <div className={`font-medium tracking-[0.25em] uppercase text-[10px] sm:text-xs mt-1 ${subtextColorClass}`}>
            BARQ REAL ESTATE
          </div>
        )}
      </div>
    );
  }

  // Default: Horizontal brand layout for headers, navbars, sidebars
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem */}
      <div className="shrink-0 flex items-center justify-center">
        <BarqLogoIcon size={currentIconSize} />
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className={`font-bold leading-tight tracking-tight ${textColorClass} ${
          size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg sm:text-xl'
        }`}>
          بـرق الـعـقـاريـة
        </div>
        {showSubtitle && (
          <div className={`font-semibold tracking-[0.2em] text-[9px] uppercase leading-tight mt-0.5 ${subtextColorClass}`}>
            BARQ REAL ESTATE
          </div>
        )}
      </div>
    </div>
  );
};
