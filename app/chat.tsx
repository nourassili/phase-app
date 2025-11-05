// app/chat.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Typography } from '../components/Typography';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Colors, Spacing, BorderRadius, Animation } from '../constants/Design';
import { ChatMessage, HealthInsight } from '../types';

const { width, height } = Dimensions.get('window');

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const isUser = message.type === 'user';
  
  return (
    <Animated.View
      entering={isUser ? FadeInRight.delay(index * 100).springify() : FadeInLeft.delay(index * 100).springify()}
      style={[
        styles.messageBubble,
        isUser ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <Typography variant="h4">🤖</Typography>
        </View>
      )}
      
      <View style={[
        styles.messageContent,
        isUser ? styles.userMessageContent : styles.assistantMessageContent,
      ]}>
        <Typography
          variant="body"
          color={isUser ? 'inverse' : 'primary'}
          style={styles.messageText}
        >
          {message.message}
        </Typography>
        
        <Typography
          variant="caption"
          color={isUser ? 'inverse' : 'tertiary'}
          style={styles.messageTime}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        
        {message.suggestions && message.suggestions.length > 0 && (
          <View style={styles.suggestionContainer}>
            {message.suggestions.map((suggestion: string, suggestionIndex: number) => (
              <Pressable
                key={suggestionIndex}
                style={styles.suggestionChip}
                onPress={() => {/* Handle suggestion tap */}}
              >
                <Typography variant="caption" color="primary">
                  {suggestion}
                </Typography>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const HEALTH_INSIGHTS: HealthInsight[] = [
  {
    id: '1',
    title: 'Stay Hydrated',
    description: 'Drinking plenty of water can help reduce bloating during your cycle.',
    type: 'tip',
    category: 'cycle',
    date: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Exercise Benefits',
    description: 'Light exercise like yoga can help reduce menstrual cramps.',
    type: 'tip',
    category: 'symptoms',
    date: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Nutrition Matters',
    description: 'Iron-rich foods can help combat fatigue during menstruation.',
    type: 'tip',
    category: 'general',
    date: new Date().toISOString(),
  },
];

const QUICK_QUESTIONS = [
  "How can I reduce period cramps?",
  "What foods help with PMS?",
  "Why am I feeling so tired?",
  "Is my cycle normal?",
  "How to track ovulation?",
  "Natural remedies for bloating?",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      message: "Hello! I'm your personal health assistant. 🌸 I'm here to help you understand your menstrual cycle, answer questions about your symptoms, and provide personalized health insights. What would you like to know?",
      timestamp: new Date(),
      suggestions: QUICK_QUESTIONS.slice(0, 3),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    // Auto scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem('chatHistory');
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (newMessages: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem('chatHistory', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword-based responses (in a real app, this would use AI)
    if (lowerMessage.includes('cramp') || lowerMessage.includes('pain')) {
      return "For menstrual cramps, try applying heat to your lower abdomen, doing gentle stretches or yoga, staying hydrated, and consider anti-inflammatory medications. Magnesium supplements may also help. If pain is severe, please consult your healthcare provider.";
    }
    
    if (lowerMessage.includes('pms') || lowerMessage.includes('mood')) {
      return "PMS symptoms can be managed through regular exercise, adequate sleep, stress reduction techniques, and maintaining a balanced diet rich in calcium and vitamin B6. Limiting caffeine and sugar can also help stabilize mood.";
    }
    
    if (lowerMessage.includes('tired') || lowerMessage.includes('fatigue')) {
      return "Fatigue during your cycle is common due to hormonal changes and iron loss. Focus on iron-rich foods like spinach, lean meats, and beans. Ensure you're getting enough sleep and consider gentle exercise to boost energy levels.";
    }
    
    if (lowerMessage.includes('bloat')) {
      return "To reduce bloating, try drinking more water, eating smaller meals, avoiding high-sodium foods, and including foods with natural diuretic properties like cucumber and asparagus. Gentle abdominal massage can also help.";
    }
    
    if (lowerMessage.includes('track') || lowerMessage.includes('cycle')) {
      return "Great question! This app helps you track your cycle by logging symptoms and flow data. A typical cycle is 21-35 days. Key things to track include period start/end dates, flow intensity, symptoms, and mood changes.";
    }
    
    // Default response
    return "That's a great question! While I can provide general health information, I always recommend consulting with your healthcare provider for personalized medical advice. Is there a specific aspect of your menstrual health you'd like to explore?";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputText.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        message: generateAIResponse(inputText),
        timestamp: new Date(),
        suggestions: Math.random() > 0.7 ? QUICK_QUESTIONS.slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3) + 3) : undefined,
      };

      const finalMessages = [...newMessages, aiResponse];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.accent + '10', Colors.background]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <Animated.View 
            entering={FadeInUp.delay(100).springify()}
            style={styles.headerSection}
          >
            <Typography variant="h3" color="primary" weight="semiBold" style={styles.title}>
              💭 Health Assistant
            </Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              Your AI-powered wellness companion
            </Typography>
          </Animated.View>

          {/* Health Insights */}
          <Animated.View 
            entering={FadeInUp.delay(200).springify()}
            style={styles.insightsSection}
          >
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.insightsContainer}
            >
              {HEALTH_INSIGHTS.map((insight, index) => (
                <Animated.View
                  key={insight.id}
                  entering={FadeInUp.delay(300 + index * 100).springify()}
                >
                  <Card style={styles.insightCard}>
                    <Typography variant="body" weight="semiBold" color="primary" style={styles.insightTitle}>
                      ✨ {insight.title}
                    </Typography>
                    <Typography variant="caption" color="secondary" style={styles.insightDescription}>
                      {insight.description}
                    </Typography>
                  </Card>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message, index) => (
              <MessageBubble key={message.id} message={message} index={index} />
            ))}
            
            {isTyping && (
              <Animated.View
                entering={FadeInLeft.springify()}
                style={[styles.messageBubble, styles.assistantMessage]}
              >
                <View style={styles.assistantAvatar}>
                  <Typography variant="h4">🤖</Typography>
                </View>
                <View style={[styles.messageContent, styles.assistantMessageContent]}>
                  <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, styles.typingDot1]} />
                    <View style={[styles.typingDot, styles.typingDot2]} />
                    <View style={[styles.typingDot, styles.typingDot3]} />
                  </View>
                </View>
              </Animated.View>
            )}
          </ScrollView>

          {/* Input Area */}
          <Animated.View 
            entering={FadeInUp.delay(400).springify()}
            style={styles.inputSection}
          >
            <Card style={styles.inputCard}>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.textInput}
                  placeholder="Ask me anything about your health..."
                  placeholderTextColor={Colors.text.tertiary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
                <Pressable
                  style={[
                    styles.sendButton,
                    inputText.trim().length > 0 && styles.sendButtonActive
                  ]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim()}
                >
                  <Typography 
                    variant="body" 
                    color={inputText.trim().length > 0 ? 'inverse' : 'tertiary'}
                  >
                    Send
                  </Typography>
                </Pressable>
              </View>
              
              {/* Quick Questions */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.quickQuestionsContainer}
              >
                {QUICK_QUESTIONS.map((question, index) => (
                  <Pressable
                    key={index}
                    style={styles.quickQuestionChip}
                    onPress={() => handleQuickQuestion(question)}
                  >
                    <Typography variant="caption" color="primary">
                      {question}
                    </Typography>
                  </Pressable>
                ))}
              </ScrollView>
            </Card>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  insightsSection: {
    marginBottom: Spacing.lg,
  },
  insightsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  insightCard: {
    width: width * 0.7,
    padding: Spacing.lg,
  },
  insightTitle: {
    marginBottom: Spacing.xs,
  },
  insightDescription: {
    lineHeight: 18,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  messagesContent: {
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: Spacing.xs,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  messageContent: {
    maxWidth: width * 0.75,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  userMessageContent: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: BorderRadius.xs,
  },
  assistantMessageContent: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageText: {
    lineHeight: 20,
  },
  messageTime: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  suggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text.tertiary,
  },
  typingDot1: {
    // Animation would go here in a real implementation
  },
  typingDot2: {
    // Animation would go here in a real implementation
  },
  typingDot3: {
    // Animation would go here in a real implementation
  },
  inputSection: {
    padding: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  inputCard: {
    padding: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.md,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: Colors.text.primary,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    marginLeft: Spacing.sm,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
  },
  quickQuestionsContainer: {
    maxHeight: 40,
  },
  quickQuestionChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
});