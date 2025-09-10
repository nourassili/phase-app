// app/login.tsx
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

import { auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth } from '../lib/auth-context';

WebBrowser.maybeCompleteAuthSession();

const WEB_ID = process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID?.trim();
const IOS_ID = process.env.EXPO_PUBLIC_IOS_GOOGLE_CLIENT_ID?.trim();
const SCHEME = process.env.EXPO_PUBLIC_SCHEME || 'phaseapp';

// We embed the proxy into the redirectUri (version-safe; no TS error on promptAsync)
const redirectUri = makeRedirectUri({
  useProxy: true,
  scheme: SCHEME,
});

export default function Login() {
  // Email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  // Google request (Expo Go uses web client ID via proxy)
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: WEB_ID,                 // required for Expo Go
    iosClientId: IOS_ID || undefined,     // optional until you build a dev client/EAS
    redirectUri,                          // << key piece (contains useProxy)
    // scopes: ['profile', 'email'],      // optional; defaults are fine
  });

  const { user, loading } = useAuth();

  // If already signed in, go to the protected screen
  useEffect(() => {
    if (!loading && user) {
      router.replace('/(protected)/home');
    }
  }, [user, loading]);

  // Handle Google OAuth response
  useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        const idToken = response.authentication?.idToken;
        if (!idToken) return;
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      }
    })().catch((e) => Alert.alert('Google Sign-In Error', String(e)));
  }, [response]);

  const onEmailSignIn = async () => {
    try {
      setBusy(true);
      if (!email || !password) throw new Error('Enter email and password.');
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      Alert.alert('Sign-In failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const onEmailSignUp = async () => {
    try {
      setBusy(true);
      if (!email || !password) throw new Error('Enter email and password.');
      await createUserWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      Alert.alert('Sign-Up failed', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator />
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 12 }}>Sign in</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 10 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12 }}
      />

      <Button title={busy ? 'Signing in…' : 'Sign In (email)'} onPress={onEmailSignIn} disabled={busy} />
      <View style={{ height: 10 }} />
      <Button title={busy ? 'Creating…' : 'Create Account (email)'} onPress={onEmailSignUp} disabled={busy} />

      <View style={{ height: 22 }} />
      <Button
        title="Continue with Google"
        // Disable if request not ready or you haven't set WEB_ID yet
        disabled={!request || !WEB_ID}
        onPress={() => promptAsync()}
      />
      {!WEB_ID && (
        <Text style={{ marginTop: 8, color: 'crimson' }}>
          Set EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID in your .env to enable Google Sign-In.
        </Text>
      )}
    </View>
  );
}