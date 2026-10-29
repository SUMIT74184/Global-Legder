import { cms } from './cms';
import type { Media } from './articles';
import type { Lang } from './i18n';

// The researcher profile, edited in the admin panel under Globals → Researcher profile.

interface ProfileDoc {
  name?: string | null;
  role?: string | null;
  location?: string | null;
  photo?: Media | number | null;
  bio?: string | null;
  interests?: string[] | null;
  links?: { label: string; url: string }[] | null;
  email?: string | null;
  timeline?: { when: string; what: string; detail?: string | null }[] | null;
}

// Hindi falls back to English field by field until it is filled in.
export async function getProfile(lang: Lang = 'en') {
  const { ok, status, data } = await cms<ProfileDoc>(`/cms-api/globals/profile?depth=1&locale=${lang}`);
  if (!ok) throw new Error(`The CMS answered ${status} for the profile.`);
  const photo = data.photo && typeof data.photo === 'object' ? data.photo.url : '';
  return {
    name: data.name || 'Your Name',
    role: data.role || '',
    location: data.location || '',
    photo,
    bio: (data.bio ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    interests: data.interests ?? [],
    links: data.links ?? [],
    email: data.email || '',
    timeline: (data.timeline ?? []).map((t) => ({ when: t.when, what: t.what, detail: t.detail ?? '' })),
  };
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
