import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('cloud backup restores on a second device and merges edits', async ({ browser }) => {
  const a = await (await browser.newContext()).newPage();
  await openApp(a);
  await a.evaluate(() => { S.logs['2026-10-20'] = { 's0-0': { ex: 'incDB', sets: [{ w: '30', r: '10', d: 1 }] } }; save(); });
  await a.evaluate(() => syncTurnOn());
  await expect.poll(() => a.evaluate(() => !!(S.sync && S.sync.at))).toBe(true);
  globalThis.__promptAnswer = await a.evaluate(() => S.sync.key);

  const b = await (await browser.newContext()).newPage();
  b.on('dialog', (d) => d.accept(d.type() === 'prompt' ? globalThis.__promptAnswer : undefined));
  await b.goto('/index.html');
  await Promise.all([b.waitForEvent('load'), b.click('[data-a="oblink"]')]);
  await expect.poll(() => b.evaluate(() => typeof S !== 'undefined' && !!S.logs['2026-10-20'])).toBe(true);

  await b.evaluate(() => { S.logs['2026-10-22'] = { 's0-0': { ex: 'csRow', sets: [{ w: '25', r: '12', d: 1 }] } }; save(); });
  await a.evaluate(() => { S.logs['2026-10-21'] = { 's0-0': { ex: 'ngPulldown', sets: [{ w: '50', r: '10', d: 1 }] } }; save(); });
  await b.evaluate(() => syncNow(true)); await a.evaluate(() => syncNow(true)); await b.evaluate(() => syncNow(true));
  const days = (p) => p.evaluate(() => Object.keys(S.logs).filter((d) => d.startsWith('2026-10-2')).sort());
  expect(await days(a)).toEqual(['2026-10-20', '2026-10-21', '2026-10-22']);
  expect(await days(b)).toEqual(['2026-10-20', '2026-10-21', '2026-10-22']);
  noErrors(a);
});

test('the app opens offline after the first visit', async ({ browser }) => {
  const ctx = await browser.newContext({ serviceWorkers: 'allow' });
  const p = await ctx.newPage();
  await openApp(p);
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload();
  await expect.poll(() => p.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await ctx.setOffline(true);
  await p.reload();
  await expect(p.locator('.tab').first()).toBeVisible();
  await expect(p.locator('#netbadge')).toBeVisible();
  await ctx.setOffline(false);
});

test('errors are recorded', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => logError('test error', 'spec'));
  expect(await page.evaluate(() => errList().map((e) => e.msg))).toContain('test error');
});
