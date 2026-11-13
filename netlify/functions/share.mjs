// Read-only coach links. The app encrypts a training summary on the phone with a random key that
// lives only in the link's #fragment (never sent to the server), so this server stores data it can't read.
//   POST   /api/share            body { enc, days }  -> { id, del }   (link expires after `days`, 1–90)
//   GET    /api/share?id=<id>                         -> { enc, exp }
//   DELETE /api/share?id=<id>    header x-share-del: <del>
import { getStore } from '@netlify/blobs';
import { rateLimit } from '../lib/guard.mjs';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const rnd = (n) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => b.toString(16).padStart(2, '0')).join('');
const okId = (s) => typeof s === 'string' && /^[a-f0-9]{24}$/.test(s);

export default async (req) => {
  { const lim = await rateLimit(getStore('limits'), req, 'share', 30, 600); if (lim) return lim; }
  const store = getStore('share'), url = new URL(req.url), id = url.searchParams.get('id');
  if (req.method === 'GET') {
    if (!okId(id)) return json({ error: 'id' }, 400);
    const v = await store.get('s:' + id, { type: 'json' });
    if (!v || v.exp < Date.now()) { if (v) await store.delete('s:' + id); return json({ error: 'gone' }, 404); }
    return json({ enc: v.enc, exp: v.exp });
  }
  if (req.method === 'DELETE') {
    if (!okId(id)) return json({ error: 'id' }, 400);
    const v = await store.get('s:' + id, { type: 'json' });
    if (v && v.del !== req.headers.get('x-share-del')) return json({ error: 'forbidden' }, 403);
    await store.delete('s:' + id); return json({ ok: true });
  }
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const raw = await req.text();
  if (raw.length > 600_000) return json({ error: 'too_large' }, 413);
  let b; try { b = JSON.parse(raw); } catch { return json({ error: 'bad_body' }, 400); }
  if (!b || !b.enc || typeof b.enc.ct !== 'string' || typeof b.enc.iv !== 'string') return json({ error: 'bad_body' }, 400);
  const days = Math.min(90, Math.max(1, Math.round(+b.days || 30)));
  const nid = rnd(12), del = rnd(16), exp = Date.now() + days * 86400_000;
  await store.setJSON('s:' + nid, { enc: { iv: b.enc.iv, ct: b.enc.ct, z: !!b.enc.z }, exp, del, created: Date.now() });
  return json({ id: nid, del, exp });
};
export const config = { path: '/api/share' };
