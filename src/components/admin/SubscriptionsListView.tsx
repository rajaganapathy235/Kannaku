import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  Plus,
  Coins,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  CalendarClock,
  X,
  Check,
  Percent,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { TenantOrganizationFull, SaaSPlan, OrgSubscriptionStatus } from '../../types/admin';

interface SubscriptionsListViewProps {
  onImpersonate?: (org: TenantOrganizationFull) => void;
  onNavigateToPlans?: () => void;
}

export const SubscriptionsListView: React.FC<SubscriptionsListViewProps> = ({
  onImpersonate,
  onNavigateToPlans,
}) => {
  const [organizations, setOrganizations] = useState<TenantOrganizationFull[]>(
    SaaSAdminDB.getOrganizations()
  );
  const [plans] = useState<SaaSPlan[]>(SaaSAdminDB.getPlans());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCycle, setFilterCycle] = useState<string>('ALL');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');

  // Modals state
  const [selectedOrgForPlan, setSelectedOrgForPlan] = useState<TenantOrganizationFull | null>(null);
  const [selectedOrgForExtend, setSelectedOrgForExtend] = useState<TenantOrganizationFull | null>(null);
  const [selectedOrgForCredit, setSelectedOrgForCredit] = useState<TenantOrganizationFull | null>(null);
  const [selectedOrgForStatus, setSelectedOrgForStatus] = useState<TenantOrganizationFull | null>(null);

  // Form states
  const [targetPlanId, setTargetPlanId] = useState<string>('');
  const [targetCycle, setTargetCycle] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const [extendDays, setExtendDays] = useState<number>(30);
  const [customExtendDate, setCustomExtendDate] = useState<string>('');
  const [creditAmount, setCreditAmount] = useState<string>('500');
  const [creditReason, setCreditReason] = useState<string>('Goodwill billing credit / Customer loyalty bonus');
  const [targetStatus, setTargetStatus] = useState<OrgSubscriptionStatus>('ACTIVE');
  const [statusReason, setStatusReason] = useState<string>('');

  const reloadData = () => {
    setOrganizations(SaaSAdminDB.getOrganizations());
  };

  // Quick Pause / Resume
  const handleQuickPauseResume = (org: TenantOrganizationFull) => {
    const isPaused = org.subscriptionStatus === 'PAUSED' || org.subscriptionStatus === 'PAST_DUE';
    const newStatus: OrgSubscriptionStatus = isPaused ? 'ACTIVE' : 'PAUSED';
    const updated: TenantOrganizationFull = { ...org, subscriptionStatus: newStatus };
    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      isPaused ? 'RESUME_SUBSCRIPTION' : 'PAUSE_SUBSCRIPTION',
      'ORGANIZATION',
      org.id,
      org.name,
      { newVal: `Subscription status set to ${newStatus}` }
    );
    reloadData();
  };

  // Plan change confirmation
  const handleConfirmPlanChange = () => {
    if (!selectedOrgForPlan) return;
    const plan = plans.find((p) => p.id === targetPlanId);
    if (!plan) return;

    const newMrr = targetCycle === 'YEARLY' ? Math.round(plan.yearlyPriceInr / 12) : plan.monthlyPriceInr;
    const updated: TenantOrganizationFull = {
      ...selectedOrgForPlan,
      planId: plan.id,
      planName: plan.name,
      billingCycle: targetCycle,
      mrr: newMrr,
      subscriptionStatus: 'ACTIVE',
    };

    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      'CHANGE_PLAN',
      'ORGANIZATION',
      selectedOrgForPlan.id,
      selectedOrgForPlan.name,
      {
        prevVal: `${selectedOrgForPlan.planName} (${selectedOrgForPlan.billingCycle})`,
        newVal: `${plan.name} (${targetCycle}) @ ₹${newMrr}/mo MRR`,
      }
    );
    setSelectedOrgForPlan(null);
    reloadData();
  };

  // Extension confirmation
  const handleConfirmExtend = () => {
    if (!selectedOrgForExtend) return;
    let newRenewalIso = '';

    if (customExtendDate) {
      newRenewalIso = new Date(customExtendDate).toISOString();
    } else {
      const currentRenewal = new Date(selectedOrgForExtend.renewalDate || new Date());
      currentRenewal.setDate(currentRenewal.getDate() + Number(extendDays));
      newRenewalIso = currentRenewal.toISOString();
    }

    const updated: TenantOrganizationFull = {
      ...selectedOrgForExtend,
      renewalDate: newRenewalIso,
      subscriptionStatus: 'ACTIVE',
    };

    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      'EXTEND_SUBSCRIPTION_VALIDITY',
      'ORGANIZATION',
      selectedOrgForExtend.id,
      selectedOrgForExtend.name,
      {
        prevVal: `Expired/Renewal: ${new Date(selectedOrgForExtend.renewalDate).toLocaleDateString()}`,
        newVal: `Extended until: ${new Date(newRenewalIso).toLocaleDateString()} (+${extendDays} days)`,
      }
    );
    setSelectedOrgForExtend(null);
    reloadData();
  };

  // Wallet Credit confirmation
  const handleConfirmCredit = () => {
    if (!selectedOrgForCredit) return;
    const amt = parseFloat(creditAmount);
    if (isNaN(amt) || amt <= 0) return;

    SaaSAdminDB.logAction(
      'ADD_MANUAL_CREDIT',
      'ORGANIZATION',
      selectedOrgForCredit.id,
      selectedOrgForCredit.name,
      {
        newVal: `Credited ₹${amt.toLocaleString()} (${creditReason})`,
      }
    );
    setSelectedOrgForCredit(null);
    reloadData();
  };

  // Status Change confirmation
  const handleConfirmStatusChange = () => {
    if (!selectedOrgForStatus) return;
    const updated: TenantOrganizationFull = {
      ...selectedOrgForStatus,
      subscriptionStatus: targetStatus,
    };
    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      'UPDATE_SUBSCRIPTION_STATUS',
      'ORGANIZATION',
      selectedOrgForStatus.id,
      selectedOrgForStatus.name,
      {
        prevVal: selectedOrgForStatus.subscriptionStatus,
        newVal: `${targetStatus} (${statusReason || 'Admin Override'})`,
      }
    );
    setSelectedOrgForStatus(null);
    reloadData();
  };

  // Metrics
  const activeSubs = organizations.filter((o) => o.subscriptionStatus === 'ACTIVE');
  const totalMrr = organizations.reduce((sum, o) => sum + (o.mrr || 0), 0);
  const totalArr = totalMrr * 12;
  const trialSubs = organizations.filter((o) => o.subscriptionStatus === 'TRIAL');
  const pastDueSubs = organizations.filter((o) => o.subscriptionStatus === 'PAST_DUE');

  // Filtered dataset
  const filtered = organizations.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      o.name.toLowerCase().includes(q) ||
      o.adminEmail.toLowerCase().includes(q) ||
      (o.registerNumber && o.registerNumber.toLowerCase().includes(q)) ||
      o.planName.toLowerCase().includes(q);

    const matchStatus = filterStatus === 'ALL' || o.subscriptionStatus === filterStatus;
    const matchCycle = filterCycle === 'ALL' || o.billingCycle === filterCycle;
    const matchPlan = filterPlan === 'ALL' || o.planName === filterPlan;

    return matchSearch && matchStatus && matchCycle && matchPlan;
  });

  const getStatusBadge = (status: OrgSubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'TRIAL':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'PAST_DUE':
        return 'bg-rose-950/80 text-rose-400 border-rose-800/80';
      case 'PAUSED':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Customer Subscriptions Ledger
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {organizations.length} Tenancies
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage recurring GST billing plans, upgrade tiers, extend validity dates, handle past-due retries, and issue wallet balances.
          </p>
        </div>

        {onNavigateToPlans && (
          <button
            onClick={onNavigateToPlans}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-900/30 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Configure Pricing Plans</span>
          </button>
        )}
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-500/10 to-indigo-950/20 border border-indigo-500/30">
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Subs</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{activeSubs.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {((activeSubs.length / (organizations.length || 1)) * 100).toFixed(0)}% of total tenants
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-500/10 to-purple-950/20 border border-purple-500/30">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total MRR</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">₹{totalMrr.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Monthly recurring revenue</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Annual ARR</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">₹{totalArr.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Contracted annual run rate</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-950/20 border border-amber-500/30">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Trials</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{trialSubs.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">14-day evaluation accounts</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-500/10 to-rose-950/20 border border-rose-500/30">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Past Due</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{pastDueSubs.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Requires payment collection</div>
        </div>
      </div>

      {/* Search & Multifaceted Filtering */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tenant name, email, GSTIN, plan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Badges & Selects */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
            {['ALL', 'ACTIVE', 'TRIAL', 'PAST_DUE', 'PAUSED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Billing Cycle Selector */}
          <select
            value={filterCycle}
            onChange={(e) => setFilterCycle(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Cycles</option>
            <option value="YEARLY">Yearly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="TRIAL">Trial</option>
          </select>

          {/* Plan Selector */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscriptions Ledger Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[11px] font-black uppercase text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-4 px-4">Organization & GSTIN</th>
                <th className="py-4 px-3">Plan Tier</th>
                <th className="py-4 px-3">Cycle</th>
                <th className="py-4 px-3">Monthly Value (MRR)</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-3">Renewal / Expire Date</th>
                <th className="py-4 px-3">Payment Gateway</th>
                <th className="py-4 px-4 text-right">Subscription Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold text-slate-300">No matching subscriptions found</p>
                    <p className="text-[11px] text-slate-500">Try adjusting your search query or status filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((org) => {
                  const mrrVal = typeof org.mrr === 'number' ? org.mrr : 0;
                  const renewalFormatted = org.renewalDate
                    ? new Date(org.renewalDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  const isTrial = org.subscriptionStatus === 'TRIAL';
                  const isPastDue = org.subscriptionStatus === 'PAST_DUE';
                  const isPaused = org.subscriptionStatus === 'PAUSED';

                  return (
                    <tr key={org.id} className="hover:bg-slate-900/50 transition-colors group">
                      {/* Organization info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-900/30 text-indigo-300 font-black flex items-center justify-center border border-indigo-700/40 shrink-0">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{org.name}</span>
                              {org.customDomain && (
                                <span className="text-[10px] text-indigo-400 font-mono">
                                  ({org.customDomain})
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {org.adminEmail} • GST: {org.registerNumber || 'UNREGISTERED'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan Tier */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{org.planName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {org.usersCount} Staff Seats Allowed
                        </div>
                      </td>

                      {/* Billing Cycle */}
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md font-bold text-[10px] text-slate-300 uppercase">
                          {org.billingCycle}
                        </span>
                      </td>

                      {/* MRR */}
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        {mrrVal > 0 ? `₹${mrrVal.toLocaleString()}` : <span className="text-slate-400 font-normal">₹0 (Trial/Free)</span>}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <button
                          onClick={() => {
                            setSelectedOrgForStatus(org);
                            setTargetStatus(org.subscriptionStatus);
                            setStatusReason('');
                          }}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${getStatusBadge(
                            org.subscriptionStatus
                          )}`}
                          title="Click to change status"
                        >
                          <span>{org.subscriptionStatus}</span>
                        </button>
                      </td>

                      {/* Renewal Date */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono text-slate-200 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{renewalFormatted}</span>
                        </div>
                        {isPastDue && (
                          <div className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Overdue - Dunning active</span>
                          </div>
                        )}
                        {isTrial && (
                          <div className="text-[10px] text-amber-400 font-semibold mt-0.5">
                            Trial Period
                          </div>
                        )}
                      </td>

                      {/* Payment Provider */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 uppercase">
                        {org.paymentProvider || 'CASHFREE'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Change Plan */}
                          <button
                            onClick={() => {
                              setSelectedOrgForPlan(org);
                              setTargetPlanId(org.planId);
                              setTargetCycle(org.billingCycle === 'MONTHLY' ? 'MONTHLY' : 'YEARLY');
                            }}
                            className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-700/60 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Upgrade or Switch Plan"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Change Plan</span>
                          </button>

                          {/* Extend Validity */}
                          <button
                            onClick={() => {
                              setSelectedOrgForExtend(org);
                              setExtendDays(30);
                              setCustomExtendDate('');
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Extend Subscription Validity"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                            <span>Extend</span>
                          </button>

                          {/* Add Manual Credit */}
                          <button
                            onClick={() => {
                              setSelectedOrgForCredit(org);
                              setCreditAmount('500');
                              setCreditReason('Goodwill billing credit / Customer loyalty bonus');
                            }}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Add Wallet Balance / Credit"
                          >
                            <Coins className="w-3.5 h-3.5" />
                          </button>

                          {/* Pause / Resume */}
                          <button
                            onClick={() => handleQuickPauseResume(org)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title={isPaused ? 'Resume Subscription' : 'Pause Subscription'}
                          >
                            {isPaused ? (
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <PauseCircle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                          </button>

                          {/* Impersonate */}
                          {onImpersonate && (
                            <button
                              onClick={() => onImpersonate(org)}
                              className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Login as this tenant"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
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

      {/* MODAL 1: CHANGE / SWITCH PLAN MODAL */}
      {selectedOrgForPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white">
                  Change Plan Tier: {selectedOrgForPlan.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrgForPlan(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                  Select Target Pricing Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {plans.map((p) => {
                    const isSelected = targetPlanId === p.id;
                    const price =
                      targetCycle === 'YEARLY'
                        ? `₹${p.yearlyPriceInr}/yr (₹${Math.round(p.yearlyPriceInr / 12)}/mo)`
                        : `₹${p.monthlyPriceInr}/mo`;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setTargetPlanId(p.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-black text-xs text-white flex items-center justify-between">
                          <span>{p.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
                          {price}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {p.tagline}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Billing Cycle Switch */}
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                  Billing Cycle & Contract Period
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetCycle('YEARLY')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      targetCycle === 'YEARLY'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Yearly (2 Months Free)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetCycle('MONTHLY')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      targetCycle === 'MONTHLY'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Monthly Recurring</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-slate-200">Current Plan: </span>
                {selectedOrgForPlan.planName} ({selectedOrgForPlan.billingCycle}) @ ₹
                {selectedOrgForPlan.mrr}/mo MRR
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrgForPlan(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPlanChange}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
              >
                Confirm Plan Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EXTEND VALIDITY MODAL */}
      {selectedOrgForExtend && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">
                  Extend Validity: {selectedOrgForExtend.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrgForExtend(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">Current Renewal Date:</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  {new Date(selectedOrgForExtend.renewalDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                  Quick Extension Presets
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { days: 7, label: '+7 Days' },
                    { days: 30, label: '+1 Month' },
                    { days: 90, label: '+3 Months' },
                    { days: 365, label: '+1 Year' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => {
                        setExtendDays(preset.days);
                        setCustomExtendDate('');
                      }}
                      className={`py-2 px-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        extendDays === preset.days && !customExtendDate
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                  Or Pick Specific Expiration Date
                </label>
                <input
                  type="date"
                  value={customExtendDate}
                  onChange={(e) => setCustomExtendDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrgForExtend(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExtend}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
              >
                Confirm Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD WALLET CREDIT MODAL */}
      {selectedOrgForCredit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Add Wallet Balance: {selectedOrgForCredit.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrgForCredit(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                  Credit Amount (INR ₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="500"
                    className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                  Reason & Audit Memo
                </label>
                <textarea
                  rows={3}
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="e.g. Promotional launch discount, goodwill billing adjustment..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrgForCredit(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCredit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all shadow-md shadow-amber-900/30 cursor-pointer"
              >
                Grant Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: CHANGE SUBSCRIPTION STATUS MODAL */}
      {selectedOrgForStatus && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white">
                  Update Subscription Status
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrgForStatus(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                  Select New Subscription State
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['ACTIVE', 'TRIAL', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED'] as OrgSubscriptionStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTargetStatus(st)}
                        className={`p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                          targetStatus === st
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1.5">
                  Admin Action Note / Reason
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Account reinstated after wire transfer..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedOrgForStatus(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-900/30 cursor-pointer"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
