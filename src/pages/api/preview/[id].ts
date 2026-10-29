// When a draft was last saved, for the preview page's auto-refresh. Editors only (the CMS checks
// the admin login cookie).
import type { APIRoute } from 'astro';
import { cms } from '../../../lib/cms';

export const prerender = false;

export const GET: APIRoute = async ({ params, cookies }) => {
  const token = cookies.get('payload-token')?.value;
  if (!token || !/^\d+$/.test(params.id ?? '')) return new Response(null, { status: 404 });
  const { ok, data } = await cms<{ updatedAt?: string }>(`/cms-api/articles/${params.id}?draft=true&depth=0&select[updatedAt]=true`, { token });
  if (!ok || !data.updatedAt) return new Response(null, { status: 404 });
  return Response.json({ updatedAt: data.updatedAt }, { headers: { 'Cache-Control': 'no-store' } });
};
