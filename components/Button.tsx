// components/ui/Button.tsx
import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  PressableProps 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, BorderRadius, Shadows, Animation } from '../constants/Design';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  style,
  textStyle,
  onPress,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95, Animation.spring.gentle);
    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, Animation.spring.gentle);
  };
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    animatedStyle,
    style,
  ];
  
  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];
  
  return (
    <AnimatedPressable
      style={buttonStyles}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      <Text style={textStyles}>
        {loading ? 'Loading...' : title}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    ...Shadows.base,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.secondary,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Sizes
  sm: {
    height: 40,
    paddingHorizontal: 16,
  },
  md: {
    height: 48,
    paddingHorizontal: 24,
  },
  lg: {
    height: 56,
    paddingHorizontal: 32,
  },
  
  // States
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  
  // Text Styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Text Variants
  primaryText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.base,
  },
  secondaryText: {
    color: Colors.text.inverse,
    fontSize: Typography.sizes.base,
  },
  ghostText: {
    color: Colors.primary,
    fontSize: Typography.sizes.base,
  },
  outlineText: {
    color: Colors.primary,
    fontSize: Typography.sizes.base,
  },
  
  // Text Sizes
  smText: {
    fontSize: Typography.sizes.sm,
  },
  mdText: {
    fontSize: Typography.sizes.base,
  },
  lgText: {
    fontSize: Typography.sizes.lg,
  },
  
  disabledText: {
    opacity: 0.7,
  },
});