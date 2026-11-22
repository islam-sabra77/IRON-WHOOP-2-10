"use strict";
/* ---------- NUTRITION: calories, protein, carbs and fat ----------
   Log by meal from a built-in food list, a search of Open Food Facts, a barcode scan,
   a meal photo (estimated by Claude), recent foods or by hand. Daily targets come from your
   body, goal and training day, and a one-day meal plan can be generated to hit them. */

/* built-in foods, per 100 g: [name, kcal, protein, carbs, fat, usual serving g, serving label, group, vegetarian] */
const FOOD_DB_RAW = [
  ['Chicken breast, cooked', 165, 31, 0, 3.6, 150, '1 breast', 'protein', 0], ['Chicken thigh, cooked', 209, 26, 0, 11, 120, '1 thigh', 'protein', 0],
  ['Turkey breast, cooked', 135, 30, 0, 1, 120, 'portion', 'protein', 0], ['Lean beef mince 5%, cooked', 170, 26, 0, 7, 125, 'portion', 'protein', 0],
  ['Beef steak, cooked', 210, 28, 0, 10, 200, '1 steak', 'protein', 0], ['Lamb, cooked', 258, 25, 0, 17, 120, 'portion', 'protein', 0],
  ['Salmon, cooked', 206, 22, 0, 12, 150, '1 fillet', 'protein', 0], ['White fish (cod), cooked', 105, 23, 0, 0.9, 150, '1 fillet', 'protein', 0],
  ['Tuna, canned in water', 116, 26, 0, 1, 112, '1 can', 'protein', 0], ['Shrimp, cooked', 99, 24, 0.2, 0.3, 100, 'portion', 'protein', 0],
  ['Egg, whole', 143, 12.6, 0.7, 9.5, 50, '1 large egg', 'protein', 1], ['Egg whites', 52, 11, 0.7, 0.2, 100, '3 whites', 'protein', 1],
  ['Greek yogurt, 0%', 59, 10, 3.6, 0.4, 200, '1 pot', 'dairy', 1], ['Greek yogurt, full fat', 97, 9, 4, 5, 170, '1 pot', 'dairy', 1],
  ['Cottage cheese', 98, 11, 3.4, 4.3, 200, 'half tub', 'dairy', 1], ['Milk, semi-skimmed', 47, 3.4, 4.8, 1.7, 250, '1 glass', 'dairy', 1],
  ['Cheddar cheese', 403, 25, 1.3, 33, 30, '1 slice', 'dairy', 1], ['Halloumi', 321, 21, 2, 25, 50, '2 slices', 'dairy', 1],
  ['Labneh', 160, 6, 4, 13, 50, '2 tbsp', 'dairy', 1], ['Whey protein powder', 390, 78, 8, 6, 30, '1 scoop', 'protein', 1],
  ['Tofu, firm', 144, 15.7, 3.5, 8.7, 150, 'half block', 'protein', 1], ['Lentils, cooked', 116, 9, 20, 0.4, 200, '1 cup', 'carb', 1],
  ['Chickpeas, cooked', 164, 8.9, 27, 2.6, 160, '1 cup', 'carb', 1], ['Hummus', 166, 8, 14, 9.6, 60, '4 tbsp', 'fat', 1],
  ['Falafel', 333, 13, 32, 18, 85, '3 pieces', 'carb', 1], ['Ful medames', 110, 7.6, 18, 0.5, 200, '1 bowl', 'carb', 1],
  ['White rice, cooked', 130, 2.7, 28, 0.3, 180, '1 cup', 'carb', 1], ['Brown rice, cooked', 123, 2.7, 26, 1, 180, '1 cup', 'carb', 1],
  ['Basmati rice, cooked', 121, 3.5, 25, 0.4, 180, '1 cup', 'carb', 1], ['Pasta, cooked', 158, 5.8, 31, 0.9, 200, '1 plate', 'carb', 1],
  ['Oats', 389, 17, 66, 7, 60, '2/3 cup', 'carb', 1], ['Wholemeal bread', 247, 13, 41, 3.4, 40, '1 slice', 'carb', 1],
  ['White bread', 265, 9, 49, 3.2, 35, '1 slice', 'carb', 1], ['Pita / Arabic bread', 275, 9, 56, 1.2, 60, '1 loaf', 'carb', 1],
  ['Potato, boiled', 87, 1.9, 20, 0.1, 200, '1 medium', 'carb', 1], ['Sweet potato, baked', 90, 2, 21, 0.2, 150, '1 medium', 'carb', 1],
  ['Quinoa, cooked', 120, 4.4, 21, 1.9, 185, '1 cup', 'carb', 1], ['Bulgur, cooked', 83, 3.1, 19, 0.2, 180, '1 cup', 'carb', 1],
  ['Couscous, cooked', 112, 3.8, 23, 0.2, 160, '1 cup', 'carb', 1], ['Rice cakes', 387, 8, 81, 2.8, 18, '2 cakes', 'carb', 1],
  ['Granola', 471, 10, 64, 20, 50, 'half cup', 'carb', 1], ['Banana', 89, 1.1, 23, 0.3, 120, '1 medium', 'fruit', 1],
  ['Apple', 52, 0.3, 14, 0.2, 180, '1 medium', 'fruit', 1], ['Orange', 47, 0.9, 12, 0.1, 150, '1 medium', 'fruit', 1],
  ['Berries, mixed', 50, 0.7, 12, 0.3, 125, '1 cup', 'fruit', 1], ['Dates', 282, 2.5, 75, 0.4, 24, '3 dates', 'fruit', 1],
  ['Grapes', 69, 0.7, 18, 0.2, 150, '1 cup', 'fruit', 1], ['Mango', 60, 0.8, 15, 0.4, 165, '1 cup', 'fruit', 1],
  ['Watermelon', 30, 0.6, 8, 0.2, 280, '1 slice', 'fruit', 1], ['Broccoli', 35, 2.4, 7, 0.4, 150, '1 cup', 'veg', 1],
  ['Mixed salad', 20, 1.2, 3.5, 0.2, 100, '1 bowl', 'veg', 1], ['Spinach', 23, 2.9, 3.6, 0.4, 60, '2 cups', 'veg', 1],
  ['Cucumber', 15, 0.7, 3.6, 0.1, 150, '1 medium', 'veg', 1], ['Tomato', 18, 0.9, 3.9, 0.2, 120, '1 medium', 'veg', 1],
  ['Mixed vegetables, cooked', 65, 2.6, 13, 0.3, 150, '1 cup', 'veg', 1], ['Avocado', 160, 2, 9, 15, 75, 'half', 'fat', 1],
  ['Olive oil', 884, 0, 0, 100, 10, '1 tbsp', 'fat', 1], ['Peanut butter', 588, 25, 20, 50, 16, '1 tbsp', 'fat', 1],
  ['Almonds', 579, 21, 22, 50, 28, 'a handful', 'fat', 1], ['Walnuts', 654, 15, 14, 65, 28, 'a handful', 'fat', 1],
  ['Tahini', 595, 17, 21, 54, 15, '1 tbsp', 'fat', 1], ['Dark chocolate 70%', 598, 7.8, 46, 43, 20, '2 squares', 'snack', 1],
  ['Protein bar', 370, 33, 38, 11, 60, '1 bar', 'snack', 1], ['Honey', 304, 0.3, 82, 0, 21, '1 tbsp', 'snack', 1],
  ['Orange juice', 45, 0.7, 10, 0.2, 250, '1 glass', 'drink', 1], ['Coffee with milk', 30, 1.6, 2.4, 1.5, 250, '1 cup', 'drink', 1],
  ['Shawarma wrap, chicken', 220, 13, 20, 10, 300, '1 wrap', 'meal', 0], ['Kabsa / mandi, chicken', 170, 10, 20, 5.5, 400, '1 plate', 'meal', 0],
  ['Burger, beef', 254, 13, 24, 12, 220, '1 burger', 'meal', 0], ['Pizza, margherita', 266, 11, 33, 10, 107, '1 slice', 'meal', 1],
  ['Sushi, salmon roll', 150, 6, 28, 2.5, 200, '8 pieces', 'meal', 0], ['Fries', 312, 3.4, 41, 15, 117, 'medium', 'snack', 1],
];
const FOOD_DB = FOOD_DB_RAW.map(([n, kcal, p, c, f, g, label, grp, veg], i) => ({ id: 'b' + i, name: n, per100: { kcal, p, c, f }, serving: { g, label: `${label} (${g} g)` }, grp, veg: !!veg }));
const MEALS = [['b', 'Breakfast', '🌅'], ['l', 'Lunch', '☀️'], ['d', 'Dinner', '🌙'], ['s', 'Snacks', '🍎']];
const mealNow = () => { const h = new Date().getHours(); return h < 11 ? 'b' : h < 16 ? 'l' : h < 21 ? 'd' : 's'; };
const scaled = (it, g) => { const k = g / 100, P = it.per100; return { kcal: Math.round(P.kcal * k), p: Math.round(P.p * k * 10) / 10, cb: Math.round(P.c * k * 10) / 10, f: Math.round(P.f * k * 10) / 10 }; };

/* targets: calories and protein from nutTargets, fat 27% of calories (at least 0.7 g/kg), carbs fill the rest */
function nutMacros(d) {
  const tg = nutTargets(d), a = (S.prof && S.prof.ans) || {}, w = (lastVal('weight', d) || {}).v || (+a.weight) || 75;
  const fat = Math.round(Math.max(0.7 * w, tg.kcal * 0.27 / 9)), carb = Math.max(0, Math.round((tg.kcal - tg.prot * 4 - fat * 9) / 4));
  return Object.assign({}, tg, { fat, carb });
}
function nutTot(d) { const l = (S.food || {})[d] || []; const s = (k) => Math.round(l.reduce((a, x) => a + (+x[k] || 0), 0) * 10) / 10; return { kcal: Math.round(s('c')), p: s('p'), cb: s('cb'), f: s('f'), list: l }; }
function foodLog(d, e) { S.food = S.food || {}; (S.food[d] = S.food[d] || []).push(Object.assign({ t: Date.now(), meal: mealNow() }, e)); remember(e); save(); }
/* recent and favourite foods, for one-tap logging */
function remember(e) { if (!e.n) return; S.foodRecent = (S.foodRecent || []).filter((x) => x.n !== e.n); S.foodRecent.unshift({ n: e.n, p: e.p, c: e.c, cb: e.cb || 0, f: e.f || 0, g: e.g || null }); S.foodRecent.length = Math.min(S.foodRecent.length, 30); }

function macroBar(lbl, v, t, c, unit) { const pc = t ? Math.min(1, v / t) : 0; return `<div class="mbar" style="--c:${c}"><div><b>${lbl}</b><span class="num">${Math.round(v)}${unit} <em>/ ${t}${unit}</em></span></div><span class="mtrack"><i style="width:${Math.round(pc * 100)}%"></i></span></div>`; }
function renderNutrition() {
  const d = UI.fday || todayS(), t = todayS(), tg = nutMacros(d), n = nutTot(d), left = tg.kcal - n.kcal;
  let bars = ''; for (let i = 6; i >= 0; i--) { const dd = addD(d, -i), x = nutTot(dd), tt = nutTargets(dd), hp = Math.min(1, x.p / tt.prot); bars += `<button class="fbar ${dd === d ? 'on' : ''}" data-a="fday" data-v="${dd}"><i style="height:${Math.max(4, hp * 60)}px;background:${hp >= 0.9 ? 'var(--ok)' : 'color-mix(in srgb,#12B76A 45%,var(--sf2))'}"></i><span>${DS[dow(dd)][0]}</span></button>`; }
  let h = `<div class="phead"><h2 class="pagetitle disp">Nutrition</h2><button class="addbtn" style="--c:#12B76A" data-a="nadd" data-v="${mealNow()}">${IC.plus}Add</button></div>
  <p class="sub">${d === t ? 'Today' : nice(d)} · ${tg.training ? 'training day' : 'rest day'}${d !== t ? ` · <button class="linkbtn" data-a="fday" data-v="${t}">Back to today</button>` : ''}</p>
  <div class="card nsum"><div class="frings">${ring(Math.min(1, n.kcal / tg.kcal), left < 0 ? 'var(--bad)' : '#FF6A13', 110, 12, Math.abs(left))}<div><span class="hlab">${left >= 0 ? 'Calories left' : 'Calories over'}</span><b class="disp" style="font-size:24px">${n.kcal} / ${tg.kcal}</b><span class="muted" style="font-size:13px">${tg.training ? 'Training-day' : 'Rest-day'} target</span></div></div>
  ${macroBar('Protein', n.p, tg.prot, '#12B76A', ' g')}${macroBar('Carbs', n.cb, tg.carb, '#2F5BFF', ' g')}${macroBar('Fat', n.f, tg.fat, '#E8A900', ' g')}
  <p class="muted" style="font-size:12.5px;margin:10px 0 0">${esc(tg.why)} Fat about 27% of calories, carbs fill the rest.</p></div>
  <div class="nquick"><button data-a="nadd" data-v="${mealNow()}" data-t="search">${IC.search || '🔎'}<span>Search</span></button><button data-a="nadd" data-v="${mealNow()}" data-t="scan"><span class="nqi">▦</span><span>Scan barcode</span></button><button data-a="nadd" data-v="${mealNow()}" data-t="photo"><span class="nqi">📷</span><span>Meal photo</span></button><button data-a="nplan"><span class="nqi">🍽️</span><span>Meal plan</span></button></div>`;
  MEALS.forEach(([m, lbl, ic]) => { const items = n.list.map((x, i) => [x, i]).filter(([x]) => (x.meal || 's') === m), kc = items.reduce((a, [x]) => a + (+x.c || 0), 0);
    h += `<div class="card nmeal"><div class="nmh"><b>${ic} ${lbl}</b><span class="muted num">${Math.round(kc)} kcal</span><button class="mini" data-a="nadd" data-v="${m}" aria-label="Add to ${lbl}">${IC.plus}</button></div>
    ${items.length ? items.map(([x, i]) => `<div class="nrow"><span><b>${esc(x.n)}</b><small>${x.g ? x.g + ' g · ' : ''}P ${Math.round(x.p)} · C ${Math.round(x.cb || 0)} · F ${Math.round(x.f || 0)}${x.src === 'photo' ? ' · 📷 estimate' : ''}</small></span><b class="num">${Math.round(x.c)}</b><button class="mini" data-a="fooddel" data-v="${i}" aria-label="Remove ${esc(x.n)}">✕</button></div>`).join('') : `<p class="muted nempty">Nothing yet</p>`}</div>`; });
  h += `<div class="card"><h4 class="disp" style="margin:0 0 6px">Protein this week</h4><div class="fbars">${bars}</div></div>`;
  document.getElementById('view').innerHTML = h;
}

/* ---------- the add-food sheet ---------- */
function nAddSheet() {
  const q = UI.nadd, tabs = [['search', 'Search'], ['scan', 'Barcode'], ['photo', 'Photo'], ['recent', 'Recent'], ['manual', 'Manual']];
  let body = '';
  if (q.pick) { const it = q.pick, g = q.g, m = scaled(it, g), sv = it.serving;
    body = `<div class="npick"><b>${esc(it.name)}</b>${it.brand ? `<small class="muted">${esc(it.brand)}</small>` : ''}<span class="muted">Per 100 g: ${it.per100.kcal} kcal · P ${it.per100.p} · C ${it.per100.c} · F ${it.per100.f}</span>
    <label class="fl2">Amount (g)</label><div class="nstep"><button class="mini" data-a="ng" data-v="-10">−</button><input id="ngrams" inputmode="decimal" value="${g}" aria-label="Grams"><button class="mini" data-a="ng" data-v="10">+</button></div>
    ${sv ? `<div class="chipsrow">${[0.5, 1, 1.5, 2].map((k) => `<button class="mini ${Math.round(sv.g * k) === g ? 'on' : ''}" data-a="ngset" data-v="${Math.round(sv.g * k)}">${k === 1 ? esc(sv.label) : k + '×'}</button>`).join('')}</div>` : ''}
    <div class="nmac"><div><b class="num">${m.kcal}</b><span>kcal</span></div><div><b class="num">${m.p}</b><span>protein</span></div><div><b class="num">${m.cb}</b><span>carbs</span></div><div><b class="num">${m.f}</b><span>fat</span></div></div>
    <button class="cta" style="--c:#12B76A" data-a="nlog">Add to ${MEALS.find((x) => x[0] === q.meal)[1]}</button><button class="cta ghost" data-a="nback">Back</button></div>`;
  } else if (q.tab === 'search') {
    const term = (q.term || '').toLowerCase(), local = FOOD_DB.filter((f) => !term || f.name.toLowerCase().includes(term)).slice(0, term ? 30 : 16);
    body = `<input id="nq" data-in="nq" placeholder="Search foods, e.g. chicken, oats, labneh" value="${esc(q.term || '')}" autocomplete="off">
    <div class="nlist">${local.map((f) => `<button class="nres" data-a="npick" data-v="${f.id}"><span><b>${esc(f.name)}</b><small>${esc(f.serving.label)}</small></span><span class="num">${scaled(f, f.serving.g).kcal} kcal</span></button>`).join('')}
    ${(q.remote || []).map((f, i) => `<button class="nres" data-a="npickr" data-v="${i}"><span><b>${esc(f.name)}</b><small>${esc(f.brand || 'Open Food Facts')}${f.serving ? ' · ' + esc(f.serving.label) : ''}</small></span><span class="num">${f.per100.kcal}/100 g</span></button>`).join('')}</div>
    ${term.length >= 2 ? `<button class="cta ghost" data-a="nremote">${q.busy ? 'Searching…' : q.remote ? 'Search again online' : 'Search more foods online (Open Food Facts)'}</button>` : ''}`;
  } else if (q.tab === 'scan') {
    const can = 'BarcodeDetector' in window;
    body = `${can ? `<div class="nscan"><video id="nvid" playsinline muted></video><i></i></div><p class="muted" style="font-size:13px">Point the camera at the barcode.</p>` : `<p class="note">This browser can’t read barcodes from the camera (iPhone Safari can’t yet). Type the number under the barcode instead. The App Store version will scan directly.</p>`}
    <label class="fl2">Barcode number</label><div class="nstep"><input id="ncode" inputmode="numeric" placeholder="e.g. 5000159407236" value="${esc(q.code || '')}"><button class="mini p" data-a="ncode">Look up</button></div>${q.msg ? `<p class="note">${esc(q.msg)}</p>` : ''}`;
  } else if (q.tab === 'photo') {
    body = q.est ? `<p class="muted" style="font-size:13px;margin:0 0 6px">Estimated from your photo (${esc(q.est.confidence)} confidence). Adjust grams if needed, then add.</p>
      ${q.est.items.map((it, i) => `<div class="nrow"><span><b>${esc(it.name)}</b><small>P ${Math.round(it.protein_g)} · C ${Math.round(it.carbs_g)} · F ${Math.round(it.fat_g)} · ${Math.round(it.kcal)} kcal</small></span><input class="ngin" data-in="nestg" data-k="${i}" inputmode="numeric" value="${Math.round(it.grams)}" aria-label="Grams of ${esc(it.name)}"><small>g</small></div>`).join('')}
      ${q.est.note ? `<p class="note" style="font-size:13px">${esc(q.est.note)}</p>` : ''}<button class="cta" style="--c:#12B76A" data-a="nestlog">Add all to ${MEALS.find((x) => x[0] === q.meal)[1]}</button><button class="cta ghost" data-a="nphoto">Try another photo</button>`
      : `<div class="nphoto"><span>📷</span><b>Snap your meal</b><p class="muted">Claude estimates the foods, portions, calories and macros. The photo isn’t stored.</p><button class="cta" style="--c:#12B76A" data-a="nphoto">${q.busy ? 'Reading your meal…' : 'Take or choose a photo'}</button></div>${q.msg ? `<p class="note">${esc(q.msg)}</p>` : ''}`;
  } else if (q.tab === 'recent') {
    const r = S.foodRecent || [];
    body = r.length ? `<div class="nlist">${r.map((x, i) => `<button class="nres" data-a="nrecent" data-v="${i}"><span><b>${esc(x.n)}</b><small>${x.g ? x.g + ' g · ' : ''}P ${Math.round(x.p)} · C ${Math.round(x.cb)} · F ${Math.round(x.f)}</small></span><span class="num">${Math.round(x.c)} kcal</span></button>`).join('')}</div>` : '<p class="muted">Foods you log appear here for one-tap adding.</p>';
    body += `<h4 class="disp" style="margin:12px 0 6px">Quick add</h4><div class="chipsrow">${FOOD_PRESETS.map((f, i) => `<button class="mini" data-a="foodq2" data-v="${i}">${esc(f[0])}</button>`).join('')}</div>`;
  } else {
    body = `<label class="fl2">What</label><input id="fn" placeholder="e.g. Chicken wrap" maxlength="60"><div class="grid2"><div><label class="fl2">Calories</label><input id="fc" inputmode="numeric" placeholder="450"></div><div><label class="fl2">Protein (g)</label><input id="fp" inputmode="decimal" placeholder="30"></div><div><label class="fl2">Carbs (g)</label><input id="fcb" inputmode="decimal" placeholder="40"></div><div><label class="fl2">Fat (g)</label><input id="ff" inputmode="decimal" placeholder="15"></div></div><button class="cta" style="--c:#12B76A" data-a="nmanual">Add</button>`;
  }
  openSheet(`<h4 class="disp">Add to ${MEALS.find((x) => x[0] === q.meal)[1]}</h4><div class="chipsrow nmealpick">${MEALS.map(([m, l]) => `<button class="mini ${q.meal === m ? 'on' : ''}" data-a="nmeal" data-v="${m}">${l}</button>`).join('')}</div>
  ${q.pick ? '' : `<div class="ntabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${q.tab === k}" class="${q.tab === k ? 'on' : ''}" data-a="ntab" data-v="${k}">${l}</button>`).join('')}</div>`}${body}
  ${q.pick ? '' : '<button class="cta ghost" data-a="close">Done</button>'}`);
  if (q.tab === 'scan' && !q.pick && 'BarcodeDetector' in window) nScanStart();
  else nScanStop();
}
let NSTREAM = null, NSCAN = null;
async function nScanStart() {
  const v = document.getElementById('nvid'); if (!v || NSTREAM) { if (v && NSTREAM) { v.srcObject = NSTREAM; v.play().catch(() => {}); } return; }
  try { NSTREAM = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); v.srcObject = NSTREAM; await v.play();
    const det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
    clearInterval(NSCAN); NSCAN = setInterval(async () => { const vv = document.getElementById('nvid'); if (!vv || !UI.nadd || UI.nadd.tab !== 'scan' || document.getElementById('sheet').classList.contains('hide')) { nScanStop(); return; }
      try { const r = await det.detect(vv); if (r && r[0]) { nScanStop(); try { navigator.vibrate && navigator.vibrate(40); } catch (e) { /* no vibration */ } nLookup(r[0].rawValue); } } catch (e) { /* frame not ready */ } }, 350);
  } catch (e) { UI.nadd.msg = 'Camera unavailable. Type the barcode number instead.'; nScanStop(); nAddSheet(); }
}
function nScanStop() { clearInterval(NSCAN); NSCAN = null; if (NSTREAM) { NSTREAM.getTracks().forEach((t) => t.stop()); NSTREAM = null; } }
async function nLookup(code) {
  const q = UI.nadd; code = String(code || '').replace(/\D/g, ''); q.code = code; if (code.length < 6) { q.msg = 'That number looks too short.'; nAddSheet(); return; }
  q.msg = 'Looking up ' + code + '…'; nAddSheet();
  try { const r = await fetch('/api/food?code=' + code), j = await r.json().catch(() => ({}));
    if (r.ok && j.item) { q.msg = ''; q.pick = j.item; q.g = j.item.serving ? j.item.serving.g : 100; } else q.msg = r.status === 404 ? 'Not in the food database yet. Use Search or Manual.' : 'Couldn’t look that up right now. Try again or use Manual.';
  } catch (e) { q.msg = navigator.onLine ? 'Couldn’t look that up right now.' : 'You’re offline. Use Search (built-in foods) or Manual.'; }
  nAddSheet();
}
async function nRemote() {
  const q = UI.nadd; if ((q.term || '').length < 2) return; q.busy = 1; nAddSheet();
  try { const r = await fetch('/api/food?q=' + encodeURIComponent(q.term)), j = await r.json().catch(() => ({})); q.remote = r.ok ? j.items || [] : []; if (!r.ok) toast('Online search is unavailable right now'); }
  catch (e) { q.remote = []; toast(navigator.onLine ? 'Online search is unavailable right now' : 'You’re offline. Built-in foods still work.'); }
  q.busy = 0; nAddSheet();
}
function nPhotoPick() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.setAttribute('capture', 'environment');
  inp.onchange = async () => { const f = inp.files && inp.files[0]; if (!f) return; const q = UI.nadd; q.busy = 1; q.msg = ''; q.est = null; nAddSheet();
    try { const data = await shrinkImage(f), r = await fetch('/api/meal-photo', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-iron-key': wKey() }, body: JSON.stringify({ data, media_type: 'image/jpeg' }) }), j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) q.est = j.meal;
      else q.msg = { not_configured: 'Meal photos aren’t set up on this site yet (the ANTHROPIC_API_KEY setting is missing).', limit: 'Daily photo limit reached. Try again tomorrow.', not_food: 'That doesn’t look like food. Try another photo.', busy: 'Busy right now. Try again in a minute.', rate_limited: 'Too many photos at once. Wait a minute.' }[j.error] || 'Couldn’t read that photo. Try a clearer one from above.';
    } catch (e) { q.msg = navigator.onLine ? 'Couldn’t read that photo.' : 'Meal photos need an internet connection.'; }
    q.busy = 0; nAddSheet(); };
  inp.click();
}

/* ---------- one-day meal plan that hits today's targets ---------- */
const PLAN_T = {
  b: [[['Oats', 70], ['Whey protein powder', 30], ['Banana', 120], ['Peanut butter', 16]], [['Egg, whole', 150], ['Wholemeal bread', 80], ['Avocado', 60], ['Tomato', 120]], [['Greek yogurt, 0%', 250], ['Granola', 45], ['Berries, mixed', 125], ['Almonds', 15]], [['Ful medames', 200], ['Egg, whole', 100], ['Pita / Arabic bread', 60], ['Cucumber', 100]]],
  l: [[['Chicken breast, cooked', 170], ['Basmati rice, cooked', 200], ['Mixed salad', 120], ['Olive oil', 8]], [['Lean beef mince 5%, cooked', 150], ['Pasta, cooked', 200], ['Mixed vegetables, cooked', 150]], [['Tuna, canned in water', 112], ['Quinoa, cooked', 185], ['Avocado', 60], ['Spinach', 60]], [['Chicken breast, cooked', 150], ['Bulgur, cooked', 180], ['Hummus', 60], ['Mixed salad', 120]]],
  d: [[['Salmon, cooked', 160], ['Sweet potato, baked', 200], ['Broccoli', 150]], [['Chicken thigh, cooked', 160], ['Brown rice, cooked', 180], ['Mixed vegetables, cooked', 150]], [['White fish (cod), cooked', 200], ['Potato, boiled', 250], ['Mixed salad', 120], ['Olive oil', 10]], [['Turkey breast, cooked', 160], ['Couscous, cooked', 180], ['Spinach', 60], ['Tahini', 15]]],
  s: [[['Cottage cheese', 200], ['Apple', 180]], [['Protein bar', 60]], [['Greek yogurt, 0%', 200], ['Dates', 24]], [['Rice cakes', 18], ['Peanut butter', 16], ['Milk, semi-skimmed', 250]]],
};
const PLAN_VEG = { 'Chicken breast, cooked': 'Tofu, firm', 'Chicken thigh, cooked': 'Tofu, firm', 'Turkey breast, cooked': 'Lentils, cooked', 'Lean beef mince 5%, cooked': 'Lentils, cooked', 'Salmon, cooked': 'Tofu, firm', 'White fish (cod), cooked': 'Chickpeas, cooked', 'Tuna, canned in water': 'Chickpeas, cooked' };
function mealPlan(d, seed) {
  const tg = nutMacros(d), veg = S.foodVeg, share = { b: 0.25, l: 0.33, d: 0.3, s: 0.12 }, byName = (n) => FOOD_DB.find((f) => f.name === n);
  const k = (seed == null ? diffD(S.start || d, d) : seed) >>> 0, plan = [];
  MEALS.forEach(([m], j) => { const tpl = PLAN_T[m][(k + j) % PLAN_T[m].length].map(([n, g]) => [veg && PLAN_VEG[n] ? PLAN_VEG[n] : n, g]);
    const base = tpl.reduce((a, [n, g]) => a + scaled(byName(n), g).kcal, 0), f = Math.max(0.6, Math.min(1.8, tg.kcal * share[m] / base));
    plan.push({ m, items: tpl.map(([n, g]) => { const it = byName(n), gg = Math.round(g * f / 5) * 5; return Object.assign({ n, g: gg }, scaled(it, gg)); }) }); });
  const tot = plan.flatMap((x) => x.items).reduce((a, x) => ({ kcal: a.kcal + x.kcal, p: a.p + x.p, cb: a.cb + x.cb, f: a.f + x.f }), { kcal: 0, p: 0, cb: 0, f: 0 });
  return { plan, tot, tg };
}
function planSheet() {
  const d = UI.fday || todayS(); UI.pseed = UI.pseed == null ? null : UI.pseed; const P = mealPlan(d, UI.pseed);
  openSheet(`<h4 class="disp">Meal plan</h4><p class="muted" style="font-size:13.5px;margin:0 0 6px">One day built to hit your ${P.tg.training ? 'training' : 'rest'}-day targets: ${P.tg.kcal} kcal, ${P.tg.prot} g protein.</p>
  <div class="chipsrow"><button class="mini ${S.foodVeg ? '' : 'on'}" data-a="nveg" data-v="0">Everything</button><button class="mini ${S.foodVeg ? 'on' : ''}" data-a="nveg" data-v="1">Vegetarian</button><button class="mini" data-a="nshuffle">🔀 Another plan</button></div>
  ${P.plan.map((x) => { const M = MEALS.find((y) => y[0] === x.m), kc = x.items.reduce((a, i) => a + i.kcal, 0);
    return `<div class="card nmeal"><div class="nmh"><b>${M[2]} ${M[1]}</b><span class="muted num">${kc} kcal</span><button class="mini p" data-a="nplanlog" data-v="${x.m}">Log</button></div>${x.items.map((i) => `<div class="nrow"><span><b>${esc(i.n)}</b><small>${i.g} g · P ${Math.round(i.p)} · C ${Math.round(i.cb)} · F ${Math.round(i.f)}</small></span><b class="num">${i.kcal}</b></div>`).join('')}</div>`; }).join('')}
  <div class="nmac"><div><b class="num">${Math.round(P.tot.kcal)}</b><span>kcal</span></div><div><b class="num">${Math.round(P.tot.p)}</b><span>protein</span></div><div><b class="num">${Math.round(P.tot.cb)}</b><span>carbs</span></div><div><b class="num">${Math.round(P.tot.f)}</b><span>fat</span></div></div>
  <button class="cta" style="--c:#12B76A" data-a="nplanall">Log the whole day</button><button class="cta ghost" data-a="close">Close</button>`);
}

document.addEventListener('input', (ev) => { const el = ev.target; if (!el.dataset || !UI.nadd) return;
  if (el.dataset.in === 'nq') { UI.nadd.term = el.value; UI.nadd.remote = null; const pos = el.selectionStart; nAddSheet(); const n = document.getElementById('nq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }
  if (el.dataset.in === 'nestg' && UI.nadd.est) { const it = UI.nadd.est.items[+el.dataset.k], g = +el.value; if (g > 0 && it.grams > 0) { const k = g / it.grams; ['kcal', 'protein_g', 'carbs_g', 'fat_g'].forEach((f) => { it[f] = it[f] * k; }); it.grams = g; } }
  if (el.id === 'ngrams' && UI.nadd.pick) { const g = parseFloat(el.value); if (g > 0) { UI.nadd.g = Math.round(g); const pos = el.selectionStart; nAddSheet(); const n = document.getElementById('ngrams'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } } } });
document.addEventListener('click', (ev) => { const el = ev.target.closest('[data-a]'); if (!el) return; const a = el.dataset.a, v = el.dataset.v, d = UI.fday || todayS(), q = UI.nadd;
  if (a === 'nadd') { UI.nadd = { meal: v || mealNow(), tab: el.dataset.t || 'search', term: '' }; nAddSheet(); }
  if (a === 'nplan') { UI.nadd = null; UI.pseed = null; planSheet(); return; }
  if (a === 'nveg') { S.foodVeg = v === '1'; save(); planSheet(); return; }
  if (a === 'nshuffle') { UI.pseed = (UI.pseed == null ? diffD(S.start || d, d) : UI.pseed) + 1; planSheet(); return; }
  if (a === 'nplanlog' || a === 'nplanall') { const P = mealPlan(d, UI.pseed); P.plan.filter((x) => a === 'nplanall' || x.m === v).forEach((x) => x.items.forEach((i) => foodLog(d, { n: i.n, g: i.g, c: i.kcal, p: i.p, cb: i.cb, f: i.f, meal: x.m, src: 'plan' }))); if (a === 'nplanall') closeSheet(); rerender(); toast(a === 'nplanall' ? 'Meal plan logged' : MEALS.find((y) => y[0] === v)[1] + ' logged'); return; }
  if (!q) return;
  if (a === 'close') { nScanStop(); UI.nadd = null; return; }
  if (a === 'nmeal') { q.meal = v; nAddSheet(); }
  if (a === 'ntab') { q.tab = v; q.msg = ''; nAddSheet(); if (v === 'search') { const n = document.getElementById('nq'); n && n.focus(); } }
  if (a === 'npick') { const it = FOOD_DB.find((f) => f.id === v); q.pick = it; q.g = it.serving.g; nAddSheet(); }
  if (a === 'npickr') { const it = q.remote[+v]; q.pick = it; q.g = it.serving ? it.serving.g : 100; nAddSheet(); }
  if (a === 'nback') { q.pick = null; nAddSheet(); }
  if (a === 'ng') { q.g = Math.max(5, (q.g || 100) + +v); nAddSheet(); }
  if (a === 'ngset') { q.g = +v; nAddSheet(); }
  if (a === 'nlog' && q.pick) { const m = scaled(q.pick, q.g); foodLog(d, { n: q.pick.name + (q.pick.brand ? ' · ' + q.pick.brand : ''), g: q.g, c: m.kcal, p: m.p, cb: m.cb, f: m.f, meal: q.meal, src: q.pick.code ? 'off' : 'db' }); const nm = q.pick.name; UI.nadd = null; closeSheet(); rerender(); toast('Added ' + nm); }
  if (a === 'nremote') nRemote();
  if (a === 'ncode') nLookup((document.getElementById('ncode') || {}).value);
  if (a === 'nphoto') { q.est = null; nPhotoPick(); }
  if (a === 'nestlog' && q.est) { q.est.items.forEach((it) => foodLog(d, { n: it.name, g: Math.round(it.grams), c: Math.round(it.kcal), p: Math.round(it.protein_g * 10) / 10, cb: Math.round(it.carbs_g * 10) / 10, f: Math.round(it.fat_g * 10) / 10, meal: q.meal, src: 'photo' })); const n = q.est.items.length; UI.nadd = null; closeSheet(); rerender(); toast(`Added ${n} item${n > 1 ? 's' : ''} from your photo`); }
  if (a === 'nrecent') { const x = (S.foodRecent || [])[+v]; if (x) { foodLog(d, Object.assign({}, x, { meal: q.meal })); UI.nadd = null; closeSheet(); rerender(); toast('Added ' + x.n); } }
  if (a === 'foodq2') { const f = FOOD_PRESETS[+v]; foodLog(d, { n: f[0], p: f[1], c: f[2], meal: q.meal }); UI.nadd = null; closeSheet(); rerender(); toast('Added ' + f[0]); }
  if (a === 'nmanual') { const g = (id) => parseFloat((document.getElementById(id) || {}).value) || 0, n = ((document.getElementById('fn') || {}).value || '').trim() || 'Food';
    if (!g('fc') && !g('fp')) { toast('Enter calories or protein'); return; } foodLog(d, { n, c: g('fc') || Math.round(g('fp') * 4 + g('fcb') * 4 + g('ff') * 9), p: g('fp'), cb: g('fcb'), f: g('ff'), meal: q.meal, src: 'manual' }); UI.nadd = null; closeSheet(); rerender(); toast('Added ' + n); }
});
