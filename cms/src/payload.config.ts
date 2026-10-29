import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Articles } from './collections/Articles'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { Profile } from './globals/Profile'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // The public address of the site. The admin panel and media are served through it at /admin and
  // /cms-api (the site proxies them here), so upload URLs and admin requests use the site's origin.
  serverURL: process.env.PAYLOAD_PUBLIC_URL || 'http://localhost:4321',
  // /api on the site belongs to the Astro endpoints (/api/auth, /api/account).
  routes: { api: '/cms-api' },
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · The Global Ledger admin' },
    components: {
      graphics: {
        Logo: '/components/admin/Logo',
        Icon: '/components/admin/Icon',
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // English is the main language; Hindi fields fall back to English until they are translated.
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'हिन्दी (Hindi)', code: 'hi' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  collections: [Articles, Media, Users],
  globals: [Profile],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
