import { AuthError, requireAuth } from './auth';
import { runChatTurn, runPatternInsight, type AzureEnv } from './azure';

function corsHeaders(request: Request, env: Env): Record<string, string> {
	const configured = (env.CORS_ORIGINS ?? '*').trim();
	const origins = configured
		.split(',')
		.map((o) => o.trim())
		.filter(Boolean);
	const allowAny = origins.length === 0 || origins.includes('*');
	const requestOrigin = request.headers.get('Origin');

	let allowOrigin = '*';
	if (!allowAny) {
		if (requestOrigin && origins.includes(requestOrigin)) {
			allowOrigin = requestOrigin;
		} else {
			// Do not reflect unmatched origins; omit a usable allow-origin for browsers.
			allowOrigin = origins[0] ?? 'null';
		}
	}

	return {
		'Access-Control-Allow-Origin': allowOrigin,
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}

function json(data: unknown, status: number, cors: Record<string, string>): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...cors },
	});
}

function asAzureEnv(env: Env): AzureEnv | null {
	if (!env.AZURE_API_KEY || !env.AZURE_ENDPOINT || !env.AZURE_DEPLOYMENT || !env.AZURE_API_VERSION) {
		return null;
	}
	return {
		AZURE_API_KEY: env.AZURE_API_KEY,
		AZURE_ENDPOINT: env.AZURE_ENDPOINT,
		AZURE_DEPLOYMENT: env.AZURE_DEPLOYMENT,
		AZURE_API_VERSION: env.AZURE_API_VERSION,
	};
}

export default {
	async fetch(request, env): Promise<Response> {
		const cors = corsHeaders(request, env);

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: cors });
		}

		const url = new URL(request.url);

		if (url.pathname === '/health') {
			return json({ ok: true, service: 'thread-backend' }, 200, cors);
		}

		if (request.method !== 'POST') {
			return json({ error: 'Not Found' }, 404, cors);
		}

		const isProtected =
			url.pathname === '/chat' || url.pathname === '/insights/pattern';
		if (isProtected) {
			try {
				await requireAuth(request, env);
			} catch (err) {
				if (err instanceof AuthError) {
					return json({ error: 'Unauthorized' }, 401, cors);
				}
				throw err;
			}
		}

		const azure = asAzureEnv(env);
		if (!azure) {
			return json(
				{
					error:
						'Azure env incomplete. Set AZURE_API_KEY secret and AZURE_ENDPOINT / AZURE_DEPLOYMENT / AZURE_API_VERSION vars.',
				},
				500,
				cors,
			);
		}

		try {
			if (url.pathname === '/chat') {
				const body = (await request.json()) as {
					messages?: { role: 'user' | 'assistant'; content: string }[];
					profile?: Parameters<typeof runChatTurn>[2];
				};
				if (!Array.isArray(body.messages)) {
					return json({ error: 'messages array required' }, 400, cors);
				}
				const result = await runChatTurn(
					azure,
					body.messages.map((m) => ({ role: m.role, content: m.content })),
					body.profile ?? null,
				);
				return json(result, 200, cors);
			}

			if (url.pathname === '/insights/pattern') {
				const body = (await request.json()) as {
					profile?: Parameters<typeof runPatternInsight>[1];
					entries?: Array<{
						date: string;
						mood: string | null;
						sleepQuality: string | null;
						symptoms: string[];
					}>;
				};
				const entries = body.entries ?? [];
				const summary = entries
					.map(
						(d) =>
							`${d.date}: mood ${d.mood || 'n/a'}, sleep ${d.sleepQuality || 'n/a'}, symptoms: ${(d.symptoms || []).join(',') || 'none'}`,
					)
					.join('\n');
				const pattern = await runPatternInsight(azure, body.profile ?? null, summary);
				return json({ pattern }, 200, cors);
			}

			return json({ error: 'Not Found' }, 404, cors);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			return json({ error: message }, 500, cors);
		}
	},
} satisfies ExportedHandler<Env>;
