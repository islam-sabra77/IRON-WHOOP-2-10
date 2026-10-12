// In-memory stand-in for @netlify/blobs, so the functions can be exercised
// without a Netlify runtime. Swapped in by test/hooks.mjs.
const stores = new Map();

export function getStore(name) {
	if (!stores.has(name)) stores.set(name, new Map());
	const m = stores.get(name);
	return {
		async get(key, opts) {
			const v = m.get(key);
			if (v === undefined) return null;
			return opts && opts.type === 'json' ? JSON.parse(v) : v;
		},
		async setJSON(key, value) { m.set(key, JSON.stringify(value)); },
		async delete(key) { m.delete(key); },
	};
}

export function __reset() { stores.clear(); }
