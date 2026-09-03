import React, { useState } from 'react';
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Edit2,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
} from 'lucide-react';
import { Client, CompanyProfile, Invoice, InvoiceType } from '../../types';
import { formatNumberIndian } from '../../utils/numberToWords';
import {
  INDIAN_STATES,
  getStateCodeByName,
  validateGSTIN,
} from '../../utils/gstValidation';

interface SupplierListViewProps {
  clients: Client[];
  invoices: Invoice[];
  company: CompanyProfile;
  onAddSupplier: (supplier: Client) => void;
  onUpdateSupplier: (supplier: Client) => void;
  onDeleteSupplier: (supplierId: string) => void;
}

export const SupplierListView: React.FC<SupplierListViewProps> = ({
  clients,
  invoices,
  company,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Client | null>(null);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(company.state);
  const [pin, setPin] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [gstError, setGstError] = useState<string | null>(null);

  const supplierList = clients.filter((c) => c.clientType === 'supplier');

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

  const filteredSuppliers = supplierList.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.mobile.includes(q) ||
      s.registerNumber.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
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

  const handleOpenEdit = (s: Client) => {
    setEditingSupplier(s);
    setName(s.name);
    setMobile(s.mobile);
    setEmail(s.email || '');
    setAddress(s.address);
    setCity(s.city);
    setState(s.state);
    setPin(s.pin);
    setRegisterNumber(s.registerNumber === 'URP' ? '' : s.registerNumber);
    setBalance(s.balance);
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

    if (editingSupplier) {
      onUpdateSupplier({
        ...editingSupplier,
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
      onAddSupplier({
        id: `s_${Date.now()}`,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim() || undefined,
        address: address.trim() || 'Industrial Estate',
        city: city.trim() || company.city,
        state: state.trim() || company.state,
        code: stateCode,
        pin: pin.trim() || '600001',
        registerNumber: registerNumber.trim().toUpperCase() || 'URP',
        clientType: 'supplier',
        balance: Number(balance) || 0,
        createdOn: new Date().toISOString(),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-lg border border-[#DADCE0] shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-[#202124]">
            Suppliers & Vendors (Send Master)
          </h2>
          <p className="text-xs text-[#5F6368]">
            Manage raw material vendors, supplier contacts & purchase records ({supplierList.length} total)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs active:scale-98 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-[#DADCE0] shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5F6368]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, GSTIN, city..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] placeholder-[#5F6368] focus:bg-white focus:outline-none focus:border-[#1A73E8]"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((s) => {
          const purchaseInvoices = invoices.filter(
            (i) => i.clientId === s.id && i.invoiceType === InvoiceType.PURCHASE
          );

          return (
            <div
              key={s.id}
              className="bg-white rounded-lg border border-[#DADCE0] shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-[#1A73E8]/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#202124]">{s.name}</h3>
                    <div className="text-xs text-[#1A73E8] font-mono font-semibold mt-0.5">
                      GST: {s.registerNumber || 'URP'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 text-[#5F6368] hover:text-[#202124] hover:bg-[#F1F3F4] rounded-md transition-colors"
                      title="Edit Supplier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteSupplier(s.id)}
                      className="p-1.5 text-[#5F6368] hover:text-[#D93025] hover:bg-[#FCE8E6] rounded-md transition-colors"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#5F6368] space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#5F6368]" />
                    <span className="text-[#202124]">{s.mobile || 'No contact'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#5F6368]" />
                    <span className="truncate">
                      {s.city}, {s.state} - {s.pin}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DADCE0] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#5F6368] block font-medium">
                    Payable Balance
                  </span>
                  <span className="font-mono font-bold text-sm text-[#202124]">
                    ₹{formatNumberIndian(Math.abs(s.balance))}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-[#F1F3F4] text-[#5F6368] font-medium text-xs">
                  {purchaseInvoices.length} Purchases
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 border border-[#DADCE0] animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-semibold text-[#202124] mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#1A73E8]" />
              <span>{editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {gstError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{gstError}</span>
                </div>
              )}

              <div>
                <label className="block font-medium text-[#202124] mb-1">
                  Supplier / Vendor Firm Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Raw Materials Hub"
                  className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    Mobile / Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-[#202124]">
                      GSTIN (15 Digits)
                    </label>
                    <span className="text-[10px] text-slate-500">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={registerNumber}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    placeholder="33AAAAA0000A1Z5"
                    className={`w-full p-2 bg-[#F8F9FA] border rounded-md font-mono uppercase text-[#202124] focus:bg-white focus:outline-none ${
                      registerNumber && !gstValidation.isValid
                        ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                        : registerNumber && gstValidation.isValid && !gstValidation.isUnregistered
                        ? 'border-emerald-400 focus:border-emerald-500 bg-emerald-50/20'
                        : 'border-[#DADCE0] focus:border-[#1A73E8]'
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
              </div>

              <div>
                <label className="block font-medium text-[#202124] mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Warehouse / Factory address"
                  className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-[#202124]">
                      State
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Code: {getStateCodeByName(state) || '--'}
                    </span>
                  </div>
                  <select
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-[#202124] mb-1">
                    PIN
                  </label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full p-2 bg-[#F8F9FA] border border-[#DADCE0] rounded-md text-[#202124] focus:bg-white focus:border-[#1A73E8] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DADCE0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-[#5F6368] hover:bg-[#F1F3F4] rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-md shadow-sm transition-colors"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

