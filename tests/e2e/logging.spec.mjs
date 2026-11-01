import { test, expect } from '@playwright/test';
import { openApp, noErrors, liftingDay, openDay } from './helpers.mjs';

async function seedLastTime(page, d) {
  return page.evaluate((d) => {
    const it = blocksFor(d)[0].items[0];
    const prev = addD(d, -7);
    S.logs[prev] = { [it.slot]: { ex: it.ex, sets: [{ w: '50', r: '8', d: 1 }, { w: '50', r: '7', d: 1 }, { w: '47.5', r: '8', d: 1 }] } };
    save(); rerender();
    return it.slot;
  }, d);
}

test('last time is shown on each set', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page); const slot = await seedLastTime(page, d); await openDay(page, d);
  const last = await page.locator(`input[data-in="w"][data-k^="${slot}|"]`).first().locator('xpath=..').locator('.lastv').textContent();
  expect(last).toBe('50');
  noErrors(page);
});

test('extra set, drop set and warm-up ramp', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page); const slot = await seedLastTime(page, d); await openDay(page, d);
  const before = await page.locator(`button[data-a="set"][data-k^="${slot}|"]`).count();
  await page.click(`[data-a="addset"][data-k="${slot}"]`);
  await page.fill(`input[data-in="w"][data-k="${slot}|0"]`, '60'); await page.press(`input[data-in="w"][data-k="${slot}|0"]`, 'Tab');
  await page.click(`[data-a="dropset"][data-k="${slot}"]`);
  expect(await page.locator(`button[data-a="set"][data-k^="${slot}|"]`).count()).toBe(before + 2);
  const drop = await page.evaluate(([d, slot]) => S.logs[d][slot].sets.at(-1), [d, slot]);
  expect(drop.t).toBe('d'); expect(drop.w).toBe('47.5');
  await page.click(`[data-a="wuramp"][data-k="${slot}"]`);
  const ramp = await page.locator('.wramp button').allTextContents();
  expect(ramp).toEqual(['25 kg × 10', '35 kg × 5', '47.5 kg × 3']);
  noErrors(page);
});

test('swiping a set row finishes it', async ({ browser }) => {
  const ctx = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 420, height: 900 } });
  const page = await ctx.newPage();
  await openApp(page);
  const d = await liftingDay(page); await openDay(page, d);
  const row = page.locator('.set').first(); await row.scrollIntoViewIfNeeded();
  const box = await row.boundingBox();
  const k = await row.locator('[data-a="set"]').getAttribute('data-k');
  await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    const t = (cx) => new Touch({ identifier: 1, target: el, clientX: cx, clientY: y });
    el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [t(x)] }));
    for (let i = 1; i <= 6; i++) el.dispatchEvent(new TouchEvent('touchmove', { bubbles: true, touches: [t(x + i * 20)] }));
    el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [] }));
  }, { x: box.x + 8, y: box.y + box.height / 2 });
  const done = await page.evaluate(([d, k]) => { const [sl, i] = k.split('|'); return S.logs[d][sl].sets[+i].d; }, [d, k]);
  expect(done).toBe(1);
  noErrors(page);
});
