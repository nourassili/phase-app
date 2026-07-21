import { buildChatSystemPrompt, CHAT_TOOLS, PATTERN_SYSTEM_PROMPT, type ProfileLike } from './prompts';

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export type ProfileUpdate = {
  stage?: string;
  symptoms?: string[];
  triggers?: string[];
  helps?: string[];
  notes?: string[];
};

export type TodayLogUpdate = {
  mood?: string;
  sleepQuality?: string;
  symptoms?: string[];
};

export type AzureEnv = {
  AZURE_API_KEY: string;
  AZURE_ENDPOINT: string;
  AZURE_DEPLOYMENT: string;
  AZURE_API_VERSION: string;
};

type ToolCall = {
  id: string;
  type: string;
  function: { name: string; arguments: string };
};

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null | Array<{ type?: string; text?: string }>;
      tool_calls?: ToolCall[];
    };
  }>;
  error?: { message?: string };
};

/** Normalize Foundry project URLs to the Azure OpenAI resource base. */
function normalizeEndpoint(raw: string): string {
  let base = raw.trim().replace(/\/$/, '');
  // https://xxx.openai.azure.com/openai/v1 → https://xxx.openai.azure.com
  base = base.replace(/\/openai\/v1$/i, '');
  // https://xxx.services.ai.azure.com/api/projects/foo → https://xxx.openai.azure.com
  const servicesMatch = base.match(
    /^https:\/\/([^.]+)\.services\.ai\.azure\.com(?:\/api\/projects\/[^/]+)?$/i,
  );
  if (servicesMatch) {
    return `https://${servicesMatch[1]}.openai.azure.com`;
  }
  return base;
}

function completionsUrl(env: AzureEnv): string {
  const base = normalizeEndpoint(env.AZURE_ENDPOINT);
  return `${base}/openai/deployments/${env.AZURE_DEPLOYMENT}/chat/completions?api-version=${encodeURIComponent(env.AZURE_API_VERSION)}`;
}

function extractTextContent(
  content: string | null | Array<{ type?: string; text?: string }> | undefined,
): string {
  if (!content) return '';
  if (typeof content === 'string') return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
  }
  return '';
}

async function azureChat(
  env: AzureEnv,
  body: Record<string, unknown>,
): Promise<ChatCompletionResponse> {
  // Newer Azure models (e.g. gpt-5.x) reject max_tokens; use max_completion_tokens.
  const { max_tokens, ...rest } = body;
  const payload: Record<string, unknown> = { ...rest };
  if (typeof max_tokens === 'number') {
    payload.max_completion_tokens = max_tokens;
  }

  const res = await fetch(completionsUrl(env), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.AZURE_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as ChatCompletionResponse;
  if (!res.ok) {
    throw new Error(data.error?.message || `Azure OpenAI error (${res.status})`);
  }
  return data;
}

function parseToolArgs(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function generateFallbackReply(
  env: AzureEnv,
  messages: ChatMessage[],
): Promise<string> {
  const data = await azureChat(env, {
    messages: [
      {
        role: 'system',
        content:
          'You are Thread, a warm menopause companion. Reply in 2-5 sentences. No diagnoses. No tool calls.',
      },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 400,
  });
  return (
    extractTextContent(data.choices?.[0]?.message?.content) ||
    "I'm here, tell me more?"
  );
}

export async function runChatTurn(
  env: AzureEnv,
  messages: ChatMessage[],
  profile: ProfileLike,
): Promise<{
  replyText: string;
  profile: ProfileUpdate | null;
  todayLog: TodayLogUpdate | null;
}> {
  const data = await azureChat(env, {
    messages: [
      { role: 'system', content: buildChatSystemPrompt(profile) },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    tools: CHAT_TOOLS,
    tool_choice: 'auto',
    max_tokens: 1000,
  });

  const message = data.choices?.[0]?.message;
  let replyText = extractTextContent(message?.content);

  let profileUpdate: ProfileUpdate | null = null;
  let todayLog: TodayLogUpdate | null = null;

  for (const call of message?.tool_calls ?? []) {
    const args = parseToolArgs(call.function.arguments);
    if (call.function.name === 'update_memory') {
      profileUpdate = {
        stage: typeof args.stage === 'string' ? args.stage : undefined,
        symptoms: Array.isArray(args.symptoms) ? args.symptoms.map(String) : undefined,
        triggers: Array.isArray(args.triggers) ? args.triggers.map(String) : undefined,
        helps: Array.isArray(args.helps) ? args.helps.map(String) : undefined,
        notes: Array.isArray(args.notes) ? args.notes.map(String) : undefined,
      };
    }
    if (call.function.name === 'update_today_log') {
      todayLog = {
        mood: typeof args.mood === 'string' ? args.mood : undefined,
        sleepQuality:
          typeof args.sleepQuality === 'string' ? args.sleepQuality : undefined,
        symptoms: Array.isArray(args.symptoms) ? args.symptoms.map(String) : undefined,
      };
    }
  }

  // Some newer models emit tool calls with empty content — fetch a user-facing reply.
  if (!replyText) {
    replyText = await generateFallbackReply(env, messages);
  }

  return { replyText, profile: profileUpdate, todayLog };
}

export async function runPatternInsight(
  env: AzureEnv,
  profile: ProfileLike,
  entriesSummary: string,
): Promise<string> {
  const data = await azureChat(env, {
    messages: [
      { role: 'system', content: PATTERN_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Memory: ${JSON.stringify(profile ?? {})}\n\nLast 7 days (from chat):\n${entriesSummary || 'No data yet.'}`,
      },
    ],
    max_tokens: 300,
  });

  return (
    extractTextContent(data.choices?.[0]?.message?.content) ||
    'Not enough to go on yet, keep chatting with Thread and check back.'
  );
}
