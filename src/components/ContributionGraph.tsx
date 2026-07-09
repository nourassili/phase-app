import { StyleSheet, Text, View } from 'react-native';
import { colors, contribLevels, fonts, radii } from '../theme';

type ContributionGraphProps = {
  levels: number[];
  streakText: string;
};

const WEEKS = 13;
const DAYS_PER_WEEK = 7;

export function ContributionGraph({ levels, streakText }: ContributionGraphProps) {
  const weeks: number[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week: number[] = [];
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      const idx = w * DAYS_PER_WEEK + d;
      week.push(levels[idx] ?? 0);
    }
    weeks.push(week);
  }

  return (
    <View>
      <View style={styles.grid}>
        {weeks.map((week, weekIdx) => (
          <View key={weekIdx} style={styles.column}>
            {week.map((level, dayIdx) => (
              <View
                key={`${weekIdx}-${dayIdx}`}
                style={[
                  styles.square,
                  { backgroundColor: contribLevels[level] ?? contribLevels[0] },
                ]}
              />
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Less</Text>
        {contribLevels.map((color, i) => (
          <View key={i} style={[styles.legendSquare, { backgroundColor: color }]} />
        ))}
        <Text style={styles.legendText}>More</Text>
      </View>

      <Text style={styles.streak}>{streakText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 4,
    height: 98,
  },
  column: {
    flex: 1,
    gap: 4,
  },
  square: {
    flex: 1,
    borderRadius: radii.sm,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  legendText: {
    fontSize: 10.5,
    color: colors.inkSoft,
    fontWeight: '400',
  },
  legendSquare: {
    width: 11,
    height: 11,
    borderRadius: radii.sm,
    marginHorizontal: 1,
  },
  streak: {
    marginTop: 12,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.inkSoft,
    fontFamily: fonts.body,
  },
});
