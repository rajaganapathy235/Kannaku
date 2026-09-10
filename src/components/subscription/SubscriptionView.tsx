import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  Tag,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { CompanyProfile, SubscriptionState } from '../../types';
import { SaaSPlan } from '../../types/admin';
import { LegalModal, LegalDocType } from '../home/LegalModal';
import { AuthService } from '../../utils/authService';
import { ApiService } from '../../utils/apiService';

export interface PaymentResultBannerState {
  status: 'success' | 'failure';
  txnId?: string | null;
  amount?: string | null;
  error?: string | null;
  timestamp?: number;
}

interface SubscriptionViewProps {
  company: CompanyProfile;
  subscription: SubscriptionState;
  paymentResult?: PaymentResultBannerState | null;
  onDismissPaymentResult?: () => void;
}

export type SubscriptionDurationCycle = '1_MONTH' | '6_MONTHS' | '12_MONTHS';

export interface SubscriptionPlanTier {
  id: string;
  planId: string;
  name: string;
  tierLabel?: string;
  billingCycle: SubscriptionDurationCycle;
  durationDays: number;
  monthlyPriceInr: number;
  totalPriceInr: number;
  periodText?: string;
  description: string;
  savingsBadge?: string | null;
  isPopular?: boolean;
  trialDurationDays?: number;
}

const DEFAULT_PLAN_TIERS: SubscriptionPlanTier[] = [
  {
    id: 'plan_1_month',
    planId: 'plan_1_month',
    name: '1 Month (Monthly)',
    tierLabel: 'Standard',
    billingCycle: '1_MONTH',
    durationDays: 30,
    monthlyPriceInr: 99,
    totalPriceInr: 99,
    periodText: '/ month',
    description: 'Billed every 30 days. Perfect for new stores testing the software.',
    savingsBadge: null,
    isPopular: false,
    trialDurationDays: 7,
  },
  {
    id: 'plan_6_months',
    planId: 'plan_6_months',
    name: '6 Months (Half-Yearly)',
    tierLabel: 'Save 20%',
    billingCycle: '6_MONTHS',
    durationDays: 180,
    monthlyPriceInr: 79,
    totalPriceInr: 474,
    periodText: '/ month',
    description: 'Billed semi-annually. Ideal for regular retail and GST traders.',
    savingsBadge: 'Save 20%',
    isPopular: false,
    trialDurationDays: 7,
  },
  {
    id: 'plan_12_months',
    planId: 'plan_12_months',
    name: '12 Months (Annual)',
    tierLabel: 'Save 50% • Best Value',
    billingCycle: '12_MONTHS',
    durationDays: 365,
    monthlyPriceInr: 49,
    totalPriceInr: 588,
    periodText: '/ month',
    description: 'Billed ₹588 annually. Maximum savings with 1-year continuous access.',
    savingsBadge: 'Save 50% • Best Value',
    isPopular: true,
    trialDurationDays: 7,
  },
];

interface LiveSubscriptionData {
  organizationId: string;
  workspaceName: string;
  planId: string;
  planName: string;
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'PAST_DUE' | 'CANCELLED';
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  renewalDate: string | null;
  trialEndDate: string | null;
  paymentProvider: string;
  daysRemaining: number;
  isReadOnly: boolean;
  code: string | null;
  readOnlyReason: string | null;
  activeGateway: {
    name: string;
    provider: string;
    isConfigured: boolean;
    currency: string;
  };
}

interface LiveTransactionRecord {
  id: string;
  organizationId: string;
  organizationName: string;
  amount: number;
  currency: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  date: string;
  invoiceNumber: string;
  paymentMethod: string;
  paymentProvider: string;
  planName: string;
  billingCycle: string;
  gatewayRefId?: string;
}

export const SubscriptionView: React.FC<SubscriptionViewProps> = ({
  company,
  subscription,
  paymentResult,
  onDismissPaymentResult,
}) => {
  const [liveSub, setLiveSub] = useState<LiveSubscriptionData | null>(null);
  const [isLoadingSub, setIsLoadingSub] = useState<boolean>(true);

  // Payment result banner state (from prop or URL parameters)
  const [paymentBanner, setPaymentBanner] = useState<PaymentResultBannerState | null>(() => {
    if (paymentResult) return paymentResult;
    try {
      let searchString = window.location.search;
      if (window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        searchString = searchString ? `${searchString}&${hashQuery}` : `?${hashQuery}`;
      }
      const params = new URLSearchParams(searchString);
      const status = params.get('payment_status');
      if (status === 'success' || status === 'failure') {
        return {
          status,
          txnId: params.get('txnid'),
          amount: params.get('amount'),
          error: params.get('error'),
          timestamp: Date.now(),
        };
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (paymentBanner?.status === 'success') {
      fetchRealSubscription();
      fetchRealTransactions();
      // Re-fetch /api/auth/me to update session and release read-only mode based on server state
      apiService.getMe().catch((err) => console.error('Error refreshing session after payment success:', err));
    }
  }, [paymentBanner]);

  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [planTiers, setPlanTiers] = useState<SubscriptionPlanTier[]>(DEFAULT_PLAN_TIERS);
  const [selectedTier, setSelectedTier] = useState<SubscriptionPlanTier>(DEFAULT_PLAN_TIERS[2]);
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<LiveTransactionRecord[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState<boolean>(false);

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

  // 1. Fetch real live subscription state directly from D1
  const fetchRealSubscription = async () => {
    setIsLoadingSub(true);
    try {
      const res = await ApiService.getSubscriptionStatus();
      if (res.success && res.data?.subscription) {
        setLiveSub(res.data.subscription as LiveSubscriptionData);
      }
    } catch (err) {
      console.warn('[SubscriptionView] Error fetching live subscription status:', err);
    } finally {
      setIsLoadingSub(false);
    }
  };

  // 2. Fetch real live billing history / transactions from D1
  const fetchRealTransactions = async () => {
    setIsLoadingTxns(true);
    try {
      const res = await ApiService.getSubscriptionTransactions();
      if (res.success && Array.isArray(res.data?.transactions)) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.warn('[SubscriptionView] Error fetching live transactions:', err);
    } finally {
      setIsLoadingTxns(false);
    }
  };

  // 3. Fetch live plans dynamically from /api/plans endpoint (Cloudflare D1)
  useEffect(() => {
    let isMounted = true;
    fetchRealSubscription();
    fetchRealTransactions();

    setIsLoadingPlans(true);
    fetch('/api/plans')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          if (Array.isArray(data.plans) && data.plans.length > 0) {
            setPlans(data.plans);
          }

          if (Array.isArray(data.tiers) && data.tiers.length > 0) {
            setPlanTiers(data.tiers);
            const popular = data.tiers.find((t: SubscriptionPlanTier) => t.isPopular) || data.tiers[data.tiers.length - 1];
            setSelectedTier(popular);
          } else if (data.flagshipPlan || (Array.isArray(data.plans) && data.plans.length > 0)) {
            const p = data.flagshipPlan || data.plans[0];
            const m = Number(p.monthlyPriceInr) || 99;
            const s = Number(p.sixMonthPriceInr) || 474;
            const y = Number(p.yearlyPriceInr) || 588;

            const derived: SubscriptionPlanTier[] = [
              {
                id: 'plan_1_month',
                planId: 'plan_1_month',
                name: '1 Month (Monthly)',
                tierLabel: 'Standard',
                billingCycle: '1_MONTH',
                durationDays: 30,
                monthlyPriceInr: m,
                totalPriceInr: m,
                periodText: '/ month',
                description: 'Billed every 30 days. Perfect for new stores testing the software.',
                savingsBadge: null,
                isPopular: false,
                trialDurationDays: p.trialDurationDays || 7,
              },
              {
                id: 'plan_6_months',
                planId: 'plan_6_months',
                name: '6 Months (Half-Yearly)',
                tierLabel: 'Save 20%',
                billingCycle: '6_MONTHS',
                durationDays: 180,
                monthlyPriceInr: Math.round(s / 6),
                totalPriceInr: s,
                periodText: '/ month',
                description: 'Billed semi-annually. Ideal for regular retail and GST traders.',
                savingsBadge: 'Save 20%',
                isPopular: false,
                trialDurationDays: p.trialDurationDays || 7,
              },
              {
                id: 'plan_12_months',
                planId: 'plan_12_months',
                name: '12 Months (Annual)',
                tierLabel: 'Save 50% • Best Value',
                billingCycle: '12_MONTHS',
                durationDays: 365,
                monthlyPriceInr: Math.round(y / 12),
                totalPriceInr: y,
                periodText: '/ month',
                description: 'Billed ₹588 annually. Maximum savings with 1-year continuous access.',
                savingsBadge: 'Save 50% • Best Value',
                isPopular: true,
                trialDurationDays: p.trialDurationDays || 7,
              },
            ];
            setPlanTiers(derived);
            setSelectedTier(derived[2]);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live plans:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingPlans(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openLegal = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setLegalModalOpen(true);
  };

  // Real data calculations (server-authoritative)
  const workspaceName = liveSub?.workspaceName || company.name || 'My Business';
  const flagshipPlanName = liveSub?.planName || subscription.plan || 'All-in-One Growth Plan';
  const subStatus = liveSub?.subscriptionStatus || (subscription.isSubscribed ? 'ACTIVE' : subscription.status) || 'TRIAL';
  const isSuspended = liveSub?.accountStatus === 'SUSPENDED';
  const isReadOnly = liveSub ? liveSub.isReadOnly : subscription.status === 'EXPIRED';

  const renewalDate = liveSub?.renewalDate || subscription.expiryDate || null;
  const trialEndDate = liveSub?.trialEndDate || null;

  const isLiveActive = subStatus === 'ACTIVE';
  const daysRemaining = liveSub !== null ? liveSub.daysRemaining : (subscription.trialDaysRemaining ?? 14);
  const isTrialExpired = !isLiveActive && (isReadOnly || daysRemaining <= 0 || subStatus === 'EXPIRED');

  const formatSubscriptionDate = (dateStr: string | null, isSubActive: boolean, daysLeft: number) => {
    let targetDate: Date;
    if (dateStr) {
      const parsed = new Date(dateStr);
      targetDate = isNaN(parsed.getTime()) ? new Date(Date.now() + (isSubActive ? 365 : 14) * 24 * 60 * 60 * 1000) : parsed;
    } else {
      targetDate = new Date(Date.now() + (isSubActive ? 365 : 14) * 24 * 60 * 60 * 1000);
    }

    return targetDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const activeGatewayName = liveSub?.activeGateway?.name || 'PayU India Hosted Gateway';

  const handleOpenSubscribeModal = (tier: SubscriptionPlanTier) => {
    setSelectedTier(tier);
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
      const res = await ApiService.validateCoupon(code, selectedTier.totalPriceInr, selectedTier.id);
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
          planId: selectedTier.id,
          billingCycle: selectedTier.billingCycle,
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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Subscription &amp; Plan Upgrades
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-600" />
              <span>{flagshipPlanName}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Single all-inclusive plan with 1-Month, 6-Month, and 12-Month billing models
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
            Subscription Plans
          </button>
          <button
            onClick={() => {
              setActiveTab('history');
              fetchRealTransactions();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Billing History ({transactions.length})</span>
          </button>
        </div>
      </div>

      {/* Transaction Result Banner (Success / Failure / Cancelled) */}
      {paymentBanner && (
        <div
          id={paymentBanner.status === 'success' ? 'payment-success-banner' : 'payment-failure-banner'}
          className={`p-5 rounded-2xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
            paymentBanner.status === 'success'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/90 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                paymentBanner.status === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {paymentBanner.status === 'success' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <AlertCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black tracking-tight">
                  {paymentBanner.status === 'success'
                    ? 'Payment Successful & Verified!'
                    : 'Payment Unsuccessful / Cancelled'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    paymentBanner.status === 'success'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border-rose-200'
                  }`}
                >
                  {paymentBanner.status === 'success' ? 'PRO PLAN ACTIVE' : 'TRANSACTION INCOMPLETE'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {paymentBanner.status === 'success'
                  ? 'Your payment has been successfully recorded and verified with PayU India. Your subscription is active and all features are unlocked.'
                  : paymentBanner.error
                  ? decodeURIComponent(paymentBanner.error)
                  : 'The transaction was cancelled or could not be completed on PayU. No amount was charged to your account.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono opacity-85">
                {paymentBanner.txnId && (
                  <span>
                    <strong>Txn ID:</strong> {paymentBanner.txnId}
                  </span>
                )}
                {paymentBanner.amount && (
                  <span>
                    <strong>Amount:</strong> ₹{paymentBanner.amount}
                  </span>
                )}
                <span>
                  <strong>Gateway:</strong> PayU India Hosted
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {paymentBanner.status === 'success' ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('history');
                  fetchRealTransactions();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Receipt</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleOpenSubscribeModal(planTiers[2] || planTiers[0]);
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Try Payment Again</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setPaymentBanner(null);
                if (onDismissPaymentResult) onDismissPaymentResult();
              }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              <span className="font-bold text-sm block">Free Trial Expired — Read-Only Mode Active</span>
              <span className="text-xs text-amber-800">
                Your historical records are safe. Select a plan below to re-activate invoice creation and printing.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleOpenSubscribeModal(planTiers[2] || planTiers[0])}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade Now</span>
          </button>
        </div>
      )}

      {/* Flagship Plan Banner & Workspace Status (Real Data) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
            <Crown className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Active Flagship Plan:</span>
              <span className="text-sm font-black text-slate-900">
                {flagshipPlanName}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>All Features Included</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                  isSuspended
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isLiveActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isTrialExpired
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isSuspended
                  ? 'ACCOUNT SUSPENDED'
                  : isLiveActive
                  ? 'ACTIVE & VERIFIED'
                  : isTrialExpired
                  ? 'TRIAL EXPIRED (READ-ONLY)'
                  : `FREE TRIAL (${daysRemaining} DAYS REMAINING)`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
              <span>Workspace:</span>
              <strong className="text-slate-800 font-semibold">
                {workspaceName}
              </strong>
              <span className="text-slate-300">•</span>
              <span>{isLiveActive ? 'Renewal Date:' : 'Trial Expiry:'}</span>
              <strong className="text-brand-600 font-mono font-bold">
                {formatSubscriptionDate(renewalDate || trialEndDate, isLiveActive, daysRemaining)}
              </strong>
              <span className="text-slate-400 font-medium text-[11px]">
                ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Payment Gateway
            </span>
            <span className="text-xs font-bold text-slate-700">
              {activeGatewayName}
            </span>
          </div>
          <button
            onClick={() => handleOpenSubscribeModal(planTiers[2] || planTiers[0])}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer active:scale-98 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Renew / Extend Access</span>
          </button>
        </div>
      </div>

      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto pt-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Subscription Billing Durations &amp; Pricing
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Single comprehensive plan with ALL GST invoicing, Tally multi-copy prints &amp; compliance features unlocked
            </p>
          </div>

          {/* Dynamic 3-Tier Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-2">
            {planTiers.map((tier) => {
              const isSelected = selectedTier.id === tier.id;
              const isAnnual = tier.billingCycle === '12_MONTHS';

              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier)}
                  className={`rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between relative bg-white ${
                    isAnnual
                      ? 'border-2 border-brand-600 shadow-xl ring-2 ring-brand-500/20 md:-translate-y-2'
                      : isSelected
                      ? 'border-brand-600 shadow-md ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  {/* Highlight Ribbon / Badge */}
                  {tier.savingsBadge && (
                    <div
                      className={`absolute -top-3 right-4 px-3 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1 ${
                        isAnnual
                          ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isAnnual && <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />}
                      <span>{tier.savingsBadge}</span>
                    </div>
                  )}

                  {!tier.savingsBadge && tier.tierLabel && (
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {tier.tierLabel}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {isAnnual && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                        {tier.name}
                      </span>
                    </div>

                    {/* Price Display */}
                    <div className="flex items-baseline gap-1 my-3">
                      <span className={`text-3xl font-black font-mono ${isAnnual ? 'text-brand-600' : 'text-slate-900'}`}>
                        ₹{tier.monthlyPriceInr}
                      </span>
                      <span className="text-xs text-slate-500">{tier.periodText || '/ month'}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                      {tier.description}
                    </p>

                    {/* Total Billed Summary Box */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Total Billed:</span>
                      <span className="font-bold font-mono text-slate-900 text-sm">
                        ₹{tier.totalPriceInr}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSubscribeModal(tier);
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
                        isAnnual
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg'
                          : isSelected
                          ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-brand-600 text-slate-700 hover:text-white'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${isAnnual ? 'text-amber-300 fill-amber-300' : ''}`} />
                      <span>Proceed to Subscribe (₹{tier.totalPriceInr})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Included Features Section */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                All Included Software Capabilities
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                100% Full Access On All Tiers
              </span>
            </div>

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
              Subscription Invoices &amp; Receipts
            </h3>
            <span className="text-xs text-slate-500">
              {isLoadingTxns ? 'Loading transactions...' : `${transactions.length} records found`}
            </span>
          </div>

          {isLoadingTxns ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Fetching server billing records...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-700">No Billing Transactions Yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Your subscription invoices and payment receipts will be automatically recorded here after completing checkout.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4 font-semibold">Invoice #</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Plan &amp; Duration</th>
                    <th className="py-3 px-4 font-semibold">Gateway</th>
                    <th className="py-3 px-4 font-semibold">Amount</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions.map((t) => (
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
                        <span
                          className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${
                            t.status === 'SUCCESSFUL'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : t.status === 'FAILED'
                              ? 'bg-rose-50 border-rose-200 text-rose-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}
                        >
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

      {/* PayU Hosted Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            {checkoutStep === 'idle' && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Subscribe &amp; Activate</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Workspace: <span className="text-brand-600 font-semibold">{workspaceName}</span>
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
                    <span className="font-bold text-slate-900">{flagshipPlanName}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Selected Duration:</span>
                    <span className="font-bold text-brand-600">
                      {selectedTier.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Base Price:</span>
                    <span className={`font-mono ${appliedCoupon ? 'line-through text-slate-400' : 'font-bold text-slate-900'}`}>
                      ₹{selectedTier.totalPriceInr}
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
                    <span className="font-bold text-emerald-700">{activeGatewayName}</span>
                  </div>
                  <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">Total Payable:</span>
                    <span className="text-xl font-black text-slate-900 font-mono">
                      ₹{appliedCoupon ? appliedCoupon.finalAmount : selectedTier.totalPriceInr}
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
                    Secured payment processing via <strong>{activeGatewayName}</strong>
                  </span>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleInitiatePayUCheckout}
                  disabled={isProcessing}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{appliedCoupon ? appliedCoupon.finalAmount : selectedTier.totalPriceInr} via PayU</span>
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

