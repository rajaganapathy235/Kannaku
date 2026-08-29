/**
 * Cloudflare Worker Entry Point for KANAKKU SaaS
 * Handles Static Assets, SPA Fallback Routing, and Future Serverless API Endpoints.
 */

import { handleApiRequest } from './server/router';

export interface WorkerFetcher {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export interface Env {
  // Cloudflare Static Assets Binding (defined in wrangler.jsonc)
  ASSETS: WorkerFetcher;

  // Cloudflare D1 Database Binding
  DB?: any;
  SESSION_SECRET?: string;
  SESSION_KV?: any;
  R2?: any;

  // Environment Variables
  ENVIRONMENT?: string;
  APP_NAME?: string;
}

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, env: Env, ctx?: WorkerExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Cloudflare D1 API Request Dispatcher
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest({ request, env, url });
    }

    // 2. Serve Static Assets via Cloudflare Workers Static Assets
    try {
      const response = await env.ASSETS.fetch(request);

      // If asset is not found and the route has no file extension (e.g. /login, /dashboard, /invoices),
      // perform SPA fallback by serving index.html
      if (response.status === 404 && !url.pathname.split('/').pop()?.includes('.')) {
        const spaRequest = new Request(new URL('/', request.url), request);
        return await env.ASSETS.fetch(spaRequest);
      }

      return response;
    } catch (err) {
      return new Response('Asset service unavailable', { status: 500 });
    }
  },
};
