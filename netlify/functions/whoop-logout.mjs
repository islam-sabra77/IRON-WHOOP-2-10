// Disconnects WHOOP: revokes access and deletes the saved login.
import { getStore } from '@netlify/blobs';
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(b => b.toString(16).padStart(2, '0')).join('');
export default async (req) => {
  const k = req.headers.get('x-iron-key') || '';
  if (k.length >= 32) {
    const store = getStore('whoop'), id = 'tok:' + (await hash(k));
    const tok = await store.get(id, { type: 'json' });
    if (tok && tok.at) { try { await fetch('https://api.prod.whoop.com/developer/v2/user/access', { method: 'DELETE', headers: { Authorization: 'Bearer ' + tok.at } }); } catch (e) {} }
    await store.delete(id);
  }
  return new Response('{"ok":true}', { headers: { 'Content-Type': 'application/json' } });
};
export const config = { path: '/api/whoop-logout' };
