import { handleApiRequest } from '../../../../src/server/router';

export async function onRequest(context: {
  request: Request;
  env: any;
}): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  return await handleApiRequest({ request, env, url });
}
