import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors, fonts, radii } from '../../theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function ChoiceChip({ label, selected, onPress, style }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.amber,
    backgroundColor: colors.surface2,
  },
  pressed: {
    opacity: 0.9,
  },
  label: {
    fontFamily: fonts.interMedium,
    fontSize: 13.5,
    color: colors.textDim,
  },
  labelSelected: {
    color: colors.text,
  },
});
