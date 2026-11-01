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
  for (const v of ['plan', 'build', 'progress', 'supps', 'habits', 'travel']) {
    await page.evaluate(() => { UI.tab = 'home'; rerender(); });
    await page.locator(`[data-a="hgo"][data-v="${v}"]`).first().click();
    expect(await page.evaluate(() => UI.tab)).toBe(v);
  }
  noErrors(page);
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
