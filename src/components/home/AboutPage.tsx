import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Globe,
  IndianRupee,
  Layers,
  Lock,
  Mail,
  MapPin,
  Package,
  Printer,
  QrCode,
  Smartphone,
  Sparkles,
  Users,
  Zap,
  FileText,
  ShieldCheck,
  BarChart3,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import { SEOHead } from '../common/SEOHead';
import { GeoAeoEngine } from '../seo/GeoAeoEngine';
import { PublicLayout } from '../layout/PublicLayout';
import { AuthSession } from '../../types/auth';
import { BASE_URL, SEORouteConfig } from '../../config/seo.config';

interface AboutPageProps {
  seo: SEORouteConfig;
  session?: AuthSession | null;
  onNavigateSlug: (slug: string) => void;
  onStartTrial: () => void;
  onSignIn: () => void;
  onOpenSuperAdmin?: () => void;
}

const ABOUT_FAQS = [
  {
    question: 'What is JustGST?',
    answer:
      'JustGST is a 100% cloud-based GST billing and invoicing software built exclusively for Indian small and medium businesses. It allows shop owners, retailers, wholesalers, and service providers to generate GST-compliant tax invoices, manage inventory stock, maintain customer and supplier ledgers, and collect payments via UPI QR codes — all from any device without installing any software.',
  },
  {
    question: 'Who founded JustGST and when?',
    answer:
      'JustGST was founded in 2025 by a team of software engineers and GST consultants based in Tamil Nadu, India, with the mission of making affordable, compliant billing software accessible to every Indian small business owner.',
  },
  {
    question: 'How much does JustGST cost?',
    answer:
      'JustGST is priced at ₹49/month (₹588/year) on the annual plan, ₹79/month on the 6-month plan, and ₹99/month for flexible monthly billing. All plans include a 14-day fully featured free trial with no credit card required.',
  },
  {
    question: 'What makes JustGST different from Vyapar, myBillBook, or Tally?',
    answer:
      'JustGST is 100% cloud-native — it works in any web browser on phones, tablets, and laptops without any Windows software installation. Compared to Vyapar (₹2,399/year) and myBillBook (₹1,899/year), JustGST delivers full GST invoicing, inventory, and multi-device access at 75% lower cost. Unlike Tally Prime (₹18,000+ upfront), JustGST requires zero accounting expertise.',
  },
  {
    question: 'Is JustGST compliant with Indian GST laws?',
    answer:
      'Yes. JustGST adheres to current GST rules as notified by CBIC (Central Board of Indirect Taxes and Customs). It automatically computes intra-state (CGST + SGST) and inter-state (IGST) taxes, supports HSN/SAC code lookups, and generates GST-compliant tax invoices suitable for B2B and B2C filings.',
  },
  {
    question: 'What devices and platforms does JustGST support?',
    answer:
      'JustGST is a Progressive Web App (PWA) that runs in any modern browser on Windows, macOS, Linux, Android, and iOS. No software installation is required. It supports thermal POS printers (58mm / 80mm), A4/A5 invoice PDF printing, and 1-click WhatsApp invoice sharing.',
  },
];

const KEY_FACTS = [
  { label: 'Founded', value: '2025', icon: <CalendarDays className="w-5 h-5 text-brand-600" /> },
  { label: 'Headquarters', value: 'Tamil Nadu, India', icon: <MapPin className="w-5 h-5 text-brand-600" /> },
  { label: 'Starting Price', value: '₹49/month', icon: <IndianRupee className="w-5 h-5 text-brand-600" /> },
  { label: 'Free Trial', value: '14 days, no card', icon: <Zap className="w-5 h-5 text-brand-600" /> },
  { label: 'Platform', value: 'Cloud / PWA / Web', icon: <Globe className="w-5 h-5 text-brand-600" /> },
  { label: 'Compliance', value: 'GST India (CBIC)', icon: <ShieldCheck className="w-5 h-5 text-brand-600" /> },
];

const CORE_FEATURES = [
  {
    icon: <FileText className="w-5 h-5 text-brand-600" />,
    title: 'GST-Compliant Tax Invoices',
    desc: 'Auto-calculates CGST, SGST, and IGST based on place of supply, with HSN/SAC codes and GSTIN auto-lookup.',
  },
  {
    icon: <QrCode className="w-5 h-5 text-brand-600" />,
    title: 'WhatsApp + UPI QR Invoicing',
    desc: '1-click dispatch of PDF invoices via WhatsApp with dynamic UPI QR codes for PhonePe, Google Pay, and BHIM.',
  },
  {
    icon: <Printer className="w-5 h-5 text-brand-600" />,
    title: 'Thermal POS Receipt Printing',
    desc: 'Native 58mm (2-inch) and 80mm (3-inch) thermal printer support with shop logo and tax breakdown.',
  },
  {
    icon: <Package className="w-5 h-5 text-brand-600" />,
    title: 'Real-Time Inventory Management',
    desc: 'Track stock counts across items with batch numbers, MRP/selling prices, and automatic low-stock alerts.',
  },
  {
    icon: <Users className="w-5 h-5 text-brand-600" />,
    title: 'Customer & Supplier Ledgers',
    desc: 'Double-entry party ledgers (Khata) with outstanding balance tracking and automated WhatsApp payment reminders.',
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
    title: 'GSTR-1 & GSTR-3B Reports',
    desc: '1-click export of B2B, B2C Large, HSN summary, and credit note data in CA-ready Excel spreadsheets.',
  },
  {
    icon: <Smartphone className="w-5 h-5 text-brand-600" />,
    title: 'Multi-Device Cloud Sync',
    desc: 'Access invoices simultaneously on counter laptop and mobile phone with zero data conflicts.',
  },
  {
    icon: <Lock className="w-5 h-5 text-brand-600" />,
    title: 'Secure Cloud Backup',
    desc: "All data encrypted and stored on Cloudflare's global edge network with automatic backups.",
  },
];

const WHO_IS_IT_FOR = [
  'Retail shop owners and kirana stores',
  'Wholesale distributors and traders',
  'Pharmacies and medical shops',
  'Hardware and electronics retailers',
  'Apparel and footwear shops',
  'Auto parts and spare parts dealers',
  'Service providers and freelancers',
  'Restaurants and food businesses',
  'Supermarkets and FMCG distributors',
  'Indian MSMEs, SMBs, and sole proprietors',
];

export const AboutPage: React.FC<AboutPageProps> = ({
  seo,
  session,
  onNavigateSlug,
  onStartTrial,
  onSignIn,
  onOpenSuperAdmin,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ABOUT_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  // Person schema for founder / CEO
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'JustGST Founder',
    jobTitle: 'Founder & CEO',
    worksFor: {
      '@type': 'Organization',
      name: 'JustGST',
      url: BASE_URL,
    },
    url: BASE_URL,
  };

  return (
    <>
      <SEOHead seo={seo} />
      <GeoAeoEngine
        pageTitle={seo.metaTitle}
        pageDescription={seo.description}
        canonicalUrl={seo.canonical}
        breadcrumbs={seo.breadcrumbs}
        faqs={seo.faqs}
      />
      {/* Static FAQPage schema injected for AI crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <PublicLayout
        currentSlug="about"
        session={session}
        onNavigateSlug={onNavigateSlug}
        onSignIn={onSignIn}
        onStartTrial={onStartTrial}
        onOpenSuperAdmin={onOpenSuperAdmin}
        breadcrumbs={[
          { name: 'Home', slug: '' },
          { name: 'About JustGST', slug: 'about' },
        ]}
      >
        {/* ── Hero ── */}
        <section className="pt-12 pb-10 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs text-brand-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>About JustGST — Company Facts &amp; Information</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              About <span className="text-brand-600">JustGST</span>
            </h1>

            {/* ── TL;DR Direct Answer ── AI extracts this ── */}
            <div className="max-w-3xl mx-auto bg-brand-50 border border-brand-200 rounded-2xl p-5 text-left">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-600 mb-2">
                TL;DR — What Is JustGST?
              </p>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                <strong>JustGST is an Indian cloud GST billing and invoicing software</strong> priced
                at <strong>₹49/month</strong>, designed for retailers, wholesalers, pharmacies, and
                service providers across India. Founded in <strong>2025</strong> and headquartered in
                Tamil Nadu, JustGST lets any shop owner generate CBIC-compliant GST tax invoices,
                manage inventory, maintain customer ledgers, and collect UPI payments — entirely in a
                web browser, with no software installation required.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Last updated:{' '}
              <time dateTime="2026-09-15">September 15, 2026</time>
            </p>
          </div>
        </section>

        {/* ── Key Facts Grid ── */}
        <section className="py-12 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 text-center">
              JustGST — Key Facts at a Glance
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {KEY_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    {fact.icon}
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      {fact.label}
                    </span>
                  </div>
                  <p className="text-base font-black text-slate-900">{fact.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What We Do ── */}
        <section className="py-12 border-b border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              What JustGST Does
            </h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed max-w-3xl">
              JustGST is a complete cloud business management platform for Indian shops and businesses.
              Every feature is purpose-built for Indian GST compliance, UPI payments, and the operational
              reality of running a small business in India.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {CORE_FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-brand-300 transition-colors"
                >
                  <div className="mt-0.5 w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 mb-0.5">{f.title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who It's For ── */}
        <section className="py-12 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              Who JustGST Is Built For
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              JustGST is designed for Indian small and medium business owners who need affordable, compliant
              billing without complex accounting software or IT infrastructure.
            </p>
            <ul className="grid sm:grid-cols-2 gap-2">
              {WHO_IS_IT_FOR.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── What Makes Us Different ── */}
        <section className="py-12 border-b border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              What Makes JustGST Different
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-3xl">
              JustGST is not another Tally clone or mobile billing app. It is the only Indian GST
              billing platform that combines true cloud access, thermal POS printing, WhatsApp invoicing,
              and UPI QR payments at under ₹50/month.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="text-left p-3 font-bold rounded-tl-xl">Feature</th>
                    <th className="p-3 font-bold text-brand-300">JustGST</th>
                    <th className="p-3 font-bold">Vyapar</th>
                    <th className="p-3 font-bold">myBillBook</th>
                    <th className="p-3 font-bold rounded-tr-xl">Tally Prime</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Annual Price', '₹588/year', '₹2,399+/year', '₹1,899+/year', '₹18,000+'],
                    ['Cloud & Multi-Device', '✅ Included', '⚠️ Paid add-on', '⚠️ Higher tier', '❌ Needs server'],
                    ['WhatsApp + UPI QR', '✅ 1-Click', '❌ Manual export', '❌ Standard only', '❌ Plugin needed'],
                    ['Thermal POS Printing', '✅ 2" & 3"', '✅ Partial', '⚠️ Limited', '❌ Not native'],
                    ['Setup Time', '30 Seconds', 'Heavy installer', 'App store install', 'Complex setup'],
                    ['Accounting Expertise', 'Not required', 'Basic knowledge', 'Basic knowledge', 'Specialist required'],
                  ].map(([feature, ...vals]) => (
                    <tr key={feature} className="border-b border-slate-200 even:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-700">{feature}</td>
                      <td className="p-3 text-center font-bold text-brand-600 bg-brand-50">{vals[0]}</td>
                      <td className="p-3 text-center text-slate-600">{vals[1]}</td>
                      <td className="p-3 text-center text-slate-600">{vals[2]}</td>
                      <td className="p-3 text-center text-slate-600">{vals[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Pricing Transparency ── */}
        <section className="py-12 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">
              Transparent Pricing — No Hidden Fees
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              JustGST operates on a zero-hidden-fee model. Every plan includes unlimited GST invoices,
              unlimited inventory items, unlimited customer ledgers, cloud backup, and multi-device access.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Monthly Plan', price: '₹99/month', desc: 'Flexible, cancel anytime' },
                { label: '6-Month Plan', price: '₹79/month', desc: '₹474 total — save 20%', highlight: false },
                { label: 'Annual Plan', price: '₹49/month', desc: '₹588/year — best value', highlight: true },
              ].map((plan) => (
                <div
                  key={plan.label}
                  className={`rounded-2xl border p-5 text-center ${
                    plan.highlight
                      ? 'border-brand-400 bg-brand-50 shadow-md shadow-brand-100'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {plan.highlight && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold mb-2">
                      <Zap className="w-3 h-3" /> Best Value
                    </div>
                  )}
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{plan.label}</p>
                  <p className="text-2xl font-black text-slate-900 mb-1">{plan.price}</p>
                  <p className="text-xs text-slate-500">{plan.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">
              All plans include a <strong>14-day free trial</strong> with full features. No credit card required.
            </p>
          </div>
        </section>

        {/* ── Contact & Digital Presence ── */}
        <section className="py-12 border-b border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
              JustGST — Digital Presence &amp; Contact
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Website', href: 'https://justgst.in', display: 'justgst.in', icon: <Globe className="w-4 h-4" /> },
                { label: 'Email', href: 'mailto:support@justgst.in', display: 'support@justgst.in', icon: <Mail className="w-4 h-4" /> },
                { label: 'Headquarters', href: '#', display: 'Tamil Nadu, India', icon: <MapPin className="w-4 h-4" /> },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-brand-600 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                    {item.href === '#' ? (
                      <p className="font-semibold text-slate-700">{item.display}</p>
                    ) : (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="font-semibold text-brand-600 hover:underline"
                      >
                        {item.display}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ Section ── */}
        <section className="py-12 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
              Frequently Asked Questions About JustGST
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Direct factual answers about JustGST's product, pricing, and compliance.
            </p>
            <div className="space-y-3">
              {ABOUT_FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isOpen ? 'border-brand-300 bg-brand-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{faq.question}</h3>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-brand-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Try JustGST Free for 14 Days
            </h2>
            <p className="text-sm text-slate-600">
              No credit card required. Full features unlocked from day one.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onStartTrial}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-200 transition-all active:scale-98 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> Start Free Trial
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 hover:border-brand-400 text-slate-700 font-semibold text-sm transition-all cursor-pointer"
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        </section>
      </PublicLayout>
    </>
  );
};
