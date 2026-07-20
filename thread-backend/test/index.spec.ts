import { describe, it, expect } from 'vitest';
import worker from '../src/index';

describe('thread-backend', () => {
	it('responds to /health without Azure secrets', async () => {
		const request = new Request('http://example.com/health');
		const response = await worker.fetch(request, {} as Env);
		expect(response.status).toBe(200);
		const body = (await response.json()) as { ok: boolean };
		expect(body.ok).toBe(true);
	});
});
