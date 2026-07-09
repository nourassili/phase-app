import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, shadows } from '../theme';
import { Avatar } from './PrimaryButton';

type ProfileCardProps = {
  name: string;
  subtitle: string;
  initial: string;
};

export function ProfileCard({ name, subtitle, initial }: ProfileCardProps) {
  return (
    <View style={[styles.card, shadows.card]}>
      <Avatar initial={initial} color={colors.plum} size={48} fontSize={16} />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

type MenuItem = {
  id: string;
  label: string;
  destructive?: boolean;
};

type MenuListProps = {
  items: MenuItem[];
  onItemPress?: (id: string) => void;
};

export function MenuList({ items, onItemPress }: MenuListProps) {
  return (
    <View style={[styles.list, shadows.card]}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onItemPress?.(item.id)}
          style={[
            styles.row,
            index < items.length - 1 && styles.rowBorder,
          ]}
        >
          <Text
            style={[
              styles.rowText,
              item.destructive && styles.destructive,
            ]}
          >
            {item.label}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 16,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.inkSoft,
  },
  list: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  rowText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.ink,
  },
  destructive: {
    color: colors.logout,
  },
  chevron: {
    fontSize: 16,
    color: colors.inkSoft,
    fontWeight: '400',
  },
});
