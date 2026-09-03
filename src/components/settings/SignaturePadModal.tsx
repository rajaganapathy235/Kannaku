import React, { useRef, useState, useEffect } from 'react';
import { Check, Edit3, Image, RefreshCw, Type, Upload, X } from 'lucide-react';

interface SignaturePadModalProps {
  initialSignatureName?: string;
  initialSignatureUrl?: string;
  onClose: () => void;
  onSave: (signatureUrl: string, signatureName: string) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  initialSignatureName = 'K. Vasanthi',
  initialSignatureUrl = '',
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'type' | 'draw' | 'upload'>('type');
  const [signName, setSignName] = useState(initialSignatureName);
  const [selectedFont, setSelectedFont] = useState<'font1' | 'font2' | 'font3' | 'tamil'>('font1');
  const [inkColor, setInkColor] = useState<string>('#1a237e'); // Classic royal blue ink
  const [uploadedImage, setUploadedImage] = useState<string>(initialSignatureUrl || '');

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeTab, inkColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (activeTab === 'draw') {
      if (!canvasRef.current || !hasDrawn) {
        alert('Please draw a signature before saving.');
        return;
      }
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl, signName || 'Authorised Signatory');
    } else if (activeTab === 'upload') {
      if (!uploadedImage) {
        alert('Please upload a signature image first.');
        return;
      }
      onSave(uploadedImage, signName || 'Authorised Signatory');
    } else {
      // Vector SVG calligraphic signature
      if (!signName.trim()) {
        alert('Please enter a name for the signature.');
        return;
      }
      const fontFamily =
        selectedFont === 'font1'
          ? 'cursive, Brush Script MT, sans-serif'
          : selectedFont === 'font2'
          ? 'Caveat, cursive, sans-serif'
          : selectedFont === 'tamil'
          ? 'sans-serif'
          : 'serif, italic';

      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80"><text x="15" y="52" font-family="${fontFamily}" font-size="40" font-weight="bold" font-style="italic" fill="${inkColor}" transform="rotate(-3, 160, 40)">${signName.trim()}</text></svg>`;
      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      onSave(dataUrl, signName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#1A73E8]" />
            <h3 className="text-base font-bold text-slate-900">
              Configure Tenant Signature
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('type')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'type'
                ? 'border-[#1A73E8] text-[#1A73E8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Type Signature</span>
          </button>
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'draw'
                ? 'border-[#1A73E8] text-[#1A73E8] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Draw on Pad</span>
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
            <span>Upload Image</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Signatory Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Signatory Full Name *
            </label>
            <input
              type="text"
              required
              value={signName}
              onChange={(e) => setSignName(e.target.value)}
              placeholder="e.g. K. Vasanthi"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#1A73E8] focus:outline-none"
            />
          </div>

          {/* Type Signature Tab */}
          {activeTab === 'type' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Calligraphic Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFont('font1')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedFont === 'font1'
                      ? 'border-[#1A73E8] bg-brand-50/50 shadow-xs ring-1 ring-[#1A73E8]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] text-slate-500 font-sans mb-1">Cursive Script</div>
                  <div className="text-xl font-bold italic" style={{ fontFamily: 'cursive' }}>
                    {signName || 'K. Vasanthi'}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFont('font2')}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedFont === 'font2'
                      ? 'border-[#1A73E8] bg-brand-50/50 shadow-xs ring-1 ring-[#1A73E8]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] text-slate-500 font-sans mb-1">Handwriting Casual</div>
                  <div className="text-xl font-bold italic" style={{ fontFamily: 'Caveat, cursive, sans-serif' }}>
                    {signName || 'K. Vasanthi'}
                  </div>
                </button>
              </div>

              {/* Ink Color */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-semibold text-slate-600">Ink Color:</span>
                <button
                  type="button"
                  onClick={() => setInkColor('#1a237e')}
                  className={`w-6 h-6 rounded-full bg-[#1a237e] border-2 ${
                    inkColor === '#1a237e' ? 'border-slate-900 ring-2 ring-brand-300' : 'border-white'
                  }`}
                  title="Royal Blue Ink"
                />
                <button
                  type="button"
                  onClick={() => setInkColor('#000000')}
                  className={`w-6 h-6 rounded-full bg-black border-2 ${
                    inkColor === '#000000' ? 'border-slate-900 ring-2 ring-slate-400' : 'border-white'
                  }`}
                  title="Black Ink"
                />
                <button
                  type="button"
                  onClick={() => setInkColor('#1b5e20')}
                  className={`w-6 h-6 rounded-full bg-[#1b5e20] border-2 ${
                    inkColor === '#1b5e20' ? 'border-slate-900 ring-2 ring-green-300' : 'border-white'
                  }`}
                  title="Dark Green Ink"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-amber-50/30 border border-amber-200/60 rounded-lg text-center space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Signature Preview on Bill
                </div>
                <div
                  className="text-2xl font-bold py-2"
                  style={{
                    color: inkColor,
                    fontFamily: selectedFont === 'font1' ? 'cursive' : 'Caveat, cursive, sans-serif',
                    fontStyle: 'italic',
                  }}
                >
                  {signName || 'K. Vasanthi'}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold border-t border-slate-300 pt-1 inline-block px-4">
                  Authorised Signatory
                </div>
              </div>
            </div>
          )}

          {/* Draw Signature Tab */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">
                  Draw with finger / mouse on pad below:
                </span>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear Pad</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 overflow-hidden relative touch-none">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={140}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 cursor-crosshair bg-white"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                    Sign inside this box...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Image Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Upload Scanned Signature (PNG / JPG with transparent background)
              </label>

              <label className="border-2 border-dashed border-slate-300 hover:border-brand-600 rounded-xl p-6 bg-slate-50 hover:bg-brand-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-slate-700">
                  Click to select signature file
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PNG or JPEG up to 2MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {uploadedImage && (
                <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={uploadedImage}
                      alt="Uploaded signature"
                      className="h-12 max-w-[140px] object-contain border border-slate-100 rounded"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      Signature ready
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedImage('')}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
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
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
