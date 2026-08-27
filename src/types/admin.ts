export type AdminRole =
  | 'SUPER_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'SUPPORT_ADMIN'
  | 'FINANCE_ADMIN'
  | 'READ_ONLY_ADMIN';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
  department: string;
}

export type OrgSubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'PAUSED'
  | 'CANCELLED'
  | 'EXPIRED';

export type OrgAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'DISABLED' | 'PENDING_MIGRATION';

export type PaymentGatewayProvider =
  | 'dodopayments'
  | 'cashfree'
  | 'razorpay'
  | 'stripe'
  | 'manual_upi';

export interface PaymentGatewayConfig {
  provider: PaymentGatewayProvider;
  name: string;
  isEnabled: boolean;
  isTestMode: boolean;
  // Dodo Payments specific
  dodoApiKey?: string;
  dodoWebhookSecret?: string;
  dodoProductIdMonthly?: string;
  dodoProductIdSixMonths?: string;
  dodoProductIdTwelveMonths?: string;
  // Cashfree specific
  cashfreeAppId?: string;
  cashfreeSecretKey?: string;
  cashfreeApiVersion?: string;
  // Razorpay specific
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayWebhookSecret?: string;
  // Stripe specific
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  // Manual UPI / Bank details
  upiId?: string;
  upiPayeeName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface SaaSGatewayManagerConfig {
  activeProvider: PaymentGatewayProvider;
  gateways: Record<PaymentGatewayProvider, PaymentGatewayConfig>;
}

export interface PlanLimits {
  maxUsers: number;
  maxInvoicesPerMonth: number;
  maxQuotationsPerMonth: number;
  maxCustomers: number;
  maxProducts: number;
  pdfGenerationsLimit: number;
  hasMultiUser: boolean;
  hasGstReports: boolean;
  hasCustomBranding: boolean;
  hasDigitalStampSign: boolean;
  hasInventoryAlerts: boolean;
  hasTallyPrintFormats: boolean;
  hasUpiQrPayment: boolean;
  hasPurchaseLedger: boolean;
}

export interface SaaSPlan {
  id: string;
  name: string;
  code: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE' | 'ALL_IN_ONE' | string;
  tagline: string;
  monthlyPriceInr: number; // e.g. 99
  sixMonthPriceInr?: number; // e.g. 474 (79/mo)
  threeMonthPriceInr?: number; // e.g. 237 (79/mo)
  yearlyPriceInr: number; // e.g. 588 (49/mo)
  trialDurationDays: number;
  isPopular?: boolean;
  isArchived?: boolean;
  limits: PlanLimits;
  createdOn: string;
  updatedOn: string;
}

export interface TenantUsageStats {
  invoicesCreated: number;
  estimatesCreated: number;
  customersCount: number;
  suppliersCount: number;
  productsCount: number;
  pdfGenerationsCount: number;
  gstTaxHandledInr: number;
  paymentLedgerEntries: number;
  storageUsedMB?: number;
}

export interface TenantOrganizationFull {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  adminEmail: string;
  mobile: string;
  country: string;
  city: string;
  state: string;
  registerNumber: string; // GSTIN
  planId: string;
  planName: string;
  subscriptionStatus: OrgSubscriptionStatus;
  accountStatus: OrgAccountStatus;
  billingCycle: 'MONTHLY' | 'YEARLY' | 'LIFETIME' | 'TRIAL';
  subscriptionStartDate: string;
  renewalDate: string;
  trialEndDate?: string;
  mrr: number; // in INR
  usersCount: number;
  usage: TenantUsageStats;
  createdDate: string;
  lastActive: string;
  customDomain?: string;
  paymentProvider?: PaymentGatewayProvider | 'manual';
  notes?: string;
  featureOverrides?: Record<string, boolean>;
}

export interface PlatformUser {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  email: string;
  phone?: string;
  role: 'OWNER' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED';
  planName: string;
  lastLogin: string;
  createdDate: string;
  avatarUrl?: string;
}

export interface SaaSTransaction {
  id: string;
  organizationId: string;
  organizationName: string;
  amount: number;
  currency: 'INR' | 'USD';
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Bank Transfer' | 'Wallet';
  paymentProvider: 'Cashfree' | 'Dodo Payments' | 'Razorpay' | 'Stripe' | 'Manual Bank';
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  date: string;
  invoiceNumber?: string;
  subscriptionId: string;
  planName: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  receiptUrl?: string;
  gatewayRefId: string;
  failureReason?: string;
  refundAmount?: number;
  refundDate?: string;
  customerEmail: string;
}

export interface SaaSCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  durationType: 'ONE_TIME' | 'RECURRING' | 'FIRST_MONTH' | 'ANNUAL';
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  planRestrictions: string[]; // empty means all plans
  status: 'ACTIVE' | 'DISABLED' | 'EXPIRED';
  createdOn: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'Billing' | 'GST' | 'Communication' | 'Security' | 'AI' | 'Integrations';
  scope: 'GLOBAL' | 'PLAN' | 'ORGANIZATION';
  isEnabledGlobal: boolean;
  enabledPlans: string[];
  targetedOrgIds: string[];
  createdOn: string;
  updatedOn: string;
}

export interface SupportTicketMessage {
  id: string;
  senderName: string;
  senderRole: 'USER' | 'ADMIN' | 'SYSTEM';
  message: string;
  timestamp: string;
  attachments?: { name: string; url: string; size: string }[];
}

export interface SupportTicket {
  id: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: 'Billing & Invoicing' | 'GST Compliance' | 'Subscription & Payment' | 'API & Webhooks' | 'Technical Bug';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  assignedAdminName?: string;
  createdDate: string;
  lastUpdated: string;
  messages: SupportTicketMessage[];
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'MAINTENANCE' | 'UPDATE' | 'WARNING' | 'PROMOTION';
  startDate: string;
  endDate: string;
  targetAudience: 'ALL' | 'PLAN_SPECIFIC' | 'ORG_SPECIFIC';
  targetPlans?: string[];
  targetOrgIds?: string[];
  isActive: boolean;
  isDismissible: boolean;
  createdOn: string;
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  description: string;
  variables: string[]; // e.g. ['business_name', 'amount', 'due_date']
  bodyHtml: string;
  isEnabled: boolean;
  lastEdited: string;
}

export interface ImpersonationSession {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: AdminRole;
  organizationId: string;
  organizationName: string;
  tenantEmail: string;
  tenantOwner: string;
  reason: string;
  supportTicketId?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  ipAddress: string;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  targetType: 'ORGANIZATION' | 'SUBSCRIPTION' | 'PLAN' | 'USER' | 'COUPON' | 'SETTING' | 'TRANSACTION' | 'FEATURE_FLAG' | 'IMPERSONATION';
  targetId: string;
  targetName: string;
  organizationId?: string;
  organizationName?: string;
  ipAddress: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface SystemErrorLog {
  id: string;
  errorType: string;
  message: string;
  organizationId?: string;
  organizationName?: string;
  userEmail?: string;
  endpoint: string;
  httpStatus: number;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED';
  stackTrace?: string;
}

export interface SubsystemStatus {
  name: string;
  category: 'Core API' | 'Database' | 'Authentication' | 'Storage & CDN' | 'Payment Gateways' | 'Email SMTP' | 'WhatsApp Business API';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  responseTimeMs: number;
  uptimePercentage: number;
  lastIncident?: string;
  details: string;
}

export interface PlatformSettings {
  general: {
    saasName: string;
    tagline: string;
    supportEmail: string;
    supportPhone: string;
    defaultCurrency: string;
    defaultCountry: string;
    timezone: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  billing: {
    defaultCurrency: string;
    gstTaxPercentage: number;
    trialDurationDays: number;
    gracePeriodDays: number;
    invoicePrefix: string;
    enableAutoDunning: boolean;
    retryFailedPaymentsCount: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
    senderName: string;
    senderEmail: string;
    enableEmailDelivery: boolean;
  };
  notifications: {
    notifyOnPaymentSuccess: boolean;
    notifyOnPaymentFailed: boolean;
    notifyOnTrialExpiring: boolean;
    notifyOnNewSignup: boolean;
    adminNotificationEmail: string;
    slackWebhookUrl?: string;
  };
  security: {
    sessionTimeoutMinutes: number;
    enforcePasswordComplexity: boolean;
    maxLoginAttempts: number;
    requireTwoFactorForAdmins: boolean;
    allowedAdminIpRanges: string[];
    enableImpersonationAuditLock: boolean;
  };
}

export interface SuperAdminDashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  activeUsers: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  newSignupsThisMonth: number;
  churnedOrganizationsThisMonth: number;
  failedPaymentsCount: number;
  openSupportTickets: number;
  mrrGrowthPct: number;
  trialToPaidConversionPct: number;
}
