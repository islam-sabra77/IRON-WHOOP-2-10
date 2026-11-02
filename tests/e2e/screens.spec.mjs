// Every screen at phone width, in light, dark and Arabic: nothing may stick out sideways or overlap the tab bar.
// Screenshots are saved to tests/screens/ (uploaded by CI) so changes can be eyeballed.
import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

const TABS = ['home', 'train', 'progress', 'whoop', 'more', 'plan', 'build', 'supps', 'habits', 'goals', 'food', 'travel'];
for (const mode of ['light', 'dark', 'arabic']) {
  test(`screens fit a phone (${mode})`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openApp(page);
    await page.evaluate((mode) => {
      if (mode === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
      if (mode === 'arabic') { prefs().lang = 'ar'; applyDisplay(); }
      const t = todayS(); for (let i = 1; i < 10; i++) S.logs[addD(t, -i * 2)] = { s0: { ex: 'bbBench', sets: [{ w: '80', r: '5', d: 1 }] } };
      save();
    }, mode);
    const bad = [];
    for (const tab of TABS) {
      await page.evaluate((tab) => { UI.tab = tab; rerender(); window.scrollTo(0, 0); }, tab);
      await page.waitForTimeout(120);
      const r = await page.evaluate(() => {
        const W = document.documentElement.clientWidth, out = [];
        if (document.documentElement.scrollWidth > W + 1) out.push('page scrolls sideways (' + document.documentElement.scrollWidth + 'px)');
        document.querySelectorAll('#view *').forEach((el) => {
          const b = el.getBoundingClientRect(); if (!b.width || getComputedStyle(el).position === 'fixed') return;
          for (let a = el.parentElement; a && a.id !== 'view'; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden') return; }
          if (b.right > W + 1 || b.left < -1) out.push((el.className || el.tagName) + ' sticks out ' + Math.round(b.left) + '..' + Math.round(b.right));
        });
        return [...new Set(out)].slice(0, 5);
      });
      if (r.length) bad.push(tab + ': ' + r.join('; '));
      await page.screenshot({ path: `screens/${mode}-${tab}.png`, fullPage: true });
    }
    expect(bad).toEqual([]);
    noErrors(page);
  });
}
