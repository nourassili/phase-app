import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify, type JWTPayload } from 'jose';

export class AuthError extends Error {
	constructor(message = 'Unauthorized') {
		super(message);
		this.name = 'AuthError';
	}
}

type AuthEnv = {
	SUPABASE_URL?: string;
	SUPABASE_JWT_SECRET?: string;
};

const jwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function supabaseIssuer(supabaseUrl: string): string {
	return `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
}

function getJwks(supabaseUrl: string) {
	const jwksUrl = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;
	let jwks = jwksByUrl.get(jwksUrl);
	if (!jwks) {
		jwks = createRemoteJWKSet(new URL(jwksUrl));
		jwksByUrl.set(jwksUrl, jwks);
	}
	return jwks;
}

export function extractBearer(request: Request): string | null {
	const header = request.headers.get('Authorization');
	if (!header) return null;
	const match = /^Bearer\s+(.+)$/i.exec(header.trim());
	return match?.[1]?.trim() || null;
}

export async function verifySupabaseJwt(token: string, env: AuthEnv): Promise<JWTPayload> {
	let alg: string | undefined;
	try {
		alg = decodeProtectedHeader(token).alg;
	} catch {
		throw new AuthError('Unauthorized');
	}

	const issuer = env.SUPABASE_URL ? supabaseIssuer(env.SUPABASE_URL) : undefined;

	try {
		if (alg === 'HS256') {
			if (!env.SUPABASE_JWT_SECRET) {
				throw new AuthError('Unauthorized');
			}
			const { payload } = await jwtVerify(token, new TextEncoder().encode(env.SUPABASE_JWT_SECRET), {
				algorithms: ['HS256'],
				issuer,
			});
			return payload;
		}

		if (!env.SUPABASE_URL) {
			throw new AuthError('Unauthorized');
		}

		const { payload } = await jwtVerify(token, getJwks(env.SUPABASE_URL), {
			issuer,
		});
		return payload;
	} catch (err) {
		if (err instanceof AuthError) throw err;
		throw new AuthError('Unauthorized');
	}
}

export async function requireAuth(request: Request, env: AuthEnv): Promise<JWTPayload> {
	const token = extractBearer(request);
	if (!token) {
		throw new AuthError('Unauthorized');
	}
	return verifySupabaseJwt(token, env);
}
