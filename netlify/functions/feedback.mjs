// In-app feedback: ideas, problems and praise.
//   POST /api/feedback  body { kind, text, tab, v, ua }
//   GET  /api/feedback?key=<ERROR_LOG_KEY>  -> latest 300 messages (same key as error reports)
import { getStore } from '@netlify/blobs';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
export default async (req) => {
  const store = getStore('feedback');
  if (req.method === 'GET') {
    const key = new URL(req.url).searchParams.get('key');
    if (!process.env.ERROR_LOG_KEY || key !== process.env.ERROR_LOG_KEY) return json({ error: 'forbidden' }, 403);
    return json((await store.get('recent', { type: 'json' })) || []);
  }
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const raw = await req.text();
  if (raw.length > 5000) return json({ error: 'too_large' }, 413);
  let b; try { b = JSON.parse(raw); } catch { return json({ error: 'bad_body' }, 400); }
  const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
  const text = clip(b.text, 2000).trim();
  if (text.length < 3) return json({ error: 'empty' }, 400);
  const rec = { t: Date.now(), kind: ['idea', 'problem', 'love'].includes(b.kind) ? b.kind : 'idea', text, tab: clip(b.tab, 20), v: clip(b.v, 30), ua: clip(b.ua, 160) };
  const list = (await store.get('recent', { type: 'json' })) || [];
  list.push(rec); while (list.length > 300) list.shift();
  await store.setJSON('recent', list);
  return json({ ok: true });
};
export const config = { path: '/api/feedback' };
