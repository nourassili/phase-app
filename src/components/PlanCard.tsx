import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, radii } from '../theme';

type PlanRowProps = {
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  showBorder?: boolean;
};

function PlanRow({ icon, iconColor, title, subtitle, showBorder }: PlanRowProps) {
  return (
    <View style={[styles.row, showBorder && styles.rowBorder]}>
      <View style={[styles.icon, { backgroundColor: iconColor }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

type UnifiedPlanCardProps = {
  training: { title: string; subtitle: string };
  food: { title: string; subtitle: string };
};

export function UnifiedPlanCard({ training, food }: UnifiedPlanCardProps) {
  return (
    <View style={styles.card}>
      <PlanRow
        icon="T"
        iconColor={colors.plum}
        title={training.title}
        subtitle={training.subtitle}
        showBorder
      />
      <PlanRow
        icon="F"
        iconColor={colors.sage}
        title={food.title}
        subtitle={food.subtitle}
      />
    </View>
  );
}

type ProteinBarProps = {
  current: number;
  target: number;
};

export function ProteinBar({ current, target }: ProteinBarProps) {
  const pct = Math.min((current / target) * 100, 100);
  return (
    <View>
      <Text style={styles.proteinTitle}>Protein today</Text>
      <Text style={styles.proteinSubtitle}>
        {current}g of {target}g target
      </Text>
      <View style={styles.barTrack}>
        <LinearGradient
          colors={[colors.sage, colors.sageLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${pct}%` }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.inkSoft,
  },
  proteinTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  proteinSubtitle: {
    fontSize: 13.5,
    color: colors.inkSoft,
    lineHeight: 20,
    fontFamily: fonts.body,
  },
  barTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.line,
    overflow: 'hidden',
    marginTop: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
});
