import React, { useState } from 'react';
import { History, ShieldCheck, Activity, Search, Filter } from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { AuditLogEntry } from '../../types/admin';

export const LiveActivityFeedView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(SaaSAdminDB.getAuditLogs());
  const [search, setSearch] = useState('');

  const filtered = logs.filter(
    (l) =>
      l.adminName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.targetName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-brand-400" />
            <span>Real-time Live Platform Activity Stream</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming feed of tenant operations, logins, quota consumptions, and admin interactions
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live WebSocket Listener Active</span>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="divide-y divide-slate-800 space-y-2">
          {filtered.map((log) => (
            <div key={log.id} className="pt-3 pb-2 flex items-start justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {log.targetType}
                  </span>
                </div>
                <div className="text-slate-400">
                  Initiated by <strong className="text-brand-400">{log.adminName}</strong> on target{' '}
                  <strong className="text-slate-200">{log.targetName}</strong>
                </div>
                {log.newValue && (
                  <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40 mt-1">
                    {log.newValue}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono text-slate-500 text-[11px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-slate-600 font-mono">{log.ipAddress}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
