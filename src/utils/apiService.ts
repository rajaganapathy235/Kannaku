/**
 * Client-Side API Service & Cloudflare D1 Backend SDK
 * Communicates with Cloudflare Worker D1 endpoints with automatic token management.
 */

import { Client, CompanyProfile, Invoice, PaymentLedgerEntry, Product } from '../types';
import { AuthSession } from '../types/auth';

const TOKEN_KEY = 'kannaku_auth_session_v1';

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
  /**
   * Extract and strictly validate session token format.
   * A valid JWT must consist of three Base64URL-encoded parts separated by periods.
   */
  static getToken(): string | null {
    try {
      const data = localStorage.getItem(TOKEN_KEY);
      if (!data) return null;
      const session: AuthSession = JSON.parse(data);
      const token = session?.token;
      if (!token || typeof token !== 'string') return null;

      // Verify 3-part JWT structure
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn(
          '[ApiService] Non-JWT session token detected:',
          token.substring(0, 15) + '... Refusing to send invalid Bearer token.'
        );
        return null;
      }
      return token;
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

  /**
   * Automatically acquire a signed session token for demo/default tenant if missing or expired.
   */
  static async autoInitializeSession(): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'OWNER' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.token && data?.user && data?.organization) {
          const session: AuthSession = {
            token: data.token,
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              phone: data.user.phone,
              role: data.user.role,
              organizationId: data.organization.id,
              organizationName: data.organization.name,
              gstin: data.organization.registerNumber || data.organization.register_number || '33ASWPV8266F1ZW',
              planName: data.organization.planName || data.organization.plan_name || 'Pro Trader',
              avatarUrl: data.user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=1A73E8&color=fff`,
            },
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            loginTimestamp: new Date().toISOString(),
          };
          localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
          localStorage.setItem('kannaku_active_tenant_id', data.organization.id);
          return true;
        }
      }
    } catch {
      // Ignored in offline/standalone mode
    }
    return false;
  }

  static async request<T = any>(
    path: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResult<T>> {
    try {
      // If token is missing on an authenticated route, attempt auto-initialization once
      const isPublicRoute = path.startsWith('/api/auth/') || path.startsWith('/api/health');
      if (!isPublicRoute && !this.getToken() && !isRetry) {
        await this.autoInitializeSession();
      }

      const res = await fetch(path, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        // If 401 unauthorized on authenticated route, re-initialize token and retry once
        if (res.status === 401 && !isPublicRoute && !isRetry) {
          const refreshed = await this.autoInitializeSession();
          if (refreshed) {
            return this.request<T>(path, options, true);
          }
        }

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
              detail: { path, status: res.status, error: errorMsg },
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

  static async runFullDiagnostics(): Promise<SystemDiagnostics> {
    const rawToken = (() => {
      try {
        const data = localStorage.getItem(TOKEN_KEY);
        if (!data) return null;
        const session: AuthSession = JSON.parse(data);
        return session?.token || null;
      } catch {
        return null;
      }
    })();

    let isTokenValid = false;
    let tokenDetails: SystemDiagnostics['tokenDetails'] = { format: 'NONE' };

    if (rawToken) {
      const parts = rawToken.split('.');
      if (parts.length === 3) {
        try {
          const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
          const payload = JSON.parse(payloadJson);
          const isExpired = payload.exp ? Date.now() > payload.exp : false;
          isTokenValid = !isExpired;
          tokenDetails = {
            format: 'JWT_VALID',
            role: payload.role,
            email: payload.email,
            organizationId: payload.organizationId,
            isExpired,
            expiresAt: payload.exp ? new Date(payload.exp).toLocaleString() : undefined,
          };
        } catch {
          tokenDetails = { format: 'NON_JWT' };
        }
      } else {
        tokenDetails = { format: 'NON_JWT' };
      }
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

  static async demoSwitch(role: 'SUPER_ADMIN' | 'OWNER') {
    return this.request<{
      success: boolean;
      token: string;
      user: any;
      organization: any;
    }>('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
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
    return this.request('/api/admin/stats');
  }

  static async getAdminOrganizations() {
    return this.request('/api/admin/organizations');
  }

  static async getAdminUsers() {
    return this.request('/api/admin/users');
  }

  static async getAdminAuditLogs() {
    return this.request('/api/admin/audit-logs');
  }
}
