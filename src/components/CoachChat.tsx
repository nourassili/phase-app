import { useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radii } from '../theme';

type ChatMessageProps = {
  content: string;
  role: 'user' | 'coach';
};

export function ChatMessage({ content, role }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <View
      style={[
        styles.message,
        isUser ? styles.userMessage : styles.coachMessage,
      ]}
    >
      <Text style={[styles.text, isUser && styles.userText]}>{content}</Text>
    </View>
  );
}

type SuggestedChipProps = {
  label: string;
  onPress: () => void;
  visible?: boolean;
};

export function SuggestedChip({ label, onPress, visible = true }: SuggestedChipProps) {
  if (!visible) return null;
  return (
    <Pressable onPress={onPress} style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

type ChatInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
};

export function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = 'Ask anything…',
  autoFocus,
  inputRef,
}: ChatInputProps) {
  return (
    <View style={styles.inputRow}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSoft}
        autoFocus={autoFocus}
        onSubmitEditing={onSend}
        returnKeyType="send"
      />
      <Pressable onPress={onSend} style={styles.sendButton}>
        <Text style={styles.sendIcon}>↑</Text>
      </Pressable>
    </View>
  );
}

type CoachChatProps = {
  messages: { id: string; role: 'user' | 'coach'; content: string }[];
  suggestedQuestions: string[];
  hiddenChips: Set<string>;
  onChipPress: (question: string) => void;
  inputValue: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
};

export function CoachChat({
  messages,
  suggestedQuestions,
  hiddenChips,
  onChipPress,
  inputValue,
  onInputChange,
  onSend,
  placeholder,
  autoFocus,
  inputRef,
}: CoachChatProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.log}
        contentContainerStyle={styles.logContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} content={msg.content} role={msg.role} />
        ))}
      </ScrollView>

      <View style={styles.chips}>
        {suggestedQuestions.map((q) => (
          <SuggestedChip
            key={q}
            label={q}
            onPress={() => onChipPress(q)}
            visible={!hiddenChips.has(q)}
          />
        ))}
      </View>

      <ChatInput
        value={inputValue}
        onChangeText={onInputChange}
        onSend={onSend}
        placeholder={placeholder}
        autoFocus={autoFocus}
        inputRef={inputRef}
      />

      <Text style={styles.disclaimer}>
        Guidance, not diagnosis — check with your doctor for anything ongoing.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  log: {
    flex: 1,
    marginBottom: 12,
  },
  logContent: {
    gap: 10,
    paddingBottom: 8,
  },
  message: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 16,
  },
  coachMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.plum,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  userText: {
    color: colors.white,
  },
  chips: {
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: radii.lg,
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.ink,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    paddingVertical: 8,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 10,
  },
});
