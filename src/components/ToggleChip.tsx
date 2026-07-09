import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';

type ToggleChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function ToggleChip({ label, selected, onPress }: ToggleChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

type ToggleChipRowProps = {
  children: React.ReactNode;
  style?: object;
};

export function ToggleChipRow({ children, style }: ToggleChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipSelected: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  textSelected: {
    color: colors.white,
  },
});
