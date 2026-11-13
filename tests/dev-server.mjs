// Local server for tests: serves the app and runs the Netlify functions with an in-memory Blobs store.
// Usage: node tests/dev-server.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = +(process.argv[2] || process.env.PORT || 8790);
process.env.IRON_NO_LIMITS = process.env.IRON_NO_LIMITS || '1';
// the same security policy as production (netlify.toml), minus the https upgrade that localhost can't use
const CSP = (fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'netlify.toml'), 'utf8').match(/Content-Security-Policy = "([^"]+)"/) || [])[1].replace(/;\s*upgrade-insecure-requests/, '');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml' };

// in-memory replacement for @netlify/blobs
const stores = new Map();
globalThis.__ironStore = (name) => {
  if (!stores.has(name)) stores.set(name, new Map());
  const m = stores.get(name);
  return { get: async (k, o) => (m.has(k) ? (o && o.type === 'json' ? JSON.parse(m.get(k)) : m.get(k)) : null), setJSON: async (k, v) => { m.set(k, JSON.stringify(v)); }, delete: async (k) => { m.delete(k); } };
};
const tmp = path.join(root, 'netlify', '.fn-tmp'); fs.mkdirSync(tmp, { recursive: true }); // inside netlify/ so functions find node_modules and ../lib
const fns = {};
for (const f of fs.readdirSync(path.join(root, 'netlify/functions'))) {
  if (!f.endsWith('.mjs')) continue;
  const src = fs.readFileSync(path.join(root, 'netlify/functions', f), 'utf8').replace(/^import \{ getStore \} from '@netlify\/blobs';/m, 'const getStore = (n) => globalThis.__ironStore(n);');
  if (/from '@anthropic-ai\/sdk'|from 'zod'/.test(src)) continue; // needs real API; tests mock it in the browser
  const out = path.join(tmp, f);
  fs.writeFileSync(out, src);
  const mod = await import(pathToFileURL(out).href);
  const name = f.replace(/\.mjs$/, '');
  if (mod.config && mod.config.path) fns[mod.config.path] = mod.default;
  else if (name.endsWith('-background')) fns['/.netlify/functions/' + name] = async (req) => { mod.default(req).catch(() => {}); return new Response(null, { status: 202 }); };
  else fns['/.netlify/functions/' + name] = mod.default; // scheduled functions can be triggered by hand in tests
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (fns[url.pathname]) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks);
    const r = await fns[url.pathname](new Request('http://localhost' + req.url, { method: req.method, headers: req.headers, body }));
    res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer())); return;
  }
  let p = decodeURIComponent(url.pathname); if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Security-Policy': CSP, 'X-Frame-Options': 'DENY', 'X-Content-Type-Options': 'nosniff' });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log('IRON test server on http://localhost:' + port));
