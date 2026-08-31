import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Shield,
  KeyRound,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Mail,
  Building2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { PlatformUser } from '../../types/admin';

export const UsersManagementView: React.FC = () => {
  const [users, setUsers] = useState<PlatformUser[]>(SaaSAdminDB.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reloadData = async () => {
    setIsRefreshing(true);
    const live = await SaaSAdminDB.getUsersAsync();
    setUsers(live);
    setIsRefreshing(false);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleToggleStatus = (user: PlatformUser) => {
    const isSuspended = user.status === 'SUSPENDED';
    const newStatus: PlatformUser['status'] = isSuspended ? 'ACTIVE' : 'SUSPENDED';
    const updated = { ...user, status: newStatus };
    SaaSAdminDB.saveUser(updated);
    SaaSAdminDB.logAction(
      isSuspended ? 'ACTIVATE_USER' : 'SUSPEND_USER',
      'USER',
      user.id,
      user.name,
      { newVal: `Status changed to ${newStatus}` }
    );
    reloadData();
  };

  const handleResetPassword = (user: PlatformUser) => {
    alert(`A password reset link has been dispatched to ${user.email}`);
    SaaSAdminDB.logAction('SEND_PASSWORD_RESET', 'USER', user.id, user.name, {
      newVal: `Sent to ${user.email}`,
    });
  };

  const handleDeleteUser = (user: PlatformUser) => {
    if (window.confirm(`Permanently remove user "${user.name}" (${user.email})?`)) {
      SaaSAdminDB.deleteUser(user.id);
      SaaSAdminDB.logAction('DELETE_USER', 'USER', user.id, user.name);
      reloadData();
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Platform User Accounts & Role Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Global directory of tenant owners and administrative accounts across all organizations
          </p>
        </div>

        <button
          onClick={reloadData}
          disabled={isRefreshing}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          title="Sync user accounts from Cloudflare D1"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, organization..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="OWNER">Tenant Owner</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-3">Organization</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Last Active</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((user) => {
                return (
                  <tr key={user.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-200">{user.organizationName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Plan: {user.planName}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-900 text-slate-200 border border-slate-700">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        ● {user.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                          title="Send Password Reset"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer"
                          title={user.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                        >
                          {user.status === 'ACTIVE' ? (
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 bg-slate-900 hover:bg-rose-950 text-rose-400 rounded-lg cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
