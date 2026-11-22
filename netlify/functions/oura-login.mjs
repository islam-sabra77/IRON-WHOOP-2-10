// Starts the Oura login. IRON calls /api/oura-login?k=<device key>
// Needs OURA_CLIENT_ID and OURA_CLIENT_SECRET in Netlify → Environment variables
// (create the app at cloud.ouraring.com/oauth/applications, redirect URI <your site>/api/oura-callback).
import { getStore } from '@netlify/blobs';
import { rateLimit } from '../lib/guard.mjs';

export default async (req) => {
  { const lim = await rateLimit(getStore('limits'), req, 'oura-login', 10, 50); if (lim) return lim; }
  if (!process.env.OURA_CLIENT_ID || !process.env.OURA_CLIENT_SECRET) return new Response('Oura isn’t set up on this site yet: add OURA_CLIENT_ID and OURA_CLIENT_SECRET in Netlify (Site configuration → Environment variables), then redeploy.', { status: 501 });
  const url = new URL(req.url), k = url.searchParams.get('k') || '';
  if (k.length < 32) return new Response('Open Oura connect from inside IRON (Settings → Recovery source).', { status: 400 });
  const state = crypto.randomUUID().replace(/-/g, '');
  await getStore('oura').setJSON('state:' + state, { k, t: Date.now() });
  const auth = new URL('https://cloud.ouraring.com/oauth/authorize');
  auth.search = new URLSearchParams({ client_id: process.env.OURA_CLIENT_ID, redirect_uri: url.origin + '/api/oura-callback', response_type: 'code', scope: 'daily heartrate personal', state }).toString();
  return new Response(null, { status: 302, headers: { Location: auth.toString() } });
};
export const config = { path: '/api/oura-login' };
