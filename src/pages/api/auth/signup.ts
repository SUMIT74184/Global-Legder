import type { APIRoute } from 'astro';
import { login, safeNext, setSession } from '../../../lib/auth';
import { cms, cmsError } from '../../../lib/cms';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim().slice(0, 80);
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const next = safeNext(form.get('next'));
  const back = (error: string) => redirect(`/signup/?error=${error}&next=${encodeURIComponent(next)}`, 303);

  if (!name || !email) return back('missing');
  if (password.length < 8) return back('short');

  // New accounts are always readers: the CMS ignores a role sent by anyone but an admin.
  const created = await cms('/cms-api/users', { method: 'POST', body: JSON.stringify({ name, email, password }) });
  if (!created.ok) return back(/already/i.test(cmsError(created.data)) ? 'exists' : 'invalid');

  const res = await login(email, password);
  if (!res.ok || !res.data.token) return redirect('/login/?error=invalid', 303);
  setSession(cookies, res.data.token, res.data.exp);
  return redirect(next, 303);
};
