import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing } from '../../theme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function OnboardingShell({ title, subtitle, children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
      ]}
    >
      <Text style={styles.brand}>Thread</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.page,
    paddingHorizontal: spacing.xl,
  },
  brand: {
    fontFamily: fonts.frauncesSemi,
    fontSize: 28,
    color: colors.amber,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.fraunces,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.inter,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textDim,
    marginBottom: spacing.lg,
  },
  body: {
    flex: 1,
  },
  footer: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
});
