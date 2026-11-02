import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('feedback is sent to the server', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => { UI.tab = 'more'; rerender(); });
  await page.click('[data-a="feedback"]');
  await page.click('[data-a="fbkind"][data-v="problem"]');
  await page.fill('#fbtext', 'The timer froze once');
  const [res] = await Promise.all([page.waitForResponse('**/api/feedback'), page.click('[data-a="fbsend"]')]);
  expect(res.status()).toBe(200);
  expect(res.request().postDataJSON()).toMatchObject({ kind: 'problem', text: 'The timer froze once', tab: 'more' });
  await expect(page.locator('#toast')).toContainText('Thanks');
  noErrors(page);
});

test('delete my data wipes the phone and the cloud copy', async ({ page }) => {
  await openApp(page);
  const deletes = [];
  page.on('request', (r) => { if (r.url().includes('/api/sync') && r.method() === 'DELETE') deletes.push(r.url()); });
  await page.evaluate(() => { S.logs['2026-01-01'] = { s0: { ex: 'benchBB', sets: [{ w: '60', r: '5', d: 1 }] } }; S.sync = { on: true, key: 'a'.repeat(64) }; save(); });
  await page.evaluate(() => { UI.tab = 'more'; rerender(); });
  await page.click('[data-a="privacy"]');
  await page.click('[data-a="wipe1"]');
  await Promise.all([page.waitForEvent('load'), page.click('[data-a="wipe2"]')]);
  await page.waitForFunction(() => typeof S === 'object');
  expect(deletes.length).toBe(1);
  expect(await page.evaluate(() => Object.keys(S.logs).length)).toBe(0);
});
