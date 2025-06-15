import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext'; // adjust path if different
import { supabase } from '../services/supabase'; // adjust path if different

export default function SignInScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // If logged in, redirect to protected home
  useEffect(() => {
    if (user) {
      router.replace('/(protected)/home');
    }
  }, [user]);

  const handleSignInWithGoogle = async () => {
    const redirectTo = AuthSession.makeRedirectUri({
      scheme: 'phaseapp', // matches "scheme" in app.json
    });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error('Google sign-in error:', error.message);
    } else {
      console.log('OAuth redirect launched successfully');
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
    flex: 1,               // Full screen height
    justifyContent: 'center', // Center vertically
    alignItems: 'center',     // Center horizontally
  },
});
