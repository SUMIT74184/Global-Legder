// Dev only: serves the Payload admin panel and API on the site's own address (/admin, /cms-api),
// so the site and the admin share one origin, as they do in production behind deploy/Caddyfile.
// Vite's `server.proxy` can't be used: Astro's dev middleware answers every request before it runs.
import http from 'node:http';
import net from 'node:net';

const PREFIXES = ['/admin', '/cms-api', '/_next', '/__nextjs'];
const matches = (url = '') => PREFIXES.some((p) => url === p || url.startsWith(`${p}/`) || url.startsWith(`${p}?`));

/** @param {string} target @returns {import('vite').Plugin} */
export function cmsProxy(target) {
  const cms = new URL(target);

  const forward = (req, res, next) => {
    if (!matches(req.url)) return next();
    const upstream = http.request(
      { host: cms.hostname, port: cms.port, path: req.url, method: req.method, headers: req.headers },
      (r) => {
        res.writeHead(r.statusCode ?? 502, r.headers);
        r.pipe(res);
      },
    );
    upstream.on('error', () => {
      res.statusCode = 502;
      res.end(`The CMS is not running at ${target}. Start it with: pnpm cms`);
    });
    req.pipe(upstream);
  };

  // Next's hot reload uses a WebSocket under /_next.
  const upgrade = (req, socket, head) => {
    if (!matches(req.url)) return;
    const up = net.connect(Number(cms.port), cms.hostname, () => {
      const headers = Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n');
      up.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers}\r\n\r\n`);
      up.write(head);
      socket.pipe(up).pipe(socket);
    });
    up.on('error', () => socket.destroy());
    socket.on('error', () => up.destroy());
  };

  return {
    name: 'gl-cms-proxy',
    apply: 'serve',
    configureServer(server) {
      server.httpServer?.on('upgrade', upgrade);
      // Astro puts its handlers at the front of the stack in its own post hook; this one runs
      // after it, so the proxy ends up first.
      return () => server.middlewares.stack.unshift({ route: '', handle: forward });
    },
  };
}
