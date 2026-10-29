// /og/default.png, /og/<slug>.png and /og/hi/<slug>.png (Hindi pieces only): share images.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublished, type Article } from '../../lib/articles';
import { getProfile } from '../../lib/profile';
import { ogPng, type OgCard } from '../../lib/og';
import { formatDate, t, topicInfo, typeInfo, type Lang } from '../../lib/i18n';
import { SITE } from '../../lib/site';

const card = (a: Article, lang: Lang, author: string): OgCard => ({
  title: a.data.title,
  kicker: `${typeInfo(lang, a.data.type).label} · ${topicInfo(lang, a.data.topic).label}`,
  footer: `${author} · ${formatDate(a.data.pubDate, lang)}`,
  accent: { geopolitics: '#d97757', finance: '#e2b858', 'war-military': '#788c5d', sports: '#7fa8cf', tech: '#b59ccf' }[a.data.topic],
});

export const getStaticPaths = (async () => {
  const [en, hi, profileEn, profileHi] = await Promise.all([getPublished('en'), getPublished('hi'), getProfile('en'), getProfile('hi')]);
  return [
    { params: { slug: 'default' }, props: { card: { title: t('en').tagline, footer: `${profileEn.name} · ${SITE.name}` } } },
    ...en.map((a) => ({ params: { slug: a.id }, props: { card: card(a, 'en', profileEn.name) } })),
    ...hi.filter((a) => a.lang === 'hi').map((a) => ({ params: { slug: `hi/${a.id}` }, props: { card: card(a, 'hi', profileHi.name) } })),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await ogPng(props.card as OgCard)), { headers: { 'Content-Type': 'image/png' } });
