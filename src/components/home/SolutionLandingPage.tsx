import React, { useState } from 'react';
import {
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Clock,
  Lock,
} from 'lucide-react';
import { SEORouteConfig } from '../../config/seo.config';
import { SEOHead } from '../common/SEOHead';
import { PublicLayout } from '../layout/PublicLayout';

interface SolutionLandingPageProps {
  seo: SEORouteConfig;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onNavigateSlug: (slug: string) => void;
  onOpenSuperAdmin?: () => void;
}

export const SolutionLandingPage: React.FC<SolutionLandingPageProps> = ({
  seo,
  onOpenLogin,
  onOpenSignup,
  onNavigateSlug,
  onOpenSuperAdmin,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const isMultiComparison = seo.slug.includes('gogst') || seo.slug.includes('swipe') || seo.slug.includes('mybillbook');
  const isVyaparComparison = (seo.slug.includes('compare') || seo.slug.includes('vyapar')) && !isMultiComparison;
  const isPricing = seo.slug === 'pricing';

  const breadcrumbs = seo.breadcrumbs && Array.isArray(seo.breadcrumbs)
    ? seo.breadcrumbs.map((b) => ({
        name: b.name,
        slug: (b.url || '').replace('https://justgst.in/', '').replace(/\/$/, ''),
      }))
    : [{ name: 'Home', slug: '' }, { name: seo.title || 'Solution', slug: seo.slug || '' }];

  return (
    <PublicLayout
      currentSlug={seo.slug}
      breadcrumbs={breadcrumbs}
      onNavigateSlug={onNavigateSlug}
      onSignIn={onOpenLogin}
      onStartTrial={onOpenSignup}
      onOpenSuperAdmin={onOpenSuperAdmin}
    >
      <SEOHead seo={seo} />

      {/* Hero Section with High-Intent H1 & AEO Direct Answer */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>{seo.badge || 'GST-Compliant Cloud Billing'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-5">
          {seo.h1}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-3xl mx-auto">
          {seo.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenSignup}
            className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/20 cursor-pointer active:scale-98"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            Log In to Workspace
          </button>
        </div>

        {/* Quick Trust Highlights */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 14-Day Free Trial Included
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% CBIC GST Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero Software Installation
          </span>
        </div>
      </section>

      {/* AEO Key Knowledge Block (Answer Engine Optimization for AI Citations) */}
      {seo.aeoAnswers && seo.aeoAnswers.length > 0 && (
        <section className="bg-white border-y border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-[11px] font-bold tracking-wider text-brand-700 uppercase">
                Quick Facts &amp; Definitions
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Direct Overview &amp; Compliance Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {seo.aeoAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center mb-3 font-bold">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                      {item.question}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5-Way Multi-Competitor Comparison Table (JustGST vs GoGST vs Vyapar vs Swipe vs myBillBook) */}
      {isMultiComparison && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              India Billing Software Face-Off
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2">
              JustGST vs GoGST vs Vyapar vs Swipe vs myBillBook
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl mx-auto">
              An objective, side-by-side comparison across pricing, cloud architecture, usability, hardware compatibility, and deployment speed.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-md">
            <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6 w-1/4">Feature / Metric</th>
                  <th className="py-4 px-4 sm:px-6 text-brand-700 bg-brand-50/70 border-x border-brand-200/60 w-1/5">
                    <div className="flex items-center gap-1.5 font-black">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>JustGST</span>
                    </div>
                    <span className="text-[10px] text-brand-700 font-normal lowercase block mt-0.5">₹49/mo (₹588/yr)</span>
                  </th>
                  <th className="py-4 px-4 text-slate-600">GoGST</th>
                  <th className="py-4 px-4 text-slate-600">Vyapar</th>
                  <th className="py-4 px-4 text-slate-600">Swipe</th>
                  <th className="py-4 px-4 text-slate-600">myBillBook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Starting Price</td>
                  <td className="py-3.5 px-4 sm:px-6 text-brand-700 font-bold bg-brand-50/40 border-x border-brand-200/60">
                    ₹49/mo <span className="text-[10px] text-slate-500 font-normal">(₹588/yr)</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">₹1,499+/yr</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">₹2,399–₹3,999/yr</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">₹1,299–₹2,499/yr</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">₹1,899–₹4,599/yr</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Deployment Model</td>
                  <td className="py-3.5 px-4 sm:px-6 text-brand-700 font-bold bg-brand-50/40 border-x border-brand-200/60">
                    100% Web Cloud + PWA
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">Web / Cloud</td>
                  <td className="py-3.5 px-4 text-slate-500">Desktop Windows App + Android</td>
                  <td className="py-3.5 px-4 text-slate-600">Web + Mobile App</td>
                  <td className="py-3.5 px-4 text-slate-500">Desktop Windows + Android</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Software Installation</td>
                  <td className="py-3.5 px-4 sm:px-6 text-brand-700 font-bold bg-brand-50/40 border-x border-brand-200/60">
                    Zero Install (Instant Browser Login)
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">No install required</td>
                  <td className="py-3.5 px-4 text-slate-500">Required on PC</td>
                  <td className="py-3.5 px-4 text-slate-600">Optional app install</td>
                  <td className="py-3.5 px-4 text-slate-500">Required for desktop</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Mac &amp; iPad Compatibility</td>
                  <td className="py-3.5 px-4 sm:px-6 text-brand-700 font-bold bg-brand-50/40 border-x border-brand-200/60">
                    Native Full Support
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                  <td className="py-3.5 px-4 text-rose-600 font-medium">No native Mac app</td>
                  <td className="py-3.5 px-4 text-slate-600">Supported via browser</td>
                  <td className="py-3.5 px-4 text-slate-500">Limited browser mode</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Learning Curve &amp; Complexity</td>
                  <td className="py-3.5 px-4 sm:px-6 text-brand-700 font-bold bg-brand-50/40 border-x border-brand-200/60">
                    Under 3 minutes (Zero Bloat)
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">Moderate</td>
                  <td className="py-3.5 px-4 text-slate-500">High (Dense menus)</td>
                  <td className="py-3.5 px-4 text-slate-600">Moderate</td>
                  <td className="py-3.5 px-4 text-slate-500">Moderate to High</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Multi-Device Real-Time Sync</td>
                  <td className="py-3.5 px-4 sm:px-6 text-brand-700 font-bold bg-brand-50/40 border-x border-brand-200/60">
                    Instant (Zero Drive Conflicts)
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">Cloud Sync</td>
                  <td className="py-3.5 px-4 text-slate-500">Manual Google Drive sync</td>
                  <td className="py-3.5 px-4 text-slate-600">Cloud Sync</td>
                  <td className="py-3.5 px-4 text-slate-600">Cloud Sync</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Thermal POS 2" &amp; 3" Printing</td>
                  <td className="py-3.5 px-4 sm:px-6 text-brand-700 font-bold bg-brand-50/40 border-x border-brand-200/60">
                    Included Standard
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">Dynamic UPI Payment QR</td>
                  <td className="py-3.5 px-4 sm:px-6 text-brand-700 font-bold bg-brand-50/40 border-x border-brand-200/60">
                    Direct on Invoices &amp; Receipts
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                  <td className="py-3.5 px-4 text-slate-600">Supported</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4 Core Pillars Section (Special layout for 5-Way Comparison) */}
      {isMultiComparison && (
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-t border-slate-200">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              The JustGST Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Why Indian Businesses Choose JustGST Over Bloated Software
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl mx-auto">
              Built on four core pillars designed to save you money, eliminate friction, and keep billing fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-black text-lg mb-4">
                ₹49
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Price Disruptor (₹49/mo)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Why pay ₹2,500 to ₹5,000 every year just to generate invoices? JustGST offers transparent pricing starting at ₹588/year (₹49/mo) with zero commissions.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg mb-4">
                ⚡
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Zero-Bloat Simplicity</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                No 200-field forms, no complicated ledger matrices. Complete counter billing in under 3 seconds with fast keyboard shortcuts.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg mb-4">
                ☁️
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">100% True Cloud Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log in from any device anywhere in the world. No desktop installers, no file-corruption risks, and instant automatic real-time synchronization.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-brand-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg mb-4">
                📱
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Any Screen, Anywhere</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use our responsive web software on phones, tablets, MacBooks, and Windows PCs with identical speed and auto-sync.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Comparison Feature Table (Special layout for vs Vyapar) */}
      {isVyaparComparison && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Direct Feature Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              JustGST vs. Vyapar Feature Matrix
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              An objective, factual side-by-side comparison for Indian small business owners.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Feature / Capability</th>
                  <th className="py-4 px-6 text-brand-700 bg-brand-50/70 border-x border-brand-200/60 font-black">
                    JustGST Cloud (₹49/mo)
                  </th>
                  <th className="py-4 px-6 text-slate-600">Vyapar App (₹2,399+/yr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">Platform Accessibility</td>
                  <td className="py-3.5 px-6 text-brand-700 font-bold bg-brand-50/30 border-x border-brand-200/60">
                    Any Web Browser + PWA (Mac, Windows, iOS, Android)
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">Desktop Windows App &amp; Android Phone</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">Local Software Installation</td>
                  <td className="py-3.5 px-6 text-brand-700 font-bold bg-brand-50/30 border-x border-brand-200/60">
                    Zero Install Required (Instant URL Access)
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">Required on Desktop PC</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">Real-Time Multi-Device Sync</td>
                  <td className="py-3.5 px-6 text-brand-700 font-bold bg-brand-50/30 border-x border-brand-200/60">
                    Instant Cloud Synchronization (Zero Conflicts)
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">Requires manual background sync/drive linking</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">Thermal POS &amp; 2"/3" Printing</td>
                  <td className="py-3.5 px-6 text-brand-700 font-bold bg-brand-50/30 border-x border-brand-200/60">
                    Built-in Standard Support
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">Supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">UPI Dynamic Payment QR Codes</td>
                  <td className="py-3.5 px-6 text-brand-700 font-bold bg-brand-50/30 border-x border-brand-200/60">
                    Included on all Invoices &amp; Receipts
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">Supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-slate-900">User Interface Speed &amp; Simplicity</td>
                  <td className="py-3.5 px-6 text-brand-700 font-bold bg-brand-50/30 border-x border-brand-200/60">
                    Fast, lightweight, sub-second loads
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">Dense accounting interface</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pricing Comparison Grid (Special layout for /pricing/) */}
      {isPricing && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Straightforward Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Transparent Plans. No Hidden Commissions.
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Start with a 14-day free trial. Upgrade only when you are satisfied.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Starter</span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-black text-slate-900">₹49</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>
                <p className="text-xs text-slate-600 mb-6">
                  Ideal for small retail counters and freelancers starting their GST billing.
                </p>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full GST Invoicing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Inventory &amp; Stock Control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Thermal 2" &amp; 3" Printing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dynamic UPI QR Codes
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenSignup}
                className="mt-8 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Pro Annual (Popular) */}
            <div className="bg-white border-2 border-brand-600 rounded-2xl p-6 flex flex-col justify-between relative shadow-lg shadow-brand-600/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold text-brand-700 uppercase">Pro Annual</span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-black text-slate-900">₹588</span>
                  <span className="text-xs text-slate-500"> / year (₹49/mo)</span>
                </div>
                <p className="text-xs text-slate-600 mb-6">
                  Complete billing, wholesale ledgers, and unlimited stock control for growing businesses.
                </p>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> Unlimited GST Tax Invoices
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> Real-time Stock &amp; Low Alerts
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> Party Khata &amp; WhatsApp Reminders
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> Excel Import &amp; JSON GSTR Exports
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> Priority Cloud Synchronization
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenSignup}
                className="mt-8 w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-brand-600/20 active:scale-98 cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise / Multi-Store */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Multi-Branch</span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-black text-slate-900">₹1,499</span>
                  <span className="text-xs text-slate-500"> / year</span>
                </div>
                <p className="text-xs text-slate-600 mb-6">
                  Designed for multi-branch wholesalers, distributors, and high-volume operations.
                </p>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Everything in Pro Annual
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-Company &amp; Multi-Branch
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Advanced GSTR Tax Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated Fast Support
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenSignup}
                className="mt-8 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Core Features Breakdown */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            Engineered for Accuracy, Speed &amp; Compliance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(seo.features || []).map((feat, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-slate-300 p-6 rounded-2xl transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4 font-bold border border-brand-200">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section (AEO and Rich Snippet Validated) */}
      <section className="py-16 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Have Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {(seo.faqs || []).map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl bg-slate-50/60 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold text-slate-800 hover:text-slate-950 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-14 bg-gradient-to-b from-slate-900 to-slate-950 text-center px-4 text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ready to upgrade your GST billing experience?
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            Join hundreds of Indian businesses who save hours each week with JustGST for ₹49/month.
          </p>
          <button
            type="button"
            onClick={onOpenSignup}
            className="px-8 py-3.5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-sm rounded-xl inline-flex items-center gap-2 shadow-xl shadow-brand-500/20 active:scale-98 cursor-pointer transition-all"
          >
            <span>Start Your 14-Day Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </PublicLayout>
  );
};
