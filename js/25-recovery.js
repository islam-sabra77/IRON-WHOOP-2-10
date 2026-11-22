"use strict";
/* ---------- RECOVERY FOR EVERYONE ----------
   WHOOP, Oura, or no wearable at all: a 20-second morning check-in (sleep, how rested,
   soreness, energy, stress, optional resting heart rate) gives the same recovery score
   that sets the day's session. Apple Health, Health Connect and Garmin need the store apps. */

const recLive = () => !!((S.whoop && S.whoop.connected) || (S.oura && S.oura.connected));
const recName = () => (S.whoop && S.whoop.connected ? 'WHOOP' : S.oura && S.oura.connected ? 'Oura' : 'Check-in');

/* morning check-in score, 0-100, built like a wearable's recovery */
function checkinScore(q, d) {
  let sc = 70; const why = [];
  const sl = +q.sleep; sc += sl >= 8 ? 6 : sl >= 7 ? 0 : sl >= 6 ? -10 : sl >= 5 ? -20 : -30; if (sl < 7) why.push(`${sl} h sleep`);
  sc += { 1: -18, 2: -9, 3: 0, 4: 5, 5: 9 }[q.sq] || 0; if (q.sq <= 2) why.push('poor sleep');
  sc += { 1: 5, 2: 0, 3: -6, 4: -15, 5: -25 }[q.sore] || 0; if (q.sore >= 4) why.push('very sore'); else if (q.sore === 3) why.push('a bit sore');
  sc += { 1: -18, 2: -9, 3: 0, 4: 5, 5: 9 }[q.energy] || 0; if (q.energy <= 2) why.push('low energy');
  sc += { 1: 4, 2: 0, 3: -4, 4: -10, 5: -16 }[q.stress] || 0; if (q.stress >= 4) why.push('high stress');
  // resting heart rate against your own 14-day average from earlier check-ins
  if (q.rhr) { const prev = []; for (let i = 1; i <= 14; i++) { const x = (S.rcheck || {})[addD(d, -i)]; if (x && x.rhr) prev.push(+x.rhr); }
    if (prev.length >= 3) { const avg = prev.reduce((a, b) => a + b, 0) / prev.length, dv = q.rhr - avg; if (dv >= 5) { sc -= 12; why.push(`resting HR +${Math.round(dv)}`); } else if (dv >= 3) { sc -= 6; why.push(`resting HR +${Math.round(dv)}`); } else if (dv <= -3) sc += 4; } }
  sc = Math.max(1, Math.min(99, Math.round(sc)));
  return { score: sc, lvl: sc >= 67 ? 'g' : sc >= 34 ? 'y' : 'r', why };
}
function morningSheet(d) {
  const prev = (S.rcheck || {})[d] || {}, q = UI.mc = UI.mc && UI.mc.d === d ? UI.mc : Object.assign({ d, sleep: 7, sq: 3, sore: 2, energy: 3, stress: 2, rhr: '' }, prev);
  const r = checkinScore(q, d), c = { g: 'var(--ok)', y: 'var(--warn)', r: 'var(--bad)' }[r.lvl];
  const row = (f, l, labels) => `<label class="fl2">${l}</label><div class="obrow">${[1, 2, 3, 4, 5].map((v) => `<button class="obopt ${q[f] === v ? 'on' : ''}" data-a="mcset" data-f="${f}" data-v="${v}"><b>${v}</b><span>${labels[v - 1]}</span></button>`).join('')}</div>`;
  openSheet(`<h4 class="disp">Morning check-in</h4><p class="muted" style="font-size:14px;margin:0 0 6px">20 seconds, no wearable needed. It gives you a recovery score and sets today’s session.</p>
  <label class="fl2">Hours slept</label><div class="nstep"><button class="mini" data-a="mcsl" data-v="-0.5">−</button><b class="disp num mcsl">${q.sleep} h</b><button class="mini" data-a="mcsl" data-v="0.5">+</button></div>
  ${row('sq', 'How rested do you feel?', ['Wrecked', 'Tired', 'OK', 'Rested', 'Great'])}${row('sore', 'Muscle soreness', ['None', 'Slight', 'Some', 'Sore', 'Very'])}${row('energy', 'Energy', ['Drained', 'Low', 'OK', 'Good', 'Great'])}${row('stress', 'Stress', ['Calm', 'Low', 'Some', 'High', 'Very high'])}
  <label class="fl2">Resting heart rate (optional)</label><input id="mcrhr" inputmode="numeric" placeholder="e.g. 58 bpm, from any watch or a 60-second count on waking" value="${q.rhr || ''}">
  <div class="rcscore" style="--c:${c}">${ring(r.score / 100, c, 96, 11, r.score + '%')}<div><b class="disp" style="font-size:24px">${{ g: 'Ready to push', y: 'Train lighter', r: 'Recovery day' }[r.lvl]}</b><p style="font-size:14px;margin:4px 0 0">${r.why.length ? esc(r.why.join(', ')) + '. ' : ''}${{ g: 'Full session as planned.', y: 'One set fewer on accessories, main lifts stop 2 reps short, cardio stays easy.', r: 'Lifting off today: mobility, core and an easy walk.' }[r.lvl]}</p></div></div>
  <button class="cta" style="--c:${c}" data-a="mcsave">Save and set today</button><button class="cta ghost" data-a="close">Cancel</button>`);
}
function checkinSave() {
  const q = UI.mc, rv = (document.getElementById('mcrhr') || {}).value; q.rhr = rv ? Math.max(30, Math.min(120, parseInt(rv, 10) || 0)) || '' : '';
  const r = checkinScore(q, q.d);
  S.rcheck = S.rcheck || {}; S.rcheck[q.d] = { sore: q.sore, energy: q.energy, sleep: q.sleep, sq: q.sq, stress: q.stress, rhr: q.rhr || null, score: r.score, lvl: r.lvl, src: 'checkin' };
  S.ready[q.d] = r.lvl;
  // without a wearable the check-in becomes the day's recovery, for Home and the charts
  if (!recLive()) S.wdata[q.d] = Object.assign({}, S.wdata[q.d] || {}, { rec: r.score, rhr: q.rhr || null, sleep: { dur: q.sleep, perf: q.sq * 20 }, src: 'checkin' });
  UI.mc = null; save(); closeSheet(); rerender(); toast(`Recovery ${r.score}%: ` + { g: 'full session', y: 'lighter day', r: 'recovery only' }[r.lvl]);
}

/* ---------- Oura ---------- */
async function ouraSync(force) {
  S.oura = S.oura || {}; if (!WH_ON || !(S.oura.connected || S.oura.pending)) return;
  if (!force && !S.oura.pending && Date.now() - (S.oura.last || 0) < 20 * 60 * 1000) return;
  try { const r = await fetch('/api/oura-data?days=90', { cache: 'no-store', headers: { 'x-iron-key': wKey() } });
    if (r.status === 401) { if (S.oura.pending && Date.now() - S.oura.pending > 15 * 60 * 1000) { S.oura.pending = 0; save(); } if (S.oura.connected) { S.oura.connected = false; save(); rerender(); toast('Oura disconnected. Reconnect in Settings.'); } return; }
    if (!r.ok) { if (force) toast('Oura sync failed. Try again in a minute.'); return; }
    const j = await r.json(), wasNew = !S.oura.connected; S.oura.connected = true; S.oura.pending = 0; S.oura.last = Date.now(); if (S.oura.auto == null) S.oura.auto = true;
    if (!(S.whoop && S.whoop.connected)) (j.records || []).forEach((x) => { if (x.rec == null) return; S.wdata[x.d] = { rec: x.rec, hrv: x.hrv, rhr: x.rhr, sleep: x.dur != null || x.perf != null ? { dur: x.dur, perf: x.perf, bed: x.bed, wake: x.wake } : null, src: 'oura' }; });
    save(); rerender(); if (wasNew) toast('Oura connected'); else if (force) toast('Oura synced');
  } catch (e) { if (force) toast('Couldn’t reach Oura'); }
}
/* back from the Oura login */
(function () { try { const p = new URLSearchParams(location.search), o = p.get('oura'); if (!o) return;
  S.oura = S.oura || {}; if (o === 'connected') { S.oura.pending = Date.now(); save(); setTimeout(() => ouraSync(true), 300); } else setTimeout(() => toast('Oura didn’t connect' + (p.get('reason') ? ': ' + p.get('reason').replace(/_/g, ' ') : '')), 400);
  p.delete('oura'); p.delete('reason'); history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : '')); } catch (e) { /* no history API */ } })();

/* ---------- Settings: where recovery comes from ---------- */
function recSourceCard() {
  const o = S.oura || {}, src = recName();
  const soon = (n, why) => `<div class="srcrow off"><span><b>${n}</b><small>${why}</small></span><em>Coming</em></div>`;
  return `<div class="card" id="set-rec" style="margin-top:12px"><h4 class="disp" style="font-size:22px">Recovery source</h4>
  <p class="muted" style="font-size:14px;margin:0 0 8px">Today’s session follows your recovery. Now using: <b>${src === 'Check-in' ? 'morning check-in (no wearable)' : src}</b>.</p>
  <div class="srcrow ${S.whoop && S.whoop.connected ? 'on' : ''}"><span><b>WHOOP</b><small>${S.whoop && S.whoop.connected ? 'Connected' : 'Connect in the WHOOP section above'}</small></span></div>
  <div class="srcrow ${o.connected ? 'on' : ''}"><span><b>Oura</b><small>${!WH_ON ? 'Works once IRON is online' : o.connected ? 'Connected · last sync ' + (o.last ? new Date(o.last).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : 'never') : o.pending ? 'Waiting for Oura approval' : 'Readiness, HRV, resting HR and sleep'}</small></span>
  ${!WH_ON ? '' : o.connected ? `<button class="mini" data-a="osync">Sync</button><button class="mini" style="color:var(--bad)" data-a="odisconnect">Disconnect</button>` : `<button class="mini p" data-a="oconnect">${o.pending ? 'Check' : 'Connect'}</button>`}</div>
  <div class="srcrow ${!recLive() ? 'on' : ''}"><span><b>No wearable: morning check-in</b><small>Sleep, how rested, soreness, energy, stress and optional resting heart rate</small></span><button class="mini" data-a="rcopen">Check in</button></div>
  ${soon('Apple Health (iPhone, Apple Watch)', 'Comes with the App Store app')}${soon('Health Connect (Android, Galaxy Watch, Fitbit)', 'Comes with the Play Store app')}${soon('Garmin', 'Needs Garmin developer-program approval')}</div>`;
}

document.addEventListener('click', (ev) => { const el = ev.target.closest('[data-a]'); if (!el) return; const a = el.dataset.a;
  if (a === 'mcset' && UI.mc) { UI.mc.rhr = (document.getElementById('mcrhr') || {}).value || UI.mc.rhr; UI.mc[el.dataset.f] = +el.dataset.v; morningSheet(UI.mc.d); }
  if (a === 'mcsl' && UI.mc) { UI.mc.rhr = (document.getElementById('mcrhr') || {}).value || UI.mc.rhr; UI.mc.sleep = Math.max(2, Math.min(12, UI.mc.sleep + +el.dataset.v)); morningSheet(UI.mc.d); }
  if (a === 'mcsave' && UI.mc) checkinSave();
  if (a === 'oconnect') { S.oura = S.oura || {}; if (S.oura.pending) { ouraSync(true); return; } S.oura.pending = Date.now(); save(); location.href = '/api/oura-login?k=' + wKey(); }
  if (a === 'osync') ouraSync(true);
  if (a === 'recsrc') { settingsSheet(); setTimeout(() => { const c = document.getElementById('set-rec'); c && c.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 120); }
  if (a === 'odisconnect') { (async () => { try { await fetch('/api/oura-data', { method: 'DELETE', headers: { 'x-iron-key': wKey() } }); } catch (e) { /* offline: forget locally */ } S.oura = { connected: false }; save(); closeSheet(); rerender(); toast('Oura disconnected'); })(); } });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.oura && (S.oura.connected || S.oura.pending)) ouraSync(false); });
setTimeout(() => { if (S.oura && (S.oura.connected || S.oura.pending)) ouraSync(false); }, 1500);
