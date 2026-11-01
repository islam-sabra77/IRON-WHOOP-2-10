// Cloud backup and sync. Each person's data is stored under a hash of their private sync code.
//   GET  /api/sync  -> { updated, state }     (404 when nothing is stored yet)
//   PUT  /api/sync  body { updated, state }   -> { ok, updated }
import { getStore } from '@netlify/blobs';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(b => b.toString(16).padStart(2, '0')).join('');

export default async (req) => {
  const k = (req.headers.get('x-iron-sync') || '').trim();
  if (!/^[a-f0-9]{48,128}$/.test(k)) return json({ error: 'code' }, 401);
  const store = getStore('sync'), id = 'v1:' + (await hash(k));
  if (req.method === 'GET') {
    const v = await store.get(id, { type: 'json' });
    return v ? json(v) : json({ error: 'empty' }, 404);
  }
  if (req.method === 'PUT') {
    const text = await req.text();
    if (text.length > 8_000_000) return json({ error: 'too_large' }, 413);
    let body; try { body = JSON.parse(text); } catch { return json({ error: 'bad_body' }, 400); }
    if (!body || typeof body.state !== 'object' || typeof body.updated !== 'number') return json({ error: 'bad_body' }, 400);
    const cur = await store.get(id, { type: 'json' });
    // Refuse to overwrite newer data; the app merges and retries.
    if (cur && cur.updated > body.updated) return json({ error: 'stale', updated: cur.updated }, 409);
    await store.setJSON(id, { updated: body.updated, state: body.state, at: Date.now() });
    return json({ ok: true, updated: body.updated });
  }
  return json({ error: 'method' }, 405);
};
export const config = { path: '/api/sync' };
