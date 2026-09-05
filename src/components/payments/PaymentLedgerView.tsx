import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
} from 'lucide-react';
import { Client, CompanyProfile, PaymentLedgerEntry } from '../../types';
import { formatNumberIndian } from '../../utils/numberToWords';

interface PaymentLedgerViewProps {
  payments: PaymentLedgerEntry[];
  clients: Client[];
  company: CompanyProfile;
  onRecordPayment: (entry: PaymentLedgerEntry) => void;
}

type TimePeriod = 'all' | 'today' | 'this_week' | 'this_month' | 'last_30_days' | 'custom';

export const PaymentLedgerView: React.FC<PaymentLedgerViewProps> = ({
  payments,
  clients,
  company,
  onRecordPayment,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterParty, setFilterParty] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );
  const [partyName, setPartyName] = useState<string>(clients[0]?.name || '');
  const [amount, setAmount] = useState<number>(1000);
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [mode, setMode] = useState<string>('UPI');
  const [referenceNo, setReferenceNo] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter logic
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        // Type filter
        if (filterType !== 'all' && p.type !== filterType) return false;

        // Mode filter
        if (filterMode !== 'all' && p.mode.toUpperCase() !== filterMode.toUpperCase()) return false;

        // Party filter
        if (filterParty !== 'all') {
          if (p.partyId !== filterParty && p.partyName.toLowerCase() !== filterParty.toLowerCase()) {
            return false;
          }
        }

        // Time period filter
        if (timePeriod !== 'all') {
          const entryDate = new Date(p.date);
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];

          if (timePeriod === 'today') {
            if (p.date !== todayStr) return false;
          } else if (timePeriod === 'this_week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            if (entryDate < startOfWeek) return false;
          } else if (timePeriod === 'this_month') {
            if (
              entryDate.getFullYear() !== now.getFullYear() ||
              entryDate.getMonth() !== now.getMonth()
            ) {
              return false;
            }
          } else if (timePeriod === 'last_30_days') {
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);
            if (entryDate < thirtyDaysAgo) return false;
          } else if (timePeriod === 'custom') {
            if (customStartDate && p.date < customStartDate) return false;
            if (customEndDate && p.date > customEndDate) return false;
          }
        }

        // Search text filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matches =
            p.partyName.toLowerCase().includes(q) ||
            (p.referenceNo && p.referenceNo.toLowerCase().includes(q)) ||
            (p.note && p.note.toLowerCase().includes(q)) ||
            p.mode.toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
      });
  }, [payments, filterType, filterMode, filterParty, timePeriod, customStartDate, customEndDate, search, sortOrder]);

  const totalCredits = useMemo(() => {
    return filteredPayments
      .filter((p) => p.type === 'credit')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [filteredPayments]);

  const totalDebits = useMemo(() => {
    return filteredPayments
      .filter((p) => p.type === 'debit')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [filteredPayments]);

  const netCashFlow = totalCredits - totalDebits;

  const hasActiveFilters =
    filterType !== 'all' ||
    filterMode !== 'all' ||
    filterParty !== 'all' ||
    timePeriod !== 'all' ||
    search.trim().length > 0;

  const handleResetFilters = () => {
    setFilterType('all');
    setFilterMode('all');
    setFilterParty('all');
    setTimePeriod('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSearch('');
  };

  const handleOpenRecord = (preferredType: 'credit' | 'debit' = 'credit') => {
    setType(preferredType);
    setAmount(1000);
    setMode('UPI');
    setReferenceNo('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecordModalOpen(true);
  };

  const handlePartySelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const cl = clients.find((c) => c.id === clientId);
    if (cl) {
      setPartyName(cl.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || amount <= 0) return;

    const newEntry: PaymentLedgerEntry = {
      id: `pay_${Date.now()}`,
      date,
      partyId: selectedClientId || undefined,
      partyName: partyName.trim(),
      amount: Number(amount),
      type,
      mode: mode as any,
      referenceNo: referenceNo.trim() || undefined,
      note: note.trim() || undefined,
      createdOn: new Date().toISOString(),
    };

    onRecordPayment(newEntry);
    setIsRecordModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Payment Ledger & Cash Flow
          </h2>
          <p className="text-xs text-slate-500">
            Track UPI, Cash, Cheques and Bank settlements with party balances ({payments.length} total entries)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenRecord('debit')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Record Payment Out</span>
          </button>

          <button
            onClick={() => handleOpenRecord('credit')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs active:scale-98 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Collection</span>
          </button>
        </div>
      </div>

      {/* Summary 3-Card Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Inward Collections (Receipts)</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700">
            ₹{formatNumberIndian(totalCredits)}
          </div>
          <p className="text-[11px] text-slate-400">
            {filteredPayments.filter((p) => p.type === 'credit').length} incoming payments
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Outward Payments (Expenses/Vendor)</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            ₹{formatNumberIndian(totalDebits)}
          </div>
          <p className="text-[11px] text-slate-400">
            {filteredPayments.filter((p) => p.type === 'debit').length} payouts made
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Net Liquid Cash Flow</span>
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className={`text-2xl font-black font-mono ${netCashFlow >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            ₹{formatNumberIndian(netCashFlow)}
          </div>
          <p className="text-[11px] text-slate-400">
            {netCashFlow >= 0 ? 'Positive net inflow' : 'Deficit / High outflow'}
          </p>
        </div>
      </div>

      {/* Comprehensive Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Row 1: Transaction Type Tabs & Time Period Select */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Tabs */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl text-xs font-semibold border border-slate-200 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: `All (${payments.length})` },
              { id: 'credit', label: `Inward / Receipts (${payments.filter((p) => p.type === 'credit').length})` },
              { id: 'debit', label: `Outward / Paid (${payments.filter((p) => p.type === 'debit').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_30_days', label: 'Last 30 Days' },
              { id: 'custom', label: 'Date Range' },
            ].map((tp) => (
              <button
                key={tp.id}
                onClick={() => setTimePeriod(tp.id as TimePeriod)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  timePeriod === tp.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Picker if selected */}
        {timePeriod === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-xs">
            <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="font-semibold text-slate-700">Custom Date Range:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
            />
          </div>
        )}

        {/* Row 2: Search, Payment Mode Dropdown, Party Dropdown, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search party, UTR ref, notes..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 transition-colors font-medium"
            />
          </div>

          {/* Payment Mode Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-brand-600 transition-colors"
            >
              <option value="all">All Payment Modes</option>
              <option value="UPI">UPI (BHIM / GPay / Any UPI App)</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          {/* Party Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-brand-600 transition-colors truncate"
            >
              <option value="all">All Parties & Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order & Reset */}
          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:bg-white focus:outline-none focus:border-brand-600 transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                title="Reset all filters"
                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary Badge Bar */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              Showing {filteredPayments.length} of {payments.length} transactions
            </span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-bold text-[10px] border border-brand-200">
                Filtered Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-emerald-700 font-bold">
              CR: ₹{formatNumberIndian(totalCredits)}
            </span>
            <span className="text-rose-700 font-bold">
              DR: ₹{formatNumberIndian(totalDebits)}
            </span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm text-slate-900">No payment records found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or record a new transaction
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Party Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Mode & Reference</th>
                  <th className="py-3 px-4">Note</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{p.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p.partyName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          p.type === 'credit'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.type === 'credit' ? 'RECEIPT (+)' : 'PAYMENT (-)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="font-semibold text-slate-900">{p.mode}</span>
                      {p.referenceNo && (
                        <span className="text-slate-400 block text-[10px] truncate max-w-[160px]">
                          Ref: {p.referenceNo}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {p.note || '-'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-black text-sm ${
                        p.type === 'credit' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {p.type === 'credit' ? '+' : '-'}₹{formatNumberIndian(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-brand-600" />
                <span>Record Ledger Transaction</span>
              </h3>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('credit')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                    type === 'credit'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Receipt (Inward +)
                </button>
                <button
                  type="button"
                  onClick={() => setType('debit')}
                  className={`py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer ${
                    type === 'debit'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Payment (Outward -)
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Existing Party or Type Name *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handlePartySelect(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none mb-2"
                >
                  <option value="">-- Select Registered Client / Vendor --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  required
                  placeholder="Or enter custom party name"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Reference / UTR No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UTR49281938"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Particulars / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Advance for Order #104 / Settlement"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-xs active:scale-98 transition-colors cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
