# The Global Ledger

![version](https://img.shields.io/badge/version-1.0.0-b5533c) ![astro](https://img.shields.io/badge/Astro-5-1d1d1d) ![payload](https://img.shields.io/badge/Payload_CMS-3.92-1d1d1d) ![postgres](https://img.shields.io/badge/Postgres-16-336791) ![node](https://img.shields.io/badge/Node-24-417e38)

A research site for in-depth articles, case studies and financial reports on geopolitics and world events, finance and markets, war and the military, sports, and tech. It is also the written companion to the YouTube channel and the researcher's public profile.

It is in **English and Hindi** (`/` and `/hi/`). It has two parts:

| Part | What | Runs at |
|---|---|---|
| **Site** (this folder) | Astro 5. Public pages are pre-built; login, signup, account and `/api/*` run on the server | `localhost:4321` |
| **CMS** (`cms/`) | Payload CMS 3 on PostgreSQL: the admin panel, accounts, and the content API | runs on `localhost:3000`, shown on the site at **`/admin`** and `/cms-api` |

The look borrows from [cityrt.com](https://cityrt.com): a hand-drawn "sketch" interface on warm paper, with springy motion. It is a **hybrid**: pages, cards, charts, stamps, notes, forms and the profile are hand-drawn, while article text stays plain serif for comfortable reading.

Plan: [The Global Ledger — Research Website Plan](https://claude.ai/artifact/UBNekieKnGfzNCf89xqVDJ)

**Contents:** [Quick start](#quick-start) · [Daily use](#daily-use) · [Version 1.0](#version-10--complete-29-oct-2026) · [Deployment](#deployment) · [Still missing](#still-missing-to-reach-a-complete-public-launch) · [Roadmap](#roadmap-after-launch) · [How it fits together](#how-it-fits-together) · [Project layout](#project-layout)

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

### Scripts

| Command | What it does |
|---|---|
| `pnpm db` | Start Postgres (and Umami's database) in Docker |
| `pnpm cms` | Run Payload in dev mode on `:3000` |
| `pnpm seed` | Add the demo piece and profile |
| `pnpm dev` | Run the site in dev mode on `:4321` (proxies `/admin` and `/cms-api`) |
| `pnpm build` | Build the site and the Pagefind search index (CMS must be running) |
| `pnpm start` | Run the built site (`dist/server/entry.mjs`) |
| `pnpm analytics` | Start Umami on `:3001` |
| `pnpm --dir cms build` / `start` | Build / run the CMS for production |
| `pnpm --dir cms generate:types` / `generate:importmap` | Run after changing collections, fields or admin components |

### Environment variables

| File | Variable | Used for |
|---|---|---|
| `.env` | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | The Postgres container |
| `.env` | `PAYLOAD_URL` | Where the site reaches Payload (server side; `http://localhost:3000`) |
| `.env` | `UMAMI_APP_SECRET` | Umami's signing secret (`openssl rand -hex 32`) |
| `.env` | `PUBLIC_UMAMI_SRC`, `PUBLIC_UMAMI_WEBSITE_ID` | Turn on analytics. **Inlined at build time**, so rebuild after changing them |
| `cms/.env` | `DATABASE_URL` | Payload's Postgres connection |
| `cms/.env` | `PAYLOAD_SECRET` | Signs login tokens (`openssl rand -hex 32`, different per environment) |
| `cms/.env` | `PAYLOAD_PUBLIC_URL` | The **site's** public address (`http://localhost:4321` in dev, `https://your-domain` in production) |
| `cms/.env` | `DEPLOY_HOOK_URL` | Optional: URL to POST to when a published piece changes, to rebuild the site |

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
- In dev, edits show on the site on the next page load. In production, public pages are pre-built, so a **rebuild** is needed after publishing (see [Rebuild on publish](#7-rebuild-on-publish)).

## Version 1.0 — complete (29 Oct 2026)

Version 1 covers the full writing-to-reading loop: write in the admin, preview, publish in two languages, and let readers find, save and follow pieces.

| Area | What exists |
|---|---|
| Admin panel | At `/admin` on the site, styled like it (palette, fonts, logo). Payload 3.92 + Postgres 16 (Docker). Pieces with drafts, autosave and 50 versions each; Media (images + CSV); Users; Researcher profile global |
| Rich text | Lexical editor with headings, lists, links, quotes and images. Blocks: line chart, bar chart, map, timeline, image gallery, sticky note, YouTube. Inline: footnote. The site renders them with its own components (`RichNode.astro`) |
| Live preview | Draft preview next to the editor, in both languages (`/preview/articles/<id>/`, `/hi/preview/…`), reloads on autosave |
| Hindi | Every public page at `/hi/…` with Hindi menus and labels (`src/lib/i18n.ts`). Pieces and the profile have Hindi fields with English fallback. Devanagari fonts (Noto Serif/Sans Devanagari, Kalam for the hand-drawn face), `hreflang` links, and a language switch in the header |
| Search | Pagefind index built after `astro build`, one per language, at `/search/` and `/hi/search/` |
| Maps | MapLibre with OpenFreeMap tiles (no key) recoloured to the site palette and theme; routes draw themselves, then the places drop in; loads only when a map nears the screen |
| SEO | Share image per piece (and per Hindi piece) at `/og/…png`; JSON-LD for the site (with search), each piece (Article/Report with citations) and the profile (Person); sitemap with language alternates; RSS |
| Analytics | Umami (self-hosted, Docker), switched on by two `.env` values |
| Roles | Admin (everything), Editor (write + publish), Reader (own account). Enforced in `cms/src/access.ts` |
| Accounts | Signup, login, logout, saved pieces (Save button on every piece), newsletter topics, name and password change, account deletion |
| Sessions | Payload JWT in an HTTP-only, SameSite=Lax cookie (Secure in production) that only the site's server reads; a non-secret `gl_session` flag lets static pages show "Account" |
| Content model | Type (Research, Case study, Financial report) and Topic (Geopolitics, Finance & markets, War & military, Sports, Tech news), with a page, filter chip and home card each |
| Pages | Home, Research, Case studies, Financial reports, Everything, 5 topics, piece page, researcher profile, search (all in English and Hindi), login, signup, account, 404, RSS, sitemap |
| Piece page | Type stamp, topic, tags, author, dates, reading time, Save, Ken Burns hero, sticky table of contents, rich body, references, updates, related pieces |
| Design + motion | Sketch frames that boil on hover, self-drawing lines and charts, stamps, sticky notes, Ken Burns, page transitions, scroll reveals, dark mode, reduced-motion support |

**Checked:**
- `pnpm build` passes.
- An end-to-end script against the running site and CMS passed all 19 checks:
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
- Anything on a production server (no deployment yet).

## Deployment

### Recommended setup: one VPS

The site is a Node server (Astro's `@astrojs/node` adapter), the CMS is a Next.js server, uploads are stored on disk, and Umami needs Postgres too. All of that fits on **one small Linux server**, with Caddy in front for HTTPS:

```
                   https://your-domain
                          │
                     Caddy (:443)  ── automatic HTTPS (Let's Encrypt)
              ┌───────────┴─────────────┐
   /admin /cms-api /_next          everything else
              │                         │
     Payload CMS :3000            Astro site :4321
              │                         │ (server side, PAYLOAD_URL)
              └──────── Postgres :5433 (Docker) ── Umami :3001 (optional)
```

**Server:** Ubuntu 24.04, **2 vCPU / 4 GB RAM** at minimum, plus 4 GB swap (the Next.js build of the CMS is memory hungry), about 25 GB disk. Hetzner, DigitalOcean, Linode or an AWS Lightsail instance all work (roughly US$5–12 a month).

#### 1. Before the first deploy (on your machine)

These must be done once, in the code, before a server can run it:

1. **Set the domain.** In `astro.config.mjs` set `SITE_URL` to `https://your-domain` (it also feeds `security.allowedDomains`). In `deploy/Caddyfile` replace `thegloballedger.example`.
2. **Create database migrations.** Payload only creates tables automatically in dev. In production (`NODE_ENV=production`) it expects migrations, and there are none yet:
   ```bash
   pnpm db && pnpm --dir cms payload migrate:create initial   # writes cms/src/migrations/
   ```
   Commit `cms/src/migrations/`. From now on, every time you change a collection or field: run `migrate:create` again and commit the new file.
3. **Decide about `cms/media/`.** Uploads live there and the folder is **not** git-ignored (it holds your profile photo and the demo files). Either add `media/` to `cms/.gitignore` and copy uploads to the server separately, or move uploads to object storage (see [Still missing](#still-missing-to-reach-a-complete-public-launch)).
4. **Put the code in Git** and push to a private GitHub repository:
   ```bash
   git init && git add . && git commit -m "The Global Ledger v1.0.0"
   ```
   Both `.env` files and `backups/` are git-ignored. Check `git status` before the first commit anyway.

#### 2. Prepare the server

```bash
# as root, once
adduser ledger && usermod -aG sudo,docker ledger
apt update && apt install -y git curl ufw
curl -fsSL https://get.docker.com | sh
apt install -y caddy            # see caddyserver.com/docs/install for the apt repo
ufw allow OpenSSH && ufw allow 80 && ufw allow 443 && ufw enable
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# as ledger
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash && source ~/.bashrc
nvm install 24 && corepack enable
```

Point the domain's **DNS A record** (and AAAA if you have IPv6) at the server's IP.

#### 3. Get the code and configure it

```bash
git clone git@github.com:<you>/the-global-ledger.git ~/ledger && cd ~/ledger
pnpm install --frozen-lockfile && pnpm --dir cms install --frozen-lockfile
cp .env.example .env && cp cms/.env.example cms/.env
```

Production values (generate **new** secrets; never reuse the dev ones):

```ini
# .env
POSTGRES_USER=ledger
POSTGRES_PASSWORD=<long random>
POSTGRES_DB=ledger
PAYLOAD_URL=http://localhost:3000
UMAMI_APP_SECRET=<openssl rand -hex 32>
PUBLIC_UMAMI_SRC=https://stats.your-domain/script.js     # once Umami is set up
PUBLIC_UMAMI_WEBSITE_ID=<from Umami>

# cms/.env
DATABASE_URL=postgres://ledger:<same password>@127.0.0.1:5433/ledger
PAYLOAD_SECRET=<openssl rand -hex 32>
PAYLOAD_PUBLIC_URL=https://your-domain
DEPLOY_HOOK_URL=
```

#### 4. Database, CMS, site

```bash
pnpm db                                    # Postgres (and Umami's DB) in Docker, bound to 127.0.0.1
pnpm --dir cms payload migrate             # create the tables
pnpm --dir cms build                       # NODE_ENV=production is set by next build
```

Then run both servers as **systemd** services so they restart on crash and on reboot. `/etc/systemd/system/ledger-cms.service`:

```ini
[Unit]
Description=The Global Ledger CMS (Payload)
After=network.target docker.service

[Service]
User=ledger
WorkingDirectory=/home/ledger/ledger/cms
Environment=NODE_ENV=production PORT=3000 HOSTNAME=127.0.0.1
ExecStart=/home/ledger/.nvm/versions/node/v24.<x>/bin/pnpm start
Restart=always

[Install]
WantedBy=multi-user.target
```

`/etc/systemd/system/ledger-site.service`:

```ini
[Unit]
Description=The Global Ledger site (Astro)
After=ledger-cms.service

[Service]
User=ledger
WorkingDirectory=/home/ledger/ledger
EnvironmentFile=/home/ledger/ledger/.env
Environment=NODE_ENV=production HOST=127.0.0.1 PORT=4321
ExecStart=/home/ledger/.nvm/versions/node/v24.<x>/bin/node dist/server/entry.mjs
Restart=always

[Install]
WantedBy=multi-user.target
```

(`which node` shows the exact path to use.) Start the CMS, build the site against it, then start the site:

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now ledger-cms
pnpm build                                  # needs the CMS running
sudo systemctl enable --now ledger-site
```

#### 5. Caddy (HTTPS and one domain)

Copy `deploy/Caddyfile` to `/etc/caddy/Caddyfile` (with your domain), then `sudo systemctl reload caddy`. Caddy gets the certificate by itself. Recommended additions inside the site block:

```caddy
	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
		X-Content-Type-Options nosniff
		Referrer-Policy strict-origin-when-cross-origin
		X-Frame-Options SAMEORIGIN
	}
```

For Umami, add a second block (and a DNS record for the subdomain):

```caddy
stats.your-domain {
	reverse_proxy localhost:3001
}
```

#### 6. Right after it is live

1. Open `https://your-domain/admin` **immediately** and create the admin account (the first user becomes admin).
2. Fill in the profile, write or import pieces, publish, and rebuild (next step).
3. If you use Umami: `pnpm analytics`, open it, change the `admin`/`umami` password, add the site, put the two `PUBLIC_UMAMI_` values in `.env`, and rebuild.
4. Test signup, login, Save, account deletion and a preview over HTTPS (the session cookie is `Secure` in production, so it only works over HTTPS).

#### 7. Rebuild on publish

Public pages are pre-built, so new or changed pieces appear only after `pnpm build` and a restart of the site. Until an automatic hook exists (see [Still missing](#still-missing-to-reach-a-complete-public-launch)), use this script, by hand or from cron:

```bash
# ~/ledger/deploy/rebuild.sh
set -e
cd ~/ledger
pnpm build
sudo systemctl restart ledger-site
```

`DEPLOY_HOOK_URL` in `cms/.env` is already called whenever a published piece changes, but it expects a hosted build service (Vercel, Cloudflare Pages, Render deploy hook). On a VPS, something on the server must receive that POST and run `rebuild.sh`.

#### 8. Updating the site

```bash
cd ~/ledger && git pull
pnpm install --frozen-lockfile && pnpm --dir cms install --frozen-lockfile
pnpm --dir cms payload migrate              # apply new migrations, if any
pnpm --dir cms build && sudo systemctl restart ledger-cms
pnpm build && sudo systemctl restart ledger-site
```

#### 9. Backups

The database and `cms/media/` are the only things that can't be rebuilt from Git. Back up both, daily, **off the server** (Backblaze B2, R2, S3, or another machine):

```bash
# crontab -e   (03:00 daily)
0 3 * * * docker compose -f ~/ledger/docker-compose.yml exec -T db pg_dumpall -U ledger | gzip > ~/backups/db-$(date +\%F).sql.gz && tar czf ~/backups/media-$(date +\%F).tgz -C ~/ledger/cms media
```

Then sync `~/backups` off the server (e.g. `rclone`), and **test a restore once**.

### Alternative: managed services

If you'd rather not run a server:

| Piece | Service | Changes needed |
|---|---|---|
| Postgres | Neon or Supabase | Only `DATABASE_URL` |
| Media | Cloudflare R2 or S3 | Add `@payloadcms/storage-s3` to `cms/src/payload.config.ts` (local disk doesn't survive redeploys on these hosts) |
| CMS | Railway, Render or Fly.io | Fix `cms/Dockerfile` first: add `output: 'standalone'` to `cms/next.config.ts` and change the base image from `node:22.23.4-alpine` to Node 24 |
| Site | Same host as the CMS (Node), or Vercel / Netlify with `@astrojs/vercel` / `@astrojs/netlify` | Swap the adapter in `astro.config.mjs`; the platform's deploy hook becomes `DEPLOY_HOOK_URL` |
| `/admin` on the site's domain | The site's host must proxy `/admin`, `/cms-api`, `/_next` to the CMS (Vercel rewrites, Netlify redirects with status 200) | Otherwise admin logins fail, because `PAYLOAD_PUBLIC_URL` must be the site's address |
| Analytics | Umami Cloud (free tier) | Only the two `PUBLIC_UMAMI_` values |

The site build must be able to reach the CMS over the network.

## Still missing to reach a complete public launch

Ordered by priority. **Blockers** stop the site from running or being safe in production; the rest are needed for a launch that feels finished.

### Blockers (must do before going live)

- [ ] **Database migrations**: `cms/src/migrations/` doesn't exist. Without it a production database has no tables ([step 1](#1-before-the-first-deploy-on-your-machine)).
- [ ] **Real domain**: `SITE_URL` in `astro.config.mjs` is still `thegloballedger.example`. Sitemap, RSS, canonical links, share images and the CSRF allow-list all depend on it. Also update `deploy/Caddyfile`.
- [ ] **Git repository**: the project isn't under version control yet. Without it you have no history, and no way to deploy or roll back.
- [ ] **Production secrets**: new `PAYLOAD_SECRET`, Postgres and Umami passwords on the server.
- [ ] **Rate limiting** on `/api/auth/*` (login, signup) and `/cms-api/users/login`, in Caddy (a rate-limit plugin) or Cloudflare in front. Without it, anyone can try passwords with no limit.
- [ ] **Backups**: automated, off-server database and media backups, with one test restore.
- [ ] **Remove the demo piece** "Inside a Ledger piece" (unpublish it, or keep it as a draft).

### Needed for a complete launch

- [ ] **Email service** (Resend, Postmark or SES) with a Payload email adapter. Until this exists, **forgotten passwords can't be reset** and emails aren't verified (`verify` TODO in `cms/src/collections/Users.ts`).
- [ ] **Forgot-password and reset pages** on the site (`/forgot/`, `/reset/`).
- [ ] **Privacy policy and terms pages**: the site stores accounts and runs analytics. India's DPDP Act and GDPR (for EU readers) expect a privacy notice saying what is stored and how to delete it. Link them from the footer and the signup form.
- [ ] **Your details** in `src/lib/site.ts`: `author` (still "The Global Ledger"), `youtube` and `github` are empty TODOs.
- [ ] **Researcher profile** filled in (Admin → Globals → Researcher profile).
- [ ] **Hindi review** of the menu and label translations in `src/lib/i18n.ts`.
- [ ] **Hindi login, signup and account pages** (English-only now, so Hindi readers drop into English to sign up).
- [ ] **Automatic rebuild on publish** on the VPS: a small authenticated webhook endpoint (or a systemd path/timer) that runs `deploy/rebuild.sh`, so publishing doesn't need SSH.
- [ ] **Media storage decision**: keep `cms/media/` on the server disk (and back it up), or move to Cloudflare R2 via `@payloadcms/storage-s3`.
- [ ] **Fix or delete `cms/Dockerfile`**: it is the unmodified template and won't build as is (needs `output: 'standalone'`, Node 24).
- [ ] **Uptime monitoring and error alerts**: e.g. UptimeRobot / Better Stack on `/` and `/admin`, plus a way to see server logs (`journalctl -u ledger-site -u ledger-cms`).
- [ ] **Checks not yet done**: real phone (Android and iPhone), Lighthouse (performance, accessibility, SEO), live-preview pane inside the admin, analytics with a real website ID, and the whole flow over HTTPS on the server.
- [ ] **Search console**: submit `sitemap-index.xml` to Google Search Console and Bing Webmaster Tools after launch.
- [ ] **Brand**: confirm palette, logo, wordmark and favicon (the share image default is `public/og-default.svg`).

### Engineering hygiene (recommended)

- [ ] **Automated tests in the repo**: the 19-check end-to-end script that verified v1 isn't saved in the project. Add it (e.g. as Playwright tests) so it can run again before every release.
- [ ] **CI** (GitHub Actions): install, type-check (`astro check`, `tsc` in `cms/`), lint and build on every push.
- [ ] **A `LICENSE`** for the code, and a note on the content's licence (articles, charts, data).
- [ ] **Dependency updates**: Dependabot or Renovate, especially for Payload and Next.js security fixes.
- [ ] **CHANGELOG.md** to record what changes after 1.0.0.

## Roadmap (after launch)

**Readers**
- [ ] Newsletter sending (Buttondown or Resend broadcasts) using readers' chosen topics
- [ ] Comments for signed-in readers, with moderation in the admin
- [ ] Paid reports later (membership + Razorpay)
- [ ] A Hindi RSS feed (`/hi/rss.xml`)

**Writing**
- [ ] Map block: pick places by clicking a map instead of typing coordinates
- [ ] Scheduled publishing (publish at a set date and time)
- [ ] Charts from Google Sheets or a data URL instead of only uploaded CSVs
- [ ] Link each piece to its YouTube video, and back

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
