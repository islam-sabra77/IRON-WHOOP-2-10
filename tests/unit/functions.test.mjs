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
  const dir = path.join(root, 'netlify', '.fn-tmp'); fs.mkdirSync(dir, { recursive: true }); const f = path.join(dir, 'unit-' + name); fs.writeFileSync(f, src);
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

test('sync stores encrypted bodies and can delete', async () => {
  const sync = await load('sync.mjs');
  const k2 = 'c'.repeat(64), h = (m, b) => new Request('http://x/api/sync', { method: m, headers: { 'x-iron-sync': k2 }, body: b && JSON.stringify(b) });
  assert.equal((await sync(h('PUT', { updated: 5, enc: { iv: 'aa', ct: 'bb' } }))).status, 200);
  const got = await (await sync(h('GET'))).json();
  assert.deepEqual(got.enc, { iv: 'aa', ct: 'bb' }); assert.equal(got.state, undefined);
  assert.equal((await sync(h('PUT', { updated: 6 }))).status, 400);
  assert.equal((await sync(h('DELETE'))).status, 200);
  assert.equal((await sync(h('GET'))).status, 404);
});

test('passkey endpoints reject a foreign origin', async () => {
  const pk = await load('passkey.mjs');
  const r = await pk(new Request('http://x/api/passkey?step=reg-options', { method: 'POST', headers: { host: 'iron.example', origin: 'https://evil.example' }, body: '{}' }));
  assert.equal(r.status, 400);
  const ok = await pk(new Request('http://x/api/passkey?step=reg-options', { method: 'POST', headers: { host: 'iron.example', origin: 'https://iron.example' }, body: '{}' }));
  assert.equal(ok.status, 200);
  assert.ok((await ok.json()).options.challenge);
});

test('timer alerts: exact send by the background function, cancel stops it, tick is the fallback', async () => {
  const sent = []; globalThis.__ironPushSend = async (sub, msg) => { sent.push(msg.title); return 'ok'; };
  const push = await load('push.mjs'), wait = await load('push-wait-background.mjs'), tick = await load('push-tick.mjs');
  const sub = { endpoint: 'https://push.example/abc', keys: { p256dh: 'x', auth: 'y' } };
  const post = (step, body) => push(new Request('http://x/api/push?step=' + step, { method: 'POST', body: JSON.stringify(body) }));
  assert.equal((await push(new Request('http://x/api/push?step=key'))).status, 200);
  const t0 = Date.now();
  assert.equal((await post('schedule', { id: 'timerA1', sub, items: [{ at: t0 + 300, title: 'Rest is over' }] })).status, 200);
  await wait(new Request('http://x/', { method: 'POST', body: JSON.stringify({ key: 'job:timerA1' }) }));
  assert.deepEqual(sent, ['Rest is over']);
  assert.ok(Date.now() - t0 >= 300, 'sent no earlier than due');
  await post('schedule', { id: 'timerB1', sub, items: [{ at: Date.now() + 200, title: 'Should not send' }] });
  await post('cancel', { id: 'timerB1' });
  await new Promise((r) => setTimeout(r, 300)); await tick();
  assert.deepEqual(sent, ['Rest is over']);
  await post('reminders', { device: 'device01', sub, items: [{ at: Date.now() - 1000, title: 'Supplements' }, { at: Date.now() + 3600_000, title: 'Later' }] });
  await tick(); await tick();
  assert.deepEqual(sent, ['Rest is over', 'Supplements']);
  delete globalThis.__ironPushSend;
});

test('feedback stores short messages and keeps them private', async () => {
  const fb = await load('feedback.mjs');
  const post = (b) => fb(new Request('http://x/api/feedback', { method: 'POST', body: JSON.stringify(b) }));
  assert.equal((await post({ kind: 'idea', text: 'hi' })).status, 400);
  assert.equal((await post({ kind: 'problem', text: 'Timer froze', tab: 'train' })).status, 200);
  assert.equal((await fb(new Request('http://x/api/feedback?key=nope'))).status, 403);
  process.env.ERROR_LOG_KEY = 'k1';
  const list = await (await fb(new Request('http://x/api/feedback?key=k1'))).json();
  assert.equal(list.at(-1).text, 'Timer froze');
  assert.equal(list.at(-1).kind, 'problem');
  delete process.env.ERROR_LOG_KEY;
});

test('translate caches each string and only calls the model for new ones', async () => {
  const tr = await load('translate.mjs');
  let calls = 0;
  globalThis.__ironTranslate = async (list) => { calls++; return Object.fromEntries(list.map((s) => [s, 'AR:' + s])); };
  const post = (strings) => tr(new Request('http://x/api/translate', { method: 'POST', body: JSON.stringify({ lang: 'ar', strings }) }));
  const a = await (await post(['Brace your core', 'Press up'])).json();
  assert.equal(a.t['Brace your core'], 'AR:Brace your core');
  const b = await (await post(['Brace your core', 'Press up'])).json();
  assert.equal(b.t['Press up'], 'AR:Press up');
  assert.equal(calls, 1);
  assert.equal((await tr(new Request('http://x/api/translate', { method: 'POST', body: JSON.stringify({ lang: 'fr', strings: ['x'] }) }))).status, 400);
  delete globalThis.__ironTranslate;
});

test('rate limits stop a flood from one device but not other devices, and the AI budget caps paid calls', async () => {
  const fb = await load('feedback.mjs');
  const post = (ip) => fb(new Request('http://x/api/feedback', { method: 'POST', headers: { 'x-nf-client-connection-ip': ip }, body: JSON.stringify({ kind: 'idea', text: 'More squats' }) }));
  const codes = []; for (let i = 0; i < 7; i++) codes.push((await post('203.0.113.9')).status);
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 429, 429]);
  assert.equal((await post('198.51.100.4')).status, 200);
  const { aiBudget } = await import(pathToFileURL(path.join(root, 'netlify/lib/guard.mjs')).href);
  process.env.AI_MONTHLY_CAP = '2';
  const st = globalThis.__ironStore('limits-test');
  assert.equal(await aiBudget(st), true); assert.equal(await aiBudget(st), true); assert.equal(await aiBudget(st), false);
  delete process.env.AI_MONTHLY_CAP;
});
