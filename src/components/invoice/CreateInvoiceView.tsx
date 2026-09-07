import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Check,
  ChevronDown,
  FileCheck,
  FilePlus,
  HelpCircle,
  Lock,
  Percent,
  Plus,
  Printer,
  Save,
  Trash2,
  Truck,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import {
  BillModifier,
  Client,
  CompanyProfile,
  Consignee,
  Invoice,
  InvoiceCopyType,
  InvoiceExtraItem,
  InvoiceItem,
  InvoiceType,
  Product,
  TaxType,
} from '../../types';
import { calculateItemTaxAndTotals } from '../../utils/taxEngine';
import { formatIndianCurrency, formatNumberIndian } from '../../utils/numberToWords';
import {
  INDIAN_STATES,
  getStateCodeByName,
  getStateNameByCode,
  validateGSTIN,
} from '../../utils/gstValidation';

interface CreateInvoiceViewProps {
  company: CompanyProfile;
  clients: Client[];
  products: Product[];
  editingInvoice?: Invoice | null;
  onSave: (invoice: Invoice, andPrint?: boolean) => void;
  onCancel: () => void;
  onAddNewClient: (client: Client) => void;
  onAddNewProduct: (product: Product) => void;
  nextInvoiceNumber: (type: InvoiceType) => string;
  isReadOnly?: boolean;
  isTrialExpired?: boolean;
  readOnlyReason?: string | null;
  trialDurationDays?: number;
  onOpenUpgradeModal?: () => void;
}

export const CreateInvoiceView: React.FC<CreateInvoiceViewProps> = ({
  company,
  clients,
  products,
  editingInvoice,
  onSave,
  onCancel,
  onAddNewClient,
  onAddNewProduct,
  nextInvoiceNumber,
  isReadOnly,
  isTrialExpired,
  readOnlyReason,
  trialDurationDays,
  onOpenUpgradeModal,
}) => {
  const isLocked = isReadOnly ?? isTrialExpired ?? false;
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(
    editingInvoice ? editingInvoice.invoiceType : InvoiceType.SALES
  );
  const [invoiceNumber, setInvoiceNumber] = useState(
    editingInvoice
      ? editingInvoice.invoiceNumber
      : nextInvoiceNumber(InvoiceType.SALES)
  );
  const [date, setDate] = useState(
    editingInvoice
      ? editingInvoice.date
      : new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    editingInvoice ? editingInvoice.dueDate : ''
  );
  const [terms, setTerms] = useState(
    editingInvoice ? editingInvoice.terms : '30 Days Credit'
  );
  const [taxType, setTaxType] = useState<TaxType>(
    editingInvoice ? editingInvoice.invoiceTaxType : 'CGST_SGST'
  );

  // Selected Client / Party
  const [selectedClientId, setSelectedClientId] = useState<string>(
    editingInvoice ? editingInvoice.clientId : clients[0]?.id || ''
  );

  // Consignee (Ship-to)
  const [hasConsignee, setHasConsignee] = useState<boolean>(
    editingInvoice?.consignee?.shouldVisible || false
  );
  const [consignee, setConsignee] = useState<Consignee>(
    editingInvoice?.consignee || {
      name: '',
      address: '',
      city: '',
      state: '',
      pin: '',
      registerNumber: '',
      shouldVisible: false,
    }
  );

  // Transport details
  const [eway, setEway] = useState(editingInvoice?.eway || '');
  const [vehicleNo, setVehicleNo] = useState(editingInvoice?.vehicleNo || '');
  const [deliveryNote, setDeliveryNote] = useState(
    editingInvoice?.deliveryNote || ''
  );
  const [deliveryNoteDate, setDeliveryNoteDate] = useState(
    editingInvoice?.deliveryNoteDate || ''
  );
  const [buyersOrderNo, setBuyersOrderNo] = useState(
    editingInvoice?.buyersOrderNo || ''
  );
  const [orderDate, setOrderDate] = useState(
    editingInvoice?.orderDate || ''
  );
  const [dispatchDocNo, setDispatchDocNo] = useState(
    editingInvoice?.dispatchDocNo || ''
  );
  const [dispatchedThrough, setDispatchedThrough] = useState(
    editingInvoice?.dispatchedThrough || ''
  );
  const [destination, setDestination] = useState(
    editingInvoice?.destination || ''
  );
  const [termsOfDelivery, setTermsOfDelivery] = useState(
    editingInvoice?.termsOfDelivery || ''
  );

  // Line Items
  const [items, setItems] = useState<Partial<InvoiceItem>[]>(
    editingInvoice
      ? editingInvoice.items
      : [
          {
            id: `item_${Date.now()}_1`,
            itemId: products[0]?.id || '',
            productId: products[0]?.id || '',
            name: products[0]?.name || '',
            hsnCode: products[0]?.hsnCode || '85044010',
            qty: 1,
            unit: products[0]?.unit || 'Nos',
            baseRate: products[0]?.sellingPrice || 1000,
            mrp: products[0]?.mrp || 1200,
            inclusiveOrExclusive: 'exclusive',
            isDiscountApplied: false,
            flatOrPercentage: 'percentage',
            discountRate: 0,
            taxPercentage: products[0]?.taxRate || 18,
            subline1: products[0]?.subline1 || '',
          },
        ]
  );

  // Extra items (e.g. Freight)
  const [extraItems, setExtraItems] = useState<Partial<InvoiceExtraItem>[]>(
    editingInvoice ? editingInvoice.extraItems : []
  );

  // Modifiers
  const [modifiers, setModifiers] = useState<BillModifier[]>(
    editingInvoice ? editingInvoice.modifiers : []
  );

  // TCS Tax
  const [tcsPercentage, setTcsPercentage] = useState<number>(
    editingInvoice?.calc.tcsPercentage || 0
  );

  // Payment
  const [paidAmount, setPaidAmount] = useState<number>(
    editingInvoice?.calc.paidAmount || 0
  );
  const [paymentMode, setPaymentMode] = useState<string>(
    editingInvoice?.paymentMode || 'UPI / Bank Transfer'
  );
  const [description, setDescription] = useState(
    editingInvoice?.description ||
      'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.'
  );

  // Quick Inline Customer Creator Modal
  const [showQuickCustomerModal, setShowQuickCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustCity, setNewCustCity] = useState('');
  const [newCustState, setNewCustState] = useState(company.state || 'Tamil Nadu');
  const [quickCustGstError, setQuickCustGstError] = useState<string | null>(null);

  const quickGstValidation = validateGSTIN(newCustGstin, newCustState);

  const handleQuickGstinChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    setNewCustGstin(clean);
    setQuickCustGstError(null);

    if (clean.length === 15) {
      const check = validateGSTIN(clean);
      if (check.isValid && check.stateName) {
        setNewCustState(check.stateName);
      }
    }
  };

  // When changing invoice type, generate new number if not editing
  const handleInvoiceTypeChange = (type: InvoiceType) => {
    setInvoiceType(type);
    if (!editingInvoice) {
      setInvoiceNumber(nextInvoiceNumber(type));
    }
  };

  // Auto-detect Tax Type when Client Changes (Inter-state if states or GST codes differ)
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      const clientStateCode = client.code || getStateCodeByName(client.state);
      const companyStateCode = company.code || getStateCodeByName(company.state);

      if (clientStateCode && companyStateCode) {
        if (clientStateCode !== companyStateCode) {
          setTaxType('IGST');
        } else {
          setTaxType('CGST_SGST');
        }
      } else if (
        client.state &&
        company.state &&
        client.state.trim().toLowerCase() !== company.state.trim().toLowerCase()
      ) {
        setTaxType('IGST');
      } else {
        setTaxType('CGST_SGST');
      }
    }
  };

  // Line item handlers
  const handleAddItem = () => {
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        id: `item_${Date.now()}_${items.length + 1}`,
        itemId: defaultProd?.id || '',
        productId: defaultProd?.id || '',
        name: defaultProd?.name || '',
        hsnCode: defaultProd?.hsnCode || '85044010',
        qty: 1,
        unit: defaultProd?.unit || 'Nos',
        baseRate: defaultProd?.sellingPrice || 1000,
        mrp: defaultProd?.mrp || 1200,
        inclusiveOrExclusive: 'exclusive',
        isDiscountApplied: false,
        flatOrPercentage: 'percentage',
        discountRate: 0,
        taxPercentage: defaultProd?.taxRate || 18,
        subline1: defaultProd?.subline1 || '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    const next = [...items];
    next.splice(index, 1);
    setItems(next);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };

    // If product name selected from catalog, auto-populate
    if (field === 'name') {
      const match = products.find(
        (p) => p.name.trim().toLowerCase() === String(value).trim().toLowerCase()
      );
      if (match) {
        next[index].itemId = match.id;
        next[index].productId = match.id;
        next[index].hsnCode = match.hsnCode;
        next[index].baseRate =
          invoiceType === InvoiceType.PURCHASE
            ? match.buyingPrice
            : match.sellingPrice;
        next[index].mrp = match.mrp;
        next[index].unit = match.unit;
        next[index].taxPercentage = match.taxRate;
        next[index].subline1 = match.subline1 || '';
      } else {
        next[index].itemId = undefined;
        next[index].productId = undefined;
      }
    }

    setItems(next);
  };

  // Add Freight / Extra Item
  const handleAddFreight = () => {
    setExtraItems([
      ...extraItems,
      {
        id: `extra_${Date.now()}`,
        name: 'Freight & Transportation Charges',
        baseRate: 500,
        unit: 'Trip',
        hsnCode: '996511',
        taxPercentage: 18,
        extraType: 'freight',
      },
    ]);
  };

  const handleRemoveExtraItem = (idx: number) => {
    const next = [...extraItems];
    next.splice(idx, 1);
    setExtraItems(next);
  };

  // Live calculation
  const calcResult = calculateItemTaxAndTotals(
    items,
    extraItems,
    modifiers,
    taxType,
    tcsPercentage,
    paidAmount
  );

  // Quick Customer Save
  const handleSaveQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    // Validate GSTIN if provided
    if (newCustGstin.trim() && newCustGstin.trim().toUpperCase() !== 'URP') {
      const check = validateGSTIN(newCustGstin, newCustState);
      if (!check.isValid) {
        setQuickCustGstError(
          check.message || 'Invalid GSTIN format or state mismatch.'
        );
        return;
      }
    }

    const stateCode =
      getStateCodeByName(newCustState) || company.code || '33';

    const newClient: Client = {
      id: `c_${Date.now()}`,
      name: newCustName.trim(),
      mobile: newCustPhone.trim(),
      address: 'Main Road',
      city: newCustCity.trim() || company.city,
      state: newCustState.trim() || company.state,
      code: stateCode,
      pin: '600001',
      registerNumber: newCustGstin.trim().toUpperCase() || 'URP',
      clientType:
        invoiceType === InvoiceType.PURCHASE ? 'supplier' : 'customer',
      balance: 0,
      createdOn: new Date().toISOString(),
    };

    onAddNewClient(newClient);
    setSelectedClientId(newClient.id);
    handleClientChange(newClient.id);
    setShowQuickCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustGstin('');
    setQuickCustGstError(null);
  };

  // Save invoice
  const handleSubmit = (andPrint: boolean = false) => {
    if (isLocked) {
      onOpenUpgradeModal?.();
      return;
    }

    const client = clients.find((c) => c.id === selectedClientId) || {
      id: 'c_default',
      name: 'Cash Party / Walk-in Customer',
      mobile: '',
      address: company.city,
      city: company.city,
      state: company.state,
      pin: company.pin,
      registerNumber: 'URP',
      clientType: 'customer',
      balance: 0,
      createdOn: new Date().toISOString(),
    };

    const newInvoice: Invoice = {
      id: editingInvoice ? editingInvoice.id : `inv_${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || nextInvoiceNumber(invoiceType),
      date,
      dueDate: dueDate || date,
      terms,
      invoiceType,
      invoiceTaxType: taxType,
      eway: eway.trim() || undefined,
      deliveryNote: deliveryNote.trim() || undefined,
      deliveryNoteDate: deliveryNoteDate.trim() || undefined,
      buyersOrderNo: buyersOrderNo.trim() || undefined,
      orderDate: orderDate.trim() || undefined,
      dispatchDocNo: dispatchDocNo.trim() || undefined,
      dispatchedThrough: dispatchedThrough.trim() || undefined,
      destination: destination.trim() || undefined,
      vehicleNo: vehicleNo.trim() || undefined,
      termsOfDelivery: termsOfDelivery.trim() || undefined,
      description,
      clientId: client.id,
      clientSnapshot: client,
      consignee: hasConsignee
        ? { ...consignee, shouldVisible: true }
        : undefined,
      items: calcResult.items,
      extraItems: calcResult.extraItems,
      modifiers: calcResult.modifiers,
      calc: calcResult.calc,
      hsnSummary: calcResult.hsnSummary,
      copyType: InvoiceCopyType.ORIGINAL,
      status:
        calcResult.calc.dueAmount === 0
          ? 'PAID'
          : calcResult.calc.paidAmount > 0
          ? 'PARTIAL'
          : 'UNPAID',
      paymentMode,
      createdOn: editingInvoice
        ? editingInvoice.createdOn
        : new Date().toISOString(),
      updatedOn: new Date().toISOString(),
    };

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });

    onSave(newInvoice, andPrint);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Read-Only / Trial Expired Alert Banner */}
      {isLocked && (
        <div
          id="trial-expired-invoice-banner"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-3 text-amber-950">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block text-amber-950">
                {readOnlyReason === 'ACCOUNT_SUSPENDED' || readOnlyReason === 'SUSPENDED'
                  ? 'Account Suspended — Invoice Creation Locked'
                  : readOnlyReason === 'SUBSCRIPTION_EXPIRED'
                  ? 'Subscription Expired — Invoice Creation Locked'
                  : `${trialDurationDays || 15}-Day Free Trial Expired — Invoice Creation Locked`}
              </span>
              <span className="text-xs text-amber-800">
                Your workspace is in read-only mode. Upgrade or renew your subscription to generate, save, and print new tax invoices.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors active:scale-98"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Upgrade Plan</span>
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {editingInvoice ? 'Edit Bill' : 'Create New GST Bill'}
            </h2>
            <p className="text-xs text-slate-500">
              Tally V4 GST Engine • Auto-calculates HSN breakdown and round-off
            </p>
          </div>
        </div>

        {/* Bill Type Selector Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => handleInvoiceTypeChange(InvoiceType.SALES)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              invoiceType === InvoiceType.SALES
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales (Tax Invoice)
          </button>
          <button
            type="button"
            onClick={() => handleInvoiceTypeChange(InvoiceType.PURCHASE)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              invoiceType === InvoiceType.PURCHASE
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase Invoice
          </button>
          <button
            type="button"
            onClick={() => handleInvoiceTypeChange(InvoiceType.QUOTATION)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              invoiceType === InvoiceType.QUOTATION
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quotation / Estimate
          </button>
        </div>
      </div>

      {/* Quotation Non-Financial Notice Banner */}
      {invoiceType === InvoiceType.QUOTATION && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Quotation / Estimate Mode:</strong> This document is created for estimates and customer pricing quotes. It <strong>will not post to party ledgers or alter customer balance</strong> until officially converted into a Tax Invoice.
          </span>
        </div>
      )}

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Party & Invoice Details & Line Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Party & Date Section */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                {invoiceType === InvoiceType.PURCHASE
                  ? 'Supplier (Party)'
                  : 'Customer (Party)'}
              </span>
              <button
                type="button"
                onClick={() => setShowQuickCustomerModal(true)}
                className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add New Party</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Party Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Party / Company
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                >
                  {clients
                    .filter((c) =>
                      invoiceType === InvoiceType.PURCHASE
                        ? c.clientType === 'supplier' || c.clientType === 'customer'
                        : true
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.registerNumber ? `(GST: ${c.registerNumber})` : ''} - {c.city}
                      </option>
                    ))}
                </select>
              </div>

              {/* GST Tax Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax Calculation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTaxType('CGST_SGST')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center ${
                      taxType === 'CGST_SGST'
                        ? 'bg-brand-50 text-brand-700 border-brand-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Intra-State (CGST + SGST)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaxType('IGST')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition text-center ${
                      taxType === 'IGST'
                        ? 'bg-brand-50 text-brand-700 border-brand-300 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Inter-State (IGST)
                  </button>
                </div>
              </div>
            </div>

            {/* Invoice Meta Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full text-xs font-mono font-bold p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="e.g. 15 Days Credit"
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-brand-600"
                />
              </div>
            </div>

            {/* Consignee Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsignee}
                  onChange={(e) => setHasConsignee(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  Different Consignee / "Ship-To" Address
                </span>
              </label>
            </div>

            {hasConsignee && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">
                    Ship-To Party Name
                  </label>
                  <input
                    type="text"
                    value={consignee.name}
                    onChange={(e) =>
                      setConsignee({ ...consignee, name: e.target.value })
                    }
                    placeholder="Recipient Firm"
                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">
                    Address & City
                  </label>
                  <input
                    type="text"
                    value={consignee.address}
                    onChange={(e) =>
                      setConsignee({ ...consignee, address: e.target.value })
                    }
                    placeholder="Warehouse / Site address"
                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">
                    Ship-To GSTIN (if any)
                  </label>
                  <input
                    type="text"
                    value={consignee.registerNumber}
                    onChange={(e) =>
                      setConsignee({
                        ...consignee,
                        registerNumber: e.target.value,
                      })
                    }
                    placeholder="GSTIN"
                    className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono uppercase"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Line Items & Products ({items.length})
              </span>
              <button
                type="button"
                id="btn-add-item-row"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </button>
            </div>

            {/* Items Rows */}
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                      {idx + 1}
                    </span>

                    {/* Product Name & Description */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          list={`product-list-${idx}`}
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(idx, 'name', e.target.value)
                          }
                          placeholder="Item Name / Product"
                          className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg focus:border-brand-600 focus:ring-1 focus:ring-brand-500"
                        />
                        <datalist id={`product-list-${idx}`}>
                          {products.map((p) => (
                            <option key={p.id} value={p.name} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) =>
                            handleItemChange(idx, 'hsnCode', e.target.value)
                          }
                          placeholder="HSN/SAC Code"
                          className="w-full text-xs font-mono p-2 bg-white border border-slate-300 rounded-lg focus:border-brand-600"
                        />
                      </div>
                    </div>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quantity, Rate, Unit, Tax, Discount */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(idx, 'qty', Number(e.target.value))
                        }
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-center"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">
                        Unit
                      </label>
                      <select
                        value={item.unit || 'Nos'}
                        onChange={(e) =>
                          handleItemChange(idx, 'unit', e.target.value)
                        }
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Nos">Nos</option>
                        <option value="Pcs">Pcs</option>
                        <option value="Roll">Roll</option>
                        <option value="Kg">Kg</option>
                        <option value="Mtr">Mtr</option>
                        <option value="Box">Box</option>
                        <option value="Set">Set</option>
                        <option value="Ltr">Ltr</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={item.baseRate}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            'baseRate',
                            Number(e.target.value)
                          )
                        }
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-mono text-right"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">
                        Disc %
                      </label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          value={item.discountRate || 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            handleItemChange(idx, 'discountRate', val);
                            handleItemChange(idx, 'isDiscountApplied', val > 0);
                            handleItemChange(idx, 'flatOrPercentage', 'percentage');
                          }}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">
                        GST %
                      </label>
                      <select
                        value={item.taxPercentage}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            'taxPercentage',
                            Number(e.target.value)
                          )
                        }
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-semibold">
                        Line Total
                      </label>
                      <div className="p-1.5 bg-slate-100 rounded-lg font-mono font-bold text-right text-slate-900">
                        ₹
                        {formatNumberIndian(
                          calcResult.items[idx]?.lineTotal || 0
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subline detail note */}
                  <div>
                    <input
                      type="text"
                      value={item.subline1 || ''}
                      onChange={(e) =>
                        handleItemChange(idx, 'subline1', e.target.value)
                      }
                      placeholder="Optional specifications / warranty / serial number note"
                      className="w-full text-[11px] p-1.5 bg-white/70 border border-slate-200 rounded text-slate-600 focus:bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Extra Charges Section (Freight, Insurance) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Extra Charges (Freight / Delivery / Packaging)
                </span>
                <button
                  type="button"
                  onClick={handleAddFreight}
                  className="text-xs text-brand-700 font-bold hover:underline"
                >
                  + Add Freight Charge
                </button>
              </div>

              {extraItems.map((ex, exIdx) => (
                <div
                  key={ex.id || exIdx}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <input
                    type="text"
                    value={ex.name}
                    onChange={(e) => {
                      const next = [...extraItems];
                      next[exIdx].name = e.target.value;
                      setExtraItems(next);
                    }}
                    placeholder="Charge Name"
                    className="flex-1 p-1.5 bg-white border border-slate-300 rounded font-semibold"
                  />
                  <div className="w-24">
                    <input
                      type="number"
                      value={ex.baseRate}
                      onChange={(e) => {
                        const next = [...extraItems];
                        next[exIdx].baseRate = Number(e.target.value);
                        setExtraItems(next);
                      }}
                      placeholder="Amount ₹"
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono text-right"
                    />
                  </div>
                  <div className="w-20">
                    <select
                      value={ex.taxPercentage}
                      onChange={(e) => {
                        const next = [...extraItems];
                        next[exIdx].taxPercentage = Number(e.target.value);
                        setExtraItems(next);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={18}>18%</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExtraItem(exIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* TCS Section (Tax Collected at Source - Section 206C) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-700">
                    TCS (Tax Collected at Source)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Sec 206C(1H) / 206C(1)
                  </span>
                </div>
                {calcResult.calc.tcsAmount > 0 && (
                  <span className="text-xs font-mono font-bold text-brand-700">
                    +₹{formatNumberIndian(calcResult.calc.tcsAmount)}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTcsPercentage(0)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tcsPercentage === 0
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  No TCS (0%)
                </button>
                <button
                  type="button"
                  onClick={() => setTcsPercentage(0.1)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tcsPercentage === 0.1
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  TCS @ 0.1% (Sales &gt; ₹50L)
                </button>
                <button
                  type="button"
                  onClick={() => setTcsPercentage(1.0)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tcsPercentage === 1.0
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  TCS @ 1% (Scrap / Non-PAN)
                </button>
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1">
                  <span className="text-[11px] text-slate-500 font-medium">Custom:</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="15"
                    value={tcsPercentage || ''}
                    onChange={(e) => setTcsPercentage(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-12 text-xs font-mono font-bold bg-transparent text-right outline-none text-slate-900"
                  />
                  <span className="text-xs text-slate-500 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transport & Shipping Details Section */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-brand-600" />
              Transport & Dispatch Details (Optional)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  E-Way Bill Number
                </label>
                <input
                  type="text"
                  value={eway}
                  onChange={(e) => setEway(e.target.value)}
                  placeholder="e.g. 12-digit number"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. TN 45 BD 0636"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg uppercase font-mono font-bold focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Delivery Note
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Delivery Note Ref"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Delivery Note Date
                </label>
                <input
                  type="date"
                  value={deliveryNoteDate}
                  onChange={(e) => setDeliveryNoteDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Buyer's Order / PO No.
                </label>
                <input
                  type="text"
                  value={buyersOrderNo}
                  onChange={(e) => setBuyersOrderNo(e.target.value)}
                  placeholder="PO Reference"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Buyer's Order Date
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Dispatched Document No.
                </label>
                <input
                  type="text"
                  value={dispatchDocNo}
                  onChange={(e) => setDispatchDocNo(e.target.value)}
                  placeholder="Doc / LR Number"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Dispatched Through
                </label>
                <input
                  type="text"
                  value={dispatchedThrough}
                  onChange={(e) => setDispatchedThrough(e.target.value)}
                  placeholder="e.g. By Road / VRL"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination City"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] text-slate-500 font-semibold">
                  Terms of Delivery
                </label>
                <input
                  type="text"
                  value={termsOfDelivery}
                  onChange={(e) => setTermsOfDelivery(e.target.value)}
                  placeholder="e.g. Ex-Factory / Door Delivery / Freight to Pay"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Calculation Summary & Save Actions */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 sticky top-20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100">
              Billing & Tax Calculation
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Amount (Subtotal)</span>
                <span className="font-mono font-semibold">
                  ₹{formatNumberIndian(calcResult.calc.subTotal)}
                </span>
              </div>

              {calcResult.calc.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Total Discount</span>
                  <span className="font-mono font-semibold">
                    -₹{formatNumberIndian(calcResult.calc.totalDiscount)}
                  </span>
                </div>
              )}

              {taxType === 'CGST_SGST' ? (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Central GST (CGST)</span>
                    <span className="font-mono font-semibold">
                      ₹{formatNumberIndian(calcResult.calc.taxAmount / 2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>State GST (SGST)</span>
                    <span className="font-mono font-semibold">
                      ₹{formatNumberIndian(calcResult.calc.taxAmount / 2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600">
                  <span>Integrated GST (IGST)</span>
                  <span className="font-mono font-semibold">
                    ₹{formatNumberIndian(calcResult.calc.taxAmount)}
                  </span>
                </div>
              )}

              {calcResult.calc.extraItemsTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Extra Charges</span>
                  <span className="font-mono font-semibold">
                    +₹{formatNumberIndian(calcResult.calc.extraItemsTotal)}
                  </span>
                </div>
              )}

              {calcResult.calc.tcsAmount > 0 && (
                <div className="flex justify-between text-brand-700 bg-brand-50/70 p-1.5 rounded-lg font-semibold">
                  <span>TCS @ {calcResult.calc.tcsPercentage}% (Sec 206C)</span>
                  <span className="font-mono">
                    +₹{formatNumberIndian(calcResult.calc.tcsAmount)}
                  </span>
                </div>
              )}

              {calcResult.calc.roundOffValue !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off</span>
                  <span className="font-mono">
                    {calcResult.calc.roundOffValue > 0 ? '+' : ''}
                    {calcResult.calc.roundOffValue.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total Bill Figure */}
              <div className="pt-3 border-t-2 border-slate-900 flex items-center justify-between text-slate-900">
                <span className="font-extrabold text-sm">Total Bill Figure</span>
                <span className="font-mono font-extrabold text-xl text-brand-700">
                  ₹{formatNumberIndian(calcResult.calc.billFigure)}
                </span>
              </div>

              {/* Amount in words */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 leading-tight">
                <span className="font-bold block text-[10px] text-slate-500 uppercase">
                  In Words:
                </span>
                {calcResult.calc.amountInWords}
              </div>
            </div>

            {/* Payment Collection Entry */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Advance / Received Amount (₹)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    max={calcResult.calc.billFigure}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setPaidAmount(calcResult.calc.billFigure)}
                    className="px-2.5 py-2 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 rounded-xl whitespace-nowrap text-slate-700"
                  >
                    Full Paid
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Balance Due:</span>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  ₹{formatNumberIndian(calcResult.calc.dueAmount)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="UPI / Bank Transfer">UPI / Google Pay</option>
                  <option value="Cash">Cash in Hand</option>
                  <option value="NEFT / RTGS">Bank NEFT / RTGS / IMPS</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Unpaid / Credit">Unpaid (Credit)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {isLocked ? (
                <button
                  type="button"
                  id="btn-trial-locked-upgrade"
                  onClick={onOpenUpgradeModal}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-md flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {readOnlyReason === 'ACCOUNT_SUSPENDED' || readOnlyReason === 'SUSPENDED'
                      ? 'Account Suspended — View Subscription'
                      : readOnlyReason === 'SUBSCRIPTION_EXPIRED'
                      ? 'Subscription Expired — Renew Plan to Save'
                      : 'Trial Expired — Upgrade Plan to Save Bill'}
                  </span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    id="btn-save-invoice-print"
                    onClick={() => handleSubmit(true)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Save & Print Tally V4 Invoice</span>
                  </button>

                  <button
                    type="button"
                    id="btn-save-invoice-only"
                    onClick={() => handleSubmit(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Bill Only</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onCancel}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      {showQuickCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-brand-600" />
              <span>Add New Party</span>
            </h3>

            <form onSubmit={handleSaveQuickCustomer} className="space-y-3">
              {quickCustGstError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{quickCustGstError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Party / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Annai Traders"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    GSTIN (optional)
                  </label>
                  <span className="text-[10px] text-slate-500">15 digits</span>
                </div>
                <input
                  type="text"
                  value={newCustGstin}
                  onChange={(e) => handleQuickGstinChange(e.target.value)}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className={`w-full text-xs font-mono uppercase p-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none ${
                    newCustGstin && !quickGstValidation.isValid
                      ? 'border-red-400 focus:border-red-500 bg-red-50/30'
                      : newCustGstin && quickGstValidation.isValid && !quickGstValidation.isUnregistered
                      ? 'border-emerald-400 focus:border-emerald-500 bg-emerald-50/20'
                      : 'border-slate-300 focus:border-brand-600'
                  }`}
                />
                {newCustGstin.trim() && (
                  <div className="mt-1">
                    {quickGstValidation.isValid && !quickGstValidation.isUnregistered ? (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Valid ({quickGstValidation.stateCode} - {quickGstValidation.stateName})
                        </span>
                      </div>
                    ) : !quickGstValidation.isValid ? (
                      <div className="flex items-start gap-1 text-[10.5px] font-medium text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                        <span>{quickGstValidation.message}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="City"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      State
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Code: {getStateCodeByName(newCustState) || '--'}
                    </span>
                  </div>
                  <select
                    value={newCustState}
                    onChange={(e) => {
                      setNewCustState(e.target.value);
                      setQuickCustGstError(null);
                    }}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-brand-600"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickCustomerModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                >
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
