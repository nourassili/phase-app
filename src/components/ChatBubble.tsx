import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme';

type ChatBubbleProps = {
  role: 'user' | 'assistant';
  text: string;
  thinking?: boolean;
};

export function ChatBubble({ role, text, thinking }: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>
      <Text
        style={[
          styles.text,
          isUser && styles.userText,
          thinking && styles.thinking,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '82%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.md,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: colors.rose,
    borderBottomRightRadius: 4,
  },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontFamily: fonts.inter,
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  userText: {
    color: colors.userBubbleText,
  },
  thinking: {
    color: colors.textFaint,
    fontStyle: 'italic',
  },
});
