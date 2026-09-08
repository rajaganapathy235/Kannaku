import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Edit2,
  ExternalLink,
  FileText,
  Filter,
  LayoutGrid,
  List,
  MessageCircle,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  Truck,
} from 'lucide-react';
import { Client, CompanyProfile, Invoice, PaymentLedgerEntry } from '../../types';
import { formatIndianCurrency, formatNumberIndian } from '../../utils/numberToWords';
import { AddSupplierLedgerEntryModal } from './AddSupplierLedgerEntryModal';
import { SupplierLedgerPrintModal } from './SupplierLedgerPrintModal';
import { InvoicePrintModal } from '../invoice/InvoicePrintModal';

interface SupplierLedgerViewProps {
  party: Client;
  company: CompanyProfile;
  payments: PaymentLedgerEntry[];
  invoices?: Invoice[];
  onBack: () => void;
  onAddEntry: (entry: PaymentLedgerEntry, newBalance: number) => void;
  onEditEntry?: (entry: PaymentLedgerEntry, newBalance: number) => void;
  onDeleteEntry?: (entryId: string, newBalance: number) => void;
  onViewInvoice?: (invoice: Invoice) => void;
  isReadOnly?: boolean;
}

type TimeFilter =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'last_30_days'
  | 'custom';

type TypeFilter = 'all' | 'credit' | 'debit';

export const SupplierLedgerView: React.FC<SupplierLedgerViewProps> = ({
  party,
  company,
  payments,
  invoices = [],
  onBack,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onViewInvoice,
  isReadOnly = false,
}) => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [mobileLayout, setMobileLayout] = useState<'cards' | 'table'>('cards');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PaymentLedgerEntry | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<PaymentLedgerEntry | null>(null);

  // Filter entries for this supplier
  const partyEntries = useMemo(() => {
    return payments.filter(
      (p) =>
        p.partyId === party.id ||
        (p.partyName &&
          p.partyName.toLowerCase() === party.name.toLowerCase() &&
          (!p.partyType || p.partyType === 'supplier'))
    );
  }, [payments, party]);

  // Apply filters and sorting
  const filteredEntries = useMemo(() => {
    const list = partyEntries.filter((entry) => {
      // Type Filter (credit = purchases, debit = payments out)
      if (typeFilter !== 'all' && entry.type !== typeFilter) {
        return false;
      }

      // Time Filters
      if (timeFilter !== 'all') {
        const entryDate = new Date(entry.date);
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (timeFilter === 'today') {
          if (entry.date !== todayStr) return false;
        } else if (timeFilter === 'yesterday') {
          const yest = new Date(now);
          yest.setDate(now.getDate() - 1);
          const yestStr = yest.toISOString().split('T')[0];
          if (entry.date !== yestStr) return false;
        } else if (timeFilter === 'this_week') {
          const startOfWeek = new Date(now);
          const day = startOfWeek.getDay();
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
          startOfWeek.setDate(diff);
          startOfWeek.setHours(0, 0, 0, 0);
          if (entryDate < startOfWeek) return false;
        } else if (timeFilter === 'this_month') {
          if (
            entryDate.getFullYear() !== now.getFullYear() ||
            entryDate.getMonth() !== now.getMonth()
          ) {
            return false;
          }
        } else if (timeFilter === 'last_month') {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          if (entryDate < lastMonth || entryDate > lastMonthEnd) return false;
        } else if (timeFilter === 'this_year') {
          if (entryDate.getFullYear() !== now.getFullYear()) return false;
        } else if (timeFilter === 'last_30_days') {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          thirtyDaysAgo.setHours(0, 0, 0, 0);
          if (entryDate < thirtyDaysAgo) return false;
        } else if (timeFilter === 'custom') {
          if (customStartDate && entry.date < customStartDate) return false;
          if (customEndDate && entry.date > customEndDate) return false;
        }
      }

      // Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesParticular =
          entry.particular && entry.particular.toLowerCase().includes(q);
        const matchesVch = entry.vchNo && entry.vchNo.toLowerCase().includes(q);
        const matchesRef =
          entry.referenceNo && entry.referenceNo.toLowerCase().includes(q);
        const matchesType =
          entry.entryType && entry.entryType.toLowerCase().includes(q);
        const matchesAmount = String(entry.amount).includes(q);
        const matchesNote = entry.note && entry.note.toLowerCase().includes(q);

        if (
          !matchesParticular &&
          !matchesVch &&
          !matchesRef &&
          !matchesType &&
          !matchesAmount &&
          !matchesNote
        ) {
          return false;
        }
      }

      return true;
    });

    // Chronological sort ascending first to compute running payable balance
    const chronological = [...list].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Compute running payable balance:
    // Purchases (Credit) increase what we owe (+), Payments Out (Debit) decrease what we owe (-)
    let running = 0;
    const withRunningBalance = chronological.map((item) => {
      const isCredit = item.type === 'credit';
      const amt = Number(item.amount) || 0;
      if (isCredit) {
        running += amt;
      } else {
        running -= amt;
      }
      return {
        ...item,
        runningBalance: running,
      };
    });

    // Sort according to user preference (descending by date by default)
    if (sortOrder === 'desc') {
      return [...withRunningBalance].reverse();
    }
    return withRunningBalance;
  }, [
    partyEntries,
    typeFilter,
    timeFilter,
    searchQuery,
    customStartDate,
    customEndDate,
    sortOrder,
  ]);

  // Aggregate Metrics for Supplier (Vendor)
  const totalCredits = useMemo(() => {
    return filteredEntries
      .filter((e) => e.type === 'credit')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredEntries]);

  const totalDebits = useMemo(() => {
    return filteredEntries
      .filter((e) => e.type === 'debit')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredEntries]);

  const creditCount = useMemo(
    () => filteredEntries.filter((e) => e.type === 'credit').length,
    [filteredEntries]
  );
  const debitCount = useMemo(
    () => filteredEntries.filter((e) => e.type === 'debit').length,
    [filteredEntries]
  );

  // Net Closing Payable Balance: Credits (Purchases) - Debits (Paid Out)
  const openingBalance = 0;
  const netClosingBalance = openingBalance + totalCredits - totalDebits;
  const isPayable = netClosingBalance >= 0;

  // Format Helpers
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const day = d.getDate().toString().padStart(2, '0');
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  // Find linked invoice/bill
  const findLinkedInvoice = (entry: PaymentLedgerEntry): Invoice | undefined => {
    if (!invoices || invoices.length === 0) return undefined;
    return invoices.find(
      (inv) =>
        (entry.invoiceId && inv.id === entry.invoiceId) ||
        (entry.vchNo && inv.invoiceNumber === entry.vchNo) ||
        (entry.referenceNo && inv.invoiceNumber === entry.referenceNo) ||
        (entry.invoiceNumber && inv.invoiceNumber === entry.invoiceNumber)
    );
  };

  const handleViewInvoiceDirectly = (inv: Invoice) => {
    if (onViewInvoice) {
      onViewInvoice(inv);
    } else {
      setViewingInvoice(inv);
    }
  };

  // WhatsApp Share Entire Statement
  const handleShareWhatsApp = () => {
    const rawPhone = party.mobile ? party.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const message = `*Statement of Account / Supplier Ledger*
━━━━━━━━━━━━━━━━━━━━
🏢 *${company.name}*
GSTIN: ${company.registerNumber} • Ph: ${company.mobile}
📅 Date: ${new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
🚚 *Supplier / Vendor:* ${party.name}
GSTIN: ${party.registerNumber || 'URP'}
📞 Phone: ${party.mobile || 'N/A'}

📊 *Financial Summary:*
• Total Purchases (Credit): ₹${formatNumberIndian(totalCredits)} (${creditCount} bills)
• Total Paid Out (Debit): ₹${formatNumberIndian(totalDebits)} (${debitCount} payments)
• *Closing Balance Payable:* ₹${formatNumberIndian(Math.abs(netClosingBalance))} ${
      isPayable ? 'CR (Payable - Amount Owed)' : 'DR (Advance Paid)'
    }

━━━━━━━━━━━━━━━━━━━━
_Generated via JustGST Ledger_`;

    const encoded = encodeURIComponent(message);
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // WhatsApp Single Entry Receipt
  const handleShareSingleEntryWhatsApp = (entry: PaymentLedgerEntry) => {
    const rawPhone = party.mobile ? party.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const isCredit = entry.type === 'credit';
    const message = `*Transaction Receipt from ${company.name}*
━━━━━━━━━━━━━━━━━━━━
🚚 Supplier: *${party.name}*
📅 Date: ${formatDateDisplay(entry.date)}
🔖 Type: *${entry.entryType || (isCredit ? 'CREDIT / PURCHASE BILL' : 'DEBIT / PAYMENT OUT')}*
🔢 Voucher No: ${entry.vchNo || 'N/A'}
📝 Particulars: ${entry.particular || entry.entryType || 'Supplier Ledger Entry'}
💰 *Amount: ₹${formatNumberIndian(entry.amount)}* (${isCredit ? 'Credit / Purchase' : 'Debit / Paid Out'})
━━━━━━━━━━━━━━━━━━━━
_Generated via JustGST_`;

    const encoded = encodeURIComponent(message);
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Delete Handler
  const confirmDeleteEntry = () => {
    if (!entryToDelete) return;
    const isCredit = entryToDelete.type === 'credit';
    // If we delete a credit (purchase), balance decreases by amount. If we delete a debit (payment), balance increases by amount.
    const delta = isCredit ? -Number(entryToDelete.amount) : Number(entryToDelete.amount);
    const newBalance = (party.balance || 0) + delta;

    if (onDeleteEntry) {
      onDeleteEntry(entryToDelete.id, newBalance);
    }
    setEntryToDelete(null);
  };

  const handleResetFilters = () => {
    setTypeFilter('all');
    setTimeFilter('all');
    setSearchQuery('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const hasActiveFilters =
    typeFilter !== 'all' ||
    timeFilter !== 'all' ||
    searchQuery.trim() !== '' ||
    customStartDate !== '' ||
    customEndDate !== '';

  return (
    <div className="min-h-screen bg-slate-100/60 pb-28 pt-2 sm:pt-4 px-2 sm:px-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <div className="space-y-4">
        {/* 1. Header Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left info */}
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-2 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="Back to Suppliers"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border border-slate-200 flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-600" />
                  Supplier Ledger
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  GSTIN: {party.registerNumber || 'URP'}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-slate-900 truncate mt-0.5 tracking-tight">
                {party.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-medium">
                {party.mobile && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {party.mobile}
                  </span>
                )}
                {party.city && (
                  <span>
                    • {party.city}{party.state ? `, ${party.state}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            <button
              onClick={() => {
                setEditingEntry(null);
                setIsAddModalOpen(true);
              }}
              disabled={isReadOnly}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all ${
                isReadOnly
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print / PDF Statement"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Statement</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
              title="Share Statement via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Three Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Total Purchases (Credit) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Purchases (Credit)
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                ₹{formatNumberIndian(totalCredits)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {creditCount} purchase bill(s)
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <ArrowDownLeft className="w-6 h-6 text-slate-700" />
            </div>
          </div>

          {/* Card 2: Total Paid Out (Debit) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Paid Out (Debit)
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
                ₹{formatNumberIndian(totalDebits)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {debitCount} payment voucher(s)
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Net Payable Closing Balance */}
          <div
            className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between ${
              isPayable
                ? 'bg-rose-50/40 border-rose-200'
                : 'bg-emerald-50/40 border-emerald-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Closing Balance (Payable)
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                    isPayable
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isPayable ? 'CR (Payable)' : 'DR (Advance)'}
                </span>
              </div>
              <div
                className={`text-xl sm:text-2xl font-black font-mono ${
                  isPayable ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                ₹{formatNumberIndian(Math.abs(netClosingBalance))}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isPayable
                  ? 'Amount we owe to supplier'
                  : 'Advance payment made to supplier'}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
                isPayable
                  ? 'bg-rose-100 border-rose-300 text-rose-700'
                  : 'bg-emerald-100 border-emerald-300 text-emerald-700'
              }`}
            >
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 3. Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search bills, voucher #, narration, or amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({partyEntries.length})
              </button>
              <button
                onClick={() => setTypeFilter('credit')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  typeFilter === 'credit'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Credit (Purchases)
              </button>
              <button
                onClick={() => setTypeFilter('debit')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  typeFilter === 'debit'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Debit (Paid Out)
              </button>
            </div>

            {/* Time Filter Select */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:border-brand-600 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_year">This Year</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="custom">Custom Date Range</option>
              </select>

              {/* Mobile Card / Table Layout Toggle (md:hidden) */}
              <div className="flex md:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setMobileLayout('cards')}
                  className={`p-1.5 rounded-lg transition-all ${
                    mobileLayout === 'cards'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setMobileLayout('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    mobileLayout === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Custom Date Range Row if timeFilter === 'custom' */}
          {timeFilter === 'custom' && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
              <span className="font-semibold text-slate-600">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:outline-none focus:border-brand-600"
              />
              <span className="font-semibold text-slate-600">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium text-xs focus:outline-none focus:border-brand-600"
              />
              {(customStartDate || customEndDate) && (
                <button
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4. Ledger Content: Desktop Table & Mobile Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header Meta */}
          <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-2">
              <span>
                Showing {filteredEntries.length} of {partyEntries.length} transaction(s)
              </span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[10px] border border-brand-200">
                  Filtered
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] sm:text-xs text-slate-500">
              Statement of {party.name}
            </span>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-sm text-slate-900">
                No ledger transactions found
              </p>
              <p className="text-xs text-slate-500">
                Try adjusting your filter or record a new purchase bill or payment voucher
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    Reset all filters
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setIsAddModalOpen(true);
                  }}
                  disabled={isReadOnly}
                  className={`text-xs font-bold ${
                    isReadOnly
                      ? 'text-slate-400 opacity-50 cursor-not-allowed'
                      : 'text-emerald-700 hover:underline cursor-pointer'
                  }`}
                >
                  + Add new ledger entry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px] tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3 px-4 w-10 text-center">#</th>
                      <th className="py-3 px-4 w-28">Date</th>
                      <th className="py-3 px-4 w-28">Type</th>
                      <th className="py-3 px-4 w-32">Bill / Ref</th>
                      <th className="py-3 px-4">Particulars & Description</th>
                      <th className="py-3 px-4 text-right w-36 bg-slate-100 text-slate-900">
                        Credit (Purchases)
                      </th>
                      <th className="py-3 px-4 text-right w-36 bg-emerald-50/40 text-emerald-800">
                        Debit (Paid Out)
                      </th>
                      <th className="py-3 px-4 text-right w-36">Payable Balance</th>
                      <th className="py-3 px-4 text-right w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEntries.map((entry, index) => {
                      const isCredit = entry.type === 'credit';
                      const entryBadge =
                        entry.entryType || (isCredit ? 'PURCHASE' : 'PAYMENT');
                      const linkedInv = findLinkedInvoice(entry);

                      return (
                        <tr
                          key={entry.id || index}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                            {formatDateDisplay(entry.date)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                                isCredit
                                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {entryBadge}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {entry.vchNo || entry.referenceNo || linkedInv ? (
                              <div className="flex items-center gap-1.5">
                                {linkedInv ? (
                                  <button
                                    onClick={() => handleViewInvoiceDirectly(linkedInv)}
                                    className="font-mono text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
                                    title="View Linked Bill"
                                  >
                                    <span>{entry.vchNo || linkedInv.invoiceNumber}</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="font-mono text-xs font-semibold text-slate-700">
                                    {entry.vchNo || entry.referenceNo}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5 max-w-sm">
                              <p className="font-semibold text-slate-900 text-xs">
                                {entry.particular || entryBadge}
                              </p>
                              {entry.note && !entry.note.startsWith('{') && (
                                <p className="text-[11px] text-slate-500 leading-snug">
                                  {entry.note}
                                </p>
                              )}
                              {entry.mode && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  via {entry.mode}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Credit Amount (Purchases) */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-xs sm:text-sm bg-slate-50/50 whitespace-nowrap">
                            {isCredit ? (
                              <span>₹{formatNumberIndian(entry.amount)}</span>
                            ) : (
                              <span className="text-slate-300 font-normal">-</span>
                            )}
                          </td>

                          {/* Debit Amount (Paid Out) */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-xs sm:text-sm bg-emerald-50/20 whitespace-nowrap">
                            {!isCredit ? (
                              <span>₹{formatNumberIndian(entry.amount)}</span>
                            ) : (
                              <span className="text-slate-300 font-normal">-</span>
                            )}
                          </td>

                          {/* Running Balance */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            {entry.runningBalance !== undefined ? (
                              <div className="flex items-center justify-end gap-1">
                                <span>
                                  ₹{formatNumberIndian(Math.abs(entry.runningBalance))}
                                </span>
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                    entry.runningBalance >= 0
                                      ? 'text-slate-800 bg-slate-100'
                                      : 'text-emerald-700 bg-emerald-50'
                                  }`}
                                >
                                  {entry.runningBalance >= 0 ? 'CR' : 'DR'}
                                </span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>

                          {/* Row Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleShareSingleEntryWhatsApp(entry)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Share Receipt on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingEntry(entry);
                                  setIsAddModalOpen(true);
                                }}
                                disabled={isReadOnly}
                                title={isReadOnly ? 'Action disabled in read-only mode' : 'Edit Entry'}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isReadOnly
                                    ? 'text-slate-300 opacity-50 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer'
                                }`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEntryToDelete(entry)}
                                disabled={isReadOnly}
                                title={isReadOnly ? 'Action disabled in read-only mode' : 'Delete Entry'}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isReadOnly
                                    ? 'text-slate-300 opacity-50 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900">
                    <tr>
                      <td colSpan={5} className="py-3 px-4 text-right uppercase text-[11px]">
                        Totals:
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                        ₹{formatNumberIndian(totalCredits)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 text-sm">
                        ₹{formatNumberIndian(totalDebits)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                        ₹{formatNumberIndian(Math.abs(netClosingBalance))}{' '}
                        <span className="text-xs font-bold">
                          {isPayable ? 'CR' : 'DR'}
                        </span>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* MOBILE VIEW (md:hidden) */}
              <div className="md:hidden">
                {mobileLayout === 'cards' ? (
                  /* Mobile Card List */
                  <div className="divide-y divide-slate-100">
                    {filteredEntries.map((entry, index) => {
                      const isCredit = entry.type === 'credit';
                      const entryBadge =
                        entry.entryType || (isCredit ? 'PURCHASE' : 'PAYMENT');
                      const linkedInv = findLinkedInvoice(entry);

                      return (
                        <div
                          key={entry.id || index}
                          className="p-3.5 sm:p-4 space-y-2.5 hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Card Top Row: Date, Badge, Voucher */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-slate-800">
                                {formatDateDisplay(entry.date)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  isCredit
                                    ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {entryBadge}
                              </span>
                              {entry.vchNo && (
                                <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  #{entry.vchNo}
                                </span>
                              )}
                            </div>

                            {/* Amount Display */}
                            <div className="text-right shrink-0">
                              <div
                                className={`font-mono font-black text-sm ${
                                  isCredit ? 'text-slate-900' : 'text-emerald-700'
                                }`}
                              >
                                {isCredit ? '+' : '-'} ₹{formatNumberIndian(entry.amount)}
                              </div>
                              <span
                                className={`text-[10px] font-bold ${
                                  isCredit ? 'text-slate-600' : 'text-emerald-600'
                                }`}
                              >
                                {isCredit ? 'Credit (Purchases)' : 'Debit (Paid Out)'}
                              </span>
                            </div>
                          </div>

                          {/* Particulars & Narration */}
                          <div className="text-xs text-slate-800 font-medium leading-relaxed">
                            {entry.particular || entryBadge}
                            {entry.note && !entry.note.startsWith('{') && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {entry.note}
                              </p>
                            )}
                          </div>

                          {/* Card Footer: Running Balance & Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            {/* Running balance */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                                Payable:
                              </span>
                              <span className="font-mono font-bold text-xs text-slate-800">
                                ₹
                                {entry.runningBalance !== undefined
                                  ? formatNumberIndian(Math.abs(entry.runningBalance))
                                  : '-'}
                              </span>
                              {entry.runningBalance !== undefined && (
                                <span
                                  className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                                    entry.runningBalance >= 0
                                      ? 'bg-slate-100 text-slate-800'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {entry.runningBalance >= 0 ? 'CR' : 'DR'}
                                </span>
                              )}
                            </div>

                            {/* Actions Group */}
                            <div className="flex items-center gap-1">
                              {linkedInv && (
                                <button
                                  onClick={() => handleViewInvoiceDirectly(linkedInv)}
                                  className="px-2 py-1 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  title="View Linked Bill"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Bill</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleShareSingleEntryWhatsApp(entry)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                title="Share via WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WA</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingEntry(entry);
                                  setIsAddModalOpen(true);
                                }}
                                disabled={isReadOnly}
                                title={isReadOnly ? 'Action disabled in read-only mode' : 'Edit'}
                                className={`p-1 rounded transition-colors ${
                                  isReadOnly
                                    ? 'text-slate-300 opacity-50 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-slate-800 cursor-pointer'
                                }`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEntryToDelete(entry)}
                                disabled={isReadOnly}
                                title={isReadOnly ? 'Action disabled in read-only mode' : 'Delete'}
                                className={`p-1 rounded transition-colors ${
                                  isReadOnly
                                    ? 'text-slate-300 opacity-50 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-rose-600 cursor-pointer'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Mobile Compact Table */
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse min-w-[340px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-800 text-[10px] uppercase tracking-wider font-bold">
                          <th className="py-2.5 px-3 bg-slate-100/80">Particular</th>
                          <th className="py-2.5 px-3 bg-slate-800 text-white text-right w-24">
                            Credit (Bills)
                          </th>
                          <th className="py-2.5 px-3 bg-emerald-600 text-white text-right w-24">
                            Debit (Paid)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredEntries.map((entry, index) => {
                          const isCredit = entry.type === 'credit';
                          const entryBadge =
                            entry.entryType || (isCredit ? 'PURCHASE' : 'PAYMENT');
                          return (
                            <tr key={entry.id || index} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 align-top">
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-900 text-xs">
                                    {formatDateDisplay(entry.date)}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                        isCredit
                                          ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      }`}
                                    >
                                      {entryBadge}
                                    </span>
                                    {entry.vchNo && (
                                      <span className="font-mono text-[10px] text-slate-500">
                                        #{entry.vchNo}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 break-words">
                                    {entry.particular || entryBadge}
                                  </p>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 text-xs bg-slate-50 align-top">
                                {isCredit ? (
                                  <span>{formatNumberIndian(entry.amount)}</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 text-xs bg-emerald-50/20 align-top">
                                {!isCredit ? (
                                  <span>{formatNumberIndian(entry.amount)}</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Circular Action Button for Mobile */}
      <button
        onClick={() => {
          setEditingEntry(null);
          setIsAddModalOpen(true);
        }}
        disabled={isReadOnly}
        className={`fixed right-4 sm:right-6 bottom-16 sm:bottom-20 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all group ${
          isReadOnly
            ? 'bg-slate-400 opacity-60 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer'
        }`}
        title={isReadOnly ? 'Action disabled in read-only mode' : 'Add Ledger Entry'}
      >
        <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* 5. Bottom Fixed Sticky Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs gap-2">
          {/* Left CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>PDF Statement</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          </div>

          {/* Totals & Net Payable Summary */}
          <div className="flex items-center gap-2 sm:gap-6 text-right shrink-0">
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Total Purchases
              </div>
              <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                ₹{formatNumberIndian(totalCredits)}
              </div>
            </div>

            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Total Paid Out
              </div>
              <div className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                ₹{formatNumberIndian(totalDebits)}
              </div>
            </div>

            <div className="pl-2 sm:pl-3 border-l border-slate-200">
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Payable Balance
              </div>
              <div
                className={`font-mono font-black text-xs sm:text-base ${
                  isPayable ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                ₹{formatNumberIndian(Math.abs(netClosingBalance))}{' '}
                <span className="text-[9px] sm:text-[11px] font-bold">
                  {isPayable ? 'CR' : 'DR'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Ledger Entry Modal */}
      {isAddModalOpen && (
        <AddSupplierLedgerEntryModal
          party={party}
          initialEntry={editingEntry}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingEntry(null);
          }}
          onSaveEntry={(entry, newBalance) => {
            if (editingEntry && onEditEntry) {
              onEditEntry(entry, newBalance);
            } else {
              onAddEntry(entry, newBalance);
            }
            setIsAddModalOpen(false);
            setEditingEntry(null);
          }}
        />
      )}

      {/* Printable Statement & PDF Modal */}
      {isPrintModalOpen && (
        <SupplierLedgerPrintModal
          party={party}
          company={company}
          entries={filteredEntries}
          startDate={timeFilter === 'custom' ? customStartDate : undefined}
          endDate={timeFilter === 'custom' ? customEndDate : undefined}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Linked Invoice Print Modal */}
      {viewingInvoice && (
        <InvoicePrintModal
          invoice={viewingInvoice}
          company={company}
          onClose={() => setViewingInvoice(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Ledger Entry?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to delete this {entryToDelete.type} entry of ₹
                  {formatNumberIndian(entryToDelete.amount)}?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setEntryToDelete(null)}
                className="px-3.5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteEntry}
                className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
