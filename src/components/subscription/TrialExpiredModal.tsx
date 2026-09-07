import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Crown,
  Eye,
  Lock,
  Receipt,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';

export type ReadOnlyReasonType = 'TRIAL_EXPIRED' | 'SUBSCRIPTION_EXPIRED' | 'ACCOUNT_SUSPENDED' | 'SUSPENDED' | null;

export interface TrialExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason?: ReadOnlyReasonType;
  code?: ReadOnlyReasonType;
  expiryDate?: string;
  organizationName?: string;
  trialDurationDays?: number;
}

export const TrialExpiredModal: React.FC<TrialExpiredModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  reason,
  code,
  expiryDate,
  organizationName = 'Your Business Workspace',
  trialDurationDays,
}) => {
  if (!isOpen) return null;

  const effectiveReason = reason || code || 'TRIAL_EXPIRED';
  const displayTrialDays = trialDurationDays && trialDurationDays > 0 ? trialDurationDays : 14;

  let badgeText = `${displayTrialDays}-Day Free Trial Ended`;
  let titleText = 'Free Trial Expired';
  let descriptionText = `Your ${displayTrialDays}-day risk-free trial period for ${organizationName} has concluded${expiryDate ? ` on ${expiryDate}` : ''}.`;
  let restrictionTitle = 'Invoice Creation is Locked';
  let restrictionDesc = 'To create new GST tax invoices, generate quotations, record payments, or print fresh delivery challans, please upgrade your workspace to a subscription plan.';
  let primaryBtnText = 'Upgrade Plan & Unlock Full Access';
  let badgeColor = 'bg-amber-100 text-amber-800';
  let iconBg = 'bg-amber-50 border-amber-200/80 text-amber-600';

  if (effectiveReason === 'SUBSCRIPTION_EXPIRED') {
    badgeText = 'Subscription Expired';
    titleText = 'Subscription Plan Expired';
    descriptionText = `Your subscription for ${organizationName} has ended${expiryDate ? ` on ${expiryDate}` : ''}. Your workspace has transitioned to safe read-only mode.`;
    restrictionTitle = 'Billing Operations Paused';
    restrictionDesc = 'To resume generating invoices, recording customer payments, adding new inventory, and creating quotations, please renew your subscription.';
    primaryBtnText = 'Renew Subscription & Unlock Access';
    badgeColor = 'bg-rose-100 text-rose-800';
    iconBg = 'bg-rose-50 border-rose-200/80 text-rose-600';
  } else if (effectiveReason === 'ACCOUNT_SUSPENDED' || effectiveReason === 'SUSPENDED') {
    badgeText = 'Account Suspended by Admin';
    titleText = 'Workspace Suspended';
    descriptionText = `This account (${organizationName}) has been paused by the administrator. Historical records remain viewable and printable in read-only mode.`;
    restrictionTitle = 'Write Access Restricted';
    restrictionDesc = 'Creating new invoices, editing existing records, and registering parties are temporarily disabled. Please review your subscription or contact support.';
    primaryBtnText = 'View Subscription & Contact Support';
    badgeColor = 'bg-red-100 text-red-800';
    iconBg = 'bg-red-50 border-red-200/80 text-red-600';
  }

  return (
    <div
      id="trial-expired-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="trial-expired-modal-container"
        className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col relative"
      >
        {/* Subtle Decorative Top Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-brand-500 to-emerald-600" />

        {/* Header & Status Indicator */}
        <div className="p-5 sm:p-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${iconBg}`}>
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${badgeColor}`}>
                  <Clock className="w-3 h-3" />
                  <span>{badgeText}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                  {titleText}
                </h2>
              </div>
            </div>

            <button
              id="trial-expired-modal-close-btn"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Close to browse in read-only mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            {descriptionText}
          </p>
        </div>

        {/* Read-Only Guarantee Box */}
        <div className="px-5 sm:px-6">
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <Eye className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-950 block">
                Read-Only Access is Active
              </span>
              <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                All your historical invoices, party ledgers, and inventory records are completely
                safe. You can search, inspect, view, and print existing records anytime.
              </p>
            </div>
          </div>
        </div>

        {/* Invoicing Restriction Notice */}
        <div className="px-5 sm:px-6 mt-3">
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-amber-950 block">
                {restrictionTitle}
              </span>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                {restrictionDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Highlights Preview */}
        <div className="px-5 sm:px-6 mt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-brand-600" />
                <span>JustGST Business Plans</span>
              </span>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                Starting at ₹49/month
              </span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Unlimited GST Invoices</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Multi-Copy Tally PDF Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Dynamic UPI Payment QR</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>GSTR-1 Excel/CSV Export</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Cloudflare D1 Cloud Sync</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Thermal 80mm POS Slip Format</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-5 sm:p-6 pt-4 space-y-2.5">
          <button
            id="trial-modal-upgrade-btn"
            type="button"
            onClick={onUpgrade}
            className="w-full py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 active:scale-98 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{primaryBtnText}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            id="trial-modal-readonly-btn"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Continue in Read-Only Mode (Browse Existing Data)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
