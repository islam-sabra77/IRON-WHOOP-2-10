// Shared push code for rest-timer alerts and reminders.
// VAPID keys come from environment variables when set, otherwise they are created once and kept in Blobs.
import webpush from 'web-push';

export async function vapid(store) {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) return { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY };
  let k = await store.get('vapid', { type: 'json' });
  if (!k) { k = webpush.generateVAPIDKeys(); await store.setJSON('vapid', k); }
  return k;
}
// Sends one notification. Returns 'ok', 'gone' (subscription expired) or 'error'.
export async function sendPush(store, sub, msg) {
  if (globalThis.__ironPushSend) return globalThis.__ironPushSend(sub, msg);
  const k = await vapid(store);
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:iron-app@example.com', k.publicKey, k.privateKey);
  try { await webpush.sendNotification(sub, JSON.stringify(msg), { TTL: 300, urgency: 'high' }); return 'ok'; }
  catch (e) { return e && (e.statusCode === 404 || e.statusCode === 410) ? 'gone' : 'error'; }
}
// Sends every due, unsent item of a job (timer or reminders). Marks items before sending so two senders don't double up.
export async function flushJob(store, key, now = Date.now()) {
  const job = await store.get(key, { type: 'json' });
  if (!job || job.cancelled) return { done: true };
  const due = job.items.filter((it) => !it.sent && it.at <= now);
  if (due.length) {
    due.forEach((it) => { it.sent = now; });
    await store.setJSON(key, job);
    for (const it of due) {
      const r = await sendPush(store, job.sub, { title: it.title, body: it.body, tag: it.tag || job.tag || 'iron' });
      if (r === 'gone') { job.cancelled = true; await store.setJSON(key, job); return { done: true }; }
    }
  }
  const left = job.items.filter((it) => !it.sent);
  if (!left.length && job.kind === 'timer') { await store.delete(key); return { done: true }; }
  return { done: !left.length, next: left.length ? Math.min(...left.map((it) => it.at)) : null };
}
export const validSub = (s) => s && typeof s.endpoint === 'string' && /^https:\/\//.test(s.endpoint) && s.keys && typeof s.keys.p256dh === 'string' && typeof s.keys.auth === 'string';
export const cleanItems = (items, max) => (Array.isArray(items) ? items : []).slice(0, max).filter((i) => i && typeof i.at === 'number').map((i) => ({ at: Math.round(i.at), title: String(i.title || 'IRON').slice(0, 80), body: String(i.body || '').slice(0, 160), tag: i.tag ? String(i.tag).slice(0, 40) : undefined }));
