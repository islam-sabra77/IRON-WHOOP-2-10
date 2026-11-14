import { test, expect } from '@playwright/test';
import { openApp, noErrors, liftingDay, openDay } from './helpers.mjs';

test('cardio can be changed for one day or for every session of that type', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page);
  const k = await page.evaluate((d) => tplOf(d), d);
  const other = await page.evaluate(({ d, k }) => { for (let i = 1; i < 40; i++) { const x = addD(d, i); if (tplOf(x) === k) return x; } }, { d, k });
  const before = await page.evaluate((d) => cardioFor(d), d);
  await openDay(page, d);
  await page.click('[data-a="cdopen"]');
  await page.click('[data-a="cdset"][data-f="a"][data-v="padel"]');
  await page.click('[data-a="cdset"][data-f="z"][data-v="free"]');
  await page.click('[data-a="cdmin"][data-v="5"]');
  await page.click('[data-a="cdset"][data-f="scope"][data-v="all"]');
  await page.click('[data-a="cdsave"]');
  const after = await page.evaluate(({ d, other }) => ({ a: cardioFor(d), b: cardioFor(other) }), { d, other });
  expect(after.a.m).toContain('Padel');
  expect(after.a.mins).toBe(before.mins + 5);
  expect(after.b.m).toContain('Padel');
  await expect(page.locator('.cardio')).toContainText('Padel');
  // this day only, then back to the plan
  await page.click('[data-a="cdopen"]');
  await page.click('[data-a="cdset"][data-f="a"][data-v="swimming"]');
  await page.click('[data-a="cdset"][data-f="scope"][data-v="day"]');
  await page.click('[data-a="cdsave"]');
  expect(await page.evaluate(({ d, other }) => [cardioFor(d).m, cardioFor(other).m], { d, other })).toEqual([expect.stringContaining('Swimming'), expect.stringContaining('Padel')]);
  await page.click('[data-a="cdopen"]');
  await page.click('[data-a="cdset"][data-f="scope"][data-v="all"]');
  await page.click('[data-a="cdreset"]');
  expect(await page.evaluate((d) => cardioFor(d).m, d)).toBe(before.m);
  noErrors(page);
});

test('activities like padel can be added once or every week, matched to WHOOP, and warn about injuries', async ({ page }) => {
  await openApp(page);
  const d = await page.evaluate(() => todayS());
  await openDay(page, d);
  await page.click('[data-a="actnew"]');
  await page.fill('#actq', 'pad');
  await expect(page.locator('#actlist [data-v="padel"]')).toBeVisible();
  await expect(page.locator('#actlist [data-v="tennis"]')).toHaveCount(0);
  await page.click('#actlist [data-a="adset"][data-v="padel"]');
  await page.click('[data-a="admin"][data-v="15"]');
  await page.click('[data-a="adset"][data-f="eff"][data-v="hard"]');
  await page.click('[data-a="adset"][data-f="rep"][data-v="1"]');
  await page.fill('#actnote', 'Doubles');
  await page.click('[data-a="adsave"]');
  const r = await page.evaluate((d) => ({ now: actsFor(d), next: actsFor(addD(d, 7)), other: actsFor(addD(d, 1)) }), d);
  expect(r.now[0]).toMatchObject({ a: 'padel', mins: 75, eff: 'hard', note: 'Doubles', rep: 1 });
  expect(r.next[0].a).toBe('padel');
  expect(r.other.length).toBe(0);
  await expect(page.locator('.actcard')).toContainText('Padel');
  await expect(page.locator('.actcard')).toContainText('every');
  // done, WHOOP match and injury warning
  await page.click('.actcard [data-a="actdone"]');
  expect(await page.evaluate((d) => actsFor(d)[0].done, d)).toBe(true);
  await page.evaluate((d) => {
    S.whoop.connected = true; S.wwk = { w1: { id: 'w1', sport: 'padel', d, start: d + 'T18:00:00Z', end: d + 'T19:15:00Z', strain: 13.2, ahr: 142, zones: [1, 2, 3, 2, 1, 0] } };
    injList().push({ id: 'ik', j: 'kn', from: '', to: '', note: '' }); INJCACHE = {}; save(); rerender();
  }, d);
  await expect(page.locator('.actcard .wkchip')).toContainText('13.2');
  await expect(page.locator('.actcard .actwarn')).toContainText('knee');
  // skip next week's game only
  await openDay(page, await page.evaluate((d) => addD(d, 7), d));
  await page.click('.actcard [data-a="actskip"]');
  expect(await page.evaluate((d) => [actsFor(addD(d, 7)).length, actsFor(addD(d, 14)).length], d)).toEqual([0, 1]);
  // Home shows today's activity on the session card
  await page.evaluate(() => { UI.tab = 'home'; UI.hday = todayS(); rerender(); });
  await expect(page.locator('.hg-sess')).toContainText('Padel');
  noErrors(page);
});

test('your own activity can be added by name', async ({ page }) => {
  await openApp(page);
  await openDay(page, await page.evaluate(() => todayS()));
  await page.click('[data-a="actnew"]');
  await page.fill('#actq', 'Spikeball');
  await page.click('#actlist [data-a="adset"][data-v="c:Spikeball"]');
  await page.click('[data-a="adsave"]');
  await expect(page.locator('.actcard')).toContainText('Spikeball');
  await page.click('.actcard [data-a="actdel"]');
  await expect(page.locator('.actcard')).toHaveCount(0);
  noErrors(page);
});
