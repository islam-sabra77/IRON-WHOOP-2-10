import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('without a wearable, the morning check-in gives a recovery score that sets the day', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { UI.tab = 'home'; rerender(); });
  await page.click('.hg-hero [data-a="rcopen"]');
  await expect(page.locator('.sheet h4')).toHaveText('Morning check-in');
  // a bad night: 5 hours, wrecked, sore, high stress
  for (let i = 0; i < 4; i++) await page.click('[data-a="mcsl"][data-v="-0.5"]');
  await page.click('[data-a="mcset"][data-f="sq"][data-v="1"]');
  await page.click('[data-a="mcset"][data-f="sore"][data-v="4"]');
  await page.click('[data-a="mcset"][data-f="stress"][data-v="4"]');
  await page.click('[data-a="mcsave"]');
  const r = await page.evaluate(() => ({ w: S.wdata[todayS()], ready: readyOf(todayS()), rc: S.rcheck[todayS()] }));
  expect(r.w.src).toBe('checkin'); expect(r.w.sleep.dur).toBe(5); expect(r.w.rec).toBeLessThan(34);
  expect(r.ready).toBe('r'); expect(r.rc.stress).toBe(4);
  // Home now shows the recovery gauge
  await expect(page.locator('.hg-hero .hg-gauge')).toBeVisible();
  await expect(page.locator('.hg-hero')).toContainText('Red day');
  // a great night is green
  const g = await page.evaluate(() => checkinScore({ sleep: 8.5, sq: 5, sore: 1, energy: 5, stress: 1 }, todayS()));
  expect(g.lvl).toBe('g');
  noErrors(page);
});

test('Oura readiness flows into the day like WHOOP', async ({ page }) => {
  const t = new Date(); const d = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  await page.route('**/api/oura-data?**', (r) => r.fulfill({ json: { connected: true, records: [{ d, rec: 88, hrv: 62, rhr: 50, dur: 7.8, perf: 85 }] } }));
  await openApp(page);
  await page.evaluate(async () => { S.oura = { pending: Date.now() }; await ouraSync(true); });
  const r = await page.evaluate((d) => ({ c: S.oura.connected, w: S.wdata[d], ready: readyOf(d), live: recLive(), name: recName() }), d);
  expect(r.c).toBe(true); expect(r.live).toBe(true); expect(r.name).toBe('Oura');
  expect(r.w).toMatchObject({ rec: 88, hrv: 62, rhr: 50, src: 'oura' });
  expect(r.ready).toBe('g');
  await page.evaluate(() => { UI.tab = 'home'; rerender(); });
  await expect(page.locator('.hg-hero')).toContainText('Green day');
  noErrors(page);
});

test('Settings lists every recovery source', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { UI.tab = 'home'; rerender(); });
  await page.click('[data-a="recsrc"]');
  const card = page.locator('#set-rec');
  await expect(card).toContainText('morning check-in (no wearable)');
  for (const n of ['WHOOP', 'Oura', 'Apple Health', 'Health Connect', 'Garmin']) await expect(card).toContainText(n);
  noErrors(page);
});
