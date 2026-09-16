import React from 'react';

export interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

/**
 * Native-feeling full screen or section page loading spinner for JustGST.
 * Designed with emerald-600 branding (#059669) and crisp canvas (#F8F9FA).
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading JustGST...',
  subMessage = 'Preparing your accounting workspace',
  fullScreen = true,
}) => {
  return (
    <div
      id="justgst-page-loader"
      className={`flex flex-col items-center justify-center select-none bg-[#F8F9FA] transition-opacity duration-300 ${
        fullScreen ? 'fixed inset-0 z-50 min-h-screen w-full' : 'w-full py-16'
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Brand Icon with Pulse Aura */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-20 h-20 bg-emerald-100 rounded-full animate-ping opacity-30" />
        <div className="relative w-16 h-16 rounded-2xl bg-white border border-emerald-100 shadow-lg flex items-center justify-center">
          <svg
            className="w-9 h-9 text-[#059669] animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>

      {/* Brand Header */}
      <div className="flex items-center gap-1.5 text-xs font-black tracking-widest text-[#059669] uppercase mb-2">
        <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
        JustGST Cloud POS
      </div>

      {/* Primary Message */}
      <h3 className="text-base font-bold text-slate-800 tracking-tight text-center px-4">
        {message}
      </h3>

      {/* Sub message */}
      {subMessage && (
        <p className="text-xs text-slate-500 text-center mt-1 max-w-xs px-4">
          {subMessage}
        </p>
      )}

      {/* Visual progress bar line */}
      <div className="w-40 h-1 bg-emerald-100 rounded-full overflow-hidden mt-6">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full animate-pulse w-2/3" />
      </div>
    </div>
  );
};

export default PageLoader;
