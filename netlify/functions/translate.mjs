// On-demand Arabic for text that has no built-in translation (exercise cues, supplement details).
// Each string is translated once by Claude Haiku and cached, so repeat requests are free and instant.
//   POST /api/translate  body { lang: 'ar', strings: [..] }  -> { t: { [string]: translation } }
// Needs ANTHROPIC_API_KEY; without it the app simply keeps English.
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { getStore } from '@netlify/blobs';

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map((b) => b.toString(16).padStart(2, '0')).join('');
const Out = z.object({ items: z.array(z.object({ i: z.number().int(), t: z.string() })) });
const PROMPT = `Translate each numbered English string from a fitness app into clear Modern Standard Arabic for a gym-goer.
Rules: keep numbers, units (kg, s, min, %, g, mg, IU), brand names and abbreviations (RPE, HRV, WHOOP, 1RM) as they are; keep exercise equipment terms understandable; keep the same tone and length; do not add explanations. Return every index.`;

async function translateBatch(list) {
  if (globalThis.__ironTranslate) return globalThis.__ironTranslate(list);
  const client = new Anthropic();
  const r = await client.messages.parse({
    model: 'claude-haiku-5-5', max_tokens: 8000, output_config: { effort: 'low', format: zodOutputFormat(Out) },
    messages: [{ role: 'user', content: PROMPT + '\n\n' + list.map((s, i) => `${i}. ${s}`).join('\n') }],
  });
  const out = {}; ((r.parsed_output && r.parsed_output.items) || []).forEach((x) => { if (list[x.i] != null && x.t) out[list[x.i]] = x.t; });
  return out;
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let b; try { b = await req.json(); } catch { return json({ error: 'bad_body' }, 400); }
  if (!b || b.lang !== 'ar' || !Array.isArray(b.strings)) return json({ error: 'bad_body' }, 400);
  const strings = [...new Set(b.strings.filter((s) => typeof s === 'string' && s.trim().length >= 2 && s.length <= 600))].slice(0, 60);
  const store = getStore('translate'), t = {}, miss = [];
  for (const s of strings) { const v = await store.get('ar:' + (await hash(s)), { type: 'json' }); if (v) t[s] = v; else miss.push(s); }
  if (miss.length) {
    if (!process.env.ANTHROPIC_API_KEY && !globalThis.__ironTranslate) return json({ t, error: 'not_configured' }, Object.keys(t).length ? 200 : 501);
    // a daily ceiling so the API key can't be drained
    const day = 'n:' + new Date().toISOString().slice(0, 10), used = (await store.get(day, { type: 'json' })) || 0;
    if (used > 20000) return json({ t, error: 'limit' }, 200);
    await store.setJSON(day, used + miss.length);
    try {
      const got = await translateBatch(miss);
      for (const s of miss) if (got[s]) { t[s] = got[s]; await store.setJSON('ar:' + (await hash(s)), got[s]); }
    } catch (e) { return json({ t, error: 'api' }, Object.keys(t).length ? 200 : 502); }
  }
  return json({ t });
};
export const config = { path: '/api/translate' };
