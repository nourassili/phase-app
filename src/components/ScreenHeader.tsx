import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, typography } from '../theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, rightElement }: ScreenHeaderProps) {
  return (
    <View style={styles.topbar}>
      <View style={styles.greeting}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 18,
  },
  greeting: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 22,
    color: colors.ink,
    ...typography.display,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.inkSoft,
    fontWeight: '400',
  },
});
