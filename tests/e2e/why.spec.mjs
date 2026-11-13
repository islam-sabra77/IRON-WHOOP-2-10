import { test, expect } from '@playwright/test';
import { openApp, noErrors, openDay, liftingDay } from './helpers.mjs';

// first accessory or arm move of the day: the roles a Yellow day trims
const accessory = (page, d) => page.evaluate((d) => {
  for (const b of blocksFor(d)) for (const it of b.items) if (it.role === 'acc' || it.role === 'arm') return { slot: it.slot, sets: it.rx.sets, base: it.rx.base, adj: it.rx.adj };
  return null;
}, d);

test('a standard day shows no adjustments', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page);
  await openDay(page, d);
  await expect(page.locator('.whycard')).toHaveCount(0);
  await expect(page.locator('.whyline')).toHaveCount(0);
  noErrors(page);
});

test('a Yellow day you set yourself explains what changed and why', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page);
  await openDay(page, d);
  const before = await accessory(page, d);
  await page.click('[data-a="ready"][data-v="y"]');
  const card = page.locator('.whycard');
  await expect(card).toContainText('Yellow day: lighter session');
  await expect(card).toContainText('Because you set this day to Yellow.');
  const after = await accessory(page, d);
  expect(after.sets).toBe(before.sets - 1);
  expect(after.adj).toContain('y-');
  const line = page.locator(`.whyline[data-k="${after.slot}"]`);
  await expect(line).toContainText('−1 set');
  await expect(line).toContainText('Yellow day');
  await line.click();
  const panel = page.locator('#panel');
  await expect(panel).toContainText('Why this today');
  await expect(panel.locator('.whybox').first()).toContainText(after.base + ' ×');
  await expect(panel.locator('.whybox.on')).toContainText(after.sets + ' ×');
  await expect(panel).toContainText('You set this day to Yellow');
  noErrors(page);
});

test('a WHOOP-driven Yellow day quotes the recovery numbers', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page);
  await page.evaluate((d) => {
    S.whoop.connected = true; S.whoop.auto = true;
    for (let i = 1; i <= 12; i++) S.wdata[addD(d, -i)] = { rec: 80, hrv: 60, rhr: 50 };
    S.wdata[d] = { rec: 70, hrv: 45, rhr: 51 };
    save();
  }, d);
  await openDay(page, d);
  const card = page.locator('.whycard');
  await expect(card).toContainText('Yellow day: lighter session');
  await expect(card).toContainText('Because WHOOP recovery 70%, HRV 25% below your 30-day average.');
  const a = await accessory(page, d);
  await expect(page.locator(`.whyline[data-k="${a.slot}"]`)).toContainText('WHOOP recovery 70%');
  noErrors(page);
});

test('a Red day says lifting is off and why', async ({ page }) => {
  await openApp(page);
  const d = await liftingDay(page);
  await openDay(page, d);
  await page.click('[data-a="ready"][data-v="r"]');
  await expect(page.locator('.whycard')).toContainText('Red day: recovery only');
  await expect(page.locator('.whycard')).toContainText('Because you set this day to Red.');
  noErrors(page);
});

test('deload and rotation are explained on the exercise', async ({ page }) => {
  await openApp(page);
  const r = await page.evaluate(() => {
    let dl = null, rot = null;
    for (let i = 0; i < 120 && !(dl && rot); i++) {
      const d = addD(S.start, i); if (!inPlan(d)) break;
      for (const b of blocksFor(d)) for (const it of b.items) {
        if (!dl && it.rx.adj.includes('dl')) dl = { d, slot: it.slot };
        if (!rot && it.orig !== it.base && it.ex === it.base) rot = { d, slot: it.slot, from: E[it.orig].n };
      }
    }
    return { dl, rot };
  });
  expect(r.dl).not.toBeNull();
  await openDay(page, r.dl.d);
  await expect(page.locator(`.whyline[data-k="${r.dl.slot}"]`)).toContainText('Deload week');
  if (r.rot) {
    await openDay(page, r.rot.d);
    await expect(page.locator('.whycard')).toContainText('rotation');
    await expect(page.locator('.whycard')).toContainText(r.rot.from);
  }
  noErrors(page);
});
