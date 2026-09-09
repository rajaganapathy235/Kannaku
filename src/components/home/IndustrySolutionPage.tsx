import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Shield,
  Zap,
  Sparkles,
  Printer,
  Smartphone,
  Check,
  Building2,
  Factory,
  TrendingUp,
  ShoppingCart,
  Shirt,
  Wrench,
  Car,
  Utensils,
  Briefcase,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { IndustryData, INDUSTRY_SOLUTIONS } from '../../config/industry.config';

interface IndustrySolutionPageProps {
  data: IndustryData;
  onNavigateSlug: (slug: string) => void;
  onGetStarted: () => void;
  onSignIn: () => void;
  onOpenSuperAdmin: () => void;
}

export const IndustrySolutionPage: React.FC<IndustrySolutionPageProps> = ({
  data,
  onNavigateSlug,
  onGetStarted,
  onSignIn,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const getIndustryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Factory':
        return <Factory className="w-4 h-4" />;
      case 'TrendingUp':
        return <TrendingUp className="w-4 h-4" />;
      case 'ShoppingCart':
        return <ShoppingCart className="w-4 h-4" />;
      case 'Shirt':
        return <Shirt className="w-4 h-4" />;
      case 'Wrench':
        return <Wrench className="w-4 h-4" />;
      case 'Car':
        return <Car className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigateSlug('')}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-base shadow-sm group-hover:bg-emerald-400 transition-colors">
              ₹
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Just<span className="text-emerald-400">GST</span>
            </span>
          </button>

          {/* Industry Navigation Bar (Desktop) */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold text-slate-300">
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-wholesale')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'wholesale' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Wholesale
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-manufacturing')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'manufacturing' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Manufacturing
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-traders')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'traders' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Traders
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-pharmacy')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'pharmacy' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Pharmacy
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-supermarket')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'supermarket' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Supermarket
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-apparel')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'apparel' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Apparel
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-hardware')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'hardware' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Hardware
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-electronics')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'electronics' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Electronics
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-auto-parts')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'autoParts' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Auto Parts
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-footwear')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'footwear' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Footwear
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-restaurants')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'restaurants' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Restaurants
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-services')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                data.id === 'services' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Services
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSignIn}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold mb-6">
            {getIndustryIcon(data.iconName)}
            <span>{data.badge}</span>
            <span className="text-emerald-500">•</span>
            <span className="text-emerald-200">₹49/month (₹588/year)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {data.heroHeadline}
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {data.heroDescription}
          </p>

          {/* CTA Group */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('pricing')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl font-semibold text-sm transition-all cursor-pointer"
            >
              View Transparent Pricing (₹49/mo)
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Cloud Access (No Install)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Thermal 2"/3" &amp; A4/A5 Printing
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Dynamic UPI Payment QR
            </span>
          </div>
        </div>

        {/* AEO Direct Answer Summary Box (Engineered for AI Citations) */}
        <div className="mt-12 max-w-3xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                Direct Answer / Key Takeaway
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mb-2">
                {data.aeoSummary.question}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {data.aeoSummary.answer}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Solved Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
            Tailored Industry Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Eliminate Common {data.industryName} Headaches
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            JustGST is engineered to resolve the exact daily hurdles faced by Indian {data.industryName.toLowerCase()}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.keyPainPointsSolved.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/60 border border-rose-800/40 text-rose-300 text-[11px] font-semibold mb-3">
                  <span>❌ Challenge</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-2 leading-snug">{item.problem}</h3>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[11px] font-semibold mb-2">
                  <span>✅ JustGST Solution</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tailored Core Features Grid */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
            Key Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Built for {data.industryName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Everything you need for lightning-fast billing, stock tracking, and party ledger management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.tailoredFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step-by-Step 3-Second Billing Workflow */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
            Workflow Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            3-Step Billing in Under 5 Seconds
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Clean, keyboard-friendly interface designed for rapid counter operations with zero lag.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {data.workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="text-3xl font-black text-emerald-500/20 absolute top-4 right-6 select-none font-mono">
                {step.stepNumber}
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center mb-4">
                {step.stepNumber}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hardware Compatibility Checklist */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
            Hardware Plug &amp; Play
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Compatible with 100% of Your Existing Equipment
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            Zero proprietary hardware lock-in. JustGST works immediately with any printer, scanner, or device you already own.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.hardwareChecklist.map((hw, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center">
                    <Printer className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <Check className="w-3 h-3" />
                    Supported
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{hw.device}</h3>
                <p className="text-[11px] text-slate-400 font-mono mb-2">{hw.spec}</p>
              </div>
              <p className="text-xs text-slate-300 pt-3 border-t border-slate-800/60">{hw.recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industry FAQ Accordion */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Frequently Asked Questions for {data.industryName}
          </h2>
        </div>

        <div className="space-y-3">
          {data.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-850/60 transition-colors"
              >
                <span className="text-sm font-bold text-slate-200">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    openFaqIndex === idx ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Conversion CTA Block */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-gradient-to-br from-emerald-900/40 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join 1,000+ Indian Businesses</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Upgrade Your {data.industryName} Billing for Just ₹49/Month
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-xl mx-auto">
            14-day free trial. No credit card required. Instant cloud setup in under 30 seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('pricing')}
              className="w-full sm:w-auto px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-semibold text-sm transition-all cursor-pointer"
            >
              Compare All Pricing Plans
            </button>
          </div>
        </div>
      </section>

      {/* Explore All 12 Industries Directory Footer */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Explore JustGST Industry Solutions</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          {Object.values(INDUSTRY_SOLUTIONS).map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => onNavigateSlug(ind.slug)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                ind.id === data.id
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] truncate group-hover:text-emerald-400">
                  {ind.industryName.split('&')[0]}
                </span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                {ind.tagline.split(' ')[0]} Billing
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Bottom Copyright */}
      <footer className="py-6 px-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} JustGST. Simple, Fast GST Billing &amp; Inventory Suite.</p>
      </footer>
    </div>
  );
};
