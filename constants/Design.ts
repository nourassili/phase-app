// constants/Design.ts
// Steve Jobs-Inspired Design System

export const Colors = {
  // Primary Brand Colors
  primary: '#FF6B9D',
  primaryDark: '#E55A8A',
  primaryLight: '#FFB8D1',
  
  // Secondary Colors
  secondary: '#8B5CF6',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Neutral Colors
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  
  // Text Colors
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },
  
  // Semantic Colors
  period: '#FF6B9D',
  fertile: '#10B981',
  ovulation: '#F59E0B',
  pms: '#8B5CF6',
  
  // Glass Effect
  glass: {
    background: 'rgba(255, 255, 255, 0.25)',
    border: 'rgba(255, 255, 255, 0.18)',
  },
  
  // Shadows
  shadow: {
    color: '#000000',
    opacity: 0.1,
  }
};

export const Typography = {
  // Font Families (iOS-inspired)
  fonts: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
};

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  }
};

export const Animation = {
  // Timing Functions (Following Apple's design guidelines)
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  
  // Spring Configurations
  spring: {
    gentle: {
      damping: 20,
      stiffness: 120,
    },
    wobbly: {
      damping: 8,
      stiffness: 100,
    },
    bouncy: {
      damping: 12,
      stiffness: 200,
    },
  },
  
  // Easing Functions
  easing: {
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
  }
};

export const Layout = {
  screen: {
    padding: Spacing.xl,
    paddingVertical: Spacing['2xl'],
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  button: {
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
  }
};