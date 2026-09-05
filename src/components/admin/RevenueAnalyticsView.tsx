import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  DollarSign,
  Download,
  PieChart,
  BarChart2,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';

export const RevenueAnalyticsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('12M');
  const stats = SaaSAdminDB.getDashboardStats();

  const monthlyBreakdown = [
    { month: 'Sep 25', revenue: 14200, mrr: 12000, newSubs: 3, churns: 0 },
    { month: 'Oct 25', revenue: 18900, mrr: 15400, newSubs: 5, churns: 0 },
    { month: 'Nov 25', revenue: 23100, mrr: 19800, newSubs: 6, churns: 1 },
    { month: 'Dec 25', revenue: 29400, mrr: 24200, newSubs: 8, churns: 0 },
    { month: 'Jan 26', revenue: 38200, mrr: 31000, newSubs: 9, churns: 1 },
    { month: 'Feb 26', revenue: 47900, mrr: 39400, newSubs: 12, churns: 1 },
    { month: 'Mar 26', revenue: 58600, mrr: 48900, newSubs: 15, churns: 1 },
    { month: 'Apr 26', revenue: 71200, mrr: 59800, newSubs: 18, churns: 2 },
    { month: 'May 26', revenue: 86400, mrr: 72000, newSubs: 22, churns: 1 },
    { month: 'Jun 26', revenue: 104000, mrr: 88500, newSubs: 26, churns: 2 },
    { month: 'Jul 26', revenue: 124800, mrr: 106000, newSubs: 31, churns: 2 },
    { month: 'Aug 26', revenue: 148900, mrr: 128400, newSubs: 38, churns: 1 },
  ];

  const maxRev = Math.max(...monthlyBreakdown.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Revenue, MRR & Financial Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep financial telemetry: MRR expansion, churn rates, average revenue per account (ARPU), and LTV
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {['7D', '30D', '90D', '12M', 'ALL'].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                timeRange === r ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Monthly Recurring Revenue (MRR)
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats.monthlyRecurringRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{stats.mrrGrowthPct}% MoM net expansion</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Annual Run Rate (ARR)
          </div>
          <div className="text-2xl font-black text-white">
            ₹{stats.annualRecurringRevenue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">Projected annualized run-rate</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Average Revenue Per Org (ARPU)
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ₹{Math.round(stats.monthlyRecurringRevenue / (stats.activeOrganizations || 1)).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">Blended across all plans</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Net Monthly Revenue Churn
          </div>
          <div className="text-2xl font-black text-white">1.2%</div>
          <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <span>● Well below 2% SaaS industry benchmark</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart Visualizer */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white">Monthly Platform Revenue Trajectory</h2>
            <p className="text-xs text-slate-400">Total gross settlements and recurring subscription revenue</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
              <span>Gross Settled Revenue</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-400">
              <span className="w-3 h-3 rounded-md bg-brand-500"></span>
              <span>Contracted MRR</span>
            </div>
          </div>
        </div>

        {/* Custom Bar Chart Canvas */}
        <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 pb-2">
          {monthlyBreakdown.map((item, idx) => {
            const revHeight = Math.round((item.revenue / maxRev) * 100);
            const mrrHeight = Math.round((item.mrr / maxRev) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  {/* MRR Bar */}
                  <div
                    className="w-1/2 bg-brand-600/70 group-hover:bg-brand-500 rounded-t-md transition-all relative"
                    style={{ height: `${mrrHeight}%` }}
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                      MRR: ₹{item.mrr.toLocaleString()}
                    </div>
                  </div>
                  {/* Gross Revenue Bar */}
                  <div
                    className="w-1/2 bg-emerald-600/80 group-hover:bg-emerald-500 rounded-t-md transition-all relative"
                    style={{ height: `${revHeight}%` }}
                  >
                    <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow whitespace-nowrap z-20">
                      Gross: ₹{item.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-500 group-hover:text-white transition-colors">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown by Tier & Payment Provider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Revenue by Pricing Tier</h3>
          <div className="space-y-3 text-xs">
            {[
              { plan: 'Annual Business (₹12,000/yr)', pct: 45, val: '₹66,960' },
              { plan: 'Pro Trader (₹1,499/mo)', pct: 35, val: '₹52,080' },
              { plan: 'Starter Business (₹799/mo)', pct: 15, val: '₹22,320' },
              { plan: 'Enterprise Custom', pct: 5, val: '₹7,440' },
            ].map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">{p.plan}</span>
                  <span className="font-bold text-white font-mono">{p.val} ({p.pct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Payment Method Distribution</h3>
          <div className="space-y-3 text-xs">
            {[
              { method: 'UPI AutoPay (e-Mandate)', pct: 54, count: '382 transactions' },
              { method: 'Credit & Corporate Cards', pct: 32, count: '226 transactions' },
              { method: 'Net Banking / IMPS', pct: 10, count: '71 transactions' },
              { method: 'PayU Wallet / NetBanking', pct: 4, count: '28 transactions' },
            ].map((m, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">{m.method}</span>
                  <span className="font-bold text-white">{m.pct}% ({m.count})</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${m.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
