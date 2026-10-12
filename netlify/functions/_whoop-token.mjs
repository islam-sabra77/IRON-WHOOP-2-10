// Shared WHOOP token handling for the IRON functions.
//
// This is the one place that talks to WHOOP's token endpoint, because getting
// it wrong is expensive: WHOOP rotates the refresh token on every successful
// refresh and retires the previous one immediately, so a rotation that is not
// stored -- or a stored token thrown away over a transient error -- costs a
// full re-authorization from the phone.
import { getStore } from '@netlify/blobs';

const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
export const API = 'https://api.prod.whoop.com/developer';
export const CLIENT_ID = process.env.WHOOP_CLIENT_ID || '7cd8e320-a15a-42d9-a4e8-c913b1eff798';
const USER_AGENT = 'IRON/1.0 (+https://github.com/islam-sabra77/IRON-WHOOP-2-10)';

/** The stored grant is dead; the device must re-authorize. Safe to drop. */
export class WhoopAuthError extends Error {}
/** Something failed that may well work next time. The stored grant MUST be kept. */
export class WhoopTempError extends Error {}

export const hashKey = async (s) =>
	Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))))
		.map(b => b.toString(16).padStart(2, '0')).join('');

/** Loads the stored grant for a device key, or null when there is none. */
export async function openSession(deviceKey) {
	if (!deviceKey || deviceKey.length < 32) return null;
	const store = getStore('whoop');
	const id = 'tok:' + (await hashKey(deviceKey));
	const tok = await store.get(id, { type: 'json' });
	if (!tok) return null;
	return { store, id, tok, refreshed: false };
}

export async function dropSession(session) {
	await session.store.delete(session.id);
}

async function postRefresh(refreshToken) {
	const secret = process.env.WHOOP_CLIENT_SECRET;
	// A missing secret is a deployment problem, never the device's fault, so it
	// must not be classified as a dead grant.
	if (!secret) throw new WhoopTempError('WHOOP_CLIENT_SECRET is not set');

	let response;
	try {
		response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
			body: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
				client_id: CLIENT_ID,
				client_secret: secret,
				// Required: without it WHOOP issues an access token but no
				// replacement refresh token, so the next refresh has nothing to send.
				scope: 'offline',
			}),
		});
	} catch (e) {
		throw new WhoopTempError(`token endpoint unreachable: ${e.message}`);
	}

	if (response.ok) return response.json();

	const body = await response.text().catch(() => '');
	let code = '';
	try { code = JSON.parse(body).error || ''; } catch { /* not JSON */ }

	// Only an explicitly rejected grant is permanent. Everything else -- 429,
	// 5xx, invalid_client from a bad secret, an unparseable body -- keeps the
	// stored token so a WHOOP blip cannot disconnect the device for good.
	if (code === 'invalid_grant') {
		throw new WhoopAuthError(`refresh token rejected: ${body.slice(0, 200)}`);
	}
	throw new WhoopTempError(`refresh failed: ${response.status} ${code || body.slice(0, 200)}`);
}

async function refresh(session) {
	// One refresh per invocation: concurrent pulls share this session, and a
	// second refresh would present a token WHOOP has already rotated away.
	if (session.refreshed) throw new WhoopAuthError('still unauthorized after refreshing');
	session.refreshed = true;

	const t = await postRefresh(session.tok.rt);
	if (!t.access_token) throw new WhoopTempError('refresh response carried no access token');

	session.tok.at = t.access_token;
	if (t.refresh_token) session.tok.rt = t.refresh_token;
	session.tok.exp = Date.now() + ((t.expires_in || 3600) - 120) * 1000;
	// Store before use: an unsaved rotation is a lockout on the next request.
	await session.store.setJSON(session.id, session.tok);
}

/** Fetches a WHOOP URL, refreshing once if the access token has expired or is rejected. */
export async function authedFetch(session, url) {
	if (!session.tok.at || Date.now() > session.tok.exp) await refresh(session);

	const send = () => fetch(url, {
		headers: { Authorization: 'Bearer ' + session.tok.at, 'User-Agent': USER_AGENT },
	});

	let response;
	try { response = await send(); }
	catch (e) { throw new WhoopTempError(`whoop unreachable: ${e.message}`); }

	if (response.status === 401) {
		await refresh(session);
		try { response = await send(); }
		catch (e) { throw new WhoopTempError(`whoop unreachable: ${e.message}`); }
		if (response.status === 401) throw new WhoopAuthError('unauthorized after refresh');
	}
	return response;
}

/** Walks a paginated collection endpoint. */
export async function pull(session, path, { start, end, maxPages = 6, limit = 25 } = {}) {
	const out = [];
	const seen = new Set();
	let next = null;
	let pages = 0;

	do {
		const u = new URL(API + path);
		u.searchParams.set('limit', String(limit));
		if (start) u.searchParams.set('start', start);
		if (end) u.searchParams.set('end', end);
		if (next) u.searchParams.set('nextToken', next);

		const r = await authedFetch(session, u);
		if (!r.ok) throw new WhoopTempError(`${path} -> HTTP ${r.status}`);

		const j = await r.json();
		for (const record of j.records || []) out.push(record);

		next = j.next_token;
		pages++;
		// A repeated cursor would otherwise spin until the function times out.
		if (next && seen.has(next)) break;
		if (next) seen.add(next);
	} while (next && pages < maxPages);

	return out;
}

// Netlify skips files in the functions directory whose names start with "_",
// so this is a helper module, not an endpoint. The default export exists only
// so that a build which does pick it up deploys something inert rather than
// failing on a missing handler.
export default async () => new Response('Not found', { status: 404 });
