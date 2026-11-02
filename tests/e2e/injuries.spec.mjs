import { test, expect } from '@playwright/test';
import { openApp, noErrors, openDay } from './helpers.mjs';

// a future lifting day with a move that loads the knee
async function kneeDay(page) {
  return page.evaluate(() => {
    for (let i = 1; i < 60; i++) {
      const d = addD(todayS(), i);
      for (const b of blocksFor(d)) for (const it of b.items) if (META[it.ex] && META[it.ex].av.includes('kn')) return { d, slot: it.slot, ex: it.ex };
    }
    return null;
  });
}

test('an injury swaps risky moves, and healing it brings them back', async ({ page }) => {
  await openApp(page);
  const k = await kneeDay(page);
  expect(k).not.toBeNull();
  await page.evaluate(() => { UI.tab = 'plan'; rerender(); });
  await page.click('#injcard [data-a="injadd"][data-v="kn"]');
  await expect(page.locator('#injcard .injrow')).toHaveCount(1);
  const after = await page.evaluate(({ d, slot }) => { for (const b of blocksFor(d)) for (const it of b.items) if (it.slot === slot) return it.ex; }, k);
  expect(after).not.toBe(k.ex);
  expect(await page.evaluate((ex) => META[ex].av.includes('kn'), after)).toBe(false);
  await openDay(page, k.d);
  await expect(page.locator('.injsw').first()).toContainText('protect your knee');

  // the note and start date are editable
  await page.evaluate(() => { UI.tab = 'plan'; rerender(); });
  await page.fill('#injcard [data-in="injnote"]', 'Physio: no deep squats');
  await page.locator('#injcard [data-in="injnote"]').blur();
  expect(await page.evaluate(() => S.injuries[0].note)).toBe('Physio: no deep squats');

  // healed today: future days get the original move again, nothing is swapped
  await page.click('#injcard [data-a="injheal"]');
  const healed = await page.evaluate(({ d, slot }) => { for (const b of blocksFor(d)) for (const it of b.items) if (it.slot === slot) return it.ex; }, k);
  expect(healed).toBe(k.ex);
  await expect(page.locator('#injcard summary')).toContainText('Healed (1)');
  noErrors(page);
});

test('healing a questionnaire injury keeps past logged days as they were', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => {
    const a = Object.assign(obDefaults(), { inj: ['kn'], start: addD(todayS(), -14), weeks: 8 });
    UI.ob = { a, step: 0 }; UI.fresh = false;
    const P = buildPlan(a);
    S.prof = { ans: a, plan: { tpls: P.tpls, mob: P.mob, wu: P.wu, rot: P.rot, target: P.target, cardioRange: P.cardioRange }, sc: P.sc, created: todayS() };
    S.map = P.map; S.start = a.start; S.end = addD(a.start, 55); delete S.injuries;
    save();
  });
  await page.reload();
  await page.waitForFunction(() => typeof injList === 'function');
  // log a past session
  const past = await page.evaluate(() => {
    for (let i = 1; i < 14; i++) { const d = addD(todayS(), -i); const b = blocksFor(d); if (b.length) { const it = b[0].items[0]; S.logs[d] = { [it.slot]: { ex: it.ex, sets: [{ w: '40', r: '8', d: 1 }] } }; save(); return { d, slot: it.slot, ex: it.ex }; } }
  });
  expect(past).toBeTruthy();
  expect(await page.evaluate(() => injList().length)).toBe(1);
  await page.evaluate(() => { UI.tab = 'plan'; rerender(); });
  await Promise.all([page.waitForEvent('load'), page.click('#injcard [data-a="injheal"]')]);
  await page.waitForFunction(() => typeof injList === 'function');
  const r = await page.evaluate(({ d, slot }) => ({ inj: S.prof.ans.inj, ex: blocksFor(d).flatMap((b) => b.items).find((it) => it.slot === slot).ex }), past);
  expect(r.inj).toEqual([]);
  expect(r.ex).toBe(past.ex);
  noErrors(page);
});
