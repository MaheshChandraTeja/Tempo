import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppCard } from '@/components/common/AppCard';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import {
  selectTodayDashboard,
  type GoalProgressViewModel,
  type TodaySummaryViewModel,
} from '@/features/home/selectors/today.selectors';
import {
  useWorkoutSelector,
  workoutActions,
} from '@/features/workout-log/state/workout.runtime';
import {
  selectAllWorkouts,
  selectWorkoutInitialized,
  selectWorkoutLoading,
} from '@/features/workout-log/state/workout.selectors';
import type { LogStackParamList, MainTabParamList } from '@/navigation/routeTypes';
import { LOG_ROUTES, SCAN_ROUTES, TAB_ROUTES } from '@/navigation/routeTypes';
import { useAppTheme, type AppTheme } from '@/providers/ThemeProvider';
import { withOpacity } from '@/theme/colorUtils';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDate } from '@/utils/date/formatDate';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DailySummaryCard } from '../components/DailySummaryCard';
import { GoalProgressRing } from '../components/GoalProgressRing';
import { RecentWorkoutList } from '../components/RecentWorkoutList';

type TodayStackNavigation = NativeStackNavigationProp<
  LogStackParamList,
  'TodayHome'
>;

type MainTabsNavigation = BottomTabNavigationProp<
  MainTabParamList,
  'LogStack'
>;

type HeroStatProps = Readonly<{
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
}>;

type QuickActionCardProps = Readonly<{
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  tone?: 'accent' | 'muted';
}>;

function formatDurationCompact(seconds: number): string {
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

function getHeroTitle(
  summary: TodaySummaryViewModel,
  progress: GoalProgressViewModel,
): string {
  if (progress.isComplete) {
    return 'Goal secured.';
  }

  if (summary.totalWorkouts === 0) {
    return 'Quiet start, clear head.';
  }

  if (summary.totalWorkouts === 1) {
    return 'Momentum is building.';
  }

  return 'Today is in rhythm.';
}

function getHeroSubtitle(
  summary: TodaySummaryViewModel,
  progress: GoalProgressViewModel,
): string {
  if (summary.totalWorkouts === 0) {
    return 'Log a workout or scan a treadmill display to turn this clean slate into a real training day.';
  }

  if (progress.isComplete) {
    return `You have already cleared ${progress.goal} kcal today. Stay smooth and keep the pace sustainable.`;
  }

  return `${progress.remaining} kcal left to hit your target. You have logged ${summary.totalWorkouts} workout${summary.totalWorkouts === 1 ? '' : 's'} so far.`;
}

function HeroStat({
  icon,
  label,
  value,
}: HeroStatProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.heroStat}>
      <View style={styles.heroStatIcon}>
        <MaterialIcons
          name={icon}
          size={18}
          color={theme.colors.textPrimary}
        />
      </View>

      <View style={styles.heroStatCopy}>
        <Text style={styles.heroStatValue}>{value}</Text>
        <Text style={styles.heroStatLabel}>{label}</Text>
      </View>
    </View>
  );
}

function QuickActionCard({
  icon,
  title,
  subtitle,
  onPress,
  tone = 'muted',
}: QuickActionCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        tone === 'accent' ? styles.actionCardAccent : styles.actionCardMuted,
        pressed ? styles.actionCardPressed : undefined,
      ]}
    >
      <View
        style={[
          styles.actionIconWrap,
          tone === 'accent'
            ? styles.actionIconWrapAccent
            : styles.actionIconWrapMuted,
        ]}
      >
        <MaterialIcons
          name={icon}
          size={20}
          color={tone === 'accent' ? '#FFFFFF' : theme.colors.textPrimary}
        />
      </View>

      <View style={styles.actionTextWrap}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>

      <MaterialIcons
        name="arrow-forward"
        size={18}
        color={theme.colors.textSecondary}
      />
    </Pressable>
  );
}

export function TodayScreen(): React.JSX.Element {
  const navigation = useNavigation<TodayStackNavigation>();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const isInitialized = useWorkoutSelector(selectWorkoutInitialized);
  const isLoading = useWorkoutSelector(selectWorkoutLoading);
  const entries = useWorkoutSelector(selectAllWorkouts);

  useEffect(() => {
    if (!isInitialized) {
      void workoutActions.initialize();
    }
  }, [isInitialized]);

  const dashboard = useMemo(
    () =>
      selectTodayDashboard(entries, {
        calorieGoalKcal: 500,
        recentLimit: 5,
      }),
    [entries],
  );

  const tabNavigation = navigation.getParent<MainTabsNavigation>();
  const heroTitle = getHeroTitle(
    dashboard.summary,
    dashboard.calorieGoalProgress,
  );
  const heroSubtitle = getHeroSubtitle(
    dashboard.summary,
    dashboard.calorieGoalProgress,
  );
  const formattedDate = formatDate(
    dashboard.summary.date || new Date(),
    { preset: 'display-medium' },
  );

  if (!isInitialized && isLoading) {
    return <LoadingView label="Loading today's dashboard..." />;
  }

  return (
    <Screen scrollable contentStyle={styles.screenContent}>
      <AppCard style={styles.heroCard}>
        <View style={[styles.heroGlow, styles.heroGlowPrimary]} />
        <View style={[styles.heroGlow, styles.heroGlowSecondary]} />

        <View style={styles.heroTopRow}>
          <View style={styles.heroDateBadge}>
            <MaterialIcons
              name="calendar-today"
              size={14}
              color={theme.colors.textPrimary}
            />
            <Text style={styles.heroDateText}>{formattedDate}</Text>
          </View>

          <View style={styles.heroGoalBadge}>
            <Text style={styles.heroGoalBadgeText}>
              {dashboard.calorieGoalProgress.isComplete
                ? 'Goal reached'
                : `${dashboard.calorieGoalProgress.remaining} kcal left`}
            </Text>
          </View>
        </View>

        <Text style={styles.heroEyebrow}>Today</Text>
        <Text style={styles.heroTitle}>{heroTitle}</Text>
        <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>

        <View style={styles.heroStatsRow}>
          <HeroStat
            icon="local-fire-department"
            label="Burn"
            value={`${dashboard.summary.totalCaloriesKcal} kcal`}
          />
          <HeroStat
            icon="whatshot"
            label="Streak"
            value={`${dashboard.summary.currentStreakDays}d`}
          />
          <HeroStat
            icon="timer"
            label="Time"
            value={formatDurationCompact(
              dashboard.summary.totalDurationSeconds,
            )}
          />
        </View>
      </AppCard>

      <View style={styles.actionGrid}>
        <QuickActionCard
          icon="add-circle-outline"
          title="Add workout"
          subtitle="Log a clean manual entry in a few taps."
          onPress={() => navigation.navigate(LOG_ROUTES.LOG_WORKOUT)}
          tone="accent"
        />
        <QuickActionCard
          icon="photo-camera"
          title="Start scan"
          subtitle="Capture treadmill stats with the camera pipeline."
          onPress={() =>
            tabNavigation?.jumpTo(TAB_ROUTES.SCAN_STACK, {
              screen: SCAN_ROUTES.SCAN_HOME,
            })
          }
        />
      </View>

      <DailySummaryCard summary={dashboard.summary} />

      <GoalProgressRing progress={dashboard.calorieGoalProgress} />

      <RecentWorkoutList
        items={dashboard.recentWorkouts}
        onSelectWorkout={workoutId => {
          navigation.navigate(LOG_ROUTES.WORKOUT_DETAIL, { workoutId });
        }}
      />

      <View style={styles.bottomSpacer} />
    </Screen>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screenContent: {
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
    },
    heroCard: {
      overflow: 'hidden',
      gap: spacing.md,
      padding: spacing.xl,
      backgroundColor: theme.isDark
        ? withOpacity(theme.colors.surface, 0.9)
        : withOpacity(theme.colors.surface, 0.98),
      borderColor: withOpacity(theme.colors.border, theme.isDark ? 0.95 : 0.8),
    },
    heroGlow: {
      position: 'absolute',
      borderRadius: radius.pill,
    },
    heroGlowPrimary: {
      width: 180,
      height: 180,
      right: -50,
      top: -36,
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.18 : 0.12),
    },
    heroGlowSecondary: {
      width: 150,
      height: 150,
      left: -48,
      bottom: -72,
      backgroundColor: withOpacity(theme.colors.textPrimary, theme.isDark ? 0.06 : 0.04),
    },
    heroTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
    },
    heroDateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.7 : 0.85),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.8),
    },
    heroDateText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    heroGoalBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.pill,
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.18 : 0.1),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.accent, 0.25),
    },
    heroGoalBadgeText: {
      ...typography.caption,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    heroEyebrow: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1.4,
      fontWeight: '700',
    },
    heroTitle: {
      ...typography.display,
      color: theme.colors.textPrimary,
      marginTop: spacing.xxs,
      maxWidth: '88%',
    },
    heroSubtitle: {
      ...typography.body,
      color: theme.colors.textSecondary,
      maxWidth: '92%',
      lineHeight: 25,
    },
    heroStatsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    heroStat: {
      minWidth: '30%',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.68 : 0.82),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: withOpacity(theme.colors.border, 0.8),
    },
    heroStatIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.2 : 0.12),
    },
    heroStatCopy: {
      gap: 2,
    },
    heroStatValue: {
      ...typography.bodyStrong,
      color: theme.colors.textPrimary,
    },
    heroStatLabel: {
      ...typography.caption,
      color: theme.colors.textSecondary,
    },
    actionGrid: {
      gap: spacing.sm,
    },
    actionCard: {
      minHeight: 92,
      borderRadius: radius.xl,
      borderWidth: StyleSheet.hairlineWidth,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    actionCardAccent: {
      backgroundColor: withOpacity(theme.colors.accent, theme.isDark ? 0.16 : 0.1),
      borderColor: withOpacity(theme.colors.accent, theme.isDark ? 0.3 : 0.2),
    },
    actionCardMuted: {
      backgroundColor: withOpacity(theme.colors.surface, theme.isDark ? 0.92 : 0.94),
      borderColor: withOpacity(theme.colors.border, 0.9),
    },
    actionCardPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.995 }],
    },
    actionIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIconWrapAccent: {
      backgroundColor: withOpacity(theme.colors.accent, 0.85),
    },
    actionIconWrapMuted: {
      backgroundColor: withOpacity(theme.colors.surfaceMuted, theme.isDark ? 0.82 : 0.88),
    },
    actionTextWrap: {
      flex: 1,
      gap: spacing.xxs,
    },
    actionTitle: {
      ...typography.title,
      color: theme.colors.textPrimary,
    },
    actionSubtitle: {
      ...typography.caption,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    bottomSpacer: {
      height: layout.screenVerticalPadding,
    },
  });
}
