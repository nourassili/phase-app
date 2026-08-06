import { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../auth/AuthContext';
import { validateNewPassword } from '../auth/passwordRules';
import { ScreenShell } from '../components/ScreenShell';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { clearMessages } from '../db/repositories/conversation';
import { forgetEverything } from '../db/repositories';
import { colors, fonts, radii, spacing } from '../theme';
import type { RootTabParamList } from '../types/navigation';

export function SettingsScreen() {
  const navigation =
    useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { user, signOut, changePassword } = useAuth();

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const clearPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const onToggleChangePassword = () => {
    setShowChangePassword((open) => {
      if (open) clearPasswordForm();
      return !open;
    });
  };

  const onChangePassword = async () => {
    setPasswordError(null);

    const validationError = validateNewPassword({
      newPassword,
      confirmPassword,
      currentPassword,
    });
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    setPasswordBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      clearPasswordForm();
      setShowChangePassword(false);
      Alert.alert('Password updated', 'Your password has been changed.');
    } catch (e) {
      setPasswordError(
        e instanceof Error ? e.message : 'Something went wrong.',
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  const onNewConversation = async () => {
    await clearMessages();
    navigation.navigate('Chat');
  };

  const onForget = () => {
    Alert.alert(
      'Forget everything',
      "This erases everything Thread remembers and all your Insights. Can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase everything',
          style: 'destructive',
          onPress: async () => {
            await forgetEverything();
            navigation.navigate('Chat');
          },
        },
      ],
    );
  };

  const onSignOut = () => {
    Alert.alert('Sign out', 'You can sign back in anytime on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <ScreenShell title="Settings" subtitle="your app, your data">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <Text style={styles.heading}>Account</Text>
          <Text style={styles.desc}>{user?.email ?? 'Signed in'}</Text>

          <PrimaryButton
            label="Change password"
            variant="ghost"
            onPress={onToggleChangePassword}
            disabled={passwordBusy}
            style={styles.accountAction}
          />

          {showChangePassword ? (
            <View style={styles.passwordForm}>
              <TextInput
                style={styles.input}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                placeholder="Current password"
                placeholderTextColor={colors.textFaint}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                editable={!passwordBusy}
              />
              <TextInput
                style={styles.input}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                placeholder="New password"
                placeholderTextColor={colors.textFaint}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!passwordBusy}
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
                editable={!passwordBusy}
              />
              {passwordError ? (
                <Text style={styles.error}>{passwordError}</Text>
              ) : null}
              <PrimaryButton
                label="Update password"
                onPress={() => void onChangePassword()}
                disabled={passwordBusy}
              />
            </View>
          ) : null}

          <PrimaryButton
            label="Sign out"
            variant="ghost"
            onPress={onSignOut}
            disabled={passwordBusy}
            style={styles.accountAction}
          />
        </Card>

        <Card>
          <Text style={styles.heading}>Your data</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Start a new conversation</Text>
            <Text style={styles.desc}>
              Clears what's on screen. Thread still remembers you.
            </Text>
          </View>
          <PrimaryButton
            label="New conversation"
            variant="ghost"
            onPress={onNewConversation}
          />
        </Card>

        <Card>
          <View style={styles.row}>
            <Text style={styles.label}>Forget everything</Text>
            <Text style={styles.desc}>
              Erases Thread's memory of you and all logged patterns. Can't be
              undone.
            </Text>
          </View>
          <PrimaryButton
            label="Forget everything"
            variant="danger"
            onPress={onForget}
          />
        </Card>

        <Card>
          <Text style={styles.heading}>Privacy</Text>
          <Text style={styles.muted}>
            What you share is saved in your account and sent to Thread's
            servers and Azure OpenAI to generate replies. Never sold. Never
            shared with an employer or insurer. You can erase Thread's memory
            above.
          </Text>
        </Card>

        <Card>
          <Text style={styles.heading}>Crisis support</Text>
          <Text style={styles.muted}>
            Thread can't help in an emergency. If you're in crisis or thinking
            about harming yourself, contact local emergency services or a crisis
            line. In the US, call or text 988.
          </Text>
          <PrimaryButton
            label="Call or text 988 (US)"
            variant="ghost"
            onPress={() => {
              void Linking.openURL('tel:988');
            }}
            style={styles.accountAction}
          />
        </Card>

        <Card>
          <Text style={styles.heading}>About</Text>
          <Text style={styles.muted}>
            Thread offers support and information, not medical advice. For
            treatment decisions, always talk to your doctor or a
            menopause-literate clinician.
          </Text>
        </Card>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingBottom: spacing.xxl,
  },
  heading: {
    fontFamily: fonts.fraunces,
    fontSize: 14.5,
    color: colors.text,
    marginBottom: 6,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontFamily: fonts.inter,
    fontSize: 13.5,
    color: colors.text,
  },
  desc: {
    fontFamily: fonts.inter,
    fontSize: 11.5,
    color: colors.textFaint,
    marginTop: 2,
  },
  muted: {
    fontFamily: fonts.inter,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textFaint,
  },
  accountAction: {
    marginTop: 12,
  },
  passwordForm: {
    gap: 10,
    marginTop: 12,
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
