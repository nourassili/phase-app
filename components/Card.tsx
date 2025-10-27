// components/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate
} from 'react-native-reanimated';
import { Colors, BorderRadius, Shadows, Animation } from '../constants/Design';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
  pressable?: boolean;
  glassEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = true,
  pressable = false,
  glassEffect = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scale.value,
      [0.95, 1],
      [0.05, elevated ? 0.1 : 0]
    );
    
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: shadowOpacity,
    };
  });
  
  const cardStyles = [
    styles.base,
    elevated && styles.elevated,
    glassEffect && styles.glass,
    animatedStyle,
    style,
  ];
  
  if (pressable) {
    return (
      <Animated.View style={cardStyles}>
        {children}
      </Animated.View>
    );
  }
  
  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: 20,
  },
  elevated: {
    ...Shadows.base,
  },
  glass: {
    backgroundColor: Colors.glass.background,
    borderWidth: 1,
    borderColor: Colors.glass.border,
  },
});