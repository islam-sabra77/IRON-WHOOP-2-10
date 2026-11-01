// Passkey accounts for cloud backup.
// A passkey (Face ID, fingerprint or device PIN) signs you in on a new phone. Your sync code travels
// with it only in encrypted form: it is wrapped with a key that never leaves your passkey (WebAuthn PRF),
// so this server stores data it cannot read.
//   POST /api/passkey?step=reg-options             -> registration options
//   POST /api/passkey?step=reg-verify   {response, wrapped?}
//   POST /api/passkey?step=auth-options            -> sign-in options
//   POST /api/passkey?step=auth-verify  {response, wrapped?} -> { ok, wrapped }
import { getStore } from '@netlify/blobs';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const b64 = (u8) => Buffer.from(u8).toString('base64');
const unb64 = (s) => new Uint8Array(Buffer.from(s, 'base64'));
const okWrapped = (w) => w == null || (typeof w === 'object' && typeof w.iv === 'string' && typeof w.ct === 'string' && w.ct.length < 2000);

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const step = new URL(req.url).searchParams.get('step');
  const rpID = (req.headers.get('host') || '').split(':')[0];
  const origin = req.headers.get('origin') || '';
  let originOk = false; try { originOk = new URL(origin).hostname === rpID; } catch {}
  if (!rpID || !originOk) return json({ error: 'origin' }, 400);
  const store = getStore('passkeys');
  const keepChallenge = async (c, type) => store.setJSON('chal:' + c, { t: Date.now(), type });
  const useChallenge = (type) => async (c) => { const v = await store.get('chal:' + c, { type: 'json' }); await store.delete('chal:' + c); return !!v && v.type === type && Date.now() - v.t < 5 * 60_000; };
  let body = {}; try { body = await req.json(); } catch {}

  if (step === 'reg-options') {
    const options = await generateRegistrationOptions({ rpName: 'IRON', rpID, userName: 'IRON backup', userDisplayName: 'IRON', attestationType: 'none',
      authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' } });
    await keepChallenge(options.challenge, 'reg');
    return json({ options });
  }
  if (step === 'reg-verify') {
    if (!body.response || !okWrapped(body.wrapped)) return json({ error: 'bad_body' }, 400);
    let v; try { v = await verifyRegistrationResponse({ response: body.response, expectedChallenge: useChallenge('reg'), expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: false }); } catch (e) { return json({ error: 'verify', detail: e.message }, 400); }
    if (!v.verified) return json({ error: 'verify' }, 400);
    const c = v.registrationInfo.credential;
    await store.setJSON('cred:' + c.id, { publicKey: b64(c.publicKey), counter: c.counter, transports: c.transports || [], wrapped: body.wrapped || null, created: Date.now() });
    return json({ ok: true, id: c.id });
  }
  if (step === 'auth-options') {
    const options = await generateAuthenticationOptions({ rpID, userVerification: 'preferred', allowCredentials: [] });
    await keepChallenge(options.challenge, 'auth');
    return json({ options });
  }
  if (step === 'auth-verify') {
    if (!body.response || !body.response.id || !okWrapped(body.wrapped)) return json({ error: 'bad_body' }, 400);
    const rec = await store.get('cred:' + body.response.id, { type: 'json' });
    if (!rec) return json({ error: 'unknown_passkey' }, 404);
    let v; try { v = await verifyAuthenticationResponse({ response: body.response, expectedChallenge: useChallenge('auth'), expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: false,
      credential: { id: body.response.id, publicKey: unb64(rec.publicKey), counter: rec.counter, transports: rec.transports } }); } catch (e) { return json({ error: 'verify', detail: e.message }, 400); }
    if (!v.verified) return json({ error: 'verify' }, 400);
    rec.counter = v.authenticationInfo.newCounter; rec.last = Date.now();
    if (body.wrapped) rec.wrapped = body.wrapped;
    await store.setJSON('cred:' + body.response.id, rec);
    return json({ ok: true, wrapped: rec.wrapped });
  }
  return json({ error: 'step' }, 400);
};
export const config = { path: '/api/passkey' };
