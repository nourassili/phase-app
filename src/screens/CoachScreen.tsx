import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { TextInput } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { ScreenHeader } from '../components/ScreenHeader';
import { CoachChat } from '../components/CoachChat';
import {
  coachOpeningMessage,
  coachSuggestedQuestions,
} from '../data/mockData';
import type { CoachScreenProps } from '../types/navigation';

const MOCK_RESPONSES: Record<string, string> = {
  'Why am I so tired this week?':
    "Your check-ins show low energy 4 of the last 5 days — that lines up with luteal phase, when progesterone rises and sleep quality often dips. I've lowered today's training intensity and added a magnesium-rich dinner suggestion.",
  'What should I eat before training today?':
    "Aim for slow carbs plus protein about 60–90 minutes before — oats with berries and a scoop of protein, or Greek yogurt with granola. You burn slightly more carbs at rest in this phase, so don't skimp.",
};

type Message = { id: string; role: 'user' | 'coach'; content: string };

export function CoachScreen() {
  const route = useRoute<CoachScreenProps['route']>();
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'coach', content: coachOpeningMessage },
  ]);
  const [input, setInput] = useState('');
  const [hiddenChips, setHiddenChips] = useState<Set<string>>(new Set());

  const placeholder =
    route.params?.placeholder ?? 'Ask anything…';
  const autoFocus = route.params?.focusInput ?? false;

  const addMessage = (content: string, role: 'user' | 'coach') => {
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now() + Math.random()), role, content },
    ]);
  };

  const handleChipPress = (question: string) => {
    addMessage(question, 'user');
    setHiddenChips((prev) => new Set(prev).add(question));
    setTimeout(() => {
      addMessage(
        MOCK_RESPONSES[question] ??
          "Let's dig into that together — tell me a bit more.",
        'coach'
      );
    }, 500);
  };

  const handleSend = () => {
    const val = input.trim();
    if (!val) return;
    addMessage(val, 'user');
    setInput('');
    setTimeout(() => {
      addMessage(
        "Got it — logging that. Based on your recent check-ins, I'd keep tonight light and prioritize sleep over a late workout.",
        'coach'
      );
    }, 500);
  };

  return (
    <ScreenLayout scrollable={false} contentStyle={styles.content}>
      <ScreenHeader
        title="Coach"
        subtitle="Grounded in your Train + Food data"
      />
      <View style={styles.chat}>
        <CoachChat
          messages={messages}
          suggestedQuestions={coachSuggestedQuestions}
          hiddenChips={hiddenChips}
          onChipPress={handleChipPress}
          inputValue={input}
          onInputChange={setInput}
          onSend={handleSend}
          placeholder={placeholder}
          autoFocus={autoFocus}
          inputRef={inputRef}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingBottom: 0,
  },
  chat: {
    flex: 1,
  },
});
