import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Mail,
  Save,
  Check,
  Globe,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { PlatformSettings } from '../../types/admin';

export const SystemSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>(SaaSAdminDB.getPlatformSettings());
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'security'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    SaaSAdminDB.savePlatformSettings(settings);
    SaaSAdminDB.logAction('UPDATE_SYSTEM_SETTINGS', 'SYSTEM', 'platform_settings', 'Platform Configuration', {
      newVal: `Updated tab ${activeTab}`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-slate-300" />
            <span>Platform Configuration & Security Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure global SaaS parameters, email SMTP services, and platform policies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1 h-fit text-xs font-bold">
          {[
            { id: 'general', label: 'General & Branding', icon: Globe },
            { id: 'email', label: 'Email & SMTP Service', icon: Mail },
            { id: 'security', label: 'Security & 2FA Policies', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-brand-600 text-white font-bold shadow-md'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <form onSubmit={handleSave} className="lg:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Platform settings updated and synchronized across all cluster nodes!</span>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">General SaaS Platform Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Platform Brand Name</label>
                  <input
                    type="text"
                    value={settings.platformName || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platformName: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Support Desk Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        supportEmail: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Default Trial Period (Days)</label>
                  <input
                    type="number"
                    value={settings.defaultTrialDays || 14}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultTrialDays: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Default Currency</label>
                  <input
                    type="text"
                    value={settings.defaultCurrency || 'INR'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultCurrency: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Default SaaS GST %</label>
                  <input
                    type="number"
                    value={settings.defaultGstPercent || 18}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        defaultGstPercent: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="rounded text-rose-600"
                  />
                  <div>
                    <div className="font-bold text-white">Enable Platform Maintenance Mode</div>
                    <div className="text-[11px] text-slate-400">
                      Locks customer invoicing workspaces and displays maintenance landing notice
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowNewRegistrations}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        allowNewRegistrations: e.target.checked,
                      })
                    }
                    className="rounded text-emerald-600"
                  />
                  <div>
                    <div className="font-bold text-white">Allow Public Organization Self-Registrations</div>
                    <div className="text-[11px] text-slate-400">
                      Enables self-serve sign-ups on the customer login page
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">SMTP Email Gateway</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtpHost || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smtpHost: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.smtpPort || 587}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smtpPort: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SMTP User / Username</label>
                  <input
                    type="text"
                    value={settings.smtpUser || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smtpUser: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">From Email Address</label>
                  <input
                    type="email"
                    value={settings.smtpFromEmail || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        smtpFromEmail: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Platform Security & Audit Enforcement</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enforce2FAForAdmins}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        enforce2FAForAdmins: e.target.checked,
                      })
                    }
                    className="rounded text-brand-600"
                  />
                  <div>
                    <div className="font-bold text-white">Enforce 2FA for all Super Admin roles</div>
                    <div className="text-[11px] text-slate-400">
                      Requires hardware TOTP / Authenticator code on login
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-brand-900/30 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
