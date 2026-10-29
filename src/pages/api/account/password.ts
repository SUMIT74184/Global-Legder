import type { APIRoute } from 'astro';
import { getSession, login } from '../../../lib/auth';
import { cms } from '../../../lib/cms';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/login/?next=/account/', 303);

  const form = await request.formData();
  const current = String(form.get('current') ?? '');
  const next = String(form.get('password') ?? '');
  if (next.length < 8) return redirect('/account/?msg=short#password', 303);

  const check = await login(session.user.email, current);
  if (!check.ok) return redirect('/account/?msg=wrong#password', 303);

  const res = await cms(`/cms-api/users/${session.user.id}`, { method: 'PATCH', token: session.token, body: JSON.stringify({ password: next }) });
  return redirect(`/account/?msg=${res.ok ? 'password' : 'error'}#password`, 303);
};
