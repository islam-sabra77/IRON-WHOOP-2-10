// Netlify functions, run against an in-memory Blobs store.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const stores = new Map();
globalThis.__ironStore = (n) => { if (!stores.has(n)) stores.set(n, new Map()); const m = stores.get(n); return { get: async (k, o) => (m.has(k) ? (o && o.type === 'json' ? JSON.parse(m.get(k)) : m.get(k)) : null), setJSON: async (k, v) => m.set(k, JSON.stringify(v)), delete: async (k) => m.delete(k) }; };
async function load(name) {
  const src = fs.readFileSync(path.join(root, 'netlify/functions', name), 'utf8').replace(/^import \{ getStore \} from '@netlify\/blobs';/m, 'const getStore = (n) => globalThis.__ironStore(n);');
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'iron-')), name); fs.writeFileSync(f, src);
  return (await import(pathToFileURL(f).href)).default;
}
const key = 'a'.repeat(64);
const req = (method, body, headers = {}) => new Request('http://x/api/sync', { method, headers: { 'x-iron-sync': key, ...headers }, body: body && JSON.stringify(body) });

test('sync stores, returns and refuses older data', async () => {
  const sync = await load('sync.mjs');
  assert.equal((await sync(req('GET'))).status, 404);
  assert.equal((await sync(req('PUT', { updated: 2, state: { a: 1 } }))).status, 200);
  const got = await (await sync(req('GET'))).json();
  assert.deepEqual(got.state, { a: 1 });
  assert.equal((await sync(req('PUT', { updated: 1, state: { a: 0 } }))).status, 409);
  assert.equal((await sync(new Request('http://x/api/sync', { headers: { 'x-iron-sync': 'short' } }))).status, 401);
});

test('error log accepts reports and hides them without the key', async () => {
  const log = await load('log-error.mjs');
  const r = await log(new Request('http://x/api/log-error', { method: 'POST', body: JSON.stringify({ msg: 'boom' }) }));
  assert.equal(r.status, 200);
  assert.equal((await log(new Request('http://x/api/log-error'))).status, 403);
});
