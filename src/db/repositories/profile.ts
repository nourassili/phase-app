import { requireUserId } from '../client';
import { supabase } from '../../lib/supabase';
import { CONSENT_VERSION } from '../../constants/onboarding';
import type { OnboardingSeed, Profile, ProfileUpdate } from '../../types/models';

type ProfileRow = {
  user_id: string;
  stage: string | null;
  symptoms: unknown;
  triggers: unknown;
  helps: unknown;
  notes: unknown;
  updated_at: string;
  consented_at: string | null;
  consent_version: string | null;
  onboarding_completed_at: string | null;
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
    consentedAt: row.consented_at,
    consentVersion: row.consent_version,
    onboardingCompletedAt: row.onboarding_completed_at,
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
    consentedAt: null,
    consentVersion: null,
    onboardingCompletedAt: null,
  };
}

export function isOnboardingComplete(profile: Profile): boolean {
  return Boolean(
    profile.onboardingCompletedAt &&
      profile.consentedAt &&
      profile.consentVersion === CONSENT_VERSION,
  );
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

/** Upserts memory fields only; preserves consent / onboarding columns on existing rows. */
export async function upsertProfile(
  update: ProfileUpdate & { userId?: string },
): Promise<Profile> {
  const userId = update.userId ?? (await requireUserId());
  const existing = await getProfileForUser(userId);
  const updatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        stage: update.stage ?? existing.stage,
        symptoms: update.symptoms ?? existing.symptoms,
        triggers: update.triggers ?? existing.triggers,
        helps: update.helps ?? existing.helps,
        notes: update.notes ?? existing.notes,
        updated_at: updatedAt,
        consented_at: existing.consentedAt,
        consent_version: existing.consentVersion,
        onboarding_completed_at: existing.onboardingCompletedAt,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return rowToProfile(data as ProfileRow);
}

export async function completeOnboarding(seed: OnboardingSeed = {}): Promise<Profile> {
  const userId = await requireUserId();
  const existing = await getProfileForUser(userId);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        stage: seed.stage !== undefined ? seed.stage : existing.stage,
        symptoms: seed.symptoms ?? existing.symptoms,
        triggers: existing.triggers,
        helps: existing.helps,
        notes: seed.notes ?? existing.notes,
        updated_at: now,
        consented_at: existing.consentedAt ?? now,
        consent_version: CONSENT_VERSION,
        onboarding_completed_at: now,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return rowToProfile(data as ProfileRow);
}

export async function recordConsent(): Promise<Profile> {
  const userId = await requireUserId();
  const existing = await getProfileForUser(userId);
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        stage: existing.stage,
        symptoms: existing.symptoms,
        triggers: existing.triggers,
        helps: existing.helps,
        notes: existing.notes,
        updated_at: now,
        consented_at: now,
        consent_version: CONSENT_VERSION,
        onboarding_completed_at: existing.onboardingCompletedAt,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return rowToProfile(data as ProfileRow);
}

/** Clears memory fields; keeps consent and onboarding completion. */
export async function clearProfileMemory(userId?: string): Promise<Profile> {
  const id = userId ?? (await requireUserId());
  const existing = await getProfileForUser(id);
  const updatedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: id,
        stage: null,
        symptoms: [],
        triggers: [],
        helps: [],
        notes: [],
        updated_at: updatedAt,
        consented_at: existing.consentedAt,
        consent_version: existing.consentVersion,
        onboarding_completed_at: existing.onboardingCompletedAt,
      },
      { onConflict: 'user_id' },
    )
    .select('*')
    .single();

  if (error) throw error;
  return rowToProfile(data as ProfileRow);
}

async function getProfileForUser(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToProfile(data as ProfileRow) : emptyProfile(userId);
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
