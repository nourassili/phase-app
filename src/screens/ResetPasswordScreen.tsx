import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { validateNewPassword } from '../auth/passwordRules';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fonts, radii, spacing } from '../theme';

export function ResetPasswordScreen() {
  const { completePasswordReset, cancelPasswordRecovery } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const validationError = validateNewPassword({
      newPassword,
      confirmPassword,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    try {
      await completePasswordReset(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Password updated', 'Your password has been changed.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const onCancel = () => {
    void cancelPasswordRecovery().catch(() => {
      // Sign-out failure still leaves recovery UI; user can retry.
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.brand}>Thread</Text>
        <Text style={styles.subtitle}>Choose a new password</Text>

        <TextInput
          style={styles.input}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="password-new"
          placeholder="New password"
          placeholderTextColor={colors.textFaint}
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!busy}
        />
        <TextInput
          style={styles.input}
          secureTextEntry
          textContentType="newPassword"
          autoComplete="password-new"
          placeholder="Confirm new password"
          placeholderTextColor={colors.textFaint}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          editable={!busy}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label="Update password"
          onPress={() => void onSubmit()}
          disabled={busy}
        />
        <PrimaryButton
          label="Cancel"
          variant="ghost"
          onPress={onCancel}
          disabled={busy}
        />
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
});
