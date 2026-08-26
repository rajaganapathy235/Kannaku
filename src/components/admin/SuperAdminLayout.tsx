import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Layers,
  CreditCard,
  Receipt,
  Settings,
  Search,
  Shield,
  ChevronDown,
  ArrowRightLeft,
  Bell,
  ExternalLink,
  Zap,
  Radio,
  Sliders,
  History,
  Globe,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { AdminRole, AdminUser } from '../../types/admin';
import { GlobalSearchModal } from './GlobalSearchModal';

export type AdminNavTab =
  | 'dashboard'
  | 'organizations'
  | 'plans'
  | 'gateways'
  | 'transactions'
  | 'settings'
  | 'users'
  | 'subscriptions'
  | 'trials'
  | 'coupons'
  | 'analytics_revenue'
  | 'analytics_usage'
  | 'tickets'
  | 'announcements'
  | 'email_templates'
  | 'feature_flags'
  | 'system_health'
  | 'errors'
  | 'audit_logs'
  | 'database_explorer'
  | 'data_export'
  | 'activity';

interface SuperAdminLayoutProps {
  activeTab: AdminNavTab;
  onTabChange: (tab: AdminNavTab) => void;
  onSwitchToCustomerApp: () => void;
  onOpenHomepage?: () => void;
  children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({
  activeTab,
  onTabChange,
  onSwitchToCustomerApp,
  onOpenHomepage,
  children,
}) => {
  const [adminUser, setAdminUser] = useState<AdminUser>(SaaSAdminDB.getActiveAdminUser());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeGateway = SaaSAdminDB.getActivePaymentGateway();
  const orgCount = SaaSAdminDB.getOrganizations().length;
  const txnCount = SaaSAdminDB.getTransactions().length;

  const reloadAdminState = () => {
    setAdminUser(SaaSAdminDB.getActiveAdminUser());
  };

  // Streamlined, high-priority navigation
  const primaryNavItems: { id: AdminNavTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'organizations', label: 'Organizations (Tenants)', icon: Building2, badge: orgCount },
    { id: 'plans', label: 'Subscription Plan', icon: Layers },
    { id: 'gateways', label: 'Payment Gateways', icon: CreditCard, badge: activeGateway?.name ? 'Active' : undefined },
    { id: 'transactions', label: 'Payments & Ledger', icon: Receipt, badge: txnCount },
    { id: 'audit_logs', label: 'Activity & Audit Trail', icon: History },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="h-screen w-full flex bg-slate-900 text-slate-100 font-sans antialiased overflow-hidden">
      {/* Super Admin Left Sidebar */}
      <aside
        className={`bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-200 z-30 ${
          sidebarCollapsed ? 'w-18' : 'w-64 lg:w-72'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-purple-900/30 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white uppercase">
                    Kannaku
                  </span>
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-purple-600/30 text-purple-400 border border-purple-500/40">
                    SUPERADMIN
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  Simple SaaS Control Center
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Link Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {!sidebarCollapsed && (
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
              Main Menu
            </div>
          )}

          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left group ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md font-bold shadow-purple-900/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                    }`}
                  />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Payment Gateway Mini Widget in Sidebar */}
        {!sidebarCollapsed && activeGateway && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              <span>Active Gateway</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="font-bold text-white text-xs truncate flex items-center justify-between">
              <span>{activeGateway.name}</span>
              <button
                onClick={() => onTabChange('gateways')}
                className="text-[10px] text-purple-400 hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Footer — Switch to Client Workspace */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950">
          <button
            onClick={onSwitchToCustomerApp}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-purple-400 hover:text-purple-300 border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-98 shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Open Client Billing App</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-900">
        {/* Super Admin Top Header */}
        <header className="h-16 bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          {/* Left: Quick Search Bar */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-medium w-48 sm:w-72 md:w-80 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">Search tenants & invoices (⌘K)...</span>
            </button>

            {/* Active Payment Gateway Badge */}
            <div
              onClick={() => onTabChange('gateways')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-semibold cursor-pointer hover:bg-purple-950/60 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Gateway:</span>
              <span className="text-white font-bold">{activeGateway?.name || 'Dodo Payments'}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Product Homepage Button */}
            {onOpenHomepage && (
              <button
                onClick={onOpenHomepage}
                title="View Public Product Homepage"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Homepage</span>
              </button>
            )}

            {/* Cloudflare Edge Deploy Status Button */}
            <button
              onClick={() => onTabChange('database_explorer')}
              title="Cloudflare D1 & Pages Deployment"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/15 hover:bg-orange-600/25 text-orange-400 border border-orange-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span>Cloudflare D1</span>
            </button>

            {/* Quick Mode Toggle */}
            <button
              onClick={onSwitchToCustomerApp}
              title="Launch Customer Invoicing View"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>

            {/* Admin User Profile */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
              <img
                src={adminUser.avatarUrl || 'https://ui-avatars.com/api/?name=Admin'}
                alt="Admin"
                className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="hidden sm:block text-left min-w-0">
                <div className="text-xs font-bold text-white truncate max-w-[140px]">
                  {adminUser.name}
                </div>
                <div className="text-[10px] font-semibold text-purple-400 truncate">
                  SUPER ADMIN
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/95 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(section) => onTabChange(section as AdminNavTab)}
      />
    </div>
  );
};
