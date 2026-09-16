import React from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { usePwaAutoUpdate } from './PwaUpdateHandler';

export interface UpdateToastProps {
  autoReload?: boolean;
}

/**
 * Modern floating toast banner that informs users a new version of JustGST is ready.
 * Matches Emerald-600 theme (#059669) and dark slate contrast.
 */
export const UpdateToast: React.FC<UpdateToastProps> = ({ autoReload = false }) => {
  const { needRefresh, updateApp, dismissUpdate } = usePwaAutoUpdate(autoReload);

  if (!needRefresh) {
    return null;
  }

  return (
    <div
      id="pwa-update-toast"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] bg-slate-900/95 border border-emerald-500/30 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-md transition-all animate-slide-up flex flex-col gap-3"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 tracking-tight">New Version Available</h4>
            <p className="text-xs text-slate-400 mt-0.5">JustGST has been updated with improvements & fixes.</p>
          </div>
        </div>

        <button
          onClick={dismissUpdate}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Dismiss update"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/80">
        <button
          onClick={dismissUpdate}
          className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          Later
        </button>

        <button
          onClick={updateApp}
          className="text-xs font-bold bg-[#059669] hover:bg-[#047857] active:scale-95 text-white px-3.5 py-1.5 rounded-lg shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Update Now
        </button>
      </div>
    </div>
  );
};

export default UpdateToast;
