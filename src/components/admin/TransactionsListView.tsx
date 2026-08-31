import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { SaaSTransaction } from '../../types/admin';

export const TransactionsListView: React.FC = () => {
  const [transactions, setTransactions] = useState<SaaSTransaction[]>(
    SaaSAdminDB.getTransactions()
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');

  const reloadData = () => {
    setTransactions(SaaSAdminDB.getTransactions());
  };

  const handleRefund = (txn: SaaSTransaction) => {
    const reason = window.prompt(
      `Issue full refund of ₹${txn.amount} to ${txn.organizationName} via ${txn.paymentProvider}?\nEnter reason:`,
      'Customer request / Downgrade adjustment'
    );
    if (reason) {
      const updated: SaaSTransaction = {
        ...txn,
        status: 'REFUNDED',
        refundAmount: txn.amount,
        refundDate: new Date().toISOString(),
        failureReason: `Refunded: ${reason}`,
      };
      SaaSAdminDB.saveTransaction(updated);
      SaaSAdminDB.logAction(
        'REFUND_TRANSACTION',
        'TRANSACTION',
        txn.id,
        `₹${txn.amount} - ${txn.organizationName}`,
        { txnId: txn.id, amount: txn.amount, reason }
      );
      reloadData();
      alert(`Refund of ₹${txn.amount} initiated successfully.`);
    }
  };

  const handleDownloadReceipt = (txn: SaaSTransaction) => {
    const content = `=====================================================
JUSTGST SAAS PLATFORM — PAYMENT RECEIPT
=====================================================
Transaction ID: ${txn.id}
Invoice Reference: ${txn.invoiceNumber || 'N/A'}
Date: ${new Date(txn.date).toLocaleString()}
Organization: ${txn.organizationName} (${txn.organizationId})
Amount Paid: INR ₹${txn.amount.toLocaleString()}
Gateway / Provider: ${txn.paymentProvider}
Payment Method: ${txn.paymentMethod}
Gateway Ref ID: ${txn.gatewayRefId}
Status: ${txn.status}
=====================================================
GST Registration: 29AAAAA0000A1Z5
Status: Official Computer Generated Tax Receipt
=====================================================`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${txn.id}.txt`;
    a.click();
  };

  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(search.toLowerCase())) ||
      t.gatewayRefId.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchProvider = providerFilter === 'ALL' || t.paymentProvider === providerFilter;

    return matchSearch && matchStatus && matchProvider;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-400" />
            <span>Platform Billing & Payment Transactions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-gateway ledger across Razorpay, Stripe, Cashfree, and UPI
          </p>
        </div>

        <button
          onClick={() => {
            const csv = SaaSAdminDB.exportEntirePlatformData('CSV', 'transactions');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `justgst_transactions_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Transactions CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search txn ID, invoice, gateway ref..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['ALL', 'SUCCESSFUL', 'FAILED', 'REFUNDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Gateways</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="STRIPE">Stripe</option>
            <option value="CASHFREE">Cashfree</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-extrabold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Transaction / Invoice</th>
                <th className="py-3.5 px-3">Organization</th>
                <th className="py-3.5 px-3">Gateway & Method</th>
                <th className="py-3.5 px-3">Amount</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((txn) => {
                return (
                  <tr key={txn.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white font-mono">{txn.id}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Ref: {txn.invoiceNumber || 'N/A'} • Gate: {txn.gatewayRefId}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-200">
                      {txn.organizationName}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-300">{txn.paymentProvider}</div>
                      <div className="text-[11px] text-slate-500">{txn.paymentMethod}</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-black text-sm text-white">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          txn.status === 'SUCCESSFUL'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : txn.status === 'FAILED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      {new Date(txn.date).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadReceipt(txn)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Download Tax Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {txn.status === 'SUCCESSFUL' && (
                          <button
                            onClick={() => handleRefund(txn)}
                            className="px-2 py-1 bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Execute Gateway Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Refund</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
