import { StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme';

type EmptyStateProps = {
  text: string;
};

export function EmptyState({ text }: EmptyStateProps) {
  return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.inter,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textFaint,
  },
});
