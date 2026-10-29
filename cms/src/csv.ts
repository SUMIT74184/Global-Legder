import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import type { TextFieldSingleValidation } from 'payload'

// Checks a chart block's column name against the header row of its CSV (on publish; drafts skip
// validation), so a typo shows up in the editor instead of as an empty chart on the site.
const mediaDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../media')
const norm = (s: string) => s.replace(/^﻿/, '').trim().toLowerCase().replace(/\s+/g, ' ')

async function headersOf(file: string) {
  const text = await fs.readFile(path.join(mediaDir, path.basename(file)), 'utf8')
  const line = text.replace(/^﻿/, '').split(/\r?\n/).find((l) => l.trim()) ?? ''
  const out: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') (field += '"'), i++
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') out.push(field.trim()), (field = '')
    else field += c
  }
  out.push(field.trim())
  return out.filter(Boolean)
}

export const csvColumn: TextFieldSingleValidation = async (value, { siblingData, req }) => {
  if (!value) return 'Type the column name from the first row of the CSV'
  const ref = (siblingData as { csv?: number | { id: number } })?.csv
  const id = typeof ref === 'object' && ref ? ref.id : ref
  if (!id) return true
  try {
    const media = await req.payload.findByID({ collection: 'media', id, depth: 0, req })
    if (!media?.filename) return true
    const headers = await headersOf(media.filename)
    if (headers.some((h) => norm(h) === norm(value))) return true
    return `"${value}" is not a column in ${media.filename}. Its columns are: ${headers.join(', ')}`
  } catch {
    return true // file not readable here (e.g. cloud storage): the site shows the problem instead
  }
}
