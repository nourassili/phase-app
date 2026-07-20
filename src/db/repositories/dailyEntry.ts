import { getDb, getOrCreateUserId } from '../client';
import type { DailyEntry, TodayLogUpdate } from '../../types/models';

type EntryRow = {
  userId: string;
  date: string;
  mood: string | null;
  sleepQuality: string | null;
  symptoms: string;
};

function parseArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function rowToEntry(row: EntryRow): DailyEntry {
  return {
    userId: row.userId,
    date: row.date,
    mood: row.mood,
    sleepQuality: row.sleepQuality,
    symptoms: parseArray(row.symptoms),
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
  const db = await getDb();
  const userId = await getOrCreateUserId();
  const row = await db.getFirstAsync<EntryRow>(
    'SELECT * FROM daily_entries WHERE userId = ? AND date = ?',
    [userId, date],
  );
  return row ? rowToEntry(row) : null;
}

export async function getRecentDailyEntries(limit = 7): Promise<DailyEntry[]> {
  const db = await getDb();
  const userId = await getOrCreateUserId();
  const rows = await db.getAllAsync<EntryRow>(
    `SELECT * FROM daily_entries
     WHERE userId = ?
     ORDER BY date DESC
     LIMIT ?`,
    [userId, limit],
  );
  return rows.map(rowToEntry).reverse();
}

export async function upsertDailyEntry(
  date: string,
  partial: TodayLogUpdate,
): Promise<DailyEntry> {
  const db = await getDb();
  const userId = await getOrCreateUserId();
  const existing = await getDailyEntry(date);

  const next: DailyEntry = {
    userId,
    date,
    mood: partial.mood ?? existing?.mood ?? null,
    sleepQuality: partial.sleepQuality ?? existing?.sleepQuality ?? null,
    symptoms: mergeUnique(existing?.symptoms ?? [], partial.symptoms ?? []),
  };

  await db.runAsync(
    `INSERT INTO daily_entries (userId, date, mood, sleepQuality, symptoms)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(userId, date) DO UPDATE SET
       mood = excluded.mood,
       sleepQuality = excluded.sleepQuality,
       symptoms = excluded.symptoms`,
    [
      next.userId,
      next.date,
      next.mood,
      next.sleepQuality,
      JSON.stringify(next.symptoms),
    ],
  );
  return next;
}

export async function deleteAllDailyEntries(userId?: string): Promise<void> {
  const db = await getDb();
  const id = userId ?? (await getOrCreateUserId());
  await db.runAsync('DELETE FROM daily_entries WHERE userId = ?', [id]);
}
