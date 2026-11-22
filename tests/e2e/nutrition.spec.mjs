import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('log food by meal from search, a portion, manual entry and recent foods', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { UI.tab = 'food'; rerender(); });
  await expect(page.locator('.mbar')).toHaveCount(3);
  await page.click('[data-a="nadd"][data-v="l"]');
  await page.fill('#nq', 'chicken breast');
  await page.locator('.nres').first().click();
  await expect(page.locator('.npick')).toContainText('Per 100 g');
  await page.click('[data-a="ngset"]:has-text("2×")');
  await page.click('[data-a="nlog"]');
  const t = await page.evaluate(() => nutTot(todayS()));
  expect(t.list[0]).toMatchObject({ n: 'Chicken breast, cooked', g: 300, meal: 'l', c: 495, p: 93 });
  // manual entry works out calories from macros when they are left empty
  await page.click('[data-a="nadd"][data-v="s"]'); await page.click('[data-a="ntab"][data-v="manual"]');
  await page.fill('#fn', 'Shake'); await page.fill('#fp', '25'); await page.fill('#fcb', '10'); await page.fill('#ff', '2');
  await page.click('[data-a="nmanual"]');
  expect(await page.evaluate(() => nutTot(todayS()).list[1])).toMatchObject({ n: 'Shake', c: 158, meal: 's' });
  // recent foods: one tap
  await page.click('[data-a="nadd"][data-v="d"]'); await page.click('[data-a="ntab"][data-v="recent"]');
  await page.locator('[data-a="nrecent"]').first().click();
  expect(await page.evaluate(() => nutTot(todayS()).list.length)).toBe(3);
  await expect(page.locator('.nmeal').nth(2)).toContainText('Shake');
  noErrors(page);
});

test('barcode lookup and meal photo estimates go through the server', async ({ page }) => {
  await page.route('**/api/food?code=*', (r) => r.fulfill({ json: { ok: true, item: { code: '5000159407236', name: 'Oat bar', brand: 'Brand', per100: { kcal: 420, p: 8, c: 60, f: 15 }, serving: { g: 40, label: '1 bar (40 g)' } } } }));
  await openApp(page);
  await page.evaluate(() => { UI.tab = 'food'; rerender(); });
  await page.click('.nquick [data-t="scan"]');
  await page.fill('#ncode', '5000159407236'); await page.click('[data-a="ncode"]');
  await expect(page.locator('.npick')).toContainText('Oat bar');
  await page.click('[data-a="nlog"]');
  expect(await page.evaluate(() => nutTot(todayS()).list[0])).toMatchObject({ g: 40, c: 168, src: 'off' });
  // photo: the estimate is reviewed, grams can be changed, then all items are added
  await page.click('.nquick [data-t="photo"]');
  await page.evaluate(() => { UI.nadd.est = { confidence: 'medium', note: '', items: [{ name: 'Rice', grams: 200, kcal: 260, protein_g: 5, carbs_g: 56, fat_g: 1 }] }; nAddSheet(); });
  await page.fill('.ngin', '100');
  await page.click('[data-a="nestlog"]');
  expect(await page.evaluate(() => nutTot(todayS()).list[1])).toMatchObject({ n: 'Rice', g: 100, c: 130, src: 'photo' });
  noErrors(page);
});

test('a one-day meal plan lands near the calorie target and can be logged', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => { const P = mealPlan(todayS(), 0); S.foodVeg = true; const V = mealPlan(todayS(), 0); S.foodVeg = false;
    return { kcal: P.tot.kcal, tg: P.tg.kcal, prot: P.tot.p, ptg: P.tg.prot, meat: V.plan.flatMap((x) => x.items).some((i) => /chicken|beef|salmon|tuna|turkey|fish/i.test(i.n)) }; });
  expect(Math.abs(r.kcal - r.tg) / r.tg).toBeLessThan(0.15);
  expect(r.prot).toBeGreaterThan(r.ptg * 0.6);
  expect(r.meat).toBe(false);
  await page.evaluate(() => { UI.tab = 'food'; rerender(); });
  await page.click('[data-a="nplan"]');
  await page.click('[data-a="nplanall"]');
  expect(await page.evaluate(() => nutTot(todayS()).list.length)).toBeGreaterThanOrEqual(8);
  noErrors(page);
});
