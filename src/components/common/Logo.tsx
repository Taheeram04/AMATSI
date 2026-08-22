import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  variant = 'dark'
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 font-futura ${className}`}>
      {/* Bespoke AMATSI Emblem: Cotton Black Soil + Vegetation Sprout + Water Droplet */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl bg-[#1A1817] p-1.5 flex items-center justify-center shadow-sm border border-[#2B2725] shrink-0 overflow-hidden group`}
      >
        {/* Subtle Soil Texture Layer */}
        <div className="absolute inset-0 bg-radial from-[#2C2826] to-[#121110] opacity-80" />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cotton Black Soil Furrow / Earth Base */}
          <path
            d="M16 78 Q 50 88 84 78 Q 50 94 16 78 Z"
            fill="#3E3835"
          />
          <path
            d="M20 74 Q 50 82 80 74 Q 50 86 20 74 Z"
            fill="#524A45"
          />

          {/* Left Vegetation Leaf (Sukuma / Managu sprout) */}
          <path
            d="M50 72 C 34 62 20 48 30 28 C 42 26 50 48 50 72 Z"
            fill="#15803D"
          />
          <path
            d="M50 72 C 38 60 28 46 34 32 C 42 30 48 48 50 72 Z"
            fill="#16A34A"
          />

          {/* Right Vegetation Leaf */}
          <path
            d="M50 72 C 66 60 80 44 70 24 C 58 24 50 48 50 72 Z"
            fill="#22C55E"
          />
          <path
            d="M50 72 C 62 58 72 44 66 30 C 58 28 52 48 50 72 Z"
            fill="#4ADE80"
          />

          {/* Leaf Center Stem */}
          <path
            d="M50 74 L 50 36"
            stroke="#14532D"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Precision Water Droplet (Irrigation pulse) */}
          <path
            d="M50 20 C 50 20 40 32 40 38 C 40 43.5 44.5 48 50 48 C 55.5 48 60 43.5 60 38 C 60 32 50 20 50 20 Z"
            fill="#0284C7"
          />
          <path
            d="M48 34 C 48 34 44 38 44 41 C 44 43 45.5 44.5 47.5 44.5 C 46.5 43 46 41 48 38 Z"
            fill="#BAE6FD"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight font-futura uppercase leading-none ${textSizes[size]} ${
                variant === 'dark' ? 'text-[#1A1817]' : 'text-white'
              }`}
            >
              AMATSI
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#15803D] border border-[#16A34A]/20">
              BASIN AI
            </span>
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight font-futura leading-tight mt-0.5 ${
              variant === 'dark' ? 'text-[#615B57]' : 'text-[#A8A29D]'
            }`}
          >
            Smart Irrigation & Agronomist
          </span>
        </div>
      )}
    </div>
  );
};
