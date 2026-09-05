import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Crown,
  CreditCard,
  Lock,
  ShieldCheck,
  Zap,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Receipt,
  Download,
  QrCode,
  Smartphone,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  Tag,
} from 'lucide-react';
import { CompanyProfile, SubscriptionPlan, SubscriptionState } from '../../types';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { KannakuDB } from '../../utils/storage';
import { SaaSPlan, SaaSTransaction, TenantOrganizationFull } from '../../types/admin';
import { LegalModal, LegalDocType } from '../home/LegalModal';
import { isSubscriptionTrialExpired } from '../../utils/subscriptionUtils';
import { AuthService } from '../../utils/authService';
import { ApiService } from '../../utils/apiService';

interface SubscriptionViewProps {
  company: CompanyProfile;
  subscription: SubscriptionState;
  onUpgradeSuccess: (plan: SubscriptionPlan) => void;
}

export type SubscriptionDurationCycle = '1_MONTH' | '3_MONTHS' | '12_MONTHS';

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  company,
  subscription,
  onUpgradeSuccess,
}) => {
  const [plans] = useState<SaaSPlan[]>(SaaSAdminDB.getPlans());
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDurationCycle>('12_MONTHS');
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'initiating' | 'redirecting' | 'error'>('idle');
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('terms');

  // Coupon state for checkout
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
    finalAmount: number;
    message?: string;
  } | null>(null);

  const openLegal = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setLegalModalOpen(true);
  };

  const activeGateway = SaaSAdminDB.getActivePaymentGateway();
  const plan = plans[0] || SaaSAdminDB.getPlans()[0];

  // Identify tenant org in admin storage
  const activeTenantId = KannakuDB.getActiveTenantId();
  const allOrgs = SaaSAdminDB.getOrganizations();
  const activeOrg: TenantOrganizationFull | undefined =
    allOrgs.find((o) => o.id === activeTenantId || o.adminEmail === company.email) || allOrgs[0];

  const isTrialExpired = isSubscriptionTrialExpired(subscription, activeOrg);

  // Calculate pricing based on duration (3-Tier Decoy Pricing Model)
  const getDurationDetails = () => {
    if (selectedDuration === '1_MONTH') {
      const amount = plan.monthlyPriceInr || 99;
      return {
        durationTitle: '1 Month',
        amount: amount,
        perMonth: amount,
        durationDays: 30,
        billingNote: 'Billed monthly (₹99/mo)',
        savingsBadge: null,
      };
    } else if (selectedDuration === '3_MONTHS') {
      const amount = 267;
      return {
        durationTitle: '3 Months (Quarterly)',
        amount: amount,
        perMonth: 89,
        durationDays: 90,
        billingNote: 'Billed ₹267 quarterly (₹89/mo)',
        savingsBadge: 'Save ₹30',
      };
    } else {
      const amount = plan.yearlyPriceInr || 588;
      return {
        durationTitle: '12 Months (1 Year)',
        amount: amount,
        perMonth: 49,
        durationDays: 365,
        billingNote: 'Billed ₹588 annually (₹49/mo)',
        savingsBadge: 'MOST POPULAR • 6 MONTHS FREE',
      };
    }
  };

  const currentDurationInfo = getDurationDetails();

  const handleInitiatePayment = (dur: SubscriptionDurationCycle) => {
    setSelectedDuration(dur);
    setShowCheckoutModal(true);
    setCheckoutStep('idle');
    setCheckoutError('');
    setCouponInput('');
    setCouponError('');
    setAppliedCoupon(null);
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await ApiService.validateCoupon(code, currentDurationInfo.amount, plan.id);
      const couponData = res.data;
      if (res.success && couponData && couponData.valid) {
        setAppliedCoupon(couponData);
        setCouponError('');
      } else {
        setAppliedCoupon(null);
        setCouponError(res.error || (res as any).message || `Coupon "${code}" is invalid or expired`);
      }
    } catch (err: any) {
      setAppliedCoupon(null);
      setCouponError(err?.message || `Coupon "${code}" could not be applied`);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleInitiatePayUCheckout = async () => {
    setIsProcessing(true);
    setCheckoutStep('initiating');
    setCheckoutError('');

    const token = AuthService.getToken();

    try {
      const res = await fetch('/api/payments/payu/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          billingCycle: selectedDuration,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.action && data.params) {
        setCheckoutStep('redirecting');
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.action;

        Object.entries(data.params).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // If response is not ok or missing parameters, fail gracefully with error state
      const errorMsg =
        data.error ||
        data.message ||
        'Payment session could not be initiated. Please try again or contact support.';
      setIsProcessing(false);
      setCheckoutStep('error');
      setCheckoutError(errorMsg);
    } catch (err: any) {
      console.error('PayU Checkout initiation failed:', err);
      setIsProcessing(false);
      setCheckoutStep('error');
      setCheckoutError(
        err?.message || 'Payment could not be started. Please check your network connection and try again.'
      );
    }
  };

  const allTxns = SaaSAdminDB.getTransactions().filter(
    (t) =>
      (activeOrg && t.organizationId === activeOrg.id) ||
      t.organizationName.toLowerCase() === (company.name || '').toLowerCase()
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Subscription & Plan Upgrades
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
              All Features Included
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Choose your billing duration: 1-Month, 3-Months, or 12-Months with zero limits
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl text-xs font-semibold border border-slate-200">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Upgrade Plans
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Billing History ({allTxns.length})</span>
          </button>
        </div>
      </div>

      {/* Active Subscription Status Card */}
      {isTrialExpired && (
        <div
          id="subscription-view-trial-expired-banner"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs"
        >
          <div className="flex items-center gap-3 text-amber-950">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block">14-Day Free Trial Expired — Read-Only Mode Active</span>
              <span className="text-xs text-amber-800">
                Your historical records are safe. Select a plan below to re-activate invoice creation and printing.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleInitiatePayment(selectedDuration)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade Now</span>
          </button>
        </div>
      )}

      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Active Plan:</span>
              <span className="text-sm font-bold text-slate-900">
                {plan.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  subscription.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isTrialExpired
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {subscription.status === 'ACTIVE'
                  ? 'ACTIVE & VERIFIED'
                  : isTrialExpired
                  ? 'TRIAL EXPIRED (READ-ONLY)'
                  : 'TRIAL PERIOD'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Workspace:{' '}
              <strong className="text-slate-800">
                {company.name || 'My Business'}
              </strong>{' '}
              • Expiry Date:{' '}
              <strong className="text-brand-600 font-mono">
                {subscription.expiryDate || 'Continuous'}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Payment Gateway
            </span>
            <span className="text-xs font-bold text-slate-700">
              {activeGateway.name}
            </span>
          </div>
          <button
            onClick={() => handleInitiatePayment(selectedDuration)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Renew / Extend Access</span>
          </button>
        </div>
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Duration Selector Cards - 3-Tier Decoy Pricing Model */}
          <div>
            <div className="text-center max-w-lg mx-auto mb-6">
              <h3 className="text-base font-bold text-slate-900">
                Select Your Subscription Period
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                All durations include 100% of GST invoicing, Tally print templates, stock alerts & UPI QR
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-3">
              {/* Tier 1: 1 Month (Anchor) */}
              <div
                onClick={() => setSelectedDuration('1_MONTH')}
                className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between relative bg-white ${
                  selectedDuration === '1_MONTH'
                    ? 'border-brand-600 shadow-md ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800">
                      1 Month
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                      Standard
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl font-black text-slate-900 font-mono">
                      ₹99
                    </span>
                    <span className="text-xs text-slate-500">/ mo</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Total ₹99. Billed monthly. Full access with complete flexibility to cancel or renew anytime.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInitiatePayment('1_MONTH');
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDuration === '1_MONTH'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-brand-600 hover:text-white'
                    }`}
                  >
                    Select 1-Month (₹99)
                  </button>
                </div>
              </div>

              {/* Tier 2: 3 Months (Decoy) */}
              <div
                onClick={() => setSelectedDuration('3_MONTHS')}
                className={`rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between relative bg-white ${
                  selectedDuration === '3_MONTHS'
                    ? 'border-brand-600 shadow-md ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-slate-800 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                  Save ₹30
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-800">
                      3 Months (Quarterly)
                    </span>
                  </div>

                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-3xl font-black text-slate-900 font-mono">
                      ₹89
                    </span>
                    <span className="text-xs text-slate-500">/ mo</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Total ₹267 quarterly (billed ₹89/mo). Minimal discount to get started for a single quarter.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInitiatePayment('3_MONTHS');
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDuration === '3_MONTHS'
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-brand-600 hover:text-white'
                    }`}
                  >
                    Select 3-Months (₹267)
                  </button>
                </div>
              </div>

              {/* Tier 3: 12 Months (Target - High-Converting Hero Card) */}
              <div
                onClick={() => setSelectedDuration('12_MONTHS')}
                className={`rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between relative bg-white md:-translate-y-2 shadow-xl ${
                  selectedDuration === '12_MONTHS'
                    ? 'border-brand-600 ring-2 ring-brand-500/30'
                    : 'border-brand-500/80 hover:border-brand-600'
                }`}
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-brand-600 to-brand-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-md whitespace-nowrap flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>MOST POPULAR • 6 MONTHS FREE</span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                      12 Months (Annual Plan)
                    </span>
                  </div>

                  <div className="space-y-1.5 my-3">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-black text-brand-600 font-mono">
                        ₹49
                      </span>
                      <span className="text-xs font-bold text-slate-600">/ mo</span>
                      <span className="text-xs text-slate-400 font-semibold line-through">
                        ₹1,188
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        (₹588 / year)
                      </span>
                    </div>

                    {/* Daily Cost Framing */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                      <span>⚡ Just ₹1.60 per day!</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    Pay for 6 months and get 6 months completely free. Instant uninterrupted annual billing with zero renewal hassles.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInitiatePayment('12_MONTHS');
                    }}
                    className="w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Claim 6 Months Free (₹588)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Included Features Section */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              All Included Software Capabilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-700">
              {[
                'Unlimited Invoices with Custom Prefixes',
                'Unlimited Quotations & Proforma Invoices',
                'Tally Multi-Copy Engine (Original, Duplicate, Triplicate)',
                'Dynamic UPI QR On Invoices for Instant Payment',
                'Digital Signature & Seal Upload on Bill PDF',
                'Customer & Supplier Ledger with Balance Tracking',
                'GSTR-1 Excel / CSV Compliant Tax Reports',
                'Daybook, Cashflow & Profit Summary',
                'Inventory Management & Stock Alert Notifications',
                'A4, A5 and 3-Inch Thermal POS Receipt Printing',
                'Multi-Device & Multi-User Seat Access',
                'Direct WhatsApp & Email PDF Dispatch',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Subscription Invoices & Receipts
            </h3>
            <span className="text-xs text-slate-500">{allTxns.length} records found</span>
          </div>

          {allTxns.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No transactions recorded yet for this workspace.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Plan & Duration</th>
                    <th className="py-3 px-4 font-semibold">Gateway</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allTxns.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600">
                        {t.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(t.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {t.planName} ({t.billingCycle})
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">{t.paymentProvider}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        ₹{t.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            {checkoutStep === 'idle' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Subscribe & Activate</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Workspace: <span className="text-brand-600 font-semibold">{company.name}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Plan Summary Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Plan:</span>
                    <span className="font-bold text-slate-900">{plan.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Billing Duration:</span>
                    <span className="font-bold text-brand-600">
                      {currentDurationInfo.durationTitle}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Plan Price:</span>
                    <span className={`font-mono ${appliedCoupon ? 'line-through text-slate-400' : 'font-bold text-slate-900'}`}>
                      ₹{currentDurationInfo.amount}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                      <span className="flex items-center gap-1 font-semibold">
                        <Tag className="w-3.5 h-3.5" />
                        Discount ({appliedCoupon.code}):
                      </span>
                      <span className="font-bold font-mono">-₹{appliedCoupon.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Active Gateway:</span>
                    <span className="font-bold text-emerald-700">{activeGateway.name}</span>
                  </div>
                  <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">Total Payable:</span>
                    <span className="text-xl font-black text-slate-900 font-mono">
                      ₹{appliedCoupon ? appliedCoupon.finalAmount : currentDurationInfo.amount}
                    </span>
                  </div>
                </div>

                {/* Coupon Code Entry */}
                {!appliedCoupon ? (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                      Have a Promo / Discount Coupon?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          if (couponError) setCouponError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyCoupon();
                          }
                        }}
                        placeholder="e.g. WELCOME50, SAVE20"
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl uppercase tracking-wider font-mono focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-emerald-900 font-mono tracking-wide">{appliedCoupon.code}</div>
                        <div className="text-[11px] text-emerald-700">{appliedCoupon.message || `Saved ₹${appliedCoupon.discountAmount}`}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Payment Gateway Visual Notice */}
                <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-800 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>
                    Secured payment processing via <strong>{activeGateway.name}</strong> ({activeGateway.isTestMode ? 'Test Mode' : 'Live Gateway'})
                  </span>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleInitiatePayUCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{appliedCoupon ? appliedCoupon.finalAmount : currentDurationInfo.amount} via PayU</span>
                </button>

                {/* Statutory Compliance & Terms Acceptance */}
                <div className="pt-2 text-[11px] text-slate-400 text-center leading-relaxed">
                  By clicking Pay, you agree to JustGST{' '}
                  <button
                    onClick={() => openLegal('terms')}
                    className="text-brand-600 underline font-semibold cursor-pointer"
                  >
                    Terms of Service
                  </button>
                  ,{' '}
                  <button
                    onClick={() => openLegal('privacy')}
                    className="text-brand-600 underline font-semibold cursor-pointer"
                  >
                    Privacy Policy
                  </button>{' '}
                  &amp;{' '}
                  <button
                    onClick={() => openLegal('refund')}
                    className="text-brand-600 underline font-semibold cursor-pointer"
                  >
                    7-Day Refund Policy
                  </button>
                  . Instant cloud delivery &amp; GST tax invoice provided.
                </div>
              </>
            )}

            {checkoutStep === 'initiating' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">
                    Preparing Secure PayU Session...
                  </p>
                  <p className="text-slate-500 mt-1">
                    Generating signed transaction checksum and invoice details
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === 'redirecting' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">
                    Redirecting to PayU Hosted Checkout...
                  </p>
                  <p className="text-slate-500 mt-1">
                    Please complete your payment on the secure PayU gateway.
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === 'error' && (
              <div className="py-4 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Payment Could Not Start</h4>
                  <p className="text-xs text-rose-700 mt-1 px-4 leading-relaxed font-medium">
                    {checkoutError || 'Payment could not be started. Please try again or contact support.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckoutModal(false);
                      setCheckoutStep('idle');
                    }}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('idle');
                      setCheckoutError('');
                    }}
                    className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal & Policy Center Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialDoc={activeLegalDoc}
      />
    </div>
  );
};
