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
  Percent,
  Plus,
  Printer,
  Save,
  Trash2,
  Truck,
  UserPlus,
  Users,
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
}) => {
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
  const [buyersOrderNo, setBuyersOrderNo] = useState(
    editingInvoice?.buyersOrderNo || ''
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

  // Line Items
  const [items, setItems] = useState<Partial<InvoiceItem>[]>(
    editingInvoice
      ? editingInvoice.items
      : [
          {
            id: `item_${Date.now()}_1`,
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
  const [newCustState, setNewCustState] = useState(company.state);

  // When changing invoice type, generate new number if not editing
  const handleInvoiceTypeChange = (type: InvoiceType) => {
    setInvoiceType(type);
    if (!editingInvoice) {
      setInvoiceNumber(nextInvoiceNumber(type));
    }
  };

  // Auto-detect Tax Type when Client Changes (Inter-state if states differ)
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      if (
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
      const match = products.find((p) => p.name === value);
      if (match) {
        next[index].hsnCode = match.hsnCode;
        next[index].baseRate =
          invoiceType === InvoiceType.PURCHASE
            ? match.buyingPrice
            : match.sellingPrice;
        next[index].mrp = match.mrp;
        next[index].unit = match.unit;
        next[index].taxPercentage = match.taxRate;
        next[index].subline1 = match.subline1 || '';
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

    const newClient: Client = {
      id: `c_${Date.now()}`,
      name: newCustName.trim(),
      mobile: newCustPhone.trim(),
      address: 'Main Road',
      city: newCustCity.trim() || company.city,
      state: newCustState.trim() || company.state,
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
  };

  // Save invoice
  const handleSubmit = (andPrint: boolean = false) => {
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
      buyersOrderNo: buyersOrderNo.trim() || undefined,
      dispatchDocNo: dispatchDocNo.trim() || undefined,
      dispatchedThrough: dispatchedThrough.trim() || undefined,
      destination: destination.trim() || undefined,
      vehicleNo: vehicleNo.trim() || undefined,
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
                ? 'bg-blue-700 text-white shadow-xs'
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
                ? 'bg-blue-700 text-white shadow-xs'
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
                ? 'bg-blue-700 text-white shadow-xs'
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
                <Users className="w-3.5 h-3.5 text-blue-600" />
                {invoiceType === InvoiceType.PURCHASE
                  ? 'Supplier (Party)'
                  : 'Customer (Party)'}
              </span>
              <button
                type="button"
                onClick={() => setShowQuickCustomerModal(true)}
                className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 hover:underline"
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
                  className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
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
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
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
                        ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
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
                  className="w-full text-xs font-mono font-bold p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600"
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
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600"
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
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600"
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
                  className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-blue-600"
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
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
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
                          className="w-full text-xs font-bold p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
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
                          className="w-full text-xs font-mono p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600"
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
                            handleItemChange(
                              idx,
                              'isDiscountApplied',
                              val > 0
                            );
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
                  className="text-xs text-blue-700 font-bold hover:underline"
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
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Transport & Shipping Details Section */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
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
                  placeholder="12-digit number"
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
                  placeholder="e.g. TN 09 BX 4412"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg uppercase focus:bg-white"
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
                  placeholder="Transporter Name"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold">
                  Buyer's PO Number
                </label>
                <input
                  type="text"
                  value={buyersOrderNo}
                  onChange={(e) => setBuyersOrderNo(e.target.value)}
                  placeholder="PO Reference"
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
                <span className="font-mono font-extrabold text-xl text-blue-700">
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
              <button
                type="button"
                id="btn-save-invoice-print"
                onClick={() => handleSubmit(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md flex items-center justify-center gap-2 active:scale-98 transition"
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
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Add New Party</span>
            </h3>

            <form onSubmit={handleSaveQuickCustomer} className="space-y-3">
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
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
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
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  GSTIN (optional)
                </label>
                <input
                  type="text"
                  value={newCustGstin}
                  onChange={(e) => setNewCustGstin(e.target.value)}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  className="w-full text-xs font-mono uppercase p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
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
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={newCustState}
                    onChange={(e) => setNewCustState(e.target.value)}
                    placeholder="State"
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
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
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-sm"
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
