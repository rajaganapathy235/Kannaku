import React, { useState } from 'react';
import confetti from 'canvas-confetti';
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
} from 'lucide-react';
import { CompanyProfile, SubscriptionPlan, SubscriptionState } from '../../types';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { KannakuDB } from '../../utils/storage';
import { SaaSPlan, SaaSTransaction, TenantOrganizationFull } from '../../types/admin';
import { LegalModal, LegalDocType } from '../home/LegalModal';

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
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'simulating' | 'success'>('idle');
  const [lastTxnId, setLastTxnId] = useState<string>('');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('terms');

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
  };

  const handleExecutePaymentSimulation = () => {
    setIsProcessing(true);
    setCheckoutStep('simulating');

    const pricing = getDurationDetails();
    const nextExpiryDate = new Date();
    nextExpiryDate.setDate(nextExpiryDate.getDate() + pricing.durationDays);
    const formattedExpiry = nextExpiryDate.toISOString().split('T')[0];

    const txnId = `TXN_${activeGateway.provider.toUpperCase().slice(0, 4)}_${Date.now().toString().slice(-6)}`;
    setLastTxnId(txnId);

    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep('success');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Map provider name to SaaSTransaction enum type
      const providerMapped: 'PayU' | 'Dodo Payments' | 'Stripe' | 'Manual Bank' =
        activeGateway.provider === 'payu'
          ? 'PayU'
          : activeGateway.provider === 'dodopayments'
          ? 'Dodo Payments'
          : activeGateway.provider === 'stripe'
          ? 'Stripe'
          : 'Manual Bank';

      // 1. Record SaaS Transaction in admin storage
      const newTxn: SaaSTransaction = {
        id: `txn_${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        organizationId: activeOrg?.id || 'org_active',
        organizationName: company.name || activeOrg?.name || 'My Workspace',
        amount: pricing.amount,
        currency: 'INR',
        planName: plan.name,
        billingCycle: selectedDuration === '12_MONTHS' ? 'YEARLY' : 'MONTHLY',
        paymentProvider: providerMapped,
        paymentMethod: activeGateway.provider === 'manual_upi' ? 'UPI' : 'Credit Card',
        gatewayRefId: txnId,
        date: new Date().toISOString(),
        status: 'SUCCESSFUL',
        subscriptionId: `sub_${Date.now()}`,
        customerEmail: company.email || activeOrg?.adminEmail || 'admin@justgst.in',
      };
      SaaSAdminDB.saveTransaction(newTxn);

      const upgradedPlanObj: SubscriptionPlan = {
        id: plan.id,
        name: plan.name,
        priceInr: pricing.amount,
        durationDays: pricing.durationDays,
        features: [
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
        ],
      };

      // 2. Update local subscription state in customer client
      const updatedSub: SubscriptionState = {
        isSubscribed: true,
        activePlan: upgradedPlanObj,
        plan: plan.code || 'ALL_IN_ONE',
        status: 'ACTIVE',
        billingCycle: selectedDuration === '12_MONTHS' ? 'YEARLY' : 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: formattedExpiry,
        invoicesCountThisMonth: 0,
        pdfGenerationsThisMonth: 0,
        trialDaysRemaining: undefined,
      };
      KannakuDB.saveSubscription(updatedSub);

      // 3. Update Org in SaaS Admin DB
      if (activeOrg) {
        SaaSAdminDB.saveOrganization({
          ...activeOrg,
          planId: plan.id,
          planName: plan.name,
          subscriptionStatus: 'ACTIVE',
          accountStatus: 'ACTIVE',
          billingCycle: selectedDuration === '12_MONTHS' ? 'YEARLY' : 'MONTHLY',
          renewalDate: formattedExpiry,
          mrr: pricing.perMonth,
          paymentProvider: activeGateway.provider,
        });
      }

      onUpgradeSuccess(upgradedPlanObj);
    }, 1200);
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
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                {subscription.status === 'ACTIVE' ? 'ACTIVE & VERIFIED' : 'TRIAL PERIOD'}
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
                    <span>Active Gateway:</span>
                    <span className="font-bold text-emerald-700">{activeGateway.name}</span>
                  </div>
                  <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">Total Amount (INR):</span>
                    <span className="text-xl font-black text-slate-900 font-mono">
                      ₹{currentDurationInfo.amount}
                    </span>
                  </div>
                </div>

                {/* Payment Gateway Visual Notice */}
                <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-800 flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                  <span>
                    Secured payment processing via <strong>{activeGateway.name}</strong> ({activeGateway.isTestMode ? 'Test Mode' : 'Live Gateway'})
                  </span>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleExecutePaymentSimulation}
                  disabled={isProcessing}
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-98"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{currentDurationInfo.amount} & Activate Now</span>
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

            {checkoutStep === 'simulating' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">
                    Connecting to {activeGateway.name}...
                  </p>
                  <p className="text-slate-500 mt-1">
                    Verifying authorization & generating subscription invoice
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="py-4 text-center space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Payment Successful!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Your workspace has been upgraded to <strong>{plan.name}</strong> for{' '}
                    <strong>{currentDurationInfo.durationTitle}</strong>.
                  </p>
                  <p className="text-xs font-mono text-brand-600 mt-2 font-bold">
                    Txn Reference: {lastTxnId}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setCheckoutStep('idle');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Continue to Workspace
                </button>
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
