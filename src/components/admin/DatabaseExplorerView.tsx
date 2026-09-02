import React, { useState, useEffect } from 'react';
import { Database, Search, Download, Eye, Table, Code, Copy, Check, Cloud, Zap, RefreshCw } from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { ApiService } from '../../utils/apiService';
import { CloudflareDeploymentModal } from '../common/CloudflareDeploymentModal';

export const DatabaseExplorerView: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<string>('organizations');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);
  const [dbRecords, setDbRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const collections = [
    { id: 'organizations', label: 'Organizations (Tenants)' },
    { id: 'users', label: 'Platform Users' },
    { id: 'saas_plans', label: 'SaaS Plans' },
    { id: 'saas_transactions', label: 'Billing Transactions' },
    { id: 'coupons', label: 'Coupons' },
    { id: 'audit_logs', label: 'Audit Logs' },
    { id: 'invoices', label: 'Tenant Invoices' },
    { id: 'clients', label: 'Tenant Clients' },
    { id: 'products', label: 'Tenant Products' },
    { id: 'feature_flags', label: 'Feature Flags' },
  ];

  const fetchTableData = async (table: string) => {
    setLoading(true);
    const res = await ApiService.getAdminDbExplorer(table);
    if (res.success && res.data && res.data.rows) {
      setDbRecords(res.data.rows);
    } else {
      // Fallback to local cache if offline or demo
      switch (table) {
        case 'organizations':
          setDbRecords(SaaSAdminDB.getOrganizations());
          break;
        case 'users':
          setDbRecords(SaaSAdminDB.getUsers());
          break;
        case 'saas_plans':
          setDbRecords(SaaSAdminDB.getPlans());
          break;
        case 'saas_transactions':
          setDbRecords(SaaSAdminDB.getTransactions());
          break;
        case 'coupons':
          setDbRecords(SaaSAdminDB.getCoupons());
          break;
        case 'audit_logs':
          setDbRecords(SaaSAdminDB.getAuditLogs());
          break;
        default:
          setDbRecords([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTableData(selectedCollection);
    setSelectedRecord(null);
  }, [selectedCollection]);

  const filtered = dbRecords.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyJSON = () => {
    if (!selectedRecord) return;
    navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-brand-400" />
            <span>Cloudflare D1 Database & Schema Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live SQL table inspector, real-time D1 record browser, and data diagnostics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTableData(selectedCollection)}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Querying D1...' : 'Refresh SQL'}</span>
          </button>
          <button
            onClick={() => setIsCloudflareModalOpen(true)}
            className="px-3.5 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Zap className="w-4 h-4 text-orange-400" />
            <span>Cloudflare D1 Setup</span>
          </button>
        </div>
      </div>

      {/* Collection tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
        {collections.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCollection(c.id as any);
              setSelectedRecord(null);
            }}
            className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              selectedCollection === c.id
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* 2-Pane Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        {/* Record list */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden text-xs">
          <div className="p-3 border-b border-slate-800">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search raw documents..."
              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800 p-2 space-y-1">
            {filtered.map((item: any, idx) => {
              const isSelected = selectedRecord?.id === item.id;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => setSelectedRecord(item)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white font-bold'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="font-mono text-[11px] truncate">
                    {item.name || item.code || item.action || item.id}
                  </div>
                  <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-brand-100' : 'text-slate-500'}`}>
                    ID: {item.id || 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* JSON Viewer */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden text-xs">
          {selectedRecord ? (
            <>
              <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-300">
                  Document ID: {selectedRecord.id}
                </span>
                <button
                  onClick={handleCopyJSON}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="flex-1 overflow-y-auto p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed">
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a record on the left to inspect raw schema document
            </div>
          )}
        </div>
      </div>

      {/* Cloudflare D1 & Host Modal */}
      <CloudflareDeploymentModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
      />
    </div>
  );
};
