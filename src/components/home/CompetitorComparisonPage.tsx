import React, { useState, useEffect, useMemo } from 'react';
import {
  Check,
  X,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Calculator,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Lock,
  Smartphone,
  Laptop,
  Database,
  RefreshCw,
  Clock,
  TrendingDown,
  Building2,
  Users,
  FileSpreadsheet,
  QrCode,
  Layers,
} from 'lucide-react';
import { PublicLayout } from '../layout/PublicLayout';
import { BASE_URL, SEORouteConfig, getSEOConfigForPath } from '../../config/seo.config';

export interface CompetitorDetails {
  id: 'vyapar' | 'mybillbook' | 'tally' | string;
  name: string;
  shortName: string;
  tagline: string;
  yearlyPrice: number;
  yearlyPriceDisplay: string;
  monthlyEquivalent: string;
  savingsYearly: number;
  savingsYearlyDisplay: string;
  softwareType: string;
  platformLimitations: string;
  hiddenCostsDescription: string;
  migrationNotes: string;
  drawbacks: string[];
}

export const COMPETITORS_DATA: Record<string, CompetitorDetails> = {
  vyapar: {
    id: 'vyapar',
    name: 'Vyapar',
    shortName: 'Vyapar App',
    tagline: 'Desktop-first billing with expensive yearly renewal licenses and sync add-ons',
    yearlyPrice: 2399,
    yearlyPriceDisplay: '₹2,399+',
    monthlyEquivalent: '₹200+/mo',
    savingsYearly: 1811,
    savingsYearlyDisplay: '₹1,811+',
    softwareType: 'Offline Desktop & Android App',
    platformLimitations: 'Requires Windows PC installation; syncing to phone requires separate premium add-ons.',
    hiddenCostsDescription: 'Desktop multi-device license costs extra (up to ₹3,999/yr), plus renewal fees every year.',
    migrationNotes: 'Export your Vyapar items and parties to Excel/CSV in 1 click, then upload directly to JustGST.',
    drawbacks: [
      'Heavy Windows setup and slow offline file backups',
      'Multi-device sync requires expensive tier upgrades',
      'Cluttered interface with features most small shops never use',
      'High recurring annual costs of ₹2,399 to ₹3,999',
    ],
  },
  mybillbook: {
    id: 'mybillbook',
    name: 'myBillBook',
    shortName: 'myBillBook',
    tagline: 'Mobile-first billing app that locks essential desktop & multi-user features behind steep tiers',
    yearlyPrice: 1899,
    yearlyPriceDisplay: '₹1,899+',
    monthlyEquivalent: '₹158+/mo',
    savingsYearly: 1311,
    savingsYearlyDisplay: '₹1,311+',
    softwareType: 'Mobile App with Paid Desktop Add-on',
    platformLimitations: 'Desktop browser access and staff accounts locked to higher enterprise plans.',
    hiddenCostsDescription: 'Desktop access requires Silver/Gold plans (₹1,899 - ₹4,599/yr). Additional users cost extra.',
    migrationNotes: 'Download your party ledger and inventory Excel sheets from myBillBook and import into JustGST in under 60 seconds.',
    drawbacks: [
      'Desktop access locked behind expensive Silver and Gold tiers',
      'Heavy upselling and constant feature paywalls',
      'Limited invoice customization on base plans',
      'Steep price jumps every renewal cycle',
    ],
  },
  tally: {
    id: 'tally',
    name: 'Tally Prime',
    shortName: 'Tally ERP / Prime',
    tagline: 'Complex legacy accounting software built for CAs, requiring specialized staff and costly hardware',
    yearlyPrice: 18000,
    yearlyPriceDisplay: '₹18,000+',
    monthlyEquivalent: '₹1,500+/mo',
    savingsYearly: 17412,
    savingsYearlyDisplay: '₹17,412+',
    softwareType: 'Heavy Offline Desktop Accounting Suite',
    platformLimitations: 'Windows desktop only. No native mobile phone access without costly TSS and remote desktop servers.',
    hiddenCostsDescription: 'Single user license costs ₹18,000+ + 18% GST, plus annual TSS renewal fees of ₹3,600+/yr and CA operator salaries.',
    migrationNotes: 'Export your Tally ledger master and stock items into Excel/XML, and quickly import them into JustGST.',
    drawbacks: [
      'Steep learning curve requiring trained accounting staff',
      'Expensive upfront license (₹18,000+) plus mandatory yearly TSS renewals',
      'No native cloud access; cannot generate quick phone invoices on the go',
      'Over-engineered for 90% of retail shops, distributors, and MSMEs',
    ],
  },
};

interface CompetitorComparisonPageProps {
  competitorId?: 'vyapar' | 'mybillbook' | 'tally' | string;
  onOpenLogin?: () => void;
  onOpenSignup?: () => void;
  onNavigateSlug?: (slug: string) => void;
  onOpenSuperAdmin?: () => void;
}

export const CompetitorComparisonPage: React.FC<CompetitorComparisonPageProps> = ({
  competitorId = 'vyapar',
  onOpenLogin,
  onOpenSignup,
  onNavigateSlug,
  onOpenSuperAdmin,
}) => {
  const compKey = competitorId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const competitor = useMemo<CompetitorDetails>(() => {
    if (compKey.includes('tally')) return COMPETITORS_DATA.tally;
    if (compKey.includes('mybillbook') || compKey.includes('billbook')) return COMPETITORS_DATA.mybillbook;
    return COMPETITORS_DATA.vyapar;
  }, [compKey]);

  // Savings Calculator State
  const [calcYears, setCalcYears] = useState<number>(3);
  const [calcDevices, setCalcDevices] = useState<number>(2);

  // FAQ open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Floating CTA visibility on scroll
  const [showFloatingBar, setShowFloatingBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 420) {
        setShowFloatingBar(true);
      } else {
        setShowFloatingBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate dynamic savings
  const competitorTotalPerYear = competitor.yearlyPrice + (calcDevices > 1 ? (calcDevices - 1) * 800 : 0);
  const justGstTotalPerYear = 588; // Flat ₹49/mo (₹588/yr) with unlimited devices
  const yearlySavings = competitorTotalPerYear - justGstTotalPerYear;
  const multiYearSavings = yearlySavings * calcYears;

  const handleScrollToCalculator = () => {
    const el = document.getElementById('savings-calculator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const comparisonRows = [
    {
      feature: 'Monthly Subscription Price',
      justgst: '₹49 / month (₹588/yr)',
      competitor: competitor.monthlyEquivalent,
      highlight: true,
      subtext: 'Transparent, flat pricing with zero hidden fees',
    },
    {
      feature: 'Cloud Sync & Auto-Backup',
      justgst: '100% Real-Time Cloud (Included)',
      competitor: 'Extra fee / Desktop-locked',
      highlight: true,
      subtext: 'Never lose invoices to hard drive crashes',
    },
    {
      feature: 'WhatsApp Invoice Dispatch',
      justgst: 'Direct 1-Click with UPI QR',
      competitor: 'Manual PDF export / Paid add-on',
      highlight: false,
      subtext: 'Customers can pay instantly via PhonePe/GPay QR',
    },
    {
      feature: 'Instant GSTIN Auto-Lookup',
      justgst: 'Instant Auto-fill Name & Address',
      competitor: 'Manual typing / Paid API',
      highlight: true,
      subtext: 'Type 15-digit GSTIN and autofill legal trade details',
    },
    {
      feature: 'Unlimited Invoices & Customers',
      justgst: '100% Unlimited on all plans',
      competitor: 'Tiered limits / Paywalled counts',
      highlight: false,
      subtext: 'No caps on monthly bill counts or clients',
    },
    {
      feature: 'Multi-Device (Phone, Tablet, Laptop)',
      justgst: 'Included free (Any web browser)',
      competitor: 'Add-on license charges per device',
      highlight: true,
      subtext: 'Log in from Chrome, Safari, iPad, or Android phone',
    },
    {
      feature: 'Setup & Onboarding Time',
      justgst: '30 Seconds (Zero installation)',
      competitor: 'Complex installation & drivers',
      highlight: false,
      subtext: 'Start billing in under 1 minute from sign-up',
    },
    {
      feature: 'Thermal POS Printing (2" & 3")',
      justgst: 'Native 1-Click Receipt Layouts',
      competitor: 'Manual margins configuration',
      highlight: false,
      subtext: 'Works seamlessly with USB & Bluetooth thermal printers',
    },
    {
      feature: 'GSTR-1 Excel Tax Filing Report',
      justgst: 'Instant 1-Click Tax Summary',
      competitor: 'Complex export steps',
      highlight: false,
      subtext: 'Ready format to send directly to your Chartered Accountant',
    },
  ];

  const faqs = [
    {
      q: 'Why is JustGST priced at only ₹49/month?',
      a: 'We built JustGST on modern, ultra-efficient serverless cloud architecture with zero legacy bloat. We pass these server savings directly to Indian shop owners, MSMEs, and freelancers, proving that world-class GST billing does not need to cost thousands of rupees each year.',
    },
    {
      q: `Can I switch my existing business data from ${competitor.name} to JustGST?`,
      a: `Yes! You can export your customer list, supplier records, and inventory items from ${competitor.name} into an Excel (.xlsx) or CSV file, and directly upload it into JustGST in less than 2 minutes. Our support team is also available on WhatsApp to assist with free onboarding.`,
    },
    {
      q: 'Does JustGST work on both mobile phones and laptops?',
      a: 'Absolutely. JustGST is 100% cloud-native and responsive. You can generate bills on your counter laptop via Chrome or Edge, and simultaneously check sales reports, create quotes, or share invoices from your Android phone or iPhone.',
    },
    {
      q: 'Is there any hidden fee, per-invoice charge, or setup cost?',
      a: 'No. JustGST has zero hidden costs. There are no per-invoice commissions, no thermal printer driver fees, and no extra charges for multi-device sync. You get 100% full feature access during your 14-day free trial, followed by transparent ₹49/month billing.',
    },
    {
      q: 'Is my business and financial data safe and backed up?',
      a: 'Yes. All data is encrypted with 256-bit SSL in secure enterprise cloud data centers. Unlike desktop software that can be lost if your PC crashes or gets infected with malware, JustGST automatically backs up your invoices continuously.',
    },
  ];

  // Dynamic JSON-LD structured data schema
  const jsonLdPayload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Compare',
            item: `${BASE_URL}/compare/justgst-vs-vyapar/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `JustGST vs ${competitor.name}`,
            item: `${BASE_URL}/compare/justgst-vs-${competitor.id}/`,
          },
        ],
      },
      {
        '@type': 'Product',
        name: 'JustGST Cloud Billing Software',
        image: `${BASE_URL}/icon-512.png`,
        description: `Compare JustGST vs ${competitor.name}. 100% cloud GST billing, WhatsApp sharing, and inventory at only ₹49/month.`,
        brand: {
          '@type': 'Brand',
          name: 'JustGST',
        },
        offers: {
          '@type': 'Offer',
          url: `${BASE_URL}/compare/justgst-vs-${competitor.id}/`,
          priceCurrency: 'INR',
          price: '49',
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '1840',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      },
    ],
  };

  const breadcrumbs = [
    { label: 'Home', path: '' },
    { label: 'Compare', path: 'compare/justgst-vs-vyapar' },
    { label: `JustGST vs ${competitor.name}`, path: `compare/justgst-vs-${competitor.id}` },
  ];

  const seoConfig = useMemo<SEORouteConfig>(() => {
    const matched = getSEOConfigForPath(`compare/justgst-vs-${competitor.id}`);
    if (matched && matched.slug) return matched;
    return {
      slug: `compare/justgst-vs-${competitor.id}`,
      title: `JustGST vs ${competitor.name}: Cloud GST Billing Comparison (2026)`,
      metaTitle: `JustGST vs ${competitor.name} (2026): Why Small Businesses are Switching to ₹49/mo Cloud Billing`,
      description: `Compare JustGST and ${competitor.name}. Save ₹1,800+ every year with 100% cloud billing, instant WhatsApp invoices, dynamic UPI QR codes, and zero install delays for only ₹49/month.`,
      canonical: `${BASE_URL}/compare/justgst-vs-${competitor.id}/`,
      h1: `JustGST vs ${competitor.name}: Why Small Businesses are Switching in 2026`,
      subtitle: `Why pay ₹2,000+ per year for offline software? Get full cloud billing, instant WhatsApp invoices, auto-GSTIN lookup, and e-invoicing for just ₹49/month.`,
      badge: '100% Cloud Billing • Instant 14-Day Free Trial',
      keywords: [`JustGST vs ${competitor.name}`, `${competitor.name} alternative`, 'best billing software India'],
      breadcrumbs: [
        { name: 'Home', url: `${BASE_URL}/` },
        { name: 'Compare', url: `${BASE_URL}/compare/justgst-vs-vyapar/` },
        { name: `JustGST vs ${competitor.name}`, url: `${BASE_URL}/compare/justgst-vs-${competitor.id}/` },
      ],
      aeoAnswers: [
        {
          question: `Why choose JustGST over ${competitor.name}?`,
          answer: `JustGST offers 100% cloud-native GST billing across all devices for ₹49/month compared to expensive legacy software licenses.`,
        },
      ],
      features: [
        {
          title: 'True Cloud Architecture',
          description: 'No local installation or manual database backup needed.',
        },
      ],
      faqs: faqs.map((f) => ({ question: f.q, answer: f.a })),
    };
  }, [competitor, faqs]);

  return (
    <PublicLayout
      seo={seoConfig}
      breadcrumbs={breadcrumbs}
      onOpenLogin={onOpenLogin}
      onOpenSignup={onOpenSignup}
      onNavigateSlug={onNavigateSlug}
      onOpenSuperAdmin={onOpenSuperAdmin}
    >
      {/* Dynamic JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPayload) }}
      />

      <div className="bg-slate-950 text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-slate-950">
        {/* =========================================================================
            1. HERO SECTION
           ========================================================================= */}
        <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 sm:w-[540px] h-96 sm:h-[480px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="text-center space-y-6 max-w-3xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Cloud Billing • Instant 14-Day Free Trial</span>
            </div>

            {/* H1 Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              JustGST vs <span className="text-emerald-400 underline decoration-emerald-500/50 decoration-wavy underline-offset-8">{competitor.name}</span>: Why Small Businesses are Switching in 2026
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Why pay {competitor.yearlyPriceDisplay} per year for offline software? Get full cloud billing, instant WhatsApp invoices, auto-GSTIN lookup, and thermal POS receipts for just{' '}
              <span className="text-emerald-400 font-bold">₹49/month</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={onOpenSignup}
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Free Trial (₹49/mo after)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleScrollToCalculator}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-xl text-sm border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Calculate Your Savings</span>
              </button>
            </div>

            {/* Micro Trust badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>30-Sec Instant Setup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>100% Cloud-Backed Data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. PRICE SAVINGS CALLOUT BANNER & CALCULATOR
           ========================================================================= */}
        <section id="savings-calculator" className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Ambient emerald corner highlight */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-12">
              {/* Left Column: Visual Contrast */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Price Transparency Breakdown
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Save {competitor.savingsYearlyDisplay} Every Single Year with JustGST
                  </h2>
                  <p className="text-sm text-slate-400 mt-2">
                    Stop paying legacy software markups. Get equal or superior cloud GST invoicing for a fraction of the cost.
                  </p>
                </div>

                {/* Price Cards Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* JustGST Card */}
                  <div className="bg-slate-950 border-2 border-emerald-500 rounded-2xl p-5 relative shadow-lg shadow-emerald-500/10">
                    <div className="absolute -top-2.5 right-4 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-md">
                      Best Cloud Value
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-bold text-white">JustGST Pro</span>
                    </div>
                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">₹588</span>
                      <span className="text-xs text-slate-400">/ year (₹49/mo)</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      100% full features, unlimited invoices, multi-device cloud sync, and thermal POS printing included.
                    </p>
                  </div>

                  {/* Competitor Card */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-300">{competitor.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-3xl sm:text-4xl font-black text-slate-300 font-mono line-through decoration-rose-500/80">
                        {competitor.yearlyPriceDisplay}
                      </span>
                      <span className="text-xs text-slate-500">/ year</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {competitor.hiddenCostsDescription}
                    </p>
                  </div>
                </div>

                {/* Switch CTA button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenSignup}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Switch to JustGST &amp; Claim 14-Day Free Trial</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Multi-Year / Multi-Device Calculator */}
              <div className="lg:w-96 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-emerald-400" />
                      Savings Estimator
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">Live Simulation</span>
                  </div>

                  {/* Years slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Business Horizon:</span>
                      <span className="text-white font-bold font-mono">{calcYears} {calcYears === 1 ? 'Year' : 'Years'}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={calcYears}
                      onChange={(e) => setCalcYears(Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>1 yr</span>
                      <span>2 yrs</span>
                      <span>3 yrs</span>
                      <span>4 yrs</span>
                      <span>5 yrs</span>
                    </div>
                  </div>

                  {/* Devices slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Billing Counters / Devices:</span>
                      <span className="text-white font-bold font-mono">{calcDevices} {calcDevices === 1 ? 'Device' : 'Devices'}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={1}
                      value={calcDevices}
                      onChange={(e) => setCalcDevices(Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>1 Counter</span>
                      <span>2 Counters</span>
                      <span>3 Counters</span>
                      <span>4+ Counters</span>
                    </div>
                  </div>
                </div>

                {/* Total savings output box */}
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 text-center space-y-1">
                  <span className="text-[11px] text-emerald-400/90 font-medium uppercase tracking-wider block">
                    Estimated Total Cash Saved
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                    ₹{multiYearSavings.toLocaleString('en-IN')}+
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    (₹{yearlySavings.toLocaleString('en-IN')}/yr saved over {calcYears} {calcYears === 1 ? 'year' : 'years'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. FEATURE-BY-FEATURE COMPARISON TABLE
           ========================================================================= */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Head-to-Head Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Feature-by-Feature Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              See why modern retailers and distributors choose JustGST over legacy {competitor.name} setups.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-slate-950/90 border-b border-slate-800 px-4 sm:px-6 py-4 text-xs font-bold uppercase tracking-wider">
              <div className="col-span-5 sm:col-span-4 text-slate-400">Core Feature</div>
              <div className="col-span-4 sm:col-span-4 text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>JustGST (₹49/mo)</span>
              </div>
              <div className="col-span-3 sm:col-span-4 text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{competitor.name}</span>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {comparisonRows.map((row, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 px-4 sm:px-6 py-4 items-center transition-colors hover:bg-slate-800/40 ${
                    row.highlight ? 'bg-emerald-500/[0.02]' : ''
                  }`}
                >
                  <div className="col-span-5 sm:col-span-4 pr-2">
                    <div className="font-semibold text-slate-200">{row.feature}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                      {row.subtext}
                    </div>
                  </div>

                  <div className="col-span-4 sm:col-span-4 pr-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{row.justgst}</span>
                    </div>
                  </div>

                  <div className="col-span-3 sm:col-span-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <X className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{row.competitor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. SEO KEYWORD COPY SECTION (Price-Positioning Content)
           ========================================================================= */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Architecture &amp; Economics
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cheap GST Billing Software for Small Shops &amp; MSMEs
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Why traditional desktop accounting tools are becoming obsolete in the era of high-speed UPI &amp; instant cloud micro-SaaS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: The ₹100 Alternative */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                The Best {competitor.name} Alternative Under ₹100
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Most Indian business owners only need fast 3-second GST invoicing, inventory stock tracking, and party khata ledgers. Paying ₹2,000+ to ₹18,000+ for over-bloated desktop tools drains small business cash flow. JustGST gives you 100% of what you need for just ₹49/month.
              </p>
            </div>

            {/* Card 2: 100% Cloud vs Offline Hard Drives */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Zero Data Loss &amp; Automatic Cloud Backups
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                With offline software like {competitor.name}, a hard drive crash, Windows update failure, or stolen shop computer can erase years of billing history. JustGST continuously saves your data in encrypted cloud servers with zero manual backup hassle.
              </p>
            </div>

            {/* Card 3: Multi-Device Agility */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                Instant Phone, Tablet &amp; PC Access
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Need to create a bill from your home laptop while your staff is using the shop counter? With JustGST, there are no expensive multi-user add-on licenses. Simply log in from any web browser on Mac, Windows, iPhone, or Android.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. TARGETED FAQ SECTION
           ========================================================================= */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Everything you need to know about switching from {competitor.name} to JustGST.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-200 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            BOTTOM BIG CALL TO ACTION BANNER
           ========================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-8 sm:p-12 text-slate-950 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-widest bg-slate-950/20 px-3 py-1 rounded-full text-slate-950">
                14-Day Risk-Free Trial
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Ready to Stop Overpaying for GST Invoicing?
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Join thousands of smart Indian shop owners, traders, and consultants who switched to JustGST for just ₹49/month.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenSignup}
                className="w-full sm:w-auto px-8 py-4 bg-slate-950 hover:bg-slate-900 active:scale-98 text-white font-black rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Your 14-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Existing User Log In
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. FLOATING BOTTOM CONVERSION BAR
           ========================================================================= */}
        {showFloatingBar && (
          <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md z-40 px-4 py-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="hidden sm:flex w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 items-center justify-center text-emerald-400 font-bold">
                  ₹49
                </div>
                <div>
                  <span className="font-bold text-white block sm:inline">
                    Switch to JustGST for ₹49/mo
                  </span>
                  <span className="text-slate-400 sm:ml-2 text-[11px]">
                    Save {competitor.savingsYearlyDisplay}/yr vs {competitor.name} • No Credit Card Required
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-3 py-2 text-slate-400 hover:text-white font-medium transition-colors hidden md:block cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={onOpenSignup}
                  className="w-full sm:w-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Start 14-Day Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};
