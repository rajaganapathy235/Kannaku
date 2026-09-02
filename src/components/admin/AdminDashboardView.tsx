import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  LifeBuoy,
  PlusCircle,
  Layers,
  TicketPercent,
  Megaphone,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { SuperAdminDashboardStats, TenantOrganizationFull, AuditLogEntry } from '../../types/admin';
import { AdminNavTab } from './SuperAdminLayout';

interface AdminDashboardViewProps {
  onNavigate: (tab: AdminNavTab) => void;
  onOpenCreateOrg?: () => void;
  onOpenCreatePlan?: () => void;
  onOpenCreateCoupon?: () => void;
  onImpersonate?: (org: TenantOrganizationFull) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
  onOpenCreateOrg,
  onOpenCreatePlan,
  onOpenCreateCoupon,
  onImpersonate,
}) => {
  const [stats, setStats] = useState<SuperAdminDashboardStats>(SaaSAdminDB.getDashboardStats());
  const [orgs, setOrgs] = useState<TenantOrganizationFull[]>(SaaSAdminDB.getOrganizations());
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>(SaaSAdminDB.getAuditLogs().slice(0, 6));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    await SaaSAdminDB.syncWithDatabase();
    setStats(SaaSAdminDB.getDashboardStats());
    setOrgs(SaaSAdminDB.getOrganizations());
    setRecentLogs(SaaSAdminDB.getAuditLogs().slice(0, 6));
    setIsRefreshing(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const kpis: {
    id: string;
    title: string;
    value: string | number;
    subtext: string;
    trend?: string;
    trendType?: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    color: string;
    targetTab: AdminNavTab;
  }[] = [
    {
      id: 'total_orgs',
      title: 'Total Organizations',
      value: stats.totalOrganizations,
      subtext: `${stats.activeOrganizations} Active • ${stats.trialOrganizations} Trial`,
      trend: '+12.5%',
      trendType: 'positive',
      icon: Building2,
      color: 'from-brand-500/20 to-brand-600/10 text-brand-400 border-brand-500/30',
      targetTab: 'organizations',
    },
    {
      id: 'active_orgs',
      title: 'Active Organizations',
      value: stats.activeOrganizations,
      subtext: 'Paying business subscriptions',
      trend: '+2 this month',
      trendType: 'positive',
      icon: CheckCircle2,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
      targetTab: 'organizations',
    },
    {
      id: 'trial_orgs',
      title: 'Trial Organizations',
      value: stats.trialOrganizations,
      subtext: '68% conversion forecast',
      trend: '1 Expiring Soon',
      trendType: 'neutral',
      icon: Clock,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
      targetTab: 'trials',
    },
    {
      id: 'suspended_orgs',
      title: 'Suspended Orgs',
      value: stats.suspendedOrganizations,
      subtext: 'Past due or disabled',
      trend: '1 under review',
      trendType: 'negative',
      icon: AlertCircle,
      color: 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/30',
      targetTab: 'organizations',
    },
    {
      id: 'total_users',
      title: 'Total Platform Users',
      value: stats.totalUsers,
      subtext: `${stats.activeUsers} Daily Active Users`,
      trend: '+18.2%',
      trendType: 'positive',
      icon: Users,
      color: 'from-brand-500/20 to-brand-600/10 text-brand-400 border-brand-500/30',
      targetTab: 'users',
    },
    {
      id: 'active_users',
      title: 'Active Users (DAU)',
      value: stats.activeUsers,
      subtext: '94% login engagement rate',
      trend: '+6 DAU',
      trendType: 'positive',
      icon: Activity,
      color: 'from-brand-500/20 to-brand-600/10 text-brand-400 border-brand-500/30',
      targetTab: 'users',
    },
    {
      id: 'mrr',
      title: 'Monthly Recurring (MRR)',
      value: `₹${stats.monthlyRecurringRevenue.toLocaleString()}`,
      subtext: `+${stats.mrrGrowthPct}% MoM Growth`,
      trend: '+₹640 this mo',
      trendType: 'positive',
      icon: TrendingUp,
      color: 'from-brand-500/20 to-brand-600/10 text-brand-400 border-brand-500/30',
      targetTab: 'analytics_revenue',
    },
    {
      id: 'arr',
      title: 'Annualized Run Rate (ARR)',
      value: `₹${stats.annualRecurringRevenue.toLocaleString()}`,
      subtext: 'Projected next 12 months',
      trend: 'Healthy trajectory',
      trendType: 'positive',
      icon: CreditCard,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
      targetTab: 'analytics_revenue',
    },
    {
      id: 'rev_month',
      title: 'Revenue This Month',
      value: `₹${stats.revenueThisMonth.toLocaleString()}`,
      subtext: `vs ₹${stats.revenueLastMonth.toLocaleString()} last mo`,
      trend: '+16.3%',
      trendType: 'positive',
      icon: TrendingUp,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
      targetTab: 'transactions',
    },
    {
      id: 'rev_last_month',
      title: 'Revenue Last Month',
      value: `₹${stats.revenueLastMonth.toLocaleString()}`,
      subtext: 'Final settled volume',
      trend: 'Settled',
      trendType: 'neutral',
      icon: CreditCard,
      color: 'from-slate-500/20 to-slate-600/10 text-slate-300 border-slate-700',
      targetTab: 'transactions',
    },
    {
      id: 'new_signups',
      title: 'New Signups',
      value: stats.newSignupsThisMonth,
      subtext: 'Across all marketing channels',
      trend: '+4 this week',
      trendType: 'positive',
      icon: Sparkles,
      color: 'from-brand-500/20 to-brand-600/10 text-brand-400 border-brand-500/30',
      targetTab: 'organizations',
    },
    {
      id: 'churn_orgs',
      title: 'Churned Organizations',
      value: stats.churnedOrganizationsThisMonth,
      subtext: '1.2% monthly churn rate',
      trend: 'Low churn rate',
      trendType: 'positive',
      icon: ArrowDownRight,
      color: 'from-slate-500/20 to-slate-600/10 text-slate-400 border-slate-700',
      targetTab: 'analytics_revenue',
    },
    {
      id: 'failed_payments',
      title: 'Failed Payments',
      value: stats.failedPaymentsCount,
      subtext: '1 Card decline (Dunning active)',
      trend: 'Action needed',
      trendType: 'negative',
      icon: AlertTriangle,
      color: 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/30',
      targetTab: 'transactions',
    },
    {
      id: 'support_tickets',
      title: 'Open Support Tickets',
      value: stats.openSupportTickets,
      subtext: 'Avg response time: 24 mins',
      trend: '2 pending reply',
      trendType: 'neutral',
      icon: LifeBuoy,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
      targetTab: 'tickets',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Executive Greeting */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900/40 via-slate-900 to-brand-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Executive Platform Command Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Live Production
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time SaaS operational telemetry across all tenant workspaces, subscription billing,
            infrastructure health, and compliance logs.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sync all metrics directly from Cloudflare D1 database"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>
          <button
            onClick={onOpenCreateOrg}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-900/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Organization</span>
          </button>
          <button
            onClick={() => onNavigate('plans')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Manage Plans</span>
          </button>
          <button
            onClick={() => onNavigate('announcements')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            <span>Broadcast</span>
          </button>
        </div>
      </div>

      {/* 14 Interactive KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
            Platform Key Performance Indicators (Click card to drill down)
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">Auto-refreshed live</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.id}
                onClick={() => onNavigate(kpi.targetTab)}
                className={`p-4 rounded-2xl bg-gradient-to-b ${kpi.color} bg-slate-950/80 border hover:border-slate-500/50 hover:bg-slate-900/90 transition-all cursor-pointer group flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-current">
                    <Icon className="w-4 h-4" />
                  </div>
                  {kpi.trend && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        kpi.trendType === 'positive'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                          : kpi.trendType === 'negative'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {kpi.trend}
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="text-[11px] font-bold text-slate-300 truncate mt-0.5">
                    {kpi.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-1">
                    {kpi.subtext}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-white">
                  <span>View Details</span>
                  <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Action Shortcuts Panel */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Quick Control Shortcuts:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => onNavigate('gateways')}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 rounded-xl text-left transition-all cursor-pointer group"
          >
            <CreditCard className="w-4 h-4 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Payment Gateways</div>
            <div className="text-[10px] text-slate-400">Dodo, Cashfree, Razorpay</div>
          </button>
          <button
            onClick={() => onNavigate('plans')}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left transition-all cursor-pointer group"
          >
            <Layers className="w-4 h-4 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Subscription Plan</div>
            <div className="text-[10px] text-slate-400">1, 6 & 12 Month rates</div>
          </button>
          <button
            onClick={() => onNavigate('organizations')}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 rounded-xl text-left transition-all cursor-pointer group"
          >
            <Building2 className="w-4 h-4 text-brand-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Organizations</div>
            <div className="text-[10px] text-slate-400">Manage tenant accounts</div>
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all cursor-pointer group"
          >
            <Receipt className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Transactions</div>
            <div className="text-[10px] text-slate-400">Payment receipts & ledger</div>
          </button>
          <button
            onClick={onOpenCreateOrg}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-brand-500/40 rounded-xl text-left transition-all cursor-pointer group"
          >
            <PlusCircle className="w-4 h-4 text-brand-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">New Tenant Org</div>
            <div className="text-[10px] text-slate-400">Manual workspace provision</div>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-xl text-left transition-all cursor-pointer group"
          >
            <ShieldCheck className="w-4 h-4 text-brand-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">System Settings</div>
            <div className="text-[10px] text-slate-400">Branding, currency & ops</div>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Top Tenants by Usage vs Live Audit Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Organizations Leaderboard & Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Organizations Leaderboard */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Top Organizations by Billing Volume
                </h3>
                <p className="text-xs text-slate-400">
                  Most active tenants by monthly invoices and storage load
                </p>
              </div>
              <button
                onClick={() => onNavigate('organizations')}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View all {orgs.length} orgs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {orgs.slice(0, 4).map((org) => {
                const invoiceLoad = Math.min(100, Math.round((org.usage.invoicesCreated / 1500) * 100));
                return (
                  <div
                    key={org.id}
                    onClick={() => onNavigate('organizations')}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 font-bold flex items-center justify-center text-xs">
                          {org.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-white">{org.name}</div>
                          <div className="text-[11px] text-slate-400">
                            {org.city}, {org.state} • {org.adminEmail}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-400">
                          ₹{org.mrr > 0 ? `${org.mrr}/mo` : 'Trial'}
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {org.planName}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                      <div>
                        Invoices: <strong className="text-white">{org.usage.invoicesCreated}</strong>
                      </div>
                      <div>
                        Quotes: <strong className="text-white">{org.usage.estimatesCreated}</strong>
                      </div>
                      <div>
                        GST Processed:{' '}
                        <strong className="text-emerald-400">
                          ₹{(org.usage.gstTaxHandledInr || 0).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        Receipts: <strong className="text-white">{org.usage.paymentLedgerEntries || 0}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Audit Activity Feed */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Live Platform Activity</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="divide-y divide-slate-800/80 mt-2 space-y-1">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-brand-400 truncate max-w-[140px]">
                      {log.adminName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white truncate">
                    {log.action.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Target: {log.targetName}
                  </div>
                  {log.newValue && (
                    <div className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900/40 truncate">
                      {log.newValue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('audit_logs')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors text-center cursor-pointer"
          >
            View Full Audit Compliance Log
          </button>
        </div>
      </div>
    </div>
  );
};
