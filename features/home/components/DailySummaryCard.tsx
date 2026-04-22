import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import type { TodaySummaryViewModel } from '@/features/home/selectors/today.selectors';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type DailySummaryCardProps = Readonly<{
  summary: TodaySummaryViewModel;
}>;

function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return '0m';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function SummaryMetric({
  label,
  value,
}: Readonly<{ label: string; value: string }>): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.metricCell}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function DailySummaryCard({
  summary,
}: DailySummaryCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <AppCard>
      <Text style={styles.title}>Today Summary</Text>
      <Text style={styles.subtitle}>
        Your totals so far for workouts, calories, distance, duration, and streak momentum.
      </Text>

      <View style={styles.grid}>
        <SummaryMetric label="Workouts" value={String(summary.totalWorkouts)} />
        <SummaryMetric label="Calories" value={`${summary.totalCaloriesKcal}`} />
        <SummaryMetric label="Distance" value={`${summary.totalDistanceKm} km`} />
        <SummaryMetric label="Duration" value={formatDuration(summary.totalDurationSeconds)} />
        <SummaryMetric label="Streak" value={`${summary.currentStreakDays} days`} />
      </View>
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.textSecondary,
      marginBottom: spacing.lg,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    metricCell: {
      minWidth: '45%',
      flexGrow: 1,
      gap: spacing.xxs,
    },
    metricValue: {
      ...typography.h1,
      color: theme.colors.textPrimary,
    },
    metricLabel: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}