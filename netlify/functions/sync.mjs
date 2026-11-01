// Cloud backup and sync. Data arrives already encrypted on the phone (AES-GCM, key derived from the private
// sync code); this server only sees a separate access token derived from the code and the ciphertext.
//   GET  /api/sync  -> { updated, state }     (404 when nothing is stored yet)
//   PUT  /api/sync  body { updated, enc }     -> { ok, updated }   (older apps sent { updated, state })
//   DELETE /api/sync                          -> removes the stored copy (used after moving to encrypted storage)
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
    if (!body || typeof body.updated !== 'number' || !(typeof body.enc === 'object' && body.enc && typeof body.enc.ct === 'string') && typeof body.state !== 'object') return json({ error: 'bad_body' }, 400);
    const cur = await store.get(id, { type: 'json' });
    // Refuse to overwrite newer data; the app merges and retries.
    if (cur && cur.updated > body.updated) return json({ error: 'stale', updated: cur.updated }, 409);
    await store.setJSON(id, body.enc ? { updated: body.updated, enc: body.enc, at: Date.now() } : { updated: body.updated, state: body.state, at: Date.now() });
    return json({ ok: true, updated: body.updated });
  }
  if (req.method === 'DELETE') { await store.delete(id); return json({ ok: true }); }
  return json({ error: 'method' }, 405);
};
export const config = { path: '/api/sync' };
