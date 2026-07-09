export const colors = {
  bg: '#F3EFF1',
  card: '#FFFFFF',
  ink: '#241B29',
  inkSoft: '#7A6E7F',
  plum: '#3D2A4A',
  plumDeep: '#241A2C',
  gold: '#D9A441',
  sage: '#7C8F6E',
  rose: '#C97C8C',
  blue: '#5B7A99',
  line: '#E6E0E4',
  disclaimerBg: '#EDE7E1',
  logout: '#B5495A',
  contribLvl1: '#D9CEDE',
  contribLvl2: '#9A7BA8',
  sageLight: '#A9BC9A',
  sageGradientEnd: '#C9D6BB',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
} as const;

export const radii = {
  sm: 3,
  md: 10,
  lg: 14,
  card: 18,
  cardLg: 20,
  pill: 100,
  coachButton: 28,
} as const;

export const shadows = {
  card: {
    shadowColor: '#241A29',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  coachTab: {
    shadowColor: colors.plum,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 8,
  },
} as const;

export const typography = {
  display: {
    fontWeight: '800' as const,
    letterSpacing: -0.44,
  },
  eyebrow: {
    fontWeight: '700' as const,
    fontSize: 11,
    letterSpacing: 1.54,
    textTransform: 'uppercase' as const,
  },
  bodySans: {
    fontWeight: '600' as const,
  },
  bodySansBold: {
    fontWeight: '700' as const,
  },
} as const;

export const fonts = {
  body: 'PTSerif_400Regular',
  bodyItalic: 'PTSerif_400Regular_Italic',
  bodyBold: 'PTSerif_700Bold',
  display: undefined as string | undefined,
} as const;

export const contribLevels = [
  colors.line,
  colors.contribLvl1,
  colors.contribLvl2,
  colors.plum,
] as const;
