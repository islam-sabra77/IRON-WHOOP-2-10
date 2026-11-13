import { test, expect } from '@playwright/test';
import { openApp, noErrors, liftingDay } from './helpers.mjs';

// logs one set on the first lifting day and returns that week's start
async function logWeek(page) {
  const d = await liftingDay(page);
  return page.evaluate((d) => {
    const it = blocksFor(d)[0].items[0];
    S.logs[d] = { [it.slot]: { ex: it.ex, sets: [{ w: '60', r: '8', d: 1 }] } }; S.done[d] = 1;
    S.prof = S.prof || {}; S.prof.ans = Object.assign({ name: 'Private Name' }, S.prof.ans || {});
    HISTCACHE = null; save(); return sunOf(d);
  }, d);
}

test('coach review asks first, sends only numbers, and is kept for the week', async ({ page }) => {
  await openApp(page);
  const ws = await logWeek(page);
  let sent = null, calls = 0;
  await page.route('**/api/coach', async (r) => { calls++; sent = r.request().postData(); await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, review: { headline: 'A steady first week.', wins: ['You logged 1 set at 60 kg.'], watch: [], next: ['Finish every planned session.'] } }) }); });
  await page.evaluate((ws) => reportSheet(ws), ws);
  const card = page.locator('#panel .aircard');
  await expect(card).toContainText('Your name, notes and photos are never sent');
  expect(calls).toBe(0);
  await card.locator('[data-a="airgo"]').click();
  await expect(card).toContainText('A steady first week.');
  await expect(card).toContainText('What went well');
  await expect(card).toContainText('Finish every planned session.');
  const week = JSON.parse(sent).week;
  expect(week.from).toBe(ws);
  expect(week.volume.sets).toBe(1);
  expect(week.lifts.length).toBe(1);
  expect(sent).not.toContain('Private Name');
  // reopening shows the saved review without another request
  await page.evaluate((ws) => { closeSheet(); reportSheet(ws); }, ws);
  await expect(page.locator('#panel .aircard')).toContainText('A steady first week.');
  expect(calls).toBe(1);
  expect(await page.evaluate((ws) => S.aiRev[ws].r.headline, ws)).toBe('A steady first week.');
  noErrors(page);
});

test('coach review explains failures and stays hidden where it is not set up', async ({ page }) => {
  await openApp(page);
  const ws = await logWeek(page);
  let body = { error: 'limit' }, status = 429;
  await page.route('**/api/coach', (r) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }));
  await page.evaluate((ws) => reportSheet(ws), ws);
  const card = page.locator('#panel .aircard');
  await card.locator('[data-a="airgo"]').click();
  await expect(card).toContainText('today’s limit');
  body = { error: 'not_configured' }; status = 501;
  await card.locator('[data-a="airgo"]').click();
  await expect(card).toContainText('isn’t set up on this server');
  await expect(card.locator('[data-a="airgo"]')).toHaveCount(0);
  noErrors(page);
});

test('an empty week offers no review', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => reportSheet(sunOf(S.start)));
  await expect(page.locator('#panel .aircard')).toContainText('Log a session this week');
  await expect(page.locator('#panel .aircard [data-a="airgo"]')).toHaveCount(0);
  noErrors(page);
});
