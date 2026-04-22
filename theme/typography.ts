import { Platform, TextStyle } from 'react-native';

const fontFamilySans = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const fontFamily = Object.freeze({
  sans: fontFamilySans,
});

export const fontSize = Object.freeze({
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
});

export const lineHeight = Object.freeze({
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 30,
  xxl: 34,
  xxxl: 40,
});

export const fontWeight = Object.freeze({
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const);

export type TypographyScale = Readonly<{
  display: TextStyle;
  h1: TextStyle;
  h2: TextStyle;
  title: TextStyle;
  body: TextStyle;
  bodyStrong: TextStyle;
  caption: TextStyle;
  button: TextStyle;
}>;

export const typography: TypographyScale = Object.freeze({
  display: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
  h1: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.15,
  },
  h2: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.1,
  },
  title: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.semibold,
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.regular,
  },
  bodyStrong: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.semibold,
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.regular,
  },
  button: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.15,
  },
});