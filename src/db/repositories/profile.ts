import { requireUserId } from '../client';
import { supabase } from '../../lib/supabase';
import type { Profile, ProfileUpdate } from '../../types/models';

type ProfileRow = {
  user_id: string;
  stage: string | null;
  symptoms: unknown;
  triggers: unknown;
  helps: unknown;
  notes: unknown;
  updated_at: string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    stage: row.stage,
    symptoms: asStringArray(row.symptoms),
    triggers: asStringArray(row.triggers),
    helps: asStringArray(row.helps),
    notes: asStringArray(row.notes),
    updatedAt: row.updated_at,
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
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToProfile(data as ProfileRow) : emptyProfile(userId);
}

export async function upsertProfile(
  update: ProfileUpdate & { userId?: string },
): Promise<Profile> {
  const userId = update.userId ?? (await requireUserId());
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

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: profile.userId,
        stage: profile.stage,
        symptoms: profile.symptoms,
        triggers: profile.triggers,
        helps: profile.helps,
        notes: profile.notes,
        updated_at: profile.updatedAt,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return rowToProfile(data as ProfileRow);
}

export async function deleteProfile(userId?: string): Promise<void> {
  const id = userId ?? (await requireUserId());
  const { error } = await supabase.from('profiles').delete().eq('user_id', id);
  if (error) throw error;
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
