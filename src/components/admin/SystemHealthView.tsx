import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Cpu,
  ShieldCheck,
  RefreshCw,
  Clock,
  HardDrive,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { SubsystemStatus } from '../../types/admin';

export const SystemHealthView: React.FC = () => {
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>(
    SaaSAdminDB.getSystemHealth()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSubsystems(SaaSAdminDB.getSystemHealth());
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>Infrastructure & Microservice System Health</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time latency telemetry, uptime SLOs, and service health across cloud nodes
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Ping All Services</span>
        </button>
      </div>

      {/* Grid of Subsystems */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subsystems.map((sub) => {
          return (
            <div
              key={sub.name}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-white text-sm">{sub.name}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {sub.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Latency</div>
                    <div className="font-mono font-bold text-white text-sm">{sub.responseTimeMs} ms</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Uptime</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">{sub.uptimePercentage}%</div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span>{sub.category}</span>
                <span className="text-slate-400 font-semibold">{sub.details}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational SLA Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>All 7 primary microservices operational with zero major degradation incidents reported this week.</span>
        </div>
        <span className="font-mono text-emerald-400 font-bold hidden sm:inline">SLO: 99.99%</span>
      </div>
    </div>
  );
};
