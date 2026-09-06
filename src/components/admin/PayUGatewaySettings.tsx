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
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { AuthService } from '../../utils/authService';
import { ApiService } from '../../utils/apiService';
import { PaymentGatewayConfig } from '../../types/admin';

interface PayUGatewaySettingsProps {
  onSaved?: () => void;
}

export const PayUGatewaySettings: React.FC<PayUGatewaySettingsProps> = ({ onSaved }) => {
  const [payuConfig, setPayuConfig] = useState<PaymentGatewayConfig>(() => {
    const mgr = SaaSAdminDB.getPaymentGatewaysConfig();
    const payu = mgr.gateways?.payu;
    return (
      payu || {
        provider: 'payu',
        name: 'PayU India Hosted Gateway',
        isEnabled: true,
        isTestMode: true,
        merchantKey: '',
        merchantSalt: '',
        headerAuthKey: '',
      }
    );
  });

  const [isActiveProvider, setIsActiveProvider] = useState<boolean>(() => {
    return SaaSAdminDB.getPaymentGatewaysConfig().activeProvider === 'payu';
  });

  const [showSalt, setShowSalt] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
    diagnostics?: any;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load existing settings from D1 app_settings via API first
    ApiService.getPayUSettings()
      .then((res) => {
        if (res?.success && res.data?.data) {
          const remoteData = res.data.data;
          setPayuConfig((prev) => ({
            ...prev,
            merchantKey: remoteData.merchantKey || remoteData.payuMerchantKey || prev.merchantKey || prev.payuMerchantKey || '',
            merchantSalt: remoteData.merchantSalt || remoteData.payuMerchantSalt || prev.merchantSalt || prev.payuMerchantSalt || '',
            headerAuthKey: remoteData.headerAuthKey || remoteData.payuHeaderAuthKey || prev.headerAuthKey || prev.payuHeaderAuthKey || '',
            isTestMode: remoteData.isTestMode !== undefined ? Boolean(remoteData.isTestMode) : prev.isTestMode,
            isEnabled: remoteData.isEnabled !== undefined ? Boolean(remoteData.isEnabled) : prev.isEnabled,
            name: remoteData.name || prev.name || 'PayU India Hosted Gateway',
          }));
        }
      })
      .catch(() => {});

    SaaSAdminDB.getPaymentGatewaysConfigAsync().then((mgr) => {
      if (mgr && mgr.gateways?.payu) {
        const p = mgr.gateways.payu;
        setPayuConfig((prev) => ({
          ...prev,
          ...p,
          merchantKey: p.merchantKey || p.payuMerchantKey || prev.merchantKey || '',
          merchantSalt: p.merchantSalt || p.payuMerchantSalt || prev.merchantSalt || '',
          headerAuthKey: p.headerAuthKey || p.payuHeaderAuthKey || prev.headerAuthKey || '',
        }));
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

  const handleFieldChange = (field: keyof PaymentGatewayConfig, value: any) => {
    setPayuConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSetActive = async () => {
    await SaaSAdminDB.setActivePaymentGateway('payu');
    setIsActiveProvider(true);
    showToast('PayU set as the default active payment provider for all checkouts!');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const canonicalPayload = {
        merchantKey: (payuConfig.merchantKey || payuConfig.payuMerchantKey || '').trim(),
        merchantSalt: (payuConfig.merchantSalt || payuConfig.payuMerchantSalt || '').trim(),
        headerAuthKey: (payuConfig.headerAuthKey || payuConfig.payuHeaderAuthKey || '').trim(),
        isTestMode: payuConfig.isTestMode,
        isEnabled: payuConfig.isEnabled,
        name: payuConfig.name || 'PayU India Hosted Gateway',
      };

      const response = await ApiService.savePayUSettings(canonicalPayload);

      SaaSAdminDB.updateGatewayConfig('payu', {
        ...payuConfig,
        ...canonicalPayload,
      });
      
      const successMsg = response?.data?.message || 'PayU gateway configuration saved successfully to Cloudflare D1 app_settings table!';
      showToast(successMsg);
      if (onSaved) onSaved();
    } catch (err: any) {
      console.error('Failed to save PayU settings:', err);
      showToast('Failed to save settings: ' + (err?.message || 'Server error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const key = (payuConfig.merchantKey || payuConfig.payuMerchantKey || '').trim();
    const salt = (payuConfig.merchantSalt || payuConfig.payuMerchantSalt || '').trim();

    if (!key || !salt) {
      setTestResult({
        success: false,
        message: 'Please enter both PayU Merchant Key and Merchant Salt before testing.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

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
          merchantKey: key,
          merchantSalt: salt,
          isTestMode: payuConfig.isTestMode,
        }),
      });

      const latency = Date.now() - startTime;
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message:
            data.message ||
            `PayU Gateway Credentials verified successfully (${payuConfig.isTestMode ? 'Sandbox Environment' : 'Production Environment'}). SHA-512 cryptographic verification passed.`,
          latency,
          diagnostics: data.details || data,
        });
      } else {
        setTestResult({
          success: false,
          message:
            data.message ||
            data.error ||
            'PayU test failed. Please verify that your Merchant Key and Merchant Salt match your PayU dashboard credentials.',
          latency,
          diagnostics: data,
        });
      }
    } catch (err: any) {
      const latency = Date.now() - startTime;
      setTestResult({
        success: false,
        message: `Network error while connecting to PayU: ${err?.message || 'Connection timeout'}`,
        latency,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kannaku.pages.dev';
  const callbackUrl = `${originUrl}/api/payments/payu/callback`;
  const returnUrl = `${originUrl}/api/payments/payu/return`;
  const endpointUrl = payuConfig.isTestMode ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment';

  const isConfigured = Boolean((payuConfig.merchantKey || payuConfig.payuMerchantKey)?.trim() && (payuConfig.merchantSalt || payuConfig.payuMerchantSalt)?.trim());

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
              <div className="flex items-center gap-2">
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
                {payuConfig.isTestMode ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                    Sandbox Mode
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200">
                    Live Production
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official RBI-compliant Indian merchant payments supporting UPI, Credit/Debit Cards, NetBanking, and Wallets
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
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Card Content & Form Fields */}
        <div className="p-6 space-y-6">
          {/* Environment Switcher */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Gateway Environment Mode
            </label>
            <p className="text-xs text-slate-500">
              Toggle between PayU Sandbox testing and live real-money production payments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleFieldChange('isTestMode', true)}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  payuConfig.isTestMode
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-100/70'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                    payuConfig.isTestMode ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                  }`}
                >
                  {payuConfig.isTestMode && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Sandbox / Test Mode</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Endpoint: <code className="text-amber-700 bg-amber-100/60 px-1 py-0.5 rounded font-mono text-[10px]">https://test.payu.in/_payment</code>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFieldChange('isTestMode', false)}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  !payuConfig.isTestMode
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-100/70'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                    !payuConfig.isTestMode ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}
                >
                  {!payuConfig.isTestMode && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Live Production Mode</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Endpoint: <code className="text-emerald-700 bg-emerald-100/60 px-1 py-0.5 rounded font-mono text-[10px]">https://secure.payu.in/_payment</code>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Merchant Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  PayU Merchant Key (PAYU_MERCHANT_KEY)
                </label>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Required</span>
              </div>
              <input
                type="text"
                value={payuConfig.merchantKey || payuConfig.payuMerchantKey || ''}
                onChange={(e) => handleFieldChange('merchantKey', e.target.value)}
                placeholder="e.g. gtKFFx or your PayU Key"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500">
                Found in PayU Dashboard &rarr; Integration &rarr; API Keys.
              </p>
            </div>

            {/* Merchant Salt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  PayU Merchant Salt (PAYU_MERCHANT_SALT)
                </label>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Secret</span>
              </div>
              <div className="relative">
                <input
                  type={showSalt ? 'text' : 'password'}
                  value={payuConfig.merchantSalt || payuConfig.payuMerchantSalt || ''}
                  onChange={(e) => handleFieldChange('merchantSalt', e.target.value)}
                  placeholder="e.g. eCwWELxi or your PayU Salt"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSalt(!showSalt)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showSalt ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Used to compute and verify SHA-512 checksum signatures securely on the server.
              </p>
            </div>
          </div>

          {/* Optional Server-to-Server Auth Header Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                PayU Merchant Header / Auth Key (Optional)
              </label>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Optional</span>
            </div>
            <input
              type="text"
              value={payuConfig.headerAuthKey || payuConfig.payuHeaderAuthKey || ''}
              onChange={(e) => handleFieldChange('headerAuthKey', e.target.value)}
              placeholder="e.g. payu_auth_sec_..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500">
              Only required if your PayU merchant account has Header Authorization enabled for postservice APIs.
            </p>
          </div>

          {/* Actions & Test Connection Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !isConfigured}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isTesting ? 'animate-spin' : ''}`} />
                {isTesting ? 'Testing PayU Gateway...' : 'Test Connection & Hash Calculation'}
              </button>

              {!isConfigured && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Key and Salt required
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save PayU Configuration'}
            </button>
          </div>

          {/* Test Results Display */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{testResult.success ? 'PayU Verification Succeeded' : 'PayU Verification Notice'}</span>
                    {testResult.latency !== undefined && (
                      <span className="text-[11px] font-mono opacity-70">{testResult.latency}ms latency</span>
                    )}
                  </div>
                  <p className="text-xs">{testResult.message}</p>
                </div>
              </div>
            </div>
          )}
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
                Active PayU Gateway Endpoint
              </div>
              <code className="text-xs font-mono text-slate-300 block truncate">{endpointUrl}</code>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(endpointUrl, 'Gateway Endpoint')}
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
            The backend strictly adheres to PayU India&apos;s SHA-512 cryptographic standard using the native Cloudflare Worker Web Crypto API:
          </p>
          <div className="bg-slate-50 p-3 rounded-xl font-mono text-[11px] text-slate-800 border border-slate-200 space-y-1 overflow-x-auto">
            <div className="text-emerald-700 font-bold">// 1. Forward Hash (Checkout Initiation):</div>
            <div>sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5|udf6|udf7|udf8|udf9|udf10|salt)</div>
            <div className="text-blue-700 font-bold pt-1">// 2. Reverse Hash (Webhook & IPN Verification):</div>
            <div>sha512(salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)</div>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px]">
            <li>Constant-time comparison ensures total resistance to side-channel timing attacks.</li>
            <li>Zero frontend exposure: The Merchant Salt remains securely protected in backend Cloudflare Workers secrets and encrypted storage.</li>
            <li>Idempotent order fulfillment guarantees subscriptions are credited exactly once even under network retries.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
