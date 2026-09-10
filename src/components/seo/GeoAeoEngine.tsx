import React, { useEffect } from 'react';

export interface GeoAeoEngineProps {
  pageTitle?: string;
  pageDescription?: string;
  canonicalUrl?: string;
  breadcrumbs?: { name: string; url: string }[];
  faqs?: { question: string; answer: string }[];
  price?: string;
  priceCurrency?: string;
  ratingValue?: string;
  ratingCount?: string;
  customSchema?: Record<string, any>[];
}

const BASE_URL = 'https://justgst.in';

export const GeoAeoEngine: React.FC<GeoAeoEngineProps> = ({
  pageTitle = 'JustGST — Cloud GST Billing & Invoicing Software India',
  pageDescription = 'India’s most affordable cloud GST billing software priced at ₹49/month. Instant GSTIN lookup, WhatsApp invoices with UPI QR codes, inventory, and GSTR-1 reports.',
  canonicalUrl = `${BASE_URL}/`,
  breadcrumbs,
  faqs,
  price = '49',
  priceCurrency = 'INR',
  ratingValue = '4.9',
  ratingCount = '1840',
  customSchema = [],
}) => {
  useEffect(() => {
    // 1. Meta / Canonical Updates
    if (pageTitle) {
      document.title = pageTitle;
    }

    const setMeta = (nameAttr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${nameAttr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description', pageDescription);
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDescription);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:site_name', 'JustGST');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:image', `${BASE_URL}/icon-512.png`);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDescription);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // 2. Organization Schema
    const organizationSchema = {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'JustGST',
      legalName: 'JustGST Technologies',
      url: BASE_URL,
      logo: `${BASE_URL}/icon-512.png`,
      image: `${BASE_URL}/icon-512.png`,
      description: 'Indian cloud GST billing, invoicing, inventory control, and payment tracking SaaS.',
      foundingDate: '2025',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressRegion: 'Tamil Nadu',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: BASE_URL,
        availableLanguage: ['en', 'hi', 'ta', 'te', 'mr', 'gu'],
      },
      sameAs: [
        'https://twitter.com/justgst_in',
        'https://github.com/justgst',
      ],
    };

    // 3. SoftwareApplication Schema (AEO/GEO Rich signals)
    const softwareApplicationSchema = {
      '@type': 'SoftwareApplication',
      '@id': `${BASE_URL}/#software`,
      name: 'JustGST',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'GST Billing & Invoicing Software',
      operatingSystem: 'Web, Cloud, Android, iOS, Windows, macOS, Linux',
      softwareVersion: '2026.1',
      url: BASE_URL,
      publisher: {
        '@id': `${BASE_URL}/#organization`,
      },
      description: 'Cloud GST invoicing, real-time inventory management, party ledgers, and thermal POS receipt printing designed for Indian MSMEs, retailers, and traders.',
      featureList: [
        'Instant 1-second GSTIN auto-lookup and legal name autofill',
        'Direct 1-click WhatsApp PDF invoice dispatch with UPI QR codes',
        'Native 2-inch and 3-inch thermal POS receipt printer support',
        'Real-time inventory stock management with low-stock alerts',
        'Automated GSTR-1 and GSTR-3B tax report generation for CAs',
        'Multi-device cloud synchronization across mobile and laptop',
      ],
      offers: {
        '@type': 'Offer',
        price: price,
        priceCurrency: priceCurrency,
        priceValidUntil: '2027-12-31',
        availability: 'https://schema.org/InStock',
        description: 'Pro subscription at ₹49/month (₹588/year) with 14-day free trial and unlimited invoices.',
        seller: {
          '@id': `${BASE_URL}/#organization`,
        },
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingValue,
        bestRating: '5',
        worstRating: '1',
        ratingCount: ratingCount,
        reviewCount: ratingCount,
      },
    };

    const graph: any[] = [organizationSchema, softwareApplicationSchema];

    // 4. Optional BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((bc, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: bc.name,
          item: bc.url,
        })),
      });
    }

    // 5. Optional FAQPage Schema
    if (faqs && faqs.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    // 6. Custom additional schemas
    if (customSchema.length > 0) {
      graph.push(...customSchema);
    }

    // Inject Unified JSON-LD
    const SCRIPT_ID = 'justgst-geo-aeo-jsonld';
    let scriptEl = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = SCRIPT_ID;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    scriptEl.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graph,
    });
  }, [
    pageTitle,
    pageDescription,
    canonicalUrl,
    breadcrumbs,
    faqs,
    price,
    priceCurrency,
    ratingValue,
    ratingCount,
    customSchema,
  ]);

  return null;
};
