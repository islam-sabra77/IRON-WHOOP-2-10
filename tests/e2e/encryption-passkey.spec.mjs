import { test, expect } from '@playwright/test';
import { openApp, noErrors } from './helpers.mjs';

test('backups are encrypted: the server never sees the code or the data', async ({ page, request }) => {
  await openApp(page);
  await page.evaluate(() => { S.logs['2026-10-20'] = { 's0-0': { ex: 'incDB', sets: [{ w: '33.5', r: '10', d: 1 }] } }; save(); syncTurnOn(); });
  await expect.poll(() => page.evaluate(() => !!(S.sync && S.sync.at && S.sync.e2e))).toBe(true);
  const { code, token } = await page.evaluate(async () => ({ code: S.sync.key, token: (await syncKeys(S.sync.key)).token }));
  expect((await request.get('/api/sync', { headers: { 'x-iron-sync': code } })).status()).toBe(404);
  const stored = await (await request.get('/api/sync', { headers: { 'x-iron-sync': token } })).json();
  expect(stored.state).toBeUndefined();
  expect(stored.enc.ct.length).toBeGreaterThan(100);
  expect(JSON.stringify(stored)).not.toContain('33.5');
  noErrors(page);
});

test('an older plain backup moves to encrypted storage', async ({ page, request }) => {
  await openApp(page);
  const code = Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''); // fresh per run so earlier runs can't interfere
  await request.put('/api/sync', { headers: { 'x-iron-sync': code, 'content-type': 'application/json' }, data: { updated: 1000, state: { start: '2026-09-28', logs: { '2026-10-10': { 's0-0': { ex: 'incDB', sets: [{ w: '40', r: '8', d: 1 }] } } } } } });
  globalThis.__promptAnswer = code;
  await Promise.all([page.waitForEvent('load'), page.evaluate((c) => syncLink(c, true), code)]);
  await expect.poll(() => page.evaluate(() => typeof S !== 'undefined' && !!S.logs['2026-10-10'])).toBe(true);
  await page.evaluate(() => syncNow(true));
  await expect.poll(async () => (await request.get('/api/sync', { headers: { 'x-iron-sync': code } })).status()).toBe(404);
});

test('passkey signs in on a fresh install and restores the backup', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true, hasPrf: true } });
  await openApp(page);
  await page.evaluate(() => { S.logs['2026-10-25'] = { 's0-0': { ex: 'csRow', sets: [{ w: '27.5', r: '12', d: 1 }] } }; save(); syncTurnOn(); });
  await expect.poll(() => page.evaluate(() => !!(S.sync && S.sync.at))).toBe(true);
  await page.evaluate(() => passkeyRegister());
  await expect.poll(() => page.evaluate(() => S.sync.pk && S.sync.pk.prf)).toBe(true);
  // simulate a new install on a phone that has the same (synced) passkey
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.locator('[data-a="pksignin"]').first()).toBeVisible();
  await Promise.all([page.waitForEvent('load'), page.click('[data-a="pksignin"] >> nth=0')]);
  await expect.poll(() => page.evaluate(() => typeof S !== 'undefined' && !!S.logs['2026-10-25'])).toBe(true);
  expect(await page.evaluate(() => syncOn())).toBe(true);
});
