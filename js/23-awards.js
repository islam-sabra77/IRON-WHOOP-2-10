"use strict";
/* ---------- ACHIEVEMENTS ----------
   Badges are worked out from what is already logged, so nothing extra to track.
   The first time one is earned it is dated and celebrated. A weekly goal card on Home,
   streaks, and a shareable monthly recap keep the momentum going. */

/* a week counts toward the streak when you did your planned sessions (up to 4) */
function awWeekOK(ws) { let plan = 0, done = 0; for (let i = 0; i < 7; i++) { const d = addD(ws, i); if (isTraining(tplOf(d))) plan++; if (S.done[d]) done++; } return done >= Math.max(1, Math.min(4, plan)); }
function awStreaks() {
  const t = todayS(); let cur = 0, best = 0, run = 0, w = sunOf(S.start);
  const thisW = sunOf(t);
  for (; w <= thisW; w = addD(w, 7)) { if (awWeekOK(w)) { run++; best = Math.max(best, run); } else if (w !== thisW) run = 0; }
  // current: count back from last week (this week still in progress counts once it is reached)
  let c = awWeekOK(thisW) ? 1 : 0; w = addD(thisW, -7);
  while (w >= sunOf(S.start) && awWeekOK(w)) { c++; w = addD(w, -7); }
  cur = c; return { cur, best: Math.max(best, cur) };
}
/* every personal record ever set: a lift's best estimated 1-rep max going up */
function awPRs() {
  const h = hist(), out = [];
  Object.keys(h).forEach((ex) => { if (!E[ex] || E[ex].bw || E[ex].t) return; let best = 0;
    h[ex].forEach((s) => { const v = Math.max(...s.sets.map((q) => e1rm(+q.w, +q.r))); if (best && v > best * 1.005) out.push({ ex, d: s.d, e1: Math.round(v), up: Math.round(v - best) }); best = Math.max(best, v); }); });
  return out.sort((a, b) => (a.d < b.d ? -1 : 1));
}
let AWC = null;
function awStats() {
  if (AWC && AWC.k === JSON.stringify([Object.keys(S.logs).length, Object.keys(S.done).length, S.injuries && S.injuries.length, Object.keys(S.food || {}).length, Object.keys(S.rcheck || {}).length, todayS()])) return AWC.v;
  const t = todayS(), days = Object.keys(S.done).filter((d) => S.done[d] && d <= t);
  let vol = 0, mob = 0, st = 0, wu = 0, early = 0;
  Object.keys(S.logs).forEach((d) => { const l = S.logs[d];
    Object.keys(l).forEach((k) => { if (k[0] === '_' || !l[k] || !l[k].sets) return; const e = E[l[k].ex]; if (!e || e.bw || e.t) return; l[k].sets.forEach((q) => { if (q.d) vol += (+q.w || 0) * (+q.r || 0); }); });
    Object.keys(l._x || {}).forEach((k) => { if (k[0] === 'm') mob++; else if (k[0] === 'z') st++; else if (k[0] === 'w') wu++; });
    if (l._t0 && S.done[d] && new Date(l._t0).getHours() < 7) early++; });
  // supplements: longest run of days with every supplement taken
  let supRun = 0, supBest = 0; if (S.supps.length) { const ds = Object.keys(S.suppLog || {}).sort(); let prev = null;
    ds.forEach((d) => { const all = S.supps.every((s) => S.suppLog[d][s.id]); if (!all) { supRun = 0; prev = d; return; } supRun = prev && addD(prev, 1) === d && supRun ? supRun + 1 : 1; prev = d; supBest = Math.max(supBest, supRun); }); }
  let habits = 0; Object.values(S.habitLog || {}).forEach((x) => { if (x && typeof x === 'object') habits += Object.values(x).filter(Boolean).length; });
  let protDays = 0; if (typeof nutDay === 'function') Object.keys(S.food || {}).forEach((d) => { try { if (nutDay(d).p >= nutTargets(d).prot) protDays++; } catch (e) { /* no targets yet */ } });
  let deload = 0; { const seen = new Set(); days.forEach((d) => { if (phaseOf(d).deload) seen.add(sunOf(d)); }); deload = seen.size; }
  const v = { sessions: days.length, streak: awStreaks(), prs: awPRs(), vol, mob, st, wu, early, supBest, habits, protDays, exercises: Object.keys(hist()).length, deload,
    healed: (typeof injList === 'function' ? injList() : []).filter((x) => x.to && x.to <= t).length, checks: Object.keys(S.rcheck || {}).length };
  AWC = { k: JSON.stringify([Object.keys(S.logs).length, Object.keys(S.done).length, S.injuries && S.injuries.length, Object.keys(S.food || {}).length, Object.keys(S.rcheck || {}).length, todayS()]), v };
  return v;
}
/* id: [emoji, name, how to earn, value(stats), target] */
const BADGES = [
  ['first', '🏁', 'First rep', 'Finish your first session', (s) => s.sessions, 1],
  ['s10', '💪', 'Getting going', 'Finish 10 sessions', (s) => s.sessions, 10],
  ['s25', '🔩', 'Regular', 'Finish 25 sessions', (s) => s.sessions, 25],
  ['s50', '⚙️', 'Committed', 'Finish 50 sessions', (s) => s.sessions, 50],
  ['s100', '🛡️', 'Iron will', 'Finish 100 sessions', (s) => s.sessions, 100],
  ['s250', '👑', 'Legend', 'Finish 250 sessions', (s) => s.sessions, 250],
  ['w4', '🔥', 'On fire', 'A 4-week streak', (s) => s.streak.best, 4],
  ['w8', '🔥', 'Unstoppable', 'An 8-week streak', (s) => s.streak.best, 8],
  ['w12', '🌋', 'Full cycle', 'A 12-week streak', (s) => s.streak.best, 12],
  ['w26', '☄️', 'Half a year', 'A 26-week streak', (s) => s.streak.best, 26],
  ['pr1', '🏆', 'First record', 'Set a personal record', (s) => s.prs.length, 1],
  ['pr10', '🥇', 'Record breaker', 'Set 10 personal records', (s) => s.prs.length, 10],
  ['pr50', '🚀', 'Record machine', 'Set 50 personal records', (s) => s.prs.length, 50],
  ['v10', '🏋️', '10 tonnes', 'Lift 10,000 kg in total', (s) => Math.floor(s.vol / 1000), 10],
  ['v100', '🦍', '100 tonnes', 'Lift 100,000 kg in total', (s) => Math.floor(s.vol / 1000), 100],
  ['v1000', '🌍', '1,000 tonnes', 'Lift 1,000,000 kg in total', (s) => Math.floor(s.vol / 1000), 1000],
  ['mob', '🧘', 'Mobile', 'Do 25 mobility drills', (s) => s.mob, 25],
  ['str', '🤸', 'Flexible', 'Do 25 cool-down stretches', (s) => s.st, 25],
  ['wu', '♨️', 'Warmed up', 'Do 25 warm-up drills', (s) => s.wu, 25],
  ['ex', '🧭', 'Explorer', 'Log 25 different exercises', (s) => s.exercises, 25],
  ['sup', '💊', 'Stacked', '7 days in a row with every supplement', (s) => s.supBest, 7],
  ['hab', '✅', 'Habit builder', '30 habit check-ins', (s) => s.habits, 30],
  ['prot', '🥩', 'Protein pro', 'Hit your protein target on 7 days', (s) => s.protDays, 7],
  ['early', '🌅', 'Early bird', 'Start 5 sessions before 7 am', (s) => s.early, 5],
  ['deload', '🔋', 'Smart recovery', 'Train through a deload week', (s) => s.deload, 1],
  ['heal', '❤️‍🩹', 'Comeback', 'Mark an injury healed', (s) => s.healed, 1],
  ['check', '🧠', 'Self-aware', 'Do 10 readiness checks', (s) => s.checks, 10],
];
function awList() { const s = awStats(), got = S.badges || {}; return BADGES.map(([id, e, n, how, f, target]) => { const v = Math.min(target, f(s)); return { id, e, n, how, v, target, earned: got[id] || (v >= target ? todayS() : null) }; }); }
/* date new badges and celebrate them; the very first check dates them quietly */
function awardsAfter() {
  if (!Object.keys(S.done).length && !S.badges) return;
  const first = !S.badges; S.badges = S.badges || {};
  const fresh = awList().filter((b) => b.v >= b.target && !S.badges[b.id]);
  if (!fresh.length) return;
  fresh.forEach((b) => { S.badges[b.id] = todayS(); });
  save();
  if (first) { if (fresh.length) toast(`${fresh.length} badge${fresh.length > 1 ? 's' : ''} unlocked from your training so far`); return; }
  awCelebrate(fresh);
}
function awCelebrate(list) {
  let el = document.getElementById('awburst'); if (el) el.remove();
  el = document.createElement('div'); el.id = 'awburst'; el.className = 'awburst'; el.setAttribute('role', 'status');
  const b = list[0];
  el.innerHTML = `<div class="awcard"><div class="awe">${b.e}</div><small>Badge unlocked</small><b class="disp">${esc(b.n)}</b><span>${esc(b.how)}${list.length > 1 ? ` · +${list.length - 1} more` : ''}</span></div>`;
  el.addEventListener('click', () => { el.remove(); UI.tab = 'awards'; rerender(); });
  document.body.appendChild(el); setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3100);
  try { navigator.vibrate && navigator.vibrate([30, 40, 60]); } catch (e) { /* no vibration */ }
}
/* the next badge you are closest to */
function awNext() { return awList().filter((b) => !b.earned && b.v > 0).sort((a, b) => b.v / b.target - a.v / a.target)[0] || awList().find((b) => !b.earned); }

/* ---------- this week on Home ---------- */
function weekCard() {
  const t = todayS(), ws = sunOf(t), days = [...Array(7)].map((_, i) => addD(ws, i));
  const plan = days.filter((d) => isTraining(tplOf(d))), done = plan.filter((d) => S.done[d]).length, goal = Math.max(1, plan.length);
  const st = awStats().streak, nx = awNext(), c = done >= goal ? 'var(--ok)' : 'var(--lower)';
  const dots = days.map((d) => `<i class="${S.done[d] ? 'on' : isTraining(tplOf(d)) ? 'pl' : ''} ${d === t ? 'tdy' : ''}" title="${short(d)}"></i>`).join('');
  return `<section class="card wkcard" aria-label="This week"><div class="wkring">${ring(done / goal, c, 78, 9, done + '/' + goal)}</div>
  <div class="wktx"><b>${done >= goal ? 'Weekly goal hit 🎉' : `${goal - done} session${goal - done > 1 ? 's' : ''} to your weekly goal`}</b>
  <span>${st.cur ? `🔥 ${st.cur}-week streak` : 'Start a streak this week'}${st.best > st.cur ? ` · best ${st.best}` : ''}</span><div class="wkdots" aria-hidden="true">${dots}</div>
  ${nx ? `<button class="wknext" data-a="tab" data-v="awards"><span>${nx.e} Next: <b>${esc(nx.n)}</b> ${nx.v}/${nx.target}</span><span class="wkbar"><i style="width:${Math.round(nx.v / nx.target * 100)}%"></i></span></button>` : ''}</div></section>`;
}

/* ---------- monthly recap ---------- */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function monthStats(ym) {
  const [y, m] = ym.split('-').map(Number), from = ym + '-01', to = ds(new Date(y, m, 0));
  const inM = (d) => d >= from && d <= to;
  const sessions = Object.keys(S.done).filter((d) => S.done[d] && inM(d)).length;
  let vol = 0, sets = 0, mins = 0, mob = 0, st = 0;
  Object.keys(S.logs).filter(inM).forEach((d) => { const l = S.logs[d];
    Object.keys(l).forEach((k) => { if (k[0] === '_' || !l[k] || !l[k].sets) return; const e = E[l[k].ex]; l[k].sets.forEach((q) => { if (q.d) { sets++; if (e && !e.bw && !e.t) vol += (+q.w || 0) * (+q.r || 0); } }); });
    Object.keys(l._x || {}).forEach((k) => { if (k[0] === 'm') mob++; else if (k[0] === 'z') st++; });
    if (l._t0 && S.done[d] && S.done[d].t > l._t0 && S.done[d].t - l._t0 < 4 * 36e5) mins += Math.round((S.done[d].t - l._t0) / 6e4); });
  const prs = awPRs().filter((p) => inM(p.d)), top = prs.slice().sort((a, b) => b.up - a.up)[0];
  const badges = Object.keys(S.badges || {}).filter((k) => inM(S.badges[k])).map((k) => BADGES.find((b) => b[0] === k)).filter(Boolean);
  const wv = Object.keys(S.wdata || {}).filter(inM).map((d) => S.wdata[d].rec).filter((x) => x != null), rec = wv.length ? Math.round(wv.reduce((a, b) => a + b, 0) / wv.length) : null;
  return { ym, label: MONTHS[m - 1] + ' ' + y, sessions, vol, sets, mins, mob, st, prs, top, badges, rec };
}
function recapCanvas(M) {
  const W2 = 1080, H = 1350, cv = document.createElement('canvas'), x = cv.getContext('2d'), F = 'Archivo,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
  cv.width = W2; cv.height = H;
  const g = x.createLinearGradient(0, 0, W2, H); g.addColorStop(0, '#2F5BFF'); g.addColorStop(.55, '#191A4A'); g.addColorStop(1, '#0E0F2E'); x.fillStyle = g; x.fillRect(0, 0, W2, H);
  x.globalAlpha = .25; x.fillStyle = '#FF6A13'; x.beginPath(); x.arc(W2 - 80, 120, 260, 0, 7); x.fill(); x.globalAlpha = 1;
  x.fillStyle = '#fff'; x.font = '900 40px ' + F; x.fillText('IRON', 72, 96);
  x.font = '700 34px ' + F; x.globalAlpha = .8; x.fillText('Monthly recap', 72, 190); x.globalAlpha = 1;
  x.font = '900 96px ' + F; x.fillText(M.label, 72, 290);
  const tiles = [[String(M.sessions), 'Sessions'], [M.vol >= 1000 ? (M.vol / 1000).toFixed(1) + ' t' : Math.round(M.vol) + ' kg', 'Lifted'], [String(M.prs.length), 'Personal records'], [M.mins ? Math.round(M.mins / 60) + ' h' : String(M.sets), M.mins ? 'Training time' : 'Sets'], [String(M.mob + M.st), 'Mobility & stretches'], [M.rec != null ? M.rec + '%' : String(M.badges.length), M.rec != null ? 'Avg recovery' : 'Badges']];
  const tw = (W2 - 144 - 30) / 2;
  tiles.forEach((tl, i) => { const tx = 72 + (i % 2) * (tw + 30), ty = 360 + Math.floor(i / 2) * 200;
    x.fillStyle = 'rgba(255,255,255,.1)'; x.beginPath(); x.roundRect ? x.roundRect(tx, ty, tw, 170, 32) : x.rect(tx, ty, tw, 170); x.fill();
    x.fillStyle = '#fff'; x.font = '900 72px ' + F; x.fillText(tl[0], tx + 36, ty + 92); x.font = '600 30px ' + F; x.globalAlpha = .75; x.fillText(tl[1], tx + 36, ty + 140); x.globalAlpha = 1; });
  let y = 1000;
  if (M.top) { x.fillStyle = '#FFB020'; x.font = '800 30px ' + F; x.fillText('BIGGEST JUMP', 72, y); y += 52; x.fillStyle = '#fff'; x.font = '800 44px ' + F; x.fillText(`${E[M.top.ex].n.slice(0, 34)}  +${M.top.up} kg`, 72, y); y += 70; }
  if (M.badges.length) { x.fillStyle = '#FFB020'; x.font = '800 30px ' + F; x.fillText('BADGES UNLOCKED', 72, y); y += 60; x.font = '56px ' + F; x.fillText(M.badges.slice(0, 10).map((b) => b[1]).join(' '), 72, y); }
  x.fillStyle = 'rgba(255,255,255,.6)'; x.font = '600 28px ' + F; x.fillText('Train with your recovery', 72, H - 60);
  return cv;
}
function recapSheet(ym) {
  const M = monthStats(ym), cv = recapCanvas(M), url = cv.toDataURL('image/png'); UI.recap = ym;
  if (S.recapSeen !== ym) { S.recapSeen = ym; save(); }
  openSheet(`<h4 class="disp">${esc(M.label)} recap</h4><img src="${url}" alt="${esc(M.label)} recap" style="width:100%;border-radius:18px">
  <button class="cta" style="--c:var(--upper)" data-a="recapshare">Share</button><a class="cta ghost" style="text-decoration:none;margin-top:8px" href="${url}" download="iron-${ym}.png">Save image</a><button class="cta ghost" data-a="close">Close</button>`);
}
async function recapShare() { const ym = UI.recap; if (!ym) return; const M = monthStats(ym); recapCanvas(M).toBlob(async (b) => {
  try { const f = new File([b], `iron-${ym}.png`, { type: 'image/png' }); const text = `${M.label} on IRON: ${M.sessions} sessions, ${M.prs.length} personal records.`;
    if (navigator.canShare && navigator.canShare({ files: [f] })) await navigator.share({ files: [f], title: 'My IRON month', text }); else if (navigator.share) await navigator.share({ title: 'My IRON month', text });
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = f.name; a.click(); toast('Image saved'); } } catch (e) { if (e && e.name !== 'AbortError') toast('Sharing isn’t available here. Use Save image.'); } }, 'image/png'); }
const ymOf = (d) => d.slice(0, 7), prevYm = (t) => { const [y, m] = t.split('-').map(Number); return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`; };
/* a Home banner during the first week of a month, until the recap is opened */
function recapBanner() { const t = todayS(); if (+t.slice(8) > 7) return ''; const ym = prevYm(t); if (S.recapSeen === ym) return ''; const M = monthStats(ym); if (!M.sessions) return '';
  return `<button class="note recapnote" data-a="recap" data-v="${ym}"><b>🎉 Your ${MONTHS[+ym.slice(5) - 1]} recap is ready.</b> ${M.sessions} sessions, ${M.prs.length} records. Tap to see and share ›</button>`; }

/* ---------- the Achievements page ---------- */
function renderAwards() {
  const s = awStats(), L = awList(), got = L.filter((b) => b.earned), t = todayS();
  const months = []; { let ym = ymOf(t); for (let i = 0; i < 12; i++) { if (ym < ymOf(S.start) && i > 0) break; months.push(ym); ym = prevYm(ym + '-01'); } }
  const recaps = months.map(monthStats).filter((m) => m.sessions || m.ym === ymOf(t)).slice(0, 6);
  const stat = (v, l) => `<div class="stat"><b class="disp num">${v}</b><span>${l}</span></div>`;
  document.getElementById('view').innerHTML = `<h2 class="pagetitle disp">Achievements</h2>
  <div class="grid2 awstats">${stat(s.sessions, 'sessions')}${stat((s.streak.cur ? '🔥 ' : '') + s.streak.cur + ' wk', `streak · best ${s.streak.best}`)}${stat(s.prs.length, 'personal records')}${stat((s.vol / 1000).toFixed(s.vol < 10000 ? 1 : 0) + ' t', 'lifted in total')}</div>
  ${weekCard()}
  <h3 class="hg-sec">Monthly recaps</h3><div class="awrecaps">${recaps.map((m) => `<button class="awrecap" data-a="recap" data-v="${m.ym}"><b>${esc(m.label)}</b><span>${m.sessions} sessions · ${m.prs.length} PRs</span><em>${m.ym === ymOf(t) ? 'So far ›' : 'Open ›'}</em></button>`).join('')}</div>
  <h3 class="hg-sec">Badges <span class="muted" style="font-weight:600">${got.length} of ${L.length}</span></h3>
  <div class="awgrid">${L.map((b) => `<div class="awb ${b.earned ? 'on' : ''}" title="${esc(b.how)}"><div class="awe">${b.e}</div><b>${esc(b.n)}</b><small>${b.earned ? 'Earned ' + short(b.earned) : esc(b.how)}</small>${b.earned ? '' : `<span class="wkbar"><i style="width:${Math.round(b.v / b.target * 100)}%"></i></span><small class="num">${b.v}/${b.target}</small>`}</div>`).join('')}</div>`;
}
document.addEventListener('click', (ev) => { const el = ev.target.closest('[data-a]'); if (!el) return; const a = el.dataset.a;
  if (a === 'recap') recapSheet(el.dataset.v);
  if (a === 'recapshare') recapShare(); });
if (typeof SYNC_DICTS === 'object' && !SYNC_DICTS.includes('badges')) SYNC_DICTS.push('badges');
