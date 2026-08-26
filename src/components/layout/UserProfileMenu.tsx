import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut,
  User,
  Building2,
  Shield,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Zap,
  Globe,
} from 'lucide-react';
import { AuthSession } from '../../types/auth';
import { AuthService } from '../../utils/authService';

interface UserProfileMenuProps {
  session: AuthSession | null;
  onLogout: () => void;
  onOpenSuperAdmin?: () => void;
  onOpenSettings: () => void;
  onOpenHomepage?: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  session,
  onLogout,
  onOpenSuperAdmin,
  onOpenSettings,
  onOpenHomepage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = session?.user;
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const avatarUrl =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1A73E8&color=fff`;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300 shadow-xs shrink-0">
          <img src={avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
        </div>
        <div className="hidden xl:block text-left">
          <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
            {user?.name || 'K. Vasanthi'}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
            {user?.role || 'OWNER'}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
          {/* User Profile Header */}
          <div className="px-4 py-3 border-b border-slate-100 space-y-1">
            <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span className="truncate">{user?.name || 'K. Vasanthi'}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {user?.role || 'OWNER'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 truncate font-mono">{user?.email}</div>
            <div className="text-[11px] text-slate-700 font-medium truncate flex items-center gap-1 pt-1">
              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{user?.organizationName || 'HYTEX COTTON MILLS'}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
            >
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Company Profile & Settings</span>
            </button>

            {onOpenHomepage && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenHomepage();
                }}
                className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
              >
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Product Homepage</span>
              </button>
            )}

            {onOpenSuperAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSuperAdmin();
                }}
                className="w-full px-4 py-2 text-left text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                <span>SuperAdmin Console</span>
              </button>
            )}
          </div>

          {/* Sign Out */}
          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out from Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
