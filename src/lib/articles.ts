import getReadingTime from 'reading-time';
import { cms } from './cms';
import { indexFootnotes, indexHeadings, plainText, type Footnote, type Heading, type LexicalRoot } from './lexical';
import type { Lang } from './i18n';
import type { ContentType, Topic } from './site';

// The one place pages get pieces from: the Payload CMS (cms/, "articles" collection).
// Each piece has English text and, optionally, a Hindi translation of its title, description, body
// and update notes. A Hindi page shows the English text until the translation exists.

export interface Media {
  id: number;
  url: string;
  alt?: string | null;
  mimeType?: string | null;
}

export interface ArticleDoc {
  id: number;
  slug: string;
  title: string;
  description: string;
  type: ContentType;
  topic: Topic;
  tags?: string[] | null;
  pubDate: string;
  updated?: string | null;
  hero?: Media | number | null;
  featured?: boolean | null;
  body?: LexicalRoot | null;
  references?: { id: string; title: string; publisher?: string | null; url: string; archived?: string | null; accessed?: string | null }[] | null;
  updates?: { date: string; note: string }[] | null;
}

export interface Article {
  id: string; // slug, used in URLs
  docId: number; // CMS id, used for saving
  data: {
    title: string;
    description: string;
    type: ContentType;
    topic: Topic;
    tags: string[];
    pubDate: Date;
    updated?: Date;
    hero?: string;
    heroAlt: string;
    featured: boolean;
    references: { id: string; title: string; publisher?: string; url: string; archived?: string; accessed?: Date }[];
    updates: { date: Date; note: string }[];
  };
  body: LexicalRoot | null;
  headings: Heading[];
  footnotes: Footnote[];
  minutesRead: number;
  lang: Lang; // language of the text (a Hindi page shows English text until translated)
  translations: Lang[]; // languages this piece is written in
}

const media = (m: ArticleDoc['hero']) => (m && typeof m === 'object' ? m : undefined);

export function toArticle(doc: ArticleDoc, lang: Lang = 'en', translations: Lang[] = ['en']): Article {
  const body = doc.body ?? null;
  const hero = media(doc.hero);
  return {
    id: doc.slug,
    docId: doc.id,
    data: {
      title: doc.title,
      description: doc.description,
      type: doc.type,
      topic: doc.topic,
      tags: doc.tags ?? [],
      pubDate: new Date(doc.pubDate),
      updated: doc.updated ? new Date(doc.updated) : undefined,
      hero: hero?.url,
      heroAlt: hero?.alt ?? '',
      featured: !!doc.featured,
      references: (doc.references ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        publisher: r.publisher ?? undefined,
        url: r.url,
        archived: r.archived ?? undefined,
        accessed: r.accessed ? new Date(r.accessed) : undefined,
      })),
      updates: (doc.updates ?? []).map((u) => ({ date: new Date(u.date), note: u.note })),
    },
    body,
    headings: indexHeadings(body),
    footnotes: indexFootnotes(body),
    minutesRead: Math.max(1, Math.round(getReadingTime(plainText(body)).minutes)),
    lang,
    translations,
  };
}

// One fetch per build and language; in dev, fresh on every request so admin edits show at once.
const cache = new Map<Lang, { at: number; list: Promise<Article[]> }>();

async function fetchDocs(params: Record<string, string>) {
  const q = new URLSearchParams({ 'where[_status][equals]': 'published', limit: '1000', sort: '-pubDate', ...params });
  const { ok, status, data } = await cms<{ docs: ArticleDoc[] }>(`/cms-api/articles?${q}`);
  if (!ok) throw new Error(`The CMS answered ${status} when listing articles.`);
  return data.docs;
}

// Ids of pieces that have a Hindi title (no fallback to English).
async function hindiIds() {
  const docs = await fetchDocs({ locale: 'hi', 'fallback-locale': 'none', depth: '0', 'select[title]': 'true' });
  return new Set(docs.filter((d) => d.title).map((d) => d.id));
}

export async function getPublished(lang: Lang = 'en'): Promise<Article[]> {
  const ttl = import.meta.env.DEV ? 0 : 60_000;
  const hit = cache.get(lang);
  if (hit && Date.now() - hit.at < ttl) return hit.list;
  const list = (async () => {
    const [docs, hindi] = await Promise.all([fetchDocs({ locale: lang, depth: '2' }), hindiIds()]);
    return docs.map((d) => {
      const translations: Lang[] = hindi.has(d.id) ? ['en', 'hi'] : ['en'];
      return toArticle(d, lang === 'hi' && hindi.has(d.id) ? 'hi' : 'en', translations);
    });
  })();
  cache.set(lang, { at: Date.now(), list });
  return list;
}

// Same topic counts 2, same type 1, each shared tag 1; ties go to the newer piece.
export function related(current: Article, all: Article[], limit = 3): Article[] {
  const score = (a: Article) =>
    (a.data.topic === current.data.topic ? 2 : 0) +
    (a.data.type === current.data.type ? 1 : 0) +
    a.data.tags.filter((t) => current.data.tags.includes(t)).length;
  return all
    .filter((a) => a.id !== current.id && score(a) > 1)
    .sort((a, b) => score(b) - score(a) || b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, limit);
}
