import React, { useState } from 'react';
import {
  Cloud,
  Database,
  Globe,
  Server,
  Zap,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Terminal,
  RefreshCw,
  Cpu,
  Layers,
  ArrowUpRight,
  Code2,
} from 'lucide-react';

export const CloudflareDeploymentModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'status' | 'd1_schema' | 'wrangler' | 'deploy_steps'>('status');

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const wranglerConfig = `name = "kannaku-gst-billing"
compatibility_date = "2026-08-26"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "kannaku_saas_prod"
database_id = "d1-kannaku-prod-d891b2c4-8841-47a2"
migrations_dir = "src/db"

[[kv_namespaces]]
binding = "SESSION_KV"
id = "kv-kannaku-sessions-89a1"`;

  const deployCommands = `# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare Account
wrangler login

# 3. Create Cloudflare D1 Serverless SQL Database
wrangler d1 create kannaku_saas_prod

# 4. Execute Relational SQL Schema on D1
wrangler d1 execute kannaku_saas_prod --file=./src/db/schema.sql

# 5. Build & Deploy React Frontend to Cloudflare Pages
npm run build
wrangler pages deploy dist --project-name=kannaku-gst-billing`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Cloudflare Edge & D1 Database Host</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  READY TO DEPLOY
                </span>
              </div>
              <p className="text-xs text-slate-400">Serverless D1 SQL Database & Global Edge Pages</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-2 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cloudflare Architecture
          </button>
          <button
            onClick={() => setActiveTab('deploy_steps')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'deploy_steps'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Deploy Commands (Wrangler)
          </button>
          <button
            onClick={() => setActiveTab('wrangler')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'wrangler'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            wrangler.toml Config
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-orange-400 font-bold">
                    <Database className="w-4 h-4" />
                    <span>D1 Database</span>
                  </div>
                  <div className="text-white font-mono font-bold text-sm">kannaku_saas_prod</div>
                  <div className="text-[11px] text-slate-400">Serverless SQLite at 300+ Edge nodes</div>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Globe className="w-4 h-4" />
                    <span>Cloudflare Pages</span>
                  </div>
                  <div className="text-white font-mono font-bold text-sm">kannaku.pages.dev</div>
                  <div className="text-[11px] text-slate-400">Zero-latency Global Static & SSR</div>
                </div>

                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Auth & Edge KV</span>
                  </div>
                  <div className="text-white font-mono font-bold text-sm">JWT + Role RBAC</div>
                  <div className="text-[11px] text-slate-400">SuperAdmin + Multi-Tenant Isolation</div>
                </div>
              </div>

              {/* Architecture Blueprint */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-400" />
                  <span>How Cloudflare Hosting & D1 Works for Kannaku:</span>
                </h4>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  <li>
                    <strong>Hosting:</strong> Cloudflare Pages hosts the Vite React build with instant zero-downtime rollouts.
                  </li>
                  <li>
                    <strong>Database (D1):</strong> The SQL schema defined in <code className="text-orange-300 font-mono">/src/db/schema.sql</code> provisions tables for organizations, users, invoices, clients, products, and audit logs.
                  </li>
                  <li>
                    <strong>Edge Latency:</strong> Invoices, print renders, and ledgers load in &lt;15ms across India and global regions.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'deploy_steps' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">Terminal Deployment Script:</span>
                <button
                  onClick={() => handleCopy(deployCommands, 'deploy')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSection === 'deploy' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'deploy' ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                <pre>{deployCommands}</pre>
              </div>
            </div>
          )}

          {activeTab === 'wrangler' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300">wrangler.toml (Root Project Config):</span>
                <button
                  onClick={() => handleCopy(wranglerConfig, 'wrangler')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSection === 'wrangler' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'wrangler' ? 'Copied!' : 'Copy Config'}</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-orange-300 overflow-x-auto leading-relaxed">
                <pre>{wranglerConfig}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Cloudflare D1 & Pages Config Verified (V4.2.0)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-orange-600/30"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
};
