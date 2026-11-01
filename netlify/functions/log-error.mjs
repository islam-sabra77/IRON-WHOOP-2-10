// Collects error reports from the app so problems on real phones can be found.
//   POST /api/log-error  body { msg, src, stack, tab, v, ua, t }
//   GET  /api/log-error?key=<ERROR_LOG_KEY>  -> latest 200 reports (set ERROR_LOG_KEY in Netlify to read them)
import { getStore } from '@netlify/blobs';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
export default async (req) => {
  const store = getStore('errors');
  if (req.method === 'GET') {
    const key = new URL(req.url).searchParams.get('key');
    if (!process.env.ERROR_LOG_KEY || key !== process.env.ERROR_LOG_KEY) return json({ error: 'forbidden' }, 403);
    return json((await store.get('recent', { type: 'json' })) || []);
  }
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const text = await req.text();
  if (text.length > 6000) return json({ error: 'too_large' }, 413);
  let e; try { e = JSON.parse(text); } catch { return json({ error: 'bad_body' }, 400); }
  const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
  const rec = { t: Date.now(), msg: clip(e.msg, 300), src: clip(e.src, 200), stack: clip(e.stack, 1500), tab: clip(e.tab, 20), v: clip(e.v, 30), ua: clip(e.ua, 160) };
  const list = (await store.get('recent', { type: 'json' })) || [];
  list.push(rec); while (list.length > 200) list.shift();
  await store.setJSON('recent', list);
  return json({ ok: true });
};
export const config = { path: '/api/log-error' };
