import React, { useEffect } from 'react';
import { SEORouteConfig, BASE_URL } from '../../config/seo.config';

interface SEOHeadProps {
  seo: SEORouteConfig;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ seo }) => {
  useEffect(() => {
    // 1. Update Document Title
    document.title = seo.metaTitle || seo.title;

    // Helper to update or create meta tags
    const setMetaTag = (nameAttr: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update or create link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Standard Meta
    setMetaTag('name', 'description', seo.description);
    if (seo.keywords && seo.keywords.length > 0) {
      setMetaTag('name', 'keywords', seo.keywords.join(', '));
    }

    // 3. Canonical Link
    setLinkTag('canonical', seo.canonical || BASE_URL);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:title', seo.metaTitle || seo.title);
    setMetaTag('property', 'og:description', seo.description);
    setMetaTag('property', 'og:url', seo.canonical || BASE_URL);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'JustGST');
    setMetaTag('property', 'og:image', `${BASE_URL}/icon-512.png`);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seo.metaTitle || seo.title);
    setMetaTag('name', 'twitter:description', seo.description);
    setMetaTag('name', 'twitter:image', `${BASE_URL}/icon-512.png`);

    // 6. JSON-LD Structured Data
    const SCRIPT_ID = 'justgst-dynamic-jsonld';
    let scriptElement = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = SCRIPT_ID;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    // Build rich FAQ schema if FAQs are provided
    const graphItems = [...(seo.jsonLd?.['@graph'] || [seo.jsonLd])];

    if (seo.faqs && seo.faqs.length > 0) {
      const faqSchema = {
        '@type': 'FAQPage',
        mainEntity: seo.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      graphItems.push(faqSchema);
    }

    const payload = {
      '@context': 'https://schema.org',
      '@graph': graphItems,
    };

    scriptElement.textContent = JSON.stringify(payload);

    return () => {
      // Optional cleanup on unmount if needed
    };
  }, [seo]);

  return null;
};
