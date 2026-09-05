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

  const rawAvatarUrl = user?.avatarUrl || '';
  // Ensure the avatar always uses brand emerald (#059669) background and crisp white bold initials
  const avatarUrl =
    !rawAvatarUrl || rawAvatarUrl.includes('ui-avatars.com')
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'JustGST')}&background=059669&color=ffffff&bold=true`
      : rawAvatarUrl;

  const initials = (user?.name || 'JustGST')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-200/80 shadow-xs shrink-0 bg-brand-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-brand-500/20 relative">
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-[11px] select-none">
            {initials}
          </span>
          <img
            src={avatarUrl}
            alt={user?.name || 'User'}
            className="w-full h-full object-cover relative z-10"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <div className="hidden xl:block text-left">
          <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
            {user?.name || 'Rajaganapathy K.'}
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
          <div className="px-4 py-3 border-b border-slate-100 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-200 shadow-xs shrink-0 bg-brand-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-brand-500/20 relative">
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs select-none">
                  {initials}
                </span>
                <img
                  src={avatarUrl}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span className="truncate">{user?.name || 'Rajaganapathy K.'}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200 shrink-0 ml-1">
                    {user?.role || 'OWNER'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate font-mono">{user?.email || 'contact@justgst.in'}</div>
              </div>
            </div>
            <div className="text-[11px] text-slate-700 font-medium truncate flex items-center gap-1.5 pt-1">
              <Building2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
              <span className="truncate font-semibold">{user?.organizationName || 'JustGST Workspace'}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 hover:text-brand-600 flex items-center gap-2.5 transition-colors cursor-pointer font-medium"
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
                className="w-full px-4 py-2 text-left text-brand-600 hover:bg-brand-50 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
              >
                <Globe className="w-4 h-4 text-brand-500" />
                <span>Product Homepage</span>
              </button>
            )}

            {onOpenSuperAdmin && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenSuperAdmin();
                }}
                className="w-full px-4 py-2 text-left text-brand-700 hover:bg-brand-50 flex items-center gap-2.5 transition-colors cursor-pointer font-bold"
              >
                <Shield className="w-4 h-4 text-brand-600" />
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
