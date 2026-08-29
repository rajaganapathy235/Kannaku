/**
 * Client-Side API Service & Cloudflare D1 Backend SDK
 * Communicates with Cloudflare Worker D1 endpoints with automatic token management.
 */

import { Client, CompanyProfile, Invoice, PaymentLedgerEntry, Product } from '../types';
import { AuthSession } from '../types/auth';

const TOKEN_KEY = 'kannaku_auth_session_v1';

export class ApiService {
  private static getToken(): string | null {
    try {
      const data = localStorage.getItem(TOKEN_KEY);
      if (!data) return null;
      const session: AuthSession = JSON.parse(data);
      return session.token || null;
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
  ): Promise<{ data: T | null; error: string | null; status: number }> {
    try {
      const res = await fetch(path, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return {
          data: null,
          error: json?.error || `Request failed with status ${res.status}`,
          status: res.status,
        };
      }

      return { data: json, error: null, status: res.status };
    } catch (err: any) {
      return {
        data: null,
        error: err?.message || 'Network connection failed. Please check your internet.',
        status: 0,
      };
    }
  }

  // --- HEALTH CHECK ---
  static async checkDbHealth() {
    return this.request<{ success: boolean; database: string; counts?: any }>('/api/health/db');
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
