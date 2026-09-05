import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Edit2,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Share2,
  Trash2,
  Users,
} from 'lucide-react';
import { Client, CompanyProfile, Invoice, PaymentLedgerEntry } from '../../types';
import { formatIndianCurrency, formatNumberIndian } from '../../utils/numberToWords';
import { PartyLedgerView } from './PartyLedgerView';
import {
  INDIAN_STATES,
  getStateCodeByName,
  getStateNameByCode,
  validateGSTIN,
} from '../../utils/gstValidation';

interface CustomerListViewProps {
  clients: Client[];
  invoices: Invoice[];
  company: CompanyProfile;
  payments?: PaymentLedgerEntry[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onViewInvoice: (invoice: Invoice) => void;
  onAddLedgerEntry?: (entry: PaymentLedgerEntry, newBalance: number) => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  clients,
  invoices,
  company,
  payments = [],
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onViewInvoice,
  onAddLedgerEntry,
}) => {
  const [search, setSearch] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartyLedger, setSelectedPartyLedger] = useState<Client | null>(
    null
  );

  // Form state
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(company.state || 'Tamil Nadu');
  const [pin, setPin] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [gstError, setGstError] = useState<string | null>(null);

  const customerList = clients.filter((c) => c.clientType !== 'supplier');

  const gstValidation = validateGSTIN(registerNumber, state);

  const handleGstinChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    setRegisterNumber(clean);
    setGstError(null);

    // Auto-detect and sync state if valid 15-digit GSTIN entered
    if (clean.length === 15) {
      const check = validateGSTIN(clean);
      if (check.isValid && check.stateName) {
        setState(check.stateName);
      }
    }
  };

  const handleStateChange = (newState: string) => {
    setState(newState);
    setGstError(null);
  };

  const filteredCustomers = customerList.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.registerNumber.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingClient(null);
    setName('');
    setMobile('');
    setEmail('');
    setAddress('');
    setCity(company.city);
    setState(company.state || 'Tamil Nadu');
    setPin('');
    setRegisterNumber('');
    setBalance(0);
    setGstError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setMobile(c.mobile);
    setEmail(c.email || '');
    setAddress(c.address);
    setCity(c.city);
    setState(c.state);
    setPin(c.pin);
    setRegisterNumber(c.registerNumber === 'URP' ? '' : c.registerNumber);
    setBalance(c.balance);
    setGstError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate GSTIN if entered
    if (registerNumber.trim() && registerNumber.trim().toUpperCase() !== 'URP') {
      const check = validateGSTIN(registerNumber, state);
      if (!check.isValid) {
        setGstError(check.message || 'Invalid GSTIN format or state mismatch.');
        return;
      }
    }

    const stateCode = getStateCodeByName(state) || company.code || '33';

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        code: stateCode,
        pin: pin.trim(),
        registerNumber: registerNumber.trim().toUpperCase() || 'URP',
        balance: Number(balance) || 0,
      });
    } else {
      onAddClient({
        id: `c_${Date.now()}`,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        address: address.trim() || 'Main Road',
        city: city.trim() || company.city,
        state: state.trim() || company.state,
        code: stateCode,
        pin: pin.trim() || '638751',
        registerNumber: registerNumber.trim().toUpperCase() || 'URP',
        clientType: 'customer',
        balance: Number(balance) || 0,
        createdOn: new Date().toISOString(),
      });
    }

    setIsModalOpen(false);
  };

  const handleSendReminder = (c: Client) => {
    const rawPhone = c.mobile ? c.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const message = `*Payment Reminder from ${company.name}*
━━━━━━━━━━━━━━━━━━━━
Dear *${c.name}*,
This is a gentle reminder regarding your outstanding balance of *₹${formatNumberIndian(c.balance)}*.

💳 *Bank / UPI Payment Details:*
• *UPI ID:* ${company.bankDetail.upiId}
• *Bank:* ${company.bankDetail.bankName}
• *A/C No:* ${company.bankDetail.accountNumber}
• *IFSC:* ${company.bankDetail.ifscCode}

Please let us know once the transfer is completed. Thank you!`;
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // If a party ledger is selected, display the full PartyLedgerView matching Screenshot 2
  if (selectedPartyLedger) {
    return (
      <PartyLedgerView
        party={selectedPartyLedger}
        company={company}
        payments={payments}
        onBack={() => setSelectedPartyLedger(null)}
        onAddEntry={(entry, newBalance) => {
          if (onAddLedgerEntry) {
            onAddLedgerEntry(entry, newBalance);
          }
          // Refresh local selected party balance
          setSelectedPartyLedger((prev) => (prev ? { ...prev, balance: newBalance } : null));
        }}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Client Directory & Party Ledgers
          </h2>
          <p className="text-xs text-slate-500">
            Manage client profiles, GSTINs, addresses, and track real-time Debit/Credit statements
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs active:scale-98 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by client name, mobile, GSTIN, or city..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 shadow-xs transition-colors"
        />
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => {
          const partyInvoices = invoices.filter((i) => i.clientId === c.id);
          const partyPayments = payments.filter(
            (p) => p.partyId === c.id || p.partyName.toLowerCase() === c.name.toLowerCase()
          );

          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-brand-600 hover:shadow-sm transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                    <div className="text-xs text-brand-600 font-mono font-semibold mt-0.5">
                      GST: {c.registerNumber || 'URP'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.mobile || 'No mobile specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      {c.city}, {c.state} - {c.pin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Statement row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold uppercase tracking-wider">
                    Outstanding Due
                  </span>
                  <span
                    className={`font-mono font-black text-sm ${
                      c.balance > 0
                        ? 'text-rose-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    ₹{formatNumberIndian(c.balance)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPartyLedger(c)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ledger ({partyPayments.length || partyInvoices.length})</span>
                  </button>

                  {c.balance > 0 && (
                    <button
                      onClick={() => handleSendReminder(c)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
                      title="WhatsApp Payment Reminder (wa.me)"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span>{editingClient ? 'Edit Client Profile' : 'Add New Client'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {gstError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{gstError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Client / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sri Murugan Enterprises"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      GSTIN / UIN (15 Digits)
                    </label>
                    <span className="text-[10px] text-slate-500">Leave blank for URP</span>
                  </div>
                  <input
                    type="text"
                    value={registerNumber}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    placeholder="33AAAAA0000A1Z5"
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl font-mono uppercase text-slate-900 focus:bg-white focus:outline-none ${
                      registerNumber && !gstValidation.isValid
                        ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                        : registerNumber && gstValidation.isValid && !gstValidation.isUnregistered
                        ? 'border-emerald-400 focus:border-emerald-500 bg-emerald-50/20'
                        : 'border-slate-200 focus:border-brand-600'
                    }`}
                  />
                  {/* Real-time GSTIN validation feedback */}
                  {registerNumber.trim() && (
                    <div className="mt-1">
                      {gstValidation.isValid && !gstValidation.isUnregistered ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            Valid GSTIN ({gstValidation.stateCode} - {gstValidation.stateName})
                          </span>
                        </div>
                      ) : !gstValidation.isValid ? (
                        <div className="flex items-start gap-1 text-[10.5px] font-medium text-red-600">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span>{gstValidation.message}</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Number (for WhatsApp bills)
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Billing Street Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123, Main Road"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">
                      State
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Code: {getStateCodeByName(state) || '--'}
                    </span>
                  </div>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="PIN"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Opening Balance Due (₹)
                </label>
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-brand-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingClient ? 'Update Profile' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
