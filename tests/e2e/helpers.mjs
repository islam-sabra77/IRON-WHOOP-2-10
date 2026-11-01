import { expect } from '@playwright/test';
// Opens a fresh copy of the app, skips the questionnaire and fails the test on any page error.
export async function openApp(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept(d.type() === 'prompt' ? (globalThis.__promptAnswer || '') : undefined));
  await page.goto('/index.html');
  await page.click('[data-a="obskip"]');
  page.__errors = errors;
  return errors;
}
export function noErrors(page) { expect(page.__errors, 'page errors').toEqual([]); }
// First day in the plan that has a lifting session (with barbell when asked).
export async function liftingDay(page, needBarbell) {
  return page.evaluate((nb) => {
    for (let i = 0; i < 60; i++) {
      const d = addD(S.start, i); const b = blocksFor(d);
      if (b.length && (!nb || b.some((x) => x.items.some((it) => isBarbell(it.ex))))) return d;
    }
    return null;
  }, !!needBarbell);
}
export async function openDay(page, d) { await page.evaluate((d) => { UI.date = d; UI.tab = 'train'; rerender(); }, d); }
