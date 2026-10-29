# The Global Ledger

A research site for in-depth articles, case studies and financial reports on geopolitics and world events, finance and markets, war and the military, sports, and tech. It is also the written companion to the YouTube channel and the researcher's public profile.

It is in **English and Hindi** (`/` and `/hi/`). It has two parts:

| Part | What | Runs at |
|---|---|---|
| **Site** (this folder) | Astro 5. Public pages are pre-built; login, signup, account and `/api/*` run on the server | `localhost:4321` |
| **CMS** (`cms/`) | Payload CMS 3 on PostgreSQL: the admin panel, accounts, and the content API | runs on `localhost:3000`, shown on the site at **`/admin`** and `/cms-api` |

The look borrows from [cityrt.com](https://cityrt.com): a hand-drawn "sketch" interface on warm paper, with springy motion. It is a **hybrid**: pages, cards, charts, stamps, notes, forms and the profile are hand-drawn, while article text stays plain serif for comfortable reading.

Plan: [The Global Ledger — Research Website Plan](https://claude.ai/artifact/UBNekieKnGfzNCf89xqVDJ)

## Quick start

Needs **Node 24** (Payload requires 22.23+; `.nvmrc` pins 24), **pnpm**, and **Docker**.

```bash
nvm use                       # Node 24
pnpm install && pnpm --dir cms install
cp .env.example .env          # set POSTGRES_PASSWORD
cp cms/.env.example cms/.env  # same password in DATABASE_URL; PAYLOAD_SECRET from: openssl rand -hex 32

pnpm db        # start Postgres in Docker (port 5433)
pnpm cms       # Payload on :3000 (keep it running)
pnpm seed      # first time only: demo piece and profile
pnpm dev       # the site on http://localhost:4321, admin at http://localhost:4321/admin
```

**Create your admin account:** open `http://localhost:4321/admin`. On a fresh database it shows "Create first user", and that account becomes the **admin**. Do this before the site is public: until an admin exists, anyone who reaches `/admin` could take that slot.

`pnpm build` needs the CMS running, because it pulls every published piece at build time. It also builds the search index (Pagefind) and the share images. `pnpm start` runs the built server.

**Analytics (optional):** `pnpm analytics` starts Umami at `http://localhost:3001`. Log in with Umami's default account (`admin` / `umami`) and **change that password first**. Then add a website and copy its tracking script URL and website ID into `.env` as `PUBLIC_UMAMI_SRC` and `PUBLIC_UMAMI_WEBSITE_ID`. Analytics stays off until both are set; it sets no cookies and respects Do Not Track.

## Daily use

- **Write**: Admin → Pieces → Create new. Set Type and Topic in the sidebar, write in the editor, and add blocks with `+`:
  - **Line chart** and **Bar chart**: upload a CSV to Media first.
  - **Map**: places (name, latitude, longitude, note) and routes ("lat, lng" per line).
  - **Timeline**, **Image gallery**, **Sticky note**, **YouTube video**.

  Inside a sentence, type `/` or use the toolbar to add a **Footnote** (an inline block). The site numbers footnotes and lists them under the text. Longer sources go on the **References** tab. Drafts autosave; press **Publish** when ready.
- **Preview**: the eye icon at the top of a piece opens a live preview next to the editor (phone or laptop width). It reloads each time the draft saves. The arrow icon opens the preview in a new tab. Only signed-in editors and admins can see previews.
- **Hindi**: switch **Locale** (top right of the editor) to हिन्दी and fill in the title, description, body and update notes. Everything else (type, topic, dates, images, sources) is shared. Until a piece has a Hindi title, `/hi/` shows the English text with a note, and search engines are told not to index that copy. The profile works the same way (Globals → Researcher profile).
- **Profile**: Admin → Globals → Researcher profile.
- **Editors**: create a user in Admin → Users and set Role to Editor. Editors can write and publish but can't delete pieces or change roles.
- **Readers** sign up on the site (`/signup/`). They can save pieces, choose newsletter topics, change their name and password, and delete their account at `/account/`. They can't open the admin panel.
- In dev, edits show on the site on the next page load. In production, set `DEPLOY_HOOK_URL` in `cms/.env` so publishing triggers a rebuild.

## Status

### Done (29 Oct 2026)

| Area | What exists |
|---|---|
| Admin panel | At `/admin` on the site, styled like it (palette, fonts, logo). Payload 3.92 + Postgres 16 (Docker). Pieces with drafts, autosave and 50 versions each; Media (images + CSV); Users; Researcher profile global |
| Rich text | Lexical editor with headings, lists, links, quotes and images. Blocks: line chart, bar chart, map, timeline, image gallery, sticky note, YouTube. Inline: footnote. The site renders them with its own components (`RichNode.astro`) |
| Live preview | Draft preview next to the editor, in both languages (`/preview/articles/<id>/`, `/hi/preview/…`), reloads on autosave |
| Hindi | Every public page at `/hi/…` with Hindi menus and labels (`src/lib/i18n.ts`). Pieces and the profile have Hindi fields with English fallback. Devanagari fonts (Noto Serif/Sans Devanagari, Kalam for the hand-drawn face), `hreflang` links, and a language switch in the header |
| Search | Pagefind index built after `astro build`, one per language, at `/search/` and `/hi/search/` |
| Maps | MapLibre with OpenFreeMap tiles (no key) recoloured to the site palette and theme; routes draw themselves, then the places drop in; loads only when a map nears the screen |
| SEO | Share image per piece (and per Hindi piece) at `/og/…png`; JSON-LD for the site (with search), each piece (Article/Report with citations) and the profile (Person); sitemap with language alternates |
| Analytics | Umami (self-hosted, Docker), switched on by two `.env` values |
| Roles | Admin (everything), Editor (write + publish), Reader (own account). Enforced in `cms/src/access.ts` |
| Accounts | Signup, login, logout, saved pieces (Save button on every piece), newsletter topics, name and password change, account deletion |
| Sessions | Payload JWT in an HTTP-only, SameSite=Lax cookie that only the site's server reads; a non-secret `gl_session` flag lets static pages show "Account" |
| Content model | Type (Research, Case study, Financial report) and Topic (Geopolitics, Finance & markets, War & military, Sports, Tech news), with a page, filter chip and home card each |
| Pages | Home, Research, Case studies, Financial reports, Everything, 5 topics, piece page, researcher profile, search (all in English and Hindi), login, signup, account, 404, RSS, sitemap |
| Piece page | Type stamp, topic, tags, author, dates, reading time, Save, Ken Burns hero, sticky table of contents, rich body, references, updates, related pieces |
| Design + motion | Sketch frames that boil on hover, self-drawing lines and charts, stamps, sticky notes, Ken Burns, page transitions, scroll reveals, dark mode, reduced-motion support |

**Checked:**
- `pnpm build` passes.
- An end-to-end script against the running site and CMS passes all 19 checks:
  - Signup always creates a reader, even when the form sends `role=admin`.
  - A reader can't promote itself, list other users, create pieces, or open the admin panel.
  - Cross-site form posts are rejected (403), and outside redirect targets are ignored.
  - Save, topics, wrong-password, logout, login and delete all behave as expected.
- Login and piece pages were screenshotted at desktop width.
- The demo piece (English and Hindi) was rendered in headless Chrome with every new block: charts, the map (tiles, routes, pins), timeline, gallery, footnote and notes list. English and Hindi search each return results.
- Draft preview returns 404 without an admin login, and renders English and Hindi drafts (even an empty one) for an editor.
- The share images render in both scripts.
- The admin editor shows the locale switch, preview buttons and the new blocks.

**Not checked yet:**
- Password reset email (no email service yet).
- The live-preview pane opened inside the admin by hand (the preview page and its reload script were tested separately).
- Analytics with a real Umami website ID.
- A real phone.
- Lighthouse scores.

### Needs your input

- [x] **Create the admin account**
- [ ] **Profile**: fill in Admin → Globals → Researcher profile
- [ ] **Demo piece**: unpublish or delete "Inside a Ledger piece" before launch (it shows every block in both languages, so keep it as a draft for reference)
- [ ] **Hindi**: check the menu and label translations in `src/lib/i18n.ts`
- [ ] **Analytics**: change Umami's default password, add the site, fill in the two `PUBLIC_UMAMI_` values
- [ ] **Domain**: set `SITE_URL` in `astro.config.mjs`
- [ ] **Links** in `src/lib/site.ts`: author name, YouTube, GitHub
- [ ] **Brand**: confirm palette, logo and wordmark in Figma

### Next

**Accounts**
- [ ] Email service (e.g. Resend) for forgot-password and email verification (`auth.verify` in `cms/src/collections/Users.ts`)
- [ ] Forgot-password and reset pages on the site
- [ ] Rate limiting on `/api/auth/*` at the host or proxy
- [ ] Newsletter sending (Buttondown or Resend broadcasts) using readers' chosen topics
- [ ] Comments for signed-in readers; later, paid reports (membership + Razorpay)

**Admin**
- [ ] Map block: pick places by clicking a map instead of typing coordinates
- [ ] Hindi versions of login, signup and account pages (they are English-only now)
- [ ] A Hindi RSS feed

**Deploy**
- [ ] Postgres: Neon or Supabase; media: Cloudflare R2 (Payload storage adapter)
- [ ] CMS on a Node host (Railway, Render or a VPS); site on a Node host or Vercel with the matching Astro adapter
- [ ] Deploy hook so publishing rebuilds the site
- [ ] Reverse proxy so `/admin` and `/cms-api` reach Payload on the same domain (`deploy/Caddyfile`)
- [ ] Umami on the server (or Umami Cloud), with its own database backup
- [ ] Git: `git init`, push to GitHub (both `.env` files are git-ignored)


## How it fits together

```
Browser ──> Astro site (localhost:4321)
              ├─ pre-built pages  ← built from the Payload API (pieces, profile)
              ├─ /login /signup /account   (server-rendered)
              ├─ /api/auth/*  /api/account/*  ──> Payload API (localhost:3000) ──> Postgres (Docker, 5433)
              ├─ /admin  /cms-api/*  /_next/*  ──> forwarded to Payload (same origin)
              ├─ /preview/articles/<id>/   (server-rendered, admin login cookie)
              └─ /hi/…  the same pages in Hindi
Umami (localhost:3001) ──> Postgres, database "umami"
```

- **One address.** The admin panel lives at `/admin` on the site. In dev, `integrations/cms-proxy.mjs` forwards `/admin`, `/cms-api` and Next's `/_next` assets to Payload; in production a reverse proxy does it (`deploy/Caddyfile`). Payload's API is at `/cms-api` because `/api` belongs to the site's own endpoints. `PAYLOAD_PUBLIC_URL` in `cms/.env` must be the site's address (`http://localhost:4321` in dev), or admin logins fail.
- **Admin look.** The panel is Payload's own React app, so it can't reuse the site's Astro components. `cms/src/app/(payload)/custom.scss` gives it the site's paper-and-ink palette (light and dark), Inter and Pangolin fonts, clay buttons and springy cards; `cms/src/components/admin/` has the wordmark logo. The boiling sketch borders stay on the public site: on forms and tables they would make the editor harder to use.
- The browser never calls the CMS directly. Site endpoints forward requests with the user's token, so the CMS needs no CORS setup.
- Content comes only through `src/lib/articles.ts` and `src/lib/profile.ts`, which take a language. Hindi pages ask the CMS for Hindi with English fallback, and check separately which pieces have a Hindi title.
- **Languages.** Astro's i18n routing gives each page its language (`langOf(Astro)`). Pages are written once in `src/views/`; `src/pages/` and `src/pages/hi/` are one-line wrappers. Interface text lives in `src/lib/i18n.ts`.
- **Changing localized fields.** In dev, Payload changes the database to match the config. Making an existing field translatable moves its data, and Payload asks before dropping columns. Back up first (`backups/` has the dump taken before the Hindi change).
- Access rules live in the CMS, so they hold even when someone calls the API directly.
- `security.checkOrigin` stops other sites from posting forms. `security.allowedDomains` in `astro.config.mjs` must list your real domain.

## How the cityrt.com effects were reproduced

cityrt.com uses no animation library (no GSAP, Three.js or Lenis). Its look comes from CSS keyframes plus a small JS renderer that draws outlines from seeded noise. This site does the same:

| cityrt technique | Here |
|---|---|
| Procedural hand-drawn borders (seeded value noise) | `src/scripts/sketch.ts` |
| "Line boil": 3 drawings cycled with `visibility` keyframes | `.sk-f0/1/2` + `@keyframes sk-boil` in `global.css` |
| Springy overshoot easing `cubic-bezier(.3,1.55,.5,1)` | `--spring` token |
| Slightly rotated paper cards | `--tilt` on `.card`, `.note`, `.stamp` |
| Stamp and unfold pop-ins | `data-reveal="stamp"`, `data-reveal="unfold"` |
| Ken Burns on images (`mn-kb*`) | `.kb`, `@keyframes kb0–kb2` |
| Line drawing via `stroke-dashoffset` | `data-draw` + `pathLength="1"` |
| Paper / kraft / manilla / clay palette, Pangolin + Inter | tokens at the top of `global.css` |

## Using the effects

```html
<a class="card" data-sketch="fill">…</a>                    <!-- hand-drawn card, boils on hover -->
<button class="btn btn-primary" data-sketch="fill">…</button>
<div data-sketch data-sketch-r="999" data-sketch-amp="2">…</div>  <!-- pill/circle, wobblier -->
<ul data-reveal="stagger"><li style="--i:0">…</li></ul>      <!-- staggered reveal -->
<svg data-reveal><path d="…" pathLength="1" data-draw /></svg>  <!-- self-drawing line -->
```

Keep `data-reveal` off elements that have their own hover movement (such as `.card`). Put it on a wrapper instead, as the card grids do.

## Project layout

```
cms/                    Payload CMS (see cms/README.md)
deploy/Caddyfile        production reverse proxy (site + /admin on one domain)
integrations/           cms-proxy.mjs: /admin and /cms-api in dev
docker-compose.yml      Postgres and Umami for local development (docker/: Umami database init)
backups/                database dumps (git-ignored)
src/
  components/   Header, Footer, ArticleCard, ArticleGrid, RichText/RichNode, LineChart, BarChart,
                MapBlock, Timeline, Gallery, Footnotes, Note, Stamp, YouTube, SaveButton, AuthShell,
                SourceList, Updates, Toc, HeroRoute
  views/        Home, Listing, Article, Profile, Search: each page, written once for both languages
  layouts/BaseLayout.astro   head/SEO (hreflang, JSON-LD, share image), theme, analytics, scripts
  lib/          cms.ts (API client), articles.ts, profile.ts, preview.ts, auth.ts (sessions),
                i18n.ts (languages, interface text), lexical.ts, og.ts (share images),
                site.ts (types, topics), chart.ts, transitions.ts
  pages/        English routes; hi/ Hindi routes; preview/ drafts; og/ share images;
                login, signup, account, api/auth/*, api/account/*, 404, rss.xml
  scripts/      sketch.ts, reveal.ts, ui.ts, map.ts (MapLibre), preview.ts (reload on save)
  styles/global.css   tokens, effects, forms, blocks, Hindi type
```
