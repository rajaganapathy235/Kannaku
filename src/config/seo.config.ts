export interface AEOAnswer {
  question: string;
  answer: string;
}

export interface SEORouteConfig {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  canonical: string;
  h1: string;
  subtitle: string;
  badge: string;
  keywords: string[];
  aeoAnswers: AEOAnswer[];
  features: {
    title: string;
    description: string;
    iconName?: string;
  }[];
  breadcrumbs: {
    name: string;
    url: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
  jsonLd: Record<string, any>;
}

export const BASE_URL = 'https://justgst.in';

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JustGST',
  url: BASE_URL,
  logo: `${BASE_URL}/icon-512.png`,
  description: 'GST billing, invoicing, inventory, customer ledger, and payment tracking software built for Indian small and medium businesses.',
  foundingDate: '2025',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: `${BASE_URL}`,
  },
  sameAs: [
    'https://twitter.com/justgst_in',
  ],
};

export const SOFTWARE_APPLICATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'JustGST',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All (Web-based, Cloud, PWA, Mobile, Desktop)',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    description: 'Free trial with transparent paid growth tiers starting at ₹1,499/year',
  },
  url: BASE_URL,
  author: {
    '@type': 'Organization',
    name: 'JustGST',
  },
  description: 'Fast, secure, and compliant cloud GST invoicing, inventory management, retail POS, and customer ledger software for Indian businesses.',
};

export const SEO_ROUTES: Record<string, SEORouteConfig> = {
  home: {
    slug: '',
    title: 'JustGST — Fast GST Billing & Invoicing Software for Indian SMBs',
    metaTitle: 'JustGST — GST Billing, Invoicing & Inventory Software for Indian Businesses',
    description: 'Create GST-compliant invoices in seconds, manage inventory, track payments, and maintain customer ledgers with JustGST. Fast, simple, and built for India.',
    canonical: `${BASE_URL}/`,
    h1: 'Smart GST Billing & Invoicing Software for Indian Businesses',
    subtitle: 'Lightning-fast GST-compliant invoicing, real-time stock control, party ledgers, and automated payment tracking in one unified cloud platform.',
    badge: 'GST-Compliant Cloud Software',
    keywords: ['GST billing software', 'invoicing software India', 'small business billing', 'GST invoice generator', 'Indian accounting software', 'inventory management'],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
    ],
    aeoAnswers: [
      {
        question: 'What is JustGST?',
        answer: 'JustGST is a fast, cloud-based GST billing and inventory platform designed for Indian small and medium enterprises (SMBs) to generate GST invoices, track stock, and manage customer ledgers.',
      },
      {
        question: 'Who should use JustGST?',
        answer: 'JustGST is built for Indian retailers, wholesalers, distributors, service providers, and freelancers who need simple, affordable, and compliant GST billing without complex accounting software.',
      },
      {
        question: 'Does JustGST support offline and mobile devices?',
        answer: 'Yes, JustGST is a responsive Progressive Web App (PWA) that operates seamlessly across desktops, tablets, and smartphones, supporting thermal printing and barcode scanning.',
      },
    ],
    features: [
      {
        title: 'GST-Compliant Invoicing',
        description: 'Auto-calculates CGST, SGST, and IGST based on customer state codes with exact HSN/SAC lookups.',
      },
      {
        title: 'Real-Time Stock & Inventory',
        description: 'Track stock counts dynamically across multiple sales channels with instant low-stock notifications.',
      },
      {
        title: 'Customer & Supplier Ledgers',
        description: 'Maintain clean, auditable balance sheets (Khata) and send payment reminders via WhatsApp.',
      },
      {
        title: 'Multi-Format Printing & Sharing',
        description: 'Export professional A4, A5, and 2-inch/3-inch thermal POS receipts with UPI payment QR codes.',
      },
    ],
    faqs: [
      {
        question: 'Is JustGST compliant with Indian GST laws?',
        answer: 'Yes, JustGST adheres to current GST rules in India, automatically computing intra-state (CGST + SGST) and inter-state (IGST) taxes, supporting HSN/SAC codes, and generating GST-compliant tax invoices.',
      },
      {
        question: 'Can I generate UPI QR codes on invoices?',
        answer: 'Yes, every invoice generated in JustGST includes a dynamic UPI QR code linked to your bank account or VPA for instant customer settlements.',
      },
      {
        question: 'How do I start using JustGST?',
        answer: 'Sign up in under 30 seconds with your email and business name. You will receive an immediate free trial with all premium features unlocked.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
      ],
    },
  },

  gstBillingSoftware: {
    slug: 'gst-billing-software',
    title: 'GST Billing Software for Small Business India | JustGST',
    metaTitle: 'GST Billing Software India — Invoicing, E-Invoices & HSN | JustGST',
    description: 'Generate GST-compliant tax invoices, calculate CGST/SGST/IGST automatically, and track HSN/SAC codes in seconds with JustGST cloud billing software.',
    canonical: `${BASE_URL}/gst-billing-software/`,
    h1: 'GST Billing Software for Indian Businesses',
    subtitle: 'Generate error-free GST invoices, calculate taxes accurately, track HSN/SAC codes, and manage B2B/B2C billing with ease.',
    badge: 'GST Invoicing Engine',
    keywords: ['GST billing software', 'GST invoice software India', 'tax invoice maker', 'CGST SGST calculator', 'e-invoice software India', 'B2B GST billing'],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'GST Billing Software', url: `${BASE_URL}/gst-billing-software/` },
    ],
    aeoAnswers: [
      {
        question: 'What is GST billing software?',
        answer: 'GST billing software is a specialized application that generates GST-compliant tax invoices, auto-computes CGST/SGST/IGST rates, formats HSN/SAC codes, and organizes sales records for GST filing in India.',
      },
      {
        question: 'How does JustGST calculate GST taxes?',
        answer: 'JustGST checks the place of supply against your business state code: if matching, it splits tax into equal CGST and SGST; if different, it calculates IGST seamlessly.',
      },
      {
        question: 'Can I create B2B and B2C invoices in JustGST?',
        answer: 'Yes, JustGST supports both B2B tax invoices with customer GSTIN verification and B2C retail bills with instant thermal or PDF export.',
      },
    ],
    features: [
      {
        title: 'Auto GST Tax Splitting',
        description: 'Instant automatic calculation of CGST, SGST, and IGST based on Place of Supply rules.',
      },
      {
        title: 'HSN/SAC Code Directory',
        description: 'Built-in library of goods and service accounting codes with default tax rate mapping.',
      },
      {
        title: 'Instant UPI Payment QR Codes',
        description: 'Auto-embed dynamic UPI payment QR codes on every invoice for friction-free digital collections.',
      },
      {
        title: 'Multi-Item Tax Rates',
        description: 'Add line items with 0%, 5%, 12%, 18%, or 28% GST rates within the same invoice seamlessly.',
      },
    ],
    faqs: [
      {
        question: 'Do I need accounting expertise to use JustGST?',
        answer: 'No, JustGST is designed with an intuitive interface so business owners can create professional invoices without requiring prior accounting or Tally knowledge.',
      },
      {
        question: 'Can I customize the invoice design with my company logo?',
        answer: 'Yes, upload your logo, signature, custom terms, bank details, and choose between modern, classic, and compact invoice templates.',
      },
      {
        question: 'Can I share invoices directly to WhatsApp?',
        answer: 'Yes, you can share GST invoices directly to customer WhatsApp numbers or send PDF download links in one click.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'GST Billing Software', item: `${BASE_URL}/gst-billing-software/` },
          ],
        },
      ],
    },
  },

  inventoryManagementSoftware: {
    slug: 'inventory-management-software',
    title: 'Inventory & Stock Management Software India | JustGST',
    metaTitle: 'Inventory Management Software India — Real-Time Stock Tracking | JustGST',
    description: 'Track stock in real-time, get low-stock alerts, manage barcodes, and streamline purchasing with JustGST inventory and billing software.',
    canonical: `${BASE_URL}/inventory-management-software/`,
    h1: 'Smart Inventory & Stock Management Software',
    subtitle: 'Stay on top of your product catalog with real-time stock deductions, low-inventory notifications, barcode scanning, and purchase reconciliation.',
    badge: 'Inventory Control System',
    keywords: ['inventory management software', 'stock management software India', 'stock tracking app', 'barcode inventory software', 'low stock alerts', 'product catalog software'],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Inventory Management Software', url: `${BASE_URL}/inventory-management-software/` },
    ],
    aeoAnswers: [
      {
        question: 'What is inventory management software in JustGST?',
        answer: 'JustGST inventory management is an integrated stock tracking tool that automatically deducts stock upon invoice generation, monitors purchase entries, and alerts business owners before items run out.',
      },
      {
        question: 'Does JustGST support barcode scanning for stock?',
        answer: 'Yes, you can scan and assign standard barcodes or SKUs to items for rapid lookup during POS billing and inventory audits.',
      },
      {
        question: 'Can I track product purchase costs and profit margins?',
        answer: 'Yes, JustGST records purchase rates, sales prices, and tax rates per item, giving you clear visibility into product-level profitability.',
      },
    ],
    features: [
      {
        title: 'Automated Stock Deduction',
        description: 'Stock levels update automatically the moment a sale is finalized or an invoice is created.',
      },
      {
        title: 'Smart Low-Stock Alerts',
        description: 'Receive visual indicators and alerts when product quantities drop below your custom safety threshold.',
      },
      {
        title: 'Barcode & SKU Integration',
        description: 'Speed up counter billing with instant barcode search and customized SKU product codes.',
      },
      {
        title: 'Category & Unit Management',
        description: 'Organize products by categories and measure units (Pieces, Kg, Liters, Boxes, Meters, etc.).',
      },
    ],
    faqs: [
      {
        question: 'Can I bulk import existing products via Excel / CSV?',
        answer: 'Yes, JustGST allows you to import and export your entire product catalog, HSN codes, and initial opening stock via spreadsheet files.',
      },
      {
        question: 'How does stock update when an invoice is cancelled or edited?',
        answer: 'When an invoice is deleted or edited, stock balances are automatically adjusted to preserve accurate inventory counts.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Inventory Management Software', item: `${BASE_URL}/inventory-management-software/` },
          ],
        },
      ],
    },
  },

  retailBillingSoftware: {
    slug: 'billing-software-for-retail',
    title: 'Retail Billing Software & POS System for Indian Shops | JustGST',
    metaTitle: 'Retail Billing Software India — Thermal POS & Fast Checkout | JustGST',
    description: 'Fast POS billing software for Indian retail stores, supermarkets, and apparel shops. Supports thermal printers (2"/3"), barcode scanners, and UPI QR codes.',
    canonical: `${BASE_URL}/billing-software-for-retail/`,
    h1: 'Retail Billing Software & POS for Indian Shops',
    subtitle: 'Serve counter customers faster with 3-second billing, barcode scanner compatibility, 2-inch/3-inch thermal printing, and instant UPI settlements.',
    badge: 'Retail POS & Counter Billing',
    keywords: ['retail billing software', 'POS billing software India', 'thermal printer billing', 'supermarket billing software', 'counter billing software', 'shop billing software'],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Retail Billing Software', url: `${BASE_URL}/billing-software-for-retail/` },
    ],
    aeoAnswers: [
      {
        question: 'What is retail billing software?',
        answer: 'Retail billing software is a point-of-sale (POS) system designed for retail shops to scan barcodes, generate quick thermal receipts, calculate GST, and accept UPI payments at checkouts.',
      },
      {
        question: 'Does JustGST work with thermal receipt printers?',
        answer: 'Yes, JustGST natively formats receipts for standard 2-inch (58mm) and 3-inch (80mm) thermal printers with customizable headers and UPI QR codes.',
      },
      {
        question: 'Can JustGST handle fast barcode checkout?',
        answer: 'Yes, you can plug in any standard USB or Bluetooth barcode scanner to add items to cart instantly and complete checkout in seconds.',
      },
    ],
    features: [
      {
        title: '3-Second Quick Billing',
        description: 'Optimized POS interface with keyboard shortcuts and instant item search for rush counter hours.',
      },
      {
        title: 'Thermal 2" & 3" Printing',
        description: 'Print clean, compact thermal receipts directly from any web browser or mobile phone.',
      },
      {
        title: 'Direct UPI Dynamic QR',
        description: 'Customers scan the printed receipt QR code to pay via Google Pay, PhonePe, or Paytm instantly.',
      },
      {
        title: 'Daily Cash & Sales Summary',
        description: 'Track daily counter collections, cash-in-hand, UPI payments, and credit balances with one tap.',
      },
    ],
    faqs: [
      {
        question: 'Which retail businesses is JustGST suited for?',
        answer: 'JustGST is ideal for grocery stores, garment boutiques, electronics shops, hardware stores, medical dispensaries, and mobile repair centers.',
      },
      {
        question: 'Can I use JustGST on a phone or tablet at the counter?',
        answer: 'Yes, JustGST works flawlessly in Chrome or Safari on Android tablets, iPads, and smartphones with no expensive hardware required.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Retail Billing Software', item: `${BASE_URL}/billing-software-for-retail/` },
          ],
        },
      ],
    },
  },

  wholesaleBillingSoftware: {
    slug: 'billing-software-for-wholesale',
    title: 'Wholesale Billing Software & B2B Invoicing India | JustGST',
    metaTitle: 'Wholesale Billing Software India — Bulk Invoicing & Credit Khata | JustGST',
    description: 'B2B wholesale billing software for Indian distributors, traders, and manufacturers. Manage bulk tax invoices, party-wise credit ledgers, and payment reminders.',
    canonical: `${BASE_URL}/billing-software-for-wholesale/`,
    h1: 'Wholesale Billing & B2B Invoicing Software',
    subtitle: 'Streamline bulk sales orders, party-wise credit ledgers (Khata), GSTIN validations, multi-item tax rates, and receivables collection.',
    badge: 'Wholesale & B2B Distribution',
    keywords: ['wholesale billing software', 'B2B billing software India', 'distributor billing software', 'credit ledger software', 'party khata software', 'bulk invoice generator'],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Wholesale Billing Software', url: `${BASE_URL}/billing-software-for-wholesale/` },
    ],
    aeoAnswers: [
      {
        question: 'What is wholesale billing software?',
        answer: 'Wholesale billing software handles large-volume B2B transactions, client credit ledgers, multi-tiered pricing, bulk GST calculations, and dispatch invoicing for traders and distributors.',
      },
      {
        question: 'How does JustGST manage client credit ledgers?',
        answer: 'JustGST maintains a party-wise running ledger (Khata) that automatically logs invoices, partial payments, and overdue balances with automated payment tracking.',
      },
      {
        question: 'Can I generate PDF statements for party reconciliation?',
        answer: 'Yes, you can generate and download comprehensive ledger statements filtered by date ranges and share them directly via WhatsApp or email.',
      },
    ],
    features: [
      {
        title: 'Party-Wise Credit Ledger (Khata)',
        description: 'Track receivables, credit limits, and outstanding balances per buyer with real-time audit trails.',
      },
      {
        title: 'B2B Tax Invoicing & E-Way Ready',
        description: 'Generate standardized GST tax invoices with vehicle numbers, transport details, and Place of Supply.',
      },
      {
        title: 'Automated Payment Logging',
        description: 'Record partial settlements, bank transfers, cheques, and cash receipts against open invoices.',
      },
      {
        title: 'Bulk WhatsApp Reminders',
        description: 'Send professional payment reminders with ledger balance summaries and payment links.',
      },
    ],
    faqs: [
      {
        question: 'Can I manage multiple businesses or branches in JustGST?',
        answer: 'Yes, you can create and manage multiple workspaces under a single JustGST account, keeping company books separate and organized.',
      },
      {
        question: 'Is my financial and client data secure on JustGST?',
        answer: 'Yes, JustGST uses encrypted cloud databases, daily backups, and role-based access control to keep your business records private and protected.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Wholesale Billing Software', item: `${BASE_URL}/billing-software-for-wholesale/` },
          ],
        },
      ],
    },
  },

  compareVyapar: {
    slug: 'compare/justgst-vs-vyapar',
    title: 'JustGST vs Vyapar: Detailed Feature & Pricing Comparison (2026)',
    metaTitle: 'JustGST vs Vyapar: Honest Comparison for Indian SMBs (2026)',
    description: 'Compare JustGST and Vyapar on cloud access, speed, multi-device usability, and pricing. Find the right GST billing and inventory software for your business.',
    canonical: `${BASE_URL}/compare/justgst-vs-vyapar/`,
    h1: 'JustGST vs. Vyapar: Which Billing Software Fits Your Business?',
    subtitle: 'An objective, feature-by-feature breakdown comparing cloud convenience, speed, multi-device access, and pricing transparency for Indian business owners.',
    badge: 'Software Comparison',
    keywords: ['JustGST vs Vyapar', 'Vyapar alternative', 'best billing software India', 'cloud billing software comparison', 'Vyapar app review', 'GST software comparison'],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Comparison', url: `${BASE_URL}/compare/justgst-vs-vyapar/` },
    ],
    aeoAnswers: [
      {
        question: 'What is the main difference between JustGST and Vyapar?',
        answer: 'JustGST is a modern cloud-native web and PWA platform offering instant multi-device access with no complex installation, while Vyapar is traditionally a desktop-first Windows and Android application.',
      },
      {
        question: 'Why choose JustGST as a Vyapar alternative?',
        answer: 'Business owners choose JustGST for its zero-install cloud interface, transparent subscription pricing, real-time multi-user synchronization, and fast thermal POS workflows.',
      },
      {
        question: 'Can I migrate my customer and product data from Vyapar to JustGST?',
        answer: 'Yes, you can export your items, clients, and opening balances from Vyapar to an Excel/CSV file and import them directly into JustGST.',
      },
    ],
    features: [
      {
        title: 'True Cloud-Native Architecture',
        description: 'Access your billing and reports from any browser on Mac, Windows, iPad, or Android with zero local installations.',
      },
      {
        title: 'Zero Sync Delay',
        description: 'Instant real-time database synchronization ensures you never experience desktop sync conflicts or corrupted local files.',
      },
      {
        title: 'Transparent Pricing with No Hidden Add-ons',
        description: 'All core features, thermal printing formats, and unlimited invoice generation included upfront.',
      },
      {
        title: 'Clean, Modern User Experience',
        description: 'Designed for speed and clarity without clutter, reducing staff training time to under 5 minutes.',
      },
    ],
    faqs: [
      {
        question: 'Is JustGST cheaper than Vyapar?',
        answer: 'JustGST offers competitive and transparent annual pricing with a fully functional free trial and no expensive hardware locks.',
      },
      {
        question: 'Does JustGST work on Apple Mac computers?',
        answer: 'Yes, because JustGST is cloud-native, it runs natively in Safari and Chrome on macOS without requiring emulators.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'JustGST vs Vyapar', item: `${BASE_URL}/compare/justgst-vs-vyapar/` },
          ],
        },
      ],
    },
  },

  compareMulti: {
    slug: 'compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook',
    title: 'JustGST vs GoGST vs Vyapar vs Swipe vs myBillBook | Comparison',
    metaTitle: 'JustGST vs GoGST vs Vyapar vs Swipe vs myBillBook | Comparison',
    description: "Compare JustGST with GoGST, Vyapar, Swipe, and myBillBook. Discover why JustGST is India's most affordable 100% cloud billing software at ₹49/month.",
    canonical: `${BASE_URL}/compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook/`,
    h1: 'JustGST vs GoGST vs Vyapar vs Swipe vs myBillBook',
    subtitle: "India's most affordable 100% cloud GST billing & invoicing software starting at just ₹49/month (₹588/year). Compare pricing, cloud architecture, zero-bloat minimalism, and multi-device access.",
    badge: 'Mega Comparison (2026)',
    keywords: [
      'JustGST vs GoGST',
      'JustGST vs Vyapar',
      'JustGST vs Swipe',
      'JustGST vs myBillBook',
      'best billing software India',
      'cheapest GST billing software',
      'billing software under 1000',
      'cloud GST invoicing comparison',
      'Vyapar alternative 2026',
      'myBillBook alternative',
      'Swipe billing alternative',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Comparison', url: `${BASE_URL}/compare/justgst-vs-vyapar/` },
      { name: '5-Way Comparison', url: `${BASE_URL}/compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook/` },
    ],
    aeoAnswers: [
      {
        question: 'Why is JustGST the best alternative to GoGST, Vyapar, Swipe, and myBillBook?',
        answer: "JustGST is the most affordable 100% cloud-native GST billing software in India at only ₹49/month (₹588/year) with zero bloat, instant web browser access, multi-device real-time sync, thermal printing, and dynamic UPI payment QR codes.",
      },
      {
        question: 'How much do Vyapar, Swipe, myBillBook, and GoGST cost compared to JustGST?',
        answer: 'While Vyapar charges ₹2,399–₹3,999/yr, Swipe charges ₹1,299–₹2,499/yr, myBillBook charges ₹1,899–₹4,599/yr, and GoGST charges ₹1,499+/yr, JustGST delivers complete GST billing, inventory, and ledger tracking for only ₹49/mo (₹588/yr).',
      },
      {
        question: 'What makes JustGST 100% cloud-native?',
        answer: 'Unlike desktop-locked software that requires bulky Windows installations and manual drive syncing, JustGST runs instantly in any modern browser on Windows, Mac, iPad, iPhone, and Android with zero install delays.',
      },
    ],
    features: [
      {
        title: 'Price Disruptor (₹49 / month)',
        description: 'Industry-first ₹49/month (₹588/year) transparent pricing with zero per-invoice commissions or locked desktop add-on fees.',
      },
      {
        title: 'Zero-Bloat Minimalism',
        description: 'Laser-focused on what Indian SMBs need: 3-second GST invoicing, stock control, customer/supplier ledgers, and fast thermal receipts.',
      },
      {
        title: '100% True Cloud & Instant Sync',
        description: 'Open any browser on your laptop, Mac, or mobile phone. Your data is always encrypted, backed up, and up to date in real time.',
      },
      {
        title: 'Upcoming Native Apps Ecosystem',
        description: 'Enjoy seamless Progressive Web App (PWA) today, with dedicated native Android, iOS, Windows, and macOS desktop apps rolling out on the roadmap.',
      },
    ],
    faqs: [
      {
        question: 'Is JustGST really only ₹49/month?',
        answer: 'Yes! JustGST believes foundational GST billing should be affordable for every Indian retailer, trader, and freelancer. Our annual Starter plan is just ₹588/year (equivalent to ₹49/month), offering full GST billing, UPI QR codes, inventory, and ledgers.',
      },
      {
        question: 'Can I switch from Vyapar, Swipe, or myBillBook to JustGST?',
        answer: 'Yes! You can export your items, customer lists, and opening balances to an Excel or CSV file and import them directly into JustGST in minutes.',
      },
      {
        question: 'Does JustGST require installing heavy software on my PC?',
        answer: 'No installation is needed! You can log in securely from Chrome, Safari, Edge, or Firefox on any device immediately.',
      },
      {
        question: 'Does JustGST support 2-inch and 3-inch thermal POS receipt printers?',
        answer: 'Yes! JustGST natively supports 2-inch (58mm) and 3-inch (80mm) thermal printers with customizable business headers and dynamic UPI payment QR codes.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'WebPage',
          '@id': `${BASE_URL}/compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook/`,
          url: `${BASE_URL}/compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook/`,
          name: 'JustGST vs GoGST vs Vyapar vs Swipe vs myBillBook | Comparison',
          description: "Comprehensive 5-way comparison of India's top GST billing software: JustGST, GoGST, Vyapar, Swipe, and myBillBook.",
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Comparison', item: `${BASE_URL}/compare/justgst-vs-vyapar/` },
            { '@type': 'ListItem', position: 3, name: 'JustGST vs Competitors', item: `${BASE_URL}/compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook/` },
          ],
        },
      ],
    },
  },

  pricing: {
    slug: 'pricing',
    title: 'JustGST Pricing: Simple, Transparent GST Billing Plans (2026)',
    metaTitle: 'JustGST Pricing Plans — Affordable Billing Software for India',
    description: 'Transparent and affordable GST billing software pricing. Starts with a full-feature free trial, followed by simple monthly and annual subscription tiers.',
    canonical: `${BASE_URL}/pricing/`,
    h1: 'Transparent, Simple Pricing for Growing Businesses',
    subtitle: 'No hidden setup fees, no per-invoice commissions. Choose the plan that fits your business scale with a free trial.',
    badge: 'Simple Pricing',
    keywords: ['JustGST pricing', 'GST billing software cost', 'affordable billing software India', 'invoicing software subscription', 'cheap POS software India'],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Pricing', url: `${BASE_URL}/pricing/` },
    ],
    aeoAnswers: [
      {
        question: 'How much does JustGST cost?',
        answer: 'JustGST offers a free trial with full feature access, followed by flexible subscriptions starting from ₹1,499 per year with unlimited invoicing and stock tracking.',
      },
      {
        question: 'Are there any hidden fees or transaction commissions in JustGST?',
        answer: 'No, JustGST charges zero transaction fees or commissions on your invoices. All payment collections via UPI go 100% directly to your bank account.',
      },
      {
        question: 'Can I cancel or change my plan at any time?',
        answer: 'Yes, you can upgrade, renew, or manage your subscription anytime directly from the workspace subscription dashboard.',
      },
    ],
    features: [
      {
        title: 'Unlimited Invoicing & Clients',
        description: 'Create unlimited GST invoices, estimates, credit notes, and maintain unlimited client profiles.',
      },
      {
        title: 'Full Inventory Control',
        description: 'Complete stock tracking, low inventory notifications, and barcode management included.',
      },
      {
        title: 'UPI QR Codes & Payment Tracking',
        description: 'Dynamic UPI QR codes on all invoices and automated ledger settlement reconciliation.',
      },
      {
        title: 'Multi-Format Printing & Export',
        description: 'A4, A5, 2-inch & 3-inch thermal printing formats plus Excel and PDF data exports.',
      },
    ],
    faqs: [
      {
        question: 'What happens when my free trial ends?',
        answer: 'Your data remains completely safe. You can choose any of the active subscription plans to continue generating invoices seamlessly.',
      },
      {
        question: 'Which payment methods are accepted for JustGST subscriptions?',
        answer: 'We accept all major Indian payment methods via PayU India including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, and Net Banking.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${BASE_URL}/pricing/` },
          ],
        },
      ],
    },
  },

  freeGstCalculator: {
    slug: 'tools/free-gst-calculator',
    title: 'Free Online GST Calculator India (Inclusive & Exclusive) | JustGST',
    metaTitle: 'Free Online GST Calculator India — Calculate 5%, 12%, 18%, 28% GST | JustGST',
    description: 'Calculate GST inclusive and exclusive prices, CGST, SGST, and IGST for all tax slabs (5%, 12%, 18%, 28%, custom %) with our 100% free online GST calculator.',
    canonical: `${BASE_URL}/tools/free-gst-calculator/`,
    h1: 'Online Free GST Calculator India',
    subtitle: 'Instantly calculate GST inclusive and exclusive prices, CGST, SGST, and IGST for any tax slab (5%, 12%, 18%, 28%, or custom %).',
    badge: '100% Free Client-Side Tool',
    keywords: [
      'GST calculator',
      'free GST calculator India',
      'online GST calculation tool',
      'inclusive GST calculator',
      'exclusive GST calculator',
      'CGST SGST IGST calculator',
      'reverse GST calculation formula',
      'calculate GST 18 percent',
    ],
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Free Tools', url: `${BASE_URL}/` },
      { name: 'GST Calculator', url: `${BASE_URL}/tools/free-gst-calculator/` },
    ],
    aeoAnswers: [
      {
        question: 'What is the GST calculation formula in India?',
        answer: 'To add GST (Exclusive): GST Amount = (Base Amount × GST Rate) / 100, Total = Base Amount + GST Amount. To remove GST (Inclusive): Base Amount = Total MRP / (1 + (GST Rate / 100)), GST Amount = Total MRP - Base Amount.',
      },
      {
        question: 'What is the difference between Intra-State and Inter-State GST?',
        answer: 'For intra-state sales (within the same state), GST is split equally into CGST (Central GST) and SGST (State GST). For inter-state sales (between two different states), the full tax is collected as IGST (Integrated GST).',
      },
      {
        question: 'What are the main GST tax slabs in India?',
        answer: 'India has four primary GST slabs: 5% (essentials, packaged foods), 12% (processed goods, computers), 18% (IT/SaaS, standard services, restaurants), and 28% (luxury items, automobiles, air conditioners). Nil (0%) applies to fresh unprocessed foods.',
      },
    ],
    features: [
      {
        title: 'Inclusive & Exclusive Modes',
        description: 'Easily switch between adding GST to a net base price or reverse-extracting GST from a gross MRP amount.',
      },
      {
        title: 'Intra-State & Inter-State Splits',
        description: 'Auto-calculates the 50:50 CGST and SGST split for local sales or full IGST for inter-state supplies.',
      },
      {
        title: 'All GST Slabs & Custom Rates',
        description: 'Instant 1-click toggles for 5%, 12%, 18%, and 28% slabs, plus support for custom fractional tax rates.',
      },
      {
        title: 'One-Click Summary Copy',
        description: 'Copy the full tax breakdown and share it instantly on WhatsApp, email, or client estimates.',
      },
    ],
    faqs: [
      {
        question: 'Is this GST calculator completely free to use?',
        answer: 'Yes! The JustGST online GST calculator is 100% free with unlimited calculations. No registration or credit card is required.',
      },
      {
        question: 'How do I calculate GST on a product inclusive of tax?',
        answer: 'Select "Inclusive (-GST)" mode. The calculator uses the formula: Net Base Amount = Gross Amount / (1 + GST Rate / 100). The GST amount is Gross Amount minus Net Base Amount.',
      },
      {
        question: 'How is CGST and SGST divided?',
        answer: 'For supply of goods and services within the same state (Intra-State), the total GST rate is divided equally between CGST (Central Government) and SGST (State Government). For example, an 18% GST rate equals 9% CGST and 9% SGST.',
      },
      {
        question: 'When should IGST be charged instead of CGST/SGST?',
        answer: 'IGST (Integrated Goods and Services Tax) is charged on all inter-state transactions where the supplier and recipient are located in different Indian states or union territories.',
      },
      {
        question: 'Can I generate full GST invoices with this tool?',
        answer: 'This is a quick calculation tool. To create, print, and share GST-compliant tax invoices with automatic HSN codes and UPI QR codes, sign up for a free 14-day trial of JustGST software.',
      },
    ],
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Free Tools', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 3, name: 'GST Calculator', item: `${BASE_URL}/tools/free-gst-calculator/` },
          ],
        },
        {
          '@type': 'WebApplication',
          name: 'JustGST Free Online GST Calculator',
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'INR',
          },
        },
      ],
    },
  },
};

import { INDUSTRY_SOLUTIONS, getIndustrySEOConfig } from './industry.config';

export function getSEOConfigForPath(pathname: string): SEORouteConfig {
  const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  
  if (!clean || clean === 'home') {
    return SEO_ROUTES.home;
  }
  if (clean === 'gst-billing-software') {
    return SEO_ROUTES.gstBillingSoftware;
  }
  if (clean === 'inventory-management-software') {
    return SEO_ROUTES.inventoryManagementSoftware;
  }
  if (clean === 'billing-software-for-retail') {
    return SEO_ROUTES.retailBillingSoftware;
  }
  if (
    clean === 'tools/free-gst-calculator' ||
    clean === 'free-gst-calculator' ||
    clean === 'tools/gst-calculator' ||
    clean === 'gst-calculator'
  ) {
    return SEO_ROUTES.freeGstCalculator;
  }

  // Check 12 industry solutions dynamically
  for (const industry of Object.values(INDUSTRY_SOLUTIONS)) {
    if (
      clean === industry.slug ||
      clean === `industries/${industry.id}` ||
      clean === `billing-software-for-${industry.id}` ||
      (clean.startsWith('billing-software-for-') && clean.includes(industry.id.toLowerCase()))
    ) {
      return getIndustrySEOConfig(industry);
    }
  }

  if (clean === 'billing-software-for-wholesale') {
    return SEO_ROUTES.wholesaleBillingSoftware;
  }
  if (
    clean === 'compare/justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook' ||
    clean === 'justgst-vs-gogst-vs-vyapar-vs-swipe-vs-mybillbook' ||
    clean.includes('gogst') ||
    clean.includes('swipe') ||
    clean.includes('mybillbook')
  ) {
    return SEO_ROUTES.compareMulti;
  }
  if (clean === 'compare/justgst-vs-vyapar' || clean === 'justgst-vs-vyapar' || clean.includes('vyapar')) {
    return SEO_ROUTES.compareVyapar;
  }
  if (clean === 'pricing') {
    return SEO_ROUTES.pricing;
  }

  return SEO_ROUTES.home;
}
