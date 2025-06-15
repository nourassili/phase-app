import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { supabase } from './services/supabase';

export default function SignInScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // 🔒 Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(protected)/home');
    }
  }, [user]);

  const handleSignInWithGoogle = async () => {
    const redirectTo = AuthSession.getRedirectUrl(); // ✅ THIS is correct and safe for Expo Go

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('Google sign-in error:', error.message);
    } else {
      console.log('✅ OAuth flow started. You should see a browser prompt.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Continue with Google" onPress={handleSignInWithGoogle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
