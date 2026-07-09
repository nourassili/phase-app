import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, shadows } from '../theme';
import { FoodThumb } from './PrimaryButton';

type FoodRecipeCardProps = {
  name: string;
  description: string;
};

export function FoodRecipeCard({ name, description }: FoodRecipeCardProps) {
  return (
    <View style={[styles.card, shadows.card]}>
      <FoodThumb />
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.card,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    color: colors.inkSoft,
    fontFamily: fonts.body,
  },
});
