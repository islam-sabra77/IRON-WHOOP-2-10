// Estimates the foods, portions, calories and macros in a meal photo.
// Needs ANTHROPIC_API_KEY in Netlify → Site configuration → Environment variables.
// The photo is only sent to Claude for this one answer; nothing is stored.
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { getStore } from '@netlify/blobs';
import { rateLimit, aiBudget } from '../lib/guard.mjs';

const Item = z.object({
  name: z.string().describe('Short food name, e.g. "Grilled chicken breast"'),
  grams: z.number().describe('Estimated edible portion in grams'),
  kcal: z.number(), protein_g: z.number(), carbs_g: z.number(), fat_g: z.number(),
});
const Meal = z.object({
  is_food: z.boolean().describe('False if the photo does not show food or drink'),
  items: z.array(Item),
  confidence: z.enum(['low', 'medium', 'high']),
  note: z.string().describe('One short sentence: anything hidden or uncertain (oil, sauces, portion size)'),
});
const PROMPT = `Estimate what is in this meal photo for a fitness app's food log.
- List each distinct food or drink with a realistic portion in grams and its calories, protein, carbs and fat for that portion.
- Use typical values for the visible preparation (fried vs grilled, sauces, dressings). Include cooking oil you can see.
- Use plate, cutlery and hands for scale. When unsure, pick a typical portion and say so in the note.
- If the photo is not food, set is_food to false and return no items.`;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map((b) => b.toString(16).padStart(2, '0')).join('');

export default async (req) => {
  { const lim = await rateLimit(getStore('limits'), req, 'meal-photo', 6, 40); if (lim) return lim; }
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 501);
  const k = req.headers.get('x-iron-key') || '';
  if (k.length < 32) return json({ error: 'key' }, 401);
  // per-device daily limit so the API key can't be drained
  const store = getStore('meals'), day = new Date().toISOString().slice(0, 10), id = 'n:' + (await hash(k)) + ':' + day;
  const used = (await store.get(id, { type: 'json' })) || 0;
  if (used >= 15) return json({ error: 'limit' }, 429);
  let body; try { body = await req.json(); } catch { return json({ error: 'bad_body' }, 400); }
  const { data, media_type } = body || {};
  if (typeof data !== 'string' || !data) return json({ error: 'no_file' }, 400);
  if (data.length > 4_000_000) return json({ error: 'too_large' }, 413);
  if (!IMAGE_TYPES.includes(media_type)) return json({ error: 'type' }, 415);
  if (!(await aiBudget(getStore('limits'), 1))) return json({ error: 'busy' }, 429);
  await store.setJSON(id, used + 1);
  const client = new Anthropic();
  try {
    const r = await client.beta.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low', format: betaZodOutputFormat(Meal) },
      messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type, data } }, { type: 'text', text: PROMPT }] }],
    });
    if (r.stop_reason === 'refusal') return json({ error: 'refused' }, 422);
    const m = r.parsed_output;
    if (!m) return json({ error: 'unreadable' }, 422);
    if (!m.is_food || !m.items.length) return json({ error: 'not_food' }, 422);
    return json({ ok: true, meal: m });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429);
    if (e instanceof Anthropic.BadRequestError) return json({ error: 'bad_request' }, 400);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: 'auth' }, 500);
    if (e instanceof Anthropic.APIError) return json({ error: 'api', status: e.status }, 502);
    return json({ error: 'server' }, 500);
  }
};
export const config = { path: '/api/meal-photo' };
