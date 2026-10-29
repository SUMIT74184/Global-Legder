import type { Block, Field } from 'payload'

import { csvColumn } from './csv'

// Blocks an editor can drop into an article body. The Astro site renders each one with its
// matching component in src/components/RichNode.astro.

export const ChartBlock: Block = {
  slug: 'chart',
  labels: { singular: 'Line chart', plural: 'Line charts' },
  fields: [
    {
      name: 'csv',
      label: 'CSV file',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: { mimeType: { in: ['text/csv', 'application/vnd.ms-excel'] } },
      admin: { description: 'Save the sheet as CSV (File → Download → .csv). First row: column names.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'x',
          label: 'X column',
          type: 'text',
          required: true,
          defaultValue: 'year',
          validate: csvColumn,
          admin: { description: 'Header of the x column, e.g. year. Years are spaced by value; other labels evenly.' },
        },
        {
          name: 'y',
          label: 'Y column',
          type: 'text',
          required: true,
          validate: csvColumn,
          admin: { description: 'Header of the numbers column, as in the first row.' },
        },
      ],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'unit', type: 'text', admin: { description: 'e.g. "USD billion" or "Index, 2015 = 100"' } },
    {
      type: 'row',
      fields: [
        { name: 'source', type: 'text', required: true },
        { name: 'sourceUrl', label: 'Source URL', type: 'text' },
      ],
    },
    { name: 'notebook', label: 'Notebook URL', type: 'text' },
    { name: 'note', type: 'text' },
  ],
}

export const NoteBlock: Block = {
  slug: 'note',
  labels: { singular: 'Sticky note', plural: 'Sticky notes' },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'text', type: 'textarea', required: true },
  ],
}

export const YouTubeBlock: Block = {
  slug: 'youtube',
  labels: { singular: 'YouTube video', plural: 'YouTube videos' },
  fields: [
    {
      name: 'videoId',
      label: 'Video ID',
      type: 'text',
      required: true,
      admin: { description: 'The part after "v=" in the YouTube link.' },
    },
    { name: 'title', type: 'text', required: true },
  ],
}

const csvField = (description: string): Field => ({
  name: 'csv',
  label: 'CSV file',
  type: 'upload',
  relationTo: 'media',
  required: true,
  filterOptions: { mimeType: { in: ['text/csv', 'application/vnd.ms-excel'] } },
  admin: { description },
})

const sourceRow: Field = {
  type: 'row',
  fields: [
    { name: 'source', type: 'text', required: true },
    { name: 'sourceUrl', label: 'Source URL', type: 'text' },
  ],
}

export const BarChartBlock: Block = {
  slug: 'barChart',
  labels: { singular: 'Bar chart', plural: 'Bar charts' },
  fields: [
    csvField('Save the sheet as CSV (File → Download → .csv). First row: column names; one row per bar.'),
    {
      type: 'row',
      fields: [
        {
          name: 'x',
          label: 'Label column',
          type: 'text',
          required: true,
          validate: csvColumn,
          admin: { description: 'Header of the label column, as in the first row, e.g. Country' },
        },
        {
          name: 'y',
          label: 'Value column',
          type: 'text',
          required: true,
          validate: csvColumn,
          admin: { description: 'Header of the numbers column, e.g. Reserves (Mt REO). 51.8% and 1,234 are fine.' },
        },
      ],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'unit', type: 'text' },
    {
      type: 'row',
      fields: [
        {
          name: 'sort',
          type: 'select',
          defaultValue: 'desc',
          options: [
            { label: 'Largest first', value: 'desc' },
            { label: 'As in the file', value: 'none' },
          ],
        },
        { name: 'highlight', type: 'text', admin: { description: 'Label of a bar to draw in clay, e.g. India' } },
      ],
    },
    sourceRow,
    { name: 'note', type: 'text' },
  ],
}

// Social sites serve pages, not pictures, and block their images from other sites.
const SOCIAL = /(^|\.)(instagram\.com|facebook\.com|fb\.com|x\.com|twitter\.com|pinterest\.[a-z.]+|threads\.net|tiktok\.com|linkedin\.com)$/i

// Checked on publish (drafts skip validation): the address must answer with an image.
const imageUrl = async (value: unknown) => {
  if (!value) return true
  let url: URL
  try {
    url = new URL(String(value))
  } catch {
    return 'Paste a full image address starting with https://'
  }
  if (url.protocol !== 'https:') return 'Paste a full image address starting with https://'
  if (SOCIAL.test(url.hostname)) {
    return `${url.hostname} links go to a post page, not an image, and the site blocks its photos elsewhere. Save the photo (if you have permission) and upload it to Media instead.`
  }
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(6000), headers: { Range: 'bytes=0-0' } })
    const type = res.headers.get('content-type') ?? ''
    if (!res.ok && res.status !== 206) return `That address answered "${res.status}". Check it opens in a browser.`
    if (!type.startsWith('image/')) {
      return 'That address is a web page, not an image. Right-click the picture → "Copy image address" (the link usually ends in .jpg, .png or .webp).'
    }
    return true
  } catch {
    return 'Could not reach that address. Check it opens in a browser, or upload the image instead.'
  }
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Image gallery', plural: 'Image galleries' },
  fields: [
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      required: true,
      admin: { description: 'Upload each photo to Media, or paste its web address. Uploading is safer: linked photos vanish if the other site removes them.' },
      fields: [
        {
          name: 'image',
          label: 'Uploaded image',
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mimeType: { contains: 'image' } },
          validate: (value: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
            value || siblingData?.url ? true : 'Upload an image, or paste an image address below',
        },
        {
          name: 'url',
          label: 'Or image address (URL)',
          type: 'text',
          admin: { description: 'Right-click a picture on a website → "Copy image address", then paste here.' },
          validate: imageUrl,
        },
        {
          type: 'row',
          fields: [
            { name: 'caption', type: 'text' },
            { name: 'credit', type: 'text', admin: { description: 'Photographer or source, e.g. "Reuters"' } },
          ],
        },
      ],
    },
    { name: 'caption', label: 'Gallery caption', type: 'text' },
  ],
}

export const TimelineBlock: Block = {
  slug: 'timeline',
  labels: { singular: 'Timeline', plural: 'Timelines' },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'events',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'date', type: 'text', required: true, admin: { description: 'As it should read: "12 Mar 2022", "1991", "Q3 2024"' } },
            { name: 'title', type: 'text', required: true },
          ],
        },
        { name: 'text', type: 'textarea' },
      ],
    },
  ],
}

const ROUTE_COLOURS = [
  { label: 'Clay', value: 'clay' },
  { label: 'Olive', value: 'olive' },
  { label: 'Gold', value: 'gold' },
  { label: 'Sky', value: 'sky' },
  { label: 'Heather', value: 'heather' },
  { label: 'Ink', value: 'ink' },
]

const latLng = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? true : 'Enter a number'
}

export const MapBlock: Block = {
  slug: 'map',
  labels: { singular: 'Map', plural: 'Maps' },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'places',
      type: 'array',
      labels: { singular: 'Place', plural: 'Places' },
      admin: { description: 'Points on the map. Find coordinates by right-clicking in Google Maps or on openstreetmap.org.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'lat', label: 'Latitude', type: 'number', required: true, validate: latLng },
            { name: 'lng', label: 'Longitude', type: 'number', required: true, validate: latLng },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'kind',
              type: 'select',
              defaultValue: 'point',
              options: [
                { label: 'Point', value: 'point' },
                { label: 'Key place (clay)', value: 'key' },
                { label: 'Event (diamond)', value: 'event' },
              ],
            },
            { name: 'note', type: 'text', admin: { description: 'Shown when a reader taps the point.' } },
          ],
        },
      ],
    },
    {
      name: 'routes',
      type: 'array',
      labels: { singular: 'Route', plural: 'Routes' },
      admin: { description: 'Lines that draw themselves: trade routes, front lines, supply lines.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text' },
            { name: 'colour', type: 'select', defaultValue: 'clay', options: ROUTE_COLOURS },
            { name: 'dashed', type: 'checkbox' },
          ],
        },
        {
          name: 'path',
          type: 'textarea',
          required: true,
          admin: { description: 'One "latitude, longitude" per line, in order. Example:\n26.2, 56.3\n12.6, 43.4' },
          validate: (v: unknown) => {
            const lines = String(v ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
            if (lines.length < 2) return 'A route needs at least two points'
            const bad = lines.find((l) => !/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(l))
            return bad ? `Not a "latitude, longitude" pair: ${bad}` : true
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'source', type: 'text' },
        {
          name: 'height',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Short', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Tall', value: 'lg' },
          ],
        },
      ],
    },
    { name: 'caption', type: 'text' },
  ],
}

// Inline: sits inside a sentence. The site numbers footnotes in order and lists them under the text.
export const FootnoteBlock: Block = {
  slug: 'footnote',
  labels: { singular: 'Footnote', plural: 'Footnotes' },
  fields: [
    { name: 'note', type: 'textarea', required: true },
    { name: 'url', label: 'Link (optional)', type: 'text' },
  ],
}
