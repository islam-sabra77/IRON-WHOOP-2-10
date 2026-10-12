// Resolver hook: points @netlify/blobs at the in-memory stub during tests.
const STUB = new URL('./stubs/netlify-blobs.mjs', import.meta.url).href;

export async function resolve(specifier, context, next) {
	if (specifier === '@netlify/blobs') return next(STUB, context);
	return next(specifier, context);
}
