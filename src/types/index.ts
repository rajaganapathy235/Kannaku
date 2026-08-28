export enum InvoiceType {
  SALES = 1,     // Tax Invoice
  PURCHASE = 2,  // Purchase Invoice
  QUOTATION = 3, // Quotation / Estimate
}

export enum InvoiceCopyType {
  DEFAULT = 0,
  ORIGINAL = 1,           // "ORIGINAL FOR RECIPIENT"
  DUPLICATE = 2,          // "DUPLICATE FOR TRANSPORTER"
  TRIPLICATE = 3,         // "TRIPLICATE FOR SUPPLIER"
  DEL_NOTE = 4,           // "Delivery Note"
  CREDIT_NOTE = 5,        // "Credit Note"
  DEBIT_NOTE = 6,         // "Debit Note"
  ALL_COPIES = 7,         // All 3 Copies (Original + Duplicate + Triplicate)
  CHALAN = 8,             // "Challan"
  RECEIPT = 9,            // "Receipt"
  INVOICE = 10,           // "Invoice"
}

export type TaxType = 'CGST_SGST' | 'IGST';

export interface TaxObject {
  name: 'cgst' | 'sgst' | 'igst';
  per: number;
  value: number;
}

export interface ItemTaxRoot {
  hsnCode: string;
  taxable_amount: number;
  tax_amount: number;
  data: TaxObject[];
}

export interface InvoiceItem {
  id: string;
  itemId?: string;
  name: string;
  hsnCode: string;
  qty: number;
  unit: string;
  baseRate: number;
  mrp?: number;
  inclusiveOrExclusive: 'exclusive' | 'inclusive';
  isDiscountApplied: boolean;
  flatOrPercentage: 'percentage' | 'flat';
  discountRate: number; // percentage or flat amount
  discountAmount: number;
  taxPercentage: number;
  taxAmount: number;
  taxDetail: ItemTaxRoot;
  subline1?: string;
  subline2?: string;
  subline3?: string;
  lineTotal: number;
}

export interface InvoiceExtraItem {
  id: string;
  name: string;
  baseRate: number;
  unit?: string;
  hsnCode?: string;
  taxPercentage: number;
  taxAmount: number;
  extraType: 'freight' | 'packaging' | 'insurance' | 'other';
}

export interface BillModifier {
  id: string;
  name: string;
  amount: number;
  percentageStr: string;
  typeAmount0OrPercentage1: 0 | 1; // 0 = flat, 1 = percentage
  isActive: boolean;
}

export interface Consignee {
  name: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  code?: string;
  registerNumber?: string; // GSTIN
  mobile?: string;
  email?: string;
  shouldVisible: boolean;
}

export interface InvoiceCalc {
  subTotal: number;          // Total taxable items
  totalDiscount: number;
  taxAmount: number;         // Total GST
  totalBeforeModifier: number;
  totalModifiers: number;
  extraItemsTotal: number;
  tcsPercentage: number;
  tcsAmount: number;
  roundOffValue: number;     // e.g. -0.40 or +0.60
  billFigure: number;        // Final rounded amount
  amountInWords: string;
  paidAmount: number;
  dueAmount: number;
}

export interface HsnSummaryItem {
  hsnCode: string;
  taxPercentage: number;
  taxableAmount: number;
  cgstAmount: number;
  cgstRate?: number;
  sgstAmount: number;
  sgstRate?: number;
  igstAmount: number;
  igstRate?: number;
  totalTaxAmount: number;
}

export interface Client {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  code?: string; // State GST code (e.g. 33 for TN, 27 for MH)
  registerNumber: string; // GSTIN
  clientType: 'customer' | 'supplier' | 'dealer';
  balance: number; // positive = receivable (due), negative = advance
  createdOn: string;
}

export interface Product {
  id: string;
  name: string;
  itemCode?: string;
  hsnCode: string;
  unit: string;
  buyingPrice: number;
  sellingPrice: number;
  mrp: number;
  taxRate: number;
  currentStock: number;
  minStockAlert: number;
  subline1?: string;
  subline2?: string;
  createdOn: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  unitPrice: number;
  particular: string;
  date: string;
  invoiceId?: string;
}

export interface BankDetail {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
  panNumber: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  code: string;
  email: string;
  mobile: string;
  registerNumber: string; // GSTIN
  panNumber?: string;
  billPrefix?: string;
  bankDetail: BankDetail;
  logoUrl?: string;
  signatureUrl?: string;
  signatureName?: string; // e.g. "K. Vasanthi"
  stampUrl?: string;
  invoicePrefixSales: string;
  invoicePrefixPurchase: string;
  invoicePrefixQuotation: string;
  colorScheme: 'blue' | 'emerald' | 'slate' | 'indigo' | 'crimson';
  termsAndConditions: string;
  jurisdictionCity: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  terms: string;
  invoiceType: InvoiceType;
  invoiceTaxType: TaxType;
  eway?: string;
  deliveryNote?: string;
  deliveryNoteDate?: string;
  buyersOrderNo?: string;
  orderDate?: string;
  dispatchDocNo?: string;
  dispatchedThrough?: string;
  destination?: string;
  vehicleNo?: string;
  termsOfDelivery?: string;
  description: string;
  clientId: string;
  clientSnapshot: Client;
  consignee?: Consignee;
  items: InvoiceItem[];
  extraItems: InvoiceExtraItem[];
  modifiers: BillModifier[];
  calc: InvoiceCalc;
  hsnSummary: HsnSummaryItem[];
  copyType: InvoiceCopyType;
  status: 'PAID' | 'PARTIAL' | 'UNPAID';
  paymentMode?: string;
  isConverted?: boolean;
  convertedToInvoiceId?: string;
  convertedInvoiceNumber?: string;
  createdOn: string;
  updatedOn: string;
}

export interface PaymentLedgerEntry {
  id: string;
  partyId?: string;
  partyName: string;
  partyType?: 'customer' | 'supplier';
  invoiceId?: string;
  invoiceNumber?: string;
  date: string;
  type: 'credit' | 'debit';
  entryType?: 'Sales' | 'Purchase Return' | 'Payment Out' | 'Purchase' | 'Sales Return' | 'Payment In' | string;
  mode: string;
  amount: number;
  particular?: string;
  vchNo?: string;
  note?: string;
  referenceNo?: string;
  createdOn?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceInr: number;
  durationDays: number;
  features: string[];
}

export interface SubscriptionState {
  isSubscribed: boolean;
  activePlan?: SubscriptionPlan;
  plan?: string;
  status?: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  billingCycle?: 'MONTHLY' | 'YEARLY' | 'LIFETIME' | 'TRIAL';
  startDate?: string;
  expiryDate?: string;
  invoicesCountThisMonth?: number;
  pdfGenerationsThisMonth?: number;
  trialDaysRemaining?: number;
}

export interface UserSubscription {
  planId: string;
  planName: string;
  price: number;
  purchasedOn: string;
  validUntil: string;
  isLifetime: boolean;
  isActive: boolean;
  orderId: string;
  gateway: 'cashfree' | 'dodopayments' | 'play_billing' | 'trial';
}

export interface GatewayConfig {
  cashfreeAppId: string;
  cashfreeSecretKey: string;
  cashfreeEnv: 'sandbox' | 'production';
  dodoApiKey: string;
  dodoEnv: 'test_mode' | 'live';
  supabaseUrl: string;
  supabaseAnonKey: string;
  isSupabaseConfigured: boolean;
}

export interface TenantOrganization {
  id: string;
  name: string;
  slug: string;
  adminEmail: string;
  mobile: string;
  registerNumber: string; // GSTIN
  plan: 'Free Trial' | 'Annual Business' | 'Enterprise Pro';
  status: 'ACTIVE' | 'PENDING_MIGRATION' | 'SUSPENDED';
  dbSize: string;
  totalInvoices: number;
  totalRevenue: number;
  createdOn: string;
  customDomain?: string;
  supabaseSchema: string;
}

export interface MasterDevOpsConfig {
  // Supabase Master Hub
  supabaseMasterUrl: string;
  supabaseMasterAnonKey: string;
  supabaseServiceRoleKey: string;
  databasePoolerUrl: string;
  isSupabaseConnected: boolean;
  schemaVersion: string;
  lastMigrationDate: string;
  
  // Git Pipeline
  githubRepoUrl: string;
  gitBranch: string;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastCommitDate: string;
  webhookStatus: 'ACTIVE' | 'PENDING' | 'DISCONNECTED';
  
  // Vercel Deployment
  vercelProjectId: string;
  vercelProductionDomain: string;
  vercelDeploymentStatus: 'READY' | 'BUILDING' | 'DEPLOYED' | 'ERROR';
  lastDeployedAt: string;
  vercelEnvVars: { key: string; value: string; isSecret: boolean; target: string }[];
  
  // Build & Pipeline
  buildCommand: string;
  nodeVersion: string;
  outputDirectory: string;
  lastBuildDuration: string;
  bundleStats: { js: string; css: string; assets: string };
}
