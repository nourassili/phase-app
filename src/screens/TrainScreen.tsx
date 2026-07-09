import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { ScreenHeader } from '../components/ScreenHeader';
import { ToggleChip, ToggleChipRow } from '../components/ToggleChip';
import { WorkoutCard } from '../components/WorkoutCard';
import { trainFilters, workouts } from '../data/mockData';

export function TrainScreen() {
  const [activeFilter, setActiveFilter] = useState<string>('Strength');

  const filteredWorkouts = useMemo(() => {
    if (activeFilter === 'Low-impact') {
      return workouts.filter((w) => w.name.toLowerCase().includes('low-intensity'));
    }
    if (activeFilter === 'Bone density') {
      return workouts.filter((w) => w.filter === 'Bone density');
    }
    if (activeFilter === 'Mobility') {
      return workouts.filter((w) => w.filter === 'Mobility');
    }
    return workouts.filter((w) => w.filter === 'Strength');
  }, [activeFilter]);

  return (
    <ScreenLayout>
      <ScreenHeader title="Train" subtitle="Tuned to your luteal phase" />

      <ToggleChipRow style={styles.filters}>
        {trainFilters.map((filter) => (
          <ToggleChip
            key={filter}
            label={filter}
            selected={activeFilter === filter}
            onPress={() => setActiveFilter(filter)}
          />
        ))}
      </ToggleChipRow>

      {filteredWorkouts.map((workout) => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  filters: {
    marginBottom: 16,
  },
});
