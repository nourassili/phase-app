import { requireUserId } from '../client';
import { supabase } from '../../lib/supabase';
import type { DailyEntry, TodayLogUpdate } from '../../types/models';

type EntryRow = {
  user_id: string;
  date: string;
  mood: string | null;
  sleep_quality: string | null;
  symptoms: unknown;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

function rowToEntry(row: EntryRow): DailyEntry {
  return {
    userId: row.user_id,
    date: row.date,
    mood: row.mood,
    sleepQuality: row.sleep_quality,
    symptoms: asStringArray(row.symptoms),
  };
}

function mergeUnique(existing: string[], incoming: string[]): string[] {
  const set = new Set(existing);
  for (const item of incoming) {
    if (item) set.add(item);
  }
  return Array.from(set);
}

export async function getDailyEntry(date: string): Promise<DailyEntry | null> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToEntry(data as EntryRow) : null;
}

export async function getRecentDailyEntries(limit = 7): Promise<DailyEntry[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as EntryRow[]).map(rowToEntry).reverse();
}

export async function upsertDailyEntry(
  date: string,
  partial: TodayLogUpdate,
): Promise<DailyEntry> {
  const userId = await requireUserId();
  const existing = await getDailyEntry(date);

  const next: DailyEntry = {
    userId,
    date,
    mood: partial.mood ?? existing?.mood ?? null,
    sleepQuality: partial.sleepQuality ?? existing?.sleepQuality ?? null,
    symptoms: mergeUnique(existing?.symptoms ?? [], partial.symptoms ?? []),
  };

  const { data, error } = await supabase
    .from('daily_entries')
    .upsert(
      {
        user_id: next.userId,
        date: next.date,
        mood: next.mood,
        sleep_quality: next.sleepQuality,
        symptoms: next.symptoms,
      },
      { onConflict: 'user_id,date' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return rowToEntry(data as EntryRow);
}

export async function deleteAllDailyEntries(userId?: string): Promise<void> {
  const id = userId ?? (await requireUserId());
  const { error } = await supabase.from('daily_entries').delete().eq('user_id', id);
  if (error) throw error;
}
