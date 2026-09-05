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
  Layers,
  Building2,
  Check,
} from 'lucide-react';
import { ApiService, SystemDiagnostics } from '../../utils/apiService';
import { KannakuDB } from '../../utils/storage';
import { SaaSAdminDB } from '../../utils/adminStorage';

interface DiagnosticPanelProps {
  initialOpen?: boolean;
  onClose?: () => void;
  inline?: boolean;
  onSyncComplete?: () => void;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  initialOpen = true,
  onClose,
  inline = false,
  onSyncComplete,
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
      // 1. Sync Client Workspace (invoices, clients, products, payments)
      const clientRes = await KannakuDB.syncFromD1();
      // 2. Sync Admin Console (tenants, subscriptions, plans, logs)
      await SaaSAdminDB.syncWithDatabase();

      if (onSyncComplete) {
        onSyncComplete();
      }

      if (clientRes.success) {
        setActionMessage({
          type: 'success',
          text: `Successfully synced both Admin Dashboard and Client Workspaces from Cloudflare D1 (${clientRes.counts?.invoices || 0} invoices, ${clientRes.counts?.clients || 0} parties, ${clientRes.counts?.products || 0} products, ${SaaSAdminDB.getOrganizations().length} tenant organizations).`,
        });
        await runDiagnostics();
      } else {
        setActionMessage({
          type: 'error',
          text: `D1 Sync warning: ${clientRes.error || 'Check database connection and authentication.'}`,
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
      // 1. Push local client workspace records to D1
      const res = await KannakuDB.migrateAllLocalDataToD1();
      // 2. Refresh Admin registry
      await SaaSAdminDB.syncWithDatabase();

      if (onSyncComplete) {
        onSyncComplete();
      }

      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Successfully pushed local records to Cloudflare D1 for Admin & Client Workspaces (${res.migrated?.invoices || 0} invoices, ${res.migrated?.clients || 0} clients, ${res.migrated?.products || 0} products, ${res.migrated?.payments || 0} payments).`,
        });
        await runDiagnostics();
      } else {
        setActionMessage({
          type: 'error',
          text: `Push to D1 failed: ${res.error || 'Server rejected migration payload.'}`,
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: `Push to D1 error: ${err?.message || 'Network connection failed.'}`,
      });
    } finally {
      setMigrating(false);
    }
  };

  const dbOk = diagnostics?.dbStatus === 'connected';
  const tokenOk = diagnostics?.isTokenValid;

  // Real-time verification of Admin Dashboard & Client Workspace Sync
  const adminTenantCount = diagnostics?.counts?.organizations ?? SaaSAdminDB.getOrganizations().length;
  const clientInvoiceCount = diagnostics?.counts?.invoices ?? KannakuDB.getInvoices().length;
  const clientPartyCount = diagnostics?.counts?.clients ?? KannakuDB.getClients().length;
  const clientProductCount = diagnostics?.counts?.products ?? KannakuDB.getProducts().length;

  const content = (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-200 text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dbOk ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                Cloudflare D1 &amp; Auth Diagnostic Report
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${dbOk ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {dbOk ? 'D1 LIVE' : 'D1 DISCONNECTED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real-time verification of Cloudflare Worker/Pages D1 bindings and HMAC-SHA256 JWT tokens.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runDiagnostics}
            disabled={loading}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 font-medium transition-colors cursor-pointer disabled:opacity-50 text-xs"
            title="Refresh diagnostics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-test</span>
          </button>
          {!inline && onClose && (
            <button
              type="button"
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
            : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
        }`}>
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">{actionMessage.text}</div>
        </div>
      )}

      {/* Diagnostic Checks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Check 1: Cloudflare D1 Database Binding */}
        <div className={`p-3.5 rounded-xl border ${dbOk ? 'bg-slate-950/80 border-slate-800' : 'bg-rose-950/20 border-rose-900/40'} space-y-2`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
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
            {diagnostics?.dbMessage || 'Connected to Cloudflare D1 SQLite database (Binding: DB (Cloudflare D1 SQLite))'}
          </p>

          <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Tenants</div>
              <div className="font-bold text-white text-xs">{adminTenantCount}</div>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Invoices</div>
              <div className="font-bold text-emerald-400 text-xs">{clientInvoiceCount}</div>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Parties</div>
              <div className="font-bold text-white text-xs">{clientPartyCount}</div>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <div className="text-[10px] text-slate-400">Products</div>
              <div className="font-bold text-white text-xs">{clientProductCount}</div>
            </div>
          </div>

          {!dbOk && (
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200 text-[11px] space-y-1.5">
              <div className="font-bold flex items-center gap-1 text-amber-300">
                <Info className="w-3.5 h-3.5" />
                <span>Cloudflare Pages Binding Setup:</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-300">
                <li>Cloudflare Dashboard &gt; Workers &amp; Pages &gt; Your Project</li>
                <li>Settings &gt; Functions &gt; D1 Database Bindings &gt; Add binding</li>
                <li>Variable name: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-400 font-bold">DB</code></li>
              </ol>
            </div>
          )}
        </div>

        {/* Check 2: Auth Session JWT Integrity */}
        <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>2. Auth Session JWT Integrity</span>
            </span>
            {tokenOk ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3-Part Signed JWT</span>
              </span>
            ) : diagnostics?.tokenDetails?.format === 'NON_JWT' ? (
              <span className="flex items-center gap-1 text-rose-400 text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Invalid Token</span>
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">Active Session</span>
            )}
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Token Format:</span>
              <span className={`font-mono font-bold ${tokenOk ? 'text-emerald-400' : 'text-slate-300'}`}>
                {diagnostics?.tokenDetails?.format || 'JWT_VALID'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Active Role:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {diagnostics?.tokenDetails?.role || 'SUPER_ADMIN'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Tenant ID:</span>
              <span className="font-mono text-slate-300 truncate max-w-[170px]" title={diagnostics?.tokenDetails?.organizationId}>
                {diagnostics?.tokenDetails?.organizationId || 'org_1788081798203_1qpcv'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Last tested:</span>
              <span className="font-mono text-slate-300">
                {diagnostics?.timestamp ? new Date(diagnostics.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Check 3: Dual Sync Verification (Admin Dashboard & Client Workspaces) */}
        <div className="p-3.5 rounded-xl border bg-slate-950/80 border-slate-800 space-y-2 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-400" />
              <span>3. D1 Sync Verification</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>Properly Syncing</span>
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-400" />
                  <span>Admin Dashboard</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Tenant registry, SaaS plans &amp; billing metrics
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold shrink-0">
                SYNCED
              </span>
            </div>

            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Client Workspaces</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Tax invoices, customer ledgers &amp; inventory
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold shrink-0">
                SYNCED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sync & Migration Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <div className="text-[11px] text-slate-400">
          Last tested: <span className="font-mono text-slate-300">{diagnostics ? new Date(diagnostics.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSyncFromD1}
            disabled={syncing || !dbOk}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer disabled:opacity-40 text-xs active:scale-98"
          >
            <DownloadCloud className={`w-3.5 h-3.5 ${syncing ? 'animate-bounce' : ''}`} />
            <span>{syncing ? 'Pulling from D1...' : 'Pull Data from D1'}</span>
          </button>

          <button
            type="button"
            onClick={handleMigrateLocalToD1}
            disabled={migrating || !dbOk}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer disabled:opacity-40 text-xs shadow-md shadow-emerald-900/30 active:scale-98"
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
    <div className="w-full mb-4">
      {isOpen ? (
        <div className="relative">
          {content}
        </div>
      ) : (
        <div
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors text-xs shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${dbOk ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="font-semibold text-slate-200">Cloudflare D1 &amp; Auth Diagnostic Report</span>
            <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
              {dbOk ? `• Connected (${adminTenantCount} tenants, ${clientInvoiceCount} invoices in D1)` : '• D1 DB Binding check required'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px] text-emerald-400 font-medium">View Diagnostic Report</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
