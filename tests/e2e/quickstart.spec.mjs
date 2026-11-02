import { test, expect } from '@playwright/test';

test('quick start builds a plan in a few taps and the first-week guide appears', async ({ page }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.locator('#onb')).toBeVisible();
  await page.click('[data-a="obquick"]');
  const steps = [];
  for (let i = 0; i < 6; i++) {
    const st = await page.evaluate(() => OB_STEPS[UI.ob.step]); steps.push(st);
    if (st === 'review') break;
    await page.click('#onb [data-a="obnext"]');
  }
  expect(steps).toEqual(['goal', 'schedule', 'equip', 'inj', 'review']);
  await Promise.all([page.waitForEvent('load'), page.click('#onb [data-a="obfinish"]')]);
  await page.waitForFunction(() => typeof fwCard === 'function');
  expect(await page.evaluate(() => !!S.prof && Object.keys(S.prof.plan.tpls).length > 0)).toBe(true);
  await page.evaluate(() => { UI.tab = 'home'; rerender(); });
  await expect(page.locator('.fwg')).toContainText('Your first week');
  await expect(page.locator('.fwg .fwi.ok')).toContainText('Build your plan');
  await page.click('.fwg [data-a="fwoff"]');
  await expect(page.locator('.fwg')).toHaveCount(0);
  expect(errors).toEqual([]);
});
