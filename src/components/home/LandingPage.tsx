import React, { useState } from 'react';
import {
  FileText,
  Users,
  Package,
  Wallet,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Printer,
  QrCode,
  Shield,
  Clock,
  Sparkles,
  Smartphone,
  ChevronDown,
  Building2,
  Check,
  Zap,
  Truck,
  FileCheck2,
  Play,
  Lock,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { AuthSession } from '../../types/auth';
import { LegalModal, LegalDocType } from './LegalModal';

interface LandingPageProps {
  onStartTrial: () => void;
  onSignIn: () => void;
  onEnterDemoApp: () => void;
  onOpenSuperAdmin: () => void;
  session: AuthSession | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial,
  onSignIn,
  onEnterDemoApp,
  onOpenSuperAdmin,
  session,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('terms');

  const openLegal = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setLegalModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-brand-600 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <img
              src="/logo-horizontal.svg"
              alt="JustGST"
              className="w-auto object-contain shrink-0"
              style={{ height: '40px', minHeight: '36px' }}
            />
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="#templates" className="hover:text-brand-600 transition-colors">
              Print Formats
            </a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">
              Pricing Plans
            </a>
            <a href="#faq" className="hover:text-brand-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {session ? (
              <button
                onClick={onEnterDemoApp}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onStartTrial}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>14-Day Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Hero Brand Showcase */}
          <div className="flex justify-center pb-1">
            <div className="inline-flex items-center p-3 sm:p-4 rounded-3xl bg-white border border-slate-200 shadow-md shadow-slate-200/60">
              <img
                src="/logo-horizontal.svg"
                alt="JustGST"
                className="w-auto object-contain"
                style={{ height: '64px', minHeight: '56px' }}
              />
            </div>
          </div>

          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs text-brand-800 font-medium shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Complete Indian GST Invoicing & Accounting Suite</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            GST Billing Made Fast,{' '}
            <span className="text-brand-600">Accurate, and Effortless.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create professional GST tax invoices, auto-calculate CGST, SGST, and IGST splits, collect payments via Dynamic UPI QR codes, manage inventory stock, and track client balance ledgers.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartTrial}
              className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterDemoApp}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Play className="w-4 h-4 text-brand-600 fill-brand-600" />
              <span>Explore Live Workspace</span>
            </button>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% CBIC GST Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Direct-to-Bank UPI QR</span>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="pt-8">
            <div className="rounded-2xl bg-white border border-slate-200 p-3 sm:p-5 shadow-xl shadow-slate-200/50 text-left">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <span className="text-[11px] font-mono text-slate-400 pl-2">
                    app.justgst.in/workspace
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  Hytex Cotton Mills & Trading
                </span>
              </div>

              {/* Mini Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-semibold">Total Revenue</div>
                  <div className="text-base font-black text-slate-900 font-mono">₹14,88,500</div>
                  <div className="text-[10px] text-emerald-600 font-bold">This Month</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-semibold">GST Collected</div>
                  <div className="text-base font-black text-brand-600 font-mono">₹2,27,240</div>
                  <div className="text-[10px] text-slate-500">CGST + SGST</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-semibold">Pending Dues</div>
                  <div className="text-base font-black text-amber-600 font-mono">₹3,45,000</div>
                  <div className="text-[10px] text-amber-700 font-semibold">Party Ledgers</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 font-semibold">Inventory Items</div>
                  <div className="text-base font-black text-slate-800 font-mono">42 Active SKUs</div>
                  <div className="text-[10px] text-emerald-600">Stock Monitored</div>
                </div>
              </div>

              {/* Sample Invoice List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Recent Tax Invoices</span>
                  <span className="text-[11px] text-brand-600 font-medium">Auto Place-of-Supply IGST/CGST</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>INV/2026/089</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          PAID
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Sri Lakshmi Apparels (Tamil Nadu • 33)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-slate-900">₹1,84,500</div>
                      <div className="text-[10px] text-slate-500">GST: ₹28,144 (18%)</div>
                    </div>
                  </div>

                  <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>INV/2026/088</span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">
                          PARTIAL
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Karnataka Yarns Corp (Karnataka • 29)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-slate-900">₹3,20,000</div>
                      <div className="text-[10px] text-amber-600 font-medium">IGST (Inter-State): ₹48,813</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's in the App Section */}
      <section id="features" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Built-In Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Everything Inside Your JustGST Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A cohesive suite of tools designed strictly for real-world day-to-day trade operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1: Invoicing */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">GST Tax Invoices & Estimates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create GST invoices with automatic CGST, SGST, or IGST tax splits based on customer state codes and HSN catalog.
            </p>
          </div>

          {/* Module 2: Dynamic UPI QR */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Dynamic UPI QR on Invoices</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates an instant NPCI QR code printed on every bill so customers can pay directly to your bank account via BHIM, GPay, Paytm, or any UPI app.
            </p>
          </div>

          {/* Module 3: Client & Supplier Ledgers */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Customer & Supplier Ledgers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track outstanding balances, payment histories, and dispatch balance reminders directly to client WhatsApp numbers in 1 click.
            </p>
          </div>

          {/* Module 4: Inventory & Stock */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Inventory & Low-Stock Alerts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Catalog your products with HSN codes, cost rates, and tax rates. Invoices automatically update your stock count with low-stock warnings.
            </p>
          </div>

          {/* Module 5: Payment Records */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Payment Reconciliation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record payments across UPI, Bank NEFT/RTGS, Cheque, and Cash. Invoices automatically transition between Paid, Partial, and Unpaid.
            </p>
          </div>

          {/* Module 6: GST Reports & Daybook */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">GSTR-1 Reports & Daybook</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate ready-to-file GSTR-1 sales breakdowns, HSN summaries, and daily cashflow logs with exportable CSV / Excel sheets.
            </p>
          </div>
        </div>
      </section>

      {/* Print Formats Section */}
      <section id="templates" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Print Formats
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pre-Configured Print & PDF Layouts
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Choose the format that suits your business printer and delivery workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Format 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="aspect-[4/3] rounded-xl bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-2xs">
                <div className="flex justify-between items-center text-[10px] font-bold text-brand-600">
                  <span>TAX INVOICE</span>
                  <span className="text-slate-400 font-mono">Original</span>
                </div>
                <div className="text-center py-2 space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">Modern A4 Color Accent</div>
                  <div className="text-[10px] text-slate-500">With Dynamic UPI QR & Signature</div>
                </div>
                <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-1 flex justify-between font-mono">
                  <span>HSN Tax Summary</span>
                  <span>A4 Desktop PDF</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Modern A4 Tax Invoice</h4>
              <p className="text-xs text-slate-500">
                Standard full-page format for corporate clients, wholesalers, and manufacturers.
              </p>
            </div>

            {/* Format 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="aspect-[4/3] rounded-xl bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-2xs">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-800">
                  <span>CLASSIC CORPORATE</span>
                  <span className="text-slate-400 font-mono">Duplicate</span>
                </div>
                <div className="text-center py-2 space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">Structured Grid & Terms</div>
                  <div className="text-[10px] text-slate-500">Bank IFSC & Transporter Copy</div>
                </div>
                <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-1 flex justify-between font-mono">
                  <span>Authorized Signatory</span>
                  <span>Formal Border</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Classic Corporate Layout</h4>
              <p className="text-xs text-slate-500">
                Structured black & white border format with complete payment terms and declarations.
              </p>
            </div>

            {/* Format 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="aspect-[4/3] rounded-xl bg-white border border-slate-200 p-4 flex flex-col justify-between shadow-2xs">
                <div className="flex justify-between items-center text-[10px] font-bold text-amber-600">
                  <span>THERMAL POS (80mm)</span>
                  <span className="text-slate-400 font-mono">Receipt</span>
                </div>
                <div className="text-center py-2 space-y-0.5">
                  <div className="text-xs font-bold text-slate-800">Fast Roll Checkout</div>
                  <div className="text-[10px] text-slate-500">High-speed counter printing</div>
                </div>
                <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-1 flex justify-between font-mono">
                  <span>ESC/POS Compact</span>
                  <span>Counter Slip</span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-slate-900">Thermal POS 80mm Roll</h4>
              <p className="text-xs text-slate-500">
                Optimized for retail counters, billing desks, and compact thermal receipt rolls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Verified with SubscriptionView rates) */}
      <section id="pricing" className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Clear, Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            JustGST All-in-One Pro Subscription
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            No hidden tiers or locked features. All plans include 100% of GST invoicing, WhatsApp sharing, stock tracking, and print layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* 1 Month */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-800">1 Month Duration</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Flexible monthly billing</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 font-mono">₹99</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>

              <div className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited GST Invoices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All 6 Print Formats & Thermal POS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dynamic UPI QR Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Client & Supplier Ledger</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartTrial}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* 6 Months */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              Save 20%
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-brand-700">6 Months (Semi-Annual)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Billed ₹474 every 6 months</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-brand-600 font-mono">₹79</span>
                <span className="text-xs text-slate-500">/ month (₹474 total)</span>
              </div>

              <div className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited GST Invoices</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Inventory & Low-Stock Alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>GSTR-1 Excel Tax Breakdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp Invoice Dispatch</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartTrial}
              className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-brand-200"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* 12 Months (Best Value) */}
          <div className="p-6 rounded-2xl bg-white border-2 border-brand-600 shadow-md flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              Save 50% • Best Value
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-900">12 Months (Annual Plan)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Billed ₹588 annually</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-emerald-600 font-mono">₹49</span>
                <span className="text-xs text-slate-500">/ month (₹588 total)</span>
              </div>

              <div className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">1 Full Year of Uninterrupted Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All Invoicing, Inventory & Reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Priority Updates & Continuous Backups</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-Device Browser Access</span>
                </div>
              </div>
            </div>

            <button
              onClick={onStartTrial}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              Claim 14-Day Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does JustGST handle GST calculation for different states?',
                a: 'JustGST automatically compares your company state code with your client state code. If they are in the same state, it calculates CGST + SGST. If in different states, it automatically routes to IGST.',
              },
              {
                q: 'How does the Dynamic UPI QR Code work on printed bills?',
                a: 'Each invoice generates an official NPCI UPI QR code stamped with your UPI VPA and the exact invoice balance. When your customer scans it via any UPI app (BHIM, Google Pay, Paytm, etc.), the payment goes directly into your bank account with zero gateway commissions.',
              },
              {
                q: 'Can I print invoices on thermal printers?',
                a: 'Yes. In addition to standard A4 Color and Classic Corporate formats, JustGST includes a dedicated 80mm Thermal POS slip format for instant counter receipt printing.',
              },
              {
                q: 'What happens after the 14-day free trial?',
                a: 'You can choose between the 1-Month (₹99), 6-Month (₹474), or 12-Month (₹588) subscription period. All data and invoices you created during the trial are preserved.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-3.5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:text-brand-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Gateway-Compliant Footer */}
      <footer className="border-t border-slate-200 bg-white text-xs text-slate-600">
        {/* Gateway & Trust Assurance Strip */}
        <div className="border-b border-slate-200 bg-slate-50/80 py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Trust Badge 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    PCI-DSS &amp; RBI Compliant Payments
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Instant UPI, Cards &amp; NetBanking via RBI authorized gateways
                  </div>
                </div>
              </div>

              {/* Trust Badge 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    256-Bit SSL Bank-Grade Encryption
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Your financial and GST data is encrypted at rest &amp; in transit
                  </div>
                </div>
              </div>

              {/* Trust Badge 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    14-Day Free Trial &amp; 7-Day Refund Policy
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Zero risk, transparent pricing with instant cloud provisioning
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bottom Copyright & Fast Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>
              © {new Date().getFullYear()} JustGST. All Rights Reserved. Made in India.
            </p>
            <div className="flex items-center gap-4 text-slate-500 font-medium">
              <button
                onClick={() => openLegal('terms')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                Terms
              </button>
              <span>•</span>
              <button
                onClick={() => openLegal('privacy')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <span>•</span>
              <button
                onClick={() => openLegal('refund')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                Refunds
              </button>
              <span>•</span>
              <button
                onClick={() => openLegal('shipping')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                Shipping
              </button>
              <span>•</span>
              <button
                onClick={onOpenSuperAdmin}
                className="hover:text-brand-600 transition-colors cursor-pointer font-semibold"
              >
                SuperAdmin
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialDoc={activeLegalDoc}
      />
    </div>
  );
};
