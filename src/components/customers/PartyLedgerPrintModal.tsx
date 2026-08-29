import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Mail,
  MapPin,
  Maximize2,
  Minimize2,
  Phone,
  Printer,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Client, CompanyProfile, PaymentLedgerEntry } from '../../types';
import { formatIndianCurrency, formatNumberIndian } from '../../utils/numberToWords';
import { downloadInvoiceAsPdf } from '../../utils/pdfExport';

interface PartyLedgerPrintModalProps {
  party: Client;
  company: CompanyProfile;
  entries: PaymentLedgerEntry[];
  startDate?: string;
  endDate?: string;
  onClose: () => void;
}

export const PartyLedgerPrintModal: React.FC<PartyLedgerPrintModalProps> = ({
  party,
  company,
  entries,
  startDate,
  endDate,
  onClose,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Auto-scale on mobile so the A4 statement fits horizontally on iPhone screens
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 768) {
          const targetWidth = 760; // target width of the printable document
          const availableWidth = window.innerWidth - 20;
          const scale = Math.max(0.42, Math.min(1, availableWidth / targetWidth));
          setZoomScale(scale);
        } else {
          setZoomScale(1);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Compute ledger entries with running balance
  let running = 0;
  const processedEntries = entries.map((entry, idx) => {
    const isDebit = entry.type === 'debit';
    const amount = Number(entry.amount) || 0;
    if (isDebit) {
      running += amount;
    } else {
      running -= amount;
    }
    return {
      ...entry,
      runningBalance: running,
      index: idx + 1,
    };
  });

  const totalDebits = entries
    .filter((e) => e.type === 'debit')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const totalCredits = entries
    .filter((e) => e.type === 'credit')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const openingBalance = 0;
  const netClosingBalance = openingBalance + totalDebits - totalCredits;
  const isDebitBalance = netClosingBalance >= 0;

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    const safeName = party.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Ledger_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
    await downloadInvoiceAsPdf('printable-ledger', fileName);
    setIsDownloadingPdf(false);
  };

  const handleCopySummary = () => {
    const text = `*Party Ledger Statement: ${party.name}*
Issued By: ${company.name} (GSTIN: ${company.registerNumber})
Date: ${new Date().toLocaleDateString('en-IN')}
Total Billed (Debit): Rs. ${formatNumberIndian(totalDebits)}
Total Paid (Credit): Rs. ${formatNumberIndian(totalCredits)}
Closing Balance Due: Rs. ${formatNumberIndian(Math.abs(netClosingBalance))} ${isDebitBalance ? 'DR' : 'CR'}
Bank: ${company.bankDetail.bankName} | A/C: ${company.bankDetail.accountNumber} | IFSC: ${company.bankDetail.ifscCode} | UPI: ${company.bankDetail.upiId}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    const rawPhone = party.mobile ? party.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const message = `*Statement of Account / Ledger: ${party.name}*
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
    const url = phone
      ? `https://wa.me/${phone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Actions Control Bar (hidden in print) */}
        <div className="no-print p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="truncate">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">
                Ledger Statement : {party.name}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                {entries.length} Transaction(s) • Due: ₹{formatNumberIndian(Math.abs(netClosingBalance))} {isDebitBalance ? 'DR' : 'CR'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.4, prev - 0.1))}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-slate-300 w-9 text-center">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
                className="p-1 text-slate-300 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="px-1.5 py-0.5 text-[10px] text-slate-300 hover:text-white border-l border-slate-700 cursor-pointer"
                title="Reset Zoom"
              >
                100%
              </button>
            </div>

            <button
              onClick={handleCopySummary}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Copy Statement Summary"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedSummary ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Share Statement via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDownloadingPdf ? 'Generating...' : 'PDF'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area with Responsive Scale Container */}
        <div className="flex-1 overflow-auto p-2 sm:p-6 bg-slate-200/70 flex justify-center items-start">
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
              marginBottom: zoomScale < 1 ? `-${Math.round((1 - zoomScale) * 850)}px` : undefined,
            }}
            className="shrink-0"
          >
            <div
              id="printable-ledger"
              className="printable-document bg-white text-slate-900 rounded-xl shadow-md border border-slate-300 p-4 sm:p-8 w-[760px] text-xs"
              style={{ minHeight: '980px' }}
            >
              {/* Header: Company Profile */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 gap-4">
                <div className="flex items-start gap-3">
                  {company.logoUrl && (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 p-1 flex items-center justify-center bg-white">
                      <img
                        src={company.logoUrl}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                      {company.name}
                    </h1>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {company.address}, {company.city}, {company.state} - {company.pin}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-700 font-semibold mt-1">
                      <span>GSTIN: <strong className="font-mono text-slate-900">{company.registerNumber}</strong></span>
                      <span>Ph: {company.mobile}</span>
                      {company.email && <span>Email: {company.email}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded">
                    Party Statement
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Date: {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Statement Title & Period */}
              <div className="my-3 py-1.5 px-3 bg-slate-100 text-center rounded border border-slate-200 flex flex-wrap items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-slate-800">
                  Statement of Accounts / Party Ledger
                </span>
                <span className="text-slate-600 font-mono text-[10px]">
                  Period: {startDate ? formatDateDisplay(startDate) : 'Opening'} to{' '}
                  {endDate ? formatDateDisplay(endDate) : 'Till Date'}
                </span>
              </div>

              {/* Party Snapshot & Financial Summary 2-Column Box */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Client Info */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Account of / Customer:
                  </div>
                  <div className="text-xs font-black text-slate-900">{party.name}</div>
                  <div className="text-[11px] text-slate-600 leading-snug">
                    {party.address}, {party.city}, {party.state} - {party.pin}
                  </div>
                  <div className="text-[11px] text-slate-700 flex flex-wrap gap-x-2 pt-0.5">
                    <span>GSTIN: <strong className="font-mono">{party.registerNumber || 'URP'}</strong></span>
                    <span>Ph: {party.mobile || 'N/A'}</span>
                  </div>
                </div>

                {/* Financial Balance Summary */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-1.5 bg-rose-50 border border-rose-200 rounded">
                      <span className="text-[9px] text-rose-700 uppercase font-bold block">
                        Total Debit (Billed)
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-black text-rose-700">
                        ₹{formatNumberIndian(totalDebits)}
                      </span>
                    </div>

                    <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded">
                      <span className="text-[9px] text-emerald-700 uppercase font-bold block">
                        Total Credit (Paid)
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-black text-emerald-700">
                        ₹{formatNumberIndian(totalCredits)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Net Closing Due:</span>
                    <span
                      className={`font-mono font-black text-sm ${
                        isDebitBalance ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      ₹{formatNumberIndian(Math.abs(netClosingBalance))}{' '}
                      <span className="text-[10px] font-bold">
                        {isDebitBalance ? 'DR' : 'CR'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Transactions Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                      <th className="py-2 px-2 text-center w-8 border-r border-slate-700">#</th>
                      <th className="py-2 px-2 text-left w-20 border-r border-slate-700">Date</th>
                      <th className="py-2 px-2 text-left w-16 border-r border-slate-700">Type</th>
                      <th className="py-2 px-2 text-left w-24 border-r border-slate-700">Vch No</th>
                      <th className="py-2 px-2 text-left border-r border-slate-700">Particulars</th>
                      <th className="py-2 px-2 text-right w-24 border-r border-slate-700 bg-rose-900/60">
                        Debit (₹)
                      </th>
                      <th className="py-2 px-2 text-right w-24 border-r border-slate-700 bg-emerald-900/60">
                        Credit (₹)
                      </th>
                      <th className="py-2 px-2 text-right w-24">Balance (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Opening Balance Row */}
                    <tr className="bg-slate-50/80 font-medium text-slate-600">
                      <td className="py-1.5 px-2 text-center border-r border-slate-200">-</td>
                      <td className="py-1.5 px-2 border-r border-slate-200">-</td>
                      <td className="py-1.5 px-2 border-r border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-500">OB</span>
                      </td>
                      <td className="py-1.5 px-2 border-r border-slate-200">-</td>
                      <td className="py-1.5 px-2 border-r border-slate-200 font-semibold">
                        Opening Balance
                      </td>
                      <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono">-</td>
                      <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono">-</td>
                      <td className="py-1.5 px-2 text-right font-mono font-bold">
                        {openingBalance.toFixed(2)}
                      </td>
                    </tr>

                    {processedEntries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          No transactions found for this party period.
                        </td>
                      </tr>
                    ) : (
                      processedEntries.map((entry) => {
                        const isDebit = entry.type === 'debit';
                        const badge = entry.entryType || (isDebit ? 'SALES' : 'PAYMENT');
                        return (
                          <tr key={entry.id || entry.index} className="hover:bg-slate-50/50">
                            <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-slate-500">
                              {entry.index}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-200 font-mono text-slate-700 whitespace-nowrap">
                              {formatDateDisplay(entry.date)}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-200">
                              <span
                                className={`px-1 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                  isDebit
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {badge}
                              </span>
                            </td>
                            <td className="py-2 px-2 border-r border-slate-200 font-mono font-semibold text-slate-800">
                              {entry.vchNo || '-'}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-200 text-slate-700">
                              {entry.particular || badge}
                            </td>
                            <td className="py-2 px-2 text-right border-r border-slate-200 font-mono font-bold text-rose-700 bg-rose-50/30">
                              {isDebit ? formatNumberIndian(entry.amount) : '-'}
                            </td>
                            <td className="py-2 px-2 text-right border-r border-slate-200 font-mono font-bold text-emerald-700 bg-emerald-50/30">
                              {!isDebit ? formatNumberIndian(entry.amount) : '-'}
                            </td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                              {formatNumberIndian(Math.abs(entry.runningBalance))}{' '}
                              <span className="text-[9px] font-bold text-slate-500">
                                {entry.runningBalance >= 0 ? 'DR' : 'CR'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2 border-slate-300 font-bold text-slate-900">
                      <td colSpan={5} className="py-2 px-2 text-right uppercase text-[10px] border-r border-slate-300">
                        Total Transaction Amounts:
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-rose-700 border-r border-slate-300">
                        ₹{formatNumberIndian(totalDebits)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-700 border-r border-slate-300">
                        ₹{formatNumberIndian(totalCredits)}
                      </td>
                      <td className="py-2 px-2 text-right font-mono text-slate-900">
                        ₹{formatNumberIndian(Math.abs(netClosingBalance))}{' '}
                        <span className="text-[9px]">{isDebitBalance ? 'DR' : 'CR'}</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer: Bank Coordinates & Authorized Signatory */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t-2 border-slate-300 items-end">
                {/* Bank & Settlement Details */}
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1 text-[10px]">
                  <div className="font-bold text-slate-800 uppercase tracking-wider">
                    Settlement & Bank Coordinates
                  </div>
                  <div className="text-slate-600">
                    <span>Bank: <strong className="text-slate-900">{company.bankDetail.bankName}</strong></span> •{' '}
                    <span>A/C: <strong className="font-mono text-slate-900">{company.bankDetail.accountNumber}</strong></span>
                  </div>
                  <div className="text-slate-600">
                    <span>IFSC: <strong className="font-mono text-slate-900">{company.bankDetail.ifscCode}</strong></span> •{' '}
                    <span>UPI ID: <strong className="font-mono text-blue-700">{company.bankDetail.upiId}</strong></span>
                  </div>
                </div>

                {/* Authorized Signatory with Stamp and Signature */}
                <div className="text-right space-y-1">
                  <div className="text-[10px] font-bold text-slate-700">
                    For <span className="uppercase">{company.name}</span>
                  </div>

                  <div className="relative h-14 flex items-center justify-end">
                    {company.stampUrl && (
                      <div className="absolute right-20 bottom-0 w-14 h-14 opacity-85 pointer-events-none">
                        <img
                          src={company.stampUrl}
                          alt="Stamp"
                          className="w-full h-full object-contain -rotate-12"
                        />
                      </div>
                    )}

                    {company.signatureUrl ? (
                      <div className="h-10 max-w-[120px] z-10">
                        <img
                          src={company.signatureUrl}
                          alt="Signature"
                          className="h-full object-contain"
                        />
                      </div>
                    ) : company.signatureName ? (
                      <div
                        className="text-base font-bold text-[#1a237e] italic z-10 pr-2"
                        style={{ fontFamily: 'cursive' }}
                      >
                        {company.signatureName}
                      </div>
                    ) : (
                      <div className="h-8" />
                    )}
                  </div>

                  <div className="inline-block border-t border-slate-400 pt-0.5 text-[10px] font-bold text-slate-800">
                    Authorised Signatory
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-500 text-center font-mono">
                This is a computer generated statement of accounts from {company.name}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

