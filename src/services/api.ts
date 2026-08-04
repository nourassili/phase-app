import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
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

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Not signed in — cannot call API: ${error.message}`);
  }
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('Not signed in — cannot call API');
  }
  return token;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
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
