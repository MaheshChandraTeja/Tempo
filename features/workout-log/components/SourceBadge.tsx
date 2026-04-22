import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { WorkoutSource } from '@/features/workout-log/domain/workout.types';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type SourceBadgeProps = Readonly<{
  source: WorkoutSource;
}>;

function getSourceLabel(source: WorkoutSource): string {
  switch (source) {
    case 'manual':
      return 'Manual';
    case 'treadmill-scan':
      return 'Scan';
    case 'imported':
      return 'Imported';
    case 'estimated':
      return 'Estimated';
    default: {
      const exhaustiveCheck: never = source;
      return exhaustiveCheck;
    }
  }
}

export function SourceBadge({ source }: SourceBadgeProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme, source), [theme, source]);

  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{getSourceLabel(source)}</Text>
    </View>
  );
}

function createStyles(theme: AppTheme, source: WorkoutSource) {
  const backgroundColor =
    source === 'manual'
      ? theme.colors.surfaceMuted
      : source === 'treadmill-scan'
      ? theme.colors.accent
      : source === 'imported'
      ? theme.colors.success
      : theme.colors.warning;

  const labelColor =
    source === 'treadmill-scan' ? '#FFFFFF' : theme.colors.textPrimary;

  return StyleSheet.create({
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    label: {
      ...typography.caption,
      fontWeight: '700',
      color: labelColor,
    },
  });
}