import React from 'react';
import { BRAND } from '../../config/brand';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showBadge?: boolean;
  iconOnly?: boolean;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  showBadge = true,
  iconOnly = false,
  className = '',
  theme = 'auto',
}) => {
  const sizeConfig = {
    xs: {
      icon: 'w-6 h-6 rounded-lg text-xs',
      text: 'text-sm',
      badge: 'text-[9px] px-1 py-0.2',
      tagline: 'text-[9px]',
      gap: 'gap-1.5',
    },
    sm: {
      icon: 'w-7 h-7 rounded-lg text-xs',
      text: 'text-base',
      badge: 'text-[9px] px-1.5 py-0.5',
      tagline: 'text-[10px]',
      gap: 'gap-2',
    },
    md: {
      icon: 'w-9 h-9 rounded-xl text-sm',
      text: 'text-lg',
      badge: 'text-[10px] px-1.5 py-0.5',
      tagline: 'text-[11px]',
      gap: 'gap-2.5',
    },
    lg: {
      icon: 'w-11 h-11 rounded-xl text-base',
      text: 'text-2xl',
      badge: 'text-xs px-2 py-0.5',
      tagline: 'text-xs',
      gap: 'gap-3',
    },
    xl: {
      icon: 'w-14 h-14 rounded-2xl text-xl',
      text: 'text-3xl',
      badge: 'text-xs px-2.5 py-1',
      tagline: 'text-sm',
      gap: 'gap-3.5',
    },
  };

  const cfg = sizeConfig[size];

  const iconElement = (
    <div
      className={`${cfg.icon} bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-xs shrink-0 relative overflow-hidden group select-none`}
      title={BRAND.name}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%]"
      >
        {/* Modern stylized J + G geometric receipt symbol */}
        <rect x="4" y="4" width="32" height="32" rx="7" fill="white" fillOpacity="0.15" />
        <path
          d="M12 11H28V15H12V11Z"
          fill="white"
          fillOpacity="0.9"
        />
        <path
          d="M12 18H22V22H12V18Z"
          fill="white"
          fillOpacity="0.9"
        />
        <path
          d="M23 20L30 13M30 13H24.5M30 13V18.5"
          stroke="#93C5FD"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 25H28V29H12V25Z"
          fill="white"
          fillOpacity="0.75"
        />
      </svg>
    </div>
  );

  if (iconOnly) {
    return <div className={`inline-flex items-center ${className}`}>{iconElement}</div>;
  }

  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const taglineColor = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`inline-flex items-center ${cfg.gap} ${className}`}>
      {iconElement}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight ${cfg.text} ${textColor}`}>
            JUST<span className="text-blue-600 dark:text-blue-400">GST</span>
          </span>
          {showBadge && (
            <span
              className={`${cfg.badge} font-bold rounded-md uppercase tracking-wider ${
                isDark
                  ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              Billing
            </span>
          )}
        </div>
        {showTagline && (
          <p className={`${cfg.tagline} ${taglineColor} font-medium mt-0.5 tracking-tight`}>
            {BRAND.shortTagline}
          </p>
        )}
      </div>
    </div>
  );
};
