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
            {copiesToRender.map((currCopy, copyIdx) => (
              <div
                key={copyIdx}
                className={`border-2 ${themeClasses.borderColor} rounded-sm overflow-hidden bg-white ${
                  copyIdx > 0 ? 'page-break-before pt-6' : ''
                }`}
              >
                {/* 1. Header & Title Block */}
                <div
                  className={`${themeClasses.headerBg} p-2 text-center relative border-b-2 ${themeClasses.borderColor}`}
                >
                  <h1 className="text-base font-extrabold tracking-wider uppercase">
                    {getInvoiceTitle()}
                  </h1>
                  <span className="text-[10px] tracking-widest font-semibold opacity-90 block">
                    ({getCopyLabel(currCopy)})
                  </span>
                </div>

                {/* 2. Top Info Grid (Seller, Invoice Details, Buyer) */}
                <div className={`grid grid-cols-2 border-b-2 ${themeClasses.borderColor}`}>
                  {/* Left Column: Seller & Dispatch Details */}
                  <div
                    className={`p-3 border-r-2 ${themeClasses.borderColor} space-y-2`}
                  >
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                        Seller (Billed From):
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {company.name}
                      </div>
                      <div className="text-[11px] text-slate-700">
                        {company.address}
                      </div>
                      <div className="text-[11px] text-slate-700">
                        {company.city} - {company.pin}, {company.state} (Code:{' '}
                        <span className="font-mono font-bold">
                          {company.code}
                        </span>
                        )
                      </div>
                      <div className="text-[11px] text-slate-800 mt-1">
                        GSTIN/UIN:{' '}
                        <span className="font-mono font-bold">
                          {company.registerNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-700">
                        Email: {company.email} | Ph: {company.mobile}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[11px] space-y-0.5">
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-slate-500">Dispatch Doc:</span>{' '}
                          <span className="font-semibold">
                            {invoice.dispatchDocNo || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Through:</span>{' '}
                          <span className="font-semibold">
                            {invoice.dispatchedThrough || 'Direct'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <div>
                          <span className="text-slate-500">Destination:</span>{' '}
                          <span className="font-semibold">
                            {invoice.destination || company.city}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Vehicle No:</span>{' '}
                          <span className="font-mono font-semibold">
                            {invoice.vehicleNo || 'N/A'}
                          </span>
                        </div>
                      </div>
                      {invoice.eway && (
                        <div>
                          <span className="text-slate-500">E-Way Bill No:</span>{' '}
                          <span className="font-mono font-bold text-blue-900">
                            {invoice.eway}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Invoice Reference & Dates */}
                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-500">
                          Invoice No.
                        </div>
                        <div className="font-mono font-extrabold text-xs text-slate-900">
                          {invoice.invoiceNumber}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-500">
                          Dated
                        </div>
                        <div className="font-bold text-xs text-slate-900">
                          {invoice.date}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500">Delivery Note:</span>{' '}
                        <span className="font-semibold">
                          {invoice.deliveryNote || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Due Date:</span>{' '}
                        <span className="font-semibold text-rose-800">
                          {invoice.dueDate || 'Immediate'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Buyer Order No:</span>{' '}
                        <span className="font-semibold">
                          {invoice.buyersOrderNo || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Payment Terms:</span>{' '}
                        <span className="font-semibold">
                          {invoice.terms || 'Cash / Credit'}
                        </span>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                        Buyer (Bill To):
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {invoice.clientSnapshot.name}
                      </div>
                      <div className="text-[11px] text-slate-700">
                        {invoice.clientSnapshot.address}, {invoice.clientSnapshot.city} -{' '}
                        {invoice.clientSnapshot.pin}
                      </div>
                      <div className="text-[11px] text-slate-700">
                        State: {invoice.clientSnapshot.state} (Code:{' '}
                        <span className="font-mono font-bold">
                          {invoice.clientSnapshot.code || '33'}
                        </span>
                        )
                      </div>
                      <div className="text-[11px] text-slate-900 font-bold">
                        GSTIN/UIN:{' '}
                        <span className="font-mono">
                          {invoice.clientSnapshot.registerNumber || 'URP (Unregistered)'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Consignee (Ship To) if different */}
                {invoice.consignee && invoice.consignee.shouldVisible && (
                  <div
                    className={`p-2.5 bg-slate-50 text-[11px] border-b-2 ${themeClasses.borderColor}`}
                  >
                    <span className="font-bold text-slate-600 uppercase text-[10px] mr-2">
                      Consignee (Ship To):
                    </span>
                    <span className="font-bold">{invoice.consignee.name}</span>,{' '}
                    {invoice.consignee.address}, {invoice.consignee.city} -{' '}
                    {invoice.consignee.pin}, State: {invoice.consignee.state} |
                    GSTIN:{' '}
                    <span className="font-mono font-bold">
                      {invoice.consignee.registerNumber || 'Same as Buyer'}
                    </span>
                  </div>
                )}

                {/* 3. Main Products / Items Table */}
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr
                      className={`${themeClasses.subHeaderBg} font-bold text-left border-b-2 ${themeClasses.borderColor}`}
                    >
                      <th className="p-2 border-r border-slate-300 w-8 text-center">
                        #
                      </th>
                      <th className="p-2 border-r border-slate-300">
                        Description of Goods / Services
                      </th>
                      <th className="p-2 border-r border-slate-300 text-center w-20">
                        HSN/SAC
                      </th>
                      <th className="p-2 border-r border-slate-300 text-center w-14">
                        Qty
                      </th>
                      <th className="p-2 border-r border-slate-300 text-right w-20">
                        Rate (₹)
                      </th>
                      <th className="p-2 border-r border-slate-300 text-center w-12">
                        Per
                      </th>
                      <th className="p-2 border-r border-slate-300 text-right w-16">
                        Disc (₹)
                      </th>
                      <th className="p-2 border-r border-slate-300 text-center w-12">
                        GST%
                      </th>
                      <th className="p-2 text-right w-24">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr
                        key={item.id || idx}
                        className="border-b border-slate-200 hover:bg-slate-50/50"
                      >
                        <td className="p-2 border-r border-slate-200 text-center text-slate-500 font-mono">
                          {idx + 1}
                        </td>
                        <td className="p-2 border-r border-slate-200">
                          <div className="font-bold text-slate-900">
                            {item.name}
                          </div>
                          {item.subline1 && (
                            <div className="text-[10px] text-slate-500 italic">
                              {item.subline1}
                            </div>
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono">
                          {item.hsnCode || '-'}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-bold">
                          {item.qty}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono">
                          {formatNumberIndian(item.baseRate)}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center text-slate-600">
                          {item.unit || 'Nos'}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-600">
                          {item.discountAmount > 0
                            ? formatNumberIndian(item.discountAmount)
                            : '-'}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">
                          {item.taxPercentage}%
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          {formatNumberIndian(item.lineTotal)}
                        </td>
                      </tr>
                    ))}

                    {/* Extra line items like freight */}
                    {invoice.extraItems &&
                      invoice.extraItems.map((ex, exIdx) => (
                        <tr
                          key={ex.id || exIdx}
                          className="border-b border-slate-200 bg-slate-50/30 italic"
                        >
                          <td className="p-2 border-r border-slate-200 text-center text-slate-400">
                            *
                          </td>
                          <td className="p-2 border-r border-slate-200 font-semibold text-slate-700">
                            {ex.name}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">
                            {ex.hsnCode || '996511'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            1
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            {formatNumberIndian(ex.baseRate)}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            {ex.unit || 'Chg'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">
                            -
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-mono">
                            {ex.taxPercentage}%
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-slate-800">
                            {formatNumberIndian(ex.baseRate + ex.taxAmount)}
                          </td>
                        </tr>
                      ))}

                    {/* Empty placeholder rows to give authentic Tally page height if items < 3 */}
                    {invoice.items.length < 3 &&
                      Array.from({ length: 3 - invoice.items.length }).map(
                        (_, i) => (
                          <tr key={`empty-${i}`} className="border-b border-slate-100">
                            <td className="p-3 border-r border-slate-100">&nbsp;</td>
                            <td className="p-3 border-r border-slate-100"></td>
                            <td className="p-3 border-r border-slate-100"></td>
                            <td className="p-3 border-r border-slate-100"></td>
                            <td className="p-3 border-r border-slate-100"></td>
                            <td className="p-3 border-r border-slate-100"></td>
                            <td className="p-3 border-r border-slate-100"></td>
                            <td className="p-3 border-r border-slate-100"></td>
                            <td className="p-3"></td>
                          </tr>
                        )
                      )}
                  </tbody>

                  {/* Subtotal row */}
                  <tfoot>
                    <tr
                      className={`font-bold border-t-2 border-b-2 ${themeClasses.borderColor} bg-slate-50`}
                    >
                      <td colSpan={3} className="p-2 text-right border-r border-slate-300">
                        Total Quantity:{' '}
                        <span className="font-mono">
                          {invoice.items.reduce((acc, it) => acc + it.qty, 0)}
                        </span>
                      </td>
                      <td colSpan={3} className="p-2 text-right border-r border-slate-300">
                        Total Taxable:
                      </td>
                      <td className="p-2 text-right font-mono border-r border-slate-300">
                        {invoice.calc.totalDiscount > 0
                          ? `-${formatNumberIndian(invoice.calc.totalDiscount)}`
                          : '-'}
                      </td>
                      <td className="p-2 text-center border-r border-slate-300">
                        GST Total
                      </td>
                      <td className="p-2 text-right font-mono text-slate-900 text-xs font-extrabold">
                        {formatNumberIndian(
                          invoice.calc.subTotal + invoice.calc.taxAmount
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* 4. Amount in Words Block */}
                <div
                  className={`p-2.5 bg-slate-50/80 border-b border-slate-300 flex items-center justify-between text-[11px]`}
                >
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[9px] block">
                      Amount Chargeable (in words):
                    </span>
                    <span className="font-bold text-slate-900">
                      {invoice.calc.amountInWords}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px]">
                      E. & O.E.
                    </span>
                  </div>
                </div>

                {/* 5. GST Tax Table Breakdown (HSN Grouped) */}
                <div className={`p-2 border-b-2 ${themeClasses.borderColor}`}>
                  <div className="text-[10px] font-bold uppercase text-slate-600 mb-1">
                    Tax Analysis & Summary Table (HSN/SAC Breakdown)
                  </div>
                  <table className="w-full border border-slate-300 text-[10px] text-center border-collapse">
                    <thead>
                      <tr className={`${themeClasses.subHeaderBg} font-bold border-b border-slate-300`}>
                        <th rowSpan={2} className="p-1 border-r border-slate-300 w-24">
                          HSN / SAC
                        </th>
                        <th rowSpan={2} className="p-1 border-r border-slate-300">
                          Taxable Value (₹)
                        </th>
                        {invoice.invoiceTaxType === 'CGST_SGST' ? (
                          <>
                            <th colSpan={2} className="p-1 border-r border-slate-300">
                              Central Tax (CGST)
                            </th>
                            <th colSpan={2} className="p-1 border-r border-slate-300">
                              State Tax (SGST)
                            </th>
                          </>
                        ) : (
                          <th colSpan={2} className="p-1 border-r border-slate-300">
                            Integrated Tax (IGST)
                          </th>
                        )}
                        <th rowSpan={2} className="p-1">
                          Total Tax (₹)
                        </th>
                      </tr>
                      <tr className={`${themeClasses.subHeaderBg} font-bold border-b border-slate-300`}>
                        {invoice.invoiceTaxType === 'CGST_SGST' ? (
                          <>
                            <th className="p-1 border-r border-slate-300 w-12">Rate</th>
                            <th className="p-1 border-r border-slate-300 w-20">Amount</th>
                            <th className="p-1 border-r border-slate-300 w-12">Rate</th>
                            <th className="p-1 border-r border-slate-300 w-20">Amount</th>
                          </>
                        ) : (
                          <>
                            <th className="p-1 border-r border-slate-300 w-14">Rate</th>
                            <th className="p-1 border-r border-slate-300 w-24">Amount</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.hsnSummary.map((hsn, hIdx) => (
                        <tr key={hIdx} className="border-b border-slate-200">
                          <td className="p-1 border-r border-slate-200 font-mono font-bold">
                            {hsn.hsnCode}
                          </td>
                          <td className="p-1 border-r border-slate-200 font-mono text-right pr-2">
                            {formatNumberIndian(hsn.taxableValue)}
                          </td>
                          {invoice.invoiceTaxType === 'CGST_SGST' ? (
                            <>
                              <td className="p-1 border-r border-slate-200 font-mono">
                                {hsn.cgstRate}%
                              </td>
                              <td className="p-1 border-r border-slate-200 font-mono text-right pr-2">
                                {formatNumberIndian(hsn.cgstAmount)}
                              </td>
                              <td className="p-1 border-r border-slate-200 font-mono">
                                {hsn.sgstRate}%
                              </td>
                              <td className="p-1 border-r border-slate-200 font-mono text-right pr-2">
                                {formatNumberIndian(hsn.sgstAmount)}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-1 border-r border-slate-200 font-mono">
                                {hsn.igstRate}%
                              </td>
                              <td className="p-1 border-r border-slate-200 font-mono text-right pr-2">
                                {formatNumberIndian(hsn.igstAmount)}
                              </td>
                            </>
                          )}
                          <td className="p-1 font-mono font-bold text-right pr-2 text-slate-900">
                            {formatNumberIndian(hsn.totalTax)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-slate-50 border-t border-slate-300">
                        <td className="p-1 border-r border-slate-300 text-left pl-2">
                          Total
                        </td>
                        <td className="p-1 border-r border-slate-300 font-mono text-right pr-2">
                          {formatNumberIndian(invoice.calc.subTotal)}
                        </td>
                        {invoice.invoiceTaxType === 'CGST_SGST' ? (
                          <>
                            <td className="p-1 border-r border-slate-300">-</td>
                            <td className="p-1 border-r border-slate-300 font-mono text-right pr-2">
                              {formatNumberIndian(invoice.calc.taxAmount / 2)}
                            </td>
                            <td className="p-1 border-r border-slate-300">-</td>
                            <td className="p-1 border-r border-slate-300 font-mono text-right pr-2">
                              {formatNumberIndian(invoice.calc.taxAmount / 2)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-1 border-r border-slate-300">-</td>
                            <td className="p-1 border-r border-slate-300 font-mono text-right pr-2">
                              {formatNumberIndian(invoice.calc.taxAmount)}
                            </td>
                          </>
                        )}
                        <td className="p-1 font-mono font-bold text-right pr-2 text-slate-900">
                          {formatNumberIndian(invoice.calc.taxAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 6. Bank Details, UPI QR, Totals & Signature Block */}
                <div className="grid grid-cols-2">
                  {/* Left Column: Bank Details & Terms */}
                  <div
                    className={`p-3 border-r-2 ${themeClasses.borderColor} space-y-2 text-[11px]`}
                  >
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="font-bold text-slate-800 text-[10px] uppercase mb-1 flex items-center justify-between">
                        <span>Company Bank Details</span>
                        <span className="text-emerald-700 font-mono">
                          UPI: {company.bankDetail.upiId}
                        </span>
                      </div>
                      <div className="space-y-0.5 text-slate-700">
                        <div>
                          Bank Name:{' '}
                          <span className="font-bold text-slate-900">
                            {company.bankDetail.bankName}
                          </span>
                        </div>
                        <div>
                          A/C No:{' '}
                          <span className="font-mono font-bold text-slate-900">
                            {company.bankDetail.accountNumber}
                          </span>
                        </div>
                        <div>
                          IFSC Code:{' '}
                          <span className="font-mono font-bold text-slate-900">
                            {company.bankDetail.ifscCode}
                          </span>{' '}
                          | Branch: {company.bankDetail.branchName}
                        </div>
                        <div>
                          Company PAN:{' '}
                          <span className="font-mono font-bold text-slate-900">
                            {company.panNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800 uppercase">
                        Declaration & Terms:
                      </div>
                      <p className="leading-tight text-slate-500">
                        {company.termsAndConditions ||
                          '1. Goods once sold will not be returned.\n2. Subject to local jurisdiction.'}
                      </p>
                      <p className="text-[9px] text-slate-400 italic">
                        {invoice.description ||
                          'We declare that this invoice shows the actual price of the goods described.'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Final Totals & Signatory */}
                  <div className="p-3 flex flex-col justify-between text-[11px]">
                    <div className="space-y-1 border-b border-slate-200 pb-2">
                      <div className="flex justify-between text-slate-700">
                        <span>Taxable Amount:</span>
                        <span className="font-mono font-semibold">
                          ₹{formatNumberIndian(invoice.calc.subTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Total GST Output:</span>
                        <span className="font-mono font-semibold">
                          ₹{formatNumberIndian(invoice.calc.taxAmount)}
                        </span>
                      </div>
                      {invoice.calc.extraItemsTotal > 0 && (
                        <div className="flex justify-between text-slate-700">
                          <span>Freight / Extra Charges:</span>
                          <span className="font-mono font-semibold">
                            ₹{formatNumberIndian(invoice.calc.extraItemsTotal)}
                          </span>
                        </div>
                      )}
                      {invoice.calc.roundOffValue !== 0 && (
                        <div className="flex justify-between text-slate-500 text-[10px]">
                          <span>Round Off:</span>
                          <span className="font-mono">
                            {invoice.calc.roundOffValue > 0 ? '+' : ''}
                            {invoice.calc.roundOffValue.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex justify-between items-center pt-1.5 border-t-2 ${themeClasses.borderColor} font-extrabold text-sm ${themeClasses.accentText}`}
                      >
                        <span>Grand Total (Bill Figure):</span>
                        <span className="font-mono text-base">
                          ₹{formatNumberIndian(invoice.calc.billFigure)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                        <span>Paid: ₹{formatNumberIndian(invoice.calc.paidAmount)}</span>
                        <span className="font-bold text-rose-700">
                          Balance Due: ₹{formatNumberIndian(invoice.calc.dueAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Authorised Signatory with Stamp & Signature */}
                    <div className="pt-2 text-right relative min-h-[90px] flex flex-col justify-end">
                      <div className="text-[10px] text-slate-700 font-bold">
                        For <span className="uppercase">{company.name}</span>
                      </div>

                      <div className="relative my-1 h-14 flex items-center justify-end">
                        {/* Stamp */}
                        {company.stampUrl && (
                          <div className="absolute right-20 bottom-0 w-16 h-16 pointer-events-none opacity-85">
                            <img
                              src={company.stampUrl}
                              alt="Seal"
                              className="w-full h-full object-contain transform -rotate-12"
                            />
                          </div>
                        )}

                        {/* Signature */}
                        {company.signatureUrl ? (
                          <div className="h-12 max-w-[140px] z-10">
                            <img
                              src={company.signatureUrl}
                              alt="Signature"
                              className="h-full object-contain"
                            />
                          </div>
                        ) : company.signatureName ? (
                          <div
                            className="text-lg font-bold text-[#1a237e] italic z-10 pr-2"
                            style={{ fontFamily: 'cursive' }}
                          >
                            {company.signatureName}
                          </div>
                        ) : (
                          <div className="h-8" />
                        )}
                      </div>

                      <div>
                        <div className="inline-block border-t border-slate-400 pt-0.5 text-[10px] font-bold text-slate-800">
                          Authorised Signatory
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 7. Footer tag */}
                <div className="bg-slate-100 text-center py-1 text-[9px] text-slate-500 font-mono border-t border-slate-300">
                  This is a Computer Generated {getInvoiceTitle()} powered by Kannaku SaaS • Page 1 of 1
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
