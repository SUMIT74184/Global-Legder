import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPublished } from '../lib/articles';
import { SITE } from '../lib/site';

export async function GET(context: APIContext) {
  const articles = await getPublished();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site!,
    items: articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.pubDate,
      link: `/articles/${a.id}/`,
      categories: [a.data.type, a.data.topic, ...a.data.tags],
    })),
  });
}
