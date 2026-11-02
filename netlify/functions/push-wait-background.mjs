// Background function: waits until each rest-timer alert is due and sends it on the second.
// Netlify background functions can run for up to 15 minutes; longer timers are finished by push-tick.
import { getStore } from '@netlify/blobs';
import { flushJob } from '../lib/push-core.mjs';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export default async (req) => {
  let key; try { ({ key } = await req.json()); } catch { return; }
  if (typeof key !== 'string' || !key.startsWith('job:')) return;
  const store = getStore('push'), stop = Date.now() + 14.5 * 60_000;
  for (;;) {
    const r = await flushJob(store, key);
    if (r.done || !r.next || r.next > stop) return;
    await sleep(Math.max(200, r.next - Date.now()));
  }
};
