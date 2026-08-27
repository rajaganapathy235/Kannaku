import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Building,
  Check,
  ChevronRight,
  Cloud,
  Database,
  Download,
  Edit2,
  Edit3,
  Image as ImageIcon,
  Key,
  Landmark,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stamp,
  Trash2,
  Upload,
} from 'lucide-react';
import { CompanyProfile } from '../../types';
import { KannakuDB } from '../../utils/storage';
import { LogoPickerModal } from './LogoPickerModal';
import { SignaturePadModal } from './SignaturePadModal';
import { StampPickerModal } from './StampPickerModal';

interface SettingsViewProps {
  company: CompanyProfile;
  onUpdateCompany: (company: CompanyProfile) => void;
  onRestoreDatabase: () => void;
  onOpenHowToUse?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  company,
  onUpdateCompany,
  onRestoreDatabase,
  onOpenHowToUse,
}) => {
  const [form, setForm] = useState<CompanyProfile>(() => ({
    ...company,
    bankDetail: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      upiId: '',
      panNumber: '',
      ...(company.bankDetail || {}),
    },
  }));
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setForm({
      ...company,
      bankDetail: {
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        upiId: '',
        panNumber: '',
        ...(company.bankDetail || {}),
      },
    });
  }, [company]);

  // Branding Modals state
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);

  const handleFormChange = (field: keyof CompanyProfile, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      bankDetail: {
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        upiId: '',
        panNumber: '',
        ...(prev.bankDetail || {}),
        [field]: value,
      },
    }));
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateCompany(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveLogo = (logoUrl: string) => {
    const updated = { ...form, logoUrl };
    setForm(updated);
    onUpdateCompany(updated);
    setIsLogoModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveSignature = (signatureUrl: string, signatureName: string) => {
    const updated = { ...form, signatureUrl, signatureName };
    setForm(updated);
    onUpdateCompany(updated);
    setIsSignatureModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveStamp = (stampUrl: string) => {
    const updated = { ...form, stampUrl };
    setForm(updated);
    onUpdateCompany(updated);
    setIsStampModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = KannakuDB.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kannaku_billing_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = KannakuDB.importAllData(content);
        if (ok) {
          alert('Database restored successfully from backup!');
          onRestoreDatabase();
        } else {
          alert('Failed to parse backup JSON file.');
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* 1. Header Banner & Branding Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Header Banner */}
        <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 relative px-6 flex items-start justify-between pt-4">
          <div className="text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 text-slate-200 px-2.5 py-1 rounded-md backdrop-blur-xs border border-white/10">
              Company Profile & Billing Master
            </span>
          </div>
          {savedSuccess && (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 shadow-xs border border-emerald-200 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved Successfully!</span>
            </span>
          )}
        </div>

        {/* Profile Card Body */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Circular Logo Avatar overlapping banner */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt={form.name}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-black text-2xl">
                      {form.name ? form.name.slice(0, 2).toUpperCase() : 'CO'}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="mt-1.5 w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{form.logoUrl ? 'Change Logo' : 'Add Logo'}</span>
                </button>
              </div>

              <div className="pb-4">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {form.name || 'HYTEX COTTON MILLS'}
                </h2>
                <p className="text-xs text-slate-500 font-mono font-medium">
                  GSTIN: {form.registerNumber || '33ASWPV8266F1ZW'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons for Signature & Stamp */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <button
                type="button"
                onClick={() => setIsSignatureModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>{form.signatureUrl ? 'Edit Signature' : 'Add Signature'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsStampModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Stamp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{form.stampUrl ? 'Edit Stamp' : 'Add Stamp'}</span>
              </button>
            </div>
          </div>

          {/* Signature & Stamp Live Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 mb-6">
            {/* Signature Preview Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                  Authorised Signatory
                </span>
                <div className="text-lg font-bold py-1 text-slate-900 italic font-serif">
                  {form.signatureName || 'Authorized Signatory'}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Configure Signature Pad →
                </button>
              </div>

              {form.signatureUrl && (
                <div className="h-12 w-28 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                  <img
                    src={form.signatureUrl}
                    alt="Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>

            {/* Official Stamp Preview Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                  Company Seal & Stamp
                </span>
                <div className="text-xs font-bold text-slate-900 pt-1">
                  {form.stampUrl ? 'Digital Seal Configured' : 'No Seal Configured'}
                </div>
                <button
                  type="button"
                  onClick={() => setIsStampModalOpen(true)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 mt-1 block cursor-pointer"
                >
                  Configure Company Seal →
                </button>
              </div>

              {form.stampUrl ? (
                <div className="w-14 h-14 bg-white rounded-full border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={form.stampUrl}
                    alt="Stamp"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  <Stamp className="w-5 h-5" />
                </div>
              )}
            </div>
          </div>

          {/* Company Details List */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                  Phone Number
                </span>
                <span className="font-semibold text-slate-900">
                  {form.mobile || '8870796169'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                  Email Address
                </span>
                <span className="font-semibold text-slate-900">
                  {form.email || 'hytexcottonmills@gmail.com'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                  Registered Address
                </span>
                <span className="font-semibold text-slate-900">
                  {form.address || 'SFNO. 71/1, ST-2, PARAPPU THOTTAM, Muniyandi Vilas Hotel, UTHUKULI TOWN PANCHAYAT, UTHUKULI'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                    City / Location
                  </span>
                  <span className="font-semibold text-slate-900">
                    {form.city || 'Tiruppur'}, {form.state || 'Tamil Nadu'} ({form.pin || '638751'})
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Award className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">
                    GSTIN
                  </span>
                  <span className="font-mono font-bold text-blue-600">
                    {form.registerNumber || '33ASWPV8266F1ZW'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full Editable Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Edit Business Master Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company / Trade Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                GSTIN (15-digit GST) *
              </label>
              <input
                type="text"
                required
                value={form.registerNumber}
                onChange={(e) =>
                  handleFormChange('registerNumber', e.target.value.toUpperCase())
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => handleFormChange('mobile', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Registered Street Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                City / Town
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleFormChange('city', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleFormChange('state', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Bank & Settlement Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Landmark className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Bank Details & UPI Print (Printed on Invoices)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={form.bankDetail?.bankName || ''}
                onChange={(e) => handleBankChange('bankName', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Branch Name
              </label>
              <input
                type="text"
                value={form.bankDetail?.branchName || ''}
                onChange={(e) => handleBankChange('branchName', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bank Account Number
              </label>
              <input
                type="text"
                value={form.bankDetail?.accountNumber || ''}
                onChange={(e) =>
                  handleBankChange('accountNumber', e.target.value)
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={form.bankDetail?.ifscCode || ''}
                onChange={(e) =>
                  handleBankChange('ifscCode', e.target.value.toUpperCase())
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono uppercase font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                UPI ID / VPA (Printed on Invoices for Customer Direct QR Payments)
              </label>
              <input
                type="text"
                value={form.bankDetail?.upiId || ''}
                onChange={(e) => handleBankChange('upiId', e.target.value)}
                placeholder="e.g. hytexmills@hdfcbank"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold text-blue-600 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes to Profile & Bank Information</span>
        </button>
      </form>

      {/* Database Backup & Restore */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Database className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Database Backup & Data Portability
          </h3>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Download a complete encrypted JSON archive of all your invoices, products, party ledgers, and transactions. You can restore it anytime on any PC or mobile device.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Full Backup (JSON)</span>
          </button>

          <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Restore from Backup (.json)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 3. Workspace Data & Guide Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Workspace Mode & Billing Guide
            </h3>
          </div>
          {onOpenHowToUse && (
            <button
              type="button"
              onClick={onOpenHowToUse}
              className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open How-to-Use Guide</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          For real production billing, keep your workspace clean with 0 mock data. You can reset to a clean slate or load sample records on demand.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all invoices, clients, products and payments to a clean slate?')) {
                KannakuDB.clearWorkspaceData();
                onRestoreDatabase();
                alert('Workspace reset to clean slate!');
              }
            }}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Reset to Clean Slate (0 Mock Data)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Load sample test invoices, clients, and catalog items?')) {
                KannakuDB.loadDemoData();
                onRestoreDatabase();
                alert('Sample demo records loaded!');
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Load Sample Demo Data</span>
          </button>
        </div>
      </div>

      {/* Branding Modals */}
      {isLogoModalOpen && (
        <LogoPickerModal
          initialLogoUrl={form.logoUrl}
          companyName={form.name}
          onClose={() => setIsLogoModalOpen(false)}
          onSave={handleSaveLogo}
        />
      )}

      {isSignatureModalOpen && (
        <SignaturePadModal
          initialSignatureName={form.signatureName}
          initialSignatureUrl={form.signatureUrl}
          onClose={() => setIsSignatureModalOpen(false)}
          onSave={handleSaveSignature}
        />
      )}

      {isStampModalOpen && (
        <StampPickerModal
          initialStampUrl={form.stampUrl}
          companyName={form.name}
          city={form.city}
          onClose={() => setIsStampModalOpen(false)}
          onSave={handleSaveStamp}
        />
      )}
    </div>
  );
};
