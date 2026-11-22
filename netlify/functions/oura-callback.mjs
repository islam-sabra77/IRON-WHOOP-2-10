// Oura sends you back here after you approve access.
import { getStore } from '@netlify/blobs';
import { rateLimit } from '../lib/guard.mjs';

const TOKEN = 'https://api.ouraring.com/oauth/token';
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map((b) => b.toString(16).padStart(2, '0')).join('');
const back = (q) => new Response(null, { status: 302, headers: { Location: '/?' + q } });
export default async (req) => {
  { const lim = await rateLimit(getStore('limits'), req, 'oura-callback', 10, 50); if (lim) return lim; }
  const url = new URL(req.url), store = getStore('oura');
  if (!process.env.OURA_CLIENT_SECRET) return back('oura=error&reason=missing_secret_in_netlify');
  const err = url.searchParams.get('error');
  if (err) return back('oura=error&reason=' + encodeURIComponent(err));
  const code = url.searchParams.get('code'), state = url.searchParams.get('state');
  const pending = state ? await store.get('state:' + state, { type: 'json' }) : null;
  if (!code || !pending || Date.now() - pending.t > 15 * 60 * 1000) return back('oura=error&reason=state');
  await store.delete('state:' + state);
  const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: process.env.OURA_CLIENT_ID, client_secret: process.env.OURA_CLIENT_SECRET, redirect_uri: url.origin + '/api/oura-callback' }) });
  if (!r.ok) return back('oura=error&reason=token_' + r.status);
  const t = await r.json();
  if (!t.access_token) return back('oura=error&reason=no_token');
  await store.setJSON('tok:' + (await hash(pending.k)), { rt: t.refresh_token || null, at: t.access_token, exp: Date.now() + ((t.expires_in || 86400) - 300) * 1000 });
  return back('oura=connected');
};
export const config = { path: '/api/oura-callback' };
