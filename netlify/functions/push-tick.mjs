// Runs every minute: sends any alert or reminder that is due and has not gone out yet.
// This is the safety net for timers longer than 15 minutes and the sender for daily reminders.
import { getStore } from '@netlify/blobs';
import { flushJob } from '../lib/push-core.mjs';

export default async () => {
  const store = getStore('push');
  const ix = (await store.get('index', { type: 'json' })) || [];
  const keep = [];
  for (const key of ix) {
    const r = await flushJob(store, key);
    if (!r.done || key.startsWith('rem:')) keep.push(key);
  }
  await store.setJSON('index', keep);
  return new Response('ok');
};
export const config = { schedule: '* * * * *' };
