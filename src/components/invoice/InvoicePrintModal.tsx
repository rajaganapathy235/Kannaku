import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCheck,
  Layers,
  Palette,
  Printer,
  QrCode,
  Share2,
  X,
} from 'lucide-react';
import {
  CompanyProfile,
  Invoice,
  InvoiceCopyType,
  InvoiceType,
} from '../../types';
import { formatIndianCurrency, formatNumberIndian } from '../../utils/numberToWords';

interface InvoicePrintModalProps {
  invoice: Invoice;
  company: CompanyProfile;
  onClose: () => void;
  onEdit?: () => void;
  onConvertQuotation?: (invoice: Invoice) => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  company,
  onClose,
  onEdit,
  onConvertQuotation,
}) => {
  const [selectedCopy, setSelectedCopy] = useState<InvoiceCopyType>(
    invoice.copyType || InvoiceCopyType.ORIGINAL
  );
  const [colorTheme, setColorTheme] = useState<'blue' | 'emerald' | 'slate' | 'indigo' | 'crimson'>(
    company.colorScheme || 'blue'
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const getCopyLabel = (copyType: InvoiceCopyType): string => {
    switch (copyType) {
      case InvoiceCopyType.ORIGINAL:
        return 'ORIGINAL FOR RECIPIENT';
      case InvoiceCopyType.DUPLICATE:
        return 'DUPLICATE FOR TRANSPORTER';
      case InvoiceCopyType.TRIPLICATE:
        return 'TRIPLICATE FOR SUPPLIER';
      case InvoiceCopyType.DEL_NOTE:
        return 'DELIVERY NOTE';
      case InvoiceCopyType.CREDIT_NOTE:
        return 'CREDIT NOTE';
      case InvoiceCopyType.DEBIT_NOTE:
        return 'DEBIT NOTE';
      case InvoiceCopyType.CHALAN:
        return 'DELIVERY CHALLAN';
      case InvoiceCopyType.RECEIPT:
        return 'PAYMENT RECEIPT';
      case InvoiceCopyType.ALL_COPIES:
        return 'ALL COPIES (ORIGINAL + DUPLICATE + TRIPLICATE)';
      default:
        return 'TAX INVOICE';
    }
  };

  const getInvoiceTitle = (): string => {
    if (invoice.invoiceType === InvoiceType.SALES) {
      return selectedCopy === InvoiceCopyType.CHALAN ? 'DELIVERY CHALLAN' : 'TAX INVOICE';
    }
    if (invoice.invoiceType === InvoiceType.PURCHASE) return 'PURCHASE INVOICE';
    if (invoice.invoiceType === InvoiceType.QUOTATION) return 'QUOTATION / ESTIMATE';
    return 'TAX INVOICE';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const rawPhone = invoice.clientSnapshot?.mobile ? invoice.clientSnapshot.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    
    const itemsSummary = invoice.items
      .slice(0, 3)
      .map((it) => `• ${it.name} (${it.qty} ${it.unit}) - Rs. ${it.lineTotal}`)
      .join('\n');
    const moreItemsNote = invoice.items.length > 3 ? `\n• ...and ${invoice.items.length - 3} more items` : '';

    const message = `*${getInvoiceTitle()} - ${company.name}*
━━━━━━━━━━━━━━━━━━━━
📄 *Bill No:* ${invoice.invoiceNumber}
📅 *Date:* ${invoice.date}
👤 *Billed To:* ${invoice.clientSnapshot?.name}
${invoice.clientSnapshot?.registerNumber ? `🏛 *GSTIN:* ${invoice.clientSnapshot.registerNumber}\n` : ''}
📦 *Items Summary:*
${itemsSummary}${moreItemsNote}
━━━━━━━━━━━━━━━━━━━━
💰 *Grand Total:* Rs. ${formatNumberIndian(invoice.calc.billFigure)}
💵 *Paid Amount:* Rs. ${formatNumberIndian(invoice.calc.paidAmount || 0)}
⏳ *Balance Due:* Rs. ${formatNumberIndian(invoice.calc.dueAmount)}
📌 *Status:* ${invoice.status}

💳 *Bank / UPI Payment Details:*
• *UPI ID:* ${company.bankDetail.upiId}
• *Bank:* ${company.bankDetail.bankName}
• *A/C No:* ${company.bankDetail.accountNumber}
• *IFSC Code:* ${company.bankDetail.ifscCode}

_Thank you for doing business with ${company.name}!_`;

    const encodedText = encodeURIComponent(message);
    const url = phone ? `https://wa.me/${phone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    const text = `${getInvoiceTitle()} - ${invoice.invoiceNumber} | Party: ${invoice.clientSnapshot.name} | Total: ${formatIndianCurrency(invoice.calc.billFigure)} | Due: ${formatIndianCurrency(invoice.calc.dueAmount)}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const themeClasses = {
    blue: {
      headerBg: 'bg-blue-800 text-white',
      borderColor: 'border-blue-900',
      accentText: 'text-blue-900',
      subHeaderBg: 'bg-blue-50 text-blue-950',
      tagBg: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    emerald: {
      headerBg: 'bg-emerald-800 text-white',
      borderColor: 'border-emerald-900',
      accentText: 'text-emerald-900',
      subHeaderBg: 'bg-emerald-50 text-emerald-950',
      tagBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    slate: {
      headerBg: 'bg-slate-800 text-white',
      borderColor: 'border-slate-800',
      accentText: 'text-slate-900',
      subHeaderBg: 'bg-slate-100 text-slate-950',
      tagBg: 'bg-slate-200 text-slate-800 border-slate-300',
    },
    indigo: {
      headerBg: 'bg-indigo-900 text-white',
      borderColor: 'border-indigo-900',
      accentText: 'text-indigo-950',
      subHeaderBg: 'bg-indigo-50 text-indigo-950',
      tagBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    },
    crimson: {
      headerBg: 'bg-rose-900 text-white',
      borderColor: 'border-rose-900',
      accentText: 'text-rose-950',
      subHeaderBg: 'bg-rose-50 text-rose-950',
      tagBg: 'bg-rose-100 text-rose-900 border-rose-300',
    },
  }[colorTheme];

  // If ALL_COPIES is chosen, render copies sequentially
  const copiesToRender =
    selectedCopy === InvoiceCopyType.ALL_COPIES
      ? [
          InvoiceCopyType.ORIGINAL,
          InvoiceCopyType.DUPLICATE,
          InvoiceCopyType.TRIPLICATE,
        ]
      : [selectedCopy];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar (Controls) */}
        <div className="no-print p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                Tally V4 GST Invoice Preview
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {invoice.invoiceNumber} • {invoice.clientSnapshot.name}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Copy Type Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Copy:
              </span>
              <select
                value={selectedCopy}
                onChange={(e) =>
                  setSelectedCopy(Number(e.target.value) as InvoiceCopyType)
                }
                className="bg-slate-700 text-white rounded px-2 py-1 focus:outline-none text-xs font-semibold cursor-pointer"
              >
                <option value={InvoiceCopyType.ORIGINAL}>Original (Recipient)</option>
                <option value={InvoiceCopyType.DUPLICATE}>Duplicate (Transporter)</option>
                <option value={InvoiceCopyType.TRIPLICATE}>Triplicate (Supplier)</option>
                <option value={InvoiceCopyType.ALL_COPIES}>All 3 Copies (Multi-page)</option>
                <option value={InvoiceCopyType.CHALAN}>Delivery Challan</option>
                <option value={InvoiceCopyType.DEL_NOTE}>Delivery Note</option>
              </select>
            </div>

            {/* Color Accent Picker */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1.5 gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              {(['blue', 'emerald', 'indigo', 'slate', 'crimson'] as const).map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setColorTheme(c)}
                    className={`w-4 h-4 rounded-full border ${
                      colorTheme === c
                        ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-800'
                        : 'opacity-70 hover:opacity-100'
                    } ${
                      c === 'blue'
                        ? 'bg-blue-600'
                        : c === 'emerald'
                        ? 'bg-emerald-600'
                        : c === 'indigo'
                        ? 'bg-indigo-600'
                        : c === 'slate'
                        ? 'bg-slate-600'
                        : 'bg-rose-600'
                    }`}
                  />
                )
              )}
            </div>

            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopySummary}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {copiedLink ? 'Copied' : 'Copy'}
              </span>
            </button>

            {/* Quotation Conversion CTA */}
            {invoice.invoiceType === InvoiceType.QUOTATION && (
              invoice.isConverted ? (
                <div
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5"
                  title={`This estimate was converted to Tax Invoice ${invoice.convertedInvoiceNumber || ''}`}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Converted to {invoice.convertedInvoiceNumber || 'Invoice'}</span>
                </div>
              ) : onConvertQuotation ? (
                <button
                  onClick={() => onConvertQuotation(invoice)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  title="Convert Quotation into Official Tax Invoice & Post to Ledger"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Convert to Tax Invoice</span>
                </button>
              ) : null
            )}

            {/* Print Action */}
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Paper Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/70 flex justify-center">
          <div
            id="printable-invoice"
            className="w-full max-w-[820px] bg-white text-slate-950 font-sans shadow-lg p-4 sm:p-6 text-[12px] leading-tight select-text space-y-8"
          >
            {copiesToRender.map((currCopy, copyIdx) => {
              const totalQuantity = invoice.items.reduce(
                (sum, item) => sum + (Number(item.qty) || 0),
                0
              );
              const isInterState = invoice.invoiceTaxType === 'IGST';

              const formatVal = (val?: string | number | null) => {
                if (val === undefined || val === null || val === '') return '';
                return String(val);
              };

              const formatDateStr = (d?: string) => {
                if (!d) return '';
                if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
                  const [y, m, day] = d.split('-');
                  return `${day}/${m}/${y}`;
                }
                return d;
              };

              return (
                <div
                  key={copyIdx}
                  className={`border border-black bg-white text-black font-sans text-[11px] leading-tight ${
                    copyIdx > 0 ? 'page-break-before pt-6' : ''
                  }`}
                >
                  {/* 1. Header & Title Block */}
                  <div className="py-1.5 text-center border-b border-black">
                    <h1 className="text-sm font-bold tracking-wide uppercase text-black">
                      {getInvoiceTitle()}
                    </h1>
                    {getCopyLabel(currCopy) && (
                      <span className="text-[9.5px] font-semibold text-slate-600 block">
                        ({getCopyLabel(currCopy)})
                      </span>
                    )}
                  </div>

                  {/* 2. Top Info: Left (Seller + Buyer) & Right (Metadata Grid) */}
                  <div className="grid grid-cols-2 border-b border-black">
                    {/* Left Column: Seller Details & Buyer (Bill To) */}
                    <div className="border-r border-black flex flex-col justify-between">
                      {/* Seller Info */}
                      <div className="p-2 space-y-0.5">
                        <div className="text-xs font-bold uppercase text-black">
                          {company.name}
                        </div>
                        <div className="text-[10px] text-slate-800 leading-snug">
                          {company.address}
                        </div>
                        <div className="text-[10px] text-slate-800">
                          City : {company.city}
                          {company.pin ? ` - ${company.pin}` : ''}
                        </div>
                        <div className="text-[10px] font-bold text-black pt-0.5">
                          GSTIN/UIN :{' '}
                          <span className="font-mono">{company.registerNumber}</span>
                        </div>
                        <div className="text-[10px] text-slate-800">
                          State Name : {company.state} Code :{company.code}
                        </div>
                        <div className="text-[10px] text-slate-800">
                          Email : {formatVal(company.email)}
                        </div>
                        <div className="text-[10px] text-slate-800">
                          Mobile : {formatVal(company.mobile)}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-black" />

                      {/* Buyer Info */}
                      <div className="p-2 space-y-0.5 bg-white">
                        <div className="text-[10px] font-bold uppercase text-slate-700">
                          Buyer (Bill To)
                        </div>
                        <div className="text-xs font-bold uppercase text-black">
                          {invoice.clientSnapshot.name}
                        </div>
                        <div className="text-[10px] text-slate-800 leading-snug">
                          {invoice.clientSnapshot.address}
                        </div>
                        <div className="text-[10px] text-slate-800">
                          City : {invoice.clientSnapshot.city}
                          {invoice.clientSnapshot.pin
                            ? ` , ${invoice.clientSnapshot.state.toUpperCase()} - ${invoice.clientSnapshot.pin}`
                            : ''}
                        </div>
                        <div className="text-[10px] font-bold text-black pt-0.5">
                          GSTIN/UIN :{' '}
                          <span className="font-mono">
                            {formatVal(invoice.clientSnapshot.registerNumber)}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-800">
                          State Name : {invoice.clientSnapshot.state} Code :
                          {invoice.clientSnapshot.code || '33'}
                        </div>
                        <div className="text-[10px] text-slate-800">
                          Email : {formatVal(invoice.clientSnapshot.email)}
                        </div>
                        <div className="text-[10px] text-slate-800">
                          Mobile : {formatVal(invoice.clientSnapshot.mobile)}
                        </div>
                      </div>

                      {/* Optional Consignee (Ship To) if different */}
                      {invoice.consignee && invoice.consignee.shouldVisible && (
                        <>
                          <div className="border-t border-black" />
                          <div className="p-2 bg-slate-50 text-[10px] space-y-0.5">
                            <div className="font-bold text-slate-700 uppercase text-[9px]">
                              Consignee (Ship To)
                            </div>
                            <div className="font-bold text-black">
                              {invoice.consignee.name}
                            </div>
                            <div className="text-slate-700">
                              {invoice.consignee.address}, {invoice.consignee.city} -{' '}
                              {invoice.consignee.pin}
                            </div>
                            <div>
                              GSTIN :{' '}
                              <span className="font-mono font-bold">
                                {formatVal(invoice.consignee.registerNumber)}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right Column: Exact Tally Metadata Grid */}
                    <div className="text-[10px]">
                      {/* Row 1: Invoice No & Dated */}
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-1.5 border-r border-black min-h-[36px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">Invoice No:</div>
                          <div className="font-bold text-[11px] font-mono text-black">
                            {invoice.invoiceNumber}
                          </div>
                        </div>
                        <div className="p-1.5 min-h-[36px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">Dated</div>
                          <div className="font-bold text-[11px] text-black">
                            {formatDateStr(invoice.date)}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Delivery Note & Mode/Terms of Payment */}
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-1.5 border-r border-black min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">Delivery Note</div>
                          <div className="font-semibold text-black">
                            {formatVal(invoice.deliveryNote)}
                          </div>
                        </div>
                        <div className="p-1.5 min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">
                            Mode/Terms of Payment
                          </div>
                          <div className="font-semibold text-black">
                            {formatVal(invoice.terms)}
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Eway Bill Number & Vehicle Number */}
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-1.5 border-r border-black min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">
                            Eway Bill Number
                          </div>
                          <div className="font-mono font-bold text-black">
                            {formatVal(invoice.eway)}
                          </div>
                        </div>
                        <div className="p-1.5 min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">
                            Vehicle Number
                          </div>
                          <div className="font-mono font-bold text-xs uppercase text-black">
                            {formatVal(invoice.vehicleNo)}
                          </div>
                        </div>
                      </div>

                      {/* Row 4: Buyer's Order No & Order Date */}
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-1.5 border-r border-black min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">
                            Buyer's Order No.
                          </div>
                          <div className="font-semibold text-black">
                            {formatVal(invoice.buyersOrderNo)}
                          </div>
                        </div>
                        <div className="p-1.5 min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">Date</div>
                          <div className="font-semibold text-black">
                            {formatDateStr(invoice.orderDate)}
                          </div>
                        </div>
                      </div>

                      {/* Row 5: Dispatched Doc No & Delivery Note Date */}
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-1.5 border-r border-black min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">
                            Dispatched Document No.
                          </div>
                          <div className="font-semibold text-black">
                            {formatVal(invoice.dispatchDocNo)}
                          </div>
                        </div>
                        <div className="p-1.5 min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">
                            Delivery Note Date
                          </div>
                          <div className="font-semibold text-black">
                            {formatDateStr(invoice.deliveryNoteDate)}
                          </div>
                        </div>
                      </div>

                      {/* Row 6: Dispatched through & Destination */}
                      <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-1.5 border-r border-black min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">
                            Dispatched through
                          </div>
                          <div className="font-semibold text-black">
                            {formatVal(invoice.dispatchedThrough)}
                          </div>
                        </div>
                        <div className="p-1.5 min-h-[32px]">
                          <div className="text-slate-600 font-medium text-[9.5px]">Destination</div>
                          <div className="font-semibold text-black">
                            {formatVal(invoice.destination)}
                          </div>
                        </div>
                      </div>

                      {/* Row 7: Terms of Delivery */}
                      <div className="p-1.5 min-h-[32px]">
                        <div className="text-slate-600 font-medium text-[9.5px]">
                          Terms of Delivery
                        </div>
                        <div className="font-medium text-black">
                          {formatVal(invoice.termsOfDelivery)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Main Products / Items Table */}
                  <table className="w-full border-collapse text-[10.5px]">
                    <thead>
                      <tr className="font-bold border-b border-black bg-white">
                        <th className="py-1 px-1.5 border-r border-black w-8 text-center">
                          Sr.
                        </th>
                        <th className="py-1 px-2 border-r border-black text-center">
                          Description of Goods
                        </th>
                        <th className="py-1 px-2 border-r border-black text-center w-20">
                          HSN/SAC
                        </th>
                        <th className="py-1 px-2 border-r border-black text-center w-16">
                          Qty
                        </th>
                        <th className="py-1 px-2 border-r border-black text-center w-20">
                          Rate
                        </th>
                        <th className="py-1 px-2 border-r border-black text-center w-12">
                          per
                        </th>
                        <th className="py-1 px-2 text-center w-24">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, idx) => {
                        const itemTaxable =
                          item.taxableAmount ||
                          (Number(item.qty) || 0) * (Number(item.baseRate) || 0) -
                            (Number(item.discountAmount) || 0);

                        return (
                          <tr key={item.id || idx} className="align-top">
                            <td className="py-1 px-1.5 border-r border-black text-center font-mono">
                              {idx + 1}.
                            </td>
                            <td className="py-1 px-2 border-r border-black font-semibold text-black">
                              <div className="font-bold uppercase text-[10.5px]">
                                {item.name}
                              </div>
                              {item.subline1 && (
                                <div className="text-[9.5px] text-slate-700 font-normal">
                                  {item.subline1}
                                </div>
                              )}
                              {item.discountAmount > 0 && (
                                <div className="text-[9px] text-emerald-800 font-medium">
                                  (Less Discount: ₹{formatNumberIndian(item.discountAmount)})
                                </div>
                              )}
                            </td>
                            <td className="py-1 px-2 border-r border-black text-center font-mono">
                              {formatVal(item.hsnCode)}
                            </td>
                            <td className="py-1 px-2 border-r border-black text-right font-mono font-bold">
                              {(Number(item.qty) || 0).toFixed(2)}
                            </td>
                            <td className="py-1 px-2 border-r border-black text-right font-mono">
                              {formatNumberIndian(
                                isNaN(item.baseRate) ? 0 : item.baseRate
                              )}
                            </td>
                            <td className="py-1 px-2 border-r border-black text-center uppercase">
                              {formatVal(item.unit) || 'KGS'}
                            </td>
                            <td className="py-1 px-2 text-right font-mono font-bold text-black">
                              {formatNumberIndian(itemTaxable)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Extra line items like freight */}
                      {invoice.extraItems &&
                        invoice.extraItems.map((ex, exIdx) => (
                          <tr key={ex.id || exIdx} className="align-top italic">
                            <td className="py-1 px-1.5 border-r border-black text-center text-slate-500">
                              *
                            </td>
                            <td className="py-1 px-2 border-r border-black font-semibold text-slate-800">
                              {ex.name}
                            </td>
                            <td className="py-1 px-2 border-r border-black text-center font-mono">
                              {formatVal(ex.hsnCode)}
                            </td>
                            <td className="py-1 px-2 border-r border-black text-right font-mono">
                              1.00
                            </td>
                            <td className="py-1 px-2 border-r border-black text-right font-mono">
                              {formatNumberIndian(ex.baseRate)}
                            </td>
                            <td className="py-1 px-2 border-r border-black text-center">
                              {formatVal(ex.unit)}
                            </td>
                            <td className="py-1 px-2 text-right font-mono font-bold text-black">
                              {formatNumberIndian(ex.baseRate)}
                            </td>
                          </tr>
                        ))}

                      {/* Spacer row */}
                      <tr className="h-6">
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td className="border-r border-black"></td>
                        <td></td>
                      </tr>

                      {/* Tally In-Table GST Breakdown Lines */}
                      {!isInterState ? (
                        <>
                          <tr className="font-bold">
                            <td className="py-0.5 px-1.5 border-r border-black text-center"></td>
                            <td className="py-0.5 px-2 border-r border-black text-left uppercase text-[10px]">
                              CGST
                            </td>
                            <td className="py-0.5 px-2 border-r border-black text-center"></td>
                            <td className="py-0.5 px-2 border-r border-black text-right"></td>
                            <td className="py-0.5 px-2 border-r border-black text-right"></td>
                            <td className="py-0.5 px-2 border-r border-black text-center"></td>
                            <td className="py-0.5 px-2 text-right font-mono text-black font-bold">
                              {formatNumberIndian(invoice.calc.taxAmount / 2)}
                            </td>
                          </tr>
                          <tr className="font-bold">
                            <td className="py-0.5 px-1.5 border-r border-black text-center"></td>
                            <td className="py-0.5 px-2 border-r border-black text-left uppercase text-[10px]">
                              SGST
                            </td>
                            <td className="py-0.5 px-2 border-r border-black text-center"></td>
                            <td className="py-0.5 px-2 border-r border-black text-right"></td>
                            <td className="py-0.5 px-2 border-r border-black text-right"></td>
                            <td className="py-0.5 px-2 border-r border-black text-center"></td>
                            <td className="py-0.5 px-2 text-right font-mono text-black font-bold">
                              {formatNumberIndian(invoice.calc.taxAmount / 2)}
                            </td>
                          </tr>
                        </>
                      ) : (
                        <tr className="font-bold">
                          <td className="py-0.5 px-1.5 border-r border-black text-center"></td>
                          <td className="py-0.5 px-2 border-r border-black text-left uppercase text-[10px]">
                            IGST
                          </td>
                          <td className="py-0.5 px-2 border-r border-black text-center"></td>
                          <td className="py-0.5 px-2 border-r border-black text-right"></td>
                          <td className="py-0.5 px-2 border-r border-black text-right"></td>
                          <td className="py-0.5 px-2 border-r border-black text-center"></td>
                          <td className="py-0.5 px-2 text-right font-mono text-black font-bold">
                            {formatNumberIndian(invoice.calc.taxAmount)}
                          </td>
                        </tr>
                      )}

                      {/* Round Off Row */}
                      {(invoice.calc.roundOffValue !== 0 || Math.abs(invoice.calc.roundOffValue || 0) < 0.0001) && (
                        <tr className="font-bold">
                          <td className="py-0.5 px-1.5 border-r border-black text-center"></td>
                          <td className="py-0.5 px-2 border-r border-black text-left uppercase text-[10px]">
                            ROUND OFF
                          </td>
                          <td className="py-0.5 px-2 border-r border-black text-center"></td>
                          <td className="py-0.5 px-2 border-r border-black text-right"></td>
                          <td className="py-0.5 px-2 border-r border-black text-right"></td>
                          <td className="py-0.5 px-2 border-r border-black text-center"></td>
                          <td className="py-0.5 px-2 text-right font-mono font-bold text-black">
                            {(invoice.calc.roundOffValue || 0) > 0 ? '+' : ''}
                            {Number(invoice.calc.roundOffValue || 0).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>

                    {/* Total Row */}
                    <tfoot>
                      <tr className="font-bold border-t border-b border-black text-[11px]">
                        <td className="py-1 px-1.5 border-r border-black text-left font-bold uppercase" colSpan={3}>
                          Total
                        </td>
                        <td className="py-1 px-2 border-r border-black text-right font-mono font-bold">
                          {totalQuantity.toFixed(2)}
                        </td>
                        <td className="py-1 px-2 border-r border-black"></td>
                        <td className="py-1 px-2 border-r border-black"></td>
                        <td className="py-1 px-2 text-right font-mono font-bold text-xs text-black">
                          {formatNumberIndian(invoice.calc.billFigure)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* 4. Amount Chargeable in Words */}
                  <div className="p-1.5 border-b border-black flex items-start justify-between text-[10.5px]">
                    <div>
                      <span className="text-slate-700 font-medium text-[9.5px] block">
                        Amount Chargeable (in words)
                      </span>
                      <span className="font-bold text-black">
                        {invoice.calc.amountInWords}
                      </span>
                    </div>
                    <div className="text-right font-bold text-[10px] text-slate-700">
                      E & OE
                    </div>
                  </div>

                  {/* 5. Tax Analysis & Summary Table (HSN/SAC Breakdown) */}
                  <div className="p-1.5 border-b border-black">
                    <table className="w-full border border-black text-[10px] text-center border-collapse">
                      <thead>
                        <tr className="font-bold border-b border-black">
                          <th rowSpan={2} className="p-1 border-r border-black w-24">
                            HSN/SAC
                          </th>
                          <th rowSpan={2} className="p-1 border-r border-black">
                            Taxable Value
                          </th>
                          {!isInterState ? (
                            <>
                              <th colSpan={2} className="p-1 border-r border-black">
                                State Tax
                              </th>
                              <th colSpan={2} className="p-1 border-r border-black">
                                Central Tax
                              </th>
                            </>
                          ) : (
                            <th colSpan={2} className="p-1 border-r border-black">
                              Integrated Tax
                            </th>
                          )}
                          <th rowSpan={2} className="p-1">
                            Total Tax Amount
                          </th>
                        </tr>
                        <tr className="font-bold border-b border-black">
                          {!isInterState ? (
                            <>
                              <th className="p-1 border-r border-black w-12">Rate</th>
                              <th className="p-1 border-r border-black w-20">Amount</th>
                              <th className="p-1 border-r border-black w-12">Rate</th>
                              <th className="p-1 border-r border-black w-20">Amount</th>
                            </>
                          ) : (
                            <>
                              <th className="p-1 border-r border-black w-14">Rate</th>
                              <th className="p-1 border-r border-black w-24">Amount</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.hsnSummary.map((hsn, hIdx) => {
                          const taxableVal = isNaN(hsn.taxableAmount)
                            ? 0
                            : hsn.taxableAmount;
                          const cgstRateVal =
                            (isNaN(hsn.cgstRate) ? 0 : hsn.cgstRate) ||
                            hsn.taxPercentage / 2;
                          const sgstRateVal =
                            (isNaN(hsn.sgstRate) ? 0 : hsn.sgstRate) ||
                            hsn.taxPercentage / 2;
                          const igstRateVal =
                            (isNaN(hsn.igstRate) ? 0 : hsn.igstRate) ||
                            hsn.taxPercentage;

                          const cgstAmtVal = isNaN(hsn.cgstAmount)
                            ? 0
                            : hsn.cgstAmount;
                          const sgstAmtVal = isNaN(hsn.sgstAmount)
                            ? 0
                            : hsn.sgstAmount;
                          const igstAmtVal = isNaN(hsn.igstAmount)
                            ? 0
                            : hsn.igstAmount;

                          const totalTax =
                            hsn.totalTaxAmount > 0
                              ? hsn.totalTaxAmount
                              : !isInterState
                              ? cgstAmtVal + sgstAmtVal
                              : igstAmtVal;

                          return (
                            <tr key={hIdx} className="border-b border-black">
                              <td className="p-1 border-r border-black font-mono font-bold">
                                {formatVal(hsn.hsnCode)}
                              </td>
                              <td className="p-1 border-r border-black font-mono text-right pr-2">
                                {formatNumberIndian(taxableVal)}
                              </td>
                              {!isInterState ? (
                                <>
                                  <td className="p-1 border-r border-black font-mono">
                                    {sgstRateVal.toFixed(2)}%
                                  </td>
                                  <td className="p-1 border-r border-black font-mono text-right pr-2">
                                    {formatNumberIndian(sgstAmtVal)}
                                  </td>
                                  <td className="p-1 border-r border-black font-mono">
                                    {cgstRateVal.toFixed(2)}%
                                  </td>
                                  <td className="p-1 border-r border-black font-mono text-right pr-2">
                                    {formatNumberIndian(cgstAmtVal)}
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-1 border-r border-black font-mono">
                                    {igstRateVal.toFixed(2)}%
                                  </td>
                                  <td className="p-1 border-r border-black font-mono text-right pr-2">
                                    {formatNumberIndian(igstAmtVal)}
                                  </td>
                                </>
                              )}
                              <td className="p-1 font-mono font-bold text-right pr-2 text-black">
                                {formatNumberIndian(totalTax)}
                              </td>
                            </tr>
                          );
                        })}

                        {/* Summary Total Row */}
                        <tr className="font-bold">
                          <td className="p-1 border-r border-black text-left pl-2">
                            Total
                          </td>
                          <td className="p-1 border-r border-black font-mono text-right pr-2">
                            {formatNumberIndian(invoice.calc.subTotal)}
                          </td>
                          {!isInterState ? (
                            <>
                              <td className="p-1 border-r border-black"></td>
                              <td className="p-1 border-r border-black font-mono text-right pr-2">
                                {formatNumberIndian(invoice.calc.taxAmount / 2)}
                              </td>
                              <td className="p-1 border-r border-black"></td>
                              <td className="p-1 border-r border-black font-mono text-right pr-2">
                                {formatNumberIndian(invoice.calc.taxAmount / 2)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-1 border-r border-black"></td>
                              <td className="p-1 border-r border-black font-mono text-right pr-2">
                                {formatNumberIndian(invoice.calc.taxAmount)}
                              </td>
                            </>
                          )}
                          <td className="p-1 font-mono font-bold text-right pr-2 text-black">
                            {formatNumberIndian(invoice.calc.taxAmount)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 6. Bank Details & Signatory Box */}
                  <div className="grid grid-cols-2">
                    {/* Left Column: Bank Details & Terms & Declaration */}
                    <div className="p-2 border-r border-black space-y-1 text-[10px]">
                      <div className="space-y-0.5 text-black">
                        <div>
                          <span className="font-semibold text-slate-700">
                            Our Bank :
                          </span>{' '}
                          <span className="font-bold uppercase">
                            {company.bankDetail.bankName || company.name}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">
                            Account Number :
                          </span>{' '}
                          <span className="font-mono font-bold">
                            {formatVal(company.bankDetail.accountNumber)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">
                            IFSC Code :
                          </span>{' '}
                          <span className="font-mono font-bold">
                            {formatVal(company.bankDetail.ifscCode)}
                          </span>
                          {company.bankDetail.branchName && (
                            <span className="ml-2">
                              Branch : {company.bankDetail.branchName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-black pt-1 space-y-0.5">
                        <div className="font-bold text-slate-800 uppercase text-[9.5px]">
                          Description
                        </div>
                        <p className="text-[9px] text-slate-800 leading-snug">
                          {invoice.description ||
                            'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.'}
                        </p>
                      </div>
                    </div>

                    {/* Right Column: Authorised Signatory */}
                    <div className="p-2 flex flex-col justify-between text-right relative min-h-[105px]">
                      <div className="text-[10px] text-black font-bold">
                        For <span className="uppercase">{company.name}</span>
                      </div>

                      <div className="relative my-0.5 h-12 flex items-center justify-end">
                        {/* Stamp */}
                        {company.stampUrl && (
                          <div className="absolute right-24 bottom-0 w-14 h-14 pointer-events-none opacity-85">
                            <img
                              src={company.stampUrl}
                              alt="Seal"
                              className="w-full h-full object-contain transform -rotate-12"
                            />
                          </div>
                        )}

                        {/* Signature */}
                        {company.signatureUrl ? (
                          <div className="h-10 max-w-[130px] z-10">
                            <img
                              src={company.signatureUrl}
                              alt="Signature"
                              className="h-full object-contain"
                            />
                          </div>
                        ) : company.signatureName ? (
                          <div
                            className="text-base font-bold text-blue-950 italic z-10 pr-2"
                            style={{ fontFamily: 'cursive' }}
                          >
                            {company.signatureName}
                          </div>
                        ) : (
                          <div className="h-6" />
                        )}
                      </div>

                      <div>
                        <div className="inline-block border-t border-black pt-0.5 text-[10px] font-bold text-black">
                          Authorised Signatory
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7. Footer tag */}
                  <div className="text-center py-1 text-[9px] text-slate-700 font-mono border-t border-black">
                    This is computer generated Invoice
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
