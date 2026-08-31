import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  ShieldAlert,
  Trash2,
  Lock,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  ExternalLink,
  ChevronRight,
  Shield,
  KeyRound,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import {
  TenantOrganizationFull,
  OrgSubscriptionStatus,
  OrgAccountStatus,
} from '../../types/admin';
import { OrganizationDetailModal } from './OrganizationDetailModal';
import { CreateEditOrgModal } from './CreateEditOrgModal';
import { StartImpersonationModal } from './StartImpersonationModal';

interface OrganizationsListViewProps {
  onOpenDetail?: (org: TenantOrganizationFull) => void;
  onOpenCreate?: () => void;
  onEditOrg?: (org: TenantOrganizationFull) => void;
  onImpersonate?: (org: TenantOrganizationFull) => void;
}

export const OrganizationsListView: React.FC<OrganizationsListViewProps> = ({
  onOpenDetail,
  onOpenCreate,
  onEditOrg,
  onImpersonate,
}) => {
  const [organizations, setOrganizations] = useState<TenantOrganizationFull[]>(
    SaaSAdminDB.getOrganizations()
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [activeMenuOrgId, setActiveMenuOrgId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Internal modal states
  const [detailOrg, setDetailOrg] = useState<TenantOrganizationFull | null>(null);
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<TenantOrganizationFull | null>(null);
  const [impersonatingOrg, setImpersonatingOrg] = useState<TenantOrganizationFull | null>(null);

  const handleOpenDetailModal = (org: TenantOrganizationFull) => {
    if (onOpenDetail) {
      onOpenDetail(org);
    } else {
      setDetailOrg(org);
    }
  };

  const handleOpenCreateModal = () => {
    if (onOpenCreate) {
      onOpenCreate();
    } else {
      setEditingOrg(null);
      setIsCreateEditOpen(true);
    }
  };

  const handleOpenEditModal = (org: TenantOrganizationFull) => {
    if (onEditOrg) {
      onEditOrg(org);
    } else {
      setEditingOrg(org);
      setIsCreateEditOpen(true);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const reloadData = async () => {
    setIsRefreshing(true);
    const live = await SaaSAdminDB.getOrganizationsAsync();
    setOrganizations(live);
    setIsRefreshing(false);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleToggleSuspend = (org: TenantOrganizationFull) => {
    const isSuspended = org.accountStatus === 'SUSPENDED';
    const newStatus: OrgAccountStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
    const updated: TenantOrganizationFull = {
      ...org,
      accountStatus: newStatus,
    };
    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      isSuspended ? 'UNSUSPEND_ORGANIZATION' : 'SUSPEND_ORGANIZATION',
      'ORGANIZATION',
      org.id,
      org.name,
      { orgId: org.id, orgName: org.name, prevVal: org.accountStatus, newVal: newStatus }
    );
    reloadData();
    showToast(`Organization ${org.name} ${isSuspended ? 'unsuspended & activated' : 'suspended'}.`);
    setActiveMenuOrgId(null);
  };

  const handleDelete = (org: TenantOrganizationFull) => {
    const confirmation = window.prompt(
      `DANGER: Deleting "${org.name}" is irreversible.\nType "DELETE" to confirm:`
    );
    if (confirmation === 'DELETE') {
      SaaSAdminDB.deleteOrganization(org.id);
      SaaSAdminDB.logAction(
        'DELETE_ORGANIZATION',
        'ORGANIZATION',
        org.id,
        org.name,
        { orgId: org.id, orgName: org.name }
      );
      reloadData();
      showToast(`Organization ${org.name} permanently deleted.`);
      setActiveMenuOrgId(null);
    }
  };

  const handleExtendTrial = (org: TenantOrganizationFull) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14);
    const updated: TenantOrganizationFull = {
      ...org,
      subscriptionStatus: 'TRIAL',
      trialEndDate: nextDate.toISOString().split('T')[0],
      renewalDate: nextDate.toISOString().split('T')[0],
    };
    SaaSAdminDB.saveOrganization(updated);
    SaaSAdminDB.logAction(
      'EXTEND_TRIAL',
      'ORGANIZATION',
      org.id,
      org.name,
      { orgId: org.id, orgName: org.name, newVal: `Extended through ${updated.trialEndDate}` }
    );
    reloadData();
    showToast(`Trial extended by 14 days for ${org.name}.`);
    setActiveMenuOrgId(null);
  };

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchSearch =
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.mobile.includes(searchTerm) ||
        org.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' ||
        org.subscriptionStatus === statusFilter ||
        org.accountStatus === statusFilter;

      const matchPlan = planFilter === 'ALL' || org.planId === planFilter;

      return matchSearch && matchStatus && matchPlan;
    });
  }, [organizations, searchTerm, statusFilter, planFilter]);

  const getSubBadge = (status: OrgSubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60';
      case 'TRIAL':
        return 'bg-amber-950/60 text-amber-400 border border-amber-800/60';
      case 'PAST_DUE':
        return 'bg-rose-950/60 text-rose-400 border border-rose-800/60';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-950 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span>Organization / Tenant Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage customer business accounts, quotas, subscriptions, and live impersonation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={reloadData}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sync organizations from Cloudflare D1"
          >
            <RefreshCw className={`w-4 h-4 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>
          <button
            onClick={() => {
              const csv = SaaSAdminDB.exportEntirePlatformData('CSV', 'organizations');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `kannaku_organizations_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Organization</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, phone, ID, GSTIN..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto">
            {['ALL', 'ACTIVE', 'TRIAL', 'PAST_DUE', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none font-medium cursor-pointer"
          >
            <option value="ALL">All Plans</option>
            <option value="plan_free">Free Starter</option>
            <option value="plan_starter">Starter Business</option>
            <option value="plan_pro">Pro Trader</option>
            <option value="plan_business">Annual Business</option>
            <option value="plan_enterprise">Enterprise Custom</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Business / Tenant</th>
                <th className="py-3.5 px-3">Owner / Contact</th>
                <th className="py-3.5 px-3">Plan & Tier</th>
                <th className="py-3.5 px-3">Subscription</th>
                <th className="py-3.5 px-3">Usage & Invoices</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">MRR</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-semibold text-slate-400">No matching organizations found</p>
                    <p className="text-[11px]">Try clearing search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => {
                  return (
                    <tr
                      key={org.id}
                      className="hover:bg-slate-900/60 transition-colors group"
                    >
                      {/* Organization Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-900/30 border border-blue-800/40 text-blue-400 font-bold flex items-center justify-center text-sm shrink-0">
                            {org.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div
                              onClick={() => onOpenDetail(org)}
                              className="font-bold text-white hover:text-blue-400 cursor-pointer truncate max-w-[200px]"
                            >
                              {org.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 truncate">
                              ID: {org.id} • GST: {org.registerNumber || 'UNREGISTERED'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner & Email */}
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-200 truncate max-w-[150px]">
                          {org.ownerName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {org.adminEmail}
                        </div>
                        <div className="text-[10px] text-slate-500">{org.mobile}</div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-200">{org.planName}</span>
                        <div className="text-[11px] text-slate-400">{org.billingCycle}</div>
                      </td>

                      {/* Subscription Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${getSubBadge(
                            org.subscriptionStatus
                          )}`}
                        >
                          {org.subscriptionStatus}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Renews: {new Date(org.renewalDate).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <span>{org.usage.invoicesCreated} Invoices</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({org.usage.storageUsedMB} MB)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {org.usersCount} users • {org.usage.pdfGenerationsCount} PDFs
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            org.accountStatus === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          ● {org.accountStatus}
                        </span>
                      </td>

                      {/* MRR */}
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        ₹{org.mrr.toLocaleString()}
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Impersonate Button */}
                          {onImpersonate && (
                            <button
                              onClick={() => setImpersonatingOrg(org)}
                              title="Impersonate & Login as Customer"
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Impersonate</span>
                            </button>
                          )}

                          {/* View Detail Drawer */}
                          <button
                            onClick={() => handleOpenDetailModal(org)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Modal */}
                          <button
                            onClick={() => handleOpenEditModal(org)}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Organization"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* More Dropdown Toggle */}
                          <button
                            onClick={() =>
                              setActiveMenuOrgId(activeMenuOrgId === org.id ? null : org.id)
                            }
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Dropdown Menu */}
                        {activeMenuOrgId === org.id && (
                          <div className="absolute right-4 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-30 text-left text-xs animate-in fade-in">
                            <button
                              onClick={() => handleToggleSuspend(org)}
                              className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-amber-400 font-semibold cursor-pointer"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span>{org.accountStatus === 'SUSPENDED' ? 'Unsuspend' : 'Suspend Account'}</span>
                            </button>
                            <button
                              onClick={() => handleExtendTrial(org)}
                              className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 font-semibold cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Extend Trial (+14d)</span>
                            </button>
                            <button
                              onClick={() => {
                                alert(`Password reset link dispatched to ${org.adminEmail}`);
                                SaaSAdminDB.logAction(
                                  'SEND_PASSWORD_RESET',
                                  'ORGANIZATION',
                                  org.id,
                                  org.name,
                                  { orgId: org.id, orgName: org.name }
                                );
                                setActiveMenuOrgId(null);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 font-semibold cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Send Password Reset</span>
                            </button>
                            <div className="border-t border-slate-800 my-1"></div>
                            <button
                              onClick={() => handleDelete(org)}
                              className="w-full px-3 py-2 text-left hover:bg-rose-950/60 flex items-center gap-2 text-rose-400 font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Organization</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            Showing <strong className="text-white">{filteredOrgs.length}</strong> of{' '}
            <strong className="text-white">{organizations.length}</strong> organizations
          </div>
          <div className="flex items-center gap-3">
            <span>
              Total MRR:{' '}
              <strong className="text-emerald-400">
                ₹{organizations.reduce((sum, o) => sum + o.mrr, 0).toLocaleString()}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Internal Modals */}
      {detailOrg && (
        <OrganizationDetailModal
          organization={detailOrg}
          isOpen={!!detailOrg}
          onClose={() => setDetailOrg(null)}
          onImpersonate={(orgId) => {
            const target = organizations.find((o) => o.id === orgId) || detailOrg;
            if (onImpersonate) onImpersonate(target);
          }}
          onOrgUpdated={() => {
            reloadData();
            const updated = SaaSAdminDB.getOrganizations().find((o) => o.id === detailOrg.id);
            if (updated) setDetailOrg(updated);
          }}
        />
      )}

      {isCreateEditOpen && (
        <CreateEditOrgModal
          isOpen={isCreateEditOpen}
          organizationToEdit={editingOrg}
          onClose={() => {
            setIsCreateEditOpen(false);
            setEditingOrg(null);
          }}
          onSaved={() => {
            reloadData();
            setIsCreateEditOpen(false);
            setEditingOrg(null);
          }}
        />
      )}

      {/* Start Impersonation Reason Modal */}
      {impersonatingOrg && (
        <StartImpersonationModal
          organization={impersonatingOrg}
          isOpen={!!impersonatingOrg}
          onClose={() => setImpersonatingOrg(null)}
          onConfirm={(org, reason) => {
            setImpersonatingOrg(null);
            if (onImpersonate) {
              onImpersonate(org, reason);
            }
          }}
        />
      )}
    </div>
  );
};
