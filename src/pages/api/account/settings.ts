import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/auth';
import { cms } from '../../../lib/cms';
import { TOPIC_KEYS } from '../../../lib/site';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = await getSession(cookies);
  if (!session) return redirect('/login/?next=/account/', 303);

  const form = await request.formData();
  const data: { name?: string; newsletterTopics?: string[] } = {};
  if (form.get('section') === 'profile') {
    const name = String(form.get('name') ?? '').trim().slice(0, 80);
    if (!name) return redirect('/account/?msg=name#settings', 303);
    data.name = name;
  } else {
    data.newsletterTopics = form.getAll('topics').map(String).filter((t) => (TOPIC_KEYS as string[]).includes(t));
  }
  const res = await cms(`/cms-api/users/${session.user.id}`, { method: 'PATCH', token: session.token, body: JSON.stringify(data) });
  const anchor = data.name ? 'settings' : 'newsletter';
  return redirect(`/account/?msg=${res.ok ? 'saved' : 'error'}#${anchor}`, 303);
};
