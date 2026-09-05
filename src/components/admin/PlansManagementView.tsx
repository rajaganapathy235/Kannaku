import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Check,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  ArrowRight,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { SaaSAdminDB } from '../../utils/adminStorage';
import { SaaSPlan, TenantOrganizationFull } from '../../types/admin';

export const PlansManagementView: React.FC = () => {
  const [plans, setPlans] = useState<SaaSPlan[]>(SaaSAdminDB.getPlans());
  const [editingPlan, setEditingPlan] = useState<SaaSPlan | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadPlans = () => {
    setPlans(SaaSAdminDB.getPlans());
  };

  const activePlan = plans[0] || SaaSAdminDB.getPlans()[0];

  const handleSaveQuickPricing = (
    monthly: number,
    sixMonth: number,
    yearly: number,
    trialDays: number
  ) => {
    if (!activePlan) return;
    const updated: SaaSPlan = {
      ...activePlan,
      monthlyPriceInr: monthly,
      sixMonthPriceInr: sixMonth,
      yearlyPriceInr: yearly,
      trialDurationDays: trialDays,
      updatedOn: new Date().toISOString(),
    };
    SaaSAdminDB.savePlan(updated);
    SaaSAdminDB.logAction('UPDATE_PLAN_PRICING', 'PLAN', updated.id, updated.name, {
      newVal: `Updated pricing: ₹${monthly}/mo, ₹${Math.round(sixMonth / 6)}/mo (6mo), ₹${Math.round(yearly / 12)}/mo (12mo)`,
    });
    reloadPlans();
    showToast('Plan subscription pricing updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-400" />
            <span>SaaS Subscription Plan & Pricing</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Single all-inclusive plan with 1-Month, 6-Month, and 12-Month billing models
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPlan(activePlan || null);
            setIsEditorOpen(true);
          }}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-900/30 transition-all cursor-pointer active:scale-95"
        >
          <Edit className="w-4 h-4" />
          <span>Customize Plan Features & Limits</span>
        </button>
      </div>

      {/* Main Single Plan Hero Card */}
      {activePlan && (
        <div className="rounded-2xl bg-slate-900 border border-brand-500/40 p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-l from-emerald-600 to-brand-600 text-white text-[11px] font-black uppercase tracking-wider rounded-bl-xl shadow-md">
            Active Flagship Plan
          </div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-white">{activePlan.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                  All Features Included
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                {activePlan.tagline ||
                  'Complete GST Invoicing, Tally Multi-Copy Print Engine, Dynamic UPI QR, Digital Signature, GSTR-1, and Stock Alerts'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Free Trial:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white font-bold text-xs">
                {activePlan.trialDurationDays || 7} Days Free
              </span>
            </div>
          </div>

          {/* 3 Duration Pricing Models */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Subscription Billing Durations & Pricing
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Monthly Model */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">1 Month (Monthly)</span>
                    <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      Standard
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-2xl font-black text-white">
                      ₹{activePlan.monthlyPriceInr || 99}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Billed every 30 days. Perfect for new stores testing the software.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Total Billed:</span>
                  <span className="font-bold text-white">₹{activePlan.monthlyPriceInr || 99}</span>
                </div>
              </div>

              {/* 6 Months Model */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between relative">
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow">
                  Save 20%
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-200">6 Months (Half-Yearly)</span>
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-2xl font-black text-emerald-300">
                      ₹{Math.round((activePlan.sixMonthPriceInr || 474) / 6)}
                    </span>
                    <span className="text-xs text-emerald-200/80">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Billed semi-annually. Ideal for regular retail and GST traders.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-200 flex items-center justify-between">
                  <span>Total Billed:</span>
                  <span className="font-bold text-white">
                    ₹{activePlan.sixMonthPriceInr || 474}
                  </span>
                </div>
              </div>

              {/* 12 Months Model */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 flex flex-col justify-between relative">
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow">
                  Save 50% • Best Value
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-200">12 Months (Annual)</span>
                  </div>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-2xl font-black text-emerald-300">
                      ₹{Math.round((activePlan.yearlyPriceInr || 588) / 12)}
                    </span>
                    <span className="text-xs text-emerald-200/80">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Billed ₹588 annually. Maximum savings with 1-year continuous access.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-200 flex items-center justify-between">
                  <span>Total Billed:</span>
                  <span className="font-bold text-white">
                    ₹{activePlan.yearlyPriceInr || 588}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Price Updater */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-brand-400" />
              <span>Quick Rate Editor (INR)</span>
            </h4>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const monthly = Number((form.elements.namedItem('monthlyPrice') as HTMLInputElement).value);
                const sixMonth = Number((form.elements.namedItem('sixMonthPrice') as HTMLInputElement).value);
                const yearly = Number((form.elements.namedItem('yearlyPrice') as HTMLInputElement).value);
                const trial = Number((form.elements.namedItem('trialDuration') as HTMLInputElement).value);
                handleSaveQuickPricing(monthly, sixMonth, yearly, trial);
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
            >
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">1 Month Price (₹)</label>
                <input
                  name="monthlyPrice"
                  type="number"
                  defaultValue={activePlan.monthlyPriceInr || 99}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">6 Months Total (₹)</label>
                <input
                  name="sixMonthPrice"
                  type="number"
                  defaultValue={activePlan.sixMonthPriceInr || 474}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">12 Months Total (₹)</label>
                <input
                  name="yearlyPrice"
                  type="number"
                  defaultValue={activePlan.yearlyPriceInr || 588}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Trial Days</label>
                <input
                  name="trialDuration"
                  type="number"
                  defaultValue={activePlan.trialDurationDays || 7}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Rates</span>
              </button>
            </form>
          </div>

          {/* Included Features Grid */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Included SaaS Modules & Features (100% Unlocked)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs text-slate-300">
              {[
                'Unlimited Tax Invoices',
                'Unlimited Quotations / Estimates',
                'Unlimited Customers & Ledgers',
                'Unlimited Product Catalog',
                'Tally Multi-Copy Engine (Original, Duplicate, Triplicate)',
                'Dynamic UPI QR On Invoices',
                'Digital Seal & Stamp Upload',
                'GSTR-1 Excel / CSV Reports',
                'Low Stock Alerts & Daybook',
                'Multi-user Branch Access',
                'Thermal & A4/A5 PDF Engine',
                'WhatsApp & Email PDF Delivery',
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal for Advanced Customization */}
      {isEditorOpen && editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Customize Plan Details</h3>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tagline / Description</label>
                <input
                  type="text"
                  value={editingPlan.tagline}
                  onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">1 Month (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.monthlyPriceInr}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, monthlyPriceInr: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">6 Months (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.sixMonthPriceInr || 474}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, sixMonthPriceInr: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">12 Months (₹)</label>
                  <input
                    type="number"
                    value={editingPlan.yearlyPriceInr}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, yearlyPriceInr: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  SaaSAdminDB.savePlan(editingPlan);
                  reloadPlans();
                  setIsEditorOpen(false);
                  showToast('Plan updated successfully!');
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
