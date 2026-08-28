import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  FileCheck,
  Layers,
  Loader2,
  Printer,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CompanyProfile,
  Invoice,
  InvoiceCopyType,
  InvoiceItem,
  InvoiceType,
} from '../../types';
import { amountToIndianWords, formatIndianCurrency, formatNumberIndian } from '../../utils/numberToWords';
import { downloadInvoiceAsPdf } from '../../utils/pdfExport';

interface InvoicePrintModalProps {
  invoice: Invoice;
  company: CompanyProfile;
  onClose: () => void;
  onConvertQuotation?: (invoice: Invoice) => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  company,
  onClose,
  onConvertQuotation,
}) => {
  const [selectedCopy, setSelectedCopy] = useState<InvoiceCopyType>(
    invoice.copyType || InvoiceCopyType.ORIGINAL
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Auto-fit scale on mobile devices (e.g. iPhone / small screens) so 100% of invoice width is visible
  useEffect(() => {
    const computeMobileFit = () => {
      const screenW = window.innerWidth;
      if (screenW < 860) {
        const availableWidth = screenW - 24;
        const fitRatio = Math.max(0.42, Math.min(1, availableWidth / 820));
        setZoomScale(Number(fitRatio.toFixed(2)));
      } else {
        setZoomScale(1);
      }
    };

    computeMobileFit();
    window.addEventListener('resize', computeMobileFit);
    return () => window.removeEventListener('resize', computeMobileFit);
  }, []);

  const getCopyLabel = (copyType: InvoiceCopyType): string => {
    switch (copyType) {
      case InvoiceCopyType.ORIGINAL:
        return 'Original for Recipient';
      case InvoiceCopyType.DUPLICATE:
        return 'Duplicate for Transporter';
      case InvoiceCopyType.TRIPLICATE:
        return 'Triplicate for Supplier';
      case InvoiceCopyType.CHALAN:
        return 'Delivery Challan';
      case InvoiceCopyType.DEL_NOTE:
        return 'Delivery Note';
      default:
        return '';
    }
  };

  const getInvoiceTitle = (): string => {
    if (invoice.type === InvoiceType.QUOTATION) {
      return 'PROFORMA INVOICE / ESTIMATE';
    }
    if (
      selectedCopy === InvoiceCopyType.CHALAN ||
      invoice.copyType === InvoiceCopyType.CHALAN
    ) {
      return 'DELIVERY CHALLAN';
    }
    return 'TAX INVOICE';
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const sanitizedNum = (invoice.invoiceNumber || 'INV').replace(/[^a-zA-Z0-9-_]/g, '_');
      const filename = `Invoice_${sanitizedNum}.pdf`;
      await downloadInvoiceAsPdf('printable-invoice', filename);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShareWhatsApp = () => {
    const rawPhone = invoice.clientSnapshot?.mobile ? invoice.clientSnapshot.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const dueFormatted = formatIndianCurrency(invoice.calc.dueAmount);
    const totalFormatted = formatIndianCurrency(invoice.calc.billFigure);
    const invoiceNum = invoice.invoiceNumber;
    const companyName = company.name;

    const message = `*INVOICE DETAILS*
🏢 *${companyName}*
📄 *Invoice No:* ${invoiceNum}
📅 *Date:* ${invoice.date}
👤 *Billed To:* ${invoice.clientSnapshot.name}
💰 *Total Amount:* ${totalFormatted}
🔴 *Due Balance:* ${dueFormatted}

Thank you for your business!`;

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

  // If ALL_COPIES is chosen, render copies sequentially
  const copiesToRender =
    selectedCopy === InvoiceCopyType.ALL_COPIES
      ? [
          InvoiceCopyType.ORIGINAL,
          InvoiceCopyType.DUPLICATE,
          InvoiceCopyType.TRIPLICATE,
        ]
      : [selectedCopy];

  const handleFitScreen = () => {
    const availableWidth = window.innerWidth < 860 ? window.innerWidth - 24 : 820;
    const fitRatio = Math.max(0.42, Math.min(1, availableWidth / 820));
    setZoomScale(Number(fitRatio.toFixed(2)));
  };

  const isInterState = invoice.invoiceTaxType === 'IGST';
  const totalQuantity = invoice.items.reduce(
    (sum, item) => sum + (Number(item.qty) || 0),
    0
  );

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

  // Smart Pagination for standard A4 pages:
  // - Single page invoice: up to 8 items with full header + full footer
  // - Multi-page invoice:
  //    * Page 1 (Full header, NO footer): 13 items
  //    * Middle Pages (Page 2 to N-1) (Slim continuation header, NO footer): 24 items
  //    * Last Page (Slim continuation header, FULL footer): 16 items
  const paginateItems = (items: InvoiceItem[]) => {
    const SINGLE_PAGE_MAX = 8;
    const FIRST_PAGE_MULTI_MAX = 13;
    const MIDDLE_PAGE_MAX = 24;
    const LAST_PAGE_MULTI_MAX = 16;

    if (items.length <= SINGLE_PAGE_MAX) {
      return [items];
    }

    const pages: InvoiceItem[][] = [];
    let remaining = [...items];

    // If total items fit on 2 pages (Page 1 + Final Page)
    if (remaining.length <= FIRST_PAGE_MULTI_MAX + LAST_PAGE_MULTI_MAX) {
      const p1Count = Math.min(
        FIRST_PAGE_MULTI_MAX,
        Math.max(Math.ceil(remaining.length / 2), remaining.length - LAST_PAGE_MULTI_MAX)
      );
      pages.push(remaining.slice(0, p1Count));
      pages.push(remaining.slice(p1Count));
      return pages;
    }

    // 3 or more pages:
    // Page 1 gets FIRST_PAGE_MULTI_MAX
    pages.push(remaining.slice(0, FIRST_PAGE_MULTI_MAX));
    remaining = remaining.slice(FIRST_PAGE_MULTI_MAX);

    while (remaining.length > 0) {
      // If what's remaining fits on the final page
      if (remaining.length <= LAST_PAGE_MULTI_MAX) {
        pages.push(remaining);
        break;
      }

      // If remaining can be split evenly between 1 middle page and the final page
      if (remaining.length <= MIDDLE_PAGE_MAX + LAST_PAGE_MULTI_MAX) {
        const thisPageCount = Math.min(
          MIDDLE_PAGE_MAX,
          Math.max(Math.ceil(remaining.length / 2), remaining.length - LAST_PAGE_MULTI_MAX)
        );
        pages.push(remaining.slice(0, thisPageCount));
        pages.push(remaining.slice(thisPageCount));
        break;
      }

      // Full middle page
      pages.push(remaining.slice(0, MIDDLE_PAGE_MAX));
      remaining = remaining.slice(MIDDLE_PAGE_MAX);
    }

    return pages;
  };

  const itemPages = paginateItems(invoice.items);
  const totalPages = itemPages.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-1 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar (Controls) */}
        <div className="no-print p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                GST Tax Invoice Preview
              </h2>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[200px] sm:max-w-xs">
                {invoice.invoiceNumber} • {invoice.clientSnapshot.name}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Zoom / Fit Controls */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs text-slate-300">
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
                className="p-1 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleFitScreen}
                className="px-1.5 py-0.5 text-[11px] font-semibold hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                title="Fit to Screen"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
                className="p-1 hover:text-white hover:bg-slate-700 rounded transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Copy Type Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 text-xs">
              <span className="text-slate-400 px-1.5 hidden md:flex items-center gap-1">
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
                <option value={InvoiceCopyType.ALL_COPIES}>All 3 Copies</option>
                <option value={InvoiceCopyType.CHALAN}>Delivery Challan</option>
                <option value={InvoiceCopyType.DEL_NOTE}>Delivery Note</option>
              </select>
            </div>

            {/* Download PDF Button */}
            <button
              id="btn-download-pdf"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
              title="Download High-Res A4 PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloadingPdf ? 'Saving PDF...' : 'Download PDF'}</span>
            </button>

            {/* Print Action */}
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
              title="Open System Print Dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleShareWhatsApp}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition cursor-pointer"
              title="Share Invoice summary on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopySummary}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition cursor-pointer"
              title="Copy Summary Text"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {copiedLink ? 'Copied!' : 'Copy'}
              </span>
            </button>

            {/* If it is a quotation, show Convert button */}
            {invoice.type === InvoiceType.QUOTATION && (
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

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Paper Container */}
        <div
          className="flex-1 overflow-x-auto overflow-y-auto p-2 sm:p-6 bg-slate-200/80 w-full"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="w-full min-w-fit flex justify-center py-2">
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
                marginBottom: zoomScale < 1 ? `-${Math.round((1 - zoomScale) * 1100)}px` : '0px',
              }}
            >
              <div
                id="printable-invoice"
                className="w-[800px] flex flex-col gap-6 text-slate-950 font-sans select-text shrink-0"
              >
                {copiesToRender.map((currCopy, copyIdx) => {
                  return (
                    <React.Fragment key={`copy-${copyIdx}`}>
                      {itemPages.map((pageItems, pageIdx) => {
                        const isFirstPage = pageIdx === 0;
                        const isLastPage = pageIdx === totalPages - 1;
                        const pageNumber = pageIdx + 1;

                        // Calculate item index offset for Sr. No dynamically based on page chunks
                        const itemOffset = itemPages
                          .slice(0, pageIdx)
                          .reduce((acc, p) => acc + p.length, 0);

                        return (
                          <div
                            key={`copy-${copyIdx}-page-${pageIdx}`}
                            className="invoice-a4-page w-[800px] min-h-[1100px] bg-white text-black border-2 border-black shadow-xl p-3 sm:p-5 text-[11px] leading-tight flex flex-col justify-between"
                          >
                            <div className="flex-1 flex flex-col border border-black">
                              {/* 1. Header & Title Block */}
                              <div className="py-1 text-center border-b border-black shrink-0 bg-slate-50/50">
                                <div className="flex justify-between items-center px-1">
                                  <span className="text-[10px] font-mono text-slate-600">
                                    Page {pageNumber} of {totalPages}
                                  </span>
                                  <div>
                                    <h1 className="text-sm font-bold tracking-wide uppercase text-black">
                                      {getInvoiceTitle()}
                                    </h1>
                                    {getCopyLabel(currCopy) && (
                                      <span className="text-[9.5px] font-semibold text-slate-600 block">
                                        ({getCopyLabel(currCopy)})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono font-bold text-black">
                                    {invoice.invoiceNumber}
                                  </span>
                                </div>
                              </div>

                              {/* 2. Top Info: Show Seller + Buyer & Tally metadata on Page 1, compact header on continuation pages */}
                              {isFirstPage ? (
                                <div className="grid grid-cols-2 border-b border-black shrink-0">
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
                              ) : (
                                /* Continuation Header for Page 2+ */
                                <div className="p-2 border-b border-black flex justify-between items-center text-[10px] bg-slate-50 shrink-0">
                                  <div>
                                    <span className="font-bold text-black">{company.name}</span>
                                    <span className="text-slate-600 ml-2 font-mono">GSTIN: {company.registerNumber}</span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-black">Buyer: {invoice.clientSnapshot.name}</span>
                                    <span className="text-slate-600 ml-2 font-mono">Inv: {invoice.invoiceNumber}</span>
                                  </div>
                                </div>
                              )}

                              {/* 3. Products Table for this specific page - Elongated to fill vertical space */}
                              <div className="flex-1 flex flex-col justify-between">
                                <table className="w-full border-collapse text-[10.5px] flex-1">
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
                                    {pageItems.map((item, idx) => {
                                      const itemTaxable =
                                        item.taxDetail?.taxable_amount ||
                                        (Number(item.qty) || 0) * (Number(item.baseRate) || 0) -
                                          (Number(item.discountAmount) || 0);

                                      const srNo = itemOffset + idx + 1;

                                      return (
                                        <tr key={item.id || idx} className="align-top">
                                          <td className="py-1 px-1.5 border-r border-black text-center font-mono">
                                            {srNo}.
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

                                    {/* Extra line items like freight only on the final page */}
                                    {isLastPage &&
                                      invoice.extraItems &&
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

                                    {/* In-table GST lines only on the final page */}
                                    {isLastPage && (
                                      <>
                                        {/* Spacer row */}
                                        <tr className="h-4">
                                          <td className="border-r border-black"></td>
                                          <td className="border-r border-black"></td>
                                          <td className="border-r border-black"></td>
                                          <td className="border-r border-black"></td>
                                          <td className="border-r border-black"></td>
                                          <td className="border-r border-black"></td>
                                          <td></td>
                                        </tr>

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
                                      </>
                                    )}

                                    {/* Elongate the table columns with vertical gridlines down to bottom */}
                                    <tr className="h-full">
                                      <td className="border-r border-black py-1"></td>
                                      <td className="border-r border-black py-1"></td>
                                      <td className="border-r border-black py-1"></td>
                                      <td className="border-r border-black py-1"></td>
                                      <td className="border-r border-black py-1"></td>
                                      <td className="border-r border-black py-1"></td>
                                      <td className="py-1"></td>
                                    </tr>
                                  </tbody>

                                  {/* Total Row on Last Page, or "Continued on next page" on intermediate pages */}
                                  <tfoot>
                                    {isLastPage ? (
                                      <tr className="font-bold border-t-2 border-b border-black text-[11px] bg-slate-50/40">
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
                                    ) : (
                                      <tr className="font-bold border-t border-b border-black text-[10px] bg-slate-50 italic">
                                        <td className="py-1 px-2 text-right text-slate-700" colSpan={7}>
                                          Continued on Page {pageNumber + 1}...
                                        </td>
                                      </tr>
                                    )}
                                  </tfoot>
                                </table>
                              </div>
                            {/* 4. Footer & Statutory Summary - Inside the Unified Box on Last Page */}
                            {isLastPage ? (
                              <div className="shrink-0">
                                {/* Amount Chargeable in Words */}
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

                                {/* Tax Analysis & Summary Table (HSN/SAC Breakdown) - Flush Edge-to-Edge */}
                                <div className="border-b border-black">
                                  <table className="w-full text-[10px] text-center border-collapse">
                                    <thead>
                                      <tr className="font-bold border-b border-black bg-slate-50/40">
                                        <th rowSpan={2} className="p-1 border-r border-black w-24">
                                          HSN/SAC
                                        </th>
                                        <th rowSpan={2} className="p-1 border-r border-black">
                                          Taxable Value
                                        </th>
                                        {!isInterState ? (
                                          <>
                                            <th colSpan={2} className="p-1 border-r border-black">
                                              Central Tax
                                            </th>
                                            <th colSpan={2} className="p-1 border-r border-black">
                                              State Tax
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
                                      <tr className="font-bold border-b border-black bg-slate-50/40">
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
                                                  {cgstRateVal.toFixed(2)}%
                                                </td>
                                                <td className="p-1 border-r border-black font-mono text-right pr-2">
                                                  {formatNumberIndian(cgstAmtVal)}
                                                </td>
                                                <td className="p-1 border-r border-black font-mono">
                                                  {sgstRateVal.toFixed(2)}%
                                                </td>
                                                <td className="p-1 border-r border-black font-mono text-right pr-2">
                                                  {formatNumberIndian(sgstAmtVal)}
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
                                      <tr className="font-bold border-t border-black bg-slate-50/40">
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

                                {/* Tax Amount in Words */}
                                <div className="p-1.5 border-b border-black text-[10px]">
                                  <span className="text-slate-700 font-medium">Tax Amount (in words) : </span>
                                  <span className="font-bold text-black">{amountToIndianWords(invoice.calc.taxAmount)}</span>
                                </div>

                                {/* Bank Details & Signatory Box */}
                                <div className="grid grid-cols-2 border-b border-black">
                                  {/* Left Column: Bank Details & Description / Declaration */}
                                  <div className="border-r border-black flex flex-col justify-between text-[10px]">
                                    {/* Bank Details Section */}
                                    <div className="p-2 space-y-0.5 text-black">
                                      <div className="font-bold uppercase text-[9.5px] text-slate-800 pb-0.5 underline">
                                        Company's Bank Details
                                      </div>
                                      <div>
                                        <span className="font-semibold text-slate-700">
                                          Bank Name :
                                        </span>{' '}
                                        <span className="font-bold uppercase">
                                          {company.bankDetail.bankName || company.name}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-semibold text-slate-700">
                                          A/c No. :
                                        </span>{' '}
                                        <span className="font-mono font-bold">
                                          {formatVal(company.bankDetail.accountNumber)}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="font-semibold text-slate-700">
                                          Branch & IFS Code :
                                        </span>{' '}
                                        <span className="font-mono font-bold">
                                          {formatVal(company.bankDetail.ifscCode)}
                                        </span>
                                        {company.bankDetail.branchName && (
                                          <span className="ml-1">
                                            ({company.bankDetail.branchName})
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Description & Declaration Section */}
                                    <div className="border-t border-black p-2 space-y-0.5 bg-slate-50/30">
                                      <div className="font-bold text-slate-800 uppercase text-[9.5px]">
                                        Declaration / Description
                                      </div>
                                      <p className="text-[9px] text-slate-800 leading-snug">
                                        {invoice.description ||
                                          'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right Column: Authorised Signatory */}
                                  <div className="p-2 flex flex-col justify-between text-right relative min-h-[120px]">
                                    <div className="text-[10px] text-black font-bold">
                                      For <span className="uppercase">{company.name}</span>
                                    </div>

                                    <div className="relative my-1 h-12 flex items-center justify-end">
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
                                          className="text-sm font-bold text-blue-950 italic z-10 pr-2"
                                          style={{ fontFamily: 'cursive' }}
                                        >
                                          {company.signatureName}
                                        </div>
                                      ) : (
                                        <div className="h-6" />
                                      )}
                                    </div>

                                    <div>
                                      <div className="inline-block border-t border-black pt-1 text-[10px] font-bold text-black">
                                        Authorised Signatory
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Footer tag */}
                                <div className="text-center py-1 text-[9px] text-slate-700 font-mono">
                                  This is a Computer Generated Invoice
                                </div>
                              </div>
                            ) : (
                              /* Continuation Footer for intermediate pages */
                              <div className="border-t border-black py-1 px-2 flex justify-between items-center text-[9px] text-slate-600 font-mono">
                                <span>{invoice.invoiceNumber}</span>
                                <span>Continued on Page {pageNumber + 1}...</span>
                              </div>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
