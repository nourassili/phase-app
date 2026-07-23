import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fonts, radii, spacing } from '../theme';

export function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        const { needsEmailConfirm } = await signUp(email, password);
        if (needsEmailConfirm) {
          setInfo('Check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>Thread</Text>
        <Text style={styles.subtitle}>
          {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
        </Text>

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={colors.textFaint}
          value={email}
          onChangeText={setEmail}
          editable={!busy}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={colors.textFaint}
          value={password}
          onChangeText={setPassword}
          editable={!busy}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <PrimaryButton
          label={mode === 'signin' ? 'Sign in' : 'Create account'}
          onPress={() => void onSubmit()}
          disabled={busy}
        />

        {busy ? (
          <ActivityIndicator color={colors.amber} style={styles.spinner} />
        ) : (
          <PrimaryButton
            label={
              mode === 'signin'
                ? 'Need an account? Sign up'
                : 'Already have an account? Sign in'
            }
            variant="ghost"
            onPress={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setInfo(null);
            }}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    gap: 12,
  },
  brand: {
    fontFamily: fonts.frauncesSemi,
    fontSize: 36,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.inter,
    fontSize: 14,
    color: colors.textDim,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: fonts.inter,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: colors.rose,
  },
  info: {
    fontFamily: fonts.inter,
    fontSize: 13,
    color: colors.sage,
  },
  spinner: {
    marginTop: 8,
  },
});
