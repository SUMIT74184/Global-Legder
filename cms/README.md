# The Global Ledger — CMS

Payload CMS 3 (Next.js) with PostgreSQL. It hosts the admin panel at `/admin` and the content and
auth API at `/cms-api`, used by the Astro site in the folder above. Both are opened through the
site's address (`localhost:4321/admin`), which forwards them here. See the main README for setup.

| Path | What |
|---|---|
| `src/collections/Articles.ts` | Pieces: research, case studies, financial reports (drafts, autosave, versions) |
| `src/collections/Media.ts` | Images and chart CSVs |
| `src/collections/Users.ts` | Admins, editors and readers; signup, login, saved pieces, newsletter topics |
| `src/globals/Profile.ts` | The researcher profile shown at `/profile/` (English and Hindi text) |
| `src/blocks.ts` | Rich-text blocks: line chart, bar chart, map, timeline, gallery, sticky note, YouTube; inline footnote |
| `src/app/(payload)/custom.scss` | Admin theme: the site's palette, fonts and clay buttons |
| `src/components/admin/` | Admin logo and nav icon |
| `src/access.ts` | Who can do what |
| `src/taxonomy.ts` | Types and topics (keep in sync with `../src/lib/site.ts`) |
| `src/seed.ts` | Demo piece and profile (`pnpm seed`) |

After changing collections or fields: `pnpm generate:types` and `pnpm generate:importmap`.
