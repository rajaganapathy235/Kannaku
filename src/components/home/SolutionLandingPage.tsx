import React, { useState } from 'react';
import {
  FileText,
  Boxes,
  Store,
  Building2,
  Scale,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  HelpCircle,
  QrCode,
  Printer,
  TrendingUp,
  Sparkles,
  ChevronDown,
  X,
  CreditCard,
  Layers,
  Clock,
  Lock,
} from 'lucide-react';
import { SEORouteConfig, SEO_ROUTES } from '../../config/seo.config';
import { SEOHead } from '../common/SEOHead';
import { LegalModal } from './LegalModal';

interface SolutionLandingPageProps {
  seo: SEORouteConfig;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onNavigateSlug: (slug: string) => void;
}

export const SolutionLandingPage: React.FC<SolutionLandingPageProps> = ({
  seo,
  onOpenLogin,
  onOpenSignup,
  onNavigateSlug,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'refund' | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const isMultiComparison = seo.slug.includes('gogst') || seo.slug.includes('swipe') || seo.slug.includes('mybillbook');
  const isVyaparComparison = (seo.slug.includes('compare') || seo.slug.includes('vyapar')) && !isMultiComparison;
  const isPricing = seo.slug === 'pricing';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white flex flex-col font-sans">
      <SEOHead seo={seo} />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigateSlug('')}
            className="flex items-center gap-3 cursor-pointer text-left group"
          >
            <img src="/logo-horizontal-light.svg" alt="JustGST Logo" className="h-8 w-auto" />
          </button>

          {/* Solution Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
            <button
              type="button"
              onClick={() => onNavigateSlug('gst-billing-software')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                seo.slug === 'gst-billing-software' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              GST Invoicing
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('inventory-management-software')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                seo.slug === 'inventory-management-software' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Inventory
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-retail')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                seo.slug === 'billing-software-for-retail' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Retail POS
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-wholesale')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                seo.slug === 'billing-software-for-wholesale' ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Wholesale B2B
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                isMultiComparison ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              5-Way Compare
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('pricing')}
              className={`hover:text-emerald-400 transition-colors cursor-pointer ${
                isPricing ? 'text-emerald-400 font-bold' : ''
              }`}
            >
              Pricing (₹49/mo)
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onOpenSignup}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm hover:shadow-emerald-500/20 active:scale-98 cursor-pointer"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="bg-slate-900/50 border-b border-slate-800/60 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-[11px] text-slate-400">
          {seo.breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.url}>
              {idx > 0 && <span className="text-slate-600">/</span>}
              {idx === seo.breadcrumbs.length - 1 ? (
                <span className="text-emerald-400 font-medium">{crumb.name}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigateSlug(crumb.url.replace('https://justgst.in/', '').replace(/\/$/, ''))}
                  className="hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {crumb.name}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Hero Section with High-Intent H1 & AEO Direct Answer */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{seo.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-5">
            {seo.h1}
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed mb-8">
            {seo.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenSignup}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-98"
            >
              <span>Get Started Free (No Credit Card)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl border border-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              Live Demo & Sign In
            </button>
          </div>

          {/* Quick Trust Highlights */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Free Trial Included
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% GST Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Installation Required
            </span>
          </div>
        </div>
      </section>

      {/* AEO Key Knowledge Block (Answer Engine Optimization for AI Citations) */}
      {seo.aeoAnswers && seo.aeoAnswers.length > 0 && (
        <section className="bg-slate-900/40 border-y border-slate-800/80 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
                Quick Facts & Definitions
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Direct Answers & Key Overview
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {seo.aeoAnswers.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                      {item.question}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
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
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
              India Billing Software Face-Off
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              JustGST vs GoGST vs Vyapar vs Swipe vs myBillBook
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-3xl mx-auto">
              An objective, side-by-side comparison across pricing, cloud architecture, usability, hardware compatibility, and deployment speed.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-2xl">
            <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-4 sm:px-6 w-1/4">Feature / Metric</th>
                  <th className="py-4 px-4 sm:px-6 text-emerald-400 bg-emerald-950/30 border-x border-emerald-900/50 w-1/5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>JustGST</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-normal lowercase block mt-0.5">₹49/mo (₹588/yr)</span>
                  </th>
                  <th className="py-4 px-4 text-slate-300">GoGST</th>
                  <th className="py-4 px-4 text-slate-300">Vyapar</th>
                  <th className="py-4 px-4 text-slate-300">Swipe</th>
                  <th className="py-4 px-4 text-slate-300">myBillBook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Starting Price</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    ₹49/mo <span className="text-[10px] text-slate-400 font-normal">(₹588/yr)</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">₹1,499+/yr</td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">₹2,399–₹3,999/yr</td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">₹1,299–₹2,499/yr</td>
                  <td className="py-3.5 px-4 text-slate-300 font-medium">₹1,899–₹4,599/yr</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Deployment Model</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    100% Web Cloud + PWA
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">Web / Cloud</td>
                  <td className="py-3.5 px-4 text-slate-400">Desktop Windows App + Android</td>
                  <td className="py-3.5 px-4 text-slate-300">Web + Mobile App</td>
                  <td className="py-3.5 px-4 text-slate-300">Desktop Windows + Android</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Software Installation</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    Zero Install (Instant Browser Login)
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">No install required</td>
                  <td className="py-3.5 px-4 text-slate-400">Required on PC</td>
                  <td className="py-3.5 px-4 text-slate-300">Optional app install</td>
                  <td className="py-3.5 px-4 text-slate-400">Required for desktop</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Mac & iPad Compatibility</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    Native Full Support
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                  <td className="py-3.5 px-4 text-rose-400">No native Mac app</td>
                  <td className="py-3.5 px-4 text-slate-300">Supported via browser</td>
                  <td className="py-3.5 px-4 text-slate-400">Limited browser mode</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Learning Curve & Complexity</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    Under 3 minutes (Zero Bloat)
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">Moderate</td>
                  <td className="py-3.5 px-4 text-slate-400">High (Dense menus)</td>
                  <td className="py-3.5 px-4 text-slate-300">Moderate</td>
                  <td className="py-3.5 px-4 text-slate-400">Moderate to High</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Multi-Device Real-Time Sync</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    Instant (Zero Drive Conflicts)
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">Cloud Sync</td>
                  <td className="py-3.5 px-4 text-slate-400">Manual Google Drive sync</td>
                  <td className="py-3.5 px-4 text-slate-300">Cloud Sync</td>
                  <td className="py-3.5 px-4 text-slate-300">Cloud Sync</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Thermal POS 2" & 3" Printing</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    Included Standard
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Dynamic UPI Payment QR</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    Direct on Invoices & Receipts
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                  <td className="py-3.5 px-4 text-slate-300">Supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">Native Apps Roadmap</td>
                  <td className="py-3.5 px-4 sm:px-6 text-emerald-400 font-bold bg-emerald-950/15 border-x border-emerald-900/30">
                    Android, iOS, Win, Mac In Progress
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">Web only</td>
                  <td className="py-3.5 px-4 text-slate-300">Win + Android only</td>
                  <td className="py-3.5 px-4 text-slate-300">Android + iOS</td>
                  <td className="py-3.5 px-4 text-slate-300">Win + Android</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4 Core Pillars Section (Special layout for 5-Way Comparison) */}
      {isMultiComparison && (
        <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
              The JustGST Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Why Indian Businesses Choose JustGST Over Bloated Software
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
              Built on four core pillars designed to save you money, eliminate friction, and keep billing fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/70 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
                ₹49
              </div>
              <h3 className="text-base font-bold text-white mb-2">Price Disruptor (₹49/mo)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Why pay ₹2,500 to ₹5,000 every year just to generate invoices? JustGST offers transparent pricing starting at ₹588/year (₹49/mo) with zero commissions.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-lg mb-4">
                ⚡
              </div>
              <h3 className="text-base font-bold text-white mb-2">Zero-Bloat Minimalism</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No 200-field forms, no complicated ledger matrices. Complete counter billing in under 3 seconds with fast keyboard shortcuts.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-lg mb-4">
                ☁️
              </div>
              <h3 className="text-base font-bold text-white mb-2">100% True Cloud Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in from any device anywhere in the world. No desktop installers, no file-corruption risks, and instant automatic real-time synchronization.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-black text-lg mb-4">
                📱
              </div>
              <h3 className="text-base font-bold text-white mb-2">Native Apps Roadmap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use our responsive Progressive Web App (PWA) today, with dedicated native apps for Android, iOS, Windows, and macOS rolling out soon.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Comparison Feature Table (Special layout for vs Vyapar) */}
      {isVyaparComparison && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
              Direct Feature Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              JustGST vs. Vyapar Feature Matrix
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              An objective, factual side-by-side comparison for Indian small business owners.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Feature / Capability</th>
                  <th className="py-4 px-6 text-emerald-400 bg-emerald-950/20 border-x border-emerald-900/40">
                    JustGST Cloud
                  </th>
                  <th className="py-4 px-6 text-slate-400">Vyapar App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-white">Platform Accessibility</td>
                  <td className="py-3.5 px-6 text-emerald-400 font-bold bg-emerald-950/10 border-x border-emerald-900/30">
                    Any Web Browser + PWA (Mac, Windows, iOS, Android)
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">Desktop Windows App & Android Phone</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-white">Local Software Installation</td>
                  <td className="py-3.5 px-6 text-emerald-400 font-bold bg-emerald-950/10 border-x border-emerald-900/30">
                    Zero Install Required (Instant URL Access)
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">Required on Desktop PC</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-white">Real-Time Multi-Device Sync</td>
                  <td className="py-3.5 px-6 text-emerald-400 font-bold bg-emerald-950/10 border-x border-emerald-900/30">
                    Instant Cloud Synchronization (Zero Conflicts)
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">Requires manual background sync/drive linking</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-white">Thermal POS & 2"/3" Printing</td>
                  <td className="py-3.5 px-6 text-emerald-400 font-bold bg-emerald-950/10 border-x border-emerald-900/30">
                    Built-in Standard Support
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">Supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-white">UPI Dynamic Payment QR Codes</td>
                  <td className="py-3.5 px-6 text-emerald-400 font-bold bg-emerald-950/10 border-x border-emerald-900/30">
                    Included on all Invoices & Receipts
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">Supported</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-semibold text-white">User Interface Speed & Simplicity</td>
                  <td className="py-3.5 px-6 text-emerald-400 font-bold bg-emerald-950/10 border-x border-emerald-900/30">
                    Fast, lightweight, sub-second loads
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">Dense accounting interface</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Pricing Comparison Grid (Special layout for /pricing/) */}
      {isPricing && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
              Straightforward Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Transparent Plans. No Hidden Commissions.
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Start with a free trial. Upgrade only when you are satisfied.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Starter</span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-black text-white">₹199</span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Ideal for small retail counters and freelancers starting their GST billing.
                </p>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 100 GST Invoices/mo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic Inventory Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Thermal 2" & 3" Printing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dynamic UPI QR Codes
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenSignup}
                className="mt-8 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Choose Starter
              </button>
            </div>

            {/* Pro All-in-One (Popular) */}
            <div className="bg-gradient-to-b from-slate-900 to-emerald-950/40 border-2 border-emerald-500 rounded-2xl p-6 flex flex-col justify-between relative shadow-2xl shadow-emerald-950/50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase">Pro All-In-One</span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-black text-white">₹1,499</span>
                  <span className="text-xs text-slate-400"> / year (Save 40%)</span>
                </div>
                <p className="text-xs text-slate-300 mb-6">
                  Complete billing, wholesale ledgers, and unlimited stock control for growing businesses.
                </p>
                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited GST Invoices
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Stock & Low-Stock Alerts
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Client Khata & WhatsApp Reminders
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Excel Import & Export
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority Support & Cloud Sync
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenSignup}
                className="mt-8 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer"
              >
                Start 15-Day Free Trial
              </button>
            </div>

            {/* Enterprise / Multi-Store */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Enterprise</span>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-black text-white">₹3,999</span>
                  <span className="text-xs text-slate-400"> / year</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Designed for multi-branch wholesalers, distributors, and high-volume operations.
                </p>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Everything in Pro
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Multi-Company & Multi-Branch
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Advanced GSTR Tax Reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated Account Manager
                  </li>
                </ul>
              </div>
              <button
                type="button"
                onClick={onOpenSignup}
                className="mt-8 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Core Features Breakdown */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Engineered for Accuracy, Speed & Compliance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {seo.features.map((feat, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 font-bold">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section (AEO and Rich Snippet Validated) */}
      <section className="py-16 bg-slate-900/30 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest">
              Have Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {seo.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-800 rounded-2xl bg-slate-950/70 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold text-slate-200 hover:text-white cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cross-Link Hub (Internal Linking for SEO Authority) */}
      <section className="py-12 bg-slate-950 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Explore All JustGST Solutions
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            <button
              type="button"
              onClick={() => onNavigateSlug('')}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                <span>JustGST Home</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Cloud Billing</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('gst-billing-software')}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                <span>GST Invoicing</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">HSN & Tax Rules</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('inventory-management-software')}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                <span>Inventory</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Stock & Barcode</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-retail')}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                <span>Retail POS</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Thermal Receipt</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('billing-software-for-wholesale')}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                <span>Wholesale B2B</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">Party Ledgers</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook')}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-emerald-300 group-hover:text-emerald-400 flex items-center justify-between">
                <span>5-Way Compare</span>
                <ChevronRight className="w-3 h-3 text-emerald-400" />
              </div>
              <p className="text-[10px] text-emerald-400/80 mt-1 line-clamp-1">vs Vyapar/Swipe/etc</p>
            </button>
            <button
              type="button"
              onClick={() => onNavigateSlug('pricing')}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl text-left transition-colors cursor-pointer group"
            >
              <div className="text-[11px] font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                <span>Plans & Pricing</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">₹49/mo Free Trial</p>
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Conversion Banner */}
      <section className="py-14 bg-gradient-to-r from-emerald-900/60 via-slate-900 to-emerald-950/60 border-t border-slate-800 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ready to upgrade your GST billing experience?
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            Join hundreds of Indian businesses who save hours each week with JustGST.
          </p>
          <button
            type="button"
            onClick={onOpenSignup}
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl inline-flex items-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-98 cursor-pointer transition-all"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-horizontal-light.svg" alt="JustGST Logo" className="h-6 w-auto opacity-70" />
            <span>© {new Date().getFullYear()} JustGST. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setLegalModalType('privacy')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalModalType('terms')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setLegalModalType('refund')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      {legalModalType && (
        <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      )}
    </div>
  );
};
