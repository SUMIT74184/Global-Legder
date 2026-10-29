import type { APIRoute } from 'astro';
import { clearSession, getSession } from '../../../lib/auth';
import { cms } from '../../../lib/cms';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/login/', 303);

  const form = await request.formData();
  if (form.get('confirm') !== 'yes') return redirect('/account/?msg=confirm#delete', 303);
  if (session.user.role === 'admin') return redirect('/account/?msg=admin#delete', 303);

  const res = await cms(`/cms-api/users/${session.user.id}`, { method: 'DELETE', token: session.token });
  if (!res.ok) return redirect('/account/?msg=error#delete', 303);
  clearSession(cookies);
  return redirect('/?account=deleted', 303);
};
