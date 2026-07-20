import { StyleSheet, Text } from 'react-native';
import { Card } from './Card';
import { colors, fonts } from '../theme';
import { getTimeOfDayGreeting, getTodayAffirmation } from '../utils/greeting';

export function GreetingCard() {
  const greeting = getTimeOfDayGreeting();
  const affirmation = getTodayAffirmation();

  return (
    <Card style={styles.card}>
      <Text style={styles.greeting}>{greeting}</Text>
      <Text style={styles.affirmation}>{`"${affirmation}"`}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface2,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
    marginBottom: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  greeting: {
    fontFamily: fonts.fraunces,
    fontSize: 16,
    color: colors.text,
    marginBottom: 3,
  },
  affirmation: {
    fontFamily: fonts.frauncesItalic,
    fontSize: 13,
    color: colors.textDim,
    lineHeight: 18,
  },
});
