import React, { useState, useEffect } from 'react';
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
  Table,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { SubsystemStatus } from '../../types/admin';
import { DiagnosticPanel } from '../common/DiagnosticPanel';
import { ApiService } from '../../utils/apiService';

export const SystemHealthView: React.FC = () => {
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>(
    SaaSAdminDB.getSystemHealth()
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [schemaStatus, setSchemaStatus] = useState<{
    loading: boolean;
    data: any | null;
    error: string | null;
  }>({
    loading: true,
    data: null,
    error: null,
  });

  const loadSchemaCheck = async () => {
    setSchemaStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await ApiService.checkSchemaIntegrity();
      if (res.success && res.data) {
        setSchemaStatus({ loading: false, data: res.data, error: null });
      } else {
        setSchemaStatus({ loading: false, data: null, error: res.error || 'Failed to inspect schema' });
      }
    } catch (err: any) {
      setSchemaStatus({ loading: false, data: null, error: err?.message || 'Error checking schema' });
    }
  };

  useEffect(() => {
    loadSchemaCheck();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadSchemaCheck();
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
            Real-time latency telemetry, uptime SLOs, and D1 database schema drift verification
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

      {/* Cloudflare D1 & Auth Diagnostic Report */}
      <DiagnosticPanel inline />

      {/* D1 SQLite Schema Integrity Check */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">D1 Schema Drift & Table Integrity Monitor</h3>
                {schemaStatus.data && (
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      schemaStatus.data.healthy
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}
                  >
                    {schemaStatus.data.status}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Audits sqlite_master tables against expected schema (21 tables) to prevent silent D1 multi-statement creation failures.
              </p>
            </div>
          </div>

          <button
            onClick={loadSchemaCheck}
            disabled={schemaStatus.loading}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${schemaStatus.loading ? 'animate-spin' : ''}`} />
            <span>Check Schema</span>
          </button>
        </div>

        {schemaStatus.data && (
          <div className="mt-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Expected Tables</div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">{schemaStatus.data.totalExpected}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Present in D1</div>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{schemaStatus.data.totalPresent}</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Missing Tables</div>
                <div className={`text-sm font-mono font-bold mt-0.5 ${schemaStatus.data.totalMissing > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {schemaStatus.data.totalMissing}
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Schema Health</div>
                <div className={`text-sm font-mono font-bold mt-0.5 ${schemaStatus.data.healthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {schemaStatus.data.healthy ? '100% COMPLETE' : 'INCOMPLETE'}
                </div>
              </div>
            </div>

            {schemaStatus.data.missingTables?.length > 0 && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-lg text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Missing Schema Tables Detected:</div>
                  <div className="mt-1 font-mono text-[11px] text-rose-200">
                    {schemaStatus.data.missingTables.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {schemaStatus.data.missingColumns && Object.keys(schemaStatus.data.missingColumns).length > 0 && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg text-amber-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Column-Level Schema Drift Detected:</div>
                  <div className="mt-1.5 space-y-1">
                    {Object.entries(schemaStatus.data.missingColumns).map(([tbl, cols]) => (
                      <div key={tbl} className="font-mono text-[11px] text-amber-200">
                        <span className="font-bold text-amber-100">{tbl}</span>: missing [{(cols as string[]).join(', ')}]
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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
