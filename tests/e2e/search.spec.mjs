import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('search finds exercises, supplements and settings from the top bar', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { UI.tab = 'home'; rerender(); });
  await page.click('#topbar [data-a="search"]');
  await page.fill('#srq', 'bench');
  await expect(page.locator('#srlist .sr').first()).toBeVisible();
  await expect(page.locator('#srlist')).toContainText('Bench');
  await page.fill('#srq', 'magnes');
  await expect(page.locator('#srlist')).toContainText('Magnesium');
  await page.locator('#srlist [data-a="srsupp"]').first().click();
  await expect(page.locator('#panel')).toContainText('Supplement guide');
  await page.evaluate(() => closeSheet());
  await page.click('#topbar [data-a="search"]');
  await page.fill('#srq', 'knee');
  await page.locator('#srlist [data-a="srset"][data-v="injcard"]').click();
  await expect(page.locator('#injcard')).toBeVisible();
  await page.evaluate(() => closeSheet());
  await page.click('#topbar [data-a="search"]');
  await page.fill('#srq', 'remind');
  await page.locator('#srlist [data-a="srset"][data-v="remcard"]').click();
  await expect(page.locator('#remcard')).toBeVisible();
  noErrors(page);
});

test('settings has a section bar that jumps to each section', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => settingsSheet());
  for (const id of ['set-display', 'set-workouts', 'remcard', 'set-plan', 'injcard', 'set-whoop', 'set-data']) await expect(page.locator('#panel #' + id)).toHaveCount(1);
  await page.click('[data-a="setjump"][data-v="set-data"]');
  await expect(page.locator('#set-data')).toBeInViewport();
  noErrors(page);
});
