import { handleApiRequest } from '../../../src/server/router';

export async function onRequest(context: {
  request: Request;
  env: any;
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
export const onRequestHead = onRequest;

