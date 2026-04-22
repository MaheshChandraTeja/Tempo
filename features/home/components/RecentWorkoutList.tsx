import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { EmptyState } from '@/components/common/EmptyState';
import type { RecentWorkoutItemViewModel } from '@/features/home/selectors/today.selectors';
import { SourceBadge } from '@/features/workout-log/components/SourceBadge';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { withOpacity } from '@/theme/colorUtils';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDate } from '@/utils/date/formatDate';

type RecentWorkoutListProps = Readonly<{
  items: RecentWorkoutItemViewModel[];
  onSelectWorkout?: (workoutId: string) => void;
}>;

type MetaChipProps = Readonly<{
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
}>;

function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds <= 0) {
    return 'No duration';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function MetaChip({ icon, label }: MetaChipProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.metaChip}>
      <MaterialIcons
        name={icon}
        size={14}
        color={theme.colors.textSecondary}
      />
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

export function RecentWorkoutList({
  items,
  onSelectWorkout,
}: RecentWorkoutListProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (items.length === 0) {
    return (
      <View style={styles.root}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderCopy}>
            <Text style={styles.title}>Recent activity</Text>
            <Text style={styles.subtitle}>
              Your latest sessions will settle here as soon as you log or scan.
            </Text>
          </View>
        </View>

        <EmptyState
          title="No workouts yet"
          description="Log your first workout today or run a treadmill scan to build out the recent activity feed."
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderCopy}>
          <Text style={styles.title}>Recent activity</Text>
          <Text style={styles.subtitle}>
            A tighter read on your latest sessions, scans, and manual logs.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{items.length}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {items.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => onSelectWorkout?.(item.id)}
            style={({ pressed }) =>
              pressed ? styles.itemPressed : undefined
            }
          >
            <AppCard style={styles.itemCard}>
              <View style={styles.itemTopRow}>
                <View style={styles.timestampWrap}>
                  <Text style={styles.timestampDate}>
                    {formatDate(item.loggedAt, { preset: 'month-day' })}
                  </Text>
                  <Text style={styles.timestampTime}>
                    {formatDate(item.loggedAt, { preset: 'time-short' })}
                  </Text>
                </View>

                <SourceBadge source={item.source} />
              </View>

              <View style={styles.itemBody}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <MetaChip
                  icon="local-fire-department"
                  label={
                    item.caloriesKcal != null
                      ? `${item.caloriesKcal} kcal`
                      : 'Calories pending'
                  }
                />
                <MetaChip
                  icon="timer"
                  label={formatDuration(item.durationSeconds)}
                />
                <MetaChip
                  icon="chevron-right"
                  label="Open details"
                />
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
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    sectionHeaderCopy: {
      flex: 1,
      gap: spacing.xs,
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
    countBadge: {
      minWidth: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.78 : 0.86),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.82),
    },
    countBadgeText: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
    },
    list: {
      gap: spacing.sm,
    },
    itemPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.996 }],
    },
    itemCard: {
      gap: spacing.md,
      backgroundColor: withOpacity(theme.colors.surface, theme.isDark ? 0.92 : 0.96),
      borderColor: withOpacity(theme.colors.border, 0.85),
    },
    itemTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.md,
    },
    timestampWrap: {
      gap: 2,
    },
    timestampDate: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    timestampTime: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
    itemBody: {
      gap: spacing.xxs,
    },
    itemTitle: {
      ...typography.title,
      color: theme.colors.textPrimary,
    },
    itemSubtitle: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.7 : 0.82),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.78),
    },
    metaChipText: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
  });
}
