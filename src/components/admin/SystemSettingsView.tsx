import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Mail,
  Save,
  Check,
  Globe,
  CreditCard,
  Lock,
  Server,
} from 'lucide-react';
import { SaaSAdminDB, DEFAULT_PLATFORM_SETTINGS } from '../../utils/adminStorage';
import { PlatformSettings } from '../../types/admin';

export const SystemSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>(() => SaaSAdminDB.getPlatformSettings());
  const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'email' | 'security'>('general');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    SaaSAdminDB.getPlatformSettingsAsync()
      .then((loaded) => {
        if (isMounted && loaded) {
          setSettings(loaded);
        }
      })
      .catch((err) => console.error('Failed to load platform settings:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    SaaSAdminDB.savePlatformSettings(settings);
    SaaSAdminDB.logAction('UPDATE_SYSTEM_SETTINGS', 'SYSTEM', 'platform_settings', 'Platform Configuration', {
      newVal: `Updated section ${activeTab}`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const updateGeneral = (field: keyof PlatformSettings['general'], value: any) => {
    setSettings((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        [field]: value,
      },
    }));
  };

  const updateBilling = (field: keyof PlatformSettings['billing'], value: any) => {
    setSettings((prev) => ({
      ...prev,
      billing: {
        ...prev.billing,
        [field]: value,
      },
    }));
  };

  const updateEmail = (field: keyof PlatformSettings['email'], value: any) => {
    setSettings((prev) => ({
      ...prev,
      email: {
        ...prev.email,
        [field]: value,
      },
    }));
  };

  const updateSecurity = (field: keyof PlatformSettings['security'], value: any) => {
    setSettings((prev) => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value,
      },
    }));
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
            Configure global SaaS parameters, subscription defaults, email SMTP services, and platform security policies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1 h-fit text-xs font-bold">
          {[
            { id: 'general', label: 'General & Branding', icon: Globe },
            { id: 'billing', label: 'Billing & Defaults', icon: CreditCard },
            { id: 'email', label: 'Email & SMTP Service', icon: Mail },
            { id: 'security', label: 'Security & 2FA Policies', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
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
                    value={settings.general?.saasName || ''}
                    onChange={(e) => updateGeneral('saasName', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Platform Tagline</label>
                  <input
                    type="text"
                    value={settings.general?.tagline || ''}
                    onChange={(e) => updateGeneral('tagline', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Support Desk Email</label>
                  <input
                    type="email"
                    value={settings.general?.supportEmail || ''}
                    onChange={(e) => updateGeneral('supportEmail', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Support Phone Number</label>
                  <input
                    type="text"
                    value={settings.general?.supportPhone || ''}
                    onChange={(e) => updateGeneral('supportPhone', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Default Country</label>
                  <input
                    type="text"
                    value={settings.general?.defaultCountry || 'India'}
                    onChange={(e) => updateGeneral('defaultCountry', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Default Timezone</label>
                  <input
                    type="text"
                    value={settings.general?.timezone || 'Asia/Kolkata (IST +5:30)'}
                    onChange={(e) => updateGeneral('timezone', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.general?.maintenanceMode)}
                    onChange={(e) => updateGeneral('maintenanceMode', e.target.checked)}
                    className="rounded text-rose-600"
                  />
                  <div>
                    <div className="font-bold text-white">Enable Platform Maintenance Mode</div>
                    <div className="text-[11px] text-slate-400">
                      Locks customer invoicing workspaces and displays maintenance landing notice to non-admin users
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.general?.allowNewRegistrations !== false}
                    onChange={(e) => updateGeneral('allowNewRegistrations', e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <div>
                    <div className="font-bold text-white">Allow Public Organization Self-Registrations</div>
                    <div className="text-[11px] text-slate-400">
                      Enables self-serve sign-ups on the customer registration page
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Subscription & Billing Policy</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Default Currency</label>
                  <input
                    type="text"
                    value={settings.billing?.defaultCurrency || 'INR (₹)'}
                    onChange={(e) => updateBilling('defaultCurrency', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Default Trial Period (Days)</label>
                  <input
                    type="number"
                    value={settings.billing?.trialDurationDays ?? 14}
                    onChange={(e) => updateBilling('trialDurationDays', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SaaS GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={settings.billing?.gstTaxPercentage ?? 18}
                    onChange={(e) => updateBilling('gstTaxPercentage', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={settings.billing?.gracePeriodDays ?? 3}
                    onChange={(e) => updateBilling('gracePeriodDays', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Platform Invoice Prefix</label>
                  <input
                    type="text"
                    value={settings.billing?.invoicePrefix || 'INV-2026-'}
                    onChange={(e) => updateBilling('invoicePrefix', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">SMTP Email Gateway Settings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email?.smtpHost || ''}
                    onChange={(e) => updateEmail('smtpHost', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email?.smtpPort || 587}
                    onChange={(e) => updateEmail('smtpPort', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SMTP User / Username</label>
                  <input
                    type="text"
                    value={settings.email?.smtpUser || ''}
                    onChange={(e) => updateEmail('smtpUser', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Sender Name</label>
                  <input
                    type="text"
                    value={settings.email?.senderName || ''}
                    onChange={(e) => updateEmail('senderName', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Sender Email Address</label>
                  <input
                    type="email"
                    value={settings.email?.senderEmail || ''}
                    onChange={(e) => updateEmail('senderEmail', e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.email?.enableEmailDelivery)}
                    onChange={(e) => updateEmail('enableEmailDelivery', e.target.checked)}
                    className="rounded text-brand-600"
                  />
                  <div>
                    <div className="font-bold text-white">Enable Transactional Email Delivery</div>
                    <div className="text-[11px] text-slate-400">
                      Dispatches welcome emails, invoices, and renewal alerts via SMTP
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-white">Platform Security & Audit Enforcement</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Session Timeout (Minutes)</label>
                  <input
                    type="number"
                    value={settings.security?.sessionTimeoutMinutes || 1440}
                    onChange={(e) => updateSecurity('sessionTimeoutMinutes', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Max Login Attempts</label>
                  <input
                    type="number"
                    value={settings.security?.maxLoginAttempts || 5}
                    onChange={(e) => updateSecurity('maxLoginAttempts', Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.security?.requireTwoFactorForAdmins)}
                    onChange={(e) => updateSecurity('requireTwoFactorForAdmins', e.target.checked)}
                    className="rounded text-brand-600"
                  />
                  <div>
                    <div className="font-bold text-white">Enforce 2FA for all Super Admin roles</div>
                    <div className="text-[11px] text-slate-400">
                      Requires hardware TOTP / Authenticator code on login
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(settings.security?.enforcePasswordComplexity)}
                    onChange={(e) => updateSecurity('enforcePasswordComplexity', e.target.checked)}
                    className="rounded text-brand-600"
                  />
                  <div>
                    <div className="font-bold text-white">Enforce Strict Password Complexity</div>
                    <div className="text-[11px] text-slate-400">
                      Requires uppercase, numbers, symbols and min 8 characters for tenant credentials
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
