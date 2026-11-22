// Food search and barcode lookup through Open Food Facts (free, open database, no key).
// GET /api/food?q=greek yogurt   -> up to 20 matches
// GET /api/food?code=5000159407236 -> one product by barcode
// Answers are normalised to calories and macros per 100 g, plus the serving size when known.
import { getStore } from '@netlify/blobs';
import { rateLimit } from '../lib/guard.mjs';

const OFF = 'https://world.openfoodfacts.org';
const FIELDS = 'code,product_name,product_name_en,brands,nutriments,serving_size,serving_quantity';
const UA = 'IRON-fitness-app/1.0 (food logging)';
const json = (o, s = 200, extra = {}) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra } });
const r1 = (x) => (x == null || isNaN(x) ? null : Math.round(+x * 10) / 10);

export function normalise(p) {
  if (!p) return null;
  const n = p.nutriments || {}, name = (p.product_name_en || p.product_name || '').trim();
  let kcal = n['energy-kcal_100g'];
  if (kcal == null && n.energy_100g != null) kcal = n.energy_100g / 4.184;
  if (!name || kcal == null) return null;
  const sq = +p.serving_quantity;
  return {
    code: String(p.code || ''), name: name.slice(0, 80), brand: (p.brands || '').split(',')[0].trim().slice(0, 40),
    per100: { kcal: Math.round(kcal), p: r1(n.proteins_100g) ?? 0, c: r1(n.carbohydrates_100g) ?? 0, f: r1(n.fat_100g) ?? 0 },
    serving: sq > 0 && sq < 2000 ? { g: sq, label: String(p.serving_size || sq + ' g').slice(0, 40) } : null,
  };
}

export default async (req) => {
  { const lim = await rateLimit(getStore('limits'), req, 'food', 30, 600); if (lim) return lim; }
  if (req.method !== 'GET') return json({ error: 'method' }, 405);
  const u = new URL(req.url), q = (u.searchParams.get('q') || '').trim().slice(0, 80), code = (u.searchParams.get('code') || '').replace(/\D/g, '');
  const cache = getStore('food');
  try {
    if (code) {
      if (code.length < 6 || code.length > 14) return json({ error: 'code' }, 400);
      const hit = await cache.get('c:' + code, { type: 'json' }); if (hit) return json({ ok: true, item: hit.item }, hit.item ? 200 : 404);
      const r = await fetch(`${OFF}/api/v2/product/${code}.json?fields=${FIELDS}`, { headers: { 'User-Agent': UA } });
      if (r.status === 404) { await cache.setJSON('c:' + code, { item: null }); return json({ error: 'not_found' }, 404); }
      if (!r.ok) return json({ error: 'upstream', status: r.status }, 502);
      const j = await r.json(), item = j && j.status === 1 ? normalise(j.product) : null;
      await cache.setJSON('c:' + code, { item });
      return item ? json({ ok: true, item }) : json({ error: 'not_found' }, 404);
    }
    if (q.length < 2) return json({ error: 'query' }, 400);
    const key = 'q:' + q.toLowerCase(), hit = await cache.get(key, { type: 'json' });
    if (hit && Date.now() - hit.t < 7 * 864e5) return json({ ok: true, items: hit.items });
    const r = await fetch(`${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=24&fields=${FIELDS}`, { headers: { 'User-Agent': UA } });
    if (!r.ok) return json({ error: 'upstream', status: r.status }, 502);
    const j = await r.json(), items = (j.products || []).map(normalise).filter(Boolean).slice(0, 20);
    await cache.setJSON(key, { t: Date.now(), items });
    return json({ ok: true, items });
  } catch (e) {
    return json({ error: 'server' }, 502);
  }
};
export const config = { path: '/api/food' };
