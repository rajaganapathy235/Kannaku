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
import { ApiService } from './apiService';

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
  activeProvider: 'payu',
  gateways: {
    payu: {
      provider: 'payu',
      name: 'PayU India Gateway',
      isEnabled: true,
      isTestMode: false,
      payuMerchantKey: 'PAYU_MKEY_9841289',
      payuMerchantSalt: 'payu_salt_live_9a87d6f5e4c3b2a1',
      payuHeaderAuthKey: 'payu_auth_sec_892kln49f0',
    },
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
    monthlyPriceInr: 99,
    sixMonthPriceInr: 474,
    threeMonthPriceInr: 237,
    yearlyPriceInr: 588,
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

export const INITIAL_ORGANIZATIONS: TenantOrganizationFull[] = [];
export const INITIAL_USERS: PlatformUser[] = [];
export const INITIAL_TRANSACTIONS: SaaSTransaction[] = [];
export const INITIAL_COUPONS: SaaSCoupon[] = [];

export const INITIAL_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'ff_tally_v4_pdf',
    key: 'ENABLE_TALLY_V4_PDF_ENGINE',
    name: 'Tally Multi-Copy (Original/Duplicate/Triplicate) PDF Layout',
    description: 'Enables high-precision standard Tally style print engine with terms, bank details & QR codes',
    category: 'Billing',
    scope: 'GLOBAL',
    isEnabledGlobal: true,
    enabledPlans: ['plan_all_in_one_pro'],
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
    enabledPlans: ['plan_all_in_one_pro'],
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
    enabledPlans: ['plan_all_in_one_pro'],
    targetedOrgIds: [],
    createdOn: '2026-03-01T00:00:00Z',
    updatedOn: '2026-08-25T00:00:00Z',
  },
];

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [];
export const INITIAL_ANNOUNCEMENTS: PlatformAnnouncement[] = [];

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
];

export const INITIAL_IMPERSONATION_SESSIONS: ImpersonationSession[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
export const INITIAL_ERROR_LOGS: SystemErrorLog[] = [];

export const SUBSYSTEMS_HEALTH: SubsystemStatus[] = [
  {
    name: 'Cloudflare Workers Edge API',
    category: 'Core API',
    status: 'HEALTHY',
    responseTimeMs: 28,
    uptimePercentage: 100.0,
    details: 'Serving globally distributed serverless requests with sub-50ms latency.',
  },
  {
    name: 'Cloudflare D1 Relational Database',
    category: 'Database',
    status: 'HEALTHY',
    responseTimeMs: 12,
    uptimePercentage: 100.0,
    details: 'D1 serverless SQLite cluster active and synchronized.',
  },
  {
    name: 'Authentication & PBKDF2 Hashing',
    category: 'Authentication',
    status: 'HEALTHY',
    responseTimeMs: 18,
    uptimePercentage: 100.0,
    details: 'HMAC-SHA256 JWT tokens & PBKDF2 password derivation operational.',
  },
  {
    name: 'Payment Gateways & Webhooks',
    category: 'Payment Gateways',
    status: 'HEALTHY',
    responseTimeMs: 45,
    uptimePercentage: 99.98,
    details: 'PayU India & Dodo Payments ready to process checkouts.',
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
    trialDurationDays: 7,
    gracePeriodDays: 3,
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
    slackWebhookUrl: '',
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

  static isSuperAdmin(): boolean {
    try {
      const raw = localStorage.getItem('kannaku_auth_session_v1');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed?.user?.role === 'SUPER_ADMIN';
    } catch {
      return false;
    }
  }

  /**
   * Complete Database Synchronization:
   * Fetches real records from Cloudflare D1 via /api/admin/* endpoints
   * and synchronizes the local cache.
   */
  static async syncWithDatabase(): Promise<boolean> {
    if (!this.isSuperAdmin()) {
      return false;
    }
    try {
      const [
        orgsRes,
        usersRes,
        plansRes,
        txnsRes,
        couponsRes,
        flagsRes,
        ticketsRes,
        annRes,
        tmplRes,
        logsRes,
        errsRes,
        sessRes,
      ] = await Promise.allSettled([
        ApiService.getAdminOrganizations(),
        ApiService.getAdminUsers(),
        ApiService.getAdminPlans(),
        ApiService.getAdminTransactions(),
        ApiService.getAdminCoupons(),
        ApiService.getAdminFeatureFlags(),
        ApiService.getAdminSupportTickets(),
        ApiService.getAdminAnnouncements(),
        ApiService.getAdminEmailTemplates(),
        ApiService.getAdminAuditLogs(),
        ApiService.getAdminErrorLogs(),
        ApiService.getAdminImpersonationSessions(),
      ]);

      if (orgsRes.status === 'fulfilled' && orgsRes.value.success && orgsRes.value.data) {
        this.saveOrganizations(orgsRes.value.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.success && usersRes.value.data) {
        this.saveUsers(usersRes.value.data);
      }
      if (plansRes.status === 'fulfilled' && plansRes.value.success && plansRes.value.data) {
        this.savePlans(plansRes.value.data);
      }
      if (txnsRes.status === 'fulfilled' && txnsRes.value.success && txnsRes.value.data) {
        this.saveTransactions(txnsRes.value.data);
      }
      if (couponsRes.status === 'fulfilled' && couponsRes.value.success && couponsRes.value.data) {
        this.saveCoupons(couponsRes.value.data);
      }
      if (flagsRes.status === 'fulfilled' && flagsRes.value.success && flagsRes.value.data) {
        this.saveFeatureFlags(flagsRes.value.data);
      }
      if (ticketsRes.status === 'fulfilled' && ticketsRes.value.success && ticketsRes.value.data) {
        this.saveSupportTickets(ticketsRes.value.data);
      }
      if (annRes.status === 'fulfilled' && annRes.value.success && annRes.value.data) {
        this.saveAnnouncements(annRes.value.data);
      }
      if (tmplRes.status === 'fulfilled' && tmplRes.value.success && tmplRes.value.data) {
        this.saveEmailTemplates(tmplRes.value.data);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.success && logsRes.value.data) {
        this.saveAuditLogs(logsRes.value.data);
      }
      if (errsRes.status === 'fulfilled' && errsRes.value.success && errsRes.value.data) {
        this.saveErrorLogs(errsRes.value.data);
      }
      if (sessRes.status === 'fulfilled' && sessRes.value.success && sessRes.value.data) {
        this.saveImpersonationSessions(sessRes.value.data);
      }

      return true;
    } catch (err) {
      console.warn('[SaaSAdminDB] Sync with database warning:', err);
      return false;
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

  static async getOrganizationsAsync(): Promise<TenantOrganizationFull[]> {
    if (!this.isSuperAdmin()) return this.getOrganizations();
    const res = await ApiService.getAdminOrganizations();
    if (res.success && res.data) {
      this.saveOrganizations(res.data);
      return res.data;
    }
    return this.getOrganizations();
  }

  static saveOrganizations(orgs: TenantOrganizationFull[]): void {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATIONS, JSON.stringify(orgs));
  }

  static saveOrganization(org: TenantOrganizationFull): void {
    const list = this.getOrganizations();
    const idx = list.findIndex((o) => o.id === org.id);
    if (idx >= 0) {
      list[idx] = org;
      if (this.isSuperAdmin()) {
        ApiService.updateAdminOrganization(org.id, org).catch((err) =>
          console.error('[SaaSAdminDB] Failed to update organization in DB:', err)
        );
      }
    } else {
      list.unshift(org);
      if (this.isSuperAdmin()) {
        ApiService.createAdminOrganization(org).catch((err) =>
          console.error('[SaaSAdminDB] Failed to create organization in DB:', err)
        );
      }
    }
    this.saveOrganizations(list);

    // Synchronize company profile if this is the active tenant
    const activeTenantId = KannakuDB.getActiveTenantId();
    if (activeTenantId === org.id) {
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
    if (this.isSuperAdmin()) {
      ApiService.deleteAdminOrganization(id).catch((err) =>
        console.error('[SaaSAdminDB] Failed to delete organization from DB:', err)
      );
    }
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

  static async getPlansAsync(): Promise<SaaSPlan[]> {
    if (!this.isSuperAdmin()) return this.getPlans();
    const res = await ApiService.getAdminPlans();
    if (res.success && res.data) {
      this.savePlans(res.data);
      return res.data;
    }
    return this.getPlans();
  }

  static savePlans(plans: SaaSPlan[]): void {
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
  }

  static savePlan(plan: SaaSPlan): void {
    const list = this.getPlans();
    const idx = list.findIndex((p) => p.id === plan.id);
    if (idx >= 0) {
      list[idx] = plan;
      if (this.isSuperAdmin()) {
        ApiService.updateAdminPlan(plan.id, plan).catch((err) =>
          console.error('[SaaSAdminDB] Failed to update plan in DB:', err)
        );
      }
    } else {
      list.push(plan);
      if (this.isSuperAdmin()) {
        ApiService.createAdminPlan(plan).catch((err) =>
          console.error('[SaaSAdminDB] Failed to create plan in DB:', err)
        );
      }
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

  static async getUsersAsync(): Promise<PlatformUser[]> {
    if (!this.isSuperAdmin()) return this.getUsers();
    const res = await ApiService.getAdminUsers();
    if (res.success && res.data) {
      this.saveUsers(res.data);
      return res.data;
    }
    return this.getUsers();
  }

  static saveUsers(users: PlatformUser[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  static saveUser(user: PlatformUser): void {
    const list = this.getUsers();
    const idx = list.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      list[idx] = user;
      if (this.isSuperAdmin()) {
        ApiService.updateAdminUser(user.id, user).catch((err) =>
          console.error('[SaaSAdminDB] Failed to update user in DB:', err)
        );
      }
    } else {
      list.unshift(user);
      if (this.isSuperAdmin()) {
        ApiService.createAdminUser(user).catch((err) =>
          console.error('[SaaSAdminDB] Failed to create user in DB:', err)
        );
      }
    }
    this.saveUsers(list);
  }

  static deleteUser(id: string): void {
    const list = this.getUsers().filter((u) => u.id !== id);
    this.saveUsers(list);
    if (this.isSuperAdmin()) {
      ApiService.deleteAdminUser(id).catch((err) =>
        console.error('[SaaSAdminDB] Failed to delete user from DB:', err)
      );
    }
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

  static async getTransactionsAsync(): Promise<SaaSTransaction[]> {
    if (!this.isSuperAdmin()) return this.getTransactions();
    const res = await ApiService.getAdminTransactions();
    if (res.success && res.data) {
      this.saveTransactions(res.data);
      return res.data;
    }
    return this.getTransactions();
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
    if (this.isSuperAdmin()) {
      ApiService.createAdminTransaction(txn).catch((err) =>
        console.error('[SaaSAdminDB] Failed to save transaction in DB:', err)
      );
    }
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

  static async getCouponsAsync(): Promise<SaaSCoupon[]> {
    if (!this.isSuperAdmin()) return this.getCoupons();
    const res = await ApiService.getAdminCoupons();
    if (res.success && res.data) {
      this.saveCoupons(res.data);
      return res.data;
    }
    return this.getCoupons();
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
    if (this.isSuperAdmin()) {
      ApiService.createAdminCoupon(coupon).catch((err) =>
        console.error('[SaaSAdminDB] Failed to save coupon in DB:', err)
      );
    }
  }

  static deleteCoupon(id: string): void {
    const list = this.getCoupons().filter((c) => c.id !== id);
    this.saveCoupons(list);
    if (this.isSuperAdmin()) {
      ApiService.deleteAdminCoupon(id).catch((err) =>
        console.error('[SaaSAdminDB] Failed to delete coupon in DB:', err)
      );
    }
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

  static async getFeatureFlagsAsync(): Promise<FeatureFlag[]> {
    if (!this.isSuperAdmin()) return this.getFeatureFlags();
    const res = await ApiService.getAdminFeatureFlags();
    if (res.success && res.data) {
      this.saveFeatureFlags(res.data);
      return res.data;
    }
    return this.getFeatureFlags();
  }

  static saveFeatureFlags(flags: FeatureFlag[]): void {
    localStorage.setItem(STORAGE_KEYS.FEATURE_FLAGS, JSON.stringify(flags));
  }

  static saveFeatureFlag(flag: FeatureFlag): void {
    const list = this.getFeatureFlags();
    const idx = list.findIndex((f) => f.id === flag.id);
    if (idx >= 0) {
      list[idx] = flag;
      if (this.isSuperAdmin()) {
        ApiService.updateAdminFeatureFlag(flag.id, flag).catch((err) =>
          console.error('[SaaSAdminDB] Failed to update feature flag in DB:', err)
        );
      }
    } else {
      list.push(flag);
      if (this.isSuperAdmin()) {
        ApiService.createAdminFeatureFlag(flag).catch((err) =>
          console.error('[SaaSAdminDB] Failed to create feature flag in DB:', err)
        );
      }
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

  static async getSupportTicketsAsync(): Promise<SupportTicket[]> {
    if (!this.isSuperAdmin()) return this.getSupportTickets();
    const res = await ApiService.getAdminSupportTickets();
    if (res.success && res.data) {
      this.saveSupportTickets(res.data);
      return res.data;
    }
    return this.getSupportTickets();
  }

  static saveSupportTickets(tickets: SupportTicket[]): void {
    localStorage.setItem(STORAGE_KEYS.SUPPORT_TICKETS, JSON.stringify(tickets));
  }

  static saveSupportTicket(ticket: SupportTicket): void {
    const list = this.getSupportTickets();
    const idx = list.findIndex((t) => t.id === ticket.id);
    if (idx >= 0) {
      list[idx] = ticket;
      if (this.isSuperAdmin()) {
        ApiService.updateAdminSupportTicket(ticket.id, ticket).catch((err) =>
          console.error('[SaaSAdminDB] Failed to update support ticket in DB:', err)
        );
      }
    } else {
      list.unshift(ticket);
      if (this.isSuperAdmin()) {
        ApiService.createAdminSupportTicket(ticket).catch((err) =>
          console.error('[SaaSAdminDB] Failed to create support ticket in DB:', err)
        );
      }
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

  static async getAnnouncementsAsync(): Promise<PlatformAnnouncement[]> {
    if (!this.isSuperAdmin()) return this.getAnnouncements();
    const res = await ApiService.getAdminAnnouncements();
    if (res.success && res.data) {
      this.saveAnnouncements(res.data);
      return res.data;
    }
    return this.getAnnouncements();
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
    if (this.isSuperAdmin()) {
      ApiService.createAdminAnnouncement(announcement).catch((err) =>
        console.error('[SaaSAdminDB] Failed to create announcement in DB:', err)
      );
    }
  }

  static deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter((a) => a.id !== id);
    this.saveAnnouncements(list);
    if (this.isSuperAdmin()) {
      ApiService.deleteAdminAnnouncement(id).catch((err) =>
        console.error('[SaaSAdminDB] Failed to delete announcement in DB:', err)
      );
    }
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

  static async getEmailTemplatesAsync(): Promise<EmailTemplate[]> {
    if (!this.isSuperAdmin()) return this.getEmailTemplates();
    const res = await ApiService.getAdminEmailTemplates();
    if (res.success && res.data) {
      this.saveEmailTemplates(res.data);
      return res.data;
    }
    return this.getEmailTemplates();
  }

  static saveEmailTemplates(templates: EmailTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.EMAIL_TEMPLATES, JSON.stringify(templates));
  }

  static saveEmailTemplate(template: EmailTemplate): void {
    const list = this.getEmailTemplates();
    const idx = list.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      list[idx] = template;
      if (this.isSuperAdmin()) {
        ApiService.updateAdminEmailTemplate(template.id, template).catch((err) =>
          console.error('[SaaSAdminDB] Failed to update email template in DB:', err)
        );
      }
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

  static async getAuditLogsAsync(): Promise<AuditLogEntry[]> {
    if (!this.isSuperAdmin()) return this.getAuditLogs();
    const res = await ApiService.getAdminAuditLogs();
    if (res.success && res.data) {
      this.saveAuditLogs(res.data);
      return res.data;
    }
    return this.getAuditLogs();
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

    if (this.isSuperAdmin()) {
      ApiService.createAdminAuditLog(newEntry).catch((err) =>
        console.error('[SaaSAdminDB] Failed to log action in DB:', err)
      );
    }
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

  static async getErrorLogsAsync(): Promise<SystemErrorLog[]> {
    if (!this.isSuperAdmin()) return this.getErrorLogs();
    const res = await ApiService.getAdminErrorLogs();
    if (res.success && res.data) {
      this.saveErrorLogs(res.data);
      return res.data;
    }
    return this.getErrorLogs();
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

  static async getImpersonationSessionsAsync(): Promise<ImpersonationSession[]> {
    if (!this.isSuperAdmin()) return this.getImpersonationSessions();
    const res = await ApiService.getAdminImpersonationSessions();
    if (res.success && res.data) {
      this.saveImpersonationSessions(res.data);
      return res.data;
    }
    return this.getImpersonationSessions();
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

  static getActivePaymentGateway(): any {
    const config = this.getPaymentGatewaysConfig();
    const provider = config.activeProvider;
    return config.gateways[provider] || config.gateways.payu;
  }

  static setActivePaymentGateway(provider: string): void {
    const config = this.getPaymentGatewaysConfig();
    config.activeProvider = provider as any;
    this.savePaymentGatewaysConfig(config);
  }

  static updateGatewayConfig(provider: string, updates: any): void {
    const config = this.getPaymentGatewaysConfig();
    if (config.gateways[provider as keyof typeof config.gateways]) {
      config.gateways[provider as keyof typeof config.gateways] = {
        ...config.gateways[provider as keyof typeof config.gateways],
        ...updates,
      };
      this.savePaymentGatewaysConfig(config);
    }
  }

  static startImpersonation(
    orgOrId: TenantOrganizationFull | string,
    adminUser?: AdminUser,
    reason?: string
  ): ImpersonationSession {
    const org: TenantOrganizationFull =
      typeof orgOrId === 'string'
        ? this.getOrganizations().find((o) => o.id === orgOrId) || {
            id: orgOrId,
            name: 'Impersonated Workspace',
            slug: 'impersonated-workspace',
            ownerName: 'Workspace Owner',
            adminEmail: 'tenant@kannaku.local',
            mobile: '+91 98427 55680',
            country: 'India',
            city: 'Chennai',
            state: 'Tamil Nadu',
            registerNumber: '33AABCK1234F1Z5',
            planId: 'pro',
            planName: 'Professional Plan',
            subscriptionStatus: 'ACTIVE',
            accountStatus: 'ACTIVE',
            billingCycle: 'YEARLY',
            subscriptionStartDate: new Date().toISOString(),
            renewalDate: new Date(Date.now() + 365 * 86400000).toISOString(),
            trialEndDate: new Date(Date.now() + 14 * 86400000).toISOString(),
            mrr: 49,
            usersCount: 1,
            usage: {
              invoicesCreated: 0,
              estimatesCreated: 0,
              customersCount: 0,
              suppliersCount: 0,
              productsCount: 0,
              pdfGenerationsCount: 0,
              gstTaxHandledInr: 0,
              paymentLedgerEntries: 0,
            },
            createdDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
          }
        : orgOrId;

    const admin = adminUser || this.getActiveAdminUser();
    const newSession: ImpersonationSession = {
      id: `imp_sess_${Date.now()}`,
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      adminRole: admin.role,
      organizationId: org.id,
      organizationName: org.name,
      tenantEmail: org.adminEmail,
      tenantOwner: org.ownerName,
      reason: reason || 'Support and diagnostics session initiated from Super Admin Portal',
      startedAt: new Date().toISOString(),
      ipAddress: '103.117.238.12',
      status: 'ACTIVE',
    };

    const sessions = this.getImpersonationSessions();
    sessions.unshift(newSession);
    this.saveImpersonationSessions(sessions);

    this.logAction(
      'START_IMPERSONATION',
      'IMPERSONATION',
      org.id,
      org.name,
      {
        orgId: org.id,
        orgName: org.name,
        newVal: `Support session started. Reason: ${reason || 'Diagnostics'}`,
      }
    );

    if (this.isSuperAdmin()) {
      ApiService.startAdminImpersonation(org.id, reason).catch((err) =>
        console.error('[SaaSAdminDB] Failed to start impersonation on server:', err)
      );
    }

    this.setImpersonatedOrgId(org.id);
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

    if (this.isSuperAdmin()) {
      ApiService.stopAdminImpersonation().catch((err) =>
        console.error('[SaaSAdminDB] Failed to stop impersonation on server:', err)
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
      revenueLastMonth: 0,
      newSignupsThisMonth: orgs.length,
      churnedOrganizationsThisMonth: 0,
      failedPaymentsCount: failedPayments,
      openSupportTickets: openTickets,
      mrrGrowthPct: 0,
      trialToPaidConversionPct: trialOrgs + activeOrgs > 0 ? Math.round((activeOrgs / (trialOrgs + activeOrgs)) * 100) : 0,
    };
  }

  static async getDashboardStatsAsync(): Promise<SuperAdminDashboardStats> {
    if (!this.isSuperAdmin()) return this.getDashboardStats();
    const res = await ApiService.getAdminStats();
    if (res.success && res.data) {
      return res.data;
    }
    return this.getDashboardStats();
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
        o.usage?.invoicesCreated || 0,
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
