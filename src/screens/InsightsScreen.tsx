import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenShell } from '../components/ScreenShell';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { useDailyEntries } from '../hooks/useDailyEntries';
import { useProfile } from '../hooks/useProfile';
import { askPattern } from '../services/api';
import { colors, fonts, spacing } from '../theme';
import { formatMmDd } from '../utils/dates';
import { profileHasMemory } from '../db/repositories/profile';

export function InsightsScreen() {
  const { entries, refresh: refreshEntries } = useDailyEntries(7);
  const { profile, refresh: refreshProfile } = useProfile();
  const [pattern, setPattern] = useState<string | null>(null);
  const [loadingPattern, setLoadingPattern] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void refreshEntries();
      void refreshProfile();
    }, [refreshEntries, refreshProfile]),
  );

  const symptomSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) {
      for (const s of e.symptoms) {
        counts[s] = (counts[s] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [entries]);

  const moodChain = useMemo(
    () =>
      entries
        .filter((e) => e.mood)
        .map((e) => `${formatMmDd(e.date)}: ${e.mood}`)
        .join('  →  '),
    [entries],
  );

  const sleepChain = useMemo(
    () =>
      entries
        .filter((e) => e.sleepQuality)
        .map((e) => `${formatMmDd(e.date)}: ${e.sleepQuality}`)
        .join('  →  '),
    [entries],
  );

  const findPattern = async () => {
    if (!profile || loadingPattern) return;
    setLoadingPattern(true);
    setPattern('Looking...');
    try {
      const res = await askPattern(profile, entries);
      setPattern(
        res.pattern ||
          'Not enough to go on yet, keep chatting with Thread and check back.',
      );
    } catch {
      setPattern("Couldn't reach Thread just now, try again in a moment.");
    } finally {
      setLoadingPattern(false);
    }
  };

  return (
    <ScreenShell title="Insights" subtitle="patterns over time">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.intro}>
          Everything here came from your conversations, nothing to fill in.
        </Text>

        <Card>
          <Text style={styles.heading}>Symptoms mentioned this week</Text>
          {symptomSummary.length ? (
            <Text style={styles.body}>
              {symptomSummary.map(([s, c]) => `${s} (${c}x)`).join(', ')}
            </Text>
          ) : (
            <EmptyState text="Nothing yet, once you mention how you're feeling in Chat, patterns show up here" />
          )}
        </Card>

        <Card>
          <Text style={styles.heading}>Mood, day by day</Text>
          {moodChain ? (
            <Text style={styles.body}>{moodChain}</Text>
          ) : (
            <EmptyState text="No mood mentions in chat yet this week." />
          )}
        </Card>

        <Card>
          <Text style={styles.heading}>Sleep mentions</Text>
          {sleepChain ? (
            <Text style={styles.body}>{sleepChain}</Text>
          ) : (
            <EmptyState text="No sleep mentions in chat yet this week." />
          )}
        </Card>

        <Card>
          <Text style={styles.heading}>Ask Thread for a pattern</Text>
          <Text style={styles.muted}>
            Have Thread look across what you've shared for something worth
            noticing.
          </Text>
          <View style={styles.spacer} />
          <PrimaryButton
            label="Find a pattern"
            onPress={findPattern}
            disabled={
              loadingPattern ||
              ((!profile || !profileHasMemory(profile)) && entries.length === 0)
            }
          />
          {pattern ? <Text style={styles.pattern}>{pattern}</Text> : null}
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
  intro: {
    fontFamily: fonts.inter,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textFaint,
  },
  heading: {
    fontFamily: fonts.fraunces,
    fontSize: 14.5,
    color: colors.text,
    marginBottom: 6,
  },
  body: {
    fontFamily: fonts.inter,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textDim,
  },
  muted: {
    fontFamily: fonts.inter,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textFaint,
  },
  spacer: { height: 10 },
  pattern: {
    marginTop: 12,
    fontFamily: fonts.inter,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.text,
  },
});
