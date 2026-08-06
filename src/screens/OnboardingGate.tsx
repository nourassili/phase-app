import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  getProfile,
  isOnboardingComplete,
} from '../db/repositories/profile';
import type { Profile } from '../types/models';
import { colors } from '../theme';
import { OnboardingFlow } from './onboarding/OnboardingFlow';

type Props = {
  children: ReactNode;
};

export function OnboardingGate({ children }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getProfile();
      setProfile(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading || !profile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.amber} />
      </View>
    );
  }

  if (!isOnboardingComplete(profile)) {
    return (
      <>
        <StatusBar style="light" />
        <OnboardingFlow
          initialProfile={profile}
          onFinished={(next) => setProfile(next)}
        />
      </>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.page,
  },
});
