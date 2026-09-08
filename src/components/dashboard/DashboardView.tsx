import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck,
  FilePlus,
  FileText,
  HelpCircle,
  Package,
  Plus,
  PlusCircle,
  Printer,
  QrCode,
  Share2,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  Client,
  CompanyProfile,
  Invoice,
  InvoiceType,
  PaymentLedgerEntry,
  Product,
} from '../../types';
import { formatNumberIndian } from '../../utils/numberToWords';

interface DashboardViewProps {
  company: CompanyProfile;
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
  payments: PaymentLedgerEntry[];
  onNewInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onNavigateTab: (tab: any) => void;
  onOpenQuickPayment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  company,
  invoices,
  clients,
  products,
  payments,
  onNewInvoice,
  onViewInvoice,
  onNavigateTab,
  onOpenQuickPayment,
}) => {
  const [transactionTimeframe, setTransactionTimeframe] = useState<'week' | 'all'>('week');

  // Financial Calculations
  const safeInvoices = Array.isArray(invoices) ? invoices : [];
  const salesInvoices = safeInvoices.filter((i) => i.invoiceType === InvoiceType.SALES);
  const totalSales = salesInvoices.reduce((acc, i) => acc + (i.calc?.billFigure || 0), 0);
  const totalGstCollected = salesInvoices.reduce(
    (acc, i) => acc + (i.calc?.taxAmount || 0),
    0
  );
  const totalReceived = payments
    .filter((p) => p.type === 'credit')
    .reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalOutstandingDue = salesInvoices.reduce(
    (acc, i) => acc + (i.calc?.dueAmount || 0),
    0
  );

  const lowStockProducts = products.filter(
    (p) => p.currentStock <= p.minStockAlert
  );

  const recentInvoices = [...safeInvoices]
    .sort(
      (a, b) =>
        new Date(b.createdOn || b.date || 0).getTime() -
        new Date(a.createdOn || a.date || 0).getTime()
    )
    .slice(0, 6);

  const partiesWithDues = clients
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 4);

  const isCleanSlate = invoices.length === 0 && clients.length === 0 && products.length === 0;

  const handleSendReminderWhatsApp = (client: Client) => {
    const rawPhone = client.mobile ? client.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = `*Payment Reminder from ${company.name}*\nDear *${client.name}*,\nYour outstanding balance is *Rs. ${formatNumberIndian(client.balance)}*.\nKindly clear the dues via UPI: *${company.bankDetail.upiId}* or Bank Transfer.\nThank you!`;
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 4 Financial KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Total Sales Revenue
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{formatNumberIndian(totalSales)}
          </div>
          <div className="text-emerald-600 text-xs mt-2 flex items-center gap-1 font-semibold">
            <span>▲ Active Sales Total</span>
          </div>
        </div>

        {/* Unpaid Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Total Outstanding
          </div>
          <div className="text-2xl font-black font-mono text-rose-600">
            ₹{formatNumberIndian(totalOutstandingDue)}
          </div>
          <div className="text-slate-500 text-xs mt-2 font-medium">
            {partiesWithDues.length} Pending Client Accounts
          </div>
        </div>

        {/* GST Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            GST Collected
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            ₹{formatNumberIndian(totalGstCollected)}
          </div>
          <div className="text-slate-500 text-xs mt-2 font-medium">
            CGST & SGST Output Tax
          </div>
        </div>

        {/* Active Clients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
            Registered Parties
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {clients.length}
          </div>
          <div className="text-brand-600 text-xs mt-2 font-semibold">
            {clients.filter((c) => c.clientType === 'customer').length} Clients • {clients.filter((c) => c.clientType === 'supplier').length} Suppliers
          </div>
        </div>
      </div>

      {/* Quick Access Module Navigation Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            label: 'Tax Invoices',
            icon: FileText,
            action: () => onNavigateTab('invoices'),
          },
          {
            label: 'Client Parties',
            icon: Users,
            action: () => onNavigateTab('customers'),
          },
          {
            label: 'Suppliers',
            icon: Truck,
            action: () => onNavigateTab('suppliers'),
          },
          {
            label: 'Stock Inventory',
            icon: Package,
            action: () => onNavigateTab('products'),
          },
          {
            label: 'Ledger Records',
            icon: Wallet,
            action: () => onNavigateTab('payments'),
          },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors text-left group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-brand-50 text-brand-600 shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500">Real-time GST billing records</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTransactionTimeframe('week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                transactionTimeframe === 'week'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTransactionTimeframe('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                transactionTimeframe === 'all'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => onNavigateTab('invoices')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 px-2 py-1"
            >
              View Full Register →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-bold text-slate-600 text-xs">Invoice #</th>
                <th className="px-6 py-3.5 font-bold text-slate-600 text-xs">Client Name</th>
                <th className="px-6 py-3.5 font-bold text-slate-600 text-xs">Date</th>
                <th className="px-6 py-3.5 font-bold text-slate-600 text-xs text-right">Tax (GST)</th>
                <th className="px-6 py-3.5 font-bold text-slate-600 text-xs text-right">Amount</th>
                <th className="px-6 py-3.5 font-bold text-slate-600 text-xs text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                    No invoices recorded yet. Click "+ New Invoice" to create your first tax invoice.
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onViewInvoice(inv)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold font-mono text-brand-600 text-xs">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-semibold text-xs">
                      {inv.clientSnapshot?.name || 'Cash Customer'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                      {inv.date || ''}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 font-mono text-xs">
                      ₹{formatNumberIndian(inv.calc?.taxAmount || 0)}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 font-mono text-sm">
                      ₹{formatNumberIndian(inv.calc?.billFigure || 0)}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                        title="Print / View Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dues and Inventory Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outstanding Client Balances */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Outstanding Client Dues</h3>
              <p className="text-xs text-slate-500">Pending balances with WhatsApp reminder trigger</p>
            </div>
            <button
              onClick={() => onNavigateTab('customers')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              All Clients
            </button>
          </div>

          <div className="space-y-3">
            {partiesWithDues.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                All client balances are fully cleared!
              </p>
            ) : (
              partiesWithDues.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {c.name}
                    </div>
                    <div className="text-xs text-rose-600 font-mono font-bold">
                      ₹{formatNumberIndian(c.balance)} outstanding
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendReminderWhatsApp(c)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp Reminder</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Inventory & Stock Watch</h3>
              <p className="text-xs text-slate-500">Items nearing minimum reorder threshold</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              Manage Stock
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-emerald-700 py-4 text-center bg-emerald-50 border border-emerald-200 rounded-xl font-semibold">
              ✓ All catalog items have healthy inventory stock levels!
            </p>
          ) : (
            <div className="space-y-2.5">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{p.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">HSN: {p.hsnCode}</div>
                  </div>
                  <span className="font-mono font-bold text-rose-600 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                    {p.currentStock} {p.unit} remaining
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
