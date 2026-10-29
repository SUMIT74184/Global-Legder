// Share images (1200×630 PNG) for social posts and link previews, drawn at build time with
// Satori (layout → SVG) and resvg (SVG → PNG) in the site's paper look.
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const font = (pkg: string, file: string) => fs.readFileSync(path.join(process.cwd(), 'node_modules', pkg, 'files', file));

let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
const loadFonts = () =>
  (fonts ??= [
    { name: 'Serif', data: font('@fontsource/source-serif-4', 'source-serif-4-latin-600-normal.woff'), weight: 600 },
    { name: 'Serif Deva', data: font('@fontsource/noto-serif-devanagari', 'noto-serif-devanagari-devanagari-600-normal.woff'), weight: 600 },
    { name: 'Sans', data: font('@fontsource/inter', 'inter-latin-400-normal.woff'), weight: 400 },
    { name: 'Sans', data: font('@fontsource/inter', 'inter-latin-600-normal.woff'), weight: 600 },
    { name: 'Hand', data: font('@fontsource/pangolin', 'pangolin-latin-400-normal.woff'), weight: 400 },
    { name: 'Hand Deva', data: font('@fontsource/kalam', 'kalam-devanagari-400-normal.woff'), weight: 400 },
  ]);

const C = { paper: '#faf9f5', grid: '#ece4d6', ink: '#2a2320', ink2: '#4a403a', mute: '#7d7166', clay: '#d97757', clayD: '#b35a3c' };

// Tiny element helper, so the layout reads like markup without React.
type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (El | string | null | false)[]): El => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.filter(Boolean) },
});

export interface OgCard {
  title: string;
  kicker?: string; // e.g. "Case study · Geopolitics"
  footer?: string; // e.g. "Your Name · 12 Mar 2026"
  accent?: string; // topic colour
}

export async function ogPng({ title, kicker, footer, accent = C.clay }: OgCard): Promise<Buffer> {
  const size = title.length > 90 ? 52 : title.length > 60 ? 62 : 74;
  const underline = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 12" preserveAspectRatio="none"><path d="M3 8 C 80 2, 190 12, 297 4" fill="none" stroke="${C.clay}" stroke-width="5" stroke-linecap="round"/></svg>`,
  )}`;
  const tree = h(
    'div',
    {
      width: 1200,
      height: 630,
      boxSizing: 'border-box',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px 72px',
      backgroundColor: C.paper,
      backgroundImage: `linear-gradient(${C.grid} 1.5px, transparent 1.5px), linear-gradient(90deg, ${C.grid} 1.5px, transparent 1.5px)`,
      backgroundSize: '40px 40px',
      fontFamily: 'Sans',
      color: C.ink,
    },
    h(
      'div',
      { width: '100%', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40 },
      h(
        'div',
        { flexDirection: 'column' },
        h('div', { fontFamily: 'Hand', fontSize: 40 }, 'The Global Ledger'),
        { type: 'img', props: { src: underline, width: 290, height: 12, style: { marginTop: -2 } } },
      ),
      kicker
        ? h(
            'div',
            {
              fontFamily: 'Hand, Hand Deva',
              fontSize: 28,
              color: C.clayD,
              border: `3px solid ${C.clayD}`,
              borderRadius: 8,
              padding: '6px 18px',
              marginTop: 12,
              flexShrink: 0,
              transform: 'rotate(-4deg)',
              backgroundColor: '#fffdf8',
            },
            kicker,
          )
        : null,
    ),
    h(
      'div',
      { flexDirection: 'column', paddingRight: 40 },
      h('div', { width: 90, height: 10, borderRadius: 6, backgroundColor: accent, marginBottom: 28 }),
      h('div', { fontFamily: 'Serif, Serif Deva', fontWeight: 600, fontSize: size, lineHeight: 1.12, letterSpacing: -1 }, title),
    ),
    h('div', { fontSize: 26, color: C.mute, fontFamily: 'Sans, Hand Deva', minHeight: 32 }, footer ?? ' '),
  );
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
