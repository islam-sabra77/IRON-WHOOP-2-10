// Returns recent Oura readiness, HRV, resting heart rate and sleep, one record per day.
// GET with header x-iron-key; DELETE disconnects.
import { getStore } from '@netlify/blobs';
import { rateLimit } from '../lib/guard.mjs';

const TOKEN = 'https://api.ouraring.com/oauth/token';
const API = 'https://api.ouraring.com/v2/usercollection';
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map((b) => b.toString(16).padStart(2, '0')).join('');
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

/* one record per day: readiness score as recovery, the main sleep's HRV, lowest heart rate and duration, the daily sleep score */
export function merge(readiness, dailySleep, sleeps) {
  const out = {};
  const day = (d) => (out[d] = out[d] || { d });
  readiness.forEach((x) => { if (x.day && x.score != null) day(x.day).rec = x.score; });
  dailySleep.forEach((x) => { if (x.day && x.score != null) day(x.day).perf = x.score; });
  // the longest sleep of each day wins (naps are ignored)
  const best = {}; sleeps.forEach((x) => { if (!x.day) return; if (!best[x.day] || (x.total_sleep_duration || 0) > (best[x.day].total_sleep_duration || 0)) best[x.day] = x; });
  Object.values(best).forEach((x) => { const r = day(x.day); r.hrv = x.average_hrv ?? null; r.rhr = x.lowest_heart_rate ?? null; r.dur = x.total_sleep_duration != null ? Math.round(x.total_sleep_duration / 36) / 100 : null; r.bed = x.bedtime_start || null; r.wake = x.bedtime_end || null; });
  return Object.values(out).sort((a, b) => (a.d < b.d ? -1 : 1));
}

export default async (req) => {
  { const lim = await rateLimit(getStore('limits'), req, 'oura-data', 30, 600); if (lim) return lim; }
  const k = req.headers.get('x-iron-key') || '';
  if (k.length < 32) return json({ connected: false }, 401);
  const store = getStore('oura'), id = 'tok:' + (await hash(k));
  if (req.method === 'DELETE') { await store.delete(id); return json({ ok: true }); }
  const tok = await store.get(id, { type: 'json' });
  if (!tok) return json({ connected: false }, 401);
  let refreshed = false;
  const refresh = async () => {
    if (refreshed || !tok.rt) return false; refreshed = true;
    const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: tok.rt, client_id: process.env.OURA_CLIENT_ID || '', client_secret: process.env.OURA_CLIENT_SECRET || '' }) });
    if (!r.ok) return false; const t = await r.json(); if (!t.access_token) return false;
    tok.at = t.access_token; if (t.refresh_token) tok.rt = t.refresh_token; tok.exp = Date.now() + ((t.expires_in || 86400) - 300) * 1000; await store.setJSON(id, tok); return true;
  };
  if (Date.now() > tok.exp && !(await refresh())) { await store.delete(id); return json({ connected: false }, 401); }
  const days = Math.min(120, Math.max(1, parseInt(new URL(req.url).searchParams.get('days') || '45', 10)));
  const start = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10), end = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const pull = async (path) => { const out = []; let next = null, pages = 0;
    do { const u = new URL(API + path); u.searchParams.set('start_date', start); u.searchParams.set('end_date', end); if (next) u.searchParams.set('next_token', next);
      let r = await fetch(u, { headers: { Authorization: 'Bearer ' + tok.at } });
      if (r.status === 401 && (await refresh())) r = await fetch(u, { headers: { Authorization: 'Bearer ' + tok.at } });
      if (r.status === 401) { const e = new Error('auth'); e.auth = true; throw e; }
      if (!r.ok) throw new Error('oura_' + r.status);
      const j = await r.json(); (j.data || []).forEach((x) => out.push(x)); next = j.next_token; pages++;
    } while (next && pages < 8);
    return out; };
  try {
    const [rd, ds, sl] = await Promise.all([pull('/daily_readiness'), pull('/daily_sleep').catch(() => []), pull('/sleep').catch(() => [])]);
    return json({ connected: true, records: merge(rd, ds, sl) });
  } catch (e) {
    if (e.auth) { await store.delete(id); return json({ connected: false }, 401); }
    return json({ connected: true, error: e.message }, 502);
  }
};
export const config = { path: '/api/oura-data' };
