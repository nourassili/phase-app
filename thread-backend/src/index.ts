import { runChatTurn, runPatternInsight, type AzureEnv } from './azure';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
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
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'thread-backend' });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Not Found' }, 404);
    }

    const azure = asAzureEnv(env);
    if (!azure) {
      return json(
        {
          error:
            'Azure env incomplete. Set AZURE_API_KEY secret and AZURE_ENDPOINT / AZURE_DEPLOYMENT / AZURE_API_VERSION vars.',
        },
        500,
      );
    }

    try {
      if (url.pathname === '/chat') {
        const body = (await request.json()) as {
          messages?: { role: 'user' | 'assistant'; content: string }[];
          profile?: Parameters<typeof runChatTurn>[2];
        };
        if (!Array.isArray(body.messages)) {
          return json({ error: 'messages array required' }, 400);
        }
        const result = await runChatTurn(
          azure,
          body.messages.map((m) => ({ role: m.role, content: m.content })),
          body.profile ?? null,
        );
        return json(result);
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
        return json({ pattern });
      }

      return json({ error: 'Not Found' }, 404);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return json({ error: message }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
