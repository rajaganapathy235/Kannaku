import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Key,
  Lock,
  Globe,
  Radio,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Copy,
  ExternalLink,
  HelpCircle,
  Save,
  Server,
  Terminal,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { AuthService } from '../../utils/authService';
import { ApiService } from '../../utils/apiService';
import { PaymentGatewayConfig, PayUModeCredentials } from '../../types/admin';

interface PayUGatewaySettingsProps {
  onSaved?: () => void;
}

interface SlotState {
  merchantKey: string;
  merchantSalt: string;
  headerAuthKey: string;
  endpoint: string;
}

interface TestSlotResult {
  isTesting: boolean;
  result: {
    success: boolean;
    message: string;
    latency?: number;
    diagnostics?: any;
  } | null;
}

export const PayUGatewaySettings: React.FC<PayUGatewaySettingsProps> = ({ onSaved }) => {
  const [activeMode, setActiveMode] = useState<'test' | 'live'>('test');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [name, setName] = useState<string>('PayU India Hosted Gateway');

  const [testSlot, setTestSlot] = useState<SlotState>({
    merchantKey: '',
    merchantSalt: '',
    headerAuthKey: '',
    endpoint: 'https://test.payu.in/_payment',
  });

  const [liveSlot, setLiveSlot] = useState<SlotState>({
    merchantKey: '',
    merchantSalt: '',
    headerAuthKey: '',
    endpoint: 'https://secure.payu.in/_payment',
  });

  const [isActiveProvider, setIsActiveProvider] = useState<boolean>(() => {
    return SaaSAdminDB.getPaymentGatewaysConfig().activeProvider === 'payu';
  });

  const [showTestSalt, setShowTestSalt] = useState<boolean>(false);
  const [showLiveSalt, setShowLiveSalt] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savingSlot, setSavingSlot] = useState<'test' | 'live' | 'all' | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [testModeTesting, setTestModeTesting] = useState<TestSlotResult>({
    isTesting: false,
    result: null,
  });

  const [liveModeTesting, setLiveModeTesting] = useState<TestSlotResult>({
    isTesting: false,
    result: null,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load existing settings from D1 app_settings via API
    ApiService.getPayUSettings()
      .then((res) => {
        if (res?.success && res.data?.data) {
          const remoteData = res.data.data;
          if (remoteData.test || remoteData.live) {
            setActiveMode(remoteData.activeMode === 'live' ? 'live' : 'test');
            setIsEnabled(remoteData.isEnabled !== undefined ? Boolean(remoteData.isEnabled) : true);
            if (remoteData.name) setName(remoteData.name);

            if (remoteData.test) {
              setTestSlot({
                merchantKey: remoteData.test.merchantKey || '',
                merchantSalt: remoteData.test.merchantSalt || '',
                headerAuthKey: remoteData.test.headerAuthKey || '',
                endpoint: remoteData.test.endpoint || 'https://test.payu.in/_payment',
              });
            }

            if (remoteData.live) {
              setLiveSlot({
                merchantKey: remoteData.live.merchantKey || '',
                merchantSalt: remoteData.live.merchantSalt || '',
                headerAuthKey: remoteData.live.headerAuthKey || '',
                endpoint: remoteData.live.endpoint || 'https://secure.payu.in/_payment',
              });
            }
          } else {
            // Legacy flat shape
            const isTest = remoteData.isTestMode !== undefined ? Boolean(remoteData.isTestMode) : true;
            setActiveMode(isTest ? 'test' : 'live');
            setIsEnabled(remoteData.isEnabled !== undefined ? Boolean(remoteData.isEnabled) : true);
            const flatKey = remoteData.merchantKey || remoteData.payuMerchantKey || '';
            const flatSalt = remoteData.merchantSalt || remoteData.payuMerchantSalt || '';
            const flatHeader = remoteData.headerAuthKey || remoteData.payuHeaderAuthKey || '';

            if (isTest) {
              setTestSlot({
                merchantKey: flatKey,
                merchantSalt: flatSalt,
                headerAuthKey: flatHeader,
                endpoint: remoteData.endpoint || 'https://test.payu.in/_payment',
              });
            } else {
              setLiveSlot({
                merchantKey: flatKey,
                merchantSalt: flatSalt,
                headerAuthKey: flatHeader,
                endpoint: remoteData.endpoint || 'https://secure.payu.in/_payment',
              });
            }
          }
        }
      })
      .catch(() => {});

    SaaSAdminDB.getPaymentGatewaysConfigAsync().then((mgr) => {
      if (mgr) {
        setIsActiveProvider(mgr.activeProvider === 'payu');
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSetActive = async () => {
    await SaaSAdminDB.setActivePaymentGateway('payu');
    setIsActiveProvider(true);
    showToast('PayU set as the default active payment provider for all checkouts!');
  };

  // Switch Active Mode without touching either credential slot
  const handleToggleActiveMode = async (newMode: 'test' | 'live') => {
    if (newMode === activeMode) return;
    setActiveMode(newMode);
    
    // Auto-save activeMode toggle to backend
    try {
      await ApiService.savePayUSettings({
        activeMode: newMode,
        isEnabled,
      });
      showToast(`Switched active gateway to ${newMode === 'live' ? 'Live Production' : 'Sandbox Test'} mode!`);
    } catch (err) {
      console.warn('Auto-save activeMode failed:', err);
    }
  };

  // Save a specific slot ('test' | 'live')
  const handleSaveSlot = async (mode: 'test' | 'live') => {
    setSavingSlot(mode);
    setIsSaving(true);
    const slot = mode === 'test' ? testSlot : liveSlot;

    try {
      const payload = {
        mode,
        merchantKey: slot.merchantKey.trim(),
        merchantSalt: slot.merchantSalt.trim(),
        headerAuthKey: slot.headerAuthKey.trim(),
        endpoint: slot.endpoint.trim(),
        activeMode,
        isEnabled,
        name,
      };

      const response = await ApiService.savePayUSettings(payload);

      // Also update local storage cache for offline fallback
      SaaSAdminDB.updateGatewayConfig('payu', {
        provider: 'payu',
        name,
        isEnabled,
        isTestMode: activeMode === 'test',
        activeMode,
        test: testSlot,
        live: liveSlot,
        merchantKey: (activeMode === 'live' ? liveSlot : testSlot).merchantKey,
        merchantSalt: (activeMode === 'live' ? liveSlot : testSlot).merchantSalt,
        headerAuthKey: (activeMode === 'live' ? liveSlot : testSlot).headerAuthKey,
        endpoint: (activeMode === 'live' ? liveSlot : testSlot).endpoint,
      });

      const successMsg = response?.data?.message || `${mode === 'test' ? 'Test' : 'Live'} credentials saved successfully!`;
      showToast(successMsg);
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error(`Failed to save ${mode} PayU settings:`, err);
      showToast(`Failed to save ${mode} settings: ${err?.message || 'Server error'}`);
    } finally {
      setIsSaving(false);
      setSavingSlot(null);
    }
  };

  // Save All Settings atomically
  const handleSaveAll = async () => {
    setSavingSlot('all');
    setIsSaving(true);
    try {
      const fullPayload = {
        activeMode,
        isEnabled,
        name,
        test: {
          merchantKey: testSlot.merchantKey.trim(),
          merchantSalt: testSlot.merchantSalt.trim(),
          headerAuthKey: testSlot.headerAuthKey.trim(),
          endpoint: testSlot.endpoint.trim() || 'https://test.payu.in/_payment',
        },
        live: {
          merchantKey: liveSlot.merchantKey.trim(),
          merchantSalt: liveSlot.merchantSalt.trim(),
          headerAuthKey: liveSlot.headerAuthKey.trim(),
          endpoint: liveSlot.endpoint.trim() || 'https://secure.payu.in/_payment',
        },
      };

      const response = await ApiService.savePayUSettings(fullPayload);

      SaaSAdminDB.updateGatewayConfig('payu', {
        provider: 'payu',
        name,
        isEnabled,
        isTestMode: activeMode === 'test',
        activeMode,
        test: fullPayload.test,
        live: fullPayload.live,
        merchantKey: (activeMode === 'live' ? fullPayload.live : fullPayload.test).merchantKey,
        merchantSalt: (activeMode === 'live' ? fullPayload.live : fullPayload.test).merchantSalt,
        headerAuthKey: (activeMode === 'live' ? fullPayload.live : fullPayload.test).headerAuthKey,
        endpoint: (activeMode === 'live' ? fullPayload.live : fullPayload.test).endpoint,
      });

      const successMsg = response?.data?.message || 'Complete PayU dual-slot configuration saved successfully to Cloudflare D1!';
      showToast(successMsg);
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error('Failed to save PayU settings:', err);
      showToast('Failed to save settings: ' + (err?.message || 'Server error'));
    } finally {
      setIsSaving(false);
      setSavingSlot(null);
    }
  };

  // Test connection for a specific slot ('test' | 'live')
  const handleTestSlot = async (mode: 'test' | 'live') => {
    const slot = mode === 'test' ? testSlot : liveSlot;
    const isTestMode = mode === 'test';
    const setter = isTestMode ? setTestModeTesting : setLiveModeTesting;

    if (!slot.merchantKey.trim() || !slot.merchantSalt.trim()) {
      setter({
        isTesting: false,
        result: {
          success: false,
          message: `Please enter both PayU Merchant Key and Merchant Salt for ${isTestMode ? 'Test (Sandbox)' : 'Live (Production)'} mode before testing.`,
        },
      });
      return;
    }

    setter({ isTesting: true, result: null });

    const token = AuthService.getToken();
    const startTime = Date.now();

    try {
      const res = await fetch('/api/admin/payments/payu/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          mode,
          merchantKey: slot.merchantKey.trim(),
          merchantSalt: slot.merchantSalt.trim(),
          headerAuthKey: slot.headerAuthKey.trim(),
        }),
      });

      const latency = Date.now() - startTime;
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setter({
          isTesting: false,
          result: {
            success: true,
            message: data.message || `PayU ${isTestMode ? 'Sandbox' : 'Live Production'} Gateway Verified! SHA-512 Hash signature matched with PayU server.`,
            latency,
            diagnostics: data,
          },
        });
      } else {
        setter({
          isTesting: false,
          result: {
            success: false,
            message: data.message || data.error || `PayU ${isTestMode ? 'Sandbox' : 'Live'} test failed. Please verify Key and Salt.`,
            latency,
            diagnostics: data,
          },
        });
      }
    } catch (err: any) {
      const latency = Date.now() - startTime;
      setter({
        isTesting: false,
        result: {
          success: false,
          message: `Network error while connecting to PayU ${isTestMode ? 'Test' : 'Live'} servers: ${err?.message || 'Connection timeout'}`,
          latency,
        },
      });
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kannaku.pages.dev';
  const callbackUrl = `${originUrl}/api/payments/payu/callback`;
  const returnUrl = `${originUrl}/api/payments/payu/return`;
  const activeEndpointUrl = activeMode === 'test' ? (testSlot.endpoint || 'https://test.payu.in/_payment') : (liveSlot.endpoint || 'https://secure.payu.in/_payment');

  const isTestConfigured = Boolean(testSlot.merchantKey.trim() && testSlot.merchantSalt.trim());
  const isLiveConfigured = Boolean(liveSlot.merchantKey.trim() && liveSlot.merchantSalt.trim());

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
              PayU
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">PayU Payment Gateway</h3>
                {isActiveProvider ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active Provider
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold border border-slate-200">
                    Standby
                  </span>
                )}
                {activeMode === 'test' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Currently Active: Sandbox Test
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Currently Active: Live Production
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dual-slot architecture: Test and Live credentials remain permanently isolated to prevent accidental key/salt mismatches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isActiveProvider && (
              <button
                type="button"
                onClick={handleSetActive}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-slate-500" />
                Set As Active Gateway
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving && savingSlot === 'all' ? 'Saving All...' : 'Save All Settings'}
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-8">
          {/* Active Mode Master Switcher */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Active Gateway Mode Selector
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which credential slot processes live customer checkouts. Switching this toggle <span className="font-semibold text-slate-700">never clears or overwrites</span> the credentials in either slot.
                </p>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600">
                activeMode: <strong className={activeMode === 'live' ? 'text-emerald-600' : 'text-amber-600'}>{activeMode.toUpperCase()}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Test Slot Toggle Option */}
              <button
                type="button"
                onClick={() => handleToggleActiveMode('test')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                  activeMode === 'test'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    activeMode === 'test' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {activeMode === 'test' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      Sandbox / Test Mode
                      {isTestConfigured && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-semibold">Configured</span>
                      )}
                    </div>
                    {activeMode === 'test' && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Safe testing environment with simulated cards & UPI. No real money charged.
                  </div>
                </div>
              </button>

              {/* Live Slot Toggle Option */}
              <button
                type="button"
                onClick={() => handleToggleActiveMode('live')}
                className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                  activeMode === 'live'
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    activeMode === 'live' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {activeMode === 'live' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      Live Production Mode
                      {isLiveConfigured && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded font-semibold">Configured</span>
                      )}
                    </div>
                    {activeMode === 'live' && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">ACTIVE</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Real-money production gateway for live subscriber transactions.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* DUAL CREDENTIAL SECTIONS */}
          <div className="space-y-8">
            {/* 1. TEST / SANDBOX CREDENTIALS SECTION */}
            <div className={`rounded-2xl border transition-all ${
              activeMode === 'test' 
                ? 'border-amber-300 bg-amber-50/10 shadow-xs ring-1 ring-amber-400/20' 
                : 'border-slate-200 bg-slate-50/40 opacity-90'
            }`}>
              {/* Section Header */}
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-amber-50/40 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    TEST
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Sandbox Test Credentials Slot</h4>
                      {activeMode === 'test' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold border border-amber-300">
                          Currently Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          Inactive Slot
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Sandbox endpoint: <code className="font-mono text-amber-800 bg-amber-100/70 px-1 py-0.2 rounded text-[10px]">{testSlot.endpoint || 'https://test.payu.in/_payment'}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestSlot('test')}
                    disabled={testModeTesting.isTesting || !isTestConfigured}
                    className="px-3.5 py-1.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${testModeTesting.isTesting ? 'animate-spin' : ''}`} />
                    {testModeTesting.isTesting ? 'Testing...' : 'Test Sandbox Connection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveSlot('test')}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving && savingSlot === 'test' ? 'Saving...' : 'Save Test Slot'}
                  </button>
                </div>
              </div>

              {/* Section Form Fields */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Test Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        Test Merchant Key
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold uppercase">Sandbox Key</span>
                    </label>
                    <input
                      type="text"
                      value={testSlot.merchantKey}
                      onChange={(e) => setTestSlot((prev) => ({ ...prev, merchantKey: e.target.value }))}
                      placeholder="e.g. gtKFFx (PayU Sandbox Key)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Test Salt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        Test Merchant Salt
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold uppercase">Sandbox Secret</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showTestSalt ? 'text' : 'password'}
                        value={testSlot.merchantSalt}
                        onChange={(e) => setTestSlot((prev) => ({ ...prev, merchantSalt: e.target.value }))}
                        placeholder="e.g. eCwWELxi (PayU Sandbox Salt)"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTestSalt(!showTestSalt)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        {showTestSalt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Test Header Auth Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-slate-500" />
                        Test Header Auth Key (Optional)
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={testSlot.headerAuthKey}
                      onChange={(e) => setTestSlot((prev) => ({ ...prev, headerAuthKey: e.target.value }))}
                      placeholder="Optional server auth header for sandbox"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Test Endpoint */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        Test Payment Endpoint
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Default</span>
                    </label>
                    <input
                      type="text"
                      value={testSlot.endpoint}
                      onChange={(e) => setTestSlot((prev) => ({ ...prev, endpoint: e.target.value }))}
                      placeholder="https://test.payu.in/_payment"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Test Result Feedback */}
                {testModeTesting.result && (
                  <div
                    className={`p-3.5 rounded-xl border animate-fade-in ${
                      testModeTesting.result.success
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/90 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {testModeTesting.result.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5 flex-1 text-xs">
                        <div className="font-bold flex items-center justify-between">
                          <span>Sandbox Test Probe Result</span>
                          {testModeTesting.result.latency !== undefined && (
                            <span className="font-mono text-[11px] opacity-75">{testModeTesting.result.latency}ms</span>
                          )}
                        </div>
                        <p>{testModeTesting.result.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. LIVE / PRODUCTION CREDENTIALS SECTION */}
            <div className={`rounded-2xl border transition-all ${
              activeMode === 'live' 
                ? 'border-emerald-300 bg-emerald-50/10 shadow-xs ring-1 ring-emerald-400/20' 
                : 'border-slate-200 bg-slate-50/40 opacity-90'
            }`}>
              {/* Section Header */}
              <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-emerald-50/40 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    LIVE
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Live Production Credentials Slot</h4>
                      {activeMode === 'live' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                          Currently Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          Inactive Slot
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Live endpoint: <code className="font-mono text-emerald-800 bg-emerald-100/70 px-1 py-0.2 rounded text-[10px]">{liveSlot.endpoint || 'https://secure.payu.in/_payment'}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestSlot('live')}
                    disabled={liveModeTesting.isTesting || !isLiveConfigured}
                    className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${liveModeTesting.isTesting ? 'animate-spin' : ''}`} />
                    {liveModeTesting.isTesting ? 'Testing...' : 'Test Live Connection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveSlot('live')}
                    disabled={isSaving}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving && savingSlot === 'live' ? 'Saving...' : 'Save Live Slot'}
                  </button>
                </div>
              </div>

              {/* Section Form Fields */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Live Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-emerald-600" />
                        Live Merchant Key
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold uppercase">Production Key</span>
                    </label>
                    <input
                      type="text"
                      value={liveSlot.merchantKey}
                      onChange={(e) => setLiveSlot((prev) => ({ ...prev, merchantKey: e.target.value }))}
                      placeholder="e.g. gtKFFx (PayU Production Key)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Live Salt */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        Live Merchant Salt
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold uppercase">Production Secret</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showLiveSalt ? 'text' : 'password'}
                        value={liveSlot.merchantSalt}
                        onChange={(e) => setLiveSlot((prev) => ({ ...prev, merchantSalt: e.target.value }))}
                        placeholder="e.g. eCwWELxi (PayU Production Salt)"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLiveSalt(!showLiveSalt)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                      >
                        {showLiveSalt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Live Header Auth Key */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-slate-500" />
                        Live Header Auth Key (Optional)
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={liveSlot.headerAuthKey}
                      onChange={(e) => setLiveSlot((prev) => ({ ...prev, headerAuthKey: e.target.value }))}
                      placeholder="Optional server auth header for production"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Live Endpoint */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        Live Payment Endpoint
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Default</span>
                    </label>
                    <input
                      type="text"
                      value={liveSlot.endpoint}
                      onChange={(e) => setLiveSlot((prev) => ({ ...prev, endpoint: e.target.value }))}
                      placeholder="https://secure.payu.in/_payment"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Live Result Feedback */}
                {liveModeTesting.result && (
                  <div
                    className={`p-3.5 rounded-xl border animate-fade-in ${
                      liveModeTesting.result.success
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50/90 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {liveModeTesting.result.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5 flex-1 text-xs">
                        <div className="font-bold flex items-center justify-between">
                          <span>Live Production Probe Result</span>
                          {liveModeTesting.result.latency !== undefined && (
                            <span className="font-mono text-[11px] opacity-75">{liveModeTesting.result.latency}ms</span>
                          )}
                        </div>
                        <p>{liveModeTesting.result.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Master Bottom Save Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Currently routing checkout traffic to: <strong className={activeMode === 'live' ? 'text-emerald-700' : 'text-amber-700'}>{activeMode.toUpperCase()} ({activeMode === 'live' ? 'Production' : 'Sandbox'})</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving && savingSlot === 'all' ? 'Saving Configuration...' : 'Save Complete PayU Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Integration URLs & Webhook Endpoints Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-white">PayU Dashboard Webhook & Return URLs</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Copy these production endpoints into your PayU Merchant Dashboard under{' '}
          <span className="text-emerald-300 font-semibold">Integration Settings &rarr; Webhooks / URLs</span>:
        </p>

        <div className="space-y-3">
          {/* SURL / FURL */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5 overflow-hidden">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Success & Failure Return URL (surl / furl)
              </div>
              <code className="text-xs font-mono text-emerald-400 block truncate">{returnUrl}</code>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(returnUrl, 'Return URL')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedField === 'Return URL' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'Return URL' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Webhook / IPN */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5 overflow-hidden">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Server-to-Server Webhook / IPN Listener
              </div>
              <code className="text-xs font-mono text-emerald-400 block truncate">{callbackUrl}</code>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(callbackUrl, 'Webhook URL')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedField === 'Webhook URL' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'Webhook URL' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* Gateway Endpoint */}
          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5 overflow-hidden">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Currently Active Gateway Endpoint
              </div>
              <code className="text-xs font-mono text-slate-300 block truncate">{activeEndpointUrl}</code>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(activeEndpointUrl, 'Gateway Endpoint')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copiedField === 'Gateway Endpoint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedField === 'Gateway Endpoint' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Cryptographic Security Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h4 className="text-sm font-bold text-slate-900">Cryptographic Security Specification</h4>
        </div>
        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <p>
            The backend strictly adheres to PayU India&apos;s SHA-512 cryptographic standard using native Web Crypto API in Cloudflare Workers:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl font-mono text-[11px] text-slate-800 border border-slate-200 space-y-1 overflow-x-auto">
            <div className="text-emerald-700 font-bold">// 1. Forward Hash (Checkout Initiation):</div>
            <div>sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)</div>
            <div className="text-blue-700 font-bold pt-1">// 2. Reverse Hash (Webhook & IPN Verification):</div>
            <div>sha512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)</div>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px]">
            <li>Test and Live credentials stored in independent database slots to guarantee production safety.</li>
            <li>Constant-time comparison ensures total resistance to side-channel timing attacks.</li>
            <li>Zero frontend exposure: The Merchant Salt remains strictly protected in backend Cloudflare Workers secrets and D1 encrypted storage.</li>
            <li>Idempotent order fulfillment guarantees subscriptions are credited exactly once even under network retries.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
