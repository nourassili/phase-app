// app/(protected)/_layout.tsx
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/login'); // or '/' if that's your public entry
  }, [user]);

  if (!user) return null; // avoid flashing protected UI during redirect
  return <Stack />;
}
