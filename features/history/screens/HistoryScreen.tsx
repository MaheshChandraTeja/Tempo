import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo } from 'react';

import { AppHeader } from '@/components/common/AppHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingView } from '@/components/common/LoadingView';
import { Screen } from '@/components/common/Screen';
import { DayWorkoutGroup } from '@/features/history/components/DayWorkoutGroup';
import { HistoryCalendar } from '@/features/history/components/HistoryCalendar';
import {
    selectHistoryCalendarDays,
    selectHistoryDayGroups,
} from '@/features/history/selectors/history.selectors';
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
import { HISTORY_ROUTES } from '@/navigation/routeTypes';

export function HistoryScreen(): React.JSX.Element {
  const navigation = useNavigation<HistoryStackScreenProps<'HistoryHome'>['navigation']>();

  const isInitialized = useWorkoutSelector(selectWorkoutInitialized);
  const isLoading = useWorkoutSelector(selectWorkoutLoading);
  const workouts = useWorkoutSelector(selectAllWorkouts);

  useEffect(() => {
    if (!isInitialized) {
      void workoutActions.initialize();
    }
  }, [isInitialized]);

  const groups = useMemo(() => selectHistoryDayGroups(workouts), [workouts]);
  const calendarDays = useMemo(() => selectHistoryCalendarDays(workouts), [workouts]);

  if (!isInitialized && isLoading) {
    return <LoadingView label="Loading workout history..." />;
  }

  return (
    <Screen scrollable>
      <AppHeader
        title="History"
        subtitle="Browse workouts by day or open trend analytics."
        rightActionLabel="Trends"
        onRightActionPress={() => navigation.navigate(HISTORY_ROUTES.TRENDS)}
      />

      <HistoryCalendar
        days={calendarDays}
        selectedDate={calendarDays[0]?.date ?? null}
        onSelectDate={date => navigation.navigate(HISTORY_ROUTES.DAY_LOG, { date })}
      />

      {groups.length === 0 ? (
        <EmptyState
          title="No history yet"
          description="Log a workout and your history will start building here."
        />
      ) : (
        groups.map(group => (
          <DayWorkoutGroup
            key={group.date}
            group={group}
            onOpenDay={date => navigation.navigate(HISTORY_ROUTES.DAY_LOG, { date })}
            onOpenWorkout={workoutId =>
              navigation.navigate(HISTORY_ROUTES.WORKOUT_DETAIL, { workoutId })
            }
          />
        ))
      )}
    </Screen>
  );
}