import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenShell } from '../components/ScreenShell';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { clearMessages } from '../db/repositories/conversation';
import { forgetEverything } from '../db/repositories';
import { colors, fonts, spacing } from '../theme';
import type { RootTabParamList } from '../types/navigation';

export function SettingsScreen() {
  const navigation =
    useNavigation<BottomTabNavigationProp<RootTabParamList>>();

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

  return (
    <ScreenShell title="Settings" subtitle="your app, your data">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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
            What you share stays between you and this app. It's never sold, and
            nothing is shared with an employer or insurer.
          </Text>
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
});
