/**
 * Cloudflare Worker Entry Point for KANAKKU SaaS
 * Handles Static Assets, SPA Fallback Routing, and Future Serverless API Endpoints.
 */

export interface WorkerFetcher {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export interface Env {
  // Cloudflare Static Assets Binding (defined in wrangler.jsonc)
  ASSETS: WorkerFetcher;

  // Future SaaS Cloudflare Bindings
  DB?: any;
  SESSION_KV?: any;
  R2?: any;

  // Environment Variables
  ENVIRONMENT?: string;
  APP_NAME?: string;
  GEMINI_API_KEY?: string;
}

export interface WorkerExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, env: Env, ctx?: WorkerExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. API Route Handler (Foundation for future Cloudflare D1/R2/KV backend)
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/health') {
        return Response.json({
          status: 'healthy',
          app: env.APP_NAME || 'Kanakku GST Billing SaaS',
          architecture: 'Cloudflare Workers + Static Assets',
          timestamp: new Date().toISOString(),
          bindings: {
            d1_database: !!env.DB,
            session_kv: !!env.SESSION_KV,
            r2_storage: !!env.R2,
          },
        });
      }

      // Return JSON 404 for unmatched API requests (prevent falling through to HTML)
      return Response.json(
        {
          error: 'API endpoint not found',
          path: url.pathname,
        },
        { status: 404 }
      );
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
