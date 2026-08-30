import express from 'express';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createServer as createViteServer } from 'vite';
import { D1Database, ensureTables, seedInitialTenants } from './src/server/db';
import { handleApiRequest } from './src/server/router';

// Helper to wrap node:sqlite into Cloudflare D1 Database interface
export function createD1Adapter(sqliteDb: DatabaseSync): D1Database {
  return {
    async exec(query: string): Promise<any> {
      return sqliteDb.exec(query);
    },
    prepare(query: string) {
      let bound: any[] = [];
      const prepared = {
        bind(...values: any[]) {
          bound = values.map((v) => (v === undefined ? null : v));
          return prepared;
        },
        async first<T = unknown>(colName?: string): Promise<T | null> {
          try {
            const stmt = sqliteDb.prepare(query);
            const row = stmt.get(...bound) as any;
            if (!row) return null;
            if (colName) return (row[colName] ?? null) as T;
            return row as T;
          } catch (e: any) {
            console.error('D1 adapter first() error:', e?.message || e, query);
            throw e;
          }
        },
        async all<T = unknown>(): Promise<{ results: T[]; success: boolean; meta: any }> {
          try {
            const stmt = sqliteDb.prepare(query);
            const rows = (stmt.all(...bound) || []) as T[];
            return { results: rows, success: true, meta: {} };
          } catch (e: any) {
            console.error('D1 adapter all() error:', e?.message || e, query);
            throw e;
          }
        },
        async run(): Promise<{ success: boolean; meta: any }> {
          try {
            const stmt = sqliteDb.prepare(query);
            const res = stmt.run(...bound);
            return { success: true, meta: res };
          } catch (e: any) {
            console.error('D1 adapter run() error:', e?.message || e, query);
            throw e;
          }
        },
      };
      return prepared;
    },
    async batch<T = unknown>(stmts: any[]): Promise<any[]> {
      sqliteDb.exec('BEGIN TRANSACTION');
      const results: any[] = [];
      try {
        for (const s of stmts) {
          results.push(await s.run());
        }
        sqliteDb.exec('COMMIT');
        return results;
      } catch (e) {
        sqliteDb.exec('ROLLBACK');
        throw e;
      }
    },
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite database file in ./data folder for persistence across restarts
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'kannaku_d1.db');
  const sqlite = new DatabaseSync(dbPath);
  const d1 = createD1Adapter(sqlite);

  // Auto-initialize schema & seed demo tenants
  try {
    await ensureTables(d1);
    await seedInitialTenants(d1);
    console.log('[Server] Cloudflare D1 local SQLite database initialized at:', dbPath);
  } catch (err) {
    console.error('[Server] Failed to initialize database schema:', err);
  }

  // Parse JSON and form bodies
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API router using the universal handleApiRequest dispatcher
  app.all('/api/*', async (req, res) => {
    try {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || `localhost:${PORT}`;
      const url = new URL(req.originalUrl || req.url, `${protocol}://${host}`);

      // Forward request headers
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }

      // Convert body for non-GET/HEAD methods
      let body: string | undefined = undefined;
      const method = req.method.toUpperCase();
      if (!['GET', 'HEAD'].includes(method)) {
        if (req.body && typeof req.body === 'object') {
          body = JSON.stringify(req.body);
        } else if (typeof req.body === 'string') {
          body = req.body;
        }
      }

      const webRequest = new Request(url.toString(), {
        method,
        headers,
        body,
      });

      const response = await handleApiRequest({
        request: webRequest,
        env: {
          DB: d1,
          SESSION_SECRET: process.env.SESSION_SECRET || 'kannaku-saas-production-session-key-fallback-2026',
          ENVIRONMENT: process.env.NODE_ENV || 'development',
          APP_NAME: 'Kanakku GST Billing SaaS',
        },
        url,
      });

      // Forward HTTP status
      res.status(response.status);

      // Forward response headers (handling multiple Set-Cookie headers properly)
      response.headers.forEach((val, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          res.append('Set-Cookie', val);
        } else {
          res.setHeader(key, val);
        }
      });

      // Send response body
      const responseText = await response.text();
      res.send(responseText);
    } catch (err: any) {
      console.error('[Server API Error]', err);
      res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' });
    }
  });

  // Vite Middleware in Development vs. Static File Serving in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] KANAKKU SaaS running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
