import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

type StatusPillProps = {
  label: string;
};

export function StatusPill({ label }: StatusPillProps) {
  return (
    <LinearGradient
      colors={[colors.plum, '#5C4368']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.pill}
    >
      <Text style={styles.text}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 100,
  },
  text: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.white,
  },
});
