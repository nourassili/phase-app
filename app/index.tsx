// app/index.tsx

import { StyleSheet, Text, View, Pressable, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Phase Health</Text>
        <Text style={styles.subtitle}>
          Your wellness companion through every phase of life
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Link href="/symptoms" asChild>
          <Pressable style={[styles.card, styles.symptomsCard]}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardTitle}>Log Symptoms</Text>
            <Text style={styles.cardSubtitle}>
              Track your daily symptoms and wellness
            </Text>
          </Pressable>
        </Link>

        <Link href="/calendar" asChild>
          <Pressable style={[styles.card, styles.calendarCard]}>
            <Text style={styles.cardIcon}>📅</Text>
            <Text style={styles.cardTitle}>Cycle Calendar</Text>
            <Text style={styles.cardSubtitle}>
              View your menstrual cycle and patterns
            </Text>
          </Pressable>
        </Link>

        <Link href="/chat" asChild>
          <Pressable style={[styles.card, styles.chatCard]}>
            <Text style={styles.cardIcon}>💬</Text>
            <Text style={styles.cardTitle}>Health Assistant</Text>
            <Text style={styles.cardSubtitle}>
              Chat with AI about your wellness
            </Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  cardContainer: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  symptomsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  calendarCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  chatCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#06B6D4',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
