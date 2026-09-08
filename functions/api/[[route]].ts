/**
 * Cloudflare Pages Functions Catch-All API Handler
 * Matches any request to /api/* when deployed via Cloudflare Pages.
 * Delegates directly to the shared Cloudflare D1 API Router.
 */

import { handleApiRequest } from '../../src/server/router';

export async function onRequest(context: {
  request: Request;
  env: any;
  params: any;
  waitUntil: (promise: Promise<any>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);

  return await handleApiRequest({ request, env, url });
}

export const onRequestGet = onRequest;
export const onRequestPost = onRequest;
export const onRequestPut = onRequest;
export const onRequestDelete = onRequest;
export const onRequestOptions = onRequest;

