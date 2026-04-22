import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo } from 'react';

import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import { DayWorkoutGroup } from '@/features/history/components/DayWorkoutGroup';
import { selectDayGroupByDate } from '@/features/history/selectors/history.selectors';
import {
    useWorkoutSelector,
    workoutActions,
} from '@/features/workout-log/state/workout.runtime';
import {
    selectAllWorkouts,
    selectWorkoutInitialized,
    selectWorkoutLoading,
} from '@/features/workout-log/state/workout.selectors';
import type {
    HistoryRouteProp,
    HistoryStackScreenProps,
} from '@/navigation/routeTypes';
import { HISTORY_ROUTES } from '@/navigation/routeTypes';

export function DayLogScreen(): React.JSX.Element {
  const navigation = useNavigation<HistoryStackScreenProps<'DayLog'>['navigation']>();
  const route = useRoute<HistoryRouteProp<'DayLog'>>();

  const isInitialized = useWorkoutSelector(selectWorkoutInitialized);
  const isLoading = useWorkoutSelector(selectWorkoutLoading);
  const workouts = useWorkoutSelector(selectAllWorkouts);

  useEffect(() => {
    if (!isInitialized) {
      void workoutActions.initialize();
    }
  }, [isInitialized]);

  const group = useMemo(
    () => selectDayGroupByDate(workouts, route.params.date),
    [route.params.date, workouts],
  );

  if (!isInitialized && isLoading) {
    return <LoadingView label="Loading day log..." />;
  }

  return (
    <Screen scrollable>
      <AppHeader
        title="Day Log"
        subtitle={group?.displayDate ?? route.params.date}
      />

      {!group ? (
        <EmptyState
          title="No workouts found"
          description="There are no workouts available for this day."
        />
      ) : (
        <DayWorkoutGroup
          group={group}
          onOpenWorkout={workoutId =>
            navigation.navigate(HISTORY_ROUTES.WORKOUT_DETAIL, { workoutId })
          }
        />
      )}
    </Screen>
  );
}