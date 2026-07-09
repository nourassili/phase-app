import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii, shadows, spacing } from '../theme';

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
};

export function Card({ children, style, padding = spacing.xl }: CardProps) {
  return (
    <View style={[styles.card, { padding }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.cardLg,
    marginBottom: spacing.md + 2,
    ...shadows.card,
  },
});
