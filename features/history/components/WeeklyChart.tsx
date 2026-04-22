import React from 'react';

import { MiniBarChart } from '@/components/charts/MiniBarChart';
import { WeeklyTrendChart } from '@/components/charts/WeeklyTrendChart';
import { AppCard } from '@/components/common/AppCard';
import type { WeeklyTrendViewModel } from '@/features/history/selectors/trends.selectors';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { StyleSheet, Text, View } from 'react-native';

type WeeklyChartProps = Readonly<{
  trends: WeeklyTrendViewModel;
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

export function WeeklyChart({ trends }: WeeklyChartProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.root}>
      <AppCard>
        <Text style={styles.title}>Weekly Calories</Text>
        <Text style={styles.subtitle}>
          Calorie burn across the last 7 days.
        </Text>

        <MiniBarChart
          data={trends.points.map(point => ({
            label: point.label,
            value: point.totalCaloriesKcal,
          }))}
          showValues
        />
      </AppCard>

      <AppCard>
        <Text style={styles.title}>Weekly Workout Trend</Text>
        <Text style={styles.subtitle}>
          Workout count trend for the last 7 days.
        </Text>

        <WeeklyTrendChart
          data={trends.points.map(point => ({
            label: point.label,
            value: point.totalWorkouts,
          }))}
        />
      </AppCard>

      <AppCard>
        <Text style={styles.title}>Weekly Totals</Text>
        <Text style={styles.summaryText}>
          {trends.summary.totalWorkouts} workouts • {trends.summary.totalCaloriesKcal} kcal •{' '}
          {trends.summary.totalDistanceKm} km •{' '}
          {formatDuration(trends.summary.totalDurationSeconds)}
        </Text>
        <Text style={styles.streakText}>
          Current streak: {trends.summary.currentStreakDays} days • Longest streak: {trends.summary.longestStreakDays} days
        </Text>
      </AppCard>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    root: {
      gap: spacing.md,
    },
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.textSecondary,
      marginBottom: spacing.md,
    },
    summaryText: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    streakText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}