import React, { useState } from 'react';
import { Building2, Check, Image as ImageIcon, Sparkles, Upload, X } from 'lucide-react';

interface LogoPickerModalProps {
  initialLogoUrl?: string;
  companyName: string;
  onClose: () => void;
  onSave: (logoUrl: string) => void;
}

const PRESET_LOGOS = [
  {
    id: 'cotton_group',
    name: 'Textile & Cotton Mills (Screenshot)',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23E65100"><circle cx="50" cy="50" r="48" fill="%23FFF3E0"/><circle cx="50" cy="36" r="14" fill="%23E65100"/><path d="M26 78 C26 58, 74 58, 74 78 Z" fill="%23E65100"/><circle cx="28" cy="40" r="10" fill="%23FB8C00"/><path d="M12 76 C12 62, 44 62, 44 76 Z" fill="%23FB8C00"/><circle cx="72" cy="40" r="10" fill="%23FB8C00"/><path d="M56 76 C56 62, 88 62, 88 76 Z" fill="%23FB8C00"/></svg>',
  },
  {
    id: 'industrial_gear',
    name: 'Industrial & Engineering Gear',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23E3F2FD"/><path d="M50 20 L56 30 L68 28 L70 40 L82 44 L78 56 L86 64 L78 72 L80 84 L68 82 L62 92 L50 86 L38 92 L32 82 L20 84 L22 72 L14 64 L22 56 L18 44 L30 40 L32 28 L44 30 Z" fill="%231976D2"/><circle cx="50" cy="50" r="18" fill="%23FFFFFF"/></svg>',
  },
  {
    id: 'solar_energy',
    name: 'Electrical & Power Tech',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23E8F5E9"/><path d="M55 18 L30 52 L48 52 L42 82 L70 46 L52 46 Z" fill="%232E7D32"/></svg>',
  },
  {
    id: 'trade_logistics',
    name: 'Logistics & Cargo Hub',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23EDE7F6"/><rect x="22" y="38" width="56" height="34" rx="4" fill="%23512DA8"/><circle cx="34" cy="72" r="7" fill="%23311B92"/><circle cx="66" cy="72" r="7" fill="%23311B92"/><path d="M54 38 L68 38 L78 52 L78 72 L54 72 Z" fill="%23673AB7"/></svg>',
  },
  {
    id: 'retail_traders',
    name: 'Retail & Supermarket Mart',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23FBE9E7"/><path d="M25 30 L75 30 L70 65 L30 65 Z" fill="%23D84315"/><circle cx="36" cy="74" r="6" fill="%23BF360C"/><circle cx="64" cy="74" r="6" fill="%23BF360C"/><path d="M40 30 L40 22 C40 16, 60 16, 60 22 L60 30" stroke="%23D84315" stroke-width="4" fill="none"/></svg>',
  },
];

export const LogoPickerModal: React.FC<LogoPickerModalProps> = ({
  initialLogoUrl = '',
  companyName,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');
  const [selectedLogo, setSelectedLogo] = useState<string>(initialLogoUrl || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedLogo(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (svg: string) => {
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setSelectedLogo(dataUrl);
  };

  const handleSave = () => {
    onSave(selectedLogo);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1A73E8]" />
            <h3 className="text-base font-bold text-slate-900">
              Tenant Brand Logo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-[#1A73E8] text-[#1A73E8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Preset Business Badges</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-[#1A73E8] text-[#1A73E8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Custom Logo</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current Selection Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              {selectedLogo ? (
                <img
                  src={selectedLogo}
                  alt="Company Logo"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-xl font-black text-[#1A73E8]">
                  {companyName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {companyName}
              </div>
              <p className="text-xs text-slate-500">
                This logo will appear on all printed Tax Invoices, Delivery Challans, and Statements.
              </p>
            </div>
          </div>

          {activeTab === 'presets' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Choose an emblem style:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_LOGOS.map((preset) => {
                  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(preset.svg)}`;
                  const isSelected = selectedLogo === dataUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.svg)}
                      className={`p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white shrink-0 border border-slate-200 p-0.5">
                        <img
                          src={dataUrl}
                          alt={preset.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-xs font-semibold text-slate-800 leading-tight">
                        {preset.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-xl p-6 bg-slate-50 hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  Select Logo File from Device
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG, or SVG up to 3MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedLogo('')}
              className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Reset to Initials
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Logo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
