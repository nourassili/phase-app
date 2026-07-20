import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenShell } from '../components/ScreenShell';
import { GreetingCard } from '../components/GreetingCard';
import { MemoryStrip } from '../components/MemoryStrip';
import { ChatBubble } from '../components/ChatBubble';
import { ChatComposer } from '../components/ChatComposer';
import { appendMessage } from '../db/repositories/conversation';
import { upsertProfile } from '../db/repositories/profile';
import { upsertDailyEntry } from '../db/repositories/dailyEntry';
import { useConversation } from '../hooks/useConversation';
import { useProfile } from '../hooks/useProfile';
import { sendChat } from '../services/api';
import { colors, fonts } from '../theme';
import { newId, todayKey } from '../utils/dates';
import type { ConversationMessage } from '../types/models';

export function ChatScreen() {
  const { messages, setMessages, refresh: refreshMessages } = useConversation();
  const { profile, refresh: refreshProfile, setProfile } = useProfile();
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      void refreshMessages();
      void refreshProfile();
    }, [refreshMessages, refreshProfile]),
  );

  useEffect(() => {
    const t = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(t);
  }, [messages, thinking]);

  const handleSend = async (text: string) => {
    if (sending) return;
    setSending(true);

    const userMsg: ConversationMessage = {
      userId: profile?.userId ?? '',
      id: newId(),
      role: 'user',
      content: text,
      displayText: text,
      createdAt: new Date().toISOString(),
    };

    await appendMessage(userMsg);
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setThinking(true);

    try {
      const currentProfile = profile ?? (await refreshProfile());
      const result = await sendChat(withUser, currentProfile);

      const assistantMsg: ConversationMessage = {
        userId: currentProfile.userId,
        id: newId(),
        role: 'assistant',
        content: result.replyText,
        displayText: result.replyText || "I'm here, tell me more?",
        createdAt: new Date().toISOString(),
      };
      await appendMessage(assistantMsg);
      setMessages([...withUser, assistantMsg]);

      if (result.profile) {
        // Tool returns the full updated profile (existing + new).
        const merged = await upsertProfile({
          userId: currentProfile.userId,
          stage: result.profile.stage ?? currentProfile.stage ?? undefined,
          symptoms: result.profile.symptoms ?? currentProfile.symptoms,
          triggers: result.profile.triggers ?? currentProfile.triggers,
          helps: result.profile.helps ?? currentProfile.helps,
          notes: result.profile.notes ?? currentProfile.notes,
        });
        setProfile(merged);
      }

      if (result.todayLog) {
        await upsertDailyEntry(todayKey(), result.todayLog);
      }
    } catch {
      const errMsg: ConversationMessage = {
        userId: profile?.userId ?? '',
        id: newId(),
        role: 'assistant',
        content: '',
        displayText: 'Something went wrong reaching Thread. Mind trying again?',
        createdAt: new Date().toISOString(),
      };
      await appendMessage(errMsg);
      setMessages([...withUser, errMsg]);
    } finally {
      setThinking(false);
      setSending(false);
    }
  };

  return (
    <ScreenShell title="Thread" subtitle="here, listening">
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <GreetingCard />
        <MemoryStrip profile={profile} />
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && !thinking ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>
                Tell Thread what's going on, a symptom, a bad night, a question
                you've been sitting on. It'll remember.
              </Text>
            </View>
          ) : (
            messages.map((m) => (
              <ChatBubble key={m.id} role={m.role} text={m.displayText} />
            ))
          )}
          {thinking ? (
            <ChatBubble role="assistant" text="Thread is thinking..." thinking />
          ) : null}
        </ScrollView>
        <ChatComposer onSend={handleSend} disabled={sending} />
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    gap: 12,
    paddingVertical: 2,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  empty: {
    fontFamily: fonts.inter,
    fontSize: 13,
    lineHeight: 21,
    color: colors.textDim,
    textAlign: 'center',
    maxWidth: 260,
  },
});
