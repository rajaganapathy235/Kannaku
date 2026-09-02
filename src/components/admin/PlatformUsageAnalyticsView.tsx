import React from 'react';
import {
  BarChart3,
  FileText,
  FileSpreadsheet,
  Users,
  Package,
  Printer,
  HardDrive,
  Receipt,
  Flame,
  IndianRupee,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';

export const PlatformUsageAnalyticsView: React.FC = () => {
  const orgs = SaaSAdminDB.getOrganizations();

  const totalInvoices = orgs.reduce((sum, o) => sum + (o.usage.invoicesCreated || 0), 0);
  const totalEstimates = orgs.reduce((sum, o) => sum + (o.usage.estimatesCreated || 0), 0);
  const totalCustomers = orgs.reduce((sum, o) => sum + (o.usage.customersCount || 0), 0);
  const totalProducts = orgs.reduce((sum, o) => sum + (o.usage.productsCount || 0), 0);
  const totalPDFs = orgs.reduce((sum, o) => sum + (o.usage.pdfGenerationsCount || 0), 0);
  const totalTaxHandled = orgs.reduce((sum, o) => sum + (o.usage.gstTaxHandledInr || 0), 0);
  const totalLedgerEntries = orgs.reduce((sum, o) => sum + (o.usage.paymentLedgerEntries || 0), 0);
  const totalStorageMB = orgs.reduce((sum, o) => sum + (o.usage.storageUsedMB || 0), 0);

  const usageCards = [
    { title: 'Tax Invoices Generated', value: totalInvoices.toLocaleString(), icon: FileText, color: 'text-brand-400' },
    { title: 'Estimates & Quotations', value: totalEstimates.toLocaleString(), icon: FileSpreadsheet, color: 'text-brand-400' },
    { title: 'Customer & Party Ledgers', value: totalCustomers.toLocaleString(), icon: Users, color: 'text-emerald-400' },
    { title: 'Catalog HSN/SAC Items', value: totalProducts.toLocaleString(), icon: Package, color: 'text-purple-400' },
    { title: 'Multi-Copy PDFs Rendered', value: totalPDFs.toLocaleString(), icon: Printer, color: 'text-cyan-400' },
    { title: 'Total GST Tax Processed', value: `₹${totalTaxHandled.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-400' },
    { title: 'Payment Receipts Recorded', value: totalLedgerEntries.toLocaleString(), icon: Receipt, color: 'text-amber-400' },
    { title: 'Logo & Bill Cloud Storage', value: `${totalStorageMB} MB`, icon: HardDrive, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>GST Platform Resource & Billing Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time aggregate consumption metrics across all tenant GST workspaces
          </p>
        </div>
      </div>

      {/* 8 Usage Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {usageCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </div>
                <div className="text-xl font-black text-white mt-1">{card.value}</div>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Heaviest Tenants by Load */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Top Organizations by Billing Volume</span>
        </h2>

        <div className="space-y-3 text-xs">
          {orgs.map((org, index) => {
            return (
              <div
                key={org.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm">{org.name}</div>
                    <div className="text-slate-400 text-[11px]">
                      {org.planName} • GSTIN: {org.registerNumber || 'UNREGISTERED'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-[11px] text-slate-300">
                  <div>
                    Invoices: <strong className="text-white">{org.usage.invoicesCreated}</strong>
                  </div>
                  <div>
                    Quotes: <strong className="text-white">{org.usage.estimatesCreated}</strong>
                  </div>
                  <div>
                    GST Processed:{' '}
                    <strong className="text-emerald-400">
                      ₹{(org.usage.gstTaxHandledInr || 0).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    Receipts:{' '}
                    <strong className="text-white">{org.usage.paymentLedgerEntries || 0}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
