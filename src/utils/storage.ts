import {
  Client,
  CompanyProfile,
  GatewayConfig,
  Invoice,
  InvoiceCopyType,
  InvoiceType,
  MasterDevOpsConfig,
  PaymentLedgerEntry,
  Product,
  StockMovement,
  SubscriptionPlan,
  SubscriptionState,
  TenantOrganization,
  UserSubscription,
} from '../types';
import { ApiService } from './apiService';

const STORAGE_KEYS = {
  COMPANY: 'kannaku_company_profile',
  CLIENTS: 'kannaku_clients',
  PRODUCTS: 'kannaku_products',
  INVOICES: 'kannaku_invoices',
  PAYMENTS: 'kannaku_payments',
  STOCK_LOGS: 'kannaku_stock_logs',
  SUBSCRIPTION: 'kannaku_subscription_state',
  GATEWAY_CONFIG: 'kannaku_gateway_config',
  TENANTS: 'kannaku_saas_tenants',
  ACTIVE_TENANT_ID: 'kannaku_active_tenant_id',
  DEVOPS_CONFIG: 'kannaku_master_devops_config',
};

export const DEFAULT_DEVOPS_CONFIG: MasterDevOpsConfig = {
  supabaseMasterUrl: 'https://yqpzbdwqlfopxjhktm.supabase.co',
  supabaseMasterAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcHpiZHdxbGZvcHhqaGt0bSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI0NTgwMDAwLCJleHAiOjIwNDAxNTYwMDB9.EXAMPLE_ANON_KEY',
  supabaseServiceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxcHpiZHdxbGZvcHhqaGt0bSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MjQ1ODAwMDAsImV4cCI6MjA0MDE1NjAwMH0.EXAMPLE_SERVICE_ROLE_KEY',
  databasePoolerUrl: 'postgresql://postgres.yqpzbdwqlfopxjhktm:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  isSupabaseConnected: true,
  schemaVersion: 'v4.2.0-multitenant-rls',
  lastMigrationDate: '2026-08-25T11:00:00Z',
  
  githubRepoUrl: 'https://github.com/kannaku-saas/kannaku-gst-billing',
  gitBranch: 'main',
  lastCommitSha: '3f81e2b4',
  lastCommitMessage: 'feat(multi-tenant): centralized supabase rls isolation & wa.me invoice links',
  lastCommitDate: '2026-08-25T11:30:00Z',
  webhookStatus: 'ACTIVE',
  
  vercelProjectId: 'prj_kannaku_saas_production',
  vercelProductionDomain: 'kannaku-billing.vercel.app',
  vercelDeploymentStatus: 'READY',
  lastDeployedAt: '2026-08-25T11:42:00Z',
  vercelEnvVars: [
    { key: 'VITE_SUPABASE_URL', value: 'https://yqpzbdwqlfopxjhktm.supabase.co', isSecret: false, target: 'Production & Preview' },
    { key: 'VITE_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', isSecret: true, target: 'Production & Preview' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', isSecret: true, target: 'Production & Backend' },
    { key: 'CASHFREE_APP_ID', value: 'CF_APP_LIVE_998124', isSecret: true, target: 'Production' },
    { key: 'DODO_PAYMENTS_API_KEY', value: 'dodo_live_sec_884129', isSecret: true, target: 'Production' },
  ],
  
  buildCommand: 'npm run build',
  nodeVersion: '20.x (LTS)',
  outputDirectory: 'dist',
  lastBuildDuration: '1.42s',
  bundleStats: {
    js: '382 KB (gzipped: 112 KB)',
    css: '42 KB (gzipped: 8.4 KB)',
    assets: '168 KB',
  },
};

export const DEFAULT_TENANTS: TenantOrganization[] = [
  {
    id: 'tenant_kannaku_hq',
    name: 'Kannaku Infotech & Trade Pvt Ltd',
    slug: 'kannaku-hq',
    adminEmail: 'billing@kannaku.in',
    mobile: '+91 98401 23456',
    registerNumber: '33AABCK1234F1Z9',
    plan: 'Enterprise Pro',
    status: 'ACTIVE',
    dbSize: '14.8 MB',
    totalInvoices: 48,
    totalRevenue: 642500,
    createdOn: '2026-01-15T08:00:00Z',
    customDomain: 'billing.kannakuhq.in',
    supabaseSchema: 'public',
  },
  {
    id: 'tenant_sri_murugan',
    name: 'Sri Murugan Traders & Co',
    slug: 'murugan-traders',
    adminEmail: 'murugan.traders@gmail.com',
    mobile: '+91 98410 98765',
    registerNumber: '33AAACM4589K1Z2',
    plan: 'Annual Business',
    status: 'ACTIVE',
    dbSize: '8.4 MB',
    totalInvoices: 26,
    totalRevenue: 318000,
    createdOn: '2026-03-10T11:20:00Z',
    customDomain: 'accounts.murugantraders.com',
    supabaseSchema: 'tenant_murugan',
  },
  {
    id: 'tenant_chennai_electro',
    name: 'Chennai Electro & Solar Tech',
    slug: 'chennai-electro',
    adminEmail: 'accounts@chennaielectro.in',
    mobile: '+91 97890 12345',
    registerNumber: '33BBPME9823P1ZQ',
    plan: 'Enterprise Pro',
    status: 'ACTIVE',
    dbSize: '19.2 MB',
    totalInvoices: 84,
    totalRevenue: 1240000,
    createdOn: '2026-02-01T09:15:00Z',
    customDomain: 'gst.chennaielectro.in',
    supabaseSchema: 'tenant_electro',
  },
  {
    id: 'tenant_apex_logistics',
    name: 'Apex Logistics & Freight Corp',
    slug: 'apex-logistics',
    adminEmail: 'finance@apexlogistics.in',
    mobile: '+91 98200 55443',
    registerNumber: '27AALCA1209L1Z8',
    plan: 'Free Trial',
    status: 'PENDING_MIGRATION',
    dbSize: '2.1 MB',
    totalInvoices: 7,
    totalRevenue: 78500,
    createdOn: '2026-08-18T14:40:00Z',
    supabaseSchema: 'tenant_apex',
  },
];

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'HYTEX COTTON MILLS',
  address: 'SFNO. 71/1, ST-2, PARAPPU THOTTAM, Muniyandi Vilas Hotel, UTHUKULI TOWN PANCHAYAT, UTHUKULI',
  city: 'Tiruppur',
  state: 'Tamil Nadu',
  pin: '638751',
  code: '33',
  email: 'hytexcottonmills@gmail.com',
  mobile: '8870796169',
  registerNumber: '33ASWPV8266F1ZW',
  panNumber: 'ASWPV8266F',
  billPrefix: 'INV/2026/',
  bankDetail: {
    bankName: 'HDFC Bank Ltd',
    accountNumber: '50200087654321',
    ifscCode: 'HDFC0001234',
    branchName: 'Uthukuli Branch, Tiruppur',
    upiId: 'hytexmills@hdfcbank',
    panNumber: 'ASWPV8266F',
  },
  logoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23E65100"><circle cx="50" cy="50" r="48" fill="%23FFF3E0"/><circle cx="50" cy="36" r="14" fill="%23E65100"/><path d="M26 78 C26 58, 74 58, 74 78 Z" fill="%23E65100"/><circle cx="28" cy="40" r="10" fill="%23FB8C00"/><path d="M12 76 C12 62, 44 62, 44 76 Z" fill="%23FB8C00"/><circle cx="72" cy="40" r="10" fill="%23FB8C00"/><path d="M56 76 C56 62, 88 62, 88 76 Z" fill="%23FB8C00"/></svg>',
  signatureName: 'K. Vasanthi',
  signatureUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 80"><text x="10" y="55" font-family="Caveat, cursive, sans-serif" font-size="44" font-weight="bold" fill="%231a237e" transform="rotate(-3, 150, 40)">K. வசந்தி</text></svg>',
  stampUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><circle cx="80" cy="80" r="74" fill="none" stroke="%231b5e20" stroke-width="4" stroke-dasharray="8 4"/><circle cx="80" cy="80" r="64" fill="none" stroke="%231b5e20" stroke-width="2"/><text x="80" y="48" font-size="12" font-family="sans-serif" font-weight="900" fill="%231b5e20" text-anchor="middle">HYTEX COTTON MILLS</text><text x="80" y="86" font-size="11" font-family="sans-serif" font-weight="bold" fill="%231b5e20" text-anchor="middle">★ TIRUPPUR ★</text><text x="80" y="124" font-size="10" font-family="sans-serif" font-weight="900" fill="%231b5e20" text-anchor="middle">AUTH SIGNATORY</text></svg>',
  invoicePrefixSales: 'INV/2026/',
  invoicePrefixPurchase: 'PUR/2026/',
  invoicePrefixQuotation: 'QUO/2026/',
  colorScheme: 'blue',
  termsAndConditions:
    '1. Goods once sold will not be taken back or exchanged.\n2. Interest @ 18% p.a. will be charged if the bill is not paid within the due date.\n3. Subject to Tiruppur Jurisdiction.',
  jurisdictionCity: 'Tiruppur',
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c_kmk',
    name: 'KMK TEXTILES',
    mobile: '9842145678',
    email: 'kmktextiles@gmail.com',
    address: '14, Cotton Market Ring Road, Avinashi',
    city: 'Tiruppur',
    state: 'Tamil Nadu',
    pin: '641654',
    code: '33',
    registerNumber: '33BACPN9245H1ZN',
    clientType: 'customer',
    balance: 88446,
    createdOn: '2025-11-10T10:00:00Z',
  },
  {
    id: 'c_cgh',
    name: 'Cgh',
    mobile: '9789012345',
    email: 'cgh.traders@gmail.com',
    address: '88, Main Bazaar Street',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    pin: '641001',
    code: '33',
    registerNumber: '33AAAC0000A1Z5',
    clientType: 'customer',
    balance: 0,
    createdOn: '2026-01-05T14:30:00Z',
  },
  {
    id: 'c_sr',
    name: 'SR COTTON',
    mobile: '9443210987',
    email: 'srcotton@yahoo.co.in',
    address: '102, Palladam Road, Rayapuram',
    city: 'Tiruppur',
    state: 'Tamil Nadu',
    pin: '641604',
    code: '33',
    registerNumber: '33BWXPB1896D1ZC',
    clientType: 'customer',
    balance: 142500,
    createdOn: '2025-10-15T11:15:00Z',
  },
  {
    id: 's_1',
    name: 'Apex Raw Yarn & Cotton Hub',
    mobile: '9820011223',
    email: 'dispatch@apexraw.com',
    address: 'Plot 72, Andheri East Industrial Area',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400093',
    code: '27',
    registerNumber: '27AALCA1209L1Z8',
    clientType: 'supplier',
    balance: -45000,
    createdOn: '2026-08-02T09:00:00Z',
  },
  {
    id: 's_2',
    name: 'Venkateshwara Packaging Solutions',
    mobile: '9444012987',
    email: 'info@venkateshwarapack.in',
    address: '22, SIDCO Industrial Estate, Ambattur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pin: '600058',
    code: '33',
    registerNumber: '33AAOFV4411Q1Z4',
    clientType: 'supplier',
    balance: 0,
    createdOn: '2026-08-04T12:00:00Z',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p_1',
    name: 'Industrial Power Inverter 10KVA',
    itemCode: 'INV-10K',
    hsnCode: '85044010',
    unit: 'Nos',
    buyingPrice: 28000,
    sellingPrice: 36000,
    mrp: 42000,
    taxRate: 18,
    currentStock: 14,
    minStockAlert: 3,
    subline1: 'Pure sine wave, Copper transformer',
    createdOn: '2026-08-01T10:00:00Z',
  },
  {
    id: 'p_2',
    name: 'Heavy Duty Copper Cable 4 sq.mm (90m)',
    itemCode: 'CAB-4MM',
    hsnCode: '85441190',
    unit: 'Roll',
    buyingPrice: 2400,
    sellingPrice: 3200,
    mrp: 3800,
    taxRate: 18,
    currentStock: 48,
    minStockAlert: 10,
    subline1: 'FR Grade PVC Insulated',
    createdOn: '2026-08-01T10:00:00Z',
  },
  {
    id: 'p_3',
    name: 'Digital Surge Protector 32A',
    itemCode: 'SPD-32A',
    hsnCode: '85363000',
    unit: 'Nos',
    buyingPrice: 650,
    sellingPrice: 1150,
    mrp: 1400,
    taxRate: 18,
    currentStock: 85,
    minStockAlert: 15,
    subline1: 'DIN rail mountable with indicator LED',
    createdOn: '2026-08-01T10:00:00Z',
  },
  {
    id: 'p_4',
    name: 'Solar Charge Controller 60A MPPT',
    itemCode: 'SCC-60A',
    hsnCode: '85044090',
    unit: 'Nos',
    buyingPrice: 7200,
    sellingPrice: 9800,
    mrp: 11500,
    taxRate: 12,
    currentStock: 6,
    minStockAlert: 5,
    subline1: 'Auto 12V/24V/48V detection with LCD',
    createdOn: '2026-08-01T10:00:00Z',
  },
  {
    id: 'p_5',
    name: 'Industrial Lithium Iron Battery 48V 100Ah',
    itemCode: 'BAT-48100',
    hsnCode: '85076000',
    unit: 'Nos',
    buyingPrice: 62000,
    sellingPrice: 78000,
    mrp: 85000,
    taxRate: 18,
    currentStock: 4,
    minStockAlert: 2,
    subline1: 'LiFePO4 with smart BMS & CAN communication',
    createdOn: '2026-08-01T10:00:00Z',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_101',
    invoiceNumber: 'INV/2026/001',
    date: '2026-08-18',
    dueDate: '2026-09-02',
    terms: '30 Days Credit',
    invoiceType: InvoiceType.SALES,
    invoiceTaxType: 'CGST_SGST',
    eway: '241890123456',
    deliveryNote: 'DN-8901',
    buyersOrderNo: 'PO-SMT-440',
    dispatchDocNo: 'LR-TN-091',
    dispatchedThrough: 'VRL Logistics',
    destination: 'Chennai',
    vehicleNo: 'TN 09 BX 4412',
    description:
      'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
    clientId: 'c_1',
    clientSnapshot: INITIAL_CLIENTS[0],
    items: [
      {
        id: 'it_1',
        name: 'Industrial Power Inverter 10KVA',
        hsnCode: '85044010',
        qty: 1,
        unit: 'Nos',
        baseRate: 36000,
        mrp: 42000,
        inclusiveOrExclusive: 'exclusive',
        isDiscountApplied: true,
        flatOrPercentage: 'percentage',
        discountRate: 5,
        discountAmount: 1800,
        taxPercentage: 18,
        taxAmount: 6156,
        taxDetail: {
          hsnCode: '85044010',
          taxable_amount: 34200,
          tax_amount: 6156,
          data: [
            { name: 'cgst', per: 9, value: 3078 },
            { name: 'sgst', per: 9, value: 3078 },
          ],
        },
        subline1: 'Pure sine wave with 2 years warranty',
        lineTotal: 40356,
      },
      {
        id: 'it_2',
        name: 'Heavy Duty Copper Cable 4 sq.mm (90m)',
        hsnCode: '85441190',
        qty: 2,
        unit: 'Roll',
        baseRate: 3200,
        mrp: 3800,
        inclusiveOrExclusive: 'exclusive',
        isDiscountApplied: false,
        flatOrPercentage: 'percentage',
        discountRate: 0,
        discountAmount: 0,
        taxPercentage: 18,
        taxAmount: 1152,
        taxDetail: {
          hsnCode: '85441190',
          taxable_amount: 6400,
          tax_amount: 1152,
          data: [
            { name: 'cgst', per: 9, value: 576 },
            { name: 'sgst', per: 9, value: 576 },
          ],
        },
        subline1: 'FR Grade PVC Insulated',
        lineTotal: 7552,
      },
    ],
    extraItems: [
      {
        id: 'ex_1',
        name: 'Freight & Handling Charges',
        baseRate: 500,
        unit: 'Trip',
        hsnCode: '996511',
        taxPercentage: 18,
        taxAmount: 90,
        extraType: 'freight',
      },
    ],
    modifiers: [],
    calc: {
      subTotal: 41100,
      totalDiscount: 1800,
      taxAmount: 7398,
      totalBeforeModifier: 48498,
      totalModifiers: 0,
      extraItemsTotal: 590,
      tcsPercentage: 0,
      tcsAmount: 0,
      roundOffValue: 0.0,
      billFigure: 48498,
      amountInWords:
        'Indian Rupees Forty-Eight Thousand Four Hundred Ninety-Eight Only',
      paidAmount: 43998,
      dueAmount: 4500,
    },
    hsnSummary: [
      {
        hsnCode: '85044010',
        taxPercentage: 18,
        taxableAmount: 34200,
        cgstAmount: 3078,
        sgstAmount: 3078,
        igstAmount: 0,
        totalTaxAmount: 6156,
      },
      {
        hsnCode: '85441190',
        taxPercentage: 18,
        taxableAmount: 6400,
        cgstAmount: 576,
        sgstAmount: 576,
        igstAmount: 0,
        totalTaxAmount: 1152,
      },
      {
        hsnCode: '996511',
        taxPercentage: 18,
        taxableAmount: 500,
        cgstAmount: 45,
        sgstAmount: 45,
        igstAmount: 0,
        totalTaxAmount: 90,
      },
    ],
    copyType: InvoiceCopyType.ORIGINAL,
    status: 'PARTIAL',
    paymentMode: 'UPI / Bank Transfer',
    createdOn: '2026-08-18T11:00:00Z',
    updatedOn: '2026-08-18T11:00:00Z',
  },
];

export const INITIAL_PAYMENTS: PaymentLedgerEntry[] = [
  {
    id: 'pay_kmk_1',
    partyId: 'c_kmk',
    partyName: 'KMK TEXTILES',
    partyType: 'customer',
    date: '2025-11-19',
    type: 'debit',
    entryType: 'Sales',
    mode: 'Credit Invoice',
    amount: 74332,
    particular: 'Sales Order Bill #52 Cotton Hosiery Combed Yarn',
    vchNo: '52',
    referenceNo: 'INV-KMK-52',
    createdOn: '2025-11-19T10:30:00Z',
  },
  {
    id: 'pay_kmk_2',
    partyId: 'c_kmk',
    partyName: 'KMK TEXTILES',
    partyType: 'customer',
    date: '2026-12-29',
    type: 'debit',
    entryType: 'Sales',
    mode: 'Credit Invoice',
    amount: 14114,
    particular: 'Sales Order Bill #62 Knitted Fabric Grey Rolls',
    vchNo: '62',
    referenceNo: 'INV-KMK-62',
    createdOn: '2026-12-29T14:15:00Z',
  },
  {
    id: 'pay_sr_1',
    partyId: 'c_sr',
    partyName: 'SR COTTON',
    partyType: 'customer',
    date: '2026-02-14',
    type: 'debit',
    entryType: 'Sales',
    mode: 'Credit Invoice',
    amount: 142500,
    particular: 'Sales Delivery Lot #109 Organic Raw Bales',
    vchNo: '109',
    referenceNo: 'INV-SR-109',
    createdOn: '2026-02-14T09:45:00Z',
  },
  {
    id: 'pay_1',
    partyId: 'c_1',
    partyName: 'Sri Murugan Traders',
    partyType: 'customer',
    invoiceId: 'inv_101',
    invoiceNumber: 'INV/2026/001',
    date: '2026-08-18',
    type: 'credit',
    entryType: 'Payment In',
    mode: 'UPI',
    amount: 43998,
    particular: 'Part Payment for Inv #INV/2026/001 via Google Pay UPI',
    vchNo: '001',
    note: 'GPay UTR 623190823412',
    referenceNo: 'UPI/623190823412',
  },
];

export const INITIAL_SUBSCRIPTION_STATE: SubscriptionState = {
  isSubscribed: true,
  activePlan: {
    id: 'plan_yearly',
    name: '1 Year Business Pro',
    priceInr: 500,
    durationDays: 365,
    features: [
      'Unlimited GST Invoices',
      'Tally V4 PDF Print Engine',
      'GSTR-1 HSN Summary Export',
      'Supabase Cloud Sync',
    ],
  },
  expiryDate: '2027-08-25',
};

// Database Accessor & Persistence Class
export class KannakuDB {
  static isAuthenticated(): boolean {
    try {
      const raw = localStorage.getItem('kannaku_auth_session_v1');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!(parsed?.user?.id);
    } catch {
      return false;
    }
  }

  static getActiveTenantId(): string {
    const impersonated = localStorage.getItem('kannaku_impersonated_org_id');
    if (impersonated) return impersonated;

    try {
      const auth = localStorage.getItem('kannaku_auth_session_v1');
      if (auth) {
        const session = JSON.parse(auth);
        if (session?.user?.organizationId) {
          return session.user.organizationId;
        }
      }
    } catch {
      // ignore
    }

    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT_ID) || 'org_hytex_cotton';
  }

  static setActiveTenantId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, id);
  }

  private static getTenantKey(baseKey: string, customTenantId?: string): string {
    const tenantId = customTenantId || this.getActiveTenantId();
    return `${baseKey}_${tenantId}`;
  }

  static getCompanyProfile(): CompanyProfile {
    try {
      const tenantId = this.getActiveTenantId();
      const tenantKey = this.getTenantKey(STORAGE_KEYS.COMPANY);
      const data = localStorage.getItem(tenantKey);

      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_COMPANY,
          ...parsed,
          bankDetail: {
            ...DEFAULT_COMPANY.bankDetail,
            ...(parsed.bankDetail || {}),
          },
        };
      }

      // Check if this tenant exists in registered SaaS organizations
      try {
        const orgsData = localStorage.getItem('kannaku_saas_organizations_v2');
        if (orgsData) {
          const orgs = JSON.parse(orgsData);
          const org = orgs.find((o: any) => o.id === tenantId);
          if (org && tenantId !== 'org_hytex_cotton') {
            const orgProfile: CompanyProfile = {
              name: org.name,
              address: `${org.city || 'Industrial Zone'}, ${org.state || 'Tamil Nadu'}`,
              city: org.city || 'Tiruppur',
              state: org.state || 'Tamil Nadu',
              pin: '641604',
              code: '33',
              email: org.adminEmail || '',
              mobile: org.mobile || '',
              registerNumber: org.registerNumber || '',
              panNumber: org.registerNumber ? org.registerNumber.substring(2, 12) : '',
              billPrefix: 'INV/2026/',
              invoicePrefixSales: 'INV/2026/',
              invoicePrefixPurchase: 'PUR/2026/',
              invoicePrefixQuotation: 'QUO/2026/',
              colorScheme: 'blue',
              termsAndConditions:
                '1. Goods once sold will not be taken back or exchanged.\n2. Interest @ 18% p.a. charged on overdue bills.',
              jurisdictionCity: org.city || 'Tiruppur',
              bankDetail: {
                bankName: 'State Bank of India',
                accountNumber: '',
                ifscCode: '',
                branchName: org.city || 'Main Branch',
                upiId: `${org.slug || 'pay'}@upi`,
                panNumber: org.registerNumber ? org.registerNumber.substring(2, 12) : '',
              },
            };
            this.saveCompanyProfile(orgProfile);
            return orgProfile;
          }
        }
      } catch {
        // ignore
      }

      // Legacy fallback for default tenant
      const legacyData = localStorage.getItem(STORAGE_KEYS.COMPANY);
      if (legacyData && tenantId === 'org_hytex_cotton') {
        const parsed = JSON.parse(legacyData);
        return {
          ...DEFAULT_COMPANY,
          ...parsed,
          bankDetail: {
            ...DEFAULT_COMPANY.bankDetail,
            ...(parsed.bankDetail || {}),
          },
        };
      }

      return DEFAULT_COMPANY;
    } catch {
      return DEFAULT_COMPANY;
    }
  }

  static saveCompanyProfile(profile: CompanyProfile): void {
    localStorage.setItem(this.getTenantKey(STORAGE_KEYS.COMPANY), JSON.stringify(profile));
    // D1 Cloudflare Persistence
    if (this.isAuthenticated()) {
      ApiService.updateOrganization(profile).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to update organization profile:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: 'Update Company Profile', error: res.error, status: res.status },
              })
            );
          }
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kannaku:d1-sync-success', { detail: { action: 'Update Company Profile' } }));
        }
      });
    }
  }

  static getClients(): Client[] {
    try {
      const tenantId = this.getActiveTenantId();
      const tenantKey = this.getTenantKey(STORAGE_KEYS.CLIENTS);
      const data = localStorage.getItem(tenantKey);
      if (data !== null) return JSON.parse(data);

      // Check legacy key only for org_hytex_cotton demo
      if (tenantId === 'org_hytex_cotton') {
        const legacy = localStorage.getItem(STORAGE_KEYS.CLIENTS);
        if (legacy !== null) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  }

  static saveClients(clients: Client[]): void {
    localStorage.setItem(this.getTenantKey(STORAGE_KEYS.CLIENTS), JSON.stringify(clients));
  }

  static saveClient(client: Client): void {
    const list = this.getClients();
    const idx = list.findIndex((c) => c.id === client.id);
    if (idx >= 0) {
      list[idx] = client;
    } else {
      list.unshift(client);
    }
    this.saveClients(list);

    // Cloudflare D1 Sync
    if (this.isAuthenticated()) {
      ApiService.saveClient(client).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to save client to D1:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: `Save Party (${client.name})`, error: res.error, status: res.status },
              })
            );
          }
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kannaku:d1-sync-success', { detail: { action: `Saved Party ${client.name}` } }));
        }
      });
    }
  }

  static deleteClient(id: string): void {
    const list = this.getClients().filter((c) => c.id !== id);
    this.saveClients(list);

    // Cloudflare D1 Delete
    if (this.isAuthenticated()) {
      ApiService.deleteClient(id).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to delete client from D1:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: 'Delete Party', error: res.error, status: res.status },
              })
            );
          }
        }
      });
    }
  }

  static getProducts(): Product[] {
    try {
      const tenantId = this.getActiveTenantId();
      const tenantKey = this.getTenantKey(STORAGE_KEYS.PRODUCTS);
      const data = localStorage.getItem(tenantKey);
      if (data !== null) return JSON.parse(data);

      if (tenantId === 'org_hytex_cotton') {
        const legacy = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (legacy !== null) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  }

  static saveProducts(products: Product[]): void {
    localStorage.setItem(this.getTenantKey(STORAGE_KEYS.PRODUCTS), JSON.stringify(products));
  }

  static saveProduct(product: Product): void {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    this.saveProducts(list);

    // Cloudflare D1 Sync
    if (this.isAuthenticated()) {
      ApiService.saveProduct(product).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to save product to D1:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: `Save Product (${product.name})`, error: res.error, status: res.status },
              })
            );
          }
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kannaku:d1-sync-success', { detail: { action: `Saved Product ${product.name}` } }));
        }
      });
    }
  }

  static deleteProduct(id: string): void {
    const list = this.getProducts().filter((p) => p.id !== id);
    this.saveProducts(list);

    // Cloudflare D1 Delete
    if (this.isAuthenticated()) {
      ApiService.deleteProduct(id).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to delete product from D1:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: 'Delete Product', error: res.error, status: res.status },
              })
            );
          }
        }
      });
    }
  }

  static getInvoices(): Invoice[] {
    try {
      const tenantId = this.getActiveTenantId();
      const tenantKey = this.getTenantKey(STORAGE_KEYS.INVOICES);
      const data = localStorage.getItem(tenantKey);
      if (data !== null) {
        const list: Invoice[] = JSON.parse(data);
        const filtered = list.filter((i) => i.id !== 'inv_mock_5_page_test');
        if (filtered.length !== list.length) {
          this.saveInvoices(filtered);
        }
        return filtered;
      }

      if (tenantId === 'org_hytex_cotton') {
        const legacy = localStorage.getItem(STORAGE_KEYS.INVOICES);
        if (legacy !== null) {
          const list: Invoice[] = JSON.parse(legacy);
          const filtered = list.filter((i) => i.id !== 'inv_mock_5_page_test');
          return filtered;
        }
      }
      return INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  }

  static saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(this.getTenantKey(STORAGE_KEYS.INVOICES), JSON.stringify(invoices));
  }

  static saveInvoice(invoice: Invoice): void {
    const list = this.getInvoices();
    const idx = list.findIndex((i) => i.id === invoice.id);
    const oldInvoice = idx >= 0 ? list[idx] : null;
    if (idx >= 0) {
      list[idx] = invoice;
    } else {
      list.unshift(invoice);
    }
    this.saveInvoices(list);

    // Automatically synchronize ledger entries for this invoice
    this.syncInvoiceToLedger(invoice, oldInvoice);

    // Cloudflare D1 Sync
    if (this.isAuthenticated()) {
      ApiService.saveInvoice(invoice).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to save invoice to D1:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: `Save Invoice #${invoice.invoiceNumber}`, error: res.error, status: res.status },
              })
            );
          }
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kannaku:d1-sync-success', { detail: { action: `Saved Invoice #${invoice.invoiceNumber}` } }));
        }
      });
    }
  }

  static deleteInvoice(id: string): void {
    const list = this.getInvoices();
    const inv = list.find((i) => i.id === id);
    const updated = list.filter((i) => i.id !== id);
    this.saveInvoices(updated);

    // Remove matching ledger entries
    const payments = this.getPayments().filter(
      (p) =>
        p.invoiceId !== id &&
        p.id !== `pay_inv_${id}` &&
        p.id !== `pay_rcpt_${id}` &&
        (!inv || (p.vchNo !== inv.invoiceNumber && p.referenceNo !== inv.invoiceNumber))
    );
    this.savePayments(payments);

    // Recalculate client balance
    if (inv && inv.clientId) {
      this.recalculateClientBalance(inv.clientId);
    }

    // Cloudflare D1 Delete
    if (this.isAuthenticated()) {
      ApiService.deleteInvoice(id).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to delete invoice from D1:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: 'Delete Invoice', error: res.error, status: res.status },
              })
            );
          }
        }
      });
    }
  }

  static syncInvoiceToLedger(invoice: Invoice, oldInvoice?: Invoice): void {
    const isSales = invoice.invoiceType === InvoiceType.SALES;
    const isPurchase = invoice.invoiceType === InvoiceType.PURCHASE;

    // Quotations / Estimates are non-financial documents and MUST NOT be entered into party ledgers or alter balances.
    if (invoice.invoiceType === InvoiceType.QUOTATION || (!isSales && !isPurchase)) {
      const filteredPayments = this.getPayments().filter(
        (p) =>
          p.invoiceId !== invoice.id &&
          p.id !== `pay_inv_${invoice.id}` &&
          p.id !== `pay_rcpt_${invoice.id}` &&
          p.vchNo !== invoice.invoiceNumber &&
          p.referenceNo !== invoice.invoiceNumber
      );
      this.savePayments(filteredPayments);

      if (invoice.clientId) {
        this.recalculateClientBalance(invoice.clientId);
      }
      return;
    }

    const payments = this.getPayments();

    // 1. Primary Invoice Ledger Entry
    const invEntryId = `pay_inv_${invoice.id}`;
    const mainEntryIdx = payments.findIndex(
      (p) => p.id === invEntryId || (p.invoiceId === invoice.id && p.entryType === (isSales ? 'Sales' : 'Purchase'))
    );

    const mainEntry: PaymentLedgerEntry = {
      id: invEntryId,
      partyId: invoice.clientId,
      partyName: invoice.clientSnapshot?.name || 'Party',
      partyType: isPurchase ? 'supplier' : 'customer',
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date || new Date().toISOString().split('T')[0],
      type: isSales ? 'debit' : 'credit',
      entryType: isSales ? 'Sales' : isPurchase ? 'Purchase' : 'Sales',
      mode: invoice.paymentMode || 'Credit Invoice',
      amount: invoice.calc.billFigure || invoice.calc.totalBeforeModifier || 0,
      particular: isSales
        ? `Sales Tax Invoice #${invoice.invoiceNumber}`
        : `Purchase Bill #${invoice.invoiceNumber}`,
      vchNo: invoice.invoiceNumber,
      referenceNo: invoice.invoiceNumber,
      createdOn: invoice.createdOn || new Date().toISOString(),
    };

    if (mainEntryIdx >= 0) {
      payments[mainEntryIdx] = mainEntry;
    } else {
      payments.unshift(mainEntry);
    }

    // 2. Immediate Receipt / Payment entry if paidAmount > 0
    const rcptEntryId = `pay_rcpt_${invoice.id}`;
    const rcptEntryIdx = payments.findIndex(
      (p) => p.id === rcptEntryId || (p.invoiceId === invoice.id && (p.entryType === 'Payment In' || p.entryType === 'Payment Out'))
    );

    if (invoice.calc.paidAmount && invoice.calc.paidAmount > 0) {
      const rcptEntry: PaymentLedgerEntry = {
        id: rcptEntryId,
        partyId: invoice.clientId,
        partyName: invoice.clientSnapshot?.name || 'Party',
        partyType: isPurchase ? 'supplier' : 'customer',
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date || new Date().toISOString().split('T')[0],
        type: isSales ? 'credit' : 'debit',
        entryType: isSales ? 'Payment In' : 'Payment Out',
        mode: invoice.paymentMode || 'Cash/Bank',
        amount: invoice.calc.paidAmount,
        particular: isSales
          ? `Payment Received for Inv #${invoice.invoiceNumber} (${invoice.paymentMode || 'Direct'})`
          : `Payment Made for Bill #${invoice.invoiceNumber}`,
        vchNo: isSales ? `RCPT-${invoice.invoiceNumber}` : `PYMT-${invoice.invoiceNumber}`,
        referenceNo: invoice.invoiceNumber,
        createdOn: invoice.createdOn || new Date().toISOString(),
      };

      if (rcptEntryIdx >= 0) {
        payments[rcptEntryIdx] = rcptEntry;
      } else {
        payments.unshift(rcptEntry);
      }
    } else if (rcptEntryIdx >= 0) {
      // If payment was reverted to 0, remove receipt entry
      payments.splice(rcptEntryIdx, 1);
    }

    this.savePayments(payments);

    // Recalculate client balance
    if (invoice.clientId) {
      this.recalculateClientBalance(invoice.clientId);
    }
    
    // If client changed, recalculate old client balance too
    if (oldInvoice && oldInvoice.clientId && oldInvoice.clientId !== invoice.clientId) {
      this.recalculateClientBalance(oldInvoice.clientId);
    }
  }

  static recalculateClientBalance(clientId: string): number {
    const clients = this.getClients();
    const client = clients.find((c) => c.id === clientId);
    if (!client) return 0;

    const payments = this.getPayments().filter(
      (p) => p.partyId === clientId || p.partyName.toLowerCase() === client.name.toLowerCase()
    );

    const debits = payments
      .filter((p) => p.type === 'debit')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const credits = payments
      .filter((p) => p.type === 'credit')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const newBalance = debits - credits;
    const updatedClient = { ...client, balance: newBalance };
    this.saveClient(updatedClient);
    return newBalance;
  }

  static reconcileInvoicesWithLedger(): void {
    const invoices = this.getInvoices();
    invoices.forEach((inv) => {
      this.syncInvoiceToLedger(inv);
    });
  }

  static getPayments(): PaymentLedgerEntry[] {
    try {
      const tenantId = this.getActiveTenantId();
      const tenantKey = this.getTenantKey(STORAGE_KEYS.PAYMENTS);
      const data = localStorage.getItem(tenantKey);
      if (data !== null) return JSON.parse(data);

      if (tenantId === 'org_hytex_cotton') {
        const legacy = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
        if (legacy !== null) return JSON.parse(legacy);
      }
      return [];
    } catch {
      return [];
    }
  }

  static savePayments(payments: PaymentLedgerEntry[]): void {
    localStorage.setItem(this.getTenantKey(STORAGE_KEYS.PAYMENTS), JSON.stringify(payments));
  }

  static loadDemoData(): void {
    this.saveClients(INITIAL_CLIENTS);
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveInvoices(INITIAL_INVOICES);
    this.savePayments(INITIAL_PAYMENTS);
    this.saveCompanyProfile(DEFAULT_COMPANY);
    this.reconcileInvoicesWithLedger();
  }

  static clearWorkspaceData(): void {
    this.saveClients([]);
    this.saveProducts([]);
    this.saveInvoices([]);
    this.savePayments([]);
  }

  static isCleanWorkspace(): boolean {
    return (
      this.getInvoices().length === 0 &&
      this.getClients().length === 0 &&
      this.getProducts().length === 0
    );
  }

  static savePayment(entry: PaymentLedgerEntry): void {
    const list = this.getPayments();
    const idx = list.findIndex((p) => p.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    this.savePayments(list);
    if (entry.partyId) {
      this.recalculateClientBalance(entry.partyId);
    }

    // Cloudflare D1 Sync
    if (this.isAuthenticated()) {
      ApiService.savePayment(entry).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to record payment in D1:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: `Record Payment (₹${entry.amount})`, error: res.error, status: res.status },
              })
            );
          }
        } else if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kannaku:d1-sync-success', { detail: { action: `Recorded Payment ₹${entry.amount}` } }));
        }
      });
    }
  }

  static deletePayment(id: string): void {
    const list = this.getPayments();
    const entry = list.find((p) => p.id === id);
    const updated = list.filter((p) => p.id !== id);
    this.savePayments(updated);
    if (entry && entry.partyId) {
      this.recalculateClientBalance(entry.partyId);
    }

    // Cloudflare D1 Delete
    if (this.isAuthenticated()) {
      ApiService.deletePayment(id).then((res) => {
        if (!res.success) {
          console.error('[Kannaku D1 Error] Failed to delete payment from D1:', res.error);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('kannaku:d1-sync-error', {
                detail: { action: 'Delete Payment Entry', error: res.error, status: res.status },
              })
            );
          }
        }
      });
    }
  }

  // Synchronize workspace data directly from Cloudflare D1
  static async syncFromD1(): Promise<{ success: boolean; error?: string; counts?: any }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'User is not authenticated' };
    }
    try {
      const [orgRes, clientsRes, productsRes, invoicesRes, paymentsRes] = await Promise.all([
        ApiService.getOrganization(),
        ApiService.getClients(),
        ApiService.getProducts(),
        ApiService.getInvoices(),
        ApiService.getPayments(),
      ]);

      if (!orgRes.success && !clientsRes.success && !productsRes.success && !invoicesRes.success) {
        return {
          success: false,
          error: orgRes.error || clientsRes.error || 'Failed to authenticate or fetch data from Cloudflare D1',
        };
      }

      if (orgRes.success && orgRes.data) {
        localStorage.setItem(this.getTenantKey(STORAGE_KEYS.COMPANY), JSON.stringify(orgRes.data));
      }
      if (clientsRes.success && Array.isArray(clientsRes.data)) {
        this.saveClients(clientsRes.data);
      }
      if (productsRes.success && Array.isArray(productsRes.data)) {
        this.saveProducts(productsRes.data);
      }
      if (invoicesRes.success && Array.isArray(invoicesRes.data)) {
        this.saveInvoices(invoicesRes.data);
      }
      if (paymentsRes.success && Array.isArray(paymentsRes.data)) {
        this.savePayments(paymentsRes.data);
      }

      const counts = {
        clients: Array.isArray(clientsRes.data) ? clientsRes.data.length : 0,
        products: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
        invoices: Array.isArray(invoicesRes.data) ? invoicesRes.data.length : 0,
        payments: Array.isArray(paymentsRes.data) ? paymentsRes.data.length : 0,
      };

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kannaku:d1-sync-success', { detail: { action: 'Synced from Cloudflare D1', counts } }));
      }

      return { success: true, counts };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to sync with D1' };
    }
  }

  // Push all existing local data into Cloudflare D1 for permanent persistence
  static async migrateAllLocalDataToD1(): Promise<{ success: boolean; migrated?: any; error?: string }> {
    if (!this.isAuthenticated()) {
      return { success: false, error: 'User is not authenticated' };
    }
    try {
      const payload = {
        company: this.getCompanyProfile(),
        clients: this.getClients(),
        products: this.getProducts(),
        invoices: this.getInvoices(),
        payments: this.getPayments(),
      };

      const res = await ApiService.migrateLocalData(payload);
      if (res.data?.success) {
        return { success: true, migrated: res.data.migrated };
      }
      return { success: false, error: res.error || 'Migration failed' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Migration network error' };
    }
  }

  static getSubscription(): SubscriptionState {
    try {
      const tenantKey = this.getTenantKey(STORAGE_KEYS.SUBSCRIPTION);
      const data = localStorage.getItem(tenantKey);
      if (data) return JSON.parse(data);

      const legacy = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      return legacy ? JSON.parse(legacy) : INITIAL_SUBSCRIPTION_STATE;
    } catch {
      return INITIAL_SUBSCRIPTION_STATE;
    }
  }

  static saveSubscription(sub: SubscriptionState): void {
    localStorage.setItem(this.getTenantKey(STORAGE_KEYS.SUBSCRIPTION), JSON.stringify(sub));
  }

  static getTenants(): TenantOrganization[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TENANTS);
      return data ? JSON.parse(data) : DEFAULT_TENANTS;
    } catch {
      return DEFAULT_TENANTS;
    }
  }

  static saveTenants(tenants: TenantOrganization[]): void {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  }

  static saveTenant(tenant: TenantOrganization): void {
    const list = this.getTenants();
    const idx = list.findIndex((t) => t.id === tenant.id);
    if (idx >= 0) {
      list[idx] = tenant;
    } else {
      list.unshift(tenant);
    }
    this.saveTenants(list);
  }

  static getMasterDevOpsConfig(): MasterDevOpsConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEVOPS_CONFIG);
      return data ? JSON.parse(data) : DEFAULT_DEVOPS_CONFIG;
    } catch {
      return DEFAULT_DEVOPS_CONFIG;
    }
  }

  static saveMasterDevOpsConfig(config: MasterDevOpsConfig): void {
    localStorage.setItem(STORAGE_KEYS.DEVOPS_CONFIG, JSON.stringify(config));
  }

  static switchTenant(tenantId: string): void {
    this.setActiveTenantId(tenantId);
    const tenants = this.getTenants();
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant) {
      const currentProfile = this.getCompanyProfile();
      const updatedProfile: CompanyProfile = {
        ...currentProfile,
        name: tenant.name,
        email: tenant.adminEmail,
        mobile: tenant.mobile,
        registerNumber: tenant.registerNumber,
      };
      this.saveCompanyProfile(updatedProfile);
    }
  }

  static exportAllData(): string {
    const backup = {
      app: 'Kannaku',
      version: '7.1.7',
      exportedAt: new Date().toISOString(),
      company: this.getCompanyProfile(),
      clients: this.getClients(),
      products: this.getProducts(),
      invoices: this.getInvoices(),
      payments: this.getPayments(),
      subscription: this.getSubscription(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.company) this.saveCompanyProfile(data.company);
      if (data.clients) this.saveClients(data.clients);
      if (data.products) this.saveProducts(data.products);
      if (data.invoices) this.saveInvoices(data.invoices);
      if (data.payments) this.savePayments(data.payments);
      if (data.subscription) this.saveSubscription(data.subscription);
      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }
}
