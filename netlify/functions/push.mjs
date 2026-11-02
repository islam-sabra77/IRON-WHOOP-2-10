// Push notifications for rest timers and reminders.
//   GET  /api/push?step=key                          -> { publicKey }
//   POST /api/push?step=schedule {id, sub, items}    -> timer alerts (sent at the exact second by a background function)
//   POST /api/push?step=cancel   {id}
//   POST /api/push?step=reminders {device, sub, items} -> replaces this device's reminder list (sent by the minute)
import { getStore } from '@netlify/blobs';
import { vapid, validSub, cleanItems } from '../lib/push-core.mjs';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const okId = (s) => typeof s === 'string' && /^[A-Za-z0-9._-]{6,80}$/.test(s);

export default async (req) => {
  const store = getStore('push'), url = new URL(req.url), step = url.searchParams.get('step');
  if (req.method === 'GET' && step === 'key') return json({ publicKey: (await vapid(store)).publicKey });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let b; try { b = await req.json(); } catch { return json({ error: 'bad_body' }, 400); }
  const index = async (key, add) => { const ix = (await store.get('index', { type: 'json' })) || []; const i = ix.indexOf(key); if (add && i < 0) ix.push(key); if (!add && i >= 0) ix.splice(i, 1); while (ix.length > 2000) ix.shift(); await store.setJSON('index', ix); };

  if (step === 'schedule') {
    if (!okId(b.id) || !validSub(b.sub)) return json({ error: 'bad_body' }, 400);
    const items = cleanItems(b.items, 60).filter((i) => i.at > Date.now() - 5000 && i.at < Date.now() + 3 * 3600_000);
    if (!items.length) return json({ error: 'no_items' }, 400);
    const key = 'job:' + b.id;
    await store.setJSON(key, { kind: 'timer', sub: b.sub, items, created: Date.now(), tag: 'iron-rest' });
    await index(key, true);
    // exact timing: a background function waits for each alert (falls back to the per-minute sender)
    const origin = req.headers.get('x-forwarded-host') ? 'https://' + req.headers.get('x-forwarded-host') : url.origin;
    try { await fetch(origin + '/.netlify/functions/push-wait-background', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) }); } catch {}
    return json({ ok: true });
  }
  if (step === 'cancel') {
    if (!okId(b.id)) return json({ error: 'bad_body' }, 400);
    const key = 'job:' + b.id; await store.delete(key); await index(key, false);
    return json({ ok: true });
  }
  if (step === 'reminders') {
    if (!okId(b.device) || !validSub(b.sub)) return json({ error: 'bad_body' }, 400);
    const key = 'rem:' + b.device, items = cleanItems(b.items, 120).filter((i) => i.at > Date.now() - 60_000 && i.at < Date.now() + 9 * 86400_000);
    const old = await store.get(key, { type: 'json' });
    const sent = new Set(((old && old.items) || []).filter((i) => i.sent).map((i) => i.at + '|' + i.title));
    items.forEach((i) => { if (sent.has(i.at + '|' + i.title)) i.sent = 1; });
    await store.setJSON(key, { kind: 'rem', sub: b.sub, items, updated: Date.now() });
    await index(key, items.length > 0);
    return json({ ok: true, count: items.length });
  }
  return json({ error: 'step' }, 400);
};
export const config = { path: '/api/push' };
