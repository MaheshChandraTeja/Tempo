import type { AppThemeColors } from '@/providers/ThemeProvider';

export type TempoPalette = Readonly<{
  white: string;
  black: string;

  slate50: string;
  slate100: string;
  slate200: string;
  slate300: string;
  slate400: string;
  slate500: string;
  slate600: string;
  slate700: string;
  slate800: string;
  slate900: string;

  blue50: string;
  blue100: string;
  blue200: string;
  blue300: string;
  blue400: string;
  blue500: string;
  blue600: string;
  blue700: string;

  green500: string;
  amber500: string;
  red500: string;
}>;

export const palette: TempoPalette = Object.freeze({
  white: '#FFFFFF',
  black: '#000000',

  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue300: '#93C5FD',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  green500: '#16A34A',
  amber500: '#F59E0B',
  red500: '#DC2626',
});

export const lightThemeColors: AppThemeColors = Object.freeze({
  background: palette.slate50,
  surface: palette.white,
  surfaceMuted: palette.slate100,
  textPrimary: palette.slate900,
  textSecondary: palette.slate500,
  border: palette.slate200,
  accent: palette.blue600,
  success: palette.green500,
  warning: palette.amber500,
  danger: palette.red500,
});

export const darkThemeColors: AppThemeColors = Object.freeze({
  background: '#09111C',
  surface: '#101926',
  surfaceMuted: '#172232',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#223045',
  accent: '#60A5FA',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
});