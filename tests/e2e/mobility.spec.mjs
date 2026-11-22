import { test, expect } from '@playwright/test';
import { openApp, noErrors, openDay } from './helpers.mjs';

// days of the sample plan by kind
async function days(page) {
  return page.evaluate(() => {
    const out = {};
    for (let i = 0; i < 28; i++) { const d = addD(todayS(), i), t = T[tplOf(d)]; if (t && blocksFor(d).length && !out[t.k]) out[t.k] = d; if (t && t.k === 'rest' && !out.rest) out.rest = d; }
    return out;
  });
}

test('there is a large library of warm-up, mobility and stretching moves, each with its targets', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => ({ c: XM_COUNT, bad: Object.keys(XM).filter((id) => !E[id] || !E[id].n || !XM[id].p.length || !XM[id].tg || !XM[id].p.every((m) => MUSC_NAME[m])), map: muscleMap('pigeon', '#000').includes('mmap') }));
  expect(r.c.s).toBeGreaterThanOrEqual(35);
  expect(r.c.m).toBeGreaterThanOrEqual(30);
  expect(r.c.w).toBeGreaterThanOrEqual(35);
  expect(r.bad).toEqual([]);
  expect(r.map).toBe(true);
  noErrors(page);
});

test('warm-up, mobility and stretches follow the muscles the workout uses', async ({ page }) => {
  await openApp(page);
  const D = await days(page);
  const r = await page.evaluate(({ up, lo }) => {
    const hit = (d, list) => { const w = dayMuscles(d), top = Object.keys(w).sort((a, b) => w[b] - w[a]).slice(0, 5); return list.filter((m) => XM[m.ex] && XM[m.ex].p.concat(XM[m.ex].s).some((k) => top.includes(k))).length / list.filter((m) => XM[m.ex]).length; };
    const all = (d) => ({ w: hit(d, warmFor(d).filter((m) => !['bikeWU', 'marchWU', 'rampUp'].includes(m.ex))), m: hit(d, mobFor(d)), s: hit(d, stretchFor(d)), n: stretchFor(d).length });
    return { up: all(up), lo: all(lo), upSt: stretchFor(up).map((m) => m.ex), loSt: stretchFor(lo).map((m) => m.ex) };
  }, { up: D.upper, lo: D.lower });
  for (const k of ['up', 'lo']) { expect(r[k].w, k + ' warm-up').toBeGreaterThanOrEqual(0.75); expect(r[k].m, k + ' mobility').toBeGreaterThanOrEqual(0.6); expect(r[k].s, k + ' stretch').toBeGreaterThanOrEqual(0.75); expect(r[k].n).toBeGreaterThanOrEqual(4); }
  // an upper day stretches the upper body, a lower day the legs
  expect(r.upSt.some((x) => ['pecDoor', 'pecCorner', 'latStretch', 'tricepsOH', 'bicepsWall', 'frontDelt', 'crossBody', 'selfHug', 'sleeper'].includes(x))).toBe(true);
  expect(r.loSt.some((x) => ['couch', 'quadStand', 'quadSide', 'hamStrap', 'figure4', 'pigeon', 'calfWall', 'forwardFold', 'squatHold', 'lizard', 'hipFlexPPT'].includes(x))).toBe(true);
  await openDay(page, D.upper);
  await expect(page.locator('.sechead[data-v="st"]')).toContainText('Stretch');
  await expect(page.locator('.mlist .xmt').first()).toBeVisible();
  noErrors(page);
});

test('anterior pelvic tilt is an injury option and brings corrective drills', async ({ page }) => {
  await openApp(page);
  const D = await days(page);
  await page.evaluate(() => { UI.tab = 'plan'; rerender(); });
  await page.click('#injcard [data-a="injadd"][data-v="apt"]');
  await expect(page.locator('#injcard .injrow')).toContainText('Anterior pelvic tilt');
  const r = await page.evaluate((d) => ({ w: warmFor(d).filter((m) => m.why === 'apt').length, m: mobFor(d).filter((m) => m.why === 'apt').length, s: stretchFor(d).filter((m) => m.why === 'apt').length,
    helps: mobFor(d).concat(stretchFor(d)).filter((m) => XM[m.ex] && XM[m.ex].helps.includes('apt')).map((m) => m.ex), avoid: mobFor(d).concat(stretchFor(d), warmFor(d)).filter((m) => XM[m.ex] && XM[m.ex].av.includes('apt')).length }), D.lower);
  expect(r.w).toBeGreaterThanOrEqual(1); expect(r.m).toBeGreaterThanOrEqual(2); expect(r.s).toBeGreaterThanOrEqual(1);
  expect(r.avoid).toBe(0);
  await openDay(page, D.lower);
  await expect(page.locator('.xmwhy').filter({ hasText: 'anterior pelvic tilt' }).first()).toBeAttached();
  noErrors(page);
});

test('an injury adds drills for it and removes drills that strain it', async ({ page }) => {
  await openApp(page);
  const D = await days(page);
  const r = await page.evaluate((d) => {
    S.injuries = [{ id: 'k', j: 'kn', from: '', to: '', note: '' }]; INJCACHE = {}; save();
    const all = warmFor(d).concat(mobFor(d), stretchFor(d));
    return { bad: all.filter((m) => XM[m.ex] && XM[m.ex].av.includes('kn')).map((m) => m.ex), forKnee: all.filter((m) => m.why === 'kn').length, n: warmFor(d).length };
  }, D.lower);
  expect(r.bad).toEqual([]);
  expect(r.forKnee).toBeGreaterThanOrEqual(3);
  noErrors(page);
});

test('stretches and mobility drills can be replaced with ones for the same muscles', async ({ page }) => {
  await openApp(page);
  const D = await days(page);
  await openDay(page, D.lower);
  const z = await page.evaluate(() => stretchFor(UI.date)[0]);
  await page.evaluate((z) => swapSheet(z.slot, z.base), z);
  const opts = page.locator('.sheet .opt');
  expect(await opts.count()).toBeGreaterThanOrEqual(5);
  const r = await page.evaluate((z) => { const alts = altsFor(z.slot, z.base, z.ex); return { allStretch: alts.every((a) => XM[a] && XM[a].k.includes('s')), shared: alts.filter((a) => XM[a].p.concat(XM[a].s).some((m) => XM[z.ex].p.concat(XM[z.ex].s).includes(m))).length, alts }; }, z);
  expect(r.allStretch).toBe(true);
  expect(r.shared).toBeGreaterThanOrEqual(4);
  const pick = r.alts.find((a) => a !== z.base);
  await page.click(`.sheet [data-a="doswap"][data-e="${pick}"][data-s="day"]`);
  expect(await page.evaluate((z) => stretchFor(UI.date).find((m) => m.slot === z.slot).ex, z)).toBe(pick);
  noErrors(page);
});

test('every exercise, warm-up, mobility drill and stretch has a demo video', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const ids = Object.keys(E).filter((id) => id !== 'rampUp');
    return { n: ids.length, missing: ids.filter((id) => !/^[A-Za-z0-9_-]{11}$/.test(YT[id] || '')).map((id) => id + ' (' + E[id].n + ')') };
  });
  expect(r.n).toBeGreaterThan(300);
  expect(r.missing).toEqual([]);
  // the player embeds it
  await page.evaluate(() => openPlayer('pigeon'));
  await expect(page.locator('.sheet iframe[src*="youtube-nocookie.com/embed/"]')).toHaveCount(1);
  noErrors(page);
});
