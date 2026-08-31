import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Download,
  Filter,
  Shield,
  Eye,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  History,
  Trash2,
  Sparkles,
  ArrowUpRight,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { AuditLogEntry, ImpersonationSession, TenantOrganizationFull } from '../../types/admin';

interface AuditLogsViewProps {
  onImpersonate?: (org: TenantOrganizationFull, reason?: string) => void;
  onNavigateToOrg?: (orgId: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  onImpersonate,
  onNavigateToOrg,
}) => {
  const [viewTab, setViewTab] = useState<'impersonation' | 'all_actions'>('impersonation');
  const [sessions, setSessions] = useState<ImpersonationSession[]>(SaaSAdminDB.getImpersonationSessions());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(SaaSAdminDB.getAuditLogs());
  const [activeSession, setActiveSession] = useState<ImpersonationSession | null>(
    SaaSAdminDB.getActiveImpersonationSession()
  );

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<ImpersonationSession | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const reloadData = async () => {
    setIsRefreshing(true);
    const [liveSessions, liveLogs] = await Promise.all([
      SaaSAdminDB.getImpersonationSessionsAsync(),
      SaaSAdminDB.getAuditLogsAsync(),
    ]);
    setSessions(liveSessions);
    setAuditLogs(liveLogs);
    setActiveSession(SaaSAdminDB.getActiveImpersonationSession());
    setIsRefreshing(false);
  };

  useEffect(() => {
    reloadData();
    const interval = setInterval(() => {
      setActiveSession(SaaSAdminDB.getActiveImpersonationSession());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Impersonation Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchSearch =
      s.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      s.adminName.toLowerCase().includes(search.toLowerCase()) ||
      s.tenantEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.tenantOwner.toLowerCase().includes(search.toLowerCase()) ||
      s.reason.toLowerCase().includes(search.toLowerCase()) ||
      (s.supportTicketId && s.supportTicketId.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered System Audit Logs
  const filteredLogs = auditLogs.filter((l) => {
    const matchSearch =
      l.adminName.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.targetName.toLowerCase().includes(search.toLowerCase()) ||
      (l.organizationName && l.organizationName.toLowerCase().includes(search.toLowerCase())) ||
      (l.newValue && l.newValue.toLowerCase().includes(search.toLowerCase()));

    const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  // KPI calculations
  const totalImpersonations = sessions.length;
  const activeCount = sessions.filter((s) => s.status === 'ACTIVE').length;
  const totalDurationSeconds = sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);
  const totalDurationMinutes = Math.round(totalDurationSeconds / 60);
  const uniqueTenants = new Set(sessions.map((s) => s.organizationId)).size;

  const handleExportCSV = (entity: 'impersonations' | 'audit_logs') => {
    const csv = SaaSAdminDB.exportEntirePlatformData('CSV', entity);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kannaku_${entity}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleEndActiveSession = () => {
    SaaSAdminDB.stopImpersonation();
    reloadData();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '< 1 min';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-purple-400" />
            <span>Activity & Support Impersonation Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive compliance log of tenant troubleshooting sessions, administrative operations, and security events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportCSV(viewTab === 'impersonation' ? 'impersonations' : 'audit_logs')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export {viewTab === 'impersonation' ? 'Support Sessions' : 'Audit Logs'} (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Support Impersonations</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalImpersonations}</div>
          <p className="text-[11px] text-slate-500">Tracked support troubleshooting sessions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Support Sessions</span>
            {activeCount > 0 ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            ) : (
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div className={`text-2xl font-black ${activeCount > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
            {activeCount}
          </div>
          <p className="text-[11px] text-slate-500">
            {activeCount > 0 ? 'Admin currently supporting a tenant' : 'No active impersonation right now'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Support Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalDurationMinutes} <span className="text-xs font-normal text-slate-400">mins</span></div>
          <p className="text-[11px] text-slate-500">Cumulative troubleshooting duration</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Unique Tenants Assisted</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{uniqueTenants}</div>
          <p className="text-[11px] text-slate-500">Distinct customer businesses supported</p>
        </div>
      </div>

      {/* Active Impersonation Alert Banner */}
      {activeSession && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Active Support Session
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Started {new Date(activeSession.startedAt).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                Operator <span className="text-amber-300">{activeSession.adminName}</span> is actively impersonating{' '}
                <span className="text-white underline">{activeSession.organizationName}</span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                <strong>Stated Objective:</strong> {activeSession.reason}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={handleEndActiveSession}
              className="w-full md:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Terminate Session Safely</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            setViewTab('impersonation');
            setSearch('');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            viewTab === 'impersonation'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Tenant Support Impersonations ({sessions.length})</span>
        </button>

        <button
          onClick={() => {
            setViewTab('all_actions');
            setSearch('');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            viewTab === 'all_actions'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>All Platform Administrative Mutations ({auditLogs.length})</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              viewTab === 'impersonation'
                ? 'Search tenant, operator, reason, email...'
                : 'Search admin, action, target entity...'
            }
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {viewTab === 'impersonation' ? (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL' ? 'All Sessions' : st}
                </button>
              ))}
            </div>
          ) : (
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none font-medium cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="START_IMPERSONATION">Start Impersonation</option>
              <option value="EXIT_IMPERSONATION">Exit Impersonation</option>
              <option value="UPGRADE_ORGANIZATION_PLAN">Plan Upgrades</option>
              <option value="EXTEND_TRIAL_PERIOD">Trial Extensions</option>
              <option value="UPDATE_FEATURE_FLAG">Feature Flags</option>
              <option value="CREATE_PROMOTIONAL_COUPON">Coupons</option>
              <option value="CHANGE_ACTIVE_PAYMENT_GATEWAY">Payment Gateways</option>
            </select>
          )}

          <button
            onClick={reloadData}
            title="Refresh logs"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: Impersonation & Support Access Trail Table */}
      {viewTab === 'impersonation' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Target Tenant</th>
                  <th className="py-3.5 px-3">Support Operator</th>
                  <th className="py-3.5 px-4">Stated Reason & Context</th>
                  <th className="py-3.5 px-3">Start Time</th>
                  <th className="py-3.5 px-3">Duration</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="font-semibold text-slate-400">No support impersonation sessions found</p>
                      <p className="text-[11px]">When an admin impersonates a tenant, the session is tracked here.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((sess) => {
                    const isActive = sess.status === 'ACTIVE';
                    return (
                      <tr
                        key={sess.id}
                        className={`hover:bg-slate-900/50 transition-colors ${
                          isActive ? 'bg-amber-950/20' : ''
                        }`}
                      >
                        {/* Target Tenant */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-700/40 text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {sess.organizationName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white truncate max-w-[190px]">
                                {sess.organizationName}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[190px]">
                                {sess.tenantOwner} • {sess.tenantEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Admin Operator */}
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white truncate max-w-[140px]">
                            {sess.adminName}
                          </div>
                          <div className="text-[10px] font-mono text-purple-400">
                            {sess.adminRole}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate max-w-[130px]">
                            IP: {sess.ipAddress}
                          </div>
                        </td>

                        {/* Reason / Context */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200 text-xs font-semibold line-clamp-2 max-w-sm">
                            {sess.reason}
                          </div>
                          {sess.supportTicketId && (
                            <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-400 rounded">
                              Ref: {sess.supportTicketId}
                            </span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                          <div>{new Date(sess.startedAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(sess.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-mono text-xs font-bold">
                          {isActive ? (
                            <span className="text-amber-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              Active Now
                            </span>
                          ) : (
                            <span className="text-slate-300">{formatDuration(sess.durationSeconds)}</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          {isActive ? (
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                              COMPLETED
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedSessionDetail(sess)}
                              title="View Session Audit Record"
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {onImpersonate && (
                              <button
                                onClick={() => {
                                  const org = SaaSAdminDB.getOrganizations().find((o) => o.id === sess.organizationId);
                                  if (org) onImpersonate(org);
                                }}
                                title="Launch New Support Session for Tenant"
                                className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Impersonate</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: System Administrative Mutations Table */}
      {viewTab === 'all_actions' && (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-3">Operator / Admin</th>
                  <th className="py-3.5 px-3">Action Event</th>
                  <th className="py-3.5 px-3">Target Entity</th>
                  <th className="py-3.5 px-4">Modification Details / Security Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="font-semibold text-slate-400">No matching audit records</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isImpersonate = log.targetType === 'IMPERSONATION' || log.action.includes('IMPERSONATION');
                    return (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white">{log.adminName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">IP: {log.ipAddress}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isImpersonate
                                ? 'bg-amber-950/80 text-amber-400 border-amber-900/40'
                                : 'bg-blue-950/80 text-blue-400 border-blue-900/40'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-200">{log.targetName}</div>
                          <div className="text-[10px] text-slate-500">{log.targetType}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {log.newValue ? (
                            <div
                              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                                isImpersonate
                                  ? 'text-amber-300 bg-amber-950/30 border-amber-900/40'
                                  : 'text-emerald-400 bg-emerald-950/30 border-emerald-900/40'
                              }`}
                            >
                              {log.newValue}
                            </div>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session Audit Record Detail Modal */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Support Access Audit Record</h3>
                  <p className="text-[11px] font-mono text-slate-400">ID: {selectedSessionDetail.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSessionDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300">
              {/* Tenant Details */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Target Tenant Organization
                </span>
                <div className="font-bold text-sm text-white">{selectedSessionDetail.organizationName}</div>
                <div className="text-slate-400">
                  Owner: {selectedSessionDetail.tenantOwner} • {selectedSessionDetail.tenantEmail}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Org ID: {selectedSessionDetail.organizationId}
                </div>
              </div>

              {/* Troubleshooting Context */}
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  Stated Troubleshooting Reason
                </span>
                <div className="text-amber-200 font-semibold text-xs leading-relaxed">
                  {selectedSessionDetail.reason}
                </div>
                {selectedSessionDetail.supportTicketId && (
                  <div className="text-[11px] font-mono text-amber-300 mt-1">
                    Ticket Ref: {selectedSessionDetail.supportTicketId}
                  </div>
                )}
              </div>

              {/* Operator & Security Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Operator</span>
                  <div className="font-bold text-white">{selectedSessionDetail.adminName}</div>
                  <div className="text-[10px] text-purple-400">{selectedSessionDetail.adminRole}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">IP Address</span>
                  <div className="font-mono text-slate-300 text-[11px] truncate">
                    {selectedSessionDetail.ipAddress}
                  </div>
                  <div className="text-[10px] text-emerald-400">Validated Terminal</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Session Duration</span>
                  <div className="font-bold text-white">
                    {selectedSessionDetail.status === 'ACTIVE'
                      ? 'Active Now'
                      : formatDuration(selectedSessionDetail.durationSeconds)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Status: {selectedSessionDetail.status}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Started At</span>
                  <div className="font-mono text-slate-300 text-[11px]">
                    {new Date(selectedSessionDetail.startedAt).toLocaleTimeString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(selectedSessionDetail.startedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  SaaSAdminDB.deleteImpersonationSession(selectedSessionDetail.id);
                  setSelectedSessionDetail(null);
                  reloadData();
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Entry</span>
              </button>

              <button
                onClick={() => setSelectedSessionDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
