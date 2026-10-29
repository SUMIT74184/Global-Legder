// Helpers for Payload's Lexical rich-text JSON (article bodies).

export interface LexNode {
  type: string;
  children?: LexNode[];
  text?: string;
  tag?: string;
  format?: number | string;
  listType?: 'bullet' | 'number' | 'check';
  checked?: boolean;
  fields?: Record<string, any>;
  value?: any;
  slug?: string; // added by indexHeadings
  fn?: number; // added by indexFootnotes
  [key: string]: unknown;
}

export interface LexicalRoot {
  root: LexNode;
}

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export const textOf = (n: LexNode): string =>
  n.type === 'text' ? (n.text ?? '') : n.type === 'linebreak' ? ' ' : (n.children ?? []).map(textOf).join('');

export const plainText = (body: LexicalRoot | null) => (body ? (body.root.children ?? []).map(textOf).join('\n') : '');

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';

// Gives every h2–h4 a unique `slug` (used as its id) and returns them for the table of contents.
export function indexHeadings(body: LexicalRoot | null): Heading[] {
  const headings: Heading[] = [];
  // Pre-seeded so body headings never take the ids of the page's own sections.
  const seen = new Map<string, number>([['references', 1], ['updates', 1], ['related', 1], ['notes', 1]]);
  const walk = (n: LexNode) => {
    if (n.type === 'heading' && /^h[2-4]$/.test(n.tag ?? '')) {
      const text = textOf(n);
      const base = slugify(text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      n.slug = count ? `${base}-${count}` : base;
      headings.push({ depth: Number(n.tag!.slice(1)), slug: n.slug, text });
    }
    n.children?.forEach(walk);
  };
  if (body) walk(body.root);
  return headings;
}

export interface Footnote {
  n: number;
  note: string;
  url?: string;
}

// Numbers the inline Footnote blocks in reading order (sets `fn` on each) and returns them for the
// notes list under the text.
export function indexFootnotes(body: LexicalRoot | null): Footnote[] {
  const notes: Footnote[] = [];
  const walk = (n: LexNode) => {
    if (n.type === 'inlineBlock' && n.fields?.blockType === 'footnote') {
      n.fn = notes.length + 1;
      notes.push({ n: n.fn, note: String(n.fields.note ?? ''), url: safeHref(n.fields.url) });
    }
    n.children?.forEach(walk);
  };
  if (body) walk(body.root);
  return notes;
}

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Text node → escaped HTML with its formatting (Lexical stores formats as a bitmask).
export function formatText(n: LexNode): string {
  const f = typeof n.format === 'number' ? n.format : 0;
  let html = escape(n.text ?? '');
  if (f & 16) html = `<code>${html}</code>`;
  if (f & 1) html = `<strong>${html}</strong>`;
  if (f & 2) html = `<em>${html}</em>`;
  if (f & 4) html = `<s>${html}</s>`;
  if (f & 8) html = `<u>${html}</u>`;
  if (f & 32) html = `<sub>${html}</sub>`;
  if (f & 64) html = `<sup>${html}</sup>`;
  if (f & 128) html = `<mark>${html}</mark>`;
  return html;
}

// Only allow http(s), mailto, relative and in-page links.
export function safeHref(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined;
  const u = url.trim();
  return /^(https?:|mailto:|\/|#)/i.test(u) ? u : undefined;
}
