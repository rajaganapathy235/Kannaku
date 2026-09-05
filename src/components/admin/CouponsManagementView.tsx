import React, { useState } from 'react';
import {
  TicketPercent,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { SaaSCoupon } from '../../types/admin';

export const CouponsManagementView: React.FC = () => {
  const [coupons, setCoupons] = useState<SaaSCoupon[]>(SaaSAdminDB.getCoupons());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(20);
  const [maxRedemptions, setMaxRedemptions] = useState(100);
  const [validUntil, setValidUntil] = useState('2026-12-31');

  const reloadData = () => {
    setCoupons(SaaSAdminDB.getCoupons());
  };

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = (coupon: SaaSCoupon) => {
    const updated: SaaSCoupon = {
      ...coupon,
      status: coupon.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
    };
    SaaSAdminDB.saveCoupon(updated);
    SaaSAdminDB.logAction('UPDATE_COUPON', 'COUPON', coupon.id, coupon.code, {
      newVal: `status: ${updated.status}`,
    });
    reloadData();
  };

  const handleDelete = (coupon: SaaSCoupon) => {
    if (window.confirm(`Delete coupon code ${coupon.code}?`)) {
      SaaSAdminDB.deleteCoupon(coupon.id);
      SaaSAdminDB.logAction('DELETE_COUPON', 'COUPON', coupon.id, coupon.code);
      reloadData();
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const newCoupon: SaaSCoupon = {
      id: `cpn_${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountType: discountType === 'FIXED_AMOUNT' ? 'FIXED' : 'PERCENTAGE',
      discountValue: Number(discountValue),
      durationType: 'RECURRING',
      expiryDate: validUntil,
      usageLimit: Number(maxRedemptions),
      usedCount: 0,
      perUserLimit: 1,
      planRestrictions: [],
      status: 'ACTIVE',
      createdOn: new Date().toISOString(),
    };

    SaaSAdminDB.saveCoupon(newCoupon);
    SaaSAdminDB.logAction('CREATE_COUPON', 'COUPON', newCoupon.id, newCoupon.code, {
      newVal: `${newCoupon.discountValue}${newCoupon.discountType === 'PERCENTAGE' ? '%' : ' INR'} OFF`,
    });
    reloadData();
    setIsCreateOpen(false);
    setCode('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <TicketPercent className="w-6 h-6 text-amber-400" />
            <span>Promotional Coupons & Discounts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage percentage and flat discount codes, usage quotas, and campaign limits
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-900/30 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => {
          const isActive = coupon.status === 'ACTIVE';
          return (
            <div
              key={coupon.id}
              className={`p-5 rounded-2xl bg-slate-950 border flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-slate-800 hover:border-amber-500/50'
                  : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopy(coupon.code)}
                      className="p-1 hover:bg-slate-900 text-slate-400 hover:text-white rounded"
                      title="Copy code"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {coupon.status}
                  </span>
                </div>

                <div className="text-xl font-black text-white">
                  {coupon.discountType === 'PERCENTAGE'
                    ? `${coupon.discountValue}% OFF`
                    : `₹${coupon.discountValue} FLAT OFF`}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Valid across all monthly & annual business tiers
                </div>

                {/* Usage meter */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-400">Redemption Usage:</span>
                    <span className="text-white">
                      {coupon.usedCount} / {coupon.usageLimit} used
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((coupon.usedCount / (coupon.usageLimit || 1)) * 100)
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(coupon)}
                  className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                >
                  {isActive ? 'Disable Code' : 'Enable Code'}
                </button>
                <button
                  onClick={() => handleDelete(coupon)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Coupon"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Coupon Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 text-xs">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TicketPercent className="w-5 h-5 text-amber-400" />
              <span>Create Promotional Coupon</span>
            </h2>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DIWALI30"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold uppercase focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Max Redemptions</label>
                  <input
                    type="number"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Valid Until</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold cursor-pointer"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
