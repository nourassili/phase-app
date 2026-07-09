import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type ScreenLayoutProps = {
  children: ReactNode;
  contentStyle?: ViewStyle;
  scrollable?: boolean;
};

export function ScreenLayout({
  children,
  contentStyle,
  scrollable = true,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {scrollable ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
});
