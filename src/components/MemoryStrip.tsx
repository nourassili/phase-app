import { ScrollView, StyleSheet } from 'react-native';
import type { Profile } from '../types/models';
import { MemoryChip } from './MemoryChip';
import { spacing } from '../theme';

type MemoryStripProps = {
  profile: Profile | null;
};

export function MemoryStrip({ profile }: MemoryStripProps) {
  const entries: { label: string; value: string }[] = [];

  if (profile?.stage) entries.push({ label: 'Stage', value: profile.stage });
  (profile?.symptoms ?? []).forEach((s) => entries.push({ label: 'Symptom', value: s }));
  (profile?.triggers ?? []).forEach((s) => entries.push({ label: 'Trigger', value: s }));
  (profile?.helps ?? []).forEach((s) => entries.push({ label: 'Helps', value: s }));
  (profile?.notes ?? []).forEach((s) => entries.push({ label: 'Note', value: s }));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.strip}
    >
      {entries.length === 0 ? (
        <MemoryChip value="Nothing remembered yet, just start talking." />
      ) : (
        entries.slice(0, 12).map((e, i) => (
          <MemoryChip key={`${e.label}-${e.value}-${i}`} label={e.label} value={e.value} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
});
