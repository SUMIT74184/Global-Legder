// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { cmsProxy } from './integrations/cms-proxy.mjs';

// TODO: replace with the real domain once it is bought (used by sitemap, RSS, canonical URLs).
const SITE_URL = 'https://thegloballedger.example';
// The Payload CMS (cms/). Its admin panel and API appear on the site at /admin and /cms-api.
const CMS_URL = process.env.PAYLOAD_URL || 'http://localhost:3000';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  // Pages are pre-built at build time; only login, signup, account and /api/* run on the server.
  adapter: node({ mode: 'standalone' }),
  // English at /, Hindi at /hi/. Pages read the language with langOf(Astro) (src/lib/i18n.ts).
  i18n: {
    locales: ['en', 'hi'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  security: {
    // Rejects form posts from other sites (CSRF). The server only trusts these hosts, so the
    // origin check knows its own address.
    checkOrigin: true,
    allowedDomains: [
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
      { hostname: new URL(SITE_URL).hostname, protocol: 'https' },
    ],
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(account|login|signup|admin|preview)\//.test(page),
      i18n: { defaultLocale: 'en', locales: { en: 'en-GB', hi: 'hi-IN' } },
    }),
  ],
  vite: {
    // Dev: /admin and /cms-api are forwarded to Payload. In production a reverse proxy does the
    // same (deploy/Caddyfile).
    plugins: [tailwindcss(), cmsProxy(CMS_URL)],
    // Bundled up front so the dev server never serves a stale copy when a map first loads.
    optimizeDeps: { include: ['maplibre-gl'] },
  },
});
