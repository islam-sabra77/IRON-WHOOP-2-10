// Reads an uploaded InBody result sheet (photo or PDF) and returns its numbers as JSON.
// Needs ANTHROPIC_API_KEY in Netlify → Site configuration → Environment variables.
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { getStore } from '@netlify/blobs';

const num = () => z.number().nullable();
const Segments = z.object({ left_arm: num(), right_arm: num(), trunk: num(), left_leg: num(), right_leg: num() });
const Report = z.object({
  test_date: z.string().nullable().describe('Test date as YYYY-MM-DD'),
  test_time: z.string().nullable().describe('Test time as HH:MM, 24-hour'),
  device: z.string().nullable(),
  height_cm: num(), age: num(), sex: z.string().nullable(),
  weight_kg: num(), total_body_water_l: num(), protein_kg: num(), minerals_kg: num(),
  body_fat_mass_kg: num(), skeletal_muscle_mass_kg: num(), fat_free_mass_kg: num(),
  percent_body_fat: num(), bmi: num(), inbody_score: num(),
  target_weight_kg: num(), weight_control_kg: num(), fat_control_kg: num(), muscle_control_kg: num(),
  waist_hip_ratio: num(), visceral_fat_level: num(), basal_metabolic_rate_kcal: num(), ecw_tbw_ratio: num(),
  segmental_lean_kg: Segments, segmental_lean_pct: Segments, segmental_fat_kg: Segments, segmental_fat_pct: Segments,
});

const PROMPT = `This is an InBody body composition result sheet. Extract the measured values into the schema.
Rules:
- Use the measured value, not the normal range in brackets.
- Weight, fat and muscle control values keep their sign (for example "- 6.4 kg" is -6.4).
- Segmental analysis: the figure's "Left" label is on the left side of the image. Arms are the top pair, legs the bottom pair, trunk in the middle. Give kg and the % evaluation figure for both lean and fat.
- Fat-free mass: use the printed value if shown, otherwise null.
- Use null for anything not printed on this sheet. Do not estimate.
- Dates on InBody sheets are printed as YYYY.MM.DD; return YYYY-MM-DD.`;

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const hash = async (s) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))).map(b => b.toString(16).padStart(2, '0')).join('');

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 501);
  const k = req.headers.get('x-iron-key') || '';
  if (k.length < 32) return json({ error: 'key' }, 401);

  // Simple per-device daily limit so the API key can't be drained.
  const store = getStore('inbody'), day = new Date().toISOString().slice(0, 10), id = 'n:' + (await hash(k)) + ':' + day;
  const used = (await store.get(id, { type: 'json' })) || 0;
  if (used >= 20) return json({ error: 'limit' }, 429);

  let body;
  try { body = await req.json(); } catch { return json({ error: 'bad_body' }, 400); }
  const { data, media_type } = body || {};
  if (typeof data !== 'string' || !data) return json({ error: 'no_file' }, 400);
  if (data.length > 6_500_000) return json({ error: 'too_large' }, 413);
  let block;
  if (media_type === 'application/pdf') block = { type: 'document', source: { type: 'base64', media_type, data } };
  else if (IMAGE_TYPES.includes(media_type)) block = { type: 'image', source: { type: 'base64', media_type, data } };
  else return json({ error: 'type' }, 415);

  await store.setJSON(id, used + 1);
  const client = new Anthropic();
  try {
    const r = await client.messages.parse({
      model: 'claude-haiku-5-5',
      max_tokens: 8000,
      output_config: { effort: 'low', format: zodOutputFormat(Report) },
      messages: [{ role: 'user', content: [block, { type: 'text', text: PROMPT }] }],
    });
    if (r.stop_reason === 'refusal') return json({ error: 'refused' }, 422);
    if (!r.parsed_output) return json({ error: 'unreadable' }, 422);
    return json({ ok: true, report: r.parsed_output });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 429);
    if (e instanceof Anthropic.BadRequestError) return json({ error: 'bad_request', detail: e.message }, 400);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: 'auth' }, 500);
    if (e instanceof Anthropic.APIError) return json({ error: 'api', status: e.status }, 502);
    return json({ error: 'server' }, 500);
  }
};
export const config = { path: '/api/inbody-read' };
