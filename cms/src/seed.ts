// Seeds the demo piece and the profile so the site has content on first run.
// Run with: pnpm seed   (safe to run again: existing items are left alone, except that an older
// demo piece without the newer blocks is brought up to date)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'

import config from './payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(dirname, '../../public')

// Minimal Lexical JSON builders.
const text = (t: string, format = 0) => ({ type: 'text', text: t, format, style: '', mode: 'normal', detail: 0, version: 1 })
const para = (...children: object[]) => ({
  type: 'paragraph', format: '', indent: 0, version: 1, direction: 'ltr', textFormat: 0, textStyle: '', children,
})
const h2 = (t: string) => ({ type: 'heading', tag: 'h2', format: '', indent: 0, version: 1, direction: 'ltr', children: [text(t)] })
const block = (fields: Record<string, unknown>) => ({
  type: 'block', format: '', version: 2, fields: { id: Math.random().toString(16).slice(2, 14).padEnd(12, '0'), blockName: '', ...fields },
})
const inline = (fields: Record<string, unknown>) => ({
  type: 'inlineBlock', version: 1, fields: { id: Math.random().toString(16).slice(2, 14).padEnd(12, '0'), blockName: '', ...fields },
})
const CODE = 16
const root = (...children: object[]) => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: 'ltr', children } })

async function uploadFrom(payload: Awaited<ReturnType<typeof getPayload>>, file: string, mimetype: string, alt: string) {
  const name = path.basename(file)
  const existing = await payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  const data = fs.readFileSync(file)
  return payload.create({
    collection: 'media',
    data: { alt },
    file: { data, mimetype, name, size: data.length },
  })
}

async function seed() {
  const payload = await getPayload({ config })

  const csv = await uploadFrom(payload, path.join(publicDir, 'data/illustrative-index.csv'), 'text/csv', 'Illustrative index, not real data')
  const hero = await uploadFrom(
    payload,
    path.join(publicDir, 'images/hero-placeholder.svg'),
    'image/svg+xml',
    'Hand-drawn contour lines on graph paper (placeholder illustration)',
  )

  const bars = await uploadFrom(payload, path.join(publicDir, 'data/illustrative-bars.csv'), 'text/csv', 'Illustrative shares, not real data')

  const chart = block({ blockType: 'chart', csv: csv.id, x: 'year', y: 'index', title: 'Illustrative index, 2015–2025', unit: 'Index, 2015 = 100', source: 'Illustrative data, not a real series', note: 'Replace with real data exported from your Python notebook.' })
  const barChart = block({ blockType: 'barChart', csv: bars.id, x: 'country', y: 'share', title: 'Illustrative shares by buyer', unit: 'Per cent', sort: 'desc', highlight: 'India', source: 'Illustrative data, not a real series' })
  const map = block({
    blockType: 'map',
    title: 'Two sea routes from the Gulf (illustrative)',
    height: 'md',
    places: [
      { name: 'Ras Tanura', lat: 26.64, lng: 50.16, kind: 'key', note: 'Oil terminal on the Gulf coast.' },
      { name: 'Strait of Hormuz', lat: 26.57, lng: 56.25, kind: 'event', note: 'Chokepoint between the Gulf and the Gulf of Oman.' },
      { name: 'Mumbai', lat: 18.95, lng: 72.84, kind: 'point' },
      { name: 'Bab-el-Mandeb', lat: 12.58, lng: 43.33, kind: 'event' },
      { name: 'Suez', lat: 29.97, lng: 32.55, kind: 'point' },
    ],
    routes: [
      { label: 'To India', colour: 'clay', path: '26.64, 50.16\n26.2, 53.2\n26.57, 56.25\n24.2, 59.0\n21.0, 66.0\n18.95, 72.84' },
      { label: 'To Europe via Suez', colour: 'olive', dashed: true, path: '26.64, 50.16\n26.57, 56.25\n22.6, 60.2\n14.6, 52.0\n12.58, 43.33\n20.0, 38.4\n27.6, 33.9\n29.97, 32.55' },
    ],
    source: 'Routes drawn by hand for illustration',
  })
  const timeline = block({
    blockType: 'timeline',
    title: 'How a piece is made',
    events: [
      { date: 'Day 1', title: 'Question', text: 'One question, written at the top of the draft.' },
      { date: 'Day 2–5', title: 'Data and sources', text: 'Numbers into a notebook, every source into References.' },
      { date: 'Day 6', title: 'Publish', text: 'Preview the draft, then publish.' },
      { date: 'Later', title: 'Update', text: 'New facts go into the Updates log with a date.' },
    ],
  })
  const gallery = block({
    blockType: 'gallery',
    images: [
      { image: hero.id, caption: 'Photos sit on the page like prints' },
      { image: hero.id, caption: 'Each one opens full size' },
    ],
  })
  const note = block({ blockType: 'note', title: 'Why it matters', text: 'Sticky notes hold the takeaway of a section, a definition, or background a reader may need.' })

  const bodyEn = root(
    para(text('This is a demo piece, written in the admin panel. It shows the blocks you can use, so the format is settled before the first real article. Unpublish or delete it before launch.')),
    h2('Three formats'),
    para(text('Every piece is Research, a Case study or a Financial report, and has one topic: geopolitics, finance and markets, war and military, sports, or tech. Set both in the sidebar of the editor.')),
    h2('Charts'),
    para(text('Upload a CSV to Media, then add a "Line chart" or "Bar chart" block. Lines draw themselves and bars grow as they scroll into view, and readers can download the same CSV.')),
    chart,
    barChart,
    h2('Maps'),
    para(text('A "Map" block takes places and routes. The routes draw themselves, then the places drop in; tap a place to read its note.')),
    map,
    h2('Timelines and photos'),
    timeline,
    gallery,
    h2('Notes'),
    note,
    h2('Citing sources'),
    para(
      text('Add a footnote anywhere in a sentence with the "Footnote" inline block'),
      inline({ blockType: 'footnote', note: 'Footnotes are numbered automatically and listed under the text.', url: '' }),
      text('. Longer sources go on the References tab; they appear as a numbered list at the end.'),
    ),
    para(text('Inline code looks like '), text('this', CODE), text('.')),
  )

  const bodyHi = root(
    para(text('यह एक डेमो लेख है, जिसे एडमिन पैनल में लिखा गया है। इसमें वे सारे ब्लॉक दिखाए गए हैं जिन्हें आप इस्तेमाल कर सकते हैं। लॉन्च से पहले इसे अप्रकाशित करें या हटा दें।')),
    h2('तीन प्रारूप'),
    para(text('हर लेख शोध, केस स्टडी या वित्तीय रिपोर्ट होता है, और उसका एक विषय होता है: भू-राजनीति, वित्त और बाज़ार, युद्ध और सेना, खेल या तकनीक।')),
    h2('चार्ट'),
    para(text('मीडिया में CSV अपलोड करें, फिर "Line chart" या "Bar chart" ब्लॉक जोड़ें। पाठक वही CSV डाउनलोड कर सकते हैं।')),
    chart,
    barChart,
    h2('नक़्शे'),
    para(text('"Map" ब्लॉक में जगहें और रास्ते जोड़े जाते हैं। रास्ते अपने आप खिंचते हैं, फिर जगहें दिखाई देती हैं।')),
    map,
    h2('टाइमलाइन और तस्वीरें'),
    timeline,
    gallery,
    h2('स्रोत'),
    para(
      text('वाक्य के बीच में "Footnote" ब्लॉक से टिप्पणी जोड़ें'),
      inline({ blockType: 'footnote', note: 'टिप्पणियों पर अपने आप नंबर लगते हैं और वे पाठ के नीचे दिखती हैं।', url: '' }),
      text('। लंबे स्रोत References टैब में जाते हैं।'),
    ),
  )

  const slug = 'inside-a-ledger-piece'
  const found = await payload.find({ collection: 'articles', where: { slug: { equals: slug } }, limit: 1, draft: true })
  let existing = found.docs[0]
  if (!existing) {
    existing = await payload.create({
      collection: 'articles',
      draft: false,
      data: {
        _status: 'published',
        title: 'Inside a Ledger piece',
        slug,
        description:
          'A demo of the building blocks every research article, case study and financial report on this site can use, from charts and notes to references.',
        type: 'research',
        topic: 'geopolitics',
        tags: ['demo', 'style-guide'],
        pubDate: new Date().toISOString(),
        featured: true,
        hero: hero.id,
        references: [
          { title: 'World Bank Open Data', publisher: 'World Bank', url: 'https://data.worldbank.org/', accessed: new Date().toISOString() },
        ],
        body: bodyEn as never,
      },
    })
    payload.logger.info('Seeded demo piece')
  }
  if (!JSON.stringify(existing.body ?? {}).includes('"barChart"')) {
    await payload.update({ collection: 'articles', id: existing.id, locale: 'en', draft: false, data: { body: bodyEn as never, _status: 'published' } })
    payload.logger.info('Updated demo piece with the newer blocks')
  }
  {
    const hi = await payload.findByID({ collection: 'articles', id: existing.id, locale: 'hi', fallbackLocale: false, depth: 0 })
    if (!hi.title) {
      await payload.update({
        collection: 'articles',
        id: existing.id,
        locale: 'hi',
        draft: false,
        data: {
          title: 'एक लेजर लेख के अंदर',
          description: 'इस साइट के हर शोध लेख, केस स्टडी और वित्तीय रिपोर्ट में इस्तेमाल होने वाले ब्लॉक का डेमो: चार्ट, नक़्शे, टिप्पणियाँ और संदर्भ।',
          body: bodyHi as never,
          // Source titles are translatable; start from the English ones.
          references: (existing.references ?? []).map((r) => ({ ...r, title: r.title })),
          updates: (existing.updates ?? []).map((u) => ({ ...u, note: u.note })),
          _status: 'published',
        },
      })
      payload.logger.info('Added the Hindi version of the demo piece')
    }
  }

  const profile = await payload.findGlobal({ slug: 'profile' })
  if (!profile.name) {
    await payload.updateGlobal({
      slug: 'profile',
      data: {
        name: 'Your Name',
        role: 'Independent researcher',
        bio: 'Two or three sentences on who you are and what you research.\n\nWhat readers can expect from the site and the YouTube channel.',
        interests: ['Geopolitics', 'Financial analysis', 'Military affairs', 'Sports business', 'Technology'],
        timeline: [
          { when: '2026', what: 'Started The Global Ledger', detail: 'Research site and YouTube channel.' },
        ],
      },
    })
    payload.logger.info('Seeded profile')
  }
}

await seed()
process.exit(0)
