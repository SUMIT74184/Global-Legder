import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { isAdmin, isStaff, publishedOrStaff } from '../access'
import {
  BarChartBlock,
  ChartBlock,
  FootnoteBlock,
  GalleryBlock,
  MapBlock,
  NoteBlock,
  TimelineBlock,
  YouTubeBlock,
} from '../blocks'
import { TOPIC_OPTIONS, TYPE_OPTIONS, slugify } from '../taxonomy'

// Research articles, case studies and financial reports. Field names match what the Astro site
// expects in src/lib/articles.ts. Title, description, body and update notes have an English and a
// Hindi version (switch with the locale picker at the top of the editor); the rest is shared.

// The draft page on the site that the admin shows in its preview pane (src/pages/preview/).
const previewUrl = (id: unknown, locale: unknown) => {
  const code = typeof locale === 'string' ? locale : (locale as { code?: string } | undefined)?.code
  const site = process.env.PAYLOAD_PUBLIC_URL || 'http://localhost:4321'
  return `${site}${code === 'hi' ? '/hi' : ''}/preview/articles/${id}/`
}

// Rebuild the static site when something is published (set DEPLOY_HOOK_URL to a Cloudflare
// Pages or Vercel deploy hook). Failures are logged, never block the save.
const triggerRebuild: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  const url = process.env.DEPLOY_HOOK_URL
  const touchesLive = doc._status === 'published' || previousDoc?._status === 'published'
  if (url && touchesLive) {
    fetch(url, { method: 'POST' }).catch((err) => req.payload.logger.error(`Deploy hook failed: ${err}`))
  }
  return doc
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Piece', plural: 'Pieces' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'topic', '_status', 'pubDate'],
    listSearchableFields: ['title', 'description'],
    livePreview: {
      url: ({ data, locale }) => previewUrl(data?.id, locale),
      breakpoints: [
        { label: 'Phone', name: 'phone', width: 390, height: 844 },
        { label: 'Laptop', name: 'laptop', width: 1280, height: 800 },
      ],
    },
    preview: (doc, { locale }) => previewUrl(doc?.id, locale),
  },
  versions: {
    drafts: { autosave: { interval: 2000 } },
    maxPerDoc: 50,
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [triggerRebuild],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            {
              name: 'description',
              type: 'textarea',
              required: true,
              localized: true,
              admin: { description: 'One or two sentences on what the piece finds. Used on cards and in search results.' },
            },
            { name: 'hero', label: 'Hero image', type: 'upload', relationTo: 'media' },
            {
              name: 'body',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  BlocksFeature({
                    blocks: [ChartBlock, BarChartBlock, MapBlock, TimelineBlock, GalleryBlock, NoteBlock, YouTubeBlock],
                    inlineBlocks: [FootnoteBlock],
                  }),
                ],
              }),
            },
          ],
        },
        {
          label: 'References',
          fields: [
            {
              name: 'references',
              type: 'array',
              labels: { singular: 'Reference', plural: 'References' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'title', type: 'text', required: true, localized: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'publisher', type: 'text' },
                    { name: 'accessed', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
                  ],
                },
                { name: 'url', label: 'URL', type: 'text', required: true },
                { name: 'archived', label: 'Archived copy URL', type: 'text' },
              ],
            },
            {
              name: 'updates',
              type: 'array',
              labels: { singular: 'Update', plural: 'Updates' },
              admin: { description: 'Dated notes for a developing story or a later revision.' },
              fields: [
                { name: 'date', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
                { name: 'note', type: 'text', required: true, localized: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'URL: /articles/<slug>/. Filled from the title if left empty.' },
      hooks: {
        // A Hindi-only title has no Latin letters to make a slug from; then a short code is used.
        beforeValidate: [
          ({ value, data }) => {
            const from = value || data?.title
            return from ? slugify(from) || `piece-${Date.now().toString(36)}` : value
          },
        ],
      },
    },
    { name: 'type', type: 'select', required: true, defaultValue: 'research', options: TYPE_OPTIONS, admin: { position: 'sidebar' } },
    { name: 'topic', type: 'select', required: true, options: TOPIC_OPTIONS, admin: { position: 'sidebar' } },
    { name: 'tags', type: 'text', hasMany: true, admin: { position: 'sidebar' } },
    {
      name: 'pubDate',
      label: 'Published',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'updated',
      label: 'Last updated',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'featured', type: 'checkbox', admin: { position: 'sidebar', description: 'Show under "Selected work" on the profile.' } },
  ],
}
