// Draft previews for the admin's live-preview pane. The admin panel shares the site's address, so
// its login cookie (payload-token) reaches these pages; the CMS only returns drafts to editors.
import type { AstroCookies } from 'astro';
import { cms } from './cms';
import { toArticle, type Article, type ArticleDoc } from './articles';
import type { Lang } from './i18n';

export async function getDraft(id: string | undefined, lang: Lang, cookies: AstroCookies): Promise<Article | null> {
  const token = cookies.get('payload-token')?.value;
  if (!token || !/^\d+$/.test(id ?? '')) return null;
  const q = `draft=true&depth=2&locale=${lang}`;
  const [doc, hi] = await Promise.all([
    cms<ArticleDoc>(`/cms-api/articles/${id}?${q}`, { token }),
    cms<ArticleDoc>(`/cms-api/articles/${id}?draft=true&depth=0&locale=hi&fallback-locale=none`, { token }),
  ]);
  if (!doc.ok || !doc.data?.id) return null;
  const hasHindi = !!hi.data?.title;
  // Unsaved pieces may lack required fields; fill them so the page still renders.
  const d: ArticleDoc = {
    ...doc.data,
    slug: doc.data.slug || 'draft',
    title: doc.data.title || '(untitled)',
    description: doc.data.description || '',
    type: doc.data.type || 'research',
    topic: doc.data.topic || 'geopolitics',
    pubDate: doc.data.pubDate || new Date().toISOString(),
  };
  return toArticle(d, lang === 'hi' && hasHindi ? 'hi' : 'en', hasHindi ? ['en', 'hi'] : ['en']);
}
