import { useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputContentSizeChangeEventData,
  View,
} from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

type ChatComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function ChatComposer({ onSend, disabled }: ChatComposerProps) {
  const [value, setValue] = useState('');
  const [height, setHeight] = useState(42);

  const send = () => {
    const text = value.trim();
    if (!text || disabled) return;
    setValue('');
    setHeight(42);
    onSend(text);
  };

  const onContentSizeChange = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>,
  ) => {
    setHeight(Math.min(Math.max(e.nativeEvent.contentSize.height, 42), 100));
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={[styles.input, { height }]}
        value={value}
        onChangeText={setValue}
        placeholder="Tell Thread how you're doing..."
        placeholderTextColor={colors.textFaint}
        multiline
        editable={!disabled}
        onContentSizeChange={onContentSizeChange}
        onSubmitEditing={send}
        blurOnSubmit={false}
        returnKeyType="send"
      />
      <Pressable
        onPress={send}
        disabled={disabled || !value.trim()}
        style={({ pressed }) => [
          styles.send,
          (disabled || !value.trim()) && styles.sendDisabled,
          pressed && styles.sendPressed,
        ]}
      >
        <Text style={styles.sendText}>Send</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: 6,
    paddingBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    fontFamily: fonts.inter,
    maxHeight: 100,
  },
  send: {
    backgroundColor: colors.amber,
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    height: 42,
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendPressed: {
    opacity: 0.85,
  },
  sendText: {
    fontFamily: fonts.interSemi,
    color: colors.buttonText,
    fontWeight: '600',
  },
});
