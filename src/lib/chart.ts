import fs from 'node:fs';
import path from 'node:path';
import { CMS_URL } from './cms';

export type CsvRow = Record<string, string>;

// RFC 4180-style parsing, as Excel and Google Sheets export it: optional BOM, quoted fields
// (with commas, quotes and line breaks inside), CRLF or LF. Blank lines are skipped.
export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const src = text.replace(/^\uFEFF/, '');
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') (field += '"'), i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') record.push(field), (field = '');
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      record.push(field), records.push(record), (field = ''), (record = []);
    } else field += c;
  }
  if (field || record.length) record.push(field), records.push(record);
  const [head = [], ...body] = records.filter((r) => r.some((v) => v.trim()));
  const headers = head.map((h) => h.trim());
  const rows = body.map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
  return { headers, rows };
}

// Column lookup that forgives case and spacing: "reserves (mt reo)" finds "Reserves (Mt REO)".
const norm = (s: string) => s.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, ' ');
export const findColumn = (headers: string[], name: string | undefined) =>
  name ? headers.find((h) => norm(h) === norm(name)) : undefined;

// "51.8%", "1,234", "2.1x", " 44 " → numbers; "-", "" and words → NaN.
export const toNumber = (v: string | undefined) => {
  const s = String(v ?? '').replace(/[,%\s]/g, '').replace(/x$/i, '');
  return s === '' || s === '-' ? NaN : Number(s);
};

// Loads a chart's CSV: a CMS media URL, or a path under /public. The chart and its "Download CSV"
// link share one file.
export async function loadCsv(src: string) {
  // Media URLs carry the site's public address, which may not be up yet at build time, so CMS
  // files are read from the CMS directly.
  const url = /^https?:/.test(src) ? new URL(src) : null;
  if (url?.pathname.startsWith('/cms-api/')) src = `${CMS_URL}${url.pathname}${url.search}`;
  const text = url
    ? await fetch(src).then((r) => {
        if (!r.ok) throw new Error(`Chart data ${src} answered ${r.status}`);
        return r.text();
      })
    : fs.readFileSync(path.join(process.cwd(), 'public', src), 'utf8');
  return parseCsv(text);
}

// Round axis ticks (1, 2, 2.5, 5 × 10^n) covering [min, max].
export function niceTicks(min: number, max: number, count = 5): number[] {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw)!;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(+v.toFixed(10));
  return ticks;
}

export function hashId(s = ''): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
