import type { ViewStyle } from 'react-native';

import { darkThemeColors, lightThemeColors, palette } from '@/theme/colors';
import { borderWidth, iconSize, layout, radius, spacing } from '@/theme/spacing';
import { fontFamily, fontSize, fontWeight, lineHeight, typography } from '@/theme/typography';

export const elevation = Object.freeze({
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 2,
  } satisfies ViewStyle,
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  } satisfies ViewStyle,
});

export const tokens = Object.freeze({
  palette,
  colors: {
    light: lightThemeColors,
    dark: darkThemeColors,
  },
  spacing,
  radius,
  borderWidth,
  layout,
  iconSize,
  typography,
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  elevation,
});

export type TempoTokens = typeof tokens;