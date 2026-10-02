// Starts the WHOOP login. IRON calls /api/whoop-login?k=<device key>
import { getStore } from '@netlify/blobs';
// WHOOP app keys. The secret must live in Netlify environment variables.
const CLIENT_ID = process.env.WHOOP_CLIENT_ID || '7cd8e320-a15a-42d9-a4e8-c913b1eff798';
const CLIENT_SECRET = process.env.WHOOP_CLIENT_SECRET; // set in Netlify → Environment variables (never in code)

export default async (req) => {
  const id = CLIENT_ID;
  if (!process.env.WHOOP_CLIENT_SECRET) return new Response('WHOOP_CLIENT_SECRET is missing. Add it in Netlify: Site configuration → Environment variables, then trigger a new deploy.', { status: 500 });
  if (!id) return new Response('WHOOP_CLIENT_ID is missing. Add it in Netlify: Site configuration → Environment variables, then redeploy.', { status: 500 });
  const url = new URL(req.url), k = url.searchParams.get('k') || '';
  if (k.length < 32) return new Response('Open WHOOP connect from inside IRON (Settings → WHOOP).', { status: 400 });
  const state = crypto.randomUUID().replace(/-/g, '');
  await getStore('whoop').setJSON('state:' + state, { k, t: Date.now() });
  const auth = new URL('https://api.prod.whoop.com/oauth/oauth2/auth');
  auth.search = new URLSearchParams({ client_id: id, redirect_uri: url.origin + '/api/whoop-callback', response_type: 'code', scope: 'offline read:recovery read:cycles read:sleep', state }).toString();
  return new Response(null, { status: 302, headers: { Location: auth.toString() } });
};
export const config = { path: '/api/whoop-login' };
