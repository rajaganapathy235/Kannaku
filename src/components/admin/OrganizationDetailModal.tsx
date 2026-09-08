import React, { useState } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  BarChart3,
  History,
  X,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight,
  UserPlus,
  KeyRound,
  Trash2,
  Percent,
  Save,
  Zap,
  CalendarClock,
  Sparkles,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import {
  TenantOrganizationFull,
  PlatformUser,
  SaaSPlan,
  AuditLogEntry,
  ImpersonationSession,
} from '../../types/admin';

interface OrganizationDetailModalProps {
  organization: TenantOrganizationFull | null;
  isOpen: boolean;
  onClose: () => void;
  onImpersonate: (orgId: string) => void;
  onOrgUpdated: () => void;
}

export const OrganizationDetailModal: React.FC<OrganizationDetailModalProps> = ({
  organization,
  isOpen,
  onClose,
  onImpersonate,
  onOrgUpdated,
}) => {
  if (!isOpen || !organization) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscription' | 'usage' | 'activity'>('overview');
  const [plans, setPlans] = useState<SaaSPlan[]>(SaaSAdminDB.getPlans());
  const [users, setUsers] = useState<PlatformUser[]>(
    SaaSAdminDB.getUsers().filter((u) => u.organizationId === organization.id)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(
    SaaSAdminDB.getAuditLogs().filter((l) => l.organizationId === organization.id || l.targetId === organization.id)
  );
  const [impersonationSessions, setImpersonationSessions] = useState<ImpersonationSession[]>(
    SaaSAdminDB.getImpersonationSessions().filter((s) => s.organizationId === organization.id)
  );

  // Editable Subscription & Usage Period State
  const [subStatus, setSubStatus] = useState<string>(organization.subscriptionStatus || 'ACTIVE');
  const [targetPlanId, setTargetPlanId] = useState<string>(organization.planId || 'plan_all_in_one_pro');
  const [targetCycle, setTargetCycle] = useState<string>(organization.billingCycle || 'YEARLY');
  const [trialEndDateStr, setTrialEndDateStr] = useState<string>(
    organization.trialEndDate ? organization.trialEndDate.split('T')[0] : new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [renewalDateStr, setRenewalDateStr] = useState<string>(
    organization.renewalDate ? organization.renewalDate.split('T')[0] : new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const currentPlan = plans.find((p) => p.id === targetPlanId) || plans[0] || {
    id: 'plan_all_in_one_pro',
    name: 'All-in-One Growth Plan',
    monthlyPriceInr: 99,
    sixMonthPriceInr: 399,
    yearlyPriceInr: 599,
    limits: {
      maxUsers: 5,
      maxInvoicesPerMonth: 500,
      maxQuotationsPerMonth: 500,
      maxCustomers: 500,
      maxProducts: 500,
      pdfGenerationsLimit: 1000,
    },
  };

  // Helper to extend days
  const handleQuickAddDays = (days: number, isTrial: boolean) => {
    if (isTrial) {
      const base = trialEndDateStr ? new Date(trialEndDateStr) : new Date();
      const next = isNaN(base.getTime()) || base.getTime() < Date.now() ? new Date() : new Date(base);
      next.setDate(next.getDate() + days);
      setTrialEndDateStr(next.toISOString().split('T')[0]);
    } else {
      const base = renewalDateStr ? new Date(renewalDateStr) : new Date();
      const next = isNaN(base.getTime()) || base.getTime() < Date.now() ? new Date() : new Date(base);
      next.setDate(next.getDate() + days);
      setRenewalDateStr(next.toISOString().split('T')[0]);
    }
  };

  // Switch status preset
  const handleQuickSwitchStatus = (newStatus: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'SUSPENDED') => {
    setSubStatus(newStatus);
    if (newStatus === 'ACTIVE') {
      const now = new Date();
      const curr = renewalDateStr ? new Date(renewalDateStr) : null;
      if (!curr || isNaN(curr.getTime()) || curr.getTime() <= now.getTime()) {
        const next = new Date();
        next.setDate(next.getDate() + (targetCycle === 'YEARLY' ? 365 : targetCycle === 'HALF_YEARLY' ? 180 : 30));
        setRenewalDateStr(next.toISOString().split('T')[0]);
      }
    } else if (newStatus === 'TRIAL') {
      const now = new Date();
      const curr = trialEndDateStr ? new Date(trialEndDateStr) : null;
      if (!curr || isNaN(curr.getTime()) || curr.getTime() <= now.getTime()) {
        const next = new Date();
        next.setDate(next.getDate() + 15);
        setTrialEndDateStr(next.toISOString().split('T')[0]);
      }
    } else if (newStatus === 'PAST_DUE') {
      // Set to yesterday so read-only lock activates immediately
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      setTrialEndDateStr(yesterday);
      setRenewalDateStr(yesterday);
    }
  };

  // Save all subscription changes
  const handleSaveSubscriptionConfig = () => {
    const plan = plans.find((p) => p.id === targetPlanId) || currentPlan;
    const mrr = targetCycle === 'YEARLY'
      ? Math.round((plan.yearlyPriceInr || 599) / 12)
      : targetCycle === 'HALF_YEARLY'
      ? Math.round((plan.sixMonthPriceInr || 399) / 6)
      : (plan.monthlyPriceInr || 99);

    const updated: TenantOrganizationFull = {
      ...organization,
      planId: plan.id,
      planName: plan.name,
      subscriptionStatus: subStatus as any,
      billingCycle: targetCycle as any,
      mrr: subStatus === 'TRIAL' ? 0 : mrr,
      trialEndDate: trialEndDateStr ? new Date(trialEndDateStr).toISOString() : undefined,
      renewalDate: renewalDateStr ? new Date(renewalDateStr).toISOString() : new Date().toISOString(),
    };

    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      'UPDATE_ORGANIZATION_SUBSCRIPTION',
      'ORGANIZATION',
      organization.id,
      organization.name,
      {
        orgId: organization.id,
        newVal: `Status: ${subStatus}, Plan: ${plan.name} (${targetCycle}), TrialEnd: ${trialEndDateStr}, Renewal: ${renewalDateStr}`,
      }
    );

    onOrgUpdated();
    showToast(`Saved! Status is now ${subStatus} and synced to D1 database.`);
  };

  const handlePlanChange = (newPlanId: string) => {
    setTargetPlanId(newPlanId);
    const targetPlan = plans.find((p) => p.id === newPlanId);
    if (!targetPlan) return;

    const updated: TenantOrganizationFull = {
      ...organization,
      planId: targetPlan.id,
      planName: targetPlan.name,
      mrr: targetPlan.monthlyPriceInr,
    };
    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      'CHANGE_ORGANIZATION_PLAN',
      'ORGANIZATION',
      organization.id,
      organization.name,
      {
        orgId: organization.id,
        orgName: organization.name,
        prevVal: organization.planName,
        newVal: targetPlan.name,
      }
    );
    onOrgUpdated();
    showToast(`Plan updated to ${targetPlan.name}`);
  };

  const handleAddUser = () => {
    const name = window.prompt('Enter User Full Name:');
    if (!name) return;
    const email = window.prompt('Enter User Email Address:');
    if (!email) return;

    const newUser: PlatformUser = {
      id: `usr_${Date.now()}`,
      organizationId: organization.id,
      organizationName: organization.name,
      name,
      email,
      role: 'OWNER',
      status: 'ACTIVE',
      planName: organization.planName,
      lastLogin: new Date().toISOString(),
      createdDate: new Date().toISOString(),
    };

    SaaSAdminDB.saveUser(newUser);
    SaaSAdminDB.logAction(
      'ADD_TENANT_USER',
      'USER',
      newUser.id,
      newUser.name,
      { orgId: organization.id, orgName: organization.name, newVal: `${newUser.name} (${newUser.email})` }
    );
    setUsers(SaaSAdminDB.getUsers().filter((u) => u.organizationId === organization.id));
    onOrgUpdated();
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Remove user "${userName}" from ${organization.name}?`)) {
      SaaSAdminDB.deleteUser(userId);
      SaaSAdminDB.logAction(
        'REMOVE_TENANT_USER',
        'USER',
        userId,
        userName,
        { orgId: organization.id, orgName: organization.name }
      );
      setUsers(SaaSAdminDB.getUsers().filter((u) => u.organizationId === organization.id));
      onOrgUpdated();
    }
  };

  // Remaining days calculation
  const relevantExpiryStr = subStatus === 'TRIAL' ? trialEndDateStr : renewalDateStr;
  const daysDiff = Math.ceil((new Date(relevantExpiryStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center text-xl font-bold shrink-0">
              {organization.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white truncate">
                  {organization.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {organization.accountStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                ID: {organization.id} • GSTIN: {organization.registerNumber || 'Unregistered'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onImpersonate(organization.id);
                onClose();
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Impersonate (Login as Client)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-800 bg-slate-950 text-xs font-bold overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: 'Overview', icon: Building2 },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard },
            { id: 'usage', label: 'Usage vs Limits', icon: BarChart3 },
            { id: 'activity', label: 'Audit Timeline', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Business Owner</div>
                  <div className="text-sm font-bold text-white">{organization.ownerName}</div>
                  <div className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    {organization.adminEmail}
                  </div>
                  <div className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {organization.mobile}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-500">Location & Tax</div>
                  <div className="text-sm font-bold text-white flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-400" />
                    {organization.city}, {organization.state}
                  </div>
                  <div className="text-slate-400">{organization.country}</div>
                  <div className="font-mono text-brand-400 font-bold">GSTIN: {organization.registerNumber}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center justify-between">
                    <span>Subscription Status</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('subscription')}
                      className="text-brand-400 hover:text-brand-300 text-[10px] font-bold underline cursor-pointer"
                    >
                      Edit Period & Plan
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        subStatus === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : subStatus === 'TRIAL'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      {subStatus}
                    </span>
                    <span className="text-sm font-bold text-white truncate">{organization.planName}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] pt-1">
                    {subStatus === 'TRIAL' ? (
                      <span>Trial Ends: <strong className="text-amber-400 font-mono">{trialEndDateStr}</strong></span>
                    ) : (
                      <span>Renews: <strong className="text-emerald-400 font-mono">{renewalDateStr}</strong></span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-brand-400">
                    {daysDiff > 0 ? `${daysDiff} days remaining` : `Expired ${Math.abs(daysDiff)} days ago`}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="font-bold text-white text-sm">Tenant Infrastructure & Custom Domain</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Custom Domain (CNAME)</label>
                    <div className="text-white font-mono bg-slate-900 p-2 rounded-lg border border-slate-800 mt-1">
                      {organization.customDomain || 'None configured (Using default subdomain)'}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Registered Date</label>
                    <div className="text-white font-mono bg-slate-900 p-2 rounded-lg border border-slate-800 mt-1">
                      {new Date(organization.createdDate).toLocaleString()}
                    </div>
                  </div>
                </div>
                {organization.notes && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Admin Operator Notes</label>
                    <div className="p-2.5 bg-slate-900 rounded-lg text-slate-300 border border-slate-800 mt-1">
                      {organization.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">
                  Authorized Users ({users.length} of {currentPlan.limits.maxUsers} limit)
                </h3>
                <button
                  onClick={handleAddUser}
                  className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add New User</span>
                </button>
              </div>

              <div className="divide-y divide-slate-800 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                {users.map((user) => (
                  <div key={user.id} className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-950 text-brand-400 font-bold border border-brand-800">
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{user.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Password reset dispatched for ${user.email}`)}
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                        title="Send Password Reset"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-1.5 bg-slate-900 hover:bg-rose-950 text-rose-400 rounded-lg cursor-pointer"
                        title="Remove User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTION & USAGE PERIOD */}
          {activeTab === 'subscription' && (
            <div className="space-y-5">
              {/* Status Mode Switcher */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-xs uppercase tracking-wide text-slate-400">
                      Subscription Mode & Account State
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Switching status immediately takes effect on client session & feature access
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        subStatus === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : subStatus === 'TRIAL'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}
                    >
                      Current: {subStatus}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickSwitchStatus('ACTIVE')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      subStatus === 'ACTIVE'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50 scale-[1.02]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-800/60'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PAID (Active)</span>
                    <span className="text-[9px] font-normal opacity-80 text-center">Full unrestricted access</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitchStatus('TRIAL')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      subStatus === 'TRIAL'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/50 scale-[1.02]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-800/60'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>TRIAL Period</span>
                    <span className="text-[9px] font-normal opacity-80 text-center">Trial usage window</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitchStatus('PAST_DUE')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      subStatus === 'PAST_DUE'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-lg shadow-rose-950/50 scale-[1.02]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-800/60'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>EXPIRED (Read-Only)</span>
                    <span className="text-[9px] font-normal opacity-80 text-center">Locked view-only mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitchStatus('SUSPENDED')}
                    className={`p-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      subStatus === 'SUSPENDED'
                        ? 'bg-slate-800 border-slate-600 text-white shadow-lg scale-[1.02]'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>SUSPENDED</span>
                    <span className="text-[9px] font-normal opacity-80 text-center">Account disabled</span>
                  </button>
                </div>
              </div>

              {/* Usage Time Period & Expiration Manager */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-5 h-5 text-brand-400" />
                    <div>
                      <h3 className="font-bold text-white text-xs">
                        {subStatus === 'TRIAL' ? 'Trial Usage Time Period' : 'Subscription Usage Validity & Expiration'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {subStatus === 'TRIAL'
                          ? 'Set or extend how long this tenant can test the software for free'
                          : 'Set or extend the active paid subscription renewal deadline'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-black px-2.5 py-1 rounded-lg border ${
                        daysDiff > 7
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                          : daysDiff > 0
                          ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                          : 'bg-rose-950/60 text-rose-400 border-rose-800'
                      }`}
                    >
                      {daysDiff > 0 ? `⏳ ${daysDiff} Days Remaining` : `⚠️ Expired ${Math.abs(daysDiff)} Days Ago`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {subStatus === 'TRIAL' ? (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Trial Expiration Date</span>
                      </label>
                      <input
                        type="date"
                        value={trialEndDateStr}
                        onChange={(e) => setTrialEndDateStr(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Subscription Renewal / Expiration Date</span>
                      </label>
                      <input
                        type="date"
                        value={renewalDateStr}
                        onChange={(e) => setRenewalDateStr(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-xl text-white font-mono text-xs focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-300">
                      Billing Interval Contract
                    </label>
                    <select
                      value={targetCycle}
                      onChange={(e) => setTargetCycle(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 focus:border-brand-500 rounded-xl text-white text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="MONTHLY">1 Month (Monthly ₹{currentPlan.monthlyPriceInr}/mo)</option>
                      <option value="HALF_YEARLY">6 Months (₹{currentPlan.sixMonthPriceInr} total)</option>
                      <option value="YEARLY">12 Months (Yearly ₹{currentPlan.yearlyPriceInr} total)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Add Presets */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[10px] font-bold uppercase text-slate-400">
                    Quick Period Extensions (Instant Add)
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { days: 7, label: '+7 Days' },
                      { days: 15, label: '+15 Days' },
                      { days: 30, label: '+1 Month' },
                      { days: 90, label: '+3 Months' },
                      { days: 180, label: '+6 Months' },
                      { days: 365, label: '+1 Year' },
                      { days: 3650, label: '+10 Yrs (Lifetime)' },
                    ].map((preset) => (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => handleQuickAddDays(preset.days, subStatus === 'TRIAL')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-brand-600 hover:text-white text-slate-300 border border-slate-800 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plan Tier Selection */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wide text-slate-400">
                    Assigned Plan Tier
                  </h3>
                  <span className="text-xs font-bold text-emerald-400">
                    {subStatus === 'TRIAL' ? 'Free Trial' : `₹${currentPlan.monthlyPriceInr}/month`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {plans.map((p) => {
                    const isSelected = targetPlanId === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handlePlanChange(p.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-brand-950/60 border-brand-500 text-white shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-black text-xs text-white flex items-center justify-between">
                          <span>{p.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />}
                        </div>
                        <div className="text-[11px] font-mono font-bold text-emerald-400 mt-1">
                          ₹{p.monthlyPriceInr}/mo • ₹{p.yearlyPriceInr}/yr
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {p.tagline}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button Bar */}
              <div className="p-4 rounded-xl bg-brand-950/30 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white text-xs">Save Subscription & Usage Changes</div>
                  <div className="text-[11px] text-slate-400">
                    Saves directly to D1 database & syncs with active user sessions immediately
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSubscriptionConfig}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-950 transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes to D1</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: USAGE VS LIMITS */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-sm">Monthly Quota Consumption & Plan Ceilings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    label: 'Tax Invoices Created',
                    used: organization.usage.invoicesCreated,
                    limit: currentPlan.limits.maxInvoicesPerMonth,
                    unit: 'bills',
                  },
                  {
                    label: 'Quotations / Estimates',
                    used: organization.usage.estimatesCreated,
                    limit: currentPlan.limits.maxQuotationsPerMonth || 100,
                    unit: 'quotes',
                  },
                  {
                    label: 'Customer / Party Ledgers',
                    used: organization.usage.customersCount,
                    limit: currentPlan.limits.maxCustomers,
                    unit: 'parties',
                  },
                  {
                    label: 'Product Catalog Items',
                    used: organization.usage.productsCount,
                    limit: currentPlan.limits.maxProducts,
                    unit: 'items',
                  },
                  {
                    label: 'PDF Prints Generated',
                    used: organization.usage.pdfGenerationsCount,
                    limit: currentPlan.limits.pdfGenerationsLimit,
                    unit: 'PDFs',
                  },
                  {
                    label: 'Logo & Bill Cloud Storage',
                    used: organization.usage.storageUsedMB || 0,
                    limit: 100,
                    unit: 'MB',
                  },
                ].map((item, idx) => {
                  const pct = Math.min(100, Math.round((item.used / (item.limit || 1)) * 100));
                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-300">{item.label}</span>
                        <span className="text-brand-400">
                          {item.used} / {item.limit.toLocaleString()} {item.unit}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct > 90 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-brand-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITY & SUPPORT TIMELINE */}
          {activeTab === 'activity' && (
            <div className="space-y-5">
              {/* Impersonation & Troubleshooting Sessions */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-xs flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" />
                    <span>Support Impersonation & Troubleshooting Sessions ({impersonationSessions.length})</span>
                  </h3>
                  <button
                    onClick={() => {
                      onImpersonate(organization.id);
                    }}
                    className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Launch Support Session</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {impersonationSessions.length === 0 ? (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
                      No admin impersonation or troubleshooting sessions recorded for this organization.
                    </div>
                  ) : (
                    impersonationSessions.map((sess) => {
                      const isActive = sess.status === 'ACTIVE';
                      const mins = Math.floor((sess.durationSeconds || 0) / 60);
                      const secs = (sess.durationSeconds || 0) % 60;
                      const durationText = isActive ? 'Active Now' : mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

                      return (
                        <div
                          key={sess.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isActive
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{sess.adminName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-brand-950 text-brand-300 border border-brand-800">
                                {sess.adminRole}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500">
                                {new Date(sess.startedAt).toLocaleString()}
                              </span>
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                  isActive
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {isActive ? 'ACTIVE' : durationText}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-amber-200/90 font-medium leading-relaxed">
                            {sess.reason}
                          </div>

                          {sess.supportTicketId && (
                            <div className="text-[10px] font-mono text-slate-500 mt-1">
                              Reference Ticket: {sess.supportTicketId}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Administrative Platform Logs */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <h3 className="font-bold text-white text-xs">Platform Configuration & Administrative Ledger</h3>
                <div className="divide-y divide-slate-800/80 bg-slate-950 rounded-xl border border-slate-800 p-2">
                  {auditLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No configuration audit entries recorded.
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-brand-400">{log.adminName}</span>
                          <span className="font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-white font-semibold text-xs">{log.action.replace(/_/g, ' ')}</div>
                        {log.newValue && (
                          <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
                            {log.newValue}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Toast Notification */}
        {toastMsg && (
          <div className="absolute bottom-4 right-6 z-50 bg-slate-900 border border-emerald-500/60 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
