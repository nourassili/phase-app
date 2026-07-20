import { getDb, getOrCreateUserId } from '../client';
import type { Profile, ProfileUpdate } from '../../types/models';

type ProfileRow = {
  userId: string;
  stage: string | null;
  symptoms: string;
  triggers: string;
  helps: string;
  notes: string;
  updatedAt: string;
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

function rowToProfile(row: ProfileRow): Profile {
  return {
    userId: row.userId,
    stage: row.stage,
    symptoms: parseArray(row.symptoms),
    triggers: parseArray(row.triggers),
    helps: parseArray(row.helps),
    notes: parseArray(row.notes),
    updatedAt: row.updatedAt,
  };
}

export function emptyProfile(userId: string): Profile {
  return {
    userId,
    stage: null,
    symptoms: [],
    triggers: [],
    helps: [],
    notes: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function getProfile(): Promise<Profile> {
  const db = await getDb();
  const userId = await getOrCreateUserId();
  const row = await db.getFirstAsync<ProfileRow>(
    'SELECT * FROM profiles WHERE userId = ?',
    [userId],
  );
  return row ? rowToProfile(row) : emptyProfile(userId);
}

export async function upsertProfile(update: ProfileUpdate & { userId?: string }): Promise<Profile> {
  const db = await getDb();
  const userId = update.userId ?? (await getOrCreateUserId());
  const updatedAt = new Date().toISOString();
  const profile: Profile = {
    userId,
    stage: update.stage ?? null,
    symptoms: update.symptoms ?? [],
    triggers: update.triggers ?? [],
    helps: update.helps ?? [],
    notes: update.notes ?? [],
    updatedAt,
  };

  await db.runAsync(
    `INSERT INTO profiles (userId, stage, symptoms, triggers, helps, notes, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(userId) DO UPDATE SET
       stage = excluded.stage,
       symptoms = excluded.symptoms,
       triggers = excluded.triggers,
       helps = excluded.helps,
       notes = excluded.notes,
       updatedAt = excluded.updatedAt`,
    [
      profile.userId,
      profile.stage,
      JSON.stringify(profile.symptoms),
      JSON.stringify(profile.triggers),
      JSON.stringify(profile.helps),
      JSON.stringify(profile.notes),
      profile.updatedAt,
    ],
  );
  return profile;
}

export async function deleteProfile(userId?: string): Promise<void> {
  const db = await getDb();
  const id = userId ?? (await getOrCreateUserId());
  await db.runAsync('DELETE FROM profiles WHERE userId = ?', [id]);
}

export function profileHasMemory(profile: Profile): boolean {
  return Boolean(
    profile.stage ||
      profile.symptoms.length ||
      profile.triggers.length ||
      profile.helps.length ||
      profile.notes.length,
  );
}
