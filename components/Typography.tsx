// components/Typography.tsx
import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps } from 'react-native';
import { Colors, Typography as TypographyConstants } from '../constants/Design';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'error' | 'warning' | string;
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  style?: TextStyle;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  weight = 'regular',
  align = 'left',
  children,
  style,
  ...props
}) => {
  const getColor = () => {
    switch (color) {
      case 'primary':
        return Colors.text.primary;
      case 'secondary':
        return Colors.text.secondary;
      case 'tertiary':
        return Colors.text.tertiary;
      case 'inverse':
        return Colors.text.inverse;
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      default:
        return color;
    }
  };
  
  const textStyles = [
    styles[variant],
    styles[weight],
    { color: getColor(), textAlign: align },
    style,
  ];
  
  return (
    <Text style={textStyles} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  // Variants
  h1: {
    fontSize: TypographyConstants.sizes['5xl'],
    lineHeight: TypographyConstants.sizes['5xl'] * 1.2,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: TypographyConstants.sizes['4xl'],
    lineHeight: TypographyConstants.sizes['4xl'] * 1.2,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: TypographyConstants.sizes['3xl'],
    lineHeight: TypographyConstants.sizes['3xl'] * 1.2,
    fontWeight: '600',
  },
  h4: {
    fontSize: TypographyConstants.sizes['2xl'],
    lineHeight: TypographyConstants.sizes['2xl'] * 1.2,
    fontWeight: '600',
  },
  body: {
    fontSize: TypographyConstants.sizes.base,
    lineHeight: TypographyConstants.sizes.base * 1.5,
  },
  caption: {
    fontSize: TypographyConstants.sizes.sm,
    lineHeight: TypographyConstants.sizes.sm * 1.4,
  },
  label: {
    fontSize: TypographyConstants.sizes.xs,
    lineHeight: TypographyConstants.sizes.xs * 1.3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Weights
  regular: {
    fontWeight: '400',
  },
  medium: {
    fontWeight: '500',
  },
  semiBold: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: 'bold',
  },
});