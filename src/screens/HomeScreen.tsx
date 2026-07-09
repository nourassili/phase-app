import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusPill } from '../components/StatusPill';
import { MiniArc } from '../components/MiniArc';
import { SectionLabel } from '../components/SectionLabel';
import { ToggleChip, ToggleChipRow } from '../components/ToggleChip';
import { Card } from '../components/Card';
import { UnifiedPlanCard } from '../components/PlanCard';
import { ContributionGraph } from '../components/ContributionGraph';
import {
  cycleStatus,
  energyOptions,
  generateContribLevels,
  streakText,
  symptomOptions,
  todaysPlan,
  user,
} from '../data/mockData';
import { colors } from '../theme';

export function HomeScreen() {
  const [energy, setEnergy] = useState('Low');
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set(['Bloating']));

  const contribLevels = useMemo(() => generateContribLevels(), []);

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(symptom)) next.delete(symptom);
      else next.add(symptom);
      return next;
    });
  };

  const greeting = `Morning, ${user.firstName}`;

  return (
    <ScreenLayout>
      <View style={styles.headerRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>{greeting}</Text>
          <StatusPill label={cycleStatus.label} />
        </View>
        <MiniArc />
      </View>

      <SectionLabel label="How's today?" dotColor={colors.gold} style={styles.firstSection} />
      <ToggleChipRow>
        {energyOptions.map((level) => (
          <ToggleChip
            key={level}
            label={`Energy: ${level}`}
            selected={energy === level}
            onPress={() => setEnergy(level)}
          />
        ))}
      </ToggleChipRow>

      <ToggleChipRow style={styles.symptomRow}>
        {symptomOptions.map((symptom) => (
          <ToggleChip
            key={symptom}
            label={symptom}
            selected={symptoms.has(symptom)}
            onPress={() => toggleSymptom(symptom)}
          />
        ))}
      </ToggleChipRow>

      <SectionLabel label="Today's plan" dotColor={colors.plum} />
      <Card style={styles.planCard} padding={0}>
        <UnifiedPlanCard training={todaysPlan.training} food={todaysPlan.food} />
      </Card>

      <SectionLabel label="Your progress" dotColor={colors.sage} />
      <Card>
        <ContributionGraph levels={contribLevels} streakText={streakText} />
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 18,
  },
  greetingBlock: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontSize: 22,
    color: colors.ink,
    fontWeight: '800',
    letterSpacing: -0.44,
  },
  firstSection: {
    marginTop: 0,
  },
  symptomRow: {
    marginTop: 8,
  },
  planCard: {
    overflow: 'hidden',
  },
});
