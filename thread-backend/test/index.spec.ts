import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';
import worker from '../src/index';

const TEST_SUPABASE_URL = 'https://example.supabase.co';
const TEST_JWT_SECRET = 'test-supabase-jwt-secret-for-vitest';
const TEST_ISSUER = `${TEST_SUPABASE_URL}/auth/v1`;

function authEnv(overrides: Partial<Env> = {}): Env {
	return {
		AZURE_API_KEY: '',
		SUPABASE_URL: TEST_SUPABASE_URL,
		SUPABASE_JWT_SECRET: TEST_JWT_SECRET,
		CORS_ORIGINS: '*',
		...overrides,
	} as Env;
}

async function signTestJwt(overrides: { exp?: number } = {}): Promise<string> {
	return new SignJWT({ role: 'authenticated', sub: 'user-test-id' })
		.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
		.setIssuer(TEST_ISSUER)
		.setIssuedAt()
		.setExpirationTime(overrides.exp ?? '5m')
		.sign(new TextEncoder().encode(TEST_JWT_SECRET));
}

describe('thread-backend', () => {
	it('responds to /health without Azure secrets', async () => {
		const request = new Request('http://example.com/health');
		const response = await worker.fetch(request, {} as Env);
		expect(response.status).toBe(200);
		const body = (await response.json()) as { ok: boolean };
		expect(body.ok).toBe(true);
	});

	it('returns 401 for /chat without Authorization', async () => {
		const request = new Request('http://example.com/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
		});
		const response = await worker.fetch(request, authEnv());
		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBe('Unauthorized');
	});

	it('returns 401 for /chat with an invalid Bearer token', async () => {
		const request = new Request('http://example.com/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer not-a-jwt',
			},
			body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
		});
		const response = await worker.fetch(request, authEnv());
		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBe('Unauthorized');
	});

	it('passes auth with a valid JWT then fails Azure env (proves gate)', async () => {
		const token = await signTestJwt();
		const request = new Request('http://example.com/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }] }),
		});
		// Incomplete Azure env → 500 after auth succeeds (not 401).
		const response = await worker.fetch(
			request,
			authEnv({
				AZURE_API_KEY: '',
				AZURE_ENDPOINT: undefined as unknown as string,
			}),
		);
		expect(response.status).toBe(500);
		const body = (await response.json()) as { error: string };
		expect(body.error).toMatch(/Azure env incomplete/i);
	});

	it('returns 401 for /insights/pattern without Authorization', async () => {
		const request = new Request('http://example.com/insights/pattern', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ profile: null, entries: [] }),
		});
		const response = await worker.fetch(request, authEnv());
		expect(response.status).toBe(401);
	});

	it('returns 400 for /chat with invalid messages after auth', async () => {
		const token = await signTestJwt();
		const request = new Request('http://example.com/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ messages: 'nope' }),
		});
		const response = await worker.fetch(
			request,
			authEnv({
				AZURE_API_KEY: 'key',
				AZURE_ENDPOINT: 'https://example.openai.azure.com',
				AZURE_DEPLOYMENT: 'gpt',
				AZURE_API_VERSION: '2024-01-01',
			}),
		);
		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: string };
		expect(body.error).toMatch(/messages/i);
	});
});
