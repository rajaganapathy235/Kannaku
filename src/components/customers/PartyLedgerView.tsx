import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Download,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Share2,
} from 'lucide-react';
import { Client, CompanyProfile, PaymentLedgerEntry } from '../../types';
import { formatNumberIndian } from '../../utils/numberToWords';
import { AddLedgerEntryModal } from './AddLedgerEntryModal';
import { PartyLedgerPrintModal } from './PartyLedgerPrintModal';

interface PartyLedgerViewProps {
  party: Client;
  company: CompanyProfile;
  payments: PaymentLedgerEntry[];
  onBack: () => void;
  onAddEntry: (entry: PaymentLedgerEntry, newBalance: number) => void;
  onDeleteEntry?: (entryId: string, newBalance: number) => void;
}

type TimeFilter = 'all' | 'today' | 'this_month' | 'this_year' | 'last_30_days' | 'custom';
type TypeFilter = 'all' | 'debit' | 'credit';

export const PartyLedgerView: React.FC<PartyLedgerViewProps> = ({
  party,
  company,
  payments,
  onBack,
  onAddEntry,
}) => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Filter entries for this party
  const partyEntries = useMemo(() => {
    return payments.filter(
      (p) => p.partyId === party.id || p.partyName.toLowerCase() === party.name.toLowerCase()
    );
  }, [payments, party]);

  // Apply filters
  const filteredEntries = useMemo(() => {
    return partyEntries.filter((entry) => {
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
        } else if (timeFilter === 'this_month') {
          if (
            entryDate.getFullYear() !== now.getFullYear() ||
            entryDate.getMonth() !== now.getMonth()
          ) {
            return false;
          }
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
          (entry.note && entry.note.toLowerCase().includes(q)) ||
          entry.date.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [partyEntries, typeFilter, timeFilter, searchQuery, customStartDate, customEndDate]);

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

  const handleOpenPdfModal = () => {
    setIsPrintModalOpen(true);
  };

  const handleShareWhatsApp = () => {
    const rawPhone = party.mobile ? party.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const message = `*Party Ledger Statement: ${party.name}*
━━━━━━━━━━━━━━━━━━━━
🏢 *Issued By:* ${company.name}
GSTIN: ${company.registerNumber} • Ph: ${company.mobile}
📅 *Date:* ${new Date().toLocaleDateString('en-IN')}
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${party.name}
GSTIN: ${party.registerNumber || 'URP'}
📞 *Phone:* ${party.mobile}

📊 *Summary of Transactions:*
• *Total Debit (Billed):* ₹${formatNumberIndian(totalDebits)}
• *Total Credit (Paid):* ₹${formatNumberIndian(totalCredits)}
• *Closing Balance Due:* ₹${formatNumberIndian(Math.abs(netClosingBalance))} ${isDebitBalance ? 'DR' : 'CR'}

💳 *Bank / UPI Payment Details:*
• *UPI ID:* ${company.bankDetail.upiId}
• *Bank:* ${company.bankDetail.bankName}
• *A/C No:* ${company.bankDetail.accountNumber}
• *IFSC Code:* ${company.bankDetail.ifscCode}

_Generated via Kannaku GST Ledger_`;

    const encoded = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 relative">
      {/* 1. Header Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              title="Back to Parties"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
                Ledger : {party.name}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                GST: {party.registerNumber || 'Unregistered'} • {party.city || 'Tamil Nadu'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="Share Statement via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleOpenPdfModal}
              className="p-1.5 sm:px-3 sm:py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Open Statement & Print PDF"
            >
              <Download className="w-4 h-4" />
              <span>PDF / Print</span>
            </button>
          </div>
        </div>

        {/* 2. Comprehensive Filter Toolbar */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 border-t border-slate-100 space-y-2">
          {/* Row 1: Type Tabs & Time Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Transaction Type Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              {[
                { id: 'all', label: `All (${partyEntries.length})` },
                { id: 'debit', label: `Debit / Billed (${partyEntries.filter((e) => e.type === 'debit').length})` },
                { id: 'credit', label: `Credit / Paid (${partyEntries.filter((e) => e.type === 'credit').length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id as TypeFilter)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    typeFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Time Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'today', label: 'Today' },
                { id: 'this_month', label: 'This Month' },
                { id: 'this_year', label: 'This Year' },
                { id: 'last_30_days', label: 'Last 30 Days' },
                { id: 'custom', label: 'Custom' },
              ].map((tp) => (
                <button
                  key={tp.id}
                  onClick={() => setTimeFilter(tp.id as TimeFilter)}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    timeFilter === tp.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Search & Custom Date Range */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search voucher #, particulars, notes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            {timeFilter === 'custom' && (
              <div className="flex items-center gap-1 bg-blue-50/60 p-1 rounded-lg border border-blue-100 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px]"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[11px]"
                />
              </div>
            )}

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3">
        {/* Meta Info Bar: Records on Left, Summary on Right */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 bg-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span>Showing {filteredEntries.length} of {partyEntries.length} entries</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                Filtered
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] sm:text-xs text-slate-500">
            Opening Balance ₹{openingBalance.toFixed(2)}
          </span>
        </div>

        {/* 3-Column Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[340px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-800 text-[10px] sm:text-[11px] uppercase tracking-wider font-bold">
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 bg-slate-100/80">Particular</th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 bg-emerald-600 text-white text-right w-24 sm:w-36">
                    Credit (Paid)
                  </th>
                  <th className="py-2.5 sm:py-3 px-3 sm:px-4 bg-rose-600 text-white text-right w-24 sm:w-36">
                    Debit (Billed)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 text-xs px-4">
                      No ledger transactions found matching filters.
                      <div className="mt-2 flex items-center justify-center gap-3">
                        {hasActiveFilters && (
                          <button
                            onClick={handleResetFilters}
                            className="text-blue-600 font-bold hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        )}
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="text-emerald-700 font-bold hover:underline cursor-pointer"
                        >
                          + Add ledger entry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, index) => {
                    const isDebit = entry.type === 'debit';
                    const entryBadge = entry.entryType || (isDebit ? 'SALES' : 'PAYMENT');
                    return (
                      <tr
                        key={entry.id || index}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Particular column */}
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 align-top">
                          <div className="flex items-start gap-2 sm:gap-2.5">
                            <span className="text-slate-400 font-mono text-[10px] sm:text-[11px] mt-0.5 w-3.5 sm:w-4 shrink-0">
                              {index + 1}
                            </span>
                            <div className="space-y-0.5 sm:space-y-1 min-w-0">
                              <div className="font-semibold text-slate-900 text-[11px] sm:text-xs">
                                {formatDateDisplay(entry.date)}
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase ${
                                    isDebit
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {entryBadge}
                                </span>
                                {entry.vchNo && (
                                  <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-semibold truncate max-w-[140px]">
                                    Vch: {entry.vchNo}
                                  </span>
                                )}
                              </div>
                              {entry.particular && entry.particular !== entryBadge && (
                                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug break-words">
                                  {entry.particular}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Credit Column */}
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right align-top font-mono font-bold text-emerald-700 text-xs sm:text-sm bg-emerald-50/20 whitespace-nowrap">
                          {!isDebit ? (
                            <span>{formatNumberIndian(entry.amount)}</span>
                          ) : (
                            <span className="text-slate-300 font-normal">-</span>
                          )}
                        </td>

                        {/* Debit Column */}
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right align-top font-mono font-bold text-rose-700 text-xs sm:text-sm bg-rose-50/20 whitespace-nowrap">
                          {isDebit ? (
                            <span>{formatNumberIndian(entry.amount)}</span>
                          ) : (
                            <span className="text-slate-300 font-normal">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating Circular Green (+) Action Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed right-4 sm:right-6 bottom-16 sm:bottom-20 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition-all group cursor-pointer"
        title="Add Ledger Entry"
      >
        <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* 4. Bottom Fixed Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-200 shadow-lg px-3 sm:px-4 py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs gap-2">
          {/* PDF button on left */}
          <button
            onClick={handleOpenPdfModal}
            className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] sm:text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>PDF Statement</span>
          </button>

          {/* Totals & Closing Balance on right */}
          <div className="flex items-center gap-2.5 sm:gap-6 text-right shrink-0">
            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Total Credit
              </div>
              <div className="font-mono font-bold text-emerald-700 text-[11px] sm:text-sm">
                ₹{totalCredits.toFixed(2)}
              </div>
            </div>

            <div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Total Debit
              </div>
              <div className="font-mono font-bold text-rose-700 text-[11px] sm:text-sm">
                ₹{totalDebits.toFixed(2)}
              </div>
            </div>

            <div className="pl-2 sm:pl-3 border-l border-slate-200">
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-semibold">
                Closing
              </div>
              <div
                className={`font-mono font-black text-xs sm:text-base ${
                  isDebitBalance ? 'text-rose-700' : 'text-emerald-700'
                }`}
              >
                ₹{Math.abs(netClosingBalance).toFixed(2)}{' '}
                <span className="text-[9px] sm:text-[11px] font-bold">
                  {isDebitBalance ? 'DR' : 'CR'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Ledger Entry Modal */}
      {isAddModalOpen && (
        <AddLedgerEntryModal
          party={party}
          onClose={() => setIsAddModalOpen(false)}
          onSaveEntry={(entry, newBalance) => {
            onAddEntry(entry, newBalance);
            setIsAddModalOpen(false);
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
    </div>
  );
};
