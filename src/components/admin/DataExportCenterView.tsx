import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Check, Database, Shield } from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';

export const DataExportCenterView: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = (collection: string, format: 'CSV' | 'JSON') => {
    setDownloading(`${collection}_${format}`);
    setTimeout(() => {
      const data = SaaSAdminDB.exportEntirePlatformData(format, collection);
      const mime = format === 'CSV' ? 'text/csv' : 'application/json';
      const ext = format === 'CSV' ? 'csv' : 'json';
      const blob = new Blob([data], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kannaku_${collection}_export_${new Date().toISOString().split('T')[0]}.${ext}`;
      a.click();
      setDownloading(null);
    }, 400);
  };

  const exportCards = [
    {
      id: 'organizations',
      title: 'Organizations & Businesses',
      desc: 'All tenant accounts, registration numbers, owners, plans, usage counters, and quotas.',
    },
    {
      id: 'users',
      title: 'Platform User Accounts',
      desc: 'All platform users across all tenants, roles, email addresses, and last login timestamps.',
    },
    {
      id: 'transactions',
      title: 'Billing Transactions & Invoices',
      desc: 'Complete payment ledger, gateway reference IDs, tax invoices, and refund records.',
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions & Renewals',
      desc: 'Active subscriptions, renewal schedules, MRR records, and pricing tier linkages.',
    },
    {
      id: 'audit_logs',
      title: 'Audit & Compliance Logs',
      desc: 'Complete immutable log of all operator actions, timestamps, and IP addresses.',
    },
    {
      id: 'all',
      title: 'Full Database Backup Snapshot',
      desc: 'Complete JSON archive of all platform tables, configurations, and state.',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Download className="w-6 h-6 text-emerald-400" />
            <span>Platform Data Export & Backup Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Download on-demand backups and regulatory compliance exports in structured CSV and JSON formats
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportCards.map((card) => {
          return (
            <div
              key={card.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white">{card.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{card.desc}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                {card.id !== 'all' && (
                  <button
                    onClick={() => handleExport(card.id, 'CSV')}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>CSV</span>
                  </button>
                )}
                <button
                  onClick={() => handleExport(card.id, 'JSON')}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileJson className="w-4 h-4 text-brand-400" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
