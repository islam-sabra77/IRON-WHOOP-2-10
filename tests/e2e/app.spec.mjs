import { test, expect } from '@playwright/test';
import { openApp, noErrors, liftingDay, openDay } from './helpers.mjs';

test('every tab renders without errors', async ({ page }) => {
  await openApp(page);
  for (const t of ['home', 'train', 'plan', 'build', 'whoop', 'progress', 'supps', 'habits', 'travel', 'more', 'goals', 'food']) {
    await page.evaluate((t) => { UI.tab = t; rerender(); }, t);
    await expect(page.locator('#view')).not.toBeEmpty();
  }
  // walk every day of the plan on the Train tab
  await page.evaluate(() => { for (let i = 0; i < 70; i++) { UI.date = addD(S.start, i); UI.tab = 'train'; rerender(); } });
  noErrors(page);
});

test('home tiles open their tabs', async ({ page }) => {
  await openApp(page);
  for (const v of ['build', 'progress', 'travel']) {
    await page.evaluate(() => { UI.tab = 'home'; rerender(); });
    await page.locator(`[data-a="hgo"][data-v="${v}"]`).first().click();
    expect(await page.evaluate(() => UI.tab)).toBe(v);
  }
  noErrors(page);
});

test('home is interactive: day picker, supplements, protein and lifts', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => {
    const t = todayS();
    for (let i = 1; i <= 4; i++) S.logs[addD(t, -i * 3)] = { s0: { ex: 'bbBench', sets: [{ w: String(70 + i), r: '5', d: 1 }] }, s1: { ex: 'bbBackSquat' in E ? 'bbBackSquat' : 'bbBench', sets: [{ w: '100', r: '5', d: 1 }] } };
    S.whoop.connected = true; S.wdata[t] = { rec: 45, hrv: 60, rhr: 55, sleep: { dur: 6.8, perf: 80 } };
    save(); UI.tab = 'home'; rerender();
  });
  await expect(page.locator('.hg-hero')).toContainText('Yellow day');
  await page.click('[data-a="hwhy"]');
  await expect(page.locator('.hg-why')).toContainText('6h 48m');
  // pick another day: the session card follows it
  const other = await page.evaluate(() => { const ws = sunOf(todayS()); for (let i = 0; i < 7; i++) { const d = addD(ws, i); if (d !== todayS() && tplOf(d)) return { d, n: T[tplOf(d)].n }; } });
  await page.click(`[data-a="hday"][data-d="${other.d}"]`);
  await expect(page.locator('.hg-sess h3')).toHaveText(other.n);
  // tick a supplement and add protein
  const sid = await page.evaluate(() => S.supps[0].id);
  await page.click(`[data-a="hsupp"][data-k="${sid}"]`);
  expect(await page.evaluate((id) => !!(S.suppLog[todayS()] || {})[id], sid)).toBe(true);
  await page.click('[data-a="hprot"]');
  expect(await page.evaluate(() => nutDay(todayS()).p)).toBe(20);
  // switch lifts
  const tabs = page.locator('.hg-seg button');
  if (await tabs.count() > 1) { await tabs.nth(1).click(); await expect(tabs.nth(1)).toHaveClass(/on/); }
  noErrors(page);
});

test('intro plays for about 3 seconds on first open, then shows the app', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/index.html?intro=1');
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.locator('#intro .in-logo')).toBeVisible();
  await page.waitForTimeout(1500);
  await expect(page.locator('#intro')).toBeVisible();
  await expect(page.locator('#intro')).toHaveCount(0, { timeout: 4000 });
  // not shown again in the same session
  await page.goto('/index.html?intro=1');
  await expect(page.locator('#intro')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('weight and reps copy to the next sets', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page); await openDay(page, d);
  const k = await page.locator('button[data-a="set"]').first().getAttribute('data-k');
  const slot = k.split('|')[0];
  await page.fill(`input[data-in="w"][data-k="${k}"]`, '60'); await page.press(`input[data-in="w"][data-k="${k}"]`, 'Tab');
  await page.fill(`input[data-in="r"][data-k="${k}"]`, '9'); await page.press(`input[data-in="r"][data-k="${k}"]`, 'Tab');
  const sets = await page.evaluate(([d, slot]) => S.logs[d][slot].sets.map((s) => s.w + 'x' + s.r), [d, slot]);
  expect(sets.every((s) => s === '60x9')).toBe(true);
  noErrors(page);
});

test('ticking a set asks for RPE and saves it', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page); await openDay(page, d);
  const k = await page.locator('button[data-a="set"]').first().getAttribute('data-k');
  await page.click(`button[data-a="set"][data-k="${k}"]`);
  await page.click('.rperow button[data-v="8"]');
  const e = await page.evaluate(([d, k]) => { const [sl, i] = k.split('|'); return S.logs[d][sl].sets[+i].e; }, [d, k]);
  expect(e).toBe(8);
  noErrors(page);
});

test('focus mode logs a set', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page); await openDay(page, d);
  await page.click('[data-a="focus"]');
  await page.click('[data-a="fxdone"]');
  const n = await page.evaluate((d) => groupsTotal(d).done, d);
  expect(n).toBe(1);
  noErrors(page);
});

test('plate calculator splits the load per side', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => platesFor(102.5, 20, [25, 20, 15, 10, 5, 2.5, 1.25]));
  expect(r.list).toEqual([25, 15, 1.25]);
  expect(r.rest).toBe(0);
});

test('imperial units store kilograms', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { prefs().unit = 'lb'; save(); });
  const d = await liftingDay(page); await openDay(page, d);
  const k = await page.locator('button[data-a="set"]').first().getAttribute('data-k');
  await page.fill(`input[data-in="w"][data-k="${k}"]`, '135'); await page.press(`input[data-in="w"][data-k="${k}"]`, 'Tab');
  const w = await page.evaluate(([d, k]) => { const [sl, i] = k.split('|'); return S.logs[d][sl].sets[+i].w; }, [d, k]);
  expect(Math.abs(+w - 61.23)).toBeLessThan(0.05);
  noErrors(page);
});

test('Arabic switches to right-to-left', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { prefs().lang = 'ar'; save(); applyDisplay(); rerender(); });
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.tab span').first()).toHaveText('الرئيسية');
  noErrors(page);
});

test('icon-only buttons have screen-reader labels', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page); await openDay(page, d);
  await page.waitForTimeout(50);
  const missing = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => !b.getAttribute('aria-label') && !b.textContent.replace(/[\s✕✓−＋↑↓‹›❚▶…]/g, '').length).length);
  expect(missing).toBe(0);
});

test('supplement quiz leaves out risky picks', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => { const a = Object.assign(sqDefaults(), { goals: ['joints', 'muscle'], issues: ['jointpain'], diet: 'vegan', meds: ['thinners'] }); const R = sqRecommend(a); return { ids: R.list.map((x) => x.id), blocked: R.blocked.map((x) => x.id) }; });
  expect(r.ids).not.toContain('curcumin');
  expect(r.ids).not.toContain('whey');
  expect(r.ids).toContain('plantprot');
  expect(r.blocked).toContain('curcumin');
});

test('readiness check sets the day level', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => readinessScore(todayS(), 5, 1));
  expect(r.lvl).toBe('r');
});

test('five tabs, More opens the rest, back returns to More', async ({ page }) => {
  await openApp(page);
  expect(await page.locator('.tab').count()).toBe(5);
  await page.click('.tab[data-v="more"]');
  await page.click('.mitem[data-v="habits"]');
  await expect(page.locator('.tab.on')).toHaveAttribute('data-v', 'more');
  await page.click('.backlink');
  expect(await page.evaluate(() => UI.tab)).toBe('more');
  noErrors(page);
});

test('charts have axes and show a value when a point is tapped; recovery vs training card', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => {
    const t = todayS();
    for (let i = 1; i <= 6; i++) { const d = addD(t, -i * 3); S.logs[d] = { s0: { ex: 'bbBench', sets: [{ w: String(60 + i * 2.5), r: '5', d: 1 }, { w: '60', r: '5', d: 1 }] } }; }
    S.whoop.connected = true; S.wdata = {}; for (let i = 0; i < 20; i++) S.wdata[addD(t, -i)] = { rec: 40 + (i % 5) * 10 };
    save(); UI.tab = 'progress'; rerender();
  });
  await expect(page.locator('#rtc svg')).toBeVisible();
  await expect(page.locator('#view')).toContainText('Recovery vs training');
  await page.locator('#rtc [data-a="chartpt"]').last().dispatchEvent('click');
  await expect(page.locator('#rtc .ctip')).toContainText('recovery');
  await page.evaluate(() => liftSheet('bbBench'));
  const ch = page.locator('#panel .achart').first();
  await expect(ch.locator('text').first()).toBeVisible();
  await ch.locator('.chit').last().dispatchEvent('click');
  await expect(ch.locator('.ctip')).toContainText('kg');
  noErrors(page);
});

test('exercises show a muscle map and supplements show an evidence grade', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => ({ m: musclesOf('bbBench'), graded: SUPP_DB.filter((e) => e.g).length, n: SUPP_DB.length, cr: SUPP_DB.find((e) => e.id === 'creatine').g, tr: SUPP_DB.find((e) => e.id === 'tribulus').g }));
  expect(r.m.p).toContain('chest');
  expect(r.graded).toBe(r.n);
  expect(r.cr).toBe('A');
  expect(r.tr).toBe('D');
  await page.evaluate(() => openPlayer('bbBench'));
  await expect(page.locator('#panel .mmap')).toContainText('Chest');
  await page.evaluate(() => guideSheet('creatine'));
  await expect(page.locator('#panel .grade.gA').first()).toBeVisible();
  noErrors(page);
});

test('Arabic translates exercise cues on demand, but never user-typed text', async ({ page }) => {
  const sent = [];
  await page.route('**/api/translate', async (r) => { const b = r.request().postDataJSON(); sent.push(...b.strings); r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ t: Object.fromEntries(b.strings.map((s) => [s, 'ترجمة ' + s.length])) }) }); });
  await openApp(page);
  await page.evaluate(() => { S.habits.push({ id: 'hx', n: 'My secret habit', e: '💧', c: '#00A3FF' }); prefs().lang = 'ar'; applyDisplay(); save(); UI.pl = { ex: 'bbBench' }; drawPlayer(); });
  await expect.poll(() => sent.some((s) => s.startsWith('Shoulder blades pinned'))).toBe(true);
  await expect(page.locator('#panel .cue')).toContainText('ترجمة');
  await page.evaluate(() => { closeSheet(); UI.tab = 'habits'; rerender(); });
  await page.waitForTimeout(600);
  expect(sent.some((s) => s.includes('secret'))).toBe(false);
  noErrors(page);
});
