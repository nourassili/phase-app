import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows } from '../theme';
import { Avatar } from './PrimaryButton';
import type { FeedPost } from '../data/mockData';

type FeedItemProps = {
  post: FeedPost;
};

export function FeedItem({ post }: FeedItemProps) {
  const [cheered, setCheered] = useState(post.cheered);
  const [cheerCount, setCheerCount] = useState(post.cheers);

  const handleCheer = () => {
    if (cheered) return;
    setCheered(true);
    setCheerCount((c) => c + 1);
  };

  const isYou = post.author === 'You';

  return (
    <View style={[styles.item, shadows.card]}>
      <Avatar initial={post.initial} color={post.avatarColor} />
      <View style={styles.body}>
        <Text style={styles.text}>
          <Text style={styles.author}>{isYou ? 'You' : post.author}</Text>
          {' '}
          {post.body.includes('completed') || post.body.includes('reached') ? (
            <>
              {post.body.split(/(Low-Intensity Full Body|Mobility & Breath Reset|7-day check-in streak)/).map((part, i) =>
                ['Low-Intensity Full Body', 'Mobility & Breath Reset', '7-day check-in streak'].includes(part) ? (
                  <Text key={i} style={styles.emphasis}>{part}</Text>
                ) : (
                  <Text key={i}>{part}</Text>
                )
              )}
            </>
          ) : (
            post.body
          )}
        </Text>
        <Text style={styles.meta}>{post.meta}</Text>
      </View>
      <Pressable
        onPress={handleCheer}
        style={[styles.cheer, cheered && styles.cheerActive]}
      >
        <Text style={[styles.cheerText, cheered && styles.cheerTextActive]}>
          ♡ {cheerCount}
        </Text>
      </Pressable>
    </View>
  );
}

type CircleCardProps = {
  members: { id: string; initial: string; color: string }[];
  title: string;
  subtitle: string;
};

export function CircleCard({ members, title, subtitle }: CircleCardProps) {
  return (
    <View style={[styles.circleCard, shadows.card]}>
      <View style={styles.avatars}>
        {members.map((member, index) => (
          <View
            key={member.id}
            style={[styles.avatarWrap, index > 0 && styles.avatarOverlap]}
          >
            <Avatar initial={member.initial} color={member.color} />
          </View>
        ))}
        <View style={[styles.avatarWrap, styles.avatarOverlap]}>
          <View style={styles.addAvatar}>
            <Text style={styles.addText}>+</Text>
          </View>
        </View>
      </View>
      <View style={styles.circleContent}>
        <Text style={styles.circleTitle}>{title}</Text>
        <Text style={styles.circleSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  text: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
    marginBottom: 3,
  },
  author: {
    fontWeight: '700',
  },
  emphasis: {
    fontStyle: 'italic',
  },
  meta: {
    fontSize: 11,
    color: colors.inkSoft,
  },
  cheer: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cheerActive: {
    backgroundColor: colors.rose,
    borderColor: colors.rose,
  },
  cheerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSoft,
  },
  cheerTextActive: {
    color: colors.white,
  },
  circleCard: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {},
  avatarOverlap: {
    marginLeft: -10,
  },
  addAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  addText: {
    fontSize: 16,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  circleContent: {
    flex: 1,
  },
  circleTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  circleSubtitle: {
    fontSize: 12.5,
    color: colors.inkSoft,
  },
});
