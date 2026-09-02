import React, { useState, useEffect } from 'react';
import {
  Search,
  Building2,
  Users,
  CreditCard,
  Receipt,
  LifeBuoy,
  X,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { TenantOrganizationFull, PlatformUser, SaaSTransaction, SupportTicket } from '../../types/admin';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [orgs, setOrgs] = useState<TenantOrganizationFull[]>([]);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [transactions, setTransactions] = useState<SaaSTransaction[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOrgs(SaaSAdminDB.getOrganizations());
      setUsers(SaaSAdminDB.getUsers());
      setTransactions(SaaSAdminDB.getTransactions());
      setTickets(SaaSAdminDB.getSupportTickets());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredOrgs = q
    ? orgs.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.adminEmail.toLowerCase().includes(q) ||
          o.registerNumber.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      )
    : orgs.slice(0, 3);

  const filteredUsers = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.organizationName.toLowerCase().includes(q)
      )
    : users.slice(0, 3);

  const filteredTxns = q
    ? transactions.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.organizationName.toLowerCase().includes(q) ||
          (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(q))
      )
    : transactions.slice(0, 2);

  const filteredTickets = q
    ? tickets.filter(
        (tk) =>
          tk.subject.toLowerCase().includes(q) ||
          tk.organizationName.toLowerCase().includes(q) ||
          tk.id.toLowerCase().includes(q)
      )
    : tickets.slice(0, 2);

  const hasResults =
    filteredOrgs.length > 0 ||
    filteredUsers.length > 0 ||
    filteredTxns.length > 0 ||
    filteredTickets.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search organizations, users, invoices, transactions, tickets... (Type 'org', 'user', 'sub')"
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 text-xs">
          {!hasResults && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="font-semibold">No matching records found</p>
              <p className="text-[11px] text-slate-400">Try searching by organization name, email, or invoice number.</p>
            </div>
          )}

          {/* Organizations */}
          {filteredOrgs.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span>Organizations ({filteredOrgs.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredOrgs.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => {
                      onNavigate('organizations', org.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center shrink-0">
                        {org.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                          <span>{org.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {org.planName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {org.adminEmail} • {org.city}, {org.state}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {filteredUsers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Users ({filteredUsers.length})</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      onNavigate('users', user.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                          <span>{user.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.email} • {user.organizationName}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {filteredTxns.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-600" />
                <span>Transactions & Invoices</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredTxns.map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => {
                      onNavigate('transactions', txn.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50 dark:hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                        <span>₹{txn.amount.toLocaleString()}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {txn.id}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                          txn.status === 'SUCCESSFUL'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {txn.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {txn.organizationName} • {txn.paymentProvider} ({txn.paymentMethod})
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Tickets */}
          {filteredTickets.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-amber-600" />
                <span>Support Tickets</span>
              </div>
              <div className="mt-1 space-y-1">
                {filteredTickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    onClick={() => {
                      onNavigate('support', tkt.id);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800/80 cursor-pointer group transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                        <span className="truncate">{tkt.subject}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-bold bg-amber-100 text-amber-800">
                          {tkt.priority}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {tkt.organizationName} • {tkt.userName}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Quick Shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono">↵</kbd> to select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded font-mono">⌘K</kbd> to search anywhere
            </span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">JustGST Super Admin Index</span>
        </div>
      </div>
    </div>
  );
};
