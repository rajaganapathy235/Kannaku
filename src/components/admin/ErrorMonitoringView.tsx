import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Bug,
  Code,
  Terminal,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { SystemErrorLog } from '../../types/admin';

export const ErrorMonitoringView: React.FC = () => {
  const [errors, setErrors] = useState<SystemErrorLog[]>(SaaSAdminDB.getErrorLogs());
  const [selectedError, setSelectedError] = useState<SystemErrorLog | null>(errors[0] || null);

  const reloadData = () => {
    const list = SaaSAdminDB.getErrorLogs();
    setErrors(list);
    if (selectedError) {
      const refreshed = list.find((e) => e.id === selectedError.id);
      if (refreshed) setSelectedError(refreshed);
    }
  };

  const handleResolve = (err: SystemErrorLog) => {
    const updated: SystemErrorLog = {
      ...err,
      status: err.status === 'RESOLVED' ? 'UNRESOLVED' : 'RESOLVED',
    };
    SaaSAdminDB.saveErrorLog(updated);
    SaaSAdminDB.logAction('RESOLVE_SYSTEM_ERROR', 'SETTING', err.id, err.message, {
      newVal: `status: ${updated.status}`,
    });
    reloadData();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Platform Error Tracking & Exception Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor uncaught frontend exceptions, API gateway failures, and webhook errors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Error List */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-2 space-y-1.5 h-fit text-xs">
          <div className="text-[11px] font-extrabold uppercase text-slate-400 px-3 py-1">
            Recorded Exceptions ({errors.length})
          </div>
          {errors.map((err) => {
            const isSelected = selectedError?.id === err.id;
            const isResolved = err.status === 'RESOLVED';
            return (
              <div
                key={err.id}
                onClick={() => setSelectedError(err)}
                className={`p-3 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-rose-950/50 border border-rose-800/80 text-white'
                    : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-500">{err.id}</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                      isResolved
                        ? 'bg-emerald-900 text-emerald-200'
                        : err.httpStatus >= 500
                        ? 'bg-rose-900 text-rose-200'
                        : 'bg-amber-900 text-amber-200'
                    }`}
                  >
                    {err.status} ({err.httpStatus})
                  </span>
                </div>
                <div className="font-bold truncate text-rose-300">{err.message}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                  {err.occurrences} occurrences • Last: {new Date(err.lastSeen).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stack Trace & Resolution Box */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
          {selectedError ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white font-mono">
                    {selectedError.message}
                  </h2>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Tenant: {selectedError.organizationName || 'System-wide'} | Path:{' '}
                    {selectedError.endpoint || '/api/gateway'}
                  </p>
                </div>
                <button
                  onClick={() => handleResolve(selectedError)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedError.status === 'RESOLVED'
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedError.status === 'RESOLVED' ? 'Mark Unresolved' : 'Mark Resolved'}</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stack Trace Dump</span>
                </div>
                <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-rose-300 font-mono text-[11px] overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {selectedError.stackTrace || 'No stack trace captured.'}
                </pre>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500">Select an error log to inspect stack trace.</div>
          )}
        </div>
      </div>
    </div>
  );
};
