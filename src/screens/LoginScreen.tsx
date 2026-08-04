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

type Mode = 'signin' | 'signup' | 'forgot';

export function LoginScreen() {
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const subtitle =
    mode === 'signin'
      ? 'Sign in to continue'
      : mode === 'signup'
        ? 'Create your account'
        : 'Reset your password';

  const onSubmit = async () => {
    setError(null);
    setInfo(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Enter the email for your account.');
        return;
      }
      setBusy(true);
      try {
        await requestPasswordReset(email);
        setInfo(
          'If an account exists for that email, we sent a reset link.',
        );
        setMode('signin');
      } catch {
        setError('Could not send a reset email. Try again later.');
      } finally {
        setBusy(false);
      }
      return;
    }

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
        <Text style={styles.subtitle}>{subtitle}</Text>

        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          placeholder="Email"
          placeholderTextColor={colors.textFaint}
          value={email}
          onChangeText={setEmail}
          editable={!busy}
        />
        {mode !== 'forgot' ? (
          <TextInput
            style={styles.input}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
            placeholder="Password"
            placeholderTextColor={colors.textFaint}
            value={password}
            onChangeText={setPassword}
            editable={!busy}
          />
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <PrimaryButton
          label={
            mode === 'signin'
              ? 'Sign in'
              : mode === 'signup'
                ? 'Create account'
                : 'Send reset link'
          }
          onPress={() => void onSubmit()}
          disabled={busy}
        />

        {busy ? (
          <ActivityIndicator color={colors.amber} style={styles.spinner} />
        ) : (
          <>
            {mode === 'signin' ? (
              <PrimaryButton
                label="Forgot password?"
                variant="ghost"
                onPress={() => {
                  setMode('forgot');
                  setError(null);
                  setInfo(null);
                }}
              />
            ) : null}
            <PrimaryButton
              label={
                mode === 'forgot'
                  ? 'Back to sign in'
                  : mode === 'signin'
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
          </>
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
