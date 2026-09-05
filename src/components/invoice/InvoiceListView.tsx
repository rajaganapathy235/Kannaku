import React, { useState } from 'react';
import {
  Building,
  Calendar,
  ChevronRight,
  Copy,
  Edit2,
  Eye,
  FileCheck,
  FilePlus,
  FileText,
  Filter,
  MessageCircle,
  MoreVertical,
  Plus,
  Printer,
  Search,
  Share2,
  Trash2,
} from 'lucide-react';
import { Invoice, InvoiceType } from '../../types';
import { formatIndianCurrency, formatNumberIndian } from '../../utils/numberToWords';

interface InvoiceListViewProps {
  invoices: Invoice[];
  onNewInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onConvertQuotation?: (invoice: Invoice) => void;
}

export const InvoiceListView: React.FC<InvoiceListViewProps> = ({
  invoices,
  onNewInvoice,
  onViewInvoice,
  onEditInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onConvertQuotation,
}) => {
  const [selectedTypeTab, setSelectedTypeTab] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredInvoices = invoices.filter((inv) => {
    // Type tab
    if (selectedTypeTab === 'sales' && inv.invoiceType !== InvoiceType.SALES)
      return false;
    if (
      selectedTypeTab === 'purchase' &&
      inv.invoiceType !== InvoiceType.PURCHASE
    )
      return false;
    if (
      selectedTypeTab === 'quotation' &&
      inv.invoiceType !== InvoiceType.QUOTATION
    )
      return false;

    // Status
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchClient = inv.clientSnapshot?.name.toLowerCase().includes(q);
      const matchGstin = inv.clientSnapshot?.registerNumber
        ?.toLowerCase()
        .includes(q);
      if (!matchNum && !matchClient && !matchGstin) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">
            Paid
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded uppercase">
            Pending
          </span>
        );
      case 'UNPAID':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">
            Overdue
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded uppercase">
            Draft
          </span>
        );
    }
  };

  const getTypeLabel = (type: InvoiceType) => {
    switch (type) {
      case InvoiceType.SALES:
        return 'Tax Invoice';
      case InvoiceType.PURCHASE:
        return 'Purchase';
      case InvoiceType.QUOTATION:
        return 'Quotation';
      default:
        return 'Invoice';
    }
  };

  const handleWhatsAppShare = (inv: Invoice) => {
    const rawPhone = inv.clientSnapshot?.mobile ? inv.clientSnapshot.mobile.replace(/\D/g, '') : '';
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = `*Invoice ${inv.invoiceNumber}*\nClient: ${inv.clientSnapshot?.name || 'Customer'}\nAmount: Rs. ${formatNumberIndian(inv.calc.billFigure)}\nBalance Due: Rs. ${formatNumberIndian(inv.calc.dueAmount)}\nStatus: ${inv.status}`;
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Bill CTA */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Invoices & Billing Register
          </h2>
          <p className="text-xs text-slate-500">
            Manage Tax Invoices, Purchase Bills & Quotations ({invoices.length} total records)
          </p>
        </div>

        <button
          onClick={onNewInvoice}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs active:scale-98 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bill</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Tabs */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar border border-slate-200">
            {[
              { id: 'all', label: `All Bills (${invoices.length})` },
              {
                id: 'sales',
                label: `Sales (${
                  invoices.filter((i) => i.invoiceType === InvoiceType.SALES)
                    .length
                })`,
              },
              {
                id: 'purchase',
                label: `Purchase (${
                  invoices.filter((i) => i.invoiceType === InvoiceType.PURCHASE)
                    .length
                })`,
              },
              {
                id: 'quotation',
                label: `Quotations (${
                  invoices.filter(
                    (i) => i.invoiceType === InvoiceType.QUOTATION
                  ).length
                })`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTypeTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTypeTab === tab.id
                    ? 'bg-brand-50 text-brand-600 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-brand-600 transition-colors"
            >
              <option value="all">All Payment Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="UNPAID">Unpaid / Overdue</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number (e.g. INV/2026/001), party name, GSTIN..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-600 transition-colors"
          />
        </div>
      </div>

      {/* Invoice List Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm text-slate-900">No invoices found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your filter or create a new tax invoice
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Invoice No</th>
                    <th className="py-3.5 px-6">Client / Party</th>
                    <th className="py-3.5 px-6">Tax Regime</th>
                    <th className="py-3.5 px-6 text-right">Taxable</th>
                    <th className="py-3.5 px-6 text-right">GST Output</th>
                    <th className="py-3.5 px-6 text-right">Total Amount</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      onClick={() => onViewInvoice(inv)}
                    >
                      <td className="py-4 px-6 font-mono text-slate-500">
                        {inv.invoiceDate || inv.date || ''}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-brand-600">
                          {inv.invoiceNumber}
                        </div>
                        {inv.invoiceType === InvoiceType.QUOTATION ? (
                          inv.isConverted ? (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded" title={`Converted to ${inv.convertedInvoiceNumber || 'Tax Invoice'}`}>
                              Converted ({inv.convertedInvoiceNumber || 'Tax Invoice'})
                            </span>
                          ) : (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded">
                              Estimate (Not In Ledger)
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {getTypeLabel(inv.invoiceType)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">
                          {inv.clientSnapshot?.name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {inv.clientSnapshot?.city} • GST:{' '}
                          {inv.clientSnapshot?.registerNumber || 'URP'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {inv.invoiceTaxType === 'CGST_SGST'
                            ? 'CGST+SGST'
                            : 'IGST'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-semibold text-slate-900">
                        ₹{formatNumberIndian(inv.calc?.subTotal || 0)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-slate-600">
                        ₹{formatNumberIndian(inv.calc?.taxAmount || 0)}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-black text-slate-900 text-sm">
                        ₹{formatNumberIndian(inv.calc?.billFigure || 0)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td
                        className="py-4 px-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.invoiceType === InvoiceType.QUOTATION && (
                            inv.isConverted ? (
                              <span className="px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                                Converted
                              </span>
                            ) : onConvertQuotation ? (
                              <button
                                onClick={() => onConvertQuotation(inv)}
                                title="Convert Quotation to Official Tax Invoice (Posts to Ledger)"
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Convert to Invoice</span>
                              </button>
                            ) : null
                          )}
                          <button
                            onClick={() => handleWhatsAppShare(inv)}
                            title="Share on WhatsApp (wa.me)"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onViewInvoice(inv)}
                            title="Print / PDF Preview"
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditInvoice(inv)}
                            title="Edit Bill"
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDuplicateInvoice(inv)}
                            title="Duplicate Bill"
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            title="Delete Bill"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => onViewInvoice(inv)}
                  className="p-4 space-y-2 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-brand-600">
                          {inv.invoiceNumber}
                        </span>
                        {inv.invoiceType === InvoiceType.QUOTATION && inv.isConverted && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                            Converted ({inv.convertedInvoiceNumber || 'Tax Inv'})
                          </span>
                        )}
                        {getStatusBadge(inv.status)}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                        {inv.clientSnapshot?.name || 'Customer'}
                      </h4>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-slate-900">
                        ₹{formatNumberIndian(inv.calc?.billFigure || 0)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {inv.invoiceDate || inv.date || ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>
                      GST: ₹{formatNumberIndian(inv.calc?.taxAmount || 0)} ({inv.invoiceTaxType})
                    </span>

                    <div
                      className="flex items-center gap-1.5 flex-wrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {inv.invoiceType === InvoiceType.QUOTATION && (
                        inv.isConverted ? (
                          <span className="px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                            Converted
                          </span>
                        ) : onConvertQuotation ? (
                          <button
                            onClick={() => onConvertQuotation(inv)}
                            className="px-2 py-1 bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs"
                          >
                            <FileCheck className="w-3 h-3" />
                            Convert
                          </button>
                        ) : null
                      )}
                      <button
                        onClick={() => handleWhatsAppShare(inv)}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-xs flex items-center gap-1"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WA
                      </button>
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="px-2.5 py-1 bg-brand-50 text-brand-600 font-semibold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Print
                      </button>
                      <button
                        onClick={() => onEditInvoice(inv)}
                        className="p-1 text-slate-400 hover:text-slate-900"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

