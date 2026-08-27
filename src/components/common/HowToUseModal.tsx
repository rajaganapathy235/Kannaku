import React, { useState } from 'react';
import {
  BookOpen,
  Building,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileCheck,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Package,
  Printer,
  QrCode,
  Share2,
  Sparkles,
  Truck,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onLoadDemoData?: () => void;
  onClearData?: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onLoadDemoData,
  onClearData,
}) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'billing' | 'prints' | 'ledgers' | 'faq'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                How to Use Kannaku GST Billing
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  Quick Guide
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Step-by-step instructions to issue GST tax invoices, manage party ledgers & print bills
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 bg-slate-50 overflow-x-auto no-scrollbar">
          {[
            { id: 'quickstart', label: '🚀 4-Step Quick Start' },
            { id: 'billing', label: '🧾 Creating Invoices & GST' },
            { id: 'prints', label: '🖨️ Formats & Thermal Print' },
            { id: 'ledgers', label: '📒 Daybook & Party Ledgers' },
            { id: 'faq', label: '💡 FAQs & Pro Tips' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {activeSection === 'quickstart' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold">Welcome to your new workspace!</span> Everything is connected to your live Cloudflare database. Follow these 4 simple steps to issue your first official GST invoice in under 2 minutes.
                </div>
              </div>

              {/* 4 Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-extrabold rounded-md">
                        STEP 1
                      </span>
                      <Building className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Setup Company & GST Profile</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Enter your Business Name, GSTIN, Address, Bank Account, IFSC, and UPI ID for automatic dynamic QR codes.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('settings');
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-blue-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Open Company Settings</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-extrabold rounded-md">
                        STEP 2
                      </span>
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Add Clients & Suppliers</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Add your customer details (Name, Mobile, State, GSTIN). State determines whether CGST+SGST or IGST applies.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('customers');
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-indigo-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Add First Customer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold rounded-md">
                        STEP 3
                      </span>
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Add Items & Inventory</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Add products or services with HSN/SAC code, Sale Price, Unit (Nos, Kg, Mtr), and GST slab rate (0%, 5%, 12%, 18%, 28%).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('products');
                    }}
                    className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Add Catalog Items</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 4 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-[11px] font-extrabold rounded-md">
                        STEP 4
                      </span>
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Create Tax Bill & Share</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Generate official Tax Invoices or Estimates. Print in Tally ERP V4 format or send directly on WhatsApp with 1 click.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab('create_invoice');
                    }}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Create Tax Invoice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">GST Billing & Tax Calculation Rules</h3>
              
              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">1. Intra-State vs Inter-State GST</h4>
                  <p>
                    • If the client's State is the <strong>same</strong> as your company state (e.g. Tamil Nadu 33), the system automatically divides tax into <strong>CGST (half) + SGST (half)</strong>.<br />
                    • If the client is in a <strong>different state</strong> (e.g. Maharashtra 27), the system automatically applies <strong>IGST (full)</strong>.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">2. Tax Invoices vs Estimates / Quotations</h4>
                  <p>
                    • <strong>Tax Invoice</strong>: Official GST legal document. Deducts stock inventory and posts debits to the customer ledger.<br />
                    • <strong>Quotation / Estimate</strong>: Non-financial quotation document. Does NOT affect accounting balances until you click "Convert to Invoice".
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">3. Dynamic UPI Payment QR Code</h4>
                  <p>
                    Every invoice dynamically generates an NPCI-compliant UPI payment QR code encoding your VPA ID and the exact invoice balance due, allowing your clients to scan and pay instantly with Google Pay, PhonePe, or Paytm with zero transaction fees.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'prints' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Printing & Document Templates</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>Tally V4 Classic Format</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Industry standard boxed layout with HSN summary table, bank details box, terms, digital stamp, and signature.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Modern Minimalist A4</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Clean, contemporary typography with colored header band, barcode, and dedicated client address card.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-emerald-600" />
                    <span>Thermal POS (3-Inch)</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Optimized for 80mm thermal receipt roll printers used in retail counters and instant shop billing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'ledgers' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Party Ledgers & Daybook Reconciliation</h3>
              
              <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">Double-Entry Ledger Tracking</h4>
                  <p>
                    When you create a sales invoice of ₹50,000 with ₹30,000 paid via UPI:
                    <br />• A <strong>Debit entry</strong> of ₹50,000 is automatically posted to the party ledger.
                    <br />• A <strong>Credit entry</strong> of ₹30,000 is posted for the payment received.
                    <br />• Outstanding balance is automatically updated to ₹20,000 in real-time.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">1-Click WhatsApp Payment Reminders</h4>
                  <p>
                    From the Dashboard or Client Ledger, click the <strong>"WhatsApp Reminder"</strong> button to send a pre-formatted payment notice with your UPI ID directly to the customer's phone.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'faq' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-900 mb-1">Q: Where is my data saved?</h4>
                <p className="text-slate-600">
                  Your workspace utilizes instant local persistence with synchronized Cloudflare D1 SQL relational storage for maximum speed and security.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-900 mb-1">Q: Can I backup or export my data?</h4>
                <p className="text-slate-600">
                  Yes. Go to <strong>Settings → Data Backup & Restore</strong> to download your entire JSON database or import past backups at any time.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="font-bold text-slate-900 mb-1">Q: Can I test with sample data first?</h4>
                <p className="text-slate-600">
                  Yes! Use the controls below to load sample demo records for testing, or clear all data to start with a fresh clean workspace.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onLoadDemoData && (
              <button
                onClick={() => {
                  if (window.confirm('Load sample invoices, clients, and items to test the system?')) {
                    onLoadDemoData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Load Sample Demo Data
              </button>
            )}

            {onClearData && (
              <button
                onClick={() => {
                  if (window.confirm('Reset all invoices, clients, products and payments to a clean slate?')) {
                    onClearData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Reset to Clean Slate
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Got It, Start Billing →
          </button>
        </div>

      </div>
    </div>
  );
};
