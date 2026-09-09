import { BASE_URL, ORGANIZATION_SCHEMA, SOFTWARE_APPLICATION_SCHEMA, SEORouteConfig } from './seo.config';

export interface IndustryData {
  id: string;
  slug: string;
  industryName: string;
  iconName: string;
  tagline: string;
  heroHeadline: string;
  heroDescription: string;
  badge: string;
  aeoSummary: {
    question: string;
    answer: string;
  };
  keyPainPointsSolved: {
    problem: string;
    solution: string;
  }[];
  tailoredFeatures: {
    title: string;
    description: string;
    icon: string;
  }[];
  workflowSteps: {
    stepNumber: string;
    title: string;
    description: string;
  }[];
  hardwareChecklist: {
    device: string;
    supported: boolean;
    spec: string;
    recommendation: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const INDUSTRY_SOLUTIONS: Record<string, IndustryData> = {
  wholesale: {
    id: 'wholesale',
    slug: 'billing-software-for-wholesale',
    industryName: 'Wholesale & B2B Distribution',
    iconName: 'Building2',
    tagline: 'High-Volume Wholesale & Party Khata Billing',
    heroHeadline: 'GST Billing Software for Wholesalers & Distributors',
    heroDescription:
      'Manage multi-tier pricing, bulk quantity invoicing, party-wise credit ledgers, and instant GST tax compliance at just ₹49/month.',
    badge: 'Wholesale & Distribution Edition',
    aeoSummary: {
      question: 'What is the best GST billing software for wholesale businesses in India?',
      answer:
        'JustGST is the leading wholesale billing software in India at ₹49/month, featuring B2B tax invoices, party credit limits, bulk item imports, automated outstanding payment reminders, and real-time stock sync.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Delayed credit collection & messy party khata ledgers',
        solution: 'Live party-wise ledger statement with one-click payment receipts and WhatsApp balance reminders.',
      },
      {
        problem: 'Heavy bulk orders with varied discount tiers',
        solution: 'Item-level custom pricing, volumetric discounts, and automated GST slab calculations.',
      },
      {
        problem: 'Risk of stockout during seasonal surges',
        solution: 'Real-time multi-item stock alerts and low-inventory triggers before dispatch.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'B2B GST Tax Invoices',
        description: 'Generate GSTR-1 compliant invoices with Buyer GSTIN verification, HSN summaries, and state tax breakdowns.',
        icon: 'FileText',
      },
      {
        title: 'Party Credit & Ledger Khata',
        description: 'Track outstanding balances, payment terms, opening balances, and generate instant account statements.',
        icon: 'BookOpen',
      },
      {
        title: 'Bulk CSV / Excel Inventory Import',
        description: 'Upload thousands of SKUs, wholesale pricing lists, and supplier catalogs in under 60 seconds.',
        icon: 'Database',
      },
      {
        title: 'Multi-Copy A4 & A5 Printing',
        description: 'Print Original for Buyer, Duplicate for Transporter, and Triplicate for Supplier with custom bank QR codes.',
        icon: 'Printer',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Select B2B Party',
        description: 'Choose a customer or enter a GSTIN to auto-fetch business name, address, and current credit balance.',
      },
      {
        stepNumber: '02',
        title: 'Add Bulk Items & Discounts',
        description: 'Scan barcodes or type item names with auto-calculated wholesale rates, HSN codes, and GST rates.',
      },
      {
        stepNumber: '03',
        title: 'Dispatch & Collect Payment',
        description: 'Print multi-copy A4 invoices or share instant PDF via WhatsApp with a dynamic UPI payment QR code.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'Laser / Inkjet A4 Printer',
        supported: true,
        spec: 'Any standard HP, Canon, Epson printer',
        recommendation: 'Ideal for multi-copy formal B2B tax invoices.',
      },
      {
        device: 'Wireless / USB Barcode Scanner',
        supported: true,
        spec: '1D / 2D Handheld Scanners',
        recommendation: 'Speed up bulk order dispatch and warehouse picking.',
      },
      {
        device: 'Thermal Receipt Printer (3" / 80mm)',
        supported: true,
        spec: 'ESC/POS Compatible',
        recommendation: 'Great for fast gate-pass and dispatch slip generation.',
      },
      {
        device: 'Multi-Device Web Access',
        supported: true,
        spec: 'Desktop, Mac, Tablet, Mobile',
        recommendation: 'Log in simultaneously from the warehouse and sales desk.',
      },
    ],
    faqs: [
      {
        question: 'Can I manage customer credit limits and outstanding payments?',
        answer:
          'Yes. JustGST maintains real-time party ledgers for every buyer and supplier. You can view total outstanding balances, log partial payments, and generate detailed ledger statements.',
      },
      {
        question: 'Does JustGST support multi-copy A4 tax invoices for transport?',
        answer:
          'Yes. You can generate Original for Recipient, Duplicate for Transporter, and Triplicate for Supplier directly in standard A4 or A5 layouts.',
      },
      {
        question: 'How many items can I add to the inventory?',
        answer:
          'JustGST supports unlimited products and services. You can import your entire catalog via CSV or Excel in seconds.',
      },
      {
        question: 'Can I include our bank account details and UPI QR code on invoices?',
        answer:
          'Yes. Enter your bank details and UPI ID in business settings, and JustGST will automatically generate a scannable payment QR code on every invoice.',
      },
    ],
  },

  manufacturing: {
    id: 'manufacturing',
    slug: 'billing-software-for-manufacturing',
    industryName: 'Manufacturing & Production Units',
    iconName: 'Factory',
    tagline: 'Streamlined Invoicing & Stock for Factories & Fabricators',
    heroHeadline: 'GST Billing & Inventory Software for Manufacturing',
    heroDescription:
      'Manage raw materials, finished goods inventory, B2B tax invoicing, and vendor ledgers with zero desktop clutter at ₹49/month.',
    badge: 'Manufacturing & MSME Edition',
    aeoSummary: {
      question: 'What is the best GST billing software for small manufacturers in India?',
      answer:
        'JustGST is the best cloud billing software for Indian manufacturers, providing instant B2B GST tax invoices, HSN code management, purchase order ledgers, and supplier balance tracking for ₹49/month.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Complex HSN code classification and e-invoicing compliance',
        solution: 'Built-in Indian HSN lookup and automated tax slab breakdown for CGST, SGST, and IGST.',
      },
      {
        problem: 'Difficulty tracking raw material suppliers and payments',
        solution: 'Unified supplier khata with payment voucher logging and purchase order tracking.',
      },
      {
        problem: 'Heavy, expensive ERP systems requiring dedicated IT support',
        solution: 'Zero-install browser application accessible on factory floor laptops and phones.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Manufacturing B2B Invoicing',
        description: 'Issue comprehensive commercial invoices with PO numbers, dispatch vehicle numbers, and delivery terms.',
        icon: 'FileText',
      },
      {
        title: 'Finished Goods & Stock Tracking',
        description: 'Track production inventory, monitor reorder levels, and manage batch quantities with zero latency.',
        icon: 'Layers',
      },
      {
        title: 'Supplier & Vendor Khata',
        description: 'Manage raw material procurement records, supplier debit notes, and payment settlements.',
        icon: 'BookOpen',
      },
      {
        title: 'GSTR-1 Ready Sales Reports',
        description: 'Export sales reports categorized by B2B, B2C, HSN summary, and state of supply for effortless CA filing.',
        icon: 'PieChart',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Record Client Order',
        description: 'Select customer, input Purchase Order (PO) reference number, and set delivery terms.',
      },
      {
        stepNumber: '02',
        title: 'Add Finished Products',
        description: 'Enter manufactured items with unit specifications (KGS, PCS, MTR, NOS) and applicable GST rates.',
      },
      {
        stepNumber: '03',
        title: 'Print & Ship Goods',
        description: 'Generate A4 tax invoices with transporter details and dynamic UPI QR code for fast bank transfers.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'Office A4 / A5 Laser Printer',
        supported: true,
        spec: 'Duplex Laser / Inkjet',
        recommendation: 'Standard for multi-page commercial manufacturing invoices.',
      },
      {
        device: 'Barcode Scanner for Raw Goods',
        supported: true,
        spec: 'USB / Bluetooth 2D Scanner',
        recommendation: 'Track incoming raw materials and finished assembly crates.',
      },
      {
        device: 'Factory Floor Tablet / PC',
        supported: true,
        spec: 'Any Browser-Enabled Device',
        recommendation: 'Create invoices on the production floor without bulky servers.',
      },
      {
        device: 'Digital Weighing Scale Integration',
        supported: true,
        spec: 'Manual / Unit-Based Input',
        recommendation: 'Enter exact fractional weights (e.g., 14.75 Kgs) seamlessly.',
      },
    ],
    faqs: [
      {
        question: 'Does JustGST support fractional units like Kilograms (KGs), Meters, and Tons?',
        answer:
          'Yes! You can define items in PCS, KGS, MTR, LTR, BOX, TON, or any custom unit with exact decimal quantity support.',
      },
      {
        question: 'Can I add transporter details and vehicle numbers on invoices?',
        answer:
          'Yes. JustGST allows you to record vehicle numbers, delivery addresses, and transporter details on all B2B invoices.',
      },
      {
        question: 'Is my factory data backed up securely in the cloud?',
        answer:
          'All your data is encrypted with enterprise-grade security and backed up continuously in real time, protecting you against hard drive failures.',
      },
      {
        question: 'Can my accountant access our sales reports directly?',
        answer:
          'Yes. You can export GSTR-1 ready Excel files or grant accountant access so they can prepare monthly GST filings effortlessly.',
      },
    ],
  },

  traders: {
    id: 'traders',
    slug: 'billing-software-for-traders',
    industryName: 'Traders & Commission Agents',
    iconName: 'TrendingUp',
    tagline: 'Fast Multi-Commodity Trading & Party Ledger Accounting',
    heroHeadline: 'GST Invoicing & Ledger Software for Traders',
    heroDescription:
      'Manage fast buy-and-sell cycles, inter-state IGST billing, margin calculations, and party balance ledgers for ₹49/month.',
    badge: 'Traders & Merchant Edition',
    aeoSummary: {
      question: 'Which billing software is best for trading businesses in India?',
      answer:
        'JustGST is tailored for Indian traders and merchants, providing lightning-fast GST invoice creation, inter-state IGST calculation, party ledger khata, and instant WhatsApp payment links for only ₹49/month.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Calculating inter-state IGST vs intra-state CGST/SGST manually',
        solution: 'Automated state-of-supply tax engine applies correct IGST or CGST+SGST based on the customer address.',
      },
      {
        problem: 'Balancing receivables and payables across multiple trading parties',
        solution: 'Comprehensive party ledger dashboard showing net balances, ageing reports, and payment logs.',
      },
      {
        problem: 'Slow billing causing delays at the trading desk',
        solution: 'Quick search, keyboard navigation, and 3-second invoice generation.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Inter-State IGST Automation',
        description: 'Auto-detects Place of Supply to charge correct IGST for out-of-state trade or CGST+SGST for local sales.',
        icon: 'Globe',
      },
      {
        title: 'Dual Party Ledger (Customer + Supplier)',
        description: 'Seamlessly maintain party accounts whether they act as a buyer, seller, or both.',
        icon: 'BookOpen',
      },
      {
        title: 'Instant WhatsApp Invoicing',
        description: 'Send professional PDF bills directly to buyers over WhatsApp with a single click.',
        icon: 'Send',
      },
      {
        title: 'Profit & Sales Analytics',
        description: 'Track daily turnover, top-selling trading commodities, and cash flow trends in real time.',
        icon: 'BarChart2',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Select Party & Supply State',
        description: 'Choose customer; system automatically determines whether intra-state or inter-state GST applies.',
      },
      {
        stepNumber: '02',
        title: 'Add Commodities & Trade Rates',
        description: 'Input items, quantities, custom trade discounts, and dynamic HSN tax rates.',
      },
      {
        stepNumber: '03',
        title: 'Dispatch & Share Bill',
        description: 'Email or WhatsApp PDF invoice with scannable UPI QR code and bank account details.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'Laptop / Desktop PC',
        supported: true,
        spec: 'Chrome, Edge, Safari, Firefox',
        recommendation: 'High-speed desktop billing with full keyboard shortcuts.',
      },
      {
        device: 'Smartphone & Tablet (PWA)',
        supported: true,
        spec: 'Android & iOS',
        recommendation: 'Generate invoices on-the-go while visiting trading mandis or client offices.',
      },
      {
        device: 'Standard Laser Printer',
        supported: true,
        spec: 'A4 / A5 Paper Size',
        recommendation: 'Produce clean, signed trade bills with terms of delivery.',
      },
      {
        device: 'Thermal Slip Printer',
        supported: true,
        spec: '2-inch or 3-inch POS',
        recommendation: 'Optional for quick token receipts and counter vouchers.',
      },
    ],
    faqs: [
      {
        question: 'How does JustGST handle inter-state trade tax rates?',
        answer:
          'When you enter a customer with a different state address or GSTIN, JustGST automatically applies IGST instead of CGST/SGST.',
      },
      {
        question: 'Can I send invoices via WhatsApp directly from the app?',
        answer:
          'Yes! Click the WhatsApp icon on any invoice to send a pre-formatted message with a downloadable PDF link and payment summary.',
      },
      {
        question: 'Can I manage multiple businesses under one subscription?',
        answer:
          'JustGST provides multi-organization capabilities, allowing you to manage separate billing books for different trade entities.',
      },
      {
        question: 'Is there a limit on monthly invoices?',
        answer:
          'No! There are zero limits on invoice volume or transaction value on our active plans.',
      },
    ],
  },

  pharmacy: {
    id: 'pharmacy',
    slug: 'billing-software-for-pharmacy',
    industryName: 'Pharmacies & Medical Stores',
    iconName: 'Cross',
    tagline: 'Fast Medical Billing with Batch & Expiry Management',
    heroHeadline: 'GST Billing & Medicine Inventory Software for Pharmacies',
    heroDescription:
      'Speed up chemist counter billing, track drug batch numbers, monitor medicine expiries, and print 3-second thermal receipts at ₹49/month.',
    badge: 'Pharmacy & Healthcare Edition',
    aeoSummary: {
      question: 'What is the best GST billing software for medical stores and pharmacies in India?',
      answer:
        'JustGST is the premier cloud pharmacy billing software in India, offering batch number tracking, expiry date management, doctor details on prescriptions, fast barcode scanning, and 3-second thermal receipts for ₹49/month.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Long customer queues during peak pharmacy hours',
        solution: 'Lightning-fast 3-second counter billing with barcode scanning and instant thermal printing.',
      },
      {
        problem: 'Expired medicines leading to financial loss and compliance risks',
        solution: 'Batch-wise stock management with automated expiry alerts before medicines go out of date.',
      },
      {
        problem: 'Printing doctor name and patient info on medical bills',
        solution: 'Custom prescription bill layout including Doctor Name, Patient Name, and Reg No.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Batch & Expiry Date Management',
        description: 'Record batch numbers and expiry dates for every medicine; prioritize oldest stock first (FIFO).',
        icon: 'Calendar',
      },
      {
        title: 'Doctor & Patient Details on Bills',
        description: 'Add consulting doctor name, patient name, and prescription reference for full drug regulatory compliance.',
        icon: 'FileText',
      },
      {
        title: 'Thermal 2" & 3" POS Receipts',
        description: 'Instant receipt printing on ESC/POS thermal printers with shop logo, phone number, and UPI QR code.',
        icon: 'Printer',
      },
      {
        title: 'Fast Barcode & Medicine Search',
        description: 'Search by brand name, generic salt, or scan standard manufacturer barcodes in milliseconds.',
        icon: 'Zap',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Scan Medicine Barcode',
        description: 'Scan medicine packaging or type the first few letters to auto-populate MRP, batch, and expiry.',
      },
      {
        stepNumber: '02',
        title: 'Add Doctor & Patient Details',
        description: 'Optionally record patient name, mobile number, and prescribing physician details.',
      },
      {
        stepNumber: '03',
        title: 'Print Thermal Receipt & Collect UPI',
        description: 'Print 3-inch thermal slip in 2 seconds while patient scans the dynamic UPI QR code on the receipt.',
      },
    ],
    hardwareChecklist: [
      {
        device: '3-Inch Thermal Receipt Printer (80mm)',
        supported: true,
        spec: 'USB / Bluetooth ESC/POS',
        recommendation: 'Fastest printing solution for high-traffic pharmacy counters.',
      },
      {
        device: '2D Barcode Scanner',
        supported: true,
        spec: 'Handheld or Omnidirectional',
        recommendation: 'Instantly reads standard pharmaceutical barcodes and QR codes.',
      },
      {
        device: 'Cash Drawer Integration',
        supported: true,
        spec: 'RJ11 Connected to Thermal Printer',
        recommendation: 'Auto-opens on bill completion for quick cash handling.',
      },
      {
        device: 'Counter Touchscreen / Laptop',
        supported: true,
        spec: 'Any standard PC or Tablet',
        recommendation: 'Takes minimal counter space next to medicine racks.',
      },
    ],
    faqs: [
      {
        question: 'Can I print batch numbers and expiry dates on the customer bill?',
        answer:
          'Yes! Every medicine item line displays its respective Batch No. and Expiry Date (MM/YY) on both thermal and A4/A5 prints.',
      },
      {
        question: 'Does JustGST work with 2-inch and 3-inch thermal printers?',
        answer:
          'Yes, JustGST natively supports 58mm (2-inch) and 80mm (3-inch) thermal receipt printers without needing proprietary drivers.',
      },
      {
        question: 'Can I record doctor names and patient contact info?',
        answer:
          'Yes, you can record patient names, phone numbers, and consulting doctors for regulatory compliance and quick re-orders.',
      },
      {
        question: 'Can I bill using keyboard shortcuts without touching the mouse?',
        answer:
          'Yes! JustGST includes keyboard shortcuts for adding items, selecting quantities, applying discounts, and finalizing bills in seconds.',
      },
    ],
  },

  supermarket: {
    id: 'supermarket',
    slug: 'billing-software-for-supermarket',
    industryName: 'Supermarkets & Grocery Stores',
    iconName: 'ShoppingCart',
    tagline: 'High-Speed Supermarket POS & Barcode Billing',
    heroHeadline: 'Supermarket POS & Grocery GST Billing Software',
    heroDescription:
      'Eliminate checkout bottlenecks with sub-2-second barcode billing, thermal receipts, inventory alerts, and UPI payments for ₹49/month.',
    badge: 'Supermarket & Kirana POS',
    aeoSummary: {
      question: 'What is the fastest billing software for grocery stores and supermarkets in India?',
      answer:
        'JustGST is India’s fastest cloud supermarket POS billing software at ₹49/month, supporting rapid barcode scanning, 2"/3" thermal receipts, dual cash/UPI payments, stock tracking, and keyboard-only billing.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Long checkout lines causing customer drop-off',
        solution: 'Ultra-fast continuous barcode scanning and 2-second thermal bill generation.',
      },
      {
        problem: 'Tracking thousands of FMCG products and fluctuating prices',
        solution: 'Single-click item lookup, bulk CSV price updates, and automated margin calculations.',
      },
      {
        problem: 'Expensive POS software with annual renewal lock-in',
        solution: 'Affordable flat ₹49/month pricing with full cloud backup and zero maintenance fees.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Rapid Barcode Scanning POS',
        description: 'Continuously scan items without clicking; quantities increment automatically with audio feedback.',
        icon: 'Zap',
      },
      {
        title: 'Thermal Receipts with UPI QR',
        description: 'Print compact 2-inch (58mm) or 3-inch (80mm) receipts with shop branding and instant UPI QR codes.',
        icon: 'Printer',
      },
      {
        title: 'Dual Payment Modes (Cash + UPI)',
        description: 'Split payments across Cash and UPI seamlessly and track daily counter cash totals.',
        icon: 'CreditCard',
      },
      {
        title: 'Real-Time Stock Depletion',
        description: 'Inventory levels reduce automatically on sale with instant low-stock notifications for Kirana staples.',
        icon: 'Package',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Continuous Item Scan',
        description: 'Cashier scans grocery items using handheld scanner; cart updates in real time.',
      },
      {
        stepNumber: '02',
        title: 'Apply Coupon / Discount',
        description: 'Apply percentage or flat rupee discounts with a single keystroke.',
      },
      {
        stepNumber: '03',
        title: 'Print & Collect Payment',
        description: 'Thermal receipt prints automatically while customer scans UPI QR code on the bill.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'Omnidirectional Barcode Scanner',
        supported: true,
        spec: '1D / 2D High-Speed Handsfree Scanner',
        recommendation: 'Best for rapid item pass-through at checkout counters.',
      },
      {
        device: '3-Inch (80mm) Thermal POS Printer',
        supported: true,
        spec: 'High-Speed Auto-Cutter Printer',
        recommendation: 'Instant crisp paper cutting for long grocery item lists.',
      },
      {
        device: 'Electronic Cash Drawer',
        supported: true,
        spec: 'Standard RJ11 Interface',
        recommendation: 'Opens automatically when Cash payment is selected.',
      },
      {
        device: 'Barcode Label Printer',
        supported: true,
        spec: 'Thermal Transfer / Direct Thermal',
        recommendation: 'Generate price tags and barcodes for loose grain packets.',
      },
    ],
    faqs: [
      {
        question: 'Can I use JustGST with my existing barcode scanner and thermal printer?',
        answer:
          'Yes! JustGST works with 100% of standard USB, Bluetooth, and network barcode scanners and ESC/POS thermal printers.',
      },
      {
        question: 'Can multiple cashiers bill at different counters simultaneously?',
        answer:
          'Yes! JustGST is 100% cloud-native, allowing multiple billing counters to operate in real time without data collisions.',
      },
      {
        question: 'How do I handle loose items like sugar, rice, and pulses?',
        answer:
          'You can add non-barcoded items with short names, custom codes, and fractional units (e.g., 0.500 KG or 2.750 KG).',
      },
      {
        question: 'Can I view daily counter cash collection reports at closing time?',
        answer:
          'Yes. JustGST provides daily closing reports summarizing cash collections, UPI payments, gross sales, and total GST collected.',
      },
    ],
  },

  apparel: {
    id: 'apparel',
    slug: 'billing-software-for-apparel',
    industryName: 'Clothing, Apparel & Garment Boutiques',
    iconName: 'Shirt',
    tagline: 'Fashion POS with Size, Color & Barcode Tagging',
    heroHeadline: 'GST Billing & Inventory Software for Garment & Apparel Stores',
    heroDescription:
      'Manage clothing sizes, colors, fabric variants, barcode price tags, and exchange returns with ease for only ₹49/month.',
    badge: 'Garment & Fashion Edition',
    aeoSummary: {
      question: 'What is the best billing software for clothing and garment shops in India?',
      answer:
        'JustGST is the premier apparel billing software in India for ₹49/month, supporting size and color variant tracking, custom barcode price tags, thermal retail receipts, customer loyalty ledgers, and fast product exchanges.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Tracking multiple sizes (S, M, L, XL, XXL) and color variations',
        solution: 'Item variant management linking distinct SKUs and barcodes under a single garment style.',
      },
      {
        problem: 'Managing clothing returns, size exchanges, and credit notes',
        solution: 'Hassle-free return and exchange workflow that automatically adjusts inventory and ledger balance.',
      },
      {
        problem: 'Applying seasonal festival discounts and flat sales',
        solution: 'Item-level or bill-level discount presets with instant margin calculations.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Size & Color Matrix Management',
        description: 'Easily track stock by style, size, color, brand, and gender (Men, Women, Kids).',
        icon: 'Grid',
      },
      {
        title: 'Custom Barcode & Price Tagging',
        description: 'Generate and scan custom barcode labels for unbranded garments and designer wear.',
        icon: 'Tag',
      },
      {
        title: 'Fast Customer Exchange & Credit Notes',
        description: 'Issue instant credit notes or process size swaps at the counter without accounting friction.',
        icon: 'RefreshCw',
      },
      {
        title: 'Customer Phonebook & Purchase History',
        description: 'Capture shopper mobile numbers to view past purchases and send festive discount offers.',
        icon: 'Users',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Scan Garment Tag',
        description: 'Scan the garment price tag to automatically identify brand, size, color, and MRP.',
      },
      {
        stepNumber: '02',
        title: 'Capture Shopper Mobile',
        description: 'Enter customer phone number to attach purchase to their profile for future warranty and exchange.',
      },
      {
        stepNumber: '03',
        title: 'Print Stylish Receipt & Collect UPI',
        description: 'Print clean thermal or A5 receipt with exchange policy and dynamic payment QR code.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'Handheld Barcode Scanner',
        supported: true,
        spec: 'USB / Wireless 1D/2D Laser Scanner',
        recommendation: 'Effortlessly scans clothing swing tags and fabric labels.',
      },
      {
        device: '3-Inch Thermal Receipt Printer',
        supported: true,
        spec: '80mm Thermal Printer',
        recommendation: 'Prints compact boutique receipts with custom exchange terms.',
      },
      {
        device: 'A5 / A4 Slip Printer',
        supported: true,
        spec: 'Inkjet or Laser',
        recommendation: 'Ideal for premium bridal wear and formal designer boutiques.',
      },
      {
        device: 'Barcode Label & Tag Printer',
        supported: true,
        spec: 'TSC / Zebra 2-inch Label Printer',
        recommendation: 'Print adhesive stickers or apparel hanging tags.',
      },
    ],
    faqs: [
      {
        question: 'Can I print my shop exchange and return policy on the bill?',
        answer:
          'Yes! You can add custom footer terms like "No cash refund. Exchanges valid within 7 days with original tag" on every receipt.',
      },
      {
        question: 'How do I handle GST on apparel (5% vs 12% based on price)?',
        answer:
          'JustGST automatically applies the appropriate GST rate based on the item sale price and HSN category.',
      },
      {
        question: 'Can I generate barcode stickers for my unbranded clothing items?',
        answer:
          'Yes, you can create unique SKUs for any style and scan them at checkout with any barcode reader.',
      },
      {
        question: 'Does JustGST work on an iPad or Android tablet at the fashion counter?',
        answer:
          'Yes! JustGST runs smoothly on iPads, Android tablets, MacBooks, and Windows laptops.',
      },
    ],
  },

  hardware: {
    id: 'hardware',
    slug: 'billing-software-for-hardware',
    industryName: 'Hardware, Sanitary & Building Materials',
    iconName: 'Wrench',
    tagline: 'Tough Hardware Billing with Multi-Unit Measurements',
    heroHeadline: 'GST Billing Software for Hardware & Sanitary Stores',
    heroDescription:
      'Manage pipes, fittings, electricals, paints, contractor credit ledgers, and fractional units with ease for ₹49/month.',
    badge: 'Hardware & Sanitary Edition',
    aeoSummary: {
      question: 'What is the best GST billing software for hardware and sanitary stores in India?',
      answer:
        'JustGST is the top billing solution for Indian hardware stores at ₹49/month, supporting fractional unit billing (feet, meters, kgs, pieces), contractor credit khata, brand-wise stock tracking, and instant GST invoices.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Selling items in diverse units (meters, feet, bundles, kgs, pieces)',
        solution: 'Flexible unit conversion and exact decimal quantity input for pipes, wires, and nails.',
      },
      {
        problem: 'Heavy credit given to plumbers, electricians, and contractors',
        solution: 'Contractor ledger tracking with running balances, payment logs, and WhatsApp statements.',
      },
      {
        problem: 'Massive catalog of small fittings and brand variations',
        solution: 'Rapid item search by size, brand, and type (e.g., "CPVC Elbow 1/2 inch").',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Multi-Unit Measurement Billing',
        description: 'Bill accurately in Feet, Meters, Bundles, KGs, SQFT, or Pieces with full decimal support.',
        icon: 'Maximize2',
      },
      {
        title: 'Contractor & Plumber Khata',
        description: 'Track running balances for trusted tradespeople and settle accounts weekly or monthly.',
        icon: 'BookOpen',
      },
      {
        title: 'Brand-Wise Cataloguing',
        description: 'Organize inventory by brands (Astral, Supreme, Finolex, Asian Paints, Godrej) for quick access.',
        icon: 'Layers',
      },
      {
        title: 'Estimate / Quotation to Invoice Conversion',
        description: 'Create material estimates for ongoing construction sites and convert them into final tax invoices with one click.',
        icon: 'FileText',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Select Contractor / Buyer',
        description: 'Choose customer or contractor to check current pending balance and credit terms.',
      },
      {
        stepNumber: '02',
        title: 'Add Fittings & Materials',
        description: 'Select pipes, sanitaryware, or paints with exact length, weight, or quantity.',
      },
      {
        stepNumber: '03',
        title: 'Issue Invoice or Estimate',
        description: 'Print A4/A5 delivery invoice or send estimate on WhatsApp with payment QR code.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'Standard Laser / Inkjet A4 Printer',
        supported: true,
        spec: 'Any standard desktop printer',
        recommendation: 'Best for detailed material bills with extensive item descriptions.',
      },
      {
        device: '3-Inch Thermal Receipt Printer',
        supported: true,
        spec: '80mm POS Thermal Printer',
        recommendation: 'Great for fast small-value hardware and tool purchases.',
      },
      {
        device: 'Wireless Barcode Scanner',
        supported: true,
        spec: 'Long-Range Wireless Scanner',
        recommendation: 'Scan bulky paint tins and pipe bundles directly in the storage shed.',
      },
      {
        device: 'Counter PC or Laptop',
        supported: true,
        spec: 'Any Web Browser',
        recommendation: 'Rugged, reliable cloud billing that never loses data on power cut.',
      },
    ],
    faqs: [
      {
        question: 'Can I bill in fractional measurements like 12.5 meters or 3.75 Kgs?',
        answer:
          'Yes! JustGST fully supports decimal quantities up to 3 decimal places for accurate hardware billing.',
      },
      {
        question: 'How do I track pending payments from building contractors?',
        answer:
          'Open the Client Ledger tab to see the contractor’s running balance, payment history, and generate an account summary PDF.',
      },
      {
        question: 'Can I create quotation estimates before creating a final tax invoice?',
        answer:
          'Yes! You can create estimates/quotations for clients and convert them to formal tax invoices upon project approval.',
      },
      {
        question: 'Can I print our bank details and UPI QR code on the invoice?',
        answer:
          'Yes, JustGST prints your bank account number, IFSC code, and dynamic UPI QR code on every A4 and thermal bill.',
      },
    ],
  },

  electronics: {
    id: 'electronics',
    slug: 'billing-software-for-electronics',
    industryName: 'Electronics & Mobile Phone Retailers',
    iconName: 'Smartphone',
    tagline: 'Smart Mobile & Electronics POS with Serial / IMEI Tracking',
    heroHeadline: 'GST Billing Software for Electronics & Mobile Stores',
    heroDescription:
      'Manage serial numbers, IMEI numbers, manufacturer warranties, brand-wise margins, and B2C/B2B tax invoices at ₹49/month.',
    badge: 'Mobile & Electronics Edition',
    aeoSummary: {
      question: 'Which is the best GST billing software for mobile and electronic shops in India?',
      answer:
        'JustGST is the best billing software for Indian electronics and smartphone retailers at ₹49/month, featuring serial/IMEI number tracking on invoices, warranty period management, 18% & 28% GST compliance, and instant UPI payments.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Tracking unique IMEI numbers and product serial numbers for warranty claims',
        solution: 'Attach IMEI/Serial numbers directly to invoice line items for transparent warranty records.',
      },
      {
        problem: 'High GST slabs (18% and 28%) requiring meticulous tax reporting',
        solution: 'Automated GST tax engine with precise tax breakdowns and GSTR-1 ready sales summaries.',
      },
      {
        problem: 'High-ticket items requiring official A4 invoices with brand warranty terms',
        solution: 'Professional A4 invoice templates displaying serial numbers, warranty terms, and store stamp.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Serial & IMEI Number Logging',
        description: 'Record 15-digit IMEI or manufacturer serial numbers directly on customer bills for easy service verification.',
        icon: 'Smartphone',
      },
      {
        title: 'Warranty Period Display',
        description: 'Print warranty duration (e.g., "1 Year Manufacturer Warranty") prominently under each device line item.',
        icon: 'ShieldCheck',
      },
      {
        title: 'Multi-Payment Settlement',
        description: 'Accept split payments across Credit Card, Debit Card, UPI, and Cash on high-value gadgets.',
        icon: 'CreditCard',
      },
      {
        title: 'Comprehensive Sales Analytics',
        description: 'Analyze best-selling smartphone brands, accessory profit margins, and peak shopping hours.',
        icon: 'TrendingUp',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Scan Device Barcode & IMEI',
        description: 'Scan item barcode and enter the device IMEI/Serial number into the item notes.',
      },
      {
        stepNumber: '02',
        title: 'Enter Customer Contact & Warranty',
        description: 'Record buyer name and mobile number to safeguard warranty documentation.',
      },
      {
        stepNumber: '03',
        title: 'Print Official A4 Invoice & Collect Payment',
        description: 'Print professional tax invoice showing IMEI, warranty terms, and dynamic UPI QR code.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'A4 Laser Printer',
        supported: true,
        spec: 'Laser / Ink Tank',
        recommendation: 'Required for customer warranty documentation and formal tax bills.',
      },
      {
        device: '2D Barcode & IMEI Scanner',
        supported: true,
        spec: 'High-Density 2D Scanner',
        recommendation: 'Accurately reads tiny barcodes on mobile phone retail boxes.',
      },
      {
        device: 'Thermal Receipt Printer',
        supported: true,
        spec: '80mm Thermal Printer',
        recommendation: 'Perfect for fast billing of tempered glass, chargers, and phone covers.',
      },
      {
        device: 'Credit / Debit Card EDC Terminal',
        supported: true,
        spec: 'Standalone POS Machine',
        recommendation: 'Record card payment reference numbers directly in the bill.',
      },
    ],
    faqs: [
      {
        question: 'Can I print IMEI numbers on the customer invoice for warranty validation?',
        answer:
          'Yes! You can add IMEI numbers or serial numbers to each item description, and they will be clearly printed on the invoice.',
      },
      {
        question: 'How does JustGST handle 18% and 28% GST rates on electronics?',
        answer:
          'JustGST allows you to assign specific GST slabs (0%, 5%, 12%, 18%, 28%) to each electronic item with automatic tax computation.',
      },
      {
        question: 'Can customers retrieve their invoice if they lose their paper bill?',
        answer:
          'Yes! Search by customer name or phone number in JustGST to retrieve and re-send the invoice PDF via WhatsApp in seconds.',
      },
      {
        question: 'Does JustGST support accessory billing with thermal receipts?',
        answer:
          'Yes! You can switch between A4 format for smartphones/laptops and thermal receipts for accessories in one click.',
      },
    ],
  },

  autoParts: {
    id: 'autoParts',
    slug: 'billing-software-for-auto-parts',
    industryName: 'Automobile Spare Parts & Workshops',
    iconName: 'Car',
    tagline: 'Auto Spare Parts Billing with Part Numbers & Vehicle Numbers',
    heroHeadline: 'GST Billing & Inventory Software for Auto Parts & Garages',
    heroDescription:
      'Manage OEM part numbers, vehicle registration numbers, mechanic labor charges, and spare parts inventory at ₹49/month.',
    badge: 'Automobile & Garage Edition',
    aeoSummary: {
      question: 'What is the best GST billing software for auto spare parts shops and garages in India?',
      answer:
        'JustGST is the leading billing software for Indian auto parts retailers and repair garages at ₹49/month, supporting OEM part number lookup, vehicle registration recording, combined parts and labor billing, and mechanic ledgers.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Searching through thousands of complex OEM part numbers',
        solution: 'Instant part number search with compatibility tags (e.g., "Maruti Swift Brake Pad").',
      },
      {
        problem: 'Combining spare parts (goods) and mechanic labor charges (services) on one bill',
        solution: 'Mixed invoice support applying respective HSN codes for parts and SAC codes for service labor.',
      },
      {
        problem: 'Managing commissions and credits for local garage mechanics',
        solution: 'Dedicated mechanic ledger tracking referrals, running commissions, and settlements.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'OEM Part Number Lookup',
        description: 'Search items by brand part number, generic name, or vehicle model in real time.',
        icon: 'Search',
      },
      {
        title: 'Combined Goods & Labor Billing',
        description: 'Bill spare parts at 18%/28% GST alongside mechanical service labor at 18% on a single invoice.',
        icon: 'Wrench',
      },
      {
        title: 'Vehicle Registration Tracking',
        description: 'Record vehicle registration number, chassis number, and odometer reading on job bills.',
        icon: 'Car',
      },
      {
        title: 'Mechanic & Garage Referral Khata',
        description: 'Track outstanding balances and commission accounts for affiliated neighborhood mechanics.',
        icon: 'BookOpen',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Enter Vehicle Number & Customer',
        description: 'Input customer details and vehicle number (e.g., MH 02 AB 1234) for service history.',
      },
      {
        stepNumber: '02',
        title: 'Add Spare Parts & Labor',
        description: 'Select required OEM spare parts and add labor service charges with appropriate HSN/SAC codes.',
      },
      {
        stepNumber: '03',
        title: 'Print Itemized Job Card & Collect Payment',
        description: 'Print clear, itemized A4/A5 invoice or thermal receipt with UPI payment QR code.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'A4 / A5 Laser or Ink Tank Printer',
        supported: true,
        spec: 'Standard Office Printer',
        recommendation: 'Best for detailed job cards and spare parts breakdown bills.',
      },
      {
        device: 'Thermal Receipt Printer (3" / 80mm)',
        supported: true,
        spec: 'ESC/POS Thermal Printer',
        recommendation: 'Speedy counter billing for quick over-the-counter spare part sales.',
      },
      {
        device: '1D / 2D Barcode Scanner',
        supported: true,
        spec: 'USB / Bluetooth Handheld',
        recommendation: 'Scan OEM parts boxes and oil container barcodes.',
      },
      {
        device: 'Workshop Tablet or PC',
        supported: true,
        spec: 'Any Web Browser',
        recommendation: 'Manage billing directly from the service bay or front spare parts counter.',
      },
    ],
    faqs: [
      {
        question: 'Can I print vehicle numbers and odometer readings on the bill?',
        answer:
          'Yes! You can record vehicle registration numbers and service notes directly on the customer bill header.',
      },
      {
        question: 'How do I bill both spare parts and labor charges on the same invoice?',
        answer:
          'JustGST supports mixed billing: simply add your spare parts with HSN codes and your labor service lines with SAC codes.',
      },
      {
        question: 'Can I manage credit accounts for local mechanics who buy parts regularly?',
        answer:
          'Yes. Add mechanics to your Client Ledger to record daily part purchases on credit and log balance settlements.',
      },
      {
        question: 'Can I search parts by OEM code rather than the item name?',
        answer:
          'Yes. You can add OEM codes as SKUs and search by either part number or vehicle model.',
      },
    ],
  },

  footwear: {
    id: 'footwear',
    slug: 'billing-software-for-footwear',
    industryName: 'Footwear & Shoe Stores',
    iconName: 'Footprints',
    tagline: 'Shoe Retail POS with Size, Pair & Brand Management',
    heroHeadline: 'GST Billing & Inventory Software for Footwear Stores',
    heroDescription:
      'Manage shoe sizes, pairs, box barcodes, brand margins, seasonal discounts, and thermal receipts at ₹49/month.',
    badge: 'Footwear & Shoes Edition',
    aeoSummary: {
      question: 'What is the best GST billing software for shoe and footwear shops in India?',
      answer:
        'JustGST is the premier footwear billing software in India for ₹49/month, supporting UK/India shoe size matrices, box barcode scanning, fast thermal receipts, customer exchange workflows, and automated GST calculations.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Tracking individual shoe sizes (UK 6, 7, 8, 9, 10, 11) within a style',
        solution: 'Size-wise inventory management that tracks pair counts for every size.',
      },
      {
        problem: 'Customer shoe exchanges for size mismatch',
        solution: 'Quick return and size-swap counter workflow with instant inventory recalibration.',
      },
      {
        problem: 'Managing diverse product categories (Formal, Sports, Casual, Socks, Polish)',
        solution: 'Structured product categorization for quick billing and accurate profit analysis.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Shoe Size Matrix (UK / IND / US)',
        description: 'Track stock by exact shoe size and color under one master model name.',
        icon: 'Grid',
      },
      {
        title: 'Shoe Box Barcode Scanning',
        description: 'Scan standard manufacturer shoe box barcodes for instant 2-second billing.',
        icon: 'Zap',
      },
      {
        title: 'Size Exchange & Return Workflow',
        description: 'Effortlessly process size swaps at the counter without disrupting daily sales totals.',
        icon: 'RefreshCw',
      },
      {
        title: 'Thermal POS Receipts with Exchange Policy',
        description: 'Print compact 2" or 3" thermal receipts with clear return deadlines and payment QR code.',
        icon: 'Printer',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Scan Shoe Box Barcode',
        description: 'Scan barcode on the shoe box to automatically pull size, color, brand, and MRP.',
      },
      {
        stepNumber: '02',
        title: 'Add Accessories (Optional)',
        description: 'Add socks, insoles, or shoe care polish with a single quick-tap shortcut.',
      },
      {
        stepNumber: '03',
        title: 'Print Thermal Receipt & Collect UPI',
        description: 'Print crisp thermal receipt with exchange policy while customer pays via UPI QR.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'Handheld 1D / 2D Barcode Scanner',
        supported: true,
        spec: 'Laser Barcode Scanner',
        recommendation: 'Scans box barcodes quickly from any angle.',
      },
      {
        device: '3-Inch Thermal Receipt Printer (80mm)',
        supported: true,
        spec: 'ESC/POS Auto-Cutter',
        recommendation: 'Standard high-speed receipt printer for shoe store counters.',
      },
      {
        device: 'Barcode Sticker Printer',
        supported: true,
        spec: 'Direct Thermal Tag Printer',
        recommendation: 'Print price tags for locally sourced shoes and sandals.',
      },
      {
        device: 'Touch POS / Laptop',
        supported: true,
        spec: 'Any Browser Device',
        recommendation: 'Clean counter setup with minimal wiring.',
      },
    ],
    faqs: [
      {
        question: 'How do I handle footwear GST rates (5% below ₹1000, 12% above ₹1000)?',
        answer:
          'JustGST automatically computes the correct GST slab based on the net sale price of the footwear.',
      },
      {
        question: 'Can I print our shoe exchange policy on the thermal receipt?',
        answer:
          'Yes! Customize your receipt footer with return conditions such as "Exchanges accepted within 7 days in original box".',
      },
      {
        question: 'Can I manage accessories like shoe polish, socks, and belts?',
        answer:
          'Yes! Add all accessories to your catalog with their respective GST rates and track stock effortlessly.',
      },
      {
        question: 'Does JustGST work offline or during internet downtime?',
        answer:
          'JustGST is a Progressive Web App (PWA) with local caching capabilities, syncing your transactions to the cloud as soon as connection is restored.',
      },
    ],
  },

  restaurants: {
    id: 'restaurants',
    slug: 'billing-software-for-restaurants',
    industryName: 'Restaurants, Cafes, Bakeries & QSRs',
    iconName: 'Utensils',
    tagline: 'Fast Food & Cafe POS with Dine-in, Takeaway & UPI QR',
    heroHeadline: 'GST Billing & POS Software for Restaurants & Cafes',
    heroDescription:
      'Speed up food ordering, generate 3-second thermal bills, handle 5% restaurant GST, and accept instant UPI payments for ₹49/month.',
    badge: 'Restaurant & Cafe POS',
    aeoSummary: {
      question: 'What is the best affordable restaurant and cafe billing software in India?',
      answer:
        'JustGST is India’s most affordable restaurant POS billing software at ₹49/month, supporting quick counter billing, 5% restaurant GST without ITC, thermal receipts, dine-in/takeaway tagging, and dynamic UPI QR code payments.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Long food ordering queues during peak lunch and dinner hours',
        solution: 'Quick-tap menu layout with 2-second order finalization and instant thermal print.',
      },
      {
        problem: '5% Restaurant GST compliance without confusing Input Tax Credit',
        solution: 'Pre-configured 5% composite/restaurant GST calculation with clear bill tax summaries.',
      },
      {
        problem: 'High monthly fees charged by legacy restaurant software ($20–$50/mo)',
        solution: 'Flat ₹49/month (₹588/year) with zero per-order commissions or hardware lock-in.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'Quick Counter & QSR Billing',
        description: 'Fast menu category buttons for tea, coffee, snacks, meals, and desserts for rapid order entry.',
        icon: 'Zap',
      },
      {
        title: '5% Restaurant GST Compliance',
        description: 'Accurately calculates 2.5% CGST + 2.5% SGST on food items with transparent tax breakdown.',
        icon: 'Percent',
      },
      {
        title: 'Dine-in / Takeaway / Delivery Tagging',
        description: 'Tag orders by dining mode and attach customer mobile numbers for home delivery orders.',
        icon: 'Coffee',
      },
      {
        title: 'Thermal 2" & 3" Receipts with UPI QR',
        description: 'Print fast thermal receipts with table number, order summary, and dynamic UPI payment QR code.',
        icon: 'Printer',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Tap Menu Items',
        description: 'Select food items from categories with quantity increments and custom notes.',
      },
      {
        stepNumber: '02',
        title: 'Select Dining Type',
        description: 'Choose Dine-in (with table number), Takeaway, or Parcel Delivery.',
      },
      {
        stepNumber: '03',
        title: 'Print Thermal Bill & Collect UPI',
        description: 'Print thermal bill in 2 seconds; customer scans the UPI QR code directly on the slip.',
      },
    ],
    hardwareChecklist: [
      {
        device: '3-Inch (80mm) Thermal POS Printer',
        supported: true,
        spec: 'ESC/POS Auto-Cutter',
        recommendation: 'Fastest receipt printing for busy restaurant cashier counters.',
      },
      {
        device: '2-Inch (58mm) Bluetooth Printer',
        supported: true,
        spec: 'Portable Wireless Thermal Printer',
        recommendation: 'Compact, battery-operated option for food trucks and small tea cafes.',
      },
      {
        device: 'Touchscreen Tablet / Counter Laptop',
        supported: true,
        spec: 'Any Web Browser',
        recommendation: 'Space-saving counter setup with intuitive touch interface.',
      },
      {
        device: 'Electronic Cash Drawer',
        supported: true,
        spec: 'Standard RJ11 Interface',
        recommendation: 'Auto-opens on cash settlement for fast change return.',
      },
    ],
    faqs: [
      {
        question: 'Does JustGST support 5% GST on restaurant food bills?',
        answer:
          'Yes! JustGST is pre-configured to apply 5% GST (2.5% CGST + 2.5% SGST) on restaurant food items.',
      },
      {
        question: 'Can I print table numbers and token numbers on the receipt?',
        answer:
          'Yes, you can record table numbers, token numbers, or delivery notes on every receipt.',
      },
      {
        question: 'Can customers pay by scanning a UPI QR code printed on the bill?',
        answer:
          'Yes! JustGST prints a dynamic UPI payment QR code directly on thermal receipts for contact-free payments.',
      },
      {
        question: 'Can I use JustGST on an Android tablet or iPad at my cafe counter?',
        answer:
          'Yes! JustGST runs smoothly on any touch device with a browser, including iPads and Android tablets.',
      },
    ],
  },

  services: {
    id: 'services',
    slug: 'billing-software-for-services',
    industryName: 'Service Providers, Consultants & Freelancers',
    iconName: 'Briefcase',
    tagline: 'Professional Service Invoicing with SAC Codes & Time Billing',
    heroHeadline: 'GST Invoicing Software for Service Providers & Agencies',
    heroDescription:
      'Create polished B2B service invoices with SAC codes, milestone payments, TDS deductions, and instant payment links at ₹49/month.',
    badge: 'Service & Freelance Edition',
    aeoSummary: {
      question: 'What is the best GST invoicing software for service businesses and freelancers in India?',
      answer:
        'JustGST is the best cloud invoicing software for Indian service providers, consultants, and IT agencies at ₹49/month, offering SAC code lookups, professional A4 PDF invoices, milestone tracking, client ledgers, and dynamic payment links.',
    },
    keyPainPointsSolved: [
      {
        problem: 'Navigating 18% GST with SAC codes (Services Accounting Code)',
        solution: 'Built-in SAC code catalog for consulting, IT, marketing, legal, and maintenance services.',
      },
      {
        problem: 'Tracking milestone payments, retainer fees, and partial client advances',
        solution: 'Client ledger with partial payment logging, advance adjustments, and balance statements.',
      },
      {
        problem: 'Unprofessional invoice templates causing delayed client payments',
        solution: 'Executive-grade A4 PDF invoices featuring your logo, signature, bank IFSC, and UPI QR code.',
      },
    ],
    tailoredFeatures: [
      {
        title: 'SAC Code Library & 18% GST',
        description: 'Auto-assign correct SAC codes for IT, creative, legal, consultancy, and repair services.',
        icon: 'FileCode',
      },
      {
        title: 'Executive A4 PDF Invoices',
        description: 'Generate elegant, branded PDF bills with company logo, authorized signature, and bank details.',
        icon: 'FileText',
      },
      {
        title: 'Retainer & Milestone Tracking',
        description: 'Log advance payments, milestone disbursements, and send recurring monthly service retainers.',
        icon: 'Clock',
      },
      {
        title: 'One-Click WhatsApp & Email Invoicing',
        description: 'Send invoices directly to corporate clients with payment links and automated reminders.',
        icon: 'Send',
      },
    ],
    workflowSteps: [
      {
        stepNumber: '01',
        title: 'Select Corporate Client',
        description: 'Choose corporate client or enter their GSTIN to auto-fill billing address and Place of Supply.',
      },
      {
        stepNumber: '02',
        title: 'Add Services & SAC Codes',
        description: 'Enter service scope (e.g., "Web Development Retainer"), SAC code 998314, and agreed fees.',
      },
      {
        stepNumber: '03',
        title: 'Send PDF Invoice & Collect Online',
        description: 'Download executive A4 PDF or email client with integrated bank transfer details and UPI QR code.',
      },
    ],
    hardwareChecklist: [
      {
        device: 'Laptop / Desktop PC',
        supported: true,
        spec: 'Any Modern Browser',
        recommendation: 'Create and email professional invoices in under 60 seconds.',
      },
      {
        device: 'Smartphone & Tablet (PWA)',
        supported: true,
        spec: 'iOS & Android',
        recommendation: 'Bill clients instantly while at client meetings or on the road.',
      },
      {
        device: 'Color / Monochrome Laser Printer',
        supported: true,
        spec: 'A4 Paper',
        recommendation: 'Print signed physical copies for corporate accounting departments.',
      },
      {
        device: 'Digital Signature Support',
        supported: true,
        spec: 'Upload PNG / Signature Stamp',
        recommendation: 'Embed authorized signatory stamp directly on generated PDFs.',
      },
    ],
    faqs: [
      {
        question: 'Does JustGST support SAC (Services Accounting Code) for service invoices?',
        answer:
          'Yes! You can assign 6-digit SAC codes (e.g., 9983 for IT, 9982 for Legal) to every service item.',
      },
      {
        question: 'Can I add our company bank account, IFSC, and UPI ID on the invoice?',
        answer:
          'Yes! Your bank account name, account number, IFSC code, branch, and UPI ID are prominently displayed on all PDF invoices.',
      },
      {
        question: 'Can I record partial advance payments against a project invoice?',
        answer:
          'Yes! You can record advance payments and the invoice will reflect the received amount and remaining balance due.',
      },
      {
        question: 'How do I handle inter-state service billing (IGST)?',
        answer:
          'If your client is located in another Indian state, JustGST automatically applies 18% IGST instead of CGST+SGST.',
      },
    ],
  },
};

/**
 * Helper to convert IndustryData into SEORouteConfig
 */
export function getIndustrySEOConfig(data: IndustryData): SEORouteConfig {
  const canonical = `${BASE_URL}/${data.slug}/`;
  return {
    slug: data.slug,
    title: `GST Billing Software for ${data.industryName} | JustGST`,
    metaTitle: `GST Billing Software for ${data.industryName} | JustGST`,
    description: data.heroDescription.length > 158 ? data.heroDescription.substring(0, 155) + '...' : data.heroDescription,
    canonical,
    h1: data.heroHeadline,
    subtitle: data.heroDescription,
    badge: data.badge,
    keywords: [
      `billing software for ${data.industryName.toLowerCase()}`,
      `GST billing software for ${data.id}`,
      `invoicing app for ${data.industryName.toLowerCase()}`,
      `best billing software India ${data.id}`,
      `JustGST ${data.id}`,
      'cloud billing software India',
      'affordable billing software ₹49',
    ],
    aeoAnswers: [
      {
        question: data.aeoSummary.question,
        answer: data.aeoSummary.answer,
      },
      ...data.faqs.slice(0, 2).map((f) => ({
        question: f.question,
        answer: f.answer,
      })),
    ],
    features: data.tailoredFeatures.map((f) => ({
      title: f.title,
      description: f.description,
      iconName: f.icon,
    })),
    breadcrumbs: [
      { name: 'Home', url: `${BASE_URL}/` },
      { name: 'Industries', url: `${BASE_URL}/#industries` },
      { name: data.industryName, url: canonical },
    ],
    faqs: data.faqs,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ORGANIZATION_SCHEMA,
        SOFTWARE_APPLICATION_SCHEMA,
        {
          '@type': 'WebPage',
          '@id': canonical,
          url: canonical,
          name: `GST Billing Software for ${data.industryName} | JustGST`,
          description: data.heroDescription,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Industries', item: `${BASE_URL}/#industries` },
            { '@type': 'ListItem', position: 3, name: data.industryName, item: canonical },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: data.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    },
  };
}
