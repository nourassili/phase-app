import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii } from '../theme';

type MemoryChipProps = {
  label?: string;
  value: string;
};

export function MemoryChip({ label, value }: MemoryChipProps) {
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>
        {label ? (
          <>
            <Text style={styles.label}>{label}: </Text>
            {value}
          </>
        ) : (
          value
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexShrink: 0,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  text: {
    fontFamily: fonts.inter,
    fontSize: 11,
    color: colors.textDim,
  },
  label: {
    fontFamily: fonts.monoMedium,
    color: colors.amber,
    fontWeight: '600',
  },
});
