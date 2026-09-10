import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Percent,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  TrendingUp,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { SEORouteConfig } from '../../config/seo.config';
import { SEOHead } from '../common/SEOHead';
import { PublicLayout, BreadcrumbItem } from '../layout/PublicLayout';

interface FreeGstCalculatorPageProps {
  seo: SEORouteConfig;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onNavigateSlug: (slug: string) => void;
  onOpenSuperAdmin?: () => void;
}

type CalculationMode = 'exclusive' | 'inclusive';
type SupplyType = 'intra' | 'inter';

const TAX_SLABS = [5, 12, 18, 28] as const;

export const FreeGstCalculatorPage: React.FC<FreeGstCalculatorPageProps> = ({
  seo,
  onOpenLogin,
  onOpenSignup,
  onNavigateSlug,
  onOpenSuperAdmin,
}) => {
  // Calculator States
  const [baseAmountStr, setBaseAmountStr] = useState<string>('10000');
  const [selectedSlab, setSelectedSlab] = useState<number | 'custom'>(18);
  const [customSlabStr, setCustomSlabStr] = useState<string>('18');
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('exclusive');
  const [supplyType, setSupplyType] = useState<SupplyType>('intra');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Parse active rate
  const activeRate = useMemo(() => {
    if (selectedSlab === 'custom') {
      const parsed = parseFloat(customSlabStr);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    return selectedSlab;
  }, [selectedSlab, customSlabStr]);

  // Input amount
  const inputAmount = useMemo(() => {
    const parsed = parseFloat(baseAmountStr.replace(/,/g, ''));
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [baseAmountStr]);

  // Calculation Results
  const { netAmount, gstAmount, cgstAmount, sgstAmount, igstAmount, grossAmount } = useMemo(() => {
    let net = 0;
    let totalTax = 0;
    let gross = 0;

    if (calculationMode === 'exclusive') {
      // Exclusive: inputAmount is Net/Base amount. Add GST.
      net = inputAmount;
      totalTax = (net * activeRate) / 100;
      gross = net + totalTax;
    } else {
      // Inclusive: inputAmount is Gross/MRP amount. Remove GST.
      gross = inputAmount;
      net = gross / (1 + activeRate / 100);
      totalTax = gross - net;
    }

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (supplyType === 'intra') {
      cgst = totalTax / 2;
      sgst = totalTax / 2;
      igst = 0;
    } else {
      cgst = 0;
      sgst = 0;
      igst = totalTax;
    }

    return {
      netAmount: Math.round(net * 100) / 100,
      gstAmount: Math.round(totalTax * 100) / 100,
      cgstAmount: Math.round(cgst * 100) / 100,
      sgstAmount: Math.round(sgst * 100) / 100,
      igstAmount: Math.round(igst * 100) / 100,
      grossAmount: Math.round(gross * 100) / 100,
    };
  }, [inputAmount, activeRate, calculationMode, supplyType]);

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleCopySummary = () => {
    const text = `JustGST Calculation Summary:\nCalculation Mode: ${calculationMode === 'exclusive' ? 'Exclusive (Add GST)' : 'Inclusive (Remove GST)'}\nGST Rate: ${activeRate}%\nSupply Type: ${supplyType === 'intra' ? 'Intra-State (CGST + SGST)' : 'Inter-State (IGST)'}\nNet Base Amount: ${formatINR(netAmount)}\n${supplyType === 'intra' ? `CGST (${activeRate / 2}%): ${formatINR(cgstAmount)}\nSGST (${activeRate / 2}%): ${formatINR(sgstAmount)}` : `IGST (${activeRate}%): ${formatINR(igstAmount)}`}\nTotal GST: ${formatINR(gstAmount)}\nTotal Gross Amount: ${formatINR(grossAmount)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setBaseAmountStr('10000');
    setSelectedSlab(18);
    setCustomSlabStr('18');
    setCalculationMode('exclusive');
    setSupplyType('intra');
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', slug: '' },
    { name: 'Free Tools', slug: '' },
    { name: 'GST Calculator', slug: 'tools/free-gst-calculator' },
  ];

  return (
    <PublicLayout
      currentSlug="tools/free-gst-calculator"
      breadcrumbs={breadcrumbs}
      onNavigateSlug={onNavigateSlug}
      onSignIn={onOpenLogin}
      onStartTrial={onOpenSignup}
      onOpenSuperAdmin={onOpenSuperAdmin}
    >
      <SEOHead seo={seo} />

      <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free 100% Client-Side GST Tool for Indian Businesses</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Online Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700">GST Calculator</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Instantly calculate GST inclusive and exclusive prices, CGST, SGST, and IGST for any tax slab (5%, 12%, 18%, 28%, or custom %). Fast, accurate, and compliant with current Indian GST laws.
            </p>
          </div>

          {/* Main Interactive Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls Card */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">GST Calculation Parameters</h2>
                    <p className="text-xs text-slate-500">Configure base price, tax slab, and state supply type</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Reset calculator values"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {calculationMode === 'exclusive' ? 'Net / Base Amount (₹)' : 'Total Gross / MRP Amount (₹)'}
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold text-base">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={baseAmountStr}
                    onChange={(e) => setBaseAmountStr(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-semibold text-lg bg-white shadow-xs transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {calculationMode === 'exclusive'
                    ? 'Enter the amount before tax to calculate and add GST.'
                    : 'Enter the final MRP or total invoice amount to extract the base value and tax.'}
                </p>
              </div>

              {/* Tax Slab Selection */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  GST Tax Slab Rate
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                  {TAX_SLABS.map((slab) => {
                    const isSelected = selectedSlab === slab;
                    return (
                      <button
                        key={slab}
                        type="button"
                        onClick={() => setSelectedSlab(slab)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600'
                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {slab}%
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setSelectedSlab('custom')}
                    className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      selectedSlab === 'custom'
                        ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Custom %
                  </button>
                </div>

                {/* Custom Slab Input */}
                {selectedSlab === 'custom' && (
                  <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Enter Custom Rate:</span>
                    <div className="relative w-36">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={customSlabStr}
                        onChange={(e) => setCustomSlabStr(e.target.value)}
                        className="w-full pl-3 pr-8 py-1.5 text-sm font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mode & Supply Type Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Calculation Type
                  </label>
                  <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setCalculationMode('exclusive')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        calculationMode === 'exclusive'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Exclusive (+GST)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalculationMode('inclusive')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        calculationMode === 'inclusive'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Inclusive (-GST)
                    </button>
                  </div>
                </div>

                {/* Supply Type Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    State Supply Jurisdiction
                  </label>
                  <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSupplyType('intra')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        supplyType === 'intra'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Intra (CGST+SGST)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupplyType('inter')}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        supplyType === 'inter'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Inter (IGST)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Output Results Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Calculation Breakdown</h2>
                    <span className="inline-block mt-0.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Rate: {activeRate}% • {calculationMode === 'exclusive' ? 'GST Exclusive' : 'GST Inclusive'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Subtotal Items */}
                <div className="space-y-3">
                  {/* Net Amount */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <div className="text-xs font-semibold text-slate-600">Net / Base Amount</div>
                      <div className="text-[11px] text-slate-400">Pre-tax taxable value</div>
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {formatINR(netAmount)}
                    </div>
                  </div>

                  {/* Tax Split Display */}
                  {supplyType === 'intra' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-xs font-semibold text-slate-600">
                          CGST ({activeRate / 2}%)
                        </div>
                        <div className="text-[11px] text-slate-400">Central GST</div>
                        <div className="text-sm font-bold text-slate-900 mt-1">
                          {formatINR(cgstAmount)}
                        </div>
                      </div>
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="text-xs font-semibold text-slate-600">
                          SGST ({activeRate / 2}%)
                        </div>
                        <div className="text-[11px] text-slate-400">State GST</div>
                        <div className="text-sm font-bold text-slate-900 mt-1">
                          {formatINR(sgstAmount)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="text-xs font-semibold text-slate-600">
                          IGST ({activeRate}%)
                        </div>
                        <div className="text-[11px] text-slate-400">Integrated GST (Inter-State)</div>
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        {formatINR(igstAmount)}
                      </div>
                    </div>
                  )}

                  {/* Total Tax */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl">
                    <div className="text-xs font-semibold text-slate-600">Total GST Amount</div>
                    <div className="text-sm font-bold text-emerald-700">
                      +{formatINR(gstAmount)}
                    </div>
                  </div>

                  {/* Highlight Gross Card */}
                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/90 rounded-2xl space-y-1 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                        Total Gross Amount (Invoice Value)
                      </span>
                      <BadgeCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
                      {formatINR(grossAmount)}
                    </div>
                    <div className="text-[11px] text-emerald-700/90 pt-1">
                      {calculationMode === 'exclusive'
                        ? `Net amount ${formatINR(netAmount)} + Total GST ${formatINR(gstAmount)}`
                        : `MRP ${formatINR(grossAmount)} contains ${formatINR(gstAmount)} GST`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AEO Direct Answer Summary Block (Citations for AI Search & Engines) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Info className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold">What is the GST Calculation Formula in India?</h2>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <strong>Quick Answer:</strong> To add GST (Exclusive), multiply the base amount by the tax rate and divide by 100. To remove GST (Inclusive), subtract the base amount derived from dividing the gross total by (1 + GST rate / 100).
            </p>
          </div>

          {/* Two Side-by-Side Formula Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exclusive Formula Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Percent className="w-4 h-4" />
                <h3>1. GST Exclusive Formula (Add GST to Base Price)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use this formula when selling goods or services at a net cost and applying GST on top:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 space-y-1.5">
                <div>GST Amount = (Net Amount × GST Rate) / 100</div>
                <div className="text-emerald-700 font-bold">Total Gross Amount = Net Amount + GST Amount</div>
              </div>
              <div className="text-xs text-slate-500">
                <em>Example:</em> ₹10,000 at 18% GST → GST = ₹1,800 → Gross Total = ₹11,800.
              </div>
            </div>

            {/* Inclusive Formula Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Percent className="w-4 h-4" />
                <h3>2. GST Inclusive Formula (Extract GST from MRP)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use this formula when the customer paid a final MRP price and you need to compute the taxable value:
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 space-y-1.5">
                <div>Net Base Amount = Gross Amount / (1 + (GST Rate / 100))</div>
                <div className="text-emerald-700 font-bold">GST Amount = Gross Amount - Net Base Amount</div>
              </div>
              <div className="text-xs text-slate-500">
                <em>Example:</em> ₹11,800 MRP at 18% GST → Net Base = ₹10,000 → GST Extracted = ₹1,800.
              </div>
            </div>
          </div>

          {/* GST Slabs Reference Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-bold text-slate-900">Standard GST Tax Slabs in India</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold">
                    <th className="py-3 px-4">Tax Slab</th>
                    <th className="py-3 px-4">Intra-State Split</th>
                    <th className="py-3 px-4">Inter-State (IGST)</th>
                    <th className="py-3 px-4">Common Applicable Categories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-700">0% (Nil)</td>
                    <td className="py-3 px-4">0% CGST + 0% SGST</td>
                    <td className="py-3 px-4">0% IGST</td>
                    <td className="py-3 px-4">Fresh vegetables, milk, bread, unprocessed food grains</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-700">5%</td>
                    <td className="py-3 px-4">2.5% CGST + 2.5% SGST</td>
                    <td className="py-3 px-4">5% IGST</td>
                    <td className="py-3 px-4">Packaged food items, generic medicines, transport services</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-700">12%</td>
                    <td className="py-3 px-4">6% CGST + 6% SGST</td>
                    <td className="py-3 px-4">12% IGST</td>
                    <td className="py-3 px-4">Processed food items, computers, hardware goods, medical equipment</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-700">18%</td>
                    <td className="py-3 px-4">9% CGST + 9% SGST</td>
                    <td className="py-3 px-4">18% IGST</td>
                    <td className="py-3 px-4">Standard SaaS/IT services, FMCG goods, restaurants, capital goods</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-emerald-700">28%</td>
                    <td className="py-3 px-4">14% CGST + 14% SGST</td>
                    <td className="py-3 px-4">28% IGST</td>
                    <td className="py-3 px-4">Luxury automobiles, consumer durables, air conditioners, tobacco</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions (GST Calculations)</h3>
            </div>

            <div className="space-y-3">
              {seo.faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <span className="text-slate-400 font-bold text-base shrink-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversion CTA Banner */}
          <section className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 relative overflow-hidden shadow-xl border border-slate-800">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
                <Zap className="w-3.5 h-3.5" />
                <span>Automate All Invoicing &amp; GST Returns</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Tired of Manual Calculations?
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
                Generate 100% compliant GST tax invoices, automatically compute CGST/SGST/IGST, track customer khata, and manage inventory with JustGST at just ₹49/month.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onOpenSignup}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all text-sm cursor-pointer"
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition-all text-sm cursor-pointer"
                >
                  <span>Sign In to Workspace</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant cloud setup
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ₹49/month after trial
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
};
