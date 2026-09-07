import React from 'react';
import {
  Building2,
  Lock,
  PlusCircle,
  Search,
  Shield,
} from 'lucide-react';
import { CompanyProfile } from '../../types';
import { AuthSession } from '../../types/auth';
import { UserProfileMenu } from './UserProfileMenu';

interface NavbarProps {
  company: CompanyProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewInvoice: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  onOpenSuperAdmin?: () => void;
  onOpenHomepage?: () => void;
  session: AuthSession | null;
  onLogout: () => void;
  isReadOnly?: boolean;
  isTrialExpired?: boolean;
  readOnlyReason?: string | null;
  onOpenTrialModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  activeTab,
  setActiveTab,
  onNewInvoice,
  searchTerm = '',
  onSearchChange,
  onOpenSuperAdmin,
  onOpenHomepage,
  session,
  onLogout,
  isReadOnly,
  isTrialExpired,
  readOnlyReason,
  onOpenTrialModal,
}) => {
  const readOnlyActive = isReadOnly ?? isTrialExpired ?? false;
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Business Dashboard';
      case 'invoices':
        return 'Invoices & Billing';
      case 'create_invoice':
        return 'Create Tax Invoice';
      case 'customers':
        return 'Client Ledger & Receivables';
      case 'suppliers':
        return 'Supplier Management';
      case 'products':
        return 'Inventory & Stock Records';
      case 'payments':
        return 'Payment Ledger & Cash Flow';
      case 'reports':
        return 'Financial Reports & GSTR-1';
      case 'subscription':
        return 'Plans & Licensing';
      case 'settings':
        return 'Company & General Settings';
      default:
        return 'JustGST Invoicing';
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Organization Context */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <img
          src="/icon-mark.svg"
          alt="JustGST"
          className="md:hidden w-8 h-8 rounded-lg object-contain shrink-0"
          style={{ height: '34px', width: '34px', minHeight: '34px' }}
        />
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight truncate">
            {getTabTitle(activeTab)}
          </h1>
          <p className="text-[10px] text-slate-500 truncate md:hidden">
            {company.name}
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium shrink-0 border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate max-w-[200px] font-semibold">{company.name}</span>
          <span className="font-mono text-[11px] text-brand-600">({company.registerNumber})</span>
        </div>

        {readOnlyActive && (
          <button
            id="navbar-trial-expired-chip"
            type="button"
            onClick={onOpenTrialModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors cursor-pointer shrink-0 shadow-xs"
            title="Read-Only Mode Active — Click to upgrade."
          >
            <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span className="hidden sm:inline">
              {readOnlyReason === 'ACCOUNT_SUSPENDED' || readOnlyReason === 'SUSPENDED'
                ? 'Account Suspended (Read-Only)'
                : readOnlyReason === 'SUBSCRIPTION_EXPIRED'
                ? 'Subscription Expired (Read-Only)'
                : 'Trial Expired (Read-Only)'}
            </span>
            <span className="sm:hidden">Read-Only</span>
          </button>
        )}
      </div>

      {/* Right Action Tools & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
        {onSearchChange && (
          <div className="relative hidden md:block w-40 lg:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search records..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 transition-colors"
            />
          </div>
        )}

        <button
          id="btn-navbar-new-invoice"
          onClick={onNewInvoice}
          className={`${
            readOnlyActive
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-brand-600 hover:bg-brand-700 text-white'
          } px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 active:scale-98 cursor-pointer`}
          title={readOnlyActive ? 'Read-Only Mode — Click to view upgrade options' : 'Create New GST Tax Invoice'}
        >
          {readOnlyActive ? <Lock className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </button>

        {onOpenSuperAdmin && (
          <button
            onClick={onOpenSuperAdmin}
            className="bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open Platform Super Admin Portal"
          >
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden md:inline">Admin Portal</span>
          </button>
        )}

        <UserProfileMenu
          session={session}
          onLogout={onLogout}
          onOpenSuperAdmin={onOpenSuperAdmin}
          onOpenHomepage={onOpenHomepage}
          onOpenSettings={() => setActiveTab('settings')}
        />
      </div>
    </header>
  );
};

