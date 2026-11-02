import { test, expect } from '@playwright/test';
import { openApp, noErrors, liftingDay, openDay } from './helpers.mjs';

test('timer bar stays still while counting, so taps always land', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page); await openDay(page, d);
  await page.evaluate(() => startTimer('Rest', [{ l: 'Set 2 is next', s: 90, c: '#2F5BFF' }]));
  const rebuilt = await page.evaluate(() => new Promise((res) => {
    let n = 0; const mo = new MutationObserver((ms) => ms.forEach((m) => { if (m.type === 'childList' && m.target.id === 'timer') n++; }));
    mo.observe(document.getElementById('timer'), { childList: true });
    setTimeout(() => { mo.disconnect(); res(n); }, 2500);
  }));
  expect(rebuilt).toBe(0);
  // buttons respond and the page stays tappable
  await page.click('#timer [data-a="tadj"][data-v="15"]');
  expect(await page.evaluate(() => Math.round((TM.end - Date.now()) / 1000))).toBeGreaterThan(100);
  await page.click('.tab[data-v="progress"]');
  expect(await page.evaluate(() => UI.tab)).toBe('progress');
  await page.click('#timer [data-a="tstop"]');
  await expect(page.locator('#timer')).toBeHidden();
  noErrors(page);
});

test('rest timer schedules a background alert, reschedules on +15 and cancels on stop', async ({ page }) => {
  const calls = [];
  await page.route('**/api/push?step=*', async (r) => { const u = new URL(r.request().url()); calls.push({ step: u.searchParams.get('step'), body: r.request().postDataJSON() }); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await openApp(page);
  await page.evaluate(() => { PUSH_SUB = { endpoint: 'https://push.example/x', keys: { p256dh: 'a', auth: 'b' } }; });
  await page.evaluate(() => startTimer('Rest', [{ l: 'Set 2 is next', s: 90, c: '#2F5BFF' }]));
  await expect.poll(() => calls.filter((c) => c.step === 'schedule').length).toBe(1);
  const first = calls.find((c) => c.step === 'schedule').body.items[0];
  expect(first.title).toBe('Rest is over');
  expect(Math.abs(first.at - Date.now() - 90000)).toBeLessThan(3000);
  await page.click('#timer [data-a="tadj"][data-v="15"]');
  await expect.poll(() => calls.filter((c) => c.step === 'schedule').length).toBe(2);
  expect(calls.filter((c) => c.step === 'cancel').length).toBe(1);
  await page.click('#timer [data-a="tstop"]');
  await expect.poll(() => calls.filter((c) => c.step === 'cancel').length).toBe(2);
  noErrors(page);
});

test('daily reminders are sent to the server with the right times', async ({ page }) => {
  const calls = [];
  await page.route('**/api/push?step=*', async (r) => { calls.push(r.request().postDataJSON()); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await openApp(page);
  await page.evaluate(() => { PUSH_SUB = { endpoint: 'https://push.example/x', keys: { p256dh: 'a', auth: 'b' } }; settingsSheet(); });
  await page.click('#remcard [data-a="remtog"][data-f="bed"]');
  await expect.poll(() => calls.length).toBeGreaterThan(0);
  const body = calls.at(-1);
  expect(body.device).toMatch(/^d/);
  const bed = body.items.filter((i) => i.tag === 'iron-bed');
  expect(bed.length).toBeGreaterThanOrEqual(7);
  const h = await page.evaluate((at) => new Date(at).getHours() + ':' + new Date(at).getMinutes(), bed[0].at);
  expect(h).toBe('22:30');
  await expect(page.locator('#remcard [data-f="bed"]')).toHaveClass(/on/);
  noErrors(page);
});
