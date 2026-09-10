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
      const pathname = url.pathname.toLowerCase();
      const isStaticAsset = /\.(png|ico|svg|jpg|jpeg|gif|webp|json|txt|xml|xslt|css|js|woff2?|ttf|eot)$/.test(pathname);

      // If a static asset (e.g. /favicon-48x48.png) was requested but the asset binding returned HTML or 404,
      // prevent returning text/html for image requests.
      if (isStaticAsset) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html') || response.status === 404) {
          // Re-try fetching the static asset directly with clean request
          const cleanAssetRequest = new Request(new URL(url.pathname, request.url), {
            method: 'GET',
            headers: request.headers,
          });
          const retryResponse = await env.ASSETS.fetch(cleanAssetRequest);
          const retryContentType = retryResponse.headers.get('content-type') || '';

          if (!retryContentType.includes('text/html') && retryResponse.status === 200) {
            return retryResponse;
          }

          // If still returning HTML or 404, do not serve SPA index.html for an image URL
          return new Response('Asset not found', {
            status: 404,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
        return response;
      }

      // If route has no file extension (e.g. /login, /dashboard, /invoices) and returns 404 or non-ok,
      // perform SPA fallback by serving index.html
      if (response.status === 404 || (response.status === 200 && !pathname.includes('.'))) {
        const spaRequest = new Request(new URL('/', request.url), request);
        return await env.ASSETS.fetch(spaRequest);
      }

      return response;
    } catch (err) {
      return new Response('Asset service unavailable', { status: 500 });
    }
  },
};
