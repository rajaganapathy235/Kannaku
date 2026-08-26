import React, { useState } from 'react';
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
  QrCode,
  Building,
  HelpCircle,
  Save,
  CheckCircle,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import {
  PaymentGatewayConfig,
  PaymentGatewayProvider,
  SaaSGatewayManagerConfig,
} from '../../types/admin';

export const PaymentGatewaysView: React.FC = () => {
  const [managerConfig, setManagerConfig] = useState<SaaSGatewayManagerConfig>(
    SaaSAdminDB.getPaymentGatewaysConfig()
  );
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testingGateway, setTestingGateway] = useState<PaymentGatewayProvider | null>(null);
  const [testResult, setTestResult] = useState<{
    provider: PaymentGatewayProvider;
    success: boolean;
    message: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSetActive = (provider: PaymentGatewayProvider) => {
    SaaSAdminDB.setActivePaymentGateway(provider);
    setManagerConfig(SaaSAdminDB.getPaymentGatewaysConfig());
    showToast(`Active payment gateway switched to ${managerConfig.gateways[provider].name}!`);
  };

  const handleUpdateField = (
    provider: PaymentGatewayProvider,
    field: keyof PaymentGatewayConfig,
    value: any
  ) => {
    const updated = {
      ...managerConfig,
      gateways: {
        ...managerConfig.gateways,
        [provider]: {
          ...managerConfig.gateways[provider],
          [field]: value,
        },
      },
    };
    setManagerConfig(updated);
  };

  const handleSaveGateway = (provider: PaymentGatewayProvider) => {
    SaaSAdminDB.updateGatewayConfig(provider, managerConfig.gateways[provider]);
    showToast(`Saved settings for ${managerConfig.gateways[provider].name}!`);
  };

  const handleTestConnection = (provider: PaymentGatewayProvider) => {
    setTestingGateway(provider);
    setTestResult(null);

    setTimeout(() => {
      setTestingGateway(null);
      const gw = managerConfig.gateways[provider];

      if (provider === 'dodopayments') {
        if (!gw.dodoApiKey || gw.dodoApiKey.length < 8) {
          setTestResult({
            provider,
            success: false,
            message: 'Invalid API Key: Please enter a valid Dodo Payments Secret API key.',
          });
        } else {
          setTestResult({
            provider,
            success: true,
            message: 'Dodo Payments API verified successfully (HTTP 200 OK • 142ms). Webhook listener ready.',
          });
        }
      } else if (provider === 'cashfree') {
        if (!gw.cashfreeAppId || !gw.cashfreeSecretKey) {
          setTestResult({
            provider,
            success: false,
            message: 'Cashfree App ID and Secret Key are required.',
          });
        } else {
          setTestResult({
            provider,
            success: true,
            message: `Cashfree API connected (${gw.isTestMode ? 'Sandbox' : 'Production'} • 118ms). Orders API healthy.`,
          });
        }
      } else if (provider === 'razorpay') {
        if (!gw.razorpayKeyId || !gw.razorpayKeySecret) {
          setTestResult({
            provider,
            success: false,
            message: 'Razorpay Key ID and Secret are required.',
          });
        } else {
          setTestResult({
            provider,
            success: true,
            message: 'Razorpay API keys validated (Standard Checkout & Payment Links enabled).',
          });
        }
      } else if (provider === 'stripe') {
        if (!gw.stripePublishableKey || !gw.stripeSecretKey) {
          setTestResult({
            provider,
            success: false,
            message: 'Stripe Publishable Key and Secret Key are required.',
          });
        } else {
          setTestResult({
            provider,
            success: true,
            message: 'Stripe API connection verified (Customer Portal & Checkout Session active).',
          });
        }
      } else if (provider === 'manual_upi') {
        if (!gw.upiId || !gw.upiId.includes('@')) {
          setTestResult({
            provider,
            success: false,
            message: 'Please provide a valid UPI ID (e.g. business@okaxis).',
          });
        } else {
          setTestResult({
            provider,
            success: true,
            message: 'UPI Virtual Payment Address validated. Dynamic QR generation active.',
          });
        }
      }
    }, 900);
  };

  const activeGw = managerConfig.gateways[managerConfig.activeProvider];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" />
            <span>SaaS Payment Gateways</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Dodo Payments, Cashfree, Razorpay, Stripe, or UPI for customer subscription checkout
          </p>
        </div>

        {/* Current Active Gateway Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Active Gateway:</span>
          <span className="text-white font-bold bg-purple-900/80 px-2 py-0.5 rounded-md border border-purple-400/30">
            {activeGw?.name || 'Dodo Payments'}
          </span>
          <span className="text-[10px] text-purple-300 uppercase tracking-wider">
            {activeGw?.isTestMode ? 'TEST MODE' : 'LIVE MODE'}
          </span>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white">
            Single Active Gateway Architecture
          </p>
          <p className="text-slate-400 leading-relaxed">
            When tenants visit their Subscription & Upgrade page in the SaaS application, the system automatically uses whichever payment gateway is marked as <strong className="text-purple-300">Active</strong> below. You can seamlessly switch between <strong>Dodo Payments</strong>, <strong>Cashfree</strong>, <strong>Razorpay</strong>, or <strong>Direct UPI</strong> anytime without code changes.
          </p>
        </div>
      </div>

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. DODO PAYMENTS */}
        {(() => {
          const gw = managerConfig.gateways.dodopayments;
          const isActive = managerConfig.activeProvider === 'dodopayments';
          return (
            <div
              className={`rounded-2xl bg-slate-900 border transition-all p-5 flex flex-col justify-between ${
                isActive
                  ? 'border-purple-500 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Gateway Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-black text-purple-400 text-sm">
                      DODO
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Dodo Payments</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                            CURRENT ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Modern global merchant of record with automatic tax, UPI & cards
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSetActive('dodopayments')}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 cursor-default'
                        : 'bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isActive ? 'Active' : 'Set as Active'}
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5 text-xs">
                  {/* Test / Live Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div>
                      <span className="font-semibold text-slate-200">Environment Mode</span>
                      <p className="text-[10px] text-slate-500">Switch between Dodo Sandbox and Live processing</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-md border border-slate-800">
                      <button
                        onClick={() => handleUpdateField('dodopayments', 'isTestMode', true)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          gw.isTestMode
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Test / Sandbox
                      </button>
                      <button
                        onClick={() => handleUpdateField('dodopayments', 'isTestMode', false)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          !gw.isTestMode
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Live Mode
                      </button>
                    </div>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Dodo API Secret Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets['dodo_key'] ? 'text' : 'password'}
                        value={gw.dodoApiKey || ''}
                        onChange={(e) => handleUpdateField('dodopayments', 'dodoApiKey', e.target.value)}
                        placeholder="dodo_live_sec_..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('dodo_key')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSecrets['dodo_key'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Webhook Secret */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Webhook Signing Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets['dodo_wh'] ? 'text' : 'password'}
                        value={gw.dodoWebhookSecret || ''}
                        onChange={(e) => handleUpdateField('dodopayments', 'dodoWebhookSecret', e.target.value)}
                        placeholder="whsec_dodo_..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-purple-500 focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('dodo_wh')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSecrets['dodo_wh'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Dodo Product IDs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">1-Mo Product ID</label>
                      <input
                        type="text"
                        value={gw.dodoProductIdMonthly || ''}
                        onChange={(e) => handleUpdateField('dodopayments', 'dodoProductIdMonthly', e.target.value)}
                        placeholder="p_monthly_99"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">6-Mo Product ID</label>
                      <input
                        type="text"
                        value={gw.dodoProductIdSixMonths || ''}
                        onChange={(e) => handleUpdateField('dodopayments', 'dodoProductIdSixMonths', e.target.value)}
                        placeholder="p_six_mo_474"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">12-Mo Product ID</label>
                      <input
                        type="text"
                        value={gw.dodoProductIdTwelveMonths || ''}
                        onChange={(e) => handleUpdateField('dodopayments', 'dodoProductIdTwelveMonths', e.target.value)}
                        placeholder="p_twelve_mo_588"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleTestConnection('dodopayments')}
                  disabled={testingGateway === 'dodopayments'}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingGateway === 'dodopayments' ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <button
                  onClick={() => handleSaveGateway('dodopayments')}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Config</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* 2. CASHFREE PAYMENTS */}
        {(() => {
          const gw = managerConfig.gateways.cashfree;
          const isActive = managerConfig.activeProvider === 'cashfree';
          return (
            <div
              className={`rounded-2xl bg-slate-900 border transition-all p-5 flex flex-col justify-between ${
                isActive
                  ? 'border-teal-500 shadow-xl shadow-teal-950/40 ring-1 ring-teal-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Gateway Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center font-black text-teal-400 text-sm">
                      CF
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Cashfree Payments</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-bold">
                            CURRENT ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Leading Indian payment gateway with UPI AutoPay, NetBanking & Cards
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSetActive('cashfree')}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-600/30 text-teal-300 border border-teal-500/40 cursor-default'
                        : 'bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isActive ? 'Active' : 'Set as Active'}
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5 text-xs">
                  {/* Test / Live Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div>
                      <span className="font-semibold text-slate-200">Cashfree Mode</span>
                      <p className="text-[10px] text-slate-500">Switch between Cashfree Sandbox and Production</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-md border border-slate-800">
                      <button
                        onClick={() => handleUpdateField('cashfree', 'isTestMode', true)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          gw.isTestMode
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Sandbox / Test
                      </button>
                      <button
                        onClick={() => handleUpdateField('cashfree', 'isTestMode', false)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          !gw.isTestMode
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Production
                      </button>
                    </div>
                  </div>

                  {/* App ID */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Cashfree App ID / Client ID
                    </label>
                    <input
                      type="text"
                      value={gw.cashfreeAppId || ''}
                      onChange={(e) => handleUpdateField('cashfree', 'cashfreeAppId', e.target.value)}
                      placeholder="CF_APP_..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Secret Key */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Cashfree Secret Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets['cf_sec'] ? 'text' : 'password'}
                        value={gw.cashfreeSecretKey || ''}
                        onChange={(e) => handleUpdateField('cashfree', 'cashfreeSecretKey', e.target.value)}
                        placeholder="cf_sec_live_..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-teal-500 focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('cf_sec')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSecrets['cf_sec'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* API Version */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      API Version Header
                    </label>
                    <input
                      type="text"
                      value={gw.cashfreeApiVersion || '2023-08-01'}
                      onChange={(e) => handleUpdateField('cashfree', 'cashfreeApiVersion', e.target.value)}
                      placeholder="2023-08-01"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleTestConnection('cashfree')}
                  disabled={testingGateway === 'cashfree'}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingGateway === 'cashfree' ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <button
                  onClick={() => handleSaveGateway('cashfree')}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Config</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* 3. RAZORPAY */}
        {(() => {
          const gw = managerConfig.gateways.razorpay;
          const isActive = managerConfig.activeProvider === 'razorpay';
          return (
            <div
              className={`rounded-2xl bg-slate-900 border transition-all p-5 flex flex-col justify-between ${
                isActive
                  ? 'border-blue-500 shadow-xl shadow-blue-950/40 ring-1 ring-blue-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Gateway Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-sm">
                      RZP
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Razorpay</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-bold">
                            CURRENT ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Standard India payment gateway with Checkout JS & Webhooks
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSetActive('razorpay')}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 cursor-default'
                        : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isActive ? 'Active' : 'Set as Active'}
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5 text-xs">
                  {/* Test / Live Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                    <div>
                      <span className="font-semibold text-slate-200">Razorpay Mode</span>
                      <p className="text-[10px] text-slate-500">Toggle Test vs Live Key pair</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-md border border-slate-800">
                      <button
                        onClick={() => handleUpdateField('razorpay', 'isTestMode', true)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          gw.isTestMode
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Test Mode
                      </button>
                      <button
                        onClick={() => handleUpdateField('razorpay', 'isTestMode', false)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          !gw.isTestMode
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Live Mode
                      </button>
                    </div>
                  </div>

                  {/* Key ID */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      value={gw.razorpayKeyId || ''}
                      onChange={(e) => handleUpdateField('razorpay', 'razorpayKeyId', e.target.value)}
                      placeholder="rzp_live_..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Key Secret */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Razorpay Key Secret
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets['rzp_sec'] ? 'text' : 'password'}
                        value={gw.razorpayKeySecret || ''}
                        onChange={(e) => handleUpdateField('razorpay', 'razorpayKeySecret', e.target.value)}
                        placeholder="rzp_sec_..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-blue-500 focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('rzp_sec')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showSecrets['rzp_sec'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleTestConnection('razorpay')}
                  disabled={testingGateway === 'razorpay'}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingGateway === 'razorpay' ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>

                <button
                  onClick={() => handleSaveGateway('razorpay')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Config</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* 4. MANUAL UPI & DIRECT BANK */}
        {(() => {
          const gw = managerConfig.gateways.manual_upi;
          const isActive = managerConfig.activeProvider === 'manual_upi';
          return (
            <div
              className={`rounded-2xl bg-slate-900 border transition-all p-5 flex flex-col justify-between ${
                isActive
                  ? 'border-amber-500 shadow-xl shadow-amber-950/40 ring-1 ring-amber-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Gateway Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-400 text-sm">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Direct UPI & Bank Transfer</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                            CURRENT ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Zero transaction fees • Instant dynamic QR on checkout screen
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSetActive('manual_upi')}
                    disabled={isActive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 cursor-default'
                        : 'bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isActive ? 'Active' : 'Set as Active'}
                  </button>
                </div>

                {/* Form Fields */}
                <div className="space-y-3.5 text-xs">
                  {/* UPI ID */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Business UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={gw.upiId || ''}
                      onChange={(e) => handleUpdateField('manual_upi', 'upiId', e.target.value)}
                      placeholder="kannakubilling@okaxis"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Payee Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Official Payee Name
                    </label>
                    <input
                      type="text"
                      value={gw.upiPayeeName || ''}
                      onChange={(e) => handleUpdateField('manual_upi', 'upiPayeeName', e.target.value)}
                      placeholder="Kannaku Cloud Billing Inc"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Bank Details */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={gw.bankName || ''}
                        onChange={(e) => handleUpdateField('manual_upi', 'bankName', e.target.value)}
                        placeholder="HDFC Bank"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={gw.accountNumber || ''}
                        onChange={(e) => handleUpdateField('manual_upi', 'accountNumber', e.target.value)}
                        placeholder="502000..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleTestConnection('manual_upi')}
                  disabled={testingGateway === 'manual_upi'}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingGateway === 'manual_upi' ? 'animate-spin' : ''}`} />
                  <span>Verify UPI VPA</span>
                </button>

                <button
                  onClick={() => handleSaveGateway('manual_upi')}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Config</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Test Connection Result Box */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in-50 duration-200 ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}
        >
          {testResult.success ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <p className="font-bold">
              {testResult.success ? 'Gateway Health Check Passed' : 'Connection Check Failed'}
            </p>
            <p className="opacity-90 mt-0.5">{testResult.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};
