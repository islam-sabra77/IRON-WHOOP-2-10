// Returns your recent WHOOP recovery records (score, HRV, resting HR).
import { getStore } from '@netlify/blobs';
// WHOOP app keys. The secret must live in Netlify environment variables.
const CLIENT_ID = process.env.WHOOP_CLIENT_ID || '7cd8e320-a15a-42d9-a4e8-c913b1eff798';
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET; // set in Netlify → Environment variables (never in code)

const TOKEN = 'https://api.prod.whoop.com/oauth/oauth2/token';
const API = 'https://api.prod.whoop.com/developer';
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(b => b.toString(16).padStart(2, '0')).join('');
export default async (req) => {
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  const k = req.headers.get('x-iron-key') || '';
  if (k.length < 32) return json({ connected: false }, 401);
  const store = getStore('whoop'), id = 'tok:' + (await hash(k));
  const tok = await store.get(id, { type: 'json' });
  if (!tok) return json({ connected: false }, 401);
  let refreshed = false;
  const doRefresh = async () => {
    if (refreshed) return false; refreshed = true;
    const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: tok.rt, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, scope: 'offline' }) });
    if (!r.ok) return false;
    const t = await r.json(); if (!t.access_token) return false;
    tok.at = t.access_token; if (t.refresh_token) tok.rt = t.refresh_token;
    tok.exp = Date.now() + ((t.expires_in || 3600) - 120) * 1000;
    await store.setJSON(id, tok); return true;
  };
  if (!tok.at || Date.now() > tok.exp) { if (!(await doRefresh())) { await store.delete(id); return json({ connected: false }, 401); } }
  const days = Math.min(120, Math.max(1, parseInt(new URL(req.url).searchParams.get('days') || '45', 10)));
  const start = new Date(Date.now() - days * 864e5).toISOString();
  const pull = async (path, maxPages) => {
    const out = []; let next = null, pages = 0;
    do {
      const u = new URL(API + path);
      u.searchParams.set('limit', '25'); u.searchParams.set('start', start);
      if (next) u.searchParams.set('nextToken', next);
      let r = await fetch(u, { headers: { Authorization: 'Bearer ' + tok.at } });
      if (r.status === 401 && (await doRefresh())) r = await fetch(u, { headers: { Authorization: 'Bearer ' + tok.at } });
      if (r.status === 401) { const e = new Error('auth'); e.auth = true; throw e; }
      if (!r.ok) { if (path === '/v2/recovery') { const e = new Error('whoop_' + r.status); throw e; } return out; }
      const j = await r.json(); (j.records || []).forEach(x => out.push(x));
      next = j.next_token; pages++;
    } while (next && pages < maxPages);
    return out;
  };
  let rec, slp, cyc;
  try {
    rec = await pull('/v2/recovery', 6);
    [slp, cyc] = await Promise.all([pull('/v2/activity/sleep', 8).catch(() => []), pull('/v2/cycle', 6).catch(() => [])]);
  } catch (e) {
    if (e.auth) { await store.delete(id); return json({ connected: false }, 401); }
    return json({ connected: true, error: e.message }, 502);
  }
  const records = rec.map(x => ({ cycle_id: x.cycle_id, sleep_id: x.sleep_id, created_at: x.created_at, state: x.score_state,
    rec: x.score ? x.score.recovery_score : null, rhr: x.score ? x.score.resting_heart_rate : null,
    hrv: x.score ? x.score.hrv_rmssd_milli : null, spo2: x.score ? x.score.spo2_percentage : null,
    skin: x.score ? x.score.skin_temp_celsius : null, calibrating: x.score ? !!x.score.user_calibrating : false }));
  const sleeps = slp.filter(x => !x.nap && x.score_state === 'SCORED' && x.score).map(x => {
    const st = x.score.stage_summary || {}, need = x.score.sleep_needed || {};
    return { id: x.id, start: x.start, end: x.end,
      perf: x.score.sleep_performance_percentage, eff: x.score.sleep_efficiency_percentage, cons: x.score.sleep_consistency_percentage, rr: x.score.respiratory_rate,
      inBed: st.total_in_bed_time_milli, awake: st.total_awake_time_milli, light: st.total_light_sleep_time_milli, deep: st.total_slow_wave_sleep_time_milli, rem: st.total_rem_sleep_time_milli,
      dist: st.disturbance_count, cycles: st.sleep_cycle_count,
      need: (need.baseline_milli || 0) + (need.need_from_sleep_debt_milli || 0) + (need.need_from_recent_strain_milli || 0) - (need.need_from_recent_nap_milli || 0) };
  });
  const cycles = cyc.filter(x => x.score_state === 'SCORED' && x.score).map(x => ({ id: x.id, start: x.start, end: x.end,
    strain: x.score.strain, kj: x.score.kilojoule, ahr: x.score.average_heart_rate, mhr: x.score.max_heart_rate }));
  return json({ connected: true, records, sleeps, cycles });
};
export const config = { path: '/api/whoop-data' };
