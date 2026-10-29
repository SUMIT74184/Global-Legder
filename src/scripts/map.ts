// Map blocks ([data-map], see MapBlock.astro). MapLibre and its tiles load only when a map nears
// the screen. The OpenFreeMap "positron" style is recoloured with the site's palette (and again
// when the theme changes); routes draw themselves, then the places pop in.
import type { Map as MlMap, StyleSpecification } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

interface Place {
  name: string;
  lat: number;
  lng: number;
  kind?: 'point' | 'key' | 'event';
  note?: string;
}

interface Route {
  label?: string;
  colour?: string;
  dashed?: boolean;
  path: [number, number][]; // [lat, lng]
}

const STYLE = 'https://tiles.openfreemap.org/styles/positron';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let maps: { map: MlMap; observer: MutationObserver }[] = [];
let io: IntersectionObserver | undefined;

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim() || '#888';

// Mix two hex colours (MapLibre has no color-mix).
function mix(a: string, b: string, t: number) {
  const p = (h: string) => {
    const s = h.replace('#', '');
    const f = s.length === 3 ? s.split('').map((c) => c + c).join('') : s;
    return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16));
  };
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
}

function paint(map: MlMap) {
  const paper = css('paper');
  const ink = css('ink');
  const land = css('paper-2');
  const water = mix(css('sky'), paper, 0.55);
  const rule = css('rule');
  for (const layer of map.getStyle().layers ?? []) {
    const id = layer.id;
    try {
      if (layer.type === 'background') map.setPaintProperty(id, 'background-color', paper);
      else if (layer.type === 'fill') {
        map.setPaintProperty(id, 'fill-color', id.includes('water') ? water : id.includes('building') ? rule : land);
      } else if (layer.type === 'line') {
        if (id.startsWith('boundary')) {
          map.setPaintProperty(id, 'line-color', mix(ink, paper, 0.45));
        } else if (id.includes('water')) map.setPaintProperty(id, 'line-color', water);
        else map.setPaintProperty(id, 'line-color', rule);
      } else if (layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout) {
        map.setPaintProperty(id, 'text-color', mix(ink, paper, id.startsWith('label_country') ? 0.15 : 0.35));
        map.setPaintProperty(id, 'text-halo-color', paper);
      }
    } catch {
      // a layer without that property: leave it
    }
  }
  for (const id of map.getStyle().layers?.map((l) => l.id).filter((l) => l.startsWith('gl-route')) ?? []) {
    const colour = map.getLayer(id)?.metadata as { colour?: string } | undefined;
    map.setPaintProperty(id, 'line-color', css(colour?.colour ?? 'clay'));
  }
}

// The first `t` (0–1) of a route, by length, as [lng, lat] coordinates.
function partOf(path: [number, number][], t: number): [number, number][] {
  const pts = path.map(([lat, lng]) => [lng, lat] as [number, number]);
  if (t >= 1) return pts;
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let left = seg.reduce((a, b) => a + b, 0) * t;
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) {
      out.push(pts[i + 1]);
      left -= seg[i];
      continue;
    }
    const k = seg[i] ? left / seg[i] : 0;
    out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]);
    break;
  }
  return out.length > 1 ? out : [pts[0], pts[0]];
}

const line = (coordinates: [number, number][]) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'LineString' as const, coordinates },
});

async function build(el: HTMLElement) {
  const data = JSON.parse(el.querySelector('script')?.textContent ?? '{}') as { places?: Place[]; routes?: Route[] };
  const places = data.places ?? [];
  const routes = (data.routes ?? []).filter((r) => r.path.length > 1);
  const ml = await import('maplibre-gl');
  await import('maplibre-gl/dist/maplibre-gl.css');
  ml.setWorkerUrl(workerUrl);

  const all = [...places.map((p) => [p.lng, p.lat]), ...routes.flatMap((r) => r.path.map(([lat, lng]) => [lng, lat]))] as [number, number][];
  const bounds = new ml.LngLatBounds();
  all.forEach((p) => bounds.extend(p));

  const style = (await fetch(STYLE).then((r) => r.json())) as StyleSpecification;
  // Labels in English or the local name; MapLibre can't shape Devanagari text.
  for (const layer of style.layers) {
    if (layer.type === 'symbol' && layer.layout?.['text-field']) {
      layer.layout['text-field'] = ['coalesce', ['get', 'name:en'], ['get', 'name']];
    }
  }

  el.querySelector('.map-loading')?.remove();
  // One point (or none): show the region around it rather than open water.
  const single = all.length < 2;
  const map = new ml.Map({
    container: el,
    style,
    bounds: single ? undefined : bounds,
    center: single ? (all[0] ?? [20, 20]) : undefined,
    zoom: single ? (all.length ? 3.6 : 1.2) : undefined,
    fitBoundsOptions: { padding: 56, maxZoom: 6 },
    cooperativeGestures: true,
    attributionControl: { compact: true },
    maxZoom: 14,
  });
  map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');

  const observer = new MutationObserver(() => map.isStyleLoaded() && paint(map));
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  maps.push({ map, observer });

  map.on('load', () => {
    routes.forEach((r, i) => {
      map.addSource(`gl-route-${i}`, { type: 'geojson', data: line(partOf(r.path, reduced() ? 1 : 0)) });
      map.addLayer({
        id: `gl-route-${i}`,
        type: 'line',
        source: `gl-route-${i}`,
        metadata: { colour: r.colour ?? 'clay' },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-width': 3.2, 'line-color': '#d97757', ...(r.dashed ? { 'line-dasharray': [2, 1.6] } : {}) },
      });
    });
    paint(map);

    // Draw every route over ~1.8s, then drop the places in.
    const start = performance.now();
    const dur = reduced() ? 0 : 1800;
    const step = (now: number) => {
      const t = dur ? Math.min(1, (now - start) / dur) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      routes.forEach((r, i) => (map.getSource(`gl-route-${i}`) as { setData(d: unknown): void } | undefined)?.setData(line(partOf(r.path, eased))));
      if (t < 1) requestAnimationFrame(step);
      else addPlaces();
    };
    requestAnimationFrame(step);
  });

  function addPlaces() {
    places.forEach((p, i) => {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = `map-pin map-pin-${p.kind ?? 'point'}`;
      node.style.setProperty('--i', String(i));
      node.innerHTML = '<span class="map-dot" aria-hidden="true"></span><span class="map-name"></span>';
      node.querySelector('.map-name')!.textContent = p.name;
      node.setAttribute('aria-label', p.note ? `${p.name}: ${p.note}` : p.name);
      const marker = new ml.Marker({ element: node, anchor: 'left', offset: [-7, 0] }).setLngLat([p.lng, p.lat]).addTo(map);
      if (p.note) {
        const box = document.createElement('div');
        box.className = 'map-note';
        box.innerHTML = '<strong></strong><p></p>';
        box.querySelector('strong')!.textContent = p.name;
        box.querySelector('p')!.textContent = p.note;
        marker.setPopup(new ml.Popup({ offset: 14, closeButton: false, maxWidth: '240px' }).setDOMContent(box));
      }
    });
  }
}

export function initMaps() {
  maps.forEach(({ map, observer }) => {
    observer.disconnect();
    map.remove();
  });
  maps = [];
  io?.disconnect();
  const els = document.querySelectorAll<HTMLElement>('[data-map]');
  if (!els.length) return;
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io!.unobserve(e.target);
        build(e.target as HTMLElement).catch((err) => {
          console.error('Map failed to load:', err);
          const msg = e.target.querySelector('.map-loading');
          if (msg) msg.textContent = '⚠';
        });
      }
    },
    { rootMargin: '300px 0px' },
  );
  els.forEach((el) => io!.observe(el));
}
