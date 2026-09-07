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

interface AddSupplierLedgerEntryModalProps {
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

const CREDIT_OPTIONS: EntryTypeOption[] = [
  { label: 'Purchase', category: 'credit', defaultParticular: 'Purchase Inward Bill' },
  { label: 'Opening Balance', category: 'credit', defaultParticular: 'Opening Balance Due' },
  { label: 'Expense / Charge', category: 'credit', defaultParticular: 'Supplier Inward / Freight Charge' },
];

const DEBIT_OPTIONS: EntryTypeOption[] = [
  { label: 'Payment Out', category: 'debit', defaultParticular: 'Payment Made to Supplier' },
  { label: 'Purchase Return', category: 'debit', defaultParticular: 'Purchase Return / Debit Note' },
  { label: 'Discount / Rebate', category: 'debit', defaultParticular: 'Discount / Rebate Received' },
];

export const AddSupplierLedgerEntryModal: React.FC<AddSupplierLedgerEntryModalProps> = ({
  party,
  initialEntry,
  onClose,
  onSaveEntry,
}) => {
  const isEditing = !!initialEntry;
  const [selectedType, setSelectedType] = useState<string>(
    initialEntry?.entryType || (initialEntry?.type === 'debit' ? 'Payment Out' : 'Purchase')
  );
  const [category, setCategory] = useState<'debit' | 'credit'>(
    initialEntry?.type || 'credit'
  );
  const [date, setDate] = useState<string>(
    initialEntry?.date || new Date().toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState<string>(
    initialEntry ? String(initialEntry.amount) : ''
  );
  const [particular, setParticular] = useState<string>(
    initialEntry?.particular || 'Purchase'
  );
  const [vchNo, setVchNo] = useState<string>(
    initialEntry?.vchNo || ''
  );

  const handleSelectOption = (opt: EntryTypeOption) => {
    setSelectedType(opt.label);
    setCategory(opt.category);
    setParticular(opt.defaultParticular || opt.label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    // For suppliers, Credit increases payable balance (we owe more), Debit decreases payable balance (we paid)
    let delta = 0;
    if (initialEntry) {
      const oldVal = initialEntry.type === 'credit' ? Number(initialEntry.amount) : -Number(initialEntry.amount);
      const newVal = category === 'credit' ? numAmount : -numAmount;
      delta = newVal - oldVal;
    } else {
      delta = category === 'credit' ? numAmount : -numAmount;
    }
    const newBalance = (party.balance || 0) + delta;

    const savedEntry: PaymentLedgerEntry = {
      id: initialEntry?.id || `entry_${Date.now()}`,
      partyId: party.id,
      partyName: party.name,
      partyType: party.clientType || 'supplier',
      date,
      type: category,
      entryType: selectedType,
      mode: category === 'debit' ? 'Cash / UPI / Bank Transfer' : 'Purchase Inward Bill',
      amount: numAmount,
      particular: particular.trim() || selectedType,
      vchNo: vchNo.trim() || undefined,
      referenceNo: vchNo.trim() ? `BILL-${vchNo.trim()}` : undefined,
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
                {isEditing ? 'Edit Supplier Entry' : 'Add Supplier Ledger Entry'}
              </h3>
              <p className="text-xs font-bold text-brand-600 mt-0.5 tracking-wide">
                {party.name} (Supplier)
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
          {/* Ledger Entry Type Selection (2-Column Credit / Debit Matrix) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Transaction Category
            </label>

            <div className="grid grid-cols-2 gap-3 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              {/* Credit Column (Purchase / Inward) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                  Credit (Owed +)
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
                            ? 'bg-slate-200 text-slate-900 font-bold shadow-xs'
                            : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="entry_type"
                          checked={isSelected}
                          onChange={() => handleSelectOption(opt)}
                          className="w-3.5 h-3.5 text-slate-700 focus:ring-slate-700"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Debit Column (Payment Made / Out) */}
              <div className="space-y-2 border-l border-slate-200 pl-3">
                <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider pb-1 border-b border-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Debit (Paid -)
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

          {/* Form Fields */}
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
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
                  placeholder="e.g. Purchase Inward, Bank Transfer, RTGS"
                  value={particular}
                  onChange={(e) => setParticular(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Vch No. / Bill Ref */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Bill / Voucher No. (optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. PUR-001, TXN-991, 54"
                  value={vchNo}
                  onChange={(e) => setVchNo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isEditing ? 'Update Entry' : 'Add Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
