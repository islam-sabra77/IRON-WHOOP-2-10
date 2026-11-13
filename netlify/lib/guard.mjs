// Abuse protection shared by the server functions.
// rateLimit: per-device limits (by IP, hashed so raw addresses are never stored).
// aiBudget: a monthly ceiling on paid AI calls, so a bug or abuse can't run up the Anthropic bill.
const json = (o, s, extra = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });
const sha = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');

export function clientIp(req) {
  return ((req.headers.get('x-nf-client-connection-ip') || (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'local').trim()).slice(0, 64);
}

// Returns a 429 Response when over the limit, otherwise null (and counts this request).
export async function rateLimit(store, req, name, perMin, perDay) {
  if (process.env.IRON_NO_LIMITS === '1') return null;
  const now = Date.now(), min = Math.floor(now / 60_000), day = new Date(now).toISOString().slice(0, 10);
  const key = 'rl:' + name + ':' + (await sha(clientIp(req)));
  let r = null; try { r = await store.get(key, { type: 'json' }); } catch {}
  r = r || {};
  if (r.m !== min) { r.m = min; r.mc = 0; }
  if (r.d !== day) { r.d = day; r.dc = 0; }
  if (r.mc >= perMin) return json({ error: 'rate_limited', retryAfter: 60 - Math.floor((now / 1000) % 60) }, 429, { 'Retry-After': '60' });
  if (r.dc >= perDay) return json({ error: 'rate_limited', retryAfter: 3600 }, 429, { 'Retry-After': '3600' });
  r.mc++; r.dc++;
  try { await store.setJSON(key, r); } catch {}
  return null;
}

// true when the call fits this month's budget (and records it); false when the budget is spent.
export async function aiBudget(store, units = 1) {
  const cap = +(process.env.AI_MONTHLY_CAP || 3000), key = 'ai:' + new Date().toISOString().slice(0, 7);
  const used = (await store.get(key, { type: 'json' })) || 0;
  if (used + units > cap) return false;
  await store.setJSON(key, used + units);
  return true;
}
