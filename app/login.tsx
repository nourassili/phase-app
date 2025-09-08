// app/login.tsx
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, googleProvider } from '../lib/firebase';

import { useAuth } from './context/AuthContext';

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Google auth request (native needs an ID token)
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID,
    responseType: 'id_token',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: process.env.EXPO_PUBLIC_SCHEME, // e.g. "phaseapp"
    }),
    scopes: ['profile', 'email'],
    extraParams: { prompt: 'select_account' },
  });

  // If already authenticated, go to onboarding intro
  useEffect(() => {
    if (user) router.replace('/(onboarding)/intro');
  }, [user, router]);

  // Handle native Google response
  useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        const idToken = response.authentication?.idToken;
        if (idToken) {
          const cred = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, cred);
        }
      }
    })();
  }, [response]);

  const mapErr = (c?: string) =>
    ({
      'auth/invalid-email': 'Invalid email.',
      'auth/missing-password': 'Enter your password.',
      'auth/weak-password': 'Password too weak (min 6).',
      'auth/email-already-in-use': 'Email already in use.',
      'auth/wrong-password': 'Wrong email or password.',
      'auth/user-not-found': 'Wrong email or password.',
    }[c || ''] || 'Something went wrong.');

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e: any) {
      setErr(mapErr(e?.code));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) return Alert.alert('Enter email first');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Reset email sent');
    } catch (e: any) {
      Alert.alert('Error', mapErr(e?.code));
    }
  };

  const google = async () => {
    if (Platform.OS === 'web') {
      await signInWithPopup(auth, googleProvider);
    } else {
      await promptAsync();
    }
  };

  return (
    <View style={styles.c}>
      <Text style={styles.h}>{mode === 'signin' ? 'Sign In' : 'Create Account'}</Text>
      {!!err && <Text style={styles.e}>{err}</Text>}

      <TextInput
        style={styles.i}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.i}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title={busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        onPress={submit}
        disabled={busy}
      />

      {mode === 'signin' && (
        <TouchableOpacity onPress={forgot}>
          <Text style={styles.l}>Forgot password?</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 12 }} />
      <Button
        title="Continue with Google"
        onPress={google}
        disabled={Platform.OS !== 'web' && !request}
      />

      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        <Text style={styles.l}>
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  h: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  i: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12 },
  l: { color: '#2f6fec', textAlign: 'center', marginTop: 8 },
  e: { color: '#d33', textAlign: 'center', marginBottom: 8 },
});
