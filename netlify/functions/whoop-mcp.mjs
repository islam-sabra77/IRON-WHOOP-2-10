// Remote MCP endpoint, so Claude can read your WHOOP data in any chat.
//
// Add it in Claude.ai as a custom connector pointing at
//   https://<your-site>/api/whoop-mcp?k=<your IRON device key>
// The device key is the same one IRON stores locally (Settings -> WHOOP); it is
// hashed before it is used to look up the grant, exactly as /api/whoop-data does.
//
// Read-only: nothing here writes to WHOOP, and the only state it touches is the
// rotated refresh token.
import { openSession, dropSession, authedFetch, pull, API, WhoopAuthError, WhoopTempError } from './_whoop-token.mjs';

const SERVER = { name: 'iron-whoop', version: '1.0.0' };
const DEFAULT_PROTOCOL = '2025-06-18';
const MAX_DAYS = 180;

/* ---------- WHOOP -> IRON day records ---------- */

// Mirrors IRON's own readiness rules (index.html: whoopDay/wAvg) so answers in
// chat agree with what the app shows rather than inventing a second scale.
const GREEN = 67, YELLOW = 34;
const HRV_DROP = -0.10, RHR_RISE = 5;
const BASELINE_DAYS = 30, BASELINE_MIN_SAMPLES = 5;

const hours = v => (v != null ? Math.round(v / 36e3) / 100 : null);
const round1 = v => (v != null ? Math.round(v * 10) / 10 : null);

/** Local calendar date for an instant, at a fixed offset in minutes. */
function dayKey(iso, offsetMinutes) {
	const t = new Date(iso).getTime();
	if (Number.isNaN(t)) return null;
	return new Date(t + offsetMinutes * 60000).toISOString().slice(0, 10);
}

const shiftDay = (key, n) => {
	const d = new Date(key + 'T00:00:00Z');
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
};

/** Mean of a metric over the BASELINE_DAYS days before `key`, skipping calibration days. */
function baseline(days, key, field) {
	const vals = [];
	for (let i = 1; i <= BASELINE_DAYS; i++) {
		const d = days[shiftDay(key, -i)];
		if (d && d[field] != null && !d.calibrating) vals.push(d[field]);
	}
	return vals.length >= BASELINE_MIN_SAMPLES
		? vals.reduce((a, b) => a + b, 0) / vals.length
		: null;
}

/** Folds recovery, sleep and cycle records into one record per calendar day. */
function buildDays({ recovery, sleeps, cycles }, offsetMinutes) {
	const byId = (list, k = 'id') => Object.fromEntries(list.map(x => [x[k], x]));
	const sleepById = byId(sleeps);
	const cycleById = byId(cycles);
	const days = {};

	for (const r of recovery) {
		if (r.score_state !== 'SCORED' || !r.created_at || !r.score) continue;
		const key = dayKey(r.created_at, offsetMinutes);
		if (!key) continue;

		const sl = sleepById[r.sleep_id];
		const cy = cycleById[r.cycle_id];
		const st = sl && sl.score ? sl.score.stage_summary || {} : null;
		const need = sl && sl.score ? sl.score.sleep_needed || {} : null;

		days[key] = {
			date: key,
			recovery: r.score.recovery_score,
			hrv_ms: round1(r.score.hrv_rmssd_milli),
			rhr_bpm: r.score.resting_heart_rate,
			spo2: round1(r.score.spo2_percentage),
			skin_temp_c: round1(r.score.skin_temp_celsius),
			calibrating: !!r.score.user_calibrating,
			sleep: sl && sl.score ? {
				performance_pct: sl.score.sleep_performance_percentage,
				efficiency_pct: sl.score.sleep_efficiency_percentage != null
					? Math.round(sl.score.sleep_efficiency_percentage) : null,
				consistency_pct: sl.score.sleep_consistency_percentage,
				respiratory_rate: round1(sl.score.respiratory_rate),
				asleep_h: hours(st.total_in_bed_time_milli != null
					? st.total_in_bed_time_milli - (st.total_awake_time_milli || 0) : null),
				light_h: hours(st.total_light_sleep_time_milli),
				deep_h: hours(st.total_slow_wave_sleep_time_milli),
				rem_h: hours(st.total_rem_sleep_time_milli),
				awake_h: hours(st.total_awake_time_milli),
				// Same total IRON shows: baseline plus debt plus strain, less nap credit.
				need_h: hours((need.baseline_milli || 0) + (need.need_from_sleep_debt_milli || 0)
					+ (need.need_from_recent_strain_milli || 0) - (need.need_from_recent_nap_milli || 0)),
				disturbances: st.disturbance_count,
				cycles: st.sleep_cycle_count,
				is_nap: !!sl.nap,
				bedtime: sl.start,
				wake: sl.end,
			} : null,
			strain: cy && cy.score ? round1(cy.score.strain) : null,
			kcal: cy && cy.score && cy.score.kilojoule != null
				? Math.round(cy.score.kilojoule / 4.184) : null,
			avg_hr: cy && cy.score ? cy.score.average_heart_rate : null,
			max_hr: cy && cy.score ? cy.score.max_heart_rate : null,
		};
	}
	return days;
}

/** Adds IRON's readiness level and the baseline deltas behind it. */
function assess(days, key) {
	const d = days[key];
	if (!d || d.recovery == null) return null;

	const hrvBase = baseline(days, key, 'hrv_ms');
	const rhrBase = baseline(days, key, 'rhr_bpm');
	const hrvDelta = hrvBase && d.hrv_ms != null ? (d.hrv_ms - hrvBase) / hrvBase : null;
	const rhrDelta = rhrBase && d.rhr_bpm != null ? d.rhr_bpm - rhrBase : null;

	let level = d.recovery >= GREEN ? 'green' : d.recovery >= YELLOW ? 'yellow' : 'red';
	const why = [`Recovery ${Math.round(d.recovery)}%`];
	let adjusted = false;

	if (hrvDelta != null && hrvDelta <= HRV_DROP) {
		adjusted = true;
		why.push(`HRV ${Math.round(-hrvDelta * 100)}% below the 30-day average`);
	}
	if (rhrDelta != null && rhrDelta >= RHR_RISE) {
		adjusted = true;
		why.push(`resting HR ${Math.round(rhrDelta)} bpm above the 30-day average`);
	}
	// IRON downgrades one level when either marker is off, never below red.
	if (adjusted && level !== 'red') level = level === 'green' ? 'yellow' : 'red';

	return {
		...d,
		level,
		adjusted,
		why,
		hrv_baseline_ms: round1(hrvBase),
		rhr_baseline_bpm: round1(rhrBase),
		hrv_vs_baseline_pct: hrvDelta != null ? Math.round(hrvDelta * 1000) / 10 : null,
		rhr_vs_baseline_bpm: rhrDelta != null ? Math.round(rhrDelta * 10) / 10 : null,
		baseline_ready: hrvBase != null || rhrBase != null,
	};
}

/** Consecutive non-green days ending at `key`, which is what IRON warns on at 3. */
function lowStreak(days, key) {
	let n = 0;
	for (let i = 0; i < 3; i++) {
		const a = assess(days, shiftDay(key, -i));
		if (a && a.level !== 'green') n++; else break;
	}
	return n;
}

/* ---------- data loading ---------- */

async function loadWindow(session, days, offsetMinutes) {
	const start = new Date(Date.now() - days * 864e5).toISOString();
	// Pages of 25; enough to cover the window plus slack for naps and nulls.
	const pages = Math.max(2, Math.ceil(days / 25) + 2);

	const recovery = await pull(session, '/v2/recovery', { start, maxPages: pages });
	const [sleeps, cycles] = await Promise.all([
		pull(session, '/v2/activity/sleep', { start, maxPages: pages + 2 }).catch(() => []),
		pull(session, '/v2/cycle', { start, maxPages: pages }).catch(() => []),
	]);

	return buildDays({ recovery, sleeps, cycles }, offsetMinutes);
}

const sortedKeys = days => Object.keys(days).sort();

function series(days, { withSleep = false, withStrain = false } = {}) {
	return sortedKeys(days).map(k => {
		const a = assess(days, k);
		if (!a) return null;
		const row = {
			date: a.date, recovery: a.recovery, level: a.level, adjusted: a.adjusted,
			hrv_ms: a.hrv_ms, rhr_bpm: a.rhr_bpm,
			hrv_vs_baseline_pct: a.hrv_vs_baseline_pct, rhr_vs_baseline_bpm: a.rhr_vs_baseline_bpm,
			calibrating: a.calibrating,
		};
		if (withSleep) row.sleep = a.sleep;
		if (withStrain) {
			row.strain = a.strain; row.kcal = a.kcal; row.avg_hr = a.avg_hr; row.max_hr = a.max_hr;
		}
		return row;
	}).filter(Boolean);
}

const mean = xs => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

function summarize(rows, field) {
	const vals = rows.map(r => r[field]).filter(v => v != null);
	if (!vals.length) return null;
	return {
		n: vals.length,
		mean: Math.round(mean(vals) * 10) / 10,
		min: Math.round(Math.min(...vals) * 10) / 10,
		max: Math.round(Math.max(...vals) * 10) / 10,
		last_7_mean: Math.round(mean(vals.slice(-7)) * 10) / 10,
	};
}

/* ---------- tools ---------- */

const daysParam = (extra = '') => ({
	type: 'object',
	properties: {
		days: { type: 'integer', minimum: 1, maximum: MAX_DAYS, default: 45,
			description: `How many days back to read (1-${MAX_DAYS}).` },
		tz_offset_minutes: { type: 'integer', minimum: -840, maximum: 840, default: 0,
			description: 'Offset from UTC used to bucket records into calendar days, e.g. 180 for UTC+3.' },
	},
	additionalProperties: false,
	...(extra ? { description: extra } : {}),
});

const TOOLS = [
	{
		name: 'whoop_today',
		title: 'Today’s WHOOP readiness',
		description: 'The most recent scored day: recovery, HRV and resting HR against their 30-day '
			+ 'baselines, last night’s sleep, yesterday’s strain, and IRON’s readiness level '
			+ '(green/yellow/red) with the reasoning behind it.',
		inputSchema: {
			type: 'object',
			properties: {
				tz_offset_minutes: { type: 'integer', minimum: -840, maximum: 840, default: 0,
					description: 'Offset from UTC used to decide which calendar day a record belongs to.' },
			},
			additionalProperties: false,
		},
		run: async (session, args) => {
			const tz = args.tz_offset_minutes ?? 0;
			const days = await loadWindow(session, 45, tz);
			const keys = sortedKeys(days);
			if (!keys.length) {
				return { connected: true, latest: null,
					note: 'No scored recovery in the last 45 days. WHOOP scores a day once its sleep is processed.' };
			}
			const key = keys[keys.length - 1];
			const latest = assess(days, key);
			const recent = series(days).slice(-14);
			return {
				latest,
				low_streak: lowStreak(days, key),
				low_streak_note: lowStreak(days, key) >= 3
					? 'Three or more non-green days in a row; IRON suggests lightening the rest of the week.' : null,
				last_14_days: recent,
				trailing_means: {
					recovery: summarize(recent, 'recovery'),
					hrv_ms: summarize(recent, 'hrv_ms'),
					rhr_bpm: summarize(recent, 'rhr_bpm'),
				},
			};
		},
	},
	{
		name: 'whoop_recovery',
		title: 'Recovery history',
		description: 'Daily recovery score, HRV and resting heart rate with 30-day baseline deltas '
			+ 'and IRON readiness levels, for trend and correlation questions.',
		inputSchema: daysParam(),
		run: async (session, args) => {
			const tz = args.tz_offset_minutes ?? 0;
			const days = await loadWindow(session, clampDays(args.days), tz);
			const rows = series(days);
			return {
				days: rows,
				summary: {
					recovery: summarize(rows, 'recovery'),
					hrv_ms: summarize(rows, 'hrv_ms'),
					rhr_bpm: summarize(rows, 'rhr_bpm'),
					level_counts: rows.reduce((acc, r) => ({ ...acc, [r.level]: (acc[r.level] || 0) + 1 }), {}),
				},
			};
		},
	},
	{
		name: 'whoop_sleep',
		title: 'Sleep history',
		description: 'Per-night sleep: time asleep, stage breakdown, sleep need, performance, '
			+ 'efficiency, consistency, respiratory rate and disturbances. Naps are flagged, not merged.',
		inputSchema: daysParam(),
		run: async (session, args) => {
			const tz = args.tz_offset_minutes ?? 0;
			const days = await loadWindow(session, clampDays(args.days), tz);
			const rows = series(days, { withSleep: true }).filter(r => r.sleep);
			const flat = rows.map(r => ({ date: r.date, ...r.sleep }));
			return {
				nights: rows,
				summary: {
					asleep_h: summarize(flat, 'asleep_h'),
					performance_pct: summarize(flat, 'performance_pct'),
					efficiency_pct: summarize(flat, 'efficiency_pct'),
					need_h: summarize(flat, 'need_h'),
					deep_h: summarize(flat, 'deep_h'),
					rem_h: summarize(flat, 'rem_h'),
				},
			};
		},
	},
	{
		name: 'whoop_strain',
		title: 'Strain history',
		description: 'Daily strain, calories, average and max heart rate, for training-load questions '
			+ 'and for comparing load against next-day recovery.',
		inputSchema: daysParam(),
		run: async (session, args) => {
			const tz = args.tz_offset_minutes ?? 0;
			const days = await loadWindow(session, clampDays(args.days), tz);
			const rows = series(days, { withStrain: true });
			return {
				days: rows,
				summary: {
					strain: summarize(rows, 'strain'),
					kcal: summarize(rows, 'kcal'),
					avg_hr: summarize(rows, 'avg_hr'),
					max_hr: summarize(rows, 'max_hr'),
				},
			};
		},
	},
	{
		name: 'whoop_body',
		title: 'Body measurements',
		description: 'Height, weight and max heart rate as WHOOP holds them.',
		inputSchema: { type: 'object', properties: {}, additionalProperties: false },
		run: async (session) => {
			const r = await authedFetch(session, new URL(API + '/v2/user/measurement/body'));
			if (!r.ok) throw new WhoopTempError(`body measurement -> HTTP ${r.status}`);
			const b = await r.json();
			return { height_m: b.height_meter, weight_kg: b.weight_kilogram, max_hr: b.max_heart_rate };
		},
	},
];

function clampDays(v) {
	const n = Number.parseInt(v ?? 45, 10);
	if (!Number.isFinite(n)) return 45;
	return Math.min(MAX_DAYS, Math.max(1, n));
}

/* ---------- JSON-RPC plumbing ---------- */

const json = (body, status = 200) => new Response(JSON.stringify(body), {
	status,
	headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});

const rpcOk = (id, result) => json({ jsonrpc: '2.0', id, result });
const rpcErr = (id, code, message) => json({ jsonrpc: '2.0', id, error: { code, message } });

async function handleRpc(msg, deviceKey) {
	const { id, method, params = {} } = msg;

	if (method === 'initialize') {
		const asked = typeof params.protocolVersion === 'string' ? params.protocolVersion : null;
		return rpcOk(id, {
			protocolVersion: asked || DEFAULT_PROTOCOL,
			capabilities: { tools: { listChanged: false } },
			serverInfo: SERVER,
			instructions: 'WHOOP recovery, sleep and strain for a single IRON user. Readiness levels '
				+ 'match the IRON app: green at 67%+, yellow at 34%+, downgraded one level when HRV is '
				+ '10% or more below its 30-day baseline or resting HR is 5+ bpm above it.',
		});
	}

	if (method === 'ping') return rpcOk(id, {});

	if (method === 'tools/list') {
		return rpcOk(id, {
			tools: TOOLS.map(({ name, title, description, inputSchema }) =>
				({ name, title, description, inputSchema })),
		});
	}

	if (method === 'tools/call') {
		const tool = TOOLS.find(t => t.name === params.name);
		if (!tool) return rpcErr(id, -32602, `Unknown tool: ${params.name}`);

		const session = await openSession(deviceKey);
		if (!session) {
			return rpcOk(id, {
				isError: true,
				content: [{ type: 'text', text: 'WHOOP is not connected for this device key. '
					+ 'Open IRON, go to Settings -> WHOOP and connect, then retry.' }],
			});
		}

		try {
			const result = await tool.run(session, params.arguments || {});
			return rpcOk(id, { content: [{ type: 'text', text: JSON.stringify(result, null, 1) }] });
		} catch (e) {
			if (e instanceof WhoopAuthError) {
				// The grant itself is dead, so clearing it is correct here: IRON
				// will show "disconnected" and prompt a fresh authorization.
				await dropSession(session).catch(() => {});
				return rpcOk(id, {
					isError: true,
					content: [{ type: 'text', text: 'WHOOP access has been revoked or expired. '
						+ 'Reconnect in IRON under Settings -> WHOOP.' }],
				});
			}
			// Transient: the stored grant is deliberately left untouched.
			const detail = e instanceof WhoopTempError ? e.message : 'unexpected error';
			return rpcOk(id, {
				isError: true,
				content: [{ type: 'text', text: `Could not read WHOOP right now (${detail}). `
					+ 'This is usually temporary; the connection is still in place.' }],
			});
		}
	}

	if (typeof method === 'string' && method.startsWith('notifications/')) return null;

	return rpcErr(id, -32601, `Method not found: ${method}`);
}

export default async (req) => {
	const url = new URL(req.url);
	const deviceKey = url.searchParams.get('k') || req.headers.get('x-iron-key') || '';

	if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { Allow: 'POST, OPTIONS' } });
	// Stateless: no server-initiated stream, so the SSE channel is not offered.
	if (req.method !== 'POST') {
		return new Response('This endpoint speaks MCP over HTTP POST.', {
			status: 405, headers: { Allow: 'POST, OPTIONS' },
		});
	}
	if (deviceKey.length < 32) {
		return json({ jsonrpc: '2.0', id: null,
			error: { code: -32001, message: 'Missing or malformed IRON device key. Append ?k=<device key> to the connector URL.' } }, 401);
	}

	let body;
	try { body = await req.json(); }
	catch { return rpcErr(null, -32700, 'Parse error'); }

	// A batch is a JSON array; a single call is an object.
	if (Array.isArray(body)) {
		const out = [];
		for (const msg of body) {
			const res = await handleRpc(msg, deviceKey);
			if (res) out.push(await res.json());
		}
		return out.length ? json(out) : new Response(null, { status: 202 });
	}

	if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
		return rpcErr(body && body.id != null ? body.id : null, -32600, 'Invalid Request');
	}

	const res = await handleRpc(body, deviceKey);
	// Notifications carry no id and get no body.
	return res || new Response(null, { status: 202 });
};

export const config = { path: '/api/whoop-mcp' };
