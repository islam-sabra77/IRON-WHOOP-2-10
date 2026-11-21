import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('no personal medical details are baked into the app', async ({ page }) => {
  await openApp(page);
  const hits = await page.evaluate(() => {
    const txt = JSON.stringify(E) + JSON.stringify(SUPP_DB);
    return ['ACL', 'L4-L5', 'Left knee', 'Right shoulder', 'ennis elbow', 'Left leg first'].filter((w) => txt.includes(w));
  });
  expect(hits).toEqual([]);
  noErrors(page);
});

test('the sample plan starts this week and runs 12 weeks', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => ({ start: S.start, end: S.end, mon: (() => { const d = pd(todayS()); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ds(d); })() }));
  expect(r.start).toBe(r.mon);
  expect(await page.evaluate(({ start, end }) => diffD(start, end), r)).toBe(83);
  noErrors(page);
});

test('terms are shown at setup and existing users are asked once', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/index.html');
  await expect(page.locator('#onb .obterms')).toContainText('not medical advice');
  await expect(page.locator('#onb .obterms a[href="terms.html"]')).toHaveCount(1);
  await page.click('[data-a="obskip"]');
  expect(await page.evaluate(() => S.terms && S.terms.v)).toBe(1);
  // an existing user who never agreed
  await page.evaluate(() => { delete S.terms; save(); });
  await page.reload();
  await expect(page.locator('#panel')).toContainText('Before you train', { timeout: 6000 });
  await page.click('[data-a="termsok"]');
  expect(await page.evaluate(() => S.terms.v)).toBe(1);
  const t = await (await page.request.get('/terms.html')).text();
  expect(t).toContain('Not medical advice');
  expect(errors).toEqual([]);
});

test('new injury areas swap the moves that load them', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const out = {};
    for (const j of ['nk', 'sc', 'ub', 'pc', 'hm', 'gr', 'ac', 'ft']) {
      const set = new Set([j]), hit = Object.keys(META).filter((id) => E[id] && META[id].av.includes(j));
      const fixed = hit.filter((id) => injSafeFor(id, set));
      out[j] = { name: INJ[j], hit: hit.length, fixed: fixed.length };
    }
    return out;
  });
  for (const [j, v] of Object.entries(r)) {
    expect(v.name, j).toBeTruthy();
    expect(v.hit, j + ' loads some moves').toBeGreaterThan(0);
    expect(v.fixed / v.hit, j + ' has safe swaps for most moves').toBeGreaterThan(0.7);
  }
  await page.evaluate(() => { UI.tab = 'plan'; rerender(); });
  await page.click('#injcard [data-a="injadd"][data-v="nk"]');
  await expect(page.locator('#injcard .injrow')).toContainText('Neck');
  await expect(page.locator('#injcard')).toContainText('not medical advice');
  noErrors(page);
});

test('Home asks to protect data until backup is on, and a failed save is reported', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { S.logs[addD(todayS(), -2)] = { s0: { ex: 'bbBench', sets: [{ w: '60', r: '5', d: 1 }] } }; save(); UI.tab = 'home'; rerender(); });
  await expect(page.locator('.protect')).toContainText('only on this phone');
  await page.click('[data-a="bklater"]');
  await expect(page.locator('.protect')).toHaveCount(0);
  await page.evaluate(() => { const orig = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new DOMException('full', 'QuotaExceededError'); }; save(); Storage.prototype.setItem = orig; });
  await expect(page.locator('#toast')).toContainText('out of storage');
});
