import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  fullWidth?: boolean;
};

export function PrimaryButton({ label, onPress, fullWidth }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, fullWidth && styles.fullWidth]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

type AvatarProps = {
  initial: string;
  color: string;
  size?: number;
  fontSize?: number;
};

export function Avatar({ initial, color, size = 34, fontSize = 12 }: AvatarProps) {
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize }]}>{initial}</Text>
    </View>
  );
}

type FoodThumbProps = {
  size?: number;
};

export function FoodThumb({ size = 52 }: FoodThumbProps) {
  return (
    <LinearGradient
      colors={[colors.sage, colors.sageGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.foodThumb,
        { width: size, height: size, borderRadius: radii.lg },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.plum,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    marginTop: 10,
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
    marginTop: 4,
    paddingVertical: 12,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.white,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
  },
  foodThumb: {
    flexShrink: 0,
  },
});
