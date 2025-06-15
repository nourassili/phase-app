import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/'); // redirect to public entry screen like / or /welcome
    }
  }, [user]);

  if (!user) return null; // prevent flash of protected routes while redirecting

  return <Stack />;
}
