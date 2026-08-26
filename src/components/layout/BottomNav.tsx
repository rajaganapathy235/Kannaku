import React, { useState } from 'react';
import {
  BarChart3,
  CreditCard,
  FileText,
  Home,
  Menu,
  Package,
  Settings,
  Truck,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  invoicesCount: number;
  lowStockCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  invoicesCount,
  lowStockCount,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: Home },
    {
      id: 'invoices' as NavTab,
      label: 'Invoices',
      icon: FileText,
      badge: invoicesCount > 0 ? invoicesCount : undefined,
    },
    { id: 'customers' as NavTab, label: 'Clients', icon: Users },
    {
      id: 'products' as NavTab,
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? '!' : undefined,
    },
  ];

  const moreTabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'payments', label: 'Payment Ledger', icon: Wallet },
    { id: 'reports', label: 'Reports & GST', icon: BarChart3 },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Company Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      {/* Mobile More Sheet */}
      {isMoreOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-slate-200 rounded-t-2xl shadow-xl p-4 md:hidden animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              More Navigation
            </h3>
            <button
              onClick={() => setIsMoreOpen(false)}
              className="p-1 text-slate-500 hover:text-slate-900 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {moreTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMoreOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 md:hidden px-2 py-1.5 shadow-lg">
        <div className="grid grid-cols-5 items-center gap-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !isMoreOpen;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setIsMoreOpen(false);
                }}
                className={`relative flex flex-col items-center justify-center py-1 rounded-md transition-colors ${
                  isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center py-1 rounded-md transition-colors ${
              isMoreOpen ||
              ['suppliers', 'payments', 'reports', 'subscription', 'settings'].includes(
                activeTab
              )
                ? 'text-blue-600 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>
      </div>
    </>
  );
};

