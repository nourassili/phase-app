/** Simple per-isolate rate limiter for AI routes (pilot abuse protection). */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

export function checkRateLimit(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
	const now = Date.now();
	let bucket = buckets.get(key);
	if (!bucket || now >= bucket.resetAt) {
		bucket = { count: 0, resetAt: now + WINDOW_MS };
		buckets.set(key, bucket);
	}

	bucket.count += 1;
	if (bucket.count > MAX_REQUESTS) {
		return {
			ok: false,
			retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
		};
	}
	return { ok: true };
}

export function rateLimitKey(request: Request): string {
	const auth = request.headers.get('Authorization') ?? '';
	if (auth.startsWith('Bearer ') && auth.length > 20) {
		return `auth:${auth.slice(7, 39)}`;
	}
	return (
		request.headers.get('CF-Connecting-IP') ||
		request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
		'anonymous'
	);
}
