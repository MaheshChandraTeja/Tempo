import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { EmptyState } from '@/components/common/EmptyState';
import type { RecentWorkoutItemViewModel } from '@/features/home/selectors/today.selectors';
import { SourceBadge } from '@/features/workout-log/components/SourceBadge';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDate } from '@/utils/date/formatDate';

type RecentWorkoutListProps = Readonly<{
  items: RecentWorkoutItemViewModel[];
  onSelectWorkout?: (workoutId: string) => void;
}>;

function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds <= 0) {
    return '—';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export function RecentWorkoutList({
  items,
  onSelectWorkout,
}: RecentWorkoutListProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No workouts yet"
        description="Log your first workout today or start a treadmill scan to populate recent activity."
      />
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Recent Workouts</Text>
      <Text style={styles.subtitle}>
        Your latest activity across manual entries and scans.
      </Text>

      <View style={styles.list}>
        {items.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => onSelectWorkout?.(item.id)}
            style={({ pressed }) => [pressed && styles.itemPressed]}
          >
            <AppCard>
              <View style={styles.itemHeader}>
                <View style={styles.itemTitleWrap}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemSubtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                </View>

                <SourceBadge source={item.source} />
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  {formatDate(item.loggedAt, { preset: 'display-short' })}
                </Text>
                <Text style={styles.metaText}>
                  {item.caloriesKcal != null ? `${item.caloriesKcal} kcal` : '—'}
                </Text>
                <Text style={styles.metaText}>
                  {formatDuration(item.durationSeconds)}
                </Text>
              </View>
            </AppCard>
          </Pressable>
        ))}
      </View>
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
    },
    subtitle: {
      ...typography.body,
      color: theme.colors.textSecondary,
    },
    list: {
      gap: spacing.md,
    },
    itemPressed: {
      opacity: 0.88,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
      marginBottom: spacing.md,
    },
    itemTitleWrap: {
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
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    metaText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
  });
}