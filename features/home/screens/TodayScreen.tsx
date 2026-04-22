import { AppButton } from '@/components/common/AppButton';
import { AppHeader } from '@/components/common/AppHeader';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import { DailySummaryCard } from '@/features/home/components/DailySummaryCard';
import { GoalProgressRing } from '@/features/home/components/GoalProgressRing';
import { RecentWorkoutList } from '@/features/home/components/RecentWorkoutList';
import { selectTodayDashboard } from '@/features/home/selectors/today.selectors';
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
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo } from 'react';

type TodayStackNavigation = NativeStackNavigationProp<
  LogStackParamList,
  'TodayHome'
>;

type MainTabsNavigation = BottomTabNavigationProp<
  MainTabParamList,
  'LogStack'
>;

export function TodayScreen(): React.JSX.Element {
  const navigation = useNavigation<TodayStackNavigation>();

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

  if (!isInitialized && isLoading) {
    return <LoadingView label="Loading today’s dashboard..." />;
  }

  return (
    <Screen scrollable>
      <AppHeader
        title="Today"
        subtitle="Your daily workout summary, quick actions, and recent activity."
      />

      <AppButton
        label="Add Workout"
        onPress={() => navigation.navigate(LOG_ROUTES.LOG_WORKOUT)}
        fullWidth
      />

      <AppButton
        label="Start Scan"
        onPress={() => tabNavigation?.jumpTo(TAB_ROUTES.SCAN_STACK, {screen: SCAN_ROUTES.SCAN_HOME,})}
        variant="secondary"
        fullWidth
      />

      <DailySummaryCard summary={dashboard.summary} />

      <GoalProgressRing progress={dashboard.calorieGoalProgress} />

      <RecentWorkoutList
        items={dashboard.recentWorkouts}
        onSelectWorkout={workoutId => {
          navigation.navigate(LOG_ROUTES.WORKOUT_DETAIL, { workoutId });
        }}
      />
    </Screen>
  );
}