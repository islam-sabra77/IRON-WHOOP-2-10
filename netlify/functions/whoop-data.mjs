// Returns your recent WHOOP recovery records (score, HRV, resting HR).
// Token handling lives in _whoop-token.mjs, shared with /api/whoop-mcp.
import { openSession, dropSession, authedFetch, pull, API, WhoopAuthError } from './_whoop-token.mjs';

export default async (req) => {
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  const k = req.headers.get('x-iron-key') || '';
  if (k.length < 32) return json({ connected: false }, 401);
  const session = await openSession(k);
  if (!session) return json({ connected: false }, 401);
  const days = Math.min(120, Math.max(1, parseInt(new URL(req.url).searchParams.get('days') || '45', 10)));
  const start = new Date(Date.now() - days * 864e5).toISOString();

  let rec, slp, cyc;
  try {
    rec = await pull(session, '/v2/recovery', { start, maxPages: 6 });
    [slp, cyc] = await Promise.all([
      pull(session, '/v2/activity/sleep', { start, maxPages: 8 }).catch(() => []),
      pull(session, '/v2/cycle', { start, maxPages: 6 }).catch(() => []),
    ]);
  } catch (e) {
    // Only a grant WHOOP has actually rejected clears the saved login. A rate
    // limit, a 5xx or a network blip returns 502 instead, which IRON reports as
    // "sync failed, try again" and retries later -- it no longer forces a
    // reconnect from the phone over a momentary WHOOP outage.
    if (e instanceof WhoopAuthError) { await dropSession(session).catch(() => {}); return json({ connected: false }, 401); }
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
    strain: x.score.strain, kj: x.score.kilojoule, ahr: x.score.average_heart_rate, mhr: x.score.max_heart_rate,
    steps: x.score.step_count != null ? x.score.step_count : (x.step_count != null ? x.step_count : null) }));
  let body = null;
  try {
    const br = await authedFetch(session, new URL(API + '/v2/user/measurement/body'));
    if (br.ok) { const b = await br.json(); body = { height: b.height_meter, weight: b.weight_kilogram, maxhr: b.max_heart_rate }; }
  } catch (e) {}
  return json({ connected: true, records, sleeps, cycles, body });
};
export const config = { path: '/api/whoop-data' };
