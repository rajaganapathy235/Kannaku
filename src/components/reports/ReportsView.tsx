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

interface ReportsViewProps {
  invoices: Invoice[];
  company: CompanyProfile;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices,
  company,
}) => {
  const [reportTab, setReportTab] = useState<'gstr1' | 'sales' | 'purchases'>(
    'gstr1'
  );

  // Sales Invoices
  const salesInvoices = invoices.filter(
    (i) => i.invoiceType === InvoiceType.SALES
  );
  const purchaseInvoices = invoices.filter(
    (i) => i.invoiceType === InvoiceType.PURCHASE
  );

  // Aggregated HSN Summary for GSTR-1
  const hsnMap: { [key: string]: HsnSummaryItem } = {};

  salesInvoices.forEach((inv) => {
    inv.hsnSummary.forEach((h) => {
      const key = `${h.hsnCode}_${h.taxPercentage}`;
      if (!hsnMap[key]) {
        hsnMap[key] = {
          hsnCode: h.hsnCode,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          taxPercentage: h.taxPercentage,
          totalTaxAmount: 0,
        };
      }
      hsnMap[key].taxableAmount += h.taxableAmount;
      hsnMap[key].cgstAmount += h.cgstAmount;
      hsnMap[key].sgstAmount += h.sgstAmount;
      hsnMap[key].igstAmount += h.igstAmount;
      hsnMap[key].totalTaxAmount += h.totalTaxAmount;
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
      `Kannaku_GSTR1_HSN_Summary_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-lg border border-[#DADCE0] shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-[#202124]">
            GST Tax Reports & GSTR-1 Audit
          </h2>
          <p className="text-xs text-[#5F6368]">
            Compliant HSN-wise tax breakdown, monthly register & exportable audit files
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-green-700 hover:bg-green-800 shadow-sm active:scale-98 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export GSTR-1 (CSV)</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="bg-white p-2 rounded-lg border border-[#DADCE0] shadow-sm flex items-center gap-2">
        <button
          onClick={() => setReportTab('gstr1')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
            reportTab === 'gstr1'
              ? 'bg-[#1A73E8] text-white shadow-xs'
              : 'text-[#5F6368] hover:bg-[#F1F3F4] hover:text-[#202124]'
          }`}
        >
          GSTR-1 (HSN Summary)
        </button>
        <button
          onClick={() => setReportTab('sales')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
            reportTab === 'sales'
              ? 'bg-[#1A73E8] text-white shadow-xs'
              : 'text-[#5F6368] hover:bg-[#F1F3F4] hover:text-[#202124]'
          }`}
        >
          Sales Register ({salesInvoices.length})
        </button>
        <button
          onClick={() => setReportTab('purchases')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
            reportTab === 'purchases'
              ? 'bg-[#1A73E8] text-white shadow-xs'
              : 'text-[#5F6368] hover:bg-[#F1F3F4] hover:text-[#202124]'
          }`}
        >
          Purchase Register ({purchaseInvoices.length})
        </button>
      </div>

      {reportTab === 'gstr1' && (
        <div className="space-y-6">
          {/* Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-lg border border-[#DADCE0] shadow-sm space-y-1">
              <span className="text-[10px] font-medium uppercase text-[#5F6368] block">
                Total Taxable Value
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-[#202124]">
                ₹{formatNumberIndian(totalTaxable)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#DADCE0] shadow-sm space-y-1">
              <span className="text-[10px] font-medium uppercase text-[#5F6368] block">
                Central Tax (CGST)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-[#1A73E8]">
                ₹{formatNumberIndian(totalCgst)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#DADCE0] shadow-sm space-y-1">
              <span className="text-[10px] font-medium uppercase text-[#5F6368] block">
                State Tax (SGST)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-[#1A73E8]">
                ₹{formatNumberIndian(totalSgst)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#DADCE0] shadow-sm space-y-1">
              <span className="text-[10px] font-medium uppercase text-[#5F6368] block">
                Integrated Tax (IGST)
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-[#1A73E8]">
                ₹{formatNumberIndian(totalIgst)}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-lg border border-[#DADCE0] shadow-sm space-y-1">
              <span className="text-[10px] font-medium uppercase text-[#5F6368] block">
                Total Tax Output
              </span>
              <div className="text-base sm:text-xl font-bold font-mono text-green-700">
                ₹{formatNumberIndian(totalTax)}
              </div>
            </div>
          </div>

          {/* GSTR-1 HSN Table */}
          <div className="bg-white rounded-lg border border-[#DADCE0] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#DADCE0] flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#202124]">
                Table 12: HSN-wise Summary of Outward Supplies (GSTR-1)
              </h3>
              <span className="text-xs font-mono text-[#5F6368]">
                GSTIN: {company.registerNumber}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-[#DADCE0] font-semibold text-[#5F6368] uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">HSN/SAC</th>
                    <th className="py-3 px-4 text-center">Tax Rate %</th>
                    <th className="py-3 px-4 text-right">Taxable Value</th>
                    <th className="py-3 px-4 text-right">CGST</th>
                    <th className="py-3 px-4 text-right">SGST</th>
                    <th className="py-3 px-4 text-right">IGST</th>
                    <th className="py-3 px-4 text-right">Total GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DADCE0] font-mono">
                  {aggregatedHsnList.map((h, idx) => (
                    <tr key={idx} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#202124]">
                        {h.hsnCode}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[#1A73E8]">
                        {h.taxPercentage}%
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#202124]">
                        ₹{formatNumberIndian(h.taxableAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#5F6368]">
                        ₹{formatNumberIndian(h.cgstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#5F6368]">
                        ₹{formatNumberIndian(h.sgstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#5F6368]">
                        ₹{formatNumberIndian(h.igstAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-700">
                        ₹{formatNumberIndian(h.totalTaxAmount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#F8F9FA] font-bold text-[#202124] border-t-2 border-[#DADCE0]">
                    <td className="py-3 px-4">TOTALS</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-right">
                      ₹{formatNumberIndian(totalTaxable)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₹{formatNumberIndian(totalCgst)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₹{formatNumberIndian(totalSgst)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₹{formatNumberIndian(totalIgst)}
                    </td>
                    <td className="py-3 px-4 text-right text-green-800">
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
        <div className="bg-white rounded-lg border border-[#DADCE0] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#DADCE0]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#202124]">
              Monthly Sales Register
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#DADCE0] font-semibold text-[#5F6368] uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Party</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">GST</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DADCE0] font-mono">
                {salesInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 px-4 text-[#5F6368]">{inv.date}</td>
                    <td className="py-3 px-4 font-semibold text-[#1A73E8]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-[#202124]">
                      {inv.clientSnapshot?.name}
                    </td>
                    <td className="py-3 px-4 text-[#5F6368]">
                      {inv.clientSnapshot?.registerNumber || 'URP'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₹{formatNumberIndian(inv.calc.subTotal)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#5F6368]">
                      ₹{formatNumberIndian(inv.calc.taxAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#202124]">
                      ₹{formatNumberIndian(inv.calc.billFigure)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportTab === 'purchases' && (
        <div className="bg-white rounded-lg border border-[#DADCE0] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#DADCE0]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#202124]">
              Monthly Purchase Register
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#DADCE0] font-semibold text-[#5F6368] uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">GSTIN</th>
                  <th className="py-3 px-4 text-right">Taxable</th>
                  <th className="py-3 px-4 text-right">GST Input</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DADCE0] font-mono">
                {purchaseInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 px-4 text-[#5F6368]">{inv.date}</td>
                    <td className="py-3 px-4 font-semibold text-[#1A73E8]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-[#202124]">
                      {inv.clientSnapshot?.name}
                    </td>
                    <td className="py-3 px-4 text-[#5F6368]">
                      {inv.clientSnapshot?.registerNumber || 'URP'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      ₹{formatNumberIndian(inv.calc.subTotal)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#5F6368]">
                      ₹{formatNumberIndian(inv.calc.taxAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#202124]">
                      ₹{formatNumberIndian(inv.calc.billFigure)}
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

