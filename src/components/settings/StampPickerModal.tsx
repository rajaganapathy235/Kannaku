import React, { useState } from 'react';
import { Award, Check, Stamp, Upload, X } from 'lucide-react';

interface StampPickerModalProps {
  initialStampUrl?: string;
  companyName: string;
  city: string;
  onClose: () => void;
  onSave: (stampUrl: string) => void;
}

export const StampPickerModal: React.FC<StampPickerModalProps> = ({
  initialStampUrl = '',
  companyName,
  city,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'upload'>('generate');
  const [stampColor, setStampColor] = useState<'#1b5e20' | '#0d47a1' | '#b71c1c'>('#1b5e20');
  const [customText, setCustomText] = useState(companyName || 'HYTEX COTTON MILLS');
  const [customLocation, setCustomLocation] = useState(city || 'TIRUPPUR');
  const [uploadedStamp, setUploadedStamp] = useState(initialStampUrl || '');

  const generateStampSvg = (color: string, name: string, loc: string) => {
    const cleanName = (name || 'COMPANY NAME').toUpperCase().slice(0, 24);
    const cleanLoc = (loc || 'LOCATION').toUpperCase().slice(0, 16);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><circle cx="80" cy="80" r="74" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="8 4"/><circle cx="80" cy="80" r="64" fill="none" stroke="${color}" stroke-width="2"/><text x="80" y="48" font-size="11" font-family="sans-serif" font-weight="900" fill="${color}" text-anchor="middle">${cleanName}</text><text x="80" y="86" font-size="10" font-family="sans-serif" font-weight="bold" fill="${color}" text-anchor="middle">★ ${cleanLoc} ★</text><text x="80" y="124" font-size="9" font-family="sans-serif" font-weight="900" fill="${color}" text-anchor="middle">AUTH SIGNATORY</text></svg>`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedStamp(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (activeTab === 'upload') {
      if (!uploadedStamp) {
        alert('Please upload a stamp image first.');
        return;
      }
      onSave(uploadedStamp);
    } else {
      const svg = generateStampSvg(stampColor, customText, customLocation);
      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      onSave(dataUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              Company Official Seal & Stamp
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
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'generate'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stamp className="w-4 h-4" />
            <span>Generate Digital Seal</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Rubber Stamp</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Seal Header Text
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. HYTEX COTTON MILLS"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-semibold uppercase text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City / Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g. TIRUPPUR"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-semibold uppercase text-slate-900"
                  />
                </div>
              </div>

              {/* Ink Color */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">Seal Ink:</span>
                <button
                  type="button"
                  onClick={() => setStampColor('#1b5e20')}
                  className={`w-6 h-6 rounded-full bg-[#1b5e20] border-2 ${
                    stampColor === '#1b5e20' ? 'border-slate-900 ring-2 ring-emerald-300' : 'border-white'
                  }`}
                  title="Official Green"
                />
                <button
                  type="button"
                  onClick={() => setStampColor('#0d47a1')}
                  className={`w-6 h-6 rounded-full bg-[#0d47a1] border-2 ${
                    stampColor === '#0d47a1' ? 'border-slate-900 ring-2 ring-blue-300' : 'border-white'
                  }`}
                  title="Bank Navy Blue"
                />
                <button
                  type="button"
                  onClick={() => setStampColor('#b71c1c')}
                  className={`w-6 h-6 rounded-full bg-[#b71c1c] border-2 ${
                    stampColor === '#b71c1c' ? 'border-slate-900 ring-2 ring-rose-300' : 'border-white'
                  }`}
                  title="Official Red"
                />
              </div>

              {/* Live Seal Preview */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center">
                <div
                  className="w-32 h-32 transform hover:rotate-6 transition-transform"
                  dangerouslySetInnerHTML={{
                    __html: generateStampSvg(stampColor, customText, customLocation),
                  }}
                />
                <span className="text-[10px] text-slate-400 mt-2 font-mono">
                  Official Digital Stamp Preview
                </span>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-lg p-6 bg-slate-50 hover:bg-emerald-50/20 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  Select Scanned Stamp PNG
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Transparent PNG recommended
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {uploadedStamp && (
                <div className="p-3 border border-slate-200 rounded-lg bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadedStamp}
                      alt="Uploaded Stamp"
                      className="h-16 w-16 object-contain border border-slate-100 rounded"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      Stamp ready
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedStamp('')}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onSave('')}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Clear Stamp
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Stamp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
