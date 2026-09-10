import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Zap,
  Sparkles,
  Printer,
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
import { getSEOConfigForPath } from '../../config/seo.config';
import { SEOHead } from '../common/SEOHead';
import { PublicLayout } from '../layout/PublicLayout';

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
  onOpenSuperAdmin,
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

  const seoEntry = getSEOConfigForPath(data.slug);

  const breadcrumbs = [
    { name: 'Home', slug: '' },
    { name: 'Industries', slug: '' },
    { name: data.industryName, slug: data.slug },
  ];

  return (
    <PublicLayout
      currentSlug={data.slug}
      breadcrumbs={breadcrumbs}
      onNavigateSlug={onNavigateSlug}
      onSignIn={onSignIn}
      onStartTrial={onGetStarted}
      onOpenSuperAdmin={onOpenSuperAdmin}
    >
      {seoEntry && <SEOHead seo={seoEntry} />}

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-6 shadow-2xs">
          {getIndustryIcon(data.iconName)}
          <span>{data.badge}</span>
          <span className="text-brand-400">•</span>
          <span className="text-brand-700 font-bold">₹49/month (₹588/year)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
          {data.heroHeadline}
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {data.heroDescription}
        </p>

        {/* CTA Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigateSlug('pricing')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-2xs"
          >
            View Pricing (₹49/mo)
          </button>
        </div>

        {/* Trust Highlights */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 14-Day Free Trial Included
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% CBIC Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero Software Installation
          </span>
        </div>
      </section>

      {/* Pain Points vs JustGST Solutions */}
      <section className="py-14 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Industry Challenges Solved
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Why Generic Billing Fails for {data.industryName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
              We built specialized workflows tailored specifically to how {data.industryName.toLowerCase()} operate every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(data.keyPainPointsSolved || []).map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span>Problem #{idx + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                    {item.problem}
                  </h3>
                  <div className="pt-3 border-t border-slate-200 mt-3">
                    <div className="text-xs font-bold text-brand-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>JustGST Solution</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Industry Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Specialized Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Built Directly for {data.industryName}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(data.tailoredFeatures || []).map((feat, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all shadow-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 border border-brand-200 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Step-by-Step 3-Second Billing Workflow */}
      <section className="py-14 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Workflow Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              3-Step Billing in Under 5 Seconds
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
              Clean, keyboard-friendly interface designed for rapid counter operations with zero lag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {(data.workflowSteps || []).map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-xs"
              >
                <div className="text-3xl font-black text-slate-200 absolute top-4 right-6 select-none font-mono">
                  {step.stepNumber}
                </div>
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center mb-4">
                  {step.stepNumber}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Compatibility Checklist */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Hardware Plug &amp; Play
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Compatible with 100% of Your Existing Equipment
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
            Zero proprietary hardware lock-in. JustGST works immediately with any printer, scanner, or device you already own.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data.hardwareChecklist || []).map((hw, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-brand-600 flex items-center justify-center">
                    <Printer className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Check className="w-3 h-3" />
                    Supported
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{hw.device}</h3>
                <p className="text-[11px] text-slate-500 font-mono mb-2">{hw.spec}</p>
              </div>
              <p className="text-xs text-slate-600 pt-3 border-t border-slate-100">{hw.recommendation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industry FAQ Accordion */}
      <section className="py-14 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Frequently Asked Questions for {data.industryName}
            </h2>
          </div>

          <div className="space-y-3">
            {(data.faqs || []).map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl bg-slate-50/60 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-800">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaqIndex === idx ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion CTA Block */}
      <section className="py-16 bg-slate-950 px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join 1,000+ Indian Businesses</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Upgrade Your {data.industryName} Billing for Just ₹49/Month
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-xl mx-auto">
            14-day free trial. No credit card required. Instant cloud setup in under 30 seconds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-500 hover:bg-brand-400 text-slate-950 rounded-xl font-black text-sm transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('pricing')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-semibold text-sm transition-all cursor-pointer"
            >
              Compare All Pricing Plans
            </button>
          </div>
        </div>
      </section>

      {/* Explore All 12 Industries Directory */}
      <section className="py-12 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>Explore All 12 JustGST Industry Solutions</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {Object.values(INDUSTRY_SOLUTIONS).map((ind) => (
              <button
                key={ind.id}
                type="button"
                onClick={() => onNavigateSlug(ind.slug)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                  ind.id === data.id
                    ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] truncate group-hover:text-brand-600">
                    {ind.industryName.split('&')[0]}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                  {ind.tagline.split(' ')[0]} Billing
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
