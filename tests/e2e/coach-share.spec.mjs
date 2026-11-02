import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('coach link opens a read-only encrypted summary, and can be turned off', async ({ page, context }) => {
  await openApp(page);
  await page.evaluate(() => {
    const t = todayS();
    for (let i = 1; i <= 4; i++) S.logs[addD(t, -i * 2)] = { s0: { ex: 'bbBench', sets: [{ w: String(70 + i), r: '5', d: 1 }, { w: '70', r: '6', d: 1 }] } };
    injList().push({ id: 'ix', j: 'kn', from: addD(t, -3), to: '', note: 'Sprain' }); INJCACHE = {};
    save(); UI.tab = 'more'; rerender();
  });
  await page.click('[data-a="coach"]');
  const [res] = await Promise.all([page.waitForResponse((r) => r.url().includes('/api/share') && r.request().method() === 'POST'), page.click('[data-a="coachmake"][data-v="30"]')]);
  expect(res.status()).toBe(200);
  // the server never sees the key or plain data
  const body = res.request().postData();
  expect(body).not.toContain('bbBench');
  expect(body).not.toContain('Barbell bench');
  const url = await page.inputValue('#coachurl');
  expect(url).toMatch(/share\.html#[a-f0-9]{24}\.[a-f0-9]{64}$/);
  const coach = await context.newPage();
  await coach.goto(url);
  await expect(coach.locator('main')).toContainText('Barbell bench press');
  await expect(coach.locator('main')).toContainText('Active injuries');
  await expect(coach.locator('main')).toContainText('Sprain');
  await page.click('[data-a="coachoff"]');
  await expect(page.locator('#toast')).toContainText('turned off');
  await coach.reload();
  await expect(coach.locator('main')).toContainText('expired or was turned off');
  noErrors(page);
});
