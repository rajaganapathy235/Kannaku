import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Home,
} from 'lucide-react';
import { AuthSession } from '../../types/auth';
import { LegalModal, LegalDocType } from '../home/LegalModal';

export interface BreadcrumbItem {
  name: string;
  url?: string;
  slug?: string;
}

interface PublicLayoutProps {
  children: React.ReactNode;
  session?: AuthSession | null;
  breadcrumbs?: BreadcrumbItem[];
  currentSlug?: string;
  onNavigateSlug?: (slug: string) => void;
  onSignIn?: () => void;
  onStartTrial?: () => void;
  onEnterDemoApp?: () => void;
  onOpenSuperAdmin?: () => void;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  session = null,
  breadcrumbs,
  currentSlug = '',
  onNavigateSlug,
  onSignIn,
  onStartTrial,
  onEnterDemoApp,
  onOpenSuperAdmin,
}) => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>('terms');

  const openLegal = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    setLegalModalOpen(true);
  };

  const handleNav = (e: React.MouseEvent, slug: string) => {
    if (onNavigateSlug) {
      e.preventDefault();
      onNavigateSlug(slug);
    }
  };

  const isHome = !currentSlug || currentSlug === '' || currentSlug === 'home';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-brand-600 selection:text-white flex flex-col">
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo strictly wrapped in link to / */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => handleNav(e, '')}
              className="flex items-center cursor-pointer"
              title="JustGST - Return to Home"
            >
              <img
                src="/logo-horizontal.svg"
                alt="JustGST"
                className="w-auto object-contain shrink-0"
                style={{ height: '40px', minHeight: '36px' }}
              />
            </a>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a
              href="/#features"
              onClick={(e) => {
                if (isHome) {
                  // normal anchor jump
                } else {
                  handleNav(e, '');
                }
              }}
              className="hover:text-brand-600 transition-colors"
            >
              Features
            </a>
            <a
              href="/#pricing"
              onClick={(e) => {
                if (isHome) {
                  // normal anchor jump
                } else {
                  handleNav(e, 'pricing');
                }
              }}
              className="hover:text-brand-600 transition-colors"
            >
              Pricing
            </a>

            <a
              href="/#faq"
              onClick={(e) => {
                if (isHome) {
                  // normal anchor jump
                } else {
                  handleNav(e, '');
                }
              }}
              className="hover:text-brand-600 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {session ? (
              <button
                type="button"
                onClick={onEnterDemoApp}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>Go to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={onStartTrial}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Subpage Breadcrumb Banner / Back to Home Link */}
      {!isHome && (
        <div className="bg-white border-b border-slate-200/80 py-2.5 shadow-2xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
              <a
                href="/"
                onClick={(e) => handleNav(e, '')}
                className="flex items-center gap-1 text-slate-600 hover:text-brand-600 transition-colors font-medium cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </a>
              {breadcrumbs && breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                    {crumb.slug !== undefined && crumb.slug !== currentSlug ? (
                      <a
                        href={crumb.slug ? `/${crumb.slug}/` : '/'}
                        onClick={(e) => handleNav(e, crumb.slug || '')}
                        className="text-slate-600 hover:text-brand-600 transition-colors font-medium truncate max-w-[200px] cursor-pointer"
                      >
                        {crumb.name}
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-900 truncate max-w-[240px]">
                        {crumb.name}
                      </span>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-900 capitalize">
                    {currentSlug.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </div>

            {/* Direct One-Click Back to Home Button */}
            <a
              href="/"
              onClick={(e) => handleNav(e, '')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/70 border border-brand-200/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-3"
            >
              <span>← Back to Home</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Page Content Body */}
      <main className="flex-1 w-full">{children}</main>

      {/* Minimalist Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        {/* On subpages / solutions, show the 4-column directory. On the homepage, keep it clean without the directory lists. */}
        {!isHome && (
          <div id="industries" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Column 1: Brand & Tagline */}
              <div className="space-y-4">
                <a
                  href="/"
                  onClick={(e) => handleNav(e, '')}
                  className="inline-block cursor-pointer"
                >
                  <img
                    src="/logo-horizontal.svg"
                    alt="JustGST"
                    className="w-auto object-contain shrink-0"
                    style={{ height: '36px' }}
                  />
                </a>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Simple, fast 100% cloud GST billing, POS &amp; inventory software for Indian businesses, retailers, and wholesalers at ₹49/month.
                </p>
                <div className="text-[11px] text-slate-400">
                  © {new Date().getFullYear()} JustGST. All Rights Reserved.
                </div>
              </div>

              {/* Column 2: Product */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Product
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>
                    <a
                      href="/#features"
                      onClick={(e) => {
                        if (!isHome) handleNav(e, '');
                      }}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="/pricing/"
                      onClick={(e) => handleNav(e, 'pricing')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Pricing Plans
                    </a>
                  </li>
                  <li>
                    <a
                      href="/gst-billing-software/"
                      onClick={(e) => handleNav(e, 'gst-billing-software')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      GST Billing Software
                    </a>
                  </li>
                  <li>
                    <a
                      href="/inventory-management-software/"
                      onClick={(e) => handleNav(e, 'inventory-management-software')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Inventory &amp; Stock
                    </a>
                  </li>
                  <li>
                    <a
                      href="/billing-software-for-retail/"
                      onClick={(e) => handleNav(e, 'billing-software-for-retail')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Retail POS &amp; Thermal
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 3: Industries */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Industries
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>
                    <a
                      href="/billing-software-for-pharmacy/"
                      onClick={(e) => handleNav(e, 'billing-software-for-pharmacy')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Pharmacies &amp; Chemists
                    </a>
                  </li>
                  <li>
                    <a
                      href="/billing-software-for-supermarket/"
                      onClick={(e) => handleNav(e, 'billing-software-for-supermarket')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Supermarkets &amp; Kirana
                    </a>
                  </li>
                  <li>
                    <a
                      href="/billing-software-for-wholesale/"
                      onClick={(e) => handleNav(e, 'billing-software-for-wholesale')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Wholesale &amp; Distribution
                    </a>
                  </li>
                  <li>
                    <a
                      href="/billing-software-for-hardware/"
                      onClick={(e) => handleNav(e, 'billing-software-for-hardware')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Hardware &amp; Sanitary
                    </a>
                  </li>
                  <li>
                    <a
                      href="/billing-software-for-apparel/"
                      onClick={(e) => handleNav(e, 'billing-software-for-apparel')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Garments &amp; Apparel
                    </a>
                  </li>
                  <li>
                    <a
                      href="/billing-software-for-manufacturing/"
                      onClick={(e) => handleNav(e, 'billing-software-for-manufacturing')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      Manufacturing &amp; Factories
                    </a>
                  </li>
                </ul>
              </div>

              {/* Column 4: Comparisons & Legal */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Comparisons &amp; Legal
                </div>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li>
                    <a
                      href="/compare/justgst-vs-vyapar/"
                      onClick={(e) => handleNav(e, 'compare/justgst-vs-vyapar')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      vs Vyapar
                    </a>
                  </li>
                  <li>
                    <a
                      href="/compare/justgst-vs-mybillbook/"
                      onClick={(e) => handleNav(e, 'compare/justgst-vs-mybillbook')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      vs myBillBook
                    </a>
                  </li>
                  <li>
                    <a
                      href="/compare/justgst-vs-tally/"
                      onClick={(e) => handleNav(e, 'compare/justgst-vs-tally')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      vs Tally Prime
                    </a>
                  </li>
                  <li>
                    <a
                      href="/compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook/"
                      onClick={(e) => handleNav(e, 'compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook')}
                      className="hover:text-brand-600 transition-colors"
                    >
                      5-Way Compare
                    </a>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openLegal('privacy')}
                      className="hover:text-brand-600 transition-colors cursor-pointer text-left"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openLegal('terms')}
                      className="hover:text-brand-600 transition-colors cursor-pointer text-left"
                    >
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openLegal('refund')}
                      className="hover:text-brand-600 transition-colors cursor-pointer text-left"
                    >
                      Refund Policy
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openLegal('contact')}
                      className="hover:text-brand-600 transition-colors cursor-pointer text-left"
                    >
                      Contact Support
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Legal Sub-Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <a
                href="/"
                onClick={(e) => handleNav(e, '')}
                className="inline-block cursor-pointer"
              >
                <img
                  src="/logo-horizontal.svg"
                  alt="JustGST"
                  className="w-auto object-contain shrink-0"
                  style={{ height: '28px' }}
                />
              </a>
              <p className="text-center sm:text-left">
                © {new Date().getFullYear()} JustGST. Operated by Rajaganapathy Kamalakannan. All Rights Reserved.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-slate-500 font-medium">
              <button
                type="button"
                onClick={() => openLegal('privacy')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegal('terms')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegal('refund')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                Refund Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegal('shipping')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                SaaS Delivery
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegal('security')}
                className="hover:text-brand-600 transition-colors cursor-pointer"
              >
                Payment Security
              </button>
              <span>•</span>
              {onOpenSuperAdmin && (
                <button
                  type="button"
                  onClick={onOpenSuperAdmin}
                  className="hover:text-brand-600 transition-colors cursor-pointer font-semibold text-slate-600"
                >
                  SuperAdmin
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Legal & Compliance Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialDoc={activeLegalDoc}
      />
    </div>
  );
};
