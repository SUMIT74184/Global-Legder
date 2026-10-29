import type { AstroCookies } from 'astro';
import { cms } from './cms';
import type { ArticleDoc } from './articles';

// Reader and staff sessions. The Payload JWT lives in an HTTP-only cookie that only this server
// reads; `gl_session` is a harmless flag the browser can see, so static pages can show
// "Account" instead of "Sign in".

export const TOKEN_COOKIE = 'gl_token';
export const FLAG_COOKIE = 'gl_session';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'reader';
  createdAt: string;
  saved?: (number | ArticleDoc)[] | null;
  newsletterTopics?: string[] | null;
}

export interface Session {
  user: User;
  token: string;
}

export async function getSession(cookies: AstroCookies, depth = 0): Promise<Session | null> {
  const token = cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  const me = await cms<{ user: User | null }>('/cms-api/users/me', { token });
  if (!me.ok || !me.data.user) {
    clearSession(cookies);
    return null;
  }
  if (depth === 0) return { user: me.data.user, token };
  const full = await cms<User>(`/cms-api/users/${me.data.user.id}?depth=${depth}`, { token });
  return { user: full.ok ? full.data : me.data.user, token };
}

export async function login(email: string, password: string) {
  return cms<{ token?: string; exp?: number; user?: User; errors?: unknown }>('/cms-api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function setSession(cookies: AstroCookies, token: string, exp?: number) {
  const maxAge = exp ? Math.max(60, exp - Math.floor(Date.now() / 1000)) : 60 * 60 * 24 * 30;
  const base = { sameSite: 'lax' as const, secure: import.meta.env.PROD, path: '/', maxAge };
  cookies.set(TOKEN_COOKIE, token, { ...base, httpOnly: true });
  cookies.set(FLAG_COOKIE, '1', { ...base, httpOnly: false });
}

export function clearSession(cookies: AstroCookies) {
  cookies.delete(TOKEN_COOKIE, { path: '/' });
  cookies.delete(FLAG_COOKIE, { path: '/' });
}

// Only same-site paths are allowed as a redirect target after login.
export const safeNext = (value: unknown, fallback = '/account/') =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : fallback;

export const savedIds = (user: User): number[] =>
  (user.saved ?? []).map((s) => (typeof s === 'number' ? s : s.id));
