import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import type { TodaySummaryViewModel } from '@/features/home/selectors/today.selectors';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { withOpacity } from '@/theme/colorUtils';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type DailySummaryCardProps = Readonly<{
  summary: TodaySummaryViewModel;
}>;

type SummaryMetricProps = Readonly<{
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  tone?: 'accent' | 'default';
  wide?: boolean;
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

  return `${Math.max(minutes, 1)}m`;
}

function formatDistance(distanceKm: number): string {
  if (distanceKm <= 0) {
    return '0.0 km';
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`;
}

function SummaryMetric({
  icon,
  label,
  value,
  tone = 'default',
  wide = false,
}: SummaryMetricProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View
      style={[
        styles.metricCell,
        wide ? styles.metricCellWide : undefined,
        tone === 'accent' ? styles.metricCellAccent : undefined,
      ]}
    >
      <View
        style={[
          styles.metricIconWrap,
          tone === 'accent' ? styles.metricIconWrapAccent : undefined,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={18}
          color={tone === 'accent' ? '#FFFFFF' : theme.colors.textPrimary}
        />
      </View>

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
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Dashboard</Text>
          <Text style={styles.title}>Daily overview</Text>
          <Text style={styles.subtitle}>
            The core numbers for your day, laid out as a quick read.
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Live</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <SummaryMetric
          icon="fitness-center"
          label="Workouts"
          value={String(summary.totalWorkouts)}
          tone="accent"
        />
        <SummaryMetric
          icon="local-fire-department"
          label="Calories"
          value={`${summary.totalCaloriesKcal} kcal`}
        />
        <SummaryMetric
          icon="timeline"
          label="Distance"
          value={formatDistance(summary.totalDistanceKm)}
        />
        <SummaryMetric
          icon="timer"
          label="Duration"
          value={formatDuration(summary.totalDurationSeconds)}
        />
        <SummaryMetric
          icon="bolt"
          label="Streak"
          value={`${summary.currentStreakDays} days`}
          wide
        />
      </View>
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      backgroundColor: withOpacity(theme.colors.surface, theme.isDark ? 0.92 : 0.96),
      borderColor: withOpacity(theme.colors.border, 0.85),
      gap: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    headerCopy: {
      flex: 1,
      gap: spacing.xs,
    },
    eyebrow: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      fontWeight: '700',
    },
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },
    headerBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.72 : 0.84),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.85),
    },
    headerBadgeText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    metricCell: {
      minWidth: '47%',
      flexGrow: 1,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.68 : 0.78),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.75),
      gap: spacing.xs,
    },
    metricCellWide: {
      minWidth: '100%',
    },
    metricCellAccent: {
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.18 : 0.1),
      borderColor: withOpacity(theme.colors.accent, 0.2),
    },
    metricIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.surface, theme.isDark ? 0.75 : 0.92),
    },
    metricIconWrapAccent: {
      backgroundColor: withOpacity(theme.colors.accent, 0.88),
    },
    metricValue: {
      ...typography.h2,
      color: theme.colors.textPrimary,
    },
    metricLabel: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}
