import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Layers,
  Package,
  PlusCircle,
  QrCode,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';
import { KannakuDB } from '../../utils/storage';

interface TourStep {
  id: string;
  tabId: NavTab;
  tabName: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  themeColor: {
    badge: string;
    iconBg: string;
    iconColor: string;
    border: string;
    gradient: string;
  };
  keyFeatures: { title: string; desc: string }[];
  visualPreview: React.ReactNode;
  actionLabel: string;
  proTip: string;
}

interface WorkspaceTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onNewInvoice?: () => void;
  userIdOrTenantId?: string;
}

export const WorkspaceTourModal: React.FC<WorkspaceTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNewInvoice,
  userIdOrTenantId,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  // Progressive Steps focusing strictly on Core Features (Dashboard, Invoices, Customers, Products, + Quickstart)
  const steps: TourStep[] = [
    {
      id: 'dashboard',
      tabId: 'dashboard',
      tabName: 'Dashboard',
      stepNumber: 1,
      totalSteps: 5,
      title: 'Executive Financial Dashboard',
      subtitle: 'Real-time revenue metrics, GST tax splits & party receivables',
      description:
        'Your operational command center gives you live calculations of total billed sales, collected CGST/SGST/IGST breakdown, outstanding balances, and inventory reorder alerts without needing manual spreadsheets.',
      icon: BarChart3,
      themeColor: {
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        iconBg: 'bg-blue-600/10 border-blue-500/20',
        iconColor: 'text-blue-600',
        border: 'border-blue-200',
        gradient: 'from-blue-600 to-indigo-700',
      },
      keyFeatures: [
        {
          title: 'Live GST & Revenue Totals',
          desc: 'Instant aggregation of net sales, tax liability, and overall cash collection.',
        },
        {
          title: 'Debtor Balance Leaderboard',
          desc: 'Ranked party balances with 1-click WhatsApp payment reminder buttons.',
        },
        {
          title: 'Smart Stock & Dues Radar',
          desc: 'Real-time alerts whenever products hit low-stock thresholds.',
        },
      ],
      visualPreview: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Live Metrics</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">FY 2026-27</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Total Billed Sales</span>
              <span className="text-sm font-black text-emerald-400">₹ 4,82,500</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">18 Active Invoices</span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block font-medium">Total Dues Pending</span>
              <span className="text-sm font-black text-amber-400">₹ 1,12,000</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">5 Unsettled Parties</span>
            </div>
          </div>
          <div className="bg-slate-800/50 p-2 rounded-xl flex items-center justify-between text-[11px]">
            <span className="text-slate-300">CGST + SGST Split</span>
            <span className="font-bold text-blue-400">₹ 43,425 / ₹ 43,425</span>
          </div>
        </div>
      ),
      actionLabel: 'Open Dashboard',
      proTip: 'Click on any metric card or invoice row to immediately drill into the underlying transaction.',
    },
    {
      id: 'invoices',
      tabId: 'invoices',
      tabName: 'Invoices',
      stepNumber: 2,
      totalSteps: 5,
      title: 'Tax Invoicing & GST Engine',
      subtitle: 'Compliant B2B & B2C tax billing with automated tax slab splitting',
      description:
        'Create professional GST tax invoices in seconds. The system automatically inspects state codes (e.g., 33-Tamil Nadu vs 29-Karnataka) to apply CGST + SGST or IGST, formats HSN summaries, and renders PDF printouts.',
      icon: FileText,
      themeColor: {
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        iconBg: 'bg-emerald-600/10 border-emerald-500/20',
        iconColor: 'text-emerald-600',
        border: 'border-emerald-200',
        gradient: 'from-emerald-600 to-teal-700',
      },
      keyFeatures: [
        {
          title: 'Automated Tax Classification',
          desc: 'Intra-state (CGST + SGST) vs Inter-state (IGST) calculated automatically based on party GSTIN.',
        },
        {
          title: 'Multiple Print Engines',
          desc: 'Switch between Standard GST Tax Layout, Tally V4 Boxed grid, and 80mm POS Thermal receipts.',
        },
        {
          title: 'Instant WhatsApp Delivery',
          desc: 'Send customized invoice summaries and payment links directly to customer phone numbers.',
        },
      ],
      visualPreview: (
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-md space-y-2.5 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                TAX INVOICE
              </span>
              <span className="text-xs font-black text-slate-900 ml-2">INV/2026/001</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-500">GSTIN: 33AAAAA0000A1Z5</span>
          </div>
          <div className="text-[11px] space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <div className="flex justify-between font-semibold">
              <span>Pure Combed Cotton Yarn (HSN: 5205)</span>
              <span>₹ 85,000</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Qty: 250 KGS @ ₹ 340.00</span>
              <span className="text-emerald-700 font-bold">GST 5% (₹ 4,250)</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-600">Grand Total:</span>
            <span className="font-black text-slate-900 text-sm">₹ 89,250.00</span>
          </div>
        </div>
      ),
      actionLabel: 'Explore Invoices',
      proTip: 'You can press "+ New Invoice" in the top bar from any screen to generate a tax bill instantly.',
    },
    {
      id: 'customers',
      tabId: 'customers',
      tabName: 'Customers',
      stepNumber: 3,
      totalSteps: 5,
      title: 'Customer Directory & Ledger',
      subtitle: 'Complete party master with real-time balance tracking & WhatsApp reminders',
      description:
        'Maintain all your buyers and suppliers in one centralized directory. Every new invoice or payment receipt automatically updates the client’s running balance and financial statement in real time.',
      icon: Users,
      themeColor: {
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        iconBg: 'bg-indigo-600/10 border-indigo-500/20',
        iconColor: 'text-indigo-600',
        border: 'border-indigo-200',
        gradient: 'from-indigo-600 to-purple-700',
      },
      keyFeatures: [
        {
          title: 'Party GSTIN & State Extraction',
          desc: 'Enter a GSTIN once to automatically populate company legal names, states, and tax codes.',
        },
        {
          title: 'Running Receivable Ledger',
          desc: 'Complete dual-entry ledger history showing exact debits, credits, and unsettled dues.',
        },
        {
          title: '1-Click WhatsApp Follow-ups',
          desc: 'Generate pre-formatted payment reminder messages with statement details and UPI IDs.',
        },
      ],
      visualPreview: (
        <div className="bg-white rounded-2xl p-4 border border-indigo-200 shadow-md space-y-2.5 text-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                TC
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Tiruppur Cotton Mills Ltd</h4>
                <p className="text-[10px] text-slate-500">GST: 33AABCT9988C1Z8 • Tamil Nadu</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              ₹ 42,000 Due
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 text-center">
              <span className="text-[9px] text-slate-500 block">Total Invoiced</span>
              <span className="text-xs font-extrabold text-indigo-900">₹ 2,40,000</span>
            </div>
            <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 text-center">
              <span className="text-[9px] text-slate-500 block">Total Received</span>
              <span className="text-xs font-extrabold text-emerald-900">₹ 1,98,000</span>
            </div>
          </div>
        </div>
      ),
      actionLabel: 'View Customers',
      proTip: 'Save party contact phone numbers with +91 to activate instant 1-click WhatsApp statements.',
    },
    {
      id: 'products',
      tabId: 'products',
      tabName: 'Products',
      stepNumber: 4,
      totalSteps: 5,
      title: 'Product Catalog & HSN Master',
      subtitle: 'Inventory master with pre-configured GST slabs & automatic stock deductions',
      description:
        'Define your catalog of goods and services with HSN/SAC codes, standard measurement units (KGS, NOS, MTR, PCS), and GST tax rates (0%, 5%, 12%, 18%, 28%). Invoices automatically deduct inventory.',
      icon: Package,
      themeColor: {
        badge: 'bg-amber-100 text-amber-800 border-amber-200',
        iconBg: 'bg-amber-600/10 border-amber-500/20',
        iconColor: 'text-amber-600',
        border: 'border-amber-200',
        gradient: 'from-amber-600 to-orange-700',
      },
      keyFeatures: [
        {
          title: 'HSN / SAC Code Mapping',
          desc: 'Ensure compliance with Indian GST regulations for domestic and inter-state trade.',
        },
        {
          title: 'Automated Stock Depletion',
          desc: 'Sales invoices automatically update stock levels and trigger low-inventory alerts.',
        },
        {
          title: 'Multiple Slabs & Unit Types',
          desc: 'Flexible pricing models supporting weight, volume, custom packaging, and services.',
        },
      ],
      visualPreview: (
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-md space-y-2.5 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="text-xs font-bold text-slate-900">Ring Spun Yarn 30s</span>
              <span className="text-[10px] text-slate-500 block">HSN: 5205 • Unit: KGS</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              GST 5%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs bg-amber-50/60 p-2 rounded-xl border border-amber-100">
            <div>
              <span className="text-[10px] text-amber-800 block">Selling Price</span>
              <span className="font-black text-slate-900">₹ 320.00 / KG</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-800 block">In Stock</span>
              <span className="font-black text-emerald-700">1,240 KGS</span>
            </div>
          </div>
        </div>
      ),
      actionLabel: 'Manage Products',
      proTip: 'Setting a low-stock alert count ensures you never run out of critical raw materials or goods.',
    },
    {
      id: 'payments',
      tabId: 'payments',
      tabName: 'Payments & Settings',
      stepNumber: 5,
      totalSteps: 5,
      title: 'Payment Daybook & UPI Setup',
      subtitle: 'Dynamic UPI QR codes, authorized signature & dual-entry cashbook',
      description:
        'Configure your official business credentials, bank details, and UPI ID in Settings. Invoices will automatically render dynamic scan-to-pay QR codes, and receipts can be logged in the Payment Daybook.',
      icon: CreditCard,
      themeColor: {
        badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
        iconBg: 'bg-cyan-600/10 border-cyan-500/20',
        iconColor: 'text-cyan-600',
        border: 'border-cyan-200',
        gradient: 'from-cyan-600 to-blue-700',
      },
      keyFeatures: [
        {
          title: 'Dynamic Scan-to-Pay QR',
          desc: 'Buyers can scan the printed bill on Google Pay, PhonePe, or Paytm for zero-friction payments.',
        },
        {
          title: 'Dual-Entry Daybook',
          desc: 'Record cash, UPI, NEFT, and Cheque receipts with automatic invoice status reconciliation.',
        },
        {
          title: 'Digital Signature & Stamp',
          desc: 'Personalize invoices with your authorized signatory stamp and customized legal terms.',
        },
      ],
      visualPreview: (
        <div className="bg-white rounded-2xl p-4 border border-cyan-200 shadow-md space-y-2.5 text-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-7 h-7 text-blue-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Instant Settlement</span>
                <span className="text-xs font-black text-slate-900">Scan & Pay via UPI</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Verified
            </span>
          </div>
          <div className="text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-slate-600">UPI VPA:</span>
            <span className="font-mono font-bold text-blue-700">hytexcotton@sbi</span>
          </div>
        </div>
      ),
      actionLabel: 'Open Daybook',
      proTip: 'Verify your UPI ID in Settings so your customers can scan and pay you immediately.',
    },
  ];

  const currentStep = steps[currentStepIndex];

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex((prev) => prev - 1);
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      KannakuDB.setTourCompleted(userIdOrTenantId, true);
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToTab = () => {
    if (currentStep.tabId) {
      if (dontShowAgain) {
        KannakuDB.setTourCompleted(userIdOrTenantId, true);
      }
      onNavigateTab(currentStep.tabId);
      onClose();
    }
  };

  const StepIcon = currentStep.icon;

  return (
    <div
      id="workspace-tour-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className="bg-white text-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-modal-title"
      >
        {/* Header with Step Carousel Tabs */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                  Interactive Workspace Tour
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {currentStep.stepNumber} of {currentStep.totalSteps}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Learn the core workflows for real production billing
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Step Carousel Navigation Pills */}
        <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs scale-102'
                    : isCompleted
                    ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                )}
                <span>{step.tabName}</span>
              </button>
            );
          })}
        </div>

        {/* Carousel Slide Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {/* Headline and icon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl border ${currentStep.themeColor.iconBg} ${currentStep.themeColor.iconColor} ${currentStep.themeColor.border} flex items-center justify-center shrink-0 shadow-xs`}
              >
                <StepIcon className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span
                  className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${currentStep.themeColor.badge}`}
                >
                  Step {currentStep.stepNumber}: {currentStep.tabName}
                </span>
                <h2 id="tour-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentStep.title}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-blue-600">
                  {currentStep.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {currentStep.description}
          </p>

          {/* 2-Column Split: Key Features vs Live Preview Simulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Key Features */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Core Capabilities:</span>
              </div>
              <div className="space-y-2.5">
                {currentStep.keyFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 font-bold block">{feat.title}</strong>
                      <span className="text-slate-600 leading-snug">{feat.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Visual Preview */}
            <div className="lg:col-span-5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Visual Workflow Preview:
              </span>
              {currentStep.visualPreview}
            </div>
          </div>

          {/* Pro-Tip Box */}
          {currentStep.proTip && (
            <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-950 shadow-2xs">
              <span className="font-extrabold uppercase text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded shrink-0">
                Pro Tip
              </span>
              <span className="leading-snug">{currentStep.proTip}</span>
            </div>
          )}
        </div>

        {/* Footer Navigation & Persistent Preference */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Previous & Jump-to-tab */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                currentStepIndex === 0
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleJumpToTab}
              className="px-3.5 py-2 bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <span>{currentStep.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Don't show again checkbox & Next/Finish button */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span>Don't show on startup</span>
            </label>

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Finish & Start Billing' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
