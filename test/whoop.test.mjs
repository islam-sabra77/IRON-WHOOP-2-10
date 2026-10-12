import { getStore } from '@netlify/blobs';
import mcp from '../netlify/functions/whoop-mcp.mjs';
import data from '../netlify/functions/whoop-data.mjs';

process.env.WHOOP_CLIENT_SECRET = 'test-secret';
const KEY = 'k'.repeat(64);
const sha = async s => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(b=>b.toString(16).padStart(2,'0')).join('');
const ID = 'tok:' + await sha(KEY);

let pass = 0, fail = 0;
const ok = (name, cond, extra='') => { cond ? (pass++, console.log('  PASS', name)) : (fail++, console.log('  FAIL', name, extra)); };

// ---- simulated WHOOP ----
let tokenMode = 'ok', tokenHits = 0, apiCalls = 0;
const DAY = 864e5;
function recoveryRecords(n) {
  const out = [];
  for (let i = n; i >= 0; i--) {
    const isToday = i === 0;
    out.push({ cycle_id: 1000+i, sleep_id: 's'+i, created_at: new Date(Date.now() - i*DAY).toISOString(), score_state: 'SCORED',
      score: { recovery_score: isToday ? 70 : 75, resting_heart_rate: 50, hrv_rmssd_milli: isToday ? 85 : 100, user_calibrating: false } });
  }
  return out;
}
function sleepRecords(n) {
  const out = [];
  for (let i = n; i >= 0; i--) out.push({ id: 's'+i, nap: false, score_state: 'SCORED', start: new Date(Date.now()-i*DAY-28800000).toISOString(), end: new Date(Date.now()-i*DAY).toISOString(),
    score: { sleep_performance_percentage: 90, sleep_efficiency_percentage: 92.4, sleep_consistency_percentage: 80, respiratory_rate: 14.2,
      stage_summary: { total_in_bed_time_milli: 8*36e5, total_awake_time_milli: 0.5*36e5, total_light_sleep_time_milli: 4*36e5, total_slow_wave_sleep_time_milli: 1.5*36e5, total_rem_sleep_time_milli: 2*36e5, disturbance_count: 3, sleep_cycle_count: 5 },
      sleep_needed: { baseline_milli: 8*36e5, need_from_sleep_debt_milli: 0.5*36e5, need_from_recent_strain_milli: 0.2*36e5, need_from_recent_nap_milli: 0 } } });
  return out;
}
function cycleRecords(n) {
  const out = [];
  for (let i = n; i >= 0; i--) out.push({ id: 1000+i, start: new Date(Date.now()-i*DAY).toISOString(), end: null, score_state: 'SCORED',
    score: { strain: 12.3, kilojoule: 8368, average_heart_rate: 72, max_heart_rate: 160 } });
  return out;
}
globalThis.fetch = async (url, init) => {
  const u = url.toString();
  if (u.includes('/oauth2/token')) {
    tokenHits++;
    const body = Object.fromEntries(new URLSearchParams(init.body));
    if (body.scope !== 'offline') return { ok:false, status:400, text:async()=>'{"error":"invalid_scope"}' };
    if (tokenMode === 'down')    return { ok:false, status:503, text:async()=>'upstream down' };
    if (tokenMode === 'ratelimit') return { ok:false, status:429, text:async()=>'{"error":"rate_limited"}' };
    if (tokenMode === 'revoked') return { ok:false, status:400, text:async()=>'{"error":"invalid_grant"}' };
    if (tokenMode === 'badsecret') return { ok:false, status:401, text:async()=>'{"error":"invalid_client"}' };
    return { ok:true, status:200, json: async()=>({ access_token:'at-'+tokenHits, refresh_token:'rt-'+tokenHits, expires_in:3600 }) };
  }
  apiCalls++;
  const path = new URL(u).pathname;
  const mk = recs => ({ ok:true, status:200, json: async()=>({ records: recs, next_token: undefined }) });
  if (path.endsWith('/v2/recovery')) return mk(recoveryRecords(40));
  if (path.endsWith('/v2/activity/sleep')) return mk(sleepRecords(40));
  if (path.endsWith('/v2/cycle')) return mk(cycleRecords(40));
  if (path.endsWith('/v2/user/measurement/body')) return { ok:true, status:200, json: async()=>({ height_meter:1.8, weight_kilogram:80, max_heart_rate:190 }) };
  return { ok:false, status:404, text:async()=>'nope' };
};

const rpc = (method, params, { key = KEY, qs = true } = {}) => mcp(new Request(
  'https://iron.example/api/whoop-mcp' + (qs && key ? '?k='+key : ''),
  { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ jsonrpc:'2.0', id:1, method, params }) }));

const seed = async (exp = Date.now() + 3600e3) => { await getStore('whoop').setJSON(ID, { rt:'rt-0', at:'at-0', exp }); };
const stored = async () => getStore('whoop').get(ID, { type:'json' });

console.log('\n== protocol ==');
let r = await rpc('initialize', { protocolVersion:'2025-06-18' });
let j = await r.json();
ok('initialize returns serverInfo', j.result?.serverInfo?.name === 'iron-whoop', JSON.stringify(j));
ok('echoes client protocol version', j.result.protocolVersion === '2025-06-18');
ok('declares tools capability', !!j.result.capabilities?.tools);

j = await (await rpc('tools/list', {})).json();
ok('tools/list returns 5 tools', j.result?.tools?.length === 5, JSON.stringify(j.result?.tools?.map(t=>t.name)));
ok('every tool has inputSchema', j.result.tools.every(t => t.inputSchema?.type === 'object'));

r = await mcp(new Request('https://iron.example/api/whoop-mcp?k='+KEY, { method:'GET' }));
ok('GET is 405 with Allow', r.status === 405 && r.headers.get('Allow').includes('POST'));

r = await mcp(new Request('https://iron.example/api/whoop-mcp', { method:'POST', headers:{'Content-Type':'application/json'}, body:'{"jsonrpc":"2.0","id":1,"method":"ping"}' }));
ok('missing device key is 401', r.status === 401);

r = await mcp(new Request('https://iron.example/api/whoop-mcp?k='+KEY, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ jsonrpc:'2.0', method:'notifications/initialized' }) }));
ok('notification gets 202 no body', r.status === 202);

r = await mcp(new Request('https://iron.example/api/whoop-mcp?k='+KEY, { method:'POST', headers:{'Content-Type':'application/json'}, body:'not json' }));
j = await r.json();
ok('bad JSON is parse error', j.error?.code === -32700);

j = await (await rpc('tools/call', { name:'nope', arguments:{} })).json();
ok('unknown tool is invalid params', j.error?.code === -32602);

console.log('\n== header auth ==');
await seed();
r = await mcp(new Request('https://iron.example/api/whoop-mcp', { method:'POST', headers:{'Content-Type':'application/json','x-iron-key':KEY}, body: JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'whoop_body',arguments:{}}}) }));
j = await r.json();
ok('x-iron-key header works', JSON.parse(j.result.content[0].text).max_hr === 190, JSON.stringify(j));

console.log('\n== readiness math (mirrors IRON) ==');
await seed();
j = await (await rpc('tools/call', { name:'whoop_today', arguments:{} })).json();
const today = JSON.parse(j.result.content[0].text);
ok('recovery 70 is green before adjustment', today.latest.recovery === 70);
ok('HRV -15% vs baseline detected', today.latest.hrv_vs_baseline_pct === -15, String(today.latest.hrv_vs_baseline_pct));
ok('downgraded green -> yellow', today.latest.level === 'yellow', today.latest.level);
ok('adjustment is explained', today.latest.why.some(w=>/HRV 15% below/.test(w)), JSON.stringify(today.latest.why));
ok('baseline computed from 30d', today.latest.hrv_baseline_ms === 100, String(today.latest.hrv_baseline_ms));
ok('rhr delta is zero', today.latest.rhr_vs_baseline_bpm === 0);
ok('sleep attached', today.latest.sleep?.asleep_h === 7.5, String(today.latest.sleep?.asleep_h));
ok('sleep need totalled', today.latest.sleep?.need_h === 8.7, String(today.latest.sleep?.need_h));
ok('strain attached', today.latest.strain === 12.3);
ok('kcal from kJ', today.latest.kcal === 2000, String(today.latest.kcal));
ok('14-day window returned', today.last_14_days.length === 14, String(today.last_14_days.length));
ok('low streak counted', today.low_streak === 1, String(today.low_streak));

j = await (await rpc('tools/call', { name:'whoop_recovery', arguments:{ days: 30 } })).json();
const recov = JSON.parse(j.result.content[0].text);
ok('recovery series has summary', recov.summary.recovery.n > 0 && recov.summary.level_counts.green > 0, JSON.stringify(recov.summary.level_counts));

j = await (await rpc('tools/call', { name:'whoop_sleep', arguments:{ days: 14 } })).json();
ok('sleep tool summarizes nights', JSON.parse(j.result.content[0].text).summary.asleep_h.mean === 7.5);

j = await (await rpc('tools/call', { name:'whoop_strain', arguments:{ days: 500 } })).json();
ok('days param clamped, no crash', JSON.parse(j.result.content[0].text).summary.strain.mean === 12.3);

console.log('\n== the bug this change fixes ==');
await seed(Date.now() - 1000);            // expired -> forces a refresh
tokenMode = 'down';
j = await (await rpc('tools/call', { name:'whoop_today', arguments:{} })).json();
ok('5xx refresh reports isError', j.result.isError === true);
ok('5xx refresh KEEPS the grant', (await stored())?.rt === 'rt-0', JSON.stringify(await stored()));
ok('5xx message says still connected', /still in place/.test(j.result.content[0].text));

await seed(Date.now() - 1000);
tokenMode = 'ratelimit';
j = await (await rpc('tools/call', { name:'whoop_today', arguments:{} })).json();
ok('429 refresh KEEPS the grant', (await stored())?.rt === 'rt-0');

await seed(Date.now() - 1000);
tokenMode = 'badsecret';
j = await (await rpc('tools/call', { name:'whoop_today', arguments:{} })).json();
ok('bad client secret KEEPS the grant', (await stored())?.rt === 'rt-0');

await seed(Date.now() - 1000);
tokenMode = 'revoked';
j = await (await rpc('tools/call', { name:'whoop_today', arguments:{} })).json();
ok('invalid_grant DROPS the grant', (await stored()) === null, JSON.stringify(await stored()));
ok('invalid_grant tells user to reconnect', /Reconnect in IRON/.test(j.result.content[0].text));

console.log('\n== rotation persisted before use ==');
await seed(Date.now() - 1000);
tokenMode = 'ok'; tokenHits = 0;
await rpc('tools/call', { name:'whoop_today', arguments:{} });
const after = await stored();
ok('rotated refresh token stored', after.rt === 'rt-1', JSON.stringify(after));
ok('exactly one refresh for many pulls', tokenHits === 1, String(tokenHits));

console.log('\n== dashboard path (/api/whoop-data) ==');
await seed(Date.now() - 1000);
tokenMode = 'down';
r = await data(new Request('https://iron.example/api/whoop-data?days=90', { headers:{ 'x-iron-key': KEY } }));
ok('transient error is 502 not 401', r.status === 502, String(r.status));
ok('dashboard grant survives 5xx', (await stored())?.rt === 'rt-0');

await seed(Date.now() - 1000);
tokenMode = 'revoked';
r = await data(new Request('https://iron.example/api/whoop-data?days=90', { headers:{ 'x-iron-key': KEY } }));
ok('revoked grant is 401', r.status === 401);
ok('revoked grant is cleared', (await stored()) === null);

await seed();
tokenMode = 'ok';
r = await data(new Request('https://iron.example/api/whoop-data?days=90', { headers:{ 'x-iron-key': KEY } }));
j = await r.json();
ok('dashboard shape unchanged', r.status === 200 && j.connected === true && Array.isArray(j.records) && Array.isArray(j.sleeps) && Array.isArray(j.cycles) && j.body.maxhr === 190, JSON.stringify(Object.keys(j)));
ok('records keep legacy field names', j.records[0].rec !== undefined && j.records[0].hrv !== undefined && j.records[0].calibrating !== undefined);
ok('sleeps keep legacy field names', j.sleeps[0].perf !== undefined && j.sleeps[0].inBed !== undefined && j.sleeps[0].need !== undefined);
ok('cycles keep legacy field names', j.cycles[0].strain !== undefined && j.cycles[0].kj !== undefined && j.cycles[0].ahr !== undefined);

r = await data(new Request('https://iron.example/api/whoop-data', { headers:{ 'x-iron-key': 'short' } }));
ok('short key rejected 401', r.status === 401);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
