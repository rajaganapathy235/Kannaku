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
} from 'lucide-react';
import { Client, CompanyProfile, Invoice, PaymentLedgerEntry } from '../../types';
import { formatIndianCurrency, formatNumberIndian } from '../../utils/numberToWords';
import { AddLedgerEntryModal } from './AddLedgerEntryModal';
import { PartyLedgerPrintModal } from './PartyLedgerPrintModal';
import { InvoicePrintModal } from '../invoice/InvoicePrintModal';

interface PartyLedgerViewProps {
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

type TypeFilter = 'all' | 'debit' | 'credit';

export const PartyLedgerView: React.FC<PartyLedgerViewProps> = ({
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

  // Filter entries for this party
  const partyEntries = useMemo(() => {
    return payments.filter((p) => {
      // Must not be explicitly a supplier entry
      if (p.partyType && p.partyType !== 'customer') return false;
      const matchesId = Boolean(p.partyId && party.id && p.partyId === party.id);
      const matchesName = Boolean(
        p.partyName && party.name && p.partyName.trim().toLowerCase() === party.name.trim().toLowerCase()
      );
      return matchesId || matchesName;
    });
  }, [payments, party]);

  // Apply filters and sorting
  const filteredEntries = useMemo(() => {
    const list = partyEntries.filter((entry) => {
      // Type Filter
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
        const matches =
          (entry.particular && entry.particular.toLowerCase().includes(q)) ||
          (entry.vchNo && entry.vchNo.toLowerCase().includes(q)) ||
          (entry.referenceNo && entry.referenceNo.toLowerCase().includes(q)) ||
          (entry.invoiceNumber && entry.invoiceNumber.toLowerCase().includes(q)) ||
          (entry.note && entry.note.toLowerCase().includes(q)) ||
          (entry.entryType && entry.entryType.toLowerCase().includes(q)) ||
          String(entry.amount).includes(q) ||
          entry.date.includes(q);
        if (!matches) return false;
      }

      return true;
    });

    // Chronological calculation for running balance
    const sortedChronological = [...list].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let running = 0;
    const withRunningBalance = sortedChronological.map((item, index) => {
      const isDebit = item.type === 'debit';
      const amount = Number(item.amount) || 0;
      if (isDebit) {
        running += amount;
      } else {
        running -= amount;
      }
      return {
        ...item,
        runningBalance: running,
        chronologicalIndex: index + 1,
      };
    });

    // Display sort order
    if (sortOrder === 'desc') {
      return withRunningBalance.reverse();
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

  // Calculate totals
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

  const openingBalance = 0.0;
  const netClosingBalance = openingBalance + totalDebits - totalCredits;
  const isDebitBalance = netClosingBalance >= 0;

  const hasActiveFilters =
    typeFilter !== 'all' ||
    timeFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setTypeFilter('all');
    setTimeFilter('all');
    setSearchQuery('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

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

  // Find linked invoice if exists
  const findLinkedInvoice = (entry: PaymentLedgerEntry): Invoice | undefined => {
    if (!invoices || invoices.length === 0) return undefined;
    if (entry.invoiceId) {
      const found = invoices.find((i) => i.id === entry.invoiceId);
      if (found) return found;
    }
    if (entry.invoiceNumber) {
      const found = invoices.find(
        (i) => i.invoiceNumber.toLowerCase() === entry.invoiceNumber?.toLowerCase()
      );
      if (found) return found;
    }
    if (entry.vchNo) {
      const found = invoices.find(
        (i) =>
          i.invoiceNumber.toLowerCase() === entry.vchNo?.toLowerCase() ||
          i.invoiceNumber.toLowerCase().includes(entry.vchNo?.toLowerCase() || '')
      );
      if (found) return found;
    }
    return undefined;
  };

  const handleViewInvoiceDirectly = (inv: Invoice) => {
    if (onViewInvoice) {
      onViewInvoice(inv);
    } else {
      setViewingInvoice(inv);
    }
  };

  // Share overall party ledger via WhatsApp
  const handleShareWhatsApp = () => {
    const rawPhone = party.mobile ? party.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const message = `*Statement of Account / Party Ledger*
━━━━━━━━━━━━━━━━━━━━
🏢 *${company.name}*
GSTIN: ${company.registerNumber} • Ph: ${company.mobile}
📅 Date: ${new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
👤 *Customer / Party:* ${party.name}
GSTIN: ${party.registerNumber || 'URP'}
📞 Phone: ${party.mobile || 'N/A'}

📊 *Financial Summary:*
• Total Billed (Debit): ₹${formatNumberIndian(totalDebits)} (${debitCount} txns)
• Total Paid (Credit): ₹${formatNumberIndian(totalCredits)} (${creditCount} txns)
• *Closing Balance Due:* ₹${formatNumberIndian(Math.abs(netClosingBalance))} ${isDebitBalance ? 'DR (Receivable)' : 'CR (Advance)'}

💳 *Bank / UPI Payment Details:*
• Bank: ${company.bankDetail.bankName}
• A/C No: ${company.bankDetail.accountNumber}
• IFSC Code: ${company.bankDetail.ifscCode}
• UPI ID: ${company.bankDetail.upiId}

_Generated via JustGST Ledger_`;

    const encoded = encodeURIComponent(message);
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Share individual transaction receipt via WhatsApp
  const handleShareSingleEntryWhatsApp = (entry: PaymentLedgerEntry) => {
    const rawPhone = party.mobile ? party.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const isDebit = entry.type === 'debit';

    const message = `*Transaction Receipt / Voucher from ${company.name}*
━━━━━━━━━━━━━━━━━━━━
👤 Party: *${party.name}*
📅 Date: ${formatDateDisplay(entry.date)}
🔖 Type: *${entry.entryType || (isDebit ? 'DEBIT / INVOICE' : 'CREDIT / PAYMENT')}*
🔢 Voucher No: ${entry.vchNo || 'N/A'}
📝 Particulars: ${entry.particular || entry.entryType || 'Ledger Entry'}
💰 *Amount: ₹${formatNumberIndian(entry.amount)}* (${isDebit ? 'Debit / Billed' : 'Credit / Received'})

💳 *Bank / UPI:* ${company.bankDetail.upiId} (${company.bankDetail.bankName})
━━━━━━━━━━━━━━━━━━━━
_Thank you for your business!_`;

    const encoded = encodeURIComponent(message);
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Handle entry deletion
  const confirmDeleteEntry = () => {
    if (!entryToDelete) return;
    const isDebit = entryToDelete.type === 'debit';
    const numAmount = Number(entryToDelete.amount) || 0;
    // Removing a debit decreases balance; removing a credit increases balance
    const delta = isDebit ? -numAmount : numAmount;
    const newBal = (party.balance || 0) + delta;

    if (onDeleteEntry) {
      onDeleteEntry(entryToDelete.id, newBal);
    }
    setEntryToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-36 sm:pb-28 relative">
      {/* 1. Header Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          {/* Party Identity Info */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Back to Parties"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                  {party.name}
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {party.clientType === 'supplier' ? 'Vendor / Supplier' : 'Customer'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-mono truncate mt-0.5">
                GST: <span className="font-semibold text-slate-700">{party.registerNumber || 'URP'}</span>
                {party.mobile ? ` • 📞 ${party.mobile}` : ''} • {party.city || 'Tamil Nadu'}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleShareWhatsApp}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Share Statement via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="p-2 sm:px-3.5 sm:py-2 rounded-xl text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Print & PDF Statement"
            >
              <Printer className="w-4 h-4" />
              <span>PDF / Print</span>
            </button>

            <button
              onClick={() => {
                setEditingEntry(null);
                setIsAddModalOpen(true);
              }}
              disabled={isReadOnly}
              title={isReadOnly ? 'Action disabled in read-only mode' : 'Add Entry'}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                isReadOnly
                  ? 'bg-slate-400 opacity-60 cursor-not-allowed'
                  : 'bg-brand-600 hover:bg-brand-700 active:scale-98 cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {/* 2. Comprehensive Filter Toolbar */}
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 border-t border-slate-100 space-y-2.5">
          {/* Row 1: Type Tabs (Full width on mobile, inline on desktop) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* Transaction Type Segmented Tabs */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-full sm:w-auto">
              {[
                { id: 'all', label: 'All', count: partyEntries.length },
                {
                  id: 'debit',
                  label: 'Debit',
                  sub: 'Billed',
                  count: partyEntries.filter((e) => e.type === 'debit').length,
                },
                {
                  id: 'credit',
                  label: 'Credit',
                  sub: 'Paid',
                  count: partyEntries.filter((e) => e.type === 'credit').length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id as TypeFilter)}
                  className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    typeFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      typeFilter === tab.id
                        ? tab.id === 'debit'
                          ? 'bg-rose-100 text-rose-800'
                          : tab.id === 'credit'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-800'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Desktop Time Filter Pills & Mobile Controls */}
            <div className="flex items-center gap-2">
              {/* Mobile View: Time Preset Dropdown + Layout Switcher + Sort */}
              <div className="flex sm:hidden items-center gap-2 w-full">
                {/* Time filter select dropdown for iPhone */}
                <div className="relative flex-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:border-brand-600 shadow-xs"
                  >
                    <option value="all">📅 All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_30_days">Last 30 Days</option>
                    <option value="this_year">This Year</option>
                    <option value="custom">Custom Date Range...</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Mobile Card / Table toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
                  <button
                    onClick={() => setMobileLayout('cards')}
                    className={`p-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      mobileLayout === 'cards'
                        ? 'bg-white text-brand-600 shadow-xs'
                        : 'text-slate-600'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setMobileLayout('table')}
                    className={`p-1.5 rounded-md text-xs font-bold transition cursor-pointer ${
                      mobileLayout === 'table'
                        ? 'bg-white text-brand-600 shadow-xs'
                        : 'text-slate-600'
                    }`}
                    title="Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Mobile Sort Toggle */}
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold shrink-0 cursor-pointer border border-slate-200"
                  title={`Sort: ${sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}`}
                >
                  {sortOrder === 'desc' ? '↓ New' : '↑ Old'}
                </button>
              </div>

              {/* Desktop/Tablet Time Filter Pills */}
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'last_30_days', label: 'Last 30 Days' },
                  { id: 'this_year', label: 'This Year' },
                  { id: 'custom', label: 'Custom' },
                ].map((tp) => (
                  <button
                    key={tp.id}
                    onClick={() => setTimeFilter(tp.id as TimeFilter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      timeFilter === tp.id
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Search, Custom Date Range & Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search voucher #, bill #, particulars, amount..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>

            {/* Custom Date Range Picker (Responsive) */}
            {timeFilter === 'custom' && (
              <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-brand-50/80 p-1.5 rounded-xl border border-brand-200 text-xs">
                <Calendar className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium w-full sm:w-auto"
                />
                <span className="text-slate-400 text-xs font-bold px-0.5">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium w-full sm:w-auto"
                />
              </div>
            )}

            {/* Desktop Sort Button */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                title="Toggle Sort Order"
              >
                <span>Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
              </button>
            </div>

            {/* Reset Filters CTA */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* 3. Summary KPI Strip (3 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Debit Card (Billed / Sales) */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-600 block">
                Total Debit (Billed)
              </span>
              <div className="text-base sm:text-xl font-mono font-black text-rose-700">
                ₹{formatNumberIndian(totalDebits)}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {debitCount} transaction(s)
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Credit Card (Paid / Collections) */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 block">
                Total Credit (Paid)
              </span>
              <div className="text-base sm:text-xl font-mono font-black text-emerald-700">
                ₹{formatNumberIndian(totalCredits)}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {creditCount} transaction(s)
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          {/* Closing Net Balance Due Card */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Net Closing Balance
              </span>
              <div
                className={`text-base sm:text-xl font-mono font-black flex items-center gap-1.5 ${
                  isDebitBalance ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                <span>₹{formatNumberIndian(Math.abs(netClosingBalance))}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    isDebitBalance
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isDebitBalance ? 'DR Due' : 'CR Advance'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Opening Balance: ₹{openingBalance.toFixed(2)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
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
                Try adjusting your filter or record a new debit/credit voucher
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
                      <th className="py-3 px-4 w-32">Voucher / Ref</th>
                      <th className="py-3 px-4">Particulars & Description</th>
                      <th className="py-3 px-4 text-right w-36 bg-rose-50/40 text-rose-800">
                        Debit (Billed)
                      </th>
                      <th className="py-3 px-4 text-right w-36 bg-emerald-50/40 text-emerald-800">
                        Credit (Paid)
                      </th>
                      <th className="py-3 px-4 text-right w-36">Balance Due</th>
                      <th className="py-3 px-4 text-right w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEntries.map((entry, index) => {
                      const isDebit = entry.type === 'debit';
                      const entryBadge =
                        entry.entryType || (isDebit ? 'SALES' : 'PAYMENT');
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
                                isDebit
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
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
                                    title="View Linked Invoice"
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

                          {/* Debit Amount */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 text-xs sm:text-sm bg-rose-50/20 whitespace-nowrap">
                            {isDebit ? (
                              <span>₹{formatNumberIndian(entry.amount)}</span>
                            ) : (
                              <span className="text-slate-300 font-normal">-</span>
                            )}
                          </td>

                          {/* Credit Amount */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-xs sm:text-sm bg-emerald-50/20 whitespace-nowrap">
                            {!isDebit ? (
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
                                      ? 'text-rose-700 bg-rose-50'
                                      : 'text-emerald-700 bg-emerald-50'
                                  }`}
                                >
                                  {entry.runningBalance >= 0 ? 'DR' : 'CR'}
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
                      <td className="py-3 px-4 text-right font-mono text-rose-700 text-sm">
                        ₹{formatNumberIndian(totalDebits)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700 text-sm">
                        ₹{formatNumberIndian(totalCredits)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-900 text-sm">
                        ₹{formatNumberIndian(Math.abs(netClosingBalance))}{' '}
                        <span className="text-xs font-bold">
                          {isDebitBalance ? 'DR' : 'CR'}
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
                      const isDebit = entry.type === 'debit';
                      const entryBadge =
                        entry.entryType || (isDebit ? 'SALES' : 'PAYMENT');
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
                                  isDebit
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
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
                                  isDebit ? 'text-rose-700' : 'text-emerald-700'
                                }`}
                              >
                                {isDebit ? '-' : '+'} ₹{formatNumberIndian(entry.amount)}
                              </div>
                              <span
                                className={`text-[10px] font-bold ${
                                  isDebit ? 'text-rose-600' : 'text-emerald-600'
                                }`}
                              >
                                {isDebit ? 'Debit (Billed)' : 'Credit (Paid)'}
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
                                Balance:
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
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-emerald-50 text-emerald-700'
                                  }`}
                                >
                                  {entry.runningBalance >= 0 ? 'DR' : 'CR'}
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
                                <MessageCircle className="w-3 h-3" />
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
                          <th className="py-2.5 px-3 bg-emerald-600 text-white text-right w-24">
                            Credit (Paid)
                          </th>
                          <th className="py-2.5 px-3 bg-rose-600 text-white text-right w-24">
                            Debit (Billed)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredEntries.map((entry, index) => {
                          const isDebit = entry.type === 'debit';
                          const entryBadge =
                            entry.entryType || (isDebit ? 'SALES' : 'PAYMENT');
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
                                        isDebit
                                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
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
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 text-xs bg-emerald-50/20 align-top">
                                {!isDebit ? (
                                  <span>{formatNumberIndian(entry.amount)}</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700 text-xs bg-rose-50/20 align-top">
                                {isDebit ? (
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

      {/* Floating Circular Green (+) Action Button for Mobile */}
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

          {/* Totals & Net Due Summary */}
          <div className="flex items-center gap-2 sm:gap-6 text-right shrink-0">
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Total Credit
              </div>
              <div className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                ₹{formatNumberIndian(totalCredits)}
              </div>
            </div>

            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Total Debit
              </div>
              <div className="font-mono font-bold text-rose-700 text-xs sm:text-sm">
                ₹{formatNumberIndian(totalDebits)}
              </div>
            </div>

            <div className="pl-2 sm:pl-3 border-l border-slate-200">
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Closing Balance
              </div>
              <div
                className={`font-mono font-black text-xs sm:text-base ${
                  isDebitBalance ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                ₹{formatNumberIndian(Math.abs(netClosingBalance))}{' '}
                <span className="text-[9px] sm:text-[11px] font-bold">
                  {isDebitBalance ? 'DR' : 'CR'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Ledger Entry Modal */}
      {isAddModalOpen && (
        <AddLedgerEntryModal
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
        <PartyLedgerPrintModal
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
