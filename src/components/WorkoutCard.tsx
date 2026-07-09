import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows } from '../theme';
import type { Workout } from '../data/mockData';

type WorkoutCardProps = {
  workout: Workout;
};

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Pressable
      onPress={() => setOpen((prev) => !prev)}
      style={[styles.card, shadows.card]}
    >
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{workout.name}</Text>
          <Text style={styles.meta}>
            {workout.durationMin} min · {workout.equipment}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: workout.badgeColor }]}>
          <Text style={styles.badgeText}>{workout.intensityTag}</Text>
        </View>
      </View>
      {open ? (
        <Text style={styles.detail}>{workout.description}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: colors.inkSoft,
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.white,
  },
  detail: {
    marginTop: 8,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.inkSoft,
    fontFamily: fonts.body,
  },
});
