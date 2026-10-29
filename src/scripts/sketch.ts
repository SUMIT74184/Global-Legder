// Hand-drawn frames, in the style of cityrt.com.
//
// Every element with [data-sketch] gets an SVG outline traced around its box and pushed in and out
// by seeded value noise, so it looks drawn by hand. Three outlines with different seeds are stacked
// and CSS cycles their visibility ("line boil"), which makes the ink shimmer on hover.
//
//   data-sketch            outline only
//   data-sketch="fill"     outline + paper fill + offset shadow (cards, notes, buttons)
//   data-sketch-r="12"     corner radius in px (999 = pill)
//   data-sketch-amp="1.4"  wobble in px
//   data-sketch-seed="x"   fixed seed (default: hashed from the element's text)
//
// The same seed always gives the same drawing, so frames don't jump between page loads.

const FRAMES = 3;
const STEP = 14; // px between sampled points along the outline
const PAD = 4; // room around the box for the wobble and shadow

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rand(i: number, seed: number): number {
  let n = Math.imul(i | 0, 374761393) ^ Math.imul((seed + 0x9e3779b9) | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}

// 1D value noise in [-1, 1].
function noise(x: number, seed: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const t = f * f * (3 - 2 * f);
  const a = rand(i, seed);
  return (a + (rand(i + 1, seed) - a) * t) * 2 - 1;
}

type Pt = [x: number, y: number, nx: number, ny: number];

// Points around a rounded rectangle, clockwise from the top-left, each with its outward normal.
function outline(w: number, h: number, r: number): Pt[] {
  r = Math.min(r, w / 2, h / 2);
  const pts: Pt[] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number) => {
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / STEP));
    for (let k = 0; k < n; k++) pts.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, nx, ny]);
  };
  const corner = (cx: number, cy: number, a0: number) => {
    const n = Math.max(1, Math.round((Math.PI / 2) * r / STEP));
    for (let k = 0; k < n; k++) {
      const a = a0 + ((k / n) * Math.PI) / 2;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.cos(a), Math.sin(a)]);
    }
  };
  edge(r, 0, w - r, 0, 0, -1);
  corner(w - r, r, -Math.PI / 2);
  edge(w, r, w, h - r, 1, 0);
  corner(w - r, h - r, 0);
  edge(w - r, h, r, h, 0, 1);
  corner(r, h - r, Math.PI / 2);
  edge(0, h - r, 0, r, -1, 0);
  corner(r, r, Math.PI);
  return pts;
}

const f = (n: number) => n.toFixed(1);

// Catmull-Rom through the points, as cubic Béziers.
function smoothPath(p: [number, number][], close: boolean): string {
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return close ? d + 'Z' : d;
}

function wobble(base: Pt[], seed: number, amp: number): [number, number][] {
  return base.map(([x, y, nx, ny], i) => {
    const o = noise(i * 0.35, seed) * amp + (rand(i, seed + 7) - 0.5) * amp * 0.35;
    return [x + nx * o + PAD, y + ny * o + PAD];
  });
}

function draw(el: HTMLElement, w: number, h: number) {
  const r = Number(el.dataset.sketchR ?? 10);
  const amp = Number(el.dataset.sketchAmp ?? 1.4);
  const seed = el.dataset.sketchSeed
    ? hash(el.dataset.sketchSeed)
    : hash(el.className + (el.textContent ?? '').trim().slice(0, 24));
  const base = outline(w, h, r);
  const fill = el.dataset.sketch === 'fill';

  let svg = '';
  if (fill) {
    const body = smoothPath(wobble(base, seed + 99, amp * 0.6), true);
    svg += `<path class="sk-shadow" d="${body}"/><path class="sk-fill" d="${body}"/>`;
  }
  for (let k = 0; k < FRAMES; k++) {
    const pts = wobble(base, seed + k * 977, amp);
    // Run past the start a little, like a pen that overshoots where it began.
    pts.push(pts[0], pts[1] ?? pts[0]);
    svg += `<path class="sk-f sk-f${k}" d="${smoothPath(pts, false)}"/>`;
  }

  let layer = el.querySelector<SVGSVGElement>(':scope > .sk-svg');
  if (!layer) {
    layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    layer.setAttribute('class', 'sk-svg');
    layer.setAttribute('aria-hidden', 'true');
    el.prepend(layer);
  }
  layer.setAttribute('width', String(w + PAD * 2));
  layer.setAttribute('height', String(h + PAD * 2));
  layer.innerHTML = svg;
  el.classList.add('sk-on');
}

let ro: ResizeObserver | undefined;
const sizes = new WeakMap<Element, string>();

export function initSketch() {
  ro?.disconnect();
  ro = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      const el = target as HTMLElement;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const key = `${w}x${h}`;
      if (!w || !h || sizes.get(el) === key) continue;
      sizes.set(el, key);
      draw(el, w, h);
    }
  });
  document.querySelectorAll<HTMLElement>('[data-sketch]').forEach((el) => ro!.observe(el));
}
