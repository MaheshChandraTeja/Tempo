import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo } from 'react';

import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import { WeeklyChart } from '@/features/history/components/WeeklyChart';
import { selectWeeklyTrends } from '@/features/history/selectors/trends.selectors';
import {
    useWorkoutSelector,
    workoutActions,
} from '@/features/workout-log/state/workout.runtime';
import {
    selectAllWorkouts,
    selectWorkoutInitialized,
    selectWorkoutLoading,
} from '@/features/workout-log/state/workout.selectors';
import type { HistoryStackScreenProps } from '@/navigation/routeTypes';

export function TrendsScreen(): React.JSX.Element {
  useNavigation<HistoryStackScreenProps<'Trends'>['navigation']>();

  const isInitialized = useWorkoutSelector(selectWorkoutInitialized);
  const isLoading = useWorkoutSelector(selectWorkoutLoading);
  const workouts = useWorkoutSelector(selectAllWorkouts);

  useEffect(() => {
    if (!isInitialized) {
      void workoutActions.initialize();
    }
  }, [isInitialized]);

  const trends = useMemo(() => selectWeeklyTrends(workouts), [workouts]);

  if (!isInitialized && isLoading) {
    return <LoadingView label="Loading trends..." />;
  }

  return (
    <Screen scrollable>
      <AppHeader
        title="Trends"
        subtitle="Weekly totals and recent activity patterns."
      />

      {workouts.length === 0 ? (
        <EmptyState
          title="No trends yet"
          description="Log workouts first, then trend analytics will show up here."
        />
      ) : (
        <WeeklyChart trends={trends} />
      )}
    </Screen>
  );
}