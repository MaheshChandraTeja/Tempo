import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { Divider } from '@/components/common/Divider';
import type { DayWorkoutGroupViewModel } from '@/features/history/selectors/history.selectors';
import { SourceBadge } from '@/features/workout-log/components/SourceBadge';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDate } from '@/utils/date/formatDate';

type DayWorkoutGroupProps = Readonly<{
  group: DayWorkoutGroupViewModel;
  onOpenDay?: (date: string) => void;
  onOpenWorkout?: (workoutId: string) => void;
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

export function DayWorkoutGroup({
  group,
  onOpenDay,
  onOpenWorkout,
}: DayWorkoutGroupProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <AppCard>
      <Pressable
        accessibilityRole="button"
        onPress={() => onOpenDay?.(group.date)}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <Text style={styles.title}>{group.displayDate}</Text>
        <Text style={styles.summary}>
          {group.summary.totalWorkouts} workouts • {group.summary.totalCaloriesKcal} kcal •{' '}
          {group.summary.totalDistanceKm} km •{' '}
          {formatDuration(group.summary.totalDurationSeconds)}
        </Text>
      </Pressable>

      <Divider />

      <View style={styles.items}>
        {group.workouts.slice(0, 3).map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => onOpenWorkout?.(item.id)}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <View style={styles.itemHeader}>
              <View style={styles.itemTextWrap}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>
              <SourceBadge source={item.source} />
            </View>

            <Text style={styles.itemMeta}>
              {formatDate(item.loggedAt, { preset: 'time-short' })} •{' '}
              {item.caloriesKcal != null ? `${item.caloriesKcal} kcal` : '—'} •{' '}
              {item.durationSeconds != null ? formatDuration(item.durationSeconds) : '—'}
            </Text>
          </Pressable>
        ))}

        {group.workouts.length > 3 ? (
          <Text style={styles.moreText}>
            +{group.workouts.length - 3} more workout
            {group.workouts.length - 3 === 1 ? '' : 's'}
          </Text>
        ) : null}
      </View>
    </AppCard>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    pressed: {
      opacity: 0.88,
    },
    title: {
      ...typography.h2,
      color: theme.colors.textPrimary,
      marginBottom: spacing.xs,
    },
    summary: {
      ...typography.body,
      color: theme.colors.textSecondary,
    },
    items: {
      gap: spacing.md,
    },
    item: {
      gap: spacing.xs,
    },
    itemHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    itemTextWrap: {
      flex: 1,
      gap: spacing.xxs,
    },
    itemTitle: {
      ...typography.title,
      color: theme.colors.textPrimary,
    },
    itemSubtitle: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
    itemMeta: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
    moreText: {
      ...typography.caption,
      color: theme.colors.accent,
      fontWeight: '600',
    },
  });
}