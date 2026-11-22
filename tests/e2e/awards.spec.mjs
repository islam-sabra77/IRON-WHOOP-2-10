import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

// a few weeks of finished sessions with rising weights
async function seed(page) {
  await page.evaluate(() => {
    const t = todayS(); let n = 0;
    S.start = addD(sunOf(t), -28); S.end = addD(S.start, 83); PHC = {};
    for (let d = addD(t, -27); d < t; d = addD(d, 1)) {
      const bl = blocksFor(d); if (!bl.length) continue; n++;
      const l = {}; bl.forEach((b) => b.items.forEach((it) => { const e = E[it.ex]; l[it.slot] = { ex: it.ex, sets: [{ w: e.bw || e.t ? '' : String(40 + n * 2.5), r: '8', d: 1 }] }; }));
      l._x = { m0: 1, m1: 1, z0: 1, w0: 1 }; S.logs[d] = l; S.done[d] = { t: Date.now() };
    }
    HISTCACHE = null; save();
  });
}

test('badges are worked out from training, dated, and celebrated once', async ({ page }) => {
  await openApp(page);
  await seed(page);
  const r = await page.evaluate(() => { awardsAfter(); return { b: Object.keys(S.badges), first: awStats().sessions, prs: awStats().prs.length }; });
  expect(r.first).toBeGreaterThanOrEqual(10);
  expect(r.b).toEqual(expect.arrayContaining(['first', 's10', 'pr1']));
  expect(r.prs).toBeGreaterThan(0);
  // a newly earned badge pops up after the first check
  await page.evaluate(() => { delete S.badges.s10; save(); rerender(); });
  await expect(page.locator('#awburst')).toContainText('Getting going');
  noErrors(page);
});

test('the Achievements page, weekly goal card and monthly recap', async ({ page }) => {
  await openApp(page);
  await seed(page);
  await page.evaluate(() => { UI.tab = 'home'; rerender(); });
  await expect(page.locator('.wkcard')).toContainText('weekly goal');
  await page.evaluate(() => { UI.tab = 'more'; rerender(); });
  await page.click('[data-a="tab"][data-v="awards"]');
  await expect(page.locator('h2.pagetitle')).toHaveText('Achievements');
  expect(await page.locator('.awb').count()).toBe(await page.evaluate(() => BADGES.length));
  expect(await page.locator('.awb.on').count()).toBeGreaterThanOrEqual(3);
  await page.locator('.awrecap').first().click();
  await expect(page.locator('.sheet img[alt$="recap"]')).toBeVisible();
  const m = await page.evaluate(() => monthStats(todayS().slice(0, 7)));
  expect(m.sessions).toBeGreaterThan(0);
  noErrors(page);
});
