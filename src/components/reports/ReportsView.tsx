import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  PieChart,
  Table,
} from 'lucide-react';
import { CompanyProfile, HsnSummaryItem, Invoice, InvoiceType } from '../../types';
import { formatNumberIndian } from '../../utils/numberToWords';
import { calculateItemTaxAndTotals } from '../../utils/taxEngine';

interface ReportsViewProps {
  invoices: Invoice[];
  company: CompanyProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices = [],
  company,
}) => {
  const [reportTab, setReportTab] = useState<'gstr1' | 'sales' | 'purchases'>(
    'gstr1'
  );

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  // Sales Invoices
  const salesInvoices = safeInvoices.filter(
    (i) => i.invoiceType === InvoiceType.SALES || (i as any).type === 'sales'
  );
  const purchaseInvoices = safeInvoices.filter(
    (i) => i.invoiceType === InvoiceType.PURCHASE || (i as any).type === 'purchase'
  );

  // Aggregated HSN Summary for GSTR-1 (Derived on read dynamically)
  const hsnMap: { [key: string]: HsnSummaryItem } = {};

  salesInvoices.forEach((inv) => {
    // Derive hsnSummary if not present on invoice (e.g. loaded from DB)
    const hsnList: HsnSummaryItem[] =
      Array.isArray(inv.hsnSummary) && inv.hsnSummary.length > 0
        ? inv.hsnSummary
        : calculateItemTaxAndTotals(
            inv.items || [],
            inv.extraItems || [],
            inv.modifiers || [],
            (inv.invoiceTaxType as any) || 'CGST_SGST',
            inv.calc?.tcsPercentage || 0,
            inv.calc?.paidAmount || 0
          ).hsnSummary || [];

    (hsnList || []).forEach((h) => {
      const hsnCode = h.hsnCode || 'N/A';
      const taxPercentage = Number(h.taxPercentage || 0);
      const key = `${hsnCode}_${taxPercentage}`;
      if (!hsnMap[key]) {
        hsnMap[key] = {
          hsnCode,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          taxPercentage,
          totalTaxAmount: 0,
        };
      }
      hsnMap[key].taxableAmount += Number(h.taxableAmount || 0);
      hsnMap[key].cgstAmount += Number(h.cgstAmount || 0);
      hsnMap[key].sgstAmount += Number(h.sgstAmount || 0);
      hsnMap[key].igstAmount += Number(h.igstAmount || 0);
      hsnMap[key].totalTaxAmount += Number(h.totalTaxAmount || 0);
    });
  });

  const aggregatedHsnList = Object.values(hsnMap);

  const totalTaxable = aggregatedHsnList.reduce(
    (acc, h) => acc + h.taxableAmount,
    0
  );
  const totalCgst = aggregatedHsnList.reduce(
    (acc, h) => acc + h.cgstAmount,
    0
  );
  const totalSgst = aggregatedHsnList.reduce(
    (acc, h) => acc + h.sgstAmount,
    0
  );
  const totalIgst = aggregatedHsnList.reduce(
    (acc, h) => acc + h.igstAmount,
    0
  );
  const totalTax = aggregatedHsnList.reduce(
    (acc, h) => acc + h.totalTaxAmount,
    0
  );

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'HSN/SAC Code',
      'Tax Rate (%)',
      'Taxable Value (INR)',
      'CGST Amount (INR)',
      'SGST Amount (INR)',
      'IGST Amount (INR)',
      'Total GST Tax (INR)',
    ];

    const rows = aggregatedHsnList.map((h) => [
      `"${h.hsnCode}"`,
      h.taxPercentage,
      h.taxableAmount.toFixed(2),
      h.cgstAmount.toFixed(2),
      h.sgstAmount.toFixed(2),
      h.igstAmount.toFixed(2),
      h.totalTaxAmount.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `JustGST_GSTR1_HSN_Summary_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            GST Tax Reports & GSTR-1 Audit
          </h2>
          <p className="text-xs text-slate-500">
            Compliant HSN-wise tax breakdown, monthly register & exportable audit files
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs active:scale-98 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export GSTR-1 (CSV)</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setReportTab('gstr1')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            reportTab === 'gstr1'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          GSTR-1 (HSN Summary)
        </button>
        <button
          onClick={() => setReportTab('sales')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            reportTab === 'sales'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Sales Register ({salesInvoices.length})
        </button>
        <button
          onClick={() => setReportTab('purchases')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            reportTab === 'purchases'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Purchase Register ({purchaseInvoices.length})
        </button>
      </div>

      {reportTab === 'gstr1' && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Total Taxable Value
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-slate-900">
                ₹{formatNumberIndian(totalTaxable)}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Central Tax (CGST)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-brand-700">
                ₹{formatNumberIndian(totalCgst)}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                State Tax (SGST)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-brand-700">
                ₹{formatNumberIndian(totalSgst)}
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Integrated Tax (IGST)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-brand-700">
                ₹{formatNumberIndian(totalIgst)}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-brand-50/70 p-4 sm:p-5 rounded-2xl border border-brand-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 block">
                Total Tax Output
              </span>
              <div className="text-base sm:text-xl font-black font-mono text-brand-800">
                ₹{formatNumberIndian(totalTax)}
              </div>
            </div>
          </div>

          {/* GSTR-1 HSN Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Table 12: HSN-wise Summary of Outward Supplies (GSTR-1)
              </h3>
              <span className="text-xs font-mono font-medium text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                GSTIN: <span className="text-slate-900 font-semibold">{company.registerNumber}</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">HSN/SAC</th>
                    <th className="py-3 px-4 text-center">Tax Rate %</th>
                    <th className="py-3 px-4 text-right">Taxable Value</th>
                    <th className="py-3 px-4 text-right">CGST</th>
                    <th className="py-3 px-4 text-right">SGST</th>
                    <th className="py-3 px-4 text-right">IGST</th>
                    <th className="py-3 px-4 text-right">Total GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {aggregatedHsnList.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {h.hsnCode}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200/60">
                          {h.taxPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-900">
                        ₹{formatNumberIndian(h.taxableAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        ₹{formatNumberIndian(h.cgstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        ₹{formatNumberIndian(h.sgstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        ₹{formatNumberIndian(h.igstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-brand-700">
                        ₹{formatNumberIndian(h.totalTaxAmount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-200">
                    <td className="py-3.5 px-4 font-bold">TOTALS</td>
                    <td className="py-3.5 px-4 text-center text-slate-400">-</td>
                    <td className="py-3.5 px-4 text-right">
                      ₹{formatNumberIndian(totalTaxable)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      ₹{formatNumberIndian(totalCgst)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      ₹{formatNumberIndian(totalSgst)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      ₹{formatNumberIndian(totalIgst)}
                    </td>
                    <td className="py-3.5 px-4 text-right text-brand-800 font-black">
                      ₹{formatNumberIndian(totalTax)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Monthly Sales Register
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Party</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">GST</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {salesInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{inv.invoiceDate || inv.date || ''}</td>
                    <td className="py-3 px-4 font-semibold text-brand-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">
                      {inv.clientSnapshot?.name || 'Customer'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {inv.clientSnapshot?.registerNumber || 'URP'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      ₹{formatNumberIndian(inv.calc?.subTotal || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      ₹{formatNumberIndian(inv.calc?.taxAmount || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{formatNumberIndian(inv.calc?.billFigure || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'purchases' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Monthly Purchase Register
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">GST Input</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {purchaseInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{inv.invoiceDate || inv.date || ''}</td>
                    <td className="py-3 px-4 font-semibold text-brand-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">
                      {inv.clientSnapshot?.name || 'Supplier'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {inv.clientSnapshot?.registerNumber || 'URP'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700">
                      ₹{formatNumberIndian(inv.calc?.subTotal || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      ₹{formatNumberIndian(inv.calc?.taxAmount || 0)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{formatNumberIndian(inv.calc?.billFigure || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

