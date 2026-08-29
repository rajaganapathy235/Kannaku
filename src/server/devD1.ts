/**
 * Local Development D1 Memory/Storage Shim
 * Emulates Cloudflare D1 interface for Vite dev server mode without requiring wrangler proxy.
 */

import { D1Database, D1PreparedStatement } from './db';

export class DevD1Database implements D1Database {
  private tables = new Map<string, any[]>();

  constructor() {
    this.initTables();
  }

  private initTables() {
    this.tables.set('organizations', []);
    this.tables.set('platform_users', []);
    this.tables.set('clients', []);
    this.tables.set('products', []);
    this.tables.set('invoices', []);
    this.tables.set('invoice_items', []);
    this.tables.set('payment_ledgers', []);
    this.tables.set('audit_logs', []);
  }

  async exec(sql: string): Promise<any> {
    // Schema creation acknowledged in memory
    return { count: 0, duration: 0 };
  }

  prepare(query: string): D1PreparedStatement {
    return new DevPreparedStatement(this.tables, query);
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<any[]> {
    const results = [];
    for (const stmt of statements) {
      results.push(await (stmt as DevPreparedStatement).run());
    }
    return results;
  }
}

class DevPreparedStatement implements D1PreparedStatement {
  private params: any[] = [];

  constructor(
    private tables: Map<string, any[]>,
    private query: string
  ) {}

  bind(...values: any[]): D1PreparedStatement {
    this.params = values;
    return this;
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    const res = await this.all<T>();
    if (res.results && res.results.length > 0) {
      if (colName) {
        return (res.results[0] as any)[colName] ?? null;
      }
      return res.results[0];
    }
    return null;
  }

  async all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta: any }> {
    const q = this.query.trim();

    // 1. SELECT COUNT(*)
    if (q.includes('COUNT(*)')) {
      const match = q.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      const tableName = match ? match[1] : '';
      const list = this.tables.get(tableName) || [];
      return {
        results: [{ count: list.length }] as any,
        success: true,
        meta: {},
      };
    }

    // 2. SELECT FROM platform_users WHERE email
    if (q.includes('platform_users') && q.includes('email')) {
      const users = this.tables.get('platform_users') || [];
      const email = this.params[0]?.toLowerCase();
      const filtered = users.filter((u) => u.email?.toLowerCase() === email);
      return { results: filtered as any, success: true, meta: {} };
    }

    // 3. General SELECT FROM table WHERE organization_id = ?
    const fromMatch = q.match(/FROM\s+([a-zA-Z0-9_]+)/i);
    const tableName = fromMatch ? fromMatch[1] : '';
    let list = this.tables.get(tableName) || [];

    if (q.includes('organization_id = ?') && this.params.length > 0) {
      const orgId = this.params[0];
      list = list.filter((r) => r.organization_id === orgId);
    } else if (q.includes('WHERE id = ?') && this.params.length > 0) {
      const id = this.params[0];
      list = list.filter((r) => r.id === id);
    } else if (q.includes('WHERE invoice_id = ?') && this.params.length > 0) {
      const id = this.params[0];
      list = list.filter((r) => r.invoice_id === id);
    }

    if (q.includes('is_active = 1')) {
      list = list.filter((r) => r.is_active === 1 || r.is_active === true);
    }

    return { results: list as any, success: true, meta: {} };
  }

  async run(): Promise<{ success: boolean; meta: any }> {
    const q = this.query.trim();
    const fromMatch = q.match(/INTO\s+([a-zA-Z0-9_]+)/i) || q.match(/UPDATE\s+([a-zA-Z0-9_]+)/i) || q.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)/i);
    const tableName = fromMatch ? fromMatch[1] : '';

    if (!tableName) return { success: true, meta: {} };

    let list = this.tables.get(tableName);
    if (!list) {
      list = [];
      this.tables.set(tableName, list);
    }

    if (q.startsWith('INSERT')) {
      const id = this.params[0];
      // Construct object from column names
      const colsMatch = q.match(/\(([^)]+)\)\s+VALUES/i);
      if (colsMatch) {
        const cols = colsMatch[1].split(',').map((c) => c.trim());
        const row: any = {};
        cols.forEach((col, idx) => {
          row[col] = this.params[idx];
        });
        const existingIdx = list.findIndex((r) => r.id === row.id);
        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...row };
        } else {
          list.push(row);
        }
      }
    } else if (q.startsWith('UPDATE')) {
      if (q.includes('WHERE id = ?')) {
        const id = this.params[this.params.length - (q.includes('organization_id') ? 2 : 1)];
        const row = list.find((r) => r.id === id);
        if (row) {
          // simple property assignment if matching
          if (q.includes('is_active = 0')) {
            row.is_active = 0;
          }
        }
      }
    } else if (q.startsWith('DELETE')) {
      if (q.includes('WHERE invoice_id = ?')) {
        const invId = this.params[0];
        this.tables.set(
          tableName,
          list.filter((r) => r.invoice_id !== invId)
        );
      } else if (q.includes('WHERE id = ?')) {
        const id = this.params[0];
        this.tables.set(
          tableName,
          list.filter((r) => r.id !== id)
        );
      }
    }

    return { success: true, meta: {} };
  }
}
