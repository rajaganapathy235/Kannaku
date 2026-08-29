import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Hash,
  IndianRupee,
  X,
} from 'lucide-react';
import { Client, PaymentLedgerEntry } from '../../types';

interface AddLedgerEntryModalProps {
  party: Client;
  initialEntry?: PaymentLedgerEntry | null;
  onClose: () => void;
  onSaveEntry: (entry: PaymentLedgerEntry, updatedPartyBalance: number) => void;
}

type EntryTypeOption = {
  label: string;
  category: 'debit' | 'credit';
  defaultParticular: string;
};

const DEBIT_OPTIONS: EntryTypeOption[] = [
  { label: 'Sales', category: 'debit', defaultParticular: 'Sales Invoice' },
  { label: 'Purchase Return', category: 'debit', defaultParticular: 'Purchase Return to Vendor' },
  { label: 'Payment Out', category: 'debit', defaultParticular: 'Payment Made Out' },
];

const CREDIT_OPTIONS: EntryTypeOption[] = [
  { label: 'Purchase', category: 'credit', defaultParticular: 'Purchase Inward' },
  { label: 'Sales Return', category: 'credit', defaultParticular: 'Sales Return from Customer' },
  { label: 'Payment In', category: 'credit', defaultParticular: 'Payment Received / Collection' },
];

export const AddLedgerEntryModal: React.FC<AddLedgerEntryModalProps> = ({
  party,
  initialEntry,
  onClose,
  onSaveEntry,
}) => {
  const isEditing = !!initialEntry;
  const [selectedType, setSelectedType] = useState<string>(
    initialEntry?.entryType || (initialEntry?.type === 'credit' ? 'Payment In' : 'Sales')
  );
  const [category, setCategory] = useState<'debit' | 'credit'>(
    initialEntry?.type || 'debit'
  );
  const [date, setDate] = useState<string>(
    initialEntry?.date || new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState<string>(
    initialEntry ? String(initialEntry.amount) : ''
  );
  const [particular, setParticular] = useState<string>(
    initialEntry?.particular || 'Sales'
  );
  const [vchNo, setVchNo] = useState<string>(
    initialEntry?.vchNo || ''
  );

  const handleSelectOption = (opt: EntryTypeOption) => {
    setSelectedType(opt.label);
    setCategory(opt.category);
    setParticular(opt.label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    // Calculate delta against old entry if editing
    let delta = 0;
    if (initialEntry) {
      const oldVal = initialEntry.type === 'debit' ? Number(initialEntry.amount) : -Number(initialEntry.amount);
      const newVal = category === 'debit' ? numAmount : -numAmount;
      delta = newVal - oldVal;
    } else {
      delta = category === 'debit' ? numAmount : -numAmount;
    }
    const newBalance = (party.balance || 0) + delta;

    const savedEntry: PaymentLedgerEntry = {
      id: initialEntry?.id || `entry_${Date.now()}`,
      partyId: party.id,
      partyName: party.name,
      partyType: party.clientType,
      date,
      type: category,
      entryType: selectedType,
      mode: category === 'credit' ? 'Cash / UPI / Bank' : 'Voucher Bill',
      amount: numAmount,
      particular: particular.trim() || selectedType,
      vchNo: vchNo.trim() || undefined,
      referenceNo: vchNo.trim() ? `VCH-${vchNo.trim()}` : undefined,
      invoiceNumber: initialEntry?.invoiceNumber,
      createdOn: initialEntry?.createdOn || new Date().toISOString(),
    };

    onSaveEntry(savedEntry, newBalance);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {isEditing ? 'Edit Ledger Entry' : 'Add Ledger Entry'}
              </h3>
              <p className="text-xs font-bold text-blue-600 mt-0.5 tracking-wide">
                {party.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Ledger Entry Type Selection (2-Column Debit / Credit Matrix) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Ledger Entry Type
            </label>

            <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              {/* Debit Column (Red) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#D93025] uppercase tracking-wider pb-1 border-b border-rose-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#D93025]"></span>
                  Debit
                </div>
                <div className="space-y-1.5 pt-1">
                  {DEBIT_OPTIONS.map((opt) => {
                    const isSelected = selectedType === opt.label;
                    return (
                      <label
                        key={opt.label}
                        onClick={() => handleSelectOption(opt)}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#FCE8E6] text-[#D93025] font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="entry_type"
                          checked={isSelected}
                          onChange={() => handleSelectOption(opt)}
                          className="w-3.5 h-3.5 text-[#D93025] focus:ring-[#D93025]"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Credit Column (Green) */}
              <div className="space-y-2 border-l border-slate-200 pl-3">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider pb-1 border-b border-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Credit
                </div>
                <div className="space-y-1.5 pt-1">
                  {CREDIT_OPTIONS.map((opt) => {
                    const isSelected = selectedType === opt.label;
                    return (
                      <label
                        key={opt.label}
                        onClick={() => handleSelectOption(opt)}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="entry_type"
                          checked={isSelected}
                          onChange={() => handleSelectOption(opt)}
                          className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-600"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields matching Screenshot 3 */}
          <div className="space-y-3 pt-1">
            {/* Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Transaction Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Amount (₹) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                  <IndianRupee className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold text-sm focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>
            </div>

            {/* Particular */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Particular / Narration
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales, Goods Inward, Cheque Payment"
                  value={particular}
                  onChange={(e) => setParticular(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>
            </div>

            {/* Vch No. ( optional ) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Vch No. ( optional )
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 52, 62, INV-091"
                  value={vchNo}
                  onChange={(e) => setVchNo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-[#1A73E8] hover:bg-[#1557B0] active:bg-[#0D47A1] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Add Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
