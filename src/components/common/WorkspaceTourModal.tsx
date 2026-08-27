import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Compass,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Layers,
  Package,
  QrCode,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { NavTab } from '../layout/Sidebar';

interface TourStep {
  id: string;
  tabId?: NavTab;
  badge: string;
  title: string;
  headline: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  keyFeatures: string[];
  actionLabel?: string;
  tip?: string;
}

interface WorkspaceTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onNewInvoice?: () => void;
}

export const WorkspaceTourModal: React.FC<WorkspaceTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNewInvoice,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: TourStep[] = [
    {
      id: 'dashboard',
      tabId: 'dashboard',
      badge: 'Step 1 of 7 • Overview',
      title: 'Executive Financial Dashboard',
      headline: 'Real-time sales, tax collection & outstanding dues at a glance',
      description:
        'Your command center provides instant visibility into total revenue, collected CGST/SGST/IGST, pending receivable balances, and recent invoice activity.',
      icon: BarChart3,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      keyFeatures: [
        'Live calculation of total sales and tax liabilities',
        'Party balance leaderboard with 1-click WhatsApp payment reminders',
        'Recent tax invoices quick-view and print status',
        'Stock alert notifications for low-inventory items',
      ],
      actionLabel: 'Go to Dashboard',
      tip: 'Click any metric card or recent invoice to drill directly into detailed records.',
    },
    {
      id: 'invoices',
      tabId: 'invoices',
      badge: 'Step 2 of 7 • Core Billing',
      title: 'GST Tax Invoicing & Smart Calculations',
      headline: 'Generate compliant B2B & B2C tax invoices in seconds',
      description:
        'Automates GST state-code recognition (33-Tamil Nadu, 29-Karnataka, etc.) to instantly calculate Intra-State (CGST + SGST) or Inter-State (IGST) taxes.',
      icon: FileText,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      keyFeatures: [
        'Compliant GST tax bills with HSN summaries and reverse charge options',
        'Multiple print formats: Standard GST, Tally V4 boxed, and 80mm POS thermal receipts',
        'Direct WhatsApp sharing with custom pre-filled payment links',
        'Instant conversion from Quotations or Purchase orders',
      ],
      actionLabel: 'Explore Invoices Tab',
      tip: 'Use the "+ New Invoice" button in the top bar from any screen to bill instantly.',
    },
    {
      id: 'quotations',
      tabId: 'invoices',
      badge: 'Step 3 of 7 • Estimates',
      title: 'Quotations & Proforma Estimates',
      headline: 'Send polished cost estimates and convert to invoices in 1 click',
      description:
        'Create professional price quotations with tax estimates for prospective buyers. When the client approves, convert the quotation directly into a tax invoice without re-entering items.',
      icon: FileSpreadsheet,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      keyFeatures: [
        'Formal quotation numbering (e.g. QUO/2026/001)',
        'Custom validity periods, payment milestones, and terms',
        '1-click conversion to finalized GST Tax Invoice',
        'Customer-ready PDF/print downloads with digital authorization',
      ],
      actionLabel: 'View Quotations',
      tip: 'Converting an approved quote automatically synchronizes item stock and customer balances.',
    },
    {
      id: 'customers',
      tabId: 'customers',
      badge: 'Step 4 of 7 • CRM & Ledger',
      title: 'Clients, Parties & Receivable Ledgers',
      headline: 'Complete party directory with real-time balance tracking',
      description:
        'Manage customer profiles, billing addresses, and shipping locations. Every invoice and payment automatically updates the client’s balance in real time.',
      icon: Users,
      iconColor: 'text-indigo-500',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      keyFeatures: [
        'GSTIN validation with automated state code extraction',
        'Running credit/debit balance ledger per party',
        'Instant WhatsApp balance reminder message generator',
        'Customer purchase history and statement exports',
      ],
      actionLabel: 'Manage Clients',
      tip: 'Adding a client once makes them instantly searchable during invoice creation.',
    },
    {
      id: 'products',
      tabId: 'products',
      badge: 'Step 5 of 7 • Inventory',
      title: 'Product Catalog & HSN/SAC Master',
      headline: 'Track inventory, units, prices, and GST tax slabs',
      description:
        'Maintain your inventory with pre-configured GST rates (0%, 5%, 12%, 18%, 28%), standard units (KGS, NOS, MTR, PCS), and low-stock reorder thresholds.',
      icon: Package,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      keyFeatures: [
        'HSN / SAC code classification for GST compliance',
        'Real-time stock deduction on invoice generation',
        'Automated low-stock visual warning badges',
        'Support for service charges, discounts, and custom pricing units',
      ],
      actionLabel: 'Open Products Catalog',
      tip: 'When you create a sales invoice, stock counts automatically reduce in real time.',
    },
    {
      id: 'payments',
      tabId: 'payments',
      badge: 'Step 6 of 7 • Daybook & Cashflow',
      title: 'Payment Daybook & Financial Ledger',
      headline: 'Dual-entry recording for receipts, expenses, and bank transfers',
      description:
        'Keep your books audit-ready. Record client payments against specific invoices, track vendor expenses, and reconcile cash vs bank balances.',
      icon: CreditCard,
      iconColor: 'text-cyan-500',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      keyFeatures: [
        'Dual-entry Daybook ledger with credit & debit entries',
        'Support for Cash, UPI, NEFT, Cheque, and Card receipts',
        'Auto-settlement of invoice pending dues upon receipt logging',
        'Exportable transaction history for accounting review',
      ],
      actionLabel: 'View Payment Daybook',
      tip: 'Recording a receipt automatically updates both the invoice status and the customer balance.',
    },
    {
      id: 'settings',
      tabId: 'settings',
      badge: 'Step 7 of 7 • Business Profile',
      title: 'Company Profile, Branding & Dynamic UPI QR',
      headline: 'Customize business details, digital stamp, signature & scan-to-pay QR',
      description:
        'Set up your official business address, bank credentials, and UPI ID. Every invoice will render your brand logo, legal terms, signature, and an instant scan-to-pay QR code.',
      icon: Building2,
      iconColor: 'text-rose-500',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      keyFeatures: [
        'UPI Scan-to-Pay QR code automatically generated on invoices',
        'Custom invoice prefixes (e.g. INV/2026/, PUR/2026/)',
        'Digital signature and authorized stamp display',
        'Complete data backup & JSON export/restore controls',
      ],
      actionLabel: 'Configure Company Profile',
      tip: 'Verify your UPI ID in Settings so buyers can scan the printed bill and pay immediately.',
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
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToTab = () => {
    if (currentStep.tabId) {
      onNavigateTab(currentStep.tabId);
      onClose();
    }
  };

  const StepIcon = currentStep.icon;

  return (
    <div
      id="workspace-tour-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Step indicator */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Interactive Workspace Tour
              </div>
              <div className="text-xs text-slate-500">
                {currentStepIndex + 1} of {steps.length}: {currentStep.title}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          {steps.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-full flex-1 transition-all duration-300 cursor-pointer ${
                idx <= currentStepIndex ? 'bg-blue-600' : 'bg-transparent'
              } ${idx < steps.length - 1 ? 'border-r border-white/50' : ''}`}
            />
          ))}
        </div>

        {/* Step Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Badge & Title */}
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl border ${currentStep.iconBg} ${currentStep.iconColor} flex items-center justify-center shrink-0 shadow-xs`}
            >
              <StepIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {currentStep.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentStep.title}
              </h2>
              <p className="text-sm font-semibold text-blue-600">
                {currentStep.headline}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Key Capabilities List */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Key Capabilities in This Module:</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {currentStep.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro-Tip Box */}
          {currentStep.tip && (
            <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900">
              <span className="font-extrabold uppercase text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded shrink-0">
                Pro Tip
              </span>
              <span className="leading-snug">{currentStep.tip}</span>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
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

            {currentStep.tabId && (
              <button
                onClick={handleJumpToTab}
                className="px-3.5 py-2 bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <span>{currentStep.actionLabel || 'Jump to Tab'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Skip Tour
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
