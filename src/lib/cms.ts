// Thin client for the Payload CMS REST API (cms/). Used at build time for content and at request
// time by the account pages and /api/* endpoints.

export const CMS_URL = (process.env.PAYLOAD_URL ?? import.meta.env.PAYLOAD_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export interface CmsResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

export async function cms<T = unknown>(path: string, init: RequestInit & { token?: string } = {}): Promise<CmsResult<T>> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${CMS_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `JWT ${token}` } : {}),
        ...headers,
      },
    });
  } catch (err) {
    throw new Error(`Cannot reach the CMS at ${CMS_URL} (${(err as Error).message}). Is "pnpm dev" running in cms/?`);
  }
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

// First error message from a Payload error response.
export function cmsError(data: unknown): string {
  const errors = (data as { errors?: { message?: string; data?: { errors?: { message?: string }[] } }[] })?.errors;
  return errors?.[0]?.data?.errors?.[0]?.message ?? errors?.[0]?.message ?? '';
}
