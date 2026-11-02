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
