import { Pressable, StyleSheet, Text } from 'react-native';
import { ScreenLayout } from '../components/ScreenLayout';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { PrimaryButton } from '../components/PrimaryButton';
import { CircleCard, FeedItem } from '../components/FeedItem';
import { circleMembers, feedPosts } from '../data/mockData';
import { colors } from '../theme';
import type { TogetherScreenProps } from '../types/navigation';

export function TogetherScreen({ navigation }: TogetherScreenProps) {
  return (
    <ScreenLayout>
      <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
        <Text style={styles.backText}>‹ Explore</Text>
      </Pressable>

      <ScreenHeader
        title="Together"
        subtitle="Your circle's activity, no feed to scroll"
      />

      <CircleCard
        members={circleMembers}
        title="3 people following you"
        subtitle="Invite a friend to train alongside you"
      />

      <PrimaryButton label="Invite friends" fullWidth />

      <SectionLabel label="This week" dotColor={colors.gold} />

      {feedPosts.map((post) => (
        <FeedItem key={post.id} post={post} />
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  backLink: {
    marginTop: 8,
    marginBottom: -8,
  },
  backText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.inkSoft,
  },
});
