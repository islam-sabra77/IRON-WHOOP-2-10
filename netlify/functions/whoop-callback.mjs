// WHOOP sends you back here after you approve access.
import { getStore } from '@netlify/blobs';
// WHOOP app keys. The secret must live in Netlify environment variables.
const CLIENT_ID = process.env.WHOOP_CLIENT_ID || '7cd8e320-a15a-42d9-a4e8-c913b1eff798';
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET; // set in Netlify → Environment variables (never in code)

const TOKEN = 'https://api.prod.whoop.com/oauth/oauth2/token';
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(b => b.toString(16).padStart(2, '0')).join('');
const back = (q) => new Response(null, { status: 302, headers: { Location: '/?' + q } });
export default async (req) => {
  const url = new URL(req.url), store = getStore('whoop');
  if (!CLIENT_SECRET) return back('whoop=error&reason=missing_secret_in_netlify');
  const err = url.searchParams.get('error');
  if (err) return back('whoop=error&reason=' + encodeURIComponent(err));
  const code = url.searchParams.get('code'), state = url.searchParams.get('state');
  const pending = state ? await store.get('state:' + state, { type: 'json' }) : null;
  if (!code || !pending || Date.now() - pending.t > 15 * 60 * 1000) return back('whoop=error&reason=state');
  await store.delete('state:' + state);
  const r = await fetch(TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: url.origin + '/api/whoop-callback' }) });
  if (!r.ok) return back('whoop=error&reason=token_' + r.status);
  const t = await r.json();
  if (!t.refresh_token) return back('whoop=error&reason=no_refresh_token');
  await store.setJSON('tok:' + (await hash(pending.k)), { rt: t.refresh_token, at: t.access_token, exp: Date.now() + ((t.expires_in || 3600) - 120) * 1000 });
  return back('whoop=connected');
};
export const config = { path: '/api/whoop-callback' };
