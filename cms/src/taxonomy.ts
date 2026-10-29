// Keep in sync with TOPICS and TYPES in ../../src/lib/site.ts (the Astro site).

export const TYPE_OPTIONS = [
  { label: 'Research', value: 'research' },
  { label: 'Case study', value: 'case-study' },
  { label: 'Financial report', value: 'report' },
]

export const TOPIC_OPTIONS = [
  { label: 'Geopolitics', value: 'geopolitics' },
  { label: 'Finance & markets', value: 'finance' },
  { label: 'War & military', value: 'war-military' },
  { label: 'Sports', value: 'sports' },
  { label: 'Tech news', value: 'tech' },
]

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
