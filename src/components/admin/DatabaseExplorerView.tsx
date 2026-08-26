import React, { useState } from 'react';
import { Database, Search, Download, Eye, Table, Code, Copy, Check, Cloud, Zap } from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { CloudflareDeploymentModal } from '../common/CloudflareDeploymentModal';

export const DatabaseExplorerView: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState<
    'organizations' | 'users' | 'plans' | 'subscriptions' | 'transactions' | 'audit_logs' | 'coupons'
  >('organizations');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);

  const collections = [
    { id: 'organizations', label: 'Organizations (Tenants)' },
    { id: 'users', label: 'Platform Users' },
    { id: 'plans', label: 'SaaS Plans' },
    { id: 'transactions', label: 'Billing Transactions' },
    { id: 'coupons', label: 'Coupons' },
    { id: 'audit_logs', label: 'Audit Logs' },
  ];

  const getData = () => {
    switch (selectedCollection) {
      case 'organizations':
        return SaaSAdminDB.getOrganizations();
      case 'users':
        return SaaSAdminDB.getUsers();
      case 'plans':
        return SaaSAdminDB.getPlans();
      case 'transactions':
        return SaaSAdminDB.getTransactions();
      case 'coupons':
        return SaaSAdminDB.getCoupons();
      case 'audit_logs':
        return SaaSAdminDB.getAuditLogs();
      default:
        return [];
    }
  };

  const records = getData();
  const filtered = records.filter((r) =>
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
            <Database className="w-6 h-6 text-blue-400" />
            <span>Platform Database & Schema Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Low-level read-only schema inspector, record browser, and Cloudflare D1 SQL export
          </p>
        </div>

        <button
          onClick={() => setIsCloudflareModalOpen(true)}
          className="px-3.5 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Zap className="w-4 h-4 text-orange-400" />
          <span>Cloudflare D1 & Edge Hosting</span>
        </button>
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
                ? 'bg-blue-600 text-white shadow-md'
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
                      ? 'bg-blue-600 text-white font-bold'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="font-mono text-[11px] truncate">
                    {item.name || item.code || item.action || item.id}
                  </div>
                  <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
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
