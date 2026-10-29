import type { APIRoute } from 'astro';
import { TOKEN_COOKIE, clearSession } from '../../../lib/auth';
import { cms } from '../../../lib/cms';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get(TOKEN_COOKIE)?.value;
  if (token) await cms('/cms-api/users/logout', { method: 'POST', token }).catch(() => {});
  clearSession(cookies);
  return redirect('/', 303);
};
