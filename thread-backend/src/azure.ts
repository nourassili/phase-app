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
      content?: string | null;
      tool_calls?: ToolCall[];
    };
  }>;
  error?: { message?: string };
};

function completionsUrl(env: AzureEnv): string {
  const base = env.AZURE_ENDPOINT.replace(/\/$/, '');
  return `${base}/openai/deployments/${env.AZURE_DEPLOYMENT}/chat/completions?api-version=${encodeURIComponent(env.AZURE_API_VERSION)}`;
}

async function azureChat(
  env: AzureEnv,
  body: Record<string, unknown>,
): Promise<ChatCompletionResponse> {
  const res = await fetch(completionsUrl(env), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.AZURE_API_KEY,
    },
    body: JSON.stringify(body),
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
    temperature: 0.7,
    max_tokens: 1000,
  });

  const message = data.choices?.[0]?.message;
  const replyText =
    (message?.content || '').trim() || "I'm here, tell me more?";

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
    temperature: 0.7,
    max_tokens: 300,
  });

  return (
    (data.choices?.[0]?.message?.content || '').trim() ||
    'Not enough to go on yet, keep chatting with Thread and check back.'
  );
}
