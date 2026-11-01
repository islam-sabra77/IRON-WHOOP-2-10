import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('lift goal projects a date from the trend', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    const t = todayS();
    [42, 35, 28, 21, 14, 7].forEach((back, i) => { S.logs[addD(t, -back)] = { 's0-0': { ex: 'bbBench', sets: [{ w: String(70 + i * 2.5), r: '5', d: 1 }] } }; });
    save(); HISTCACHE = null;
    const g = { id: 'g1', type: 'lift', ex: 'bbBench', target: 100, start: 80, created: t };
    S.goals = [g]; save();
    return goalStatus(g);
  });
  expect(r.eta).toBeTruthy();
  expect(r.slope).toBeGreaterThan(0);
  await page.evaluate(() => { UI.tab = 'goals'; rerender(); });
  await expect(page.locator('.goal')).toContainText('Projected');
  noErrors(page);
});

test('adding a goal from the sheet', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { UI.tab = 'goals'; rerender(); });
  await page.click('[data-a="goaladd"] >> nth=0');
  await page.click('[data-a="goaltype"][data-v="fat"]');
  await page.fill('#gtarget', '15');
  await page.click('[data-a="goalsave"]');
  expect(await page.evaluate(() => S.goals.map((g) => g.type + ':' + g.target))).toEqual(['fat:15']);
  noErrors(page);
});

test('nutrition targets and quick add', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { S.body[todayS()] = { weight: 80, fat: 20 }; save(); UI.tab = 'food'; rerender(); });
  const tg = await page.evaluate(() => nutTargets(todayS()));
  expect(tg.prot).toBeGreaterThan(100);
  expect(tg.kcal).toBeGreaterThan(1500);
  await page.click('[data-a="foodq"][data-v="0"]');
  expect(await page.evaluate(() => nutDay(todayS()).p)).toBe(25);
  await page.click('[data-a="fooddel"][data-v="0"]');
  expect(await page.evaluate(() => nutDay(todayS()).p)).toBe(0);
  noErrors(page);
});
