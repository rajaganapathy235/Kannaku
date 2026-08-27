import {
  AdminRole,
  AdminUser,
  AuditLogEntry,
  EmailTemplate,
  FeatureFlag,
  ImpersonationSession,
  PaymentGatewayConfig,
  PaymentGatewayProvider,
  PlatformAnnouncement,
  PlatformSettings,
  PlatformUser,
  SaaSCoupon,
  SaaSGatewayManagerConfig,
  SaaSPlan,
  SaaSTransaction,
  SubsystemStatus,
  SuperAdminDashboardStats,
  SupportTicket,
  SystemErrorLog,
  TenantOrganizationFull,
} from '../types/admin';
import { KannakuDB } from './storage';

const STORAGE_KEYS = {
  ADMIN_USER: 'kannaku_active_admin_user',
  ADMIN_ROLE: 'kannaku_active_admin_role',
  SUPER_ADMIN_MODE: 'kannaku_portal_mode', // 'CUSTOMER' | 'ADMIN'
  IMPERSONATED_ORG: 'kannaku_impersonated_org_id',
  THEME_MODE: 'kannaku_admin_theme', // 'light' | 'dark' | 'system'
  ORGANIZATIONS: 'kannaku_saas_organizations_v2',
  PLANS: 'kannaku_saas_plans_v3',
  USERS: 'kannaku_saas_users_v2',
  TRANSACTIONS: 'kannaku_saas_transactions_v2',
  COUPONS: 'kannaku_saas_coupons_v2',
  FEATURE_FLAGS: 'kannaku_saas_feature_flags_v2',
  SUPPORT_TICKETS: 'kannaku_saas_support_tickets_v2',
  ANNOUNCEMENTS: 'kannaku_saas_announcements_v2',
  EMAIL_TEMPLATES: 'kannaku_saas_email_templates_v2',
  AUDIT_LOGS: 'kannaku_saas_audit_logs_v2',
  IMPERSONATION_SESSIONS: 'kannaku_saas_impersonation_sessions_v2',
  ERROR_LOGS: 'kannaku_saas_error_logs_v2',
  PLATFORM_SETTINGS: 'kannaku_saas_platform_settings_v2',
  PAYMENT_GATEWAYS: 'kannaku_saas_payment_gateways_v3',
};

export const INITIAL_ADMIN_USER: AdminUser = {
  id: 'admin_owner_01',
  name: 'Rajaganapathy S.',
  email: 'rajaganapathy235@gmail.com',
  role: 'SUPER_ADMIN',
  avatarUrl: 'https://ui-avatars.com/api/?name=Raja+Ganapathy&background=1e293b&color=38bdf8',
  lastLogin: new Date().toISOString(),
  twoFactorEnabled: true,
  department: 'Executive / Platform Ops',
};

export const DEFAULT_PAYMENT_GATEWAYS: SaaSGatewayManagerConfig = {
  activeProvider: 'dodopayments',
  gateways: {
    dodopayments: {
      provider: 'dodopayments',
      name: 'Dodo Payments',
      isEnabled: true,
      isTestMode: false,
      dodoApiKey: 'dodo_live_sec_892kln49f0a218b3',
      dodoWebhookSecret: 'whsec_dodo_98a76b12f45c',
      dodoProductIdMonthly: 'p_monthly_99',
      dodoProductIdSixMonths: 'p_six_months_474',
      dodoProductIdTwelveMonths: 'p_twelve_months_588',
    },
    cashfree: {
      provider: 'cashfree',
      name: 'Cashfree Payments',
      isEnabled: true,
      isTestMode: false,
      cashfreeAppId: 'CF_APP_98234710',
      cashfreeSecretKey: 'cf_sec_live_9a87d6f5e4c3b2a1',
      cashfreeApiVersion: '2023-08-01',
    },
    razorpay: {
      provider: 'razorpay',
      name: 'Razorpay Payment Gateway',
      isEnabled: true,
      isTestMode: false,
      razorpayKeyId: 'rzp_live_89201948271',
      razorpayKeySecret: 'rzp_sec_891048201847192',
      razorpayWebhookSecret: 'whsec_rzp_894172',
    },
    stripe: {
      provider: 'stripe',
      name: 'Stripe Global',
      isEnabled: true,
      isTestMode: true,
      stripePublishableKey: 'pk_test_51Mz891230491823',
      stripeSecretKey: 'sk_test_51Mz891230491823_sec',
      stripeWebhookSecret: 'whsec_stripe_891204',
    },
    manual_upi: {
      provider: 'manual_upi',
      name: 'Direct UPI & Bank Transfer',
      isEnabled: true,
      isTestMode: false,
      upiId: 'kannakubilling@okaxis',
      upiPayeeName: 'Kannaku Cloud Billing Inc',
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200089123456',
      ifscCode: 'HDFC0001234',
    },
  },
};

export const DEFAULT_PLANS: SaaSPlan[] = [
  {
    id: 'plan_all_in_one_pro',
    name: 'All-in-One Growth Plan',
    code: 'ALL_IN_ONE',
    tagline: 'Single comprehensive plan with ALL GST invoicing, Tally multi-copy prints & compliance features unlocked',
    monthlyPriceInr: 99, // ₹99 / month
    sixMonthPriceInr: 474, // ₹79 / month (₹474 for 6 mos)
    threeMonthPriceInr: 237, // ₹79 / month (₹237 for 3 mos)
    yearlyPriceInr: 588, // ₹49 / month (₹588 for 12 mos)
    trialDurationDays: 7,
    isPopular: true,
    limits: {
      maxUsers: 999,
      maxInvoicesPerMonth: 999999,
      maxQuotationsPerMonth: 999999,
      maxCustomers: 999999,
      maxProducts: 999999,
      pdfGenerationsLimit: 999999,
      hasMultiUser: true,
      hasGstReports: true,
      hasCustomBranding: true,
      hasDigitalStampSign: true,
      hasInventoryAlerts: true,
      hasTallyPrintFormats: true,
      hasUpiQrPayment: true,
      hasPurchaseLedger: true,
    },
    createdOn: '2026-01-01T00:00:00Z',
    updatedOn: '2026-08-01T00:00:00Z',
  },
];

export const INITIAL_ORGANIZATIONS: TenantOrganizationFull[] = [
  {
    id: 'org_hytex_cotton',
    name: 'HYTEX COTTON MILLS',
    slug: 'hytex-cotton',
    ownerName: 'K. Vasanthi',
    adminEmail: 'hytexcottonmills@gmail.com',
    mobile: '8870796169',
    country: 'India',
    city: 'Tiruppur',
    state: 'Tamil Nadu',
    registerNumber: '33ASWPV8266F1ZW',
    planId: 'plan_pro',
    planName: 'Pro Trader',
    subscriptionStatus: 'ACTIVE',
    accountStatus: 'ACTIVE',
    billingCycle: 'YEARLY',
    subscriptionStartDate: '2026-01-15T08:00:00Z',
    renewalDate: '2027-01-15T08:00:00Z',
    mrr: 499,
    usersCount: 4,
    usage: {
      invoicesCreated: 148,
      estimatesCreated: 34,
      customersCount: 42,
      suppliersCount: 16,
      productsCount: 68,
      pdfGenerationsCount: 380,
      gstTaxHandledInr: 284500,
      paymentLedgerEntries: 112,
    },
    createdDate: '2026-01-15T08:00:00Z',
    lastActive: new Date().toISOString(),
    paymentProvider: 'cashfree',
    customDomain: 'billing.hytexmills.com',
    notes: 'Premium textile manufacturer in Tiruppur hub. Auto-renew enabled.',
  },
  {
    id: 'org_sri_murugan',
    name: 'Sri Murugan Traders & Co',
    slug: 'murugan-traders',
    ownerName: 'M. Shanmugam',
    adminEmail: 'murugan.traders@gmail.com',
    mobile: '9841098765',
    country: 'India',
    city: 'Erode',
    state: 'Tamil Nadu',
    registerNumber: '33AAACM4589K1Z2',
    planId: 'plan_business',
    planName: 'Annual Business Suite',
    subscriptionStatus: 'ACTIVE',
    accountStatus: 'ACTIVE',
    billingCycle: 'YEARLY',
    subscriptionStartDate: '2026-02-10T10:00:00Z',
    renewalDate: '2027-02-10T10:00:00Z',
    mrr: 832,
    usersCount: 8,
    usage: {
      invoicesCreated: 520,
      estimatesCreated: 92,
      customersCount: 180,
      suppliersCount: 45,
      productsCount: 310,
      pdfGenerationsCount: 1180,
      gstTaxHandledInr: 945200,
      paymentLedgerEntries: 430,
    },
    createdDate: '2026-02-10T10:00:00Z',
    lastActive: '2026-08-25T16:30:00Z',
    paymentProvider: 'razorpay',
    customDomain: 'gst.murugantraders.in',
  },
  {
    id: 'org_chennai_electro',
    name: 'Chennai Electro & Solar Tech',
    slug: 'chennai-electro',
    ownerName: 'A. Ramanathan',
    adminEmail: 'accounts@chennaielectro.in',
    mobile: '9789012345',
    country: 'India',
    city: 'Chennai',
    state: 'Tamil Nadu',
    registerNumber: '33BBPME9823P1ZQ',
    planId: 'plan_enterprise',
    planName: 'Enterprise Custom',
    subscriptionStatus: 'ACTIVE',
    accountStatus: 'ACTIVE',
    billingCycle: 'YEARLY',
    subscriptionStartDate: '2026-03-01T09:00:00Z',
    renewalDate: '2027-03-01T09:00:00Z',
    mrr: 2082,
    usersCount: 18,
    usage: {
      invoicesCreated: 1240,
      estimatesCreated: 410,
      customersCount: 520,
      suppliersCount: 94,
      productsCount: 850,
      pdfGenerationsCount: 3400,
      gstTaxHandledInr: 2840000,
      paymentLedgerEntries: 1650,
    },
    createdDate: '2026-03-01T09:00:00Z',
    lastActive: '2026-08-26T04:15:00Z',
    paymentProvider: 'dodopayments',
    customDomain: 'erp.chennaielectro.in',
  },
  {
    id: 'org_apex_logistics',
    name: 'Apex Logistics & Freight Corp',
    slug: 'apex-logistics',
    ownerName: 'Rohan Deshmukh',
    adminEmail: 'finance@apexlogistics.in',
    mobile: '9820055443',
    country: 'India',
    city: 'Mumbai',
    state: 'Maharashtra',
    registerNumber: '27AALCA1209L1Z8',
    planId: 'plan_starter',
    planName: 'Starter Business',
    subscriptionStatus: 'TRIAL',
    accountStatus: 'ACTIVE',
    billingCycle: 'TRIAL',
    subscriptionStartDate: '2026-08-15T11:00:00Z',
    renewalDate: '2026-08-29T11:00:00Z',
    trialEndDate: '2026-08-29T11:00:00Z',
    mrr: 0,
    usersCount: 2,
    usage: {
      invoicesCreated: 18,
      estimatesCreated: 6,
      customersCount: 14,
      suppliersCount: 5,
      productsCount: 22,
      pdfGenerationsCount: 42,
      gstTaxHandledInr: 32000,
      paymentLedgerEntries: 15,
    },
    createdDate: '2026-08-15T11:00:00Z',
    lastActive: '2026-08-25T19:00:00Z',
    paymentProvider: 'cashfree',
    notes: 'Trial expires in 3 days. High activity level.',
  },
  {
    id: 'org_karnataka_silks',
    name: 'Karnataka Heritage Silks',
    slug: 'karnataka-silks',
    ownerName: 'Sunita Hegde',
    adminEmail: 'orders@karnatakasilks.com',
    mobile: '9980123456',
    country: 'India',
    city: 'Bengaluru',
    state: 'Karnataka',
    registerNumber: '29ABCDE1234F1Z5',
    planId: 'plan_pro',
    planName: 'Pro Trader',
    subscriptionStatus: 'PAST_DUE',
    accountStatus: 'ACTIVE',
    billingCycle: 'MONTHLY',
    subscriptionStartDate: '2026-05-10T12:00:00Z',
    renewalDate: '2026-08-24T12:00:00Z',
    mrr: 599,
    usersCount: 3,
    usage: {
      invoicesCreated: 88,
      estimatesCreated: 14,
      customersCount: 65,
      suppliersCount: 20,
      productsCount: 110,
      pdfGenerationsCount: 190,
      gstTaxHandledInr: 168000,
      paymentLedgerEntries: 45,
    },
    createdDate: '2026-05-10T12:00:00Z',
    lastActive: '2026-08-24T14:10:00Z',
    paymentProvider: 'stripe',
    notes: 'Renewal card failed on Aug 24. Auto retry in 48h.',
  },
  {
    id: 'org_delhi_hardware',
    name: 'Capital Fasteners & Hardware',
    slug: 'capital-hardware',
    ownerName: 'Vikas Gupta',
    adminEmail: 'sales@capitalfasteners.in',
    mobile: '9811122334',
    country: 'India',
    city: 'Delhi',
    state: 'Delhi',
    registerNumber: '07AAECF5521L1ZM',
    planId: 'plan_starter',
    planName: 'Starter Business',
    subscriptionStatus: 'CANCELLED',
    accountStatus: 'SUSPENDED',
    billingCycle: 'MONTHLY',
    subscriptionStartDate: '2026-02-01T10:00:00Z',
    renewalDate: '2026-07-01T10:00:00Z',
    mrr: 0,
    usersCount: 1,
    usage: {
      invoicesCreated: 42,
      estimatesCreated: 8,
      customersCount: 30,
      suppliersCount: 12,
      productsCount: 45,
      pdfGenerationsCount: 60,
      gstTaxHandledInr: 49000,
      paymentLedgerEntries: 12,
    },
    createdDate: '2026-02-01T10:00:00Z',
    lastActive: '2026-07-15T09:00:00Z',
    paymentProvider: 'cashfree',
    notes: 'Account suspended by request. Business pivot.',
  },
  {
    id: 'org_kerala_spices',
    name: 'Malabar Spices & Agro Exports',
    slug: 'malabar-spices',
    ownerName: 'T. K. Mathew',
    adminEmail: 'info@malabarspices.co.in',
    mobile: '9447123987',
    country: 'India',
    city: 'Kochi',
    state: 'Kerala',
    registerNumber: '32AADCM9921K1ZZ',
    planId: 'plan_pro',
    planName: 'Pro Trader',
    subscriptionStatus: 'ACTIVE',
    accountStatus: 'ACTIVE',
    billingCycle: 'YEARLY',
    subscriptionStartDate: '2026-04-12T10:00:00Z',
    renewalDate: '2027-04-12T10:00:00Z',
    mrr: 499,
    usersCount: 4,
    usage: {
      invoicesCreated: 310,
      estimatesCreated: 75,
      customersCount: 140,
      suppliersCount: 38,
      productsCount: 88,
      pdfGenerationsCount: 720,
      gstTaxHandledInr: 680000,
      paymentLedgerEntries: 280,
    },
    createdDate: '2026-04-12T10:00:00Z',
    lastActive: '2026-08-25T18:45:00Z',
    paymentProvider: 'razorpay',
  },
];

export const INITIAL_USERS: PlatformUser[] = [
  {
    id: 'usr_vasanthi',
    organizationId: 'org_hytex_cotton',
    organizationName: 'HYTEX COTTON MILLS',
    name: 'K. Vasanthi',
    email: 'hytexcottonmills@gmail.com',
    phone: '8870796169',
    role: 'OWNER',
    status: 'ACTIVE',
    planName: 'Pro Trader',
    lastLogin: '2026-08-26T02:10:00Z',
    createdDate: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr_murugan_owner',
    organizationId: 'org_sri_murugan',
    organizationName: 'Sri Murugan Traders & Co',
    name: 'M. Shanmugam',
    email: 'murugan.traders@gmail.com',
    phone: '9841098765',
    role: 'OWNER',
    status: 'ACTIVE',
    planName: 'Annual Business Suite',
    lastLogin: '2026-08-25T16:30:00Z',
    createdDate: '2026-02-10T10:00:00Z',
  },
  {
    id: 'usr_chennai_admin',
    organizationId: 'org_chennai_electro',
    organizationName: 'Chennai Electro & Solar Tech',
    name: 'A. Ramanathan',
    email: 'accounts@chennaielectro.in',
    phone: '9789012345',
    role: 'OWNER',
    status: 'ACTIVE',
    planName: 'Enterprise Custom',
    lastLogin: '2026-08-26T04:15:00Z',
    createdDate: '2026-03-01T09:00:00Z',
  },
  {
    id: 'usr_apex_finance',
    organizationId: 'org_apex_logistics',
    organizationName: 'Apex Logistics & Freight Corp',
    name: 'Rohan Deshmukh',
    email: 'finance@apexlogistics.in',
    phone: '9820055443',
    role: 'OWNER',
    status: 'ACTIVE',
    planName: 'Starter Business',
    lastLogin: '2026-08-25T19:00:00Z',
    createdDate: '2026-08-15T11:00:00Z',
  },
  {
    id: 'usr_karnataka_owner',
    organizationId: 'org_karnataka_silks',
    organizationName: 'Karnataka Heritage Silks',
    name: 'Sunita Hegde',
    email: 'orders@karnatakasilks.com',
    phone: '9980123456',
    role: 'OWNER',
    status: 'ACTIVE',
    planName: 'Pro Trader',
    lastLogin: '2026-08-24T14:10:00Z',
    createdDate: '2026-05-10T12:00:00Z',
  },
];

export const INITIAL_TRANSACTIONS: SaaSTransaction[] = [
  {
    id: 'txn_109284',
    organizationId: 'org_hytex_cotton',
    organizationName: 'HYTEX COTTON MILLS',
    amount: 5990,
    currency: 'INR',
    paymentMethod: 'UPI',
    paymentProvider: 'Cashfree',
    status: 'SUCCESSFUL',
    date: '2026-01-15T08:05:00Z',
    invoiceNumber: 'SAAS-INV-2026-0081',
    subscriptionId: 'sub_hytex_pro',
    planName: 'Pro Trader (Annual)',
    billingCycle: 'YEARLY',
    receiptUrl: 'https://billing.kannaku.in/receipts/txn_109284.pdf',
    gatewayRefId: 'cf_order_883912048',
    customerEmail: 'hytexcottonmills@gmail.com',
  },
  {
    id: 'txn_109350',
    organizationId: 'org_sri_murugan',
    organizationName: 'Sri Murugan Traders & Co',
    amount: 9990,
    currency: 'INR',
    paymentMethod: 'Credit Card',
    paymentProvider: 'Razorpay',
    status: 'SUCCESSFUL',
    date: '2026-02-10T10:05:00Z',
    invoiceNumber: 'SAAS-INV-2026-0112',
    subscriptionId: 'sub_murugan_biz',
    planName: 'Annual Business Suite',
    billingCycle: 'YEARLY',
    receiptUrl: 'https://billing.kannaku.in/receipts/txn_109350.pdf',
    gatewayRefId: 'pay_rzp_994821034',
    customerEmail: 'murugan.traders@gmail.com',
  },
  {
    id: 'txn_109412',
    organizationId: 'org_chennai_electro',
    organizationName: 'Chennai Electro & Solar Tech',
    amount: 24990,
    currency: 'INR',
    paymentMethod: 'Net Banking',
    paymentProvider: 'Dodo Payments',
    status: 'SUCCESSFUL',
    date: '2026-03-01T09:10:00Z',
    invoiceNumber: 'SAAS-INV-2026-0189',
    subscriptionId: 'sub_electro_ent',
    planName: 'Enterprise Custom',
    billingCycle: 'YEARLY',
    receiptUrl: 'https://billing.kannaku.in/receipts/txn_109412.pdf',
    gatewayRefId: 'dodo_ch_881920194',
    customerEmail: 'accounts@chennaielectro.in',
  },
  {
    id: 'txn_109502',
    organizationId: 'org_karnataka_silks',
    organizationName: 'Karnataka Heritage Silks',
    amount: 599,
    currency: 'INR',
    paymentMethod: 'Credit Card',
    paymentProvider: 'Stripe',
    status: 'FAILED',
    date: '2026-08-24T12:00:00Z',
    subscriptionId: 'sub_karnataka_pro',
    planName: 'Pro Trader (Monthly)',
    billingCycle: 'MONTHLY',
    gatewayRefId: 'ch_3Pf9812401',
    failureReason: 'Card issuer declined: Insufficient funds / Daily limit exceeded.',
    customerEmail: 'orders@karnatakasilks.com',
  },
  {
    id: 'txn_109520',
    organizationId: 'org_kerala_spices',
    organizationName: 'Malabar Spices & Agro Exports',
    amount: 5990,
    currency: 'INR',
    paymentMethod: 'UPI',
    paymentProvider: 'Razorpay',
    status: 'SUCCESSFUL',
    date: '2026-04-12T10:05:00Z',
    invoiceNumber: 'SAAS-INV-2026-0244',
    subscriptionId: 'sub_malabar_pro',
    planName: 'Pro Trader (Annual)',
    billingCycle: 'YEARLY',
    receiptUrl: 'https://billing.kannaku.in/receipts/txn_109520.pdf',
    gatewayRefId: 'pay_rzp_771920391',
    customerEmail: 'info@malabarspices.co.in',
  },
];

export const INITIAL_COUPONS: SaaSCoupon[] = [
  {
    id: 'cpn_diwali2026',
    code: 'FESTIVE30',
    discountType: 'PERCENTAGE',
    discountValue: 30,
    durationType: 'ANNUAL',
    expiryDate: '2026-11-30T23:59:59Z',
    usageLimit: 500,
    usedCount: 142,
    perUserLimit: 1,
    planRestrictions: ['plan_pro', 'plan_business'],
    status: 'ACTIVE',
    createdOn: '2026-08-01T00:00:00Z',
  },
  {
    id: 'cpn_welcome100',
    code: 'STARTGST',
    discountType: 'FIXED',
    discountValue: 500,
    durationType: 'ONE_TIME',
    expiryDate: '2026-12-31T23:59:59Z',
    usageLimit: 1000,
    usedCount: 388,
    perUserLimit: 1,
    planRestrictions: [],
    status: 'ACTIVE',
    createdOn: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cpn_earlybird',
    code: 'FOUNDER50',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    durationType: 'RECURRING',
    expiryDate: '2026-06-30T00:00:00Z',
    usageLimit: 50,
    usedCount: 50,
    perUserLimit: 1,
    planRestrictions: ['plan_business', 'plan_enterprise'],
    status: 'EXPIRED',
    createdOn: '2026-01-01T00:00:00Z',
  },
];

export const INITIAL_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'ff_tally_v4_pdf',
    key: 'ENABLE_TALLY_V4_PDF_ENGINE',
    name: 'Tally Multi-Copy (Original/Duplicate/Triplicate) PDF Layout',
    description: 'Enables high-precision standard Tally style print engine with terms, bank details & QR codes',
    category: 'Billing',
    scope: 'GLOBAL',
    isEnabledGlobal: true,
    enabledPlans: ['plan_free', 'plan_starter', 'plan_pro', 'plan_business', 'plan_enterprise'],
    targetedOrgIds: [],
    createdOn: '2026-01-10T00:00:00Z',
    updatedOn: '2026-08-20T00:00:00Z',
  },
  {
    id: 'ff_gstr1_export',
    key: 'ENABLE_GSTR1_ADVANCED_AUDIT',
    name: 'GSTR-1 JSON & Excel Tax Audit Export',
    description: 'Enables HSN summary, B2B, B2CL, and credit note tax tables for direct GST portal filing',
    category: 'GST',
    scope: 'PLAN',
    isEnabledGlobal: false,
    enabledPlans: ['plan_starter', 'plan_pro', 'plan_business', 'plan_enterprise'],
    targetedOrgIds: [],
    createdOn: '2026-01-10T00:00:00Z',
    updatedOn: '2026-08-20T00:00:00Z',
  },
  {
    id: 'ff_stamp_sign',
    key: 'ENABLE_DIGITAL_STAMP_SIGN',
    name: 'Digital Rubber Stamp & Authorized Signatory Overlay',
    description: 'Allow uploading official company seal and authorized signature on thermal and A4 bills',
    category: 'Billing',
    scope: 'GLOBAL',
    isEnabledGlobal: true,
    enabledPlans: ['plan_starter', 'plan_pro', 'plan_business', 'plan_enterprise'],
    targetedOrgIds: [],
    createdOn: '2026-02-01T00:00:00Z',
    updatedOn: '2026-08-25T00:00:00Z',
  },
  {
    id: 'ff_upi_dynamic_qr',
    key: 'ENABLE_DYNAMIC_UPI_QR_BILLS',
    name: 'Dynamic UPI QR Code Generation on Invoices',
    description: 'Generates instant pay UPI QR with invoice amount and VPA for on-spot settlement',
    category: 'Billing',
    scope: 'GLOBAL',
    isEnabledGlobal: true,
    enabledPlans: ['plan_free', 'plan_starter', 'plan_pro', 'plan_business', 'plan_enterprise'],
    targetedOrgIds: [],
    createdOn: '2026-03-01T00:00:00Z',
    updatedOn: '2026-08-25T00:00:00Z',
  },
  {
    id: 'ff_inventory_stock_alerts',
    key: 'ENABLE_INVENTORY_STOCK_ALERTS',
    name: 'Low Stock Alerts & Real-Time Quantity Deduction',
    description: 'Warns billing clerks when product stock falls below minimum reorder threshold',
    category: 'Billing',
    scope: 'PLAN',
    isEnabledGlobal: false,
    enabledPlans: ['plan_starter', 'plan_pro', 'plan_business', 'plan_enterprise'],
    targetedOrgIds: ['org_hytex_cotton', 'org_chennai_electro'],
    createdOn: '2026-07-15T00:00:00Z',
    updatedOn: '2026-08-25T00:00:00Z',
  },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_8821',
    organizationId: 'org_karnataka_silks',
    organizationName: 'Karnataka Heritage Silks',
    userId: 'usr_karnataka_owner',
    userName: 'Sunita Hegde',
    userEmail: 'orders@karnatakasilks.com',
    subject: 'Renewal payment failed on card, please unlock temporary grace period',
    category: 'Subscription & Payment',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedAdminName: 'Rajaganapathy S.',
    createdDate: '2026-08-24T13:00:00Z',
    lastUpdated: '2026-08-25T09:30:00Z',
    messages: [
      {
        id: 'msg_1',
        senderName: 'Sunita Hegde',
        senderRole: 'USER',
        message: 'Hello Admin, our corporate credit card limit had an issue yesterday during auto-debit. We have updated the card with our bank today. Could you please grant a 3-day grace period so our billing staff is not blocked?',
        timestamp: '2026-08-24T13:00:00Z',
      },
      {
        id: 'msg_2',
        senderName: 'Rajaganapathy S.',
        senderRole: 'ADMIN',
        message: 'Hello Sunita, I have reviewed your account and extended your grace period through August 29. The automated retry is scheduled for tomorrow at 10:00 AM.',
        timestamp: '2026-08-25T09:30:00Z',
      },
    ],
  },
  {
    id: 'tkt_8819',
    organizationId: 'org_hytex_cotton',
    organizationName: 'HYTEX COTTON MILLS',
    userId: 'usr_vasanthi',
    userName: 'K. Vasanthi',
    userEmail: 'hytexcottonmills@gmail.com',
    subject: 'Request assistance with custom rubber stamp generator positioning',
    category: 'Billing & Invoicing',
    priority: 'LOW',
    status: 'RESOLVED',
    assignedAdminName: 'Rajaganapathy S.',
    createdDate: '2026-08-22T10:15:00Z',
    lastUpdated: '2026-08-22T14:20:00Z',
    messages: [
      {
        id: 'msg_3',
        senderName: 'K. Vasanthi',
        senderRole: 'USER',
        message: 'The new stamp preview looks great on A4, but is it possible to center-align the circular authorized signatory text?',
        timestamp: '2026-08-22T10:15:00Z',
      },
      {
        id: 'msg_4',
        senderName: 'Rajaganapathy S.',
        senderRole: 'ADMIN',
        message: 'We have pushed an update with fine-tuned SVG vector arcs for the circular stamp. You can re-generate it in Settings.',
        timestamp: '2026-08-22T14:20:00Z',
      },
    ],
  },
  {
    id: 'tkt_8830',
    organizationId: 'org_apex_logistics',
    organizationName: 'Apex Logistics & Freight Corp',
    userId: 'usr_apex_finance',
    userName: 'Rohan Deshmukh',
    userEmail: 'finance@apexlogistics.in',
    subject: 'Interested in upgrading to Annual Enterprise for 10 users',
    category: 'Subscription & Payment',
    priority: 'MEDIUM',
    status: 'OPEN',
    createdDate: '2026-08-25T18:00:00Z',
    lastUpdated: '2026-08-25T18:00:00Z',
    messages: [
      {
        id: 'msg_5',
        senderName: 'Rohan Deshmukh',
        senderRole: 'USER',
        message: 'We are enjoying the trial and have tested our e-Way bills. We would like to convert our trial to Enterprise Annual with invoice PO billing. Please share bank NEFT details.',
        timestamp: '2026-08-25T18:00:00Z',
      },
    ],
  },
];

export const INITIAL_ANNOUNCEMENTS: PlatformAnnouncement[] = [
  {
    id: 'ann_gst_portal_aug2026',
    title: 'GST Portal Scheduled Maintenance — Aug 28 (00:00 - 04:00 IST)',
    message: 'The GST System Portal will undergo scheduled server maintenance this Thursday. e-Way bill and GSTR-1 real-time validation will be queued automatically.',
    type: 'INFO',
    startDate: '2026-08-25T00:00:00Z',
    endDate: '2026-08-29T23:59:59Z',
    targetAudience: 'ALL',
    isActive: true,
    isDismissible: true,
    createdOn: '2026-08-25T00:00:00Z',
  },
  {
    id: 'ann_tally_v4_engine',
    title: 'New Feature: Tally-Style Multi-Copy Invoice PDF Printing Engine Released',
    message: 'You can now print Original for Recipient, Duplicate for Transporter, and Triplicate for Supplier in high-definition vector A4 format with integrated digital stamp & signature.',
    type: 'UPDATE',
    startDate: '2026-08-20T00:00:00Z',
    endDate: '2026-09-10T23:59:59Z',
    targetAudience: 'ALL',
    isActive: true,
    isDismissible: true,
    createdOn: '2026-08-20T00:00:00Z',
  },
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl_welcome',
    key: 'WELCOME_EMAIL',
    name: 'Welcome to Kannaku SaaS',
    subject: 'Welcome to {{saas_name}} — Set up your GST Billing in 2 minutes',
    description: 'Sent immediately when a new business registers their account',
    variables: ['business_name', 'owner_name', 'saas_name', 'login_url', 'support_email'],
    bodyHtml: `<h2>Welcome to {{saas_name}}, {{owner_name}}!</h2>
<p>Thank you for choosing {{saas_name}} to streamline your GST invoicing, customer ledgers, and inventory management for <strong>{{business_name}}</strong>.</p>
<p><a href="{{login_url}}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Access Your Workspace</a></p>
<p>Need assistance? Contact our dedicated support desk at {{support_email}}.</p>`,
    isEnabled: true,
    lastEdited: '2026-08-20T10:00:00Z',
  },
  {
    id: 'tmpl_payment_success',
    key: 'PAYMENT_SUCCESS',
    name: 'Subscription Payment Receipt',
    subject: 'Payment Successful — {{saas_name}} Invoice #{{invoice_number}}',
    description: 'Sent upon successful subscription purchase or renewal',
    variables: ['business_name', 'amount', 'plan_name', 'expiry_date', 'receipt_url', 'invoice_number'],
    bodyHtml: `<h2>Payment Confirmation</h2>
<p>Dear {{business_name}},</p>
<p>We have successfully processed your payment of <strong>₹{{amount}}</strong> for your <strong>{{plan_name}}</strong> subscription.</p>
<p>Your subscription is active through <strong>{{expiry_date}}</strong>.</p>
<p><a href="{{receipt_url}}" style="display:inline-block;padding:10px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Download Tax Invoice</a></p>`,
    isEnabled: true,
    lastEdited: '2026-08-20T10:00:00Z',
  },
  {
    id: 'tmpl_trial_expiring',
    key: 'TRIAL_EXPIRING',
    name: 'Trial Expiring Reminder',
    subject: 'Your {{saas_name}} Free Trial is ending in {{days_left}} days',
    description: 'Sent 3 days and 1 day before trial expiration',
    variables: ['business_name', 'days_left', 'expiry_date', 'upgrade_url'],
    bodyHtml: `<h2>Keep Your Billing Running Smoothly</h2>
<p>Hi {{business_name}},</p>
<p>Your free trial of {{saas_name}} will expire on <strong>{{expiry_date}}</strong> ({{days_left}} days left).</p>
<p>Upgrade now to ensure zero interruption to your daily tax invoicing and WhatsApp ledger notifications.</p>
<p><a href="{{upgrade_url}}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Upgrade Subscription</a></p>`,
    isEnabled: true,
    lastEdited: '2026-08-20T10:00:00Z',
  },
];

export const INITIAL_IMPERSONATION_SESSIONS: ImpersonationSession[] = [
  {
    id: 'imp_sess_101',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminEmail: 'rajaganapathy2024@gmail.com',
    adminRole: 'SUPER_ADMIN',
    organizationId: 'org_hytex_cotton',
    organizationName: 'HYTEX COTTON MILLS',
    tenantEmail: 'hytexcottonmills@gmail.com',
    tenantOwner: 'K. Vasanthi',
    reason: 'Verified Tiruppur textile GST rates (5% vs 12%) and customized Tally 3-copy invoice header alignment',
    startedAt: '2026-08-25T11:15:00Z',
    endedAt: '2026-08-25T11:28:42Z',
    durationSeconds: 822,
    ipAddress: '103.117.238.12',
    status: 'COMPLETED',
  },
  {
    id: 'imp_sess_102',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminEmail: 'rajaganapathy2024@gmail.com',
    adminRole: 'SUPER_ADMIN',
    organizationId: 'org_sri_murugan',
    organizationName: 'Sri Murugan Traders & Co',
    tenantEmail: 'murugan.traders@gmail.com',
    tenantOwner: 'M. Shanmugam',
    reason: 'Assisted customer with outstanding customer ledger balance reconciliation and WhatsApp reminder test',
    startedAt: '2026-08-24T16:30:00Z',
    endedAt: '2026-08-24T16:41:15Z',
    durationSeconds: 675,
    ipAddress: '103.117.238.12',
    status: 'COMPLETED',
  },
  {
    id: 'imp_sess_103',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminEmail: 'rajaganapathy2024@gmail.com',
    adminRole: 'SUPER_ADMIN',
    organizationId: 'org_kerala_spices',
    organizationName: 'Malabar Spices & Agro Exports',
    tenantEmail: 'info@malabarspices.co.in',
    tenantOwner: 'T. K. Mathew',
    reason: 'Assisted onboarding with multi-rate spice HSN codes and interstate IGST calculation test',
    startedAt: '2026-08-23T09:20:00Z',
    endedAt: '2026-08-23T09:35:10Z',
    durationSeconds: 910,
    ipAddress: '103.117.238.12',
    status: 'COMPLETED',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_991205',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminRole: 'SUPER_ADMIN',
    action: 'START_IMPERSONATION',
    targetType: 'IMPERSONATION',
    targetId: 'org_hytex_cotton',
    targetName: 'HYTEX COTTON MILLS',
    organizationId: 'org_hytex_cotton',
    organizationName: 'HYTEX COTTON MILLS',
    ipAddress: '103.117.238.12',
    timestamp: '2026-08-25T11:15:00Z',
    newValue: 'Support Session: Verified Tiruppur textile GST rates & customized Tally 3-copy invoice header',
    status: 'SUCCESS',
  },
  {
    id: 'aud_991206',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminRole: 'SUPER_ADMIN',
    action: 'EXIT_IMPERSONATION',
    targetType: 'IMPERSONATION',
    targetId: 'org_hytex_cotton',
    targetName: 'HYTEX COTTON MILLS',
    organizationId: 'org_hytex_cotton',
    organizationName: 'HYTEX COTTON MILLS',
    ipAddress: '103.117.238.12',
    timestamp: '2026-08-25T11:28:42Z',
    newValue: 'Exited support session (Duration: 13m 42s)',
    status: 'SUCCESS',
  },
  {
    id: 'aud_991201',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminRole: 'SUPER_ADMIN',
    action: 'UPGRADE_ORGANIZATION_PLAN',
    targetType: 'ORGANIZATION',
    targetId: 'org_sri_murugan',
    targetName: 'Sri Murugan Traders & Co',
    organizationId: 'org_sri_murugan',
    organizationName: 'Sri Murugan Traders & Co',
    ipAddress: '103.117.238.12',
    timestamp: '2026-08-25T14:20:00Z',
    previousValue: 'Starter Business (₹299/mo)',
    newValue: 'Annual Business Suite (₹9,990/yr)',
    status: 'SUCCESS',
  },
  {
    id: 'aud_991202',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminRole: 'SUPER_ADMIN',
    action: 'EXTEND_TRIAL_PERIOD',
    targetType: 'ORGANIZATION',
    targetId: 'org_apex_logistics',
    targetName: 'Apex Logistics & Freight Corp',
    organizationId: 'org_apex_logistics',
    organizationName: 'Apex Logistics & Freight Corp',
    ipAddress: '103.117.238.12',
    timestamp: '2026-08-25T15:00:00Z',
    previousValue: 'Expiry: 2026-08-22',
    newValue: 'Expiry: 2026-08-29 (+7 Days Extended)',
    status: 'SUCCESS',
  },
  {
    id: 'aud_991203',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminRole: 'SUPER_ADMIN',
    action: 'UPDATE_FEATURE_FLAG',
    targetType: 'FEATURE_FLAG',
    targetId: 'ff_wa_reminders',
    targetName: 'ENABLE_WHATSAPP_REMINDERS',
    ipAddress: '103.117.238.12',
    timestamp: '2026-08-25T15:45:00Z',
    previousValue: 'Enabled for PRO, BUSINESS',
    newValue: 'Enabled Globally for all paid tiers',
    status: 'SUCCESS',
  },
  {
    id: 'aud_991204',
    adminId: 'admin_owner_01',
    adminName: 'Rajaganapathy S.',
    adminRole: 'SUPER_ADMIN',
    action: 'CREATE_PROMOTIONAL_COUPON',
    targetType: 'COUPON',
    targetId: 'cpn_diwali2026',
    targetName: 'FESTIVE30',
    ipAddress: '103.117.238.12',
    timestamp: '2026-08-25T16:10:00Z',
    newValue: '30% Off Annual Plans (Max 500 Redemptions)',
    status: 'SUCCESS',
  },
];

export const INITIAL_ERROR_LOGS: SystemErrorLog[] = [
  {
    id: 'err_502_card',
    errorType: 'PaymentGatewayFailure',
    message: 'Card recurring mandate declined with code 502_INSUFFICIENT_FUNDS',
    organizationId: 'org_karnataka_silks',
    organizationName: 'Karnataka Heritage Silks',
    userEmail: 'orders@karnatakasilks.com',
    endpoint: 'POST /api/v1/billing/subscriptions/charge',
    httpStatus: 402,
    firstSeen: '2026-08-24T18:12:00Z',
    lastSeen: '2026-08-25T03:40:00Z',
    occurrences: 3,
    status: 'RESOLVED',
    stackTrace: 'PaymentError: Card mandate failed at PaymentGatewayService.chargeCardMandate (/server/services/billing.ts:184:22)',
  },
  {
    id: 'err_422_gstin',
    errorType: 'GSTINValidationWarning',
    message: 'GSTIN portal checksum mismatch during customer master bulk import',
    organizationId: 'org_apex_logistics',
    organizationName: 'Apex Logistics & Freight Corp',
    userEmail: 'finance@apexlogistics.in',
    endpoint: 'POST /api/v1/tenants/apex-logistics/customers/import',
    httpStatus: 422,
    firstSeen: '2026-08-25T11:00:00Z',
    lastSeen: '2026-08-25T11:22:00Z',
    occurrences: 2,
    status: 'INVESTIGATING',
    stackTrace: 'ValidationError: Invalid 15-character GSTIN state code checksum at validateGSTIN (/src/utils/gstCalculations.ts:45:10)',
  },
];

export const SUBSYSTEMS_HEALTH: SubsystemStatus[] = [
  {
    name: 'Core Application API Gateway',
    category: 'Core API',
    status: 'HEALTHY',
    responseTimeMs: 38,
    uptimePercentage: 99.98,
    details: 'Serving 4,200 req/min across Asia-South edge cluster.',
  },
  {
    name: 'Multi-Tenant PostgreSQL Database',
    category: 'Database',
    status: 'HEALTHY',
    responseTimeMs: 14,
    uptimePercentage: 99.99,
    details: 'PgBouncer connection pool healthy. 48 active connections.',
  },
  {
    name: 'Authentication & Session Auth',
    category: 'Authentication',
    status: 'HEALTHY',
    responseTimeMs: 22,
    uptimePercentage: 100.0,
    details: 'JWT validation & 2FA verifications operational.',
  },
  {
    name: 'Encrypted Storage & Invoice CDN',
    category: 'Storage & CDN',
    status: 'HEALTHY',
    responseTimeMs: 45,
    uptimePercentage: 99.95,
    details: 'S3-compatible object store 24.2 GB consumed.',
  },
  {
    name: 'Cashfree & Razorpay Gateway Webhooks',
    category: 'Payment Gateways',
    status: 'HEALTHY',
    responseTimeMs: 110,
    uptimePercentage: 99.94,
    details: 'Webhook queue processing with 0 dropped events.',
  },
  {
    name: 'Email SMTP Dispatcher (Amazon SES)',
    category: 'Email SMTP',
    status: 'HEALTHY',
    responseTimeMs: 85,
    uptimePercentage: 99.9,
    details: 'Delivery rate 99.8%. Bounce rate 0.04%.',
  },
  {
    name: 'Meta WhatsApp Business Cloud API',
    category: 'WhatsApp Business API',
    status: 'HEALTHY',
    responseTimeMs: 140,
    uptimePercentage: 99.7,
    lastIncident: '2026-08-24 (Minor socket delay)',
    details: 'Direct messaging and wa.me invoice links active.',
  },
];

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  general: {
    saasName: 'Kannaku Cloud Billing SaaS',
    tagline: 'Enterprise GST Invoicing, Customer Ledgers & Accounting Platform',
    supportEmail: 'support@kannaku.in',
    supportPhone: '+91 88707 96169',
    defaultCurrency: 'INR (₹)',
    defaultCountry: 'India',
    timezone: 'Asia/Kolkata (IST +5:30)',
  },
  billing: {
    defaultCurrency: 'INR',
    gstTaxPercentage: 18,
    trialDurationDays: 14,
    gracePeriodDays: 5,
    invoicePrefix: 'SAAS-INV-2026-',
    enableAutoDunning: true,
    retryFailedPaymentsCount: 3,
  },
  email: {
    smtpHost: 'email-smtp.ap-south-1.amazonaws.com',
    smtpPort: 587,
    smtpUser: 'AKIAIOSFODNN7EXAMPLE',
    smtpSecure: true,
    senderName: 'Kannaku Billing Platform',
    senderEmail: 'notifications@kannaku.in',
    enableEmailDelivery: true,
  },
  notifications: {
    notifyOnPaymentSuccess: true,
    notifyOnPaymentFailed: true,
    notifyOnTrialExpiring: true,
    notifyOnNewSignup: true,
    adminNotificationEmail: 'rajaganapathy235@gmail.com',
    slackWebhookUrl: 'https://hooks.slack.com/services/T00/B00/XXXXXX',
  },
  security: {
    sessionTimeoutMinutes: 60,
    enforcePasswordComplexity: true,
    maxLoginAttempts: 5,
    requireTwoFactorForAdmins: true,
    allowedAdminIpRanges: ['0.0.0.0/0'],
    enableImpersonationAuditLock: true,
  },
};

// Master Admin Data Manager
export class SaaSAdminDB {
  static getPortalMode(): 'CUSTOMER' | 'ADMIN' {
    return (localStorage.getItem(STORAGE_KEYS.SUPER_ADMIN_MODE) as any) || 'ADMIN';
  }

  static setPortalMode(mode: 'CUSTOMER' | 'ADMIN'): void {
    localStorage.setItem(STORAGE_KEYS.SUPER_ADMIN_MODE, mode);
  }

  static getActiveAdminUser(): AdminUser {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      return data ? JSON.parse(data) : INITIAL_ADMIN_USER;
    } catch {
      return INITIAL_ADMIN_USER;
    }
  }

  static saveActiveAdminUser(user: AdminUser): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
  }

  static getActiveAdminRole(): AdminRole {
    return (localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE) as AdminRole) || 'SUPER_ADMIN';
  }

  static setActiveAdminRole(role: AdminRole): void {
    localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, role);
    const user = this.getActiveAdminUser();
    this.saveActiveAdminUser({ ...user, role });
  }

  static getImpersonatedOrgId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.IMPERSONATED_ORG) || null;
  }

  static setImpersonatedOrgId(orgId: string | null): void {
    if (orgId) {
      localStorage.setItem(STORAGE_KEYS.IMPERSONATED_ORG, orgId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.IMPERSONATED_ORG);
    }
  }

  // Organizations
  static getOrganizations(): TenantOrganizationFull[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
      return data ? JSON.parse(data) : INITIAL_ORGANIZATIONS;
    } catch {
      return INITIAL_ORGANIZATIONS;
    }
  }

  static saveOrganizations(orgs: TenantOrganizationFull[]): void {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
  }

  static saveOrganization(org: TenantOrganizationFull): void {
    const list = this.getOrganizations();
    const idx = list.findIndex((o) => o.id === org.id);
    if (idx >= 0) {
      list[idx] = org;
    } else {
      list.unshift(org);
    }
    this.saveOrganizations(list);

    // Synchronize company profile if this is the active tenant
    const activeTenantId = KannakuDB.getActiveTenantId();
    if (activeTenantId === org.id || org.id === 'org_hytex_cotton') {
      const company = KannakuDB.getCompanyProfile();
      KannakuDB.saveCompanyProfile({
        ...company,
        name: org.name,
        email: org.adminEmail,
        mobile: org.mobile,
        registerNumber: org.registerNumber,
      });
    }
  }

  static deleteOrganization(id: string): void {
    const list = this.getOrganizations().filter((o) => o.id !== id);
    this.saveOrganizations(list);
  }

  // Plans
  static getPlans(): SaaSPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANS);
      return data ? JSON.parse(data) : DEFAULT_PLANS;
    } catch {
      return DEFAULT_PLANS;
    }
  }

  static savePlans(plans: SaaSPlan[]): void {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }

  static savePlan(plan: SaaSPlan): void {
    const list = this.getPlans();
    const idx = list.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      list[idx] = plan;
    } else {
      list.push(plan);
    }
    this.savePlans(list);
  }

  static deletePlan(id: string): void {
    const list = this.getPlans().filter((p) => p.id !== id);
    this.savePlans(list);
  }

  // Users
  static getUsers(): PlatformUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: PlatformUser[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static saveUser(user: PlatformUser): void {
    const list = this.getUsers();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      list[idx] = user;
    } else {
      list.unshift(user);
    }
    this.saveUsers(list);
  }

  static deleteUser(id: string): void {
    const list = this.getUsers().filter((u) => u.id !== id);
    this.saveUsers(list);
  }

  // Transactions
  static getTransactions(): SaaSTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  }

  static saveTransactions(txns: SaaSTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  }

  static saveTransaction(txn: SaaSTransaction): void {
    const list = this.getTransactions();
    const idx = list.findIndex((t) => t.id === txn.id);
    if (idx >= 0) {
      list[idx] = txn;
    } else {
      list.unshift(txn);
    }
    this.saveTransactions(list);
  }

  // Coupons
  static getCoupons(): SaaSCoupon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return data ? JSON.parse(data) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  }

  static saveCoupons(coupons: SaaSCoupon[]): void {
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(coupons));
  }

  static saveCoupon(coupon: SaaSCoupon): void {
    const list = this.getCoupons();
    const idx = list.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      list[idx] = coupon;
    } else {
      list.unshift(coupon);
    }
    this.saveCoupons(list);
  }

  static deleteCoupon(id: string): void {
    const list = this.getCoupons().filter((c) => c.id !== id);
    this.saveCoupons(list);
  }

  // Feature Flags
  static getFeatureFlags(): FeatureFlag[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FEATURE_FLAGS);
      return data ? JSON.parse(data) : INITIAL_FEATURE_FLAGS;
    } catch {
      return INITIAL_FEATURE_FLAGS;
    }
  }

  static saveFeatureFlags(flags: FeatureFlag[]): void {
    localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(flags));
  }

  static saveFeatureFlag(flag: FeatureFlag): void {
    const list = this.getFeatureFlags();
    const idx = list.findIndex((f) => f.id === flag.id);
    if (idx >= 0) {
      list[idx] = flag;
    } else {
      list.push(flag);
    }
    this.saveFeatureFlags(list);
  }

  // Support Tickets
  static getSupportTickets(): SupportTicket[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPORT_TICKETS);
      return data ? JSON.parse(data) : INITIAL_SUPPORT_TICKETS;
    } catch {
      return INITIAL_SUPPORT_TICKETS;
    }
  }

  static saveSupportTickets(tickets: SupportTicket[]): void {
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(tickets));
  }

  static saveSupportTicket(ticket: SupportTicket): void {
    const list = this.getSupportTickets();
    const idx = list.findIndex((t) => t.id === ticket.id);
    if (idx >= 0) {
      list[idx] = ticket;
    } else {
      list.unshift(ticket);
    }
    this.saveSupportTickets(list);
  }

  // Announcements
  static getAnnouncements(): PlatformAnnouncement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return data ? JSON.parse(data) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  }

  static saveAnnouncements(announcements: PlatformAnnouncement[]): void {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }

  static saveAnnouncement(announcement: PlatformAnnouncement): void {
    const list = this.getAnnouncements();
    const idx = list.findIndex((a) => a.id === announcement.id);
    if (idx >= 0) {
      list[idx] = announcement;
    } else {
      list.unshift(announcement);
    }
    this.saveAnnouncements(list);
  }

  static deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter((a) => a.id !== id);
    this.saveAnnouncements(list);
  }

  // Email Templates
  static getEmailTemplates(): EmailTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMAIL_TEMPLATES);
      return data ? JSON.parse(data) : INITIAL_EMAIL_TEMPLATES;
    } catch {
      return INITIAL_EMAIL_TEMPLATES;
    }
  }

  static saveEmailTemplates(templates: EmailTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.EMAIL_TEMPLATES, JSON.stringify(templates));
  }

  static saveEmailTemplate(template: EmailTemplate): void {
    const list = this.getEmailTemplates();
    const idx = list.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      list[idx] = template;
    } else {
      list.push(template);
    }
    this.saveEmailTemplates(list);
  }

  // Audit Logs
  static getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  static saveAuditLogs(logs: AuditLogEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  static logAction(
    action: string,
    targetType: string,
    targetId: string,
    targetName: string,
    details?: {
      orgId?: string;
      orgName?: string;
      prevVal?: string;
      newVal?: string;
      status?: 'SUCCESS' | 'FAILED';
      [key: string]: any;
    }
  ): void {
    const admin = this.getActiveAdminUser();
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      adminId: admin.id,
      adminName: admin.name,
      adminRole: admin.role,
      action,
      targetType: targetType as any,
      targetId,
      targetName,
      organizationId: details?.orgId,
      organizationName: details?.orgName,
      ipAddress: '103.117.238.12 (Admin Session)',
      timestamp: new Date().toISOString(),
      previousValue: details?.prevVal,
      newValue: details?.newVal,
      status: details?.status || 'SUCCESS',
    };

    const logs = this.getAuditLogs();
    logs.unshift(newEntry);
    this.saveAuditLogs(logs);
  }

  // Error Logs
  static getErrorLogs(): SystemErrorLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ERROR_LOGS);
      return data ? JSON.parse(data) : INITIAL_ERROR_LOGS;
    } catch {
      return INITIAL_ERROR_LOGS;
    }
  }

  static saveErrorLogs(errors: SystemErrorLog[]): void {
    localStorage.setItem(STORAGE_KEYS.ERROR_LOGS, JSON.stringify(errors));
  }

  static saveErrorLog(error: SystemErrorLog): void {
    const list = this.getErrorLogs();
    const idx = list.findIndex((e) => e.id === error.id);
    if (idx >= 0) {
      list[idx] = error;
    } else {
      list.unshift(error);
    }
    this.saveErrorLogs(list);
  }

  static resolveErrorLog(id: string): void {
    const list = this.getErrorLogs().map((err) =>
      err.id === id ? { ...err, status: 'RESOLVED' as const } : err
    );
    this.saveErrorLogs(list);
  }

  // System Health
  static getSystemHealth(): SubsystemStatus[] {
    return SUBSYSTEMS_HEALTH;
  }

  // Impersonation State Query & Session History
  static getImpersonationSessions(): ImpersonationSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.IMPERSONATION_SESSIONS);
      return data ? JSON.parse(data) : INITIAL_IMPERSONATION_SESSIONS;
    } catch {
      return INITIAL_IMPERSONATION_SESSIONS;
    }
  }

  static saveImpersonationSessions(sessions: ImpersonationSession[]): void {
    localStorage.setItem(STORAGE_KEYS.IMPERSONATION_SESSIONS, JSON.stringify(sessions));
  }

  static getActiveImpersonationSession(): ImpersonationSession | null {
    const sessions = this.getImpersonationSessions();
    const orgId = this.getImpersonatedOrgId();
    if (!orgId) return null;
    return sessions.find((s) => s.organizationId === orgId && s.status === 'ACTIVE') || null;
  }

  static getActiveImpersonation(): {
    isImpersonating: boolean;
    organizationId: string;
    organizationName: string;
    adminName: string;
    adminEmail: string;
    startedAt: string;
    reason?: string;
  } | null {
    const orgId = this.getImpersonatedOrgId();
    if (!orgId) return null;
    const org = this.getOrganizations().find((o) => o.id === orgId);
    if (!org) return null;
    const admin = this.getActiveAdminUser();
    const activeSession = this.getActiveImpersonationSession();
    return {
      isImpersonating: true,
      organizationId: org.id,
      organizationName: org.name,
      adminName: admin.name,
      adminEmail: admin.email,
      startedAt: activeSession?.startedAt || new Date().toISOString(),
      reason: activeSession?.reason,
    };
  }

  // Platform Settings
  static getPlatformSettings(): PlatformSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_PLATFORM_SETTINGS;
    } catch {
      return DEFAULT_PLATFORM_SETTINGS;
    }
  }

  static savePlatformSettings(settings: PlatformSettings): void {
    localStorage.setItem(STORAGE_KEYS.PLATFORM_SETTINGS, JSON.stringify(settings));
  }

  // Payment Gateways Management
  static getPaymentGatewaysConfig(): SaaSGatewayManagerConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_GATEWAYS);
      if (!data) return DEFAULT_PAYMENT_GATEWAYS;
      const parsed = JSON.parse(data);
      // Ensure all gateways exist in case of partial upgrade
      return {
        activeProvider: parsed.activeProvider || DEFAULT_PAYMENT_GATEWAYS.activeProvider,
        gateways: {
          ...DEFAULT_PAYMENT_GATEWAYS.gateways,
          ...(parsed.gateways || {}),
        },
      };
    } catch {
      return DEFAULT_PAYMENT_GATEWAYS;
    }
  }

  static savePaymentGatewaysConfig(config: SaaSGatewayManagerConfig): void {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_GATEWAYS, JSON.stringify(config));
  }

  static getActivePaymentGateway(): PaymentGatewayConfig {
    const manager = this.getPaymentGatewaysConfig();
    return manager.gateways[manager.activeProvider] || manager.gateways.dodopayments;
  }

  static setActivePaymentGateway(provider: PaymentGatewayProvider): void {
    const manager = this.getPaymentGatewaysConfig();
    manager.activeProvider = provider;
    this.savePaymentGatewaysConfig(manager);
    this.logAction(
      'CHANGE_ACTIVE_PAYMENT_GATEWAY',
      'SETTING',
      provider,
      provider.toUpperCase(),
      { newVal: `Active SaaS Payment Gateway switched to ${provider}` }
    );
  }

  static updateGatewayConfig(provider: PaymentGatewayProvider, partial: Partial<PaymentGatewayConfig>): void {
    const manager = this.getPaymentGatewaysConfig();
    manager.gateways[provider] = {
      ...manager.gateways[provider],
      ...partial,
    };
    this.savePaymentGatewaysConfig(manager);
    this.logAction(
      'UPDATE_GATEWAY_CONFIG',
      'SETTING',
      provider,
      manager.gateways[provider].name,
      { newVal: `Updated credentials / config for ${provider}` }
    );
  }

  // Impersonation Handler
  static startImpersonation(orgId: string, reason?: string, supportTicketId?: string): ImpersonationSession | null {
    const org = this.getOrganizations().find((o) => o.id === orgId);
    if (!org) return null;

    const admin = this.getActiveAdminUser();
    const sessionId = `imp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const sessionReason = reason?.trim() || 'Support & Troubleshooting Session';

    const newSession: ImpersonationSession = {
      id: sessionId,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      adminRole: admin.role,
      organizationId: org.id,
      organizationName: org.name,
      tenantEmail: org.adminEmail,
      tenantOwner: org.ownerName,
      reason: sessionReason,
      supportTicketId,
      startedAt: new Date().toISOString(),
      ipAddress: '103.117.238.12 (Admin Secure Terminal)',
      status: 'ACTIVE',
    };

    // Close any previous active sessions
    const sessions = this.getImpersonationSessions().map((s) =>
      s.status === 'ACTIVE'
        ? {
            ...s,
            status: 'COMPLETED' as const,
            endedAt: new Date().toISOString(),
            durationSeconds: Math.max(1, Math.round((Date.now() - new Date(s.startedAt).getTime()) / 1000)),
          }
        : s
    );
    sessions.unshift(newSession);
    this.saveImpersonationSessions(sessions);

    this.setImpersonatedOrgId(orgId);
    this.logAction(
      'START_IMPERSONATION',
      'IMPERSONATION',
      org.id,
      org.name,
      {
        orgId: org.id,
        orgName: org.name,
        newVal: `Support Session: ${sessionReason} (Operator: ${admin.name})`,
      }
    );

    // Switch active workspace in customer client
    const currentProfile = KannakuDB.getCompanyProfile();
    KannakuDB.saveCompanyProfile({
      ...currentProfile,
      name: org.name,
      email: org.adminEmail,
      mobile: org.mobile,
      registerNumber: org.registerNumber,
      city: org.city,
      state: org.state,
    });
    KannakuDB.setActiveTenantId(org.id);
    this.setPortalMode('CUSTOMER');

    return newSession;
  }

  static stopImpersonation(): void {
    const orgId = this.getImpersonatedOrgId();
    const org = orgId ? this.getOrganizations().find((o) => o.id === orgId) : null;
    const nowIso = new Date().toISOString();

    const sessions = this.getImpersonationSessions();
    let elapsedSeconds = 0;
    const updatedSessions = sessions.map((s) => {
      if (s.status === 'ACTIVE' && (!orgId || s.organizationId === orgId)) {
        const duration = Math.max(1, Math.round((Date.now() - new Date(s.startedAt).getTime()) / 1000));
        elapsedSeconds = duration;
        return {
          ...s,
          endedAt: nowIso,
          durationSeconds: duration,
          status: 'COMPLETED' as const,
        };
      }
      return s;
    });
    this.saveImpersonationSessions(updatedSessions);

    if (org) {
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      this.logAction(
        'EXIT_IMPERSONATION',
        'IMPERSONATION',
        org.id,
        org.name,
        {
          orgId: org.id,
          orgName: org.name,
          newVal: `Exited Support Session safely (Duration: ${durationStr})`,
        }
      );
    }

    this.setImpersonatedOrgId(null);
    this.setPortalMode('ADMIN');
  }

  static deleteImpersonationSession(sessionId: string): void {
    const sessions = this.getImpersonationSessions().filter((s) => s.id !== sessionId);
    this.saveImpersonationSessions(sessions);
  }

  static clearImpersonationHistory(): void {
    this.saveImpersonationSessions([]);
  }

  // KPI Calculations
  static getDashboardStats(): SuperAdminDashboardStats {
    const orgs = this.getOrganizations();
    const users = this.getUsers();
    const txns = this.getTransactions();
    const tickets = this.getSupportTickets();

    const activeOrgs = orgs.filter((o) => o.accountStatus === 'ACTIVE' && o.subscriptionStatus === 'ACTIVE').length;
    const trialOrgs = orgs.filter((o) => o.subscriptionStatus === 'TRIAL').length;
    const suspendedOrgs = orgs.filter((o) => o.accountStatus === 'SUSPENDED' || o.accountStatus === 'DISABLED').length;

    const totalMRR = orgs
      .filter((o) => o.accountStatus === 'ACTIVE' && o.subscriptionStatus === 'ACTIVE')
      .reduce((sum, o) => sum + (o.mrr || 0), 0);

    const totalARR = totalMRR * 12;

    const revenueThisMonth = txns
      .filter((t) => t.status === 'SUCCESSFUL')
      .reduce((sum, t) => sum + t.amount, 0);

    const failedPayments = txns.filter((t) => t.status === 'FAILED').length;
    const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

    return {
      totalOrganizations: orgs.length,
      activeOrganizations: activeOrgs,
      trialOrganizations: trialOrgs,
      suspendedOrganizations: suspendedOrgs,
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'ACTIVE').length,
      monthlyRecurringRevenue: totalMRR,
      annualRecurringRevenue: totalARR,
      revenueThisMonth: revenueThisMonth,
      revenueLastMonth: Math.round(revenueThisMonth * 0.86),
      newSignupsThisMonth: 8,
      churnedOrganizationsThisMonth: 1,
      failedPaymentsCount: failedPayments,
      openSupportTickets: openTickets,
      mrrGrowthPct: 16.4,
      trialToPaidConversionPct: 68.2,
    };
  }

  // Database Export Helper
  static exportEntirePlatformData(format: 'JSON' | 'CSV', entity?: string): string {
    if (format === 'JSON') {
      const backup = {
        platform: 'Kannaku SaaS Super Admin',
        version: '8.0.0-enterprise',
        exportedAt: new Date().toISOString(),
        organizations: this.getOrganizations(),
        plans: this.getPlans(),
        users: this.getUsers(),
        transactions: this.getTransactions(),
        coupons: this.getCoupons(),
        featureFlags: this.getFeatureFlags(),
        supportTickets: this.getSupportTickets(),
        announcements: this.getAnnouncements(),
        emailTemplates: this.getEmailTemplates(),
        impersonationSessions: this.getImpersonationSessions(),
        auditLogs: this.getAuditLogs(),
        errorLogs: this.getErrorLogs(),
        platformSettings: this.getPlatformSettings(),
      };
      return JSON.stringify(backup, null, 2);
    }

    if (entity === 'impersonations') {
      const sessions = this.getImpersonationSessions();
      const headers = ['ID', 'AdminName', 'AdminEmail', 'AdminRole', 'TenantOrg', 'TenantEmail', 'Reason', 'StartedAt', 'EndedAt', 'DurationSec', 'Status', 'IPAddress'];
      const rows = sessions.map((s) => [
        s.id,
        `"${s.adminName}"`,
        s.adminEmail,
        s.adminRole,
        `"${s.organizationName}"`,
        s.tenantEmail,
        `"${s.reason?.replace(/"/g, '""') || ''}"`,
        s.startedAt,
        s.endedAt || '',
        s.durationSeconds || '',
        s.status,
        `"${s.ipAddress}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (entity === 'audit_logs') {
      const logs = this.getAuditLogs();
      const headers = ['ID', 'Timestamp', 'AdminName', 'AdminRole', 'Action', 'TargetType', 'TargetName', 'OrgName', 'Details', 'Status', 'IPAddress'];
      const rows = logs.map((l) => [
        l.id,
        l.timestamp,
        `"${l.adminName}"`,
        l.adminRole,
        l.action,
        l.targetType,
        `"${l.targetName}"`,
        `"${l.organizationName || ''}"`,
        `"${(l.newValue || '').replace(/"/g, '""')}"`,
        l.status,
        `"${l.ipAddress}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    // CSV format for specific entity
    if (entity === 'organizations' || !entity) {
      const orgs = this.getOrganizations();
      const headers = ['ID', 'Name', 'Owner', 'Email', 'Mobile', 'GSTIN', 'Plan', 'SubStatus', 'AccStatus', 'MRR_INR', 'Users', 'Invoices', 'CreatedDate'];
      const rows = orgs.map((o) => [
        o.id,
        `"${o.name}"`,
        `"${o.ownerName}"`,
        o.adminEmail,
        o.mobile,
        o.registerNumber,
        o.planName,
        o.subscriptionStatus,
        o.accountStatus,
        o.mrr,
        o.usersCount,
        o.usage.invoicesCreated,
        o.createdDate,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    if (entity === 'transactions') {
      const txns = this.getTransactions();
      const headers = ['ID', 'Organization', 'Amount', 'Currency', 'Method', 'Provider', 'Status', 'Date', 'SubscriptionId'];
      const rows = txns.map((t) => [
        t.id,
        `"${t.organizationName}"`,
        t.amount,
        t.currency,
        t.paymentMethod,
        t.paymentProvider,
        t.status,
        t.date,
        t.subscriptionId,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return '';
  }
}
