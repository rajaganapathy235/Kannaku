/**
 * Client-Side API Service & Cloudflare D1 Backend SDK
 * Communicates with Cloudflare Worker D1 endpoints with automatic token management.
 */

import { Client, CompanyProfile, Invoice, PaymentLedgerEntry, Product } from '../types';

export interface ApiResult<T = any> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

export interface SystemDiagnostics {
  dbStatus: 'connected' | 'error' | 'unreachable';
  dbMessage: string;
  isTokenValid: boolean;
  tokenDetails: {
    format: 'JWT_VALID' | 'NON_JWT' | 'NONE';
    role?: string;
    email?: string;
    organizationId?: string;
    isExpired?: boolean;
    expiresAt?: string;
  };
  counts?: {
    organizations: number;
    invoices: number;
    clients: number;
    products: number;
    payments: number;
  };
  timestamp: string;
}

export class ApiService {
  static getToken(): string | null {
    try {
      const data = localStorage.getItem('kannaku_auth_session_v1');
      if (!data) return null;
      const session = JSON.parse(data);
      return session?.token || null;
    } catch {
      return null;
    }
  }

  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const impersonatedOrg = localStorage.getItem('kannaku_impersonated_org_id');
    if (impersonatedOrg) {
      headers['X-Impersonate-Org'] = impersonatedOrg;
    }
    return headers;
  }

  static async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResult<T>> {
    try {
      const res = await fetch(path, {
        credentials: 'include',
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg =
          json?.error || `HTTP ${res.status}: ${res.statusText || 'API Request Failed'}`;
        console.error(`[Kannaku ApiService Error] ${options.method || 'GET'} ${path} failed:`, {
          status: res.status,
          error: errorMsg,
          response: json,
        });

        // Dispatch a global event so UI components can surface real toasts/notifications
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('kannaku:api-error', {
              detail: {
                path,
                status: res.status,
                error: errorMsg,
                code: json?.code || null,
                reason: json?.reason || null,
                data: json,
              },
            })
          );
        }

        return {
          data: json,
          error: errorMsg,
          status: res.status,
          success: false,
        };
      }

      return { data: json, error: null, status: res.status, success: true };
    } catch (err: any) {
      const networkError =
        err?.message || 'Network connection failed. Unable to reach Cloudflare Worker API.';
      console.error(`[Kannaku ApiService Network Error] ${options.method || 'GET'} ${path}:`, err);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('kannaku:api-error', {
            detail: { path, status: 0, error: networkError },
          })
        );
      }

      return {
        data: null,
        error: networkError,
        status: 0,
        success: false,
      };
    }
  }

  // --- HEALTH & DIAGNOSTICS ---
  static async checkDbHealth(): Promise<ApiResult<{ success: boolean; database: string; binding?: string; counts?: any }>> {
    return this.request<{ success: boolean; database: string; binding?: string; counts?: any }>('/api/health/db');
  }

  static async checkSchemaIntegrity(): Promise<ApiResult<{
    success: boolean;
    healthy: boolean;
    status: string;
    totalExpected: number;
    totalPresent: number;
    totalMissing: number;
    missingTables: string[];
    presentTables: string[];
    missingColumns?: Record<string, string[]>;
    columnValidation?: Record<string, { expectedCount: number; existingCount: number; missing: string[] }>;
    allExistingTables: string[];
    checkedAt: string;
  }>> {
    return this.request('/api/admin/system/schema-check');
  }

  static async runFullDiagnostics(): Promise<SystemDiagnostics> {
    let isTokenValid = false;
    let tokenDetails: SystemDiagnostics['tokenDetails'] = { format: 'NONE' };

    try {
      const meRes = await this.getMe();
      if (meRes.success && meRes.data?.user) {
        isTokenValid = true;
        tokenDetails = {
          format: 'JWT_VALID',
          role: meRes.data.user.role,
          email: meRes.data.user.email,
          organizationId: meRes.data.organization?.id || meRes.data.user.organizationId,
          isExpired: false,
        };
      }
    } catch {
      tokenDetails = { format: 'NONE' };
    }

    const dbRes = await this.checkDbHealth();

    let dbStatus: SystemDiagnostics['dbStatus'] = 'unreachable';
    let dbMessage = dbRes.error || 'Connected to Cloudflare D1 Database';

    if (dbRes.success && dbRes.data?.success) {
      dbStatus = 'connected';
      dbMessage = `Connected to Cloudflare D1 SQLite database (Binding: ${dbRes.data.binding || 'DB'})`;
    } else if (dbRes.status === 503) {
      dbStatus = 'error';
      dbMessage = dbRes.error || 'D1 Database binding (DB) is missing in Cloudflare Pages';
    } else if (dbRes.error) {
      dbStatus = 'error';
      dbMessage = dbRes.error;
    }

    return {
      dbStatus,
      dbMessage,
      isTokenValid,
      tokenDetails,
      counts: dbRes.data?.counts,
      timestamp: new Date().toISOString(),
    };
  }

  // --- AUTHENTICATION ---
  static async login(email: string, pass: string) {
    return this.request<{
      success: boolean;
      token: string;
      user: any;
      organization: any;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{
      success: boolean;
      message?: string;
    }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  static async signup(payload: any) {
    return this.request<{
      success: boolean;
      token: string;
      user: any;
      organization: any;
    }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  static async getMe() {
    return this.request<{ user: any; organization: any }>('/api/auth/me');
  }

  // --- ORGANIZATION / COMPANY PROFILE ---
  static async getOrganization() {
    return this.request<CompanyProfile>('/api/organization');
  }

  static async updateOrganization(profile: Partial<CompanyProfile>) {
    return this.request('/api/organization', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // --- CLIENTS & CUSTOMERS ---
  static async getClients() {
    return this.request<Client[]>('/api/clients');
  }

  static async saveClient(client: Client) {
    return this.request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  }

  static async updateClient(id: string, client: Partial<Client>) {
    return this.request(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
  }

  static async deleteClient(id: string) {
    return this.request(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  }

  // --- PRODUCTS ---
  static async getProducts() {
    return this.request<Product[]>('/api/products');
  }

  static async saveProduct(product: Product) {
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  static async updateProduct(id: string, product: Partial<Product>) {
    return this.request(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  static async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // --- INVOICES ---
  static async getInvoices() {
    return this.request<Invoice[]>('/api/invoices');
  }

  static async saveInvoice(invoice: Invoice) {
    return this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  }

  static async deleteInvoice(id: string) {
    return this.request(`/api/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  // --- PAYMENTS & LEDGER ---
  static async getPayments() {
    return this.request<PaymentLedgerEntry[]>('/api/payments');
  }

  static async savePayment(payment: PaymentLedgerEntry) {
    return this.request('/api/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  static async deletePayment(id: string) {
    return this.request(`/api/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // --- BATCH LOCALSTORAGE TO D1 MIGRATION ---
  static async migrateLocalData(payload: {
    company?: CompanyProfile;
    clients?: Client[];
    products?: Product[];
    invoices?: Invoice[];
    payments?: PaymentLedgerEntry[];
  }) {
    return this.request<{ success: boolean; migrated: any; message: string }>('/api/sync/migrate-local', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- SUPER ADMIN ---
  static async getAdminStats() {
    return this.request<any>('/api/admin/stats');
  }

  static async getAdminOrganizations() {
    return this.request<any[]>('/api/admin/organizations');
  }

  static async createAdminOrganization(org: any) {
    return this.request('/api/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(org),
    });
  }

  static async updateAdminOrganization(id: string, org: any) {
    return this.request(`/api/admin/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(org),
    });
  }

  static async deleteAdminOrganization(id: string) {
    return this.request(`/api/admin/organizations/${id}`, {
      method: 'DELETE',
    });
  }

  static async getAdminUsers() {
    return this.request<any[]>('/api/admin/users');
  }

  static async createAdminUser(user: any) {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  static async updateAdminUser(id: string, user: any) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  static async deleteAdminUser(id: string) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  static async getAdminPlans() {
    return this.request<any[]>('/api/admin/plans');
  }

  static async createAdminPlan(plan: any) {
    return this.request('/api/admin/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  static async updateAdminPlan(id: string, plan: any) {
    return this.request(`/api/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    });
  }

  static async getAdminTransactions() {
    return this.request<any[]>('/api/admin/transactions');
  }

  static async createAdminTransaction(txn: any) {
    return this.request('/api/admin/transactions', {
      method: 'POST',
      body: JSON.stringify(txn),
    });
  }

  static async approveAdminTransaction(params: {
    txnid?: string;
    organizationId: string;
    amount?: number;
    planName?: string;
    durationDays?: number;
    customerEmail?: string;
  }) {
    return this.request<{ success: boolean; message: string; renewalDate?: string }>(
      '/api/admin/transactions/approve',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
  }

  static async getAdminCoupons() {
    return this.request<any[]>('/api/admin/coupons');
  }

  static async createAdminCoupon(coupon: any) {
    return this.request('/api/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
  }

  static async updateAdminCoupon(id: string, coupon: any) {
    return this.request(`/api/admin/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon),
    });
  }

  static async deleteAdminCoupon(id: string) {
    return this.request(`/api/admin/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  static async validateCoupon(code: string, amount?: number, planId?: string) {
    return this.request<{
      valid: boolean;
      code: string;
      discountType: string;
      discountValue: number;
      discountAmount: number;
      finalAmount: number;
      message: string;
    }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount, planId }),
    });
  }

  static async getAdminPaymentGateways() {
    return this.request<any>('/api/admin/payments/gateways');
  }

  static async savePayUSettings(config: any) {
    return this.request<{ success: boolean; message: string; config_key: string; data: any }>(
      '/api/admin/payments/payu/settings',
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }

  static async getPayUSettings() {
    return this.request<{ success: boolean; config_key: string; data: any; updated_at?: string }>(
      '/api/admin/payments/payu/settings'
    );
  }

  static async updateAdminPaymentGateway(provider: string, config: any) {
    return this.request(`/api/admin/payments/gateways/${provider}`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  static async setActiveAdminPaymentGateway(provider: string) {
    return this.request('/api/admin/payments/gateways/active', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    });
  }

  static async getAdminPlatformSettings() {
    return this.request<any>('/api/admin/platform-settings');
  }

  static async updateAdminPlatformSettings(settings: any) {
    return this.request('/api/admin/platform-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  static async getAdminFeatureFlags() {
    return this.request<any[]>('/api/admin/feature-flags');
  }

  static async createAdminFeatureFlag(flag: any) {
    return this.request('/api/admin/feature-flags', {
      method: 'POST',
      body: JSON.stringify(flag),
    });
  }

  static async updateAdminFeatureFlag(id: string, flag: any) {
    return this.request(`/api/admin/feature-flags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flag),
    });
  }

  static async getAdminSupportTickets() {
    return this.request<any[]>('/api/admin/support-tickets');
  }

  static async createAdminSupportTicket(ticket: any) {
    return this.request('/api/admin/support-tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  }

  static async updateAdminSupportTicket(id: string, ticket: any) {
    return this.request(`/api/admin/support-tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticket),
    });
  }

  static async getAdminAnnouncements() {
    return this.request<any[]>('/api/admin/announcements');
  }

  static async createAdminAnnouncement(ann: any) {
    return this.request('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(ann),
    });
  }

  static async deleteAdminAnnouncement(id: string) {
    return this.request(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  static async getAdminEmailTemplates() {
    return this.request<any[]>('/api/admin/email-templates');
  }

  static async updateAdminEmailTemplate(id: string, tmpl: any) {
    return this.request(`/api/admin/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tmpl),
    });
  }

  static async getAdminAuditLogs() {
    return this.request<any[]>('/api/admin/audit-logs');
  }

  static async createAdminAuditLog(log: any) {
    return this.request('/api/admin/audit-logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  static async getAdminErrorLogs() {
    return this.request<any[]>('/api/admin/error-logs');
  }

  static async getAdminImpersonationSessions() {
    return this.request<any[]>('/api/admin/impersonation');
  }

  static async startAdminImpersonation(organizationId: string, reason?: string) {
    return this.request('/api/admin/impersonation/start', {
      method: 'POST',
      body: JSON.stringify({ organizationId, reason }),
    });
  }

  static async stopAdminImpersonation() {
    return this.request('/api/admin/impersonation/stop', {
      method: 'POST',
    });
  }

  static async getAdminDbExplorer(table: string) {
    return this.request<{ table: string; count: number; rows: any[] }>(`/api/admin/db-explorer?table=${encodeURIComponent(table)}`);
  }

  static async getAdminActivityFeed() {
    return this.request<any[]>('/api/admin/activity-feed');
  }

  // -------------------------------------------------------------
  // CLIENT SUBSCRIPTION & BILLING
  // -------------------------------------------------------------
  static async getSubscriptionStatus() {
    return this.request<{
      subscription: {
        organizationId: string;
        workspaceName: string;
        planId: string;
        planName: string;
        subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'PAST_DUE' | 'CANCELLED';
        accountStatus: 'ACTIVE' | 'SUSPENDED';
        renewalDate: string | null;
        trialEndDate: string | null;
        paymentProvider: string;
        daysRemaining: number;
        isReadOnly: boolean;
        code: string | null;
        readOnlyReason: string | null;
        activeGateway: {
          name: string;
          provider: string;
          isConfigured: boolean;
          currency: string;
        };
      };
    }>('/api/subscription/current');
  }

  static async getSubscriptionTransactions() {
    return this.request<{
      transactions: Array<{
        id: string;
        organizationId: string;
        organizationName: string;
        amount: number;
        currency: string;
        status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
        date: string;
        invoiceNumber: string;
        paymentMethod: string;
        paymentProvider: string;
        planName: string;
        billingCycle: string;
        gatewayRefId?: string;
      }>;
    }>('/api/subscription/transactions');
  }
}
