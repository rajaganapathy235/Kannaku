import React from 'react';
import {
  BarChart3,
  BookOpen,
  Compass,
  CreditCard,
  FileText,
  Home,
  Package,
  Settings,
  Shield,
  Truck,
  Users,
  Wallet,
  Globe,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'invoices'
  | 'customers'
  | 'suppliers'
  | 'products'
  | 'payments'
  | 'reports'
  | 'subscription'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab | string;
  onTabChange: (tab: NavTab) => void;
  invoicesCount: number;
  customersCount?: number;
  lowStockCount?: number;
  onOpenSuperAdmin?: () => void;
  onOpenHomepage?: () => void;
  onOpenHowToUse?: () => void;
  onStartTour?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  invoicesCount,
  customersCount = 0,
  lowStockCount = 0,
  onOpenSuperAdmin,
  onOpenHomepage,
  onOpenHowToUse,
  onStartTour,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: FileText,
      badge: invoicesCount > 0 ? invoicesCount : undefined,
    },
    {
      id: 'customers',
      label: 'Clients',
      icon: Users,
      badge: customersCount > 0 ? customersCount : undefined,
    },
    {
      id: 'products',
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
    },
    { id: 'payments', label: 'Ledger', icon: Wallet },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'reports', label: 'Reports & GST', icon: BarChart3 },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs">
          K
        </div>
        <div>
          <span className="text-lg font-black tracking-tight text-slate-900 uppercase">
            Kannaku
          </span>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            GST Billing Suite
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Workspace Status Card */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            Workspace Active
          </span>
        </div>
        <div className="text-xs text-slate-500 flex justify-between items-center font-medium">
          <span>Invoices Recorded</span>
          <span className="font-mono text-[11px] font-bold text-blue-600">
            {invoicesCount}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(15, invoicesCount * 12))}%` }}
          ></div>
        </div>

        {onStartTour && (
          <button
            onClick={onStartTour}
            className="mt-3 w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer active:scale-98"
          >
            <Compass className="w-3.5 h-3.5 text-white" />
            <span>Workspace Tour</span>
          </button>
        )}

        {onOpenHowToUse && (
          <button
            onClick={onOpenHowToUse}
            className="mt-2 w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>How to Use Guide</span>
          </button>
        )}

        {onOpenHomepage && (
          <button
            onClick={onOpenHomepage}
            className="mt-2 w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Product Homepage</span>
          </button>
        )}

        {onOpenSuperAdmin && (
          <button
            onClick={onOpenSuperAdmin}
            className="mt-2 w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Super Admin Portal</span>
          </button>
        )}
      </div>
    </aside>
  );
};

