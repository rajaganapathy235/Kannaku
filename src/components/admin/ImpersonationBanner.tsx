import React, { useEffect, useState } from 'react';
import { LogOut, ShieldAlert, Clock, CheckCircle2, History } from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';

interface ImpersonationBannerProps {
  onExit: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ onExit }) => {
  const activeImpersonation = SaaSAdminDB.getActiveImpersonation();
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!activeImpersonation?.startedAt) return;
    const startMs = new Date(activeImpersonation.startedAt).getTime();
    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setSecondsElapsed(diff);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeImpersonation?.startedAt]);

  if (!activeImpersonation) return null;

  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 flex flex-wrap items-center justify-between gap-3 font-medium text-xs shadow-lg sticky top-0 z-50 animate-in slide-in-from-top-2 border-b border-amber-600">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 bg-slate-950 text-amber-400 px-2 py-0.5 rounded-md font-black uppercase text-[10px] tracking-wider shrink-0">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>SUPPORT IMPERSONATION ACTIVE</span>
        </div>

        <div className="text-slate-950 font-semibold flex items-center gap-1.5 flex-wrap">
          <span>Viewing workspace as:</span>
          <strong className="bg-black/10 px-2 py-0.5 rounded font-black text-slate-950 underline decoration-slate-900 underline-offset-2">
            {activeImpersonation.organizationName}
          </strong>
          <span className="text-slate-800 text-[11px] hidden sm:inline font-mono">
            ({activeImpersonation.adminEmail})
          </span>
        </div>

        {activeImpersonation.reason && (
          <div className="hidden lg:flex items-center gap-1 text-[11px] bg-amber-600/20 px-2 py-0.5 rounded border border-amber-700/20 text-slate-900 truncate max-w-xs">
            <span className="font-bold">Reason:</span>
            <span className="truncate">{activeImpersonation.reason}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Live Stopwatch */}
        <div className="flex items-center gap-1 bg-black/10 px-2.5 py-1 rounded-lg font-mono font-bold text-slate-950 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-900 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Session: {timeFormatted}</span>
        </div>

        {/* Audit Log Indicator */}
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-900 font-semibold bg-white/30 px-2 py-1 rounded-lg">
          <History className="w-3.5 h-3.5" />
          <span>Audited in SuperAdmin</span>
        </div>

        <button
          onClick={onExit}
          className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-amber-300 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Session</span>
        </button>
      </div>
    </div>
  );
};
