import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Server,
  Cloud,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  DownloadCloud,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';
import { ApiService, SystemDiagnostics } from '../../utils/apiService';
import { KannakuDB } from '../../utils/storage';

interface DiagnosticPanelProps {
  initialOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  initialOpen = false,
  onClose,
  inline = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const diag = await ApiService.runFullDiagnostics();
      setDiagnostics(diag);
    } catch (err: any) {
      setDiagnostics({
        dbStatus: 'unreachable',
        dbMessage: err?.message || 'Failed to reach API diagnostics endpoint',
        isTokenValid: false,
        tokenDetails: { format: 'NONE' },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const handleSyncFromD1 = async () => {
    setSyncing(true);
    setActionMessage(null);
    try {
      const res = await KannakuDB.syncFromD1();
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Successfully synced workspace from Cloudflare D1 (${res.counts?.invoices || 0} invoices, ${res.counts?.clients || 0} parties, ${res.counts?.products || 0} products).`,
        });
        await runDiagnostics();
      } else {
        setActionMessage({
          type: 'error',
          text: `D1 Sync failed: ${res.error || 'Check database connection and authentication.'}`,
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: `D1 Sync error: ${err?.message || 'Network failure'}`,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleMigrateLocalToD1 = async () => {
    setMigrating(true);
    setActionMessage(null);
    try {
      const res = await KannakuDB.migrateAllLocalDataToD1();
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Successfully uploaded local records to Cloudflare D1 (${res.migrated?.invoices || 0} invoices, ${res.migrated?.clients || 0} clients, ${res.migrated?.products || 0} products, ${res.migrated?.payments || 0} payments).`,
        });
        await runDiagnostics();
      } else {
        setActionMessage({
          type: 'error',
          text: `Migration failed: ${res.error || 'Server rejected migration payload.'}`,
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: `Migration error: ${err?.message || 'Network connection failed.'}`,
      });
    } finally {
      setMigrating(false);
    }
  };

  const dbOk = diagnostics?.dbStatus === 'connected';
  const tokenOk = diagnostics?.isTokenValid;

  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-200 text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dbOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Cloudflare D1 & Auth Diagnostic Report</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${dbOk ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {dbOk ? 'D1 LIVE' : 'D1 DISCONNECTED'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time verification of Cloudflare Worker/Pages D1 bindings and HMAC-SHA256 JWT tokens.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh diagnostics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-test</span>
          </button>
          {!inline && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Action Message Alert */}
      {actionMessage && (
        <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
          actionMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
            : actionMessage.type === 'error'
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
            : 'bg-brand-950/40 border-brand-800/60 text-brand-300'
        }`}>
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>{actionMessage.text}</div>
        </div>
      )}

      {/* Diagnostic Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Check 1: Cloudflare D1 Database Binding */}
        <div className={`p-3.5 rounded-xl border ${dbOk ? 'bg-slate-950/80 border-slate-800' : 'bg-rose-950/20 border-rose-900/40'} space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-400" />
              <span>1. Cloudflare D1 Database Binding</span>
            </span>
            {dbOk ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Binding Missing / Offline</span>
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
            {diagnostics?.dbMessage || 'Testing connection to /api/health/db...'}
          </p>

          {diagnostics?.counts && (
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Tenants</div>
                <div className="font-bold text-white text-xs">{diagnostics.counts.organizations}</div>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Invoices</div>
                <div className="font-bold text-brand-400 text-xs">{diagnostics.counts.invoices}</div>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Parties</div>
                <div className="font-bold text-white text-xs">{diagnostics.counts.clients}</div>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Products</div>
                <div className="font-bold text-white text-xs">{diagnostics.counts.products}</div>
              </div>
            </div>
          )}

          {!dbOk && (
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-[11px] space-y-1.5">
              <div className="font-bold flex items-center gap-1 text-amber-300">
                <Info className="w-3.5 h-3.5" />
                <span>Cloudflare Pages Fix Instructions:</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-300">
                <li>Log in to <strong>Cloudflare Dashboard &gt; Workers &amp; Pages</strong></li>
                <li>Open your Pages project &gt; <strong>Settings &gt; Functions</strong></li>
                <li>Scroll to <strong>D1 Database Bindings</strong> &gt; Click <strong>Add binding</strong></li>
                <li>Variable name: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-400 font-bold">DB</code>, select your D1 database</li>
                <li>Trigger a new deployment or rebuild</li>
              </ol>
            </div>
          )}
        </div>

        {/* Check 2: Auth Token & JWT Verification */}
        <div className={`p-3.5 rounded-xl border ${tokenOk ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-950/80 border-slate-800'} space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>2. Auth Session JWT Integrity</span>
            </span>
            {tokenOk ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3-Part Signed JWT</span>
              </span>
            ) : diagnostics?.tokenDetails.format === 'NON_JWT' ? (
              <span className="flex items-center gap-1 text-rose-400 text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Invalid / Fake Token</span>
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">No active session</span>
            )}
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Token Format:</span>
              <span className={`font-mono font-bold ${tokenOk ? 'text-emerald-400' : 'text-slate-300'}`}>
                {diagnostics?.tokenDetails.format || 'NONE'}
              </span>
            </div>
            {diagnostics?.tokenDetails.role && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Active Role:</span>
                <span className="font-mono text-brand-400 font-bold">{diagnostics.tokenDetails.role}</span>
              </div>
            )}
            {diagnostics?.tokenDetails.organizationId && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Tenant ID:</span>
                <span className="font-mono text-slate-300">{diagnostics.tokenDetails.organizationId}</span>
              </div>
            )}
            {diagnostics?.tokenDetails.expiresAt && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Session Expiration:</span>
                <span className="text-slate-300">{diagnostics.tokenDetails.expiresAt}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync & Migration Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div className="text-[11px] text-slate-400">
          Last tested: <span className="font-mono">{diagnostics ? new Date(diagnostics.timestamp).toLocaleTimeString() : '...'}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncFromD1}
            disabled={syncing || !dbOk}
            className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer disabled:opacity-40"
          >
            <DownloadCloud className={`w-3.5 h-3.5 ${syncing ? 'animate-bounce' : ''}`} />
            <span>{syncing ? 'Pulling from D1...' : 'Pull Data from D1'}</span>
          </button>

          <button
            onClick={handleMigrateLocalToD1}
            disabled={migrating || !dbOk}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer disabled:opacity-40"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${migrating ? 'animate-bounce' : ''}`} />
            <span>{migrating ? 'Pushing to D1...' : 'Push Local Data to D1'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="w-full max-w-7xl mx-auto mb-4">
      {isOpen ? (
        <div className="relative">
          {content}
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors text-xs shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${dbOk ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="font-semibold text-slate-200">Cloudflare D1 &amp; System Health</span>
            <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
              {dbOk ? `• Connected (${diagnostics?.counts?.invoices || 0} invoices stored in D1)` : '• D1 DB Binding check required'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px] text-brand-400 font-medium">View Diagnostic Report</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
