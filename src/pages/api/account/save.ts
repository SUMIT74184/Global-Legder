import type { APIRoute } from 'astro';
import { getSession, safeNext, savedIds } from '../../../lib/auth';
import { cms } from '../../../lib/cms';

export const prerender = false;

// GET: which pieces the reader has saved (for the Save buttons on static pages).
export const GET: APIRoute = async ({ cookies }) => {
  const session = await getSession(cookies);
  const body = session ? { signedIn: true, saved: savedIds(session.user) } : { signedIn: false, saved: [] };
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
  });
};

// POST: toggle one piece in the reader's saved list.
export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const next = safeNext(form.get('next'), '/account/');
  const session = await getSession(cookies);
  if (!session) return redirect(`/login/?next=${encodeURIComponent(next)}`, 303);

  const id = Number(form.get('id'));
  if (!Number.isInteger(id) || id <= 0) return redirect(next, 303);
  const current = savedIds(session.user);
  const saved = current.includes(id) ? current.filter((s) => s !== id) : [...current, id];
  await cms(`/cms-api/users/${session.user.id}`, { method: 'PATCH', token: session.token, body: JSON.stringify({ saved }) });
  return redirect(next, 303);
};
