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

  const currentPlan = plans.find((p) => p.id === organization.planId) || plans[1];

  const handlePlanChange = (newPlanId: string) => {
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
    alert(`Plan changed to ${targetPlan.name}`);
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
                  <div className="text-[10px] font-bold uppercase text-slate-500">Subscription Status</div>
                  <div className="text-sm font-bold text-emerald-400">{organization.planName}</div>
                  <div className="text-slate-400">Cycle: {organization.billingCycle}</div>
                  <div className="text-slate-400">MRR: ₹{organization.mrr}</div>
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

          {/* TAB 3: SUBSCRIPTION */}
          {activeTab === 'subscription' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400">Current Assigned Plan:</div>
                    <div className="text-base font-black text-white">{organization.planName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">
                      ₹{organization.mrr}/month ({organization.billingCycle})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Renews on: {new Date(organization.renewalDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">Switch Plan / Tier:</span>
                  {plans.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePlanChange(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        organization.planId === p.id
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
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
      </div>
    </div>
  );
};
