import type { APIRoute } from 'astro';
import { login, safeNext, setSession } from '../../../lib/auth';
import { cmsError } from '../../../lib/cms';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const next = safeNext(form.get('next'));
  const back = (error: string) => redirect(`/login/?error=${error}&next=${encodeURIComponent(next)}`, 303);

  if (!email || !password) return back('missing');
  const res = await login(email, password);
  if (!res.ok || !res.data.token) return back(/locked/i.test(cmsError(res.data)) ? 'locked' : 'invalid');

  setSession(cookies, res.data.token, res.data.exp);
  return redirect(next, 303);
};
