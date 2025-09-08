import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function OnboardingLayout() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!user) router.replace('login'); }, [user, router]);
  if (!user) return null;
  return <Stack />;
}
