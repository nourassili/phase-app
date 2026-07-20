import Constants from 'expo-constants';
import type { ConversationMessage, DailyEntry, Profile, ProfileUpdate, TodayLogUpdate } from '../types/models';

const API_URL =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:8787';

type ChatRequest = {
  messages: { role: 'user' | 'assistant'; content: string }[];
  profile: Profile | null;
};

type ChatResponse = {
  replyText: string;
  profile: ProfileUpdate | null;
  todayLog: TodayLogUpdate | null;
};

type PatternRequest = {
  profile: Profile;
  entries: DailyEntry[];
};

type PatternResponse = {
  pattern: string;
};

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function sendChat(
  messages: ConversationMessage[],
  profile: Profile | null,
): Promise<ChatResponse> {
  const payload: ChatRequest = {
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    profile,
  };
  return postJson<ChatResponse>('/chat', payload);
}

export async function askPattern(
  profile: Profile,
  entries: DailyEntry[],
): Promise<PatternResponse> {
  const payload: PatternRequest = { profile, entries };
  return postJson<PatternResponse>('/insights/pattern', payload);
}

export function getApiUrl(): string {
  return API_URL;
}
