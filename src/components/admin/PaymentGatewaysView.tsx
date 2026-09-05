import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Lock,
  Radio,
  Server,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { PaymentGatewayConfig, SaaSGatewayManagerConfig } from '../../types/admin';
import { PayUGatewaySettings } from './PayUGatewaySettings';

export const PaymentGatewaysView: React.FC = () => {
  const [managerConfig, setManagerConfig] = useState<SaaSGatewayManagerConfig>(
    SaaSAdminDB.getPaymentGatewaysConfig()
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshConfig = () => {
    SaaSAdminDB.getPaymentGatewaysConfigAsync().then((cfg) => {
      if (cfg) setManagerConfig(cfg);
    });
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeGw: PaymentGatewayConfig = managerConfig.gateways.payu || {
    provider: 'payu',
    name: 'PayU India Hosted Gateway',
    isEnabled: true,
    isTestMode: true,
  };

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
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>PayU India Payment Gateway</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sole active payment gateway for tenant subscriptions with SHA-512 reverse hash verification
          </p>
        </div>

        {/* Current Active Gateway Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Sole Active Gateway:</span>
          <span className="text-white font-bold bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-400/30">
            PayU India Hosted Checkout
          </span>
          <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">
            {activeGw?.isTestMode ? 'SANDBOX (TEST)' : 'PRODUCTION (LIVE)'}
          </span>
        </div>
      </div>

      {/* Embedded PayU Gateway Settings Engine */}
      <PayUGatewaySettings onSaved={refreshConfig} />
    </div>
  );
};
