import { test, expect } from '@playwright/test';
import { openApp, noErrors, liftingDay, openDay } from './helpers.mjs';

const restDay = (page) => page.evaluate(() => { for (let i = 0; i < 14; i++) { const d = addD(todayS(), i); if (T[tplOf(d)] && T[tplOf(d)].k === 'rest') return d; } });

test('every day has the customize bar, even rest days and with cardio collapsed', async ({ page }) => {
  await openApp(page);
  const r = await restDay(page), l = await liftingDay(page);
  await page.evaluate(() => { S.col = { cardio: true }; save(); });
  for (const d of [r, l]) {
    await openDay(page, d);
    await expect(page.locator('.daytools [data-a="mvopen"]')).toBeVisible();
    await expect(page.locator('.daytools [data-a="cdopen"]')).toBeVisible();
    await expect(page.locator('.daytools [data-a="actnew"]')).toBeVisible();
  }
  noErrors(page);
});

test('cardio can be added to a rest day and removed again', async ({ page }) => {
  await openApp(page);
  const d = await restDay(page);
  expect(await page.evaluate((d) => cardioFor(d), d)).toBeNull();
  await openDay(page, d);
  await expect(page.locator('.daytools [data-a="cdopen"]')).toContainText('Add cardio');
  await page.click('.daytools [data-a="cdopen"]');
  await page.click('[data-a="cdset"][data-f="a"][data-v="padel"]');
  await page.click('[data-a="cdset"][data-f="z"][data-v="free"]');
  await page.click('[data-a="cdsave"]');
  expect(await page.evaluate((d) => cardioFor(d).m, d)).toContain('Padel');
  await expect(page.locator('.cardio')).toContainText('Padel');
  await page.click('.daytools [data-a="cdopen"]');
  await page.click('[data-a="cdreset"]');
  expect(await page.evaluate((d) => cardioFor(d), d)).toBeNull();
  noErrors(page);
});

test('any move can be added to a day or every session, logged, and removed', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page);
  const other = await page.evaluate((d) => { const k = tplOf(d); for (let i = 1; i < 40; i++) { const x = addD(d, i); if (tplOf(x) === k) return x; } }, d);
  await openDay(page, d);
  await page.click('.daytools [data-a="mvopen"]');
  await page.fill('#mvq', 'hammer curl');
  const id = await page.locator('.mvlist [data-a="mvpick"]').first().getAttribute('data-v');
  await page.locator('.mvlist [data-a="mvpick"]').first().click();
  await page.click('[data-a="mvscope"][data-v="all"]');
  await page.click('[data-a="mvadd"]');
  const r = await page.evaluate(({ d, other, id }) => ({ here: blocksFor(d).some((b) => b.added && b.items.some((it) => it.ex === id)), there: blocksFor(other).some((b) => b.added && b.items.some((it) => it.ex === id)) }), { d, other, id });
  expect(r).toEqual({ here: true, there: true });
  // it logs like any other move
  const k = await page.locator('button[data-a="set"][data-k^="sa-"]').first().getAttribute('data-k');
  await page.fill(`input[data-in="w"][data-k="${k}"]`, '14'); await page.press(`input[data-in="w"][data-k="${k}"]`, 'Tab');
  expect(await page.evaluate(({ d, slot }) => S.logs[d][slot].sets[0].w, { d, slot: k.split('|')[0] })).toBe('14');
  // remove today only, then from every session
  await page.click(`[data-a="mvdel"][data-v="${id}"]`);
  await page.click('[data-a="mvdel1"]');
  expect(await page.evaluate(({ d, other }) => [addedMoves(d).length, addedMoves(other).length], { d, other })).toEqual([0, 1]);
  await openDay(page, other);
  await page.click(`[data-a="mvdel"][data-v="${id}"]`);
  await page.click('[data-a="mvdelall"]');
  expect(await page.evaluate((other) => addedMoves(other).length, other)).toBe(0);
  noErrors(page);
});

test('moves can be added to a rest day too', async ({ page }) => {
  await openApp(page);
  const d = await restDay(page);
  await openDay(page, d);
  await page.click('.daytools [data-a="mvopen"]');
  await page.click('[data-a="mvgrp"][data-v="core"]');
  await page.locator('.mvlist [data-a="mvpick"]').first().click();
  await page.click('[data-a="mvadd"]');
  expect(await page.evaluate((d) => blocksFor(d).length, d)).toBe(1);
  await expect(page.locator('button[data-a="set"][data-k^="sa-"], button[data-a="tset"][data-k^="sa-"]').first()).toBeVisible();
  // Home links straight to customizing the day
  await page.evaluate((d) => { UI.tab = 'home'; UI.hday = d; rerender(); }, d);
  await expect(page.locator('.hg-sess')).toContainText('Customize this day');
  noErrors(page);
});
