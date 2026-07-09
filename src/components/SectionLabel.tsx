import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme';

type SectionLabelProps = {
  label: string;
  dotColor: string;
  style?: object;
};

export function SectionLabel({ label, dotColor, style }: SectionLabelProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
    marginBottom: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  label: {
    fontSize: 13,
    color: colors.ink,
    ...typography.bodySansBold,
  },
});
