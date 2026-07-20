import { useCallback, useEffect, useState } from 'react';
import { getProfile, profileHasMemory } from '../db/repositories/profile';
import type { Profile } from '../types/models';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const next = await getProfile();
    setProfile(next);
    setLoading(false);
    return next;
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    profile,
    loading,
    refresh,
    setProfile,
    hasMemory: profile ? profileHasMemory(profile) : false,
  };
}
