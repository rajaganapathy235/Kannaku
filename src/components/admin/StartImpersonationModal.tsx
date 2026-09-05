import React, { useState } from 'react';
import {
  ExternalLink,
  ShieldAlert,
  X,
  Building2,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { TenantOrganizationFull } from '../../types/admin';
import { SaaSAdminDB } from '../../utils/adminStorage';

interface StartImpersonationModalProps {
  organization: TenantOrganizationFull | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (org: TenantOrganizationFull, reason: string) => void;
}

const PRESET_REASONS = [
  'Customer Support & General Troubleshooting',
  'GST Rates & Tally Print Template Alignment',
  'Customer Ledger & Outstanding Balance Reconciliation',
  'Payment Gateway & Online QR Collection Test',
  'Catalog & Inventory Setup Assistance',
  'Staff Role & Access Permissions Troubleshooting',
];

export const StartImpersonationModal: React.FC<StartImpersonationModalProps> = ({
  organization,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !organization) return null;

  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');
  const [ticketRef, setTicketRef] = useState<string>('');
  const activeAdmin = SaaSAdminDB.getActiveAdminUser();

  const handleStart = () => {
    const finalReason = customReason.trim()
      ? customReason.trim()
      : selectedPreset;
    const finalNote = ticketRef.trim()
      ? `${finalReason} [Ref: ${ticketRef.trim()}]`
      : finalReason;

    onConfirm(organization, finalNote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Start Support Impersonation</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black uppercase">
                  Audited
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Securely enter tenant workspace for troubleshooting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Target Tenant Card */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-600/20 text-brand-400 font-bold flex items-center justify-center text-xs">
                {organization.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white">{organization.name}</div>
                <div className="text-[11px] text-slate-400">
                  {organization.ownerName} • {organization.adminEmail}
                </div>
              </div>
            </div>
            <div className="text-right font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                {organization.planName}
              </span>
            </div>
          </div>

          {/* Audit Notice */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300/90 text-[11px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong className="text-amber-200">Compliance & Audit Trail Notice:</strong> This support session will be permanently logged under operator <strong>{activeAdmin.name} ({activeAdmin.role})</strong> with timestamp and elapsed duration.
            </div>
          </div>

          {/* Preset Reasons */}
          <div className="space-y-2">
            <label className="font-bold text-white text-xs block">
              Select Support / Troubleshooting Objective:
            </label>
            <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {PRESET_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(reason);
                    setCustomReason('');
                  }}
                  className={`px-3 py-2 rounded-xl text-left font-medium transition-all text-xs flex items-center justify-between cursor-pointer ${
                    selectedPreset === reason && !customReason
                      ? 'bg-amber-500/20 border border-amber-500/50 text-amber-200 font-bold'
                      : 'bg-slate-950 border border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{reason}</span>
                  {selectedPreset === reason && !customReason && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Note or Ticket ID */}
          <div className="space-y-3 pt-1 border-t border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Custom Troubleshooting Note (Optional):
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="e.g. Fixing HSN 5208 IGST 5% tax mismatch in Tiruppur export invoice"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Support Ticket / Reference ID (Optional):
              </label>
              <input
                type="text"
                value={ticketRef}
                onChange={(e) => setTicketRef(e.target.value)}
                placeholder="e.g. TICKET-4091 or CHAT-AUG26"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch Impersonation Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
